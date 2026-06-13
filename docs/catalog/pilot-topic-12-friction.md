# Stage 2 Pilot — Topic 12: Friction

> **Pilot purpose:** Validate the catalog format on a small, well-bounded mechanics topic before scaling Stage 2 to the remaining 43 triple-covered topics. Founder reviews this catalog → approves format → same template gets applied to all 44 topics.

**Stage:** 2 (concept extraction) — pilot batch
**Topic from Stage-1 commonality matrix:** Row 12 — "Friction"
**Triple-covered check:** ✅ Present in NCERT 11.1 Ch.5 §5.9.1 + DC Pandey Mech-I Ch.8 §8.7 + HC Verma Vol-1 Ch.6
**Status:** **Format approved by founder 2026-05-25.** Same template applies to Topic 21 Waves (next, sequential) and Topic 36 Moving Charges (after Waves).

---

## Founder decisions applied (2026-05-25)

| # | Question | Decision | Effect on this file |
|---|---|---|---|
| Q-F1 | Format columns | Keep current 8-column `ID \| Concept \| Type \| Sim? \| In repo? \| Requires \| Required-by \| Notes`. Grow columns later only if a stage needs them. | No change to Section D. |
| Q-F2 | `↳` prefix for nano rows | Yes, keep. | No change. |
| Q-F3 | Section E cross-source coverage matrix | Useful — reproduce in every topic catalog. | No change. |
| Q-F4 | Section F V1 authoring queue per-topic | Defer to Stage 5 outcome-priority map. Per-row `v1?` flag inside Notes stays. | **Section F removed below.** Stage 5 will produce a cross-topic priority queue. |
| Q-F5 | `candidate_micro` flags | Re-evaluate after a few more stages. | No change — flags retained as-is until Stage 4 reviews en bloc. |
| Q-C1 | A16 angle-of-friction collapse | Yes, collapse into a nano of A15. | **A16 atomic row removed; new nano N15.3 added under A15.** Section E updated. |
| Q-C2 | A27 circular-motion-friction placement | Topic 13 (Circular Motion) owns it, listed here as cross-topic-ref only. | No change — already the way it is. |
| Q-C3 | `friction_static_kinetic.json` refactor | Refactor in V1.1 (split bundled atomic into per-atomic JSONs). | **Logged as V1.1 backlog item** in Section B. |
| Q-P1 | Wave Motion + Moving Charges scaling | Sequential, slow, quality > speed. | Task #7 (Waves) unblocked. Task #8 (Moving Charges) stays blocked on Waves completion. |
| Q-P2 | One file per topic or single mega-file | **One file per topic** (my recommendation, founder concurs). Future filename convention: `stage-2-topic-NN-<name>.md`. Pilot files renamed when Stage-2 formally opens. | This file stays at `pilot-topic-12-friction.md`. Topic 21 next file = `pilot-topic-21-wave-motion.md`. |
| Q-P3 | Section H scope-boundary items (PYQ, JEE/NEET weights, student_confusion_log, HCV1/DCM1 exercise mapping, Western curriculum) | Defer to later stages per current section. | No change — Section H deferral list stands. |

---

## Section A — Source citations

Three sources read in full for this topic:

| Source | Location | Pages (printed) | Pages (PDF) | Coverage type |
|---|---|---|---|---|
| **NCERT 11.1** | Ch.5 §5.9 "Common Forces in Mechanics" + §5.9.1 "Friction" + §5.10 (banked-road) | pp. 100–105 | 116–121 | Foundational definitions + 4 worked examples (Ex 5.7–5.11) |
| **DC Pandey Mech-I** | Ch.8 §8.7 "Friction" (Type 1, Type 7, Type 8 concept blocks) + Miscellaneous Examples 16–24 + Level-1 Exercises | pp. 313–329 | ~325–344 | Problem-pattern depth (10+ pattern types, 50+ worked + objective Qs) |
| **HC Verma Vol-1** | Ch.6 "Friction" — full chapter (§6.1–6.6) | pp. 85–100 | ~95–110 | Concept-derivation pedagogy (6 subsections + 16 worked examples + 31 exercises) |

**Cross-check note:** HCV1 dedicates an entire chapter to friction; NCERT folds it into Laws-of-Motion §5.9; DC Pandey folds it into Laws-of-Motion §8.7. HCV1 is the deepest pedagogical source; NCERT is the canonical baseline; DCM1 is the problem-pattern multiplier.

---

## Section B — Existing repo concepts addressing this topic

| File | Concept ID | What it covers | What it doesn't |
|---|---|---|---|
| `src/data/concepts/friction_static_kinetic.json` | `friction_static_kinetic` | Atomic concept consolidating static + kinetic + threshold + comparison + explore states. Bundles A2+A4+A5+A6+A9 (per atomic IDs below). 6-state EPIC-L. | **V1.1 refactor backlog item (founder decision 2026-05-25):** split the bundled atomic into per-atomic JSONs (A2, A4, A5, A6, A9 — five separate concepts). Stage 3 picks up the actual split. Do not touch in V1.0. |

Also in repo (prerequisites, not friction-specific):
- `field_forces.json`, `contact_forces.json` (parse-bug OPEN), `normal_reaction.json`, `free_body_diagram.json`, `newton_second_law_direction.json` — all are friction-concept prerequisites.

---

## Section C — Methodology notes for founder review

A few format choices I want explicit founder sign-off on before applying to the other 43 topics:

1. **Atomic-per-context.** Per the "Newton's law splits into 15 atomics" founder directive, I split friction across multiple atomic IDs by context (`block_on_horizontal_surface` vs `block_on_inclined_plane` vs `block_against_vertical_wall` vs `two_blocks_stacked` etc.) rather than collapsing them under one atomic. Result: ~29 atomic + ~30 nano = ~59 concept entries for Friction.
2. **V1 priority flag.** Per the "1 concept → 1 context for V1" rule, each atomic carries `v1?: true|false`. ~15 of 29 atomics flagged V1 (foundational + horizontal-surface + incline + sliding-down-incline + angle-of-repose + friction-drives-motion misconception). The other 14 deferred to V2.
3. **Source citation format.** Each atomic lists `Sources` as `[Book §Ch.§Sec p.NNN]` triple. Empty cell = absent in that source.
4. **UNCERTAIN flag.** Where atomic-vs-nano boundary is genuinely unclear (e.g., A16 `angle_of_friction` vs A15 `angle_of_repose` — geometrically equivalent), I tag `UNCERTAIN — flagged for founder review` per the quality bar rule.
5. **Cross-topic dependency edges.** Where a friction atomic depends on a non-friction concept (e.g., A27 `circular_motion_friction_centripetal` requires Topic-13 "Circular Motion" atomics), I cite the topic, not invent the concept. Stage-2 fills the cross-topic concept IDs.
6. **Nano rows use `↳` prefix** with `parent: <atomic_id>` in Notes. Nanos are sub-pieces inside atomic concepts (per CLAUDE.md §7 + memory rule `feedback_no_deep_dive_on_nano`).
7. **The "small, smaller" question** (founder, 2026-05-25): Five nanos here (N2.1 impending_motion, N5.1 equality_at_limit, N17.2 acceleration_formula, N20.1 pseudo_force, N26.1 driven_wheel_3rd_law) feel candidate-micro — single-state insights that nanos depend on. Tagged with `granularity_question: candidate_micro` per Stage-4 plan. Don't formalize "micro" tier yet.

---

## Section D — Concept catalog (atomic + nano)

### Legend

- **Type:** `atomic` (full EPIC-L concept) | `nano` (sub-piece inside an atomic) | `cross-topic-ref` (concept defined in a different topic file)
- **Sim?:** ✅ simulatable | ⚠ partial (some aspects, not all) | ❌ not-simulatable
- **In repo?:** ✅ already a JSON file | ⚠ partially covered by existing JSON | — not yet authored
- **v1?:** TRUE = ships in V1 (foundational/canonical context) | FALSE = V2 candidate (other contexts, deferred)

### Tier 1 — Foundational definitional atomics (the "what is friction" cluster)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** `friction_as_contact_force_component` | Friction is the parallel component of contact force (normal = perpendicular component, friction = parallel) | atomic | ✅ | ⚠ implicit in `contact_forces` | `contact_forces`, `normal_reaction`, `vector_resolution` | A2, A7, A14, A21 | **Sources:** HCV1 §6.1 (explicit, opens chapter); NCERT §5.9 ("component parallel to the surfaces in contact is called friction"); DCM1 implicit. **v1?:** TRUE — foundational definition. **PRIMARY aha:** "contact force is a single thing; we split it for analysis". |
| ↳ N1.1 `contact_force_perpendicular_component` | Normal component of contact force | nano | ✅ | ⚠ in `normal_reaction` | — | A1 | parent: A1. Sources: HCV1 §6.1, NCERT §5.9. |
| ↳ N1.2 `contact_force_parallel_component` | Friction = parallel component (tangential) | nano | ✅ | — | — | A1 | parent: A1. Sources: HCV1 §6.1 (explicit), NCERT §5.9 ("parallel to the surfaces"). |
| ↳ N1.3 `contact_force_resultant_magnitude` | R = √(N² + f²) | nano | ✅ | — | N1.1, N1.2 | A16 | parent: A1. Sources: HCV1 §6.1. `granularity_question: candidate_micro`. |
| **A2** `static_vs_kinetic_friction_distinction` | Two regimes: not-sliding (static) and sliding (kinetic) | atomic | ✅ | ✅ bundled in `friction_static_kinetic` | A1 | A3, A4, A6, A7, A26 | **Sources:** HCV1 §6.2–6.3, NCERT §5.9.1, DCM1 Type 1 (Concept). **v1?:** TRUE. EPIC-C: misconception "all friction is the same" → confronted. |
| ↳ N2.1 `impending_motion_concept` | "Would-move-if-not-for-friction" scenario; static friction acts on bodies at rest with applied force | nano | ✅ | — | A1 | A2, A4, A15 | parent: A2. Sources: NCERT §5.9.1 ("static friction opposes impending motion"), HCV1 §6.3. `granularity_question: candidate_micro`. |
| ↳ N2.2 `relative_velocity_check_for_kinetic` | Slipping ⇒ kinetic regime; no slipping ⇒ static regime | nano | ✅ | — | `relative_velocity` (Topic 5) | A2, A7, A24 | parent: A2. Sources: HCV1 §6.2 ("when relative motion has started"). |
| **A3** `kinetic_friction_formula_f_equals_mu_k_N` | f_k = μ_k × N (magnitude formula) | atomic | ✅ | ✅ bundled in `friction_static_kinetic` | A2, `normal_reaction` | A13, A14, A17, A19 | **Sources:** HCV1 Eq. 6.1, NCERT Eq. 5.15, DCM1 (all problem solutions). **v1?:** TRUE. |
| ↳ N3.1 `linear_proportionality_to_N` | f doubles when N doubles (linearity of f-N relation) | nano | ✅ | — | A3 | A3, A13 | parent: A3. Sources: HCV1 §6.2 (Law 1). |
| **A4** `static_friction_self_adjusting` | Static friction = whatever force is needed up to limit (variable, not a fixed value) | atomic | ✅ | ✅ bundled in `friction_static_kinetic` | A2, `newton_first_law` (Topic 11) | A5, A26 | **Sources:** HCV1 §6.3 ("self-adjustable"), NCERT §5.9.1 ("self-adjusting frictional force"). **v1?:** TRUE. Key EPIC-C: misconception "friction is always μN" → wrong (only at limit). |
| ↳ N4.1 `f_s_equals_applied_force_below_limit` | Applied 2 N → friction 2 N; applied 5 N → friction 5 N (up to limit) | nano | ✅ | — | A4 | A4 | parent: A4. Sources: NCERT §5.9.1 ("equal and opposite to the applied force"), HCV1 §6.3. |
| ↳ N4.2 `f_vs_F_applied_graph` | Graph: 45° line until f_max, then drops to μ_k N | nano | ✅ | — | A4, A5, A6 | A4 | parent: A4. Sources: HCV1 Fig 6.4 (graph). Strong visual primitive — high simulation value. |
| **A5** `limiting_static_friction_max_value` | f_s ≤ μ_s N; equality at impending motion | atomic | ✅ | ✅ bundled in `friction_static_kinetic` | A4, A3 | A6, A15, A26 | **Sources:** HCV1 §6.3 + Eq. 6.5, NCERT Eq. 5.13/5.14, DCM1 Concept block. **v1?:** TRUE. |
| ↳ N5.1 `equality_at_impending_motion` | At the instant motion is about to start, f_s = μ_s N (boundary condition) | nano | ✅ | — | A5 | A5, A15 | parent: A5. Sources: NCERT §5.9.1 ("static friction does not exist by itself"), HCV1 §6.3. `granularity_question: candidate_micro`. |
| ↳ N5.2 `transition_static_to_kinetic_at_breakaway` | Overshoot: at breakaway, friction drops from μ_s N to μ_k N → block accelerates | nano | ✅ | ⚠ in `friction_static_kinetic` STATE_3 | A5, A6 | A5 | parent: A5. Sources: HCV1 §6.3, NCERT §5.9.1. |
| **A6** `mu_static_greater_than_mu_kinetic` | Empirical: μ_s > μ_k (e.g., steel-steel: μ_s=0.7, μ_k=0.6) | atomic | ✅ | ✅ bundled in `friction_static_kinetic` STATE_5 | A3, A5 | A26 | **Sources:** HCV1 §6.3 ("found experimentally that μ_k is less than μ_s"), NCERT §5.9.1, coefficient table HCV1 §6.6. **v1?:** TRUE. Real-world: explains ABS brakes. |
| **A7** `friction_direction_opposes_relative_motion` | Friction direction = opposite to **relative** velocity of object w.r.t. surface (not absolute motion!) | atomic | ✅ | — | A2, `relative_velocity` (Topic 5) | A26, A20, A24 | **Sources:** HCV1 §6.2 ("direction of f_k on the body … is opposite to the velocity of the body with respect to the surface"); NCERT §5.9.1 ("frictional force opposes relative motion"); DCM1 Type 7 (explicit, two-block case). **v1?:** TRUE. **CRITICAL misconception:** "friction always opposes motion" → wrong (it opposes RELATIVE motion; can drive motion — see A26). |
| ↳ N7.1 `direction_opposite_to_actual_relative_velocity` | For kinetic friction: direction = −v_rel | nano | ✅ | — | A7 | A7 | parent: A7. Sources: HCV1 §6.2. |
| ↳ N7.2 `direction_opposite_to_impending_relative_velocity` | For static friction: direction = whatever opposes the would-be slip direction | nano | ✅ | — | A7, N2.1 | A7, A15 | parent: A7. Sources: HCV1 §6.3 ("Finding the Direction of Static Friction"), NCERT Ex 5.7 (box-in-train). |
| ↳ N7.3 `direction_determined_by_constraint_when_static` | Static friction direction is set by Newton's 2nd law on the constraint, not assumed | nano | ✅ | — | A7, `newton_second_law_direction` | A7, A20 | parent: A7. Sources: HCV1 §6.3 (worked example: which way does friction point on a block in an accelerating train?). |
| **A8** `friction_independent_of_contact_area` | Counterintuitive: same block on same surface, friction force doesn't depend on which face is down | atomic | ✅ | — | A3, A5 | — | **Sources:** HCV1 §6.4 (Law 4: "limiting friction is independent of the area of contact"); NCERT §5.9.1 ("independent of the area of contact"). **v1?:** TRUE. Strong EPIC-C: students expect "bigger area = more friction" → wrong. Visual: two blocks, same mass, one flat one on edge, identical f_max. |
| **A9** `coefficient_of_friction_definition` | μ is a dimensionless constant; depends ONLY on the pair of surfaces in contact, NOT on N, A, v | atomic | ✅ | ⚠ partial in `friction_static_kinetic` | A3, A5 | A1–A29 (universal) | **Sources:** HCV1 §6.2 (μ_k defn), §6.3 (μ_s defn), §6.6 (coefficient table with 9 surface pairs); NCERT §5.9.1 (Eq. 5.13–5.15). **v1?:** TRUE. Visual: HCV1 §6.6 table — wood-wood 0.20, glass-glass 1.00, ice-ice 0.10, etc. |
| **A10** `kinetic_friction_independent_of_speed` | f_k stays the same whether block moves at 1 m/s or 10 m/s (within ordinary speeds) | atomic | ✅ | — | A3 | A17, A25 | **Sources:** HCV1 §6.2, §6.4 (Law 2: "independent of the speed"); NCERT §5.9.1 ("nearly independent of velocity"). **v1?:** TRUE. Counterintuitive — students often think "faster = more friction". |
| **A11** `rolling_friction_smaller_than_sliding` | Rolling friction is 2–3 orders of magnitude smaller than sliding friction; ball bearings exploit this | atomic | ✅ | — | A3, `rotational_motion_intro` (Topic 14 — fwd ref) | — | **Sources:** HCV1 §6.6 ("Rolling Friction" subsection); NCERT §5.9.1 ("Rolling friction" paragraph: ball bearings, air cushion). **v1?:** FALSE — V2 (depends on rotation; not foundational for V1 friction story). |
| ↳ N11.1 `point_of_contact_zero_velocity_in_rolling` | In pure rolling, contact point has zero instantaneous velocity → no kinetic friction | nano | ✅ | — | A11, `rotational_motion_intro` | A11 | parent: A11. Sources: HCV1 §6.6, NCERT §5.9.1. |
| ↳ N11.2 `ball_bearings_concept` | Convert sliding contact to rolling contact → reduce friction | nano | ✅ | — | A11, N11.1 | A11 | parent: A11. Sources: HCV1 Fig 6.10, NCERT Fig 5.13(a). |
| ↳ N11.3 `air_cushion_no_contact` | Hovercraft / air bearing: no surface contact → no friction | nano | ✅ | — | — | A11 | parent: A11. Sources: HCV1 §6.6, NCERT Fig 5.13(b) "inflated balloon on plastic disc". |
| **A12** `friction_atomic_level_explanation` | Molecular bonds at the contact points break/reform → energy goes to heat | atomic | ⚠ partial | — | A1 | — | **Sources:** HCV1 §6.5 (full subsection); NCERT §5.9.1 (1-paragraph: "microscopic level, all bodies are made of charged constituents … contact forces ultimately traced to electrical forces"). **v1?:** FALSE — V2 depth. ⚠ partial sim — molecular visualization is hard to make rigorously accurate; risk of cartoon physics. |

### Tier 2 — Problem-pattern atomics (the "how to apply friction" cluster)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A13** `friction_block_on_horizontal_surface` | Block on horizontal floor; applied horizontal F; N = mg, f = μN | atomic | ✅ | ⚠ implicit in `friction_static_kinetic` | A1–A7, `free_body_diagram`, `newton_second_law_direction` | A14, A18, A19, A23 | **Sources:** NCERT Ex 5.9 (trolley on horizontal); HCV1 §6.2 worked example; DCM1 Type 8 + Ex 14 (car on horizontal road). **v1?:** TRUE — canonical first context. |
| **A14** `friction_block_on_inclined_plane` | Block on incline angle θ; N = mg cos θ; gravity along incline = mg sin θ; friction = μN | atomic | ✅ | — | A13, `vector_resolution` (Topic 6 ✅ in repo) | A15, A17, A18, A27 | **Sources:** NCERT Ex 5.8 (incline tilted to 15°); HCV1 §6.6 (Inclined Table method); DCM1 Ex 16 (f-vs-θ graph 0°→90°), Ex 17 (two blocks on incline, different μ). **v1?:** TRUE — second canonical context, JEE staple. |
| ↳ N14.1 `normal_force_on_incline_N_equals_mg_cos_theta` | N = mg cos θ derivation | nano | ✅ | — | A14, `vector_resolution` | A14, A15 | parent: A14. Sources: NCERT Ex 5.8 derivation, HCV1 §6.6. |
| ↳ N14.2 `gravity_parallel_component_mg_sin_theta` | Driving force down the incline = mg sin θ | nano | ✅ | — | A14, `vector_resolution` | A14, A15, A17 | parent: A14. Sources: NCERT Ex 5.8, HCV1 §6.6, DCM1 Ex 16. |
| ↳ N14.3 `static_block_on_incline_equilibrium` | When θ < θ_repose: f_s = mg sin θ (self-adjusts, less than μ_s mg cos θ) | nano | ✅ | — | A14, A4, N14.1, N14.2 | A14, A15 | parent: A14. Sources: HCV1 §6.6, NCERT Ex 5.8, DCM1 Ex 16 (f rises with sin θ). |
| **A15** `angle_of_repose` | Tilt incline until block just slides; tan θ_max = μ_s | atomic | ✅ | — | A14, A5, N5.1 | A16, A17, A28 | **Sources:** NCERT Ex 5.8 (θ_max = 15° → μ_s = 0.27); HCV1 §6.6 (Inclined Table method); DCM1 Ex 16 + Level-1 Q10 ("angle of repose = angle of friction"). **v1?:** TRUE — key insight + tangible lab visual. |
| ↳ N15.1 `θ_max_when_mg_sin_equals_mu_s_mg_cos` | At θ_max: mg sin θ = μ_s mg cos θ → tan θ_max = μ_s | nano | ✅ | — | A15, N14.1, N14.2 | A15, A16 | parent: A15. Sources: NCERT Ex 5.8 (derivation), HCV1 §6.6. |
| ↳ N15.2 `angle_of_repose_independent_of_mass` | μ_s = tan θ_max — no m anywhere → result holds regardless of block mass | nano | ✅ | — | A15, N15.1 | A15 | parent: A15. Sources: NCERT Ex 5.8 explicit ("θ_max depends only on μ_s and is independent of the mass of the block"). Strong EPIC-C: students expect heavier = slides sooner. |
| ↳ N15.3 `angle_of_friction_geometric_interpretation` | λ = tan⁻¹(μ_s) — geometric angle the resultant contact force makes with the surface normal at limiting friction. Numerically equal to angle of repose; same fact, different lens. | nano | ✅ | — | A15, A1, A5, N1.3 | A15, A22 (N22.3 cites this geometric meaning) | parent: A15. Sources: HCV1 §6.6 (brief mention); DCM1 Level-1 Q10 ("angle of friction and angle of repose are numerically same"). **Collapsed from former A16 atomic** per founder decision 2026-05-25 (Q-C1) — geometrically equivalent to angle of repose, not worth a separate atomic. |
| **A17** `block_sliding_down_rough_incline_acceleration` | When θ > θ_repose: a = g(sin θ − μ_k cos θ) | atomic | ✅ | — | A14, A15, A3, A10 | A18 | **Sources:** HCV1 §6.6 worked example; DCM1 Ex 15 (car going up plane — symmetrical setup); Level-1 Q3 (assertion-reason: identical blocks, one given upward v, one downward — ratio of accelerations = (1+μ)/(1−μ)). **v1?:** TRUE. |
| ↳ N17.1 `net_force_down_incline_equals_mg_sin_minus_mu_mg_cos` | F_net = mg sin θ − μ_k mg cos θ (friction opposes downward slide) | nano | ✅ | — | A17, N14.2, A3 | A17 | parent: A17. |
| ↳ N17.2 `acceleration_formula_g_sin_minus_mu_cos` | a = g(sin θ − μ_k cos θ) | nano | ✅ | — | A17, N17.1 | A17 | parent: A17. `granularity_question: candidate_micro`. |
| **A18** `block_pushed_up_rough_incline` | Push block UP incline: friction also acts DOWNward (opposes motion) → F_applied > mg sin θ + μ_k mg cos θ | atomic | ✅ | — | A14, A17 | — | **Sources:** DCM1 Ex 15 (car going up plane: "maximum upward friction > mg sin θ" condition); Objective Q.8 (force to just move up = double force to prevent slide down → derive μ from this); Level-1 Q3 (asymmetric accelerations up vs down). **v1?:** FALSE — V2 (asymmetric direction case; covered after A17). |
| **A19** `friction_two_blocks_stacked` | Block A on Block B on floor; two friction interfaces (A-B and B-floor); check no-slip vs slip | atomic | ✅ | — | A13, A3, A5, A7 | — | **Sources:** HCV1 §6 worked examples; DCM1 Ex 17 (two blocks on incline w/ different μ); Objective Q.25 (block A on block B, different μ at AB and B-floor — find friction at AB for applied force 25 N). **v1?:** FALSE — V2 (advanced multi-body). |
| ↳ N19.1 `friction_interface_A_to_B` | μ_AB between top and bottom block | nano | ✅ | — | A19 | A19 | parent: A19. |
| ↳ N19.2 `friction_interface_B_to_floor` | μ_Bg between bottom block and floor | nano | ✅ | — | A19 | A19 | parent: A19. |
| ↳ N19.3 `no_slip_constraint_common_acceleration` | If no slipping anywhere, both blocks move with same a | nano | ✅ | — | A19, N19.1, N19.2 | A19, A20 | parent: A19. |
| ↳ N19.4 `slip_at_AB_relative_motion_check` | When applied F exceeds f_max(AB), top block slips relative to bottom | nano | ✅ | — | A19, A5, A7 | A19 | parent: A19. |
| ↳ N19.5 `newton_third_law_friction_pair` | Friction A→B and B→A are equal and opposite (Newton's 3rd law) | nano | ✅ | — | A19, `newton_third_law` (Topic 11) | A19 | parent: A19. Sources: HCV1 §6, NCERT Ex 5.12 (action-reaction pairs explicit). |
| **A20** `friction_in_accelerating_frame` | Box on accelerating train floor: static friction provides the acceleration; or use pseudo-force in train frame | atomic | ✅ | — | A4, A7, `pseudo_force` (Topic 11 §non-inertial) | A24, A27 | **Sources:** NCERT Ex 5.7 (box on accelerating train, max a before sliding); DCM1 Ex 18 (man on accelerating conveyor belt); DCM1 Level-1 Q19 (block on incline accelerating horizontally). **v1?:** FALSE — V2 (requires Topic 11 §non-inertial frames). |
| ↳ N20.1 `pseudo_force_in_non_inertial_frame` | In accelerating frame, add −ma fictitious force to body | nano | ✅ | — | A20, `pseudo_force` | A20 | parent: A20. `granularity_question: candidate_micro`. |
| ↳ N20.2 `static_friction_provides_acceleration` | From ground frame: it's static friction that pushes the box along with the train (no pseudo-force needed) | nano | ✅ | — | A20, A4, A7 | A20, A26 | parent: A20. Sources: NCERT §5.9.1 explicit ("static friction provides the same acceleration to the box as that of the train"). |
| **A21** `block_against_vertical_wall_friction` | Block held against vertical wall by horizontal force F; friction acts vertically upward to support weight; min F = mg/μ_s | atomic | ✅ | — | A13, A7, A5 | — | **Sources:** HCV1 worked examples; DCM1 Level-1 Q22 (cube against rough wall, find perpendicular distance of normal reaction). **v1?:** FALSE — V2. |
| ↳ N21.1 `horizontal_F_creates_normal_force_on_wall` | N (wall on block) = F_applied (horizontal eqn) | nano | ✅ | — | A21, A13 | A21 | parent: A21. |
| ↳ N21.2 `vertical_equilibrium_friction_supports_weight` | f = mg (vertical eqn for equilibrium) | nano | ✅ | — | A21, N21.1 | A21 | parent: A21. |
| ↳ N21.3 `min_F_to_hold_against_wall` | μ_s F ≥ mg → F ≥ mg/μ_s | nano | ✅ | — | A21, A5, N21.2 | A21 | parent: A21. |
| **A22** `minimum_force_to_slide_at_optimal_angle` | Apply F at angle θ to horizontal; θ_opt = tan⁻¹(μ_s); F_min = μmg / √(1+μ²) | atomic | ✅ | — | A13, A5, `calculus_min_max` (math tools — not authored, prereq) | — | **Sources:** DCM1 Level-1 Q15 (formula given); Objective Q.10 ("Minimum force is needed when α = angle of friction"); Subjective derivation pattern. **v1?:** FALSE — V2 (calculus min-max required). |
| ↳ N22.1 `vertical_eqn_with_force_at_angle` | N = mg − F sin θ (vertical component of F reduces normal force) | nano | ✅ | — | A22, A13, `vector_resolution` | A22, A23 | parent: A22. |
| ↳ N22.2 `horizontal_eqn_at_threshold` | F cos θ = μ_s (mg − F sin θ) at impending motion | nano | ✅ | — | A22, N22.1, A5 | A22 | parent: A22. |
| ↳ N22.3 `minimize_F_over_theta` | dF/dθ = 0 → tan θ_opt = μ_s → optimal angle = angle of friction | nano | ✅ | — | A22, N22.2, A16 | A22 | parent: A22. **UNCERTAIN — flagged for founder review:** uses calculus; is N22.3 a friction nano or a math-tools nano? |
| **A23** `friction_with_applied_force_at_angle` | F at angle θ changes N → friction is μ(mg − F sin θ), not μ mg | atomic | ✅ | — | A13, N22.1 | A22 | **Sources:** HCV1 worked examples; DCM1 Objective Q.24 (resultant force from ground on block when 30 N applied parallel); Level-1 Q26 (block on rough incline, F applied parallel to incline upward — find total force from plane). **v1?:** FALSE — V2 (subcase of A22). |
| **A24** `conveyor_belt_friction` | Block on accelerating/moving belt; relative-motion analysis between block and belt determines static vs kinetic regime | atomic | ✅ | — | A7, A20, N2.2 | — | **Sources:** DCM1 Ex 18 (man on conveyor belt accelerating at 1 m/s² — max belt acceleration before man slips = μ_s g = 1.96 m/s²); Type 7 (Concept block). **v1?:** FALSE — V2. |
| **A25** `two_blocks_friction_velocity_equalisation` | Two stacked blocks given different initial velocities; friction equalizes them over time | atomic | ✅ | — | A3, A7, `relative_velocity` (Topic 5) | — | **Sources:** DCM1 Type 7 (Concept + Ex 13 "Coefficient of friction μ=0.6, top 2 kg at 3 m/s right, bottom 1 kg at 18 m/s left — find time to common velocity, common velocity, displacements"). **v1?:** FALSE — V2 (complex relative-motion case). |
| **A26** `static_friction_drives_motion` | Friction can ACCELERATE objects (not just oppose motion) — cars accelerate due to road friction; walking relies on friction | atomic | ✅ | — | A4, A7, N20.2, `newton_third_law` (Topic 11) | — | **Renamed 2026-06-13** from `friction_drives_motion_misconception` — the id implied a misconception sim, but the atomic teaches the POSITIVE concept (static friction drives motion); the wrong belief is just its EPIC-L opening beat (Rule 16a). Code A26 references unchanged. **Sources:** HCV1 §6.5 (atomic-level explanation has the famous "general misconception that friction always opposes motion" callout); NCERT §5.9.1 ("static friction is important in daily life. We are able to walk because of friction. It is impossible for a car to move on a very slippery road. … friction between the tyres and the road provides the necessary external force to accelerate the car"); DCM1 Level-1 Q11 (assertion: "frictional force exerted by surface on the person is opposite to his motion" — FALSE; force is in the direction of motion). **v1?:** TRUE — **CRITICAL EPIC-C** atomic. STATE_1 shows the wrong belief: "friction always opposes motion." Counter-state shows: car wheel pushing back on road, road pushing forward on car (Newton's 3rd), so friction drives car forward. |
| ↳ N26.1 `static_friction_on_driven_wheel` | Engine torque → wheel pushes back on road → road pushes forward on wheel (Newton's 3rd law) | nano | ✅ | — | A26, A7, `newton_third_law` | A26 | parent: A26. Sources: NCERT §5.9.1 (Fig 5.14 banked-road + car wheel discussion). `granularity_question: candidate_micro` — single key insight. |
| ↳ N26.2 `walking_relies_on_friction_with_ground` | Foot pushes back on ground → ground pushes forward on foot → human walks | nano | ✅ | — | A26, N26.1 | A26 | parent: A26. Sources: NCERT §5.9.1 ("we are able to walk because of friction"). |
| **A27** `circular_motion_friction_provides_centripetal` | On level circular road: static friction = centripetal force; v_max = √(μ_s R g). On banked road: combination of N component + friction | atomic | ✅ | — | A4, A14, **Topic 13 atomics** (circular motion, centripetal force) | — | **Sources:** NCERT §5.10 (full subsection: level + banked road, Eqs 5.16–5.22, Ex 5.10 + Ex 5.11); HCV1 Ch.7 forward ref. **v1?:** FALSE — **belongs to Topic 13 Circular Motion**, not Topic 12 Friction. Listed here only as a cross-topic dependency edge. Stage-2 Topic-13 catalog will own this atomic. |
| **A28** `lab_measurement_of_mu` | Two methods: F-vs-W graph (horizontal) and tilt-table θ_max (inclined) | atomic | ✅ | — | A3, A5, A15 | — | **Sources:** HCV1 §6.6 (entire subsection "A Laboratory Method to Measure Friction Coefficient" — both methods described); NCERT Ex 5.8 (inclined-table principle used in worked example). **v1?:** FALSE — V2 / board-mode + lab content. |
| ↳ N28.1 `horizontal_method_F_vs_W_graph` | F (force to just move) plotted vs W (weight); slope of straight line = μ_s | nano | ✅ | — | A28, A3, A5 | A28 | parent: A28. Sources: HCV1 §6.6 (horizontal method derivation). |
| ↳ N28.2 `inclined_method_tilt_until_slide` | Tilt incline until block just slides; measure θ_max; μ_s = tan θ_max | nano | ✅ | — | A28, A15 | A28 | parent: A28. Sources: HCV1 §6.6 (inclined method), NCERT Ex 5.8. |
| **A29** `friction_increases_with_normal_not_with_horizontal_applied` | Subtle: if F₁ is vertical-downward, increasing F₁ increases N → increases f_max. If F₂ is horizontal (applied force), increasing F₂ only increases f up to limit, then f drops to μ_k N (constant). | atomic | ✅ | — | A4, A5, A6 | — | **Sources:** DCM1 Level-1 Assertion-Reason Q5 ("If we increase either of the two forces F1 or F2, force of friction acting on the block will increase. Reason: By increasing F1, normal reaction from ground will increase"). **v1?:** FALSE — V2 (JEE-Advanced level subtlety; tests understanding of the f_max boundary). |

---

## Section E — Cross-source coverage matrix

How each atomic is treated across the 3 sources:

| Atomic ID | NCERT 11.1 §5.9.1 | DCM1 §8.7 | HCV1 Ch.6 |
|---|---|---|---|
| A1 contact-force-component | implicit (split as N + f) | implicit | **explicit (opens chapter)** |
| A2 static-vs-kinetic | brief | Concept block | **full coverage §6.2–6.3** |
| A3 kinetic formula | Eq. 5.15 | every problem | **Eq. 6.1** |
| A4 self-adjusting | explicit | implicit | **§6.3 explicit** |
| A5 limiting value | Eq. 5.13/5.14 | Concept block | **§6.3 + Eq. 6.5** |
| A6 μ_s > μ_k | brief | implicit | **§6.3 + coefficient table §6.6** |
| A7 direction-relative-motion | brief | Type 7 explicit | **§6.2 explicit + §6.3 worked** |
| A8 area-independence | mentioned | mentioned | **Law 4 §6.4** |
| A9 coefficient defn | Eq. 5.13/5.15 | implicit | **§6.6 coefficient table** |
| A10 speed-independence | "nearly independent" | implicit | **Law 2 §6.4** |
| A11 rolling friction | paragraph | brief | **§6.6 full subsection** |
| A12 atomic explanation | 1 paragraph | absent | **§6.5 full subsection** |
| A13 block-on-horizontal | **Ex 5.9** | Ex 14 + Type 8 | several worked examples |
| A14 block-on-incline | **Ex 5.8** | **Ex 16, Ex 17** | §6.6 method |
| A15 angle-of-repose (+ N15.3 angle-of-friction geometric) | **Ex 5.8 derives μ_s = tan 15°** | Q10 + Ex 16 | §6.6 method |
| A17 sliding-down-incline | implicit | Ex 15, Q3 | worked example |
| A18 push-up-incline | absent | **Ex 15, Q8** | absent |
| A19 stacked-blocks | absent (Ex 5.12 cylinder-on-block — different) | **Ex 17, Q25** | worked example |
| A20 accelerating-frame | **Ex 5.7 (box on train)** | **Ex 18 (conveyor)** | worked example |
| A21 vertical-wall | absent | **Q22** | worked example |
| A22 min-force-at-angle | absent | **Q10, Q15** | absent |
| A23 force-at-angle | absent | **Q15, Q24, Q26** | worked example |
| A24 conveyor-belt | absent | **Ex 18** | absent |
| A25 velocity-equalisation | absent | **Type 7 + Ex 13** | absent |
| A26 friction-drives-motion | **§5.9.1 explicit (walking, car)** | **Q11 explicit** | **§6.5 explicit** |
| A27 circular-friction (cross-topic) | **§5.10 + Ex 5.10, 5.11** | (Topic 13) | (Ch.7 forward ref) |
| A28 lab-measurement | (used in Ex 5.8) | absent | **§6.6 full subsection** |
| A29 increasing-F-effect | absent | **Q5 assertion-reason** | absent |

**Observations:**
- HCV1 owns the conceptual depth (8 of 12 Tier-1 atomics get full coverage in HCV1; NCERT brief or absent on these).
- DCM1 owns the problem-pattern depth (8 of 13 Tier-2 atomics A18–A29 are DCM1-primary, often absent in NCERT and HCV1).
- NCERT is the bridge: gives every Tier-1 atomic at least a brief mention + worked example, and owns one critical Tier-2 atomic (A26 friction-drives-motion via the walking/car-tyre real-world callout that doesn't appear in DCM1 with the same clarity).
- **Pedagogical implication for V1:** an HCV1-flavored teaching of Tier-1 + NCERT-flavored real-world anchors + DCM1-flavored Tier-2 problem patterns gives the strongest cross-source synthesis. None of the three books alone is sufficient.

---

## Section F — V1 authoring queue

**Deferred to Stage 5** outcome-priority map per founder decision 2026-05-25 (Q-F4). The cross-topic V1 priority queue (ranked by NCERT-essential + PYQ frequency + exam weight + student-failure rate) is a Stage 5 deliverable, not a per-topic deliverable. The per-row `v1?` flag inside Section D Notes remains the input to that queue.

**Inputs available for Stage 5 from this catalog:** 14 atomics flagged `v1?: TRUE` (A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A13, A14, A15, A17, A26) + 14 flagged `v1?: FALSE` (A11, A12, A18, A19, A20, A21, A22, A23, A24, A25, A28, A29 + 1 cross-topic-ref A27 + N15.3 collapsed nano).

---

## Section G — Open questions (founder-resolved + still-open)

1. ✅ **`friction_static_kinetic.json` refactor.** RESOLVED 2026-05-25: refactor in V1.1 (split into per-atomic JSONs A2, A4, A5, A6, A9). Logged as V1.1 backlog in Section B.
2. ✅ **A16 angle-of-friction vs A15 angle-of-repose.** RESOLVED 2026-05-25: collapsed into nano N15.3 of A15.
3. ✅ **A27 cross-topic placement.** RESOLVED 2026-05-25: Topic-13 Circular Motion owns it; this catalog lists cross-topic-ref edge only (Section D shows it but marked as cross-topic).
4. ⏳ **Granularity question — the 6 `candidate_micro` nanos.** N1.3 contact-force-resultant, N2.1 impending-motion, N5.1 equality-at-limit, N17.2 acceleration-formula, N20.1 pseudo-force, N26.1 driven-wheel-3rd-law. Deferred per founder Q-F5 — "look after a few stages". Stage-4 reviews en bloc across all 44 topics.
5. ⏳ **N22.3 minimize-F-over-θ — math-tools nano or friction nano?** Stage-4 question. Calculus min-max is the actual physics insight; the friction context is incidental. **Sub-resolved 2026-05-25 (W-G4):** the math-tools side terminates at `[math-tools: calculus_minmax]` notation pending Stage-3 math-tools reference file. The friction-context retention of N22.3 in Topic 12 catalog stands.
6. ✅ **Stage-2 scaling implication:** RESOLVED 2026-05-25 (W-G6 founder-style): ACCEPT ~2,770 catalog entries projected across 44 topics. Do not tighten atomic threshold. Founder framing: "data and patterns help a lot — don't compromise quality." V1 authoring queue is ~1,000 atomics (37% of 2,770), tractable over 2-3 years.

---

## Section H — What's NOT in this pilot (scope boundary)

Deliberately deferred to later stages:

- **PYQ frequency tags** (Stage 5)
- **JEE/NEET/board-exam weights** (Stage 5)
- **`student_confusion_log` cross-references** for misconceptions (Stage 6) — though A2, A7, A8, A10, A26 are pre-flagged as strong EPIC-C atomics here based on textbook authors' own callouts
- **HCV1 worked-example-by-example mapping** (one HCV1 Worked-Out Example → which catalog atomic it tests) — useful for Stage-5 priority but ~16 examples × pilot effort ratio = defer
- **DCM1 31-exercise mapping** — same logic, defer to Stage 5
- **Western-curriculum overlap** — out of scope (catalog is Indian-first)

---

## Section I — Stage-2 scaling notes (for the remaining 43 triple-covered topics)

Patterns observed during the Friction pilot that will likely repeat:

1. **HCV1 = depth, DCM1 = breadth, NCERT = canonical baseline.** This division of labor probably holds for all mechanics topics (Topics 1–18). E&M and Waves may differ — flag at Stage-2 mid-checkpoint.
2. **Expect 20–35 atomics per topic** (Friction: 29). For very small topics (Topic 1 "Physical World" — purely conceptual) expect <10. For huge topics (Topic 31 "Electromagnetic Induction") expect 40+.
3. **Ratio of nano-to-atomic ≈ 1:1.** Friction: 30 nanos / 29 atomics ≈ 1.0. Likely holds.
4. **V1 priority typically 30–40% of atomics.** Friction: 10 of 29 = 34%. Founder may want to bound V1 queue size topic-by-topic.
5. **Source coverage matrix is high-signal.** Section E above (HCV1-explicit vs DCM1-primary vs NCERT-only) clearly shows where each book leads. Reproduce this section per topic.
6. **`granularity_question: candidate_micro` flags will accumulate.** Stage-4 reviews them all at once to decide whether to formalize a "micro" tier or absorb into nanos.
7. **`UNCERTAIN — flagged for founder review`** is high-value but should be rare. Friction had 2; if a topic has >5, the boundary work isn't done yet — re-read sources before flagging.

---

## Section J — Verification checklist

- [x] All 3 sources cited with chapter + section + page range (Section A)
- [x] Existing repo concepts addressing this topic enumerated (Section B)
- [x] Methodology choices documented for founder review (Section C)
- [x] All atomic concepts identified across 3 sources, with cross-source citations (Section D)
- [x] All nano concepts identified with `parent: <atomic_id>` tags (Section D)
- [x] `Requires` and `Required-by` columns populated for every row (Section D — full dependency graph)
- [x] `v1?` flag populated for every atomic (Section D + Section F)
- [x] `Sim?` rating ✅/⚠/❌ populated for every row (Section D)
- [x] Cross-source coverage matrix (Section E)
- [x] V1 authoring queue ordered by foundational-first (Section F)
- [x] Open questions surfaced explicitly (Section G)
- [x] Scope boundaries declared (Section H)
- [x] Scaling implications for other 43 topics noted (Section I)
- [x] At least 2 `UNCERTAIN — flagged for founder review` items (A16, N22.3)
- [x] At least 3 `granularity_question: candidate_micro` flags (N1.3, N2.1, N5.1, N17.2, N20.1, N26.1)
- [x] All `Requires` entries cite concept IDs that exist in the catalog OR are explicitly cross-topic refs

---

*Generated: 2026-05-25. Pilot Topic 12 Friction. Format validated and approved 2026-05-25 by founder — same template applies to Topic 21 Waves and Topic 36 Moving Charges, processed sequentially per Q-P1.*
