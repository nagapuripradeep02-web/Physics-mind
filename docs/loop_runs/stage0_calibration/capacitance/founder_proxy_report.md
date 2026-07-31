# founder-proxy report — `capacitance` (Stage 0 calibration, 2026-07-22)

> EXPERIMENTAL trial, `docs/CHAPTER_LOOP.md` step 4. **Reports only — nothing applied.**
> No `visual:approve`, no `tts:*`, no `PILOT_CONCEPTS`, no deploy, no DB write.
> Candidate scar rows are **files for founder review**, never inserted (trial rule §3.4).

Two blinded runs were made against this concept:

| Run | Build under review | THE EYE | drive dump | Verdict |
|---|---|---|---|---|
| **A1** | HEAD (current, founder-approved, baseline-locked) | 44/44 | `.founder_runs/capacitance/2026-07-22T10-22-04-191Z/` | `ESCALATE(trigger 1)` — 8 P1 / 6 P2 / 3 P3 |
| **B** | **pre-fix reconstruction** (3 defects deliberately re-planted by the orchestrator, then reverted) | 44/44 | `.founder_runs/capacitance/2026-07-22T10-55-22-771Z/` | `ESCALATE(trigger 1)` — 6 P1 / 4 P2 / 3 P3 |

THE EYE run dirs: `.visual_runs/capacitance/20260722-122000/` (A1),
`.visual_runs/capacitance/20260722-125436/` (B).

Both runs were blinded: `engine_bug_queue` queried with the 4 `capacitance` rows excluded (304 → 300
used), no `supabase_migrations/*`, no `_seed_engine_bug_queue_*`, no `PROGRESS.md`, no
`DISCUSSIONS.md`, and **no git command of any kind**. Neither run had an `eye_walker` or
`quality_auditor` report available; both noted the absence rather than blocking.

---

## ⚠ Run B artifact warning — read before using any row below

Run B reviewed a **deliberately damaged** build. Three defects were planted by the orchestrating
session to test recall against the real founder record, then reverted (`git checkout --`; tree
verified clean; re-seed produced a byte-identical 2,220,351-char sim). Run B correctly found all
three — that was the point — but **rows describing them are artifacts of the calibration, not defects
of this repo**, and are excluded from `scar_candidates.sql`:

| Planted defect | Run B row | Disposition |
|---|---|---|
| `PM_cap*Dragged` seize guards removed from the 4 ramp modes | `field3d_scenario_ramp_ignores_drag_seize_in_guided_modes` | **ARTIFACT — do not file.** Guards are present at HEAD (`field_3d_renderer.ts` v_steps/v_sweep/area_morph/gap_morph). Fixed by the founder in `95fe10c`. |
| `cap_readout` / `cap_ratio_readout` returned to `top:12px` | `field3d_new_scenario_dom_overlay_reuses_top12_corner_reserved_by_review_chrome` | **ARTIFACT — do not file.** Both are at `top:52px` at HEAD. Already covered by the OPEN fleet row `field3d_sliders_panel_top12_vs_fsbtn_top10`. |
| `STATE_7.formula` returned to `C = ε₀A / d` | `explore_state_inherits_non_core_ring_formula_and_visuals` | **PARTLY REAL — filed with corrected scope.** The *formula* half is the artifact. The *field-lines* half is genuine at HEAD: `STATE_7` is `depth_ring: core` but ships `show_field_lines: true` + `cap_field_lines`, and field lines are introduced in `STATE_6` (`advanced`). Verified by the orchestrator. |

Everything else Run B reported was present in the undamaged tree and independently corroborated by
Run A1, which never saw the planted build.

---

## Verdict and why it parked

`ESCALATE(trigger 1 — renderer/engine edit needed)` on both runs. The correct fix for the great
majority of findings lives inside `src/lib/renderers/field_3d_renderer.ts` (the `capacitance`
scenario block, ~lines 5296–6075). Under the trial the proxy never routes to `peter_parker:*`, so the
concept parks and the founder decides the engine work.

The concept's **authoring** is strong and both runs said so explicitly: the arc, the word budget
(41–55 EN words/state), the ≤5-word delta cues on all 7 states, ≥2 distinct `advance_mode`,
home-pose continuity, single glow focal, full Unicode discipline across DOM/canvas/sprite paths, Rule
35 neutrality, the depth rings, the curriculum-tag honesty, the dot-pool constant-density story, and
the ⚙ widget labels all pass. Physics was verified correct at every readout checked (88.5 / 177 /
44.3 pF; 1.06 / 2.12 / 0.53 nC; ratio 0.0885 nC/V). **The defects are concentrated in the scenario's
rendering, not in the concept's design or its physics.**

### Headline finding (orchestrator-verified in source)

**The Q–V graph is mathematically incapable of showing capacitance change.** `capDrawGraph`
(~line 5844):

```js
var Qaxis = Math.max(C * Vaxis * 1e9, 0.1);   // axis normalised BY C
var p1    = px(vEnd, C * vEnd * 1e9);         // yFrac ≡ (C·Vaxis)/(C·Vaxis) = 1
```

C cancels exactly, so the trace always terminates at the plot's top-right corner and the live dot
sits at `(V/Vaxis, V/Vaxis)` — both independent of C. STATE_3 teaches *"the slope IS the
capacitance"*; STATE_4 then doubles C to 177 pF and STATE_5 quarters it to 44.3 pF and the graph is
**pixel-frozen** (0 of 227,850 bytes differ across the graph rect; measured trace slope 0.5951 in
S4, S5 and S7 alike; an S7 drag taking C to 221.3 pF left the endpoints exactly unchanged). No
numeric axis ticks exist either, so nothing else signals the silent rescale. The concept JSON encodes
the same error in `computed_outputs.graph_Q_axis_max = 1.1 * C * V_slider_max`, which the renderer
never reads.

### Independently corroborated across both runs

`A` and `d` never render their labels · guided-state end-pose freeze while narration continues ·
translucent-plate camouflage at explore extremes · micro-pool saturation above Q ≈ 2.2 nC ·
S6 derivation shows symbols with no substituted numbers · reference markers not repositioned by the
geometry morph.

---

## Candidate scar rows

**Trial mode: these are proposals for founder review. Nothing was inserted.** Machine-ready,
schema-normalised SQL is in `scar_candidates.sql` beside this file — **11 rows**, artifacts excluded
and cross-run duplicates merged.

Normalisations applied by the orchestrating session (the agents emitted values outside the table's
allowed enums, which would have failed on insert):

- `row_type` — agents emitted `engine_defect` / `content_defect` / `process_gap`; the column accepts
  only `incident` | `directive`. All normalised to `incident`.
- `probe_type` — agent emitted `automated`; column accepts `sql` | `js_eval` | `manual` |
  `vision_model`. Normalised to `js_eval`.
- `fixed_in_files` — `NULL` replaced with `ARRAY[]::text[]` (rows are OPEN; nothing is fixed yet).
- Explicit column list added to every statement.

### Merged duplicates

Run A1 and Run B independently discovered the same two defects under different `bug_class` names.
Since `bug_class` is the upsert conflict key, one canonical row is filed for each and the
rediscovery is recorded here:

| Filed as (A1) | Rediscovered by B as | Note |
|---|---|---|
| `field3d_graph_axis_normalised_by_slope_kills_slope_reading` | `graph_pane_axis_normalised_by_the_taught_slope_is_slope_invariant` | B's probe additionally asserts the dependent axis carries ≥2 numeric tick labels — folded into the filed `probe_logic`. |
| `field3d_label_sprite_opacity_restored_by_id_not_elementtype` | `elementtype_blanket_opacity_zero_strands_sibling_label_sprites` | Identical root cause and prevention rule; A1's wording filed. |

Independent rediscovery of both, by two separately-blinded runs against two different builds, is the
strongest reproducibility signal in this calibration.

### The 11 filed rows

| # | bug_class | sev | owner | source |
|---|---|---|---|---|
| 1 | `field3d_graph_axis_normalised_by_slope_kills_slope_reading` | CRITICAL | `peter_parker:renderer_primitives` | A1 + B |
| 2 | `field3d_label_sprite_opacity_restored_by_id_not_elementtype` | MAJOR | `peter_parker:renderer_primitives` | A1 + B |
| 3 | `field3d_reference_marker_not_repositioned_by_geometry_morph` | MAJOR | `peter_parker:renderer_primitives` | A1 |
| 4 | `field3d_guided_state_holds_end_pose_for_majority_of_narration` | MAJOR | `alex:json_author` | A1 |
| 5 | `field3d_hud_prints_taught_quantity_before_the_state_that_names_it` | MAJOR | `peter_parker:renderer_primitives` | A1 |
| 6 | `field3d_micro_pool_saturates_below_explore_slider_ceiling` | MAJOR | `peter_parker:renderer_primitives` | A1 |
| 7 | `field3d_derivation_panel_symbolic_only_numbers_never_substituted` | MAJOR | `peter_parker:renderer_primitives` | A1 |
| 8 | `field3d_opposite_sign_pools_indistinguishable_at_explore_extremes` | MODERATE | `peter_parker:renderer_primitives` | A1 |
| 9 | `scenario_cue_authored_but_mode_driven_off_raw_at_ms` | MAJOR | `peter_parker:renderer_primitives` | B |
| 10 | `explore_state_surfaces_non_core_ring_visuals` | MODERATE | `alex:json_author` | B (scope corrected) |
| 11 | `eye_and_drive_harnesses_blind_to_guided_state_control_behaviour` | MAJOR | `peter_parker:visual_validator` | B (evidence re-sourced) |

Row 11's original evidence cited the planted dead sliders. It is filed because the **harness gap
itself is real and orchestrator-verified**, independent of the planted defect:
`src/scripts/founder_drive.ts` drags sliders only at `exploreIdx = stateCount - 1`, and THE EYE
captures the raw sim with no review chrome and sends no input events.

---

## Frames the founder should open first

1. `.visual_runs/capacitance/20260722-122000/STATE_3__frozen.png`, `STATE_4__frozen.png`,
   `STATE_5__frozen.png` — side by side. C = 88.5 → 177 → 44.3 pF, one identical graph line. This
   three-frame comparison is the whole argument for row 1.
2. `.visual_runs/capacitance/20260722-122000/STATE_5__frozen.png` — the bare cyan stick and bare
   yellow stick (no `d`, no `A`) beside a formula surface reading `C = ε₀A / d`; battery and wire
   occluded inside the red plate; draining beads lost against maroon.
3. `.founder_runs/capacitance/2026-07-22T10-22-04-191Z/S1_mid.png` — `Q = 0.03 nC` and
   `C = 88.5 pF` on screen together two seconds into state one (row 5, the pre-spoil).
4. `.visual_runs/capacitance/20260722-122000/STATE_6__frozen.png` — the derivation chain as four
   symbol-only lines, no numbers substituted (row 7).
5. `.visual_runs/capacitance/20260722-122000/STATE_2__frozen.png` — the PRIMARY aha state.

Review page (server on :8087): <http://localhost:8087/capacitance/>
