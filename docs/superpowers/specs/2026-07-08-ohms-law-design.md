# `ohms_law` — Design Spec (Ch.3 Current Electricity #2)

**Date:** 2026-07-08
**Renderer:** `particle_field` (2D p5.js) — reuses the `drift_velocity` engine
**Pipeline:** Engine Phase A (renderer primitives) → Alex authoring pipeline (architect → physics_author → json_author → quality_auditor)
**Status:** design approved (founder, section-by-section 2026-07-08); ready for Phase A

---

## 1. Why this concept, this order

NCERT §3.4 / §3.6. Chosen by **NCERT sequence + concept dependency**:

- `drift_velocity` (§3.5) is shipped — it already derived the *microscopic* origin: `i = neAv_d`, `v_d = eEτ/m`, and the resistivity `ρ = m/ne²τ`. Ohm's law is the *macroscopic* law those combine into.
- **Dependency root:** every remaining Ch.3 concept (resistivity, series/parallel combos, power, cells & internal resistance, Kirchhoff, the bridges) needs `R` defined first. `V = IR` is the keystone.
- `ohms_law` is already reserved in `VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT` (intentClassifier.ts line ~653: "V=IR, non-ohmic conductors, current same through series resistors") but **no `ohms_law.json` exists** — an unbuilt placeholder.
- Cheap win on the *proven* particle_field engine — no bridge-primitive detour.

## 2. Atomic claim

For a metallic conductor at constant temperature, **`V = IR`**: current is directly proportional to the potential difference across it, and `R` (resistance) is the constant of proportionality = the slope of the V–I line.

Microscopic bridge (from drift): `I = neAv_d`, `v_d = eEτ/m`, `E = V/L` ⟹ `I = (ne²Aτ/mL)·V` ⟹ `V = IR` with `R = mL/(ne²Aτ) = ρL/A`.

**PRIMARY aha (state S2):** the straight line through the origin on the V–I graph *is* Ohm's law; its slope is R.

## 3. Representation (approved: Hybrid)

Top: the drift wire (electrons drift faster as V rises = the CAUSE). Bottom-corner: a live **V–I graph panel** that traces a straight line as V changes (= the LAW). Microscopic cause → macroscopic law, continuous with `drift_velocity`.

## 4. Engine additions — Phase A (`particle_field_renderer.ts`)

All additive, opt-in via new config fields (mirrors how drift's modern features were added). **No changes to existing drift behaviour.**

1. **V–I graph panel** (the one genuinely new primitive)
   - Gated by state flag `show_vi_graph: true`.
   - Axes box (V on x, I on y), an **operating point** at the live (V, I), and an accumulating **trace** of the line swept so far.
   - Slope readout = `R = V/I` (Ω).
   - Cause-first (Rule 32a): on a V change the operating point moves first, the trace extends after a readable beat. Reuse the existing cue-gate machinery (`updateCueGates` / `SET_CUE_TIME`) so it re-times to narration and re-sims deterministically for THE EYE.
   - Deterministic under `SET_TIME_FREEZE`: the trace must be a pure function of pinned `PM_simTimeMs` + slider state (no accumulation that survives `resetToHomePose`).
2. **`V` slider** → maps internally to `E = V/L` (author `L` in `formula_anchor.constants`). Existing `realDriftVelocity()`/`realCurrent()` stay the source of truth for I; add `realResistance()` = V / I.
3. **`R` control** → reuses a *physical* lever already in the engine: a higher-R "wire/material" = lower **τ** (`R = mL/ne²Aτ`, holding A and L fixed so the wire geometry on screen never changes — only the drift responsiveness does). Exposed as a single labelled "Resistance R" slider that drives τ inversely under the hood — no new physics, and A stays reserved for the drift concept.
4. **Non-ohmic mode** (`ohmic: false` on a state): effective R rises with current (filament heats, τ falls with I) so the traced V–I line **curves upward** (concave). Ohmic states leave R constant = straight line.
5. **S4 conserved-current viz** (`show_flux_conservation: true`): mark a plane *before* and *after* a resistor region; per-second electron crossings are equal (two small tallies that stay matched), while a colour/voltage gradient across the resistor shows the DROP. Native to the drift engine — no circuit primitives.

**Engine sequencing (approved):** Phase A first, verified, THEN author. Per the no-race rule, **diff-first** against the uncommitted `drift_velocity`-session changes in the shared tree; region-disjoint, additive edits only; re-read before each Edit; do not commit over the parallel Ch.6 session.

## 5. State arc (6 states — Rule 31 word budget 25–55 EN words, Rule 32 legibility)

| # | Title (working) | Teaches (ONE idea) | Motion archetype | Δ cue (≤5 words) | Live controls | Advance |
|---|---|---|---|---|---|---|
| S1 | Push drives flow | Voltage is the *cause* of current | cause→effect (V on → drift → I) | "Battery on" | — | manual_click |
| S2 | Double V, double I | I ∝ V (PRIMARY aha) | accumulate/trace a straight line | "Double the push" | V | manual_click |
| S3 | The slope is resistance | R = V/I; bigger R = steeper line | tilt (contrast pair w/ S2) | "Steeper means more R" | R | manual_click |
| S4 | Nothing is used up | Current conserved; voltage is spent | count-in = count-out across resistor | "Same current, less V" | — | manual_click |
| S5 | When the line bends | Ohm's law is ohmic-only (filament) | line bends off straight (contrast w/ S2) | "The bulb bends it" | V | manual_click |
| S6 | Explore: V and R | put it together | sandbox, point rides the curve | "Both dials yours" | V, R | interaction_complete |

- Distinct archetype per state; S2↔S3 and S2↔S5 are declared contrast pairs (allowed repeat).
- Explore-last (S6): duration 0, all controls, `interaction_complete`.
- ≥2 distinct advance_mode (manual_click ×5 + interaction_complete) — Gate 12 ✓.
- Single glow focal per state (Rule 32e); one variable moves per guided state (Rule 32b).

## 6. Misconception beats (Rule 16a — at pivots, not per-state)

1. **S4 (primary):** "current is used up / decreases after the resistor." Counter: equal crossings in/out; the DROP is in V, not I.
2. **S5:** "V=IR always, R is a universal constant." Counter: the filament's V–I curve bends — R is constant only for ohmic materials at constant temperature.

## 7. Registration (8 sites — id `ohms_law` already partially registered)

`ohms_law` already in `VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT`. json_author still verifies/adds: `src/data/concepts/ohms_law.json`, `concept_panel_config` (SQL/panelConfig), `CONCEPT_RENDERER_MAP` (→ particle_field), `PCPL_CONCEPTS` (particle_field concepts — confirm drift_velocity's handling), clusters migration `supabase_<date>_seed_ohms_law_clusters_migration.sql` (authored-not-applied), `ASPECT_VOCABULARY`. Conceptual-only: no `mode_overrides`, no `epic_c_branches`.

## 8. Indian real-world anchor

Primary: a household dimmer / regulator — turning the knob raises the voltage across the fan or bulb and the current climbs in step (the straight-line law you can feel). Filament bulb dimming = the S5 non-ohmic curve (the bulb glows dimmer *and* its resistance shifts as it cools). NCERT-anchored, plain English, no Hinglish.

## 9. Definition of Done

- `npx tsc --noEmit` 0 errors; `npm run validate:concepts` PASSES.
- THE EYE (`visual:eyes -- ohms_law`) 6/6 states ×2, zero new `engine_bug_queue` rows; eye-walker + quality-auditor PASS.
- V–I graph reads correctly sound-off (Rule 24): axes labelled V/I, slope=R visible, straight for ohmic / curved for filament.
- Founder hand-test of S6 trusted-drag sliders (THE EYE can't fire trusted events).
- Ship EN+TE audio LAST (Rule 30f), after founder visual approval.

## 10. Out of scope (deferred, dependency-correct)

Resistivity `ρ = m/ne²τ` and its temperature dependence (→ `resistivity`, `temperature_dependence_of_resistance`), series/parallel combination (→ `series_resistance`/`parallel_resistance`), power `P=VI` (→ `electric_power_heating`), EMF & internal resistance, Kirchhoff, bridges. Ohm's law defines R only; the rest build on it.
