# Design Spec — `kirchhoff_junction_rule_KCL` (Ch.3, Kirchhoff's Junction Rule / KCL)

**Date:** 2026-07-11
**Author:** Claude (brainstorm with founder)
**Status:** APPROVED design — pending founder spec review → writing-plans
**Chapter:** 3 (Current Electricity) · **Catalog node:** c15 · **Concept tier:** simple
**Renderer:** `particle_field` (2D p5.js), circuit family — reuses the split-by-conductance bead mechanic + `drawAmmeterAtC` (likely one new scenario flag `junction_rule`)

---

## 1. One-line atomic claim

At **any junction (node)** in a circuit, the total current flowing **in** equals the total current
flowing **out**: **Σi_in = Σi_out** (equivalently Σi = 0 with signs). This is **charge conservation** —
charge cannot pile up or vanish at a point. When current splits at a fork it redistributes by the
branches' conductance, but the branch currents always **add back** to exactly the current that entered.

## 2. Where it sits

Eighth Ch.3 diamond, following the shipped/authored seven: `drift_velocity` → `ohms_law` →
`resistivity` → `combination_of_resistors` → `emf_definition` → `internal_resistance` →
`electrical_power_in_resistor`. Catalog node **c15** depends only on `electric_current` (foundational) —
it is the cheapest remaining node engine-wise and the hard prerequisite for the founder's lab-trio
priority: **Wheatstone (c20) and the potentiometer (c23/KVL c16) both depend on Kirchhoff.** KVL (c16)
is a **separate diamond, deferred to a follow-up session** (founder decision 2026-07-11).

**PRIMARY aha:** the unequal-branch beat (STATE_3) — the split "looks broken" (1.5A vs 0.5A) yet the
ammeter in and the ammeter out both still read 2.0A. Current is never *used up*; it only shares unevenly.

## 3. Scope

**IN:**
- Charge can't pile up at a node — the *why* of KCL, shown as beads streaming through without
  accumulating (STATE_1).
- I splits into I₁ + I₂ and recombines; A_in = A₁ + A₂ = A_out, first with equal branches / 50-50
  (STATE_2).
- The misconception beat: unequal branches redistribute current by conductance, but the sum is conserved
  (STATE_3) — confronts *"current gets used up"* AND *"current always splits equally."*
- Generalization to Σi_in = Σi_out for a node with more than two branches (STATE_4).
- Explore: all controls (STATE_5).

**OUT (own catalog concepts / deferred):**
- KVL / loop rule (Σ voltage = 0) — **`kirchhoff_loop_rule_KVL`, next session.**
- Solving a two-loop network for unknown currents (simultaneous KCL+KVL) — a downstream application,
  not this atomic node.
- Current-divider algebra as a taught formula (I₁ = I·R₂/(R₁+R₂)) — it *emerges* from the ammeters in
  STATE_3 as a number, but the derivation belongs to `resistors_in_parallel` (shipped) / a drill-down,
  not a guided state here.
- Wheatstone / potentiometer (downstream, depend on this).

## 4. Apparatus & central visual (decided)

**A single junction with four live ammeters — Approach A.** One EMF cell drives current I into node **N**;
N splits into two parallel resistor branches R₁ (top) / R₂ (bottom); they recombine and return to the
cell. Ammeters **A_in** (main, before N), **A₁** (branch 1), **A₂** (branch 2), **A_out** (after
recombination) make the rule readable at a glance — the ammeter-sum framing is exactly what a teacher
points at on the board. Electron beads flow and **split at N by conductance** (existing engine mechanic).

- Rejected **B (general N-wire node, Σi=0 from the start)** — less concrete for first exposure, needs a
  new N-wire-node primitive (engine cost).
- Rejected **C (bead-conservation only)** — intuitive for *why* but weak on the quantitative ammeter
  reading teachers want. Its "no pile-up" insight is folded into STATE_1 instead.

**Rule 33 dual-level:** the mechanism (no accumulation) is micro = the beads; the reading is macro = the
ammeters — both visible in the same frame, so the number and its cause sit together. No split-canvas
needed (the beads ride on the wires).

**Universal anchor (Rule 35):** a wall socket feeding a power strip — the supply current splits to each
plugged-in device and sums back; nothing is lost at the split. Culture-neutral, no country/brand
reference. Plain English throughout.

## 5. State arc + Rule-31 per-state control table

5 states (4 guided + explore). STATE_2 → STATE_3 is the declared Rule-31 contrast pair (even fork vs
uneven redistribute). Narration 25–55 EN words/guided state; motion may outrun narration, never the
reverse; no two archetypes repeat except the declared contrast pair; no static state.

| # | State (teaches — ONE idea) | Motion archetype + ≤5-word delta cue | Live controls | advance_mode | Narration |
|---|---|---|---|---|---|
| 1 | Charge can't pile up (the *why*, micro) | **stream-through** — beads flow into N and continue, none accumulate · "Nothing piles up here" | none | `auto_after_tts` | ~35w |
| 2 | Splits, then adds back (equal branches) | **fork-split** — one stream divides into two, then merges; A_in = A₁+A₂ = A_out (2 = 1+1) · "In = branch₁ + branch₂" | none | `tap_to_advance` | ~40w |
| 3 | **Misconception beat** — unequal branches | **redistribute** (declared contrast to S2) — lower R₂, its stream thickens / top thins; 1.5A + 0.5A but sum still 2A; naive "1.0+1.0" struck through · "Uneven split, same sum" | R₁, R₂ sliders | `interaction_then_tts` | ~48w |
| 4 | Any junction generalizes — Σi_in = Σi_out | **converge-diverge** (declared distinct) — a third branch; all branch currents still sum to the total · "Total in = total out" | none | `tap_to_advance` | ~40w |
| 5 | Explore (`interaction_complete`) | **free-explore** — open | all sliders (`show_sliders:true`) | `interaction_complete` | 0 / open |

*(advance_mode column is indicative — physics_author/json_author finalize; must satisfy Gate 12: ≥2
distinct modes, never all-`auto_after_tts`, never `wait_for_answer` (legacy). No Socratic predict→reveal;
the S3 misconception is a straightforward contrast beat per Rule 16a.)*

**`misconception_watch`** fires only at the STATE_3 pivot (not per-state) — beliefs: *"current gets used
up as it flows"* and *"current always splits equally at a fork."*

## 6. Engine reuse & risk

Most of this is **config over the existing circuit engine** — split-by-conductance beads,
`drawResistorBoxC`, `drawAmmeterAtC`, `drawEmfCell`, `drawWireC` all exist (built for
`combination_of_resistors`). Likely **one new scenario flag** (e.g. `junction_rule`) to (a) make node N
the single glow-focal and (b) render the in=out **sum readout** + the STATE_3 **naive-expectation ghost**
(struck-through "1.0 + 1.0").

**Risks (may route to `peter_parker:renderer_primitives` via a quality_auditor FAIL — never cold-called):**
1. The STATE_3 struck-through ghost overlay may need a small renderer primitive if no existing overlay
   fits.
2. The STATE_4 **third branch** may exceed the current 2-branch split. **Fallback:** keep two branches and
   generalize verbally with the Σi_in = Σi_out statement + a rearranged 2-in/1-out framing if a 3rd branch
   isn't cheap.

**New-renderer bring-up contract (must honor — scars from drift_velocity day 1):** cue-gate visuals
derivable at any pinned sim-time incl. t=0 (share gate math between stepPhysics and resetToHomePose);
if the scenario adds a new `scenario_type` it needs `deriveStateMeta` coverage + the `#sliders` exclusion
chain, else THE EYE false-fails / a stale panel bleeds; a scenario drawing new elements ships its config
block. particle_field glow targets are a CLOSED enum (electrons | lattice | field | drift_arrow |
current_meter | formula) — a non-keyed `glow_focal` silently dims the panel; if node/ammeter glow needs a
new key, add it to the enum in the engine (peter_parker scope).

## 7. Registration (8 sites — json_author)

1. `src/data/concepts/kirchhoff_junction_rule_KCL.json` (the concept: `particle_field_config` +
   `epic_l_path`; ≥3 primitives/state; varied advance_mode; conceptual-only)
2. `concept_panel_config` INSERT (or `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`)
3. `CONCEPT_RENDERER_MAP` in `src/lib/aiSimulationGenerator.ts` → particle_field
4. `VALID_CONCEPT_IDS` in `src/lib/intentClassifier.ts`
5. `CLASSIFIER_PROMPT` (+ `ASPECT_VOCABULARY`) in `src/lib/intentClassifier.ts`
6. clusters SQL migration `supabase_migrations/supabase_<date>_seed_kirchhoff_junction_rule_KCL_clusters_migration.sql`
   — **authored-not-applied; N/A-DORMANT this phase** (drill-down deferred; do not let the auditor
   Gate-8 cluster probe false-FAIL on this — see memory `auditor-cluster-registry-false-fail`)
7. **NOT** `PCPL_CONCEPTS` — particle_field is not PCPL (that's the 2D mechanics renderer)
8. seed cache via `_seed_kirchhoff_junction_rule_KCL_cache.ts` storing physics_config =
   `{ epic_l_path, particle_field_config }`

**Not added to `PILOT_CONCEPTS`** — reviewer-first flag (novel-renderer path doctrine).

## 8. Verification / done-list

- `npx tsc --noEmit` → 0 errors
- `npm run validate:concepts` → target PASSES (Gates 12/16a/19/24/25/31/32/33/34/35 green)
- Cache clear (4 separate DELETEs) before any test
- THE EYE: `npm run visual:eyes -- kirchhoff_junction_rule_KCL` → dispatch **eye-walker** (reads frames,
  never main session) → zero new `engine_bug_queue` rows → founder OK → `npm run visual:approve`
- `npm run build:review -- kirchhoff_junction_rule_KCL` + serve → provide `http://localhost:8080/kirchhoff_junction_rule_KCL/`
- Telugu **text** authored via a `model: sonnet` (Sonnet-5 subscription) sub-agent per Rule 30g; **audio
  on-demand only** (Rule 30h) — not a ship/catalog gate; EN audio only if narration matters for pilot.

## 9. Pipeline

Alex pipeline, sequential: **architect → physics-author → json-author → quality-auditor**; auditor
FAIL-routes upstream (or to `peter_parker:*` for the §6 engine risks). Then THE EYE (eye-walker) →
founder review. No parallel authoring.
