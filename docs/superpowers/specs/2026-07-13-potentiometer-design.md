# Design Spec — `potentiometer` (Ch.3, Potentiometer Principle / null method, true EMF)

**Date:** 2026-07-13
**Author:** Claude (brainstorm with founder — founder approved scope = the principle A24 + the 5-state arc + State-4 voltmeter contrast + engine reuse via a new `wire` topology)
**Status:** APPROVED design — pending spec write → pipeline
**Chapter:** 3 (Current Electricity) · **Catalog node:** c23 · **Atomic:** A24 (`potentiometer_principle`) · **Concept tier:** medium (5 states)
**Renderer:** `particle_field` circuit engine — a NEW gated `topology:"wire"` (uniform potential-gradient wire + sliding jockey) reusing the bridge's `drawGalvanometerC` null needle, the emf-family potential-drop concept, and the `combination_of_resistors` scenario selector (no new scenario_type → avoids the deriveStateMeta/#sliders retrofit).

---

## 1. One-line atomic claim

A **potentiometer** measures a cell's **true EMF** by **nulling**. A steady current from a driver cell makes
the potential drop **uniformly** along a long uniform wire — a gradient **k = V/L**. Slide a **jockey** until
the potential drop from the start to the jockey exactly equals a tested cell's EMF: the galvanometer reads
**zero** and **E = k·l**. Because at balance **no current is drawn from the tested cell**, the reading is its
**true EMF** — unlike a voltmeter, which draws current through the cell's internal resistance and reads the
smaller terminal voltage. The **balance length is directly proportional to EMF**.

## 2. Where it sits

Eleventh Ch.3 diamond, the second of the founder's **lab trio** (Wheatstone c20 → **potentiometer c23** →
meter bridge). A null method like the Wheatstone bridge — it reuses the `drawGalvanometerC` null-detector
just built for c20. Catalog c23 / atomic **A24** (`potentiometer_principle`); the concept id `potentiometer`
is already registered (VALID_CONCEPT_IDS + CLASSIFIER_PROMPT) with legacy physics constants only — no
concept JSON exists yet. Depends on `emf_definition` (c11), `internal_resistance` (c12), `ohms_law` — all
shipped.

**PRIMARY aha (State 3):** the null gives the balance length **and** draws zero current from the cell — you
measure EMF *without loading it*.

## 3. Scope

**IN:**
- Uniform potential gradient along the wire (k = V/L) from a steady driver current (State 1).
- The jockey taps the drop A→J (= k·l); galvanometer deflects when k·l ≠ E (State 2).
- **The null (aha):** slide to k·l = E → galvanometer zero, E = k·l, **zero current drawn from the cell**
  (State 3, misconception beat #1).
- **True EMF vs voltmeter:** the voltmeter loads the cell (reads E − Ir < E); the null does not (State 4,
  misconception beat #2).
- Explore: tested EMF / driver gradient / jockey, watch l ∝ E (State 5).

**OUT (own catalog atomics / deferred):**
- **Comparing two EMFs** `E₁/E₂ = l₁/l₂` (atomic A25) — downstream; a natural drill-down/next diamond, NOT
  a guided state here (keeps the atomic claim to the single-EMF principle).
- **Internal resistance measurement** `r = R(l₁−l₂)/l₂` (atomic A26) — downstream; its own diamond.
- Meter bridge (the other lab-trio member; needs its own 1 m-wire + balance-point apparatus).
- Galvanometer internals / sensitivity, end-errors, the driver-cell rheostat calibration — drill-down
  candidates, not guided states.

## 4. Apparatus & central visual (decided)

**A horizontal potentiometer wire + a sliding jockey + a live galvanometer needle.** A long uniform wire
**A → C** carries a steady current from a **driver cell** (ε_driver, on the top loop); the potential drops
**linearly** A→C, shown as a **potential-gradient ramp** along/above the wire. A **jockey J** slides on the
wire; a **tested cell E + galvanometer** connect from A to J (the tap branch). The tapped drop A→J = k·l;
the galvanometer needle (reused `drawGalvanometerC`, centre-zero) deflects ∝ (k·l − E) and nulls at balance.
A **balance-length readout** (l, and E = k·l) makes the measurement legible.

**Geometry (for architect):** wire A (left) → C (right), horizontal; driver cell + rheostat on the outer top
loop A–C; jockey J a movable contact on the wire (slider-driven, position = l from A); tested cell E + G in
the branch from A down to J. Potential gradient ramp drawn above the wire (linear from k·L at A to 0 at C).

- Rejected **a vertical/diamond layout** — the potentiometer's whole idea is a *linear* drop along a
  *length*; horizontal wire + position-as-length is the honest, standard picture.
- Rejected **making S4 the compare-two-EMFs application** — that's atomic A25; the defining feature of A24 is
  "zero current ⇒ true EMF," so S4 is the voltmeter contrast.

**Numbers (exemplar — physics_author finalizes):** driver ε_driver = 3 V across wire length L = 1 m ⇒
gradient **k = 3 V/m** (0.03 V/cm). Tested cell **E = 1.5 V** ⇒ **balance at l = 0.5 m** (clean midpoint);
k·l = 3 × 0.5 = 1.5 V = E ✓, galvanometer null, cell current = 0. State-2 unbalanced: jockey at l = 0.7 m ⇒
k·l = 2.1 V > E ⇒ needle deflects. State-4 voltmeter contrast: tested cell E = 1.5 V with internal
resistance r; a voltmeter of finite resistance draws current I ⇒ reads terminal V = E − Ir < 1.5 V (physics_
author picks r + R_v for a legible droop, e.g. reads ~1.35 V), while the potentiometer null draws I = 0 ⇒
reads exactly 1.50 V.

**Rule 33 dual-level:** macro = the wire + jockey + driver/tested cells + the galvanometer needle (tracking
indicator, 33d) + the balance-length readout; micro = current beads along the wire (steady driver current)
+ zero beads in the tap branch at balance. Both in one frame — the gradient ramp IS the "potential per
length" story co-located with the carriers.

**Universal anchor (Rule 35):** a **volume fader / dimmer slider** *is* a potentiometer — a sliding contact
taps a fraction of a voltage along a resistive track (exactly the potential-gradient idea). Everyday,
culture-neutral, no place/brand/currency. Teaching instance stays "measure a cell's true EMF by nulling."

## 5. State arc + Rule-31 per-state control table

5 states (4 guided + explore). **State 2 → State 3 is the declared Rule-31 contrast pair** (jockey off-
balance, needle deflected vs jockey at balance, needle nulled — same apparatus, only jockey position moves).

| # | State (teaches — ONE idea) | Motion archetype + ≤5-word delta cue | Live controls | advance_mode | Narration |
|---|---|---|---|---|---|
| 1 | Steady current ⇒ uniform potential drop along the wire (k = V/L) | **gradient-fill** — beads flow A→C, a linear potential ramp fills above the wire · "Potential drops evenly" | none | `manual_click` | ~40w |
| 2 | The jockey taps the drop A→J (= k·l); galvanometer deflects when k·l ≠ E | **jockey-slide + needle-deflect** — jockey slides to l = 0.7 m, tap drop 2.1 V > E, needle swings off-centre · "Jockey taps the drop" | jockey | `manual_click` | ~45w |
| 3 | **NULL (PRIMARY aha) + misconception beat #1** — k·l = E, needle nulls, E = k·l, zero cell current | **jockey-slide-to-null** (declared contrast to S2) — jockey slides to l = 0.5 m, tap drop meets E = 1.5 V, needle settles dead-centre; tap-branch current → 0 · "Drop equals EMF → zero" | jockey | `manual_click` | ~50w |
| 4 | **True EMF vs voltmeter + misconception beat #2** — voltmeter loads (E − Ir < E); null draws zero | **droop-vs-null** — a voltmeter across the cell reads ~1.35 V (drawing current), the potentiometer null reads exactly 1.50 V · "Voltmeter loads, null doesn't" | (compare toggle) | `manual_click` | ~50w |
| 5 | Explore (`interaction_complete`) | **free-explore** — tested E / driver gradient / jockey all live; balance length tracks l ∝ E · "You balance it" | E, driver V, jockey (`show_sliders:true`) | `interaction_complete` | 0 / open |

*(advance_mode ≥2 distinct — `manual_click` ×4 + `interaction_complete` (Gate 12); never `wait_for_answer`;
no Socratic predict→reveal. Both misconception beats are straightforward contrast beats per Rule 16a.)*

**`misconception_watch`** fires at STATE_3 — belief *"the jockey/galvanometer draws current from the cell
like any meter"* — and STATE_4 — belief *"a voltmeter reads the true EMF."*

## 6. Engine reuse & risk

Reuses **`drawGalvanometerC`** (the bridge's centre-zero null needle, c20) and the emf-family potential-drop
concept. **Founder-approved engine adds (gated behind `topology:"wire"` → zero regression to
combination_of_resistors / bridge / KCL / KVL / emf_definition / internal_resistance / electrical_power —
same discipline as the bridge upgrade, verified):**
1. **`topology:"wire"`** — a horizontal potentiometer wire A→C with a linear potential-gradient ramp, a
   driver cell + outer loop, and steady current beads along the wire.
2. **Sliding jockey `J`** — a movable contact on the wire, position = l (slider-driven, `jockey_pos`);
   clock-driven `jockey_sweep` for the guided S2/S3 slides (whitelist in `pfRevealMs` like `bridge_r_sweep`
   so the frozen frame lands settled).
3. **Tap branch + galvanometer** — tested cell E + `drawGalvanometerC` from A to J; needle ∝ (k·l − E),
   nulls at k·l = E; tap-branch beads → 0 at balance.
4. **Balance-length + gradient readouts** — value-only `l = 0.50 m`, `E = k·l`, `k = 3 V/m`; the S4
   voltmeter-vs-null comparison readout (`V_meter = 1.35 V` vs `E = 1.50 V`).

**Risk routed via quality_auditor FAIL → `peter_parker:renderer_primitives` (never cold-called):** the wire
+ jockey geometry + gradient ramp is the new capability; `drawGalvanometerC` is reused as-is. **Keep
scenario_type `combination_of_resistors`** (selector) — do NOT mint a new scenario_type. S2/S3 jockey slides
whitelisted in `pfRevealMs`. Honor the bring-up contract (visuals derivable at t=0; static per-state layout;
ceil re-sim steps; `__PM_supportsTimePin`). Reuse the glow enum (`galvanometer`/`formula`/`junction`/
`electrons`…); add a `jockey`/`gradient` key only in-engine if strictly needed.

## 7. Registration (8 sites — json_author)

1. `src/data/concepts/potentiometer.json` (`particle_field_config` + `epic_l_path`; ≥3 primitives/state)
2. `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts` → particle_field
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts` (already present — verify)
5. `CLASSIFIER_PROMPT` in `src/lib/intentClassifier.ts` (aspects: foundational default + measurement)
6. clusters SQL migration `supabase_migrations/supabase_2026-07-13_seed_potentiometer_clusters_migration.sql`
   — authored-not-applied; **N/A-DORMANT** (do not let Gate-8 cluster probe false-FAIL)
7. **NOT** `PCPL_CONCEPTS`
8. seed cache `src/scripts/_seed_potentiometer_cache.ts` storing `{ epic_l_path, particle_field_config }`

**Not added to `PILOT_CONCEPTS`** — reviewer-first (novel `wire` renderer path).

## 8. Verification / done-list

- `npx tsc --noEmit` → 0 · `npm run validate:concepts` → PASS (Gates 12/16a/19/24/31/32/33/34/35)
- `npm run check:renderer-syntax` (renderer edit; no backticks in the emitted body — Rule 36c)
- Seed → THE EYE `npm run visual:eyes -- potentiometer` → eye-walker reads frames → zero new
  `engine_bug_queue` rows → founder OK → `npm run visual:approve`
- `npm run build:review -- potentiometer` + serve → `http://localhost:8080/potentiometer/`
- Telugu **text** via a `model: sonnet` sub-agent (Rule 30g); audio on-demand (Rule 30h)

## 9. Pipeline

Alex pipeline, sequential: **architect → physics-author → json-author → quality-auditor**; auditor
FAIL-routes upstream (or to `peter_parker:renderer_primitives` for the §6 engine adds — the `wire` topology
+ jockey, reusing `drawGalvanometerC`). Then THE EYE (eye-walker) → founder review. No parallel authoring.
