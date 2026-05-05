# current_not_vector — Architect Skeleton (v1 Ch.5 first concept)

Produced by: architect agent (2026-05-04)
Upstream inputs: project `C:\Tutor\CLAUDE.md` (23 design rules), `C:\Tutor\PLAN.md` (Phase E + L), `physics-mind\.agents\architect\CLAUDE.md` (role spec), `physics-mind\docs\SHIP_V1_VECTORS_KINEMATICS.md` (v1 ship plan, current_not_vector listed in Ch.5 §5.1), exemplars `src/data/concepts/friction_static_kinetic.json` (only v2.2-native shipped concept) + `.agents/proof_run/scalar_vs_vector_skeleton.md` (sibling pattern), legacy reference `src/data/concepts/current_not_vector.json` (v2.0 — to be overwritten).
Target file: `src/data/concepts/current_not_vector.json` (TO BE OVERWRITTEN by json_author after physics_author fills physics block).
Chapter: 5 (Vectors), section 5.1
Class level: 11
Catalog position: **first concept in Vectors → Vectors vs Scalars** (per `/learn` catalog ordering — student's official entry point into Ch.5).
Schema target: v2.2 gold-standard (passthrough on `schema_version: "2.0.0"` per ARCHITECTURE_v2.2.md).
ChatGPT-discussed v2.2.1 fields: `concept_tier`, `cognitive_limits`, `aha_moment`, `misconception_watch` — schema additions landed 2026-05-04, all four authored in this skeleton.

---

## 1. Concept identity (atomic claim)

This concept teaches **why electric current is classified as a scalar despite having a clear direction of flow** — by applying the parallelogram-law test that every real vector must pass and showing current fails it, while charge conservation (Kirchhoff's junction rule) forces algebraic addition with no angle term.

It does NOT cover:
- **The general definition of scalar vs vector** (deferred to sibling `scalar_vs_vector`).
- **How to add vectors with the parallelogram law** (deferred to `parallelogram_law_test` + `vector_addition_triangle`).
- **Other scalar-with-direction-feel quantities in detail** (pressure → `pressure_scalar`; surface tension, finite rotation → mentioned in STATE_4 only as members of the same trap class, not taught here).
- **Current density J vs current i distinction** (briefly flagged in EPIC-C branch 3; full treatment in Ch.13 / Class 12).

Atomic boundary justification: this is the **canonical "scalar with direction-feel" trap** in Indian Class 11 physics. The catalog places it as the chapter's first concept because the counterintuitive question ("why ISN'T this a vector?") is a sharper hook than starting with formal scalar/vector definitions. Every later Ch.5 concept assumes the student has internalized the two-condition rule for what makes a vector — STATE_4 of this concept establishes that rule, and STATE_5 has the student apply it.

`concept_tier`: **medium**. The physics is simple (Kirchhoff junction rule). The pedagogy is medium-complexity because it carries a load-bearing misconception that requires careful dismantling.

## 2. Learning trajectory — 5 EPIC-L states

State count: **5**. Quality-driven justification (CLAUDE.md §7): the legacy v2.0 file ships 4 states ending on a passive JEE assertion-reason readout — fails the Rule 15 advance_mode-variety gate (all 4 states are `auto_after_tts`) and leaves the student with no hands-on closure. The 5th state is an interactive tap-to-classify drill across 6 quantities (current, pressure, surface tension, force, velocity, displacement) that lets the student exercise the two-condition rule before leaving the lesson.

| State | Purpose | `teaching_method` | `advance_mode` | Socratic reveal? |
|---|---|---|---|---|
| **STATE_1** | Hook — Two wires carrying 3 A and 4 A meet at a junction (point O) at 60°. "Current flows from one end of the wire to the other — it has a direction. So shouldn't it be a vector like force or velocity?" Sets up the central question of the whole concept. | `narrative_socratic` | `auto_after_tts` | No (t=0 hook setup; no new physics revealed yet) |
| **STATE_2** | The sweep test — animate the angle θ between the two wires from 0° → 180°. Two side-by-side boxes update live: **Reality** (green) reads `i = 3 + 4 = 7 A` for every angle; **Vector prediction** (red) reads `\|i\| = √(9 + 16 + 24·cos θ)` and falls from 7.00 → 1.00. **AHA lives here**: "the angle never enters the answer." | `compare_contrast` | `manual_click` | Yes — predict-pause-reveal: "What will the ammeter read at 60°?" Reveal at TTS s4: green box stays at 7 A, red box snaps to 6.08 A. |
| **STATE_3** | Why — Kirchhoff's junction rule. Animated derivation: charge in per second = charge out per second → i₁ + i₂ = i. No cosine, no angle term. The formula box writes line by line. **[has_prebuilt_deep_dive: false]** — STATE_3 is mathematical but conceptually a single step (charge conservation). DEEP-DIVE here would just slow students down. | `narrative_socratic` | `wait_for_answer` | Yes — predict: "Why must i_in equal i_out at any junction?" Pause. Reveal at TTS s3: charge-conservation primitive animates in (small charge dots flowing in matching out). |
| **STATE_4** | The two-condition rule, cleanly stated. Side-by-side comparison: **Real vector** = (1) magnitude + direction AND (2) obeys parallelogram law. **Current** = passes (1), fails (2) → scalar. Below the box, three "same trap" examples flagged: pressure, surface tension, finite rotation — all have direction-feel, all fail condition (2). **[has_prebuilt_deep_dive: true]** — students need this internalized as a procedure they can apply to any new quantity, and there are 3+ documented confusion patterns at this gate. | `worked_example` | `manual_click` | Yes — predict-pause-reveal: "Pressure has direction — does it pass condition (2)?" Reveal at TTS s4: pressure flagged in red as a fail, with one-line "P = F/A is direction-free magnitude". |
| **STATE_5** | Interactive classifier. 6 quantity cards appear one at a time: current, displacement, pressure, force, surface tension, velocity. Student taps **Scalar** or **Vector**. Live red/green feedback. Final state shows the scoreboard + the 2-condition rule re-applied to each quantity in a 6-row table. **[has_prebuilt_deep_dive: true]** — student-driven, but multiple confusion patterns surface here from miscategorisations. | `exploration_sliders` (re-purposed as tap-to-classify; primitive = `interactive_button` per quantity) | `interaction_complete` | No (final state, student drives) |

`advance_mode` variety check (Rule 15): `auto_after_tts` (×1) + `manual_click` (×2) + `wait_for_answer` (×1) + `interaction_complete` (×1) = **4 distinct values across 5 states**. PASSES.

Quality test (CLAUDE.md §7): "Could a student who watches all 5 states answer any Class-11 exam question on whether current is a vector?" YES — STATE_2 gives the empirical evidence, STATE_3 gives the formal proof, STATE_4 gives the rule as a procedure, STATE_5 lets them practice the procedure on 6 quantities including the canonical traps (pressure, surface tension).

## 3. AHA moment — the explicit insight contract (v2.2.1 addition)

```
state_id: STATE_2
statement: "Current adds like a number, not like a vector — the angle never enters."
visual_confirmation: reality_box   # the green "i = 7 A" annotation that stays constant while the red vector-prediction box swings 7 → 1.
```

Word count: 13 (≤ 15 — passes schema gate). State is in `epic_l_path.states` (passes schema reference check).

Why STATE_2 (not STATE_3 or STATE_4): STATE_3 gives the *formal* reason (Kirchhoff), but the *insight* — the mental shift from "current must be a vector" to "current behaves nothing like a vector" — happens in STATE_2 when the student sees reality stay flat while the vector prediction swings. STATE_3 just labels what STATE_2 already proved.

## 4. Cognitive limits (concept-level ceiling, v2.2.1 addition)

```
max_primitives_per_state: 5
max_labels_per_state: 3
max_words_per_tts_sentence: 18
```

Medium-tier defaults per the schema comment. Ceiling rationale per state:
- STATE_1 needs ≤ 5 primitives (two wire arrows + junction dot + question callout = 4; well under).
- STATE_2 will be the densest — two arrows + two formula boxes (reality + vector-prediction) + sweep annotation = 5 max. Tight.
- STATE_3 needs ≤ 5 — two incoming arrows + outgoing arrow + Kirchhoff formula box + (optional) charge-conservation glyph.
- STATE_4 has the two-condition rule box + same-trap examples box = 2 large primitives, well under.
- STATE_5 has 1 quantity card visible at a time + tap zones + score = ≤ 5.

If physics_author or json_author wants to exceed the ceiling on any state, FLAG to architect for skeleton revision — don't just push primitives in.

## 5. Within-state choreography plan (Socratic reveal)

Per architect spec §"Socratic reveal": every state introducing a new physical quantity needs a predict → reveal arc. STATE_1 and STATE_5 are exempt (hook + final-interactive).

### STATE_2 — sweep test
- t=0: two arrows (i1, i2) at 60° from junction. Both boxes empty (no readings yet). TTS s1: "Watch what happens when we change the angle between the wires." [setup]
- t=3s: TTS s2: "What will the ammeter read at sixty degrees?" [prediction question]
- [pause 2-3s — student predicts mentally]
- t=6s: angle sweeps from 0° to 180° (rotate animation, 6s). At each angle, both boxes update live — reality stays at 7 A, vector prediction falls. TTS s3: "Reality holds at seven amperes. Always." [reveal — green box highlighted via Focal Attention]
- t=9s: TTS s4: "The vector prediction wanders down to one. The angle never enters the real answer — the AHA insight." [explanation; AHA pulses on `reality_box` primitive]

`reveal_at_tts_id` bindings (architect proposes; json_author implements):
- `reality_box` color → `pulse_glow` triggered at `s3.id`
- `vector_box` text update → animates with the angle sweep, not pulsed
- AHA banner overlay on `reality_box` appears at `s4.id`

### STATE_3 — Kirchhoff
- t=0: two incoming arrows (i1, i2) into junction, no outgoing arrow yet. Formula box empty. TTS s1: "Why must this be true?" [setup]
- t=3s: TTS s2: "If three amperes flow in here and four amperes flow in there, what comes out?" [prediction question]
- [pause 2-3s]
- t=6s: outgoing arrow (i = 7 A, green) animates in from junction. TTS s3: "Charge can't pile up at the junction or vanish — so the only answer is seven." [reveal]
- t=9s: Kirchhoff formula box writes line by line (`charge in = charge out` → `i₁ + i₂ = i` → `NO angle, NO cosine`). TTS s4: "That's Kirchhoff's junction rule — pure scalar arithmetic." [explanation]

### STATE_4 — two-condition rule
- t=0: empty rule template visible. TTS s1: "A real vector needs two things, not one." [setup]
- t=3s: condition (1) writes in (magnitude + direction). TTS s2: "Magnitude and direction is condition one — current passes this." [reveal partial]
- t=6s: TTS s3: "What's condition two?" [prediction question]
- [pause 2-3s]
- t=9s: condition (2) writes in (parallelogram law). Pressure / surface-tension / finite-rotation flagged red as same-trap quantities. TTS s4: "Obey the parallelogram law. Current fails. So do pressure, surface tension, and finite rotation — all have direction-feel, none are vectors." [reveal + explanation]

## 6. EPIC-C branches — 4 real misconceptions (Rule 16)

Each branch's STATE_1 visualizes the wrong belief on canvas with a "Wrong belief:" annotation, never a neutral setup.

### Branch 1: `direction_means_vector`
- **Wrong belief**: "Anything with a direction is a vector."
- **STATE_1 visualization**: Two wire arrows (i1, i2) labeled with current values at a junction at 60°. Big red callout in CALLOUT_ZONE_R: **"Wrong belief: direction → vector. We'll test this in 3 states."** Wire arrows are styled like force-arrows (orange) to reinforce the trap.
- **3-4 state sequence**: belief stated → parallelogram-law test on real vectors (3+4=5 at 90°) → same test fails for currents (Kirchhoff wins) → corrected two-condition rule.
- **Trigger phrases** (physics_author finalizes): "current has direction so it is a vector", "anything with direction is a vector", "current must be a vector it flows one way", "why is current not a vector even though it has direction".

### Branch 2: `pythagoras_works_at_junctions`
- **Wrong belief**: "When two currents meet at a junction at angle θ, the total = √(i₁² + i₂² + 2·i₁·i₂·cos θ)."
- **Why this is real**: students applying the parallelogram-law formula they just learned for vector addition mechanically to a JEE assertion-reason problem about currents at a node. Heard in tutoring, scored in JEE Mains 2020 mock answer keys.
- **STATE_1 visualization**: A JEE problem stem on canvas — "Two wires bring 3A and 4A into a junction at 60°. Find total current." Below it, the student's wrong working: `√(9+16+12) = √37 ≈ 6.08 A` boxed in red with **"Wrong belief: parallelogram law applies to currents at nodes."**
- **3-4 state sequence**: wrong working stated → ammeter measurement (always 7 A) → Kirchhoff derivation → corrected procedure ("scalars: i = i₁ + i₂, no angle ever").
- **Trigger phrases**: "use parallelogram for currents", "currents at angle add by cosine rule", "i = sqrt(i1 squared + i2 squared)", "find resultant current".

### Branch 3: `current_density_implies_current_is_vector`
- **Wrong belief**: "Current density J is a vector, so current i must also be a vector."
- **Why this is real**: JEE/IIT-level confusion. Students who've seen `i = ∫J·dA` in advanced material assume the integral inherits the vector nature of J. Rare in Class 11 but real at JEE Advanced level.
- **STATE_1 visualization**: A wire cross-section with J⃗ arrows distributed across the area (vectors), then the integral `i = ∫J·dA` displayed prominently with the dot product highlighted. Red callout: **"Wrong belief: J vector ⇒ i vector. The dot product collapses it."**
- **3-4 state sequence**: belief stated → dot product yields a scalar (any J⃗·dA⃗) → integration over area preserves scalar → i is the area-integrated *flux* of J, not J itself.
- **Trigger phrases**: "current density is vector so current is vector", "integral of J dot dA", "why is i scalar if J is vector", "flux versus current".

### Branch 4: `scalars_can_never_have_direction`
- **Wrong belief**: "I learned scalars are JUST numbers — so anything with direction-feel must be a vector."
- **Why this is real**: the *opposite* trap. Students who memorized "scalars = numbers, vectors = numbers + direction" can't accept that current/pressure/surface tension are scalars because they all have direction-feel. Blocks understanding of the whole class of "scalars with directional features."
- **STATE_1 visualization**: Three quantities side by side, each with a clear direction-feel annotation: **current** (along wire), **pressure** (outward at every point), **surface tension** (along surface boundary). Big red callout: **"Wrong belief: direction-feel ⇒ vector. Three counterexamples on this canvas."**
- **3-4 state sequence**: belief stated → current fails parallelogram-law test → pressure has direction-of-action but is `F/A` which is direction-free magnitude → surface tension has direction along boundary but obeys scalar arithmetic → corrected rule (direction-feel ≠ vector).
- **Trigger phrases**: "scalars cannot have direction", "if it has direction it is vector", "pressure has direction so it is vector", "surface tension is vector".

**Branch count: 4** (Zod minimum, satisfied). Each branch is a distinct misconception, not strawman variants of the same belief.

## 7. `has_prebuilt_deep_dive` selections — STATE_4 + STATE_5

Per architect spec §"has_prebuilt_deep_dive picking": pick states that combine mathematical abstraction + core insight + multiple documented confusion patterns. STATE_3 (Kirchhoff derivation) is mathematical but conceptually a single step — defer to on-demand Sonnet generation if a student clicks Explain.

### STATE_4 — the two-condition rule (3 cluster_id candidates)

| cluster_id | description |
|---|---|
| `condition_2_unclear` | Student understands condition (1) but can't apply (2). "What does 'obey parallelogram law' actually mean as a test?" |
| `which_test_to_apply_when` | Procedural confusion. "Given an unfamiliar quantity, what's the algorithm to decide?" |
| `degenerate_parallel_case` | "At θ=0 the parallelogram law gives the same answer as scalar addition. Doesn't that mean current passes the test in some cases?" |

### STATE_5 — interactive classifier (3 cluster_id candidates)

| cluster_id | description |
|---|---|
| `pressure_seems_like_vector` | After student wrongly classifies pressure as vector. "It points outward at every surface — that's a direction." |
| `surface_tension_pull_direction` | After wrong classification of surface tension. "It pulls a needle on water — that's a direction." |
| `current_classification_just_memorized` | Student gets the right answer on the card but can't justify why. "I'm pattern-matching the lesson, not understanding." |

Physics_author fleshes out trigger_examples (3-5 student phrases per cluster) using the trigger phrases in §6 as a starting point.

## 8. `entry_state_map` (v2.2 query scoping)

```
foundational: STATE_1 → STATE_3   # default — "why isn't current a vector"
proof:        STATE_3              # "show me the formal Kirchhoff proof"
exam_trap:    STATE_4              # "JEE assertion-reason on this concept"
self_test:    STATE_5              # "let me practice classifying"
```

Default aspect = `foundational`. The classifier (Gemini Flash) can return any of the four aspect values; client picks the matching state range and TeacherPlayer plays only that slice. Cross-slice pills shown after slice ends ("See the JEE trap form?" → STATE_4; "Try the classifier?" → STATE_5).

Aspect values added to `intentClassifier.ts` ASPECT_VOCABULARY by json_author (Step 3.4 of registration sites).

## 9. `misconception_watch` per state (v2.2.1 addition)

Inline pre-emptive corrections — distinct from EPIC-C branches which fire after a wrong answer. One-liners that stop the misconception from forming in the first place.

| State | belief | one_line_fix |
|---|---|---|
| STATE_1 | "If it has direction, it must be a vector." | "Direction is condition one of two. We'll show the second condition that current fails." |
| STATE_2 | "The vector formula must be approximately right — physics formulas always have small errors." | "The two are exact. Reality is exactly seven. Vector prediction is exactly six point zero eight. They're not approximations of each other." |
| STATE_3 | "Charge conservation has nothing to do with whether current is a vector." | "Charge conservation forces algebraic addition with no angle term. That's exactly what disqualifies current from being a vector." |
| STATE_4 | "All scalar quantities are just plain numbers without any direction." | "Some scalars carry direction-feel — pressure, surface tension, current. They're still scalars because they fail the parallelogram-law test." |
| STATE_5 | (no inline watch — final interactive state; misconceptions surface as wrong taps and route to drill-down clusters) |  |

`visual_counter` (architect proposes; json_author implements as primitive references):
- STATE_1 → arrow at the bottom of the question callout: "...condition 2?"
- STATE_2 → exact-equality symbol (=, not ≈) emphasized in green box
- STATE_3 → no-angle-here highlight on Kirchhoff formula
- STATE_4 → red dot next to each "same-trap" example label

## 10. Mode overrides outline (Rule 20 — all three modes from day one)

### `mode_overrides.board` (Rule 21 — `canvas_style: "answer_sheet"` + `derivation_sequence` + `mark_scheme`)

Board exam pattern: "Why is electric current a scalar quantity? Justify with an example." (3-mark short-answer, common on Telangana / CBSE / Maharashtra Class 11 papers).

- **canvas_style**: `answer_sheet` (white ruled background)
- **derivation_sequence** (per state, handwriting-animated):
  - STATE_1: write title "Q. Why is electric current a scalar?" + heading "Statement"
  - STATE_2: write "Test: at junction, two currents at angle θ"
  - STATE_3: write derivation lines — Kirchhoff: i = i₁ + i₂ (no angle); compare with vector law |R|² = |A|² + |B|² + 2|A||B|·cos θ
  - STATE_4: write conclusion box — "Current has direction but does not obey parallelogram law → scalar"
  - STATE_5: write the two-condition table (cleanly numbered) as the answer template
- **mark_scheme** (3 marks total):
  - +1 mark: Kirchhoff equation written correctly (i = i₁ + i₂)
  - +1 mark: comparison with parallelogram law shown (vector law has cos θ; current's law does not)
  - +1 mark: conclusion sentence ("current is scalar despite direction")
- **mark_badge**: yellow "+1 mark" overlay tied to each line as it's written (3 badges total, accumulating on right margin)
- **`teaching_method` per board state**: all `worked_example`

### `mode_overrides.competitive` (JEE/NEET shortcuts + edge cases)

- **shortcuts**:
  - "**Two-condition memory rule**: vector ⇔ (mag + direction) AND (parallelogram law). One-line filter for any new quantity. Skip rotation invariance — Class 11 doesn't test it."
  - "**JEE pattern**: assertion-reason on current. Assertion 'current is vector' is FALSE; reason 'current has direction' is TRUE. Mark: A false, R true. (Saved many a JEE Mains attempt.)"
  - "**Class of traps**: pressure, surface tension, finite rotation, current — all fail condition (2). Memorize the list."
- **edge_cases**:
  - "Current density J **is** a vector. Current i is the area-integral i = ∫J·dA — the dot product collapses J to a scalar. JEE Advanced 2017 tested this distinction."
  - "Pressure has direction-of-action at any point but is defined as F/A — magnitude only. The surface element vector dA carries the direction; pressure does not."
  - "Finite rotation has magnitude (angle) and axis (direction) but does NOT commute under composition → fails parallelogram law → not a vector. Infinitesimal rotations DO commute and ARE vectors. Out-of-Class-11 footnote; surfaces only at IIT level."
- **`teaching_method` per competitive state**: `shortcut_edge_case`

### Mode coverage check (Rule 20)

`epic_l_path` (conceptual baseline) + `mode_overrides.board` + `mode_overrides.competitive` = all three modes shipped from day one. PASSES.

## 11. Prerequisites (advisory only — Rule 23)

```
prerequisites: ["scalar_vs_vector"]
```

`scalar_vs_vector` is currently a "Coming soon" ghost in the catalog. Soft advisory: students arriving here without it can still get full understanding because STATE_4 establishes the two-condition rule explicitly. The UI will show "Builds on Scalar vs Vector — 5 min intro?" as a non-blocking suggestion. When `scalar_vs_vector` ships (planned next in this batch), the catalog will continue to display `current_not_vector` as the START HERE entry — the prerequisite stays advisory.

No upstream prerequisite on `parallelogram_law_test` even though STATE_2 references the law. By design: STATE_2 derives the prediction from first principles (magnitude formula shown, no separate parallelogram-law lesson required).

## 12. Real-world anchor

**Primary**: A home electrical switchboard where two supply wires merge into the main switch. The total current arriving at the switch is the arithmetic sum of the two wire currents — it does not depend on the angle at which the wires approach the switch box. Every electrician in India understands this in their hands; few realize it's exactly the test that proves current is a scalar.

Why it hooks Class 10–12 JEE/NEET students: the switchboard is in every house. The student has watched their father or an electrician work behind that panel. The wires-at-an-angle visual is exactly what STATE_1 shows on canvas. The hook lands because it converts a familiar object into a physics question.

**Secondary**: An auto-rickshaw stand on Brigade Road, Bengaluru. Three rickshaws arrive from three different streets at random angles. Total rickshaws at the stand = simple count = 1 + 1 + 1 = 3. The angle from which they came is irrelevant. Same scalar-addition logic — count quantities never add as vectors regardless of how directional their approach was.

**Tertiary** (depth, optional): A river delta near Vijayawada where the Krishna river splits into branches that rejoin downstream. Total water flow downstream equals the sum of upstream branches, regardless of branch angle. Used as a metaphor only — water flow as a continuum *can* be modelled as a vector field, so this anchor is optional and physics_author may drop it if it muddies the message.

**Indian-context check** (CLAUDE.md Section 8): all three anchors are India-specific (home switchboard, Brigade Road auto-rickshaws, Krishna delta). Plain English throughout. No Hinglish ("zameen", "deewar", "tum", "hain"). DC Pandey example problems not used.

## 13. DC Pandey check (architect's self-review)

Consulted DC Pandey Vol 1 Ch. 5 Section 5.1 **table of contents only** to confirm scope. The "scalar with direction" trap is in 5.1, with current as the canonical example. The companion `pressure_scalar` concept lives in the same section.

**No teaching method imported.** State 1–5 arc is authored from the Socratic-reveal pacing rule (architect spec §"Socratic reveal"), not from any DC Pandey chapter sequence.

**No example problem imported.** Real-world anchor is the Indian home switchboard, not any DC Pandey example.

**No figure reference imported.** Every primitive in scene_composition is newly composed by physics_author + json_author.

## 14. Engine bug queue consultation

Out of scope to query Supabase from this skeleton (no DB access in the architect step). Quality_auditor MUST run the SQL query at gate 8 before ship:

```sql
SELECT bug_class, prevention_rule, owner_cluster, severity
FROM engine_bug_queue
WHERE status = 'FIXED'
  AND (owner_cluster = 'alex:architect' OR cardinality(concepts_affected) >= 5);
```

Architect notes any prevention rules already known from PROGRESS.md sessions 28–34 that this skeleton must satisfy:

- **Production-routing disconnect** (session 30): json_author MUST add `current_not_vector` to `PCPL_CONCEPTS` in `aiSimulationGenerator.ts` if the renderer is parametric (mostly arrows + annotations — likely PCPL). If keeping `mechanics_2d` per renderer_pair, no change needed.
- **mode_overrides shape** (session 31.5): board mode MUST use the v2.2 shape with `derivation_sequence` per state, not the legacy `phase_2_content` shape.
- **Missing 4-branch minimum** (Zod): legacy file has 1 EPIC-C branch. New version has 4. Verify Zod passes.
- **All-`auto_after_tts` rejection** (Rule 15): legacy file has all 4 states on auto. New version has 4 distinct advance_modes across 5 states.

## 15. Self-review checklist

- [x] Atomic claim is ONE sentence.
- [x] State count (5) matches §7 medium-tier band (5–6).
- [x] 4 EPIC-C branches, each with a real (not strawman) misconception.
- [x] Each EPIC-C STATE_1 plan describes visualizing the wrong belief in primitives, not just stating it in a teacher_script sentence.
- [x] 2 `has_prebuilt_deep_dive` states picked (STATE_4, STATE_5), each with 3 cluster_id candidates.
- [x] Every EPIC-L state has a `teaching_method` field.
- [x] Every state introducing a new physical quantity has a within-state Socratic-reveal plan (STATE_2, STATE_3, STATE_4 explicitly; STATE_1 + STATE_5 exempt per spec).
- [x] `entry_state_map` declared with `foundational` range plus 3 aspect-specific ranges.
- [x] Prerequisites (`scalar_vs_vector`) listed as advisory; ghost-status flagged.
- [x] Real-world anchor is Indian, plain English, physics-true.
- [x] DC Pandey check line included: scope only, no teaching method copied.
- [x] Engine bug queue prevention rules from PROGRESS.md sessions 28–34 noted; quality_auditor to query DB at gate 8.
- [x] v2.2.1 fields authored: `concept_tier` (medium), `cognitive_limits` (5/3/18), `aha_moment` (STATE_2), `misconception_watch` (per state, STATE_1–4).
- [x] No section missing. Skeleton is handoff-ready to physics_author.

---

## Handoff to physics_author

Next step: clear context. Claude reads ONLY `.agents/physics_author/CLAUDE.md` + this skeleton. Produces the physics block: variables, computed_outputs, formulas, constraints, mark_scheme line items, drill-down trigger_examples (3–5 phrases per cluster_id), exact tts_sentences (text_en, ≤ 18 words each per `cognitive_limits`), prediction questions verbatim.

Variables already present in legacy file (cherry-pick + verify):
- `i1` (current in wire 1), default 3 A, range 0.5–10 A
- `i2` (current in wire 2), default 4 A, range 0.5–10 A
- `theta_deg` (angle between wires), default 60°, range 0–180°

Computed outputs already present (cherry-pick + verify):
- `i_scalar_actual = i1 + i2` (the truth)
- `i_if_vector = sqrt(i1² + i2² + 2·i1·i2·cos(theta_deg·π/180))` (the wrong prediction)
- `mismatch = abs((i1 + i2) - sqrt(i1² + i2² + 2·i1·i2·cos(theta_deg·π/180)))` (gap between truth and wrong prediction)

Physics_author may rename, add (e.g., per-quantity flags for STATE_5 cards), or drop these — the legacy is a starting reference, not a binding contract.

---
---

# PHYSICS BLOCK (physics_author, 2026-05-04)

Produced by: physics_author agent (2026-05-04)
Upstream input: architect skeleton above (sections 1–15).
Output for: json_author (next pipeline step).

## 16. `physics_engine_config`

```json
{
  "variables": {
    "i1": {
      "name": "Current in wire 1",
      "unit": "A",
      "min": 0.5,
      "max": 10,
      "default": 3
    },
    "i2": {
      "name": "Current in wire 2",
      "unit": "A",
      "min": 0.5,
      "max": 10,
      "default": 4
    },
    "theta_deg": {
      "name": "Angle between incoming wires",
      "unit": "deg",
      "min": 0,
      "max": 180,
      "default": 60
    }
  },
  "formulas": {
    "kirchhoff_law": "i = i1 + i2",
    "parallelogram_prediction": "sqrt(i1*i1 + i2*i2 + 2*i1*i2*cos(radians(theta_deg)))",
    "vector_test_pass_condition": "REAL_VALUE == parallelogram_prediction at every theta"
  },
  "computed_outputs": {
    "i_actual": {
      "formula": "i1 + i2"
    },
    "i_vector_pred": {
      "formula": "sqrt(i1*i1 + i2*i2 + 2*i1*i2*cos(radians(theta_deg)))"
    },
    "gap_amperes": {
      "formula": "abs((i1 + i2) - sqrt(i1*i1 + i2*i2 + 2*i1*i2*cos(radians(theta_deg))))"
    }
  },
  "constraints": [
    "Charge is conserved at every junction (Kirchhoff's current law)",
    "i_actual = i1 + i2 always, regardless of wire angle",
    "i_vector_pred equals i_actual ONLY when theta = 0; for every other angle they diverge",
    "At theta = 180 the vector model predicts |i1 - i2|, but reality still measures i1 + i2",
    "Current density J is a vector; current i = integral of J dot dA collapses J to a scalar",
    "Vector classification requires BOTH (1) magnitude+direction AND (2) parallelogram-law obedience"
  ]
}
```

**Numerical sanity check** (run before signing off):

| theta_deg | cos(θ) | i_actual | i_vector_pred | gap |
|---|---|---|---|---|
| 0 | 1.000 | 7.00 | 7.00 | 0.00 (degenerate parallel — they agree) |
| 60 | 0.500 | 7.00 | 6.08 | 0.92 |
| 90 | 0.000 | 7.00 | 5.00 | 2.00 |
| 120 | −0.500 | 7.00 | 3.61 | 3.39 |
| 180 | −1.000 | 7.00 | 1.00 | 6.00 |

Math checks out. Narrative numbers in STATE_2 ("seven amperes always" + "vector predicts 6.08 at 60°" + "drops to 1 at 180°") are all consistent with the formulas above.

## 17. Per-state variable notes (variable_overrides)

| State | variable_overrides | Why |
|---|---|---|
| STATE_1 | none (uses defaults i1=3, i2=4, theta_deg=60) | Hook setup. Defaults match the visual: two wires at 60°. |
| STATE_2 | none — `theta_deg` is **animated** 0° → 180° over 6s, not slider-driven | The sweep IS the lesson. theta_deg is a time-driven value, not a student input. Json_author wires animation via existing `animation: { type: "rotate_about", from_deg: 0, to_deg: 180, duration_sec: 6 }` on `wire_2_sweep`. |
| STATE_3 | `{ "theta_deg": 60 }` | STATE_3 picks up where STATE_2's sweep ended (60° snapshot) for the formal Kirchhoff derivation. Locking theta prevents a stale-slider leak from STATE_2. **This is a session 30.7 defensive override** — bug class `default_variables_only_first_var_merged`. |
| STATE_4 | none (no numeric — conceptual rule) | The two-condition rule is text-only, no slider math. |
| STATE_5 | `{ "i1": 3, "i2": 4, "theta_deg": 60 }` (lock all three to defaults) | STATE_5 doesn't use these variables in its physics — but locking them prevents any stale-slider leak from STATE_2/3 from contaminating any back-reference. Plus, if the student rewinds to STATE_2 from STATE_5, they get a clean restart. |

**STATE_5 special note for json_author**: STATE_5's physics is NOT current-junction physics. It's a tap-to-classify drill across 6 quantity cards. The `physics_engine_config` variables don't apply. Recommend authoring a parallel `state_5_quantity_cards` array on STATE_5 (passthrough on schema):

```json
"state_5_quantity_cards": [
  { "id": "q_current",          "label": "Current",          "correct": "scalar", "trap_hint": "has direction-of-flow but fails parallelogram law" },
  { "id": "q_displacement",     "label": "Displacement",     "correct": "vector", "trap_hint": "passes both conditions" },
  { "id": "q_pressure",         "label": "Pressure",         "correct": "scalar", "trap_hint": "F/A — magnitude only" },
  { "id": "q_force",            "label": "Force",            "correct": "vector", "trap_hint": "passes both conditions" },
  { "id": "q_surface_tension",  "label": "Surface tension",  "correct": "scalar", "trap_hint": "has pull direction but obeys scalar arithmetic" },
  { "id": "q_velocity",         "label": "Velocity",         "correct": "vector", "trap_hint": "passes both conditions" }
]
```

Order: 6 cards, 3 vectors + 3 scalars-with-direction-feel. The 3 scalars are exactly the "same trap" examples flagged in STATE_4 + the concept's own canonical example (current). This gives students immediate practice on the misconception class they just learned to dismantle.

## 18. Within-state reveal timeline (Socratic reveal — required)

Architect flagged STATE_2, STATE_3, STATE_4 as needing Socratic-reveal pacing. STATE_1 (hook setup) and STATE_5 (final interactive) are exempt.

### STATE_2 — sweep test reveal timeline

| sentence id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s1 | "Watch what happens when we change the angle between the two wires." | wire_1_sweep, wire_2_sweep | already_visible | 1500 |
| s2 | "Predict — what will the ammeter read at sixty degrees?" | — (prediction question) | — | 2500 |
| s3 | "Reality always reads seven amperes. The angle does not enter." | reality_box | fade_in + focal_highlight | 1500 |
| s4 | "Current adds like a number, not like a vector. That is the rule." | aha_banner | pulse_glow | 1500 |

Word counts: s1=12, s2=10, s3=10, s4=14 — all within the 18-word `cognitive_limits` cap.

**Continuous (non-TTS-bound) animation note**: `vector_box.text_expr` updates live as `theta_deg` sweeps 0° → 180° over the 6 seconds spanning s2→s4. No `reveal_at_tts_id` binding for `vector_box` — its updates are continuous via the `wire_2_sweep` animation, not discrete via TTS. Json_author wires `vector_box.text_expr` to `i_vector_pred` (the computed_output) so it auto-re-renders on every animation frame.

**AHA banner**: appears at s4 with a yellow `annotation` (`color: "#FCD34D"`, `style: "callout"`) reading exactly the AHA statement: "Current adds like a number, not like a vector — the angle never enters." The `pulse_glow` action draws the focal-attention highlight to it for 1.5s.

### STATE_3 — Kirchhoff reveal timeline

| sentence id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s1 | "Why must this be true? Charge cannot pile up at a junction." | wire_in_1, wire_in_2 | already_visible | 1500 |
| s2 | "Predict — three amperes in here, four in there. What flows out?" | — (prediction question) | — | 2500 |
| s3 | "Seven amperes — the only answer that conserves charge." | wire_out | fade_in | 1500 |
| s4 | "Kirchhoff's rule. No angle term. Pure scalar arithmetic." | kirchhoff_box | handwriting (line by line) | 1500 |

Word counts: s1=12, s2=13, s3=9, s4=8.

**Handwriting sequencing**: `kirchhoff_box` writes 3 lines in order at s4: line 1 "Charge in = charge out", line 2 "i₁ + i₂ = i", line 3 "(no angle, no cos θ)". Each line takes ~500ms. Total handwriting duration ≈ 1500ms, ending at the s4 pause boundary.

### STATE_4 — two-condition rule reveal timeline

| sentence id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s1 | "A real vector needs two things, not one." | rule_box (empty template) | already_visible | 1200 |
| s2 | "Magnitude and direction is condition one. Current passes this." | condition_1_line | handwriting | 1200 |
| s3 | "What is condition two? Predict before reading on." | — (prediction question) | — | 2500 |
| s4 | "Obey the parallelogram law. Current fails. So do pressure, surface tension, finite rotation." | condition_2_line, same_trap_box | handwriting + slide_in_from_right | 1500 |

Word counts: s1=8, s2=9, s3=8, s4=13.

**`same_trap_box` content**: three labels stacked vertically — "pressure: F/A, no direction in formula", "surface tension: pull along boundary, scalar arithmetic", "finite rotation: has axis, fails commutativity". Each label preceded by a small red dot (`bullet_marker` with `color: "#EF4444"`) per architect's `misconception_watch.STATE_4.visual_counter` directive.

## 19. Board-mode mark scheme + derivation_sequence

3 marks total. Distributed across STATE_3, STATE_4, STATE_5 (the marked states). STATE_1 and STATE_2 are setup states — `mark_badge.marks: 0`.

### Per-state derivation_sequence

**Board STATE_1** (marks=0, label="Setup"):
- Line 1: "Q. Why is electric current a scalar quantity?"
- Line 2: "Statement: Current carries direction along wire but classifies as scalar."

**Board STATE_2** (marks=0, label="Setup"):
- Line 1: "Setup: i₁ = 3 A, i₂ = 4 A enter junction at angle θ"
- Line 2: "Place ammeter on outgoing wire. Measure i_total."

**Board STATE_3** (marks=+1, label="Kirchhoff equation"):
- Line 1: "By charge conservation at junction:"
- Line 2: "i = i₁ + i₂"
- Line 3: "(No angle term, no cos θ)"

**Board STATE_4** (marks=+1, label="Comparison shown"):
- Line 1: "Vector addition law:"
- Line 2: "|R|² = |A|² + |B|² + 2|A||B|·cos θ"
- Line 3: "Current's law: i = i₁ + i₂ (no cos θ)"
- Line 4: "Therefore current does not obey parallelogram law."

**Board STATE_5** (marks=+1, label="Conclusion"):
- Line 1: "Conclusion:"
- Line 2: "Current has direction-of-flow but obeys scalar arithmetic."
- Line 3: "Therefore current is a scalar quantity."

### mark_scheme summary

```json
"mark_scheme": {
  "total_marks": 3,
  "per_state": {
    "STATE_1": { "marks": 0, "label": "Setup",                "cumulative": 0 },
    "STATE_2": { "marks": 0, "label": "Setup",                "cumulative": 0 },
    "STATE_3": { "marks": 1, "label": "Kirchhoff equation",   "cumulative": 1 },
    "STATE_4": { "marks": 1, "label": "Comparison shown",     "cumulative": 2 },
    "STATE_5": { "marks": 1, "label": "Conclusion",           "cumulative": 3 }
  }
}
```

**mark_badge primitives** (json_author renders one per state, position right margin, color amber, accumulator visible from STATE_3 onwards):
- STATE_1, STATE_2: badge invisible / `marks: 0`
- STATE_3: badge "+1 (Kirchhoff)" appears, accumulator shows "1/3"
- STATE_4: badge "+1 (Comparison)" appears, accumulator shows "2/3"
- STATE_5: badge "+1 (Conclusion)" appears, accumulator shows "3/3"

**`teaching_method` per board state**: all 5 states use `worked_example` (board-mode constant per architect spec).

## 20. Drill-down cluster phrasings (5 per cluster)

Confusion phrases as a real Indian Class 11 student would type them. Lowercase, no punctuation rigor, occasional typos. NOT teacher prose.

### STATE_4 deep-dive clusters

**`condition_2_unclear`** (5 phrases for `trigger_examples TEXT[]`):
1. "what does parallelogram law actually mean"
2. "how do i check condition 2"
3. "is the parallelogram thing same as cosine rule"
4. "i don't get how to test condition 2"
5. "parallelogram law sounds vague"

**`which_test_to_apply_when`**:
1. "given a new quantity what do i do first"
2. "is there a step by step way to check"
3. "how do i decide scalar or vector for any new thing"
4. "what is the algorithm for classifying quantities"
5. "the test feels random which one to use"

**`degenerate_parallel_case`**:
1. "but at zero degrees both formulas give 7"
2. "so current is vector when wires are parallel"
3. "what about theta equals zero case"
4. "if they agree at zero why call current scalar"
5. "the parallel case looks like current passes the test"

### STATE_5 deep-dive clusters

**`pressure_seems_like_vector`**:
1. "pressure pushes outward thats a direction"
2. "why is pressure scalar it acts in all directions"
3. "fluid pressure has direction at every point"
4. "isnt pressure a vector because it pushes on walls"
5. "pressure on a wall has a clear direction"

**`surface_tension_pull_direction`**:
1. "surface tension pulls a needle thats a direction"
2. "why is surface tension scalar it has direction"
3. "the tension pulls along the surface direction"
4. "isnt surface tension acting in a direction"
5. "needle floats because surface tension pulls up"

**`current_classification_just_memorized`**:
1. "i got it right but i don't know why"
2. "im just remembering the answer"
3. "explain why again i can't remember the reason"
4. "how do i actually justify this on a test"
5. "i picked scalar but i was guessing"

Total: 30 trigger phrases across 6 clusters. Json_author writes these into the `confusion_cluster_registry` SQL migration.

## 21. Constraint callouts (json_author algebra notes)

1. **Angle units in formulas**: `theta_deg` is in degrees in UI. ALWAYS wrap in `radians(theta_deg)` inside `sin`/`cos`/`tan` calls. Verified in §16 formulas. Per CLAUDE.md rule 14 + physics_author spec line 69. Bug if `cos(theta_deg)` ever appears unwrapped — instant Gate 4 failure.

2. **STATE_2 sweep + live label binding**: `theta_deg` animates 0° → 180° over 6s via the existing `wire_2_sweep.animation: { type: "rotate_about", pivot: junction_O, from_deg: 0, to_deg: 180, duration_sec: 6 }` (cherry-picked from legacy STATE_2). Json_author MUST bind `vector_box.text_expr` to re-render on every frame using `i_vector_pred` from `computed_outputs`. Suggested expr:
   ```
   "If current were a vector\n|i_vec| = sqrt(i1² + i2² + 2·i1·i2·cos θ)\nθ = {theta_deg.toFixed(0)}° → {i_vector_pred.toFixed(2)} A"
   ```
   The `reality_box.text_expr` stays static at `"Measured at junction\ni = i1 + i2 = {(i1 + i2).toFixed(0)} A\n\nConstant for every θ."`

3. **STATE_3 variable lock — defensive `variable_overrides`**: `{ "theta_deg": 60 }` on STATE_3 prevents STATE_2's swept theta from leaking. Session 30.7 bug class. Add comment in JSON for future maintainers: `// session 30.7 defensive: theta_deg locked to 60° to match STATE_2 final-frame snapshot`.

4. **STATE_5 quantity-cards primitive**: Reuse `interactive_button` (built primitive) — one per quantity card. Each button has `data: { id, label, correct, trap_hint }` from §17. Card layout: 3 rows × 2 columns OR carousel. Recommend carousel — one card visible at a time + tap zones (Scalar / Vector). Score panel in CALLOUT_ZONE_R.

5. **AHA banner primitive**: NEW visual treatment NOT in canonical PCPL list. Recommend reuse of `annotation` with `style: "callout"` + `color: "#FCD34D"` + larger font (`font_size: 18`). Position: above `reality_box` in CALLOUT_ZONE_R. If reuse looks weak in `/admin/sim-viewer` review, FILE engine bug to E12 (PCPL primitive library) for `aha_banner` as first-class primitive — peter_parker:renderer_primitives owns.

6. **mark_badge accumulator wiring**: Json_author renders ONE `mark_badge` primitive per board-mode state, positioned at right margin (zone `MARK_ACCUMULATOR_ZONE`). Schema:
   ```json
   { "type": "mark_badge", "id": "badge_state_3", "marks": 1, "label": "Kirchhoff equation", "position": { "x": 720, "y": 100 }, "cumulative_display": "1/3" }
   ```
   Setup states (STATE_1, STATE_2) have `marks: 0` and the badge is rendered hidden (`opacity: 0`) so the accumulator only "lights up" from STATE_3 onwards.

7. **Conceptual mode slider panel for STATE_5**: STATE_5 doesn't use i1/i2/theta_deg sliders. Json_author should set STATE_5's UI hint to suppress the slider panel and show a "score panel" instead. If the slider panel is unconditional in the current renderer, FILE engine bug to E10 / peter_parker:renderer_primitives for state-conditional slider visibility.

8. **panel_b_config for this concept**: The legacy uses `panel_b: graph_interactive`. Recommended Panel B trace for v2.2 retrofit:
   - x_axis: `theta_deg` (0–180)
   - y_axis: current (1–8 A)
   - Trace 1 (green, solid): `i_actual` = constant 7 A horizontal line
   - Trace 2 (red, dashed): `i_vector_pred` = falling curve from 7 to 1
   - Live dot: tracks current `theta_deg` across both traces simultaneously

   This panel B turns the central comparison into a visual the student can scrub via theta_deg slider in STATE_2 (after the auto-sweep completes). Adds memorability.

## 22. Engine bug queue prevention rules satisfied

Per architect skeleton §14 prevention rules:

- ✅ **Bug #1 default_variables_only_first_var_merged** (session 30.7): All 3 variables (`i1`, `i2`, `theta_deg`) explicitly declared with full schema (name, unit, min, max, default). STATE_3 + STATE_5 use defensive `variable_overrides` to prevent slider leaks. Json_author MUST wire all 3 through `default_variables` block, not silently fall back to 1.
- ✅ **Production-routing disconnect** (session 30): Renderer pair stays `panel_a: mechanics_2d, panel_b: graph_interactive`. If json_author switches to PCPL during retrofit, MUST also add `current_not_vector` to `PCPL_CONCEPTS` set in `aiSimulationGenerator.ts` (around line 2564 per CLAUDE.md §6). Flag for json_author Step 3.3.
- ✅ **mode_overrides shape** (session 31.5): board mode uses v2.2 shape with `derivation_sequence` per state (§19) and `mark_scheme.per_state` map. NOT the legacy `phase_2_content` shape.
- ✅ **Missing 4-branch minimum** (Zod): physics_author confirms 4 EPIC-C branches per architect §6 (`direction_means_vector`, `pythagoras_works_at_junctions`, `current_density_implies_current_is_vector`, `scalars_can_never_have_direction`). Json_author authors all 4 with 4 states each (16 EPIC-C states total).
- ✅ **All-`auto_after_tts` rejection** (Rule 15): 5 EPIC-L states use 4 distinct advance_modes (auto_after_tts ×1, manual_click ×2, wait_for_answer ×1, interaction_complete ×1). Verified in architect §2.

Quality_auditor MUST run live SQL query at gate 8 to catch any new prevention rules added after session 34.

## 23. Self-review checklist

- [x] Every symbol referenced in skeleton states (i1, i2, theta_deg, kirchhoff law, parallelogram-prediction, two-condition rule) appears in `variables` or `formulas`.
- [x] Every formula uses `radians()` for angle args: `cos(radians(theta_deg))` in 2 places (formulas + computed_outputs).
- [x] At least one state has slider — STATE_2 has `theta_deg` (animated, slider-rewindable post-sweep).
- [x] `variable_overrides` documented for STATE_3 (`theta_deg: 60`, defensive) and STATE_5 (`i1/i2/theta_deg` reset).
- [x] Mark scheme totals 3 marks across STATE_3, STATE_4, STATE_5; STATE_1 + STATE_2 setup states have `marks: 0` badges.
- [x] Drill-down phrasings (30 total, 5 per 6 clusters) sound like real students (lowercase, occasional typos, no teacher voice).
- [x] `constraints` block has 6 short factual assertions.
- [x] Numerical sanity check: i1=3, i2=4, theta=60° → i_actual=7, i_vector_pred=6.08, gap=0.92. Matches narrative. Also verified θ=0 (degenerate) and θ=180 (max gap).
- [x] Within-state reveal timeline written for STATE_2, STATE_3, STATE_4 (the 3 states architect flagged with new physical quantities). Every reveal row binds TTS sentence id → `reveal_primitive_id` + `reveal_action` + `pause_after_ms`. Prediction questions get 2500ms pause; reveals get 1500ms.
- [x] Engine bug queue prevention rules from architect §14 satisfied; quality_auditor to run live SQL at gate 8.
- [x] DC Pandey check: Kirchhoff junction rule derived from charge conservation (first principle). Parallelogram-law formula derived from vector algebra (first principle). All teacher_script tts_sentences authored fresh from the within-state reveal pacing rule, not paraphrased from any textbook.
- [x] All TTS sentences ≤ 18 words (cognitive_limits cap). Manually verified all 12 EPIC-L tts_sentences (3 states × 4 sentences).
- [x] No section missing. Physics block is handoff-ready to json_author.

---

## Handoff to json_author

Next step: clear context. Claude reads ONLY `.agents/json_author/CLAUDE.md` + this combined skeleton + physics block. Produces:

1. The full v2.2 JSON file at `src/data/concepts/current_not_vector.json` (overwrites legacy v2.0).
2. SQL migration for `confusion_cluster_registry` (6 cluster rows × ~5 trigger_examples each).
3. Touches the 6 registration sites per CLAUDE.md §6: `concept_panel_config` SQL INSERT, `CONCEPT_RENDERER_MAP` in `aiSimulationGenerator.ts`, `VALID_CONCEPT_IDS` in `intentClassifier.ts`, `ASPECT_VOCABULARY` for the 4 aspects in `entry_state_map`, `PCPL_CONCEPTS` if switching renderer, `prerequisites` graph entry.
4. Verifies via `npx tsc --noEmit` (0 errors) and `npm run validate:concepts` (this concept PASSES; other 48 may still fail — that's separate retrofit work).

EPIC-C branches (4 of them, 4 states each = 16 states) are authored fresh by json_author from the misconception names + STATE_1 visualization plans in architect §6. Physics_author has not pre-authored EPIC-C state content here — that's in scope for json_author with optional refinement back to physics_author if formulas are needed.
