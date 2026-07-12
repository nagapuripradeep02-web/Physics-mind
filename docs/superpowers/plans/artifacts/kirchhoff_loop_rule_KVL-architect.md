# ARCHITECT SKELETON — `kirchhoff_loop_rule_KVL`

**Chapter:** 3 (Current Electricity) · **Catalog node:** c16 · **Renderer:** `particle_field` (2D circuit family — NOT field_3d, NOT PCPL) · **Tier:** simple · **Date:** 2026-07-12
**Source of truth:** `docs/superpowers/specs/2026-07-12-kirchhoff-loop-rule-kvl-design.md` (APPROVED — implements it without deviation).
**Sibling:** `kirchhoff_junction_rule_KCL` (c15, shipped 2026-07-11). KCL = charge conservation at a junction (currents); THIS = energy conservation around a loop (voltages). Together unlock Wheatstone (c20, needs both) + potentiometer (c23, needs KVL).

---

## 1. Atomic claim

Around any closed loop, the algebraic sum of potential changes is zero — **ΣV = 0** — because the EMF raises the potential (+ε) and each resistor drops it (−IR), so the rise equals the total of the drops and a charge returns to exactly the potential it started at (energy conservation); ideal single-loop cell: **ε = IR₁ + IR₂**; the signs (DCP "H→L": source − to + = +ε rise; resistor along the current = −IR drop, H end to L end) close the loop. NOT: the junction rule (shipped KCL), multi-loop mesh analysis (downstream), internal resistance as a taught idea (shipped `internal_resistance`; r only an optional explore slider), a second/opposing EMF (deferred drill-down), Wheatstone/potentiometer (downstream).

## 2. State count + EPIC-L arc — 5 states (4 guided + explore)

| State | Purpose | teaching_method |
|---|---|---|
| S1 | WHY: walk the loop; potential rises at cell, drops across resistors, lands back at start height; round trip = 0 | straightforward motion beat |
| S2 | Quantitative: +6V up, −4V, −2V down; voltmeters 6/4/2; "6 = 4 + 2" | straightforward motion beat |
| S3 | **PRIMARY aha / misconception beat**: change a resistor, drops redistribute but sum to ε; naive "6+4+2=12 ✗" ladder shoots up & never returns vs signed "6−4−2=0 ✓" | misconception_confrontation (Rule 16a straightforward, NO predict-pause) |
| S4 | Generalize: add 3rd resistor, ladder steps 3× still closes to 0; ΣV=0 any loop | straightforward motion beat |
| S5 | Explore: all sliders (ε,R₁,R₂,R₃); ladder+voltmeters live; ΣV=0 every setting | exploration_sliders |

Hook moves from t=0: S1 opens with beads circulating + marker already walking. No static setup.

## 3. Per-state control table (Rule 31 — required artifact)

| # | Teaches | Motion archetype | Distinct motion | Delta cue (≤5w) | Live controls | Words | Dwell |
|---|---|---|---|---|---|---|---|
| S1 | Round trip = 0 (WHY, energy conservation) | **loop-walk** | Marker walks loop from cell − terminal; ladder traces UP +ε at cell, DOWN across R₁, DOWN across R₂, lands at start height; beads circulate (home-pose); loops continuously. Traversal IS the motion — no numbers yet. | "Loop closes at zero" | none | ~35 | ~14s |
| S2 | Rise = total drops: ε=IR₁+IR₂ (6=4+2) | **staircase-build** | Ladder rebuilds step by numbered step: +6V riser (voltmeter→6), −4V step across R₁ (voltmeter→4), −2V across R₂ (voltmeter→2), readable beat between; sum "6 = 4 + 2" composes after last step lands at 0. | "Rise = total drops" | none | ~40 | ~15s |
| S3 | Signs close the loop; no leftover (PRIMARY aha) | **redistribute + ghost** (DECLARED contrast pair w/ S2) | R₂ changes FIRST (box/slider grows, CAUSE); beat; beads slow (I falls), −IR steps redistribute — **R₂ 1→4Ω, so I 2→1A, drops SWAP 4+2 → 2+4** — ladder still lands at 0. Dim naive ghost adds all positive "6 + 4 + 2 = 12 ✗" (shoots UP, never returns), struck through, as real "+6 − 4 − 2 = 0 ✓" pins to zero. | "Signs close the loop" | R₁, R₂ sliders | ~48 | ~18s |
| S4 | ANY loop, any elements: ΣV=0 | **extend-loop** | Third resistor **R₃=3Ω** draws in FIRST (cause); beat; beads slow to new I; ladder re-traces THREE down-steps — **I=1A, drops 2 + 1 + 3** — still lands at 0; "ΣV = 0" appears on formula surface first time. **Fallback:** if a 3rd ladder step is non-trivial, keep 2 resistors + generalize verbally (pre-authorized, mirrors KCL S4). | "More drops, still zero" | none | ~40 | ~15s |
| S5 | Explore | **free-explore** (drag-sandbox) | Teacher drags ε,R₁,R₂,R₃; bead speed, every voltmeter, ladder profile, ΣV readout track live; ladder closes to 0 at every setting. | "You drive it" | ALL (ε,R₁,R₂,R₃; show_sliders:true, interaction_complete) | 0/open | open |

**advance_mode:** manual_click ×4 guided + interaction_complete explore (per emf_definition/internal_resistance). ≥2 distinct (Gate 12), never wait_for_answer, never all-auto.

**Rule 32:** 32a cause-first (S3: R₂ changes first → beads slow → ladder redistributes → ghost; S4: R₃ draws in first; S2: step lands then voltmeter settles). 32b one-variable (S1 walk, S2 numbered steps, S3 R₂ value, S4 element count; beads circulating = home-pose baseline). 32c delta = on-canvas caption only, prose in subtitle strip. 32d ONE loop persists (cell left, R₁ top, R₂ right, return wire; ladder panel fixed zone); S4 only ADDS R₃; S3 ghost overlays the existing ladder panel. 32e single glow focal: S1 ladder → S2 voltmeter row (then ladder) → S3 formula/ghost → S4 ladder (3rd step) → S5 none.
**Glow enum (CLOSED):** cell scenarios expose `pump, ladder, voltmeter, electrons, formula` (verified emf_definition/internal_resistance) — reuse. New key (e.g. `kvl_sum`) = peter_parker in-engine addition via auditor, never cold-called; non-keyed glow silently dims the panel.
**Rule 33:** macro = loop + per-element voltmeters (live numeric) + ladder w/ marker as tracking needle (33d); micro = beads flowing ∝ I (visibly slow when total R rises). Same frame, no split canvas.

**Physics (verified — physics_author confirms/replaces):** ε=6V ideal, R₁=2Ω, R₂=1Ω → I=2A, V₁=4V, V₂=2V (+6−4−2=0). S3: R₂ 1→4Ω → I=1A, drops swap to 2+4 (sum 6). S4: R₃=3Ω, R₁/R₂ home → total 6Ω, I=1A, drops 2+1+3=6 (+6−2−1−3=0). Clean integers; only the taught element changes each state (32d).

## 4. Misconception plan (Rule 16a) — ONE pivot, STATE_3 only

1. **"There's leftover voltage after the drops"** — belief: some voltage remains after the last resistor. visual_counter: ladder pinned to exactly 0 at loop-close while drops redistribute under the slider. one_line_fix: "The rise equals the total of the drops — a full loop always nets to zero."
2. **"You add all voltages regardless of direction (signs)"** — belief: loop equations add all element voltages positive (6+4+2=12). visual_counter: struck-through runaway ghost ladder beside the real signed ladder closing to 0; H/L labels anchor why resistor terms are negative traversed along the current. one_line_fix: "Rises are +, drops are − (H to L along the current) — only the signed sum closes the loop."

Both shown → corrected, back-to-back in motion, no predict-pause. EPIC-C branches ZERO.

## 5. Deep-dive — DEFERRED. Candidates: S3 (second/opposing EMF — sign of ε flips), S4 (systematic ΣV=0 for arbitrary element order, traversal-direction choice).

## 6. Drill-down clusters — DEFERRED (authored-not-applied; Gate-8 N/A-DORMANT). Candidate ids: `leftover_voltage_after_drops`, `all_voltages_added_positive`, `second_emf_sign_in_loop`.

## 7. entry_state_map

```
foundational:  STATE_1 → STATE_3   # loop rule / KVL / why voltages sum to zero (PRIMARY aha)
multi_element: STATE_4 → STATE_5   # loop with 3+ elements / ΣV=0 general form
```
Default `foundational`. Both aspects → ASPECT_VOCABULARY/CLASSIFIER_PROMPT. Cross-slice pill: "See it with a third resistor?" → STATE_4.

## 8. Prerequisites (advisory — Rule 23)
- `emf_definition` (c11, SHIPPED): ε = ladder step height; +ε riser is that diamond's ladder step. Cliff at S1 — patch: S1 narration "the cell lifts every coulomb by six joules — that's the step up."
- `internal_resistance` (c12, SHIPPED): why "ideal cell" (r=0 declared). Cliff at S2 — patch: cell labeled ideal on-canvas + "an ideal cell here, so the full six volts arrives."
Downstream: c16→c20 (Wheatstone), c16→c23 (potentiometer), grouping-cells c17/c18.

## 9. Real-world anchor (Rule 35 — universal)
**Primary:** a hiking **loop trail** — climb the ridge, walk down the far side, arrive back at the trailhead at exactly the altitude you started, no matter how the descents split. Round trip nets to zero; the cell = the climb, each resistor = a descent, total descent = the climb. Altitude = gravitational potential per mass exactly as voltage = electric PE per charge — quantitative, not decorative.
**Secondary (real device, one line):** a series lamp loop — a battery + two lamps; the full push is shared between the lamps, nothing left over.
No country/brand/festival/currency/place/name in any language. Plain English, no Hinglish. No region-dependent constant (battery sim).

## 10. Definition of Done (Gate 0 — zero TBDs)
**(a)** S1 marker walks loop, ladder +ε/−IR₁/−IR₂ lands at start, ladder glow, "Loop closes at zero", ~35w · S2 staircase step-by-step, voltmeters 6/4/2, sum "6 = 4 + 2", "Rise = total drops", ~40w · S3 R₂ 1→4 first, beads slow, drops swap 4+2→2+4, ladder closes 0, ghost "6 + 4 + 2 = 12 ✗" struck vs "+6 − 4 − 2 = 0 ✓", H/L labels, R₁/R₂ sliders, "Signs close the loop", ~48w · S4 R₃=3 draws in, three steps 2+1+3 close 0, "ΣV = 0" surface, "More drops, still zero", ~40w (fallback pre-authorized) · S5 all sliders live, interaction_complete, 0/open.
**(b) Symbol-label table:** ε (cell)·voltmeter 6.0V · I·2.0A(bead speed∝I) · R₁/R₂/R₃(Ω) · V₁/V₂/V₃ voltmeter 4.0/2.0V · H/L tags at resistor current-entry/exit (S3+) · ladder V-axis + 0 baseline tick · walking marker (dot on loop + ladder = needle, 33d) · formula surface `ε = IR₁ + IR₂` (S2–S3) → `ΣV = 0` (S4+), ONE math-serif Unicode surface · sum HUD `+6 − 4 − 2 = 0` (signs+numbers), S3 ghost `6 + 4 + 2 = 12 ✗` struck. All 3 Unicode text paths (DOM/canvas-axis/sprite): real ε Σ Ω − ₁₂₃, never `eps/Sum/ohm/-/R1`.
**(c) RHR:** N/A (2D circuit; direction via beads + arrowheads + H/L). Declared N/A.
**(d) Motion:** beads circulate every state (∝I); S1 marker+trace walk; S2 step-by-step w/ beats; S3 R₂→slowdown→redistribution→ghost strike; S4 R₃ in→slow→3-step; S5 slider-driven. Voltmeters live numeric + ladder marker needle (33d). No passive state.
**(e) Modes:** conceptual-only, NO mode_overrides (Rule 20). epic_l_path + particle_field_config only. scenario_type stays circuit family (reuse emf_definition-class / gated flag) — do NOT mint a new scenario_type.
**(f) assessment + coverage_map + misconception_watch:** assessment "ideal 12V cell + 4Ω & 2Ω series: find I, each drop, show ΣV=0"; coverage_map loop-sum→S1 / ε=IR₁+IR₂→S2 / signs→S3 / n-elements→S4; misconception_watch S3 ONLY.

**Engine done-items (all gated, zero regression to emf_definition/internal_resistance/combination_of_resistors/electric_power):** (1) multi-step series ladder (2–3 down-steps); (2) per-element voltmeters (cell + each R, labeled+signed); (3) `kvl_sum_readout` HUD (sibling of `kcl_sum_readout`); S3 ghost reuses shipped `drawStruckTextC` + possible runaway-ladder trace variant. Declared peter_parker:renderer_primitives risks — routed via auditor FAIL, never cold-called; S4 two-resistor fallback pre-authorized. Cue-gated visuals derivable at t=0. 8 sites (site7 NOT PCPL_CONCEPTS; seed `_seed_kirchhoff_loop_rule_KVL_cache.ts`). NOT PILOT_CONCEPTS. Telugu TEXT via model:sonnet (Rule 30g); audio on-demand (30h).

## Aha designation
- **PRIMARY (10-yr):** STATE_3 — ladder always lands at exactly 0; change resistors and drops reshuffle (4+2→2+4) but nothing's left over and only the signed arithmetic closes the loop. Voltage around a loop = a round trip, not supply-with-remainder.
- **SUPPORTING:** STATE_1 — the loop rule isn't a formula, it's the trivial fact a round trip ends where it began; watch the marker come home before any number.
- Cohesion: S1's return is exactly why S3's signed sum must be 0 however drops redistribute. Wrong-belief setup: S2's clean unsigned "6=4+2" makes signs look optional + invites leftover-voltage. Foundational-coverage SATISFIED (PRIMARY aha S3 ∈ foundational S1→S3).

## FLAGS
- **physics_author:** confirm/replace constants (ε=6,R₁=2,R₂=1→I=2,drops4/2; S3 R₂1→4→I=1,drops2/4; S4 R₃=3→I=1,drops2/1/3). Declare vars/formulas/constraints + slider ranges keeping drops legible; per-state timelines from §3; dormant cluster trigger_examples in migration only; decide optional `r` slider in S5 (permitted, never a guided target).
- **json_author:** ladder/voltmeter/glow shape per emf_definition.json + internal_resistance.json; sum-readout + struck-ghost per shipped KCL; 8 sites per spec §7; aspects foundational + multi_element.
- **quality_auditor:** Gate-8 cluster-registry N/A-DORMANT (false-FAIL scar); S4 two-resistor fallback pre-authorized; re-run engine_bug_queue live (this dispatch had no shell); review declared engine risks (multi-step ladder, per-element voltmeters, kvl_sum_readout, S3 runaway-ghost, S4 3rd step+fallback).
