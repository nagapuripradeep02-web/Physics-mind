# Design Spec — `wheatstone_bridge` (Ch.3, Wheatstone Bridge Principle / balance & null)

**Date:** 2026-07-12
**Author:** Claude (brainstorm with founder — founder approved scope = "Wheatstone principle (c20)" + the 5-state arc + engine Approach A)
**Status:** APPROVED design — pending spec review → writing-plans
**Chapter:** 3 (Current Electricity) · **Catalog node:** c20 · **Concept tier:** medium (5 states)
**Renderer:** `particle_field` circuit engine — a NEW `bridge` topology grafted into the existing
`combination_of_resistors` circuitMode (reuses the bead-loop / junction-dot / resistor-box / battery
primitives + the KCL/KVL live-numeric-instrument pattern) plus ONE new instrument — a **galvanometer with
a deflecting needle** (deflection ∝ V_D − V_B, nulls at balance).

---

## 1. One-line atomic claim

A **Wheatstone bridge** — four resistors P, Q, R, S in a diamond, a **battery** across one diagonal and a
**galvanometer** across the other — is **balanced** when **P/Q = R/S**. At balance the two midpoints sit at
the *same* potential, so the galvanometer branch carries **zero current** and its needle sits at dead
centre (a **null**) — *even though current still flows through all four arms*. Because the null depends
only on the **ratio** of the resistances and **not on the battery**, you find an **unknown resistance** by
adjusting a known arm until the needle reads zero: **S = R·(Q/P)** — with no current or voltage ever
measured.

## 2. Where it sits

Tenth Ch.3 diamond. Catalog **c20**, explicitly unblocked by the Kirchhoff pair — `kirchhoff_junction_rule_KCL`
(c15, shipped 2026-07-11) and `kirchhoff_loop_rule_KVL` (c16, shipped 2026-07-12): the bridge IS KCL (the
junction split into two divider paths) + KVL (equal potential drop down each path at balance) made
visible. It is the **first of the founder's lab trio** (Wheatstone c20 → potentiometer c23 → meter
bridge) — the bench-measurement cluster that measures a resistance precisely by nulling instead of by
Ohm's-law arithmetic.

**PRIMARY aha (State 3):** the **null** — matching the ratios collapses the galvanometer current to zero
and the needle stops **dead** at centre. You detect a *zero*, not a magnitude.

## 3. Scope

**IN:**
- Topology: one battery drives current that **splits** into two series-divider paths (P→Q and R→S); the
  galvanometer bridges the two midpoints (State 1).
- The galvanometer as a **difference detector**: unequal ratios ⇒ midpoints at different potentials ⇒
  current through the galvanometer ⇒ needle deflects (State 2).
- **The null (aha):** adjust the known arm → `P/Q → R/S`, V_B → V_D, i_g → 0, needle **sweeps to zero and
  stops**; the four arm currents keep flowing (State 3, misconception beat #1).
- **Why it's precise:** at balance `S = R·(Q/P)` reads the unknown off the knowns; change the battery ε and
  the needle **stays** at zero (State 4, misconception beat #2).
- Explore: all four arms + ε live; null it yourself (State 5).

**OUT (own catalog concepts / deferred):**
- **Meter bridge** (1 m wire + sliding jockey, `X = R·(100−l)/l`) — its own diamond (T4 lab nano); the
  practical realization, not the principle.
- **Potentiometer** (c23) — the sibling null-method for EMF; downstream, depends on this.
- Galvanometer internals / conversion to ammeter-voltmeter — shipped concepts
  (`moving_coil_galvanometer`, `galvanometer_to_ammeter_voltmeter`); the bridge treats the galvanometer as
  a given null-detector.
- Sensitivity of the bridge / best-arm-ratio analysis, unbalanced-bridge Thevenin current — drill-down
  candidates, not guided states (keeps the atomic claim to balance + null).
- Deflection-mode bridge (strain-gauge output ∝ imbalance) — surfaces only as the *anchor* framing, never
  a guided teaching state.

## 4. Apparatus & central visual (decided)

**The diamond bridge + a live galvanometer needle.** Four resistor boxes on the four arms of a diamond;
**battery ε** across the horizontal diagonal (nodes A–C), **galvanometer** across the vertical diagonal
(nodes B–D). Current beads flow from the battery, split at node A into the upper path (P→Q) and lower path
(R→S), recombine at node C; bead density per branch ∝ that branch's current. The **galvanometer** is a
dial instrument with a **needle** that deflects ∝ (V_D − V_B) and sits at dead centre when balanced; beads
flow through its branch only when unbalanced (none at the null). Live **V_B / V_D** node readouts and a
**`P/Q  vs  R/S`** ratio HUD make the balance condition legible.

**Geometry (unambiguous, for architect):** diamond nodes A (left) · C (right) = battery terminals; B (top)
· D (bottom) = galvanometer terminals. Arms: **P = A–B** (upper-left), **Q = B–C** (upper-right),
**R = A–D** (lower-left), **S = D–C** (lower-right). Battery across A–C; galvanometer across B–D. Balance
⇔ P/Q = R/S ⇔ V_B = V_D. (Standard NCERT diagram.)

- Rejected **B (fresh `scenario_type: 'wheatstone_bridge'`)** — cleaner conceptually but pays the
  `deriveStateMeta` + `#sliders`-exclusion retrofit tax (the exact cost KCL/KVL avoided by staying on an
  existing scenario_type). Graft the bridge as a gated topology instead.
- Rejected **C (static balanced/unbalanced poses, no live needle physics)** — the sweep-to-null *is* the
  concept; a dead dial teaches nothing.

**Numbers (verified — galvanometer idealized as high-resistance, so arm currents = open-circuit divider
currents and the needle reads V_D − V_B):**
- Ratio arms **P = 10 Ω, Q = 20 Ω** (fixed known 1:2 ratio — deliberately *unequal* so balance reads as a
  **ratio match**, never "all four equal"). Unknown **S = 6 Ω**. Known variable arm **R** (swept). **ε = 6 V.**
- V_B = ε·Q/(P+Q) = 6·20/30 = **4 V** (constant — left divider is fixed).
- **Balance** at **R = 3 Ω**: right divider V_D = ε·S/(R+S) = 6·6/9 = **4 V** = V_B ⇒ i_g = 0. Recovers
  **S = R·(Q/P) = 3·(20/10) = 6 Ω** ✓. Arm currents at balance: upper i₁ = 6/30 = 0.2 A, lower
  i₂ = 6/9 ≈ 0.67 A — **both flowing**, galvanometer 0 (the State-3 misconception beat).
- **Unbalanced** (State 2) at **R = 6 Ω**: V_D = 6·6/12 = **3 V**; V_D − V_B = −1 V ⇒ needle deflects
  (current B→D). P/Q = 0.5 vs R/S = 1.0 ✗.
- **State 3 sweep:** R 6 Ω → 3 Ω; V_D rises 3 → 4 V; needle sweeps to centre and stops at balance.
- **State 4 (ε-independence):** at balance the two midpoints hold the **same fraction of ε for any ε** —
  V_B = ε·Q/(P+Q) = ε·20/30 = **(2/3)ε** and V_D = ε·S/(R+S) = ε·6/9 = **(2/3)ε**, so V_B = V_D at every ε
  (both = 4 V when ε = 6 V; both = 2 V when ε = 3 V; both scale together). Sweep ε 3 V→10 V: arm beads
  speed up/slow, but the needle holds **zero**. The unknown **S = R·(Q/P) = 6 Ω** never referenced ε — the
  measurement is battery-independent, which is the whole reason the null is precise.

**Rule 33 dual-level:** macro = the diamond + the four arm values + the galvanometer needle + V_B/V_D
readouts (live numerics, the needle as the tracking indicator, Rule 33d); micro = the beads flowing in
each arm at density ∝ branch current (and zero in the galvanometer branch at balance). Both in one frame —
the needle IS the "difference between the midpoints" story co-located with the carriers.

**Universal anchor (Rule 35):** precision measurement — *the same bridge circuit sits inside a **digital
weighing scale***: a strain gauge whose resistance shifts a hair when you step on it unbalances the bridge,
and that tiny imbalance becomes the reading. Everyday, culture-neutral, no place/brand/currency. The
concrete teaching instance stays "**find an unknown resistor by nulling the galvanometer**." Plain English.

## 5. State arc + Rule-31 per-state control table

5 states (4 guided + explore). **State 2 → State 3 is the declared Rule-31 contrast pair** (needle
deflected off-centre vs needle swept to the null — same apparatus, only the ratio changes). Narration
25–55 EN words/guided state; motion may outrun narration; no archetype repeat except the declared contrast
pair; no static state; explore-last.

| # | State (teaches — ONE idea) | Motion archetype + ≤5-word delta cue | Live controls | advance_mode | Narration |
|---|---|---|---|---|---|
| 1 | One battery, two divider paths; the meter bridges the midpoints (topology) | **split-flow** — beads leave the battery, split at node A into P→Q and R→S, recombine at C · "Two paths, one meter" | none | `manual_click` | ~35w |
| 2 | The needle is a **difference detector** (unequal ratios ⇒ midpoints differ ⇒ current ⇒ deflection) | **needle-deflect** — V_B=4, V_D=3 light up; galvanometer branch gains beads; needle swings off-centre · "Unequal ratios → swing" | R (nudge one arm) | `manual_click` | ~42w |
| 3 | **NULL (PRIMARY aha) + misconception beat #1** — match the ratios → i_g→0, needle stops dead; arms still flow | **needle-sweep-to-zero** (declared contrast to S2) — sweep R 6→3Ω, V_D 3→4V meets V_B=4V, galvanometer beads drain to none, needle settles at centre; arm beads keep flowing · "Ratios match → zero" | R (sweep to null) | `manual_click` | ~50w |
| 4 | **Why it's precise + misconception beat #2** — S = R·(Q/P) off the knowns; change ε, needle stays 0 | **battery-sweep, needle-holds** — ε slider swings 3→10V, arm beads speed up/slow, needle stays pinned at zero; "S = 6 Ω" reads out · "Change battery → still zero" | ε | `manual_click` | ~48w |
| 5 | Explore (`interaction_complete`) | **free-explore** — all four arms + ε live; null it yourself, ratio HUD + needle track continuously · "You balance it" | P, Q, R, S, ε (`show_sliders:true`) | `interaction_complete` | 0 / open |

*(advance_mode: ≥2 distinct — `manual_click` ×4 + `interaction_complete` (Gate 12); never `wait_for_answer`;
no Socratic predict→reveal. Both misconception beats are straightforward contrast beats per Rule 16a.)*

**`misconception_watch`** fires at STATE_3 — belief *"at balance the current stops flowing everywhere"* —
and STATE_4 — belief *"you must read the meter / know the battery voltage to get the resistance."*

## 6. Engine reuse & risk

The circuit engine already draws resistor boxes, a battery, junction dots, and bead-loops with per-branch
density ∝ current (the `combination_of_resistors` circuitMode, upgraded for KCL: per-state R locks,
multi-branch geometry, live-numeric HUDs). **Founder-approved engine adds (gated behind NEW per-state
flags → zero regression to combination_of_resistors / KCL / electric_power / emf_definition /
internal_resistance / KVL — same discipline as the KCL & KVL upgrades, verified):**
1. **`bridge` topology** — a diamond layout (nodes A/B/C/D, four arm boxes P/Q/R/S, battery on A–C,
   galvanometer branch on B–D) inside circuitMode; bead-loops for the two divider paths + the galvanometer
   branch; V_B/V_D node potentials computed from the two dividers.
2. **Galvanometer instrument** — a new `drawGalvanometerC` dial with a needle whose angle ∝ (V_D − V_B),
   centre-zero, plus zero-current beads in its branch at balance. (New; the only genuinely new primitive.)
3. **Ratio HUD + node readouts** — `P/Q vs R/S` and V_B/V_D value-only instruments (Rule 33d/34b), the
   `kcl_sum_readout` sibling pattern.
4. **Null sweep** — State 3 sweeps R to balance; must be a **whitelisted reveal-timing flag** in
   `pfRevealMs()` (`deriveStateMeta.ts`) OR finish under the 1500 ms `DEFAULT_REVEAL_MS` floor, else THE
   EYE's frozen frame lands mid-sweep (the documented `r2_autosweep`/`ladder_build_ms` gotcha). Prefer the
   under-1500 ms compression (KVL precedent) — the `deriveStateMeta.ts` file is often raced by another
   session.

**Risks routed via quality_auditor FAIL → `peter_parker:renderer_primitives` (never cold-called):** the
`drawGalvanometerC` needle + the bridge bead-loop geometry are the new capability. **Idealization:** treat
the galvanometer as high-resistance so arm currents = open-circuit divider currents and the needle reads
V_D − V_B (keeps numbers exact + the "arms still flow at balance" story clean; standard teaching
idealization — note it in physics_author's constraints). **Fallback:** if live bead-flow through the
galvanometer branch is fiddly, the needle + V_B/V_D numerics alone carry the pedagogy (beads in the four
arms only). Keep scenario_type `combination_of_resistors` (renderer selector) — do NOT mint a new
scenario_type (avoids the deriveStateMeta/#sliders retrofit). Honor the bring-up contract (cue-gate visuals
derivable at t=0; bridge layout static per state; ceil re-sim steps; `__PM_supportsTimePin`). Reuse the
existing glow enum (`electrons`/`formula`/`junction`/`current_meter`…); add a `galvanometer` key only
in-engine if strictly needed.

## 7. Registration (8 sites — json_author)

1. `src/data/concepts/wheatstone_bridge.json` (`particle_field_config` + `epic_l_path`; ≥3
   primitives/state; varied advance_mode; conceptual-only)
2. `concept_panel_config` INSERT (or `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`)
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts` → particle_field
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts`
5. `CLASSIFIER_PROMPT` in `src/lib/intentClassifier.ts` (aspects: foundational default, balance/null +
   measurement inline)
6. clusters SQL migration `supabase_migrations/supabase_2026-07-12_seed_wheatstone_bridge_clusters_migration.sql`
   — authored-not-applied; **N/A-DORMANT this phase** (drill-down deferred; do not let the auditor Gate-8
   cluster probe false-FAIL)
7. **NOT** `PCPL_CONCEPTS`
8. seed cache via `_seed_wheatstone_bridge_cache.ts` storing physics_config =
   `{ epic_l_path, particle_field_config }`

**Not added to `PILOT_CONCEPTS`** — reviewer-first (novel `bridge` renderer path → reviewer-first flag per
the launch-strategy doctrine).

## 8. Verification / done-list

- `npx tsc --noEmit` → 0 · `npm run validate:concepts` → target PASSES (Gates 12/16a/19/24/31/32/33/34/35)
- `npm run check:renderer-syntax` (any renderer edit; no backticks in the emitted template body — Rule 36c)
- Seed cache → THE EYE `npm run visual:eyes -- wheatstone_bridge` → eye-walker reads frames → zero new
  `engine_bug_queue` rows → founder OK → `npm run visual:approve`
- `npm run build:review -- wheatstone_bridge` + serve → provide `http://localhost:8080/wheatstone_bridge/`
- Telugu **text** via a `model: sonnet` (Sonnet-5) sub-agent (Rule 30g); **audio on-demand** (Rule 30h) —
  render EN audio only if the founder asks.

## 9. Pipeline

Alex pipeline, sequential: **architect → physics-author → json-author → quality-auditor**; auditor
FAIL-routes upstream (or to `peter_parker:renderer_primitives` for the §6 engine adds — the `bridge`
topology + `drawGalvanometerC`). Then THE EYE (eye-walker) → founder review. No parallel authoring.
