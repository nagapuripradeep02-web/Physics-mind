# ARCHITECT SKELETON — `kirchhoff_junction_rule_KCL`

**Chapter:** 3 (Current Electricity) · **Catalog node:** c15 · **Renderer:** `particle_field` (2D circuit family — NOT field_3d, NOT PCPL) · **Tier:** simple · **Date:** 2026-07-11
**Source of truth:** `docs/superpowers/specs/2026-07-11-kirchhoff-junction-rule-kcl-design.md` (APPROVED — this skeleton implements it without deviation).

---

## 1. Atomic claim

This concept teaches ONE idea: at any junction (node) in a circuit, the total current flowing in equals the total current flowing out — **Σi_in = Σi_out** — because charge is conserved and cannot pile up or vanish at a point; when current splits at a fork it redistributes by branch conductance, but the branch currents always add back to exactly what entered. It does NOT cover the loop rule (deferred to `kirchhoff_loop_rule_KVL`, next session), solving two-loop networks (downstream application), the current-divider formula as a derived result (belongs to `resistors_in_parallel` / a deferred drill-down — the number *emerges* from the ammeters here, it is never derived), or Wheatstone/potentiometer (downstream nodes c20/c23).

---

## 2. State count + EPIC-L arc

**5 states** (4 guided + 1 explore) — matches the "simple" calibration band (spec fixes it at exactly 5; the concept is one conservation statement plus its two misconception faces, so 5 is the minimum that builds complete understanding without padding).

| State | Purpose (one line) | `teaching_method` |
|---|---|---|
| STATE_1 | The WHY, micro level: beads stream through node N and none accumulate — charge can't pile up | *(straightforward motion beat — no explicit method field, per Rule 31)* |
| STATE_2 | The rule, first quantitative face: equal branches, A_in = A₁ + A₂ = A_out (2.0 = 1.0 + 1.0 = 2.0) | *(straightforward motion beat)* |
| STATE_3 | **PRIMARY aha / misconception beat**: unequal branches redistribute (1.5 + 0.5) yet the sum is still 2.0 — current shares unevenly but is never used up | `misconception_confrontation` (Rule 16a straightforward contrast beat — NO predict-pause) |
| STATE_4 | Generalization: ANY junction, any number of wires — Σi_in = Σi_out | *(straightforward motion beat)* |
| STATE_5 | Explore: teacher drives all sliders, all four ammeters live | `exploration_sliders` |

The hook MOVES from t=0: STATE_1 opens with beads already streaming through the circuit — no static setup state.

---

## 3. Per-state choreography + control plan (Rule 31 control table — FIRST design artifact)

Narration budget 25–55 EN words per guided state (>55 = split, <20 = merge); motion may outrun narration, never the reverse. No archetype repeat except the DECLARED S2↔S3 contrast pair. No static state. `drag-sandbox`-class archetype reserved for STATE_5.

| # | Teaches (one aspect) | Motion archetype | Distinct motion (what animates, how it differs from every other state) | Delta (≤5-word on-canvas cue, Rule 32c) | Live controls | Narration budget | Dwell |
|---|---|---|---|---|---|---|---|
| S1 | Charge can't pile up at a node (the physical WHY) | **stream-through** *(new coinage — the circuit-family analogue of translate-through: many carriers flow through a fixed node rather than one object moving past apparatus)* | Electron beads flow steadily around the full loop and THROUGH node N; a soft counter near N shows beads-in = beads-out per second; nothing accumulates, node N is the single glow focal. Differs from all others: no split yet — one continuous stream. | "Nothing piles up here" | none (watch-this beat) | ~35 EN words | ~14 s (≥1 full loop cycle) |
| S2 | Current splits and adds back — equal branches | **fork-split** | The single stream divides at N into two equal branch streams (R₁ = R₂), recombines at the far node; all four ammeter needles settle live: A_in = 2.0 A → A₁ = 1.0, A₂ = 1.0 → A_out = 2.0. Sum readout "2.0 = 1.0 + 1.0" composes after the needles settle. Differs from S1: the split exists; differs from S3: split is symmetric. | "In = branch₁ + branch₂" | none | ~40 EN words | ~15 s |
| S3 | **Misconception beat** — unequal branches redistribute, sum conserved (PRIMARY aha) | **redistribute** — DECLARED contrast pair with S2 (same fork apparatus; the flip = symmetric 1.0+1.0 → asymmetric 1.5+0.5, sum invariant) | R₂ (bottom) visibly lowers (CAUSE moves first); after a readable beat the bottom bead stream thickens and the top thins (effect); A₂ climbs to 1.5 A, A₁ falls to 0.5 A — while A_in and A_out hold at 2.0 A. The naive expectation ghost "1.0 + 1.0" appears struck through beside the real "1.5 + 0.5 = 2.0". | "Uneven split, same sum" | R₁ slider, R₂ slider (the taught variables) | ~48 EN words | ~18 s |
| S4 | ANY junction generalizes: Σi_in = Σi_out | **converge-diverge** | A THIRD branch (R₃) joins the fork; three branch streams of different thickness leave N and reconverge; the sum readout rebuilds as Σ: "0.4 + 0.6 + 1.0 = 2.0". Camera/framing only moves to admit the new branch (Rule 32d). Differs from S2/S3: three-way, and the Σ notation appears for the first time. **Fallback (engine risk, spec §6):** if a third branch isn't cheap, keep two branches and generalize via the Σ statement + a rearranged 2-in/1-out node framing. | "Total in = total out" | none | ~40 EN words | ~15 s |
| S5 | Explore — teacher drives everything | **free-explore** (the circuit-family `drag-sandbox`) | Teacher drags R₁/R₂ (/R₃) freely; bead thickness, all four (five) ammeters, and the sum readout track live; KCL holds at every setting. | "All yours" | ALL sliders (`show_sliders: true`, `interaction_complete`) | 0 / open | open |

**advance_mode plan (indicative — json_author finalizes against the live enum; Gate 12 needs ≥2 distinct modes, never all-auto, never `wait_for_answer`):** the circuit family's proven baseline is `manual_click` on guided states + `interaction_complete` on explore (per `combination_of_resistors.json`). Do not invent modes.

**Rule 32 legibility plan (all states):**
- 32a cause-first: S3 is the exemplar — R₂ box visibly changes FIRST, bead redistribution + needle movement follow after ~0.5–1 s. S4: the third branch draws in first, currents redistribute after.
- 32b one-variable-moves: in each guided state only the taught thing changes (S1 nothing but the stream; S2 the split; S3 the R₂/R₁ ratio; S4 the branch count). Beads flowing continuously is the home-pose baseline motion, not a violation. Explore exempt.
- 32c: the delta column above ships verbatim as each state's on-canvas top caption (Rule 34a — caption is the cue ONLY; prose narration lives in the subtitle strip below the canvas).
- 32d home pose: ONE circuit persists across all 5 states — cell left, node N center, branches right, recombination node, return wire. No teleport-rebuild; S4 only ADDS a branch.
- 32e single glow focal per instant: S1 = node N → S2 = ammeter row → S3 = branch ammeters (then the ghost) → S4 = the Σ sum readout → S5 = none/free. **Engine note:** particle_field glow targets are a CLOSED enum; the circuit scenario already extended it (`ammeter_total`, `ammeter_branches`, `resistors`, `req_box`, `formula`) — reuse those; if node-N glow needs a new key (`junction_node`), that is a `peter_parker:renderer_primitives` addition routed via the auditor, never cold-called.

**Rule 33 dual-level:** micro mechanism = the beads (no accumulation), macro reading = the four live ammeters with numeric values + tracking needles (33d) — both in the same frame, beads riding the wires; no split canvas needed (spec §4 decision).

**Physics coherence note for physics_author (proposed, not binding):** choose ε = 3.0 V (ideal cell); S2: R₁ = R₂ = 3 Ω → R_eq = 1.5 Ω → I = 2.0 A, branches 1.0 + 1.0; S3: R₁ = 6 Ω, R₂ = 2 Ω → R_eq = 1.5 Ω again → A_in stays EXACTLY 2.0 A while the split flips to 0.5 + 1.5 — the contrast is pure (total pinned, only the sharing changes). In S5 sliders move the total; KCL holds at every setting.

---

## 4. Misconception confrontation plan (Rule 16a)

**Two genuine wrong beliefs, ONE pivot — both confronted at STATE_3** (misconception_watch fires ONLY here; no per-state tic — founder guardrail 2026-07-04):

1. **"Current gets used up as it flows"** (classic sequential-consumption model). Contrast beat: A_out reads 2.0 A — identical to A_in — even after the current has passed through both resistors and recombined. misconception_watch: belief = "current is consumed by the resistors, so less comes out than went in"; visual_counter = A_in and A_out needles pinned at the same 2.0 A while beads visibly complete the loop; one_line_fix = "Current is charge in motion — it is never used up, only energy is."
2. **"Current always splits equally at a fork"** — planted deliberately by STATE_2's symmetric 1.0 + 1.0 (the earned wrong belief). Contrast beat: the naive "1.0 + 1.0" is drawn on canvas and struck through as the real ammeters read 1.5 + 0.5; the sum readout still totals 2.0. misconception_watch: belief = "a fork shares current 50-50"; visual_counter = struck-through ghost "1.0 + 1.0" beside live "1.5 + 0.5 = 2.0"; one_line_fix = "The easier path (lower R) takes more — but the parts always add back to the whole."

Both shown → then corrected, back-to-back in motion — no prediction question, no pause (Rule 16a as amended 2026-07-02). **EPIC-C branches: ZERO** (EPIC-L-first directive 2026-06-10).

---

## 5. `has_prebuilt_deep_dive` states — DEFERRED

V1 ships ZERO authored deep-dives (Rule 18, 2026-06-10). No `has_prebuilt_deep_dive: true` flags authored now. Candidates recorded for the future analytics trigger (≥10 feedback rows OR median dwell >60 s @ ≥50 sessions): STATE_3 (redistribution-by-conductance: why lower R takes more), STATE_4 (Σ sign-convention at an N-wire node).

---

## 6. Drill-down clusters — DEFERRED (authored-not-applied)

Drill-down dormant this phase. Clusters SQL migration authored but NOT applied (spec §7.6); quality_auditor's Gate-8 cluster-registry probe is N/A-DORMANT here (recorded false-FAIL scar). Candidate cluster_ids for the migration file only:
- `current_used_up_at_junction` — "less current comes out than goes in because the resistors consume it."
- `fork_splits_fifty_fifty` — "any split is automatically equal regardless of the branches."
- `sign_convention_at_node` — confusion over which currents count as 'in' vs 'out' when applying Σi = 0.

---

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_3   # "what is the junction rule / KCL / why in = out" (contains the PRIMARY aha)
  multi_branch: STATE_4 → STATE_5   # "node with three or more wires / Σi = 0 form"
```

Default aspect = `foundational`. Both aspects go into `ASPECT_VOCABULARY` / `CLASSIFIER_PROMPT` (registration sites 4–5). Cross-slice pill at the end of the foundational slice: "See it with three branches?" → STATE_4.

---

## 8. Prerequisites (advisory only — Rule 23)

- `electric_current` (catalog c0 → c15 edge; the ONLY prerequisite per spec) — current = rate of charge flow. Status: legacy-era concept, not a shipped Ch.3 diamond — UI shows "Builds on electric current — 5 min intro?", never a gate.

Downstream edges unlocked (graph only): `c15 → c18` (grouping cells in parallel), `c15 → c20` (Wheatstone), and the potentiometer path with KVL c16.

---

## 9. Real-world anchor (Rule 35 — universal, culture-neutral)

**Primary:** a wall socket feeding a **power strip**. The single supply current from the socket splits at the strip — some to each plugged-in device — and every branch current returns and sums back to exactly what the socket delivered; nothing is lost or stored at the split. Hooks a Class 10–12 student who has plugged three things into one strip and wondered whether "adding more devices weakens the others" — the strip IS a junction. Physics-true at depth: the split redistributes by each device's effective resistance; the return conductor carries the sum.

**Secondary (optional, one line in S4):** water pipes at a T-junction — flow in equals flow out because water doesn't compress or vanish at the joint. Passing analogy only, never the central apparatus.

No country, brand, festival, currency, place, or name anywhere in rendered or narrated text (all languages). Plain English — no Hinglish. Mains voltage/frequency never asserted as a national value (Rule 35b — irrelevant here; the sim uses a cell, not mains).

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) Every EPIC-L state:**
- STATE_1 — beads stream through node N, none accumulate; node glow; caption "Nothing piles up here"; ~35 w.
- STATE_2 — equal fork; four ammeters settle to 2.0 / 1.0 / 1.0 / 2.0; sum readout "2.0 = 1.0 + 1.0"; caption "In = branch₁ + branch₂"; ~40 w.
- STATE_3 — R₂ lowers first, streams redistribute to 0.5 / 1.5, A_in = A_out = 2.0 held; struck-through ghost "1.0 + 1.0" beside "1.5 + 0.5 = 2.0"; R₁/R₂ sliders live; caption "Uneven split, same sum"; ~48 w.
- STATE_4 — third branch joins (fallback: 2-branch Σ framing); Σ readout "0.4 + 0.6 + 1.0 = 2.0"; caption "Total in = total out"; ~40 w.
- STATE_5 — all sliders live, all instruments tracking; `interaction_complete`; narration 0/open.

**(b) Symbol-label table** (on-canvas labels stay symbolic per Rule 24; narration expands bare symbols per Rule 30):

| Quantity named in narration | Exact on-canvas label |
|---|---|
| total current in | `A_in` · needle + numeric `2.0 A` |
| branch-1 current | `A₁` · numeric `1.0 A` / `0.5 A` |
| branch-2 current | `A₂` · numeric `1.0 A` / `1.5 A` |
| branch-3 current (S4) | `A₃` · numeric |
| total current out | `A_out` · numeric `2.0 A` |
| top / bottom / third resistor | `R₁`, `R₂`, `R₃` (Ω values on sliders) |
| the cell / EMF source | `ε` (cell symbol) |
| the junction | `N` (node dot) |
| the rule (S4 formula surface) | `Σi_in = Σi_out` — ONE math-serif Unicode formula surface (real Σ, subscripts, Ω) |
| sum readout (value-only HUD) | e.g. `1.5 + 0.5 = 2.0 A` (numbers only) |

**(c) Right-hand-rule plan:** N/A — no 3D field/direction teaching (2D circuit; current direction shown by bead flow + wire arrowheads). Declared N/A.

**(d) Motion plan:** beads flow continuously in every state (home-pose baseline); S2 fork-split forms; S3 R₂ box change → stream re-thickening → needle moves (cause→beat→effect); S4 third branch draws in → three-way redistribution; all ammeter needles track live with numeric readouts (33d); S5 slider-driven. No passive state.

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20 dormant). `epic_l_path` + `particle_field_config` only.

**(f) assessment + coverage_map + misconception_watch:** assessment authored — e.g. "Currents of 3 A and 2 A enter a junction; 4 A leaves along one wire. Find the current in the remaining wire, and state its direction." with coverage_map tracing each knowledge piece to S1/S3/S4; misconception_watch at STATE_3 ONLY (the two §4 entries).

**Engine/bring-up done-items (spec §6):** likely one new scenario flag `junction_rule` (node-N glow focal + sum readout + S3 struck-through ghost); cue-gated visuals derivable at any pinned sim-time incl. t=0; deriveStateMeta coverage + #sliders exclusion chain if a new scenario_type is added; ghost overlay + third branch are the two declared peter_parker:renderer_primitives risks with the S4 fallback pre-authorized. Registration = 8 sites (site 7 = explicitly NOT PCPL_CONCEPTS). NOT added to PILOT_CONCEPTS. Telugu TEXT via Sonnet-5 sub-agent (Rule 30g); audio on-demand only (Rule 30h).

---

## Aha-moment designation

- **PRIMARY aha (10-year memory):** STATE_3 — the split "looks broken" (1.5 A vs 0.5 A), yet A_in and A_out both still read 2.0 A: current is never used up, it only shares unevenly.
- **SUPPORTING aha:** STATE_1 — nothing can pile up at a point in a wire; the rule isn't a law you memorize, it's charge conservation you can watch.
- Cohesion: S1's "no pile-up" is exactly why S3's sum must hold even when the split is ugly.
- Wrong-belief setup: STATE_2's symmetric 1.0 + 1.0 deliberately plants "forks split equally"; S3 breaks it plus "things get used up" while the student feels confident.
- Foundational-coverage: SATISFIED — PRIMARY aha (STATE_3) is inside entry_state_map.foundational (STATE_1 → STATE_3).

---

## FLAGS to downstream

- **To quality_auditor (Gate 8):** this dispatch had no shell — re-run `npx tsx src/scripts/query_engine_bug_queue.ts` live to confirm no newer architect-class rows; review the two declared engine-risk exceptions (S3 ghost overlay, S4 third branch + fallback).
- **To physics_author:** confirm or replace the ε = 3.0 V / (3,3)→(6,2) Ω constant-total proposal; declare variables/formulas/constraints; write per-state reveal timelines; flesh out the dormant cluster trigger_examples in the migration only.
