# ARCHITECT SKELETON — `electrical_power_in_resistor`
**Chapter:** Class 12, Ch.3 Current Electricity — NCERT §3.9 (Electrical Power & Joule Heating).
**Renderer:** `particle_field` (2D p5.js) — `scenario_type: "electric_power"`, CIRCUIT family. **Engine Phase A is DONE (2026-07-10).** Authored strictly against the built surface: `powerMode()` in `isCircuitFamily()`; `cBulbPowers()` physics with fixed `POWER_PMAX = 6`; `drawBulbC` primitive (brightness = √(P/Pmax) clamped 0.12–1, geometry constant per Rule 29); `drawPowerScenario()` dispatched; `powerEnergyJ` accumulator integrated in `stepCircuit`, reset via `rebuildScene`; power readout branch in `updateReadouts()`; `deriveStateMeta.ts` settle pins (`energy_accumulate` 3500+400, `parallel_flip` 1500+800+400). Sliders: `V` (default 6) / `R1` (default 6) / `R2` (default 12) / `topology` (<0.5 series, ≥0.5 parallel) / `switch` (0 open, 1 closed — parallel gates BRANCH 2 only). Frozen per-state flags: `single_bulb · three_faces · energy_accumulate · series_pair · parallel_flip` (+ engine physics keys `single_resistor` / `topology`). Glow enum (CLOSED, power mode): `bulb1 · bulb2 · electrons · formula`. **No new flags/sliders/glow keys invented.**
**Position:** 7th Ch.3 diamond, after drift_velocity → ohms_law → resistivity → combination_of_resistors → emf_definition → internal_resistance (all shipped). Foundational backfill — combination_of_resistors explicitly defers "power/heating in combinations" here.
**Design authority:** `docs/superpowers/specs/2026-07-10-electrical-power-in-resistor-design.md` (founder-approved). NO dev stub exists — json_author authors fresh.

## FLAG 2 RESOLVED (main session, 2026-07-10): the S2 three-faces readout is now engine-drawn — `updateReadouts()` power branch emits `VI = 6.00 W / I²R = 6.00 W / V²/R = 6.00 W` (three live-agreeing values) when `three_faces` is set. S2 narration may reference the three on-screen values computing the same watts. No visual-match risk.

---

## 1. Atomic claim
A resistive load converts the energy its charges lose into heat and light at the rate **P = VI = I²R = V²/R** — one quantity, three faces — accumulating as energy E = P·t (Joule heating); and whether higher resistance means MORE or LESS power is not fixed: at fixed current (series) higher R wins (P = I²R); at fixed voltage (parallel) higher R loses (P = V²/R). Does NOT cover max power transfer (→ grouping_cells_mixed_max_power_transfer), transmission losses (→ power_transmission_high_voltage), bulb rating as a standalone state (folded into S4/S5 nameplates; "run below rated voltage" = explore/drill-down only), combination-reduction drills, Kirchhoff, or RC heating.

## 2. State count + arc — 6 states (5 guided + explore)
| State | Purpose |
|---|---|
| S1 `rate_of_delivery` | A bulb turns the energy charges lose into light + heat at a RATE: P = VI — one bulb, one live watt number |
| S2 `three_faces` | Same watts, three ways: P = VI = I²R = V²/R — one quantity, three faces, all agreeing live |
| S3 `energy_piles_up` | Power is a rate; ENERGY = P·t piles up as heat — the counter climbs (the "bill") |
| S4 `series_duel` | Two rated bulbs in SERIES — same current → P = I²R → the 3 W (higher-R) bulb glows brighter; higher-wattage bulb loses |
| S5 `parallel_flip` | **PRIMARY AHA** — same two in PARALLEL — each gets full voltage → P = V²/R → 6 W (lower-R) bulb wins, each at nameplate. THE FLIP |
| S6 `sandbox` | Explore — every dial live (V, R1, R2, topology, switch); the flip replayable |

**Locked numbers (spec §6):** V = 6 V. "6 W" bulb → R = 6 Ω; "3 W" bulb → R = 12 Ω. Single (S1–S3) = 6 W bulb: I = 1.00 A, P = 6.00 W (VI = 6·1; I²R = 1²·6; V²/R = 36/6). Series @6V: I = 0.333 A → P₁ = 0.667 W (6W bulb), P₂ = 1.333 W (3W bulb), total 2.0 W. Parallel @6V: P₁ = 6.00 W, P₂ = 3.00 W (each at nameplate), total 9.0 W. S3: 6 J/s → ~21 J at the 3.5 s frozen pin. Reproduces the household 100 W vs 60 W flip in the same direction.

## 3. Per-state choreography + control plan (Rule 31)

**Frozen-flag ↔ engine-truth reconciliation (json_author sets BOTH):**
| State | Frozen semantic flag(s) | Physics-driving engine keys |
|---|---|---|
| S1 | `single_bulb: true` | `single_resistor: true` (i = V/R1, one loop) |
| S2 | `three_faces: true` + `single_bulb: true` | `single_resistor: true` |
| S3 | `energy_accumulate: true` + `single_bulb: true` | `single_resistor: true`; EYE pin 3500 |
| S4 | `series_pair: true` | `topology: 'series'` — `single_resistor` ABSENT |
| S5 | `parallel_flip: true` | `topology: 'parallel'` — EYE pin 1500+800 |
| S6 | `show_sliders: true` | topology from slider; no locks |

**Coined archetypes:** `power-on-glow` (carriers convert delivered energy to light+heat with a live watt readout) · `three-way-recompute` (one quantity, three algebraic faces, all live-agreeing as V moves) · `accumulate` (a RATE integrates into a monotone climbing STOCK) · `rated-pair-compare` (two nameplate-rated loads on one source, brightness ORDER is the readout — used exactly twice as the ONE declared contrast pair) · `drag-sandbox` (explore).

**Declared contrast pair — S4 ↔ S5** (`rated-pair-compare` ×2): same two bulbs, same 6 V — S4 holds CURRENT common (series, P=I²R, higher R wins), S5 holds VOLTAGE common (parallel, P=V²/R, higher R loses). Delta lines: "Series: higher-R bulb wins" → "Parallel — brightness flips".

| State | Teaches | Archetype | ENGINE FLAG | Distinct motion | Δ cue (≤5w) | Controls | glow_focal | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `rate_of_delivery` | P = VI | power-on-glow | `single_bulb` (+`single_resistor`) | One 6W bulb top-center; beads flow I=1.00A from t=0, filament glows, halo breathes, live `P=6.00 W`, ammeter 1.00A. Walk: beads(cause)→glow+label(effect) | "Bulb turns watts to light" | V | bulb1 | manual_click | 30–45 w |
| S2 `three_faces` | P=VI=I²R=V²/R | three-way-recompute | `three_faces` (+`single_bulb`,`single_resistor`) | Same apparatus, home pose; formula surface swaps to the identity; slide V → beads/glow/three readouts respond in lockstep, all three faces = the SAME live watt. Continuous flow+shimmer keep it alive | "Same watts, three ways" | V | formula | manual_click | 40–55 w |
| S3 `energy_piles_up` | E = P·t | accumulate | `energy_accumulate` (+`single_bulb`,`single_resistor`) | Counter resets to 0 at entry, CLIMBS `energy = P·t = NN J` at 6 J/s (cause: bulb burning at 6W first; effect: stock growing after). Raise R1 → P drops → counter slows. Pin 3500 → ~21 J | "Energy piles up as heat" | R1 (row "bulb R") | bulb1 | auto_after_tts | 35–50 w |
| S4 `series_duel` | SERIES: same current → P=I²R → higher-R (3W) brighter | rated-pair-compare (pair A) | `series_pair` (+`topology:'series'`) | Single bulb's top wire re-lays into TWO bulbs in line (6W @sR1, 3W @sR2); the click IS the cause. ONE bead stream threads both (I=0.333, ammeter drops 1.00→0.33), then order lands: 3W@1.333 outshines 6W@0.667 — 2× in labels. Higher nameplate LOSES | "Series: higher-R bulb wins" | none (watch) | bulb2 (3W winner) | manual_click | 40–55 w |
| S5 `parallel_flip` | **PRIMARY AHA — PARALLEL: full voltage each → P=V²/R → lower-R (6W) wins, each at nameplate** | rated-pair-compare (pair B — THE contrast pair, flip named) | `parallel_flip` (+`topology:'parallel'`) | Same two bulbs re-land on the two parallel branches (cause = re-lay); beads split 2:1 toward the 6W bulb, then order FLIPS: 6W blazes at 6.00W full-bright, 3W at 3.00W — **each at exact nameplate**, total 9W vs series' 2W. Pin 1500+800 covers re-land | "Parallel — brightness flips" | none (watch) | bulb1 (6W winner) | manual_click | 40–55 w |
| S6 `sandbox` | Synthesis — P=VI=I²R=V²/R under the teacher's hands | drag-sandbox | `show_sliders` | All five dials: V scales all, R1/R2 re-rate bulbs, topology replays the flip, switch kills branch 2 in parallel (3W dies, 6W unaffected — independence) or the loop in series; bulbs/ammeter/P₁P₂total HUD live | "All yours" | ALL: V·R1·R2·topology·switch | formula | interaction_complete | ≤20 w |

**No-repeat audit:** power-on-glow ×1, three-way-recompute ×1, accumulate ×1, rated-pair-compare ×2 (the ONE declared pair), drag-sandbox ×1. No static state (bead flow + shimmer continuous everywhere; S3 climbs; S4/S5 re-lays are living motion).
**Advance-mode audit (Gate 12):** manual_click ×4 + auto_after_tts (S3) + interaction_complete (S6) = 3 distinct. No wait_for_answer, no pause_after_ms.

**Rule 32 legibility:** 32a cause-first every state (beads/re-lay/V-thumb move first, effect after a beat); 32b one variable (S1/S2 V; S3 R1; S4/S5 nothing — the topology change is the transition; S6 exempt); 32c delta cues verbatim ≤5 words (on-canvas caption = cue only, prose in #capStrip — 34a); 32d ONE apparatus home pose (battery left, loop, ammeter bottom-center; single 6W bulb top-center S1–S3; re-lay to two bulbs at S4, re-land parallel at S5 — the re-lay IS the delta); 32e single glow focal = the WINNING bulb (physically honest). Per-sentence glow shifts within the closed enum only.
**Rule 29:** brightness-only emphasis; drawBulbC geometry constant; POWER_PMAX = 6 fixed.
**Cue/pin plan:** NO scenario_cue one-shots (all motion continuous or entry-applied). Two EYE pins engine-registered. Per-state V/R1/R2 locks (6/6/12 through S1–S5) mirror combination_of_resistors' shipped lock pattern.

## 4. Misconception plan (Rule 16a — exactly TWO pivots)
No EPIC-C branches (EPIC-L-first). No mode_overrides. Straightforward contrast beats, no predict-pause, no wait_for_answer.
| Wrong belief | Pivot + misconception_watch |
|---|---|
| **A: "Higher R always dissipates more power"** (P=I²R over-generalized) | **S4** (beat spans S4→S5: S4 CONFIRMS at fixed current — 12Ω bulb genuinely wins; S5 breaks it at fixed voltage). belief: "more ohms means more heat, always" · visual_counter: same two bulbs, same 6V, re-landed parallel — 12Ω drops to 3W while 6Ω blazes at 6W; labels swap order · fix: "P=I²R rules when current is shared (series); P=V²/R when voltage is shared (parallel) — ask what's held constant first." |
| **B: "The higher-wattage bulb is always brighter"** | **S5.** belief: "6W beats 3W — the bigger number always wins" · visual_counter: in S4 the 6W bulb was the DIMMER one (0.667 vs 1.333); in S5 it wins (6.00 vs 3.00) — the nameplate promises power only at rated voltage, which parallel delivers · fix: "a rating is P at rated voltage — in series nobody gets their rated voltage, so the order can invert." |
No other state carries a misconception_watch.

## 5. has_prebuilt_deep_dive (hints; V1 ships zero authored deep-dives)
S2 (which-formula / P∝R vs P∝1/R clash) · S4 (fixed-current reasoning, series strings) · S5 (PRIMARY aha + rating semantics). Coincide with the Pass-1 cliff/pivot states.

## 6. Drill-down clusters (3 per deep-dive state; physics_author writes 5 phrases each = 45)
**S2:** `which_formula_when` · `p_proportional_to_r_or_not` (the I²R-grows vs V²/R-shrinks clash) · `what_is_a_watt` (rate vs stock).
**S4:** `series_string_lights_dim` (2W vs 9W) · `series_voltage_sharing` (V=IR → P=I²R order) · `max_power_transfer_forward_ref` (honest teaser → grouping_cells_mixed).
**S5:** `bulb_rating_meaning` (P at rated voltage — drill-down only) · `run_below_rated_voltage` (P=V²/R → quarter power) · `household_bulbs_parallel` (full voltage + branch independence).

## 7. entry_state_map
```
foundational:       STATE_1 → STATE_5   # runs THROUGH the flip; PRIMARY aha (S5) inside ✓ (no exit-pill)
joule_heating:      STATE_3
series_vs_parallel: STATE_4 → STATE_5
exploration:        STATE_6
```
Default aspect = foundational. All four aspects → ASPECT_VOCABULARY + CLASSIFIER_PROMPT.

## 8. Prerequisites (advisory — Rule 23)
`ohms_law` (V=IR is the S2 substitution engine + reads the S4 ammeter drop) · `combination_of_resistors` ("same current in series, same voltage in parallel" is the S4/S5 load-bearing fact; topology re-lay visual inherited). Both shipped.

## 9. Real-world anchor (Rule 35 — universal, narration-only)
**Primary (S5):** a 100 W and a 60 W household bulb — in normal parallel wiring the 100 W is brighter (its nameplate promise); in SERIES the 60 W wins. The sim's 6W/3W pair at 6V reproduces this flip in the same direction. No place/brand/festival/currency; mains phrased neutrally ("the voltage they're built for"), never a number; sim stays 6V battery-scale.
**Secondary:** a phone charger's "18 W" nameplate = a RATE, not an amount (S1); a kettle/heater coil on twice as long delivers twice the ENERGY at the same power — what an energy meter counts (S3; "kilowatt-hour" named, no tariff).

## 10. Definition of Done (Gate 0)
(a) six states per §2/§3. (b) symbol-label table (power `P=x.xx W` under each bulb; rating `6 W`/`3 W` nameplate; battery `V=6.0 V`; ammeter needle + `I=x.xx A`; energy `energy = P·t = NN J` S3; `R1` slider "bulb R"; HUD single `P=6.00 W` / pair `P₁/P₂/total` / three_faces `VI/I²R/V²/R`). Formula surface per state: S1 `P = VI` · S2 `P = VI = I²R = V²/R` · S3 `E = P·t` · S4 `P = I²R` · S5 `P = V²/R` · S6 reprise. Unicode (I², V², ², ·, Ω, ₁, ₂) across DOM + canvas; never ASCII. (c) RHR N/A — direction = conventional bead flow + S5 junction split. (d) motion plan per §3 (EYE pins verified). (e) conceptual-only — NO mode_overrides, NO epic_c_branches; renderer_pair particle_field/particle_field; available_renderer_scenarios.particle_field=["electric_power"]. (f) misconception_watch at S4+S5; assessment/coverage_map OMIT (6-for-6 Ch.3 sibling precedent). Rule 33 satisfied at-level (filament glow + halo IS dissipation made visible; bead stream IS the carrier work; instruments show live numerics — no macro_view). Scene composition ≥3 primitives/state + focal_primitive_id. TTS: author teacher_script EN (symbols expanded in speech per Rule 30); EN+TE audio LAST post-approval (Rule 30f/g) [SUPERSEDED by Rule 30h — audio is on-demand, never a ship step]. Registration: 8 sites; NO stub; PCPL NOT added; clusters migration + seed script authored. THE EYE 6/6 + smoke; siblings re-EYE H2 0.00%; founder hand-tests S2/S3/S6 sliders + S6 topology/switch.

## Block 1 — Pass-1 strategic checklist
**Cliffs:** ohms_law → S2 (one clause "Ohm's law trades V for IR" recap); combination_of_resistors → S4/S5 (S4 "series — one current threads both"; S5 "parallel — each branch gets the full six volts"). **JEE trace:** the 6W/3W-at-6V rated-bulb question (R from nameplate → series order → parallel order + rating → E=P·t → which-formula-when) maps piece-for-piece onto S4/S2/S5/S3/S6; the question's numbers ARE the locked numbers. **Planting audit:** (1) "higher R more power" is PLANTED by S4 by design (earned then broken at S5); guard: S4 ties the win to "the same current" twice + hands off. (2) "brightness = current" possible from S1; guard: `P=x.xx W` named "the brightness number" from S1 sentence 2, S5's split beads keep it consistent. (3) "nameplate = always-dissipated" possible from S4; guard: numbers introduced as "labels made at six volts," S5 pays off ("each finally gets its full six volts").

## Block 2 — Aha designation
**PRIMARY (S5):** same two bulbs, same battery, rewired series→parallel, the brightness order flips — higher-R wins at fixed current, loses at fixed voltage. 10-year memory: "more resistance, more power" is half a law — ask what's held constant first. **SUPPORTING (S2):** P=VI, I²R, V²/R are one number wearing three faces, Ohm's law between them. Cohesion: the supporting aha is the weapon the primary is won with (S4 deploys I²R, S5 deploys V²/R). Foundational-coverage: S5 inside foundational (S1→S5) — satisfied, no exit-pill.

## Escalations / FLAGs
1. **Flag reconciliation binding (json_author):** set BOTH the semantic flag AND the physics key per §3 table (`series_pair`+`topology:'series'`; `single_bulb`+`single_resistor`). Never invent flags.
2. **RESOLVED** (S2 three-faces readout — engine now draws three live values; see top banner).
3. S2 has no V autosweep — recompute is teacher-driven via the live V slider (motion ≠ interactivity; flow+shimmer auto-play). With the three-value readout differing from S1, frozen frames are distinct. If EYE still flags, a cue-bound V nudge is a minimal additive engine ask.
4. **quality_auditor:** re-run live engine_bug_queue at Gate 8; clusters-migration probe N/A-DORMANT; confirm assessment-omission precedent (6-for-6); Rule 33 at-level is a DECISION per circuit-family precedent.
5. **Slider ids (json_author):** engine id is `R1` (label "bulb R"); `visible_controls: ["R1"]` on S3, `["V"]` on S1/S2, omit on S4/S5, `show_sliders: true` on S6. Defaults = calibration: V=6, R1=6, R2=12, switch=1, topology series. Per-state locks mirror combination_of_resistors verbatim.
6. S3 formula_overlay `E = P·t` + engine value line `energy = P·t = NN J` — the engine line is the VALUE instrument (34b allows one surface + value HUD). If eye-walker reads clutter, trim the overlay not the line.
7. Bulb RATING never a guided state — nameplates + one S5 clause + S5 drill-down + S6 explore only.
8. Sibling regression is DoD: all circuit-family siblings re-EYE H2 0.00%.
9. S6 switch: parallel kills branch 2 only (parallel-independence beat); series/single kills the loop. Founder hand-tests S6.
10. Anchor discipline (Rule 35): 100W/60W bulbs, charger, kettle in NARRATION only; nothing house-shaped drawn; no mains number; no brand/place/festival/currency any language.
