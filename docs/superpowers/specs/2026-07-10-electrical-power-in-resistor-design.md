# Design Spec — `electrical_power_in_resistor` (Ch.3 §3.9, Electrical Power & Joule Heating)

**Date:** 2026-07-10
**Author:** Claude (brainstorm with founder)
**Status:** APPROVED design — pending founder spec review → writing-plans
**Chapter:** 3 (Current Electricity) · **Section:** §3.9 · **Concept tier:** complex
**Renderer:** `particle_field` (2D p5.js), new `scenario_type: "electric_power"` in the existing circuit family

---

## 1. One-line atomic claim

A resistive load converts the electrical energy falling charges lose into heat/light at the rate
**P = VI = I²R = V²/R**; energy delivered is **P·t** (Joule heating). Whether a *higher* resistance
dissipates *more* or *less* power is **not fixed** — it depends on what is held constant: at fixed
**current** (series) higher R ⇒ more power (P = I²R); at fixed **voltage** (parallel) higher R ⇒ *less*
power (P = V²/R).

## 2. Where it sits

Sixth Ch.3 diamond, continuous with `drift_velocity` → `ohms_law` → `resistivity` →
`combination_of_resistors` → `emf_definition` → `internal_resistance` (all shipped). NCERT §3.9 sits
between resistivity and combination-of-resistors; it is a *foundational backfill* — the last basic
block before the circuit-application cluster (Kirchhoff → Wheatstone → potentiometer). The
`combination_of_resistors.json` scope note explicitly defers "power/heating in combinations" to this
concept.

**PRIMARY aha:** the series→parallel brightness *flip* (STATE_5) — the higher-resistance bulb wins in
series and loses in parallel; "more resistance ⇒ more power" is only half-true.

## 3. Scope

**IN:**
- P = VI as the rate of energy delivery (STATE_1).
- The three algebraic faces P = VI = I²R = V²/R as one quantity (STATE_2).
- Joule heating: power is a rate, energy = P·t accumulates (STATE_3).
- The R-vs-power misconception, staged as a series-confirms / parallel-flips contrast pair using two
  **rated** bulbs (STATE_4 series, STATE_5 parallel).
- Explore: all controls (STATE_6).

**OUT (own catalog concepts, not here):**
- Maximum power transfer (R = internal r) — `grouping_cells_mixed_max_power_transfer`.
- High-voltage power transmission (P_c = P²R_c/V²) — `power_transmission_high_voltage`.
- Bulb power *rating* as a standalone taught idea — folded into the flip via the two bulbs' nameplates;
  the "run a bulb below rated voltage" drill lives in explore / a drill-down cluster, not a guided state.
- Combinations reduction drills, Kirchhoff, RC heating.

## 4. Apparatus & central visual (decided)

**Glowing bulbs — brightness ∝ watts.** A bulb is a resistor that shows its own dissipation as light,
so brightness is the most intuitive "power meter" a student already trusts, and it makes the
misconception flip visible in one glance. The heat/Joule-heating idea rides along via filament glow +
heat halo + a live energy counter. (Options B "resistor-box + thermometer" and C "hybrid" were
considered and rejected — "brighter = more power" reads far better than "hotter halo = more power.")

## 5. State arc + Rule-31 per-state control table

6 states (5 guided + explore). S4↔S5 is the declared Rule-31 contrast pair.

| State | Teaches (ONE idea) | Motion archetype + ≤5-word delta cue | Live controls | advance_mode |
|---|---|---|---|---|
| **S1** | A bulb turns the energy charges lose into light+heat: **P = VI** (rate of energy delivery) | *power-on glow* — "Bulb turns watts to light" | V (battery) | manual_click |
| **S2** | Same watts, three faces: **P = VI = I²R = V²/R** | *three-way recompute* — "Same watts, three ways" | V | manual_click |
| **S3** | Power is a **rate**; energy = **P·t** piles up as heat (the "bill") | *accumulate* — "Energy piles up as heat" | R (sets power level) | auto_after_tts (motion auto-plays) |
| **S4** | Two rated bulbs in **SERIES** — same current → **P = I²R** → **3 W (higher-R)** bulb brighter; higher-wattage bulb loses | *series contrast* (pair A) — "Series: higher-R bulb wins" | — (watch beat) | manual_click |
| **S5** | Same two in **PARALLEL** — same voltage → **P = V²/R** → **6 W (lower-R)** bulb brighter, each at its exact rating. **THE FLIP** | *parallel re-land* (pair B, PRIMARY aha) — "Parallel — brightness flips" | — (watch beat) | manual_click |
| **S6** | explore | *interaction_complete* — everything responds | V, R1, R2, topology, switch | interaction_complete |

Control-panel discipline (Rule 31): panel built once in the scenario build fn, rows shown/hidden per
state; shared V slider keeps the same screen position across S1/S2/S6. ≥2 distinct advance_mode values
(Gate 12) satisfied. No `wait_for_answer`, no `pause_after_ms` (Rule 31, new concept). Single-bulb
movement (S1–S3) reuses the **6 W bulb** as its reference so M1 and M2 share apparatus (Rule 32d home-pose
continuity).

## 6. Calibration (clean numbers, battery-scale, Rule-35 safe)

Battery-scale continuous with every Ch.3 sibling: V = 6 V default, Ω-scale bulbs, **no hidden
calibration constant, no hardcoded mains voltage**. Two rated bulbs at 6 V:

- **"6 W" bulb → R = V²/P = 36/6 = 6 Ω**
- **"3 W" bulb → R = 36/3 = 12 Ω**

| | 6 W bulb (R=6 Ω) | 3 W bulb (R=12 Ω) | Result |
|---|---|---|---|
| **Series** @6 V (I = 6/18 = 0.333 A) | P = I²R = 0.667 W | P = I²R = 1.333 W | 3 W bulb **2× brighter** — higher-wattage bulb loses |
| **Parallel** @6 V (each sees 6 V) | P = V²/R = 6.0 W | P = V²/R = 3.0 W | 6 W bulb **2× brighter — each at exact nameplate** |

Single-bulb reference: 6 W bulb at 6 V ⇒ I = 1 A, P = VI = 6 W; three faces all = 6 W (VI = 6·1;
I²R = 1²·6; V²/R = 36/6). This toy 6W/3W-at-6V pair reproduces the household **100 W vs 60 W** flip
*exactly* (same direction — higher-nameplate bulb dim in series, bright in parallel), so narration names
that real case as the **universal anchor** (Rule 35: an electric bulb, a kettle/heater coil — no
country-specific culture, no "Indian home") while the sim stays battery-scale and legible. In parallel,
each bulb hitting its precise nameplate (6.0 / 3.0 W) makes "rating = power at rated voltage"
self-evident.

## 7. Engine plan (additive; siblings byte-identical)

Circuit family in `src/lib/renderers/particle_field_renderer.ts`:
`isCircuitFamily() = circuitMode() || emfMode() || irMode()`, each a `scenario_type` sharing
`circuitInitBeads()` / `stepCircuit()` / `drawBatteryC` / `drawResistorBoxC` / geometry / topology /
switch / `drawAmmeterAtC`, with a per-mode branch in `updateReadouts()`.

**Reused verbatim (no new physics):** `circuitInitBeads()`, `stepCircuit()` (deterministic — beads are
a pure function of `PM_simTimeMs`; THE EYE re-sims frames), `drawBatteryC`, wire-loop geometry,
series/parallel topology + junction split by conductance, the branch `switch`, `drawAmmeterAtC`.

**New, additive (drift/ohms/resistivity/emf/ir untouched):**
1. `powerMode()` = `scenario_type === 'electric_power'`; add to `isCircuitFamily()`.
2. `drawPowerScenario()` render branch (sibling of `drawEmfScenario` / `drawIrScenario` / `drawCircuit`),
   dispatched in the `isCircuitFamily()` block.
3. `updateReadouts()` power branch.
4. **New primitive `drawBulbC(cx, cy, rating, R, P, Pmax, dim)`** — glass envelope + filament with
   glow intensity ∝ √(P/Pmax) (this IS the watt-meter), heat halo (extends the existing i²R halo), a
   nameplate showing **rating + resistance** (`"6 W · 6 Ω"` / `"3 W · 12 Ω"`), and live `P = x.xx W`
   below. The one real primitive to build. **The resistance is on-canvas on purpose** (added 2026-07-11,
   founder review): the whole pivot turns on which bulb is higher-R, so R must be *visible* — the sim now
   reads correctly sound-off (Rule 24) and "higher-R wins/loses" is grounded, not just narrated. In S3 the
   `Ω` label updates live as the bulb-R slider moves.
5. **Power/energy adapter (honest, no fudge):** `cPower` per bulb `P = V_bulb · I_bulb` derived from the
   same `cVolt`/`cCurrents` the circuit engine already computes (so P = VI = I²R = V²/R are identically
   consistent); **energy accumulator** for S3 `E += P·dt` on the state clock (resets in `rebuildScene`),
   shown as a climbing `E = xx J` readout.

## 8. Legibility (Rules 32–34)

- **32e single glow focal:** in contrast states the *brighter* bulb is the focal (glows, peer dims) —
  physically honest, since it genuinely dissipates more. Emphasis is brightness, never size (Rule 29).
- **32a cause-first:** topology change / knob moves first; brightness responds a readable beat later.
- **32c delta-cue captions ≤5 words** (see table). **32b one-variable-moves** in guided states.
- **34a** on-canvas top caption = delta cue only; prose narration in the `#capStrip` below the canvas.
- **34b ONE formula surface per state:** `P = VI` (S1) → `P = VI = I²R = V²/R` (S2) → `P = I²R` (S4) →
  `P = V²/R` (S5); value-only HUD `P = 6.0 W`, `E = 60 J`.
- **34c Unicode across all three text paths** (DOM overlays + canvas-drawn readouts + any label sprites):
  P, I², V², Ω, ·, →, ² — never ASCII (`I2`, `V^2`, `ohm`).
- **34d** overlays never collide — HUD clears the review-chrome "Full screen" button (top:52px+);
  formula / readout / sliders occupy distinct zones.

## 9. Misconception beats (Rule 16a — straightforward, no predict-pause)

- **Belief A: "higher R always dissipates more power."** `misconception_watch` at S4 notes students
  over-generalize the series result; S5 is the straightforward contrast beat — the wrong expectation
  (high-R/3 W bulb still brighter) shown, then the real physics (low-R/6 W bulb brighter). Confirmed at
  fixed I, broken at fixed V.
- **Belief B: "the higher-wattage bulb is always brighter."** Dies across the same S4→S5 pair (the 6 W
  bulb is dimmer in series, brighter in parallel).

Misconception hooks at genuine pivots only (S4/S5), not per-state (feedback rule). EPIC-L-first — no
`epic_c_branches`. Conceptual-only — no `mode_overrides`.

## 10. THE EYE bring-up (new-scenario gotchas — from the scar list)

A new `scenario_type` also needs:
- `deriveStateMeta` entries: motion expectations + `pfRevealMs` reveal pins for the S3 energy-settle and
  the S5 flip re-land (else `__frozen` frame catches mid-animation / false "motion died").
- The `#sliders` exclusion chain extended for the new mode (else a stale panel bleeds).
- Cue-bearing state flags valid at t=0.
- Re-seed the concept cache after restructuring so `deriveMotionExpectations` reads the new config.

## 11. Registration — 8 sites (root CLAUDE.md §6)

1. `src/data/concepts/electrical_power_in_resistor.json`
2. `concept_panel_config` SQL / `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts` → `particle_field`
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts`
5. `allow_deep_dive` — N/A (deep-dive dormant)
6. bundle split — N/A
7. `PCPL_CONCEPTS` — **NOT added** (particle_field, not PCPL/2D-forces)
8. `CLASSIFIER_PROMPT` (+ `ASPECT_VOCABULARY`) in `src/lib/intentClassifier.ts`
Plus: `supabase_migrations/supabase_2026-07-10_seed_electrical_power_in_resistor_clusters_migration.sql`
(authored-not-applied) + a `_seed_electrical_power_in_resistor_cache.ts` script.

## 12. Reuse ledger / effort

~1 new primitive (`drawBulbC`) + 1 render branch + 1 readout branch + a power/energy adapter, all on a
proven circuit engine. Moderate, well-bounded — comparable to the `internal_resistance` engine delta.

## 13. Risks / open items

- Two bulbs both glow in contrast states — the "single glow focal" is the *winning* bulb; verify the
  peer dims enough to read the contrast (eye-walker check).
- Energy accumulator must reset deterministically per state entry (rebuildScene) or THE EYE re-sim drifts.
- `Pmax` normalization for `drawBulbC` glow: pick a fixed `Pmax` (e.g. 6 W) so brightness is comparable
  across states, not auto-scaled per state (auto-scale would hide the series-vs-parallel magnitude flip).
- concept_id: `electrical_power_in_resistor` (catalog-canonical); slightly narrow vs "bulbs," but kept
  for registry consistency.

## 14. Definition of Done

`npx tsc --noEmit` 0 · `npm run validate:concepts` PASS · THE EYE all-states motion-pass, zero new
`engine_bug_queue` rows · eye-walker per-state walk clean · quality_auditor PASS · siblings
byte-identical (emf/ir/combination/resistivity/ohms/drift re-EYE H2 0.00%). Ship (Rule 30f/g EN+TE
audio, visual:approve) is a separate founder-gated step after approval.
