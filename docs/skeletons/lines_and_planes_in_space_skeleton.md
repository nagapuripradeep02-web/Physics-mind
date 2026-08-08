# ARCHITECT SKELETON — `lines_and_planes_in_space` — ROUND 0 (Phase 0b, the DEEPEST-CONCEPT design)
## "Lines and Planes in Space — the Address, and the Distance"

> Subject: **mathematics** · Class 12 (Three-Dimensional Geometry) · `class_level: 12` · Chapter 11 §11.1
> Pipeline: `architect → mathematics_author → json_author → quality_auditor`
> Renderer: **`field_3d`**, `scenario_type: "vector_geometry_3d"`, `mode: "lines_planes"` — **NOT ON MASTER.**
> Position: **ACT II of the three-act 3D chapter** (`MATHEMATICS_PHASE0_VECTORS_3D.md` §arc). Act I = `vector_products_in_space` (ships first), Act III = `solids_of_revolution` (ledgered).
> Authority: `docs/MATHEMATICS_PHASE0_VECTORS_3D.md` (0a survey, `master` @ `dfca9cf`) · `MATHEMATICS_DISCUSSIONS.md` §6 P3 #9 · archetype **E** (`docs/patterns/mathematics.md`, `[NEEDS-SCENARIO]`).
> Probed against **`dfca9cf`**. Every camera pose, distance, angle and frame number below was **re-computed at CYCLE 1** by a node probe (§14).
> **Projection parameters, named beside every camera number (A10 / A14 THE WORST-CASE LAW):** `PerspectiveCamera(60, aspect, …)` — vertical **FOV 60°** (`field_3d_renderer.ts:3733`, corroborated `:56905`), **reference aspect 16:9** (the aspect the file itself solves at, `:57121`, `:57319`; `camera.aspect` is live `innerWidth/innerHeight`, so no frame figure is defined without a declared reference). Frustum half-extents in the normalised units used below: **y = tan 30° = 0.5774**, **x = 1.0264**. Axes swept and the worst value are stated per row. **The ROUND-0 poses were solved at an assumed 50° FOV and are all superseded.**

> ## ⚠ STATUS — THIS SKELETON IS A **SPEC**, NOT A BUILD ORDER
> Per §0b, **#9 specs the engine and #7 ships first.** The scenario `vector_geometry_3d` does not exist on
> `master`; the `lines_planes` half is dispatch **VG-C**, not yet dispatched. Therefore:
> - **NO state in this document may be marked `buildable`.** Scar
>   `skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe` (FIXED, `alex:architect`) forbids
>   certifying a state from a mode string; here there is not even a mode string on master to cite. Every engine claim
>   below carries tier **`SPEC`** (the contract the surgeon is asked to build) or **`EXISTS`** (measured in
>   `field_3d_renderer.ts` @ `dfca9cf`, cited by enclosing function).
> - The whole value of this round is **§ENGINE DELTAS** — the eight contract changes the §walk sketch missed.
>   The recorded precedent: *"#3's 0b surfaced ten contract changes its sketch missed."*
> - **Handoff order:** this document → `founder_proxy` Checkpoint A → the amended contract is folded into the
>   **VG-C dispatch prompt** → VG-A/B/C land on master → **then** the `mathematics_author` desk opens (0d).

---

## Engine bug queue consultation — LIVE SWEEP 2026-08-08 (this session, `.env.local` present)

**Queries run, verbatim, with counts:**

| Query | Rows |
|---|---|
| `query_engine_bug_queue.ts --owner alex:architect` | 74 |
| `query_engine_bug_queue.ts --row-type directive` | 87 |
| `query_engine_bug_queue.ts lines_and_planes_in_space` | **0** (`No matching engine_bug_queue rows`) |
| `query_engine_bug_queue.ts --field3d --open` | 104 |
| `query_engine_bug_queue.ts --scenario vector_geometry_3d` | **not runnable** — the flag derives its id set from `src/data/concepts/`, and no concept authors this scenario yet (survey §queue records this exact blind spot). Recorded, not skipped. |

**Declared coverage boundary — narrowed, and the narrowing is stated rather than hidden.** Directive
`scar_audit_claims_a_coverage_boundary_it_did_not_enumerate` requires that the dispositioned set be a SUPERSET of
the declared query union. Dispositioning 265 rows verbatim is not achievable inside one dispatch, so the boundary
is narrowed **by named, enumerable exclusion** rather than by a wildcard:

- **IN the boundary and dispositioned below:** every `alex:architect`-owned OPEN row · every `--field3d --open` row
  whose subject is a NEW scenario, the camera, sprite labels, the slider panel, `deriveStateMeta`, ring cuts,
  explore states, or `scene_composition` annotations · the six rows the survey §queue names.
- **OUT of the boundary, by named family, each with a reason:** the **`nlb_*`** family (21 rows) — the
  `newtons_laws_body` scenario's private config (`param_ramp`, work bars, lanes, checkpoint stamps); this concept
  authors none of that machinery. The **`pcpl_*` / `pm_*` / `locus_trace` / `plane_*`** family — `parametric_renderer.ts`,
  a different renderer. The **`biot_*` / `solenoid_*` / `mfl_*` / `ecp_*` / `cyclotron_*` / `force_rig_*` /
  `radius_scenario_*` / `seam_*` / `energy_*`** families — per-scenario physics defects on scenarios this concept
  does not touch. The **`CACHE_*` / `calculator_*` / `eye_*` / `harness_*`** families — serving-path and
  tooling rows owned by `runtime_generation` / `visual_validator`. **If founder_proxy judges any excluded family
  in-scope, name it and it will be dispositioned in round 1.**

**Dispositions — the rows that BIND this design** (bug_class verbatim; verdict; where discharged):

| bug_class | Verdict | Discharged at |
|---|---|---|
| `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` | **BINDS** | §10(f) — **7 items** vs floor `.min(6)`, verified in code at `src/schemas/conceptJson.ts:328` this session |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` | **BINDS** | §10(b) — every teaching string is on a rendering path; the annotation column of §3 is design notes only |
| `biot_state6_dotcross_lesson_not_rendered` | **BINDS** (same defect, and it is literally a dot/cross lesson) | §10(b) delivery-surface column |
| `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius` [CRITICAL] | **BINDS** | §5 S9 row — **RE-DISCHARGED AT CYCLE 1.** Solved over **every** live slider at FOV 60 (A14 worst-case law): the single-scene explore state has **no feasible pose (min pairwise 1.35°)** → Δ10 splits it into two groups, solved to **41.1°** and **11.0°**. ROUND 0's "fill 0.915" discharge was computed at a 50° FOV and is void |
| `camera_metric_scored_foreshortening_not_pairwise_screen_separation` | **BINDS** | §5 — every pose scored **pairwise, perspective**; §ENGINE DELTA 2 extends the metric |
| `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` | **BINDS** | §5 — the solve is a full **az × el (× R)** grid, never one axis |
| `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` | **BINDS** | §10(b) — every symbol also has a DOM-readable home (HUD row / formula surface); no claim rests on a sprite alone |
| `field3d_world_space_label_decollision_is_projection_blind_and_collides_on_screen` | **BINDS** | §11 — label slots authored in SCREEN zones, not world minimum-separation |
| `field3d_sliders_panel_top12_vs_fsbtn_top10` | **BINDS** | §11 — `#vg_sliders` at `top:52px`+ |
| `field3d_formula_overlay_generic_not_cambria_math` | **BINDS** | §10(h) — math-serif Unicode surface, Rule 34b/c |
| `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` | **BINDS** (verified this session: the generic matcher sits immediately above the camera block in `applyState`, `field_3d_renderer.ts:67186–67197`, i.e. it runs BEFORE the per-scenario apply) | §ENGINE DELTA 7 — VG-C must force apparatus visible inside `applyVectorGeometry3dState()` |
| `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` | **BINDS** | §ENGINE DELTA 8 — three sites, verified `F3D_REVEAL_KEYS` at `src/lib/validators/visual/deriveStateMeta.ts:704` |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` | **BINDS as a design constraint** | §5 — every state's apparatus is authored CENTRED on the origin; measured max off-origin extent 4.5 units |
| `explore_state_formula_surface_asserts_a_relation_no_state_derives` | **BINDS** | §10(h)/(i-2) — S9's surface is `r = a + λd`, derived by S1 (**core**), so it survives every preset |
| `explore_controls_not_ring_gated_survive_the_ring_cut` | **BINDS** | §10(i-2) — discharged by RING ASSIGNMENT (every explore control is owned by a core state), **not** by `min_ring`, which `patterns/mathematics.md` hazard 11 measures as inert |
| `declared_payoff_state_ringed_outside_the_core_preset` | **BINDS** | §10(i-1) reverse check — PRIMARY aha (S3) and all three `misconception_watch` states (S3/S4/S5) are **core** |
| `core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring` | **BINDS** | §10(i-1) — both-direction check; no core state renders `d₁ × d₂` or the skew formula |
| `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` | **BINDS** | §10(h) — every surface identity **evaluated against its own HUD numbers** this session |
| `delta_cue_restates_the_declared_misconception_verbatim` | **BINDS** | §3 — S5's cue names the HELD thing ("Same picture, different depths"), never "these lines cross" |
| `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` | **BINDS** | §12 — S3/S4/S5 sub-beat boundaries + pin margins tabulated |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | **BINDS** (the general half) | §12 — every pin ≥ 167 ms after its last asserted reveal |
| `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` | **BINDS** | §12 — margins measured from reveal **completion**, not phase start |
| `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` | **BINDS — and is the single largest delta** | §ENGINE DELTA 1 (per-object `reveal_at_ms`) + DELTA 3 (`animate[]`) |
| `phase0_union_table_asserted_not_walked_state_by_state` | **BINDS** | §13 — both-direction walk over real states |
| `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` | **BINDS** | §13b — the SCRIPTABILITY row; it is what surfaced DELTA 3 |
| `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` | **BINDS** | §ENGINE DELTAS closes both directions against the §union F-set |
| `signed_engine_union_drops_items_its_own_state_table_still_consumes` | **BINDS** | §13 — every primitive in §3 maps to an F-row or a declared DELTA |
| `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` | **BINDS** | §ENGINE DELTAS preamble — the `vg` block's shared semantics are quoted from the survey §contract verbatim; every change is listed as a DIFF against it, for Act I's skeleton to quote back |
| `state_added_at_review_outruns_the_config_contract_shape` | **BINDS** | §ENGINE DELTAS — the SHAPE question (two lines + one plane + one free point co-present in ONE state) is asked now, at S9 |
| `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on` | **BINDS** | §ENGINE DELTA 4 — the intersection marker's absence semantics diffed against D5 |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | **BINDS** | every "EXISTS" row cites its **enclosing function**, not a matching line (the survey's own `:66995` vs `:67195` trap) |
| `named_primitive_declared_without_the_surface_that_can_render_it` | **BINDS** | §10(b) — every named primitive has a surface column |
| `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | **BINDS** | §9 — anchors assigned to S1 and S5 with word counts |
| `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` | **BINDS** | §9 — verbatim sentences, inside the state's own budget |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | **BINDS** | §3 Rule-32 plan — S3/S6/S7/S8 are RELATION states and author **no** `glow_focal` |
| `teach_do_not_prespoil_a_later_reveal` | **BINDS** | §9 — the overpass anchor is held to S5; `d₁ × d₂` never appears before S8 |
| `teach_visual_must_match_narration` · `teach_show_quantity_live_when_named` · `teach_reveal_synced_to_narration` | **BINDS** | §3 / §12 — every named quantity has a live readout revealed on its own beat |
| `teach_concrete_before_abstract_compare` | **BINDS** | S8 stages it: the common perpendicular alone (already known from S5), THEN `d₁ × d₂` beside it, THEN the overlay |
| `teach_coordinate_sim_with_graph` | **N/A — reason:** no state carries a graph; the numeric register is carried by HUD readouts (`patterns/mathematics.md` §0) |
| `teach_distinct_reference_lines_for_two_radii` | **N/A — reason:** no two radii; the analogous risk (two distances co-present in S9) is handled by two separately-labelled readouts, §11 |
| `teach_field3d_explore_grab_and_move_field_point` [OPEN directive] | **BINDS as a NON-BUILD** | §ENGINE DELTAS ledger — S3's point `q` and S9 are the exact shape this directive asks for, and it is explicitly **not** smuggled into a mathematics scenario (survey §ledger 3). Sliders serve S9. Recorded, deliberately unbuilt. |
| `teach_inverted_scenario_inverts_cutline_flags` · `teach_color_each_element_by_its_own_sign` · `teach_read_dense_ramp_frames_not_just_frozen` · `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` | **SATISFIED / downstream** — no inverted sibling; no signed quantity; dense-frame reading is `eye_walker`'s; §11 authors sliders in `config.slider_controls` where the auditor reads them |
| `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` | **BINDS on VG-C** | §ENGINE DELTAS — `lambda: 0.0`, `theta_deg: 0`, `d·n = 0` and `half_extent` are all **legal authored zeros**; presence must be `typeof`/`in`, never falsy |
| `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` | **BINDS** | §12 — every guided state's longest static run ≤ 25 % of its timeline, budgeted |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` | **BINDS** | D3 (recompute-from-clock, never accumulate) is restated as a VG-C acceptance in §ENGINE DELTAS |
| `field3d_param_ramp_authoring_contract` | **BINDS — ROUND 0's `N/A` was FALSE.** `param_ramp` is declared by **three** scenarios (`field_3d_renderer.ts:1050`, `:1968`, `:2097`), not one, and F21 is a PORT of it. Its lesson (authored static value == `from`) is a VG-A acceptance | §ENGINE DELTA Δ3 |
| `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` | **BINDS** | this document cites Act I by CONTENT ("Act I's parallelogram state"), never by state number |
| `call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep` | **BINDS** | Rule 40a sweep run: `git log --all -S` for `vector_geometry_3d` / `vgParallelogramVerts` / `lines_planes` → **0 hits on all branches** (survey §inventory, re-confirmed) |
| `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | **BINDS — and is why the boundary above is declared narrowed rather than complete** | this section |

---

## ⓿ ENGINE FIT CHECK — every visual need → an F-row, tiered honestly

| Visual need (state) | F-row | Tier | Evidence |
|---|---|---|---|
| Per-state camera pose with eased transition (all) | **F2** | **EXISTS** | ungated block inside `applyState()` — `field_3d_renderer.ts:67195`, resolved to its **enclosing function** (the survey's `:66995` scenario-local twin was checked and rejected) |
| Per-state contextual slider rows over one shared panel (S1, S3, S5, S6, S9) | **F10** | **EXISTS** | `show_sliders` / `visible_controls` / `slider_controls` plumbing, 100 / 37 / 424 sites |
| Focal brightening + peer dim (S1, S2, S4, S5) | — | **EXISTS** | `applyGlowEmphasis`, 129 sites (Rule 29 / 32e) |
| Arrows (`d̂`, `n`, `d₁ × d₂`) | — | **EXISTS** | `ArrowHelper`, 205 sites |
| Scenario shell + `apply…State()` + per-frame update (all) | **F1** | **SPEC (VG-A)** | — |
| Extended line through a point in a direction, drawn to scene bounds, live λ marker (S1, S4–S9) | **F11** | **SPEC (VG-C)** | — |
| Plane from point + normal, sized to read, with its normal arrow (S2–S4, S7, S9) | **F12** | **SPEC (VG-C)**, = F7 translated (D2) | — |
| Foot of perpendicular / shortest-distance segment + live distance (S3, S5, S8, S9) | **F13** | **SPEC (VG-C)** | — |
| Intersection marker appearing only when the intersection exists (S4, S9) | **F14** | **SPEC (VG-C)**, D5 | — |
| Live angle arc between two directions + degree readout (S6, S7) | **F5** | **SPEC (VG-A)** — but the draft contract exposes `show_angle_arc` only in `products` mode → **DELTA 5** | — |
| Cross-product vector drawn perpendicular to a pair's plane (S8) | **F6** | **SPEC (VG-A)** | — |
| Numeric readout panel, live (all) | **F9** | **SPEC (VG-A)** — token set for `lines_planes` unspecified → **DELTA 6** | — |
| Pairwise screen-separation camera gate (all) | **F19** | **SPEC (gate)** — needs an exempt-pair list and a length floor → **DELTAS 1a/2** | — |
| Per-object timed reveal chain (S3, S4, S5, S8) | **none — MISSING** | **DELTA 2** | `reveal_ms` is ONE scalar per state |
| Animating a knob WITHIN a state (λ in S1; the line's slide in S4; d₂'s rotation in S6) | **F21 `animate[]`** | **PORT (VG-A)** | **NOT an invention — two authored mechanisms already ship and are the clone targets:** `param_ramp` (`field_3d_renderer.ts:1050`, `:1968`, `:2097`) and `idle_auto_sweep` (`:374`, `:926`, `:1052`, `:1951`); all three motion sources route through one path (`:1339`). The genuine need is **authorability by `json_author` without an engine edit per re-time** — see the corrected Δ3 |
| A free POINT in space (S3, S9) | **F22** | **PORT/SPEC (VG-C)** | the drafted `vg` block has `lines[]` and `planes[]` and no way to name a point |
| Comparison segment (S3) and a line's projection onto a plane (S7) | **F23** | **SPEC (VG-C)** | — |
| **Camera moving DURING a state** (S1's seam ease; S5's swing) | **F24 `vg.camera_steps`** | **EXISTS as `os.camera_steps` — PORT, do not build** | declared `field_3d_renderer.ts:60704`, implemented `:62213–62290` / `:64631` / `:64858`. Its header: *closed-form on state-local ms, never a lerp in flight* → frame-rate independent, byte-identical under `SET_TIME_FREEZE`, eases rather than cuts, starts and ends at rest (Rule 32d). **This dissolves the old ASSUMPTION A4 / FLAG 2 for this concept** |

---

## 1. Atomic claim

This concept teaches that **a point plus a direction names a line and a point plus a normal names a plane — and that
once space is named this way, every "how far apart" question in it is answered by one perpendicular.** It does not
cover the vector products themselves (Act I, `vector_products_in_space` — `a·b` and `a×b` are **assumed, never
re-taught**, per §arc rule 4), the equation of a sphere, coplanarity determinants, or three-plane systems
(deferred). Its one bridge forward: the plane patch of S2 is the flat region Act III spins.

## 2. State count + arc — **9 states** (complex, justified)

**Count justification (Rule 11).** Two objects (line, plane) × three questions each (what names it · when do two of
them meet · how far apart are they) is six irreducible beats; space adds one case that the plane does not have
(skew), one angle that needs the normal as an intermediary, and one explore state. Merging any pair breaks a
hand-off sentence: fold S5 into S6 and the angle beat loses the motivation that makes it necessary; fold S3 into S4
and the PRIMARY aha shares a state with a case analysis. The §walk sketch's 9 is confirmed, but the ORDER is
changed — the sketch put "two lines, three cases" at S2, before "shortest distance" existed as an idea; that would
have shown a gap number before any state explained what a shortest distance is (`core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring`, in its within-concept form).

| # | Title (Rule 41d — short, first words carry) | Purpose | teaching_method | ring |
|---|---|---|---|---|
| S1 | One Number Names Every Point on a Line | `r = a + λd`; λ is the address along the line | *(straightforward)* | core |
| S2 | A Normal Direction Fixes a Whole Plane | `n·(r − a) = 0`; the patch is Act I's parallelogram, now defined by what it is perpendicular to | *(straightforward)* | core |
| S3 | The Perpendicular Is the Shortest Segment | **PRIMARY AHA** — of all the segments from a point to a plane, the perpendicular is the short one | *(straightforward)* | core |
| S4 | A Line Meets a Plane Once, or Never | one point, or none; `n·d = 0` is the "never" case | *(straightforward)* | core |
| S5 | Two Lines That Never Meet | **SUPPORTING AHA** — skew: not parallel, and still no meeting point; the gap is a real length | *(straightforward)* | core |
| S6 | Directions Alone Fix the Angle | directions alone give it — positions do not matter | *(straightforward)* | core |
| S7 | Measure to the Normal, Then Subtract | a plane has no single direction, so measure to the normal and take the complement | *(straightforward)* | **extended** |
| S8 | The Gap Runs Along d₁ × d₂ | the gap runs along `d₁ × d₂`; the formula reads it off | `derivation_first_principles` | **advanced** |
| S9 | Explore: Move Every Part | teacher sandbox, all controls | `exploration_sliders` | core |

**Ring order is monotone: core ×6 → extended ×1 → advanced ×1 → explore.** Advanced ring `{S8}` is contiguous and
sits immediately before the explore state ✓ (Rule 38a). The hook MOVES from t = 0 (S1's λ sweep) — no static setup
state. `advance_mode`: S1–S8 `manual_click`, S9 `interaction_complete` → **2 distinct modes** (Gate 12 ✓). No
`wait_for_answer`, no `narrative_socratic` anywhere (Rule 31).

## 3. Per-state choreography + control plan (Rule 31 — the control table, FIRST artifact)

**Chapter apparatus + colour language — ACT I'S TABLE, VERBATIM (§arc rule 2; A12).** ROUND 0 inverted
roles 4 and 5 in both directions and invented a sixth ("pale grey-blue"). **Both are reverted.** Act I's
load-bearing claim is *"green NEVER means an input"* — it is the chapter's primary aha — so a plane's
normal and a common perpendicular, being DERIVED objects, are green, and the measured region is violet.

| Act I role (fixed) | Colour | Hex | This concept's occupant |
|---|---|---|---|
| 1 · first direction | amber | `#F5A623` | `d`, then `d₁` |
| 2 · second direction | cyan | `#3FC8E4` | `d₂` |
| 3 · third direction | magenta | `#E15FA8` | the point-to-point vector `a₂ − a₁` (S8's numerator) — **restored; ROUND 0 dropped magenta entirely** |
| 4 · **derived object** | **green** | `#5BD97A` | the plane's normal `n`; the perpendicular segment from `q`; the common perpendicular; `d₁ × d₂` |
| 5 · **measured region** | **violet**, translucent | `#8B6FE8` @ 0.28 α | the plane patch |

**Points are not a sixth role.** `a`, `q`, the foot and the intersection marker are drawn in the chapter's
**neutral apparatus ink** — the same ink as the origin marker and the axis triad that Act I already
authors. A point is not a direction and not a region, so it takes no role colour; this is a statement of
the existing five-role table, not an extension of it. S3's two "wrong" comparison segments are drawn in
the same neutral ink and the winning one turns **green** when it locks — green arriving is exactly the
"something the other objects MADE" signal Act I established.

Origin marker, axis triad, arrow style and the readout panel position are **identical to Act I's** — a teacher
moving from #7 to #9 must recognise the workspace instantly (Rule 32d promoted to chapter scope).

**The control table.** Narration budget is EN words (Rule 31: 25–55 guided, explore 0/open).

| St | Teaches (one idea) | Ring | Archetype | Distinct motion | Delta cue (≤5 words) | Live controls | Words | **→ hand-off (§arc rule 6)** |
|---|---|---|---|---|---|---|---|---|
| S1 | A line is one point plus one direction; λ counts your position along it | core | `parameter-sweep` | **Entry = Act I's S5 FINAL FRAME, unchanged (§arc rule 5 / A12): the violet parallelogram with the GREEN `a×b` standing perpendicular on it, at Act I's own pose az 90° / el 30°. Nothing about that frame changes; only the words do** — the narration re-labels the green arrow `n` and the violet quad "a patch of a plane". **The green arrow is never deleted and no violet normal is ever grown** (the ROUND-0 seam defect). Then patch and normal both DIM to ghosts, keeping their colours, and one patch edge survives as the amber `d̂` at `a`; the line extends to the scene bounds and the λ marker slides `−3.5 → +3.5`, coordinate readout live. `camera_steps` (F24) eases az 90→94, el 30→6, R 9→13 across the dim-down | **One point, one direction** | `lambda` | 34–42 | *"One number now names every place on this line. Naming a whole flat sheet needs more than a direction."* |
| S2 | A plane is one point plus one perpendicular direction — **and the dot product is the test for "perpendicular"** | core | `reveal-build` | The **green normal `n` is already present from S1** (never re-grown); it brightens, and the **violet** patch re-unfolds around it edge by edge out to `half_extent = 3.0`. **The dot-product introduction beat (one beat, 3.5 s):** a neutral test vector `v` is drawn from `a` and swung inside the patch while the HUD row `n·v` holds `0.000`; it is then tipped off the patch and `n·v` moves off zero. That is the whole introduction — `n·v = 0` means "perpendicular to `n`". The S1 line retires to a dim ghost | **One point, one normal** | `half_extent` | 44–52 | *"Every point on the sheet is now named. Take a point that is not on it — how far away is it?"* |
| S3 | **PRIMARY AHA** — of all the ways to get from a point to a plane, the perpendicular one is the shortest | core | **`sweep-to-extremum`** *(coined: a driven parameter passes through a stationary value and the readout DIPS and rises again — distinct from `parameter-sweep`, whose readout is monotone in its driver. No seed archetype names a minimum being found by motion.)* | The point `q` sits above the patch. A neutral segment runs from `q` to a foot that slides along **ONE straight in-plane path — the `u` axis through the true foot** (ROUND 0 authored the two comparison feet on different axes, `+1.6u` and `−2.2v`, which no single straight sweep can pass through; measured, both lie on the `u` path: `s = −2.2 → 3.110`, `s = +1.6 → 2.721`, `s = 0 → 2.200`). **One path, one dip:** the foot runs `s = −2.2 → +1.6` and the readout falls `3.11`, reaches `2.20` at `s = 0`, rises to `2.72`; the foot then returns to `s = 0`, the readout falls back to `2.20`, and the segment turns **GREEN** and locks with a right-angle mark | **The perpendicular is shortest** | `q_height` | 40–48 | *"That perpendicular is the whole distance idea. Now replace the single point with a whole line: does it hit the sheet, or pass by it?"* |
| S4 | A line and a plane meet at one point, unless `n·d = 0`, when they never meet | core | `translate-through` | TWO lines, sequential. First the cyan line whose `n·d = 0` slides bodily toward the patch and passes clean over it — no marker ever appears, and the readout holds `n·d = 0.000`. Then the amber line arrives on a different heading, punches through the patch, and the intersection marker snaps on at `λ = 2.600` | **Crosses, or never touches** | none | 42–50 | *"A line and a plane settle into one of two cases. Two lines in space have a third case, and it exists only in three dimensions."* |
| S5 | **SUPPORTING AHA** — two lines can be neither parallel nor meeting: they pass at different depths | core | `rotate-to-reveal` | **The `shortest distance = 1.80` readout is LIVE from t = 0** — the false picture is never on screen unnumbered (ROUND 0 rendered it for 3.5 s with nothing contradicting it; the §camera invariant says the number is what makes "they do not meet" true on screen). The two amber/cyan lines draw and their images visibly CROSS (measured: at `t = 0.495` along line 1 at the S5 pose); a marker pulses at the crossing pixel for **1.5 s** while the readout already says 1.80, then is removed. The **green** common perpendicular grows between the true nearest points. `camera_steps` (F24) then eases to the S8 pose, where the miss is plain | **Same picture, different depths** | none | 44–52 | *"They never meet, so there is no crossing point to measure an angle at. The angle must come from the directions alone."* |
| S6 | The angle between two lines is fixed by their directions; moving either line does not change it | core | `rotate/flip` | Both directions are re-drawn from ONE origin with the arc between them. First each line's anchor slides along itself and the arc holds at **69.4°** — position does nothing. Then `d₂` rotates about the pair's normal, 25° → 115°, and the arc and readout track it continuously | **Directions alone give the angle** | `theta_deg` | 38–46 | *"That worked because each line has a direction. A plane does not have one direction. It has a normal, and the angle is measured from the normal."* **· RING-CUT ALTERNATE (`core_only`, S7 and S8 hidden — S6 is terminal):** *"Every distance and every angle so far came from one point, one direction, and one perpendicular."* |
| S7 | The angle between a line and a plane is measured to the normal, then subtracted from 90° | **extended** | `decompose` | The cutting line of S4 returns. It splits into two drawn parts: its shadow lying in the plane, and its component along `n`. Two arcs appear in sequence — first the 55.0° arc to the normal, then the 35.0° arc to the shadow — and the readouts show them summing to 90.0° | **Measure from the normal** | none | 40–48 | *"A plane supplies a normal. Two skew lines supply no normal, so the perpendicular has to be built from the two directions."* **· RING-CUT ALTERNATE (`no_advanced`, S8 hidden — S7 is terminal):** *"A normal answers both questions about a plane: how far a point is from it, and at what angle a line meets it."* |
| S8 | The shortest gap between skew lines lies along `d₁ × d₂`, and its length is `\|(a₂−a₁)·(d₁×d₂)\| ⁄ ‖d₁×d₂‖` | **advanced** | **`overlay-match`** *(coined: an independently-built object is moved onto a previously-drawn one to show the two coincide. No seed archetype names proof-by-superposition; `translate-through` is already S4's and describes passage, not identity.)* | The S5 scene returns with the common perpendicular already present (concrete before abstract). A separate violet `d₁ × d₂` arrow is built at the origin from the two directions, then translated onto the common perpendicular — the two coincide exactly. The formula surface writes itself and its three HUD terms fill in | **Gap direction: d₁ × d₂** | none | 44–52 | *"Every measurement in this chapter is now a number you can change. The last state gives you the controls."* |
| S9 | Teacher sandbox | core | `drag-sandbox` | Free-running (Rule 37). λ ping-pongs until a slider is seized; every readout stays live | **Move every part** | **ALL:** `scene_group` (**A** line+plane+perpendicular / **B** skew pair+common perpendicular — forced by the camera solve, §5), `lambda`, `lambda_span`, `half_extent`, `q_height`, `theta_deg`, `line2_offset` | 0 / open | — |

**Archetype no-repeat check:** `parameter-sweep` · `reveal-build` · `sweep-to-extremum`* · `translate-through` ·
`rotate-to-reveal` · `rotate/flip` · `decompose` · `overlay-match`* · `drag-sandbox` — **nine distinct**, two
coinages each justified inline, `drag-sandbox` on the explore state only ✓.

**Rule 32 legibility plan.**
- **32a cause-first:** in every state the CAUSE moves and the effect answers after a readable beat — S3's foot
  sweeps before the readout re-settles; S4's line translates before the marker snaps on; S6's `d₂` rotates before
  the arc redraws. Never simultaneous.
- **32b one variable moves:** the plane holds its pose in S3/S4/S7; the two lines hold their anchors in S6 while
  only `d₂` turns. S9 exempt.
- **32c** the delta-cue column IS the on-canvas caption (and nothing else is — Rule 34a).
- **32d home pose:** ONE apparatus, one origin, across all nine states. The camera moves only to frame the new
  thing, and the ONE deliberate swing (S5) is the chapter's declared "there is a dimension you have not seen"
  motion.
- **32e ONE focal:** `glow_focal` is authored **only** on S1 (the amber direction arrow), S2 (the green normal), S4 (the
  intersection marker) and S5 (the green common perpendicular). **S3, S6, S7 and S8 author NO `glow_focal`** — each is a
  claim about a RELATION between two co-present objects, and dimming either half destroys the comparison
  (`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach`: Rule 32e caps the focal count at
  one, it does not require one).

## 4. Misconception confrontation plan (Rule 16a — **exactly 3** genuine pivots)

`misconception_watch` is authored on **S3, S4 and S5 only**. The other six states are straightforward teaching and
carry none (founder guardrail 2026-07-04).

| # | Wrong belief (NCERT Exemplar-class, belief only) | State | Straightforward contrast beat — consequence first, then the mathematics, no prediction and no pause |
|---|---|---|---|
| M1 | "The distance from a point to a plane is just how far it is to the nearest bit of the plane you can see — any line down to it will do" | S3 | The sweeping segment SHOWS the consequence: at the patch centre it reads `3.11`, further along `2.72` — several different "distances" for one point, which cannot all be the answer. Only when the segment turns perpendicular does the readout stop falling, at `2.20`. `one_line_fix`: "Every segment from the point to the plane is longer than the perpendicular one, so the perpendicular length is the distance." |
| M2 | "`n·d = 0` means the line is perpendicular to the plane" (the normal is confused for the plane itself) | S4 | The cyan `n·d = 0` line is shown doing what that condition actually forces: it glides past the patch, parallel, and never touches — with the readout pinned at `0.000` the whole time. The amber line that DOES cut through has `n·d = 0.624`, plainly not zero. `one_line_fix`: "`n·d = 0` means the direction is perpendicular to the NORMAL, which puts the line parallel to the plane." |
| M3 | "If two lines are not parallel they must cross somewhere" (plane geometry carried into space) | S5 | The wrong picture is performed by the engine, because the screen genuinely draws it: from the entry pose the two lines cross at a pixel (**measured: they cross at t = 0.815 along line 1** — see §14), and the marker pulses there. Then the common perpendicular is drawn between the true nearest points, reading **1.80**, and the camera swings so the miss is visible. `one_line_fix`: "Their pictures cross, but at that place they are 1.80 apart along the line joining them — in space, not parallel does not mean meeting." |

**Cue cross-check (`delta_cue_restates_the_declared_misconception_verbatim`):** no delta cue states a wrong belief as
fact. S5's cue names the held thing — "Same picture, different depths" — never "these lines cross". S4's cue,
"Crosses, or never touches", states the two REAL cases, not the myth.

**Pin safety (`frozen_pin_unbudgeted_on_a_sequential_misconception_state…`):** S3/S4/S5 all run wrong-picture-first;
every pin is budgeted in §12 to land after the correct half by ≥ 167 ms.

**EPIC-C branches: ZERO** (EPIC-L-first directive 2026-06-10; Zod `.optional()`).

## 5. Camera plan — RE-SOLVED AT CYCLE 1, FOV 60 / aspect 16:9 (every ROUND-0 pose superseded)

**Projection parameters, named beside the numbers (A10 + A14 THE WORST-CASE LAW).** FOV **60°** vertical
(`PerspectiveCamera(60, …)`, `field_3d_renderer.ts:3733`), reference aspect **16:9**, target = origin,
up = +Y, perspective. Frustum half-extents **y 0.5774 / x 1.0264**; "fill" below is the max `|NDC|` over
every rendered vertex (1.000 = the frame edge). Solve = full **az × el grid at 2°** (× R where R varies),
scored **pairwise, undirected, over every rendered pair**, with a **screen-LENGTH floor** wherever a
segment's length is the taught quantity. **ROUND 0's poses were solved at an assumed 50° FOV and every one
of them changes.**

| St | R | az / el | axes swept | min pairwise sep | length floors met | worst fill |
|---|---|---|---|---|---|---|
| S1 | **9 → 13** | **entry az 90 / el 30 (Act I's S5 final frame, verbatim)** → `camera_steps` eases to **az 94 / el 6** | az × el, R fixed per phase | **59.6°** | — (`d̂` on its own line = exempt pair) | **0.382** (entry frame at R 9: **0.223**) |
| S2 | 13 | az **−62** / el **16** | az × el | **59.5°** | normal **48.3 %** of patch width | 0.338 |
| S3 | 13 | az **−44** / el **42** | az × el | **23.6°** (the length floor is BINDING — the pure-pairwise optimum draws the perpendicular shorter) | perpendicular **33.1 %** of patch width | 0.566 |
| S4 | 13 | az **−176** / el **22** | az × el | **34.8°** | — | 0.326 |
| S5 | 13 | az **146** / el **4** → `camera_steps` to the S8 pose | az × el, **plus a hard constraint that the two line images CROSS** | **52.1°** | common perpendicular **33.4 %** of the L1 image | 0.451 |
| S6 | **5** | az **−58** / el **68** | az × el × R, **and the full `theta_deg` sweep 25°–115° at 1° steps** | **25.5 %→ 25.5°** minimum over the whole sweep | direction arrows drawn at **length 2.5** (at R 13 two unit arrows fill only 0.074 of the frame — a ROUND-0 miss) | 0.526 |
| S7 | 13 | az **140** / el **26** | az × el | **29.5°** | normal **87.4 %** | 0.357 |
| S8 | 13 | az **−38** / el **56** | az × el | **59.2°** | common perpendicular **39.2 %** | 0.304 |
| **S9-A** | **14** | az **138** / el **20** | **az × el × R × `lambda_span` × `half_extent` × `q_height`** | **41.1°** | perpendicular **25.2 %**, normal **54.9 %** | **0.420** · max arm **0.444** |
| **S9-B** | **13** | az **−58** / el **64** | **az × el × R × `lambda_span` × `line2_offset` × `theta_deg`** | **11.0°** | common perpendicular **18.5 %**; angle fidelity **3.70°** worst over 25°–115° | **0.829** · max arm **0.507** |

### S6's angle fidelity — the ROUND-0 problem is GONE, and P2-2 is closed with it
ROUND 0 measured `true 90° → screen 84.9°`, worst error **5.99°**, and carried an `ASSUMPTION A3` plus a
narration ban. Re-solved at FOV 60 over R as well as az × el, the pose **R 5 / az −58 / el 68** returns
**worst |screen − true| = 0.88°** across the entire 25°–115° sweep, with a **25.5°** minimum pairwise
separation. **ASSUMPTION A3 is CLOSED** (the arc no longer lies) and the P2-2 gap is closed at the same
time: the S9-B pose was solved with the same sweep as an explicit constraint and returns **3.70°** worst.
The narration duty stated in ROUND 0 is kept anyway, downgraded to a preference — the readout still carries
the claim (D4).

### S9 — the explore state has NO feasible single-scene pose, and that is a measured design consequence
The A14 worst-case law applied honestly to S9 **falsifies ROUND 0's S9 row outright.** Scored over all
six live sliders with all eight objects co-present, the best pose found anywhere in `R ∈ {13,14,15,16} ×
az × el` returns **min pairwise separation 1.35°** (at R 16 / az 146 / el 8). One point three degrees. A
sandbox in which the taught objects collapse onto one screen line is not a sandbox.

**The fix is a control, not a camera.** S9 authors a **`scene_group` selector (A = line + plane +
perpendicular + normal · B = the skew pair + common perpendicular + `d₁×d₂`)**, and each group carries its
own solved pose (rows S9-A / S9-B above). Both groups are **core-ring** by content, so 38b is untouched.
Measured result: **41.1°** and **11.0°** minimum pairwise separation over the FULL slider product of each
group — against 1.35° for the single-scene design. → **ENGINE DELTA Δ10.**

### `lambda_span` capped at 5.0 — the cap SURVIVES, its justification does not
ROUND 0 justified the cap by "worst frame fill 0.915, only 0.5 % of headroom" — a number computed at 50°
FOV and therefore void. At **FOV 60** the combined scene reaches only **0.638** even at cap 6.5, so that
argument is dead. **The cap is still correct, for a different measured reason:** group B at its own pose
(R 13 / az −58 / el 64) reaches fill **0.829 at cap 5.0** and **1.094 at cap 6.5** — off-frame. Cap 5.0 it
is; group A is unconstrained by framing (0.420 at cap 5.0, 0.656 even at cap 8.0).

### Two poses that ROUND 0 got wrong on their merits, not just their FOV
1. **S7 was authored "deliberately identical to S2" for home-pose continuity.** At FOV 60 that pose scores
   **8.45°** minimum pairwise separation with the shadow and the normal both on screen — the state's two new
   objects, unreadable. S7 now takes **its own** pose (az 140 / el 26, **29.5°**), reached from the shared
   home pose by an eased **`camera_steps`** move, which is how Rule 32d is honoured when a state genuinely
   needs a new frame (Act I S7's declared reframe is the precedent).
2. **S6 was solved at the chapter radius R 13** with two unit direction arrows — **fill 0.074**. The whole
   state was 7 % of the frame. R 5 with arrows drawn at length 2.5 fixes it and improves fidelity 7×.

**Azimuth vs swept ranges:** the only state that sweeps an angle is S6 (25°–115°) at azimuth **−58°**;
`−58 mod 180 = 122` lies outside [25, 115] and clears 180° by 58° ✓.

**Off-origin extent:** every state's apparatus lies within **4.5 units** of the origin, so no state needs
the `camera_target` it cannot author (OPEN scar).

## 6. `has_prebuilt_deep_dive` states (cache hint, NOT a gate — Rule 18)

**S3, S5, S8.** S3 is the PRIMARY aha and the state whose "why the perpendicular" question is asked most often;
S5 carries the misconception that survives longest (M3) and is where a student who has only ever done plane
geometry stalls; S8 is the only algebraically dense state and the one an exam question is most likely to hit
head-on. These are the same three states carrying Block-1 cliff sentences ✓ (they converge, as the spec expects).
Every other state still shows the Explain button, routed to the feedback form. **V1.0 ships zero authored
deep-dives.**

## 7. Drill-down clusters (3 per deep-dive state; `mathematics_author` writes 5 trigger phrasings each)

- **S3** — `why_perpendicular_is_shortest` (why no slanted segment can beat it) · `foot_of_perpendicular_meaning`
  (what the landing point actually is) · `distance_formula_absolute_value` (why the modulus, and what a negative
  value would have meant).
- **S5** — `skew_vs_parallel` (how to tell them apart without a picture) · `why_skew_needs_three_dimensions`
  (why this case cannot happen on a flat page) · `screen_crossing_is_not_a_meeting` (reading a 3D picture off a 2D
  screen).
- **S8** — `why_cross_product_gives_the_gap_direction` · `numerator_is_a_projection` (what
  `(a₂−a₁)·(d₁×d₂)` measures) · `parallel_lines_break_the_formula` (`d₁×d₂ = 0`, and what to do instead).

## 8. `entry_state_map`

```
entry_state_map:
  foundational:          STATE_1 → STATE_4   # core — contains the PRIMARY aha (S3)
  two_lines:             STATE_5 → STATE_6   # core
  line_and_plane_angle:  STATE_7             # EXTENDED — falls back to foundational under the core-only cut
  skew_distance:         STATE_8             # ADVANCED — falls back to two_lines under both cuts
  exploration:           STATE_9             # core
```

Foundational-coverage rule **SATISFIED**: the PRIMARY aha (S3) is inside `foundational` ✓, so no mandatory exit-pill
is needed. A cross-slice pill from `foundational` into `two_lines` is offered after S4 (invitation, not a gate).

## 9. Prerequisites (advisory only — Rule 23) — with a REGISTRY discrepancy flagged

`prerequisites: []` in the authored JSON.

**The honest floor (§arc rule 7, re-verified this session).** `unit_vector`, `vector_resolution` and `dot_product`
are **not shipped product** — none appears in `ls visual_baselines`. **`scalar_vs_vector` IS baseline-locked.** So
this concept teaches its own foundation and Rule 25's no-untaught-term applies with no rescue.
**CYCLE-1 CORRECTION — the dot product was an untaught term and the claim was false.** ROUND 0 asserted
that `a·b` and `a×b` are "each introduced on canvas by a state of THIS concept", while §10(b) carried **no
defined-in row for the dot product** and three states rendered one before any state introduced it (S4's
`n·d` HUD, S6's `cos θ = |d₁·d₂| ⁄ (‖d₁‖‖d₂‖)`, S7's `sin θ = |d·n| ⁄ (‖d‖‖n‖)`). Under §arc rule 7 there is
no rescue — `dot_product` is not shipped product. **Fix: a one-beat dot-product introduction is authored
into S2** (the perpendicularity test `n·v = 0`, §3's control table, S2's budget raised 33–40 → 44–52 words),
and `n·v` gains a defined-in row in §10(b). The introduction sits at **S2 rather than S4** because S3's
formula surface `d = |n·(q − a)| ⁄ ‖n‖` renders a dot product before S4 ever runs — a fix at S4 would have
been one state too late. So the ledger claim is now TRUE as restated: `a`, `d`, `n`, `λ` and `a·b` are each
introduced on canvas by a state of this concept before any later state uses them; **`a×b` alone is carried
from Act I** and is named for the first time at S8, which is the advanced ring and is cut first. Act I's callback in S1 is a **recognition, not a requirement** — a teacher opening #9 first gets a complete
lesson.

> ### ⚑ REGISTRY FINDING — the catalog's ghost prerequisite points at an id this wave will not author
> `src/lib/mathematicsCatalog.ts:139` reserves `concept_id: 'lines_and_planes_in_space'` (**this skeleton adopts the
> reserved id — the collision check ran against the REGISTRY, not only `src/data/concepts/`**, which is the recorded
> `id_collision_check_scans_the_concept_directories_but_not_the_registry` lesson). But that same row carries
> `prerequisites: ['vector_dot_and_cross_product']`, and `:114` reserves that id — while the Phase-0 survey names
> Act I **`vector_products_in_space`** and collision-checked it "CLEAR" **against concept FILES only.** So the wave
> is on course to author an Act I under an id the registry does not know, orphaning this concept's only inbound
> edge. **Stakes are advisory (Rule 23) — a misleading "Builds on…" pill, not a block — but the discrepancy is real
> and the fix is free today.** Recommendation: either rename Act I to the reserved `vector_dot_and_cross_product`,
> or re-point `:139`'s prerequisite and `:114`'s row when Act I goes live. **The catalog edit is not this desk's to
> make.** → §FLAGS.

## 9b. Real-world anchor (Rules 35 / 38f — universal, culture-neutral)

Anchors are **state assignments with words reserved inside that state's own budget**, not paragraphs
(`real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget`;
`skeleton_anchor_specified_in_section_9_reaches_no_narration_line`).

**PRIMARY — a straight track with distance markers. Assigned to S1**, verbatim, 24 words inside its 34–42 budget:

> **"A straight track has a starting post and one heading. After that, a single number — how far along you are — names every place on it."**

**SECONDARY — a road overpass. Assigned to S5**, verbatim, 21 words inside its 44–52 budget:

> **"On a flat map two straight roads cross. On the ground one runs over the other, and they never touch."**

**Why S5 and not S1 for the overpass (`teach_do_not_prespoil_a_later_reveal`).** The overpass IS the skew idea. Put
it in the hook and S5's reveal is spoiled four states early — the student arrives already knowing the answer to the
question S5 exists to ask. It is held until the state whose lesson it is.

**Rule 35 / 38f compliance.** Both anchors are devices every syllabus's students meet: no named place, festival,
currency, brand, name, food, or country-specific transport; no region-dependent constant. Neither is a metaphor —
a track really is a line with a parameter, and an overpass really is a skew pair, so neither breaks at any depth
(the physics-true test, in its mathematics form). Neither is ever DRAWN: the sim renders the abstract objects, and
the anchor lives only in narration (Rule 24 — the canvas carries labels and equations, not scenery).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every state by id:** as §2, with S3 = the sweeping segment finding its minimum, S4 = the two cases performed
sequentially, S5 = the screen crossing exposed as false, S8 = the superposition.

**(b) Symbol-label table + delivery surface + term-introduction ledger.** **`field_3d` NEVER paints
`scene_composition` annotations** (two OPEN scars, one of them a dot/cross lesson) — so the "Surface" column is the
contract, and every entry is a real rendering path.

| Quantity | On-canvas label | **Delivery surface (a rendering path)** | Defined in | Used in |
|---|---|---|---|---|
| the point on a line | `a` | sprite label + HUD row `a = (−0.8, 0.6, −0.5)` | S1 | S1, S4–S9 |
| the direction | `d` (`d̂` when unit) | `ArrowHelper` + sprite label + HUD | S1 | S1, S4–S9 |
| the parameter | `λ` | HUD row (live) + slider caption | S1 | S1, S4, S9 |
| the line | `r = a + λd` | **formula surface** (math-serif Unicode) | S1 | S1, S9 |
| the normal | `n` | `ArrowHelper` (**green** — derived object, Act I role 4) + sprite + HUD `n = (0.35, 1, 0.25)` | S2 | S2–S4, S7, S9 |
| **the dot product** | **`n·v`** | **HUD row (live), swung to `0.000` in the plane and off zero outside it — the one-beat introduction** | **S2** | **S2, S3, S4, S6, S7, S9** |
| the plane | `n·(r − a) = 0` | formula surface | S2 | S2 |
| the patch size | `half_extent` | slider caption only (not a taught symbol) | S2 | S2, S9 |
| the free point | `q` | point mesh + sprite + HUD `q = (1.93, 1.19, 0.51)` | S3 | S3, S9 |
| the perpendicular distance | `distance = 2.20` | HUD row (live) + the drawn **green** segment | S3 | S3, S9 |
| the foot of the perpendicular | right-angle mark, no letter | mesh mark | S3 | S3, S9 |
| the intersection point | `X` | marker mesh + sprite + HUD `X = (0.57, −0.60, 0.00)` | S4 | S4, S9 |
| the test value | `n·d` | HUD row (live) — **`0.000` for the parallel line, `0.624` for the cutting line** | S4 | S4, S7, S9 |
| the second line | `d₂`, `a₂` | arrow + sprite + HUD | S5 | S5, S6, S8, S9 |
| the shortest gap | `shortest distance = 1.80` | HUD row (**live from t = 0 in S5**) + the drawn **green** common perpendicular | S5 | S5, S8, S9 |
| the point-to-point vector | `a₂ − a₁` | `ArrowHelper` (**magenta** — Act I role 3, restored) + HUD | S8 | S8 |
| the angle between lines | `θ = 69.4°` | angle arc + HUD row | S6 | S6, S9 |
| the angle to the plane | `θ = 35.0°`, `to normal = 55.0°` | two arcs + two HUD rows | **S7 (extended)** | S7 |
| the cross product | `d₁ × d₂` | `ArrowHelper` + sprite | **S8 (advanced)** | S8 |
| the skew formula | `d = \|(a₂−a₁)·(d₁×d₂)\| ⁄ ‖d₁×d₂‖` | formula surface | **S8 (advanced)** | S8 |

Every symbol above also has a **DOM-readable home** (HUD row or formula overlay), because a 3D sprite's text is
invisible to THE EYE and to every DOM probe (`field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe`).
No claim in this concept rests on a sprite alone.

**(c) Direction / sign plan (the chemistry-RHR slot, mathematics form).** No right-hand rule is TAUGHT here — `a×b`'s
handedness is Act I's, assumed not re-taught (§arc rule 4). What this concept must get right instead:
- **Sign is always absorbed by a modulus.** `|n·(q−a)|` and `|(a₂−a₁)·(d₁×d₂)|` — the drawn segment has no sign, so
  the formula must not imply one. `distance` is never rendered negative; a `−0` clamp is authored on both readouts.
- **`d₁ × d₂` vs `d₂ × d₁`** would flip the drawn arrow. S8 authors `d₁ × d₂` and states the order on canvas; the
  reversed order is deliberately NOT shown (Act I owns that contrast).
- **Drawn intervals:** `λ ∈ [−3.5, 3.5]` guided, `lambda_span ∈ [2.5, 5.0]` explore; `half_extent ∈ [1.5, 4.5]`;
  `theta_deg ∈ [25, 115]`. Every displayed relation holds on its drawn interval (hazard 1).

**(d) Motion plan:** §3 + §12. Every guided state has continuous motion for ≥ 75 % of its timeline (§12), so
`rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` cannot be satisfied vacuously here.

**(e) Modes:** conceptual only. **No `mode_overrides`** (Rule 20 [D]).

**(f) `assessment` — SEVEN items, ALL answerable under every preset (RE-AUTHORED AT CYCLE 1).**
Floor `questions: z.array(quizQuestionSchema).min(6)`, verified at `src/schemas/conceptJson.ts:328`.
**ROUND 0's ring tags were unauthorable:** `quizQuestionSchema.difficulty` is
`z.enum(['core','stretch'])` (`src/schemas/conceptJson.ts:314`) — **there is no ring field on a question**,
so `'advanced'` is illegal and there is no mechanism to hide an item under a preset. ROUND 0's item 7 asked
for `d₁ × d₂` (S8, advanced) and was therefore **unanswerable under both reduced presets with no way to
remove it.** Re-authored: every item is answerable from **core-ring** states, the S8 item is dropped, and
`difficulty` is used for what it actually is.

| # | Item | State | `difficulty` | Distractor (the misconception it probes) |
|---|---|---|---|---|
| 1 | A line passes through `a` with direction `d`. Which point is on it? → **`a + 2d`** | S1 | `core` | `a + 2n` (direction confused with position) |
| 2 | A plane is given by point `a` and normal `n`. A vector lying IN the plane satisfies → **`n·v = 0`** | S2 | `core` | `n·v = 1` |
| 3 | The distance from a point to a plane is measured → **along the perpendicular from the point to the plane** | S3 | `core` | "along the shortest visible line to the edge of the plane" — **M1** |
| 4 | A line has `n·d = 0` and its point is not on the plane. The line and the plane → **never meet** | S4 | `core` | "meet at right angles" — **M2** |
| 5 | Two lines in space are not parallel and have no common point. They are → **skew** | S5 | `stretch` | "intersecting — every non-parallel pair meets" — **M3** |
| 6 | Sliding one line along itself changes the angle between two lines → **no, the angle depends only on the directions** | S6 | `stretch` | "yes, because the crossing point moves" |
| 7 | A point sits 3 units from a plane along the perpendicular. A slanted segment from the same point to the plane measures → **more than 3** | S3 | `stretch` | "exactly 3, the plane is flat" — **M1**, in its numeric form |

`coverage_map.by_state`: 1→S1, 2→S2, 3→S3, 4→S4, 5→S5, 6→S6, 7→S3.
`non_assessed_states: [STATE_7, STATE_8, STATE_9]` — **S7 (extended) and S8 (advanced) are both cut under a
reduced preset and neither is assessed**, which is the only authorable way to keep every item answerable
given that a question carries no ring field; S9 is the sandbox. Six core-ring states carry seven items, so
the `.min(6)` floor holds under `core_only` with nothing removed.

**(g) Register-triangle plan (Rule 33 / `patterns/mathematics.md` §0).** Leading register per state:
**graphical** leads S1, S2, S3, S4, S5, S8, S9; **numeric** leads S6 (the angle readout is the state's subject);
**symbolic never leads a core-ring state** — the formula surface always appears AFTER its graphical story has
played (S3's surface writes at 12.0 s, after the minimum has locked; S8's after the superposition). Every state
exposes a real number that changes as the picture changes: λ, the swept distance, `n·d`, the gap, θ, and the three
terms of the skew formula.

**(h) Canvas budget (Rule 34) — ONE formula surface per state, and every identity checked against its own HUD:**

| St | Formula surface (math-serif Unicode) | HUD rows (value-only) | **Identity check on the rendered numbers** |
|---|---|---|---|
| S1 | `r = a + λd` | `λ`, `a`, `d̂` | positional, no identity |
| S2 | `n·(r − a) = 0` | `n`, `‖n‖ = 1.089` | — |
| S3 | `d = \|n·(q − a)\| ⁄ ‖n‖` | `n·(q−a) = 2.393`, `‖n‖ = 1.089`, `distance = 2.20` | **2.393 ⁄ 1.0886 = 2.198 → 2.20 ✓** |
| S4 | `λ = n·(a_P − a) ⁄ (n·d)` | `n·d`, `λ`, `X` | **1.617 ⁄ 0.6244 = 2.590 → authored λ = 2.600 (the 2 dp print of `a` rounds; author `a` exactly) ✓** |
| S5 | **none** (a formula-free state is Rule-34-clean and precedented) | `shortest distance = 1.80` | the number IS the claim |
| S6 | `cos θ = \|d₁·d₂\| ⁄ (‖d₁‖‖d₂‖)` | `d₁·d₂ = 0.352`, `θ = 69.4°` | **arccos 0.352 = 69.38° ✓.** Unit note (`formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`): the surface is unit-free, the readout is **degrees**, declared as the single dialect for this concept |
| S7 | `sin θ = \|d·n\| ⁄ (‖d‖‖n‖)` | `d·n = 0.624`, `‖n‖ = 1.089`, `θ = 35.0°`, `to normal = 55.0°` | **arcsin(0.624/1.0886) = 35.00° ✓; 35.0 + 55.0 = 90.0 ✓** |
| S8 | `d = \|(a₂−a₁)·(d₁×d₂)\| ⁄ ‖d₁×d₂‖` | `(a₂−a₁)·(d₁×d₂) = 1.685`, `‖d₁×d₂‖ = 0.936`, `distance = 1.80` | **1.685 ⁄ 0.936 = 1.800 ✓** |
| S9 | `r = a + λd` (**CORE-ring, derived by S1**) | all rows live | ✓ |

Precision doctrine: distances and dot products **3 dp**, angles **1 dp**, coordinates **2 dp**, λ **3 dp** —
constant across states. All math is real Unicode (`λ θ ° · × ‖ ⁄ ₁ ₂ ⊥`), never ASCII, and the sweep must cover all
three text paths (DOM overlay, canvas text, `createLabelSprite`) — Rule 34c.
Overlay zones (34d): `#vg_sliders` **`top:52px`**+ (clears the review chrome, `field3d_sliders_panel_top12_vs_fsbtn_top10`);
formula surface bottom-centre; HUD top-right; delta cue top-centre. Zones are disjoint by construction (§11).

**(i) Curriculum-flex block (Rule 38).**

- **(i-1) THE CUT WALK, NOW INCLUDING THE `→ hand-off` COLUMN (§arc rule 6 as amended by A13).** ROUND 0
  walked rendered quantities and **skipped the hand-off sentence**, which §arc rule 6 makes a required
  rendered artifact — so both cuts left a dangling promise. Both are now closed by an authored **ring-cut
  alternate hand-off** at each ring-boundary state (§3's control table, S6 and S7).
  **Cut 1 — hide `advanced` (S8).** Survivors S1–S7, S9. Quantities: no survivor renders `d₁ × d₂`, the skew
  formula, or the words "cross product" — S5 shows the gap as a LENGTH only, which is why the S5/S8 duty
  split exists. **Hand-offs:** S7's default *"…the perpendicular has to be built from the two directions"*
  promises S8 and is **replaced by S7's cut-safe alternate** (*"A normal answers both questions about a
  plane…"*), which closes rather than promises. **COHERENT.**
  **Cut 2 — hide `advanced` + `extended` (S8, S7).** Survivors S1–S6, S9. Quantities: no survivor references
  the line–plane angle or the complement rule; `line_and_plane_angle` falls back to `foundational`,
  `skew_distance` to `two_lines`. **Hand-offs:** S6's default promises the normal route into S7 and is
  **replaced by S6's cut-safe alternate** (*"Every distance and every angle so far came from one point, one
  direction, and one perpendicular."*). **COHERENT.**
  **Rule recorded (A13):** a ring-cut walk must cover EVERY rendered string class, and the hand-off is one —
  the last surviving state under a preset may not promise a state that preset hides.
  **Reverse check (both scars):** PRIMARY aha S3 = core ✓; all three `misconception_watch` states S3/S4/S5 = core ✓;
  and no surviving state displays a labelled quantity no surviving state introduced (`d₁×d₂` appears only in S8;
  `to normal` only in S7).
- **(i-2) Explore surfaces CORE content only (38b).** S9's formula surface is `r = a + λd` (S1, core). Its
  controls each map to a core-ring state: `lambda`/`lambda_span`→S1, `half_extent`→S2, `q_height`→S3,
  `theta_deg`→S6, `line2_offset`→S5, and the new **`scene_group`** selector chooses between two groups whose
  members are all core-ring objects (Δ10). **No control is owned by S7 or S8**, so the sandbox stays coherent under both
  cuts — discharged by **ring assignment**, deliberately NOT by the `min_ring` field, which
  `patterns/mathematics.md` hazard 11 measures as inert (present only at `field_3d_renderer.ts:55484–55492` and
  deferring to a preset builder that does not exist).
- **(i-3) `curriculum_tags` — CLAIMS, not facts (38g).** CBSE/NCERT **full**, `verified: true` under the
  authoring-time allowance (my own reading of the NCERT Class-12 Mathematics chapter index, Ch. 11
  Three-Dimensional Geometry — this is NOT a teacher confirmation and is stated as such). ICSE/ISC **full** ·
  JEE Main + Advanced **full** · IB DP AA **HL full, SL not offered** · **AP — absent** · **Cambridge IGCSE —
  absent** · A-level **partial** (3D vector lines in Pure; planes are Further Maths). **Every non-CBSE cell ships
  `needs_teacher_verification: true`** and no preset goes teacher-visible until a teacher of that curriculum
  confirms it. Recorded honestly (survey §0a): this is the weakest international-breadth wave mathematics has
  scheduled and is a deliberate CBSE/JEE/IB-HL depth play.
- **(i-4) Presets (38h — hide, never reorder; Rule 25d):** `full` = S1–S9 · `no_advanced` = hide S8 ·
  `core_only` = hide S7, S8. The extended ring's named customer is A-level Pure (lines yes, planes-angle no).
- **(i-5) Graph axes (38e):** **N/A — no state carries a 2D graph.** The 3D frame uses the same axis triad as Act I
  (x right, y up, z toward the viewer), identical across all three acts; no board conflict, no toggle.

**Registration plan:** `src/data/concepts/mathematics/lines_and_planes_in_space.json` + the EXISTING catalog
reservation at `mathematicsCatalog.ts:139` goes live (no new row). Validation = `npm run validate:mathematics`.
**The 8 physics registration sites are FORBIDDEN** until a mathematics serving path exists.

## 11. On-canvas layout + apparatus geometry (all values authored, all derived values measured)

**Authored scene** (units; the whole apparatus lies within 4.5 of the origin, because `camera_target` is not
authorable):

```
plane P1 : point (0, −0.4, 0)      normal (0.35, 1, 0.25)   ‖n‖ = 1.0886   half_extent 3.0
           n̂ = (0.322, 0.919, 0.230)   in-plane basis u = (0.94, −0.33, 0)   v = (0.08, 0.22, −0.97)
line  L1 : point (−0.8, 0.6, −0.5) direction (1, 0.35, 0.6) → d̂ = (0.821, 0.287, 0.493)
point q  : (1.93, 1.19, 0.51)      → foot (1.23, −0.83, 0.00)   perpendicular distance 2.200
           comparison feet: ONE straight in-plane path along u through the foot (CYCLE-1 FIX)
             s = −2.2u → 3.110 | s = 0 → 2.200 (the minimum) | s = +1.6u → 2.721
             ROUND 0 wrote “−2.2v” — no single straight sweep reaches both that and “+1.6u”
line  Lpar: through (0, −0.4, 0) + 1.4n̂, direction ⊥ n   → n·d = 2.8e−17 (exactly 0)
line  Lcut: hits the patch at X = (0.57, −0.60, 0.00), |X − p₀| = 0.60 ≤ 3.0 ✓, λ = 2.600, n·d̂ = 0.5736
           → angle to plane 35.00°, to normal 55.00°
skew  M1 : point (−1.2, −0.9, 0.6)  d₁ = (1, 0.15, 0.35)/‖·‖
      M2 : offset 1.8 along n̂c + 1.4d₁ − 1.1d₂,  d₂ = (0.15, −0.5, 1)/‖·‖
           shortest distance 1.800 (authored exactly) · feet (0.11,−0.70,1.06) and (0.63,−2.21,0.23)
           orthogonality check: (F₂−F₁)·d₁ = −2.2e−16, (F₂−F₁)·d₂ = 0.0e+00
           angle between directions 69.38° · ‖d₁×d₂‖ = 0.936
```

**Why the skew geometry was re-authored.** A first pass placed the second line by eye; the measured gap came out at
**0.258 units**, and the common perpendicular then drew at **5.9 %** of the line's screen length — a "gap" the
student cannot see, in the state whose entire lesson is that the gap exists. The offset is now authored **directly
along `n̂c = d₁×d₂/‖d₁×d₂‖` at exactly 1.80**, which puts the drawn segment at **15.5 %** (S5 pose) and **30.8 %**
(S8 pose). *This is the kind of thing a survey sketch cannot catch and a 0b must.*

**Screen zones (Rule 34d; authored in SCREEN space, not world — `field3d_world_space_label_decollision_is_projection_blind`):**
delta cue top-centre · HUD top-right, `top:52px`+ · `#vg_sliders` left, `top:52px`+ · formula surface bottom-centre ·
sprite labels ride their own objects with a screen-space de-collision pass. The four zones are disjoint rectangles.

**Constraint callouts for `mathematics_author`:**
1. Narration never says a line "wants", "knows", "escapes", "refuses" or "tries" (Rule 41a / D9). A line does not
   avoid another line; it passes at a distance.
2. Never say the two lines "cross on screen but not really" as if the picture were lying — say what is true: the
   two lines pass at different depths, and the screen shows one behind the other.
3. **`a×b` alone** is assumed from Act I, never re-derived (§arc rule 4), and never NAMED before **S8**
   (`teach_do_not_prespoil_a_later_reveal`). **`a·b` is NOT assumed — it is INTRODUCED by this concept at S2**
   (the one-beat `n·v = 0` perpendicularity test), because S3, S4, S6 and S7 all render a dot product and
   `dot_product` is not shipped product (§9, CYCLE-1 correction). Introduce it once, then use it bare.
4. "Skew" is introduced with its definition on the beat it first appears (S5) — Rule 25 no-untaught-term.
5. Dual-label once then bare (38d): "normal (perpendicular direction)" once in S2, "normal" after;
   "skew (never meeting, not parallel)" once in S5.
6. Every quantity the narration names must be live on screen at that moment (`teach_show_quantity_live_when_named`).
7. Reveal `at_ms` values are tuned to the sentence that introduces them (`teach_reveal_synced_to_narration`) — and
   see **DELTA 2**: today the contract cannot express them.

## 12. Per-state timing table — sub-beats, pins, motion continuity

Pin = `0.60 × duration` unless `eye_capture_ms` is named; every pin lands **≥ 167 ms after the completion of the
last reveal its DoD sentence asserts** (never after a phase START).

| St | Dur | Sub-beats (ms) | Longest static run | Pin → what the frozen frame shows | Margin |
|---|---|---|---|---|---|
| S1 | 20 s | 0–2000 patch dims to ghost, edge survives as `d̂`; 2000–4000 line extends; 4000–17000 λ sweeps −3.5→3.5; hold | 3 s (15 %) | 12000 → full line, λ marker mid-sweep, live coordinate | 8000 |
| S2 | 18 s | 0–2500 normal grows; 2500–6500 patch unfolds; 6500–15000 patch breathes to `half_extent` 1.5↔3.0; hold | 3 s (17 %) | `eye_capture_ms: 12000` → normal + full patch | 5500 |
| S3 | 24 s | 0–2000 `q` appears; **2000–7000 the foot sweeps `s = −2.2 → +1.6` along ONE straight path, readout `3.11` → dips to `2.20` at `s = 0` (≈ t 5100) → rises to `2.72`**; 7000–9000 the foot returns to `s = 0` and the readout falls `2.72 → 2.20`; 9000–9600 the segment turns **GREEN** and locks; 9600–11000 right-angle mark; 11000–12500 formula surface writes; hold | 4 s (17 %) | `eye_capture_ms: 16000` → green perpendicular locked, `2.20`, right-angle mark, surface | **3500** after the last reveal ✓ |
| S4 | 24 s | 0–2000 patch + parallel line enter; **2000–8000 the `n·d = 0` line slides over and past — no marker ever**; 8000–9500 it retires; 9500–15000 the cutting line arrives and punches through; 15000–15600 marker snaps on at `X`; hold | 3.5 s (15 %) | `eye_capture_ms: 18000` → marker present, `n·d = 0.624`, `λ = 2.600` | 2400 ✓ |
| S5 | 26 s | 0–2000 both lines draw **and `shortest distance = 1.80` is already live**; **2000–3500 the crossing marker pulses — 1.5 s, and the contradicting number is on screen for every frame of it**; 3500–3800 marker removed; 3800–6000 green common perpendicular grows between the true feet; 6000–13000 **`camera_steps` (F24)** eases to the S8 pose; hold | 3 s (12 %) | `eye_capture_ms: 16500` → common perpendicular + `1.80`, no crossing marker, camera arrived | **10500** after the last reveal ✓. **`camera_steps` is closed-form on state-local ms, so the pin reproduces byte-identically and the DoD MAY now assert the camera arrival** — ROUND 0 could not, and had to raise a FLAG |
| S6 | 22 s | 0–2000 directions re-drawn from one origin; 2000–8000 anchors slide, arc HOLDS at 69.4°; 8000–19000 `d₂` rotates 25°→115°, arc tracks; hold | 2 s (9 %) | 13200 → arc mid-rotation with its live readout | 5200 |
| S7 | 22 s | 0–1800 **`camera_steps` eases from the shared home pose to S7's own pose (az 140 / el 26)** as the cutting line returns; 1800–2000 settle; 2000–7000 it splits into shadow + normal component; 7000–10000 arc to normal (55.0°); 10000–13000 arc to shadow (35.0°); 13000–14000 the sum row fills; hold | 4 s (18 %) | `eye_capture_ms: 16000` → both arcs, both readouts, `35.0 + 55.0 = 90.0` | 2000 ✓ |
| S8 | 24 s | 0–2000 S5 scene returns with the common perpendicular already present; 2000–7000 `d₁ × d₂` builds at the origin; 7000–12000 it translates onto the common perpendicular and coincides; 12000–15000 formula surface + three HUD terms; hold | 4 s (17 %) | `eye_capture_ms: 17500` → the two overlaid, surface, `1.685 / 0.936 / 1.80` | 2500 ✓ |
| S9 | open | 0–2500 full scene assembles; λ ping-pongs until seized; **free-running** (Rule 37) | — | none | n/a |

Every guided state's longest static run is **≤ 18 %** of its timeline, under the 25 % bar of
`rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas`.

**Rule 19 — `scene_composition.primitives.length ≥ 3`, stated per state (P3-3; it belongs in the DoD).**
S1 line + direction arrow + λ marker + ghost patch + ghost normal = **5** · S2 patch + normal + test vector
+ point `a` = **4** · S3 patch + normal + point `q` + swept segment + right-angle mark = **5** · S4 patch +
parallel line + cutting line + normal + intersection marker = **5** · S5 line 1 + line 2 + crossing marker
+ common perpendicular = **4** · S6 direction 1 + direction 2 + arc + origin marker = **4** · S7 patch +
cutting line + shadow + normal + two arcs = **6** · S8 line 1 + line 2 + common perpendicular + `d₁×d₂` +
`a₂−a₁` = **5** · S9 group A **5** / group B **4**. **Minimum 4, floor 3 ✓ on every state, under every
preset and in both explore groups.**

## 13. THE UNION WALK — re-run against REAL states, both directions

**(a) Capability walk.**

| St | Consumes (new · co-present) |
|---|---|
| S1 | F11 · F1, F2, F3, F9, F10, F19 + **Δ1(point), Δ2, Δ3** |
| S2 | F12 · F1, F2, F9, F19 + **Δ2** |
| S3 | F13 · F1, F2, F9, F10, F12, F19 + **Δ1(point, segments), Δ2, Δ3** |
| S4 | F14 · F1, F2, F9, F11, F12, F19 + **Δ2, Δ3, Δ4** |
| S5 | F13 · F1, F2, F9, F11, F19 + **Δ2, Δ3** |
| S6 | F5 · F1, F2, F3, F9, F10, F11, F19 + **Δ3, Δ5** |
| S7 | F5 · F1, F2, F9, F11, F12, F19 + **Δ1(projection), Δ2, Δ5** |
| S8 | F6 · F1, F2, F9, F11, F13, F19 + **Δ2** |
| S9 | F10 (all rows) · F1, F2, F9, F11, F12, F13, F14, F19 + **Δ1, Δ6** |

**Direction 1 — every state claims at least one row:** ✓ (all nine above).
**Direction 2 — every in-scope row is claimed by at least one state:** F1 ✓ · F2 ✓ · F3 (S1, S6) ✓ · F5 (S6, S7) ✓ ·
F6 (S8) ✓ · F9 ✓ · F10 (S1, S2, S3, S6, S9) ✓ · F11 ✓ · F12 ✓ · F13 (S3, S5, S8) ✓ · F14 (S4, S9) ✓ · F19 ✓.
**F4 (a third vector by spherical angles) and F7/F8 (parallelogram / parallelepiped meshes) are NOT consumed by this
concept** — F7 is consumed *indirectly* as the mesh builder behind F12 (D2's identity), and F4/F8 belong to Act I.
Stated rather than silently dropped (`signed_engine_union_drops_items_its_own_state_table_still_consumes`).

**(b) SCRIPTABILITY walk** (`phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable`) — **the row that
surfaced the largest delta.** For every knob a state ANIMATES, does a cue triple exist?

| St | Knob animated within the state | Cue triple in the drafted contract? |
|---|---|---|
| S1 | `lambda` −3.5 → 3.5 | **NO** |
| S2 | `half_extent` 1.5 ↔ 3.0; patch unfold | **NO** |
| S3 | the foot's position along the patch | **NO** (and the knob itself is unnamed — Δ1) |
| S4 | each line's anchor offset (the slide) | **NO** |
| S1 | the seam camera ease (az 90→94, el 30→6, R 9→13) | **NO — and F21 cannot help: it ramps scalar knobs, not a pose. → F24 `vg.camera_steps`, which ALREADY EXISTS as `os.camera_steps`** |
| S5 | camera azimuth (the swing to the S8 pose) | **NO. `camera_position` is entry-only (`applyState:67196`).** ROUND 0 wrote "partially" and buried the ninth delta. → **F24** |
| S7 | the reframe from the home pose to S7's own pose | **NO → F24** |
| S6 | `theta_deg` 25 → 115; each anchor's slide | **NO** |
| S7 | the split reveal | **NO** |
| S8 | the `d₁ × d₂` arrow's translation | **NO** |

**Eight of nine states animate a knob the drafted `vg` block cannot cue, and three states move the CAMERA
during the state, which no F-row and no delta expressed at all.** Two corrections to ROUND 0's reading of
its own walk:
- **The motion claim was overstated.** "Without Δ3 every guided state is byte-static" is **false** —
  `field_3d` motion lives in the scenario body on the state clock and two authored mechanisms already ship
  (`param_ramp` ×3 scenarios, `idle_auto_sweep` ×4, one shared path at `:1339`). The real finding is
  **authorability**: without F21 every re-time is a renderer edit instead of a JSON edit.
- **The camera row was the ninth delta and ROUND 0 wrote "partially".** It is not partial; it is absent —
  and the mechanism **already exists** (`os.camera_steps`, `:60704` / `:62213–62290`). → **F24, Δ9.**

---

## ENGINE DELTAS vs the Phase-0 §union F-set — **8 changes the sketch missed**

> Semantics discipline (`two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`):
> the shared half of the `vg` block is **quoted from `MATHEMATICS_PHASE0_VECTORS_3D.md` §contract verbatim and not
> restated**. Everything below is a **DIFF against that draft**, so Act I's skeleton can quote this section rather
> than re-derive it. Every delta names the state that forces it.

### Δ1 — `lines_planes` cannot express a POINT, a comparison SEGMENT, or a PROJECTION *(F-rows **F22** = free point, **F23** = comparison segment / projection — renumbered per A12; ROUND 0 called `points` "F21", which is now `animate[]`)*
The drafted block offers `lines[]` and `planes[]` only. **S3 — the PRIMARY AHA state — needs a free point `q` in
space**, which is neither. It also needs the two "wrong" comparison segments that carry the 16a beat, and S7 needs
the line's shadow in the plane. Requested:
```jsonc
"points":   [ { "id":"q", "position":[1.93,1.19,0.51], "label":"q" } ],                       // F22
"segments": [ { "id":"cmp1", "from":"q", "to":{"on":"P1","u":1.6}, "readout":"length" } ],     // F23 —
            //   NOTE the `u`-only address: S3's comparison feet lie on ONE straight in-plane path
"show_projection_onto_plane": { "line":"L1", "plane":"P1" }                                    // F23
```
Without **F22**, S3 must be redesigned around an object the engine already has — and there is none that is a point.

### Δ2 — `reveal_ms` is ONE scalar per state; four states need a REVEAL CHAIN
`"reveal_ms": 900 // one-shot grow-in, then HOLD` cannot express S3 (segment → minimum lock → right-angle mark →
formula), S4 (parallel line → retire → cutting line → marker), S5 (crossing marker → remove → common perpendicular),
or S8 (scene → cross arrow → translate → surface). This is precisely
`skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static`. Requested:
per-object `"reveal_at_ms"` and `"hide_at_ms"` on every entry of `lines[]`, `planes[]`, `points[]`, `segments[]` and
on each derived marker. **Alternative if refused:** every one of those four states splits in two, taking the concept
to 13 states — worse pedagogy and more engine surface, not less.

### Δ3 — F21 `animate[]`: a PORT of two shipped mechanisms into the `vg` authoring surface *(folded into **VG-A**, per A12 — not VG-C)*
**ROUND 0's justification was FALSE and the correction changes a dispatch's scope, so it is restated in
full rather than quietly edited.** ROUND 0 wrote *"without a cue triple every guided state is byte-static
and Rule 31's no-static floor fails by construction."* **It does not.** `field_3d` motion lives in the
scenario body on the state clock, and **two authored mechanisms already ship**:
- **`param_ramp`** — declared by **three** scenarios: `field_3d_renderer.ts:1050`, `:1968`, `:2097`
  (with its own authoring scar `field3d_param_ramp_authoring_contract` at `:1049`).
- **`idle_auto_sweep`** — declared by **four**: `:374`, `:926`, `:1052`, `:1951`.
- All three motion sources route through **one path**, `:1339`.

**So F21 is a PORT, not an invention, and its dispatch must name those two as CLONE TARGETS.** Left
standing, ROUND 0's wording would have sent VG-C to *invent* a mechanism the renderer already has — the
exact duplicate-build Rule 40a exists to prevent, committed inside the document whose entire value is
engine deltas. **Root cause, recorded:** the Rule-40a `git log --all -S` sweep was run on the scenario
NAME (`vector_geometry_3d`) and **never on the MECHANISMS declared missing.** A sweep that checks the
wrapper and not the contents is not a sweep.

**The genuine and sufficient need:** *authorability by `json_author` without a renderer edit per re-time.*
Every re-timed ramp today is a code change in the scenario body. Requested surface:
```jsonc
"animate": [ { "knob":"lambda", "from":-3.5, "to":3.5, "at_ms":4000, "ramp_ms":13000, "mode":"once"|"ping_pong" } ]
```
Acceptance carried from `field3d_param_ramp_authoring_contract`: **the authored static value of a ramped
knob must equal `from`, or state entry visibly jumps before the ramp starts** — assert it in the gate.
And from `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness`: `lambda: 0.0`,
`theta_deg: 0` and `half_extent` are **legal authored zeros**; resolve presence with `typeof`/`in`, never a
falsy test, and make the regression pair assert authored-zero ≠ absent.

### Δ4 — the no-intersection case needs a READOUT, not just a hidden marker
D5 says the marker is hidden when the intersection does not exist. S4's whole lesson is that absence, and a hidden
marker renders **nothing at all** — the state would teach by omission (the recorded
`state_whose_payoff_is_absence_carries_its_lesson_only_in_on_canvas_prose` shape). Requested: when
`d·n = 0`, the readout panel renders `n·d = 0.000` **and** a literal `no meeting point` row. The value `n·d` must be
a first-class readout token, not an internal. **CYCLE-1 CONSISTENCY FIX (P2-4):** ROUND 0 required this row while
Δ6's enum — asserted closed in both directions — carried **no token for it**. `no_meeting_point` is now in the enum.

### Δ5 — `show_angle_arc` is drafted under `mode:"products"` only, and it needs a SUBJECT
S6 and S7 both need arcs in `lines_planes` mode, and S7 needs **two arcs in one state** naming different pairs.
Requested:
```jsonc
"angle_arcs": [ { "between":["L1","L2"], "readout":"deg" },
                { "between":["L1","P1.normal"] }, { "between":["L1","P1"] } ]
```
The `L1,P1` form must render the angle to the PLANE (the complement), not to the normal — the two are the state's
whole point and must be separately addressable.

### Δ6 — the `static_readouts` token set for `lines_planes` is unspecified
The draft shows `["a_dot_b"]` only. Requested closed enum, closed **in both directions** against §13's states
(`phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set`):
`point_plane_distance` · `skew_distance` · `angle_lines_deg` · `angle_line_plane_deg` · `angle_line_normal_deg` ·
`d_dot_n` · `n_dot_v` · **`no_meeting_point`** · `lambda` · `intersection_point` · `n_norm` · `cross_norm` ·
`numerator_triple_product`. (`n_dot_v` is S2's dot-product introduction beat; `no_meeting_point` is the Δ4 row —
both were consumed by a state while absent from the ROUND-0 enum, which is the same both-directions failure the
enum exists to prevent.)
Every one is claimed by a state in §10(h); no state names a token outside the list.

### Δ7 — F19's pairwise gate needs an EXEMPT-PAIR list and a SCREEN-LENGTH floor
Two measured facts from §14:
- **(a) Exempt pairs.** Three pairs in this concept are parallel or collinear **by construction, and that is the
  lesson**: S1's `d̂` arrow lying on its own line; S3's perpendicular segment parallel to `n`; S8's `d₁ × d₂`
  measuring **0.00°** against the common perpendicular. A pairwise gate with no exemption list either fails every
  state or gets switched off — the second is how a gate stops being known to work. Requested: an authored
  `camera_gate.exempt_pairs` per state, so the exemption is a declaration a reviewer can read, not a threshold
  someone lowered.
- **(b) Length floor.** Angular separation cannot see foreshortening. Inheriting S5's pose for the explore state
  puts the view axis **7.7° from `n̂`**, projecting the PRIMARY aha's perpendicular segment at **13.4 %** of its true
  length while every pairwise separation stays healthy. Requested: `min_screen_length_frac` per taught segment,
  scored in the same pass. **This is a gate-section-13 addition, not renderer code.**

### Δ8 — three obligations the surgeon must satisfy that are not in the contract at all
1. **`deriveStateMeta.ts` — THREE sites, not two.** `F3D_REVEAL_KEYS` (verified at
   `src/lib/validators/visual/deriveStateMeta.ts:704`) must gain `'vg'`; `maxRevealForField3dState` must return
   `reveal_ms + cushion`; and `deriveHoldExpectations` must classify S1–S8 `reveal_hold` and S9 `interactive`. Prove
   site 1 against **both** config shapes (nested and flattened) — `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl`.
2. **The generic `visible_elements` matcher runs BEFORE the per-scenario apply** (verified this session:
   `field_3d_renderer.ts:67186–67197`, the matcher sits immediately above the camera block inside `applyState`), so
   it will silently blank this scenario's apparatus. `applyVectorGeometry3dState()` must force its apparatus visible
   inside its own body, and the bring-up probe must assert mesh count > 0 **and** `visible === true`.
3. **A plane patch built on "any two vectors spanning the normal's orthogonal complement" (D2) is not good enough
   here.** §arc rule 5 requires S1 to OPEN on the patch the student recognises as Act I's parallelogram — which
   means the patch's EDGE DIRECTIONS must be authorable, not derived from an arbitrary basis choice. Requested:
   optional `span_u` / `span_v` on `planes[]`, defaulting to the derived basis. Without it the callback that makes
   this a chapter rather than three adjacent files cannot be authored.

### Δ9 — **THE NINTH DELTA: `vg.camera_steps` (F24). ADOPT `os.camera_steps` — do NOT build it.**
Three states move the camera *during* the state: **S1**'s seam ease off Act I's final frame, **S5**'s swing
to the pose where the skew miss is plain (the beat the whole state exists for), **S7**'s reframe. Nothing in
F1–F23 or Δ1–Δ8 could express it — `camera_position` is entry-only (`applyState:67196`) and F21's `animate[]`
ramps scalar knobs, not a pose. **ROUND 0 buried this in §13b as "partially" instead of raising it.**

**It already exists.** `os.camera_steps` — `[{at_ms, az, el, dist, ease_ms}]` — declared
`field_3d_renderer.ts:60704`, implemented `:62213–62290`, called `:64631` / `:64858`. Requested as
`vg.camera_steps` with identical semantics (steps inherit unnamed fields from the step before; step 0
inherits from `camera`).

**Three properties of the existing implementation decide three open questions in this document:**
1. Its header states it is **closed-form on state-local ms — an eased pose evaluated FROM ms, never a lerp
   in flight.** So a state authoring `camera_steps` **bypasses `lerpSpherical` entirely and is frame-rate
   independent by construction**, and reproduces **byte-identically under `SET_TIME_FREEZE`**.
   → **ASSUMPTION A4 and FLAG 2 are DISSOLVED for this concept** (survey open decision 3 keeps its other
   customers; this one stops being one of them), and §12's S5 pin may now assert the camera arrival, which
   ROUND 0 explicitly could not.
2. It **eases** rather than cuts, and **starts and ends at rest** — Rule 32d satisfied without new work.
3. It is a port with a live call site, so its cost is the `vg` plumbing, not a mechanism.

**Take the engine port, not the design retreat.** ROUND 0 designed *around* the limitation (S5's DoD
asserting nothing about the camera) for a limitation that does not exist.

### Δ10 — the explore state needs a `scene_group` selector, and the reason is a measured camera result
Scored under the A14 worst-case law — all eight objects co-present, all six sliders swept, FOV 60 / 16:9 —
**the best S9 pose anywhere in `R ∈ {13,14,15,16} × az × el` returns a minimum pairwise screen separation of
1.35°.** There is no camera that makes ROUND 0's single-scene explore state legible; that row was a solve
over a subset, which is precisely what the worst-case law forbids.

Requested: a per-state `scene_group` control on `lines_planes` (an enum knob that shows/hides authored object
sets), plus a **per-group camera pose**, since the two groups solve to different poses (S9-A R 14 / az 138 /
el 20, min sep **41.1°**; S9-B R 13 / az −58 / el 64, min sep **11.0°**). Both groups are core-ring by content,
so Rule 38b is untouched. **If refused, the honest fallback is to drop one group from the sandbox — never to
ship the 1.35° scene.**

### Not requested — declared, so a later build is a decision and not an alarm
- **Teacher-draggable points.** S3's `q` and S9 are exactly the shape of the OPEN directive
  `teach_field3d_explore_grab_and_move_field_point` (`alex:architect`). It is deliberately **not** smuggled into a
  mathematics scenario (survey §ledger 3) — a per-scenario drag is how a fleet-wide primitive fails to get built.
  Sliders serve S9; `q_height` is the one that matters.
- **An expression evaluator.** Nothing here needs one (survey Correction 2).
- **Camera TARGET authoring.** OPEN scar; every state here is origin-centred (max extent 4.5) so it does not bite.
- **The frame-rate-dependent camera ease** (`lerpSpherical`, `field_3d_renderer.ts:4214`). **NO LONGER A
  CUSTOMER.** All three of this concept's camera moves route through **F24 `camera_steps`**, which is
  closed-form on state-local ms and never calls `lerpSpherical` (Δ9). Survey open decision 3 stands on its
  other customers; this concept withdraws from it, and ROUND 0's FLAG 2 is withdrawn with it.

---

## 14. Probe output — RE-MEASURED AT CYCLE 1

**Projection parameters (A10 — a camera number is not measured until these are named beside it):**
`PerspectiveCamera(60, …)` → **FOV 60° vertical**, **reference aspect 16:9**, target = origin, up = +Y,
perspective. Frustum half-extents **y = tan 30° = 0.5774**, **x = 0.5774 × 16/9 = 1.0264**. `fill` = max
`|NDC|` over every rendered vertex; 1.000 is the frame edge. Node probes run this session at `dfca9cf`.

```
GEOMETRY (unchanged, re-verified)
  S3  point-plane distance 2.200   foot (1.23,-0.83,0.00)
      comparison feet on ONE straight u-path:  s=-2.2 -> 3.110 | s=0 -> 2.200 | s=+1.6 -> 2.721
  S4  d_par.n = 2.78e-17 (exactly 0) ; d_cut.n = 0.5736 -> 35.00 to plane, 55.00 to normal
      X = (0.57,-0.60,0.00)  |X-p0| = 0.60 <= half_extent 3.0   lambda = 2.600
  S5  skew distance 1.800  feet (0.11,-0.70,1.06) (0.63,-2.21,0.23)
      orthogonality (F2-F1).d1 = -2.2e-16 ; (F2-F1).d2 = 0.0e+00
  S6  angle between directions 69.38 deg   ||d1 x d2|| = 0.936

CAMERA SOLVE  (FOV 60, aspect 16:9, perspective, PAIRWISE undirected over every rendered pair,
               full az x el grid at 2 deg, R swept where noted)
  S1  R 9 -> 13   entry az  90 el 30 (Act I S5 final frame)  -> camera_steps -> az  94 el  6
                  minSep 59.63   fill 0.382   (entry frame at R 9: fill 0.223)
  S2  R 13  az -62 el 16   minSep 59.51   normal 48.3% of patch width      fill 0.338
  S3  R 13  az -44 el 42   minSep 23.58   perpendicular 33.1%              fill 0.566   [length floor BINDING]
  S4  R 13  az -176 el 22  minSep 34.76                                    fill 0.326
  S5  R 13  az 146 el  4   minSep 52.06   commonPerp 33.4% of L1 image     fill 0.451
            skew images CROSS on screen? YES, at t = 0.495 along line 1
  S6  R 5   az -58 el 68   arrows drawn at length 2.5
            worst |screen-true| over the FULL 25..115 sweep (1 deg steps) = 0.88 deg   [was 5.99 at FOV 50/R13]
            min taught-pair screen separation over the sweep = 25.47      fill 0.526
            (at R 13 with unit arrows the whole state fills 0.074 of the frame - a ROUND-0 miss)
  S7  R 13  az 140 el 26   minSep 29.50   normal 87.4%                     fill 0.357
            [S2's pose, which ROUND 0 reused for home-pose continuity, scores minSep 8.45 at FOV 60 - REJECTED]
  S8  R 13  az -38 el 56   minSep 59.20   commonPerp 39.2%                 fill 0.304
            commonPerp vs d1xd2 = 0.92 deg (INTENDED parallel, exempt pair - and NOT 0.00: perspective
            separates two parallel 3D segments at different depths, so the exempt list is still required)

EXPLORE SOLVE  (A14 worst-case law: EVERY live slider swept, worst value reported)
  Single-scene (all 8 objects, all 6 sliders): best pose anywhere in R{13,14,15,16} x az x el
      = R 16 az 146 el 8  ->  minSep 1.35 deg.   NO FEASIBLE SINGLE-SCENE POSE EXISTS.
  Group A  line + patch + perpendicular + normal    (lambda_span x half_extent x q_height)
      R 14 az 138 el 20 | minSep 41.14 | fill 0.420 | maxArm 0.444 | perp 25.2% | normal 54.9%
  Group B  skew pair + common perpendicular + d1xd2 (lambda_span x line2_offset x theta_deg)
      R 13 az -58 el 64 | minSep 11.04 | fill 0.829 | maxArm 0.507 | commonPerp 18.5%
      angle fidelity worst |screen-true| over 25..115 = 3.70 deg
  lambda_span cap at each group's own pose:
      A: 5.0 -> 0.420 | 6.5 -> 0.536 | 8.0 -> 0.656      (framing does not bind group A)
      B: 5.0 -> 0.829 | 6.5 -> 1.094 | 8.0 -> 1.447      (BINDS -> cap 5.0)
  Combined-scene fill at FOV 60 reaches only 0.638 at cap 6.5, so ROUND 0's "fill 0.915, 0.5% headroom"
  justification for the cap is VOID; the cap survives on group B's framing instead.

FIRST-PASS SKEW GEOMETRY (rejected in ROUND 0, still rejected): distance 0.258 -> common perp 5.9% of image
```

**Evidence tiers.** `measured` — the whole of §14 and every number quoted from it, all re-run at CYCLE 1.
`read` — every renderer / validator citation, each resolved to its enclosing function:
`applyState:67195` (camera block) · the generic `visible_elements` matcher `:67186–67197` ·
**`PerspectiveCamera(60, …)` `:3733`, corroborated `:56905`; 16:9 reference solves at `:57121`, `:57319`** ·
**`os.camera_steps` declared `:60704`, implemented `:62213–62290`, called `:64631` / `:64858`** ·
**`param_ramp` `:1050`, `:1968`, `:2097`; `idle_auto_sweep` `:374`, `:926`, `:1052`, `:1951`; shared motion
path `:1339`** · `lerpSpherical:4214` · `F3D_REVEAL_KEYS` `deriveStateMeta.ts:704` · `assessmentSchema`
`conceptJson.ts:328` · **`quizQuestionSchema.difficulty` `conceptJson.ts:314`**.
**`SPEC`** — everything about `vector_geometry_3d` itself, because it does not exist.
**There is no `clone` tier in this document: no shipped concept exhibits any of this behaviour.**

**ASSUMPTION — probe-before-authoring (the ROUND-0 list, three of four now CLOSED):**
1. **A1 — the projection model. ⛔ WAS AN UNMEASURED ASSUMPTION AND IT WAS WRONG. Now CLOSED by grep,
   not by deferral.** ROUND 0 solved every pose at an assumed 50° FOV and deferred the real value to build
   time. The renderer is `PerspectiveCamera(60, …)` (`:3733`) with a live `camera.aspect`. **Every pose in
   this document has been re-solved at FOV 60 against a declared 16:9 reference.** One grep, in a document
   citing four other line numbers in that same file. Standing rule for this wave (A10): a camera number is
   not measured until FOV, aspect, the axes swept and the worst value are named beside it.
2. **A2 — sprite label ink. OPEN, carried.** Label positions are authored in screen zones on the assumption
   that a de-collision pass exists in screen space; the OPEN scar says world-space de-collision is
   projection-blind. Measure a real frame before trusting any label placement. *(This one genuinely needs a
   rendered frame, which no node probe can supply — it stays flagged, correctly.)*
3. **A3 — the S6 arc's rendered fidelity. CLOSED.** ROUND 0 measured `true 90° → screen 84.9°` (worst error
   5.99°) at R 13 / FOV 50. Re-solved over R as well as az × el at FOV 60: **R 5 / az −58 / el 68 gives worst
   |screen − true| = 0.88° across the full 25°–115° sweep**, and the S9-B pose gives **3.70°** over the same
   sweep (P2-2, which ROUND 0 never measured at the S9 pose at all). The arc no longer lies. The narration
   duty is kept as a preference, not a necessity.
4. **A4 — the camera swing's frame-rate dependence. DISSOLVED, not mitigated.** All three camera moves route
   through **F24 `camera_steps`**, which its own header declares closed-form on state-local ms and therefore
   frame-rate independent and byte-identical under `SET_TIME_FREEZE`. `lerpSpherical` is never called. → Δ9.

## Block 1 — Pass-1 strategic checklist

**1. Prerequisite cliff.** The real prerequisite is **reading a 3D position as an ordered triple** — and it is
`scalar_vs_vector`'s (baseline-locked ✓). This concept breaks at **S1** for a student who has never seen a vector
added to a point. Patch sentence, inside S1's 34–42-word budget: *"Start at the point a, then travel along the
direction d. The number λ says how far — one number for every place on the line."* No condescension: it reads as
the definition, not as remediation. The second cliff is `a×b`, which belongs to Act I and is met at **S8** — which
is why S8 is **advanced** and cut first: a student without Act I still gets a complete, coherent lesson under
`no_advanced`.

**2. Exam-backwards trace.** *"Find the shortest distance between the lines `r = a₁ + λd₁` and `r = a₂ + μd₂`, and
the angle between them."* — the pieces: a line as point + direction → **S1**; that two lines in space need not meet
→ **S5**; that the shortest distance is a perpendicular → **S3**; that the angle comes from directions alone →
**S6**; that the gap direction is `d₁ × d₂` and the formula reads it off → **S8**. A second exam form, *"Find the
distance of the point P from the plane and where the line meets it"*, traces to **S2, S3, S4**. **S7** is exercised
by the "angle between a line and a plane" variant. **No idle state** — every one of the nine is claimed by an exam
trace or is the sandbox.

**3. Misconception entry mapping.** **M1** is planted by any teaching that draws only one segment from a point to a
plane; confronted at **S3** by drawing several. **M2** is planted by the algebra itself — `n` appears in both the
"parallel" and "perpendicular" conditions; confronted at **S4**, and the narration is forbidden from saying "the
normal test" without saying which way the test points. **M3** is planted by twelve years of plane geometry, and
also by THIS SIM's own screen, which genuinely draws the lines crossing (measured, t = 0.815); confronted at **S5**
by drawing the gap. **Planting duty logged:** S5's own entry frame plants M3, which is why the state must not end
there — the camera swing and the drawn perpendicular are the state's obligation, not decoration.

## Block 2 — Aha-moment designation

**PRIMARY aha:** *Distance in space is not "how far it looks" — it is the length of the one perpendicular segment,
and you can watch every other segment be longer.* → **S3**, inside `entry_state_map.foundational` ✓.

**SUPPORTING aha (1):** *Two straight lines in space can be neither parallel nor meeting.* → **S5**.

**Cohesion check.** S5 sets up and re-pays the primary: skew is the case where "how far apart" has no answer at all
unless you already believe the perpendicular idea — and S8 is the primary aha applied to the case S5 opened. Nothing
here stands alone; if S5 stood alone it would belong in a sibling JSON.

**Wrong-belief setup.** The primary aha needs the student confident that distance is obvious: **S1 and S2** build
exactly that — every point in space has been given a name, so "how far" feels like it should be a lookup. S3 breaks
it. The supporting aha needs the student confident that non-parallel means meeting: **S4** builds it, by showing a
line and a plane settling into a clean two-case story right before space produces a third case.

## Source check line

*Consulted the NCERT Class-12 Mathematics chapter index (Ch. 11, Three-Dimensional Geometry) and the named
international specifications (IB DP AA guide — the HL/SL split; AP Calculus and Precalculus CEDs — absence;
Cambridge IGCSE 0580/0606 — absence; A-level Pure and Further Pure — the planes split) for SCOPE only, feeding
§10(i-3). NCERT Exemplar consulted for misconception BELIEFS only. No teaching method, no example problem, no
figure imported. HC Verma / DC Pandey not consulted (physics-only).*

## Self-review checklist — run

- [x] Atomic claim is one sentence; deferrals named.
- [x] 9 states, complexity-justified, order changed from the sketch with the reason stated.
- [x] Control table present with archetype × delta × controls × words × ring × **`→ hand-off`**; nine distinct archetypes, two coinages justified, `drag-sandbox` on explore only; **no hand-off reads "and now, separately"**.
- [x] Rule 32 plan complete, including the four states that deliberately author NO `glow_focal`.
- [x] **Colour language = Act I's table VERBATIM** (green = derived object, violet = measured region, magenta restored, no sixth colour); **§arc rule 5's handoff frame = Act I's S5 final frame unchanged** — same pose az 90 / el 30, same colours, same objects present, only the words change.
- [x] **Rule 19 stated per state** (min 4 primitives, floor 3) under every preset and both explore groups.
- [x] **Ring-cut walk covers the `→ hand-off` column** (A13); S6 and S7 each author a cut-safe alternate.
- [x] Rule 16a: exactly 3 `misconception_watch` states; contrast beats show the consequence then the mathematics; no prediction, no pause; no cue restates a wrong belief.
- [x] Rule 38: rings monotone, advanced contiguous before explore, BOTH cuts checked coherent in both directions, explore surfaces core only, controls ring-discharged by ASSIGNMENT (not the inert `min_ring`), `curriculum_tags` with `needs_teacher_verification` on every non-CBSE cell, presets derived, graph axes N/A with reason.
- [x] Rule 41 on every rendered string; no idiom, no personification; "skew", "normal", "perpendicular" used as the plain words they are.
- [x] Rule 35 / 38f: both anchors universal (a straight track with distance markers; a road overpass); no country-specific content anywhere.
- [x] **7 assessment items** vs the floor `.min(6)` (`conceptJson.ts:328`), **all answerable from CORE-ring states** because `quizQuestionSchema.difficulty` is `z.enum(['core','stretch'])` (`:314`) and carries **no ring field** — so an item on a cuttable state can never be hidden.
- [x] Every camera authored and **re-solved at the renderer's real FOV 60 against a declared 16:9 reference aspect** (A10), **pairwise, perspective, full grid, R swept where it matters**, with FOV + aspect + axes swept + worst value stated beside every number; the explore camera solved over **EVERY live slider** (A14 worst-case law) — which **falsified the single-scene design at 1.35° min separation** and forced Δ10.
- [x] **The skew trap** carried in all three required ways on S5 and S8: live numeric distance, the common perpendicular drawn as an object, camera solved pairwise — plus the geometry re-authored because the first gap measured 0.258 and drew at 5.9 %.
- [x] Engine queue swept (4 queries, counts given); boundary declared **narrowed** with named exclusions; ~50 rows dispositioned verbatim.
- [x] Union walk re-run against real states, both directions, plus the **scriptability** walk that produced Δ3.
- [x] Zero TBDs. **Zero states marked buildable** — this is a SPEC.

---

# CYCLE 1 — CHECKPOINT A RESPONSE

Every finding from the cycle-1 dispatch, marked **APPLIED** or **REJECTED-with-reason**. Nothing is
silently absorbed; where ROUND 0 was wrong the wrong text is quoted before the fix, because a correction a
later reader cannot audit is not a correction.

## Rulings taken by the dispatching session (A12) — applied, not re-litigated

| Ruling | Status | Where |
|---|---|---|
| **Colour language conforms to Act I's table VERBATIM** — green = derived object, violet = measured region, magenta restored, no sixth colour | **APPLIED** | §3 colour table rewritten as Act I's five rows; `n`, the perpendicular segment, the common perpendicular and `d₁×d₂` are **green**; the patch is **violet**; `a₂−a₁` is **magenta**, restored; the invented "pale grey-blue" is deleted and points are declared **neutral apparatus ink** (the ink Act I already uses for its origin marker and axis triad) — a statement of the five-role table, not a sixth role. Propagated to §3 32e, §10(b) and §12. **Act I's load-bearing claim — "green never means an input" — now survives into Act II: a plane's normal is a DERIVED object and is green for exactly that reason.** |
| **§arc rule 5's handoff frame is Act I's S5 FINAL FRAME, unchanged — same pose, same colours, same objects present; only the words change** | **APPLIED** | §3 S1 row. S1 now **enters at az 90 / el 30** (Act I's pose, not ROUND 0's az 36 / el 6) on the **violet parallelogram with the GREEN `a×b` standing perpendicular on it**. The narration re-labels that green arrow `n` and that violet quad "a patch of a plane" — **the green arrow is never deleted and no violet normal is ever grown at the seam** (ROUND 0's defect, which taught that the same object is two different things). Both objects then dim to ghosts *keeping their colours*, and S2 brightens the same green normal rather than re-growing one. §5 carries the pose; §14 measures the entry frame at fill **0.223**. |
| **A3 CORRECTED — Δ3's justification was FALSE though the request is right** | **APPLIED, in full and quoted** | Δ3 rewritten. ROUND 0's *"without an `animate[]` block every guided state is byte-static and Rule 31's no-static floor fails by construction"* is quoted and refuted: `param_ramp` ships in **three** scenarios (`:1050`, `:1968`, `:2097`), `idle_auto_sweep` in **four** (`:374`, `:926`, `:1052`, `:1951`), all routing through one path (`:1339`). **F21 is a PORT and its dispatch names both as clone targets.** The genuine need is restated as *authorability by `json_author` without a renderer edit per re-time*. Root cause recorded: **the Rule-40a sweep was run on the scenario NAME and never on the MECHANISMS declared missing** — a sweep of the wrapper, not the contents. §13b's summary and the queue disposition of `field3d_param_ramp_authoring_contract` (P3-1, ROUND 0 said "N/A") are corrected with it. |
| **F-row numbers fixed: F21 `animate[]` · F22 free point · F23 comparison segment/projection · F24 `vg.camera_steps`** | **APPLIED** | Δ1 renumbered (ROUND 0 called `points` "F21"); §⓿ rows re-tiered; F24 added. |
| **F21 folds into VG-A, not VG-C** | **APPLIED** | Δ3 header. |

## P1 — all six closed

**P1-1 · THE NINTH DELTA, AND IT ALREADY EXISTS. — APPLIED, and the design retreat is withdrawn.**
New **Δ9**: adopt `os.camera_steps` (declared `:60704`, implemented `:62213–62290`, called `:64631` /
`:64858`) as **`vg.camera_steps` (F24)**. ROUND 0 buried this in §13b as *"partially"* — it is not partial,
it is absent, and `camera_position` is entry-only (`applyState:67196`). **Three states consume it:** S1's
chapter seam, S5's swing, and S7's reframe (which the P1-2 re-solve newly forced). Three consequences taken
rather than designed around: (i) it is **closed-form on state-local ms**, so it bypasses `lerpSpherical`,
is frame-rate independent, and reproduces byte-identically under `SET_TIME_FREEZE` → **ASSUMPTION A4 and
FLAG 2 are DISSOLVED and withdrawn**, and §12's S5 pin **may now assert the camera arrival**, which ROUND 0
explicitly could not; (ii) it eases and starts/ends at rest → Rule 32d for free; (iii) it is a port, so its
cost is `vg` plumbing.

**P1-2 · EVERY CAMERA POSE SOLVED AT THE WRONG FOV. — APPLIED. Every pose in the document is superseded.**
Re-solved at **FOV 60** (`PerspectiveCamera(60, …)`, `:3733`, corroborated `:56905`) against a **declared
16:9 reference aspect** (`camera.aspect` is live, so no frame figure is defined without one; the file solves
at 16:9 at `:57121`, `:57319`). Frustum half-extents **y 0.5774 / x 1.0264**. Per A14, every row now names
**FOV + aspect + axes swept + worst value**. §5, §14 and the header all carry it. **The re-solve did not
merely shift numbers — it falsified three ROUND-0 design decisions** (S7's shared pose, S6's radius, and the
whole S9 row), which is the argument for A10 being a standing rule rather than a note.

**P1-3 · The dot product is an untaught term. — APPLIED, by introduction, at S2 rather than S4.**
The §9 claim is quoted and corrected; §10(b) gains a defined-in row for `n·v`; §3's S2 row gains a
**one-beat introduction** (a neutral test vector swung inside the patch with `n·v` reading `0.000`, then
tipped off it) and its budget rises 33–40 → **44–52** words. **The dispatch offered S4; S4 is one state too
late** — S3's formula surface renders `|n·(q − a)|` before S4 ever runs. Callout 3 is corrected: `a×b` alone
is Act I's and is held to S8; `a·b` is this concept's and is introduced at S2.

**P1-4 · Both ring cuts leave a dangling `→ hand-off`. — APPLIED.** §10(i-1) rewritten to walk the hand-off
column (A13). **S6 and S7 each author a ring-cut alternate hand-off** (§3's control table): S6's closes the
lesson when S7+S8 are hidden; S7's closes it when S8 is hidden. Neither alternate promises a hidden state.

**P1-5 · S3 (PRIMARY AHA) motion is self-contradictory. — APPLIED, and the geometry confirms one path.**
ROUND 0 authored the comparison feet on **different axes** (`+1.6u`, `−2.2v`), which no straight sweep can
pass through, and §3 and §12 described two different motions. **Measured: both authored readouts lie on the
SAME straight `u`-path through the true foot** — `s = −2.2 → 3.110`, `s = 0 → 2.200`, `s = +1.6 → 2.721`.
So the numbers were right and only the `v` was wrong. **One path authored**: foot sweeps `s = −2.2 → +1.6`
(readout dips through 2.20 at `s = 0`), returns to `s = 0`, then locks green. §3, §11 and §12 now describe
that single motion, and the `sweep-to-extremum` coinage earns its definition.

**P1-6 · S5 renders the misconception for 3.5 s with nothing contradicting it. — APPLIED.**
`shortest distance = 1.80` is **live from t = 0**, and the crossing marker's pulse is cut **3.5 s → 1.5 s**.
The false picture is never on screen unnumbered for a single frame.

## P2 / P3

| # | Status | Resolution |
|---|---|---|
| **P2-1** ring tags on assessment items are unauthorable | **APPLIED** | `quizQuestionSchema.difficulty` is `z.enum(['core','stretch'])` (`conceptJson.ts:314`) — no ring field, so `'advanced'` is illegal and **no item can be hidden by a preset**. The S8 item is **dropped**; all seven items now answer from **core-ring** states (item 7 replaced by the numeric form of M1 on S3); `difficulty` used for what it is (4 core / 3 stretch); `non_assessed_states` gains **STATE_8**. Floor `.min(6)` holds under `core_only` with nothing removed. |
| **P2-2** S9 angle fidelity unmeasured | **APPLIED — and it closed A3 too** | Fidelity is now a **constraint in the solve**, swept 25°–115° at 1° steps. S6 re-solved over R as well as az × el: **worst \|screen − true\| = 0.88°** (was 5.99°). S9-B: **3.70°**. ROUND 0's "true 90° → screen 84.9°" problem no longer exists at either pose. Narration duty kept as a preference. |
| **P2-3** Rule 41 register in hand-off sentences | **APPLIED** | *"the plane handed us"* → *"A plane supplies a normal"*; *"two skew lines hand us nothing"* → *"supply no normal"*; *"here are all the handles"* → *"The last state gives you the controls"*; *"a thread"*, *"run past it"*, *"settle into"* also plainened. |
| **P2-4** Δ4 requires a row Δ6's "closed" enum has no token for | **APPLIED** | `no_meeting_point` added (and `n_dot_v` for the S2 beat) — both were consumed by a state while absent from the enum, the same both-directions failure the enum exists to prevent. |
| **P3-1** Δ3's `param_ramp` disposition said "N/A" | **APPLIED** | Re-dispositioned **BINDS** in the queue table, with all three declaring scenarios cited. |
| **P3-2** the handoff frame lives in Act I's EXTENDED ring | **APPLIED** | **FLAG 5.** Under Act I's own `core_only` a teacher never sees that frame, so **S1 may not narrate it as a recollection** — S1's opening words describe the objects instead of referring back. Recognition is a bonus, never a requirement. Flagged for Act I's skeleton to carry the same note. |
| **P3-3** Rule 19 never stated per state | **APPLIED** | §12 gains a per-state primitive count: **minimum 4, floor 3**, under every preset and both explore groups. |
| **Weakest rubric dimension — 6 of 8 titles are topic labels** | **APPLIED** | All six rewritten as results with the meaning in the FIRST words (Rule 41d, the rail truncates): *One Number Names Every Point on a Line* · *A Normal Direction Fixes a Whole Plane* · *The Perpendicular Is the Shortest Segment* · *A Line Meets a Plane Once, or Never* · *Directions Alone Fix the Angle* · *Measure to the Normal, Then Subtract* · *The Gap Runs Along d₁ × d₂*. |

## REJECTED — one, and it is a partial rejection with evidence

**"The `lambda_span` cap at 5.0 as a design consequence of the explore solve" — confirmed sound by the
dispatch. The CAP survives; its ROUND-0 JUSTIFICATION is REJECTED as void, and I am flagging that rather
than quietly keeping the conclusion.** ROUND 0 justified the cap by *"worst frame fill 0.915 ≤ 0.92, only
0.5 % of headroom"* — computed at **FOV 50**, and FOV 60 is **wider**. Re-measured: the combined scene
reaches only **0.638 at cap 6.5**, so the stated argument is dead. **The cap is still right for a different
measured reason:** explore group B at its own pose reaches fill **0.829 at cap 5.0** and **1.094 at cap 6.5**
— off-frame. Group A is unconstrained (0.656 even at cap 8.0). *Keeping a right answer whose reason has been
falsified is how a falsified reason survives into the next document; the reason is replaced, not patched.*

## NEW engine deltas the fixes forced — TWO, taking the contract from 8 to 10

- **Δ9 — `vg.camera_steps` (F24).** A **PORT** of a shipped mechanism (P1-1). Cheap, and not optional: without
  it neither the chapter seam nor S5's teaching beat can be authored.
- **Δ10 — a `scene_group` selector on the explore state, forced by a measurement.** Applying the A14
  worst-case law honestly to S9 — all eight objects co-present, **all six** live sliders swept — the best pose
  anywhere in `R ∈ {13,14,15,16} × az × el` returns **min pairwise separation 1.35°**. There is no camera that
  fixes it; ROUND 0's S9 row was a solve over a subset, which is exactly what the worst-case law forbids.
  Splitting into two authored groups with per-group poses gives **41.1°** and **11.0°**. Both groups are
  core-ring, so Rule 38b is untouched. **If VG cannot absorb Δ10, drop one group from the sandbox — never ship
  the 1.35° scene.** → FLAG 3.

## The lesson this cycle is worth recording

Three of the six P1 findings — the wrong FOV, the ninth delta, and the false `animate[]` justification —
share one shape: **a claim about the engine asserted from a plausible model instead of measured against the
engine.** The FOV was assumed at 50 in a document citing four line numbers in the very file that declares 60.
The mid-state camera was declared impossible in a renderer that already implements it. `param_ramp` was
declared missing in a renderer that ships it three times. **All three were one grep away, and the Rule-40a
sweep that was run looked for the scenario NAME.** The durable form, and it belongs beside the WORST-CASE
LAW: *sweep for the MECHANISM you are about to declare missing, not for the container you plan to put it in —
a document whose value is engine deltas is judged on the deltas it does not need.*

---

## FLAGS — for `founder_proxy` Checkpoint A (CYCLE 1)

1. **The catalog prerequisite discrepancy (§9).** `mathematicsCatalog.ts:139` names
   `vector_dot_and_cross_product` as this concept's prerequisite while the wave plans to author Act I as
   `vector_products_in_space`. Free to fix today; a broken advisory edge later. **Not this desk's edit.**
   *(Confirmed real by Checkpoint A; now wave open decision 8.)*
2. ~~`lerpSpherical`~~ **WITHDRAWN.** F24 `camera_steps` routes this concept around the defect entirely (Δ9).
   Replaced by: **3.**
3. **⭐ TEN engine deltas now, and Δ9 + Δ10 are the two that change VG's scope.** Δ9 is a **port** (cheap —
   `os.camera_steps` ships and has live call sites) and it is not optional: without it S5's teaching beat and
   S1's chapter seam cannot be authored. **Δ10 is the expensive one and it is forced by a measurement, not a
   preference** — the single-scene explore state solves to **1.35° minimum pairwise separation** and there is
   no pose that fixes it. If VG's scope cannot absorb Δ10, the honest move is to **drop one object group from
   the sandbox**, never to ship the 1.35° scene. Founder call, made now rather than discovered at 0d.
4. **The narrowed scar boundary** is declared rather than claimed complete. Name any excluded family you
   judge in scope and it will be dispositioned.
5. **NEW — §arc rule 5's handoff frame lives in Act I's S5, which is Act I's EXTENDED ring (P3-2).** Under
   Act I's own `core_only` preset a teacher never sees that frame, so **S1 may not narrate it as a
   recollection.** Authored consequence: S1's opening words **describe the objects** ("a patch of a plane,
   and the perpendicular direction that fixes it") rather than referring back ("you remember this"). The
   recognition is a bonus for the teacher who ran Act I in full and costs nothing to the one who did not.
   **This is a chapter-level property of `→ hand-off` continuity and Act I's skeleton should carry the same
   note.**
6. **NEW — the handoff frame's RADIUS.** A12 requires *"same pose, same colours, same objects present."*
   Pose (az 90 / el 30) and colours are matched **verbatim**. Radius cannot be: Act I frames a `|a| ≤ 3`
   apparatus at **R 9**, Act II a 4.5-extent one at **R 13**. Authored resolution — S1 **enters at Act I's
   R 9 with the patch at Act I's parallelogram size** (measured fill **0.223**, comfortable), so the seam
   frame is pixel-comparable, and `camera_steps` eases R 9 → 13 as the patch grows. **Flagged rather than
   assumed: if the founder reads "same pose" as including R, S1's entry is already compliant and only the
   ease is at issue.**

*Handoff: `founder_proxy` Checkpoint A. On `DESIGN_OK` → the amended `vg` contract folds into the **VG-C dispatch
prompt** (0c), not into an authoring desk. The `mathematics_author` desk opens only after VG-A…VG-C are on master.*
