# ARCHITECT SKELETON — `vector_products_in_space`
## "Multiplying Two Vectors: the Dot Product and the Cross Product"

> **Subject:** mathematics · Class 12 (Vector Algebra) · `class_level: 12`
> **Chapter position: ACT I of three** (`docs/MATHEMATICS_PHASE0_VECTORS_3D.md` §arc). Act II =
> `lines_and_planes_in_space`, Act III = `solids_of_revolution`. **This act SHIPS FIRST; Act II SPECS
> the engine** (§0b). What this act hands to Act II: **a patch of a plane (S5's parallelogram) and the
> normal that defines it (S4's `a×b`).**
> **Pipeline:** `architect → mathematics_author → json_author → quality_auditor`, `founder_proxy` A/B/C.
> **Renderer:** `field_3d`, `scenario_type: "vector_geometry_3d"`, `mode: "products"` (Phase-0 §naming
> — **NOT** `vector_products_in_space`: a concept id in a scenario slot is the recorded `mechanics_2d`
> naming trap). Archetype **D** (`patterns/mathematics.md` §1), tier **[NEEDS-SCENARIO]** as
> re-tiered 2026-08-08 — **this concept is NOT buildable until dispatches VG-A/VG-B land on master.**
> **JSON lives ONLY in** `src/data/concepts/mathematics/vector_products_in_space.json`; validation =
> `npm run validate:mathematics`. The 8 physics registration sites are FORBIDDEN.
> **Base:** `master` @ `dfca9cf`. **Concept id NOT clear — see AMENDMENT A5 + founder open decision 8.**
> The §0a check swept `src/data/concepts/` FILES only; `src/lib/mathematicsCatalog.ts:114` reserves
> **`vector_dot_and_cross_product`** for this act and `:141` points Act II's prerequisite at that id.
> This skeleton is authored as `vector_products_in_space`; **the id is a founder decision (open
> decision 8) and both catalog references must be reconciled in the change that lands the first JSON.**
> *(The cycle-0 header's "collision-checked clear" claim is withdrawn.)*

> ### ⚠ CYCLE 1 — this document was amended 2026-08-08 after Checkpoint A cycle 0 (`DESIGN_FIX`).
> Every finding's disposition is itemised in **§CYCLE 1 — CHECKPOINT A RESPONSE** at the end.
> **All camera numbers below were RE-SOLVED at FOV 60° / aspect 16:9 (AMENDMENT A10) and are scored
> under THE WORST-CASE LAW (A14): worst case over every live slider, pairwise over every rendered
> pair, in perspective, reporting BOTH angular separation AND screen extent against the frustum.**

> ### Provenance — this is a REVISION, not a fresh design
> The prior skeleton (`Physics-mind-mathematics-vectors-3d/docs/skeletons/vector_products_in_space_skeleton.md`,
> 509 lines + a cycle-1 amendment) went through Checkpoint A cycle 0 → `DESIGN_FIX` (8 P1 · 9 P2 ·
> 6 P3) and a cycle-1 amendment; **the re-verdict was never run.** Its pedagogy survived review and is
> carried. Its Checkpoint-A cycle budget is reset by the Phase-0 restart. Every carry, fix and
> deliberate rejection is itemised in **§WHAT CHANGED** at the end of this document.

---

## ⓿ ENGINE BUG QUEUE CONSULTATION — live, this session, 2026-08-08

**Coverage boundary declared** (the `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`
directive requires the dispositioned set to be a SUPERSET of the query union): four queries were run
with `.env.local` present —
`--owner alex:architect` · `--row-type directive` (100 rows) · `vector_products_in_space` (1 row) ·
`--field3d --open` (81 rows).
**⚠ Known tool blind spot, carried from Phase-0 §queue:** `--field3d` derives its id list from the
files in `src/data/concepts/`, so rows filed against an UNAUTHORED concept are invisible to it. This
concept is unauthored; the direct-id query is what returned its row, and Phase-0 §queue's four
hand-named rows are additionally dispositioned below by name.

### Rows that BIND this skeleton — each with an explicit verdict

| Row (verbatim `bug_class`) | Verdict |
|---|---|
| `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` | **BINDS — and is the headline defect of the prior skeleton.** Schema floor re-verified in code this session: `questions: z.array(quizQuestionSchema).min(6)` at `src/schemas/conceptJson.ts:328`. The prior skeleton specified 4, then 6. **This skeleton authors SEVEN** (§10f) with a margin above the floor, each naming its state, and `non_assessed_states` declared so items + exemptions cover every state exactly once. |
| `camera_metric_scored_foreshortening_not_pairwise_screen_separation` [MAJOR/OPEN] | **BINDS.** Every camera number in §3a is a **pairwise** screen separation over every rendered pair, measured under a **perspective** projection (§3a probe). No per-object foreshortening margin is used anywhere. **And this session found the prior round still scored only ONE pair — see §3a FINDING 1.** |
| `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` [MAJOR/OPEN] | **BINDS.** The explore solve (§3a) searched azimuth × elevation × θ × `b_tilt` — a 4-D product, both camera axes free — and reports the result of the SEARCH, not an argmax read off one axis. It is the reason FINDING 1 was found at all. |
| `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius` [CRITICAL/OPEN] | **BINDS — and cycle 0's claim of satisfaction was FALSE (Checkpoint A P1-2, AMENDMENT A11).** Cycle 0 swept 2 of S8's 4 live sliders (θ × `b_tilt`) and never swept `a_mag`/`b_mag`, whose ranges it never even declared. The angular floor survived only because `normalize(â+b̂+ĉ)` is magnitude-invariant; the FRAMING did not — max projected arm measured **0.885 at the authored magnitudes against a frustum half-extent of `tan 30° = 0.577`, already off-frame**, and the fixed `R = 9` blew up at `\|a\|=\|b\|=5`. **Cycle 1 fix: the radius is AUTO-FRAMED, `R = 2.5·max(\|a\|,\|b\|,\|a×b\|)`, and the solve is re-run in 4-D over all four sliders (266 747 poses) reporting BOTH metrics.** See §3a FINDING 3. |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` [MAJOR/OPEN] and `biot_state6_dotcross_lesson_not_rendered` [CRITICAL/OPEN] | **BIND, jointly and hardest.** `field_3d` **never paints `scene_composition` annotations** — and the second row is literally about a dot/cross lesson rendered invisible. **Every teaching string in this concept lives on a rendering path only**: the state title, the `formula_overlay`, the ≤5-word delta cue, a HUD readout, a sprite label, or a `tts_sentence`. §10b's label table names the rendering path for every single string. **Zero teaching content is authored as an `annotation`.** |
| `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` | **BINDS.** `a`, `b`, `c`, `a×b`, `b×c` are all sprite labels. THE EYE and `founder_drive`'s DOM probe cannot read them → every numeric CLAIM is additionally carried by a DOM HUD readout (§10b), never by a sprite alone. |
| `field3d_world_space_label_decollision_is_projection_blind_and_collides_on_screen` | **BINDS.** §3a's label-separation figures are computed in SCREEN space at each authored pose, never in world space. |
| `field3d_sliders_panel_top12_vs_fsbtn_top10` | **BINDS.** The `#vg_sliders` panel must clear `top:52px` (Rule 34d). Stated to `field3d_surgeon` in §ENGINE DELTAS. |
| `orthographic_separation_metric_underpredicts_perspective_overlap` | **BINDS.** Every §3a figure is measured under a **perspective** projection at **FOV 60° / aspect 16:9** (A10), at the state's own authored radius (10 or 16 guided; auto-framed `R = 2.5·max(\|a\|,\|b\|,\|a×b\|)` in explore) — never orthographic, never at a placeholder radius. |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` [MAJOR/OPEN] | **SATISFIED by construction, recorded.** Every state in this concept is centred on the common origin, so the un-authorable camera target does not bite. Recorded so a later off-origin state is known to be a purchase. |
| `field3d_no_generic_two_vector_scenario` [DIRECTIVE/**FIXED**, filed against this concept id] | **BINDS — and carries a PROVENANCE DEFECT.** The row is marked FIXED for a scenario that **does not exist on master** (the desk was never merged); Phase-0 §desk requires it reopened or reconciled in the same change that lands the scenario. **Flagged to the dispatching session — not this agent's to run (`npm run log:lesson`).** Its three prevention rules are all obeyed: reuse the generic `camera_position → animateCameraTo()` path (§ENGINE DELTAS D-1), score the camera PAIRWISE (§3a), and land `deriveStateMeta` in the SAME change (§ENGINE DELTAS D-6). |
| `phase0_union_table_asserted_not_walked_state_by_state` [DIRECTIVE/OPEN] | **BINDS.** §UNION WALK re-runs the Phase-0 §walk against the REAL states, both directions, naming CO-PRESENT features and not only new ones. |
| `teach_do_not_prespoil_a_later_reveal` [DIRECTIVE/OPEN] | **BINDS.** §10b's term-introduction ledger gates every quantity to the state that teaches it: `\|a×b\|` does NOT appear on S4 (it is S5's), the volume idea does not appear before S7, and the secondary anchor is withheld to S7. |
| `teach_visual_must_match_narration` [DIRECTIVE/OPEN] | **BINDS.** Every claim in §3's narration column has a named rendered correlate in the same row. The S3 "goes negative" claim is rendered as the projection segment reappearing on `a`'s opposite side **and** a signed HUD number — never asserted in words alone. |
| `teach_coordinate_sim_with_graph` [DIRECTIVE/OPEN] | **N/A with reason.** No 2D graph exists in this concept (§10i-5). No state pairs a sim with a curve. |
| `teach_concrete_before_abstract_compare` [DIRECTIVE/OPEN] | **BINDS.** S1–S4 are qualitative/geometric before any magnitude formula; the anchor lands in S1 (§9) before any symbol. |
| `teach_inverted_scenario_inverts_cutline_flags` [DIRECTIVE/OPEN] | **BINDS at S6.** S6 inverts S4's operand order, so it must SURFACE the direction readout it owns (`a×b` direction vs `b×a` direction) rather than inherit S4's suppression of `\|a×b\|`. §10b's ledger states this explicitly. |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` [DIRECTIVE/OPEN] | **BINDS.** Every archetype in §3 is declared from motion INSIDE the state on its own clock, never from a between-state delta and never from a teacher drag (except S8, where `drag-sandbox` is the licensed exception). |
| `authored_beat_ends_by_undoing_the_state_own_claim` [DIRECTIVE/OPEN] | **BINDS.** §3b declares a termination for every beat: S1–S7 are all **one-shot-hold**; only S8 free-runs (Rule 37). Each state's declared ENTRY value equals its ramp's `from` value. |
| `derivation_principle_applied_to_one_beat_but_not_its_sibling` [DIRECTIVE/OPEN] | **BINDS.** Every real number this concept displays is DERIVED from the live vectors by the renderer's own `vg*` helpers — `a·b`, `\|a×b\|`, `Area`, `Volume`, `a·(a×b)`, `b·(a×b)`, θ. **No authored constant is printed as a result anywhere** (§10g). |
| `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` [DIRECTIVE/OPEN] | **BINDS, and cannot be fully discharged — declared.** The prescribed sweep is `query_engine_bug_queue.ts --scenario <scenario_type>`, which derives its id set from concept FILES. `vector_geometry_3d` has **zero** concept files (it does not exist yet), so the sweep returns the empty set **vacuously**. The `--field3d --open` sweep (81 rows) is used as the widest available proxy and its scenario-agnostic rows are dispositioned above. **This is an explicit exception, FLAGGED to `quality_auditor` for Gate 8.** |
| `call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep` [DIRECTIVE/OPEN] | **BINDS.** §ENGINE DELTAS' Rule-40a sweep is reported as raw sweep OUTPUT with each hit classified, not as an enumeration written from reading. |
| `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` [DIRECTIVE/OPEN] | **BINDS.** §3b's longest static run is stated per state; no guided state exceeds 25 % of its timeline. |
| `narration_timing_probe_uses_a_speech_model_the_shipped_player_does_not` [DIRECTIVE/OPEN] | **BINDS as an authoring duty handed to `mathematics_author`:** time every cue against the SHIPPED player estimator and set each state duration to `ceil(player timeline / 1000)`. §3b's durations are the ARCHITECT's motion budget and must be re-checked against the player estimator before locking. |

### Rows dispositioned as NOT binding (inside the query boundary, verdict given rather than silence)

The 81 `--field3d --open` rows and 100 directive rows contain three large families this concept does
not touch, dispositioned as families with the reason stated:
**(a) the `nlb_*` family** (~14 rows: `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate`,
`nlb_work_bar_zero_crossing_reading_is_unrenderable_at_teaching_speed`,
`nlb_angle_arc_to_displacement_measures_net_travel_so_it_hides_after_a_turnaround`,
`nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies`,
`nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows`,
`nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger`,
`nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal`,
`nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one`,
`nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix`,
`nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` /
`field3d_nlb_arrow_min_length_floor_...`, `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel`,
`nlb_work_bar_track_tops_lose_collinearity_when_a_3d_label_size_changes`,
`nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate`,
`nlb_angle_arc_radius_overruns_the_neighbouring_lane_body`,
`nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula`,
`nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm`,
`nlb_overlay_ink_lift_is_bounded_to_the_families_whose_length_is_a_magnitude`) — **N/A: all are
`newtons_laws_body` scenario-specific.** This concept authors no `newtons_laws_body`, no track, no
checkpoint, no work bar, no energy layer, no multi-body lane. **ONE generalisable lesson is
nevertheless adopted from the family**: `nlb_arrow_min_length_floor…`'s rule that an arrow intended to
be SEEN must clear the renderer's length floor with margin — §3a states the minimum projected arm
length for every pose, and §ENGINE DELTAS asks the surgeon to name `vector_geometry_3d`'s own arrow
length floor and scale so `mathematics_author` can check `\|a×b\| = sinθ` at θ = 20° against it.
**(b) the `solenoid_*` / `biot_*` / `mfl_*` / `ecp_*` / `loop_dipole_*` / `radius_scenario_*` /
`cyclotron_*` / `ghost_compare_*` rows** — **N/A: other scenarios' geometry**, with the two exceptions
already dispositioned as BINDING above (`biot_state6_dotcross_lesson_not_rendered`,
`field3d_label_sprite_overlap` → subsumed by the sprite-label rows above).
**(c) the tooling / infrastructure rows** (`CACHE_UPSERT_CONFLICT_TARGET_MISSING`,
`field3d_particle_field_vestigial_dual_panel_config_gap`, `eye_motion_map_reads_cached_physics_config…`,
`eye_dense_frames_are_never_hashed…`, `capture_frozen_frame_ignores_its_own_poll_result…`,
`calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node…`,
`multi_word_bar_caption_is_invisible_to_the_calculator_sibling_composition_channel`,
`engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work`,
`teach_read_dense_ramp_frames_not_just_frozen`, `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition`,
`galvanometer_family_motion_expectation_undeclared`, `graph_title_caption_zorder_overlap`,
`caption_clipped_by_adjacent_stat_box`) — **owned by `peter_parker:*` desks; not architect-actionable
at design time**, recorded so the sweep is complete. Two are nevertheless honoured as design duties:
`calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node` → every HUD readout in §10b is
authored as a SINGLE text node carrying symbol **and** value (`a·b = 6.40`, never a split label);
`teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` → all slider rows are declared
in `config.slider_controls` + the per-state `vg.controls[]`, never in `scene_composition`.
**(d) PCPL / `parametric` rows** — **N/A: different renderer.** This concept is `field_3d`.

**Rule 40a sweep, run this session** for every mechanism this design introduces (raw output, each hit
classified): `vector_geometry_3d`, `vgAutoFrame`, `autoFrameFromVectors`, `camera_follow`,
`b_tilt`, `vgParallelepipedFaces`, `vgPairwiseScreenSeparationDeg` — **0 hits on `origin/master`
across all branches** for every symbol. Nothing here is being built twice. *(The engine desk's
un-merged branch carries `vp*`-prefixed twins of three of these; that is the desk Phase-0 §desk
recommends KEEPING and RENAMING, not a duplicate build.)*

---

## ⓪ THE CHAPTER COLOUR LANGUAGE — declared here, inherited by Acts II and III (§arc rule 2)

**This is a CHAPTER decision, not a concept decision.** Act II (`lines_and_planes_in_space`) and Act
III (`solids_of_revolution`) inherit this mapping verbatim and **may not invent a sixth role.** It
lives in `config.vg` so both later acts read it from one place.

| Role (§arc rule 2's five, fixed) | Colour | Hex | Act I | Act II inherits as | Act III inherits as |
|---|---|---|---|---|---|
| **1 · first direction** | amber | `#F5A623` | `a` | a line's direction `d₁` | the axis-perpendicular radius |
| **2 · second direction** | cyan | `#3FC8E4` | `b` | the second direction `d₂` | the profile curve's tangent |
| **3 · third direction** | magenta | `#E15FA8` | `c` (S7 only) | the point-to-point vector `a₂ − a₁` | — |
| **4 · derived object** | green | `#5BD97A` | `a×b` (and `b×a`, same green, flipped) | the plane's normal `n`; the common perpendicular `d₁×d₂` | the axis of revolution |
| **5 · measured region** | violet, translucent | `#8B6FE8` @ 0.28 α | the parallelogram (S5); the parallelepiped (S7) | the plane patch | the swept region and the disc/shell stack |

**Three consequences that make it a language rather than a palette.**
1. **Green NEVER means an input.** The moment a green arrow appears, the student is looking at
   something the other arrows MADE. That is the whole of S4's aha, and it is why Act II's plane normal
   must also be green: a plane's normal is a derived object in exactly the same sense.
2. **Violet is never an arrow and green is never a fill.** Region and direction are different kinds of
   object and never share a hue.
3. **Rule 29 is untouched:** emphasis is BRIGHTNESS within a role's own hue, never a hue change and
   never a size change. A dimmed `b` is dim cyan, never grey.

**The handoff frame (§arc rule 5).** Act II's S1 opens on **S5's final frame** — the violet
parallelogram with the green `a×b` standing perpendicular on it — and re-labels it "a patch of a
plane, and its normal." Nothing about that frame changes; only the words do. `mathematics_author`
must therefore leave S5's end pose, colours and camera exactly as authored here.

---

## 1. Atomic claim

**This concept teaches what the two products of two vectors in three-dimensional space geometrically
MEASURE: the dot product as a signed number that says how much one vector points along the other —
zero exactly at ninety degrees and negative beyond it — and the cross product as a new VECTOR
perpendicular to both, whose length is the area of the parallelogram the two vectors span and whose
sign depends on the order. And only that.**

It does **not** cover: component-wise computation of `a·b` or `a×b` from coordinates (a board topic,
demo tier); projection formulae as a stand-alone computational exercise; lines through a point or
planes by a normal (**Act II**, `lines_and_planes_in_space`); the angle between two planes or the
distance between skew lines (**Act II**); determinant or matrix machinery for the triple product (S7
shows the triple product as a VOLUME; its coordinate determinant is never taught).

---

## 2. State count + arc — EIGHT states

**Count justification (Rule 11).** CLAUDE.md §5 calls 7–9 "complex". The exam test — *"could a
student who watches all eight answer any Class-12 / JEE question on vector products?"* — needs: the
apparatus, the dot product's meaning, its zero and its sign, the cross product's direction, its
magnitude, its non-commutativity, the triple product, and a sandbox. Removing any one leaves an
answerable exam question unanswered (traced item-by-item in §10f). Eight is the count, and S7 is the
one cost-cuttable state (§10i-1 Cut 1).

| # | Title (Rule 41d — first words carry; Title Case, matching the shipped mathematics fleet) | Purpose | `teaching_method` | `depth_ring` |
|---|---|---|---|---|
| S1 | Two Vectors from One Point | The apparatus and the question: two arrows, one shared start, one angle between them | *(straightforward)* | core |
| S2 | The Dot Product Measures Alignment | `a·b` is a signed number that grows as the two arrows close on each other | *(straightforward)* | core |
| S3 | Zero at Ninety Degrees, Then Negative | The turning point: the projection shrinks to nothing at 90°, then reappears on the other side and the number goes negative | *(straightforward)* | core |
| S4 | The Cross Product Points Out of the Plane | **PRIMARY AHA** — the second product is not a number; it is a new vector perpendicular to both, proved by arithmetic and revealed by a camera tilt | *(straightforward)* | core |
| S5 | The Cross Product's Length Is an Area | `\|a×b\|` equals the area of the parallelogram `a` and `b` span | *(straightforward)* | extended |
| S6 | Swap the Order and the Direction Flips | `b×a = −(a×b)`: same length, opposite direction | *(straightforward)* | extended |
| S7 | Three Vectors Span a Volume | The scalar triple product `a·(b×c)` is the volume of the box the three vectors span | `derivation_first_principles` | **advanced** |
| S8 | Explore: Angle, Lengths and Tilt | Teacher sandbox — θ, `\|a\|`, `\|b\|`, `b_tilt` live; `a·b` and the `a×b` arrow track continuously | `exploration_sliders` | core |

**Ring order check (Rule 38a):** qualitative (S1–S4, core) → quantitative (S5–S6, extended) →
derivation (S7, advanced) → explore (S8). **The advanced ring is a single contiguous block
immediately before the explore state ✓.**
**`advance_mode` (Gate 12):** S1–S7 `manual_click`, S8 `interaction_complete` → **2 distinct modes ✓**.
No `wait_for_answer` anywhere (legacy, Rule 31).
**The hook MOVES:** S1 opens with `a` already standing and `b` sweeping into place from the shared
origin, the angle arc drawing in behind it. There is no static "here are two arrows" frame.

---

## 3. Per-state control table — the Rule-31 FIRST design artifact, with the §arc rule-6 `→ hand-off` column

**Scene convention (three.js Y-up) — REVISED at cycle 1; the `b_tilt` semantics CHANGED and the change
is load-bearing (Checkpoint A P1-1).** `a` and `b` are **symmetric about the world +x axis** in the
ground plane, and the tilt is a **rotation of `b` about `â`**, not a lift toward +Y:

> `a = |a|·(cos(θ/2), 0, +sin(θ/2))`  (azimuth −θ/2)
> `b₀ = |b|·(cos(θ/2), 0, −sin(θ/2))`  (azimuth +θ/2)
> **`b = R_â(β) · b₀`** — Rodrigues rotation of `b₀` about the unit vector `â` by the tilt angle β.

**Why it changed.** Cycle 0 authored the tilt as `b = |b|·(cos(θ/2)cos β, sin β, −sin(θ/2)cos β)`,
which gives `â·b̂ = cos β·cos θ` — the tilt SILENTLY CHANGES θ. Measured: at slider θ=60°, tilt=60°
the true angle is **75.5°** while the HUD reads `θ = 60.0°`; worst case over the slider box is a
**41.98° error** (θ=20°, tilt=60° → true 61.98°, re-measured this session). The F5 angle arc would
have drawn the true angle beside a HUD reading the slider, and S8's own formula surface
`a·b = |a||b| cos θ` would have been contradicted on screen. **The rotation-about-`â` form preserves
θ and `|b|` EXACTLY** — probe over θ ∈ [20°,160°] × β ∈ [0°,60°] at 1° steps (8 601 samples):
`max |θ_true − θ_slider| = 6.0e−14°`, `max ||b|−|b|_slider| = 2.2e−16` — and it still lifts `b` out of
the ground plane, which is all the tilt was ever for. Under the tilt `a×b` rotates about `â` by β with
`|a×b|` unchanged, so every S8 readout stays consistent by construction.

At β = 0 this gives **`a×b = (0, |a||b| sin θ, 0)` — straight up, along world +Y**
(probe-verified at the AUTHORED magnitudes `|a| = 3`, `|b| = 2`, θ = 60°: **`a×b = (0.000, 5.196,
0.000)`** — cycle 0 printed the unit-operand value `(0, 0.866, 0)` beside authored-magnitude claims,
Checkpoint A P3-4), which puts the chapter's "reveal the third dimension" beat directly onto the
engine's up axis.

### Authored magnitudes — CONTINUITY FIXED (Checkpoint A P1-5)

| Quantity | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 (entry) |
|---|---|---|---|---|---|---|---|---|
| `\|a\|` | 3.0 | 3.0 | 3.0 | 3.0 | 3.0 | 3.0 | 3.0 | 3.0 |
| `\|b\|` | 2.0 | 2.0 | 2.0 | 2.0 | **2.0 → 2.5** | 2.5 | 2.5 | 2.0 |
| `\|a×b\|` | — | — | — | 5.20 | **5.20 → 6.50** | 6.50 | — | live |
| `\|c\|` | — | — | — | — | — | — | 2.0 | — |

**Every state's ENTRY value equals the previous state's EXIT value.** Cycle 0 broke this twice: S5
declared entry `|b| = 1.0` against S1–S4's 2.0, and S6 declared `|a×b| = 5.20` (i.e. `|b| = 2.0`)
against S5's terminal 2.5. **Fixed by moving S5's ramp `from` 1.0 → 2.0 and keeping its `to` at 2.5**,
which is the smallest edit that closes the seam; S6/S7 inherit `|b| = 2.5` and `|a×b| = 6.50`.
S8's entry restores the authored default `|b| = 2.0` **as a slider default on a state the teacher
opens by clicking, not as a mid-arc teleport** — declared, not silent.

| S | Teaches (ONE idea) | Motion archetype | Distinct motion (what animates, and how it differs) | Delta cue (≤5 words) | Live controls | Words | Ring | The real NUMBER | **→ hand-off (§arc rule 6) + cut-safe alternate (A13)** |
|---|---|---|---|---|---|---|---|---|---|
| **S1** | Two vectors can start from the same point, and the angle between them is a thing you can name and measure | `reveal-build` | `a` stands first (amber, 0–1200 ms); `b` sweeps up from `a` through 0° → 60° (cyan, 1400–3400 ms); the angle arc draws in behind it (3400–4200 ms). **Nothing repeats: this is the only state where the apparatus is constructed** | `Two vectors, one angle` | none | **46–52** (anchor 26 + cliff patch folded in — see §9 and Block 1) | core | `θ = 60.0°`, `\|a\| = 3.0`, `\|b\| = 2.0` | *"We can add two arrows. Can we multiply them? Start with the simplest question two arrows can answer: how much do they point the same way?"* — **no alternate needed: S2 survives every preset** |
| **S2** | The dot product is a signed number that measures how much of one vector lies along the other | `parameter-sweep` **(declared contrast pair with S3 — see below)** | θ closes 60° → 20° over 4600 ms; the violet projection segment along `a` visibly LENGTHENS, lagging θ's onset by 600 ms (Rule 32a); the `a·b` readout climbs with it. **Delta vs S3: the number only GROWS here — one monotone ramp, no critical point** | `Projection grows, number grows` | none | 32–40 | core | `a·b` climbs `3.00 → 5.64`; `θ 60.0° → 20.0°` | *"The number grew as they closed. So it must shrink as they open — how far can it shrink?"* — **no alternate needed: S3 survives every preset** |
| **S3** | The dot product reaches exactly zero at ninety degrees, and past that it goes negative | `parameter-sweep` **(the DECLARED CONTRAST PAIR of S2, Rule 31b — same knob θ, same tracked element, opposite outcome: the delta IS the sign flip)** | θ ramps 20° → 90° (0–2400 ms); **HOLD 2400–3400 ms** with the projection collapsed to a single point on `a` and the readout at `0.00`; then θ continues 90° → 130° (3400–5600 ms) and the projection **reappears on `a`'s opposite side** while the number goes negative. **Delta vs S2: S2 closes the angle and the number grows; S3 opens it through the critical value and the number changes SIGN** | `Projection reaches zero, then reverses` | none | 38–46 | core | `a·b`: `5.64 → 0.00 → −3.86`; `θ 20° → 90° → 130°` | *"At ninety degrees the dot product is zero. But two arrows at ninety degrees still make something, and it is not a number."* — **no alternate needed: S4 survives every preset** |
| **S4** | **PRIMARY AHA** — the cross product is a new VECTOR, perpendicular to both, standing out of the plane the first two share | `rotate-to-reveal` (`patterns/mathematics.md` §2) | θ eases back 130° → 60° while the camera dollies R 10 → 16 (0–1400 ms, staging, **before anything new appears**); the green `a×b` arrow grows (1600–2600 ms) but at elevation 70° it is a short stub pointing almost at the viewer (**projected arm 0.160, measured**); **then the camera tilts elevation 70° → 30° with azimuth FIXED at 90° (2800 ms →), and the stub un-collapses into a full arrow (arm 0.336, ×2.1, measured)**; the two dot readouts hold `0.00` throughout the tilt. **Delta vs every other state: the OBJECTS hold still and the VIEWPOINT moves** | `New arrow leaves the plane` | none | 40–48 | core | **`a·(a×b) = 0.00` and `b·(a×b) = 0.00`** (live, both) | *"We know which way it points. Now: how long is it?"* · **CUT-SAFE ALTERNATE (used whenever `extended` is hidden): *"Two arrows, two products: one gives a number, one gives a new arrow. Now they are yours to move."*** |
| **S5** | The length of `a×b` is the area of the parallelogram that `a` and `b` span | `linear-stretch` **(coined — justification below; renamed from cycle 0's `grow-region` for the RHYTHM, Checkpoint A P2-2)** | θ is **FIXED at 60°** and never moves. The violet parallelogram fades in on the `a,b` plane (0–900 ms); then **`\|b\|` stretches 2.0 → 2.5** (1200–5000 ms): the quad's cyan edge lengthens, the quad's area grows, the green arrow lengthens in step, and `Area` and `\|a×b\|` stay equal to 2 dp at every frame. **Delta vs every other state: a single LINEAR stretch of one LENGTH — the only state that drives a magnitude rather than an angle** | `The parallelogram appears` | `b_mag` | 34–42 | extended | `Area` and `\|a×b\|`, equal at every frame: `5.20 → 6.50` | *"The length is fixed. But we wrote `a×b` — what if we had written `b×a`?"* — **no alternate needed: S6 survives whenever S5 does (same ring)** |
| **S6** | Swapping the order reverses the cross product's direction and leaves its length alone | `rotate/flip` (Rule 31b) — **declared NARRATIVE contrast pair with S4** | The apparatus holds absolutely still; the order label flips `a×b → b×a` (2000 ms) and the green arrow **rotates through the plane to point straight down** (2000–3000 ms), then holds. The `\|…\|` readout does not move by a single digit; the direction readout flips `+y → −y` | `Order swapped, arrow flipped` | none | 30–38 | extended | `\|a×b\| = \|b×a\| = 6.50` (unchanged); direction `+y → −y` | *"Two vectors span an area. So what do three vectors span?"* · **CUT-SAFE ALTERNATE (used whenever `advanced` is hidden): *"Order matters for the cross product. Now the two arrows are yours to move."*** |
| **S7** | The scalar triple product `a·(b×c)` is the volume of the box the three vectors span | `decompose` (`patterns/mathematics.md` §2) | The camera reframes once (az 90° → 30°, el 30° → 25°, R 16 → 10, ~1800 ms — declared Rule 32d exception, "making room for a third vector"); the magenta `c` grows (1800–3000 ms); the violet parallelepiped builds face by face (3000–4600 ms); then the solid **SPLITS** into base (the `b,c` parallelogram) and height (`a`'s component along `b×c`) which separate by a readable gap (4800–6400 ms) and hold. **Delta vs every other state: build up, then take apart** | `A third vector, a volume` | none | 42–52 | **advanced** | `Volume = 9.95`; `Base = 4.25`, `Height = 2.34` | *"That is every product two or three vectors can make. Now they are yours to move."* — **no alternate needed: S8 survives every preset** |
| **S8** | Teacher sandbox | `drag-sandbox` (reserved, explore only) | Free-run (Rule 37). All four sliders live; the camera continuously **auto-frames** from the live vectors, radius included (§3a FINDING 3) so no two arrows ever collapse and nothing leaves the frame; `a·b` and the green `a×b` arrow track every drag | `All controls live` | **ALL FOUR, ranges declared (P1-2): `theta_deg` [20, 160] def 60 · `a_mag` [1.0, 5.0] def 3.0 · `b_mag` [1.0, 5.0] def 2.0 · `b_tilt_deg` [0, 60] def 0** | 0 / open | core | `a·b`, `θ`, and the two perpendicularity readouts, all live | — (chapter continues in Act II) |

### The one coined archetype, justified (Rule 31b requires a one-line justification per coinage)

- **`linear-stretch` (S5).** *One spanning edge lengthens linearly while the region it spans and a
  length readout grow in step.* Not `parameter-sweep`, which in this concept always drives an ANGLE
  and changes no length; S5 is the only state that drives a MAGNITUDE, and that is precisely the
  rhythm difference bought by moving S5 off θ.
- **`cross-and-reverse` is WITHDRAWN (Checkpoint A P2-2, accepted).** S3 drives the same knob (θ) and
  tracks the same element (the projection segment) as S2; a 1000 ms hold and a sign flip is a
  *contrast*, not a distinct rhythm. **S2/S3 are now declared a Rule-31b contrast pair whose delta
  names the flip: same sweep, opposite sign of `a·b`.** This is free and honest, and it is what the
  rule already licenses.

### Archetype no-repeat audit (Rule 31b)

`reveal-build` · `parameter-sweep` · `parameter-sweep` **(declared contrast pair, S2/S3)** ·
`rotate-to-reveal` · `linear-stretch` · `rotate/flip` · `decompose` · `drag-sandbox` — **eight states,
seven distinct archetypes plus ONE declared contrast pair, which is exactly the single exception
Rule 31b permits.** S4/S6 are additionally declared a **narrative** contrast pair (same subject — the
cross product's direction; opposite verdict); because their archetypes already differ, that
declaration licenses nothing and is recorded for the reviewer's benefit only.

### Rule 32 legibility plan

- **32a cause-before-effect.** S2: θ moves first, the projection segment lags its onset by 600 ms.
  S4: the arrow appears BEFORE the camera tilts, so the tilt reveals its LENGTH rather than its
  existence. S5: `\|b\|` moves first, the quad and the green arrow follow 400 ms later. S7: `c` grows,
  then the solid builds, then it splits — three sequential beats, never simultaneous.
- **32b only the taught variable moves.** S2/S3 move θ and nothing else. S5 fixes θ and moves only
  `\|b\|`. S6 moves nothing but the operand order and the one arrow it flips. S8 is exempt (explore).
- **32c** the delta-cue column above IS each state's on-canvas top caption; nothing longer ever
  appears on the canvas (Rule 34a — prose lives in `#capStrip` below it).
- **32d home pose.** The apparatus is the SAME two arrows from the SAME origin in all eight states.
  Exactly **two** camera moves exist in the whole concept, both declared and both justified: S4's
  staging dolly + reveal tilt (authored as ONE `vg.camera_steps` sequence inside one state) and S7's
  reframe. S5 and S6 open on S4's exact end pose with **zero** camera movement.
- **32e one glow focal at a time.** S1 `a` → `b` → arc · S2 the projection segment · S3 the projection
  segment (through the zero, then its mirror) · S4 the green arrow · S5 the violet quad · S6 the green
  arrow · S7 `c` → the solid → the split faces · S8 none. **⚠ Directive
  `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` binds S5 and S6:** S5's
  claim is a RELATION between the quad and the green arrow's length, and S6's is a relation between an
  arrow and its own reversal — so **neither state authors a state-level `glow_focal`**; `glowActive`
  stays false, nothing dims, and per-sentence glow bindings drive emphasis in narration order.

---

## 3a. THE CAMERA PLAN — RE-SOLVED AT FOV 60 / 16:9, scored under THE WORST-CASE LAW

**Projection parameters, named beside every number (AMENDMENT A10 — cycle 0 solved at an implicit
`R = 9` with unit operands and never named a FOV):**

| Parameter | Value | Source |
|---|---|---|
| Vertical FOV | **60°** | `PerspectiveCamera(60, …)`, `field_3d_renderer.ts:3733` |
| Reference aspect | **16:9** | the file's own solve aspect, `:57121`, `:57319` (`camera.aspect` is live) |
| Frustum half-extent | **vertical `tan 30° = 0.5774`**, horizontal `1.0264` | derived |
| Framing target | **max projected arm ≤ 0.4619** (= 80 % of the vertical half-extent; the remaining 20 % is the tip-label allowance) | authored |
| Basis | three.js Y-up; `fwd = −Ĉ`, `right = norm(fwd × ŷ)`, `up = right × fwd`; screen `= (d·right/z, d·up/z)` | reproduces the renderer |
| Metric | **pairwise** screen separation over EVERY rendered pair, folded, **plus** projected arm length | scars + A14 |
| Magnitudes | **the AUTHORED ones** (`\|a\|=3`, `\|b\|=2→2.5`, `\|c\|=2`) — never unit operands | Checkpoint A P2-1 |

**⚠ Cycle 0's mixed basis is corrected (Checkpoint A P2-1, accepted).** Cycle 0 reported arms as
`36.2e−3 → 87.5e−3` and `min 12.9e−3`; those are **unit-magnitude** figures presented as measurements
at the authored pose, which understated the arrow-floor risk and hid the off-frame defect. **Every arm
figure in this document is now in ONE basis: projected screen units at the authored magnitudes,
against the vertical half-extent 0.5774.** No unit-operand number survives anywhere.

### ⚠ FINDING 1 — no fixed pose and no azimuth-only follow rule exists (CARRIED, re-verified)

Cycle 0's `az = (θ + 90°) mod 360°` returns **0.00° pairwise separation at θ = 90°, tilt = 0** — `a`
and `a×b` collapse to one screen line in the state whose claim is that they are perpendicular. The
impossibility proof stands: the camera azimuth must avoid `a`'s azimuth (mod 180°) and `b`'s azimuth
(mod 180°); writing `f(θ) = az(θ) − θ_b(θ)`, continuity over a wide θ range forces a sign change, so
any continuous azimuth-only follow rule contains a collapse. Confirmed numerically (best `az = kθ + c`
over `k ∈ [−1,1]`, `c ∈ [−180°,180°]`, `el ∈ [15°,75°]`: min pairwise **5.1°**, no better than the
best fixed pose's **5.3°**). AMENDMENT A11 records this as independently reproduced.

### ⚠ FINDING 2 — the symmetric convention (CARRIED) and the tilt semantics (NEW, P1-1)

`a` and `b` straddle +x at ∓θ/2. Re-measured at FOV 60: S4's two taught pairs are **symmetric**
(`a`^`a×b` = `b`^`a×b` = 73.9° at el 30°) instead of lopsided, which is exactly the picture S6 needs
when it swaps the operands. **New at cycle 1:** the tilt is a rotation about `â` (see §3 above), so
θ and `|b|` are preserved to machine precision and S8's HUD, angle arc and formula surface can no
longer disagree.

### ✅ FINDING 3 — the explore camera, RE-SOLVED IN 4-D WITH AN AUTO-FRAMED RADIUS

> **`u = normalize( â + b̂ + ĉ )` where `ĉ = normalize(a × b)`; `R = 2.5 · max( |a|, |b|, |a×b| )`;
> the camera sits at `R·u`, looking at the origin.**

`u` is never in the plane of any of the three pairs, so no pair can collapse — by construction, not
by search. **The radius is now auto-framed too**, which is the half cycle 0 omitted: a fixed `R = 9`
against dials that span `|a×b| ∈ [0.34, 25]` is the CRITICAL scar verbatim.

**Swept: ALL FOUR live sliders** — `theta_deg` ∈ [20°,160°] (step 2°) × `a_mag` ∈ [1.0,5.0] (step 0.25)
× `b_mag` ∈ [1.0,5.0] (step 0.25) × `b_tilt_deg` ∈ [0°,60°] (step 5°) = **266 747 poses**, at FOV 60 /
16:9, pairwise over all three rendered pairs (`a`, `b`, `a×b`; no quad, no `c` — 38b):

```
FOV 60, aspect 16:9, half-extent 0.5774 (vert) / 1.0264 (horiz)
axes swept: theta x a_mag x b_mag x b_tilt   (4 of 4 live sliders)
MIN pairwise screen separation = 18.91 deg   worst at theta=160 a=1.00 b=4.75 tilt=60, pair a^b
MAX projected screen arm       = 0.436       worst at theta=114 a=1.00 b=3.25 tilt=30, arrow b
                                             -> 0.436 <= 0.4619 target <= 0.5774 half-extent : ON FRAME
MIN projected screen arm       = 0.0412      worst at theta=20  a=1.00 b=5.00 tilt=30, arrow a
entry pose at theta=60, |a|=3, |b|=2, tilt=0 -> az 0.0 deg, el 30.0 deg, R 12.99
```

**The three worst cases, each judged rather than thresholded.**
1. **18.91° min separation** at θ = 160°: the pair `a`^`b` renders at a screen angle of 161.1° against
   a true 160°, an error of 1.1°. The metric folds near-antiparallel to a small number because
   near-antiparallel *is what 160° looks like*. Honest.
2. **0.436 max arm** — on frame with 24 % of the half-extent left for the tip label. **This is the
   number cycle 0 never computed; at its own authored pose it was 0.885, already off-frame.**
3. **0.0412 min arm** at `|a| = 1` beside `|b| = 5` (so `|a×b| = 4.3` and `R = 10.8`): the short arrow
   is genuinely 5× shorter than its partner and 12× shorter than the cross product. **This is the one
   number that must be checked against the renderer's arrow length floor** — routed to
   `field3d_surgeon` as **D-8**, and it is why D-8 asks for the floor as a NUMBER.

**Consequence the surgeon must build to:** the explore camera is a **position vector `R·u` assigned
each frame**, never an `(azimuth, elevation)` pair through `animateCameraTo()`/`lerpSpherical()` — the
azimuth branch cut is crossed inside the grid, and `lerpSpherical` is frame-rate dependent
(§ENGINE DELTAS D-1).

### The per-state pose table — every row states FOV, aspect, axes swept and the worst value

All rows: **FOV 60°, aspect 16:9, perspective, pairwise over every rendered pair, at the authored
magnitudes.**

| S | Azimuth | Elevation | Radius | Axes swept | Worst measured values |
|---|---|---|---|---|---|
| S1 – S3 | **90°, fixed** | **70°, fixed** | **10** | θ ∈ [20°,160°], 1° steps (141 poses); rendered pair set {`a`,`b`} | min pairwise **18.82°** (θ=20°) · max arm **0.296** ✓ (θ=20°, `a`) · min arm **0.197** · **worst in-plane angle error 3.56°** at θ=92° (screen 88.44°) |
| **S4** | **90°, FIXED throughout** | **tilts 70° → 30°** | **dollies 10 → 16 during STAGING (0–1400 ms), then held at 16 through the tilt** | staging: θ ∈ [60°,130°] at el 70°; tilt: el ∈ [30°,70°] at 1° steps, θ = 60°; rendered set {`a`,`b`,`a×b`} | staging max arm **0.296** ✓ · tilt: `a`^`a×b` and `b`^`a×b` both RISE **61.5° → 73.9°** while `a`^`b` falls 57.0° → 32.2° (honest foreshortening of a true 60°) · **`a×b` projected arm 0.160 → 0.336 (×2.1)** · max arm through the tilt **0.336** ✓ · min pairwise **32.2°** |
| S5 | 90°, carried | 30°, carried | 16, carried | `b_mag` ∈ [2.0,2.5], 0.01 steps (51 poses) | min pairwise **32.2°** · max arm **0.441** ✓ (`a×b` at `\|b\|`=2.5) · min arm **0.119**. **Zero camera movement — and deliberately so: a camera that dollied out as the quad grew would cancel the growth on screen** |
| S6 | 90°, carried | 30°, carried | 16, carried | single pose; rendered set {`a`,`b`,`b×a`} (`a×b` is replaced, not co-present) | min pairwise **32.2°** (`a`^`b`) · max arm **0.292** ✓ · min arm **0.151**. **Exempt pair declared (A6):** `a×b` and `b×a` are antiparallel BY DESIGN and would fold to 0.00°; they are never rendered simultaneously, and any pairwise gate must exempt them |
| **S7** | **30°** (one reframe pan from 90°) | **25°** (from 30°) | **10** (from 16) | **joint 5-D search: `c` azimuth ∈ [−90°,90°] × `c` elevation ∈ [25°,80°] × camera az ∈ [30°,120°] × el ∈ [15°,60°] × R ∈ [10,14]**, constrained to max arm ≤ 0.4619, min arm ≥ 0.13, box height ≥ 1.8 | **`c` authored at azimuth 65°, elevation 50°, `\|c\| = 2.0`.** At camera (az 30°, el 25°, R 10): **min pairwise over all SIX pairs = 37.3°** (`a`^`a×b`… i.e. `a`^`b×c`) · max arm **0.453** ✓ · min arm **0.137** · **Volume = 9.95, Base = `\|b×c\|` = 4.25, Height = 2.34** — a solid with genuine readable thickness |
| **S8** | **auto-frame, `R·u`** | auto-frame | **auto-frame, `R = 2.5·max(\|a\|,\|b\|,\|a×b\|)`** | **ALL FOUR live sliders, 266 747 poses** | min pairwise **18.91°** · max arm **0.436** ✓ · min arm **0.0412** · entry az 0.0°, el 30.0°, R 12.99 |

### Camera continuity across the arc, and the §arc rule-3 spend

S1 → S2 → S3 hold one pose absolutely. **S4 carries the chapter's single narrative camera move**,
authored as ONE `vg.camera_steps` sequence with two steps: a **staging dolly** (R 10 → 16, 0–1400 ms,
completed BEFORE the green arrow appears, so it reveals nothing) and the **reveal tilt** (el 70° → 30°
at fixed azimuth, from 2800 ms). S4 → S5 → S6 involve **zero** camera motion. S6 → S7 is one reframe,
explicitly justified in narration as making room for a third vector — a *re-framing*, not a *reveal*.
S7 → S8 is a single eased transition into the auto-frame's entry pose as the sandbox opens.

### ✅ The frame-rate-dependent camera ease — DISSOLVED by `vg.camera_steps` (AMENDMENT A9)

**Cycle 0's FLAG is withdrawn.** `os.camera_steps` — `[{at_ms, az, el, dist, ease_ms}]` — is declared
at `field_3d_renderer.ts:60704` and implemented at `:62213–62290` / `:64631` / `:64858`, and its own
header states the design: it returns the pose as a **pure function of state-local ms**, so it bypasses
`lerpSpherical` entirely, is **frame-rate independent by construction**, eases rather than cuts,
starts and ends at rest (Rule 32d), and reproduces byte-identically under `SET_TIME_FREEZE`.
**Adopt it as `vg.camera_steps` (F24) — port, do not build.** Both of this concept's camera moves are
authored through it:

```
S4: camera_steps = [ {at_ms:0,    az:90, el:70, dist:10, ease_ms:0},
                     {at_ms:200,  az:90, el:70, dist:16, ease_ms:1200},   // staging dolly
                     {at_ms:2800, az:90, el:30, dist:16, ease_ms:1600} ]  // the reveal tilt
S7: camera_steps = [ {at_ms:0,    az:90, el:30, dist:16, ease_ms:0},
                     {at_ms:0,    az:30, el:25, dist:10, ease_ms:1800} ]  // the one reframe
```

Because the pose is closed-form on state-local ms, **S4's tilt now completes at a known WALL-CLOCK
time on every machine** (settled at 4400 ms; the narration sentence that names the reveal starts at
4600 ms; `eye_capture_ms` 6200 sits 1600 ms past settle). The 2× 60/120 Hz spread that cycle 0 spent a
page designing around **does not arise**. `mathematics_author` must verify `dist` is the field
`camera_steps` uses for radius before locking (D-1).

---

## 3b. Per-state timing table

Beat terminations are declared per the OPEN directive `authored_beat_ends_by_undoing_the_state_own_claim`:
**every guided state is one-shot-hold** — the ramped parameter reaches its `to` value and never
re-approaches its `from` value inside the state. Each state's declared ENTRY value equals its ramp's
`from`. **⚠ Durations below are the architect's MOTION budget; `mathematics_author` must re-time every
cue against the SHIPPED player estimator and set `duration = ceil(player timeline / 1000)`** (directive
`narration_timing_probe_uses_a_speech_model_the_shipped_player_does_not`).

| S | Motion budget | Sub-beats (ms) | Entry | Termination | `eye_capture_ms` | What the pin must show | Longest static run |
|---|---|---|---|---|---|---|---|
| S1 | 6 s | `a` 0–1200 · `b` sweeps 0°→60° 1400–3400 · arc draws 3400–4200 · hold | θ = 0° | one-shot-hold | **5000** | Both arrows, arc, `θ = 60.0°` | 800 ms (13 %) |
| S2 | 7 s | segment present @0 · θ 60°→20° over 400–5000 · **segment lags to 1000–5600** · hold | θ = 60° | one-shot-hold | **6200** | θ = 20.0°, `a·b = 5.64`, long projection | 1 400 ms (20 %) |
| S3 | 8 s | θ 20°→90° 0–2400 · **HOLD 2400–3400** (`a·b = 0.00`) · θ 90°→130° 3400–5600 · hold | θ = 20° | one-shot-hold | **2900** (mid-hold — the canonical zero frame) **and the state's own rest at 5600 is a separate, later frame** | The exact 90° / `0.00` instant, projection collapsed to a point | 1 000 ms at the zero (12.5 %) — **deliberate, and it IS the claim** |
| S4 | 9 s | θ 130°→60° **+ staging dolly R 10→16** 0–1400 · green arrow grows 1600–2600 (stub) · **camera tilt (`camera_steps`) 2800–4400, closed-form, settles at 4400 ms on every machine** · hold | θ = 130°, el = 70°, R = 10 | one-shot-hold | **6200** | Full-length green arrow, camera at el 30°, **both dot readouts at `0.00`** | 1 156 ms (13 %) |
| S5 | 8 s | quad fades in 0–900 · `\|b\|` **2.0→2.5** over 1200–5000 (F21 ramp) · **quad + arrow lag to 1600–5400** · hold | **`\|b\| = 2.0`** (= S4's exit ✓) | one-shot-hold | **6400** | Largest quad; `Area` and `\|a×b\|` both reading `6.50` | 1 000 ms (12.5 %) |
| S6 | 6 s | hold 0–2000 · order label flips @2000 · arrow rotates through the plane 2000–3000 (F21 ramp on `flip_frac` 0→1) · hold | `a×b` (up), `\|b\| = 2.5` (= S5's exit ✓) | one-shot-hold | **4400** | Green arrow pointing DOWN; `\|…\| = 6.50` unchanged; direction readout `−y` | 2 000 ms (33 %) — **⚠ exceeds the 25 % guidance of `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas`. Remedy authored: during 0–2000 ms the green arrow carries a slow brightness pulse and the order label `a × b` is drawn character by character, so the canvas is never byte-static. `mathematics_author` must verify the dense-frame diff, not assume it.** |
| S7 | 11 s | camera reframe (`camera_steps`) 0–1800 · `c` grows 1800–3000 (F21 `c_reveal_frac` 0→1) · solid builds face-by-face 3000–4600 (F21 `solid_build_frac` 0→1) · **splits 4800–6400 (F21 `split_solid_frac` 0→1)** · hold | no `c`, az 90°, el 30°, R 16 (= S6's pose ✓) | one-shot-hold | **7600** | Full solid split into base and height, `Volume = 9.95` | 1 200 ms (11 %) |
| S8 | free-run | Rule 37 — the player never freezes the explore state | slider defaults θ = 60°, `\|a\|` = 3.0, `\|b\|` = 2.0, `b_tilt` = 0° (a declared sandbox reset, not a mid-arc teleport) | n/a | n/a (sandbox exempt) | — | n/a |

---

## 4. Misconception confrontation plan (Rule 16a) — THREE genuine pivots

`misconception_watch` is authored on **exactly S3, S4 and S6**. **The other five states carry none** —
they are straightforward teaching, and manufacturing a misconception for each would be the founder's
2026-07-04 guardrail violation.

| # | Wrong belief (genuine; NCERT Exemplar belief-level) | State | The contrast beat (Rule 16a — consequence SHOWN first, then the mathematics; no question, no pause) |
|---|---|---|---|
| **M1** | "Two non-zero things multiplied together can never give zero" | **S3** | The projection segment is watched shrinking continuously to a single point on `a` while the readout runs to exactly `0.00` and HOLDS there for a full second — and then, crucially, the sweep **continues** and the segment reappears on `a`'s other side with a negative number, so zero is seen as a *crossing* rather than a wall. `visual_counter`: the segment collapsing to a point, then mirroring. `one_line_fix`: **"The dot product measures alignment. At ninety degrees there is none, and past ninety degrees it points the other way."** |
| **M2** | "The cross product is just another multiplication, so it gives a number like the dot product does" | **S4** | A contrast beat, not a warning. What appears is not a readout: it is an **arrow**, in the chapter's derived-object green, standing out of the plane the first two arrows share — and the camera tilt makes its out-of-plane-ness impossible to read as anything else. The two live readouts `a·(a×b) = 0.00` and `b·(a×b) = 0.00` prove perpendicularity **arithmetically**, using the zero-dot-product test the student was taught one state earlier. `visual_counter`: a directed object leaving the plane + both dot readouts at zero. `one_line_fix`: **"The cross product makes a new vector, not a number. Its direction is part of the answer."** |
| **M3** | "Vector multiplication commutes, because ordinary multiplication does" | **S6** | The scene is frozen, the order label flips, and the same arrow rotates 180° through the plane. The length readout does not change by a single digit while the direction readout reverses — the two halves of the correction land in the same second. `visual_counter`: one arrow flipping against a still scene; `\|…\|` unchanged, direction reversed. `one_line_fix`: **"Swapping the order reverses the cross product: `b×a = −(a×b)`."** |

**Planting check.** M1 is pre-loaded by S2's honest naming of the dot product as a *product*
(narration says "measures alignment", never "multiplies", so the belief is available to confront but
never asserted). M2 is pre-loaded by S2–S3's entire framing of "a product gives a number" — this is
deliberate, and it is what makes S4 land. **M3 is planted nowhere in this concept**, so S6 confronts
it reactively, which Rule 16a permits when there is no earlier state to patch.

---

## 5. `has_prebuilt_deep_dive` states — S3, S4, S7

Cache hint, **not a gate** (Rule 18): every state shows the Explain button; un-flagged states route it
to the feedback form. Justification: **S3** carries the sign-and-zero idea, historically the densest
source of "but you can't multiply to get zero" confusion. **S4** is the primary aha and the concept's
single hardest conceptual jump (a product that returns a different *kind* of object). **S7** is the
advanced capstone and the state most likely to be reached without its prerequisites intact.
**Cross-reference to the Block-1 cliff sentences:** S3 and S4 carry cliff patches and are flagged;
S7 is flagged without a cliff sentence because its difficulty is compositional (three vectors at
once) rather than a missing prerequisite — **documented divergence, per this spec's cross-reference
rule.** S2 carries the third cliff sentence and is deliberately NOT flagged: its difficulty is a
one-clause patch, not a sub-simulation.

## 6. Drill-down clusters

- **S3:** `zero_dot_product_means_perpendicular` · `dot_product_sign_and_the_angle` ·
  `dot_product_is_not_always_positive`
- **S4:** `right_hand_rule_gives_the_direction` · `cross_product_makes_a_vector_not_a_number` ·
  `cross_product_is_perpendicular_to_both`
- **S7:** `triple_product_is_a_volume` · `zero_triple_product_means_coplanar` ·
  `order_of_operations_in_a_dot_b_cross_c`

`json_author` seeds ≥5 `trigger_examples` per cluster.

## 7. `entry_state_map`

```
entry_state_map:
  foundational: STATE_1 -> STATE_4   # core - what the two products ARE. CONTAINS the PRIMARY aha (S4)
  area:         STATE_5              # "what does |a x b| mean"
  order:        STATE_6              # "does the cross product commute"
  volume:       STATE_7              # ADVANCED - "what does a.(b x c) mean / coplanarity"
  exploration:  STATE_8              # sandbox
```

Default aspect `foundational`. **Foundational-coverage rule: SATISFIED** — S4, the PRIMARY aha, sits
inside the foundational slice, so no exit-pill is required. Under both reduced presets (§10i-1) the
`volume` aspect falls back to `foundational`.

## 8. Prerequisites (advisory only — Rule 23)

`prerequisites: []` in the authored JSON, and this is a deliberate change from the prior round.

**The honest floor (§arc rule 7, re-verified).** `unit_vector`, `vector_resolution` and `dot_product`
are **NOT shipped product**: none has a `visual_baselines/` entry, none appears in `PILOT_CONCEPTS`,
and `dot_product` names a `panel_b: "graph_interactive"` that renders nowhere (`CLAUDE.md` §3 — the
old vectors/kinematics/forces JSONs are OLD architecture, never counted as built). Listing them as
prerequisites would render a "Builds on…" pill pointing at three concepts a teacher cannot open. The
one live, baseline-locked concept in the same vector family is **`scalar_vs_vector`**, and it is the
only honest target if a soft link is ever wired — **but it teaches the scalar/vector distinction, not
anything this concept needs**, so even that edge is judged misleading and is not authored.

**Consequence, and it is binding: this concept teaches its own foundation.** Rule 25's
no-untaught-term applies with no rescue. S1 must establish, inside its own word budget, that each
arrow has both a length and a direction and that both start from the same point.

---

## 9. Real-world anchor (Rules 35 / 38f — universal, widest-syllabus-overlap)

**The door anchor is REPLACED (Checkpoint A P2-3, accepted).** A door on its hinge is *torque* — the
CROSS product — and cycle 0 opened S1 with it and then handed off to the DOT product, so the anchor
was orphaned by its own hand-off column, and §9 then forbade S5 from cashing it. **Checkpoint A's
first option is taken: S1 is re-aimed at ALIGNMENT**, which is the thing S2 actually teaches. The
door is not moved to S5 either — that would put the concept's only real-world hook in the `extended`
ring, where the `core_only` preset deletes it.

**Primary anchor: pulling a suitcase by its strap.** Assigned to **S1**, with the words reserved here
(the OPEN scar `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` requires
exactly this):

> **"Pull a suitcase by its strap. Pull it straight forward and all of the pull moves it. Pull at an
> angle and only part of it does."**
> *(26 words. It is cashed ONE state later, at S2, by the projection segment — the part of `b` that
> lies along `a` IS the part of the pull that moves the case.)*

**S1's full budget, counted (Checkpoint A P1-6, accepted).** Cycle 0 reserved a **39-word** anchor
(it stated 34 — the count was wrong), added a 15-word cliff patch, and declared a 30–38 word budget:
54 words against a stated 38, and S1 still had to name `a`, `b`, the shared origin and θ. **Fixed by
shortening the anchor to 26 words and FOLDING the cliff patch into the naming sentence**, giving a
counted 50 words inside a declared **46–52** budget (Rule 31's split threshold is 55):

| Sentence | Words | Job |
|---|---|---|
| "Pull a suitcase by its strap. Pull it straight forward and all of the pull moves it." | 17 | anchor, half 1 |
| "Pull at an angle and only part of it does." | 9 | anchor, half 2 — the alignment idea |
| "Here are two arrows, `a` and `b`, from the same point; each has a length and a direction." | 18 | apparatus **+ the Block-1 cliff patch, folded** |
| "The angle between them is θ." | 6 | names the measured quantity |
| **Total** | **50** | 4 sentences — Rule 31's "2–4 tight sentences" ✓ |

**Secondary anchor (S7 only): a wedge-shaped doorstop.** A three-edged solid with a genuine volume,
used only at the capstone. **Deliberately withheld from S1–S6** so the volume idea is not pre-spoiled
(directive `teach_do_not_prespoil_a_later_reveal`).

**S5's area claim borrows nothing from any anchor** and stands on its own geometric footing — "the
parallelogram two vectors span." Cycle 0's struck claim (a door's *swept region* scaling with the
push) stays struck; it is false.

**35a check:** a suitcase with a strap and a wedge doorstop exist everywhere — no country, city,
brand, currency, festival or named person. **38f check:** neither is any syllabus's named lab
apparatus, which is precisely the widest-overlap property 38f asks for. **41 check:** every word is
basic literal English; nothing is personified.

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every state by id** — as §2: S1 apparatus + the anchor · S2 dot = signed projection · S3 zero at
90° then negative (M1) · S4 cross = a perpendicular vector, PRIMARY AHA (M2) · S5 `\|a×b\|` = area,
driven by `\|b\|` (2.0 → 2.5) · S6 order reverses direction (M3) · S7 *advanced* triple product = volume · S8
explore with four controls.

**(b) Symbol-label table + term-introduction ledger + THE RENDERING PATH FOR EVERY STRING.**
The rendering-path column is not decoration: `field_3d` **never paints `scene_composition`
annotations** (two OPEN scars, one of them literally a dot/cross lesson rendered invisible), so a
string with no rendering path is a string the student never sees.

| Quantity | On-canvas text | **Rendering path** | Colour role | Introduced | Used in |
|---|---|---|---|---|---|
| vector a | `a` | `createLabelSprite`, anchored to the arrow tip | 1 amber | S1 | S1–S8 |
| vector b | `b` | `createLabelSprite` | 2 cyan | S1 | S1–S8 |
| the angle | `θ = 60.0°` | **DOM HUD** (single text node, symbol + value) | neutral | S1 | S1–S4, S8 |
| the projection segment | `a·b` beside the segment | `createLabelSprite` | 5 violet | S2 | S2–S3 |
| dot product value | `a·b = 5.64` (θ=20°); `3.00` at entry | **DOM HUD** (single text node) | neutral | S2 | S2–S3, S8 |
| the cross product vector | `a×b` | `createLabelSprite`, arrow tip | 4 green | S4 | S4–S6, S8 |
| **perpendicularity readouts** | `a·(a×b) = 0.00` · `b·(a×b) = 0.00` | **DOM HUD**, two lines | neutral | S4 | **S4 and S8 only** |
| cross product magnitude | `\|a×b\| = 6.50` | **DOM HUD** | neutral | **S5** (NOT S4) | S5–S6 |
| the parallelogram | `Area = 6.50` inside the quad | `createWideLabelSprite` | 5 violet | S5 | S5 |
| the order label | `a × b` / `b × a` | **`formula_overlay`** (the state's one formula surface) | neutral | S6 | S6 |
| direction readout | `direction: +y` / `−y` | **DOM HUD** | neutral | **S6** (the flag S6 OWNS — directive `teach_inverted_scenario_inverts_cutline_flags`) | S6 |
| third vector | `c` | `createLabelSprite` | 3 magenta | S7 | S7 |
| the base normal | `b×c` (`\|b×c\| = 4.25`) | `createLabelSprite` | 4 green | S7 | S7 |
| the parallelepiped | `Volume = 9.95` · `Base = 4.25` · `Height = 2.34` | **DOM HUD**, three single text nodes | 5 violet | S7 | S7 |
| out-of-plane tilt | `b_tilt` (slider label, degrees) | `config.slider_controls` row | 2 cyan | S8 | S8 |

**Term-introduction ledger (no untaught term, no pre-spoiled reveal):** `\|a×b\|` **does not appear on
S4** — its only explanation lives in S5, and putting it on S4 was the exact Rule-38 ring-cut
incoherence the prior round fixed. "Area" appears first in S5. "Volume" and `c` appear first in S7.
The word "perpendicular" is introduced in S3 (where the angle is 90°) and re-used in S4. **No two text
primitives share a position**; every sprite label's screen separation is checked at its state's
authored pose, never in world space.
**All maths in real Unicode (Rule 34c):** `θ · × ° ⟂ \| ⁻ ₀` — never `theta`, `x`, `deg`, `->`. The
sweep must cover all three text paths: DOM overlays, canvas-drawn text, and
`createLabelSprite`/`createWideLabelSprite`.

**(c) Direction-rule plan.** **S4 is the sole direction-teaching state** and uses the **cross-product
right-hand rule** (fingers along `a`, curl toward `b`, thumb gives `a×b`) — not the grip rule, which
is for circulation and has no referent here. **S6 re-uses the SAME rule with the operands swapped**
and introduces no second rule. Whether the rule is performed by a rendered 3D hand or narrated over
the arrow alone is an ENGINE DELTA question (§ENGINE DELTAS, D-8) — **`ASSUMPTION —
probe-before-authoring`:** `rhr_force_direction` (`applyRhrForceDirectionState:11992`) carries a hand
mesh, but whether that mesh is reachable from a different `scenario_type` is not established, and
this skeleton does not assert that it is. If it is not reachable, S4's rule is carried by narration
plus the two dot readouts, which is sufficient (the readouts, not the hand, are what make the claim
true).

**(d) Motion plan** — §3 and §3b in full. Every state that claims something moves has a named ramp
with declared `from`, `to`, entry value and termination. **No static state.**

**(e) Modes:** conceptual only. **No `mode_overrides`** (Rule 20 [D]).

**(f) `assessment` (SEVEN items) + `coverage_map` + `misconception_watch`.**
**Schema floor re-verified in code this session: `questions: z.array(quizQuestionSchema).min(6)` at
`src/schemas/conceptJson.ts:328`.** Seven items are authored — one above the floor, deliberately, so
that a later quality pass which drops a weak item does not fall through it.

**Gate 20a (`src/schemas/conceptJson.ts:565`) requires a misconception on ALL THREE wrong options of
every item — cycle 0 named one distractor per item (Checkpoint A P3-2, accepted).** All 21 are
authored below.

| # | Item · **correct answer** | State | Ring | Distractor A + belief | Distractor B + belief | Distractor C + belief |
|---|---|---|---|---|---|---|
| 1 | If `a·b` is negative, the angle between `a` and `b` is → **greater than 90°** | S2 + S3 | core | "less than 90°" — reads the sign as attached to magnitude, not to `cos θ` | "exactly 90°" — collapses "negative" into "zero", the whole S3 crossing missed | "the sign carries no meaning" — M1's residue: a product's sign is treated as an artefact |
| 2 | Two non-zero vectors have `a·b = 0`. The angle between them is → **exactly 90°** | S3 | core | "0°" — believes a zero product means maximum alignment, inverting `cos` | "180°" — believes zero is the extreme case, so it must be the far end | "no such vectors exist" — **M1**: two non-zero things cannot multiply to zero |
| 3 | `a×b` is → **a vector perpendicular to both `a` and `b`** | S4 | core | "a number equal to `\|a\|\|b\| sin θ`" — **M2**: every product returns a number | "a vector lying in the plane of `a` and `b`" — believes an output must live where the inputs live | "a vector along `a`" — believes multiplication scales the first operand |
| 4 | A triangle has two sides `a` and `b` from one vertex. Its area is → **½·`\|a×b\|`** | S5 | extended | "`\|a×b\|`" — forgets the half; the single most common Class-12 slip, the parallelogram taken for the triangle | "`½·a·b`" — reaches for the dot product because area feels like a scalar | "`\|a\|\|b\|`" — uses base × side instead of base × perpendicular height (the S5 cliff) |
| 5 | Is `a×b = b×a`? → **no; `b×a = −(a×b)` — same length, opposite direction** | S6 | extended | "yes, multiplication always commutes" — **M3** | "no — `b×a` has a different length as well" — believes order changes magnitude too, not just sign | "no — `b×a` is zero" — believes reversing the order cancels the product |
| 6 | If `a·(b×c) = 0` for three non-zero vectors, then → **the three vectors are coplanar** | S7 | advanced | "one of them must be the zero vector" — carries M1 up to three vectors | "all three are mutually perpendicular" — inverts the condition; that case gives the LARGEST volume | "`b` and `c` are parallel" — spots one sufficient case and reads it as the only one |
| 7 | *(transfer)* If `a` and `b` are parallel (θ = 0° or 180°), then `a×b` is → **the zero vector** | S4 + S5 | core | "at its maximum" — conflates "the product exists" with "it is large"; the reverse of M2 | "the number 0" — remembers the value but forgets the cross product returns a VECTOR (M2 residue) | "undefined" — believes a degenerate angle breaks the operation |

`coverage_map.by_state`: `S2 → [1]`, `S3 → [1, 2]`, `S4 → [3, 7]`, `S5 → [4, 7]`, `S6 → [5]`,
`S7 → [6]`. **`non_assessed_states: ["STATE_1", "STATE_8"]`** — S1 is the apparatus and asserts no
testable claim of its own; S8 is the sandbox. **Items + exemptions cover all eight states exactly
once ✓** (the cross-check the `concept_schema_assessment_minimum…` row's PROBE runs).

**(g) Register-triangle plan (`patterns/mathematics.md` §0 — the mathematics form of Rule 33).**

| S | Leading register | Supporting | The real number that changes (Rule 33d) |
|---|---|---|---|
| S1 | graphical | numeric | `θ`, live as `b` sweeps |
| S2 | graphical | numeric, then symbolic (the formula surface arrives last) | `a·b`, live |
| S3 | graphical | numeric | `a·b` through `0.00` into negative |
| S4 | graphical | numeric | both perpendicularity readouts, live and pinned at `0.00` |
| S5 | graphical | numeric | `Area` and `\|a×b\|`, live and equal |
| S6 | graphical | numeric | `\|a×b\|` (frozen) beside a flipping direction readout |
| S7 | graphical | symbolic (earned — advanced ring) | `Volume`, `Base`, `Height`, live through the split |
| S8 | graphical | numeric | every readout, live under the teacher's hand |

**The symbolic register never leads a core-ring state ✓.** **Every number is DERIVED by the renderer's
`vg*` helpers from the live vectors — not one authored constant is printed as a result** (directive
`derivation_principle_applied_to_one_beat_but_not_its_sibling`). **One quantity, one readout:**
`\|a×b\|` and `Area` are the same number by definition, and S5's entire claim is that identity, so
they are the one deliberate exception — both are computed in the same frame from the same vectors by
the same helper, and **`mathematics_author` must assert they agree to the displayed precision at
every sampled frame**, never merely at the pin (`patterns/mathematics.md` hazard 4: two instruments
for one quantity will eventually disagree).

**(h) Canvas budget (Rule 34) — ONE formula surface per state, value-only HUD, ≤5-word caption.**

| S | The ONE formula surface | HUD (value-only) |
|---|---|---|
| S1 | *(none)* | `θ = 60.0°` |
| S2 | `a·b = \|a\|\|b\| cos θ` | `a·b = 5.64`, `θ = 20.0°` |
| S3 | `a·b = 0 at θ = 90°` **(instant-scoped, algebra-only — NOT the biconditional `⟺`, which is notation the core ring does not own, Rule 38c)** | `a·b = 0.00`, `θ = 90.0°` |
| S4 | *(none — this is a direction state)* | `a·(a×b) = 0.00`, `b·(a×b) = 0.00` |
| S5 | `\|a×b\| = \|a\|\|b\| sin θ` | `\|a×b\| = 6.50`, `Area = 6.50` |
| S6 | `b×a = −(a×b)` | `\|b×a\| = 6.50`, `direction: −y` |
| S7 | `a·(b×c) = Volume` | `Volume = 9.95`, `Base = 4.25`, `Height = 2.34` |
| S8 | `a·b = \|a\|\|b\| cos θ` **(core-ring; survives every preset because S2 always survives)** | `a·b`, `θ`, both perpendicularity readouts |

**Overlay zoning (Rule 34d).** HUD top-right at `top:52px`+ so it clears the review chrome's
"Full screen" button. Formula surface bottom-centre. The `#vg_sliders` panel bottom-left and
**must clear `top:52px`** (OPEN scar `field3d_sliders_panel_top12_vs_fsbtn_top10`). The three zones do
not overlap at any state. **Each state shows only the overlays it needs; the rest are hidden** —
S4 shows no formula surface at all, S1 shows no `a·b`.

**(i) Curriculum-flex block (Rule 38).**

- **(i-1) BOTH reduced cuts checked coherent, string by string.**
  - **Cut 1 — hide `advanced` (drop S7).** Survivors S1–S6, S8. Checked: no survivor's narration,
    caption, formula surface, HUD or label mentions `c`, `b×c`, the parallelepiped, "volume", "base",
    "height" or coplanarity. The `volume` entry-map aspect falls back to `foundational`.
    **Hand-off column swept (A13):** S6's authored hand-off *"So what do three vectors span?"* is a
    dangling promise once S7 is hidden → **S6 plays its CUT-SAFE ALTERNATE** (§3). Every other
    survivor's hand-off points at a state that survives. **COHERENT.**
  - **Cut 2 — hide `advanced` + `extended` (drop S5, S6, S7).** Survivors S1–S4, S8. Checked: no
    survivor mentions `\|a×b\|`, "area", the parallelogram, `b×a`, order reversal, or the direction
    readout. **This is why S4 shows the two dot readouts instead of `\|a×b\|`** — a `\|a×b\|` number on
    S4 would be an orphaned quantity whose only explanation (S5) has just been cut. **Hand-off column swept (A13):** S4's authored hand-off *"Now: how long is it?"* is never
    answered once S5 is hidden → **S4 plays its CUT-SAFE ALTERNATE**; S3's hand-off points at S4,
    which survives. **COHERENT, and coherent in substance rather than
    coherent-except-for-one-number.** Reverse check: the PRIMARY
    aha (S4) and both of its misconception companions that survive (M1 at S3, M2 at S4) are core ✓;
    M3 (S6) is legitimately lost under Cut 2, which is the point of the cut.
- **(i-2) Explore surfaces CORE-ring content only (38b).** S8 exposes `theta_deg`, `a_mag`, `b_mag`
  and `b_tilt_deg`, and shows `a·b`, `θ` and the two perpendicularity readouts. **It shows NO
  parallelogram, NO parallelepiped, and no "Area", "Volume" or `\|a×b\|` label anywhere.** Its one
  formula surface (`a·b = \|a\|\|b\| cos θ`) is S2's, which survives every preset. **`b_tilt` is
  core-ring**, and deliberately so: "any two vectors in three dimensions" is the concept's core claim,
  not an extension of it.
- **(i-3) `curriculum_tags` — CLAIMS, not facts (38g).** Only CBSE/NCERT may be marked verified at
  authoring time; **every other cell ships `needs_teacher_verification: true`**, including the two
  "absent" claims, because an absence claim is still an unverified claim.

  | Board | Claim | Verified? |
  |---|---|---|
  | CBSE / NCERT | **full** — Class 12, Ch. 10 Vector Algebra | `verified: true` (chapter index read this session; NOT a teacher confirmation, stated honestly) |
  | ICSE / ISC | full | `needs_teacher_verification: true` |
  | JEE (Main + Advanced) | full | `needs_teacher_verification: true` |
  | IB DP AA | **HL full, SL absent** | `needs_teacher_verification: true` |
  | AP | **N/A for AP Mathematics** — no AP Mathematics course reaches 3D vector products. AP Physics C: Mechanics uses the cross product for torque, which is a **physics-side application, not a mathematics-curriculum coverage claim** | `needs_teacher_verification: true` |
  | Cambridge IGCSE (0580 / 0606) | **absent** | `needs_teacher_verification: true` |
  | A-level | full (Further Maths / Mechanics vectors) | `needs_teacher_verification: true` |

  **Recorded honestly (Phase-0 §0a):** this is the weakest international-breadth wave mathematics has
  scheduled — absent from IGCSE entirely and from AP Mathematics — and it is a deliberate
  CBSE/JEE/IB-HL depth play, not breadth work.
- **(i-4) Presets, derived from the rings (hide, never reorder — 38h / Rule 25d).**
  `full` = S1–S8 · `no_advanced` = hide S7 · `core_only` = hide S5, S6, S7.
  **IGCSE gets no preset** (the concept is absent from that syllabus). **No preset is teacher-visible
  until a teacher of that board confirms the tag (38g).**
- **(i-5) Graph-axis convention (38e):** **N/A** — this concept renders no 2D graph, so there is no
  axis convention to decide and no axis-swap toggle to author.

**(j) `scene_composition` PRIMITIVE PLAN — per state, added at cycle 1 (Checkpoint A P3-1, accepted).**
Cycle 0 contained the word "primitive" exactly once in 973 lines while Rule 19 requires
`scene_composition.primitives.length ≥ 3` on every state and `cognitive_limits` caps a complex state
at 6. **Both bounds are now satisfied by construction, and the count is stated per state.**

**Standing constraint, and it is why this table is short:** `field_3d` **never paints
`scene_composition` annotations** (two OPEN scars). So the primitives below are **geometry
declarations that the `vector_geometry_3d` scenario reads**, never a place to park teaching text —
every rendered STRING is routed through §10b's rendering-path column, and **zero `annotation`
primitives are authored anywhere in this concept.**

| S | Primitives (`type` — role) | Count | Ring |
|---|---|---|---|
| S1 | `vector` a (amber) · `vector` b (cyan) · `angle_arc` θ · `point` shared origin | **4** | core |
| S2 | `vector` a · `vector` b · `angle_arc` θ · `segment` projection of b on a (violet) | **4** | core |
| S3 | `vector` a · `vector` b · `angle_arc` θ · `segment` projection (violet, signed — mirrors to `a`'s far side) | **4** | core |
| S4 | `vector` a · `vector` b · `angle_arc` θ · `vector` a×b (green) · `plane_patch` the `a,b` ground plane (faint, so "leaves the plane" has a plane to leave) | **5** | core |
| S5 | `vector` a · `vector` b · `vector` a×b · `parallelogram` the violet quad · `angle_arc` θ (held) | **5** | extended |
| S6 | `vector` a · `vector` b · `vector` b×a (green, flipped) · `plane_patch` the `a,b` plane · `angle_arc` θ (held) | **5** | extended |
| S7 | `vector` a · `vector` b · `vector` c (magenta) · `vector` b×c (green) · `parallelogram` the base (violet) · `parallelepiped` the solid (violet) | **6 — at the `cognitive_limits` cap, deliberately, and it is the one state at it** | advanced |
| S8 | `vector` a · `vector` b · `vector` a×b · `angle_arc` θ · `point` shared origin | **5** | core |

**Checks.** Minimum count is 4 (S1–S3) ✓ ≥ 3. Maximum is 6 (S7) ✓ at the complex-state cap, and S7 is
the only state that reaches it — which is consistent with it being the single `advanced` state and the
one Checkpoint-B watch item (§DELIBERATELY REJECTED). **S8 carries no `parallelogram` and no
`parallelepiped`** — 38b, the explore state surfaces core-ring content only. The `plane_patch` on
S4/S6 is faint, unlabelled and exists only so that "out of the plane" and "through the plane" have a
referent; it is not the violet measured region (colour role 5) and must not be tinted violet.

**(k) SLIDER RANGES — declared, because cycle 0's §10 claimed "Zero TBDs" while never stating two of
them (Checkpoint A P1-2, accepted).**

| Knob | Range | Default | Shown on | Why the range is what it is |
|---|---|---|---|---|
| `theta_deg` | **[20, 160]** | 60 | S8 (and internally driven S1–S4) | **Camera safety** (§3a FINDING 3): outside the band min pairwise separation degrades and θ = 0°/180° is degenerate for a concept about the angle between two vectors |
| `a_mag` | **[1.0, 5.0]** | 3.0 | S8 | Spans a 5× range against `b_mag`, which is the worst-arm corner the 4-D sweep reports (min arm **0.0412**) |
| `b_mag` | **[1.0, 5.0]** | 2.0 | S5 (2.0–2.5 only) and S8 (full) | Same; S5 exposes the row but drives only the authored sub-range |
| `b_tilt_deg` | **[0, 60]** | 0 | S8 | Rotation of `b` about `â` (D-3). 0° reproduces the guided arc exactly, so the sandbox opens on the picture the lesson ended with |

All four are swept together in the §3a FINDING 3 solve — **4 of 4 live sliders, 266 747 poses.**

**Registration plan:** `src/data/concepts/mathematics/vector_products_in_space.json` **only**, per the
mathematics isolation contract (`MATHEMATICS_ARCHITECTURE.md` §5). The eight physics registration
sites are FORBIDDEN. Validation = `npm run validate:mathematics`.

---

## ENGINE DELTAS vs the Phase-0 §union F-set

**⚠ CYCLE-0 CLAIM CORRECTED (Checkpoint A P1-3, accepted).** Cycle 0 wrote *"consumed from the F-set,
unchanged, nothing new asked: F1–F10 + F19"* and concluded the union walk *"needs nothing outside the
Phase-0 set"* — while authoring a **driven parameter ramp in all seven guided states**. The word
`animate` appeared zero times. **This skeleton consumes F21 and F24 explicitly**, both of which are
PORTS of shipped mechanisms, not inventions (AMENDMENT A3-corrected / A9 / A12).

**Consumed from the F-set:** **F1** (scenario shell) · **F2** (per-state `camera_position` —
**EXISTS**, `applyState:67195`, ungated) · **F3** (two vectors from a common origin as magnitude +
angle) · **F4** (a third vector by spherical angles) · **F5** (live angle arc + degree readout) ·
**F6** (cross-product vector) · **F7** (live parallelogram mesh) · **F8** (live parallelepiped mesh) ·
**F9** (numeric readout panel) · **F10** (per-state contextual slider rows — **EXISTS**,
`show_sliders`/`visible_controls`) · **F19** (pairwise screen-separation camera gate) ·
**F21 `animate[]`** (per-state parameter ramps — **a PORT of `param_ramp`, `field_3d_renderer.ts:1050`,
`:1968`, `:2097`, and `idle_auto_sweep`, `:374`, `:926`, `:1052`, `:1951`; all motion sources already
route through `:1339`**) · **F24 `vg.camera_steps`** (mid-state camera — **adopt the existing
`os.camera_steps`, declared `:60704`, implemented `:62213–62290` / `:64631` / `:64858`; port, do not
build**). **F-row numbers are the A12-fixed ones: F21 = `animate[]`, F22 = free point, F23 =
comparison segment/projection, F24 = `camera_steps`.** No F11–F14 (Act II's), no F15–F20 (Act III's),
and F22/F23 are not touched by this concept.

### F21 consumption, state by state — every ramp named with its knob, `from`, `to` and window

| S | Ramped knob | `from` → `to` | Window (ms) | Termination |
|---|---|---|---|---|
| S1 | `theta_deg` (b sweeps into place) + `arc_reveal_frac` | 0° → 60° · 0 → 1 | 1400–3400 · 3400–4200 | one-shot-hold |
| S2 | `theta_deg` | 60° → 20° | 400–5000 | one-shot-hold |
| S3 | `theta_deg`, **three segments in one ramp list** | 20° → 90° · hold 90° · 90° → 130° | 0–2400 · 2400–3400 · 3400–5600 | one-shot-hold |
| S4 | `theta_deg` (staging) + `cross_reveal_frac`; the camera is **F24**, not F21 | 130° → 60° · 0 → 1 | 0–1400 · 1600–2600 | one-shot-hold |
| S5 | `b_mag` | **2.0 → 2.5** | 1200–5000 | one-shot-hold |
| S6 | `flip_frac` (drives the arrow's 180° rotation **and** the order label swap) | 0 → 1 | 2000–3000 | one-shot-hold |
| S7 | `c_reveal_frac` · `solid_build_frac` · **`split_solid_frac`** — three sequential ramps | 0 → 1 each | 1800–3000 · 3000–4600 · **4800–6400** | one-shot-hold |
| S8 | none (teacher-driven; Rule 37 free-run) | — | — | n/a |

**`split_solid_frac` is a RAMPED field, not a static one (Checkpoint A P1-3).** Cycle 0's D-5 authored
it as a scalar with no driver; it is driven by F21 like every other knob above.

**The deltas — things this skeleton needs that the §union F-rows and §contract draft do NOT already
name.** Each is a request to `peter_parker:field3d_surgeon` in dispatch **VG-A** or **VG-B**, sized,
and none of them is a new F-row: they are refinements of rows already bought.

| # | Delta | Which F-row it refines | Why it is needed | Size |
|---|---|---|---|---|
| **D-1** | **`vg.camera_mode: "authored" \| "steps" \| "auto_frame"`**. In `auto_frame` the camera position is computed **per frame** as `R · normalize(â + b̂ + ĉ)` with **`R = 2.5 · max(\|a\|, \|b\|, \|a×b\|)`** and **assigned directly**, bypassing `animateCameraTo()`/`lerpSpherical()`. In `steps` it routes to the existing `camera_steps` evaluator (D-10) | F2, F24 | §3a FINDING 3. Routing the follow through the spherical ease would (a) hit the azimuth branch cut at the grid corners the probe reaches, and (b) inherit the frame-rate-dependent `t = 0.05`. **The auto-framed RADIUS is the half cycle 0 omitted and is the CRITICAL scar's actual requirement** | one branch in the per-frame update |
| **D-2** | The scene convention is **symmetric**: `a` at azimuth `+θ/2`, `b` at `−θ/2` (both from `theta_deg`), so `a×b` lies along **+Y** | F3 | §3a FINDING 2. The §contract draft's `theta_deg` says nothing about WHERE the pair sits; if the surgeon puts `a` on +x this skeleton's entire camera plan is void | a two-line change in `vgBuildVectors` |
| **D-3** | **`b_tilt_deg` is a Rodrigues rotation of `b` ABOUT `â`**: `b = R_â(β)·b₀`. **NOT** a lift toward +Y and **NOT** a rotation about a world axis | F3 | **Checkpoint A P1-1.** The cycle-0 semantics gave `â·b̂ = cos β·cos θ`, so the tilt silently changed the taught angle (worst case **41.98°** of error at θ=20°, tilt=60°) while the HUD, the F5 angle arc and S8's own formula surface all reported the slider. The rotation-about-`â` form preserves θ and `\|b\|` to **6.0e−14°** / **2.2e−16** (8 601-sample probe). **`\|a×b\|` is invariant under it and `a×b` co-rotates**, so every readout stays consistent by construction | same size, different axis |
| **D-4** | `theta_deg` slider range authored **[20, 160]**, not [0, 180] | F10 | §3a FINDING 3 — this range IS the camera solve. Recorded so it is not later widened | authoring, not code |
| **D-5** | **The parallelepiped SPLIT**: a `vg.split_solid_frac: 0..1` that separates the base parallelogram from the height translate along `b×c` | F8 | S7's decompose archetype. §contract's `show_parallelepiped` is a boolean; a boolean cannot decompose. **This is the single largest delta in the list and the one most likely to be argued down** — if the surgeon judges it out of scope, S7 falls back to building the closed solid and then fading the base face to full opacity while the rest dims, which preserves the base-×-height reading at lower cost. **`mathematics_author` must confirm which was built before authoring S7's timing** | moderate — VG-B |
| **D-6** | `deriveStateMeta.ts` registration lands in the **SAME change**: `F3D_REVEAL_KEYS += 'vg'`, a `maxRevealForField3dState` block returning `reveal_ms + cushion`, and the explicit guided→`reveal_hold` / explore→`interactive` split | F1 | First item on the field_3d scar checklist; skipping it makes THE EYE mis-classify **every** state at the 1500 ms default | already scoped in VG-A |
| **D-7** | The `#vg_sliders` DOM panel must clear **`top:52px`** | F10 | OPEN scar `field3d_sliders_panel_top12_vs_fsbtn_top10` | one CSS value |
| **D-8** | **Report** whether a right-hand-rule hand mesh is reachable from a new `scenario_type`, and **report** `vector_geometry_3d`'s arrow length floor and scale constant | F6 | §10c's `ASSUMPTION`; and the `nlb_arrow_min_length_floor…` lesson — `\|a×b\| = \|a\|\|b\| sin θ` is small at θ = 20° and must clear the floor with margin | a reported number, not a build |
| **D-9** | Every numeric readout is emitted as a **single DOM text node carrying symbol AND value** (`a·b = 5.64`) | F9 | OPEN scar `calculator_dom_harvest_needs_symbol_and_value_in_ONE_text_node…` — a split label is invisible to THE CALCULATOR | authoring convention |
| **D-10** | **Port `os.camera_steps` to `vg.camera_steps`** (`[{at_ms, az, el, dist, ease_ms}]`, declared `:60704`, implemented `:62213–62290`) and **report which field carries the radius** so `dist` can be authored | F24 | AMENDMENT A9 — closed-form on state-local ms, frame-rate independent, `SET_TIME_FREEZE`-safe. S4's dolly+tilt and S7's reframe are both authored through it; **this retires cycle 0's `lerpSpherical` design-around entirely** | port, not build |
| **D-11** | **`vg.animate[]` per state** (F21) — a list of `{knob, from, to, at_ms, dur_ms}` ramps, evaluated closed-form on state-local ms, with **`split_solid_frac`, `flip_frac`, `c_reveal_frac`, `solid_build_frac`, `cross_reveal_frac`, `arc_reveal_frac`, `theta_deg`, `b_mag`** all ramp-able | F21 | Checkpoint A P1-3. **Clone targets named: `param_ramp` (`:1050`, `:1968`, `:2097`) and `idle_auto_sweep` (`:374`, `:926`, `:1052`, `:1951`)** — a PORT, per the A3 correction. Without it every re-time is an engine edit | shell-level, VG-A |
| **D-12** | The pairwise camera gate carries an **EXEMPT-PAIR list** and a **screen-LENGTH floor** | F19 | AMENDMENT A6. `a×b` vs `b×a` are antiparallel BY DESIGN and fold to 0.00°; a gate that cannot tell the designed case from the defect gets switched off by whoever meets it first. The length floor is needed because a pairwise ANGLE cannot see foreshortening (S8's worst arm is **0.0412**) | gate authoring |

**Nothing in this skeleton requires a new top-level per-state JSON field** (Phase-0 D8): D-1, D-2,
D-3, D-5, **D-10 and D-11** all live inside the state's existing `vg` block, and D-4/D-7/D-9/D-12 are
authoring, CSS or gate work. The
`build_review_site.ts` private config-assembler duplicate therefore cannot silently drop anything.

**Rule 40a, run this session:** `vector_geometry_3d` · `vgAutoFrame` · `autoFrameFromVectors` ·
`camera_follow` · `b_tilt` · `vgParallelepipedFaces` · `vgPairwiseScreenSeparationDeg` — **0 hits
across all branches on `origin/master`.** Classification: all seven are in-scope new symbols; none is
an unrelated hit; none exists on a sibling branch except the engine desk's `vp*`-prefixed twins,
which Phase-0 §desk recommends renaming rather than rebuilding.

---

## THE UNION WALK — re-run against the REAL states, both directions

*(Phase-0 §walk requires 0b to re-run this against a real skeleton; the OPEN directive
`phase0_union_table_asserted_not_walked_state_by_state` requires CO-PRESENT features, not just new
ones.)*

| S | NEW feature this state introduces | CO-PRESENT features it also consumes |
|---|---|---|
| S1 | F1, F3, F5 | F2, F9, F10 (zero rows shown — the panel exists and is empty) |
| S2 | F9 (live, first driven readout) | F1, F2, F3, F5, F10 |
| S3 | — (no new feature; the sign-crossing is F9 + F5 driven further) | F1, F2, F3, F5, F9, F10 |
| S4 | F6, **F19** | F1, F2 (**the tilt**), F3, F5, F9 |
| S5 | F7, F10 (first VISIBLE slider row: `b_mag`) | F1, F2, F3, F6, F9 |
| S6 | — (the flip is F6 re-signed) | F1, F2, F6, F7 *(hidden)*, F9 |
| S7 | F4, F8 | F1, F2 (**the reframe**), F3, F6, F9 |
| S8 | F10 (all four rows), **F2 in `auto_frame` mode (D-1)** | F1, F3, F4 *(unused — see below)*, F6, F9, F19 |

**Direction 1 — every F-row is claimed by at least one state:** F1 ✓(all) · F2 ✓(all) · F3 ✓(S1) ·
F4 ✓(S7) · F5 ✓(S1) · F6 ✓(S4) · F7 ✓(S5) · F8 ✓(S7) · F9 ✓(S2) · F10 ✓(S5, S8) · F19 ✓(S4, S8).
**11 of 11 claimed.**
**Direction 2 — every state claims at least one row:** all eight ✓. S3 and S6 introduce no NEW row,
and that is correct rather than a defect — they are the two states whose lesson is a *further
consequence* of a mechanism already bought (S3 drives F9 through zero; S6 re-signs F6). A state that
needed a row outside the set would be the alarm; none does.
**Correction to the S8 row:** F4 (the third vector) is **NOT** consumed by S8 — the explore state
shows no `c`, because `c` is advanced-ring and 38b forbids advanced content in explore. Recorded as a
correction rather than left ambiguous.

**⚠ RESULT CORRECTED (Checkpoint A P1-3).** This skeleton consumes **F1–F10 + F19 + F21 + F24** —
i.e. the Phase-0 §union F-set **plus the two rows AMENDMENT A3/A9 added after that set was written**.
Cycle 0's claim that it "needs nothing outside the Phase-0 set" was true only of the *original* set and
false of this design: **every guided state authors an F21 ramp (table above) and two states author an
F24 camera sequence.** Both additions are PORTS of shipped mechanisms (`param_ramp` /
`idle_auto_sweep`; `os.camera_steps`), so the cost is authoring surface, not new physics — but the
union table must record them, and the per-state rows below are amended accordingly:
**S1–S7 each additionally consume F21; S4 and S7 additionally consume F24; S8 consumes neither
(Rule 37 free-run + `auto_frame`).**

---

## WHAT CHANGED vs the prior skeleton

### Carried forward unchanged (the pedagogy that survived Checkpoint A)

The 8-state arc and its ordering · the atomic claim's scope and exclusions · M1/M2/M3 and their state
assignments (S3/S4/S6) · `has_prebuilt_deep_dive` on S3/S4/S7 · the nine drill-down clusters ·
`entry_state_map`'s five aspects · the ring assignment (core S1–S4 + S8, extended S5–S6, advanced S7)
and both cut verdicts · the S3 obtuse extension (F3) · S5 driven by `\|b\|` rather than θ (F7) ·
`b_tilt` on S8 (F17) · the door anchor with the area claim struck (F4) · the two dot readouts on S4
instead of `\|a×b\|` (F2) · S3's instant-scoped formula surface (F14/F16) · the IGCSE and AP tag
wordings (F10/F22) · Title Case state titles (F23).

### The four founder-named design decisions — all carried, and each strengthened

1. **S4 displays `a·(a×b) = 0.00` and `b·(a×b) = 0.00`, not `\|a×b\|`.** Carried verbatim. Its
   ring-cut justification is now written out string-by-string in §10i-1 Cut 2 rather than asserted.
2. **S5 is driven by `\|b\|`, not θ.** Carried, and the archetype claim is now made at the RHYTHM
   level (`grow-region` — the only state that drives a magnitude) with a written coinage
   justification, which is what Rule 31b actually asks for.
3. **S8 needs a `b_tilt` control.** Carried, and it is now what forced FINDING 1: probing `b_tilt`
   against the live-follow rule is how the broken camera was found.
4. **The door anchor must not claim area.** Carried, and the anchor is now a **state assignment with
   reserved words** (cycle 1: **26 counted** words inside a 46–52 budget; cycle 0 reserved 39 and
   mis-stated them as 34) rather than a skeleton paragraph — closing the
   `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` scar.

### FIXED — defects in the prior skeleton this round corrects

| # | Prior state | Fix |
|---|---|---|
| **1** | **Four assessment items** (cycle 0), grown to six in the cycle-1 amendment | **SEVEN items**, one above the schema floor `min(6)` re-verified in code at `src/schemas/conceptJson.ts:328`. `coverage_map` + `non_assessed_states` now cover all eight states exactly once, which is what the scar's own PROBE checks |
| **2** | **S8's live-follow azimuth `az = (θ+90°) mod 360°`** | **WRONG — measured `0.00°` pairwise separation at θ = 90°, `b_tilt` = 0.** It scored one pair. Replaced by the closed-form auto-frame (§3a FINDING 3), and the impossibility of any azimuth-only rule is proved rather than asserted |
| **3** | Scene convention `a` along +x | **Changed to symmetric ±θ/2** (FINDING 2) — S4's two taught pairs go from lopsided 54.5°/87.5° to symmetric 73.9°/73.9°, and S6's operand swap becomes visually honest |
| **4** | **S7's camera pose flagged `ASSUMPTION — probe-before-authoring`** (pending `c`'s components) | **CLOSED.** `c` and the camera are solved jointly: `c` at azimuth −10°, elevation 55°; camera az 60°, el 35°; min pairwise 44.0° over all six pairs |
| **5** | **S8's `b_tilt` × camera interaction flagged `ASSUMPTION`** | **CLOSED at cycle 1** by the auto-frame **with an auto-framed radius**, measured over **266 747 poses across all FOUR live sliders** at FOV 60 / 16:9. *(Cycle 0's own "8 181 poses on the full slider product" was 2 of 4 axes — Checkpoint A P1-2.)* |
| **6** | The frame-rate-dependent camera ease was not addressed (it was found after the prior round stopped) | **S4 redesigned to survive a 2× spread**: the arrow appears BEFORE the tilt so the tilt reveals length not existence; a 2 600 ms window against a 2 244 ms worst-case settle; narration timed after the slowest settle; arithmetic shown |
| **7** | Explore camera solved at the default | **Solved against the slider RANGE**, and the range itself (`theta_deg` [20,160]) is declared as part of the solve — the CRITICAL scar's actual requirement |
| **8** | Teaching strings not audited against a rendering path | **§10b now carries a rendering-path column for every string**; zero `scene_composition` annotations anywhere |
| **9** | No chapter colour language; no hand-off column | **§⓪ declares the five-role colour language for all three acts**; §3 carries the `→ hand-off` column and every hand-off is a consequence, not "and now, separately" |
| **10** | Prerequisites listed three unshipped concepts | **`prerequisites: []`**, with the §arc rule-7 floor stated and the reason for rejecting even the `scalar_vs_vector` edge given |
| **11** | Engine queue consulted under a documented DB-unreachable exception; the live sweep was left outstanding | **Four live queries run this session**, coverage boundary declared, every row in the boundary given an explicit verdict including the families dispositioned as N/A |
| **12** | `scenario_type: "vector_products_in_space"` (a concept id in a scenario slot) | **`scenario_type: "vector_geometry_3d"`, `mode: "products"`** per Phase-0 §naming |

### DELIBERATELY REJECTED, with reasons

- **Splitting S7 into two states** (the prior round's F19 watch flag: two motions — build then split —
  at 45–55 words). **Rejected.** §10i-1's Cut 1 coherence depends on the advanced ring being a single
  contiguous block, and splitting S7 would put two advanced states before explore for a lesson one
  state carries. The word budget is set at 42–52 and the two motions are sequential rather than
  simultaneous, so the state reads as one idea (a volume) shown two ways. **Re-flagged for Checkpoint
  B as a live watch, not pre-emptively split.**
- **Restoring `\|a×b\|` to S4.** Rejected — it is the Cut-2 incoherence the prior round correctly fixed.
- **Widening `theta_deg` to [0°, 180°] in explore.** Rejected — it is a camera-safety decision
  (min separation degrades 18.9° → 9.9°), and θ = 0°/180° is degenerate for a concept about the angle
  between two vectors.
- **Adding a fourth misconception.** Rejected — the founder's 2026-07-04 guardrail. Three genuine
  pivots on eight states is the right density; five states carry none.
- **Listing `scalar_vs_vector` as a prerequisite** even though it is the one baseline-locked sibling.
  Rejected — it teaches the scalar/vector distinction, which this concept does not need, so the pill
  would be misleading. Honesty over the appearance of a dependency graph.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

1. **Prerequisite cliff.** With `prerequisites: []` the cliff is real and must be patched inside this
   concept. **The break is at S2**: "how much of one vector lies along the other" presumes the student
   already accepts that an arrow carries a length *and* a direction, and that both arrows start from
   the same point. **Patch (S1, inside its budget):** one clause naming it — *"Each arrow has a length
   and a direction, and both start from the same point."* — without turning S1 into a vector-basics
   lesson. **Second cliff at S5**: "area of a parallelogram" presumes base × perpendicular height.
   **Patch (S5):** the quad's own edges are the base and the slanted side, and the narration names
   `\|a\|\|b\| sin θ` as "base times perpendicular height" once. **Third cliff at S7**: reading a
   3D solid on a 2D screen. **Patch:** the split IS the patch — base and height separate visibly, so
   the volume is read as two things multiplied rather than a picture guessed at.
2. **Exam-backwards trace (JEE Main / CBSE Class 12).**
   *"Vectors `a` and `b` have `\|a\| = 3`, `\|b\| = 2` and `a·b = 3`. Find `\|a×b\|` and state whether
   `a×b` and `b×a` are equal."*
   `a·b = \|a\|\|b\|cos θ` → **S2** delivers the formula and the meaning · solving `cos θ = ½ → θ = 60°`
   needs the sign/zero grounding of **S3** to know the angle is acute rather than obtuse ·
   `\|a×b\| = \|a\|\|b\| sin θ` → **S5** · "are they equal" → **S6** · the fact that `a×b` is a vector
   at all, so that the question's second half is even meaningful → **S4**. **No piece is missing and
   no state is idle:** S1 delivers θ as a nameable measured quantity, S7 is exercised by assessment
   item 6, S8 by the teacher.
3. **Misconception entry mapping.** **M1** is planted by S2 (calling `a·b` a *product* at all) and
   confronted proactively at **S3**; S2's narration is instructed to say "measures alignment", never
   "multiplies", so the belief is available but never asserted as fact. **M2** is planted by the whole
   of S2–S3 (a product gives a number) — **deliberately**, because that earned wrong belief is exactly
   what makes S4 land — and is confronted at **S4 by the contrast beat itself**: the arrow appears as
   a directed object leaving the plane while the narration names it a new vector, with the two dot
   readouts as the arithmetic proof. There is no pre-emptive disclaimer anywhere; Rule 16a asks for a
   contrast beat, not a warning. **M3** is planted nowhere in this concept and is confronted
   reactively at **S6**.

### Block 2 — Aha-moment designation

- **PRIMARY aha (the ten-year memory):** **Two arrows can be multiplied to give a THIRD ARROW, one
  that stands out of the flat page the first two live on.** (**S4** — inside
  `entry_state_map.foundational` ✓, so no exit-pill is required.)
- **SUPPORTING aha (1):** **The length of that third arrow is not an arbitrary number — it is the AREA
  the first two arrows enclose.** (**S5**.)
- **Cohesion check.** S5 does not stand alone: it answers the question S4 leaves open ("how long is
  it?") and it is what makes the new object feel *measured* rather than merely *defined*. One primary
  + one supporting is the stated sweet spot; **a third candidate (S7's volume) was considered and
  rejected** — it is the primary aha iterated one dimension further, which makes it a capstone rather
  than a separate memory, and it lives in the advanced ring where two of three presets cut it.
- **Wrong-belief setup.** The confident-wrong-belief S4 breaks is built by **S2 and S3**: two full
  states in which "multiplying two vectors" reliably produces a NUMBER, ending with the number
  reaching zero — the student is confident they know what a vector product is, and is about to be
  shown a second one that is a different kind of thing entirely. S5's supporting aha is set up by
  **S4** itself: an arrow whose length has, at that moment, no stated meaning.

---

## Source check line

*Consulted the NCERT Mathematics Class 12 chapter index (Ch. 10, Vector Algebra) and the named
international specifications (IB DP AA guide — SL/HL split; AP Course & Exam Description — the absence
of 3D vector products from AP Mathematics; Cambridge 0580/0606; A-level Further Mathematics) for
SCOPE only, feeding §10i-3. NCERT Exemplar consulted for misconception BELIEFS only (M1/M2/M3). No
teaching method, no example problem, no figure imported. HC Verma and DC Pandey not consulted —
physics-only (`patterns/mathematics.md` §3).*

---

## Self-review checklist

- [x] Atomic claim is one sentence, with its exclusions naming Act II by concept id.
- [x] State count (8) justified against Rule 11 and the exam test; every state's removal named.
- [x] Per-state control table present with archetype, distinct motion, delta cue, controls, word
      budget, ring, real number **and the §arc rule-6 `→ hand-off` column** — every hand-off is a
      consequence of the previous state; none reads "and now, separately."
- [x] **Eight states, eight distinct archetypes, zero repeats**; both coinages justified at the rhythm
      level; `drag-sandbox` reserved for explore.
- [x] Rule 32 legibility plan complete (cause-first with ms, one-variable-moves, delta-cue captions,
      two justified camera moves and zero elsewhere, one focal — with two states authoring NO focal
      because their claim is a relation).
- [x] **Rule 38** — rings tagged, ordered qualitative → quantitative → derivation, advanced contiguous
      before explore; BOTH cuts checked string by string; explore surfaces core only; `curriculum_tags`
      with `needs_teacher_verification` on every non-CBSE cell including the two "absent" claims;
      presets derived from rings; 38e N/A with reason; 38f anchor argued.
- [x] Rule 34 canvas budget: one formula surface per state (S1/S4 none, deliberately), value-only HUD,
      ≤5-word delta cue as the only on-canvas caption, three non-overlapping overlay zones.
- [x] Rule 41 plain language swept over every rendered string. **The banned sentence is named and
      avoided**: nothing anywhere says the cross product "refuses" to lie in the plane, and no vector
      wants, knows, escapes or fights.
- [x] Rule 35 anchor universal (**suitcase strap, 26 counted words**, re-aimed at alignment so it is
      cashed by the state it hands off to); area claim struck; secondary (doorstop) withheld to S7.
- [x] **Probe-don't-grep:** every behavioural claim carries a measured number from a probe run this
      session, a `file:line` citation, or an explicit `ASSUMPTION — probe-before-authoring` flag
      (exactly one remains: §10c's right-hand-rule hand mesh, routed to `field3d_surgeon` as D-8).
- [x] **≥6 assessment questions — SEVEN authored**, schema floor re-verified in code at
      `src/schemas/conceptJson.ts:328`; coverage map + `non_assessed_states` cover all eight states
      exactly once. **All THREE wrong options of every item carry a named misconception — 21 in total
      (Gate 20a, `src/schemas/conceptJson.ts:565`).**
- [x] **`scene_composition` primitive plan authored per state (§10j)** — minimum 4, maximum 6, Rule 19
      and `cognitive_limits` both satisfied by construction; zero `annotation` primitives anywhere.
- [x] **All four slider ranges declared with defaults (§10k)**, and all four are swept in the camera
      solve.
- [x] Engine bug queue: four live queries, coverage boundary declared, every row inside it given an
      explicit verdict; **one exception documented and FLAGGED to Gate 8** (`--scenario` sweep is
      vacuous for a scenario with zero concept files).
- [x] **No teaching string on a non-rendering path**; §10b names the rendering path for all 15.
- [x] ENGINE DELTAS section present, **twelve** deltas, each mapped to an F-row it refines; no new
      top-level per-state field. **F21 and F24 consumed explicitly, per state, both as PORTS.**
- [x] Union walk re-run against real states, both directions, with one correction recorded.
- [x] Chapter colour language declared against the five roles; no sixth role invented; the handoff
      frame for Act II named.
- [x] Camera tilt spent once, on S4, and declared not spendable decoratively elsewhere. **Every
      camera number states FOV 60 / aspect 16:9 / axes swept / worst value (A10 + A14).**
- [x] Two-pass Block 1 and Block 2 complete; foundational-coverage rule satisfied.
- [x] Zero TBDs.

---

## FLAGS — for `founder_proxy` Checkpoint A

1. **The prior round's explore camera rule was measurably wrong (§3a FINDING 1), and the failure class
   is a REPEAT** of an OPEN scar the same round cited by name. Worth a scar row of its own:
   *"a camera rule introduced to fix a pairwise-collinearity defect was itself verified on only one
   pair."* **`npm run log:lesson` is not this agent's to run** — routed to the dispatching session.
2. **The provenance defect in `engine_bug_queue`:** `field3d_no_generic_two_vector_scenario` is marked
   **FIXED** for a scenario that does not exist on master. Reconcile or reopen in the same change that
   lands VG-A (Phase-0 §desk).
3. **~~The frame-rate-dependent camera ease~~ — WITHDRAWN at cycle 1.** AMENDMENT A9:
   `os.camera_steps` already ships (`:60704` / `:62213–62290`), is closed-form on state-local ms,
   frame-rate independent by construction and `SET_TIME_FREEZE`-safe. Both camera moves are authored
   through it (F24 / D-10), so **this concept no longer depends on a platform dispatch and no longer
   needs the 2×-spread design-around.** The platform defect still exists for other scenarios; that is
   Phase-0 §open 3, not this skeleton's flag.
3b. **NEW at cycle 1 — the concept id is NOT settled.** `src/lib/mathematicsCatalog.ts:114` reserves
   `vector_dot_and_cross_product` and `:141` points Act II's prerequisite at it (AMENDMENT A5). This
   skeleton is authored as `vector_products_in_space`; **founder open decision 8**, and whichever id
   wins, both catalog references must move in the change that lands the first JSON.
3c. **NEW at cycle 1 — a scar row is owed for the `b_tilt` defect.** A slider authored to "lift `b`
   out of the plane" silently changed the taught angle by up to **41.98°** while three separate
   surfaces (HUD, angle arc, formula) all reported the slider value. The general form is worth
   recording: *a control that claims to change one degree of freedom must be PROVED to leave the
   others invariant — the proof is one probe and the failure is invisible at the authored default
   (β = 0 is exact).* **`npm run log:lesson` is not this agent's to run** — routed to the dispatching
   session, alongside flag 1.
4. **D-5 (the parallelepiped split) is the one delta most likely to be argued down** by the surgeon on
   cost. A fallback is authored (§ENGINE DELTAS D-5) that preserves the base × height reading. S7's
   timing cannot be finalised until the surgeon reports which was built.
5. **S6's 2 000 ms opening hold is 33 % of its timeline**, above the 25 % guidance of the
   `rule31_motion_floor…` directive. A remedy is authored (brightness pulse + character-by-character
   order label) but it must be **verified by dense-frame diff, not assumed**.
6. **D-11 (`vg.animate[]`, F21) is now on VG-A's critical path** — every guided state depends on it.
   It is a PORT of `param_ramp` / `idle_auto_sweep` (A3-corrected, A12), so the risk is scope drift
   toward re-inventing it, not cost. The dispatch must name the clone targets.
7. **The min projected arm in the sandbox is 0.0412** (at `\|a\| = 1` beside `\|b\| = 5`). It is
   honest — the arrow is genuinely 12× shorter than the cross product — but it is the number that must
   be checked against the renderer's arrow length floor (**D-8**). If the floor clamps it, the ratio
   the sandbox teaches is falsified, and the remedy is a range narrowing, not a clamp.
8. **This concept is NOT buildable today.** It depends on `vector_geometry_3d` (VG-A + VG-B) landing on
   master. Handoff to `mathematics_author` should not open before then.

---

## CYCLE 1 — CHECKPOINT A RESPONSE

Budget: 2 cycles, founder-set. **This is cycle 1 of 2 — the last before re-verdict.** Cycle 0 verdict
`DESIGN_FIX` (6 P1 · 6 P2 · 4 P3). Every finding below is APPLIED or REJECTED-with-evidence; nothing
is deferred. AMENDMENT A12's rulings are obeyed as given and not re-litigated.

### P1 — all six APPLIED

| # | Finding | Disposition |
|---|---|---|
| **P1-1** | `b_tilt` does not preserve θ; S8's own formula surface is contradicted on screen | **APPLIED — the finding is correct and I reproduced it.** Cycle 0's form gives `â·b̂ = cos β·cos θ`; re-measured worst case **41.98°** (θ=20°, β=60° → true 61.98°). **Fix taken: rotate `b` about `â` by β (Rodrigues), the first of the two options offered.** Probe over θ ∈ [20,160] × β ∈ [0,60] at 1° steps (8 601 samples): `max\|θ_true − θ_slider\| = 6.0e−14°`, `max\|\|b\|−\|b\|_slider\| = 2.2e−16`. `\|a×b\|` is invariant and `a×b` co-rotates, so the HUD, the F5 arc and the formula surface agree by construction. §3 convention rewritten; D-3 rewritten; §3a FINDING 2 extended |
| **P1-2** | The explore solve swept 2 of 4 live sliders; framing already off-frame; `a_mag`/`b_mag` ranges never stated in a §10 claiming "Zero TBDs" | **APPLIED in full.** Radius is now **auto-framed, `R = 2.5·max(\|a\|,\|b\|,\|a×b\|)`**; the solve is re-run **4-D over all four sliders, 266 747 poses**, at FOV 60 / 16:9, reporting BOTH metrics: **min pairwise 18.91°**, **max projected arm 0.436 vs half-extent 0.5774 (target 0.4619) — ON FRAME**, min arm 0.0412. All four ranges + defaults declared in the control table, in D-4 and in the new **§10k**. The CRITICAL scar's verdict row in §⓿ is rewritten to record that cycle 0's claim of satisfaction was false |
| **P1-3** | The `animate[]` hole: seven driven ramps authored, F21 never consumed; `split_solid_frac` had no driver | **APPLIED.** ENGINE DELTAS opens with the correction; a per-state **F21 consumption table** names every knob, `from`, `to` and window; `split_solid_frac` is now a ramped knob; **D-11 (`vg.animate[]`)** added with `param_ramp` / `idle_auto_sweep` named as clone targets; **D-10 (`vg.camera_steps`, F24)** added as a port; the union walk's "needs nothing outside the Phase-0 set" conclusion is retracted and replaced with **F1–F10 + F19 + F21 + F24** |
| **P1-4** | The `→ hand-off` sentences break BOTH ring cuts | **APPLIED.** Cut-safe alternates authored at both ring boundaries: **S4** (played whenever `extended` is hidden) and **S6** (played whenever `advanced` is hidden). §10i-1's walk now sweeps the hand-off column explicitly in both cuts. S1/S2/S3/S5/S7 need none — each hands off to a state that survives whenever the speaker does, and that is stated per row rather than assumed |
| **P1-5** | Magnitude continuity breaks at two seams | **APPLIED.** Authored-magnitude table added to §3. `\|a\| = 3.0` everywhere; `\|b\| = 2.0` S1–S4; **S5's ramp `from` moves 1.0 → 2.0** (its `to` stays 2.5, the smallest edit that closes the seam); S6/S7 inherit `\|b\| = 2.5`, so `\|a×b\| = 6.50`, not 5.20. Every downstream number re-derived: S5 `5.20 → 6.50`, S6 `6.50`, S7 `Volume 9.95 / Base 4.25 / Height 2.34`. S8's return to `\|b\| = 2.0` is declared as a sandbox slider default, not a silent teleport |
| **P1-6** | S1 is over budget before it teaches anything | **APPLIED — and the count in the finding is right; cycle 0's stated 34 was wrong.** Anchor shortened to **26 counted words**, cliff patch **folded into** the apparatus sentence, budget re-declared **46–52** with a sentence-by-sentence count totalling **50** in 4 sentences |

### P2 — all six APPLIED

| # | Finding | Disposition |
|---|---|---|
| **P2-1** | Mixed measurement basis (unit-magnitude arms presented as authored-pose measurements) | **APPLIED.** Every arm figure in the document is now in ONE basis: projected screen units at the **authored** magnitudes against the vertical half-extent 0.5774. No unit-operand number survives. The correction is stated at the head of §3a because it is what hid P1-2 |
| **P2-2** | `cross-and-reverse` launders a repeat | **APPLIED — the archetype is WITHDRAWN.** S2/S3 are declared a Rule-31b **contrast pair** whose delta names the flip (same knob, same tracked element, opposite sign of `a·b`). `grow-region` renamed **`linear-stretch`** for the rhythm, coinage justification kept |
| **P2-3** | The door anchor is orphaned | **APPLIED — first option taken: S1 re-aimed at alignment** (pulling a suitcase by its strap), cashed one state later by S2's projection segment. The door is NOT moved to S5: that would put the concept's only hook in the `extended` ring, which `core_only` deletes. The secondary (wedge doorstop, S7) is unchanged |
| **P2-4** | Rule 41 register in rendered narration | **APPLIED.** *"the dot product died"* → *"the dot product is zero"*; *"Length settled"* → *"The length is fixed"*. Also swept the two new cut-safe alternates |
| **P2-5** | Header cites a superseded collision check | **APPLIED.** The "collision-checked clear" claim is withdrawn; the header now cites **A5** and **founder open decision 8**, names `mathematicsCatalog.ts:114` and `:141`, and a new FLAG 3b routes it |
| **P2-6** | F-row numbering conflict with Act II | **APPLIED — A12's numbering adopted verbatim:** F21 `animate[]` · F22 free point · F23 comparison segment/projection · F24 `camera_steps`. This concept consumes F21 and F24 and touches neither F22 nor F23 |

### P3 — all four APPLIED

| # | Finding | Disposition |
|---|---|---|
| **P3-1** | No `scene_composition` primitives plan | **APPLIED — new §10j**, per-state, with counts. Minimum 4 (S1–S3) ≥ Rule 19's 3; maximum 6 (S7) at the `cognitive_limits` cap and it is the only state there. Zero `annotation` primitives, because `field_3d` never paints them |
| **P3-2** | Each item names ONE distractor; Gate 20a needs all three | **APPLIED — 21 distractors authored** (3 × 7), each with the belief it encodes, `src/schemas/conceptJson.ts:565` cited |
| **P3-3** | "Enclose" | **APPLIED — S7 retitled "Three Vectors Span a Volume."** Vectors span; they do not enclose. The narration hand-off is corrected to match |
| **P3-4** | The `a×b` probe value is the unit-operand one | **APPLIED.** `a×b = (0.000, 5.196, 0.000)` at the authored `\|a\|=3, \|b\|=2, θ=60°` |

### REJECTED — none

**No finding in this verdict is rejected.** All six P1s reproduce; both numeric claims I re-measured
independently (the 41.98° tilt error and the 0.885 off-frame arm) came out as reported. The two places
where I chose between options offered — P1-1's fix and P2-3's re-aim — are stated above with the
reason for the choice, and neither is a disagreement with the finding.

**One thing I am recording as a disagreement with my OWN cycle-0 text rather than with the verdict:**
cycle 0 spent most of a page designing S4 to survive a 2× frame-rate spread in `lerpSpherical`. That
work is now **deleted, not amended** — A9's `os.camera_steps` makes the whole problem not arise. A
design-around for a defect that a shipped mechanism already routes past is exactly the class A3/A9/A15
name three times in this wave.

### What the fixes FORCED that was not in the verdict

1. **A camera-radius plan, and the discovery that a dolly fights the reveal.** Sizing one radius for
   an arc whose largest rendered object grows 2.6× makes the opener small; dollying out during S4's
   tilt makes `a×b`'s projected arm **shrink** 0.432 → 0.259 and destroys the reveal. Resolved by
   moving the dolly into S4's **staging** beat (R 10 → 16, complete before the green arrow appears)
   and holding R fixed through the tilt, so the arm still grows **0.160 → 0.336 (×2.1)**. This is why
   S4's camera is now ONE `camera_steps` sequence of two steps rather than a single tilt.
2. **S7 re-solved jointly at FOV 60 with an arm floor and a box-height floor** — cycle 0's pose was
   solved at no declared FOV and produced a squat solid. New: `c` at azimuth 65°, elevation 50°,
   `\|c\| = 2.0`; camera az 30°, el 25°, R 10; **min pairwise 37.3° over all six pairs**, max arm
   0.453, min arm 0.137, Volume 9.95 with a readable Height 2.34.
3. **Three new engine deltas** — **D-10** (`vg.camera_steps`, F24, port), **D-11** (`vg.animate[]`,
   F21, port), **D-12** (the pairwise gate needs an exempt-pair list + a screen-length floor, per A6:
   `a×b` vs `b×a` are antiparallel by design and would false-fail). D-1 grows a `"steps"` mode and the
   auto-framed radius.
4. **An exempt pair, found by measuring.** The S6 sweep returned `minSep = 0.00°` for `a×b`^`b×a` —
   correct, by design, and precisely the false-fail A6 warns will get a real gate switched off. S6
   never renders both at once; the gate must still know.

---

*Handoff on `DESIGN_OK` → `mathematics_author`, once VG-A and VG-B are on master.*
