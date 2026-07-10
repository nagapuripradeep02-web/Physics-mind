# Physics Block — `internal_resistance` (Ch.3 Current Electricity #6, Diamond 2 of 2)

> Input to json_author. Companion to `internal_resistance_skeleton.md` + `docs/superpowers/specs/2026-07-10-internal-resistance-design.md` (locked numbers, verified independently below — unchanged). Renderer: `particle_field`, `scenario_type: "internal_resistance"`. Reuses `emf_definition`'s cell/ladder/voltmeter verbatim; opens in D1's closing pose.

**Native-engine note (mirrors `emf_definition_physics_block.md`):** this concept's physics is computed NATIVELY in `particle_field_renderer.ts` — `irCurrents()` (:958), `cIntR()` (:928), `cIrLoadR()` (:933), `irSwitchOpen()` (:942), `irRampK()` (:951). `physics_engine_config` below is DOCUMENTATION per the Zod requirement; it does NOT drive `PM_interpolate`. json_author authors the real behavior via `particle_field_config.states.{flags, numeric locks}` — the state-flag vocabulary is CLOSED (verified against the renderer, listed in full below); no new flags are invented anywhere in this block.

---

## 1. `physics_engine_config` (documentation only — native engine drives at runtime)

```json
"physics_engine_config": {
  "variables": {
    "emf": {
      "name": "electromotive force (epsilon)",
      "unit": "V",
      "min": 1, "max": 12, "step": 0.1, "default": 1.5,
      "role": "slider - LIVE ONLY in S7 (explore); locked to 1.5 on S1-S6. Epsilon is the fixed premise this diamond droops/caps/reverses around, never the swept variable before S7."
    },
    "r": {
      "name": "internal resistance",
      "unit": "ohm",
      "min": 0.1, "max": 2, "step": 0.1, "default": 0.5,
      "role": "slider - LIVE ONLY in S7; locked to 0.5 on S1-S6. Introduced (revealed) at S2; its INTERIOR (show_r) persists S2 through S7 (Rule 32d docking), but the numeric value is never teacher-dragged before S7. r.min = 0.1 (never 0) is the engine's finite-ceiling guarantee (N13.1's short-circuit corollary)."
    },
    "R": {
      "name": "load resistance",
      "unit": "ohm",
      "min": 0.25, "max": 12, "step": 0.25, "default": 1.0,
      "role": "slider - LIVE in S3 (visible_controls:['R'], teacher-seizable mid-sweep, 700-3900ms) and S7 (explore). The SAME R_autosweep_down/R_autosweep_to mechanism also drives S4's collapse-to-zero, but S4 HIDES the row (visible_controls: []) - a fixed ceiling demonstration, not teacher-dragged. Locked to 1.0 (the sweep's start value, read as cIrLoadR()'s a) on S1/S2/S5/S6."
    },
    "switch": {
      "name": "circuit switch (0=open, 1=closed)",
      "unit": "dimensionless (enum)",
      "min": 0, "max": 1, "step": 1, "default": 1,
      "role": "slider (2-state toggle) - LIVE in S5 (visible_controls:['switch'], the two_reading cue governs it until touched) and S7 (explore). The SAME cue-then-seize mechanism drives S1's droop_intro close, but S1 HIDES the row. NOT locked to a number on S1/S5 (droop_intro/two_reading own the open-to-closed timing internally via PM_simTimeMs, overriding any slider read per irSwitchOpen()). Explicitly locked switch=1 (closed) on S2/S3/S4 (Rule 25d defensive lock - these states have no cue mechanism of their own, so a teacher landing here after toggling elsewhere must still see the closed picture; mirrors field_forces.json STATE_5's m:1 belt-and-suspenders pattern). Irrelevant on S6 (the charging branch of irCurrents() ignores swOpen entirely). Render as text Open/Closed, never raw 0/1."
    },
    "charger_emf": {
      "name": "ideal charger emf (fixed)",
      "unit": "V",
      "constant": 3.0,
      "role": "FIXED ENGINE CONSTANT, NOT a slider - read only via st.charger_emf on S6 (irCurrents() defaults to 3.0 if the state omits it). Author it EXPLICITLY as charger_emf: 3.0 on S6 anyway (defensive-lock discipline, bug-queue prevention rule #1: declare non-default-path values explicitly so nothing silently falls back). Do NOT add a UI slider or a new flag for it (architect FLAG 5)."
    },
    "i": {
      "name": "loop current",
      "unit": "A",
      "derived": "discharge: swOpen ? 0 : eps/(R+r); charging: max(epsCh-eps,0)/(R+r)",
      "role": "live readout - the ammeter. Ramps over 800ms after a cued switch-close (irRampK()), never snaps."
    },
    "V_terminal": {
      "name": "terminal voltage",
      "unit": "V",
      "derived": "discharge: eps - i*r; open: eps; charging: eps + i*r",
      "role": "the voltmeter reading - THE quantity this whole diamond is about. Never both signs at once (mode is mutually exclusive per irCurrents()'s discharge/open/charging tag)."
    },
    "i_max": {
      "name": "short-circuit current ceiling",
      "unit": "A",
      "derived": "eps / r   (the R -> 0 limit of eps/(R+r))",
      "role": "S4's taught number - a CONSEQUENCE of the discharge formula at its boundary, not a separate physics path. Finite because r.min = 0.1 > 0 always."
    },
    "r_measured": {
      "name": "internal resistance, as computed from two readings",
      "unit": "ohm",
      "derived": "(eps - V) / i",
      "role": "S5-ONLY diagnostic readout (drawn as the computed-r line at the two_reading sequence's 3600ms settle) - not an engine input anywhere; requires i > 0.02 to avoid a divide-near-zero display glitch (engine guards this)."
    }
  },
  "formulas": {
    "i_discharge": "swOpen ? 0 : (eps / (R + r)) * irRampK()",
    "V_terminal_discharge": "eps - i * r",
    "i_max_short": "eps / r   // R -> 0 exactly; r_min=0.1 keeps the denominator > 0 always",
    "i_charging": "max(epsCh - eps, 0) / (R + r)",
    "V_terminal_charging": "eps + i * r",
    "r_measured": "(eps - V) / i   // S5 two-reading diagnostic; needs i > 0"
  },
  "computed_outputs": {
    "heat_normalized": "constrain((i*i*r) / 4.5, 0, 1)   // visual-only i-squared-r heat-halo scale; 4.5 W is exactly S4's taught ceiling (3.0 squared times 0.5), so the shimmer maxes out precisely when the narration says 'all of epsilon lost inside' - not itself a taught number, engine-internal normalization"
  },
  "constraints": [
    "open circuit (i=0) implies V_terminal = eps EXACTLY, true for ANY cell, ideal or real (N13.1) - no current means the i-r term is identically zero, which is why S5's open reading and S1's opening pose both safely inherit D1's V=eps claim",
    "short-circuit current is always FINITE - i_max = eps/r, never infinite, because r.min = 0.1 ohm > 0 is enforced by the slider range; R can legally sweep to exactly 0 (R_autosweep_to: 0) because the denominator is R+r >= r > 0, never zero",
    "V = eps minus i-r holds ONLY while discharging; V = eps plus i-r holds ONLY while charging - the two never apply simultaneously (irCurrents() tags mode as discharge/open/charging, mutually exclusive by construction)",
    "r is the electrolyte's and electrodes' OWN resistance - not a discrete component anyone installed; the zigzag drawn inside the opened casing is only r's SYMBOL, never a claim that a literal resistor sits inside the cell (S2 planting guard)",
    "the internal droop i-r is proportional to i for fixed r - this is WHY the droop exactly doubles when i doubles at S3's sweep end (0.50 V to 1.00 V as i: 1.0 A to 2.0 A), not a coincidence of the chosen numbers",
    "1 ohm is exactly 1 V/A - the SI definition, not an approximation; r's unit and R's unit are the same physical quantity, which is why i = eps/(R+r) needs no unit conversion between them"
  ]
}
```

---

## 2. Per-state variable-lock plan (reorderable-rail safety, Rule 25d)

The reorderable state rail means a teacher can jump from S7 (all four dials dragged anywhere, switch possibly left open) straight into S2 -- every guided state must render at its intended numbers regardless of drag history. Engine mechanism note: cIntR()/cIrLoadR()/irSwitchOpen() all check a per-state numeric lock FIRST, before falling back to the live slider (typeof st.X === number wins). droop_intro and two_reading are the two exceptions -- they own the switchs open/closed timing internally via PM_simTimeMs, ignoring any st.switch lock (matches emf_definitions open_circuit pattern precedent).

| State | Locks (numeric) | State flags | Live control(s) | Why locked |
|---|---|---|---|---|
| S1 the_promise_breaks | emf: 1.5, r: 0.5, R: 1.0 (no switch lock -- droop_intro governs the cued close internally) | droop_intro: true | none | S1s narration (1.0 A, 1.00 V) is only true at these exact defaults; droop_intros PM_simTimeMs < 1500 check overrides any switch value anyway, so locking switch would be inert but is correctly OMITTED to match the engines own precedence |
| S2 the_hidden_r | emf: 1.5, r: 0.5, R: 1.0, switch: 1 | r_reveal: true, show_r: true | none | S2 is NOT droop_intro/two_reading, so irSwitchOpen() falls through to the switch lock (or slider) -- a teacher arriving from S7 with the switch left open must still see the CLOSED picture the reveal depends on. Defensive lock, mirrors field_forces.json STATE_5s m:1 pattern |
| S3 more_current_more_droop | emf: 1.5, r: 0.5, R: 1.0, switch: 1 | R_autosweep_down: true, R_autosweep_to: 0.25, show_r: true | R | R: 1.0 is read as cIrLoadR()s sweep-start value a -- without this explicit lock the sweep could start from a stale slider position left by a prior S7 visit. switch: 1 defensive, same reasoning as S2 |
| S4 short_circuit_ceiling | emf: 1.5, r: 0.5, R: 1.0, switch: 1 | R_autosweep_down: true, R_autosweep_to: 0, short_circuit: true, show_r: true | none | Same sweep-start protection as S3; R_autosweep_to: 0 is a state-driven demonstration, so visible_controls hides the R row (Rule 31 only-what-this-state-teaches) even though the mechanism is identical to S3s |
| S5 measuring_r | emf: 1.5, r: 0.5, R: 1.0 (no switch lock -- two_reading governs it internally) | two_reading: true, show_r: true | switch | r_measured = (eps-V)/i must land on exactly 0.5 ohm -- if r or R were left live/unlocked, a prior S3/S7 drag would silently break the taught number. emf/r/R all locked; only the switch (cue-then-seize) is live |
| S6 charging_above_emf | emf: 1.5, r: 0.5, R: 1.0, charger_emf: 3.0 (no switch lock -- irrelevant, charging branch ignores swOpen) | charging: true, show_r: true | none | Locking R: 1.0 fixes the charging denominator (Rs+r); charger_emf: 3.0 is a defensive explicit declaration of the engine default (bug-queue rule #1) |
| S7 sandbox | none | show_sliders: true, show_r: true | ALL: emf, r, R, switch | fully teacher-driven; opens on whatever pose S1-S6 left behind (32d -- explore is the one state exempt from home-pose continuity) |

---

## 3. Per-state motion timeline + control spec (Rule 31/32 -- every branch a pure fn of the state clock)

Settle pins (verified against deriveStateMeta.ts:432-435, all four FIXED engine constants -- physics_author paces narration to LAND on each, never invents a new timing):
droop_intro = 1500 + 800 + 400 = 2700 ms; r_reveal = 700 + 900 + 400 = 2000 ms; R_autosweep_down = 700 + 3200 + 400 = 4300 ms (shared by S3 and S4); two_reading = 3600 + 400 = 4000 ms.

| State | t-window | What animates (pure fn of state clock) | Driven by | Live control(s) | glow_focal |
|---|---|---|---|---|---|
| S1 | 0-1500ms: static open pose (switch open, beads still, voltmeter pinned at 1.50 V, ammeter at 0). Cue at 1500ms: switch snaps closed (cause). 1500-2300ms: irRampK() eases 0 to 1 over 800ms -- beads accelerate, ammeter climbs 0 to 1.0 A, voltmeter needle GLIDES 1.50 to 1.00 V continuously (same ramp -- V_terminal = eps - i*r tracks i in real time, so the droop is not a separate animation, it IS the current ramp). Settles 2700ms | PM_simTimeMs vs the 1500ms cue; i via irRampK() | none | voltmeter |
| S2 | 0-700ms: home pose held (S1s settled values: switch closed, i=1.0A, V=1.00V -- nothing new moves yet). Cue 700-1600ms: r_reveal -- the casing widens (cause) and the zigzag r = 0.5 ohm fades in over 900ms; immediately following, the ladder grows its second, INTERNAL step (orange, i-r = 0.50 V label) -- this is the FIRST frame the ladder appears at all in this diamond (S1 has show_ladder: false, see the constraint-callouts section). No physics VALUE changes (i, V hold at S1s settled 1.0 A / 1.00 V) -- only the explanation appears (32bs strongest form). Settles 2000ms | r_reveal 0 to 1 reveal fraction | none | r_internal |
| S3 | 0-700ms: home pose held (S2s settled reveal: r visible, ladder step at 0.50 V). Cue 700-3900ms: R glides 1.0 to 0.25 ohm (cause) -- beads speed up, i climbs 1.0 to 2.0 A, the internal step stretches 0.50 to 1.00 V on the ladder while V falls 1.00 to 0.50 V on both ladder and needle TOGETHER. Beads keep flowing at end values after 3900ms (motion never dies). Settles 4300ms | cIrLoadR()s R_autosweep_down ramp | R (teacher-seizable -- grabbing the slider mid-sweep sets userTouched[R], freezing it at the dragged value) | ladder |
| S4 | 0-700ms: home pose held. Cue 700-3900ms: R glides 1.0 to 0 ohm EXACTLY (cause) -- V dies to 0 on needle and ladder (the external load-drop segment shrinks to nothing; the internal step now spans the ENTIRE 1.5 V climb), ammeter climbs to and STOPS at 3.0 A (not infinity -- the denominator floors at r=0.5), heat-halo (i-squared-r / 4.5) grows continuously, reaching FULL intensity exactly at the 3.0 A / 0 ohm settle point. Settles 4300ms | same R_autosweep_down mechanism as S3, target 0 | none (row hidden -- fixed demonstration) | pump |
| S5 | 0-2500ms: OPEN-HOLD phase -- switch drawn open, i=0, voltmeter pinned at the full 1.50 V (reading A, on-screen text). Cue at 2500ms: switch closes (cause) -- 2500-3300ms: irRampK() eases i 0 to 1.0 A over 800ms, voltmeter glides 1.50 to 1.00 V (reading B). At 3600ms: the computed line appears -- r = (eps-V)/i = 0.5 ohm, a ONE-PASS sequence (never a cycle). Settles 4000ms | PM_simTimeMs vs 2500ms cue, then irRampK(), then the 3600ms text gate | switch (cue-then-seize) | voltmeter |
| S6 | Continuous from t=0 (no engine one-shot cue -- this state has no *_at_ms/settle pin; charging: true is a steady-state flag). Charger badge sits docked on the loops right edge from the first frame (home-pose delta, 32d); beads stream BACKWARDS continuously; voltmeter reads a steady 2.00 V, ladder rebuilds to the charging profile. Attention sequence via per-sentence glow walk (charger to electrons to voltmeter), not via motion timing | steady-state irCurrents() charging branch | none | charger |
| S7 | Open/continuous -- teacher drives all four dials; every quantity re-derives live every frame (discharge only -- no charger in explore). No settle pin (explore is exempt from THE EYEs frozen-frame timing requirement) | all four sliders | emf, r, R, switch | formula |

Rule 32 legibility cross-check: 32a (cause-first) -- every guided states FIRST visible change is the named cause (switch/casing/R-glide/charger-dock), the readout response follows within the same or next animation frame-block, never simultaneous-and-unexplained. 32b (one variable moves) -- confirmed per row above; S2 is the strongest form (literally nothing moves, S1s settled i/V values hold exactly, only the explanation appears). 32d (home pose) -- one apparatus throughout; show_r docks at S2 and persists S2 through S7; the charger docks ONLY at S6 and undocks for S7 (documented exception). 32e (single focal) -- one glow_focal per state, per-sentence glow shifts stay inside the CLOSED 9-key enum (pump, ladder, voltmeter, load, electrons, formula, switch, r_internal, charger -- verified against dimFor() call sites in the renderer, no coined keys used anywhere below).

---

## 4. Worked-numbers verification (independent arithmetic -- all spec Section 4 numbers confirmed, zero rounding drift at 2-decimal display)

- Home (S1/S2 settled): i = eps/(R+r) = 1.5/(1.0+0.5) = 1.0 A exactly. Droop i*r = 1.0x0.5 = 0.50 V exactly. V = eps-i*r = 1.5-0.5 = 1.00 V exactly. All terminate at <=2 decimals -- no drift at the engines .toFixed(1)/.toFixed(2) display precision.
- S3 sweep end (R to 0.25 ohm): i = 1.5/(0.25+0.5) = 1.5/0.75 = 2.0 A exactly. Droop = 2.0x0.5 = 1.00 V exactly. V = 1.5-1.0 = 0.50 V exactly. Droop doubling check: home droop 0.50 V to S3-end droop 1.00 V, exactly ratio 2, matching is ratio 1.0 to 2.0 A exactly 2 -- confirmed algebraically (droop = i*r, r fixed, so droop is proportional to i identically, not a coincidence of these particular numbers).
- S4 (R to 0 exactly): i = i_max = eps/r = 1.5/0.5 = 3.0 A exactly. V = 1.5-3.0x0.5 = 1.5-1.5 = 0 V exactly. Heat-halo i-squared-r/4.5 = (3.0x3.0x0.5)/4.5 = 4.5/4.5 = 1.0 (full shimmer) -- lands exactly at the ceiling, confirming the engines visual-normalization constant (4.5 W) was chosen to match this diamonds own taught number, not an arbitrary scale.
- S5 (two-reading): open reading = eps = 1.50 V (i=0 while PM_simTimeMs < 2500). Closed reading at settle (3600ms, ramp complete since 2500+800=3300<3600): i = 1.5/1.5 = 1.0 A, V = 1.5-0.5 = 1.00 V. Computed r = (eps-V)/i = (1.50-1.00)/1.00 = 0.50/1.00 = 0.5 ohm exactly -- matches the locked slider value, confirming the measurement recovers the true r with zero error.
- S6 (charging): Rs = R (locked, no autosweep in S6) = 1.0 ohm. i = max(3.0-1.5,0)/(1.0+0.5) = 1.5/1.5 = 1.0 A exactly -- the SAME 1.0 A as S3s starting current (the declared S3<->S6 contrast pair, confirmed numerically identical, not just thematically similar). V = 1.5+1.0x0.5 = 1.5+0.5 = 2.00 V exactly -- the perfect mirror of S3s home V=1.00 V (plus/minus 0.50 V around eps=1.5 V at the same |i|=1.0 A).
- JEE-backwards trace (Block 1, skeleton section Block 1): all five sub-answers (i=1.0A, V=1.00V, i_short=3.0A, V_charging=2.00V, r=0.5ohm) match the sims own locked numbers exactly -- confirmed above, no separate arithmetic needed.

No divide-by-zero anywhere in range: R+r >= r >= 0.1 > 0 always (Rs own min 0.25 is irrelevant to this floor since the engine reads the LOCKED/swept value, which legally reaches 0 in S4 -- the floor is entirely rs slider min of 0.1, never touched by any authored state since r is locked at 0.5 throughout S1-S6 and only reachable down to 0.1 in S7s explore).

---

## 5. Per-state text_en narration (word-budget-verified against the skeletons per-state ranges; symbol expansions per Rule 30 -- "current i" expanded once at S1, "internal resistance r" and "terminal voltage V" expanded once at S2, matching the shipped emf_definition siblings expand-once-per-concept convention; bare "R" stays unexpanded throughout, matching that same shipped precedent)

S1 the_promise_breaks -- budget 30-45 EN words. Actual: 44 words.
| id | glow | text_en |
|---|---|---|
| s1_1 | voltmeter | A real cell should deliver its full label -- right now, switch open, this one reads a steady 1.50 volts. |
| s1_2 | switch | Close the switch, and current i starts flowing. |
| s1_3 | voltmeter | Watch the voltmeter: it glides down to 1.00 volt the instant real current flows -- the promise breaks. |

S2 the_hidden_r -- budget 40-55 EN words (the aha). Actual: 54 words.
| id | glow | text_en |
|---|---|---|
| s2_1 | ladder | The ladder still tracks each coulomb's energy -- up the full epsilon inside the pump. |
| s2_2 | r_internal | Its casing opens: an internal resistance r -- the electrolyte and electrodes' own resistance, not something installed. |
| s2_3 | r_internal | The missing 0.50 volts appear as a second step before the charge leaves the cell: epsilon equals terminal voltage V plus i r -- found. |

(s2_1 = the Block-1 ladder-recap clause for D1-conversant viewers, s2_2 = the what-r-is / not-an-installed-part planting guard, s2_3 = the accounting formula eps=V+ir stated in words -- all three required clauses present.)

S3 more_current_more_droop -- budget 40-55 EN words (carries the headlights anchor). Actual: 53 words.
| id | glow | text_en |
|---|---|---|
| s3_1 | ladder | The same Ohm's law drives the loop -- R and r, in series. |
| s3_2 | load | As R shrinks, current climbs 1.0 to 2.0 amps, and the droop grows 0.50 to 1.00 volt -- it doubles exactly when current doubles. |
| s3_3 | ladder | It's the same reason car headlights dim the instant the starter cranks -- more current, more voltage spent inside. |

(s3_1 = the Block-1 "same Ohm's law, both resistances in series" prerequisite-cliff clause; s3_3 = the universal car-headlights anchor, placed here per architect Section 9.)

S4 short_circuit_ceiling -- budget 35-50 EN words. Actual: 50 words.
| id | glow | text_en |
|---|---|---|
| s4_1 | ladder | With R at zero, plain Ohm's law would predict infinite current. |
| s4_2 | electrons | But the ammeter stops cold at 3.0 amps -- the hidden r is still there, so current caps at epsilon over r. |
| s4_3 | pump | All of epsilon is now spent inside, and the cell visibly heats -- none of it reaches the terminals. |

(s4_1 states the wrong belief explicitly before s4_2 breaks it -- matches the misconception_watch beat verbatim in spirit.)

S5 measuring_r -- budget 40-55 EN words (carries the worn-cell anchor). Actual: 52 words.
| id | glow | text_en |
|---|---|---|
| s5_1 | voltmeter | Open circuit: the voltmeter reads the full 1.50 volts, epsilon exactly. |
| s5_2 | switch | Close the switch: it drops to 1.00 volt at 1.0 amp, a loaded cell. |
| s5_3 | voltmeter | Two readings give r: epsilon minus V over i, 0.5 ohms -- the trick that catches a worn cell reading full voltage but unable to turn a motor. |

S6 charging_above_emf -- budget 40-55 EN words (carries the phone-charging anchor). Actual: 53 words.
| id | glow | text_en |
|---|---|---|
| s6_1 | charger | Now dock a 3.0 volt charger onto the same cell. |
| s6_2 | electrons | It's strong enough to force current backwards through the cell -- against everything you've seen so far. |
| s6_3 | voltmeter | The voltmeter climbs to 2.00 volts, above the 1.5 volt ceiling -- epsilon plus i r, exactly like a phone that reads above its resting voltage while charging. |

S7 sandbox -- budget <=20 EN words, one sentence. Actual: 19 words.
| id | glow | text_en |
|---|---|---|
| s7_1 | formula | Every dial is yours now -- epsilon, r, R, switch -- watch i equals epsilon over R plus r drive everything. |

Total narration: 345 EN words across 7 states / 19 sentences. All counts machine-verified (word-split script, tokens containing at least one alphanumeric character, em-dashes/colons/commas treated as separators not words).

---

## 6. Drill-down cluster phrasings (9 clusters x 5 real student-voice phrases = 45 total)

S2 where_did_the_volts_go:
1. the cell says 1.5 v but meter shows 1.0 v where did the rest go
2. why does closing the switch drop the voltage reading
3. is the missing 0.5 volts destroyed or does it go somewhere
4. the label says 1.5v so why is my reading always less
5. where exactly do those missing volts disappear to

S2 emf_vs_terminal_voltage:
1. whats the actual difference between emf and terminal voltage
2. is terminal voltage just another name for emf
3. why do we need two different words if theyre almost the same number
4. when are emf and terminal voltage actually equal
5. is v the same as epsilon or not

S2 what_is_r_physically:
1. is there an actual resistor inside a battery
2. what is internal resistance really made of
3. why cant i see r if its really there
4. is r the same kind of resistor as the ones in circuits
5. does every single battery have this hidden r or only old ones

S4 why_not_infinite_current:
1. if r is zero shouldnt current become infinite
2. why does the ammeter stop at 3 amps instead of shooting up
3. ohms law says i equals v over r so zero r should mean infinite i
4. whats actually stopping the current from blowing up at short circuit
5. is there a real physical limit or is the sim just capping it

S4 ohms_law_with_r_included:
1. does ohms law stop working when r hits zero
2. so is it really i equals epsilon over r plus little r
3. why did nobody mention the internal r in ohms law before
4. is short circuit current epsilon over big r or over little r
5. does the loop even care that big r is zero

S4 why_shorted_cells_get_hot:
1. if the outside voltage is zero where does all the power go
2. why do shorted batteries get so hot
3. is all the energy just turning into heat inside the cell
4. can a shorted cell actually explode from this heat
5. wheres the power dissipated if theres no external resistor

S5 why_two_readings:
1. why cant one voltmeter reading tell me r
2. whats the point of measuring twice instead of once
3. what does the second reading actually add that the first didnt
4. cant i just calculate r from the label
5. why do i need both open and closed readings for r

S5 voltmeter_lies_under_load:
1. why does a battery test fine on a meter but die in my device
2. how can the open reading lie about a weak battery
3. why does an old battery still show full voltage with nothing connected
4. does testing with just a voltmeter actually tell you anything useful
5. why does r go up as a cell gets old

S5 open_circuit_reads_emf:
1. why is the open circuit reading always exactly epsilon
2. does that open circuit rule work for every cell or just ideal ones
3. why does zero current mean no voltage is lost inside
4. if r is huge does open circuit still read the full emf
5. is the open reading really unaffected by internal resistance

---

## 7. Board mark scheme -- DEFERRED (conceptual-only directive, Rule 20 suspension). No mode_overrides authored. Not drafted.

---

## Constraint callouts for json_author

1. CRITICAL -- S1 must set show_ladder: false. Engine reality check: drawIrScenario()'s ladder call ALWAYS passes the ir 9th argument whenever show_ladder is true -- it is NOT gated by show_r. This means if S1 sets show_ladder: true, the ladder will draw with the internal i-r step ALREADY highlighted orange and labeled -- pre-spoiling S2's reveal (violates the teach_do_not_prespoil_a_later_reveal scar and the skeleton's explicit no-r-no-internal-step instruction for S1). Resolution: S1 omits show_ladder entirely (falsy/undefined). The 0.50 V gap in S1 reads off the voltmeter (1.00 V) against the cell's always-visible epsilon-equals-1.5-V badge (drawn unconditionally by drawEmfCell regardless of show_r) -- a numeric mismatch a sharp student notices without the ladder's visual confirmation, which S2 then supplies. S2 is the FIRST state with show_ladder: true, and it correctly renders the internal step immediately (as it must, since S2 IS the reveal). Flagging this explicitly for quality_auditor's Gate 15 and json_author's implementation.
2. switch numeric locks are OMITTED, not set to a matching value, on S1 and S5. droop_intro/two_reading read PM_simTimeMs directly and ignore st.switch per irSwitchOpen()'s precedence -- authoring switch: 0 on S1 would be inert since the flag already governs it. Author these two states WITHOUT a switch lock field at all, matching the disposable stub's own STATE_1/STATE_3 pattern.
3. R_autosweep_to: 0 on S4 is legal and REQUIRED (not 0.01 or any near-zero fudge) -- the denominator is R+r >= r >= 0.1, never zero, so the exact taught ceiling i_max=3.0 A lands with zero rounding drift.
4. charger_emf: 3.0 on S6 is a defensive explicit declaration, not a new UI element -- do not add a charger row to slider_controls; the engine reads st.charger_emf directly and defaults to 3.0 if omitted, but declaring it explicitly satisfies bug-queue prevention rule number 1.
5. No trig anywhere -- radians() N/A for this concept (no angles).
6. Slider steps must match exactly: emf step 0.1, r step 0.1, R step 0.25, switch step 1 (2-state). These are load-bearing for S3's sweep (R must land on 0.25 exactly) and match both the design spec and the disposable stub's slider_controls verbatim.
7. i and V_terminal are NEVER independent sliders -- always derived via irCurrents(); do not add slider_controls entries for them.
8. The heat-halo (i-squared-r over 4.5 normalization) is engine-internal -- no JSON field needed beyond show_r/r_reveal triggering rr.heat in drawEmfCell's optional 5th arg; do not author a separate heat flag (none exists in the renderer).
9. Ideal-cell-diamond honesty guard carried forward from D1: no annotation/caption/formula_overlay on S1 may write the full discharge equation or mention internal resistance by name -- S1's formula surface is the plain inequality V less-than epsilon (observation only), per DoD Section 10(b), matching architect FLAG 2's resolution.

---

## Escalations / FLAGs for downstream

1. NEW -- The S1 show_ladder: false resolution (constraint callout 1 above) is a physics_author finding not explicitly anticipated in the skeleton's prose (which describes the ladder's load drop visibly covering only 1.00 of the 1.50 V climb, as if the ladder were on-screen in S1). Given the engine's unconditional ir-mode ladder profile whenever show_ladder is true, the ONLY way to honor no-r-no-internal-step in S1 is to keep the ladder off entirely in S1. FLAG to quality_auditor Gate 15 (experiential Pass-2 audit) and to json_author: confirm S1's gap-shown-not-explained beat reads clearly via the voltmeter-vs-badge mismatch alone, without the ladder. If eye-walker/founder judge this insufficiently legible on THE EYE, the fallback is an ADDITIVE engine ask (a show_ladder_simple flag that draws only the eps-riser and load-drop-at-V, no internal-step branch) -- not a JSON workaround, per the architect's own FLAG-5 precedent for engine asks.
2. Architect FLAG 6 (no rounding drift) -- independently verified in the worked-numbers section above; confirmed clean at every state's 1-2 decimal display precision.
3. Architect FLAG 2 (S2 formula surface) -- confirmed epsilon-equals-V-plus-i-r used in S2's narration (s2_3) and canvas formula_overlay per the DoD table; S7 uses i-equals-epsilon-over-open-paren-R-plus-r-close-paren.
4. Re-verify the live engine_bug_queue at Gate 8 per architect Section 0a (physics_author has no DB tool this dispatch either -- same read-only-mirror caveat as the architect).
5. D1 regression: emf_definition's shared primitives (drawEmfCell, drawPotentialLadder, drawCircuitBeads) gained OPTIONAL trailing args for this diamond; their absence must reproduce today's emf_definition rendering pixel-identically -- re-run THE EYE on emf_definition alongside this concept (carried from architect Section 10 FLAG 4).

---

## Self-review checklist

- Every symbol referenced in the skeleton's state narratives (epsilon, r, R, switch, V, i, i_max, r_measured, charger_emf) appears in variables -- DONE
- No angle formulas -- radians() N/A -- DONE
- Every state's live control(s) declared exactly per the architect's control table (S3=R, S5=switch, S7=ALL, all others none) -- DONE
- Locks documented for every state that needs one, each with a one-line justification (Section 2) -- DONE
- Board mark scheme: DEFERRED, not drafted (Section 7) -- DONE
- Drill-down phrasings: 45 total (9 x 5), real-student-voice, casual/no-apostrophe style matching the emf_definition precedent -- DONE
- constraints block: 6 short, factual assertions (Section 1 JSON block) -- DONE
- Numerical sanity checks run for every state, independently, with zero rounding drift (Section 4) -- DONE
- Within-state motion timeline written for all 7 states, each a pure fn of the state clock, no two states sharing a motion, no static state (Section 3) -- DONE
- Rule 32 sequencing verified per state (cause-first, one-variable-moves, single focal) -- Section 3 cross-check paragraph -- DONE
- Word budget (Rule 31a) verified by script for all 7 states -- every guided state within its skeleton-assigned range, S7 at 19 of a max 20 (Section 5) -- DONE
- Engine bug queue consulted via read-only mirrors (architect's Section 0a table) -- same caveat flagged to quality_auditor -- DONE
- DC Pandey check: no formula, explanation, or example problem imported from external books -- every formula derived from i=eps/(R+r) (loop/Ohm's law) and its algebraic limits (R to 0, i to 0, sign reversal); the two-reading method derived directly from V=eps-ir solved for r, not copied from any textbook's specific numeric example. The five taught numbers (1.5/0.5/1.0/0.25/3.0) are this diamond's own choice, verified independently in Section 4, not sourced from any book's worked example.
- NEW finding: Engine-vs-skeleton tension found and resolved -- S1's ladder rendering would pre-spoil S2 if shown; resolved via show_ladder: false on S1, flagged to downstream (see Escalations item 1).
