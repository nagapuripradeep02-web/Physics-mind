# ARCHITECT SKELETON — `magnetic_field_circular_loop`

> Stage 1 of the Alex pipeline (architect → physics_author → json_author → quality_auditor).
> Concept: **The magnetic field of a circular current loop** · Chapter 4 (Moving Charges and Magnetism) · §4.6 · class_level 12 · renderer **field_3d** (NEW scenario `magnetic_field_circular_loop`).
> Conceptual-only ship (Rule 20 suspended → NO `mode_overrides`). EPIC-L-first (Rule 16a; **zero `epic_c_branches`**). Archetype **A-meta** (field *derivation* by superposition) fused with archetype **A** (axial field + grip RHR). See `docs/patterns/magnetism.md`.

---

## Pre-flight: engine_bug_queue consultation

Live query not run (no credentialed shell). Consulted canonical content: `docs/patterns/magnetism.md`, `docs/MAGNETISM_ARCHITECTURE.md`, and the `_seed_engine_bug_queue_*.ts` scripts. High-impact rules for a circular-loop field_3d sim, all satisfied or FLAGged below:

- `field3d_scene_background_white_when_pvl_colors_lacks_background` (current_loop_acts_as_dipole scar): if the JSON sets `pvl_colors`, it **must** include `"background": "#0A0A1A"`.
- `field3d_rhr_hand_static_no_curl_choreography`: every cross-product / grip hand must be **articulated and PERFORM** the rule (curl, pause, per-beat brightness highlight), never a static mesh.
- `field3d_visible_elements_substring_match_greedy`: use **full element ids** as tokens; never a bare prefix (`cl_B` greedily grabs `cl_B_center`, `cl_B_axis`, `cl_B_center_label`).
- `field3d_scenario_missing_devstatemeta_recognition`: register `magnetic_field_circular_loop` in `src/lib/validators/visual/deriveStateMeta.ts` in the SAME change as the renderer (FLAG → `peter_parker:renderer_primitives`).
- `teach_distinct_reference_lines_for_two_radii`: R (loop radius, in-plane) and z (axial distance) are two length scales conflated in `B(z)` — draw both as distinct labelled lines.
- `teach_concrete_before_abstract_compare`, `teach_coordinate_sim_with_graph`, `teach_visual_must_match_narration`, `teach_do_not_prespoil_a_later_reveal` — applied per-state.

---

## 1. Atomic claim

A circular loop of current **I**, radius **R**, with **N** turns produces a magnetic field whose magnitude at the loop center is **B = μ₀NI/2R**, axial (⊥ the loop plane, direction by the right-hand grip rule), built because **every current element's dB at the center points the same axial way and they superpose** — and on the axis at distance z the field is **B(z) = μ₀NIR²/2(R²+z²)^{3/2}**, maximal at the center and falling off with z. It does **not** cover the dipole/bar-magnet identity or the torque on the loop (→ `current_loop_acts_as_dipole`), nor the single-element Biot–Savart law itself (assumed from `biot_savart_law`).

---

## 2. State count + arc (7 EPIC-L states — complexity-driven, Rule 11)

| State | Purpose (one line) | `teaching_method` | `advance_mode` |
|---|---|---|---|
| **STATE_1** | Hook + setup: a circular coil carries current I, radius R, N turns — *how strong is the field at its center?* | `narrative_socratic` | `auto_after_tts` |
| **STATE_2** | One element's dB at the center: a small `dl`, its `dB` is **axial** (⊥ plane), size μ₀I·dl/4πR² — Biot–Savart recall (cross-product rule). | `narrative_socratic` | `manual_click` |
| **STATE_3** | **PRIMARY AHA** — superposition: go round the ring; every dB points the **same +z way**, so they **ADD** (never cancel). | `narrative_socratic` | `wait_for_answer` |
| **STATE_4** | The sum collapses to **B = μ₀NI/2R** — clean, axial, maximal on the axis here. (Supporting aha; wire-vs-loop compare.) | `derivation_first_principles` | `manual_click` |
| **STATE_5** | Direction by the **grip RHR**: curl fingers with the current → thumb gives B up the axis; **reverse current → B reverses** (shown). | `narrative_socratic` | `wait_for_answer` |
| **STATE_6** | On-axis falloff: slide the sample point along z; **B(z) = μ₀NIR²/2(R²+z²)^{3/2}**, strongest at the center. (sim + graph in lockstep.) | `narrative_socratic` | `wait_for_answer` |
| **STATE_7** | Explore: sliders **I, R, N, z** with a live B_center / B(z) readout. | `exploration_sliders` | `interaction_complete` |

`advance_mode` = 4 distinct → Rule 15 ✓. `has_prebuilt_deep_dive: true` on **STATE_3** + **STATE_6**; others `false`.

---

## 3. Within-state choreography (Socratic-reveal timelines)

Base scene t=0 → prediction (with `pause_after_ms`) → reveal synced to naming sentence → explanation. Motion on the state clock (Rule 26). json_author **must carry every `pause_after_ms`**. One-shot reveals hold their end pose.

**STATE_2 — introduces `dB`, `r̂`.** t=0: ring + current dots (label **I**), center `cl_center` (**O**), in-plane radius `cl_radius_line` (**R**). Prediction s2: "one little element makes a field dB — which way at the center?" `pause_after_ms: 3000`. Reveal: `cl_dl_marker` (**dl**) brightens, `cl_rhat_arrow` (**r̂**) draws element→center, articulated cross-product hand curls dl→r̂→thumb, `cl_db_arrow` (**dB**) grows **straight out along the axis**. Panel `dB = (μ₀/4π)·I dl / R²`.

**STATE_3 — Σ dB (PRIMARY AHA).** t=0: the single STATE_2 `dB` still axial. Prediction s3: "go round the ring — cancel or add?" `pause_after_ms: 3500`, `wait_for_answer`. Reveal staggered (opposite side first to confront cancel-instinct): every dB points the **same +z way**, stacking into a growing axial bundle (brightness/count, never scale).

**STATE_4 — B_center magnitude (supporting aha).** Bundle merges into one bold `cl_B_center` (**B**); `B = μ₀NI/2R` writes in. Concrete compare: recall straight-wire `μ₀I/2πR` alone, then place loop's axial field beside it → **2R, not 2πR**, field threads **through** the loop. N linear; B ∝ 1/R.

**STATE_5 — direction + current-flip.** Reveal-1 grip rule (articulated): fingers curl WITH current, thumb up axis (`thumb_direction [0,0,1]`). Prediction s5: "reverse the current — which way B?" `pause_after_ms: 3000`, `wait_for_answer`. Reveal-2 (**must be shown**): dots reverse, hand re-curls, `cl_B_center` **flips**.

**STATE_6 — on-axis falloff B(z) (sim + graph).** Two distinct labelled lines: `cl_radius_line` (**R**, in-plane) + `cl_axis_line` (**z**, axial). Prediction s6: "slide out along the axis — where is B strongest?" `pause_after_ms: 3000`, `wait_for_answer`. Reveal (ONE param drives BOTH): `cl_axis_point` slides along z; `cl_B_axis` (**B(z)**) + `cl_b_bar` shrink in lockstep while a dot tracks `cl_bz_graph`. Panel (gated here only) `B(z) = μ₀NIR² / 2(R²+z²)^{3/2}`.

**STATE_7 — explore.** Sliders I, R, N, z; live readout; **idle auto-sweep** so headless capture isn't static; render full immediately, track slider live; R-change redraws a **complete ring each frame about a fixed center**.

---

## 4. Misconception confrontation (EPIC-L-first, Rule 16a — NO `epic_c_branches`)

| # | Wrong belief | EPIC-L state | Visual counter |
|---|---|---|---|
| M1 | "B at the center lies in the loop's plane / circles like a wire / along the current." | **STATE_2** | `cl_db_arrow` pops **straight out along the axis** (⊥ plane); hand shows dl & r̂ in-plane → dB axial. |
| M2 | "The dB's from opposite sides **cancel**." | **STATE_3** | Walk the ring: every dB swings to the **same** axial direction; the stack only **grows**. |
| M3 | "Center field is the wire formula **μ₀I/2πR**." | **STATE_4** | Wire's circular field alone, then loop's axial field beside it: **2R, not 2πR**. |
| M4 | "A **bigger loop** gives a **stronger** center field." | **STATE_4** (+ STATE_7) | B ∝ 1/R — R grows → `cl_B_center` / readout **shrinks**. |
| M5 | "Reversing the current doesn't change B's direction." | **STATE_5** | Current reverses → grip hand re-curls → `cl_B_center` **flips**. |
| M6 | "The axial field is uniform / strongest off-center." | **STATE_6** | Slide z out: `cl_B_axis` + bar + graph fall **monotonically**; tallest at z=0. |

---

## 5. `has_prebuilt_deep_dive` states (cache hint, NOT a gate; V1.0 ships zero authored)
- **STATE_3** — the superposition leap (PRIMARY aha; symmetry instinct says "cancel").
- **STATE_6** — the two-length-scale formula B(z) (R-vs-z conflation).

## 6. Drill-down clusters (3 candidate cluster_ids each)
- **STATE_3:** `why_dbs_dont_cancel` · `only_axial_survives` · `sum_to_clean_number`.
- **STATE_6:** `R_versus_z_in_formula` · `why_max_at_center` · `far_field_axial_limit`.

## 7. `entry_state_map`
```
foundational: STATE_1 → STATE_5    # field at the centre: magnitude + direction (PRIMARY aha STATE_3 inside)
direction:    STATE_5              # which way B points (grip RHR + flip)
on_axis:      STATE_6              # field on the axis / off-centre (B(z) falloff)
explore:      STATE_7              # sandbox sliders
```
End-of-foundational pills: "See how it weakens off the centre? →" → on_axis; "Play with I, R, N →" → explore.

## 8. Prerequisites (advisory, Rule 23)
`[biot_savart_law, magnetic_field_wire]` — both shipped/gold-standard. Supplies dB law (STATE_2) and μ₀I/2πR wire contrast (STATE_4).

## 9. Real-world anchor (Indian, plain English)
**Primary — the tangent galvanometer in the school/college physics lab.** Vertical N-turn circular coil with a compass needle at its **center**; current I → B = μ₀NI/2R axial → needle swings. Students physically use this in practical exams.
**Secondary — the induction cooktop coil at home** (flat many-turn loop; strong axial field up through the pan).
Field lines `cl_field_line` used **sparingly** (STATE_4/5) to show axial threading only — NOT dipole equivalence (deferred).

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** as §2.

**(b) Symbol-label table** (full element id = `visible_elements` token; non-ASCII as `\uXXXX` in renderer source):

| Quantity | Label | Host element id | Label id |
|---|---|---|---|
| Current | `I` | `cl_current_arrow` (+ `cl_current_dot`) | `cl_current_arrow_label` |
| Loop radius | `R` | `cl_radius_line` *(NEW)* | `cl_radius_line_label` |
| Turns | `N` | readout / caption | `cl_turns_caption` |
| One current element | `dl` | `cl_dl_marker` | `cl_dl_marker_label` |
| Unit vector element→center | `r̂` | `cl_rhat_arrow` *(NEW)* | `cl_rhat_arrow_label` |
| One element's field | `dB` | `cl_db_arrow` | `cl_db_arrow_label` |
| Center field | `B` | `cl_B_center` | `cl_B_center_label` |
| Center point | `O` | `cl_center` | `cl_center_label` |
| Axial distance | `z` | `cl_axis_line` / `cl_axis_point` | `cl_axis_line_label` |
| Axial field at z | `B(z)` | `cl_B_axis` | `cl_B_axis_label` |
| B-magnitude bar | (numeric) | `cl_b_bar` | — |
| Field lines | (none) | `cl_field_line` | — |

**On-canvas equations (gated to state):** STATE_2 `dB = (μ₀/4π)·I dl / R²` + `dB ∥ dl × r̂`; STATE_4 `B = μ₀NI / 2R`; STATE_6 `B(z) = μ₀NIR² / 2(R²+z²)^{3/2}`.

**(c) RHR plan:** STATE_2 = **cross-product rule** (single element; articulated hand, flat fingers along dl, curl toward r̂, thumb = dB; det=+1 basis, never mirrored). STATE_5 = **grip rule** (whole loop; `extras.right_hand`, fingers curl with current, thumb = B, `thumb_direction: [0,0,1]`; re-curl on flip). Both articulated + performing; brightness emphasis only (Rule 29). No hand on STATE_1/3/4/6/7.

**(d) Motion plan:** S1 dots march; S2 dl brightens + r̂ draws + hand curls + dB grows axial; S3 dB arrows reveal one-by-one & stack; S4 bundle merges + equation writes + wire-then-loop compare; S5 hand curls, current reverses, B flips; S6 axis point slides + B(z)/bar/graph track; S7 sliders live + idle auto-sweep. `reveal_hold` pinning for S2–S5 one-shots.

**(e) Modes:** Conceptual ONLY. No `mode_overrides`, no `epic_c_branches`, no authored deep-dive child sims.

**(f) Assessment (6 Q) + coverage_map + per-state misconception_watch (mandatory):**

| q_id | Idea | Correct | teaches_state | difficulty |
|---|---|---|---|---|
| Q1 | Field at center of N-turn loop | `μ₀NI/2R` | STATE_4 | core |
| Q2 | Direction of B at center | Axial (⊥ plane), grip RHR | STATE_5 | core |
| Q3 | Why don't opposite dB's cancel? | All point same axial way → add | STATE_3 | core (aha) |
| Q4 | Direction of ONE element's dB at center | Axial — `dl × r̂` | STATE_2 | core |
| Q5 | Where on axis is B largest? | At the center, z=0 | STATE_6 | stretch |
| Q6 | Double R (same I,N) → center field? | **Halves** (B ∝ 1/R) | STATE_4 | stretch |

`coverage_map.by_state`: `{STATE_2:[Q4], STATE_3:[Q3], STATE_4:[Q1,Q6], STATE_5:[Q2], STATE_6:[Q5]}`. `non_assessed_states`: `[STATE_1, STATE_7]`.

**(g) NEW elements/flags beyond the named id list (FLAGs):**
1. `cl_radius_line` (+label "R") — in-plane radius reference (two-length-scale scar). STATE_2/4/6.
2. `cl_rhat_arrow` (+label "r̂") — element→center unit vector for STATE_2 cross product.
3. Articulated **cross-product** hand on STATE_2 (reuse `createLorentzHand` relabelled dl/r̂/dB) — task named only the grip hand.
4. `cl_bz_graph` — B-vs-z curve + tracking dot (STATE_6).
5. `pvl_colors` MUST include `"background": "#0A0A1A"` if set.
6. Register `magnetic_field_circular_loop` in `deriveStateMeta.ts` same change as renderer (→ renderer-primitives).
7. Eight registration sites (CLAUDE.md §6); PCPL_CONCEPTS N/A (field_3d); route via field_3d assembler.
8. Colour each element by identity: current = amber; dB/B axial vectors = one field colour; field lines = green.

---

## Block 1 — Pass-1 strategic checklist
1. **Prereq cliff:** biot_savart_law → STATE_2 (patch: "Recall Biot–Savart — one element makes dB = (μ₀/4π)·I dl/r², ⊥ both dl and the line to the point"). magnetic_field_wire → STATE_4 (patch names "the straight-wire field μ₀I/2πR").
2. **JEE-backwards trace** (conceptual EPIC-L only): "50-turn coil, R=4cm, I=0.5A — B at center? B on axis 3cm out?" → B_center STATE_4+5, N-linear STATE_4, B(z) STATE_6, R-vs-z STATE_6. No missing piece.
3. **Misconception entry mapping:** M1→S2, M2→S3, M3→S4, M4→S4/S7, M5→S5, M6→S6 (§4). STATE_2 *plants* M2 so STATE_3 breaks it. No EPIC-C (16b N/A).

## Block 2 — Aha designation
- **PRIMARY — STATE_3:** "Every element's dB points the same axial way — so they all add." (13 tokens). Inside foundational → coverage rule ✓.
- **SUPPORTING — STATE_4:** the messy sum collapses to one clean number B = μ₀NI/2R (immediate receipt of STATE_3; cohesion ✓).
- Wrong-belief setup: STATE_2 earns "opposite sides surely cancel" (M2); STATE_3 builds "they add" so STATE_4 breaks "must be μ₀I/2πR" (M3).
- Deep-dive picks (S3,S6) follow cognitive difficulty; cliff-patch states (S2,S4) follow prereq gaps — divergence by design.

## DC Pandey check
Consulted §4.6 ToC only to confirm scope (axial field of a circular loop; center case μ₀NI/2R). No sequence/example/figure/phrasing imported. Plain English, no Hinglish.
