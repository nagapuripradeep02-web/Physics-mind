# founder-proxy — Checkpoint B (build gate) — `ac_voltage_capacitor` (Ch.7 #3, **cycle 1**)

## VERDICT: `FIX` — cycle 2 of 3 · **1 BLOCKING `FIX(engine)`** + **1 `alex:json_author`**

Fourteen of the sixteen routed items are genuinely fixed, each verified against artifacts rather than descriptions. Both engine deviations were defensible and are accepted. But the engine agent's self-found charge-glyph fix — correctly identified as the same root-cause family as E1 — **made a physically wrong layer visible**. The charge-accumulation micro layer was invisible for this sim's whole life; now that it renders, it shows charge on **one plate at a time, hopping from top to bottom as the voltage reverses**, with the colour convention inverted at v < 0. That is the exact misconception the skeleton designed the apparatus to kill (§244 item 2: *"'current flows through the gap' is prevented AT the planting moment… beads visibly stop at the plates and pile as glyphs"*). A capacitor's defining fact — equal and opposite charge on facing plates, always, simultaneously — is absent from the only visual that depicts charge, on the state (S3) whose atomic claim *is* charge accumulation.

Separately, `json_author`'s J1 deviation does not hold up: removing the cue rather than re-binding it leaves stop 3 arming on a static 6000 ms while its siblings arm on narration cues at **7310 ms / 13408 ms** (probed live). In the real player the PRIMARY AHA's captions run *fall → climb → fall → crest* — the reverse of the taught order — and THE EYE is structurally blind to it because it posts no cue times.

---

## 1 · Rulings on the two deviations

### 1.1 J1 — `scenario_cue` removed from `s4_4`: **REJECTED**

`tangent_stops_at_ms = [4000, 5000, 6000]` is correct, verified in pixels:

| frame | HUD | caption | check |
|---|---|---|---|
| `STATE_4__dense_t04000.png` | `v = −0.0 V`, `i = +2.00 A`, chip `slope 15.7 V/s → i = C × slope = 2.00 A` | "steepest climb → i peak" | **TRUE** |
| `STATE_4__dense_t06000.png` | `v = +0.0 V`, `i = −2.00 A`, chip `slope −15.7 V/s → … = −2.00 A` | "steepest fall → i trough" | **TRUE** |

The problem is the **live player**, probed directly:

```
rail cards = 9
FRAME /ac_voltage_capacitor/sim.html
  [{"cue":"tangent_stop_1","at_ms":7310},{"cue":"tangent_stop_2","at_ms":13408}]
```

Only two cue times posted. `tangent_stop_3` unbound → `cueTriggerMs` (`field_3d_renderer.ts:2431`) falls through to `6000` on every path. `sendCueTimes()` runs unconditionally after every `SET_STATE` (`build_review_site.ts:1549`) and is **not** gated on mute — the default teacher experience:

| t | θ | caption on screen | narration playing |
|---|---|---|---|
| 6.0 s | 180° | **"steepest fall → i trough"** | `s4_1` — *"Here's the rule: current follows voltage's slope…"* |
| 8.0 s | 0° | "steepest climb → i peak" | `s4_2` ✓ |
| 10.0 s | 180° | "steepest fall → i trough" again | `s4_2`/`s4_3` |
| 17.0 s | 90° | "flat crest → i=0" | `s4_3` ✓ |

Mixing one statically-armed stop with two cue-armed stops guarantees the static one jumps the queue. THE EYE posts no cue times → **the gate cannot see this class at all**.

**Why the deviation's reasoning fails.** json_author framed it as "S4 is at 54/55 words, no room for a *new* sentence." The skeleton never asked for one — **Cue plan, `skeleton.md:119`: "S4 three tangent stops on s2–4."** Stop 3 was always assigned to the *existing* `s4_4`; the cycle-0 defect was that `s4_4`'s **text** is a drag prompt rather than the steepest-fall beat. The fix is a rewrite, not an insertion, and it fits at 52 words.

Graded **P1** on four grounds: it is the PRIMARY AHA's caption channel; it is the default player path; it is a unilateral departure from the approved skeleton cue plan on a mistaken premise; and it is a ~20-word fix. It is an **ordering** defect, not a truth defect — E2 guarantees every caption shown is true — and that distinction is recorded so the grading is auditable.

### 1.2 E2 — live-θ re-derivation instead of a dwell: **ACCEPTED**, including the caption-less baseline

Re-derivation was listed as acceptable in the dispatch; the reasoning (a dwell's stop *times* are a narration-timing decision, not an engine one) is correct; the implementation at `:26880–26896` is sound — bands are ±π/5 about 0, π/2, π, separation π/2 > 2·band so they cannot overlap, and `break` makes the choice deterministic.

**On the caption-less S4 frozen baseline — ruled acceptable, and not a swap of one baseline defect for another.** The frozen candidate is `stops[2] + 800 ms` → t = 6800 ms → θ = 251.9°, which is 71.9° from stop 3's phase and outside the ±36° band. The disclosure is exact. But compare:

- cycle 0: `"steepest fall → i trough"` beside `i = +0.83 A`, tangent climbing — **the PRIMARY AHA asserting false physics in its own canonical frame**
- cycle 1: no caption, but the formula surface `i = C × (slope of v)` **plus** the E8 slope chip reading `slope −4.9 V/s → i = C × slope = −0.62 A` beside a HUD `i = −0.62 A` — a live, exact, *true* instance of the state's atomic claim (re-derived: θ = 251.9°, v = 10 sin θ = −9.51 ✓, slope = ωvₘcos θ = −4.88 ✓, i = 0.127 × −4.88 = −0.62 ✓)

Strictly better and independently legible. What *is* lost is **gate coverage**: the H2 baseline no longer exercises the stop-caption path, so a future regression there would be invisible. A harness concern, not a screen defect — filed as a scar row with the arithmetic (`stops[2] + 300` lands at 207°, inside the band). Not worth a cycle.

---

## 2 · The blocking finding: the charge layer is now visible and physically wrong

The registration fix is correct as far as it goes — dots were children of the pool groups, `addToScene` registered only the groups, so every dot sat at build-time `opacity: 0`. The updater now iterates the pools directly (`:27183–27194`) and the dots render. **But nobody has ever reviewed this layer's content, because until this commit there was nothing to review.**

`:27169–27170`:
```js
var topOpacity = Math.min(1, chargeGlyphFrac * (chargeSign >= 0 ? 1    : 0.06) * (1 + 0.5 * chGlowP));
var botOpacity = Math.min(1, chargeGlyphFrac * (chargeSign >= 0 ? 0.06 : 1)    * (1 + 0.5 * chGlowP));
```
with fixed per-pool colours at `:25984`:
```js
var ACC_CHARGE_TOP_HEX = 0xEF5350, ACC_CHARGE_BOT_HEX = 0x42A5F5;   // red top, blue bottom — never sign-tracking
```

Confirmed in pixels, same state, same camera, 3 s apart:

| frame | HUD | plates show |
|---|---|---|
| `STATE_3__frozen.png` (crop `S3_plates_zoom.png`) | `v = +7.1 V`, `q = +0.90 C` | **red dots on the TOP plate only** — bottom bare |
| `STATE_3__dense_t03000.png` (crop `S3_z_03000.png`) | `v = −10.0 V`, `q = −1.27 C` | **blue dots on the BOTTOM plate only** — top bare |

Two distinct errors:

1. **The counter-charge is never shown.** At q = +1.27 C the bottom plate carries −1.27 C — rendered at 0.06 opacity, i.e. absent. Equal-and-opposite is the structural fact that makes a capacitor a capacitor, and it is missing from every frame in every state.
2. **The colour convention inverts at v < 0.** Red is established as positive on the top plate at q > 0. At q < 0 the top plate is negative and the bottom is *positive* — but the renderer shows blue (negative, by the convention it just taught) on the bottom. The top pool is structurally incapable of ever being blue and the bottom of ever being red, so the correct q < 0 configuration cannot be drawn at all.

**Why blocking rather than ride-along.** The composite on screen is: charge appears on the top plate, fades, then appears on the bottom. That is the visual of *charge crossing the gap* — the misconception `skeleton.md:244` item (2) says the apparatus exists to prevent, and which `s3_3`'s own narration explicitly denies. The picture now contradicts the sentence, and it contradicts the `capacitance` prerequisite the skeleton leans on at lines 160/214. On S3 this makes `correct_YN = N`.

*Expected:* **both** pools at |q|-proportional opacity **simultaneously**; top pool colour = sign(q), bottom = −sign(q).
*Probe:* at any instant, count dots with `material.opacity > 0.3` in each pool — both non-zero and equal — and `topColor !== botColor`.

**Scope:** `acc_`-only code. `ac_inductor` has no plates; the `capacitance` scenario uses different naming with no matching pattern. No sealed-sibling contamination on this one.

---

## 3 · Verification of every other routed item

| id | claim | verdict | evidence |
|---|---|---|---|
| **E1** | beads built 7×2 | **PASS** | 14 gold beads visible and oscillating in every apparatus frame; excursion ≈15 px measured (θ=0 vs θ=90°), consistent with ±0.223 world units; none enter the gap |
| **E2** | caption truth | **PASS** | §1.2 |
| **E3** | accumulator → pure function | **PASS — strongest single result** | `STATE_1__dense_t01000.png` now reads `v = +10.0 V`; at t = 1 s, θ = ω·t = π/2, v = 10 sin 90° = +10.0 exactly. Cycle 0 the identical frame read `v = −10.0 V` (θ ≈ 273°). Scar recurrence genuinely closed. Two independent state entries in probe landed on the same phase |
| **E4** | dim restores | **PASS — re-verified with own capture** | THE EYE's ordered run now mints `STATE_9__frozen.png` with bright gold source and full-brightness wires/plates (cycle 0: dull olive). Revisit probe S1→S8→S9→S1: `C1_S1_fresh.png` and `C1_S1_afterS8.png` visually identical. `:26057–26077` captures pristine opacity once per material; `:26673` calls it unconditionally on every state apply |
| **E5** | S1 pre-spoil | **PASS** | `STATE_1__dense_t01000.png`: HUD carries `v` only; graph carries the cyan v-trace only; arrow label reduced to a bare italic `i`. The arrow still flips with sign(i) — correct, an unlabelled plant, which is what `s1_2`/`s1_3` are for |
| **E6** | `Uₘₐₓ` real subscript | **PASS** | `STATE_6/7__frozen.png` render a true subscript; `q_max`, `X_C`, `v_C`, `iₘ`, `vₘ` all correct across HUD, formula panel and canvas |
| **E7** | glow on live channel | **PASS on code review** | `:27168–27192` applies focal as an opacity multiplier plus a colour lerp toward white; the lerp is load-bearing (pool already at opacity 1.0 at every crest, so a multiplier clamps out). Not pixel-verified — would need a glow-on/off diff; accepted |
| **E8** | `iₘ` + slope chip | **PASS** | `iₘ = 2.00 A` in HUD from S2 onward **including S9** (restores the 38a reduced-cut coherence argument at `skeleton.md:214`); `vₘ`/`iₘ` dashed gutter lines present; S4 slope chip live and numerically exact |
| **E9** | on-graph `X_C` collision | **PASS** | `STATE_5__frozen.png`: `X_C = 5.0 Ω` on its own baseline between the vₘ and iₘ rules, unstruck. Same routing keeps the new S4 slope chip clear |
| **E10** | duplicate `U = ½Cv²` | **PASS** | `STATE_7__frozen.png`: gauge sprite now value-only (`stored energy U = 6.36 J`); symbolic relation appears once on `#acc_formula`. At S6 the formula surface is `p = v·i` only |
| **J2** | idealization + demo-scale | **PASS with a gap (P3)** | `s1_4` (8 w, S1 → 54) and the `s3_3` extension (S3 → 53) both in budget. Rule 35b compliance genuinely good — *"mains runs tens of hertz"* is neutral where "50 Hz" would not be. **Gap:** `skeleton.md:91` specifies *"C is demo-scale… (real filter capacitors are thousands of times smaller; **the geometry is identical**)"* and `:244` item (4) makes it a misconception-prevention beat. "demo-scale" survives only as a stacked adjective; the reassurance half is absent. Ride-along |
| **J3** | `C` step | **PASS on scope, incomplete on arithmetic (P3)** | Renderer reads `config.slider_controls` (`:5395`) — leaving `physics_engine_config.variables.C.step` at `0.02` is harmless, though the file now carries two steps for one variable. **But the fix doesn't land:** `min = 0.04`, so the grid is `0.04 + n(0.0127)` and 0.1273 is not on it. founder_drive confirms `valueBefore: "0.1289"`. **This is my error, not json_author's** — my cycle-0 prescription assumed min = 0. Exact value is `step: 0.01455` = (0.1273 − 0.04)/6. Residual 1.26 %, both readings show `0.13 F` at 2 dp, physics untouched. **Downgraded to a note** |

**Orchestrator-verified facts — none found false.** Independently re-ran the DF1 grep: changed lines matching `acr_|acl_|ACR_|ACL_` = **0**, single file, 355/44. founder_drive manifest read directly: `flags: []`, `consoleErrors: []`, `overlayCollisions: []`, `motionProbe.bytesEqual: false`, 8/8 drags moved, 0 reverted.

---

## 4 · Per-state review table

| state | correct | order_ok | labels | reads_sound_off | clearly_diff | problem_or_missing | prio |
|---|---|---|---|---|---|---|---|
| S1 `capacitor_joins_the_circuit` | Y | Y | Y | **Y** ↑ | **Y** ↑ | Beads exist and move; pre-spoil gone; phase exact. Only the one-sided charge picture. | **P1** (charge) |
| S2 `current_leads_quarter_cycle` | Y | Y | Y | Y | **Y** ↑ | `s2_2`'s 16a counter now has its visual. Ghost + bracket + legend are the best thing in the sim. | **P1** (charge) |
| S3 `plates_fill_and_push_back` | **N** ↓ | Y | Y | Y | Y | Micro layer finally visible **and wrong** — one plate at a time, colour inverted at v<0, reads as charge crossing the gap. `q`/`v_C` numbers exact. | **P1** |
| S4 `current_copies_the_slope` **(PRIMARY AHA)** | **Y** ↑ | Y | Y | Y | Y | Captions now true; slope chip exact. But in the live player they arrive fall → climb → fall → crest. | **P1** |
| S5 `reactance_falls_with_frequency` | Y | Y | Y | Y | Y | `X_C` unstruck; `q_max` pinned at 1.27 C. `s5_3`'s "starves" still has no micro evidence (cycle-0 P2, still correct not to route). | P2 |
| S6 `power_swings_both_ways` | Y | Y | Y | Y | Y | `U_max` subscript fixed; `U = ½Cv²` no longer appears here. | P2 |
| S7 `nothing_consumed` | Y | Y | Y | Y | Y | Excellent null beat, all five HUD lines exact. `U/U_max` box clears the pen toolbar by ~3 px — watch, don't fix. | P3 |
| S8 `one_derivative_both_results` | Y | Y | Y | Y | Y | Clean; full Unicode chain; calculus correctly confined here (38c). Dim now restores on exit. | P3 |
| S9 `ac_capacitor_sandbox` | Y | Y | **Y** ↑ | Y | Y | Ships **bright**; `iₘ` present; formula core-only (38b clean). C thumb 0.1289 vs physics 0.1273. | P3 |

↑ improved from cycle 0 · ↓ regressed from cycle 0

---

## 5 · Routing

### `alex:json_author`
**J1b (P1)** — `tangent_stop_3` unbound → static 6000 ms races cue-armed stops at 7310/13408 ms; PRIMARY AHA captions run out of taught order in the live player. Rewrite `s4_4` to narrate the steepest-fall beat **and** carry `scenario_cue: "tangent_stop_3"` (restoring `skeleton.md:119`); trim `s4_1`. Worked example lands at 52 w. Do **not** re-bind the cue without rewriting the text — that recreates the cycle-0 defect.

Not routed, deliberately: J2's missing "the geometry is identical" half and J3's residual step offset. Both P3; J3's imprecision was mine.

### `peter_parker:renderer_primitives` → `engine_queue`, `FIX(engine)`
**BLOCKING — E11 charge-glyph polarity.** `:27169–27170` (opacity), `:27191` + `:25984` (colour). Both pools simultaneously at |q|-proportional opacity; top colour = sign(q), bottom = −sign(q). Re-review on S3 frozen + `STATE_3__dense_t03000.png`. No ride-alongs this cycle.

**PRIME DIRECTIVE check.** A cheap content workaround exists for E11 — hide the charge dots again, or narrate around the one-sided picture. Explicitly declined. The Rule-33 micro layer is the thing that makes S3 teach, and the founder would rather wait a cycle for a correct one than ship a fast wrong one. Same call as cycle 0 on E1/E4.

---

## 6 · Scar candidates

Five rows appended to `docs/loop_runs/ch7/_engine/scar_candidates.sql` (trial: files only, never executed) — `field3d_capacitor_charge_glyphs_single_plate_and_sign_locked_colour` (CRITICAL), `review_a_newly_revealed_layer_has_never_been_content_reviewed` (directive), `unbound_one_shot_static_at_ms_races_cue_armed_siblings_in_same_state`, `eye_frozen_candidate_offset_falls_outside_engine_display_band` (probe_definition), `slider_step_grid_offset_when_min_is_nonzero`. Checked against every existing `bug_class` in this run — no collisions.

The directive row is the rubric lesson: **presence is not correctness.** A layer pinned at opacity 0 by a registration bug passes every review vacuously; when the visibility bug is fixed, the layer's *content* enters review for the first time, but the fix gets filed as a closed defect and nobody re-opens it. Written against the reviewer cluster rather than the engine, because it applies to me as much as to quality-auditor and eye-walker.

---

## 7 · Five frames for founder eyes

1. `scratchpad\S3_plates_zoom.png` — q = +0.90 C: red dots on the **top plate only**, bottom bare.
2. `scratchpad\S3_z_03000.png` — same state 3 s later, q = −1.27 C: blue dots on the **bottom plate only**, top bare. **Look at these two together** — that pair is the whole blocking finding.
3. `.visual_runs\ac_voltage_capacitor\20260723-162028\STATE_4__frozen.png` — PRIMARY AHA baseline: false caption gone, `i = C × (slope of v)` plus a live slope chip reading `−4.9 V/s → −0.62 A` against a HUD `i = −0.62 A`.
4. `.visual_runs\ac_voltage_capacitor\20260723-162028\STATE_1__dense_t01000.png` — E3 and E5 provable in one frame: `v = +10.0 V` exactly at t = 1 s (cycle 0: −10.0 V), no i-trace, no `i` HUD line, beads on the wires.
5. `.visual_runs\ac_voltage_capacitor\20260723-162028\STATE_9__frozen.png` — explore reached through S8 in THE EYE's own ordered run: bright, `iₘ = 2.00 A` present, formula core-only. E4 and E8 both landed.

---

## 8 · Self-review

- Every P1 has evidence verifiable in under a minute: two cropped frames for E11; one probe line (`{"cue":"tangent_stop_1","at_ms":7310}`) plus one file:line (`build_review_site.ts:1549`) for J1b.
- **Pass-1 recurrence check ran against all 12 candidate rows plus the three commit-only scars. No recurrences.** Cleared this cycle: `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (E3, verified closed in pixels), `field3d_scenario_declares_bead_element_but_never_builds_the_meshes`, `field3d_dim_apparatus_one_way_with_no_restore_on_state_exit`, `field3d_hardcoded_sprite_label_prespoils_later_state_reveal`, `field3d_latched_phase_claim_caption_persists_past_its_instant`, `field3d_ascii_underscore_subscript_in_secondary_readout`, `field3d_duplicate_formula_surface_sprite_label_vs_formula_overlay`, `canvas_graph_label_collides_with_peak_reference_line`, `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (code-verified), `field3d_child_mesh_never_registered_in_sceneobjects_so_updater_never_matches` (visibility closed — but see E11: closing it exposed a content defect), `field3d_createtubeline_undefined_field_lines_throws`, `field3d_readout_hud_emits_untaught_ring_quantity`, `field3d_sliders_panel_top12_vs_fsbtn_top10`, `field3d_canvas_caption_text_not_cleared_between_sequential_reveals`.
- The one FIX finding names exactly one `alex:*` owner; the one `peter_parker:*` finding sits in `engine_queue` as blocking `FIX(engine)`. **No agent was dispatched by this report.**
- PRIME DIRECTIVE re-check: declined the content workaround for E11 and the cheap "just re-bind the cue" for J1b (which would restore the cycle-0 false binding). No routing rewritten after the check.
- Rule 38 re-checked in full: 38a rings contiguous and the advanced+extended cut is now **coherent** — E8's `iₘ` on S9 restored the observable `skeleton.md:214` rests on (cycle-0 P2, closed); 38b explore core only; 38c degrees in core/extended, calculus and radians confined to S8; 38d clean; 38g unchanged.
- Rule 39 re-checked: `⚙ Widgets` panel present in the live player; new overlays are canvas-drawn inside an already-declared pane, so no new discovery registration needed.
- **No P1 lowered to reach a verdict, and one grade raised** (S3 `correct_YN` Y→N). J3 downgraded to a note with its imprecision recorded as mine, not the fixer's — a correction that cuts against my own cycle-0 report and belongs in the record.
- Cycle 1→2; one cycle of budget remains after this.
