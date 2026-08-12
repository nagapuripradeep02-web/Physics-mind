# FOUNDER_PROXY — CHECKPOINT B (BUILD GATE) — `graph_transformations`

> Dispatch context (recorded by the dispatching session, 2026-08-07): retroactive Checkpoint B,
> founder-ordered. The concept was already merged (PR #53) and its 8 baselines founder-locked
> before this gate ran — a FIX here means a follow-up branch + `visual:approve` re-baseline, not
> a revert. The proxy was instructed to judge as if the order were normal. Frame dump walked:
> `.visual_runs/graph_transformations/20260807-172917/` (post-merge tree, THE EYE 50/50).
> The dispatching session independently re-verified P1-1 (STATE_2 frozen: x-axis numbered −6…6,
> y-axis has no numbers anywhere) and P2-4 (4× crop: transform curve crosses `(1.57, -1.10)`)
> before committing this report.

**Verdict: `FIX`** — 1 × P1 · 5 × P2 · 9 × P3. Fix cycle 0.
Two `FIX(engine)` findings, both **ride-along** (neither blocks).

**Justification.** The build is strong and the Checkpoint-A cycle-1 findings genuinely landed — all three P1s and all nine P2s diffed against the shipped JSON and the frames: S7's chip chain is symbolic and exact, S6 is regrouped so both examples precede each claim, `f` is on S7's surface, the S3 guess curve now holds beside the real one for 4.2 s (the best teaching frame in the concept), S5's bracket is expression-bounded with its b-floor raised, all seven curriculum tags are honest `partial` + `needs_teacher_verification`, S2's hold and pin are on the display grid, the ghost is legible at `stroke_weight: 4`. Word budgets, archetypes, explore-last, Unicode math, delta-cue discipline, one-formula-surface, slider slot continuity across S2–S5→S8 and the Rule-37 explore motion all pass on direct inspection. What blocks approval is a single half-executed remedy with a large teaching consequence: the Checkpoint-A P3 about the interior y-tick column was closed by setting `y_tick_labels: "none"` — the skeleton's own prescription was `'none'` **plus edge labels via `label`s**, and the second half was never built. The result is that a concept whose every core quantitative claim is vertical (`k` slides it up by exactly k; `|a|` is the amplitude; a = −2 is twice as tall) ships with no y-axis numbers anywhere and horizontal gridlines rendering at a measured 1.07:1 contrast ratio. Nothing on screen measures the quantity the lesson names. That is a P1 and its fix is five `label` primitives and one hex value.

---

## PASS 1 — SCAR PRE-READ (the ratchet)

Live `engine_bug_queue` queried (40 rows on the PCPL/readout/plane/label filter). Classes checked explicitly against this sim:

| scar class | status | checked how | result |
|---|---|---|---|
| `cartesian_plane_tick_values_enumerate_from_range_min_so_every_axis_label_misreports_its_own_gridline` | FIXED / CRITICAL | measured x-tick label positions in `STATE_1__frozen.png` against the plane transform (0 at px 668, 73.3 px/unit; −6 predicted 228, measured 230; 5 predicted 1034, measured 1034) | **no recurrence** — this concept is the first consumer of the fix |
| `parametric_canvas_drawn_readout_overprints_its_own_line_and_is_invisible_to_the_layout_checker` | FIXED / MAJOR | zoomed every readout in all 8 frozen frames | **no recurrence** (the S4 defect falls in the sibling-ink OPEN gap, not this row) |
| `formula_surface_footprint_overlaps_an_authored_curve_end_label` | FIXED / MODERATE | S1 box 898–1000 px vs curve label 1042–1115 px | **no recurrence** |
| `axis_tick_labels_reveal_before_the_axis_they_annotate` | FIXED / MODERATE | S1 `animate_in_ms: 1000` on the plane, labels ride the plane | **no recurrence** |
| `pcpl_vector_label_at_segment_midpoint_is_bisected_by_a_vertical_segment` | FIXED / MAJOR | S5 bracket horizontal, label below | **no recurrence** |
| `pcpl_position_expr_authored_as_an_object_literal_string…` | FIXED / CRITICAL | S5 bracket renders at the correct 231 px for 2π/2 | **no recurrence** |
| `pcpl_drawvector_has_no_focal_glow_channel` / `pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius` / `pcpl_cannot_draw_a_secant_or_tangent…` / `parametric_from_expr_to_expr_never_consumed` | FIXED | surface-checked | **no recurrence** |
| `parametric_computephysics_missing_silent_template_leak` | pre-empted | every frame carries ink in the plane viewport; no "Unknown concept" text | **cleared — the BINDING deliverable shipped** |
| `canvas_drawn_readouts_never_enter_the_de_overlap_solver…` | OPEN / MAJOR | zoomed all 8 | **bites once, in S4** — P2-4 |
| `parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_primitives_curve_or_line_ink` | OPEN / MODERATE | same | **bites once, in S4** — same instance |
| `pcpl_solver_cannot_register_expression_driven_vector_primitives_as_obstacles` | OPEN | S5 bracket at px 486 vs trough px 450 | not biting |
| `pcpl_glow_focus_cannot_resolve…` + `…renders_a_halo_before_its_target…` | OPEN | zero `glow_focus` in the JSON; focal via `focal_primitive_id` | dodged |
| `pcpl_state_level_once_choreography_skips_the_d5_motion_gate` | OPEN / MAJOR | manifest: D5 ran and passed on all 8 states | **not biting here** |

**Checkpoint-A cycle-1 candidate rows** (7, in `graph_transformations_checkpoint_a_cycle1.md`, still not applied to the DB) — re-checked: `rendered_equation_chip…exact_equality` **cleared** · `primary_aha_state_sequences…` **cleared** (measured build order k 2000–5000 → a 7000–10000 → chip 10500 → h 12000–15000 → b 17000–20000 → chip 20500) · `plane_id_vector_has_no_viewport_clipping…` **cleared** · `choreography_hold_value_off_the_slider_caption_grid…` **cleared in letter** (see P3-2) · `ring_cut_coherence…` **cleared for items**, residue on the concept NAME architect-escalated (P3-6) · remaining two discharged.

**No recurrences.** Nothing in this build re-opens a FIXED class.

---

## PASS 4 — PER-STATE TABLE

| state | correct | order_ok | labels_present | reads_sound_off | clearly_different | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|
| **S1** The Parent Curve | Y | Y | Y | Y | Y | `y = sin x` printed twice (formula box + canvas label). Delta cue names no specific thing. No y numbers. | P3 |
| **S2** Add k: The Curve Slides Up | Y | Y | **N** | Y | Y | Narration names **P′**; canvas shows bare `(1.57, 2.00)`. **No readable vertical scale** — "up by exactly 1" unmeasurable (gridlines 1.07:1). | **P1** |
| **S3** Subtract h Inside: It Slides Right | Y | Y | Y | Y | Y | The state's best moment (three curves apart, t≈10 s) is in **no** locked baseline; the pin photographs the guess already gone. | P3 |
| **S4** Multiply by a: Taller, Then Flipped | Y | Y | **N** | Y | Y | **Title states the wrong order** — the curve is never taller-then-flipped. Curve **crosses the readout text**. P′ unnamed. Pin 400 ms past its designed hold. | **P2** |
| **S5** Multiply x by b: Squeezed Narrower | Y | Y | Y | Y | Y | Bracket has no end caps; no y numbers. | P3 |
| **S6** Outside Acts on y, Inside Acts on x | Y | Y | Y | Y | Y | **"opposite direction" is meaningless for b**; "same direction" wrong for a. This is the aha sentence. P′ readout peer-dimmed. | **P2** |
| **S7** Where One Point Lands | Y | Y | **N** | Partly | Y | At rest the **origin of the hop is unmarked** — chips' `π/2` and `1` have no on-canvas referent. P′ unnamed. | P2/P3 |
| **S8** Explore: Four Sliders | Y | Y | **N** | Y | Y | Empty narration contract-conform. **The only numeric instrument (P′ readout) is peer-dimmed** while the teacher drags. P′ unnamed. | P3 |

Every state `correct_YN = Y`: P′ = (π/2b + h, a + k) re-derived at all four pins, every rendered coordinate reconciles to 2 dp; S5 bracket 231 px vs predicted 230 px; every arithmetic chip exact.

---

## FINDINGS

### P1 — blocks approval

**P1-1 · No readable vertical scale anywhere in the concept; the remedy that created the gap was only half-built.** **Owner: `alex:json_author`.**
- All 8 planes author `"y_tick_labels": "none"`; no `label` primitive supplies replacement y numbers in any state.
- Gridlines measured on `STATE_2__frozen.png` (x=250, ink-free): rows at RGB (20,24,37)/(17,19,31) vs background (15,15,26) → contrast ≈ **1.07:1**. Authored `grid_color: "#1E293B"` × peer-dim `alphaMul: 0.6` (`parametric_renderer.ts:973`).
- The skeleton §11(f) prescribed *"`y_tick_labels: 'none'` **+ edge labels via `label`s**"* — the first clause shipped, the second never built.
- Every core quantitative claim is vertical (k slides up by exactly k; |a| is the amplitude; twice as tall). The x axis carries numbers throughout, so the asymmetry is an accident, not a style. Rule 24 / Rule 33d: the plane is this concept's instrument and half of it has no scale.
- Fix (~10 min, pure JSON): (1) edge y-labels as `label`s at data x ≈ −6.2 for y = −2,−1,1,2,3 (left column empty in all 8 frames; curve band |x| ≤ 6.5, y ⊆ [−3.5,3.5]); (2) raise `grid_color` to ≈ `#334155`/`#3F4E63` to survive the ×0.6 dim. THE EYE, then `visual:approve`.

### P2

**P2-1 · `P′` spoken in narration, printed on no canvas surface, in every state that names it.** **Owner: `alex:json_author`.** S1 authors `"P = ({x}, {y})"`; S2–S8 author bare `"({x}, {y})"` while narration says "P′ rises with it" / "P′, the peak's image". Fix: `"P′ = ({x}, {y})"` on `p_prime` in S2–S8. One field, seven states.

**P2-2 · S4's title states the wrong order and contradicts its own narration.** **Owner: `alex:json_author`.** Title "Multiply by a: Taller, Then Flipped"; the sweep a: 1→−2 shrinks to flat, flips, then grows — narration s4_2 states it correctly. Suggested: "Multiply by a: Flipped, Then Twice as Tall" or "Stretched and Flipped".

**P2-3 · The PRIMARY AHA chip applies shift vocabulary to a scale factor that has no direction.** **Owner: `alex:json_author`.** `chip_inside`: "inside — acts on x, opposite direction"; true for h, **false as a category for b** (b=2 divides the width, moves nothing in a direction); same for a on the outside half. Narration s6_2 inherits it. Provenance owned by the proxy: this wording was its own Checkpoint-A P2-9 register fix — checked for plain language, not for mathematical scope. Suggested: `outside — acts on y, as written` / `inside — acts on x, inverted (÷ b, + h)`; s6_2 trailing clause → "both act on x, the opposite way" (matching the concept's own `aha_moment.statement`).

**P2-4 · S4: the transform curve crosses the coordinate readout.** — **`FIX(engine)`, ride-along.** Engine owner `peter_parker:renderer_primitives`; content mitigation `alex:json_author`. 4× crop: the blue `transform_curve` enters the bbox of `(1.57, -1.10)` between the comma and the minus sign. Live instance of the two OPEN rows (de-overlap solver / sibling-ink). Correct fix is the engine one (register sibling curve ink as solver obstacles); interim mitigation: flip `p_prime.readout.offset.y` positive in S4 so the label sits below the trough.

**P2-5 · Zero narration→canvas glow bindings: 23 of 23 sentences unbound.** **Owner: `alex:json_author`.** The channel is live end-to-end for this engine (`build_review_site.ts:355/1176/1092` → `parametric_renderer.ts:944–950`), and **all three mathematics concepts author zero `glow`** while ~20 field_3d concepts author it — a pattern-doc omission in the mathematics lane. Per-sentence fixes named in the full finding; also belongs in `docs/patterns/mathematics.md` so concept 4 does not repeat it.

### P3

1. S1 prints `y = sin x` twice (formula box + curve label) — Rule 34b. Drop the label or reduce to "parent".
2. S4 `eye_capture_ms: 11900` lands 400 ms past its designed a = −1.0 hold (skeleton §12 designated 12000); the locked baseline archives the least characteristic instant of the sweep.
3. S3's canonical baseline omits the concept's best frame — the three-curve divergence at t ≈ 10 s is in no locked baseline, so a regression breaking `guess_curve` would not be caught by H2.
4. S7 marks the destination but not the source at rest — a dim retained `P` marker on the parent ghost is the single highest-value optional improvement.
5. **The explore state cannot opt out of peer-dimming.** — **`FIX(engine)`, ride-along.** `conceptJson.ts:91` requires a non-empty `focal_primitive_id`, so S8 must declare one; `parametric_renderer.ts:973` then dims the P′ readout to 0.6 in the one state where the teacher reads numbers while dragging. The renderer's no-dim path exists (`@969`) — the schema forbids reaching it. Owner `peter_parker:renderer_primitives` (+ `alex:architect` for the schema clause).
6. Concept NAME carries `f`, defined only on advanced S7 — already architect-escalated (skeleton §FLAGS 1; recommendation: catalog name "Graph Transformations"). Founder-owned.
7. `mathematicsCatalog.ts:90` still `prerequisites: []` vs the JSON's `["unit_circle_to_sine_wave"]` (skeleton §FLAGS 3, unapplied). Advisory per Rule 23.
8. S1's delta cue "The curve follows its rule" names no specific new thing. Suggest "The base sine curve".
9. S6 chip colour semantics ambiguous (amber = outside AND the point; sky = inside AND the curve). Reads fine at zoom; noted.

---

## ENGINE QUEUE

Both **ride-along** — neither blocks the APPROVE that follows the P1/P2 fixes.

| # | finding | owner | evidence for the engine agent |
|---|---|---|---|
| E1 | Sibling `function_plot` ink crosses a `plot_point` readout | `peter_parker:renderer_primitives` | Existing OPEN row `parametric_readout_and_label_collision_awareness…` (add `graph_transformations` to `concepts_affected`; umbrella: `canvas_drawn_readouts_never_enter_the_de_overlap_solver…`). Repro: `STATE_4__frozen.png`; readout bbox ≈ (790–885, 428–446) at 1280×720; expectation: `subSimSolverHost.ts` registers sampled polylines as obstacles (or flips the readout to the free side). Probe: rasterise the bbox at `eye_capture_ms`, assert zero pixels of stroke `#38BDF8` inside. |
| E2 | Explore/sandbox states cannot reach the renderer's existing no-dim path | `peter_parker:renderer_primitives` (+ `alex:architect`) | `conceptJson.ts:91` requires non-empty focal; `parametric_renderer.ts:969` already implements "no focal → nobody dims". Expectation: allow absent/empty focal on `interaction_complete` states (or `no_focal: true`), default explore to it. Probe: on S8, `getEmphasis(p_prime).alphaMul === 1`. |

---

## SCAR CANDIDATES

Six INSERT rows (bug_class values collision-checked against the 40 live rows and the 7 Checkpoint-A candidates):

1. `axis_declutter_sets_tick_labels_to_none_without_the_edge_labels_that_were_its_other_half` — CRITICAL, `alex:json_author`
2. `readout_format_drops_the_point_name_that_every_later_narration_still_uses` — MAJOR, `alex:json_author`
3. `state_title_asserts_a_sequence_the_choreography_plays_in_the_opposite_order` — MAJOR, `alex:json_author`
4. `rule_chip_generalises_shift_direction_language_over_a_scale_factor_that_has_no_direction` — MAJOR, `alex:json_author`
5. `tts_sentence_glow_channel_unused_across_an_entire_subject_namespace` — MAJOR, `alex:json_author` (affects all three mathematics concepts)
6. `schema_requires_a_focal_primitive_so_an_explore_sandbox_cannot_reach_the_renderer_no_dim_path` — MODERATE, `peter_parker:renderer_primitives`

(Full SQL preserved in the dispatch transcript; rows filed to `engine_bug_queue` by the dispatching session at commit time.)

---

## KEY IMAGES

Base: `.visual_runs/graph_transformations/20260807-172917/`
1. `STATE_2__frozen.png` — the P1 plainest: bright copy above grey parent, nothing on screen says the gap is 1.
2. `s4_readout.png` (4× crop) — the curve slicing through `(1.57, -1.10)`; invisible at 1×.
3. `STATE_3__dense_t10000.png` — the best frame in the concept, in no locked baseline.
4. `s1_dup.png` (4× crop) — `y = sin x` twice, 250 px apart.
5. `STATE_7__dense_t00000.png` — the point at its origin, which the resting frame forgets.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did NOT affect the verdict)
  D1 2 · D2 1 · D3 0 · D4 1 · D5 1 · D6 1 · D7 1 · D8 2 · D9 1 · D10 2   = 12/20
  weakest: D3 narration→canvas binding (0/23 bound, channel wired end-to-end; all three
           mathematics concepts score 0) · D6 quantity legibility (every quantitative
           claim vertical; no y numbers; 1.07:1 gridlines; P′ spoken, never printed)
  D4 note: scored on the "elements that teach nothing" clause — the 3–4/4–5/>5 primitive
           bands do not transfer from the field_3d apparatus family; flagged as a
           rubric-calibration gap, not a defended score.
```

## SELF-REVIEW (proxy's own)

- Every P1 verifiable by the founder in under a minute (one contrast ratio, one grep, one look at S2).
- Every FIX names exactly one `alex:*` owner; both `peter_parker:*` findings are engine-queue ride-alongs, never FIX routing. Nobody dispatched.
- PRIME DIRECTIVE on P2-4: routed as engine (the solver gap bites the next cartesian_plane concept), content offset-flip named only as interim.
- Rule 38 checked in full (38a–38g detailed in the transcript); Rule 39 N/A on this engine.
- No P1 lowered to reach APPROVE — cycle 0, two cycles remain before escalation.
