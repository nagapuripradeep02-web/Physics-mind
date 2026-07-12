# Design Spec — `kirchhoff_loop_rule_KVL` (Ch.3, Kirchhoff's Loop Rule / KVL)

**Date:** 2026-07-12
**Author:** Claude (brainstorm with founder — founder chose "the best, most teacher-preferred way")
**Status:** APPROVED design — pending spec write → writing-plans
**Chapter:** 3 (Current Electricity) · **Catalog node:** c16 · **Concept tier:** simple
**Renderer:** `particle_field` circuit engine — reuses the existing potential-ladder / voltmeter / EMF-cell primitives (from `emf_definition` + `internal_resistance`) and the KCL-built `drawStruckTextC` ghost + sum-readout pattern

---

## 1. One-line atomic claim

Around **any closed loop** in a circuit, the algebraic sum of potential changes is **zero — ΣV = 0**. The
EMF *raises* the potential (+ε) and each resistor *drops* it (−IR), so the rise equals the total of the
drops and a charge that travels the loop returns to the potential it started at (**energy conservation**).
For an ideal single-loop cell: **ε = IR₁ + IR₂**. The signs are the crux — the DCP "H→L" convention
(traverse a source − to + = +ε rise; traverse a resistor along the current = −IR drop).

## 2. Where it sits

Ninth Ch.3 diamond, the sibling of `kirchhoff_junction_rule_KCL` (c15, shipped 2026-07-11): KCL is
conservation of **charge at a junction** (currents), KVL is conservation of **energy around a loop**
(voltages). Catalog c16 depends on `emf_definition` (c11) and `internal_resistance` (c12) — both shipped.
Together KCL + KVL unlock the founder's lab-trio priority: **Wheatstone (c20) needs both; the
potentiometer (c23) needs KVL.** This concept is the last foundational block before the network-analysis
cluster.

**PRIMARY aha:** the potential staircase returns to **exactly** the starting height — no leftover voltage.
Every rise is matched by the total drops; the signs are what close the loop.

## 3. Scope

**IN:**
- The round-trip = 0 insight — walk the loop, the potential returns to start (STATE_1).
- Quantitative rise = total drops: +ε up, −IR₁, −IR₂ down, voltmeters per element (STATE_2).
- The misconception beat: signs / no leftover voltage — naive add-all-positive vs the signed ΣV=0
  (STATE_3).
- Generalization to any loop: a third resistor, ladder steps down 3× but still closes to 0 (STATE_4).
- Explore: all controls (STATE_5).

**OUT (own catalog concepts / deferred):**
- KCL / junction rule — shipped (`kirchhoff_junction_rule_KCL`).
- Solving a multi-loop network by simultaneous KVL+KCL (mesh analysis) — a downstream application, not
  the atomic loop rule.
- Internal resistance as a taught idea (ε = I(r+R)) — its own shipped diamond `internal_resistance`;
  `r` only appears optionally in explore here, never as a guided-state teaching target.
- A second/opposing EMF in the loop (sign of ε) — a natural drill-down candidate, not a guided state
  this phase (keeps the atomic claim to one EMF).
- Wheatstone / potentiometer (downstream, depend on this).

## 4. Apparatus & central visual (decided)

**A single series loop + a live potential staircase.** Cell (ε) + R₁ + R₂ in series carry current I. A
**potential-vs-loop-position ladder** is drawn: a +ε step **up** at the cell, then −IR₁ and −IR₂ steps
**down** across the resistors, closing back to exactly 0. **Voltmeters** across the cell and each resistor
show the signed values; a **marker walks the loop** in step with the ladder trace. This is the canonical
teacher visual — "go around the loop and add up the changes."

- Rejected **B (two-loop mesh analysis)** — that's *solving circuits*, a downstream application needing
  KCL too + major new engine (shared branch, two meshes).
- Rejected **C (energy-hill metaphor)** — the potential ladder in A already *is* the energy hill,
  quantitatively; C would be less precise.

**Numbers (verified):** ε = 6 V (ideal cell), R₁ = 2 Ω, R₂ = 1 Ω → I = ε/(R₁+R₂) = 6/3 = **2 A**;
drops V₁ = IR₁ = **4 V**, V₂ = IR₂ = **2 V**; 4 + 2 = 6 = ε ✓ (ΣV: +6 − 4 − 2 = 0). STATE_4 third
resistor R₃: pick so drops stay clean and sum to ε (physics_author confirms, e.g. R₁=1,R₂=1,R₃=1 → I=2A,
drops 2+2+2=6, or a legibly-uneven set summing to 6).

**Rule 33 dual-level:** macro = the loop + voltmeters + the ladder height numbers (live, with the marker
as a tracking needle, Rule 33d); micro = the beads flowing at speed ∝ I. Both in one frame — the ladder
IS the "energy per charge" story co-located with the carriers that carry it.

**Universal anchor (Rule 35):** a hiking **loop trail** — you climb up and come back down, ending at the
same altitude you started (the round-trip nets to zero, exactly like the potential around a loop); the
real device is a simple series lamp/flashlight loop. No country/brand/place reference. Plain English.

## 5. State arc + Rule-31 per-state control table

5 states (4 guided + explore). STATE_2 → STATE_3 is the declared Rule-31 contrast pair (clean staircase
vs signed-contrast + ghost). Narration 25–55 EN words/guided state; motion may outrun narration; no
archetype repeat except the declared contrast pair; no static state.

| # | State (teaches — ONE idea) | Motion archetype + ≤5-word delta cue | Live controls | advance_mode | Narration |
|---|---|---|---|---|---|
| 1 | Back to where you started (round-trip = 0, the *why*) | **loop-walk** — marker traces the loop; ladder rises at the cell, drops across resistors, lands at the start height · "Loop closes at zero" | none | `manual_click` | ~35w |
| 2 | Rise = total drops (quantitative) | **staircase-build** — +6V up at the cell, −4V then −2V down; voltmeters read 6 / 4 / 2; sum "6 = 4 + 2" · "Rise = total drops" | none | `manual_click` | ~40w |
| 3 | **Misconception beat** — signs, no leftover | **redistribute + ghost** (declared contrast to S2) — change a resistor, drops redistribute but always sum to ε; naive "6 + 4 + 2 = 12 ✗" (ladder shoots up, never returns) struck through vs real "6 − 4 − 2 = 0 ✓" · "Signs close the loop" | R₁, R₂ sliders | `manual_click` | ~48w |
| 4 | Any loop, any elements (generalize ΣV=0) | **extend-loop** — add a third resistor R₃; ladder steps down 3× and still closes to 0 · "More drops, still zero" | none | `manual_click` | ~40w |
| 5 | Explore (`interaction_complete`) | **free-explore** — all sliders (ε, R₁, R₂, R₃); ladder + voltmeters track live, ΣV=0 always · "You drive it" | all sliders (`show_sliders:true`) | `interaction_complete` | 0 / open |

*(advance_mode: ≥2 distinct — manual_click ×4 + interaction_complete (Gate 12); never `wait_for_answer`;
no Socratic predict→reveal. The S3 misconception is a straightforward contrast beat per Rule 16a.)*

**`misconception_watch`** fires only at STATE_3 — beliefs: *"there's leftover voltage after the drops"*
and *"you add all voltages regardless of direction."*

## 6. Engine reuse & risk

Most of the apparatus exists on the circuit engine — `drawPotentialLadder` (line ~2124; +ε rise / −IR
drop, supports internal `ir`), `drawVoltmeterC`, `drawEmfCell`, plus KCL's `drawStruckTextC` ghost + the
per-state sum-readout pattern (`kcl_sum_readout`). **Founder-directed engine adds (gated behind NEW
per-state flags → zero regression to emf_definition / internal_resistance / combination_of_resistors /
electric_power, verified — same discipline as the KCL upgrade):**
1. **Multi-step series ladder** — the current ladder handles ONE resistor; KVL needs 2–3 series drops
   (steps down at each resistor). Extend `drawPotentialLadder` / the loop profile to a series-resistor
   profile behind a flag.
2. **Per-resistor voltmeters** — a voltmeter across each of R₁/R₂(/R₃) + the cell, labeled and signed.
3. **KVL sum readout** — a `kvl_sum_readout` value HUD ("ε = IR₁ + IR₂ …" / "ΣV = 0"), sibling of
   `kcl_sum_readout`. The S3 ghost reuses `drawStruckTextC` (already shipped).

**Risks routed via quality_auditor FAIL → `peter_parker:renderer_primitives` (never cold-called):** the
multi-step ladder is the main new capability; the S3 "add-all-positive ladder shoots up and never
returns" ghost-trace may need a small ladder variant. **Fallback:** if a 3rd resistor in the ladder is
non-trivial, STATE_4 keeps two resistors and generalizes verbally via ΣV=0 (mirrors KCL's S4 fallback).
Keep scenario_type in the circuit family (reuse `emf_definition`-class handling or a gated flag) — do NOT
mint a new scenario_type (avoids the deriveStateMeta/#sliders retrofit). Honor the bring-up contract
(cue-gate visuals derivable at t=0; ladder trace static per state). Reuse the existing glow enum
(`formula`, `voltmeter`, `junction`, etc.); add a key only in-engine if strictly needed.

## 7. Registration (8 sites — json_author)

1. `src/data/concepts/kirchhoff_loop_rule_KVL.json` (`particle_field_config` + `epic_l_path`; ≥3
   primitives/state; varied advance_mode; conceptual-only)
2. `concept_panel_config` INSERT (or `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`)
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts` → particle_field
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts`
5. `CLASSIFIER_PROMPT` in `src/lib/intentClassifier.ts` (aspects: foundational default, multi_element)
6. clusters SQL migration `supabase_migrations/supabase_2026-07-12_seed_kirchhoff_loop_rule_KVL_clusters_migration.sql`
   — authored-not-applied; **N/A-DORMANT this phase** (drill-down deferred; do not let the auditor Gate-8
   cluster probe false-FAIL)
7. **NOT** `PCPL_CONCEPTS`
8. seed cache via `_seed_kirchhoff_loop_rule_KVL_cache.ts` storing physics_config =
   `{ epic_l_path, particle_field_config }`

**Not added to `PILOT_CONCEPTS`** — reviewer-first.

## 8. Verification / done-list

- `npx tsc --noEmit` → 0 · `npm run validate:concepts` → target PASSES (Gates 12/16a/19/24/31/32/33/34/35)
- Seed cache → THE EYE `npm run visual:eyes -- kirchhoff_loop_rule_KVL` → eye-walker reads frames →
  zero new `engine_bug_queue` rows → founder OK → `npm run visual:approve`
- `npm run build:review -- kirchhoff_loop_rule_KVL` + serve → provide
  `http://localhost:8080/kirchhoff_loop_rule_KVL/`
- Telugu **text** via a `model: sonnet` (Sonnet-5) sub-agent (Rule 30g); **audio on-demand** (Rule 30h) —
  render EN audio only if the founder asks.

## 9. Pipeline

Alex pipeline, sequential: **architect → physics-author → json-author → quality-auditor**; auditor
FAIL-routes upstream (or to `peter_parker:*` for the §6 engine adds). Then THE EYE (eye-walker) → founder
review. No parallel authoring.
