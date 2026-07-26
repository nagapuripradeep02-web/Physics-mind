# QUALITY AUDITOR REPORT — `ac_voltage_capacitor` (Ch.7 #3/8)

**Run:** 2026-07-23 · branch `feat/ch7-alternating-current` · CHAPTER_LOOP trial (no DB writes, no visual:approve, no TTS, no deploy)
**Artifacts:** `src/data/concepts/ac_voltage_capacitor.json` · `docs/loop_runs/ch7/ac_voltage_capacitor/skeleton.md` · `.../physics_block.md` · `.visual_runs/ac_voltage_capacitor/20260723-141651/` · `.founder_runs/ac_voltage_capacitor/2026-07-23T12-18-50-831Z/` · engine `21e1f0f` (`acc_` block, `field_3d_renderer.ts` L25847–27004)

# VERDICT: **FAIL**

Two BLOCKING findings, one MAJOR, three MODERATE, three LOW. The physics in the engine is **correct in every particular checked** (lead, falling reactance, store-first power, all locked numbers). The failures are that (a) the entire charge-carrier micro band the narration keeps describing **was never built**, and (b) the PRIMARY-AHA state's three teaching captions fire at phases where their claims are **false**.

**Routing (one owner per finding; engine first — F1 changes every frame):**
1. `peter_parker:renderer_primitives` — F1 (blocking), F3, F4, F5, F6b, F7
2. `alex:json_author` — F2 (blocking), F6a, F8, F9

Re-run `visual:eyes` and re-audit after both land.

## Orchestrator claims — spot-checked, all TRUE

| Claim | Evidence |
|---|---|
| `validate:concepts` PASS, zero WARN on this file | ran it: `PASS        ac_voltage_capacitor.json`; no WARN line carries this filename |
| Zero console/page errors | founder_drive manifest: `consoleErrors: []`, `pageErrors: []`, `flags: []` |
| Sealed siblings untouched | `git show --stat 21e1f0f` = 2 files; `acr_`/`acl_` code intact at L24291/L25193/L25536 |
| `X_C`/`v_C` convention deliberate + correct | verified: composed subscript renders in every S3/S5 frame; no literal underscore, no side-by-side `XC` (see Gate 3g#6) |

---

## GATE RESULTS

### Gate 0 — Definition of Done — ✗
Skeleton §10 present, zero TBDs ✓. Against the JSON + frames:

| DoD row | Result |
|---|---|
| (a) 9 states, ids as named, contiguous | ✓ `state_count: 9`, STATE_1–STATE_9 |
| (b) `vₘ` line, `v`/`i` HUD, ghost + legend, lead bracket + time-order arrow, `q` annotation, `v_C`, `X_C`, `q_max`, `p`, U-gauge, `⟨p⟩` meter | ✓ all present and correctly gated (Gate 4) |
| (b) `iₘ` marker on the i-trace | **✗ absent** — `accDrawViGraph` draws only `show_vm_peak_line`; S9 HUD is `v`/`i` only vs the declared `v/i/iₘ` → **F6b** |
| (b) "current + peak … **First: S2**" | **✗** i-trace + `i =` HUD present from STATE_1 → **F3** |
| (b) "ideal — nothing crosses the gap" clause + demo-scale clause | **✗** 0 hits for `ideal\|demo\|slowed\|scaled\|thousands` across all 30 `text_en`; f = 0.25 Hz and C = 0.127 F ship unexplained → **F6a** |
| (d) motion plan, none static | **✗** the bead band carrying S1/S2/S5's motion does not exist → **F1** |
| (e) conceptual-only, 8× `manual_click` + 1× `interaction_complete` | ✓ |
| (f) 6-question assessment + coverage_map + `misconception_watch` at exactly S2/S5/S7 | ✓ |
| (h) canvas budget / overlays disjoint | ✗ minor — on-graph `X_C` struck through by the vₘ line → **F7** |

### Gate 1 — `npx tsc --noEmit` — ✓ (accepted from orchestrator; corroborated — engine + JSON run clean in both the EYE and founder_drive runs)

### Gate 2 — Validator — ✓  `PASS        ac_voltage_capacitor.json`, no bounds WARN on this file.

### Gate 3a — CLAUDE.md §6 mechanical — ✓
Script output: every state `prims=3` (Rule 19); `advance modes distinct: [ 'manual_click', 'interaction_complete' ]` (Rule 15); prerequisites advisory (Rule 23); no `mode_overrides` (Rule 20).

### Gate 3b — mechanical half only (Phase-1 demotion) — ✓
`node src/scripts/check-layout-overlap.mjs` → `✓ no overlaps` on every state. Max `scene_composition.length` = 3 (≪ 12).

### Gate 3c — N/A (no `narrative_socratic` state)

### Gate 3d — E42 nine conditions — ✓
Engine formulas re-derived at L26827–26843 and checked against frames:
- `v = vm·sinθ`, `i = im·cosθ` → **leads by exactly π/2** ✓
- `Xc = 1/(ωC)`, `im = vm·ωC` ✓ — S5 dense: f 0.46 Hz → `X_C = 2.7 Ω` (1/(2π·0.46·0.1273)=2.718 ✓); f 0.10 Hz → `12.5 Ω`, envelope 0.80 A ✓ — **falls with frequency** ✓
- `p = (vm·im/2)·sin2θ`, **positive first quarter** ✓ — S6 frame: v=−3.6 V, i=−1.87 A → `p = +6.7 W` (storing) ✓
- `U = Umax·sin²θ` peaks at **v's crest** ✓ (S7: v=−9.9 V → U=6.22/6.36 J)
- ghost = `−im·cosθ` = the inductor's own trace, exactly inverted ✓ (L26594)
- Locked numbers: X_C 5.0 Ω ✓ · iₘ 2.00 A ✓ (S1 `i = −2.00 A` at v≈0) · lead 1.0 s ✓ (S2 bracket "i crests 1.0 s BEFORE v = ¼ cycle = 90°") · q_max 1.27 C ✓ · ⟨p⟩ 0.00 W ✓
- Nit: `C = 0.1273` (not `0.4/π`) yields `Umax = 6.36 J` vs the skeleton's 6.37 J — cosmetic, and the 6.37 annotation is not rendered on field_3d.

### Gate 3e — Rule 31 distinct motion + contextual controls — ✗ (controls ✓, motion ✗)
Controls match skeleton §3 exactly, confirmed in frames: S1/S2/S3/S6/S7/S8 no panel · **S4 `Peak voltage vₘ` only** · **S5 `Frequency f` only** · **S9 all three**. Panel built once (L26402), rows shown/hidden (L26478), same position across states ✓. Defensive re-lock chain honored (S4 `{f_demo,C}`, S5 `{vm,C}`, S6–S8 all three) ✓. No `wait_for_answer`/`pause_after_ms`/`narrative_socratic` ✓.
**✗** three states' declared motion (S1 beads flood/freeze, S2 beads disobey, S5 beads swell/starve) does not exist on screen — **F1**.

### Gate 3f — Rule 32 legibility + word budget — ✗
Word budget on `text_en` (script-counted): S1 46 · S2 54 · S3 49 · S4 54 · S5 54 · S6 53 · S7 47 · S8 51 · S9 22 (exempt) — **all inside 25–55** ✓.
Δ-cue captions ≤5 words, nine distinct archetypes ✓. One glow focal per sentence ✓. Home-pose continuity ✓ (camera moves twice: S3 nudge-in, S8 pull-back, as designed).
**✗** cause→effect fails at S4 (**F2**); 32c "the only visible change IS the new thing" broken at S1 (**F3**).

### Gate 3g — Rules 33/34 — ✗
- 33c per-state micro number: S3 ✓ (`q = +0.06 C` live, clear of the HUD — F2-scar honored) · S5 ✓ (`q_max = 1.27 C` pinned across the ramp) · S6 ✓ (`U = 0.81 J / U_max = 6.36 J`) · **S4 ✗** (its number — slope 15.7 V/s → i = C×slope = 2.00 A — is computed at L26654 and never rendered) → **F6b** · S1/S2/S5 micro band missing → **F1**
- 33d instruments ✓ (HUD live+signed; U-gauge numeric + tracking fill; ⟨p⟩ needle correctly dead)
- 34a caption = Δ cue only ✓ · 34b one Cambria-Math surface per state ✓, HUD value-only ✓
- 34c Unicode: **✗** `U_max = 6.36 J` prints a **literal underscore** at S6/S7 (L26965) while the same HUD emits `q<sub>max</sub>` at L26956 → **F4**. All other math is real Unicode across all three text paths (scan of every caption/label/formula/HUD source: zero `Phi|omega|->|deg|m2|2pi|sqrt` hits). The `X_C`/`v_C` compose routine (`accComposeSegments`/`accFillComposedOnCanvas`/`accHtmlComposeSub`, L26094–26176) is correct and verified rendering as a real styled subscript.
- 34d: founder_drive DOM probe `overlayCollisions: []` ✓, but the **canvas-internal** on-graph `X_C` label (baseline y≈26 px) sits on `yV(vm)` (y≈23.8 px) — struck through in every S5 frame → **F7**

### Gate 3h — Rule 38 rings + tag honesty + Rule 39 — ✓
Rings: core S1–S4+S9, extended S5–S7, advanced S8 (contiguous, immediately pre-explore) ✓.
**Cut 1 (hide S8):** S1–S7+S9 survive; no surviving surface mentions dv/dt, π/2 rad, or the fold. Coherent ✓.
**Cut 2 (hide S5–S8):** S1–S4+S9 survive; no surviving surface names X_C, p, ⟨ ⟩ or U. Coherent ✓.
**38b explore core-only:** S9 frame verified — HUD `v`/`i` only; `show_graph_p`/`show_xc_readout`/`show_qmax_readout`/`show_u_readout`/`show_q_annotation` all false; formula "i leads v by ¼ cycle (90°)" ✓ (the exact defect the `capacitance` proof-run caught — clean here).
**38g:** CBSE/NCERT `verified: true`; all six other cells `verified: false` + `needs_teacher_verification: true` ✓.
**Rule 39g:** all seven new DOM overlays created with inline `position:fixed` (auto-discoverable); slider rows follow `acc_<name>_row` ✓; no new particle_field canvas HUD (`PF_WG_FLAGS` N/A).

### Gate 4 — Live visual walk — ✗ (all 9 states read from `.visual_runs/…/20260723-141651/`)
Gate 4a/4b chat probes are **[LEGACY — retired chat stack]**, N/A. Registration verified statically: `CONCEPT_RENDERER_MAP` (aiSimulationGenerator.ts:2948) ✓ · `VALID_CONCEPT_IDS` (intentClassifier.ts:567) ✓ · `CLASSIFIER_PROMPT` + disambiguation (intentClassifier.ts:878/894/895) ✓ · `CONCEPT_PANEL_MAP` (panelConfig.ts:1525) ✓ · seed script ✓ · clusters migration file authored-not-applied ✓ (correct under trial) · `PCPL_CONCEPTS` N/A.

| State | Frames show | Verdict |
|---|---|---|
| S1 | plates + E-field breathing; `v = −0.2 V / i = −2.00 A`; **amber i-trace already drawn** + world label **"i (leads v by ¼ cycle)"** already on screen | ✗ F1, F3 |
| S2 | ghost docks, real trace sweeps at 2.5 s, lead bracket + drawn arrow at 5 s; legend "last lesson's rhythm (the coil — ¼ late)" | ✓ (F1: no beads to "refuse to obey") |
| S3 | camera nudge-in; `v = +0.5 / i = +2.00 / v_C = +0.5`; world `q = +0.06 C` clear of the HUD | ✓ |
| S4 | tangent on the v-trace; vₘ row only; **captions assert false physics** | ✗ F2 |
| S5 | ramp 0.46 Hz→X_C 2.7 Ω→0.10 Hz→X_C 12.5 Ω, envelope 4.0→0.8 A, `q_max` pinned, thumb+label lockstep | ✓ (F7) |
| S6 | p-strip crossing a highlighted zero, "storing" tint, `area = 6.36 J`, U-gauge breathing | ✗ F4 |
| S7 | needle dead centre, `⟨p⟩ = 0.00 W`, plates cold, gauge full at the v-crest | ✗ F4 |
| S8 | apparatus dimmed + held; full Unicode chain docked; echo-dot fold; scope still moving (Rule 26) | ✓ |
| S9 | all three sliders, core-only HUD, free-running | ✓ (F8 nit) |

### Gate 5 / Gate 6 — N/A — deferred (Rule 18/22 [D])

### Gate 7 — Console + log discipline — ✓
founder_drive: `consoleErrors: []`, `pageErrors: []`, `flags: []`. EYE manifest: `warnings: []`, 162 entries, 39/39 captures.

### Gate 8 — engine_bug_queue regression — ✗ (READ-ONLY; no DB writes)
```
query_engine_bug_queue.ts ac_voltage_capacitor  → No matching engine_bug_queue rows.
query_engine_bug_queue.ts --field3d --open      → 16 rows, each dispositioned below
```
| Row | Result |
|---|---|
| `teach_do_not_prespoil_a_later_reveal` (OPEN) | **✗ REGRESSED** — S1 shows the i-trace, the `i =` HUD line, and the literal claim "i (leads v by ¼ cycle)" → **F3** |
| `field3d_sliders_panel_top12_vs_fsbtn_top10` (OPEN) | ✓ every acc panel uses `top:52px` (L26377/26381) |
| `ghost_compare_cause_invisible_slider_frozen` (OPEN) | ✓ S5 thumb + numeric label track the ramp (t=5/9/14 s frames: 0.46 → 0.44 → 0.10) |
| `ecp_glow_targets_missing_primitives` (OPEN) | **✗ same class** — 3 of 30 glow beats are silent no-ops → **F5** |
| `teach_read_dense_ramp_frames_not_just_frozen` (OPEN) | ✓ complied (S5 dense read; the frozen pin sits pre-ramp) |
| `solenoid_focal_primitive_on_title_not_physics` (OPEN) | ✓ focal ids point at physics annotations; field_3d does not render them anyway |
| `field3d_label_sprite_overlap` · `radius_scenario_F_r_label_kerning_collision` · `graph_title_caption_zorder_overlap` · `caption_clipped_by_adjacent_stat_box` | ✓ no sprite/caption overlap in any of the 39 frames |
| `teach_color_each_element_by_its_own_sign` (OPEN) | ✓ charge pools tint by `sign(q)`, arrow by `sign(i)` (L26879–26895) |
| `teach_inverted_scenario_inverts_cutline_flags` (OPEN) | ✓ the inverted quantity (`X_C` falling) is surfaced, not suppressed |
| `teach_reveal_synced_to_narration` (OPEN) | ✓ every reveal carries a `scenario_cue` with an `at_ms` fallback — **except** S4's three, whose fallbacks are phase-wrong (**F2**) |
| `field3d_rms_subscript_ascii_in_renderer_text_paths` (`4dc1c76`, no queue row — verified via `git show`) | **✗ same class** — `U_max` literal underscore, L26965 → **F4**. The X_C/v_C compose routine itself is correct |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (`ad7975b`, no queue row) | ✓ S5 uses closed-form `accS5PhaseAtTr` (L26023); `PM_accPhase` reset to 0 on every state entry (L26467), matching both siblings |
| `field3d_canvas_caption_text_not_cleared_between_sequential_reveals` (Ch.7 F1 scar) | ✓ `clearRect` + single-latest-stop draw at L26681 |
| `field3d_hud_label_clipped_by_readout_box` (F2 scar) | ✓ world `q` annotation sits low-right, clear of the HUD (S3 frame) |
| `field3d_readout_hud_emits_untaught_ring_quantity` (F3 scar) | ✓ `p` gated on `show_graph_p`, `X_C`/`q_max` on their own flags, S9 core-only |
| `field3d_createtubeline_undefined_field_lines_throws` | ✓ `field_lines` block authored (opacity 0.8) and the scenario draws tube lines |
| `confusion_cluster_registry` probe | **N/A — DORMANT** (migration authored-not-applied, drill-down deferred, Rule 18/22 [D]) — not a finding |

### Gate 9 — Layout overlap — ✓  `✓ no overlaps` on all 9 states.
### Gate 10 — Expression resolution — ✓ zero `{…}` in any rendered or narrated string.
### Gate 11 — Plain English — ✓ no `n_hat`/`F_vec`/`∇`/`∂`/`Σ`; annotations spell formulas in words.
### Gate 12 — Visual continuity — ✓ one apparatus, one home pose S1→S9; the crossover-capacitor anchor lives in narration only, nothing speaker-shaped is drawn.
### Gate 13 — Animation vocabulary — ✓ no `animation`/`animate_in` keys; motion is scenario-mode driven.
### Gate 14 — Pass-1 — ✓ (14b DORMANT). Cliffs, 3 misconception pivots, PRIMARY(S4)+SUPPORTING(S7) with cohesion, foundational coverage (S4 ∈ `foundational`) all present.

### Gate 15 — Pass-2 four-question — ✗ at S1, S2, S4, S5
Walked 15a–15d on all nine states. Passing: S3, S6, S7, S8, S9.
- **S1** — 15c fails (the declared moving thing, charges flooding/freezing, does not exist; only trace + field opacity move); 15d fails (the eye lands on a label that gives away S2). F1, F3.
- **S2** — 15b fails: the curiosity beat is "the beads maximally disobey the ghost"; with no beads the 16a confrontation reduces to two curves. F1.
- **S4 (PRIMARY AHA)** — 15a/15c/15d all fail: the three named instants are asserted at the wrong phase, and the state's own number is never shown. F2, F6b.
- **S5** — 15c partial: the swell/starve reads on the envelope + `X_C` readout ✓, but the declared micro evidence (beads swinging harder / barely budging) is absent. F1.
15e re-entry orientation ✓ — every delayed reveal (S2 2.5/5 s, S4 stops, S5 2 s, S6 0.5/3 s, S8 0.5 s) lands on an already-populated scene.

### Gates 16–20 — assessment block present, so machine halves fired; judgment halves added
- 16 ✓ `misconception_watch` at exactly S2/S5/S7, each a straightforward contrast beat; no per-state tic.
- 17 ✓ one new variable per state (S3 q/v_C, S5 X_C/q_max, S6 p/U, S8 the derivation).
- 18 ✓ S1 is a concrete apparatus; no formula-only state precedes it.
- 19 ✓ machine-clean; `non_assessed_states: ["STATE_9"]` honest (explore); every `teaches_state` agrees with its `by_state` placement.
- 20 ✓ 6 unique q_ids, 6 distinct `tested_idea`, Q3 → the aha state S4, every distractor a real documented belief (B = the coil's lag, C = the resistor's in-phase, D = "phase depends on C"), every key physically correct, `parallel_form_stem` on all six.

### Anti-plagiarism probe (all `text_en` + every caption/label/formula) — ✓
Zero Hinglish tokens; zero country-specific anchors (Rule 35 ✓ — loudspeaker crossover + phone charger; "the mains frequency" phrased neutrally, 35b ✓); no textbook problem setups, no figure references, no DC Pandey / HC Verma sentence shapes.

---

## FINDINGS

### F1 — BLOCKING — the wire beads are never built; three states narrate motion that does not exist
`[owner: peter_parker:renderer_primitives]` `[reason: bug-class]`

`buildAcCapacitor` tags the two wire tubes `elementType: "acc_beads"` (L26237–26240) but **never creates bead meshes**. Evidence:
```
awk 'NR>=25845 && NR<=27005' src/lib/renderers/field_3d_renderer.ts | grep -n "row:\|cell:\|accWireCellPoint"
166:    function accWireCellPoint(wireY, cellIndex, frac) {
414:        // accWireCellPoint); these short stubs are static geometry...
1020:                var pt = accWireCellPoint(wy, bu.cell, beadFrac);
```
— zero object creations carrying `row:`/`cell:`. Both sealed siblings do build them (`acr_bead_` L24291, `acl_bead_` L25193). The per-frame loop is already written for objects that do not exist:
```js
if (!bu || bu.elementType !== "acc_beads" || bu.row === undefined) continue;   // L26862 — matches 0 objects
var pt = accWireCellPoint(wy, bu.cell, beadFrac);                              // dead code
```
`beadFrac`, `aFrac`, `accWireCellPoint` are computed every frame and never used. Confirmed in the frames: the wires are bare grey tubes in all 39 captures.

Consequences:
- **S1's two deliberate plants vanish.** `s1_2` "Watch the charges rush at full flood the instant the voltage reads zero" and `s1_3` "And freeze completely at the voltage's peak" describe nothing on screen.
- **S2's confrontation beat vanishes.** `s2_2` "this capacitor's charges refuse to obey — they surge at full flood, not backward" is the skeleton's designated `visual_counter` for the concept's front-door misconception.
- **S5's micro evidence vanishes.** `s5_3` "Slow it down and the current starves" glows `beads` → glows a static wire.
- **The load-bearing correctness visual vanishes.** The skeleton calls "no bead EVER crosses the gap" a correctness visual that "kills 'current flows through the dielectric' on sight"; nothing crosses because nothing moves.

**Fix:** build the bead pool as the siblings do (7 per wire × 2 rows, `row`/`cell` userData, home pose `accWireCellPoint(wy, bi, 0.5)`) — the update loop then works unmodified. Re-run `visual:eyes`; S1/S2/S5 frames will change substantially.

### F2 — BLOCKING — S4 (PRIMARY AHA) asserts three physical facts at phases where each is false
`[owner: alex:json_author]` `[reason: pass-2]`

`STATE_4.ac_capacitor.tangent_stops_at_ms: [1500, 4500, 7500]`. With θ reset to 0 on state entry (L26467) and locked f = 0.25 Hz (T = 4.0 s, ω = π/2):

| Stop | authored t | θ | v | i | caption drawn (L26673) | true? |
|---|---|---|---|---|---|---|
| 1 | 1.5 s | 0.75π | +7.07 V, **falling** | **−1.41 A** | "steepest climb → i peak" | **NO — sign inverted** |
| 2 | 4.5 s | 2.25π | +7.07 V, climbing | +1.41 A | "flat crest → i=0" | **NO** |
| 3 | 7.5 s | 3.75π | −7.07 V, **climbing** | **+1.41 A** | "steepest fall → i trough" | **NO — sign inverted** |

Confirmed in the captures (which additionally carry a small harness phase offset):
- `STATE_4__dense_t02000.png` — caption **"steepest climb → i peak"**, HUD **`v = −6.2 V, i = −1.57 A`**, tangent visibly sloping **down**.
- `STATE_4__dense_t05000.png` — caption **"flat crest → i=0"**, HUD **`v = +7.8 V, i = −1.24 A`**, tangent visibly **steep**.
- `STATE_4__frozen.png` — caption "steepest fall → i trough" while `v = +9.1 V` climbing.

`physics_block.md` §S4 specifies the stops as **t = 0, 1.0, 2.0 s** ("stop TIMES (0/1.0/2.0 s) stay pinned"); every authored value is 500 ms (45°) off that grid. Correct values inside the 16 s budget: **`[4000, 5000, 6000]`** (θ = 2π, 2.5π, 3π → v = 0 climbing/i = +2.00 A; v = crest/i = 0; v = 0 falling/i = −2.00 A). Also re-bind: `tangent_stop_3` currently rides `s4_4` ("Drag the peak voltage…"), so caption and sentence describe different things — move the steepest-fall beat onto its own sentence.

**Advisory to the engine owner (not a second route):** with TTS on, `cueTriggerMs` makes each stop fire at a *narration* time, so the phase is arbitrary again. The durable fix is to **arm on the cue and display at the next occurrence of the named phase**. Worth doing alongside F6b.

### F3 — MAJOR — STATE_1 pre-spoils STATE_2's entire reveal
`[owner: peter_parker:renderer_primitives]` `[reason: bug-class]` — regression of OPEN scar `teach_do_not_prespoil_a_later_reveal`

Two engine-side leaks, both visible in `STATE_1__frozen.png` / `STATE_1__dense_t01000.png`:
1. The world-space sprite label on `acc_arrow` hardcodes **`"i (leads v by ¼ cycle)"`** (L26334), and `acc_arrow` ships in every state's `visible_elements` — so S2's answer is printed above the apparatus during S1.
2. The i-trace is gated only inside `quarter_cycle_lead` mode (`sIStart = t - tWin - 1` otherwise, L26602), so the amber lead trace draws from t = 0 in S1; the HUD's `i =` line is ungated too.

Skeleton §0a is explicit ("**No i-trace before S2**") and DoD (b) lists the current HUD/trace/marker as **first at S2**. S1's declared job is that the strangeness is *visible but unnamed* — the label names it. Not fixable from the JSON: dropping `acc_arrow` from S1 would remove the current-direction arrow the state legitimately needs.
**Fix:** state-gate the arrow label text (bare `i` until S2, or split the label into its own gated object) and gate the i-trace + the HUD `i` line behind a flag (default true, false at S1).

### F4 — MODERATE — literal underscore `U_max` on canvas (Rule 34c)
`[owner: peter_parker:renderer_primitives]` `[reason: bug-class]` — same class as `field3d_rms_subscript_ascii_in_renderer_text_paths`
L26965: `urEl2.innerHTML = "<div>U = …</div><div>U_max = " + Umax.toFixed(2) + " J</div>"` → renders **`U_max = 6.36 J`** in `STATE_6__frozen.png` and `STATE_7__frozen.png`. The same HUD emits `q<sub>max</sub>` correctly at L26956. Fix: `U<sub>max</sub>`.

### F5 — MODERATE — three glow beats are silent no-ops
`[owner: peter_parker:renderer_primitives]` `[reason: bug-class]` — same class as `ecp_glow_targets_missing_primitives`
`applyAcCapacitorGlow` `continue`s on `acc_efield` **and** `acc_charge` (L26991).
**Judgment on the interpretive call the dispatch flagged: exempting `acc_charge` is CORRECT.** Its material colour *and* opacity are rewritten every frame (L26894–26899), and the peer branch of `applyGlowEmphasis` does `m.color.copy(m.userData._glowBaseCol)` — it would fight the live channel exactly as it would for `acc_efield`. The *consequence* is the defect: because the scenario also passes `brightenOnly = true` (peers are never dimmed), a focal of `efield` or `charge` produces **zero visual change anywhere** — `s3_2` (efield), `s3_3` (charge) and `s7_2` (efield) emphasise nothing.
**Fix:** keep the exemption from the generic pass; apply the focal boost as a *multiplier on the live value* inside `updateAcCapacitorFrame` (e.g. `efOpacity *= 1 + 0.5·glowP` when focal). Glow emphasis elsewhere reads correctly — the alias resolver strips `acc_` cleanly, so `source`/`beads`/`plates`/`meter`/`u_gauge` and the five DOM keys all resolve (verified against `resolveGlowAliases`, L2280).

### F6 — MODERATE — two DoD rows unbuilt
- **F6a** `[owner: alex:json_author]` `[reason: dod]` — no idealization / demo-scale clause in any of the 30 sentences (`ideal|demo|slowed|scaled|thousands` → 0 hits). DoD (b) requires both "ideal — no resistance, nothing crosses the gap" and the demo-scale clause; the sim ships f = 0.25 Hz and C = 0.127 F unexplained. `s3_3` covers only "no charge crosses the gap". S1 has 9 words of budget headroom.
- **F6b** `[owner: peter_parker:renderer_primitives]` `[reason: dod]` — S4 never renders its own number: `slopeNow = vm*omega*cos(theta)` (L26654) drives only the tangent angle; the physics block's `15.7 V/s → i = C × slope = 2.00 A` readout is never drawn. Also missing: the `iₘ` reference marker on the i-trace and the `iₘ` HUD line the skeleton declares for S9. Add a live `slope = … V/s  ·  i = C × slope = … A` chip beside the tangent and an `iₘ` dashed line beside the existing `vₘ` one.

### F7 — LOW — on-graph `X_C` label struck through by the vₘ peak line
`[owner: peter_parker:renderer_primitives]` `[reason: bug-class]`
`accFillComposedOnCanvas(…, padL + 3, padT + 10)` → baseline y ≈ 26 px, while `yV(vm)` with `vAxis = 1.15·vm` → y ≈ 23.8 px. Visible in `STATE_5__frozen.png`, `dense_t05000`, `dense_t09000`, `dense_t14000`. The value is also duplicated (HUD + graph); moving it or dropping the on-graph copy both resolve it.

### F8 — LOW — `C` default sits off the slider step grid
`[owner: alex:json_author]` `[reason: schema]`
`slider_controls.C = {min: 0.04, step: 0.02, default: 0.1273}` — 0.1273 is not on the `0.04 + n·0.02` grid, so the browser snaps the thumb to 0.12 while the label prints 0.13 and the physics uses 0.1273. Proof: founder_drive `sliderDrags` → `{"sliderId":"acc_C_slider","state":9,"valueBefore":"0.12"}` while the S9 frame's label reads `Capacitance C: 0.13 F`. Prefer `step: 0.0127` (keeps X_C exactly 5.00 Ω at default) over changing the default.

### F9 — LOW / advisory — the S5 scripted ramp (17 s) outlives its state budget (15 s)
`[owner: alex:json_author]`
`ACC_S5_LEGS` totals 4 + 1.5 + 6 + 1.5 + 4 = 17 s from the 2 s cue → ends at t = 19 s, while `STATE_5.duration = 15`. Rule 31 permits motion to outrun narration, but Rule 37 pins the clock at timeline end, so the held final picture is the **starved** 0.10 Hz frame (`STATE_5__dense_t14000.png`: f = 0.10 Hz, X_C = 12.5 Ω) under the caption "Faster swing, weaker choke". Raise `duration` to ~20 s or shorten Leg B/C. No leak risk — S6's `variable_overrides` re-lock `f_demo: 0.25`.

---

## SCAR CANDIDATES — SQL TEXT ONLY, **NOT EXECUTED** (trial rule: no DB writes)

```sql
INSERT INTO engine_bug_queue (row_type, bug_class, severity, status, owner_cluster, concepts_affected, description, prevention_rule, probe_type, probe_logic) VALUES
('incident', 'field3d_scenario_declares_bead_element_but_never_builds_the_meshes', 'CRITICAL', 'OPEN',
 'peter_parker:renderer_primitives', ARRAY['ac_voltage_capacitor'],
 'ac_capacitor tagged its two wire tubes elementType "acc_beads" but never created the bead meshes; the per-frame loop guards on bu.row === undefined and matched zero objects, so beadFrac/accWireCellPoint were dead code and three states narrated carrier motion that did not exist on screen.',
 'When cloning a sibling scenario micro band, grep the NEW build fn for the per-frame loop own discriminator (row:/cell:/pool:) before shipping — sharing an elementType with the static geometry makes visible_elements and the glow alias resolve while the animated objects are absent. Every narration sentence describing carrier motion must have a countable built object behind it.',
 'manual', 'For each glow/narration target naming a moving micro object, confirm >=1 built mesh carries the per-frame loop discriminator field.'),

('incident', 'phase_anchored_caption_authored_as_wallclock_at_ms', 'CRITICAL', 'OPEN',
 'alex:json_author', ARRAY['ac_voltage_capacitor'],
 'STATE_4 tangent_stops_at_ms [1500,4500,7500] against T=4.0s put every stop 45 degrees off the phase its caption names; two of three captions were sign-inverted at the instant displayed.',
 'A caption naming a phase-specific fact (zero crossing, crest, steepest slope) must be authored congruent to that phase modulo the period (nT, nT+T/4, ...), recomputed whenever the locked frequency changes; the engine should arm on the cue and display at the NEXT occurrence of the named phase so TTS-driven cues cannot desync it.',
 'js_eval', 'For each tangent_stops_at_ms entry s: theta = 2*PI*f*(s/1000); assert the named quantity matches sin/cos(theta) within 5 degrees.'),

('incident', 'field3d_hardcoded_sprite_label_prespoils_later_state_reveal', 'MODERATE', 'OPEN',
 'peter_parker:renderer_primitives', ARRAY['ac_voltage_capacitor'],
 'The acc_arrow world label hardcodes "i (leads v by 1/4 cycle)" and acc_arrow ships in every state visible_elements, so STATE_1 printed STATE_2 reveal; the i-trace was likewise gated only inside the reveal state own mode.',
 'A hardcoded sprite/canvas label stating a RESULT must be gated by the state that teaches it, never bundled into an always-visible element token. When a skeleton says "quantity X not before STATE_N", the gate belongs on the label AND the trace AND the HUD line, not only the formula overlay.',
 'manual', 'Grep every hardcoded label string in a new scenario for result-claims; confirm each is gated to its teaching state.'),

('incident', 'field3d_ascii_underscore_subscript_in_secondary_readout', 'MODERATE', 'OPEN',
 'peter_parker:renderer_primitives', ARRAY['ac_voltage_capacitor'],
 'acc_ureadout emitted the literal "U_max" while the main HUD ten lines earlier correctly emitted q<sub>max</sub> — the Rule 34c sweep covered the primary HUD only.',
 'Rule 34c sweeps must cover EVERY readout element in the scenario, not just the main HUD: grep the new block for /[A-Za-z]_[A-Za-z]/ inside any innerHTML/fillText/label string before shipping.',
 'js_eval', 'Assert no visible DOM/canvas text in the scenario matches /[A-Za-z]_(max|min|rms|C|L|m)\b/.'),

('incident', 'glow_focal_on_live_driven_object_exempted_becomes_total_noop', 'MODERATE', 'OPEN',
 'peter_parker:renderer_primitives', ARRAY['ac_voltage_capacitor'],
 'acc_efield and acc_charge are correctly exempted from applyGlowEmphasis because their colour/opacity are live-driven, but with brightenOnly=true peers are never dimmed either, so a focal of efield/charge produced zero visual change on three narration beats.',
 'Exempting a live-driven object from the generic glow pass is correct, but the scenario must then apply the focal boost as a MULTIPLIER on the live channel inside its own update fn — otherwise the exemption silently deletes the emphasis.',
 'manual', 'For each glow key in a scenario closed enum, confirm a visible channel changes when it is focal.'),

('incident', 'canvas_graph_label_collides_with_peak_reference_line', 'LOW', 'OPEN',
 'peter_parker:renderer_primitives', ARRAY['ac_voltage_capacitor'],
 'The on-graph X_C label baseline (padT+10) coincides with yV(vm) when the v-axis headroom is 1.15x, so the vm peak dashed line strikes through the label in every STATE_5 frame.',
 'Canvas-internal overlays are invisible to the founder_drive DOM collision probe: on-graph text must be placed against the COMPUTED y of every reference line in the same pane, never by eye.',
 'js_eval', 'Assert |labelBaselineY - yV(vm)| > fontSize for every on-graph label.');
```

---

## SELF-REVIEW

- [x] Gates 0–20 reported ✓/✗/N/A with pasted tool output, frame filenames, or file:line behind every verdict.
- [x] All 9 EPIC-L states visually inspected (frozen + dense + keyframes; 12 frames read in full).
- [x] Each finding names exactly ONE owner with a reason tag.
- [x] Anti-plagiarism probe run over ALL `text_en` plus every rendered caption/label/formula, not spot-checked.
- [x] Gate 8 enumerates per-probe results for every relevant OPEN row; the two commit-only scars verified by code inspection at their fix sites; `confusion_cluster_registry` marked N/A-DORMANT per established precedent.
- [x] READ-ONLY: zero DB writes; scar candidates emitted as SQL text for the orchestrator.
- [x] `[judgment]` calls flagged inline: the F5 exemption verdict, F9's severity, and the S8 "Nothing moves here" narration nit (the scope traces do keep moving — acceptable, read as "no apparatus motion").
