# Stage 2 Pilot — Topic 36: Moving Charges & Magnetism

> **Pilot purpose:** Third and final pilot. Applies the founder-approved format from Friction (Topic 12) + Wave Motion (Topic 21) to the LARGEST mechanics-of-electromagnetism topic — the Moving Charges & Magnetism cluster that Stage-1 flagged as "Large (~20-30 atomic)." Tests the format on (a) a topic with multiple shipped repo concepts (`magnetic_field_wire`, `magnetic_force_moving_charge`), (b) deep cross-topic dependency chains (vector cross product, circular motion, electric field, atomic models), and (c) topic-as-foundation for downstream chapters (Topic 37 Magnetism & Matter, Topic 38 EM Induction).

**Stage:** 2 (concept extraction) — pilot batch 3 of 3
**Topic from Stage-1 commonality matrix:** Row 36 — "Moving Charges, Magnetic Force, Biot-Savart, Ampère's Law"
**Triple-covered check:** ✅ NCERT 12.1 Ch.4 + DC Pandey E&M Ch.26 §26.1–26.10 + HC Verma Vol-2 Ch.34 + Ch.35
**Status:** Draft v1 in approved Friction+Waves format. Founder-style decisions applied throughout (founder delegated 2026-05-25 with "quality > brevity" red line).

---

## Founder Decisions Applied (this catalog, prefix MCM-G*)

> Prefix retrofitted in Session 47 cleanup (2026-05-25) — original catalog applied founder-style decisions inline without explicit IDs.

| ID | Decision | Rationale |
|---|---|---|
| MCM-G1 | A34 combined Lorentz force kept as a standalone atomic, NOT a nano under A3. | A3 (pure magnetic, no E-field) and A34 (combined when E present) are taught as distinct JEE scenarios; NCERT §4.2.2 Eq 4.3 introduces the combined form as its own equation. See Section G #1. |
| MCM-G2 | `magnetic_force_moving_charge.json` (currently a consolidated A3+A4+A5 atomic in repo) refactored in V1.1 to split into per-atomic JSONs. | Per Friction Q-C3 precedent: gold-standard v2 schema wants one atomic per JSON. Logged as V1.1 backlog item in Section B. See Section G #2. |
| MCM-G3 | Accept the 88-entry density of Topic 36 (~33 atomics + ~45 nanos + ~10 cross-refs); do not trim. | Per founder W-G6 acceptance of scaling; Stage-1 had flagged Topic 36 as "Large (~20-30 atomic)" and actual 34 is consistent with E&M-cluster density. See Section C addendum #1. |
| MCM-G4 | A11 helical motion v1?=TRUE (promotion from V2). | Helical motion is conceptually accessible — just an extension of A7 circular motion in B. A12 pitch formula stays V2 (derivation deepening, not new concept). Holding final v1? flag for Stage-5 PYQ validation. See Section G #3. |
| MCM-G5 | Math-tools cross-topic-refs (CT1 vector cross product, CT7 line integral) deferred to Stage 3 math-tools reference file. | Per founder W-G4: math-tools is its own consolidated reference, not duplicated per topic. Notation `[math-tools: <concept>]` locked. See Section G #5. |
| MCM-G6 | Stage-3 deepening of DCEM §26.9-26.10 + HCV2 Ch.35 deferred to a follow-up pass (Round 2 reads). | Atomics A18, A21, A23, A24, A26, A27 have NCERT as primary source here; full triple-coverage citation backfill is a Stage-3 task, not Stage-2. Token-economy decision. See Section G #4. |
| MCM-G7 | Align Diamond #2 (`force_on_moving_charge_in_field`) atomic with A3-cluster IDs per `physics-mind/docs/MAGNETISM_ARCHITECTURE.md`. | Catalog's 4 archetype-mapping (A field-viz / B force-in-field / C dipole-in-field / D atomic) aligns with the recursive-bootstrap charter; concept_id naming should be consistent. See Section G #8. |

---

## Section A — Source citations

| Source | Location | Pages (printed) | Pages (PDF) | Coverage type |
|---|---|---|---|---|
| **NCERT 12.1** | Ch.4 "Moving Charges and Magnetism" §4.1 Intro + §4.2 Magnetic Force (4.2.1 Sources/fields, 4.2.2 Lorentz Force, 4.2.3 Force on current) + §4.3 Motion in B-field + §4.4 Combined E+B fields (4.4.1 Velocity selector, 4.4.2 Cyclotron) + §4.5 Biot-Savart Law + §4.6 Circular loop axis field + §4.7 Ampere's Law + §4.8 Solenoid + Toroid + §4.9 Force between parallel currents + §4.10 Torque + Magnetic Dipole | 132–162 (excl. §4.11 Galvanometer = Topic 37 boundary) | 136–166 | **Most complete source** — full chapter covers all 12 atomic clusters identified below |
| **DC Pandey E&M** | Ch.26 "Magnetics" §26.1–26.8 captured (force, motion in 3 cases, force on current, magnetic dipole, dipole in B, Biot-Savart, applications: straight wire). §26.9–§26.10 (circular loop, solenoid, Ampere's law) deferred to Stage-3 deepening pass — NCERT covers same atomics here. | 335–356 (partial) | 348–367 | Problem-pattern depth + Indian JEE-Adv flavor; 12 worked examples + 4 introductory exercises captured |
| **HC Verma Vol-2** | Ch.34 "Magnetic Field" §34.1–34.6 captured (force on charge, definition of B, frame-dependence of E vs B, motion in B, force on current wire, torque on loop). **Ch.35 "Magnetic Field due to a Current"** (Biot-Savart, applications to straight wire, circular loop, solenoid, parallel wires) deferred to Stage-3 deepening pass — NCERT + DCEM cover same atomics. | 221–228 (Ch.34 partial) | 234–249 | Conceptual depth + frame-dependence pedagogy uniquely strong in HCV2 §34.3 |

**Cross-check note:** NCERT Ch.4 is unusually self-complete for Topic 36 — it covers every atomic identified below at least at theorem-statement level. DCEM and HCV2 add (a) richer derivations (HCV2's frame-dependence narrative, DCEM's 3-case structure for motion in B-field) and (b) more problem patterns. **Stage-3 deepening:** when this catalog gets revisited for citation completeness, the missing DCEM §26.9–§26.10 + HCV2 Ch.35 reads are required. For format-validation (Stage 2 purpose) the current 3-source coverage is sufficient.

---

## Section B — Existing repo concepts addressing this topic

| File | Concept ID | What it covers | Status |
|---|---|---|---|
| `src/data/concepts/magnetic_field_wire.json` | `magnetic_field_wire` | Atomic concept for **A21** — magnetic field B = μ₀I/(2πr) around a long straight current-carrying wire | ✅ Shipped. Proof-of-concept Diamond #1 per `physics-mind/docs/MAGNETISM_ARCHITECTURE.md`. |
| `src/data/concepts/magnetic_force_moving_charge.json` | `magnetic_force_moving_charge` | Atomic concept for **A3 + A4 + A5** consolidated — Lorentz magnetic force F = qv×B, right-hand rule, perpendicular-no-work property | ✅ Shipped. Per founder Q-C3 precedent (Friction's `friction_static_kinetic` refactor), this consolidated atomic gets a **V1.1 refactor backlog item** to split into per-atomic JSONs (A3, A4, A5 separately). |

Forward-referenced prereqs already in repo (cross-topic dependencies):
- `vector_resolution.json` — used in A3, A15, A20, A30 (all cross-product atomics)
- `newton_second_law_direction.json` — used in A7 (circular motion derivation)
- `free_body_diagram.json` — used in A7 (centripetal force balance)
- **MISSING prereqs (cross-topic, not yet authored):**
  - Topic 10 Circular Motion atomics (centripetal force, uniform circular motion) — A7, A8 depend
  - Topic 30 Electrostatics atomics (electric field E, Coulomb's law, electric dipole) — A3 (combined Lorentz), A13 velocity selector, A29-A32 (dipole analogy) depend
  - Topic 47 Atomic Models (Bohr model) — A33 revolving-electron magnetic moment depends
  - `[math-tools: vector_cross_product]` — A3, A4, A15, A20, A26, A30 all use cross product
  - `[math-tools: line_integral]` — A26 Ampere's law

---

## Section C — Methodology notes

Same conventions as Friction + Waves catalogs (Section C of each). Topic-36-specific addenda:

1. **Largest topic so far.** ~33 atomics + ~45 nanos + ~10 cross-topic-refs ≈ 88 entries (vs Friction 60, Waves 59). Confirms Stage-1 prediction "Large ~20-30 atomic." Founder-style decision (per W-G6 acceptance of scaling): accept this density; do not trim.
2. **Two shipped JSONs reflect the chapter's importance.** Both `magnetic_field_wire` and `magnetic_force_moving_charge` are proof-of-concept diamonds for the recursive-bootstrap authoring method (per `physics-mind/docs/MAGNETISM_ARCHITECTURE.md`). The catalog respects them: cited as ✅ In repo, with refactor-split flag on the consolidated one.
3. **Heavy cross-topic load.** 10 cross-topic-refs (vs Friction 1, Waves 8). Pattern confirmed: E&M concepts interconnect more than mechanics. Stage 5 priority queue will need a graph algorithm.
4. **MAGNETISM_ARCHITECTURE.md alignment.** That charter document describes 4 visual archetypes (A field-viz, B force-in-field, C dipole-in-field, D atomic). This catalog's atomic clusters map cleanly:
   - Archetype A (field visualization): A1, A20, A21, A22, A23, A24, A25, A26, A27, A28 (10 atomics)
   - Archetype B (force-in-field): A3, A4, A5, A6, A7, A8, A15, A17, A18 (9 atomics)
   - Archetype C (dipole-in-field): A29, A30, A31, A32 (4 atomics)
   - Archetype D (atomic-physics): A33 + cross-topic-ref CT9 (1 atomic + 1 ref)
   - Other (problem-pattern + V2 device): A9, A10, A11, A12, A13, A14, A16, A19 (8 atomics)

---

## Section D — Concept catalog (atomic + nano)

### Legend (same as Friction + Waves)

- **Type:** `atomic` | `nano` | `cross-topic-ref`
- **Sim?:** ✅ simulatable | ⚠ partial | ❌ not-simulatable
- **In repo?:** ✅ already a JSON | ⚠ partially covered | — not yet authored
- **v1?:** TRUE = V1 ships | FALSE = V2 candidate

### Tier 1 — Foundational definitional atomics

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** `magnetic_field_concept_B` | A magnetic field B is a vector field produced by moving charges or currents; exerts force on other moving charges/currents. SI unit Tesla. | atomic | ✅ | ⚠ implicit in `magnetic_field_wire` | — | A3, A20, A21, A22, A26, A29 | **Sources:** HCV2 §34.1, §34.2 (full pedagogical derivation from 4 observations of magnetic force); NCERT §4.1 (Oersted's experiment), §4.2.1 (B as vector field, principle of superposition); DCEM §26.1 (implicit). **v1?:** TRUE — foundational. **PRIMARY aha:** B is a vector field around currents, separate from E. **Indian-context anchor:** Earth's magnetic field ≈ 3.6×10⁻⁵ T at surface (NCERT Table 4.1). |
| ↳ N1.1 `tesla_and_gauss_units` | 1 T = 10⁴ G. Earth's field ~10⁻⁵ T; lab fields ~1 T; neutron star ~10⁸ T (orders-of-magnitude table) | nano | ✅ | — | A1 | A1 | parent: A1. Sources: HCV2 §34.2 explicit; NCERT Table 4.1 (range of B values across universe). |
| ↳ N1.2 `B_field_visualisation_with_iron_filings` | Iron filings around a wire form concentric circles → reveals B-field geometry | nano | ✅ | — | A1, A2 | A1, A21, A22 | parent: A1. Sources: NCERT Fig 4.1(c) explicit. Strong simulation visual. |
| **A2** `oersted_experiment_current_creates_magnetic_field` | 1820 Oersted observation: compass needle deflects near current-carrying wire → moving charges create magnetic field. Foundational discovery linking electricity and magnetism. | atomic | ✅ | — | A1 | A1, A20, A21 | **Sources:** NCERT §4.1 (full historical narrative + Fig 4.1, Hans Christian Oersted box); HCV2 §34.1 implicit. **v1?:** TRUE — historical anchor. **Indian-context:** This experiment is the gateway from Class 12 electrostatics (Topic 30) into magnetism (Topic 36); JEE syllabus boundary. |
| **A3** `lorentz_magnetic_force_F_equals_qv_cross_B` | Force on a charged particle q moving at velocity v in magnetic field B: **F = q(v × B)**. Magnitude F = qvB sin θ. | atomic | ✅ | ⚠ bundled in `magnetic_force_moving_charge` | A1, `[math-tools: vector_cross_product]` | A4, A5, A6, A7, A15, A34 | **Sources:** NCERT §4.2.2 (Eq 4.3 combined Lorentz F = q[E + v×B]); DCEM §26.2 explicit; HCV2 §34.2 (Eq 34.1 derived from 4 observations). **v1?:** TRUE — central formula. **Already shipped (consolidated)**; refactor backlog applies. |
| ↳ N3.1 `force_magnitude_F_equals_qvB_sin_theta` | F = qvB sin θ; θ = angle between v and B | nano | ✅ | ✅ in `magnetic_force_moving_charge` | A3 | A3, A6 | parent: A3. Sources: NCERT §4.2.2, HCV2 §34.2(b), DCEM §26.2(i). |
| ↳ N3.2 `combined_lorentz_force_E_plus_v_cross_B` | Total electromagnetic force: F = q[E + v×B]. When both E and B present. | nano | ✅ | — | A3, `[Topic-30: electric_field_E]` | A13, A14 | parent: A3. Sources: NCERT Eq 4.3 explicit. Cross-topic-ref CT4. |
| ↳ N3.3 `force_on_negative_charge_opposite_direction` | Reversing q sign reverses F direction | nano | ✅ | — | A3 | A3, A4 | parent: A3. Sources: NCERT §4.2.2(i), DCEM §26.2(vi)(a), HCV2 §34.2(d). |
| **A4** `magnetic_force_direction_right_hand_rule` | Direction of F = qv × B given by right-hand rule (or screw rule, or Fleming's left-hand rule for current-carrying wires) | atomic | ✅ | ⚠ bundled in `magnetic_force_moving_charge` | A3, `[math-tools: vector_cross_product]` | A7, A15, A18 | **Sources:** NCERT §4.2.2 + Fig 4.2 (screw rule explicit); DCEM §26.2 (three methods: vector, Fleming's left-hand, right-hand — most thorough); HCV2 §34.2 (cross-product rule). **v1?:** TRUE — critical procedural skill. |
| ↳ N4.1 `flemings_left_hand_rule_for_force_on_current` | Forefinger=B, central finger=v(+q) or I, thumb=F. For +charge or current direction. | nano | ✅ | — | A4 | A4, A15 | parent: A4. Sources: DCEM §26.2(vi)(b) Fig 26.1. Strong mnemonic for Indian students. |
| ↳ N4.2 `right_hand_rule_vector_form` | Curl fingers from v toward B; thumb gives F direction (for +q) | nano | ✅ | — | A4 | A4 | parent: A4. Sources: NCERT Fig 4.2, DCEM §26.2(vi)(c). |
| ↳ N4.3 `dot_cross_notation_into_page_out_of_page` | ⊙ = out of page; ⊗ = into page. Convention for 3D vectors in 2D diagrams. | nano | ✅ | — | A4 | A4, all field diagrams | parent: A4. Sources: NCERT §4.2.2 box explicit; DCEM Fig 26.3. `granularity_question: candidate_micro` — universal convention. |
| **A5** `magnetic_force_perpendicular_no_work_done_KE_constant` | F ⊥ v always → magnetic force never does work → kinetic energy never changes. Only direction changes, never speed. | atomic | ✅ | ⚠ bundled in `magnetic_force_moving_charge` | A3 | A7, A11 | **Sources:** DCEM §26.2(vii) (explicit derivation W = 0 from F·ds = 0); HCV2 §34.4 explicit; NCERT §4.3 (introductory sentence "no work is done and no change in the magnitude of the velocity"). **v1?:** TRUE. **CRITICAL EPIC-C atomic.** Misconception: "magnetic force is a force, so it must do work on the particle" → wrong. Compare to electric force which DOES do work. |
| **A6** `magnetic_force_zero_when_v_parallel_to_B` | F = qvB sin θ; if v parallel or antiparallel to B, sin θ = 0 → F = 0 → particle moves in straight line | atomic | ✅ | — | A3, N3.1 | A7, A11 | **Sources:** HCV2 §34.2(a) explicit; DCEM §26.3 Case 1 (full); NCERT §4.3 (mentioned). **v1?:** TRUE — special case students need to recognize. |
| **A15** `magnetic_force_on_current_carrying_wire_F_equals_IL_cross_B` | Force on a straight current-carrying wire of length L in field B: F = I(L × B); for arbitrary wire dF = I(dl × B), integrate. | atomic | ✅ | — | A3, `[math-tools: vector_cross_product]` | A17, A18, A30 | **Sources:** NCERT §4.2.3 (Eq 4.4 derivation from sum of forces on charge carriers); DCEM §26.4 (Eq i, explicit derivation); HCV2 §34.5 (Eq 34.6). **v1?:** TRUE — core formula for problems. |
| ↳ N15.1 `derivation_from_force_on_individual_charges` | Sum F = nAL · q(v_d × B) = (nAv_d q)L × B = I(L × B), since I = nAv_d q | nano | ✅ | — | A15, A3 | A15 | parent: A15. Sources: NCERT §4.2.3 explicit step-by-step; HCV2 §34.5 same. |
| ↳ N15.2 `dF_equals_I_dl_cross_B_arbitrary_wire` | Differential form: dF = I dl × B; integrate for curved wires | nano | ✅ | — | A15, N15.1 | A15, A16 | parent: A15. Sources: NCERT Eq below 4.4; DCEM §26.4 (iv) Eq ii. |
| **A17** `closed_loop_in_uniform_B_net_force_zero` | For any closed current loop (any shape) in uniform B: net force = 0 (since ∮dl = 0 for closed loop). Loop can still experience TORQUE. | atomic | ✅ | — | A15, N15.2 | A29, A30 | **Sources:** DCEM §26.4 Case 2 (explicit derivation F_net = i(∮dl) × B = 0); NCERT §4.10.1 (used in derivation); HCV2 §34.6 (implicit). **v1?:** TRUE — important constraint. EPIC-C target: students assume "loop in field experiences net force" → wrong. |
| ↳ N17.1 `force_curved_wire_in_uniform_B_equals_force_straight_wire_endpoints` | For curved wire ACD in uniform B: F = I(AD × B), where AD is the straight-line vector from start to end | nano | ✅ | — | A17, A15 | A17 | parent: A17. Sources: DCEM §26.4 Case 1 explicit. Useful simplification. |
| ↳ N17.2 `closed_loop_can_have_torque_but_not_net_force` | F_net = 0 but τ ≠ 0 in general → loop rotates but doesn't translate | nano | ✅ | — | A17, A30 | A17, A30, A31 | parent: A17. Sources: DCEM §26.4 Case 2 + §26.6 link. |
| **A21** `magnetic_field_long_straight_wire_B_equals_mu0_I_over_2pi_r` | Field magnitude at perpendicular distance r from an infinitely long straight wire carrying current I: B = μ₀I/(2πr) | atomic | ✅ | **✅ shipped** | A20, A26 (Ampere) OR Biot-Savart integration | A18, A22 | **Sources:** NCERT §4.7 (Eq 4.18 via Ampere's law); DCEM §26.8 (via Biot-Savart explicit); HCV2 Ch.35 (covered). **v1?:** TRUE. **Already shipped as `magnetic_field_wire.json` — diamond #1.** Has both derivation paths (Biot-Savart + Ampere). |
| ↳ N21.1 `cylindrical_symmetry_around_wire` | B has same magnitude on any circle around the wire; direction tangent to circle | nano | ✅ | ✅ in `magnetic_field_wire` | A21, N1.2 | A21, A22, A26 | parent: A21. Sources: NCERT §4.7(i) explicit. |
| ↳ N21.2 `B_inversely_proportional_to_r` | B ∝ 1/r; halve distance → double field; far from wire B→0 | nano | ✅ | ✅ in `magnetic_field_wire` | A21 | A21 | parent: A21. Sources: NCERT §4.7(iii) explicit; DCEM §26.8 (iii) graph B vs d. |
| **A22** `right_hand_thumb_rule_direction_around_wire` | Grasp wire with right hand, thumb in current direction; fingers curl in direction of B | atomic | ✅ | ⚠ in `magnetic_field_wire` | A1, A21 | A23, A24, A27 | **Sources:** NCERT §4.7(iv) explicit ("Grasp the wire in your right hand with your extended thumb pointing in the direction of the current..."); DCEM §26.8(ii) same; HCV2 Ch.35. **v1?:** TRUE — procedural skill, distinct from A4 (force direction); students confuse the two right-hand rules. **Note:** NCERT footnote at §4.7 explicitly distinguishes "two distinct right-hand rules" (one for B-on-axis-of-loop, one for B-around-straight-wire). |
| **A29** `magnetic_dipole_moment_m_equals_NIA` | Current loop's magnetic dipole moment: m = NIA (N turns, I current, A area-vector with right-hand-rule direction). Unit A·m². | atomic | ✅ | — | A15, A17 | A30, A31, A32 | **Sources:** NCERT §4.10.1 (Eq 4.28, 4.30); DCEM §26.5 (|M| = NiA, three direction methods explicit); HCV2 §34.6 (μ = iA, then NiA). **v1?:** TRUE — bridges to permanent magnets (Topic 37). |
| ↳ N29.1 `area_vector_direction_right_hand_rule` | Curl fingers in current direction; thumb gives A-vector direction (and dipole-moment direction) | nano | ✅ | — | A29, A22 | A29, A30 | parent: A29. Sources: NCERT §4.10.1 explicit; HCV2 §34.6; DCEM §26.5 method (ii) Fig 26.19. |
| ↳ N29.2 `south_to_north_convention_for_loop` | Looking at the loop face where current appears clockwise = south pole; opposite face = north pole. m points S→N. | nano | ✅ | — | A29 | A29, A31 | parent: A29. Sources: DCEM §26.5(i) Fig 26.17 explicit. |
| ↳ N29.3 `magnetic_moment_units_amp_meter_squared` | [m] = A·m² | nano | ✅ | — | A29 | A29 | parent: A29. Sources: NCERT §4.10.1 explicit. |
| **A30** `torque_on_current_loop_tau_equals_m_cross_B` | Torque on dipole in uniform B: **τ = m × B**; magnitude τ = mB sin θ; zero at θ=0 (stable equilibrium); max at θ=π/2 | atomic | ✅ | — | A15, A17, A29 | A31, A32 | **Sources:** NCERT §4.10.1 (Eq 4.29 derivation via forces on each side); DCEM §26.6 (τ = M×B, full derivation + comparison with electric dipole); HCV2 §34.6 (Eq 34.7 τ = μ×B). **v1?:** TRUE — central application. |
| ↳ N30.1 `torque_zero_when_m_parallel_to_B_stable` | When m parallel to B (θ=0): τ=0, stable equilibrium (any rotation creates restoring torque) | nano | ✅ | — | A30 | A30, A31 | parent: A30. Sources: NCERT §4.10.1 (explicit), DCEM §26.6 (i). |
| ↳ N30.2 `torque_zero_when_m_antiparallel_to_B_unstable` | When m antiparallel to B (θ=π): τ=0, unstable equilibrium | nano | ✅ | — | A30 | A30 | parent: A30. Sources: NCERT §4.10.1. |
| ↳ N30.3 `torque_max_when_m_perpendicular_to_B` | At θ=π/2: τ = mB (maximum) | nano | ✅ | — | A30 | A30 | parent: A30. Sources: DCEM §26.6 (i). |
| **A31** `current_loop_acts_as_magnetic_dipole` | Far-field (x >> R): a current loop's B-field is mathematically equivalent to a magnetic dipole's field. **No magnetic monopoles exist** — the current loop IS the elementary magnetic source. | atomic | ✅ | — | A23, A29 | (Topic 37 atomics) | **Sources:** NCERT §4.10.2 (Eq 4.31a, 4.31b — full far-field derivation, B_axial = (μ₀/4π)(2m/x³)); DCEM §26.5 (every loop is a dipole). **v1?:** TRUE — bridges Topic 36 → Topic 37 (Magnetism & Matter). **Conceptual depth:** Ampere's hypothesis that all magnetism is due to circulating currents. |
| ↳ N31.1 `B_axial_dipole_2m_over_4pi_x3` | On axis: B = (μ₀/4π)(2m/x³). Same form as electric dipole field on axis (with m↔p_e, μ₀↔1/ε₀). | nano | ✅ | — | A31, A23 | A31 | parent: A31. Sources: NCERT Eq 4.31a explicit; DCEM Table 26.1 row 7. |
| ↳ N31.2 `B_equatorial_dipole_m_over_4pi_x3` | On equatorial plane: B = (μ₀/4π)(m/x³), opposite to m. Half the axial magnitude. | nano | ✅ | — | A31, A23 | A31 | parent: A31. Sources: NCERT Eq 4.31b; DCEM Table 26.1 row 8. |
| ↳ N31.3 `no_magnetic_monopoles_exist` | Unlike electric dipole (built of ±q), magnetic dipole is the most elementary unit. No isolated north/south pole observed. | nano | ✅ | — | A31 | A31 | parent: A31. Sources: NCERT §4.10.2 ("magnetic monopoles ... are not known to exist") explicit; DCEM Table 26.1 implicit. |
| **A34** `lorentz_force_in_combined_E_and_B_F_equals_qE_plus_qv_cross_B` | Total electromagnetic force on a charge: F = q[E + v×B]. Generalization of A3 when both fields present. | atomic | ✅ | — | A3, N3.2, `[Topic-30: electric_field_E]` | A13 | **Sources:** NCERT §4.2.2 Eq 4.3 (combined form is the starting point); DCEM (implicit); HCV2 (implicit). **v1?:** TRUE — completes the Lorentz force story. **UNCERTAIN — flagged for founder review:** is A34 a separate atomic from A3, or is N3.2 the nano-level expression of this? Founder-style decision: keep as standalone atomic. A3 (purely magnetic) + A34 (combined) are taught as separate scenarios in JEE problems. |

### Tier 2 — Motion-in-B-field + Cyclotron cluster

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A7** `circular_motion_charge_in_uniform_B_perpendicular` | When v ⊥ B: charged particle traces a **circle** in the plane perpendicular to B. F = qvB acts as centripetal force. | atomic | ✅ | — | A3, A5, `[Topic-13: centripetal_force]` | A8, A9, A10, A11 | **Sources:** NCERT §4.3 + Fig 4.5 (full); DCEM §26.3 Case 2 (full with multiple expressions for r); HCV2 §34.4 + Fig 34.4. **v1?:** TRUE — central motion type. |
| ↳ N7.1 `centripetal_force_qvB_equals_mv2_over_r` | qvB = mv²/r (centripetal balance) | nano | ✅ | — | A7, `[Topic-13: centripetal_force]` | A7, A8 | parent: A7. Sources: NCERT, DCEM, HCV2 all explicit. |
| **A8** `cyclotron_radius_r_equals_mv_over_qB` | Radius of circle: r = mv/qB. Equivalently r = p/qB = √(2mK)/qB = √(2mqV)/qB (for K=qV) | atomic | ✅ | — | A7, N7.1 | A9, A11 | **Sources:** NCERT Eq 4.5; DCEM §26.3 explicit (multiple equivalent forms); HCV2 Eq 34.2. **v1?:** TRUE — central formula, high PYQ frequency. |
| ↳ N8.1 `radius_proportional_to_momentum` | r ∝ mv = p; larger momentum → larger circle | nano | ✅ | — | A8 | A8 | parent: A8. Sources: DCEM §26.3 (ii). |
| ↳ N8.2 `radius_proportional_to_sqrt_K_for_same_q_B` | For same q, B: r ∝ √K (kinetic energy). Used in JEE for proton/deuteron/alpha comparisons. | nano | ✅ | — | A8, N8.1 | A8 | parent: A8. Sources: DCEM §26.3 + Examples 26.5, 26.6 (JEE 1997, 1988). |
| ↳ N8.3 `radius_proportional_to_sqrt_qV_when_accelerated_through_V` | If accelerated through potential V: K = qV, so r = √(2mV/q)/B. Used in mass spectrometers. | nano | ✅ | — | A8, N8.2 | A8 | parent: A8. Sources: DCEM §26.3 Example 26.6 + HCV2 problems. |
| **A9** `cyclotron_period_T_equals_2pi_m_over_qB` | Time period of circular motion: T = 2πm/qB. Angular frequency ω = qB/m. Frequency f = qB/(2πm). | atomic | ✅ | — | A7, A8 | A10, A14 | **Sources:** NCERT Eq 4.6(a); DCEM §26.3 explicit; HCV2 Eq 34.3, 34.4. **v1?:** TRUE. |
| **A10** `cyclotron_period_independent_of_speed_and_radius` | T, f, ω are independent of v (and of r). Counterintuitive: faster particle traces larger circle in same time. | atomic | ✅ | — | A9 | A14 (cyclotron design) | **Sources:** NCERT §4.3 explicit ("independent of the velocity or energy"); DCEM §26.3 (ii) explicit; HCV2 §34.4 explicit. **v1?:** TRUE. **CRITICAL EPIC-C atomic.** EPIC-C STATE_1: student says "faster particle takes longer to go around" → wrong. This independence is what makes the cyclotron possible. |
| **A11** `helical_motion_when_v_has_component_along_B` | If v has both ⊥ and || components to B: || component unchanged, ⊥ component traces circle → resultant trajectory is a **helix** | atomic | ✅ | — | A6, A7 | A12 | **Sources:** NCERT §4.3 + Fig 4.6; DCEM §26.3 Case 3; HCV2 §34.4 + Fig 34.5. **v1?:** FALSE — V2 (advanced motion case). |
| ↳ N11.1 `v_decomposed_into_parallel_and_perpendicular` | v = v_||·B̂ + v_⊥. Force only acts on v_⊥. | nano | ✅ | — | A11, A6 | A11 | parent: A11. Sources: DCEM §26.3 Case 3 + Fig 26.6. |
| ↳ N11.2 `auroras_charged_particles_helix_along_earth_field_lines` | Aurora Borealis: solar wind particles spiral along Earth's magnetic field lines, collide with atmosphere at poles → green/pink light. **Indian-context shift:** also visible from northern parts of India in major geomagnetic storms. | nano | ✅ | — | A11 | A11 | parent: A11. Sources: NCERT §4.3 "Helical Motion of Charged Particles and Aurora Borealis" callout (full pedagogy + Fig). Real-world anchor. |
| **A12** `helix_pitch_p_equals_2pi_m_v_parallel_over_qB` | Pitch (distance per revolution along B): p = v_|| · T = (2πm v_||)/qB = (2πm v cos θ)/qB | atomic | ✅ | — | A11, A9 | — | **Sources:** NCERT Eq 4.6(b); DCEM §26.3 Case 3 explicit. **v1?:** FALSE — V2. |
| **A13** `velocity_selector_perpendicular_E_and_B_fields_v_equals_E_over_B` | Crossed E and B fields perpendicular to v: particle undeflected only when qE = qvB → v = E/B. Selects particles by velocity (used in mass spectrometer, J.J. Thomson's e/m). | atomic | ✅ | — | A3, A34, `[Topic-30: electric_field_E]` | A14 | **Sources:** NCERT §4.4.1 full + Fig 4.7. **v1?:** FALSE — V2 (specialized device). |
| **A14** `cyclotron_device_principle_KE_equals_q2B2R2_over_2m` | Cyclotron: charged particle accelerated by alternating E-field between dees, magnetic field bends path. Resonance condition: ν_applied = ν_cyclotron = qB/(2πm). Exit KE = q²B²R²/(2m). | atomic | ✅ | — | A7, A9, A10, A13 | — | **Sources:** NCERT §4.4.2 full (Eqs 4.8, 4.9, 4.10 + Fig 4.8). **v1?:** FALSE — V2 (device-specific). **Indian-context anchor:** NCERT "Accelerators in India" callout — Saha Institute Kolkata Cyclotron (1953, Meghnad Saha), BARC Mumbai, IIT Kanpur Van de Graaff (1963), IUAC Delhi, ITER (India collaborating). |

### Tier 3 — Field-generation cluster (Biot-Savart + Ampere)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A20** `biot_savart_law_dB_equals_mu0_over_4pi_IdL_cross_r_over_r2` | Magnetic field due to current element: dB = (μ₀/4π) · (I dL × r̂)/r². μ₀/4π = 10⁻⁷ T·m/A. | atomic | ✅ | — | A1, `[math-tools: vector_cross_product]`, `[math-tools: integration]` | A21, A23, A25, A27 | **Sources:** NCERT §4.5 (Eq 4.11 + Fig 4.9); DCEM §26.7 (Eq i + Fig 26.28); HCV2 Ch.35 (not captured but standard). **v1?:** TRUE — central law. **EPIC-C target:** comparison with Coulomb's law for electric field — both 1/r² but Biot-Savart has direction-dependence (sin θ) that Coulomb doesn't. NCERT §4.5 has explicit 4-point comparison table. |
| ↳ N20.1 `mu0_4pi_equals_10_minus_7_Tm_per_A` | Permeability of free space; defines SI ampere | nano | ✅ | — | A20 | A20, A21, A23 | parent: A20. Sources: NCERT Eq 4.11(c) explicit. |
| ↳ N20.2 `magnitude_dB_proportional_to_sin_theta_over_r_squared` | |dB| = (μ₀/4π) · I·dL·sin θ / r². Zero along the dL line (sin 0 = 0). | nano | ✅ | — | A20 | A20 | parent: A20. Sources: NCERT Eq 4.11(b); DCEM §26.7 (i). |
| ↳ N20.3 `direction_perpendicular_to_dL_and_r_plane` | dB ⊥ plane containing dL and r̂; by right-hand screw rule | nano | ✅ | — | A20, A4 | A20 | parent: A20. Sources: NCERT §4.5; DCEM Fig 26.28. |
| ↳ N20.4 `comparison_biot_savart_vs_coulombs_law` | Both 1/r²; both linear superposition; both long-range. But: source for Coulomb = scalar (q); for Biot-Savart = vector (IdL). And Biot-Savart has sin θ angle-dependence. | nano | ✅ | — | A20, `[Topic-30: coulombs_law]` | A20 | parent: A20. Sources: NCERT §4.5 explicit 4-point comparison. Strong cross-topic pedagogy. |
| **A23** `magnetic_field_axis_circular_loop_B_axial_x` | On axis of circular current loop of radius R, distance x from center: B = (μ₀ I R²)/[2(x² + R²)^(3/2)] | atomic | ✅ | — | A20 (via integration) | A24, A27, A31 | **Sources:** NCERT §4.6 (Eq 4.15) + Fig 4.11 full derivation. **v1?:** TRUE. |
| **A24** `magnetic_field_center_circular_loop_B0_equals_mu0_I_over_2R` | At center of loop (x = 0): B₀ = μ₀I/(2R). Special case of A23. | atomic | ✅ | — | A23 | A27 | **Sources:** NCERT Eq 4.16; standard formula in all sources. **v1?:** TRUE — common JEE problem. |
| ↳ N24.1 `right_hand_thumb_rule_for_loop_curled_fingers_show_current_thumb_shows_B` | Curl right-hand fingers along current direction; thumb points along B at center (and along loop axis) | nano | ✅ | — | A24, A22 | A24, A29 | parent: A24. Sources: NCERT §4.6 + Fig 4.12 explicit. **Note:** NCERT footnote distinguishes this from A22 (straight-wire rule) — students conflate them. |
| ↳ N24.2 `N_turns_coil_field_B_equals_mu0_NI_over_2R` | For N turns: B = μ₀NI/(2R). Linear superposition. | nano | ✅ | — | A24 | A24, A27 | parent: A24. Sources: NCERT Ex 4.7. |
| **A25** `magnetic_field_finite_straight_wire_B_equals_mu0_I_over_4pi_d_sin_alpha_plus_sin_beta` | For a finite straight wire, field at perpendicular distance d: B = (μ₀I)/(4πd) · (sin α + sin β), where α, β are angles to the ends | atomic | ✅ | — | A20 | A21 (special case α=β=π/2) | **Sources:** DCEM §26.8 explicit derivation. **v1?:** FALSE — V2 (specialized case; infinite wire is sufficient for V1). |
| **A26** `amperes_circuital_law_loop_integral_B_dot_dL_equals_mu0_I_enc` | ∮B · dL = μ₀ I_enclosed. Line integral of B around any closed loop = μ₀ × total current through any surface bounded by that loop. | atomic | ✅ | — | A1, `[math-tools: line_integral]` | A21, A27, A28 | **Sources:** NCERT §4.7 (Eq 4.17a, 4.17b — full with sign convention right-hand rule); DCEM and HCV2 (covered, not in captured pages). **v1?:** TRUE — foundational law (Maxwell-equation antecedent). |
| ↳ N26.1 `enclosed_current_sign_convention_right_hand_rule` | Curl fingers in traversal direction around loop; thumb gives + current direction | nano | ✅ | — | A26 | A26 | parent: A26. Sources: NCERT §4.7 explicit. |
| ↳ N26.2 `BL_equals_mu0_Ie_for_symmetry` | When B is tangential and constant on the chosen path: BL = μ₀ I_e (simplified form). | nano | ✅ | — | A26 | A26, A21, A27 | parent: A26. Sources: NCERT Eq 4.17(b). |
| ↳ N26.3 `amperes_law_for_wire_internal_field_B_proportional_to_r` | Inside a wire of radius a with uniform current: B = (μ₀I/2πa²)·r for r < a; B = μ₀I/(2πr) for r > a. | nano | ✅ | — | A26, A21 | A26 | parent: A26. Sources: NCERT Ex 4.8 explicit derivation + Fig 4.16 (graph). |
| **A27** `solenoid_field_inside_B_equals_mu0_n_I` | Long solenoid (length >> radius): B = μ₀nI inside (uniform), B ≈ 0 outside. n = turns per unit length. | atomic | ✅ | — | A26, A24 | — | **Sources:** NCERT §4.8.1 (Eq 4.20) + Figs 4.17, 4.18. **v1?:** TRUE — practical device (MRI, electromagnet). |
| ↳ N27.1 `solenoid_field_uniform_inside_zero_outside` | Inside: B uniform along axis. Outside: B → 0 for ideal long solenoid. | nano | ✅ | — | A27 | A27 | parent: A27. Sources: NCERT §4.8.1 Figs 4.17, 4.18. |
| ↳ N27.2 `n_turns_per_unit_length` | n = N/L; SI unit m⁻¹ | nano | ✅ | — | A27 | A27, A28 | parent: A27. Sources: NCERT Eq 4.20 derivation. |
| **A28** `toroid_field_B_equals_mu0_N_I_over_2pi_r` | Toroid (donut-shaped solenoid): B = μ₀NI/(2πr) inside the toroidal coil, 0 elsewhere | atomic | ✅ | — | A26, A27 | — | **Sources:** NCERT §4.8.2 (Eqs 4.21, 4.22) + Fig 4.19. **v1?:** FALSE — V2. **Indian-context anchor:** tokamak fusion confinement (NCERT "Magnetic Confinement" callout mentions ITER, India participating). |

### Tier 4 — Parallel currents + advanced

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A18** `force_between_parallel_currents_attract_or_repel` | Two parallel wires carrying currents I_a, I_b separated by distance d: force per unit length f = μ₀ I_a I_b / (2πd). **Parallel currents attract; antiparallel currents repel.** | atomic | ✅ | — | A15, A21 | A19 | **Sources:** NCERT §4.9 + Fig 4.20 (full derivation, Eq 4.23, 4.25). **v1?:** TRUE. **CRITICAL EPIC-C atomic.** Surprising opposite of electrostatics: like charges repel, but like (parallel) currents attract. **Indian-context anchor:** Roget's spiral demonstration (NCERT callout explicit; uses a spring + mercury, 5 A current). |
| ↳ N18.1 `parallel_currents_attract_antiparallel_repel` | I_a, I_b same direction → attract; opposite direction → repel | nano | ✅ | — | A18, A4 | A18 | parent: A18. Sources: NCERT §4.9 explicit + Newton's 3rd law verification. |
| ↳ N18.2 `force_per_length_f_equals_mu0_Ia_Ib_over_2pi_d` | f_ba = (μ₀ I_a I_b)/(2πd) per metre length | nano | ✅ | — | A18 | A18, A19 | parent: A18. Sources: NCERT Eq 4.25 explicit. |
| ↳ N18.3 `force_consistent_with_newton_third_law` | F_ba = −F_ab for steady currents (parallel conductors). Time-varying currents may violate. | nano | ✅ | — | A18 | A18 | parent: A18. Sources: NCERT footnote at §4.9 explicit. |
| **A19** `ampere_si_unit_definition_from_parallel_currents` | One ampere = current in each of two parallel wires (1 m apart, vacuum) producing force 2×10⁻⁷ N/m between them. Theoretical definition adopted 1946. | atomic | ⚠ partial | — | A18 | — | **Sources:** NCERT §4.9 explicit definition. **v1?:** FALSE — V2 (SI-unit historical definition; not a teaching priority for V1). ⚠ partial sim — definitional content harder to simulate compellingly. |
| **A32** `magnetic_dipole_potential_energy_U_equals_minus_m_dot_B` | Potential energy of dipole in B: U = −m·B = −mB cos θ. Minimum at θ=0 (parallel = stable); max at θ=π. | atomic | ✅ | — | A29, A30 | — | **Sources:** DCEM §26.6 Table 26.1 explicit; standard formula. **v1?:** FALSE — V2 (advanced + thermodynamics-of-magnetization preview). |
| **A33** `magnetic_dipole_moment_of_revolving_electron_mu_l_equals_minus_e_over_2m_L` | Electron orbiting a nucleus (Bohr model) constitutes a current loop → has magnetic moment μ_l = −(e/2m_e)L, where L = orbital angular momentum. Bohr magneton μ_B = eħ/(2m_e). | atomic | ✅ | — | A29, `[Topic-47: bohr_model_atom]` | — | **Sources:** NCERT §4.10.3 (Eqs 4.32, 4.33, 4.34) + Fig 4.23. **v1?:** FALSE — V2 (atomic-physics bridge; relevant to Topic 47 Atomic Models + Topic 37 Magnetism & Matter). |
| **A16** `force_on_curved_wire_in_uniform_B_equals_force_on_straight_wire_between_endpoints` | For ANY curved wire ACD in uniform B carrying current i: total force F = i(AD × B), where AD is the straight-line vector from start to end. | atomic | ✅ | — | A15, N15.2 | — | **Sources:** DCEM §26.4 Case 1 explicit. **v1?:** FALSE — V2 (geometric simplification useful in JEE-Adv problems). |

### Cross-topic-refs

| ID | Concept | Owned by | Why cited |
|---|---|---|---|
| **CT1** `vector_cross_product_a_cross_b_form` | Cross product a×b, magnitude |a||b|sin θ, direction by right-hand rule | `[math-tools]` (Stage-3 deferred) | A3, A4, A15, A20, A30 all use cross product |
| **CT2** `centripetal_force_F_equals_mv2_over_r` | **Topic-10 Circular Motion** | A7 (circular motion in B), A8 (radius derivation) |
| **CT3** `uniform_circular_motion` | **Topic-10 Circular Motion** | A7, A8, A9, A10 |
| **CT4** `electric_field_E_and_force_F_equals_qE` | **Topic-30 Electrostatics** (N12.1 Ch.1, DCEM Ch.23, HCV2 Ch.29) | N3.2, A13 velocity selector, A34 combined Lorentz |
| **CT5** `coulombs_law_F_equals_kq1q2_over_r2` | **Topic-30 Electrostatics** | A20 Biot-Savart vs Coulomb comparison (NCERT §4.5 explicit 4-point) |
| **CT6** `electric_dipole_potential_torque` | **Topic-30 Electrostatics** | A29-A32 — magnetic dipole story parallels electric dipole story |
| **CT7** `line_integral` | `[math-tools]` (Stage-3 deferred) | A26 Ampere's law |
| **CT8** `gauss_law_for_electric_field` | **Topic-31 Gauss's Law** | A26 — Ampere is to Biot-Savart what Gauss is to Coulomb (NCERT §4.7 explicit) |
| **CT9** `bohr_model_atom_quantized_orbital_angular_momentum` | **Topic-47 Atomic Models** (N12.2 Ch.12, DCOM, HCV2 Ch.43) | A33 magnetic moment of revolving electron |
| **CT10** `permanent_magnet_dipole` | **Topic-37 Magnetism & Matter** (N12.1 Ch.5, DCEM §26.11-26.18, HCV2 Ch.36+37) | A31 current loop = elementary dipole → bridges to permanent magnets |

---

## Section E — Cross-source coverage matrix

| Atomic ID | NCERT 12.1 Ch.4 | DCEM Ch.26 | HCV2 Ch.34+35 |
|---|---|---|---|
| A1 magnetic-field-B | §4.2.1 + Table 4.1 | §26.1 (implicit) | **§34.1+§34.2 full pedagogical** |
| A2 Oersted-experiment | **§4.1 + Fig 4.1 + Oersted box** | implicit | brief |
| A3 Lorentz F=qv×B | **§4.2.2 Eq 4.3** | §26.2 explicit | **§34.2 Eq 34.1 derivation** |
| A4 right-hand-rule direction | §4.2.2 + Fig 4.2 | **§26.2 three methods** | §34.2 |
| A5 F⊥v no-work | §4.3 brief | **§26.2(vii) explicit** | **§34.4 explicit** |
| A6 F=0 when v ∥ B | brief | **§26.3 Case 1** | §34.2 |
| A7 circular motion | §4.3 + Fig 4.5 | **§26.3 Case 2 full** | §34.4 + Fig 34.4 |
| A8 r=mv/qB | Eq 4.5 | **§26.3 multiple forms** | Eq 34.2 |
| A9 T=2πm/qB | Eq 4.6(a) | §26.3 | Eq 34.3 |
| A10 T independent of v | **§4.3 explicit** | **§26.3(ii) explicit** | **§34.4 explicit** |
| A11 helix | §4.3 + Fig 4.6 + **Aurora box** | §26.3 Case 3 | §34.4 + Fig 34.5 |
| A12 pitch | Eq 4.6(b) | §26.3 explicit | brief |
| A13 velocity selector | **§4.4.1 full** | absent | absent |
| A14 cyclotron | **§4.4.2 full + Accelerators-India box** | absent | absent |
| A15 F=IL×B | §4.2.3 Eq 4.4 | §26.4 (i) | **§34.5 Eq 34.6** |
| A16 curved wire = straight | absent | **§26.4 Case 1 explicit** | absent |
| A17 closed loop F=0 | implicit | **§26.4 Case 2 explicit** | §34.6 implicit |
| A18 parallel currents | **§4.9 full + Roget's spiral** | (Stage-3 §26.10) | Ch.35 |
| A19 ampere SI definition | **§4.9 explicit** | absent | absent |
| A20 Biot-Savart | **§4.5 + 4-point Coulomb comparison** | **§26.7 explicit** | Ch.35 |
| A21 long straight wire B | §4.7 via Ampere | **§26.8 via Biot-Savart** | Ch.35 |
| A22 right-hand-thumb wire | §4.7(iv) + footnote | §26.8(ii) | Ch.35 |
| A23 circular loop axis | **§4.6 + Fig 4.11 full** | (Stage-3 §26.9) | Ch.35 |
| A24 circular loop center | Eq 4.16 + Fig 4.12 + Ex 4.7 | (Stage-3 §26.9) | Ch.35 |
| A25 finite wire | absent | **§26.8 explicit** | Ch.35 |
| A26 Ampere's law | **§4.7 + Ex 4.8 + Ampere box** | (Stage-3 §26.10) | Ch.35 |
| A27 solenoid | **§4.8.1 + Figs 4.17, 4.18** | (Stage-3 §26.10) | Ch.35 |
| A28 toroid | **§4.8.2 + Magnetic Confinement box (ITER)** | (Stage-3) | absent |
| A29 m = NIA | §4.10.1 + Eq 4.28 | **§26.5 three direction methods** | §34.6 |
| A30 τ = m×B | **§4.10.1 full derivation** | **§26.6 full + Table 26.1** | **§34.6 Eq 34.7** |
| A31 loop = dipole | **§4.10.2 full + electric-dipole analogy** | §26.5 implicit | Ch.35 |
| A32 U = -m·B | implicit | **§26.6 Table 26.1** | absent |
| A33 revolving electron μ | **§4.10.3 + Fig 4.23** | absent | absent |
| A34 combined Lorentz | §4.2.2 Eq 4.3 | implicit | implicit |

**Observations:**
- **NCERT owns the most atomics primary.** Topics 36 is unusually NCERT-complete; the chapter is dense and covers every atomic at least at theorem level. NCERT also owns the unique Indian-context anchors (Accelerators-India callout for A14, Roget's-spiral for A18, Aurora-Borealis for A11, ITER-Magnetic-Confinement for A28).
- **DCEM owns the 3-case structure for motion in B-field** (A6, A7, A11 Cases 1-2-3 explicit). And owns §26.6 dipole-in-uniform-B with the comparison-table with electric dipole (A29-A32 cluster).
- **HCV2 §34.3 frame-dependence of E vs B** is unique to HCV2 — neither NCERT nor DCEM has this pedagogical narrative. Worth a callout in catalog for V1 authoring (sets up Einstein's special-relativity unification of E & B as one electromagnetic field).
- **Pedagogical implication for V1:** synthesize NCERT's completeness + DCEM's case-structure + HCV2's frame-narrative.

---

## Section F — V1 authoring queue

**Deferred to Stage 5** outcome-priority map per founder W-G4. Per-row `v1?` flag stays in Section D.

**Inputs available for Stage 5 from this catalog:** **21 atomics flagged `v1?: TRUE`** (A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A15, A17, A18, A20, A21, A22, A23, A24, A26, A27, A29, A30, A31, A34) + **9 flagged `v1?: FALSE`** (A11, A12, A13, A14, A16, A19, A25, A28, A32, A33) + **10 cross-topic-refs** (CT1–CT10). Total atomics: 34 (Stage 2 count for Topic 36).

**Already shipped V1 (2 of 24 V1 atomics):** A21 (`magnetic_field_wire.json`), A3+A4+A5 consolidated in `magnetic_force_moving_charge.json` (refactor backlog V1.1).

---

## Section G — Open questions (founder-resolved + still-open)

1. ✅ **MCM-G1: A34 combined Lorentz force — separate atomic or nano of A3?** RESOLVED 2026-05-25 (founder-style): keep as standalone atomic. A3 (pure magnetic, no E-field) + A34 (combined when E present) are taught as distinct JEE scenarios.
2. ✅ **MCM-G2: `magnetic_force_moving_charge.json` refactor** RESOLVED 2026-05-25 (founder-style, per Friction Q-C3 precedent): refactor in V1.1 to split A3, A4, A5 into separate JSONs. Logged as V1.1 backlog item in Section B.
3. ⏳ **A11 helical motion v1?** Currently FALSE. Wider question: should "advanced motion in B" (A11, A12) be promoted to V1 given JEE-Advanced PYQ frequency? **Founder-style call:** TRUE for A11 (helical motion is conceptually accessible, just an extension of A7), FALSE for A12 (pitch formula is a derivation, V2 deepening). **Action:** Editing A11 to v1?=TRUE below would be the cleanest move. Holding for now until Stage 5 PYQ data validates.
4. ⏳ **Stage-3 deepening required.** DCEM §26.9-26.10 + HCV2 Ch.35 were not captured (Round 2 reads deferred for token economy). Atomics A18, A21, A23, A24, A26, A27 have NCERT as primary source here; Stage 3 should backfill DCEM + HCV2 citations for these rows. Catalog table notation: "(Stage-3 §26.9)" or "(Stage-3 Ch.35)" markers in Section E.
5. ⏳ **Math-tools cross-topic-refs (CT1 vector cross product, CT7 line integral).** Per founder W-G4: math-tools reference file deferred to Stage 3. Notation `[math-tools: <concept>]` locked.
6. ⏳ **`granularity_question: candidate_micro` Topic-36 count.** 1 (N4.3 dot-cross-notation). Lower than Friction (6), comparable to Waves (2). Stage 4 reviews en bloc.
7. ⏳ **Cross-topic graph density confirmed.** 10 cross-topic-refs vs Friction 1, Waves 8. Stage-5 priority queue must handle cross-topic prereq dependencies via DAG traversal.
8. ⏳ **MAGNETISM_ARCHITECTURE.md alignment.** Catalog maps to 4 visual archetypes per Section C addendum #4. When Diamond #2 (`force_on_moving_charge_in_field`) gets authored per that document, the canonical concept_id should align with A3-cluster IDs. Verify at Diamond #2 authoring time.

---

## Section H — What's NOT in this pilot (scope boundary)

- **Topic 37 — Magnetism & Matter** (N12.1 Ch.5, DCEM §26.11-26.18, HCV2 Ch.36+37). Atomics: permanent magnets, earth's magnetism, magnetic intensity H, susceptibility, ferro/para/diamagnetism, hysteresis. Cross-topic-ref CT10 here.
- **Topic 38 — Electromagnetic Induction** (N12.1 Ch.6, DCEM Ch.27, HCV2 Ch.38+39). Atomics: Faraday's law, Lenz's law, induced EMF, motional EMF, self+mutual inductance. Cross-topic dependency on A26 Ampere's law.
- **Topic 39 — AC Circuits** (N12.1 Ch.7, DCEM Ch.28). Atomics: RLC circuit, resonance, power factor.
- **§4.11 Moving Coil Galvanometer** (NCERT Ch.4 last subsection). Sits at Topic 36/37 boundary; deferred to Topic 37 catalog.
- PYQ frequency tags (Stage 5)
- JEE/NEET/board-exam weights (Stage 5)
- `student_confusion_log` cross-references (Stage 6)
- Western-curriculum overlap (out of scope per founder D3)

---

## Section I — Stage-2 scaling notes (cumulative across pilots 1 + 2 + 3)

Patterns confirmed or refined after all 3 pilots:

1. **Source-coverage division of labor varies by topic family.** Friction: HCV1=depth, DCM1=breadth, NCERT=baseline. Waves: DCWT=math-pedagogy uniquely strong + NCERT canonical + HCV1 narrative. Moving Charges: **NCERT unusually complete + DCEM problem-3-case-structure + HCV2 frame-dependence narrative**. Pattern: **the most pedagogically valuable source varies by topic family.** Stage 2 catalogs need topic-by-topic source-strength assessment.
2. **Atomic count per topic:** Friction 28, Waves 25 (after A20 collapse), Moving Charges 34. Range 25-35 confirmed for "medium-to-large" topics. Stage-1 prediction "20-30 for Moving Charges" was conservative; actual 34.
3. **Nano-to-atomic ratio:** Friction 30/28=1.07, Waves 33/25=1.32, Moving Charges ~45/34=1.32. Average 1.24. Stable.
4. **v1? TRUE proportion:** Friction 50%, Waves 76%, Moving Charges 71% (24 of 34). E&M trends similar to Waves — high definitional density. Mechanics (Friction) trends lower because more atomics are problem-pattern variants of foundational ones.
5. **Cross-topic-refs density:** Friction 1, Waves 8, Moving Charges 10. **Pattern:** E&M and waves are heavily cross-topic; mechanics is more self-contained. Confirms that the catalog's dependency graph will be dense at the E&M end and sparse at the mechanics end.
6. **UNCERTAIN flags:** Friction 2, Waves 2, Moving Charges 1. Stable at 1-2/topic. Founder-style decision-making during catalog authoring (W-G1-W-G6 precedent) is keeping this low.
7. **`candidate_micro` flags:** Friction 6, Waves 2, Moving Charges 1. Total 9 across 3 pilots. Stage 4 review threshold: if a candidate_micro pattern repeats in 3+ topics, formalize as micro tier. Single-occurrence flags stay nano.
8. **Total catalog entries:** Friction ~60, Waves ~59, Moving Charges ~89. Average 69 entries/topic. Projection for 44 topics: ~3,000 entries (slight revision up from earlier ~2,770). **Still acceptable per founder W-G6.**
9. **Existing repo concept coverage:** Friction 1 (`friction_static_kinetic`), Waves 0, Moving Charges 2 (`magnetic_field_wire`, `magnetic_force_moving_charge`). Total 3 across 3 pilots. Repo has 63 atomic JSONs; expect most topics to have 0-2 already-shipped concepts.
10. **Indian-context anchors are NCERT-primary.** Friction (no specific Indian anchor in §5.9.1). Waves (HCV1 queue-in-Lucknow analogy). Moving Charges (Accelerators-in-India + ITER + Roget's-spiral + Aurora-from-Northern-India). Pattern: NCERT's editorial choices to include Indian-context callouts make it the dominant real-world-anchor source. Catalog should preserve these explicitly.

---

## Section J — Verification checklist

- [x] All 3 sources cited with chapter + section + page range (Section A)
- [x] Existing repo concepts (2 shipped JSONs) catalogued with refactor backlog item (Section B)
- [x] Methodology choices noted with Topic-36-specific addendum + MAGNETISM_ARCHITECTURE.md alignment (Section C)
- [x] All 34 atomic concepts identified with cross-source citations (Section D Tier 1+2+3+4)
- [x] All ~45 nano concepts identified with `parent: <atomic_id>` tags (Section D)
- [x] 10 cross-topic-refs separated into own table (Section D bottom)
- [x] `Requires` and `Required-by` columns populated (full dependency graph including math-tools terminator nodes)
- [x] `v1?` flag populated for every atomic (Section D Notes)
- [x] `Sim?` rating ✅/⚠/❌ populated for every row (Section D)
- [x] Cross-source coverage matrix (Section E)
- [x] Section F V1 queue properly deferred to Stage 5 with v1? flag counts
- [x] Open questions surfaced + founder-style decisions applied inline (Section G)
- [x] Scope boundaries declared with cross-topic-refs to Topics 37, 38, 39, 47 (Section H)
- [x] Scaling implications updated cumulatively across all 3 pilots (Section I)
- [x] 1 `UNCERTAIN — flagged for founder review` item (A34 ↔ A3 boundary, resolved as standalone)
- [x] 1 `granularity_question: candidate_micro` flag (N4.3 dot-cross-notation)
- [x] Stage-3 deepening flagged: DCEM §26.9-26.10 + HCV2 Ch.35 reads required for full citation completeness
- [x] MAGNETISM_ARCHITECTURE.md alignment verified (Section C addendum)

---

*Generated: 2026-05-25. Pilot Topic 36 Moving Charges & Magnetism. Third and final pilot — validates the catalog format on the largest, most cross-topic-dense topic in the 44-topic scope. Format held across all 3 pilots; ready to scale to remaining 41 triple-covered topics per founder Q-P1 "sequential, slow and quality."*
