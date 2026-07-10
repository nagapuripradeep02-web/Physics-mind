# Physics Block — `electrical_power_in_resistor` (Ch.3 #7)

> Input to json_author. Companion to `electrical_power_in_resistor_skeleton.md` + the approved spec. Renderer: `particle_field`, `scenario_type: "electric_power"`, CIRCUIT family. Engine Phase A DONE + two physics_author escalations RESOLVED (see banner below). Physics computed NATIVELY in `particle_field_renderer.ts` (`cCurrents()`, `cBulbPowers()`); `physics_engine_config` is DOCUMENTATION per the Zod requirement, it does NOT drive PM_interpolate.

## ESCALATIONS RESOLVED (main session, 2026-07-10)
- **E1 (per-state locks) — FIXED in engine.** `cVolt()/cR1()/cR2raw()` now have a `powerMode()`-gated `typeof st.X === 'number'` per-state numeric-lock branch (commit eef1ece). So a guided state that pins V/R1/R2 numerically is ROBUST to a value dragged in an earlier interactive state (e.g. V dragged in S2 no longer corrupts S3's 6 J/s). **json_author MUST set the numeric locks per the §2 table below** (the live control of each state is left UNPINNED so its slider still drives). Siblings untouched (powerMode-gated).
- **E2 (no S4/S5 ramp) — comment fixed; no code change needed.** S4/S5 render static-per-frame (continuous bead flow + constant brightness from frame 0; the topology + brightness flip are visible on state entry). The `deriveStateMeta` S5 pin comment was corrected (no "ramp"). Legibility to be confirmed by eye-walker in Phase C; if a glide is wanted, a `relay_reveal` fraction is an additive engine ask, not a JSON workaround.

## 1. physics_engine_config (documentation only)
Variables: `V` (0–12, step 0.5, default 6) · `R1` (1–20, step 1, default 6, label "bulb R" = the "6 W" bulb R=V²/P=6Ω) · `R2` (1–20, step 1, default 12 = the "3 W" bulb R=36/3=12Ω) · `topology` (0=series,1=parallel enum, default 0) · `switch` (0=open,1=closed, default 1). Derived: `i=V/R1` (single); `P_single=VI=I²R=V²/R` (=6.00W at defaults); `energy` (∫P dt, engine accumulator, resets on SET_STATE, E(3.5s)=21J); `i_series=V/(R1+R2)`=0.333A; `P1_series=i²R1`=0.667W, `P2_series=i²R2`=1.333W; `P1_parallel=V²/R1`=6.00W, `P2_parallel=V²/R2`=3.00W (0 if branch-2 switch open). brightness_map = `sqrt(clamp(P/6,0.12,1))`, POWER_PMAX=6 FIXED.

constraints (for the JSON `constraints` block):
- P = VI = I²R = V²/R identically — one quantity via Ohm's law V=IR substituted into itself, never three independent laws
- P ≥ 0 always for a passive resistor — a bulb only dissipates, never generates, power
- in SERIES (same current shared by both bulbs) higher resistance dissipates MORE power: P=I²R grows with R at fixed I
- in PARALLEL (same voltage shared by both branches) higher resistance dissipates LESS power: P=V²/R shrinks with R at fixed V
- a bulb reaches its exact nameplate rating ONLY when it receives its rated voltage — parallel wiring at V=6V delivers exactly that here
- energy E=P·t is a monotonically increasing running total, never itself a rate — it cannot decrease while P>0

## 2. slider_controls + per-state flags & LOCKS (json_author sets exactly this)

```json
"slider_controls": {
  "V":        { "min": 0, "max": 12, "step": 0.5, "default": 6,  "label": "Voltage V",  "unit": "V" },
  "R1":       { "min": 1, "max": 20, "step": 1,   "default": 6,  "label": "bulb R",     "unit": "Ω" },
  "R2":       { "min": 1, "max": 20, "step": 1,   "default": 12, "label": "Resistor R2","unit": "Ω" },
  "topology": { "min": 0, "max": 1,  "step": 1,   "default": 0,  "label": "Topology" },
  "switch":   { "min": 0, "max": 1,  "step": 1,   "default": 1,  "label": "Switch" }
}
```

| State | visible_controls | flags (semantic + physics) | NUMERIC LOCKS (set these fields) | glow_focal | advance_mode |
|---|---|---|---|---|---|
| STATE_1 `rate_of_delivery` | `["V"]` | `single_bulb:true, single_resistor:true` | `R1:6` (V is live→unpinned) | bulb1 | manual_click |
| STATE_2 `three_faces` | `["V"]` | `three_faces:true, single_bulb:true, single_resistor:true` | `R1:6` (V live→unpinned) | formula | manual_click |
| STATE_3 `energy_piles_up` | `["R1"]` | `energy_accumulate:true, single_bulb:true, single_resistor:true` | `V:6` (R1 live→unpinned) | bulb1 | auto_after_tts |
| STATE_4 `series_duel` | `[]` | `series_pair:true, topology:"series"` | `V:6, R1:6, R2:12` (watch beat, all locked) | bulb2 | manual_click |
| STATE_5 `parallel_flip` | `[]` | `parallel_flip:true, topology:"parallel"` | `V:6, R1:6, R2:12` (watch beat, all locked) | bulb1 | manual_click |
| STATE_6 `sandbox` | omit; `show_sliders:true` | (none) | (none) | formula | interaction_complete |

**Rules:** `single_resistor:true` MUST accompany `single_bulb` on S1/S2/S3 (drives the one-bulb loop). `topology` is a STRING `"series"`/`"parallel"` on S4/S5 (never 0/1). `single_resistor` ABSENT (not false) on S4/S5/S6. NEVER author `glow_focal:"switch"` (no such glow key in this scenario — the closed enum is `bulb1·bulb2·electrons·formula`). The numeric lock fields (`V`/`R1`/`R2`) sit directly on the `particle_field_config.states.STATE_N` object.

## 3. Motion timeline (per §3 of skeleton; engine-truth)
S1: continuous bead flow @1.00A + filament shimmer; reading order beads→glow+`P=6.00W`. S2: home pose held (only readout TEXT swaps to 3-line VI/I²R/V²R + formula overlay); drag V → all three lines recompute live-agreeing. S3: energy counter climbs 0→ monotonically @6J/s (reset on entry); drag R1 → slope changes; pin 3900ms→~21J. S4: wire re-lays to two in-line bulbs (delta at entry); ONE bead stream @0.333A (visibly slower); bulb2(3W) brighter; order beads→ammeter(0.33)→brightness(0.67 vs 1.33). S5: wires re-land to parallel branches; beads split 2:1; bulb1(6W) brighter, each at nameplate; the flip vs S4 is the aha. S6: all live.

## 4. Verified numbers (independent, zero drift)
single I=1.0A P=6.0W (VI=I²R=V²/R all 6.0); series I=0.333A P1=0.667 P2=1.333 total 2.0; parallel P1=6.0 P2=3.0 total 9.0; E(3.5s)=21.0J. Series total 2W vs parallel total 9W at same 6V is correct (parallel R_eq=4Ω vs series 18Ω).

## 5. text_en narration (word-budget-verified; symbols expanded per Rule 30)

**STATE_1 (45 words):**
- s1_1 (glow electrons): "Close the switch — current I flows at one ampere."
- s1_2 (glow bulb1): "The bulb glows: it turns delivered energy into light and heat at a rate — power P equals voltage V times current I, six watts."
- s1_3 (glow bulb1): "Like a phone charger's eighteen-watt label — a rate, not a stored amount."

**STATE_2 (52 words):**
- s2_1 (bulb1): "Same bulb, same six watts — but write it three ways."
- s2_2 (formula): "Multiply voltage V by current I: six watts. Square current I and multiply by resistance R: six watts again."
- s2_3 (formula): "Square voltage V and divide by resistance R: still six watts — the same quantity, three faces, live-agreeing as you move the voltage slider."

**STATE_3 (50 words):**
- s3_1 (bulb1): "Power is a rate, watts delivered each second. Energy piles up: E equals P times t."
- s3_2 (bulb1): "Watch the counter climb — six joules each second, twenty-one joules by three and a half seconds."
- s3_3 (bulb1): "Raise the bulb's resistance and the climb slows — like a kettle coil, energy is what a meter counts."

**STATE_4 (54 words):**
- s4_1 (electrons): "Same two bulbs, wired in series now — one current I threads both, and it drops to point-three-three amps."
- s4_2 (bulb2): "With the same current in both, power follows P equals I squared R — the twelve-ohm bulb dissipates more, one-point-three-three watts against point-six-seven."
- s4_3 (bulb2): "Same current, twice — the higher-resistance bulb wins here, brighter, while the higher-wattage bulb loses."

**STATE_5 (53 words, PRIMARY aha):**
- s5_1 (electrons): "Same two bulbs, now parallel — each branch gets the full six volts."
- s5_2 (bulb1): "Power now follows P equals V squared over R — the six-ohm bulb wins, six watts to three, order flips."
- s5_3 (bulb1): "Each bulb lands at its exact nameplate — the same flip a hundred-watt and sixty-watt household bulb show: ask what's held constant first."

**STATE_6 (20 words):**
- s6_1 (formula): "Every dial is yours now — watch P equals VI equals I squared R equals V squared over R drive everything."

Anchors (Rule 35, no country/brand/mains-number): s1_3 charger 18W = rate; s3_3 kettle coil / kilowatt-hour; s5_3 100W & 60W household bulb flip.

## 6. Board mark scheme — DEFERRED (conceptual-only). No mode_overrides.

## 7. Drill-down clusters (9 × 5 real-student phrases = 45)
**S2 which_formula_when:** how do i know which power formula to use / why are there three formulas for the same thing / is vi the main one and the others just substitutes / do i pick i squared r or v squared over r based on whats given / whats the fastest way to tell which applies.
**S2 p_proportional_to_r_or_not:** does higher resistance mean more power or less / i squared r says power up with r but v squared over r says down, which / why do the two formulas seem to contradict / is power proportional to r or inversely / how can the same p depend on r in opposite ways.
**S2 what_is_a_watt:** is a watt an amount of energy or a speed of using it / difference between a watt and a joule / if power is a rate why does the rating just say watts no time / is 6 watts a total or per second / why not measure bulbs in joules.
**S4 series_string_lights_dim:** why do old string lights all dim when one has more resistance / does the higher-resistance one hog the light / why does a weak bulb dim the whole string / is that why cheap fairy lights flicker / does adding a higher resistance bulb dim the others.
**S4 series_voltage_sharing:** how does voltage split between the two bulbs / does the bigger resistor get more voltage / why does v=ir decide who gets more of the six volts / is voltage sharing the same as current staying constant / why doesn't the current split when the bulbs differ.
**S4 max_power_transfer_forward_ref:** is there an r where the bulb gets the most power / whats the resistance that maximizes power / why doesn't power keep climbing forever as r rises in series / is there an optimum r for max power from a battery / does matching resistance to the battery matter.
**S5 bulb_rating_meaning:** does a 6 watt bulb always draw 6 watts / what does the wattage on a bulb promise / is the rating only true at one voltage / why does the same bulb draw different power series vs parallel / so the label is a rating at rated voltage not fixed.
**S5 run_below_rated_voltage:** what happens to a bulb's power below rated voltage / does a 6 watt bulb still make 6 watts on a weaker supply / why does power drop faster than voltage when dimming / if i halve the voltage do i get half the power / why does an underpowered bulb look so dim.
**S5 household_bulbs_parallel:** why are household bulbs wired parallel not series / does every parallel bulb get full voltage / why doesn't one burning out affect the others / is that why a brighter bulb doesn't dim the room / why does each parallel bulb act like the only thing connected.

## 8. Scene composition (Gate 19, ≥3/state, documentation-level per native-JS scenario)
S1-S3 `["circuit_loop","battery","bulb_single","ammeter"]` (focal bulb_single); S4 `["circuit_loop_series","battery","bulb1","bulb2","ammeter"]` (focal bulb2); S5 `["circuit_loop_parallel","battery","bulb1","bulb2","ammeter"]` (focal bulb1); S6 add `["slider_panel"]` (focal circuit_loop).

## 9. Formula surfaces (Rule 34b, ONE per state, Unicode)
S1 `P = VI` · S2 `P = VI = I²R = V²/R` · S3 `E = P·t` · S4 `P = I²R` · S5 `P = V²/R` · S6 `P = VI = I²R = V²/R`. Unicode I² V² Ω · ₁ ₂ (match engine's `²`/`Ω`); never ASCII.

## Constraint callouts for json_author
1. No trig. 2. R1 UI label = "bulb R". 3. i/P/energy are derived, never sliders. 4. HUD/energy text is engine-drawn (updateReadouts/drawPowerScenario) — author only formula_overlay + caption + tts_sentences + flags + slider_controls; do NOT author HUD as a scene primitive. 5. Formula surfaces per §9. 6. single_resistor+single_bulb paired on S1/S2/S3. 7. topology is a STRING on S4/S5. 8. single_resistor ABSENT on S4/S5/S6. 9. never glow_focal:"switch". 10. NUMERIC LOCKS per §2 table (engine now enforces them, powerMode-gated). 11. assessment/coverage_map OMIT (6-for-6 Ch.3 precedent). 12. NO epic_c_branches, NO mode_overrides. 13. prerequisites [ohms_law, combination_of_resistors]. 14. available_renderer_scenarios.particle_field=["electric_power"]; renderer_pair particle_field/particle_field.

## Remaining downstream FLAGs
- quality_auditor: re-run live engine_bug_queue at Gate 8; clusters-migration probe N/A-DORMANT; confirm assessment-omission precedent; confirm E2 static-composition legibility via eye-walker.
- Sibling regression (DoD): re-EYE combination_of_resistors, emf_definition, internal_resistance, resistivity, ohms_law, drift_velocity at H2 0.00%.
- S6 switch: parallel kills branch-2/bulb-2 only (independence); series/single kills the loop. Founder hand-tests S6 + S2/S3 sliders (THE EYE can't fire trusted events).
