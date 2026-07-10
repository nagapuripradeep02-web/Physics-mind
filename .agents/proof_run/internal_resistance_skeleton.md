# ARCHITECT SKELETON — `internal_resistance`
**Chapter:** Class 12, Ch.3 Current Electricity — NCERT §3.11 (second half: internal resistance, terminal voltage). Catalog: T34 CE-G4, atomic **A13 `internal_resistance_terminal_voltage`** + nano N13.1 (open-circuit V = ε).
**Renderer:** `particle_field` (2D p5.js) — `scenario_type: "internal_resistance"`, CIRCUIT family. **Engine Phase A is DONE (2026-07-10)** — this skeleton authors strictly against the built surface, verified in `particle_field_renderer.ts` (`irMode()` at :889, `irCurrents()` physics at :924+, `drawIrScenario()` at :1297+, `drawChargerC` at :1311) and `deriveStateMeta.ts` :427–435 (all four one-shot settle pins registered). Sliders `emf` (1–12 V, step 0.1, default 1.5) / `r` (0.1–2 Ω, step 0.1, default 0.5) / `R` (0.25–12 Ω, step 0.25, default 1.0) / `switch` (0/1); state flags `droop_intro · r_reveal · show_r · R_autosweep_down · R_autosweep_to · short_circuit · two_reading · charging · show_voltmeter · show_ladder · show_sliders · visible_controls` + per-state numeric locks (`emf`/`r`/`R`/`switch`); glow enum (CLOSED) `pump · ladder · voltmeter · load · electrons · formula · switch · r_internal · charger`. **No new flags are invented anywhere below.**
**Position:** 6th Ch.3 diamond, after `drift_velocity` → `ohms_law` → `resistivity` → `combination_of_resistors` → `emf_definition` (all shipped). **Diamond 2 of the two-diamond split** — reuses D1's cell + ladder + voltmeter verbatim; the diamond OPENS where D1 ended.
**Design authority:** `docs/superpowers/specs/2026-07-10-internal-resistance-design.md` (founder-approved 2026-07-10). This skeleton implements that spec exactly; it does not re-litigate it.

---

## 0a. Engine bug queue consultation (pre-authoring)

The bug-queue SQL is not executable from the architect's read-only toolset this dispatch (no Bash/DB tool). Consulted the read-only mirrors: the Ch.3 particle_field family scar notes (drift/ohms/resistivity/resistors/emf bring-ups), the `_seed_engine_bug_queue_*.ts` catalog, and the design spec §5's bring-up contract (which itself encodes the D1 scars). The field_3d pre-flight checklist is **N/A** (this is particle_field, not field_3d). **FLAG to quality_auditor: re-verify against live `engine_bug_queue` rows at Gate 8.** Prevention rules applied:

| Scar / prevention rule | How this skeleton satisfies it |
|---|---|
| Glow enum is CLOSED — a non-keyed `glow_focal` or per-sentence `glow` silently dims the whole panel (the ohms_law scar) | Every glow below is from the registered set `pump · ladder · voltmeter · load · electrons · formula · switch · r_internal · charger` (`dimFor` registrations verified: `r_internal` :1117/:1918/:1943, `charger` :1333, `switch` :1334) — no coined glow names anywhere |
| Clock-driven in-state animation needs a `deriveStateMeta.pfRevealMs` settle pin or THE EYE's `__frozen` lands mid-animation | All four one-shots pinned (verified `deriveStateMeta.ts:432–435`): `droop_intro` 1500+800+400 · `two_reading` 3600+400 · `r_reveal` 700+900+400 · `R_autosweep_down` 700+3200+400. json_author re-seeds cache after authoring the 7-state arc |
| One-shot sequences must terminate, NEVER cycle endlessly (the resistivity `material_cycle` scar) | `two_reading` (S5) is a one-pass sequence by engine design (open-hold → cued close @2500 → computed-r line @3600, then holds); spec §5 mandates it explicitly |
| Cue-gated visuals derivable at any pinned time incl. t=0; `__PM_supportsTimePin`; `RESET_TRAJECTORY`; `ceil` re-sim | Engine contract per spec §5 bring-up list, inherited from the verified circuit family — json_author verifies, doesn't rebuild |
| `teach_do_not_prespoil_a_later_reveal` (AR) | S1 shows the DROOP ONLY — no r, no internal step, no `show_r`, formula surface `V < ε` (the disposable stub's S1 `V = ε − ir` overlay is corrected); charger gated to S6; the computed-r line gated to S5's sequence end; sliders hidden until their teaching state |
| `teach_concrete_before_abstract_compare` (AR) | S1 is pure phenomenon (needle droops, unexplained); the accounting formula lands only in S2 AFTER the reveal has shown where the 0.50 V went with the real number |
| `teach_coordinate_sim_with_graph` (AR) | The potential ladder IS this concept's graph: loop and ladder move in lockstep in every state (S2 step grows with the reveal; S3 step tracks the sweep; S4 external drop dies as the internal step eats all of ε; S6 profile rebuilds for charging) |
| `teach_visual_must_match_narration` (AR, MAJOR) | Every narrated claim is drawn: "the needle droops" = the 1.50→1.00 glide; "spent inside" = the labeled `i·r = 0.50 V` internal step; "the current caps" = the ammeter stopping at 3.0 A; "reads above ε" = the needle at 2.00 V |
| `misconception_watch` only at genuine pivots (founder 2026-07-04) | Exactly THREE pivots (S2, S4, S6) across 7 states — per approved spec §7; S1/S3/S5/S7 carry none |
| Rule 31a word budget 25–55 EN words on `text_en` | Budget column in §3; S7 = one sentence ≤20 |
| ≥2 distinct advance_mode; never `auto_after_animation` on a static-but-live state | `manual_click` ×6 + `interaction_complete` (S7); no state is static (bead flow is continuous in every closed-loop state) |
| No backticks in the renderer code string; `\\u`-escapes (Rule 14) | Engine work done (Phase A); no renderer edits in this pass |
| Shared-renderer no-race (`particle_field_renderer.ts` uncommitted across sessions) | This pass touches NO renderer code; json_author diffs `git status` first regardless |
| Stale TTS after text edit | EN+TE voiced LAST (Rule 30f/30g), hash-aware `tts:generate` after founder approval |

**DC Pandey check:** Consulted the Current Electricity table of contents (emf / internal resistance / terminal voltage / grouping-of-cells sections) for SCOPE only — confirms internal resistance + terminal voltage is a distinct sub-topic between emf's definition and grouping of cells, matching the A12 → A13 → A18 chain. No teaching method, no example problem, no figure reference imported.

---

## 1. Atomic claim

This concept teaches that a real cell has a resistance r hidden inside it, so whenever current i flows, i·r volts are spent inside the cell itself and the terminals deliver only **V = ε − i·r** — with its three corollaries from the same one line: open circuit reads the full ε (i = 0), short circuit caps at i_max = ε/r (never infinite), and charging pushes the terminals ABOVE ε (V = ε + i·r). It does **not** cover grouping of cells (deferred to `combination_of_cells`, A14/A15), maximum power transfer (A20), the potentiometer method of measuring r (A26 — the two-reading method here is the conceptual seed), Kirchhoff's rules, or the electrochemical origin of r in ion transport (outside A13's atomic scope — see §10 Rule 33 note).

---

## 2. State count + arc

**7 states — lower edge of the complex band (7–9), per the approved spec §6.** One equation, but four consequences that each kill or found something distinct: the droop phenomenon (S1) + its reveal (S2, PRIMARY aha) + the law in motion (S3), the finite-short-circuit limit (S4, misconception pivot), the syllabus-mandated measurement skill (S5, N13.1/A13), the sign reversal under charging (S6, misconception pivot + declared contrast pair of S3), and explore (S7). Merging any pair deletes a distinct archetype beat and a locked exam-relevant number; splitting none (each state = one idea, one motion). The hook MOVES from t=0 — S1's switch snaps closed at 1.5 s and the needle glides; no static setup state.

**No `teaching_method` fields on S1–S6** (Rule 31 default: straightforward motion beat); S7 = `exploration_sliders`.

| State | Purpose (one line) |
|---|---|
| S1 `the_promise_breaks` | Close the switch on D1's trusted cell → the voltmeter droops 1.50 → 1.00 V — phenomenon only, unexplained |
| S2 `the_hidden_r` | **PRIMARY AHA** — the cell's casing opens: a resistance r was inside all along; the ladder grows an internal step of i·r = 0.50 V — the missing volts, found |
| S3 `more_current_more_droop` | V = ε − i·r in motion: R auto-sweeps 1.0 → 0.25 Ω, i climbs 1 → 2 A, the internal step grows 0.50 → 1.00 V, V falls 1.00 → 0.50 V |
| S4 `short_circuit_ceiling` | R → 0: V → 0, and the current CAPS at i_max = ε/r = 3.0 A — all of ε dies inside; the cell heats (i²r) |
| S5 `measuring_r` | The two-reading method: open → 1.50 V; closed → 1.00 V @ 1.0 A; r = (ε − V)/i = 0.5 Ω computed on-screen |
| S6 `charging_above_emf` | A 3.0 V ideal charger forces i backwards through the cell: the terminals sit ABOVE ε at V = ε + i·r = 2.00 V |
| S7 `sandbox` | Explore — every dial live (ε, r, R, switch); i = ε/(R+r) everywhere |

**Locked physics numbers (spec §4 — do not change; physics_author verifies, never re-derives differently):** defaults ε = 1.5 V, r = 0.5 Ω, R = 1.0 Ω → home i = 1.0 A, droop i·r = 0.50 V, V = 1.00 V. S3 sweep end R = 0.25 Ω → i = 2.0 A, droop = 1.00 V, V = 0.50 V (the droop exactly doubles when i doubles). S4: R → 0 exactly → V = 0, i_max = 1.5/0.5 = 3.0 A. S5: 1.50 V open, 1.00 V @ 1.0 A closed → r = 0.50/1.0 = 0.5 Ω. S6: fixed ideal charger ε_ch = 3.0 V through the series R = 1.0 Ω → i = (3.0 − 1.5)/1.5 = 1.0 A, V_cell = 1.5 + 0.5 = **2.00 V** — the perfect ±0.50 V mirror of S3's start, at the same 1.0 A.

---

## 3. Per-state choreography + control plan (Rule 31 — REQUIRED table)

**Coined archetypes (one-line justifications; the seed vocabulary was built from magnetism and lacks circuit-instrument motion classes):**
- `close-and-droop` — a discrete switching event whose consequence is read as an instrument's sag; the inverse of `null-result-hold` (there: change expected, nothing happens; here: constancy expected, the needle moves).
- `reveal-interior` — a trusted apparatus's casing opens to expose a component that was there all along; distinct from `reveal-build` (which constructs NEW scene pieces — here nothing is added to the world and no physics value changes; something already present becomes visible).
- `ramp-droop` — a monotone one-way auto-sweep of one dial with two coupled readouts tracking in opposite directions (i up, V down); `oscillate/track` is periodic, this never returns.
- `collapse-extreme` — a variable driven to its boundary to expose a finite ceiling plus its side-effect (heat); the motion IS the approach to the extreme.
- `measure-compare` — a two-phase instrument protocol (reading A → reading B → computed result); nearest seed `cycle-compare` loops A→B→A′ for qualitative contrast, this is a one-pass quantitative procedure ending in a number.
- `reverse-flow` — the flow direction itself inverts under a stronger external source and an instrument crosses above its old ceiling; `flow-along-path` shows flow existing, this shows flow REVERSING.

**Declared contrast pair — S3 ↔ S6 (per approved spec §6):** same apparatus, same 1.0 A — the 0.50 V i·r term **subtracts** when discharging (V = 1.00) and **adds** when charging (V = 2.00). The delta lines name the flip. Note this pair contrasts at the PHYSICS level with two distinct archetypes — seven distinct archetypes total, ZERO archetype repeats (stricter than the no-repeat rule requires).

| State | Teaches (ONE idea) | Archetype | DISTINCT motion (deterministic on the state clock) | Δ cue (≤5 words, Rule 32c) | Live controls (31c) | `glow_focal` | advance_mode | Narration budget |
|---|---|---|---|---|---|---|---|---|
| S1 `the_promise_breaks` | A real cell under load delivers LESS than its label — phenomenon only | `close-and-droop` (coined) | Opens in D1's closing pose: switch open, beads still, voltmeter at the full 1.50 V. `droop_intro` one-shot: the switch arm snaps closed @1500 ms (cause) → beads start flowing, ammeter ramps to 1.0 A → after a readable beat the needle GLIDES 1.50 → 1.00 V; the ladder's load drop visibly covers only 1.00 of the 1.50 V climb — a 0.50 V gap, shown, not explained. No r, no internal step | "Close switch — volts drop" | none (watch) | `voltmeter` | manual_click | 30–45 words / ~14 s |
| S2 `the_hidden_r` | **PRIMARY AHA:** the missing volts are spent INSIDE the cell, across a hidden r | `reveal-interior` (coined) | `r_reveal` one-shot (700→1600 ms): the cell's casing widens to expose a small zigzag **r = 0.5 Ω** between the plates and the + terminal (cause) → THEN the ladder grows its second, INTERNAL step — down `i·r = 0.50 V` still inside the cell band — so the terminal-to-terminal height is exactly the 1.00 V the meter reads. Every physics number holds at S1's values: only the EXPLANATION appears | "The missing volts, found" | none (watch) | `r_internal` | manual_click | 40–55 words / ~17 s (the aha) |
| S3 `more_current_more_droop` | V = ε − i·r — the droop grows with the current | `ramp-droop` (coined; **physics contrast pair w/ S6**) | `R_autosweep_down` + `R_autosweep_to: 0.25` (700→3900 ms, teacher-seizable): the R slider thumb glides down (cause) → beads speed up, i climbs 1.0 → 2.0 A → the internal step stretches 0.50 → 1.00 V while V falls 1.00 → 0.50 V on ladder and needle together — the droop exactly doubles when i doubles. Beads keep flowing at the end values (motion never dies) | "More current, more droop" | **R** | `ladder` | manual_click | 40–55 words / ~16 s (carries the headlights anchor) |
| S4 `short_circuit_ceiling` | Short circuit: the hidden r is the CEILING — i_max = ε/r, finite, and all of ε heats the cell | `collapse-extreme` (coined) | `R_autosweep_down` + `R_autosweep_to: 0` + `short_circuit`: R collapses to exactly 0 (cause) → V dies to 0 on needle and ladder (the external drop vanishes — the internal step IS the whole 1.5 V climb) → the ammeter STOPS at 3.0 A, not infinity → heat shimmer grows inside the casing with i²r | "All ε lost inside" | none (watch) | `pump` | manual_click | 35–50 words / ~15 s |
| S5 `measuring_r` | Two readings give r: open → ε; loaded → V and i; r = (ε − V)/i | `measure-compare` (coined) | `two_reading` one-shot sequence: open-hold (0–2500 ms — needle at 1.50 V, i = 0, reading A pinned on-screen) → the switch closes on cue (cause) → needle drops to 1.00 V @ 1.0 A (reading B pins) → @3600 ms the computed line appears: `r = (ε − V)/i = 0.5 Ω`. One pass, then holds — never cycles | "Two readings give r" | **switch** | `voltmeter` | manual_click | 40–55 words / ~18 s (carries the worn-cell anchor) |
| S6 `charging_above_emf` | Charging: current forced backwards → V = ε + i·r — the terminals sit ABOVE the emf | `reverse-flow` (coined; **declared contrast pair w/ S3** — same 1.0 A, the ±0.50 V flip) | `charging`: the 3.0 V ideal charger sits docked on the loop's right edge (this state's home-pose delta — the click's one visible change) → beads stream BACKWARDS through the cell (negative speed on the same path) → the needle reads 2.00 V, above the 1.5 V it could never beat before; ladder profile rebuilds: charger lifts to 3.0 V, down i·R across the series resistor, down ε (stored) + down i·r (heat) across the cell band, cell height labeled V = 2.0 V | "Charging lifts V above ε" | none (watch) | `charger` | manual_click | 40–55 words / ~16 s (carries the phone-charging anchor) |
| S7 `sandbox` | Synthesis — i = ε/(R+r) live under the teacher's hands | `drag-sandbox` (seed) | Teacher drives all four dials (`show_sliders`, all rows): ε and r reshape the cell's promise and its tax, R throttles the loop, the switch replays open-vs-loaded at will; pump, r-interior, ladder, ammeter, voltmeter all live; charger absent (discharge circuit — charging was S6's fixed-number demonstration, per spec) | "All yours" | **ALL: emf · r · R · switch** | `formula` | interaction_complete | 0 / open (one sentence ≤20 words) |

**No-repeat audit:** `close-and-droop` ×1, `reveal-interior` ×1, `ramp-droop` ×1, `collapse-extreme` ×1, `measure-compare` ×1, `reverse-flow` ×1, `drag-sandbox` ×1 (explore only). Zero archetype repeats; the ONE declared contrast pair (S3↔S6) is a physics mirror with the flip named in both delta lines. No static state — bead flow is continuous in every closed-loop state; S1's pre-close stillness and S5's open-hold are one-shot PHASES of states that move (spec §5: no `motion:false` opt-out needed anywhere).

**Rule 32 legibility plan:**
- **32a cause-first:** S1 — switch snaps closed FIRST, needle glides after the current ramp (~0.8 s beat). S2 — casing opens and the zigzag r appears FIRST, the ladder's internal step grows after (engine sequences the reveal 700→1600 ms). S3 — the R thumb glides FIRST, beads/step/needle respond. S4 — R hits zero FIRST, then the ammeter cap and the heat shimmer. S5 — the switch closes FIRST, readings respond, the computed line lands LAST. S6 — attention sequence charger → reversed beads → needle (per-sentence glow walk). Never simultaneous.
- **32b one variable:** S1 the switch only; S2 NOTHING moves physically (i, V hold at home values — only the explanation appears; the strongest form of one-variable); S3 R only; S4 R only (to its limit); S5 the switch only; S6 the loop configuration only (charger in, everything else at home values). Explore exempt.
- **32c:** the Δ column above = the caption openers, verbatim, all ≤5 words (they match the built stub's captions).
- **32d home pose:** ONE apparatus throughout — D1's cell + loop + load + beads + ammeter + voltmeter + ladder, opening EXACTLY in D1's closing pose (switch open, 1.50 V). The r-interior docks at S2 and persists through S7 (`show_r`); the charger docks at S6 ONLY and undocks for S7 (documented exception per spec §6 — charging is S6's demonstration; S7 keeps the discharge circuit). No teleport-rebuild anywhere; at every click the only visible change is the state's named delta.
- **32e single focal:** per-state `glow_focal` in the table (one at any instant); per-sentence `glow` shifts allowed within the closed enum only (e.g., S1 `voltmeter` → sentence on the closing switch `switch`; S3 `load` on the sweep sentence → back to `ladder`; S4 `electrons` on the 3.0 A sentence → `pump` on the heat sentence; S6 `charger` → `electrons` → `voltmeter`).

**Cue plan (engine timings are FIXED constants registered in `deriveStateMeta` — physics_author paces the narrating sentence to LAND on each cue; `at_ms` values already serve as THE EYE fallback):** S1 `droop_intro` switch-close @1500 ms (narration sentence 2 lands on it) · S2 `r_reveal` casing draw-in 700–1600 ms (sentence 1 carries the question over from S1; sentence 2 lands on the reveal) · S3 sweep 700–3900 ms (sentence 2 rides the sweep) · S4 sweep to 0 (same window) · S5 `two_reading` close @2500 ms, computed line @3600 ms (sentence 1 = reading A during the hold; sentence 2 lands on the close; sentence 3 on the computed line). S6 and S7 are continuous — no one-shot.

---

## 4. Misconception confrontation plan (Rule 16a — exactly THREE pivots, per approved spec §7)

EPIC-C branches: NOT authored (EPIC-L-first directive 2026-06-10). No `mode_overrides` (Rule 20). Every confrontation is a straightforward contrast beat in motion — no predict-pause, no reveal question.

| Genuine wrong belief | Pivot state + `misconception_watch` beat |
|---|---|
| **"A 1.5 V cell always delivers 1.5 V"** (the primary — earned by five diamonds of ideal cells and by every battery label ever read) | **S2** (the beat SPANS S1→S2: S1 shows the wrong expectation's consequence — the needle droops the moment real current flows; S2 shows the real physics — where the 0.50 V went). `belief:` "a 1.5 V cell always delivers 1.5 V — the label is a promise" · `visual_counter:` closing the switch drops the voltmeter from 1.50 to 1.00 V before your eyes, and the opened casing shows the missing 0.50 V spent across the cell's own internal r as the ladder's second, internal step · `one_line_fix:` "the label states ε — the terminals deliver ε − ir the moment current flows." |
| **"Short circuit means infinite current"** (the i = ε/R reflex from ohms_law with R → 0) | **S4.** `belief:` "if R goes to zero, i = ε/R blows up to infinity" · `visual_counter:` R collapses to exactly zero and the ammeter STOPS at 3.0 A — the hidden r is still in the loop; the ladder shows the entire 1.5 V now falling inside the cell, which visibly heats · `one_line_fix:` "the current always sees R plus r — at R = 0 it caps at i_max = ε/r." |
| **"Terminal voltage can never exceed the emf"** (planted by this very diamond's S1–S5 droop-only story — confronted in-path before it hardens) | **S6.** `belief:` "V is always below ε — the cell always taxes you" · `visual_counter:` the charger forces the beads backwards and the voltmeter reads 2.00 V, above the 1.5 V ceiling every earlier state respected — the same i·r that subtracted now adds · `one_line_fix:` "while charging, V = ε + ir — the terminals must sit above the emf to push current in." |

**No other state carries a `misconception_watch`** (founder guardrail 2026-07-04 — S1, S3, S5, S7 are straightforward teaching; S1 is the consequence half of S2's beat, not a separate pivot).

---

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates; V1 ships zero authored deep-dives — Rule 18)

| State | Why invest |
|---|---|
| **S2** | The core abstraction — V = ε − ir and the emf-vs-terminal-voltage distinction; "where did the volts go / what IS r" has multiple documented phrasings and is THE historically stuck idea of this atomic |
| **S4** | The classic trap — R = 0 with the i = ε/R reflex; assertion-reason and numerical JEE/NEET territory, several distinct confusion phrasings (infinite current, where the power goes, why cells heat) |
| **S5** | The measurement skill — the two-reading algebra is where students fumble (which reading is ε, why two readings are needed); board staple and the live bridge to the potentiometer diamond (A26) |

**Divergence note (Block-1/Block-2 cross-reference):** S6 carries a misconception pivot but NOT a deep-dive flag — it is a fixed-number demonstration whose wrong belief is confronted in-path, and its deeper "how does charging store energy" question is electrochemistry, outside A13's atomic scope. Deep-dive investment follows stuck-ness, not pivot-ness. Un-authored deep-dive buttons route to the feedback form.

---

## 6. Drill-down clusters (3 per deep-dive state; physics_author fleshes out trigger_examples)

**S2:**
- `where_did_the_volts_go` — "The cell says 1.5 V but the meter reads 1.0 V — who took the half volt?"
- `emf_vs_terminal_voltage` — "What exactly is the difference between emf and terminal voltage?" (the operational split this diamond exists to make)
- `what_is_r_physically` — "Is there an actual resistor inside the cell — what is r made of?" (electrolyte + electrodes, at definition level; ion-transport chemistry out of scope)

**S4:**
- `why_not_infinite_current` — "R is zero, so i = ε/R should be infinite — why does it stop at 3 A?"
- `ohms_law_with_r_included` — "Does Ohm's law break at R = 0?" (no — the loop law is i = ε/(R+r); r never leaves)
- `why_shorted_cells_get_hot` — "If V = 0 outside, where is all the power going?" (all of ε·i dissipates as i²r inside)

**S5:**
- `why_two_readings` — "Why can't one voltmeter reading give r?"
- `voltmeter_lies_under_load` — "Why does a battery read fine on a meter but die in the device?" (aging raises r — the open reading never shows it)
- `open_circuit_reads_emf` — "Why does the open-circuit reading equal ε exactly, even for a real cell?" (i = 0 kills the ir term — N13.1, true for ANY cell)

---

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:  STATE_1 → STATE_3   # "why does voltage drop / terminal voltage / V = ε − ir" — contains the PRIMARY aha (S2)
  short_circuit: STATE_4             # "short circuit current / max current of a cell"
  measuring_r:   STATE_5             # "how to measure internal resistance / two readings"
  charging:      STATE_6             # "voltage while charging / can V exceed emf"
  exploration:   STATE_7
```

Default aspect = `foundational`. PRIMARY aha (S2) sits inside the foundational range — satisfied, no exit-pill needed. Cross-slice pills after foundational ends: "What happens if R goes all the way to zero?" → S4; "How would you measure r?" → S5; "Can the meter ever read ABOVE 1.5 V?" → S6. All five aspect names go into `ASPECT_VOCABULARY` + `CLASSIFIER_PROMPT` (registration site 6).

---

## 8. Prerequisites (advisory only — Rule 23)

- `emf_definition` (shipped, Diamond 1) — the cell, the ladder, the voltmeter, and the open-circuit V = ε bridge are all inherited verbatim; this diamond opens in D1's closing pose.
- `ohms_law` (shipped) — i = ε/(R+r) is Ohm's law with one more series resistance; the S4 trap is precisely the naive i = ε/R reflex.

Both gold-standard shipped diamonds on the same renderer family. Ch.3 graph edge extended: `ohms_law → emf_definition → internal_resistance`; catalog A13 `required-by`: A14, A15, A16 (cells in series/parallel, max power), A26 (potentiometer r-measurement).

---

## 9. Real-world anchor (Rule 35 — universal, culture-neutral, plain English, physics-true)

**Primary — car headlights dim the instant the starter cranks.** The starter motor draws a huge current from the same 12 V battery; i·r eats several volts inside the battery itself, the terminal voltage sags, the headlights dim — and recover the moment the engine catches and the current drops. Cars exist everywhere; no place, brand, or currency named. It is the exact V = ε − ir picture with the exact S3 mechanism (bigger i → bigger droop), and it is something students have watched without knowing they were watching physics. **Narration placement: S3.**

**Secondary:** a worn-out cell still reads its full ε on an open-circuit voltmeter but can't run a motor — aging raises r, which is why "testing" a battery with only a voltmeter lies to you (**S5**, the measurement state's payoff); a phone battery reads about 4.2 V while charging, ABOVE its ~3.7 V resting value (**S6** — the everyone-has-seen-it proof that V > ε while charging).

**Why it hooks Class 10–12 physics students:** all three anchors are things they have personally observed and never connected — the dimming headlights, the "good" battery that dies under load, the charging readout above the battery's rating. Each is physics-true at every depth (no metaphor breaks). No country-specific places, festivals, food, currency, brands, or names in any rendered or narrated text (35a); no region-dependent constant asserted (35b — the 12 V and 3.7 V values are properties of the objects, not of a region).

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the seven states of §2, exactly as tabled in §3 (id, one idea, archetype, delta, controls, glow, advance_mode, budget each).

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label; symbolic only, Rule 24):

| Quantity | On-canvas label | Where |
|---|---|---|
| emf | `ε = 1.5 V` cell badge (live number) + `EMF ε` slider row | badge S1+; slider S7 |
| internal resistance | zigzag tag `r = 0.5 Ω` inside the opened casing + `internal r` slider row | S2+ (via `show_r`); slider S7 |
| internal drop | `i·r = 0.50 V` live label on the internal step (→ 1.00 V in S3, 1.50 V in S4) | S2+ |
| terminal voltage | voltmeter `V = 1.00 V` numeric + needle (1.50 open · 0.50 at S3 end · 0 in S4 · 2.00 in S6) | S1+ |
| current | ammeter `i = 1.0 A` numeric + needle (0 open · 2.0 at S3 end · caps 3.0 in S4) | S1+ |
| load | `R = 1.0 Ω` box stamp + matching ladder external drop + `Load R` slider row | S1+; slider S3, S7 |
| short-circuit cap | `i_max = ε/r = 3.0 A` readout line | S4 |
| two readings | pinned `open: 1.50 V` · `closed: 1.00 V @ 1.0 A` + computed `r = (ε − V)/i = 0.5 Ω` line | S5 |
| charger | `charger 3.0 V` badge on the docked second source | S6 |
| switch | switch arm drawn open/closed + `Switch` row (text Open/Closed, never raw 0/1) | S1+; control S5, S7 |
| readout HUD | value-only ε / V / i / r panel (`updateReadouts`) | all states |

**Formula surface per state (Rule 34b — ONE each, math-serif Unicode):** S1 `V < ε` (observation only — do-not-prespoil; corrects the stub's S1 overlay) · S2 `ε = V + i·r` (the accounting form — 1.50 = 1.00 + 0.50, the missing volts FOUND; see FLAG 2) · S3 `V = ε − i·r` (the working law) · S4 `i_max = ε/r` · S5 `r = (ε − V)/i` · S6 `V = ε + i·r` · S7 `i = ε/(R+r)`. All glyphs real Unicode (ε · − · Ω · ·) across DOM overlays, canvas text, and readouts (Rule 34c).

**(c) Right-hand-rule plan:** N/A — no magnetic directions exist in this concept. Direction teaching = conventional-current arrows along the loop, and S6's REVERSAL of the bead direction under the charger (consistent with the Ch.3 sibling convention). Declared, not omitted.

**(d) Motion plan:** every state's motion fully specified in §3 (droop_intro glide S1; r_reveal casing-open + step-grow S2; R sweep with tracking readouts S3; collapse to zero + ammeter cap + heat shimmer S4; two-phase measurement sequence S5; reversed bead stream + above-ε needle S6; sandbox S7 — nothing passive; one-shots on engine-fixed timings with deriveStateMeta pins already registered; runs on the state clock, Rule 26; bead flow keeps every closed-loop state alive after one-shots settle).

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20), NO `epic_c_branches` (EPIC-L-first). `renderer_pair` = particle_field/particle_field; `available_renderer_scenarios.particle_field = ["internal_resistance"]`.

**(f) Assessment + misconception_watch:** `misconception_watch` at exactly S2, S4, S6 per §4. `assessment`/`coverage_map`: **OMIT, following the 5-for-5 Ch.3 sibling precedent** (drift_velocity, ohms_law, resistivity, combination_of_resistors, emf_definition all shipped without one; Gates 19/20 fire only on presence) — FLAG to quality_auditor to confirm the phase precedent still holds.

**Rule 33 note (declared so the auditor doesn't false-fail — per approved spec §8):** N/A by design. The mechanism level for this atomic is *energy per charge around the loop*, and the potential ladder IS that mechanism view, carrying real numbers (the 0.50 V internal step). The electrochemical origin of r (ion transport) is outside A13's scope; the S2 cell-interior reveal already delivers the "look inside the apparatus" beat at the correct level. Instruments still honor 33d: ammeter and voltmeter show live numeric readings + tracking needles; the readout HUD is value-only.

**Scene composition (Rule 19, ≥3 primitives/state + `focal_primitive_id`):** json_author authors ≥3 annotation primitives per state mirroring the label table — e.g., S1: promise tag (1.50 V open), droop tag (needle glide), gap tag (0.50 V unaccounted); S2: zigzag-r tag, internal-step tag, accounting tag; S3: sweep tag, growing-step tag, falling-V tag; S4: R-zero tag, capped-ammeter tag, heat tag; S5: reading-A tag, reading-B tag, computed-r tag; S6: charger tag, reversed-beads tag, above-ε tag; S7: formula/readout/controls tags. Known scar: for particle_field the RENDERED text lives in `particle_field_config.states.{label, caption, formula_overlay}` — scene_composition annotations satisfy the schema but are not the visible surface; json_author keeps both in agreement.

**TTS:** author `teacher_script` EN now (budgets per §3; symbols expanded in speech per Rule 30 — "the emf epsilon", "internal resistance r", "terminal voltage V", "current i", "one point zero zero volts"; formula bodies compact on canvas); EN + Telugu AUDIO rendered LAST post-founder-approval (Rule 30f), Telugu via the Sonnet-5 subscription sub-agent (Rule 30g — NEVER `tts:translate`), draft until native review.

**Registration (8 sites, per approved spec §10):** `internal_resistance.json` (wholesale stub replacement — see FLAG 1) · `concept_panel_config` INSERT / `CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP` → particle_field · `VALID_CONCEPT_IDS` · `PCPL_CONCEPTS` N/A (particle_field circuit family, not PCPL — mirror the sibling exclusion, verify) · `CLASSIFIER_PROMPT` + `ASPECT_VOCABULARY` (the five aspects of §7) · clusters migration `supabase_2026-07-10_seed_internal_resistance_clusters_migration.sql` (authored-not-applied; Gate 8 clusters probe is N/A-DORMANT this phase) · seed script `_seed_internal_resistance_cache.ts` storing `{epic_l_path, particle_field_config}` for THE EYE.

**THE EYE:** `visual:eyes -- internal_resistance` 7/7 + `smoke:visual-validator --dense`; frozen frames land AFTER every settle pin (droop glide, r reveal, both sweeps, the computed-r line); eye-walker ∥ quality-auditor; zero new `engine_bug_queue` rows; **shipped `emf_definition` re-verified pixel-identical (its 6 locked baselines are the shared-primitive regression proof)**; founder hand-tests S3's seizable sweep, S5's switch, and S7's four sliders (THE EYE can't fire trusted events).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `emf_definition` → breaks at **S1/S2**: a student who can't read the ladder as joules-per-coulomb sees the internal step as decoration. Patch: one S2 clause — "the ladder still shows each coulomb's energy — up the full ε inside the pump, and now down i·r before the charge even leaves the cell" — a one-second recap for D1 watchers, a complete sentence for anyone else. `ohms_law` → breaks at **S3** (and S4/S7): i = ε/(R+r) must read as familiar law, not new formula. Patch: one S3 clause — "the same Ohm's law drives the loop — the current just sees both resistances in series." Neither clause condescends; both ride inside existing budgets.

**JEE-backwards trace.** Representative question: *"A cell of emf 1.5 V and internal resistance 0.5 Ω is connected to a 1.0 Ω resistor. Find (i) the current, (ii) the terminal voltage, (iii) the current if the terminals are shorted, (iv) the voltmeter reading when an external source drives 1.0 A backwards through the cell, and (v) describe how you would measure r with a voltmeter and an ammeter."* Knowledge pieces → delivering states: i = ε/(R+r) = 1.0 A → S3/S7; V = ε − ir = 1.00 V → S2/S3; open-circuit V = ε (the honest baseline, N13.1) → S1's opening pose + S5's reading A; i_max = ε/r = 3.0 A → S4; V = ε + ir = 2.00 V → S6; the two-reading procedure r = (ε − V)/i → S5. No missing piece — the question's numbers ARE the sim's locked numbers, so the sim literally answers it on screen. (Board/competitive coverage deferred per the conceptual-only directive; no M1–M6 carve-out applies — that is magnetism-only.)

**Misconception entry mapping (Rule 16, 16a-primary).** The three genuine beliefs map to §4's pivots (S2 spanning S1, S4, S6), each a straightforward contrast beat. **Planting-moment audit:** (1) *"V = ε always"* was deliberately planted by five diamonds of ideal cells — D1 fenced it (its S5 cue was explicitly conditional, its closing sentence teased this diamond); S1 opens by re-showing D1's exact promise and breaking it in motion — the planting is resolved, not repeated. (2) *"V ≤ ε always"* is planted by THIS diamond's own S1–S5 droop-only story — S6 exists precisely to break it in-path before it hardens; S3's narration says "spent inside," never "lost forever," keeping the sign-flip honest. (3) S2's zigzag symbol could plant *"r is a discrete component someone installed"* — guard: one S2 clause names r as the resistance of the electrolyte and electrodes themselves, drawn as a zigzag only as the symbol. 16b: no EPIC-C branches authored (reactive fallback deferred until real students exist).

## Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** *The missing volts were never lost — they are spent inside the cell itself, across a resistance you couldn't see; the ladder grows a second, internal step of i·r before the charge even reaches the terminal.* The 10-year memory: "every battery taxes itself — ir volts never make it out of the cell."
- **SUPPORTING ahas (2 — the rare-3 total, justified below):** **S4** — *at dead short the current doesn't blow up; it caps at ε/r, because the cell's own tax is the only thing left in the loop.* **S6** — *the same tax runs both ways: force the current backwards and the terminals must sit ABOVE ε — V = ε ± ir is one law with a sign.*
- **Cohesion check (why three is justified here):** both supporting ahas are the PRIMARY's single equation pushed to its limit (R → 0) and reversed (i → −i) — neither introduces a new idea, each makes the hidden r more real (it caps, it surcharges). Nothing stands alone; nothing belongs in a sibling JSON. S5 (measurement) is deliberately NOT an aha — it is a skill state that operationalizes the primary.
- **Wrong-belief setup:** for the PRIMARY — the confident wrong belief ("the label is a promise") was earned across five ideal-cell diamonds and re-earned by S1's opening pose showing the full 1.50 V; S1 breaks it phenomenologically, S2 explains it. For S4 — S3 deliberately builds "smaller R → bigger current" with the sweep visibly obeying it; the student extrapolates to infinity and S4 stops the ammeter at 3.0 A. For S6 — S1 through S5 show the ir term only ever subtracting; the student arrives certain the cell always taxes downward, and the 2.00 V reading flips the sign.
- **Foundational-coverage rule:** PRIMARY aha state S2 is inside `entry_state_map.foundational` (S1→S3). Satisfied — no exit-pill required.
- **Cross-reference:** deep-dive picks (S2/S4/S5) vs misconception pivots (S2/S4/S6) diverge at S5↔S6 — documented in §5 (investment follows stuck-ness; S6 is a fixed-number demonstration whose belief is confronted in-path).

---

## Escalations / FLAGs for downstream

1. **The dev stub is disposable.** `src/data/concepts/internal_resistance.json` is the Phase-A harness (4 stub states with `state_count: 2` mismatch and pre-spoiled overlays — its STATE_1 shows `V = ε − ir` and `show_r` from the start). json_author replaces it wholesale with the 7-state arc — r/internal-step gated to S2, charger to S6, computed-r line to S5's sequence end. Keep only the stub's `particle_field_config` shapes (slider specs, scenario_type, flag names, captions) as the engine-truth reference.
2. **S2 formula surface `ε = V + i·r` is an architect assignment** (to physics_author): the spec's Rule-34 list names five formulas for S1/S3/S4/S5/S6; S2 and S7 were unassigned. The accounting form (1.50 = 1.00 + 0.50 — "the missing volts, found") is algebraically the same law and matches the spec's PRIMARY-aha framing; S7 gets the loop law `i = ε/(R+r)`. Confirm or collapse S2 to `V = ε − i·r` — but never two formulas on one state (34b). **[MAIN-SESSION RESOLUTION 2026-07-10: CONFIRMED — S2 = `ε = V + i·r`, S7 = `i = ε/(R+r)`.]**
3. **quality_auditor:** re-run the live `engine_bug_queue` SQL at Gate 8 (architect had no DB tool); the clusters-migration probe is N/A-DORMANT this phase (authored-not-applied precedent); confirm the assessment-omission precedent (now 5-for-5 Ch.3 siblings); Rule 33 N/A is a DECISION per spec §8, not an omission.
4. **D1 regression is part of this concept's DoD:** `emf_definition`'s 6 locked baselines must stay pixel-identical after any shared-primitive work — re-run THE EYE on `emf_definition` alongside this concept.
5. **S6 has no charger slider and no entry one-shot** — the charger's ε_ch = 3.0 V is a fixed engine constant (spec §5.2); do NOT invent a `charger` slider or a new flag in the JSON. If eye-walker/founder wants a cause-first entry animation for S6 (charger docks → beads decelerate → reverse), that is a minimal ADDITIVE engine ask to the engine session, not a JSON workaround.
6. **S4's sweep targets R = 0 exactly** (`R_autosweep_to: 0` — legal, the denominator is R + r ≥ r > 0, spec §5); the taught i_max = 3.0 A must land exactly — physics_author verifies no rounding drift in the readouts.
7. **Anchor discipline (Rule 35):** the car-headlights, worn-cell, and phone-charging anchors live in NARRATION only (S3/S5/S6) — nothing car-shaped is drawn; canvas stays labels + equations (Rule 24). No brand, place, or currency in any language's text.

---

## Self-review (architect checklist)

Atomic claim one sentence, non-scope named ✓ · 7 states, complex-band lower edge, per approved spec ✓ · control table complete (teaches × archetype × distinct motion × delta × controls × glow × advance × budget); six coined archetypes justified one line each; S3↔S6 the ONE declared contrast pair with the ±ir flip named in both delta lines; zero archetype repeats; sandbox explore-last ✓ · Rule 32 plan (cause-first per state, one-variable-moves incl. S2's zero-physics-change reveal, delta-cue captions verbatim ≤5 words, home-pose continuity from D1's closing pose + documented charger dock/undock exception, one glow focal — all from the CLOSED 9-key enum) ✓ · misconception_watch at exactly THREE genuine pivots (S2/S4/S6) with belief/visual_counter/one_line_fix ✓ · deep-dive picks (S2/S4/S5) + 9 clusters, S6 divergence documented ✓ · entry_state_map with foundational = S1→S3 containing the PRIMARY aha (S2) ✓ · prerequisites advisory, both shipped ✓ · anchor universal/culture-neutral (Rule 35 — headlights/worn cell/phone charging), plain English, physics-true, narration-only ✓ · DoD zero TBDs (symbol-label table, RHR declared N/A, motion plan, modes, assessment omission FLAGged, Rule 33 declared N/A per spec) ✓ · Block 1 (cliffs ×2, JEE trace matching the locked numbers, planting audit ×3) + Block 2 (1 primary + 2 supporting with rare-3 justification, cohesion, wrong-belief setup per aha, coverage) ✓ · scars satisfied (glow enum, settle pins verified in code, one-shot-not-cycle, do-not-prespoil, D1 baseline regression) ✓ · advance modes manual_click ×6 + interaction_complete (Gate 12) ✓ · conceptual-only (no mode_overrides, no EPIC-C) ✓ · locked physics numbers carried unchanged from spec §4 ✓ · no invented engine flags, no field_3d vocabulary ✓ · word budgets 25–55 per guided state, S7 ≤20 ✓ · handoff-ready to physics_author.
