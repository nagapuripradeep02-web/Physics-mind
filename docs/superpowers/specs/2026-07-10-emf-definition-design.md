# `emf_definition` — Design Spec (Ch.3 Current Electricity #5)

**Date:** 2026-07-10
**Renderer:** `particle_field` (2D p5.js) — new `scenario_type: "emf_definition"` in the CIRCUIT family (reuses the `combination_of_resistors` circuit engine)
**Pipeline:** Engine Phase A (renderer primitives) → Alex authoring pipeline (architect → physics_author → json_author → quality_auditor) → THE EYE → founder approval → TTS (EN+TE, Rule 30f)
**Status:** design approved (founder, 2026-07-10); ready for Phase A

> **This is Diamond 1 of a two-diamond split** (founder decision, 2026-07-10). Diamond 2 = `internal_resistance` (`V = ε − Ir`, the droop, short circuit, measuring r) is authored *next*, reusing this exact cell + potential ladder. The catalog (T34, CE-G4) splits `emf_definition` (A12) from `internal_resistance` (A13) as separate atomics; this spec is A12 only.

---

## 1. Why this concept, this order

NCERT §3.11. Chosen because it is the **conceptual root of the cells half of Ch.3** and the founder's requested next simulation ("EMF & internal resistance"), scoped down to emf alone per the two-diamond decision.

- The four shipped Ch.3 diamonds (`drift_velocity`, `ohms_law`, `resistivity`, `combination_of_resistors`) cover current, R, ρ, and resistor networks — all *passive*. `emf_definition` introduces the **source**: what actually pushes charge around a loop, and how much energy it hands each coulomb.
- **Dependency root (catalog A12 `required-by`):** A13 internal-resistance, A14 series, A18 grouping-of-cells, A22 galvanometer all need "what emf is" defined first.
- The id `cells_emf_internal_resistance` was *reserved* in `combination_of_resistors`'s scope note as a single deferred concept; per the two-diamond split it becomes **`emf_definition`** (A12) + `internal_resistance` (A13). No `emf_definition.json` exists yet.
- Rides the **proven CIRCUIT engine** from `combination_of_resistors` (loop / beads / geometry / ammeter / resistor / `stepCircuit`) — only emf-specific primitives are new.

## 2. Atomic claim

A cell is a **charge pump**. Its chemistry does work `W` on charge `q` to lift it from the − terminal (low potential) to the + terminal (high potential). The **emf** is that work *per unit charge*:

> **ε = W/q** — units **volts = joules per coulomb**.

ε is a **property of the cell's chemistry**, fixed and independent of the circuit or the current drawn. It is an *energy per charge*, **not a force** — "electromotive force" is a 19th-century misnomer (HC Verma §32.5). With no current flowing, an ideal voltmeter across the terminals reads exactly ε (this is how emf is measured, and the bridge to Diamond 2).

**The cell in this diamond is IDEAL (internal resistance r = 0).** Terminal voltage = ε at all times here. The droop under load (`V = ε − Ir`) is Diamond 2's job — D1 only *teases* it, and claims nothing about it. This keeps every on-screen statement honest.

**PRIMARY aha (state S3):** emf is the energy the cell gives each coulomb — measured in volts, never newtons; the ladder step (energy per charge) holds its height even when the charge count doubles.

## 3. Representation (approved: Circuit + potential ladder — "Approach A")

A single circuit loop (ideal cell + load + ammeter + flowing beads) on the left; a compact **potential-energy ladder** inset on the right. Each charge climbs a **step of height ε** inside the cell (the pump does work on it), rides flat along the top wire, and drops that same ε across the load as heat. **The step-up height literally IS ε = W/q.**

Chosen over the energy-hill (no loop) and water-tank analogy because it (a) maximizes reuse of the shipped CIRCUIT engine, (b) keeps all of Ch.3 one visual language, (c) makes the abstract per-charge energy a concrete step height with a real number, and — decisively — (d) **the ladder is built once and carries Diamond 2**: the droop becomes "the ladder now has a second, internal step across r that you didn't see before."

## 4. Engine additions — Phase A (`particle_field_renderer.ts`)

All additive, opt-in via a new `scenario_type` + state flags. **No change to `combination_of_resistors` / drift / ohms / resistivity behaviour.**

1. **Family gate.** `circuitMode()` (currently `scenario_type === 'combination_of_resistors'`) generalizes to also match `'emf_definition'` — extract an `isCircuitFamily()` helper so both share the loop/bead/`stepCircuit` re-sim path. The emf physics branch keys off the scenario_type inside.
2. **`drawEmfCell`** — the cell drawn as a charge pump: charges visibly rise inside the cell from − to + (the work-on-each-charge motion). Extends `drawBatteryC` (keeps the ε label).
3. **`drawPotentialLadder`** — the one genuinely novel primitive. Compact inset (x ≈ 540–740, y ≈ topY–botY): a potential-vs-position-around-the-loop staircase. **Step up ε at the cell, flat along the wire, step down ε across the load.** ε step height labeled with the live number. Gated by state flag `show_ladder: true`. Precedent for an inset graph: `drawVIGraph` (line ~1580).
4. **`drawVoltmeterC`** — voltmeter across the terminals (reuse the `drawAmmeterAtC` arc/needle style; reads **volts**, settles at ε). Gated by `show_voltmeter: true`.
5. **New glow keys** registered in `dimFor()`: **`pump · ladder · voltmeter · electrons · formula · load`**. ⚠ The glow enum is a **closed set** — any state `glow_focal` or per-sentence `glow` name not in the keyed set **silently dims the whole panel** (the `ohms_law` scar). json_author must map every architect/physics glow name onto this keyed set; THE EYE won't catch it (no TTS playback).
6. **Physics helpers (pure functions of ε, R, switch):** `cEmf()` (ε slider), `cLoadR()`, single-loop `i = swOpen ? 0 : ε / R` (ideal cell, r = 0). Terminal `V = ε` always (open or closed) in D1.
7. **State flags:** `pump_focus` (S1), `show_ladder` (S2+), `charge_double` (S3 intensive-invariance auto-play), ε-slider live (S4), `open_circuit` + `show_voltmeter` (S5).

**New-renderer bring-up contract (the scars that bit on day 1 — must all hold):**
- Cue-gated visuals must be derivable at **any** pinned sim-time incl. t=0 (share the gate math between `stepCircuit` and `resetToHomePose`; never hardcode post-cue values in reset).
- Any clock-driven in-state animation (`charge_double`, the ladder draw-in) with no scenario_cue makes THE EYE's `__frozen` frame land mid-animation → teach `deriveStateMeta.pfRevealMs` the settle time so the frozen pin lands after it.
- Register any new `*_at_ms` / autosweep in `deriveStateMeta` (D7/reveal_hold) and the `#sliders` exclusion chain, else THE EYE false-fails / a stale panel bleeds.
- No backticks in `FIELD_3D_RENDERER_CODE` / the particle_field code string.
- `window.__PM_supportsTimePin = true`, handle `RESET_TRAJECTORY` as home-pose reset, use `ceil` (not `floor`) for the re-sim step count.

**Engine sequencing (approved):** Phase A first, verified, THEN author. **Shared-renderer no-race:** `particle_field_renderer.ts` is shared/uncommitted across sessions — `git status`/diff-first, region-disjoint additive edits only, re-read before each Edit, never commit over a parallel session's work.

## 5. State arc (6 states — Rule 31 word budget 25–55 EN words, Rule 32 legibility)

| # | Title (working) | Teaches (ONE idea) | Motion archetype | Δ cue (≤5 words) | Live controls | Glow focal | Advance |
|---|---|---|---|---|---|---|---|
| S1 | The cell does work | The cell is a charge pump — it works on each charge | pump-lift (charges rise − → + inside cell) | "Cell lifts each charge" | — | `pump` | manual_click |
| S2 | How big is the lift | ε = W/q — the potential ladder; 1.5 J per coulomb | ladder-trace (ride up ε, flat, down across load) | "The lift, measured" | — | `ladder` | manual_click |
| S3 | Per charge, not a force | ε is energy **per charge**; volts = J/C (PRIMARY aha) | intensive-invariance (double the beads, step holds) | "Per charge — not a force" | — | `ladder` | manual_click |
| S4 | Different cells | ε is set by chemistry — bigger cell, taller lift | step-scale (contrast pair w/ S2) | "Bigger ε, taller lift" | ε | `ladder` | manual_click |
| S5 | Measuring emf | No current → voltmeter reads full ε (bridge to D2) | halt-settle (loop opens, needle settles at ε) | "No current → V = ε" | — | `voltmeter` | manual_click |
| S6 | Explore | put it together | sandbox (all dials live) | "All yours" | ε, R, switch | `formula` | interaction_complete |

- Distinct archetype per state; **S2 ↔ S4 are a declared contrast pair** (reveal-and-trace the ladder vs scale its step) — the only allowed archetype repeat.
- Explore-last (S6): duration 0, all controls, `interaction_complete`.
- ≥2 distinct advance_mode (manual_click ×5 + interaction_complete) — Gate 12 ✓.
- Single glow focal per state (Rule 32e); one variable moves per guided state (Rule 32b); cause-first (Rule 32a): the pump/ε change moves *before* the ladder/needle responds.

## 6. Misconception beat (Rule 16a — at the pivot, not per-state)

- **S3 (primary, the PRIMARY-aha state):** belief *"emf is a force — the name says so."* Counter (straightforward contrast-in-motion, no predict-pause): the emf is measured in **volts = joules per coulomb**, and when the bead count (charges/second) doubles, the **ladder step height ε is unchanged** — it is an *intensive per-charge* property, not a force that scales with the amount of charge. One-line fix: *"emf is the energy the cell hands each coulomb — measured in volts, never newtons."*
- This is the catalog's A12 EPIC-C wrong belief, confronted inside EPIC-L per the EPIC-L-first directive.

## 7. Rule 33 (macro↔micro) — N/A here, by design

emf's true mechanism is **electrochemical** (electrode reactions moving ions), which is **outside A12's atomic scope** (A12 = the *definition* ε = W/q + the pump model + "not a force"; the chemistry is a later/separate concern). There is therefore **no macro/micro split-canvas** — the **potential ladder is the mechanism visualization at the correct level** (energy per charge, carrying a real number: 1.5 J/C for a dry cell). Stated here so quality_auditor does not false-fail a missing dual-level view.

## 8. Indian real-world anchor

The **emf hierarchy of real Indian cells** — a **1.5 V Eveready dry cell** (torch), a **2 V lead-acid cell** (inverter bank / the cells in a car battery), a **3.7 V phone Li-ion**, a **12 V car battery** — each hands every coulomb a *different number of joules*. The **chemistry sets ε; the circuit never does.** (Secondary framing available for S4.)

## 9. Registration (8 sites — id `emf_definition` is NEW, unregistered)

1. `src/data/concepts/emf_definition.json` (the concept; ≥3 primitives/state, varied advance_mode, conceptual-only — no `mode_overrides`, no `epic_c_branches`).
2. `concept_panel_config` INSERT (or `CONCEPT_PANEL_MAP` in `panelConfig.ts`).
3. `CONCEPT_RENDERER_MAP` in `aiSimulationGenerator.ts` → `particle_field`.
4. `VALID_CONCEPT_IDS` in `intentClassifier.ts`.
5. `PCPL_CONCEPTS` — **N/A** (particle_field circuit, not PCPL/2D-forces); confirm whether the particle_field circuit family needs listing the way `combination_of_resistors` was.
6. `CLASSIFIER_PROMPT` (+ `ASPECT_VOCABULARY`) in `intentClassifier.ts`.
7. `supabase_migrations/supabase_2026-07-10_seed_emf_definition_*_migration.sql` (authored-not-applied; clusters migration is dormant this phase — do not let the auditor false-FAIL Gate 8 on it).
8. Seed script `src/scripts/_seed_emf_definition_cache.ts` storing `physics_config = { epic_l_path, particle_field_config }` for THE EYE.

## 10. Definition of Done

- `npx tsc --noEmit` = 0 errors; `npm run validate:concepts` target PASSES.
- Rule 15 (≥2 advance_mode), Rule 19 (≥3 primitives/state), Rule 24 (labels/equations only, reads sound-off), Rule 31 (per-state contextual controls, word budget, distinct motion), Rule 32 (cause-first, delta-cue, home-pose, single focal).
- THE EYE (`visual:eyes` + eye-walker read) with **zero new `engine_bug_queue` rows**; every guided state's ε step / needle / pump reads correctly on the `__frozen` frame.
- EN+TE audio rendered LAST (after founder visual approval, before teacher handoff), Telugu via the Sonnet-5 subscription sub-agent (Rule 30g), draft until native review.
- Ships the potential-ladder engine in a state Diamond 2 can reuse verbatim.

---

*Diamond 1 of 2. The ladder built here is the same device that will make Diamond 2's `V = ε − Ir` droop legible — build once, teach twice.*
