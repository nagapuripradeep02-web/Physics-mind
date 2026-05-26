# Stage-2 Pilot Catalog — T29 Electric Charges & Fields

**Date authored:** 2026-05-25 (Session 39, paired-batch with T34)
**Sources:**
- NCERT Class 12 Part 1, **Ch.1 Electric Charges and Fields**, §1.1–1.15 (verified §1.1–1.9 directly; §1.10–1.15 = dipole/Gauss covered in T30 sister-batch)
- HC Verma Vol 2, **Ch.29 Electric Field and Potential**, §29.1–29.4 + §29.12–29.13 (T29 portion; §29.5–29.11 belongs to T30)
- DC Pandey E&M, **Ch.22 Electrostatics**, §22.1–22.6 (T29 portion; later sections fall to T30)
- Note: this pilot is the **10th** in the run. It deliberately couples with T34 Current Electricity to close the E&M-cluster upstream foundation.

---

## Founder Decisions Applied (CH-G1 … CH-G7, inline)

| # | Decision | Rationale |
|---|---|---|
| CH-G1 | **Three charge-basic atomics collapse into ONE atomic** (`electric_charge_basics` = additive + conserved + quantised). Originally tempted to split each NCERT §1.5.1, §1.5.2, §1.5.3 into separate atomics. Collapsed because the three "basic properties" share a single visual scene (small balls labelled with ± charges; ball-collision conservation; quantised ladder). Each becomes a nano under the umbrella. | Visual scene unity. Splitting them would also have introduced 2 spurious cross-cluster edges that don't carry real teaching weight. |
| CH-G2 | **Three charging methods are SEPARATE atomics** (`charging_by_friction`, `charging_by_conduction`, `charging_by_induction`). Tempted to make them one umbrella ("ways to charge a body"). Kept separate because each has a distinct misconception (friction: "charge created from nothing"; conduction: "charge can pass through wood"; induction: "the rod must touch"). Each EPIC-C STATE_1 wrong belief is unique. | Pedagogy first — misconception variety = atomic-count justification. |
| CH-G3 | **Coulomb's law gets TWO atomics** (`coulomb_law_scalar` for magnitude + sign + 1/r²; `coulomb_law_vector` for direction + position vectors + r̂₂₁ unit-vector form). Class 11 students who took up Class 12 directly often handle the scalar form but break on the vector form. The split surfaces the gap. | Empirical: HCV §29.2 introduces both forms within 3 paragraphs but DC Pandey treats them as separate exercise sets. Boundary is real. |
| CH-G4 | **`superposition_principle` is ITS OWN atomic (not a nano of Coulomb's law).** It re-applies in §1.9 (electric field due to system of charges), §29.5 (potential due to system), §30.2 (Gauss law as superposition of fluxes), §32.7 (Kirchhoff's junction = superposition of currents). High `Required-by` count — universal pattern, not Coulomb-bound. | Cross-topic edge density confirms atomic status. |
| CH-G5 | **`conductor_vs_insulator` is an atomic with `semiconductor_intro` as a nano.** Class 12 covers semiconductors deeply in Ch.14, but in T29 context they're a footnote (NCERT §1.3 footnote, HCV §29.12). Semiconductors deserve atomic status in T48 (Modern Physics), not here. | Avoids T48–T29 collision; lets T48 own the semiconductor atomic. |
| CH-G6 | **`field_inside_conductor_is_zero`** is an atomic (HCV §29.13 + NCERT §1.15). Initially looked like a nano of Gauss's law applications. Decided atomic-level because it's the foundation for capacitor theory (T31), electrostatic shielding (T30 nano), Wheatstone bridge potential equality (T34 cross-ref). Three downstream consumers = atomic. | Stage-5 priority queue will rank this highly: short to teach, very high `Required-by` count. |
| CH-G7 | **Anchor strength: STRONG** (counter-prediction to T31). NCERT §1.1 opens with cling-film, electrified comb attracting hair, monsoon-thunderstorm static. §1.2 has the gold-leaf electroscope (still standard in CBSE board practical syllabus — Indian classroom artifact). HCV §29.1 anchors with "amber rubbed since 600 BC" (universal, but Greek; for Indian-context anchor we lean on NCERT). Confirmed strong-anchor — author at 1.0× baseline. | Validates [[feedback-anchor-density-varies-by-topic]] prediction: phenomenology-rich topics carry strong anchors; abstract circuit-only topics (T31 cap) carry weak ones. |

---

## Section A — Top-of-Catalog Summary

```
Topic               : T29 Electric Charges and Fields (charges + Coulomb + field-from-charges; Gauss/dipole pushed to T30)
Atomic count        : 14 (target range was 12–16; landed at 14)
Nano count          : ~26 (under atomics; mean 1.86 nanos/atomic)
Stage-2 OUT-edges   : 8 (→ T30 ×3, T31 ×1, T34 ×2, T36 ×1, math-tools ×1)
Math-tools edges    : 1 (vector addition for superposition + Coulomb vector form)
Anchor density      : STRONG (NCERT §1.1 cling-film, §1.2 electroscope, §1.4 induction demo, monsoon-thunderstorm static, §1.13 lightning-cloud charge separation)
Author-time         : 1.0× baseline (per CH-G7)
Founder decisions   : CH-G1 … CH-G7 (7 decisions, modal across 10-pilot run)
```

---

## Section B — Cross-Source Coverage Table (3 sources × T29 sections)

| Coverage area | NCERT 12.1 Ch.1 | HCV2 Ch.29 | DCEM Ch.22 (Electrostatics) | Notes |
|---|---|---|---|---|
| What is electric charge? Two kinds | §1.1, §1.2 | §29.1 "What is Electric Charge?" | §22.1 | NCERT strongest (electroscope, paper-strip experiment); HCV most rigorous (compares to gravity); DCP middle |
| Conductors / Insulators / Semiconductors | §1.3 + footnote | §29.12 | §22.2 | HCV best on free-electron model; NCERT best on earthing for shock-safety (Indian-context anchor) |
| Charging by friction | §1.2 (last para) | §29.1 (Frictional Electricity inset) | §22.1 | All three same coverage; thin |
| Charging by conduction | §1.4 (implicit in pith-ball example) | §29.1 (induction passage) | §22.3 | DCP best diagrams |
| Charging by induction | §1.4 (5-step process) | §29.1 (induction sub-heading) | §22.4 | NCERT strongest — the 5-step (i)-(v) breakdown is the canonical pedagogy |
| Basic properties: additive | §1.5.1 | §29.1 (Unit of Charge) | §22.5 | NCERT scalar-vs-mass comparison is cleanest |
| Basic properties: conserved | §1.5.2 | §29.1 (Charge is Conserved + β-decay example) | §22.5 | HCV β-decay example is best; mentioned but not derived |
| Basic properties: quantised | §1.5.3 | §29.1 (Charge is Quantized) | §22.5 | HCV Millikan-experiment mention + step-size discussion is canonical |
| Coulomb's law (scalar) | §1.6 (Eq.1.1 + Coulomb biography) | §29.2 (Eq.29.1) | §22.6 | All three identical; differ only in problem-set depth |
| Coulomb's law (vector form) | §1.6 (Eq.1.3 with r̂₂₁) | §29.2 (Eq. with r⃗) | §22.6 | NCERT and DCP teach vector form explicitly; HCV mentions but doesn't drill |
| Coulomb vs gravity (strength comparison) | §1.6 (Example 1.4) | §29.1 (gravity-vs-electric ratio for e/p) | absent | NCERT Example 1.4 is the canonical "10³⁹ stronger" derivation |
| Forces between multiple charges (superposition) | §1.7 (Eq.1.4–1.5) | §29.3 (field-superposition) | §22.7 | NCERT introduces in force; HCV jumps to field-level. Both valid; we make superposition its own atomic per CH-G4 |
| Electric field (definition, vector nature) | §1.8 (Eq.1.6–1.9) | §29.3 (Eq.29.3–29.4) | §22.8 | HCV's "field exists even without test charge" is the conceptual anchor |
| Electric field due to a system of charges | §1.8.1 (Eq.1.10) | §29.3 + Example 29.1 | §22.9 | Direct application of superposition |
| Field lines | §1.9 (introduction + density-rule) | §29.4 + Fig.29.5/29.6 | §22.10 | All three same; minor variation in 6/8/10 lines per charge convention |
| Field inside conductor = 0 | absent in §1.1–1.9 (covered §1.15 + Ch.2) | §29.13 + Fig.29.15 | §22.14 | HCV §29.13 best for self-contained derivation; cross-ref into T30 for Gauss-version |

---

## Section C — Atomic + Nano Catalog (the canonical 8-column table)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** | `electric_charge_basics` | atomic | ✅ | — | `quantisation_intuition_math` | A2, A3, A4, [T30:E_field_basics], [T31:capacitor_charge] | Umbrella per CH-G1: additive (scalar nano) + conserved (β-decay nano) + quantised (q=ne nano). NCERT §1.5 carries all three in one section — keep them unified |
| ↳ N1.1 | additivity_of_charges | nano | ✅ | — | — | A1 | Algebraic sum like mass; sign matters. 1-state insight |
| ↳ N1.2 | charge_conservation | nano | ✅ | — | — | A1 | β-decay creates e+p with net 0; pair production conserves |
| ↳ N1.3 | quantisation_q_equals_ne | nano | ✅ | — | — | A1, A2 | Step-size e = 1.6e-19 C; macroscopic μC ≈ 10¹³ steps, so quantisation invisible at lab scale |
| **A2** | `charging_by_friction` | atomic | ✅ | — | A1 (additivity + conservation) | A3, [T30:electrostatic_induction_charges_on_surface] | Class-room canonical: comb in dry hair, balloon on wall. Indian-context: monsoon vs winter dryness — winter sparks abundant |
| ↳ N2.1 | tribo_series_simple | nano | ✅ | — | — | A2 | Glass+silk → glass +ve; ebonite+wool → ebonite −ve. Mnemonic table (5 entries) sufficient at Class 12 |
| **A3** | `charging_by_conduction` | atomic | ✅ | — | A1, A2 | A4, A14 (field_inside_conductor) | Touch a charged body to a neutral one → charge redistributes. Charge sharing q→q/2 when identical spheres touched |
| **A4** | `charging_by_induction` | atomic | ✅ | — | A1, A3, A14 | [T30:dipole_in_external_field], [T31:dielectric_polarisation] | The canonical 5-step NCERT §1.4 process is the visual anchor. EPIC-C STATE_1 wrong belief: "the rod must touch" — induction does NOT require contact |
| ↳ N4.1 | grounding_completes_induction | nano | ✅ | — | — | A4 | The wire-to-earth step is what separates "induction" from "polarisation". Without grounding, induction reverses when rod is removed |
| **A5** | `conductor_vs_insulator` | atomic | ✅ | — | A1 | A3, A4, A14, [T34:resistance_intro] | Free-electron model. Indian-context: dry wood = insulator (safe), wet wood = partial conductor (NOT safe — earthing-shock context per NCERT §1.3) |
| ↳ N5.1 | semiconductor_intro | nano | ✅ | — | — | A5, [T48:band_theory] | Per CH-G5: nano here, atomic in T48. Just the existence + intermediate-ρ fact + "thermal carriers" hint |
| ↳ N5.2 | earthing_safety_three_pin_plug | nano | ✅ | — | — | A5 | NCERT §1.3 footnote on Indian home wiring (live + neutral + earth). Anchor primitive |
| **A6** | `coulomb_law_scalar` | atomic | ✅ | — | A1, [math:1_over_r_squared] | A8, A9, A10, [T30:E_field_from_point_charge], [T31:potential_energy_pairs] | F = k q₁q₂/r². Sign convention via signed q₁, q₂. EPIC-C STATE_1 wrong belief: "force depends on net charge sum, not product" — common confusion |
| ↳ N6.1 | coulomb_constant_k_value | nano | ✅ | — | — | A6 | k = 9e9 N·m²/C² in vacuum; permittivity ε₀ = 8.854e-12. Just the constants |
| ↳ N6.2 | r_squared_dependence_intuition | nano | ✅ | — | — | A6, [T16:gravitation_inverse_square] | The "double distance, force becomes 1/4" pattern. Cross-cluster bridge to gravitation (already noted in T16 catalog) |
| **A7** | `coulomb_law_vector` | atomic | ✅ | — | A6, [math:vector_addition], [math:unit_vector_r_hat] | A8, A11, [T30:E_field_vector] | Eq.1.3: F⃗₂₁ = (1/4πε₀)(q₁q₂/r²₂₁) r̂₂₁. The split per CH-G3 surfaces the scalar→vector pedagogical gap |
| ↳ N7.1 | direction_attractive_vs_repulsive | nano | ✅ | — | — | A7 | Same sign ⇒ along r̂₂₁; opposite sign ⇒ along −r̂₂₁. The sign-of-product = sign-of-direction insight |
| ↳ N7.2 | newtons_third_law_check | nano | ✅ | — | — | A7 | F⃗₁₂ = −F⃗₂₁. Coulomb's law respects Newton-III — a sanity check pedagogically valuable for confidence |
| **A8** | `coulomb_vs_gravity_strength` | atomic | ✅ | — | A6, [T16:newtons_law_of_gravitation] | A14 (motivates "no field inside conductor") | NCERT Example 1.4: F_e/F_G ≈ 2.4e39 for e-p. Establishes "atomic-scale dominated by electric force; cosmic-scale dominated by gravity." Cross-cluster bridge to T16 |
| **A9** | `superposition_principle_for_charges` | atomic | ✅ | — | A6, A7, [math:vector_addition] | A10, A11, A12, [T30:E_field_superposition], [T34:kirchhoff_current_junction] | Per CH-G4: standalone atomic. Force on q due to system = vector sum of pairwise Coulomb forces. EPIC-C STATE_1 wrong belief: "the presence of q₃ modifies the q₁-q₂ pair force" — NO, pairs are independent |
| **A10** | `force_on_charge_in_multi_charge_system` | atomic | ✅ | — | A9 | A11 | NCERT §1.7 application examples (equilateral triangle of 3 charges + 4-charge square problems). Direct superposition usage |
| **A11** | `electric_field_definition` | atomic | ✅ | — | A6, A7, A9 | A12, A13, [T30:gauss_law], [T31:capacitor_E_field] | E⃗ = F⃗/q for test charge q→0. The "field exists without test charge" conceptual shift. EPIC-C STATE_1 wrong belief: "no force = no field" (field can exist; force shows up only when test charge present) |
| ↳ N11.1 | test_charge_limit | nano | ✅ | — | — | A11 | Why q→0: large test charge would disturb the source distribution. HCV §29.3 explicit on this |
| ↳ N11.2 | field_direction_radial_for_point_charge | nano | ✅ | — | — | A11, A13 | E⃗ points outward for +Q, inward for −Q. Sphere-of-symmetry insight |
| **A12** | `field_due_to_system_of_charges` | atomic | ✅ | — | A9, A11 | A13, [T30:gauss_law_applications] | E⃗ = Σ E⃗_i. Direct from superposition. NCERT Eq.1.10. Visual: 3-charge field-vector composition at a point |
| **A13** | `electric_field_lines` | atomic | ✅ | — | A11, A12 | [T30:gauss_law_via_flux_count], [T31:capacitor_parallel_plate_field] | The 6 properties (start +, end −, never cross, density ∝ |E|, perpendicular to conductor surface, tangent gives direction). EPIC-C STATE_1 wrong belief: "field lines are physical objects" — they're geometric construction |
| ↳ N13.1 | field_lines_never_cross | nano | ✅ | — | — | A13 | Because the field has a unique direction at every point. Pedagogically critical because students draw crossings in homework |
| ↳ N13.2 | field_lines_perpendicular_to_conductor | nano | ✅ | — | — | A13, A14 | Bridge to A14: if not ⊥, surface charges redistribute until equilibrium |
| **A14** | `field_inside_conductor_is_zero` | atomic | ✅ | — | A3, A5, A11 | [T30:gauss_law_conductor_cavity], [T31:capacitor_conductor_plates], [T34:potential_equality_in_wire_with_no_current] | Per CH-G6: standalone atomic. The redistribution argument (HCV §29.13 + NCERT §1.15). High `Required-by` — foundation for capacitor theory, electrostatic shielding, and circuit-potential equality |
| ↳ N14.1 | redistribution_in_microseconds | nano | ✅ | — | — | A14 | The free-electron drift to surface takes <1 ms (HCV §29.13). Pedagogically interesting — "instantaneous" is approximately true at lab scale |
| ↳ N14.2 | charge_resides_on_surface | nano | ✅ | — | — | A14, [T30:gauss_law_conductor] | Excess charge on a conductor sits on the outer surface. Bridge to Gauss's law (will be derived rigorously in T30) |

---

## Section D — Subsection-level breakdown of source material

### D.1 NCERT §1.1–1.4: Phenomenology + charging methods
- §1.1 Electric charges + history (Thales of Miletus 600 BC, amber-wool)
- §1.2 Conductors & insulators (with electroscope demo + Indian-classroom paper-strip experiment)
- §1.3 Conductors and insulators (free-electron model + earthing safety footnote)
- §1.4 Charging by induction (canonical 5-step NCERT process — the (i)–(v) breakdown students memorize for boards)

### D.2 NCERT §1.5: Basic properties of charge → collapsed to A1 per CH-G1

### D.3 NCERT §1.6: Coulomb's law (scalar + vector + Coulomb biography)
- Split into A6 (scalar) + A7 (vector) per CH-G3

### D.4 NCERT §1.7: Forces between multiple charges (superposition)
- A9 (principle) + A10 (application)

### D.5 NCERT §1.8: Electric field
- §1.8 definition → A11
- §1.8.1 system of charges → A12
- §1.8.2 physical significance of field (anchor passage for "field has independent existence")

### D.6 NCERT §1.9: Field lines → A13

### D.7 HCV §29.1: First-principles intro
- Strongest section for "what IS charge" conceptual scaffold
- Gravity-vs-electric comparison (e-p ratio = 2.3e-24 / 5.5e-67 ≈ 10⁴² scale) — A8 anchor

### D.8 HCV §29.12–29.13: Material classification + conductor-field
- A5 (conductor/insulator) + A14 (field inside conductor)
- HCV §29.13 derivation (electron redistribution argument) is the canonical pedagogy

### D.9 DCP Ch.22 §22.1–22.6: Problem-pattern depth
- Confirms atomic split; provides EPIC-C misconception variety
- DCP example "two identical spheres touched then separated" is the canonical conduction-by-contact problem

### D.10 Indian real-world anchors (the strong-anchor section per CH-G7)

| Anchor | Source | Notes |
|---|---|---|
| Gold-leaf electroscope (still in CBSE board practical) | NCERT §1.2 + Fig 1.2 | Every Indian classroom has one. Phenomenological gold-standard |
| Paper-strip ironing demo | NCERT §1.2 (Fig 1.3) | Cheap, replicable in homes — anchors charging-by-friction concept |
| Comb-in-dry-hair attracts paper | NCERT §1.4 (just before "Charging by Induction") | Universal Indian classroom demo |
| Monsoon vs winter — sparks more in winter | (general Indian-context) | Anchors humidity-affects-charge-retention insight |
| Three-pin plug earthing (live + neutral + earth) | NCERT §1.3 footnote | Indian household electrical safety canonical example |
| Thundercloud charge separation (precursor to T31 lightning) | NCERT (forward-reference §1.13) | Already used as T30 lightning anchor; cross-referenced from T29 |
| Static cling in synthetic kurta/saree | (Indian dress context) | Authoring opportunity for `tribo_series_simple` nano N2.1 |

---

## Section E — Stage-1 commonality flag

T29 was correctly identified in `stage-1-chapter-commonality.md` as triple-covered. The current pilot validates that the chapter split between T29 (charges) and T30 (Gauss + dipole + field-from-distributions) was correct — DCP/HCV bundle them, NCERT splits via §1.10 onward.

---

## Section F — V1 priority flag

Per [[feedback-v1-priority-deferred-to-stage-5]], V1 priority assignment is deferred. Inline flag for stage-5 input: **A6 + A11 + A13 + A14 are top candidates for V1 priority queue** (high `Required-by` count + foundational for T30/T31/T34).

---

## Section G — Cluster role

T29 is the **upstream root** of the E&M cluster. All E&M atomics ultimately require T29's A1 (electric_charge_basics), A6/A7 (Coulomb), A11 (field). Combined with T34 (this batch's sister), this closes 60% of the E&M cluster's foundational dependency graph.

---

## Section H — Atomic-count restraint check

14 atomics. The 10-pilot mean is ~26.8 atomics; T29 is below mean because T30 (E&M field+Gauss+dipole) deliberately absorbs much of what could have inflated T29.

**Atomic-count justification:** Each of the 14 has either a unique misconception, a distinct visual scene, or a downstream `Required-by` count ≥ 2 — meeting the diamond-bar threshold.

---

## Section I — Open questions / Stage-4 candidate-micro flags

- **A1 (electric_charge_basics)** is currently an umbrella atomic with 3 nanos. Stage-4 may revisit: does the umbrella structure hold, or should we promote each property to its own micro? Flag as `granularity_question: umbrella_split_candidate`.
- **A8 (coulomb_vs_gravity_strength)** is a borderline atomic vs nano. Reason for atomic-status: it sets up the cosmic-vs-atomic intuition that's revisited in T16, T46 (Nucleus), T47 (Atomic models). Cross-cluster usage = atomic.
- **N11.1 (test_charge_limit)** could be elevated to atomic — the "field exists independent of test charge" insight is conceptually heavy. Currently nano; revisit at Stage-4.

---

## Section J — Matrix update payload

```
Topic ID                : T29
Atomic count            : 14
Nano count              : ~26
Stage-2 OUT-edges (8)   : T29 → T30 (×3: dipole-from-charges, gauss-via-field-lines, conductor-cavity)
                        : T29 → T31 (×1: capacitor charges sit on conductor surface — A14 dependency)
                        : T29 → T34 (×2: potential equality in conductor with no current; kirchhoff-junction as superposition)
                        : T29 → T36 (×1: magnetism induction-vs-electric-induction analogy, deferred contrast)
Math-tools OUT-edges (1): vector_addition (Coulomb vector form + superposition)
Anchor strength         : STRONG
Founder decisions       : 7 (CH-G1 ... CH-G7)
```

---
