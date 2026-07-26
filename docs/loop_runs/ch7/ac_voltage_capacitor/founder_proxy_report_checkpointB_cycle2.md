# founder-proxy — Checkpoint B (build gate) — `ac_voltage_capacitor` (Ch.7 #3, **cycle 2**)

## VERDICT: `APPROVE` — authoring sign-off only, proceeds to Checkpoint C

Both routed findings are genuinely closed, each verified by re-deriving the evidence rather than reading the fixers' claims. E11's charge layer now shows equal-and-opposite charge on facing plates at every instant, recolouring in place across the sign flip — the "charge crosses the gap" composite is gone, `s3_3`'s narration and the picture agree, and S3 returns to `correct_YN = Y`. J1b's third tangent stop is cue-bound: the live player posts all three cue times and the captions make their **first** appearances in taught order — climb 7600 ms, crest 12608 ms, fall 17664 ms — where cycle 1 had the fall firing at 6000 ms during `s4_1`. Zero authoring P1s, zero unresolved Pass-1 recurrences, zero unresolved blocking engine findings. Six P3 notes ride along.

No orchestrator-verified fact proved false. Re-ran the sibling grep independently: `git show 219937d -U0 | grep -Ec "acr_|acl_|ACR_|ACL_"` = **0**, one file, 32/16. Concept md5 `03ea328a47cc04ee09a9b9ca363e09bc` matches; renderer mtime 16:41 precedes THE EYE run 16:55; the served `review-site/ac_voltage_capacitor/sim.html` (17:08) contains `var chOpacity = Math.min(1, chargeGlyphFrac * (1 + 0.5 * chGlowP));` — the fix is in the build probed. The one surviving `ACC_CHARGE_TOP_HEX` string in the bundle is inside an explanatory comment, not code.

---

## 1 · E11 charge-glyph polarity: **CLOSED**, verified in pixels at four phases

`.visual_runs/ac_voltage_capacitor/20260723-165513/`:

| instant | HUD | plates now show | cycle 1 showed |
|---|---|---|---|
| `STATE_3__frozen.png` | `v = +7.1 V`, `q = +0.90 C` | **red top AND blue bottom, together** | red top only, bottom bare |
| `STATE_3__dense_t01000.png` | crest | red top AND blue bottom, full density | — |
| `STATE_3__dense_t02000.png` | v ≈ 0 | **both pools empty simultaneously** | — |
| `STATE_3__dense_t03000.png` | `v = −10.0 V`, `q = −1.27 C` | **blue top AND red bottom** — the pair swapped | blue bottom only, top bare |

Read as a sequence that is the whole finding: the two clouds sit on their own plates permanently, fade to nothing together at the zero crossing, and return with colours exchanged. Nothing ever appears on one plate and later on the other. Red is positive in both configurations.

**Verified three ways the probe report did not cover:**

- **Equality is structural, not measured.** `:27183–27186` — `var chOpacity = …; var topOpacity = chOpacity, botOpacity = chOpacity;`. The per-pool asymmetry is not retuned, it is *unrepresentable*. This is why the engine agent's threshold-tuning disclosure (0.15 → 0.35) is moot rather than worrying: with a single shared expression there is no threshold at which the pools can differ. A fix that kept two separate expressions would have been graded far more sceptically.
- **The pools are geometrically paired.** Build loop `:26433–26446`: one `topDot` and one `botDot` per `ACC_DOT_GRID` cell at *identical* `(dx, dz)`. Every red dot has a blue partner directly below it. Equal counts are guaranteed at build time — "equal and opposite on facing plates" is the geometry, not an inference.
- **`chargeSign` is the physical sign.** `:27108–27109` — `chargeGlyphFrac = |sin θ|`, `chargeSign = (sin θ ≥ 0) ? 1 : −1`, and `q = q_max sin θ`. The palette is keyed on the sign of the charge, as claimed.

**Confirmed in the live player too.** `.founder_runs/…/S3_t0|mid|late.png` show red-top / blue-top / red-top across the state; the explore-state drag `explore_acc_C_slider_before|after.png` gives an independent sign check under real input: at `v = −17.5 V` top is blue and bottom red; at `v = +17.9 V` they are red and blue. The convention holds under a trusted drag, in the state where the teacher is free to break it.

**Scope re-verified independently.** Both hunks sit inside the `ACC_` block — `:25990` is among the `ACC_*` constants beginning after `applyAcInductorGlow` ends at `:25820`; `:27157–27208` is inside `updateAcCapacitorFrame`, closing before `applyAcCapacitorGlow` at `:27302`. `ACC_CHARGE_POS_HEX`/`NEG_HEX` have exactly four references, all inside these hunks.

E7 is preserved — `chGlowP` enters the shared opacity identically, colour lerp untouched — and cycle 1's code-only PASS on E7 is now **upgraded to pixel evidence**: `L_8100.png` shows the S4 graph pane carrying a visible yellow glow halo while `glow: "tangent"` is active.

## 2 · J1b tangent-stop cue binding: **CLOSED**, verified by re-probing the live player

All three cues now posted on `SET_STATE`:

```
[{"cue":"tangent_stop_1","at_ms":4805},
 {"cue":"tangent_stop_2","at_ms":10903},
 {"cue":"tangent_stop_3","at_ms":17648}]
```

Cycle 1 posted only two; `tangent_stop_3` fell through `cueTriggerMs` to a static 6000 ms and jumped the queue.

Rather than argue from cue times, instrumented `CanvasRenderingContext2D.prototype.fillText` inside the sim frame and recorded every stop caption actually drawn, stamped with `PM_simTimeMs`, across a 26 s live playthrough using the real Play button:

| caption | draw windows (ms) |
|---|---|
| `steepest climb → i peak` | **7600–8384**, 11600–12384, 15616–16400, 19616–20400, 23616–24384 |
| `flat crest → i=0` | **12608–13392**, 16608–17392, 20608–21392, 24608–25392 |
| `steepest fall → i trough` | **17664–18400**, 21616–22400, 25616–26384 |

First appearances 7600 / 12608 / 17664 — strictly taught order, each inside its own sentence window (4805–10903, 10903–17648, 17648–end). `steepest fall` cannot appear before 17664, the exact inversion cycle 1 caught. Two further properties fall out of the same log, closing prior scars with fresh evidence: each label draws in ~780 ms bursts matching `ACC_STOP_BAND = π/5` at f = 0.25 Hz (2·36°/360° · 4000 ms = 800 ms), so nothing latches; and no two windows overlap, so only one label is ever composited.

**`s4_4` genuinely narrates the beat.** *"Falling steepest now — current dives to its trough. Drag peak voltage: tangents steepen, the lead never moves."* The steepest-fall claim leads, the drag prompt follows — a cue bound to a sentence opening with a drag prompt would have recreated the cycle-0 mis-binding under a new name. Confirmed live in `#capStrip` at t = 17760. S4 totals 52 words (9/11/14/18); all states inside 25–55 (S1 54, S2 54, S3 53, S4 52, S5 54, S6 53, S7 47, S8 51).

One artifact recorded so it is not later mistaken for a defect: a screenshot at nominal t = 8160 shows `v = +7.0 V, i = +1.42 A` and no stop caption, seemingly inconsistent with the climb caption drawing at 7600–8384. It is screenshot latency — `v = +7.0 V` corresponds to t ≈ 8480, past the band end at 8384. The slope chip in that frame reads `slope 11.2 V/s → i = C × slope = 1.42 A` against HUD `i = +1.42 A`, internally exact. The `fillText` log, not the screenshot, is the authoritative timing evidence.

## 3 · Pass 1 — recurrence check (all 17 candidate classes + 3 commit-only scars). **No recurrences**

Re-checked with evidence, not asserted: `field3d_capacitor_charge_glyphs_single_plate_and_sign_locked_colour` (closed, §1) · `unbound_one_shot_static_at_ms_races_cue_armed_siblings_in_same_state` (closed, §2) · `field3d_latched_phase_claim_caption_persists_past_its_instant` (fillText log — bounded 780 ms bursts) · `field3d_canvas_caption_text_not_cleared_between_sequential_reveals` (no overlapping windows) · `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (`STATE_4__frozen.png`: v = −9.5 V, i = −0.62 A; closed form at θ = 251.7° gives 10 sin θ = −9.50, 2.00 cos θ = −0.63 — pure function intact) · `field3d_child_mesh_never_registered_in_sceneobjects_so_updater_never_matches` (dots render) · `field3d_dim_apparatus_one_way_with_no_restore_on_state_exit` (S9 ships bright) · `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (**upgraded to pixel evidence**) · `field3d_duplicate_formula_surface_sprite_label_vs_formula_overlay` · `field3d_ascii_underscore_subscript_in_secondary_readout` (`iₘ`, `vₘ` real subscripts) · `canvas_graph_label_collides_with_peak_reference_line` · `field3d_sliders_panel_top12_vs_fsbtn_top10` (HUD y ≈ 65, "Full screen" y ≈ 25) · `field3d_readout_hud_emits_untaught_ring_quantity` (S4 HUD = v, i, iₘ only) · `field3d_createtubeline_undefined_field_lines_throws` (tubes render, zero console errors) · `field3d_hardcoded_sprite_label_prespoils_later_state_reveal` · `phase_anchored_caption_authored_as_wallclock_at_ms` (fully cue-bound) · the three directive rows — all applied in this review; `review_a_newly_revealed_layer_has_never_been_content_reviewed` is why §1 verified the layer's *content* three ways rather than accepting "the fix landed".

Still OPEN, known and accepted, neither a screen defect: `eye_frozen_candidate_offset_falls_outside_engine_display_band` (gate coverage, not pixels) and `slider_step_grid_offset_when_min_is_nonzero` (`valueBefore: "0.1289"` vs physics 0.1273, 1.26 %, both render `0.13 F`).

Trial-mode constraint noted honestly: this pass ran against the 17-row `scar_candidates.sql` corpus plus three commit-only scars, not a live `engine_bug_queue` query — the trial's scars are files and no read-only DB path was available in this dispatch.

## 4 · Fresh founder_drive + machine gates

`.founder_runs/ac_voltage_capacitor/2026-07-23T15-08-36-196Z/manifest.json`: 9 states, 27 shots, `overlayCollisions: []`, `flags: []`, `consoleErrors: []`, `motionProbe.bytesEqual: false` (Rule 37 — explore alive after narration end), 8/8 drags `moved: true` / `reverted: false`. The 26 s live playthrough and 5-pin probe also logged zero console errors.

Explore physics re-derived from the drive frames: C 0.1289 → 0.3575 F takes iₘ 3.60 → 10.11 A; vₘωC = 18 × 2π(0.25) × 0.3575 = 10.11 A. Exact.

---

## 5 · Per-state review table

| state | correct | order_ok | labels | reads_sound_off | clearly_diff | problem_or_missing | prio |
|---|---|---|---|---|---|---|---|
| S1 `capacitor_joins_the_circuit` | Y | Y | Y | Y | Y | Charge picture now correct on both plates. Nothing outstanding. | — |
| S2 `current_leads_quarter_cycle` | Y | Y | Y | Y | Y | Ghost + bracket + legend remain the strongest beat in the sim. | — |
| S3 `plates_fill_and_push_back` | **Y** ↑ | Y | Y | Y | Y | **Restored from N.** Both pools simultaneous, \|q\|-proportional, sign-keyed. At q<0 blue top dots sit against sign-recoloured tubes (#42A5F5 vs #1E88E5) — legible, but the tightest hue pair on screen. | P3 |
| S4 `current_copies_the_slope` **(PRIMARY AHA)** | Y | Y | Y | Y | Y | Captions true *and* in taught order live. Frozen baseline still carries no stop caption (gate coverage only — slope chip carries the claim exactly). | P3 |
| S5 `reactance_falls_with_frequency` | Y | Y | Y | Y | Y | `s5_3`'s "starves" still has no micro evidence; unchanged from cycle 0, still correct not to route. | P2 |
| S6 `power_swings_both_ways` | Y | Y | Y | Y | Y | Clean. | — |
| S7 `nothing_consumed` | Y | Y | Y | Y | Y | `U/U_max` box clears the pen toolbar by ~3 px; drive reports 0 collisions. Watch, don't fix. | P3 |
| S8 `one_derivative_both_results` | Y | Y | Y | Y | Y | Calculus correctly confined to the advanced ring. | — |
| S9 `ac_capacitor_sandbox` | Y | Y | Y | Y | Y | Charge-glyph density normalized to `q_max`, so it does not respond to the C slider (§6). C thumb 0.1289 vs physics 0.1273. | P3 |

↑ restored from cycle 1

## 6 · Findings — all P3, none routed (cycle 3 not required)

Graded from scratch; none is a previously-higher grade lowered to reach APPROVE.

1. **P3 · S9 · the plate micro-picture is invariant to the C slider.** `chargeGlyphFrac = |sin θ|` is normalized to `q_max` and the dot grid is fixed at build time, so C 0.13 → 0.36 F leaves the plates pixel-identical while iₘ goes 3.60 → 10.11 A. This is the closest call in the report, because it pattern-matches the rubric line about an instrument normalized by the quantity it claims to teach — so the test applied is whether anything *on screen* is thereby made false. Nothing is: S9's HUD carries `v`, `i`, `iₘ` and **no `q`**, no narration claims the glyph count shows absolute charge, and the representation is honestly a fill-fraction gauge ("plates fill and empty"), which is what S3 teaches and what S5's frequency-independence claim needs. A teacher dragging C sees the current respond, not the charge. Recorded as a candidate ride-along for the founder's chapter-end engine queue — showing more charge would need a variable dot count, i.e. a new primitive — deliberately **not** routed on the last cycle for a state whose screen tells no lie.
2. **P3 · S3 · hue proximity at q < 0.** Negative dots `#42A5F5` against field tubes sign-recoloured to `#1E88E5` (`:27149`). Distinguishable (brighter, rounder caps), and it is the pre-existing tube palette, not anything E11 introduced.
3. **P3 · S3/S9 · field tubes carry no arrowheads**, so the field's reversal reads as a hue change rather than a direction change. Pre-existing; no state asserts a field direction, so nothing false is claimed.
4. **P3 · S9 · `s9_1` says "watch the lead … respond live"** where the taught fact (`s4_4`) is that the lead never moves. Defensible as an invitation to try to break it — a teacher who drags every slider and watches the bracket hold at ¼ cycle has learned exactly the right thing. Wording taste, not a contradiction.
5. **P3 · S1/S3 · `skeleton.md:91`'s "the geometry is identical" reassurance** still absent; "demo-scale" survives only as a stacked adjective. Carried unchanged from cycle 1.
6. **P3 · S9 · C slider step grid**, 0.1289 vs physics 0.1273 (exact step `0.01455` given `min = 0.04`). The cycle-0 prescription's arithmetic error was mine; that stays on the record.

**No FIX routing this cycle. No `engine_queue` entries.**

**PRIME DIRECTIVE check.** The only item where an engine fix and a content workaround diverge is finding 1, and no content workaround was routed for it either — nothing was routed, because the sim's screen is correct as it stands. Had `q` appeared in S9's HUD this would have been a `FIX(engine)` ride-along rather than a note; that is the exact hinge, written down so the judgement can be overturned by the founder rather than reconstructed.

**Rule 38 re-checked in full.** 38a rings unchanged, advanced block contiguous before explore, reduced cut still coherent (E8's `iₘ` on S9 remains the observable `skeleton.md:214` rests on). 38b explore surfaces core-ring only. 38c `s4_4`'s rewrite is plain-language, algebra-only — ladder undisturbed; calculus and radians confined to S8. 38d clean. 38g unchanged. **Rule 39** re-verified in pixels: ⚙ Widgets panel present on both S4 and S9; charge glyphs are 3D meshes inside the already-declared `acc_charge` element (`userData.elementType = "acc_charge"` on both pools, `:26429/:26432`), so E11 added no new overlay needing discovery registration.

---

## 7 · Scar rows (files only — never executed)

Two status flips, not new classes — the engine agent's proposed `field3d_charge_pool_polarity_pinned_to_plate_not_sign` would duplicate the cycle-1 row and was not minted. Plus one genuinely new probe_definition generalizing the probe that caught this class twice. Filed in `docs/loop_runs/ch7/_engine/scar_candidates.sql`.

---

## 8 · Five frames for founder eyes

1. `scratchpad\S3f_zoom.png` — q = +0.90 C: red on top **and** blue on bottom, one blue partner directly beneath every red dot. The finding, closed.
2. `scratchpad\S3_3000_zoom.png` — same state 3 s later, q = −1.27 C: the pair swapped, red now on the bottom. **View with (1) and (3) as a set.**
3. `scratchpad\S3_02000.png` — the zero crossing: both pools empty *together*. The frame that proves nothing traverses the gap.
4. `scratchpad\S9_plates_ba.png` — explore state, live player, real slider drag: v = −17.5 V → blue top / red bottom; v = +17.9 V → red top / blue bottom. The convention holds where the teacher is free to break it.
5. `.visual_runs\ac_voltage_capacitor\20260723-165513\STATE_4__frozen.png` — PRIMARY AHA baseline: `v = −9.5 V`, `i = −0.62 A`, slope chip `−4.9 V/s → i = C × slope = −0.62 A`, arrow pointing left, blue top plate. Every number and the charge sign agree at θ = 251.7°.

---

## 9 · Self-review

- Every finding has evidence a founder can verify in under a minute; every cycle-1 P1 has a named artifact proving closure (three frames for E11, one probe log for J1b).
- **No agent was dispatched by this report.** No FIX routing and no `engine_queue` entries this cycle.
- Verified against artifacts, not descriptions, on every claim: re-derived the sibling-isolation grep, the built-bundle contents, the pool build symmetry, the closed-form physics at the frozen instant, and both fixes' behaviour in the live player. The engine agent's threshold-tuning disclosure was checked and found moot for a structural reason rather than accepted on its own account.
- **No P1 lowered to reach APPROVE.** Every P3 in §6 is newly graded, and the one at risk of being an under-grade (finding 1) has its full reasoning and its overturning condition written into the report.
- Rule 38 checked in full; Rule 39 checked in pixels. Per-state table covers all nine states.
- Scar output is two status flips plus one new class, checked for collisions against all 17 existing rows; enums and non-NULL ARRAY literals conform to the live 13-column schema.
- APPROVE is authoring sign-off only: no `visual:approve`, no TTS, no `PILOT_CONCEPTS`, no deploy, no DB write, no merge. Rule 17 untouched — the founder still batch-reviews at chapter end.
- Cycle 2 of 3 closed with a cycle in hand.
