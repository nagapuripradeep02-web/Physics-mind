# scalar_vs_vector — Architect Skeleton (v1 Ch.5 warm-up batch)

Produced by: architect agent (2026-04-27)
Upstream inputs: project `C:\Tutor\CLAUDE.md` (23 design rules), `C:\Tutor\PLAN.md` (Phase E + L), `physics-mind\.agents\architect\CLAUDE.md` (role spec), `physics-mind\docs\SHIP_V1_VECTORS_KINEMATICS.md` (v1 scope), exemplars `src/data/concepts/normal_reaction.json` + `src/data/concepts/friction_static_kinetic.json`, `engine_bug_queue` consultation 2026-04-27.
Target file: `src/data/concepts/scalar_vs_vector.json` (TO BE CREATED by json_author after physics_author fills physics block)
Chapter: 5 (Vectors), section 5.1
Class level: 11
Batch position: concept 1 of 4 in Week 1 warm-up (siblings: `vector_basics`, `vector_addition_triangle`, `vector_subtraction` — dispatched only after this passes the pipeline)

---

## 1. Concept identity (atomic claim)

This concept teaches **how to decide whether a physical quantity is a scalar or a vector**, by checking three operational criteria in order: (a) does direction change the physical effect? (b) does it obey vector (head-to-tail / parallelogram) addition rather than algebraic addition? (c) does it transform as a vector under coordinate rotation? It establishes the working definitions and gives the student a decision rule they can apply to ANY new quantity they meet later in the syllabus.

It does NOT cover:
- **How** to add vectors (deferred to sibling `vector_addition_triangle`).
- **Vector components** or coordinate resolution (deferred to `vector_components`).
- **Dot/cross products** (deferred to later Ch.5 concepts).
- The full edge-case taxonomy of pseudo-vectors / tensors (out of Class 11 syllabus — flagged as "you'll meet this in college" in real-world anchor only).

Atomic boundary justification: every Ch.5 concept after this one assumes the student can correctly classify a quantity. This is the single teachable idea that unblocks the rest of the chapter — it is genuinely root.

## 2. Learning trajectory — 5 EPIC-L states

State count: **5**. Concept complexity = simple-medium per CLAUDE.md §7 (calibration band 3–6 for "simple" → "medium"). The concept is conceptually simple but carries a load-bearing misconception (current is "directional" but is a scalar) that needs its own state to dismantle, hence 5 not 4.

| State | Purpose | teaching_method | advance_mode | Socratic reveal? |
|---|---|---|---|---|
| **STATE_1** | Hook — A delivery boy in Bengaluru gets the address "5 km from the metro station." He drives 5 km — and ends up at the wrong shop. Why? Because "5 km" alone is not enough; he needed "5 km **north-east**." Sets up: some quantities need direction, some don't. | `narrative_socratic` | `auto_after_tts` | No (hook, t=0 setup) |
| **STATE_2** | Definitions — visual side-by-side. Left half: scalar quantities (mass = 5 kg, time = 30 s, temperature = 28 °C) shown as plain numbers. Right half: vector quantities (displacement = 5 km NE, velocity = 60 km/h east, force = 10 N down) shown as arrows with magnitude AND direction. | `compare_contrast` | `manual_click` | Yes — predict-pause-reveal: "Which of these would change if you flipped the direction?" Reveal: temperature does not, displacement does. |
| **STATE_3** | The **decision rule** (core insight). Three operational tests animated in sequence: (a) flip-direction test — does it change the physics? (b) two-quantities-at-an-angle test — does 3 + 4 = 7 (scalar) or 3 + 4 = 5 at right angles (vector head-to-tail)? (c) brief mention of rotation invariance for completeness. **[has_prebuilt_deep_dive: true]** — this is the conceptual core students struggle to internalize as a procedure. | `narrative_socratic` | `wait_for_answer` | Yes — predict-pause-reveal twice: once before the 3+4 vector demo, once before the rotation demo. |
| **STATE_4** | **Misconception confrontation** (lightweight, in-EPIC-L since v1 omits epic_c_branches). The "current is a vector" trap. Visual: a wire with current arrows drawn along it. Show two wires meeting at a junction at 60° — currents add ALGEBRAICALLY (Kirchhoff: I₁ + I₂), not by parallelogram law. Therefore current is a SCALAR despite having a "direction-feel." Pressure also flagged as a non-vector despite intuition. **[has_prebuilt_deep_dive: true]** — this is the misconception students bring in and the deep-dive elaborates with 3 more examples (angular position, rotation about a fixed axis, area as a vector). | `misconception_confrontation` | `wait_for_answer` | Yes — predict-pause-reveal: "If I bring two 5 A wires into a junction at 60°, what is the total?" Reveal: 10 A by Kirchhoff, NOT ≈ 8.66 A by parallelogram. |
| **STATE_5** | Interactive classifier. Six quantities appear one at a time as cards: mass, velocity, electric current, displacement, energy, force. Student taps **Scalar** or **Vector** for each. Live feedback. Final scoreboard shows the decision rule applied. | `exploration_sliders` (re-purposed as tap-to-classify interaction) | `interaction_complete` | No (final state — student drives) |

Quality test (CLAUDE.md §7): "Could a student who watches all 5 states answer any Class-11 exam question on scalar-vs-vector classification?" YES — they get the operational decision rule + confront the canonical trap (current) + practice it on 6 quantities.

`advance_mode` variety check (Rule 15): `auto_after_tts` (1) + `manual_click` (1) + `wait_for_answer` (2) + `interaction_complete` (1) = 4 distinct modes across 5 states. PASSES.

## 3. Scene composition outline (PCPL primitives, ≥3 per state — Rule 19)

This concept is **arrow-and-label heavy, not mechanics_2d heavy**. No surfaces, no bodies-on-surfaces. The renderer must be `parametric_renderer` (PCPL), and the relevant primitives are: `text_label`, `vector_arrow`, `number_card`, `comparison_panel`, `decision_tree_node`, `interactive_button`, `annotation_callout`.

| State | Primitives (count) | Notes |
|---|---|---|
| STATE_1 | `text_label` (address card "5 km from metro"), `body` (delivery boy + scooter sprite), `text_label` (wrong-shop callout), `annotation_callout` ("Direction missing!") | 4 primitives |
| STATE_2 | `comparison_panel` (split-screen container), 3× `number_card` (scalars: mass/time/temp), 3× `vector_arrow` with labels (vectors: displacement/velocity/force) | 7 primitives |
| STATE_3 | `decision_tree_node` (3 tests stacked), 2× `vector_arrow` (3-unit + 4-unit at right angles), `text_label` (5-unit resultant), `annotation_callout` (Pythagoras hint), `vector_arrow` (rotated frame demo) | 6 primitives |
| STATE_4 | `body` (wire-junction diagram), 2× `vector_arrow` (currents along wires, 60° apart), `number_card` (algebraic sum 5+5=10 A), `annotation_callout` ("Currents add ALGEBRAICALLY — current is a SCALAR"), `text_label` (Kirchhoff law tag) | 6 primitives |
| STATE_5 | `comparison_panel` (Scalar / Vector tap zones), 6× `interactive_button` (one per quantity card), `number_card` (live score), `annotation_callout` (feedback bubble) | 9 primitives |

Every state ≥3 primitives. PASSES Rule 19.

`focal_primitive_id` candidates (one per state — physics_author finalizes):
- STATE_1: address-card label
- STATE_2: comparison_panel split
- STATE_3: the 3-4-5 right-triangle vector demo
- STATE_4: the 60°-junction current diagram with the algebraic-sum callout
- STATE_5: the live scoreboard

## 4. Mode overrides outline (Rule 20 — all three modes from day one)

### `mode_overrides.board` (Rule 21 — `canvas_style: "answer_sheet"` + `derivation_sequence` + `mark_scheme`)

Board-mode for a definitional concept = a **classification table** the student writes on their answer sheet. Indian board exams routinely ask "Distinguish scalar and vector quantities with two examples each" (1 + 2 + 2 = 5 marks).

- **canvas_style**: `answer_sheet` (white ruled background)
- **derivation_sequence** (per state, handwriting-animated):
  - STATE_1: write title "Scalar vs Vector Quantities" + heading "Definition"
  - STATE_2: write the two definitions in a 2-row table
  - STATE_3: write a 3-column comparison table (Property / Scalar / Vector) — magnitude, direction, addition rule, examples
  - STATE_4: write the "common confusion" line — "Current has direction-sense but is a scalar (Kirchhoff additive)"
  - STATE_5: write the final 5 examples each, neatly numbered
- **mark_scheme** (5 marks total):
  - +1 mark: correct definition of scalar
  - +1 mark: correct definition of vector
  - +1 mark: vector addition rule mentioned (parallelogram / triangle law)
  - +1 mark: two valid scalar examples
  - +1 mark: two valid vector examples
- **mark_badge**: yellow "+1 mark" overlay tied to each line as it's written (5 badges total, accumulating on the right margin)

### `mode_overrides.competitive` (JEE/NEET shortcuts + edge cases)

- **shortcuts**:
  - "If a quantity has both magnitude and direction AND obeys parallelogram law → vector. Two-test rule, not three. Skip rotation invariance — Class 11 papers don't test it."
  - "Force, displacement, velocity, acceleration, momentum, electric/magnetic field → vector (memorize this list — these are 80% of JEE questions)."
  - "Mass, time, temperature, energy, work, charge, current, pressure → scalar (the trap is current and pressure — flag them)."
- **edge_cases**:
  - "Current has direction along the wire but is scalar — it's a one-line trap in JEE. Test: bring two wires into a junction at an angle; if currents add algebraically (Kirchhoff), it's a scalar."
  - "Pressure is scalar even though force is vector (pressure = magnitude only at a point; the surface element vector carries the direction)."
  - "Angular displacement for FINITE rotations is NOT a vector (does not commute) — but infinitesimal angular displacement IS. Out-of-Class-11 footnote; mention only if asked."
  - "Area can be treated as a vector (A_vec = A * n_hat) — this matters in flux. NCERT-marginal but appears in NEET."

### Mode coverage check (Rule 20): conceptual baseline (epic_l_path) + board override + competitive override = all three modes shipped from day one. PASSES.

## 5. Deep-dive plan — `has_prebuilt_deep_dive` selections

Per architect agent spec §"has_prebuilt_deep_dive picking": pick states that combine mathematical abstraction + core insight + multiple documented confusion patterns.

### Selected: STATE_3 + STATE_4 (2 of 5 states)

**Why STATE_3 is hard**: This is where the operational decision rule lives. Students have memorized "vectors have magnitude and direction" but cannot apply it. They cannot articulate WHY 3 + 4 ≠ 7 for vectors, or WHY rotation invariance matters. The deep-dive needs to walk through each of the three tests with a worked example.

Suggested 4 deep-dive sub-states for STATE_3:
1. **DD_3_1**: Why direction matters — walk-east-then-walk-north example, show net displacement ≠ total distance walked.
2. **DD_3_2**: The parallelogram-vs-algebraic test — same 3 N and 4 N, show three configurations (same direction = 7, opposite = 1, perpendicular = 5).
3. **DD_3_3**: The rotation test — rotate the coordinate system, show vector components change but the vector itself doesn't (length-preserving).
4. **DD_3_4**: Apply the rule to a new quantity: "Is angular velocity a vector?" Walk the 3 tests → yes (with the caveat that finite rotations don't commute, but Class-11 angular velocity does because we treat ω as instantaneous).

**Why STATE_4 is hard**: The current-is-a-scalar trap is THE single most common misconception in Indian Class-11 vectors. Students lose marks every year. They visually see current "flowing" along a wire and call it a vector. The deep-dive elaborates with 3 more boundary cases.

Suggested 4 deep-dive sub-states for STATE_4:
1. **DD_4_1**: Re-derive the Kirchhoff-junction test for current; contrast with what would happen if it were a vector (parallelogram → wrong answer).
2. **DD_4_2**: Pressure — show the same gas in a container; pressure has no direction even though force on each wall is a vector. Pressure = scalar field.
3. **DD_4_3**: Time — common student question "but time moves forward?". The "arrow of time" is a thermodynamic concept, NOT a spatial direction. Time is scalar.
4. **DD_4_4**: A genuine borderline case for honesty — Area as a vector (A_vec = A * n_hat). Show Class-11-marginal but appears in NEET flux problems. "Sometimes a scalar gets promoted to a vector when paired with a direction; this is rare and always flagged."

The other three states (STATE_1 hook, STATE_2 definitional split, STATE_5 interactive practice) get `has_prebuilt_deep_dive: false` — Sonnet generates on first click if a student asks (Rule 18 cache-and-review path).

## 6. Prerequisites

```
prerequisites: []
```

This concept is the **root** of the Ch.5 prereq tree (per the input contract — `prerequisites: []`). It assumes only Class-9/10 arithmetic and the everyday notion of "direction." No physics prerequisite.

This propagates downstream: `vector_basics`, `vector_addition_triangle`, and every other Ch.5 concept will list `scalar_vs_vector` in their prerequisites array.

## 7. `_authoring_constraints` block (verbatim 6-line reminder for physics_author + json_author)

The skeleton's `_authoring_constraints` block — to be embedded VERBATIM into the final concept JSON's `_authoring_constraints` field by json_author — is:

```yaml
_authoring_constraints:
  - "Author EPIC-L (5–12 states), `mode_overrides.board`, `mode_overrides.competitive`, `prerequisites`, `allow_deep_dive: true` on 1–3 hard states, deep-dive sub-states for those states."
  - "DO NOT author `epic_c_branches`, `drill_downs`, MICRO sub-states, or LOCAL paths. Omit those fields entirely."
  - "Real-world Indian context. Plain English. No Hinglish."
  - "Variety in `advance_mode` (Rule 15). Every state ≥3 primitives (Rule 19). All 3 modes present (Rule 20)."
  - "Reference `physics-mind/docs/SHIP_V1_VECTORS_KINEMATICS.md` Section C.0 for full IN/OUT field list."
  - "v1 omits epic_c_branches — when STATE_4 confronts the current-is-a-vector misconception, do it in EPIC-L (teaching_method: misconception_confrontation), not in a separate epic_c branch."
```

(Note: the architect spec input listed 6 lines verbatim — lines 1–5 are the input verbatim; line 6 is a derived clarification specific to this concept's STATE_4 design choice and is flagged separately so it can be removed/kept at physics_author's discretion. Lines 1–5 must not be modified.)

---

## Engine bug queue consultation (2026-04-27)

Queried `engine_bug_queue` filtered to: owner_cluster='alex:architect' OR concept overlap with the v1 vector batch OR bug_class matching vector/arrow/label/primitive OR cardinality(concepts_affected) >= 5. **15 FIXED tickets** returned, **0 OPEN**. All 15 have FIXED status — meaning the prevention_rule is now enforced upstream (in renderer/runtime/validator), so the architect's job is to ensure the skeleton does not REGRESS into any of them.

### Rules that constrain THIS skeleton's primitive + structural choices

| Ticket ID (short) | Prevention rule → How this skeleton complies |
|---|---|
| **bc88622e** `drawvector_missing_to_defaults_to_canvas_corner` | All `vector_arrow` primitives in STATE_2/3/4 must specify `{from, to}` OR `{from, magnitude, direction_deg}`. Skeleton flags this for physics_author: every arrow must declare a magnitude (e.g., 3-unit, 4-unit, 5 A current) AND a direction_deg or explicit `to`. |
| **4a16a973** `drawanglearc_ignores_surface_id_defaults_to_250_300` | STATE_4's "60° between two wires at junction" needs an angle arc. Skeleton flags: the arc primitive must use `{spec.center, spec.surface_id, spec.vertex_anchor}` priority chain — never rely on canvas-center default. |
| **88e8e7d5** `force_origin_body_id_field_name_mismatch` | N/A directly (no force_arrow needed for scalar_vs_vector), but if physics_author chooses force_arrow primitives anywhere (e.g., the 10 N down example in STATE_2), they must use both `body_id` and `origin_body_id` aliases per the rule. |
| **52137e68** `rotated_anchor_resolution_ignores_rotation_deg` | STATE_3's rotation-invariance test rotates the coordinate frame. Skeleton flags: any body or vector with `orient_to_surface=true` or non-zero `rotation_deg` must be authored with explicit rotation in mind; surface registry must carry `angle_deg`. Recommend physics_author keeps STATE_3's rotation demo to a coordinate-frame visualization (axes rotating) rather than rotating bodies — simpler and avoids this bug class entirely. |
| **098e44c2** `default_variables_only_first_var_merged` | scalar_vs_vector has multiple variables (the 6 quantities in STATE_5; the 3 N + 4 N + 5 N in STATE_3; the 5 A currents in STATE_4). All must be declared in `physics_engine_config.variables` with explicit `default` values — skeleton flags this for physics_author. |
| **9e168315** `classifier_prompt_drift_atomic_not_advertised` | Reminder for json_author downstream: `scalar_vs_vector` must appear in `VALID_CONCEPT_IDS` (intentClassifier.ts:36) AND in the `CLASSIFIER_PROMPT` block (intentClassifier.ts:~137). It is currently a "ghost" in conceptCatalog.ts:162 — must be promoted. |
| **6e8130cd** `production_routing_disconnect_pcpl_concepts_set` | Reminder for json_author: `scalar_vs_vector` must be added to the `PCPL_CONCEPTS` set at aiSimulationGenerator.ts:~2821, since it uses parametric_renderer (not legacy mechanics_2d). |
| **373c59dc** `fetch_technology_config_silent_particle_field_default` | Reminder for json_author: must INSERT a row into `concept_panel_config` (or add to `CONCEPT_PANEL_MAP`) before the concept can be served. Six-update checklist in CLAUDE.md §6. |
| **e07d08aa** `confusion_cluster_registry_unseeded_for_concept` | **NOT BLOCKING for v1**: This rule fires when `drill_downs` are authored. v1 explicitly does NOT author drill_downs (per SHIP_V1_VECTORS_KINEMATICS.md Section C.0). Skeleton omits drill_downs entirely → no confusion_cluster_registry seeding required. Re-activates in v1.1. |
| **f197ef94** `stale_fingerprintkey_serves_wrong_concept` | Runtime concern, not authoring-time. No skeleton constraint. |
| **5eff4e4e** `drill_down_dd_suffix_not_stripped` | NOT BLOCKING for v1 — drill-downs not authored. Re-activates in v1.1. |
| **d8a2c32a** `drill_down_state_id_always_state1` | NOT BLOCKING for v1 — drill-downs not authored. Re-activates in v1.1. |
| 64ff04d6, 093aa761, 7beb7305 | All friction-specific (force_arrow on slider, applied F invisible, slider state) — not relevant to scalar_vs_vector since this concept has no force-on-incline / friction physics. |

### Cited tickets the skeleton actively constrains around

- `bc88622e` (drawVector contract) — primitive choice in STATE_2/3/4
- `4a16a973` (drawAngleArc anchor) — STATE_4 60° junction arc
- `52137e68` (rotated anchor) — STATE_3 design steered toward rotating axes (not rotating bodies) to avoid the bug class entirely
- `098e44c2` (default variables) — physics_author reminder for STATE_3/4/5 multi-variable declaration

No OPEN tickets block this concept.

---

## Open questions / blockers for physics_author

1. **STATE_3 rotation-invariance demo** — keep at intuition level (axes rotating, components changing, length preserved) or attempt a numeric example? Recommend intuition-only for Class 11; numeric example in DD_3_3 if needed. Physics_author decides.
2. **STATE_4 misconception choice** — current-is-a-scalar is the canonical Indian-Class-11 trap. Acceptable to add pressure as a SECONDARY mention (one line in TTS) without burning a full sub-state on it? Recommend yes.
3. **STATE_5 interactive list** — the 6 chosen quantities (mass, velocity, electric current, displacement, energy, force) should include exactly 3 scalars (mass, energy, current) and 3 vectors (velocity, displacement, force). Note: current is the trap — it visually feels like a vector but is the scalar. Recommend keeping this composition.
4. **DC Pandey scope check** — DC Pandey Vol 1 Ch.5 §5.1 lists "Introduction" + "Scalars and Vectors" as sub-topics. Confirmed in scope. **DC Pandey check: TABLE OF CONTENTS ONLY consulted (CLAUDE.md §8). No teaching sequences, figure references, or example phrasings from DC Pandey are imported. Pedagogy is Claude's own.**
5. **Real-world anchor finalization** — primary anchor is the Bengaluru delivery-boy address (deliberately Indian, plain English, no Hinglish — "address" / "metro station" / "shop" are universal). Secondary anchor (for board/competitive contexts) and tertiary anchor (real-life appeal — e.g., Indian Railways announcing "train running 30 mins late" vs "train moving north at 60 km/h") to be drafted by physics_author.
6. **Renderer pair** — `panel_a: "parametric_renderer"` (this is a PCPL concept, not mechanics_2d). `panel_b`: `comparison_panel` for STATE_2/STATE_5 or `null` (no graph needed since there's no quantitative function to plot). Recommend `panel_b: null` and let the comparison_panel primitive live inside panel_a.

---

## Self-review checklist (architect agent spec §"Self-review checklist") — adapted for v1

- [x] Atomic claim ONE sentence (Section 1, sentence 1).
- [x] State count matches §7 table (5 states for "simple-medium" — within 3–6 band).
- [N/A in v1] 4 EPIC-C branches — v1 omits epic_c_branches per SHIP_V1 Section C.0; misconception is folded into STATE_4 of EPIC-L instead.
- [N/A in v1] EPIC-C STATE_1 visualizes wrong belief — v1 does this in EPIC-L STATE_4 (Rule 16 spirit preserved: STATE_4 explicitly visualizes the WRONG belief — current arrows being added by parallelogram law, getting a wrong answer — before correcting it).
- [x] 2 has_prebuilt_deep_dive states picked (STATE_3, STATE_4) with 4 sub-states each.
- [x] Every EPIC-L state has `teaching_method` assigned (Section 2 table).
- [x] Every state introducing a new quantity/rule has Socratic-reveal plan (STATE_2, STATE_3, STATE_4 — see table).
- [N/A in v1] `entry_state_map` declared — recommend physics_author add `foundational: { start: STATE_1, end: STATE_3 }`, `comparison: { start: STATE_2, end: STATE_2 }`, `misconception: { start: STATE_4, end: STATE_4 }`, `practice: { start: STATE_5, end: STATE_5 }` to keep parity with friction_static_kinetic exemplar.
- [x] Prerequisites cite shipped concepts (none — root of tree, `prerequisites: []`).
- [x] Real-world anchor Indian, plain English, physics-true (delivery boy, address, metro station — no Hinglish; misdelivery genuinely demonstrates direction-matters).
- [x] DC Pandey check line included (Open Q #4).
- [x] Engine bug queue consulted; 4 tickets actively constrain this skeleton; all FIXED; 0 OPEN blockers.
- [x] No section missing.
- [x] 6-line `_authoring_constraints` block embedded verbatim (Section 7, lines 1–5).

---

*Ready for handoff to physics_author. Stop here per architect agent spec — do NOT write `src/data/concepts/scalar_vs_vector.json`.*
