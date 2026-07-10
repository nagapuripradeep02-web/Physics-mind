# `internal_resistance` — Design Spec (Ch.3 Current Electricity #6)

**Date:** 2026-07-10
**Renderer:** `particle_field` (2D p5.js) — new `scenario_type: "internal_resistance"` in the CIRCUIT family (reuses the `emf_definition` cell + potential ladder + voltmeter verbatim)
**Pipeline:** Engine Phase A (renderer primitives) → Alex authoring pipeline (architect → physics_author → json_author → quality_auditor) → THE EYE → founder approval → TTS (EN+TE, Rule 30f/30g)
**Status:** design approved (founder, 2026-07-10 — "your best and high value recommendation"; measurement = two-reading method, charging state INCLUDED, engine = new scenario_type); ready for Phase A

> **This is Diamond 2 of the two-diamond split** (founder decision, 2026-07-10). Diamond 1 = `emf_definition`
> (A12, SHIPPED same day) built the cell, the potential ladder, and the voltmeter with an IDEAL cell (r = 0)
> and promised: "a real cell has more to tell once current flows again." This diamond redeems that promise by
> revealing the hidden r inside that same cell. Catalog: T34 CE-G4, atomic **A13
> `internal_resistance_terminal_voltage`** (+ nano N13.1 open-circuit V = ε).

---

## 1. Why this concept, this order

NCERT §3.11 (second half). The five shipped Ch.3 diamonds (`drift_velocity`, `ohms_law`, `resistivity`,
`combination_of_resistors`, `emf_definition`) end with an IDEAL cell whose terminal voltage never sags.
Every real circuit question after this point (cells in series/parallel A18/A19, max power transfer A20,
potentiometer r-measurement A26) needs the real cell: **V = ε − Ir**.

- **Dependency (catalog A13):** requires A6 (R = ρL/A) + A12 (emf) — both shipped. Required by A14/A15/A16.
- **Reuses Diamond 1's engine wholesale:** the charge-pump cell, the potential ladder (the money primitive),
  the terminal voltmeter, the single-loop bead engine — all shipped and baselined. Phase A here is small
  and additive.
- The D1 spec explicitly reserved this diamond: *"the droop becomes 'the ladder now has a second, internal
  step across r that you didn't see before.'"*

## 2. Atomic claim

A real cell has a resistance **r hidden inside it** — its electrolyte and electrodes resist the very
current the cell drives. Whenever current i flows, **i·r volts are spent inside the cell itself**, so the
terminals deliver only

> **V = ε − i·r** (discharging) — the terminal voltage droops below the emf, and the droop grows with i.

Limits that follow from the same one line:
- **Open circuit (i = 0):** V = ε exactly — the D1 bridge (N13.1), still true for a REAL cell.
- **Short circuit (R → 0):** ALL of ε is spent inside — V → 0 and the current caps at **i_max = ε/r**
  (never infinite: r is the ceiling).
- **Charging (current forced backwards by an external source):** the terminals must sit ABOVE the emf —
  **V = ε + i·r**.
- **Measuring r (two-reading method):** open → ε; loaded → V and i; **r = (ε − V)/i**.

**PRIMARY aha (S2):** the missing volts were never lost — they are spent *inside the cell*, across a
resistance you couldn't see; the ladder grows a second, internal step of height i·r before the charge
even reaches the terminal.

## 3. Representation — same apparatus, one new secret

Identical loop + ladder + voltmeter to `emf_definition` (home-pose continuity, Rule 32d — the teacher's
class recognizes the apparatus instantly). The diamond OPENS where D1 ended: switch open, voltmeter
reading the full ε = 1.5 V. Then the switch closes and **the needle droops to 1.00 V** — the phenomenon
first, unexplained (S1). The reveal (S2): the cell's casing opens to show a small resistor **r INSIDE**,
and the ladder grows the internal step — up ε, down i·r *still inside the cell*, so the
terminal-to-terminal height is only V. Chosen because the D1 spec pre-designed the ladder for exactly this
(build once, teach twice), and because "reveal the hidden part of an apparatus you already trust" is the
strongest possible misconception confrontation for *"a 1.5 V cell always delivers 1.5 V."*

**Measurement = two-reading method** (founder-selected over the V–I droop-line graph): open → ε,
closed → V + i, r computed on-screen. Zero new panels; the droop-line graph is deferred (a natural
potentiometer-diamond echo later, A26).

## 4. Physics numbers (all exact, student-checkable — chosen so every taught value lands clean)

| Quantity | Value | Where it appears |
|---|---|---|
| ε (default) | **1.5 V** | D1 continuity; slider 1–12 V, step 0.1 |
| r (default) | **0.5 Ω** | slider 0.1–2 Ω, step 0.1 (realistic dry-cell range) |
| R load (default) | **1.0 Ω** | slider 0.25–12 Ω, step 0.25 |
| Home current | i = 1.5/(1.0+0.5) = **1.0 A** | same 1.0 A home pose as D1 |
| Home droop | i·r = **0.50 V** | the internal step height |
| Home terminal V | **1.00 V** | needle glides 1.50 → 1.00 on S1's switch-close |
| S3 sweep end (R → 0.25 Ω) | i = **2.0 A**, droop = **1.00 V**, V = **0.50 V** | droop exactly doubles when i doubles |
| Short circuit (S4, R → ~0) | V = **0**, i_max = 1.5/0.5 = **3.0 A** | the r ceiling |
| Two readings (S5) | 1.50 V open; 1.00 V @ 1.0 A closed → r = 0.50/1.0 = **0.5 Ω** | the measurement |
| Charging (S6) | ideal charger ε_ch = 3.0 V + series R = 1.0 Ω → i = (3.0−1.5)/1.5 = **1.0 A**, V_cell = 1.5+0.5 = **2.00 V** | perfect ±0.50 V mirror of S3's start, at the same 1.0 A |

## 5. Engine additions — Phase A (`particle_field_renderer.ts`)

All additive, opt-in via the new `scenario_type` + state flags. **Shipped `emf_definition` behaviour stays
pixel-identical** — shared primitives gain OPTIONAL trailing parameters whose absence reproduces today's
rendering exactly (its 6 locked baselines are the regression proof).

1. **Family gate.** `irMode()` (`scenario_type === 'internal_resistance'`); `isCircuitFamily()` extends to
   `circuitMode() || emfMode() || irMode()`. Dispatch inside the family branch: `drawIrScenario()`.
2. **Physics.** `irCurrents()` → `{ eps, r, R, i, Vterm, mode }`, pure function of sliders/state locks:
   discharge `i = ε/(R+r)`, `Vterm = ε − i·r`; open `i = 0`, `Vterm = ε`; short (state-driven R sweep → ~0)
   same formula; charging `i = (ε_ch − ε)/(R + r)` with fixed ideal ε_ch = 3.0 V, `Vterm = ε + i·r`.
   Per-state numeric locks (`st.emf/st.r/st.R/st.switch`) win over sliders — reorderable-rail safety
   (Rule 25d), same pattern as D1.
3. **`drawEmfCell` r-reveal extension** (optional args, default = D1 look): when `r_reveal` is active the
   casing widens to show a small zigzag **r** between the plates and the + terminal, with a live
   `i·r = 0.50 V` drop label; a heat shimmer scales with i²r so the short-circuit state visibly cooks the
   cell interior (S4).
4. **`drawPotentialLadder` internal-step extension** (optional `rDrop`/`mode` args, default = D1 profile):
   discharge profile becomes up ε → **down i·r inside the cell band** → flat wire → down V across the
   load; open stays flat-at-ε (D1 behaviour). Charging profile: charger lifts to ε_ch → down i·R across
   the series resistor → across the cell band down ε (stored) + down i·r (heat), with the cell's
   terminal-to-terminal height labeled V = 2.0 V; ladder vmax scales to ε_ch in that mode; zone labels
   swap to charger/R/cell. The S2 internal step draws in as a one-shot reveal (cause-first: r appears in
   the cell, THEN the ladder grows its step).
5. **`drawChargerC`** — the ONE new primitive: an ideal second source on the RIGHT edge of the existing
   loop (mirrored `drawEmfCell` styling, label `charger 3.0 V`), gated by `charging: true`. Bead flow
   reverses (the charger wins): negative effective speed through the existing `circuitBeadS` path.
6. **New glow keys** registered in `dimFor()`: **`r_internal` · `charger`** (joining
   `pump · ladder · voltmeter · load · electrons · formula`). ⚠ The glow enum is a CLOSED set — any
   unkeyed `glow_focal`/per-sentence `glow` silently dims the whole panel (the `ohms_law` scar).
7. **State flags:** `droop_intro` (S1 one-shot switch-close cue ~1500 ms: beads start + needle glides
   1.50 → 1.00), `r_reveal` (S2 one-shot), `R_autosweep_down` + `R_autosweep_to` (S3 sweep 1.0 → 0.25,
   start 700 + dur 3200, teacher-seizable, mirrors D1's `emf_autosweep`), `short_circuit` (S4 sweep
   R → 0 EXACTLY so the taught i_max = ε/r = 3.0 A lands — safe, the denominator is R+r ≥ r > 0; heat
   shimmer scales with i²r), `two_reading` (S5 one-shot sequence: open-hold → cued close → computed
   `r = (ε−V)/i` line appears; NEVER an endless cycle — the resistivity `material_cycle` scar),
   `charging` (S6). Readout panel (`updateReadouts`) extends to ε / V / i / r.

**Bring-up contract (the day-1 scars, all inherited from the D1 spec — must hold):**
- Cue-gated visuals derivable at ANY pinned sim-time incl. t=0 (share gate math between `stepCircuit`
  re-sim and reset; never hardcode post-cue values in reset).
- Every clock-driven in-state animation (`droop_intro`, `r_reveal`, both R sweeps, `two_reading`) gets a
  `deriveStateMeta.pfRevealMs` settle pin so THE EYE's `__frozen` frame lands AFTER it (mirror the
  `emf_autosweep === true` branch: start + dur + 400).
- S1's pre-cue pose and S5's open phase are one-shot phases of states that DO move overall — no
  `motion:false` opt-out needed on any state (S4/S6 beads move; S5's sequence moves after the cued close).
- Register the scenario in the `#sliders` exclusion chain if THE EYE keys on scenario_type; no backticks
  in the renderer code string; `\\u03B5`-style escapes (Rule 14); `window.__PM_supportsTimePin` +
  `RESET_TRAJECTORY` + `ceil` re-sim already hold for the circuit family (verify, don't rebuild).

**Engine sequencing:** Phase A first, verified against a disposable stub, THEN author (D1 precedent).
**Shared-renderer no-race:** `particle_field_renderer.ts` + `deriveStateMeta.ts` are shared/uncommitted
across sessions — `git status`/diff FIRST, region-disjoint additive edits only, re-read before each Edit,
never commit over a parallel session's work.

## 6. State arc (7 states — Rule 31 word budget 25–55 EN words, Rule 32 legibility)

| # | Title (working) | Teaches (ONE idea) | Motion archetype | Δ cue (≤5 words) | Live controls | Glow focal | Advance |
|---|---|---|---|---|---|---|---|
| S1 | The promise breaks | Close the switch → the voltmeter droops below ε (phenomenon only, no explanation) | close-and-droop | "Close switch — volts drop" | — | `voltmeter` | manual_click |
| S2 | The hidden r | r revealed inside the cell; the ladder grows the internal step — the missing 0.5 V is spent INSIDE (**PRIMARY aha**) | reveal-interior | "The missing volts, found" | — | `r_internal` | manual_click |
| S3 | V = ε − ir | R sweeps down → i rises 1→2 A → the internal step grows 0.5→1.0 V, V falls 1.0→0.5 V | ramp-droop | "More current, more droop" | R | `ladder` | manual_click |
| S4 | Short circuit | R→0: V→0, i caps at ε/r = 3.0 A — ALL of ε dies inside; the cell heats | collapse-extreme | "All ε lost inside" | — | `pump` | manual_click |
| S5 | Measuring r | Two readings: open → 1.50 V; closed → 1.00 V @ 1.0 A; r = 0.50/1.0 = 0.5 Ω on-screen | measure-compare | "Two readings give r" | switch | `voltmeter` | manual_click |
| S6 | Charging | A 3.0 V charger drives i BACKWARDS through the cell: terminals sit ABOVE ε at V = ε + ir = 2.0 V | reverse-flow | "Charging lifts V above ε" | — | `charger` | manual_click |
| S7 | Explore | i = ε/(R+r), V = ε − ir — every dial live | sandbox | "All yours" | ε, r, R, switch | `formula` | interaction_complete |

- Seven distinct archetypes, zero repeats. **S3 ↔ S6 are the declared contrast pair** (same apparatus,
  same 1.0 A — the 0.50 V *subtracts* when discharging, *adds* when charging).
- Explore-last (S7): duration 0, all controls, `interaction_complete`. ≥2 distinct advance_mode (Gate 12 ✓).
- Single glow focal per state (32e); one variable moves per guided state (32b); cause-first (32a): switch
  closes → needle droops; r appears → ladder step grows; R falls → droop grows; charger appears → beads
  reverse → needle climbs.
- Charger appears ONLY in S6 (its own home-pose delta); explore keeps the discharge circuit (no charger
  slider — charging is S6's demonstration, fixed clean numbers).

## 7. Misconception beats (Rule 16a — genuine pivots only, 3)

- **S1/S2 (primary, the PRIMARY-aha pivot):** belief *"a 1.5 V cell always delivers 1.5 V."* Counter
  (straightforward contrast-in-motion): close the switch and the voltmeter visibly droops to 1.00 V; the
  reveal shows WHERE the missing 0.50 V went — spent across the cell's own r, on the ladder as an internal
  step. One-line fix: *"the label states ε — the terminals deliver ε − ir once current flows."*
- **S4:** belief *"short circuit = infinite current."* Counter: with the load at zero the current stops at
  ε/r = 3.0 A — the hidden r is the ceiling; the whole ε now heats the cell itself.
- **S6:** belief *"terminal voltage can never exceed the emf."* Counter: the charger forces current
  backwards and the voltmeter reads 2.00 V > 1.5 V — V = ε + ir while charging.

## 8. Rule 33 (macro↔micro) — N/A here, by design

Same argument as D1: the mechanism level for this atomic is *energy per charge around the loop*, and the
potential ladder IS that mechanism view, carrying real numbers (the 0.50 V internal step). The
electrochemical origin of r (ion transport through the electrolyte) is outside A13's atomic scope. The S2
cell-interior reveal already gives the "look inside the apparatus" beat at the correct level. Stated here
so quality_auditor does not false-fail a missing dual-level split.

## 9. Universal real-world anchor (Rule 35 — culture-neutral)

**Primary: car headlights dim the instant the starter cranks.** The starter motor draws a huge current
from the same 12 V battery; i·r eats several volts inside the battery, the terminal voltage sags, the
lights dim — then recover the moment the engine catches. Universal (cars everywhere), physical, and the
exact V = ε − ir picture.
**Secondary:** a worn-out cell still reads full ε on open circuit but can't run a motor (aging raises r —
why "testing" a battery with only a voltmeter lies to you); a phone battery reads ~4.2 V while charging,
ABOVE its ~3.7 V emf (S6's anchor). No country-specific places, brands, currencies, or phrasing anywhere
in rendered or narrated text (35a); no region-dependent constants asserted (35b).

## 10. Registration (8 sites — id `internal_resistance` is NEW, unregistered)

1. `src/data/concepts/internal_resistance.json` (≥3 primitives/state, varied advance_mode,
   conceptual-only — no `mode_overrides`, no `epic_c_branches`).
2. `concept_panel_config` INSERT / `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`.
3. `CONCEPT_RENDERER_MAP` in `aiSimulationGenerator.ts` → `particle_field`.
4. `VALID_CONCEPT_IDS` in `intentClassifier.ts`.
5. `PCPL_CONCEPTS` — N/A (particle_field circuit family, not PCPL; same as D1).
6. `CLASSIFIER_PROMPT` (+ `ASPECT_VOCABULARY`) in `intentClassifier.ts`.
7. `supabase_migrations/supabase_2026-07-10_seed_internal_resistance_clusters_migration.sql`
   (authored-not-applied; clusters dormant this phase — auditor must not false-FAIL Gate 8 on it).
8. Seed script `src/scripts/_seed_internal_resistance_cache.ts` storing
   `physics_config = { epic_l_path, particle_field_config }` for THE EYE.

Prerequisites: `["emf_definition", "ohms_law"]`.

## 11. Definition of Done

- `npx tsc --noEmit` = 0 errors; `npm run validate:concepts` target PASSES.
- Rule 15 (≥2 advance_mode) · Rule 19 (≥3 primitives/state) · Rule 24 (labels/equations only, reads
  sound-off) · Rule 31 (word budget, per-state contextual controls, declared archetypes + the S3↔S6
  contrast pair) · Rule 32 (cause-first, ≤5-word delta cues, home-pose continuity from D1, single focal) ·
  Rule 34 (ONE formula surface per state — `V < ε` → `V = ε − ir` → `i_max = ε/r` → `r = (ε−V)/i` →
  `V = ε + ir`; value-only HUD; Unicode math everywhere) · Rule 35 (universal anchors).
- THE EYE (`visual:eyes` + eye-walker read) with **zero new `engine_bug_queue` rows**; every guided
  state's droop / internal step / needle / heat / reversed beads reads correctly on the `__frozen` frame;
  shipped `emf_definition` re-verified pixel-identical (its 6 baselines still pass).
- Founder visual approval → `visual:approve` → **Rule 30g Sonnet-5 subscription translation** (NEVER
  `tts:translate`) → `tts:generate --langs=en,te` → build:review, stale-clips 0. Telugu stays DRAFT until
  native review.

---

*Diamond 2 of 2. D1 built the ladder; this diamond makes it confess — the step you trusted has a hidden
tax, and once you can see the tax you can measure it, cap it, and reverse it.*
