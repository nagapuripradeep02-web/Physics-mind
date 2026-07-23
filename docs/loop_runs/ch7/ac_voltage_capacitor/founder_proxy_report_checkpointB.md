# founder-proxy — Checkpoint B (build gate) — `ac_voltage_capacitor` (Ch.7 #3, cycle 0)

## VERDICT: `FIX` — cycle 1 of 3 · **5 BLOCKING `FIX(engine)`** + **3 `alex:json_author`**

Both reviewers found real defects and both got their headline root cause partly wrong. The physics *authored* in this concept is correct in every number checked — the failures are that a designed visual band was never built, and that the PRIMARY AHA's captions are false on screen for three independent reasons, only one of which either report identified. Two further defects neither reviewer caught, one of which (`dim_apparatus` never restores) means the teacher's explore sandbox ships permanently dimmed in the normal S1→S9 teaching order — founder-visible, in the single state a teacher spends the most time in.

APPROVE is impossible: six P1s, one a **recurrence of a scar marked FIXED one commit ago in this same chapter run** (automatic P1 under the Pass-1 rule).

---

## 1 · Adjudication of the auditor dispute

### 1.1 S4 — quality-auditor RIGHT, eye-walker's root cause REFUTED, **and both fixes incomplete**

**`PM_accPhase` IS reset at state entry** — `field_3d_renderer.ts:26467` (`applyAcCapacitorState`) and `:26418` (`buildAcCapacitor`) both set `window.PM_accPhase = 0; window.PM_accLastT = 0;`. eye-walker's stated mechanism ("the live phase θ is NOT zeroed at state entry") is false as written.

Live probe on the real player (`localhost:8087`), clean forward state entry, offset measured **0.00°**:

```
--- STATE_4 ---   (expected θ = 360·f·t, f = 0.25 Hz)
PIN 1500 {"phaseDeg":133.92,"expectedPhaseDeg":133.92,"offsetDeg":0,"hud":"v = +7.2 V | i = -1.39 A"}
PIN 4500 {"phaseDeg":44.28, "expectedPhaseDeg":44.28, "offsetDeg":0,"hud":"v = +7.0 V | i = +1.43 A"}
PIN 7500 {"phaseDeg":314.28,"expectedPhaseDeg":314.28,"offsetDeg":0,"hud":"v = -7.2 V | i = +1.40 A"}
```

With **zero** phase error the three captions are still false, exactly reproducing quality-auditor's predicted table. So `STATE_4.ac_capacitor.tangent_stops_at_ms = [1500, 4500, 7500]` is simply wrong against T = 4.0 s; `physics_block.md:208-211` specifies t = 0 / 1.0 / 2.0 s. `[4000, 5000, 6000]` is correct and in-budget. **quality-auditor F2 CONFIRMED; routing to `alex:json_author` CONFIRMED.**

**But eye-walker's *observation* is real, with a worse cause.** `PM_accPhase += omegaEff * dt` (`:26822`) is a per-frame **dt-accumulator**. `SET_TIME_FREEZE` (`:36995-36997`) can jump/rewind `time`; an accumulator cannot follow. Probe reproduced a **constant +62.28° offset** persisting after a backward pin. THE EYE's own frames carry it: `STATE_1__dense_t01000.png` reads `v = −10.0 V, i = +0.10 A` (θ ≈ 273°) where ω·t gives θ = 90°, `v = +10.0 V` — the ~183° eye-walker measured, verified in pixels.

This is a **recurrence of `field3d_dt_accumulated_motion_invisible_to_eye_timepin`** (`ad7975b`, 2026-07-22), whose prevention rule reads verbatim: *"All scripted/choreographed motion in a field_3d scenario must be a PURE FUNCTION of absolute PM_simTimeMs… Reserve dt-accumulators strictly for trusted-drag interactive velocity, never for scripted drift."* `ad7975b` fixed the reported *symptom* (`PM_acrTwinBeadAccum`) and left `PM_acrPhase` untouched; the new scenario cloned the unfixed pattern. **quality-auditor's Gate-8 line "`PM_accPhase` reset to 0 on every state entry ✓ complied" is a FALSE CLEAR of an active scar.**

**Third contributor, found by neither reviewer:** the stop caption **latches**. `:26674-26684` sets `activeStopIdx` to the most-recently-fired stop and redraws it every frame after. Even with `[4000,5000,6000]`, caption 3 displays from t = 6 s to the end of a 16 s state (~62%) while v and i complete 2.5 further cycles. `STATE_4__frozen.png`, the canonical H2 baseline, is exactly this case: **"steepest fall → i trough" beside `i = +0.83 A` (positive) with the tangent visibly climbing.** Retiming alone leaves the PRIMARY AHA's own baseline asserting false physics.

> **PRIME DIRECTIVE call:** the fast content fix (retime three integers) is necessary but **not sufficient**. Retime routed to `alex:json_author`; latch + accumulator routed to `peter_parker:renderer_primitives` as **blocking**. A content-only fix ships a PRIMARY AHA false most of the time and arbitrary whenever narration is on (`cueTriggerMs`, `:26676`, overrides `at_ms` with the TTS time — the JSON fix only holds on the TTS-off path).

**Sibling note:** `ac_inductor` labels its stops `["steepest climb","flat crest","steepest fall"]` (`:25537`) — shape descriptions of the traced curve. `ac_capacitor` escalated them to `["steepest climb → i peak","flat crest → i=0","steepest fall → i trough"]` (`:26673`) — assertions about a *second* quantity. That escalation turned an imprecise label into false physics.

### 1.2 Beads — quality-auditor's F1 CONFIRMED; eye-walker produced a **vacuous pass**

`buildAcCapacitor` creates exactly two objects with `elementType: "acc_beads"` — the two **wire tubes** (`:26238`, `:26240`) — and **zero** bead meshes. Both sealed siblings build them with the discriminator the update loop requires:

```js
// sibling, :24291 / :25193
bead.userData = { elementType: "acr_beads", id: "acr_bead_" + wRow + "_" + bi, row: wRow, cell: bi };

// ac_capacitor per-frame loop, :26862 — matches ZERO objects
if (!bu || bu.elementType !== "acc_beads" || bu.row === undefined) continue;
var pt = accWireCellPoint(wy, bu.cell, beadFrac);   // dead code
```

Confirmed in pixels: bare grey tubes in `STATE_1__dense_t01000.png`, `STATE_4__frozen.png`, `STATE_5__frozen.png`, zoomed `STATE_3__frozen.png`, and two live captures. The comment at `:26232-26236` shows the mechanism: the author gave the *wire* the canonical id `acc_beads` so the glow alias would resolve, then never wrote the bead loop — `visible_elements`, the glow resolver and the elementType gate all pass while the animated objects are absent.

**Rubric lesson for the trial:** eye-walker's "Checked clean" list contains *"beads/charge glyphs never cross the plate gap in any zoomed frame"* — a check that passes **vacuously** when the object does not exist. A negative-form check ("X never does Y") must be preceded by an existence assertion ("≥1 X is present"). Filed as a `directive` scar row.

Consequence, verified against the JSON narration: `s1_2`, `s1_3`, `s2_2` (the designated 16a `visual_counter`), `s3_3`, `s5_3` all describe motion not on screen; three carry `glow: beads`, which brightens a static wire.

### 1.3 Remaining quality-auditor findings

| # | Claim | Adjudication |
|---|---|---|
| F3 | S1 pre-spoils S2 | **CONFIRMED, both halves.** `createLabelSprite("i (leads v by ¼ cycle)")` hardcoded at `:26334` on `acc_arrow_lbl`; `acc_arrow` is in **every** state's `visible_elements`. i-trace gate `:26602` → draws from t=0 in S1; HUD `i =` ungated (`:26944`). Visible in `STATE_1__dense_t01000.png`. Real regression of OPEN scar `teach_do_not_prespoil_a_later_reveal`. |
| F4 | `U_max` literal underscore | **CONFIRMED in pixels** (`STATE_6/7__frozen.png`). `:26965` emits `"<div>U_max = "` while `:26956` correctly emits `q<sub>max</sub>`. The compose routine `accComposeSegments` (`:26086`) is a closed whitelist `/(X_C|v_C)/g` and could not handle `_max` — but this readout never calls it. Same *class* as the `X_C` convention, different *mechanism*. |
| F5 | 3 glow beats are no-ops | **CONFIRMED.** `:26991` `continue`s on `acc_efield`/`acc_charge`; `brightenOnly=true` → `touchOp=false`, peers never dimmed (`:2233-2247`). Focal on either key changes **nothing anywhere** (`s3_2`, `s3_3`, `s7_2`). **The `acc_charge` exemption interpretive call was CORRECT** — its colour/opacity are rewritten every frame (`:26894-26899`). Fix is a multiplier on the live channel, not removing the exemption. |
| F6a | No idealization / demo-scale clause | **CONFIRMED.** Regex over all 29 `text_en` → one incidental hit. f = 0.25 Hz and C = 0.127 F ship unexplained. |
| F6b | S4's own number never rendered; no `iₘ` marker | **CONFIRMED.** `slopeNow` (`:26654`) drives only the tangent angle. Rule 33c requires the micro story expose a real number. |
| F7 | On-graph `X_C` struck through | **CONFIRMED in pixels** (`STATE_5__frozen.png`). Canvas-internal → invisible to founder_drive's DOM probe (`overlayCollisions: []`) — a genuine harness blind spot. |
| F8 | `C` default off the step grid | **CONFIRMED.** thumb 0.12 / label 0.13 / physics 0.1273. LOW. |
| F9 | S5 ramp outlives its budget | **Arithmetic confirmed** (17 s vs `duration: 15`). **Harm NOT supported** — `STATE_5__frozen.png` holds the pre-ramp picture, and `duration` does not drive timeline end. **Downgraded to P3 advisory; do not spend a cycle.** |

### 1.4 eye-walker Finding 2 (S9 missing `iₘ`) — real, and more load-bearing than eye-walker realised

Skeleton §3 line 111 specs "HUD (v, i, iₘ) tracks"; §10(i-2) line 216 the same; and the **38a reduced-cut coherence argument at line 214 rests on it**. With `iₘ` absent the advanced+extended cut loses the observable that makes it coherent. Both reviewers found this from different directions; both right. **P2.**

---

## 2 · Findings neither reviewer caught

### 2.1 **P1 — `dim_apparatus` is a one-way, session-permanent dim**

`:26517-26523` sets `opacity = 0.45` on every `acc_*` object (except `u_gauge`/`meter`) when `d.dim_apparatus` is true. There is **no `else` branch** and nothing restores it. The per-frame update only rewrites `acc_efield`/`acc_charge` opacity — so field bars and charge glyphs recover, and **the source, both wires, both plates, the arrow and every sprite label stay at 0.45 for the rest of the session.**

Proved live, same phase in both captures (`v = +7.1 V, i = −1.41 A`):

| | source ring | wires / plates | charge glyphs |
|---|---|---|---|
| `S9_fresh.png` (S8 never visited) | bright gold | full brightness | dim |
| `S9_after_S8.png` | dull olive | visibly darkened | **bright** (live-driven, recovers) |
| `S1_after_S8.png` | dull olive | visibly darkened | bright |

P1 not cosmetic: **in the normal teaching order the teacher always reaches S9 through S8**, so the dimmed sandbox is the *default* experience. Rule 25d revisits are dimmed too. Rule 29 makes brightness the only emphasis channel, so a permanently 0.45 apparatus destroys glow dynamic range for the session. THE EYE missed it because it captures in order and minted S9's baseline *with* the bug; eye-walker has no cross-state-order model; quality-auditor read S8 and S9 each as ✓ without comparing S9's brightness against S1's.

**The identical one-way dim exists at `:25402` in the sealed `ac_voltage_inductor`.**

### 2.2 **P2 — `U = ½Cv²` printed on two surfaces at S7 (Rule 34b)**

`STATE_7__frozen.png` shows the Cambria-Math overlay `⟨p⟩ = 0 / U = ½Cv²` **and** the U-gauge sprite `stored energy U = ½Cv²` (`:26369`). Also appears at S6, where the authored surface is `p = v·i` — a state before the design introduces it. Sibling `:25268` does the same with `½Li²`.

---

## 3 · Per-state review table

| state | correct | order_ok | labels | reads_sound_off | clearly_diff | how_i_would_use | problem_or_missing | prio |
|---|---|---|---|---|---|---|---|---|
| S1 `capacitor_joins_the_circuit` | Y | Y | Y | **N** | **N** | "Same source as last lesson — I've swapped the coil for two plates." | The two plants the narration promises **do not exist** — no beads. S2's answer already printed above the apparatus + amber i-trace from t=0. | **P1** |
| S2 `current_leads_quarter_cycle` | Y | Y | Y | Y | **N** | "The dashed curve is the coil's rhythm. Watch the real one arrive *early*." | Ghost/bracket/arrow work beautifully — but the 16a beat `s2_2` has no visual counter, so the misconception fight reduces to two curves. Delta vs S1 weak because S1 already showed it. | **P1** |
| S3 `plates_fill_and_push_back` | Y | Y | Y | Y | Y | "Zoom in: at the zero crossing current is maximum, `q` is nearly nothing." | Cleanest state — `v=+0.5 / i=+2.00 / v_C=+0.5 / q=+0.06 C` all exact, `q` clear of HUD. Only gap: no bead to stop at the plate. | P2 |
| S4 `current_copies_the_slope` **(PRIMARY AHA)** | **N** | Y | Y | **N** | Y | "Forget how *big* the voltage is — look at how *fast* it's changing." | Three captions assert facts at instants where they're false (two sign-inverted); caption then latches and stays false, including in the frozen baseline. The state's own number never drawn. `tangent_stop_3` fires under `s4_4`, a drag prompt. | **P1** |
| S5 `reactance_falls_with_frequency` | Y | Y | Y | Y | Y | "Same capacitor, faster swing — watch the envelope swell and X_C drop." | Genuinely good. Two blemishes — on-graph `X_C` struck through by the vₘ line; `s5_3`'s "starves" micro evidence absent. | P2 |
| S6 `power_swings_both_ways` | Y | Y | Y | Y | Y | "Multiply the two curves. Positive = storing, negative = paying back." | `U_max` literal underscore. `U = ½Cv²` on the gauge a state before its authored home. | P2 |
| S7 `nothing_consumed` | Y | Y | Y | Y | Y | "Current is clearly flowing. Now look at the wattmeter — dead at zero." | Excellent null beat. Same `U_max` underscore; `U = ½Cv²` duplicated. | P2 |
| S8 `one_derivative_both_results` | Y | Y | Y | Y | Y | "One differentiation of q = Cv, and both results fall out." | Clean, full Unicode, correct dim-and-hold, scope keeps moving. **But leaving this state permanently dims the apparatus for the session.** | **P1** |
| S9 `ac_capacitor_sandbox` | Y | Y | **N** | Y | Y | "All yours — drag peak voltage, frequency, capacitance." | Ships **dimmed** whenever reached in teaching order. HUD missing `iₘ`. C slider label 0.13 vs thumb 0.12 vs physics 0.1273. Ring gate (38b) otherwise clean. | **P1** |

Rule 37 verified alive: `motionProbe.bytesEqual: false`; all 8 trusted drags moved, none reverted.

---

## 4 · Routing

### `alex:json_author` (FIX — content)

| id | sev | what | fix |
|---|---|---|---|
| **J1** | **P1** | S4 stops at wrong phase; `tangent_stop_3` bound to a drag prompt | `tangent_stops_at_ms: [4000, 5000, 6000]`; re-bind stop 3 |
| **J2** | **P2** | No idealization / demo-scale clause anywhere in 29 sentences | Add both; S1 has 9 words headroom |
| **J3** | **P3** | `C` slider 3-way mismatch | `step: 0.0127` (keeps X_C exactly 5.00 Ω at default) |

### `peter_parker:renderer_primitives` → `engine_queue`, `FIX(engine)`

**BLOCKING:** E1 beads never built · E2 caption latch · E3 phase accumulator (scar recurrence) · E4 `dim_apparatus` one-way · E5 S1 pre-spoil.
**RIDE-ALONG:** E6 `U_max` · E7 glow no-ops · E8 `iₘ` marker + S4 slope readout · E9 `X_C` collision · E10 duplicate `U = ½Cv²`.

Full defect/expectation/probe table for E1–E10 is in the dispatch prompt and the engine log's Stage 3 fix entry.

### Not a finding
- **F9 (S5 ramp budget)** — arithmetic true, harm unproven, frozen frame contradicts the predicted symptom. P3 advisory.
- **`confusion_cluster_registry`** — N/A-DORMANT, correctly dispositioned by quality-auditor.
- **Orchestrator-verified facts** — none found false. `tsc`/`validate`/`check:renderer-syntax` accepted as stated; DF1 scope claim independently confirmed consistent with the `acr_`/`acl_` blocks.

---

## 5 · Sealed-sibling contamination — evidence for the founder at Checkpoint C

eye-walker raised this against the wrong mechanism. The correct answer: **the phase-reset story contaminates nothing, but three other things do.** Not reopening sealed work — this is evidence, not a verdict.

1. **`ac_voltage_inductor` STATE_4 has no `tangent_stops_at_ms`**, so it uses the engine default `[1500,4500,7500]` (`:25536`) at f = 0.25 Hz. Its correct stops are t = 1.0/2.0/3.0 s. **t=4.5 s labels "flat crest" while i climbs at 71% of max — qualitatively wrong.** Less severe than the capacitor (its labels claim nothing about a second quantity), but 1 of 3 is wrong.
2. **`dim_apparatus` one-way dim exists identically at `:25402`** → the inductor's sandbox and every revisited state ship dimmed after its S8. Same P1 severity, same default order.
3. **`PM_acrPhase` / `PM_aclPhase` are the same unfixed dt-accumulator** → both siblings' frozen baselines are minted at an arbitrary phase and fail rewind-determinism.
4. Minor: `stored energy U = ½Li²` sprite (`:25268`) — same Rule-34b duplication risk.

**Recommendation:** E3 and E4 are renderer-level invariants (Rule 36/37/39 shape) — fix them **once, generically**, and both siblings inherit at near-zero marginal cost. Item 1 is a three-integer change to a sealed file and should be a deliberate founder call, not a loop action.

> **Orchestrator disposition (2026-07-23):** both fix dispatches were scoped to the `acc_`/`ac_capacitor` instances ONLY. Sealed-sibling code is untouched pending the founder's chapter-end decision. This preserves the DF1 guarantee and keeps "reopen sealed work" a human call.

---

## 6 · Scar candidates

Filed as SQL text (trial: files only, never executed) in `docs/loop_runs/ch7/_engine/scar_candidates.sql`, block "Ch.7 Stage 3 · 2026-07-23 · founder-proxy Checkpoint B (ac_voltage_capacitor)" — one `UPDATE` reopening `field3d_dt_accumulated_motion_invisible_to_eye_timepin` plus 11 `INSERT`s (9 `incident`, 2 `directive`).

**Schema note:** both upstream reports emitted SQL that **would not INSERT** — eye-walker used non-existent columns `concept_id`/`notes` and omitted 5 required columns; quality-auditor used a non-existent `description` column and omitted 3. Rows were re-authored to the live 13-column schema. Filed as the `directive` row `scar_candidate_sql_authored_outside_the_live_column_list`.

---

## 7 · Five frames for founder eyes

1. `.visual_runs\ac_voltage_capacitor\20260723-141651\STATE_4__frozen.png` — the PRIMARY AHA's own baseline: "steepest fall → i trough" beside `i = +0.83 A`, tangent climbing. Also shows the bare, beadless wires.
2. `scratchpad\S9_fresh.png` — the explore sandbox as designed: bright source, bright apparatus.
3. `scratchpad\S9_after_S8.png` — **the same state at the same phase after playing S8**: everything dimmed except live-driven glyphs. What a teacher actually gets.
4. `.visual_runs\ac_voltage_capacitor\20260723-141651\STATE_1__dense_t01000.png` — S1 already printing "i (leads v by ¼ cycle)" with the full amber i-trace, bare wires where narration promises charges at full flood.
5. `.visual_runs\ac_voltage_capacitor\20260723-141651\STATE_7__frozen.png` — the good news (dead ⟨p⟩ needle, full gauge at the v-crest, cold plates) alongside `U_max` with a literal underscore and `U = ½Cv²` printed twice.

---

## 8 · Self-review

- Every P1 has evidence verifiable in under a minute: a file:line, a probe line, or a named frame.
- Pass-1 recurrence check ran against all 11 rows in `scar_candidates.sql` plus the two commit-only scars. **RECURRED:** `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (→P1), `field3d_rms_subscript_ascii_in_renderer_text_paths` (same class →E6), `teach_do_not_prespoil_a_later_reveal` (→E5), `ecp_glow_targets_missing_primitives` (same class →E7). **Clean:** `field3d_canvas_caption_text_not_cleared_between_sequential_reveals` (the `clearRect` pattern WAS correctly cloned at `:26681`), `field3d_hud_label_clipped_by_readout_box`, `field3d_readout_hud_emits_untaught_ring_quantity` (S9 core-only verified), `field3d_createtubeline_undefined_field_lines_throws` (`field_lines` authored), `field3d_sliders_panel_top12_vs_fsbtn_top10` (`top:52px`). **Partially violated:** `field3d_new_scenario_engine_ask_precision_checklist` — the bead pool was in the ask and not built.
- Every FIX finding names exactly one `alex:*` owner; every `peter_parker:*` finding sits in `engine_queue` as `FIX(engine)`, never in FIX routing. **No agent was dispatched by this report.**
- PRIME DIRECTIVE re-check: explicitly declined the cheap content-only resolution of S4, because it leaves the PRIMARY AHA false in its own baseline and arbitrary on the TTS path. Same call on E4 and E1 — no JSON workaround accepted.
- Rule 38 checked in full: 38a rings contiguous and both cuts coherent *except* the S9 `iₘ` gap weakening the reduced-cut argument (folded into E8); 38b explore core-only verified; 38c notation ladder holds; 38d dialect clean; 38g CBSE verified, six other cells `needs_teacher_verification: true`.
- Rule 39 checked: new DOM overlays use inline `position:fixed`, slider rows follow `acc_<name>_row`, no new particle_field canvas HUD.
- No P1 lowered to reach a verdict. Cycle 0→1, two cycles of budget remain.
