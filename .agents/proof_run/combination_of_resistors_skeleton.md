# ARCHITECT SKELETON — `combination_of_resistors`
**Chapter:** Class 12, Ch.3 Current Electricity — NCERT §3.10 (Combination of Resistors — Series and Parallel)
**Renderer:** `particle_field` (2D p5.js) — NEW circuit scenario (`scenario_type: "combination_of_resistors"`), engine extension required BEFORE json_author (see "Engine delta flags" at the end)
**Position:** 4th Ch.3 diamond, after `drift_velocity` → `ohms_law` → `resistivity` (all shipped)

---

## 0a. Engine bug queue consultation (pre-authoring)

The bug-queue SQL script is not executable from the architect's read-only toolset this dispatch (no Bash/DB tool). Consulted the read-only mirrors instead: the session-memory scar notes for the particle_field family (drift_velocity + ohms_law bring-ups) and the `_seed_engine_bug_queue_*.ts` catalog. **FLAG to quality_auditor: Gate 8 must re-verify this skeleton against the live `engine_bug_queue` rows.** Prevention rules applied:

| Scar / prevention rule | How this skeleton satisfies it |
|---|---|
| Glow enum is CLOSED — a non-keyed `glow_focal` or per-sentence `glow` silently dims the whole panel | Every glow key used per state is listed in the DoD; the NEW keys (`resistors`, `junction`, `ammeter_total`, `ammeter_branches`, `volt_probe`, `req_box`, `switch`) are declared as an explicit engine delta to be registered in `dimFor` FIRST |
| New `scenario_type` also needs `deriveStateMeta` (D7/reveal_hold) + the `#sliders` exclusion chain, else THE EYE false-fails / stale panel bleeds | Declared in Engine delta flags; json_author must not ship until renderer lands |
| Cue-bearing states: cue gates at t=0 / `__PM_supportsTimePin` / RESET_TRAJECTORY / seeded determinism | All one-shots (splice, rewire, collapse, switch) declared as `scenario_cue` + `at_ms` fallback, re-timed via SET_CUE_TIME; every state re-seeds to home pose on entry |
| One-shots bind to the narrating sentence via `scenario_cue`, never hardcoded `*_at_ms` alone | Cue plan in §3 names the carrying sentence per one-shot |
| No backticks inside the renderer code string | Engine-delta note (renderer work, not JSON) |
| `misconception_watch` only at genuine pivots (founder 2026-07-04) | Exactly 3 pivots (S3, S5, S6) across 9 states |
| Rule 31a word budget 25–55 EN words counted on `text_en` | Budget column in §3 table |
| Never `auto_after_animation` on a static-but-live state; ≥2 distinct advance_mode | S1–S8 `manual_click`, S9 `interaction_complete` |

**DC Pandey check:** Consulted Current Electricity table of contents (combination-of-resistors: series & parallel sections) for SCOPE only, consistent with the documented consults in the three shipped siblings — confirms series+parallel is one NCERT/DCP section, with EMF/cells/Kirchhoff/Wheatstone as separate sections. No teaching method, no example problem, no figure reference imported.

---

## 1. Atomic claim

This concept teaches how resistors combine and only that: in SERIES the same current threads every resistor, voltages add, and R_eq = R₁ + R₂ + …; in PARALLEL every branch gets the same voltage, currents add at the junction, and 1/R_eq = 1/R₁ + 1/R₂ + … — so parallel R_eq is always LESS than the smallest branch.

It does **not** cover: EMF and internal resistance (deferred to `cells_emf_internal_resistance`, NCERT §3.11–3.12), combinations of cells (deferred to `combination_of_cells`), Kirchhoff's rules (deferred to `kirchhoffs_laws`, §3.13), Wheatstone/metre bridge (§3.14–3.15, deferred), power and heating in combinations (deferred to `electric_power_heating`), and mixed-network reduction drills (the two collapse laws taught here ARE the tool; multi-step network reduction belongs to the Kirchhoff/Wheatstone concepts).

**Atomicity defense (why series AND parallel in one concept, not two):** the PRIMARY aha — adding a resistor in parallel LOWERS total resistance — only lands against the freshly-earned series intuition "adding a resistor lowers the current." Splitting into `series_resistance` + `parallel_resistance` would orphan the aha from its wrong-belief setup. NCERT bundles them in one section (§3.10) for the same reason: the contrast IS the teachable idea. One student question: *"what resistance does a combination of resistors present to the battery?"*

---

## 2. State count + arc

**9 states — complex tier.** Justification vs the §5 sanity table: a single combination law would be medium (5–6 states), but this concept's atomic idea is the PAIR of laws plus their counterintuitive contrast — two complete micro-arcs (series build → verify → quantify; parallel build → divide → quantify) plus baseline, real-world synthesis, and explore. Same tier and count as `vector_resolution` (9 states, derives two frameworks). No padding: every state in §3 has a genuinely distinct motion; nothing in the atomic claim survives deletion of any state.

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 | Baseline: one loop, one resistor — battery on, ammeter settles at i = V/R₁ = 1.00 A (the reference every later state is measured against) | straightforward motion beat (field omitted, sibling precedent) |
| S2 | Series build: R₂ splices IN-LINE, electrons slow everywhere, meter falls 1.00 → 0.50 A — resistances add, R_eq = R₁ + R₂ | straightforward motion beat |
| S3 | Same current everywhere in series: three in-line ammeters stay matched the whole dwell — current is never used up (misconception pivot a) | straightforward motion beat (contrast beat) |
| S4 | Voltages add: a probe cycles the loop, potential staircases down — V₁ + V₂ = V, bigger R takes the bigger share | straightforward motion beat |
| S5 | **PRIMARY AHA** — the SAME R₂ re-lands ACROSS R₁, a junction blooms, and the meter LEAPS 1.00 → 2.00 A: a new path is room for flow, not a new obstacle (misconception pivot c) | straightforward motion beat (contrast beat) |
| S6 | Current divides by ease of path: R₂ grows to 12 Ω, the junction splits the stream 2:1 — branch meters unequal, same 6 V across both (misconception pivot b) | straightforward motion beat (contrast beat) |
| S7 | Parallel quantified: the two branches collapse into ONE equivalent box reading R_eq = 4 Ω — less than the smallest branch; 1/R_eq = 1/R₁ + 1/R₂; total meter unmoved | straightforward motion beat |
| S8 | Why homes wire in parallel: open one branch — the other doesn't blink; open the series chain — everything dies (the anchor payoff, branch independence) | compare_contrast |
| S9 | Explore — all dials live: V, R₁, R₂, series/parallel topology toggle, branch switch | exploration_sliders |

The hook MOVES from t=0 (S1's flow starts and the needle climbs on entry — no static setup state).

**Fixed numbers (physics_author to verify and range):** V = 6.0 V visible battery (fixed until S9); R₁ = 6 Ω; R₂ = 6 Ω default, swept/dragged to 12 Ω in S6–S8. Yields all-clean readings: 1.00 A → 0.50 A (series 6+6) → 2.00 A (parallel 6∥6) → 1.50 A with 1.00/0.50 split (6∥12, R_eq = 4 Ω) → series 6+12 = 18 Ω → 0.33 A. Sibling-consistent calibration: honest ratios, visible supply (no hidden V_supply fudge needed here — R values are Ω-scale by construction).

---

## 3. Per-state choreography + control plan (Rule 31 — REQUIRED table)

**Coined archetypes (one-line justifications):** `branch-split` — a single stream divides at a node into unequal sub-streams; the seed vocabulary (built from magnetism) has no junction-divide motion, and it is THE defining parallel-circuit picture. `collapse-substitute` — multiple elements morph into their single equivalent while every meter holds steady; "equivalence proven by unmoved readouts" is a motion class no existing archetype names.

**Declared contrast pair:** S2 / S5 share `reveal-build` — same act (add the same resistor R₂), opposite placement (in-line vs across), opposite consequence (meter falls vs meter leaps). The delta lines name the flip.

| State | Teaches (ONE idea) | Archetype | Distinct motion (what animates, how it differs from every other state) | Delta (≤5-word caption cue, Rule 32c) | Live controls (31c) | Narration budget |
|---|---|---|---|---|---|---|
| S1 | Baseline reference: i = V/R₁ = 1.00 A in a one-resistor loop | flow-along-path | Battery cue fires → electron beads stream single-file around the loop; ammeter needle climbs 0 → 1.00 A and settles. Only state with a single plain loop. | "One loop, one ampere" | none (watch beat) | 30–40 words / ~14 s |
| S2 | Series: resistances ADD — R_eq = R₁ + R₂, current falls everywhere | reveal-build (pair with S5) | Wire parts, R₂ box slides IN-LINE and splices in (cue on narrating sentence); after a readable beat every bead in the loop slows together; needle sinks 1.00 → 0.50; overlay writes R_eq = R₁ + R₂ = 12 Ω. Dragging R₂ up sinks it further. | "Second resistor, in-line" | R₂ | 40–55 words / ~17 s |
| S3 | Series current is IDENTICAL everywhere — nothing is used up | null-result-hold | Three in-line ammeters (before R₁, between, after R₂) tick per-second crossing tallies; all three needles sit matched at 0.50 A for the whole dwell — deliberately "nothing differs." Beads neither thin nor slow anywhere. | "Three meters, one reading" | none | 35–50 words / ~15 s |
| S4 | Series voltages ADD — V₁ + V₂ = V; bigger R takes the bigger share | oscillate/track | A glowing probe cycles the loop continuously; a voltmeter readout tracks it: flat 6 V wire → staircase down 3 V across R₁ → flat → down 3 V across R₂ → 0 V at the battery's return. Dragging R₂ to 12 Ω re-proportions the steps 2 V / 4 V live. | "Voltage steps down twice" | R₂ | 40–55 words / ~17 s |
| S5 | **PRIMARY AHA:** a parallel path LOWERS total resistance — meter CLIMBS | reveal-build (pair with S2 — the flip: across, not in-line) | R₂ lifts OUT (loop heals, needle recovers to 1.00 — one readable beat re-anchoring baseline), then the SAME box re-lands ACROSS R₁; a junction node blooms; after the cause-beat the needle LEAPS 1.00 → 2.00 A; overlay: R_eq = 3 Ω < R₁. | "Same resistor, placed across" | none (the aha lands clean) | 45–55 words / ~19 s |
| S6 | Current divides by conductance — easier path takes more; same V across both | branch-split (coined) | R₂ auto-grows 6 → 12 Ω: at the junction the bead stream visibly splits UNEQUALLY — branch 1's stream and meter hold pinned at 1.00 A while ONLY branch 2 thins to 0.50 A; both branch labels read the same 6 V. Dragging R₂ re-proportions the split live. | "Easier path takes more" | R₂ | 40–55 words / ~17 s |
| S7 | 1/R_eq = 1/R₁ + 1/R₂ — parallel R_eq is BELOW the smallest branch | collapse-substitute (coined) | The two branch boxes glide together and morph into ONE equivalent box stamped R_eq = 4 Ω; junction fades; the total ammeter holds 1.50 A through the morph — equivalence proven by the unmoved needle. Dragging R₂ afterwards: R_eq readout roams but NEVER rises above 6 Ω. | "Two boxes become one" | R₂ | 45–55 words / ~19 s |
| S8 | Parallel branches are INDEPENDENT — why homes wire in parallel | cycle-compare | A→B→A′ loop with a switch on branch 2: parallel — switch opens, branch 2 beads halt, branch 1 flows unchanged (meter pinned 1.00 A); topology flips to series — switch opens, ALL beads halt, every meter dies to zero; cycle repeats. | "One switch, others unaffected" | switch (toggle) | 45–55 words / ~19 s |
| S9 | Explore — the whole law under your hands | drag-sandbox | Teacher drags anything: V, R₁, R₂, series↔parallel toggle, switch; all meters, bead streams, R_eq box readout and formula respond live. Demo motion runs until a trusted drag seizes it. | "All yours" | ALL: V, R₁, R₂, topology, switch | 0/open (one sentence ≤20 words) |

**No-repeat audit:** flow-along-path ×1, reveal-build ×2 (declared pair), null-result-hold ×1, oscillate/track ×1, branch-split ×1, collapse-substitute ×1, cycle-compare ×1, drag-sandbox ×1 (explore only). No static state.

**Rule 32 legibility plan (all states):**
- **32a cause-first:** every one-shot (splice S2, rewire S5, collapse S7, switch S8) completes its motion FIRST; the meter/stream response follows after a ~0.7 s readable beat — never simultaneous.
- **32b one variable:** in S6 only branch 2's stream changes (branch 1 pinned — itself the teaching); in S4 only the probe+staircase respond to R₂; S3 deliberately changes nothing (that IS the idea). Explore exempt.
- **32c:** delta column above = the caption openers, all ≤5 words.
- **32d home pose:** ONE apparatus throughout — battery + loop + R₁ + R₂ + main ammeter, persisting from S1's pose; states re-enter reseeded to their authored pose (renderer already reseeds PRNG on SET_STATE); no teleport-rebuild — S5's rewire is an on-screen MOTION, not a scene swap. S8 adds only a switch to the existing branch.
- **32e single focal** (per-state `glow_focal`, per-sentence `glow` shifts allowed, every key registered): S1 `ammeter_total` · S2 `resistors`→`ammeter_total` · S3 `ammeter_branches` · S4 `volt_probe` · S5 `junction`→`ammeter_total` · S6 `junction`→`ammeter_branches` · S7 `req_box` · S8 `switch` · S9 `formula`.

**Cue plan (scenario_cue bound to the narrating sentence; `at_ms` fallback for THE EYE):** S1 `battery_on` (s1_1) · S2 `splice_in` (s2_1) · S5 `lift_out` (s5_1) + `land_across` (s5_2) · S6 `r2_grow` (s6_1) · S7 `collapse_eq` (s7_2) · S8 `switch_cycle` (s8_1).

**advance_mode:** S1–S8 `manual_click`, S9 `interaction_complete` — Gate 12 satisfied, no `wait_for_answer`/`pause_after_ms` anywhere.

---

## 4. Misconception confrontation plan (Rule 16a — 3 pivots, not per-state)

EPIC-C branches: NOT authored (EPIC-L-first directive 2026-06-10). All three confrontations are straightforward contrast beats inside EPIC-L — wrong expectation's consequence named, real physics shown, no predict-pause.

| # | Genuine wrong belief | Pivot state + `misconception_watch` beat |
|---|---|---|
| a | "Current gets used up crossing a resistor — the resistor after the first one gets less" | **S3.** Belief: the far ammeter should read less than the near one. Visual counter: three in-line ammeters with per-second crossing tallies stay matched at 0.50 A for the entire dwell — before, between, and after both resistors. One-line fix: resistors spend voltage, never current — in one series loop every plane passes the same electrons per second. |
| c | "Adding ANY resistor increases total resistance / decreases current" | **S5.** Belief: it just fell 1.00 → 0.50 when R₂ joined in series — adding it again must drop the meter below 1.00. Visual counter: the SAME resistor re-lands ACROSS R₁ and the needle LEAPS to 2.00 A while the R_eq overlay drops to 3 Ω. One-line fix: in-line adds obstacle, across adds a PATH — more paths, more current, less resistance. |
| b | "Parallel branches share the current equally" | **S6.** Belief: the junction should split 50–50. Visual counter: with R₂ grown to 12 Ω the stream visibly splits 2:1 — 1.00 A down 6 Ω, 0.50 A down 12 Ω, both branches labelled the same 6 V. One-line fix: branches share VOLTAGE equally, never current — each branch draws i = V/R for itself. |

**Planting-moment guard:** S2 (current falls when R₂ joins) could itself plant belief (a) — "the new resistor ate the current." S2's narration therefore must say the slowdown happens *everywhere in the loop at once* (and the choreography shows all beads slowing together), and S3 kills the residue immediately after.

---

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

| State | Why invest |
|---|---|
| **S5** | The PRIMARY aha and the concept's hardest intuition — "how can adding a resistor reduce resistance? where does the extra current come from?" is the most-asked question on this topic; multiple documented phrasings. |
| **S6** | Current division is where the math bites — the inverse ratio i₁/i₂ = R₂/R₁ trips students (they write R₁/R₂); historically a stuck point on every parallel-circuit problem set. |
| **S7** | The reciprocal formula's classic mechanical error — computing 1/R_eq correctly and forgetting to invert (answering "0.25 Ω" for 6∥12) — plus the product-over-sum shortcut's two-resistor-only boundary. |

Per current policy (Rule 18) these are hand-authored only on analytics trigger; V1.0 ships zero. Divergence note vs Pass-1 cliffs: the S1 ohms_law cliff is patched by one narration clause (intro states are excluded from deep-dive investment by policy); the S6/S7 cliffs and deep-dive picks align.

---

## 6. Drill-down clusters (3 per deep-dive state; physics_author fleshes trigger_examples)

**S5:**
- `why_more_paths_less_resistance` — "How does adding a resistor DECREASE resistance? That makes no sense."
- `parallel_req_below_smallest` — "Why is the equivalent resistance smaller than even the smallest resistor?"
- `battery_supplies_more_current` — "Where does the extra current come from — doesn't the battery drain faster in parallel?" (yes — seed for `electric_power_heating`)

**S6:**
- `current_division_ratio` — "How much current goes down each branch?" (i₁/i₂ = R₂/R₁ — the inverse-ratio trap)
- `same_voltage_across_branches` — "Why do both branches get the full battery voltage?"
- `junction_current_conservation` — "Why is i exactly i₁ + i₂ at the junction?" (Kirchhoff junction-rule seed)

**S7:**
- `reciprocal_invert_slip` — "I added 1/6 + 1/12 and got 1/4 — is the answer 0.25 Ω?" (forgot to invert)
- `product_over_sum_shortcut` — "When can I just use R₁R₂/(R₁+R₂)?" (two resistors only; chain it pairwise beyond)
- `n_equal_resistors_pattern` — "n equal resistors: why is series/parallel ratio n²?" (nR vs R/n)

---

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_5   # "what is combination of resistors / equivalent resistance" — ends ON the primary aha
  series:       STATE_2 → STATE_4   # "resistors in series / same current / voltage division"
  parallel:     STATE_5 → STATE_7   # "resistors in parallel / current division / 1/R formula"
  home_wiring:  STATE_8             # "why are houses wired in parallel / string lights"
  exploration:  STATE_9
```

Default aspect = `foundational`. PRIMARY aha (S5) is inside the foundational range — no exit-pill needed. Cross-slice pills after foundational ends: "See how the current divides?" → parallel slice (S6–S7); "Why your home is wired this way" → S8. Every aspect name goes into `ASPECT_VOCABULARY` / `CLASSIFIER_PROMPT` (registration site 8).

---

## 8. Prerequisites (advisory only — Rule 23)

- `ohms_law` (shipped) — i = V/R read off every meter; the S1 baseline is ohms_law's closing picture.
- `drift_velocity` (shipped) — electron-stream density/speed = current is this scenario's whole visual language.
- `resistivity` (shipped) — R = ρL/A supplies the supporting-aha bridge: series = a LONGER conductor, parallel = a FATTER one.

All three are gold-standard shipped diamonds on the same renderer family. Edge added to the Ch.3 graph: `drift_velocity → ohms_law → resistivity → combination_of_resistors`.

---

## 9. Real-world anchor (Indian, plain English, physics-true)

**Primary — the home switchboard:** Every appliance in an Indian home — the ceiling fan, the fridge, the TV, the geyser — hangs on its own parallel branch across the same 220-volt mains. That is why each one gets the full mains voltage, why the fridge doesn't blink when you switch the fan off, and why the meter reading climbs as you switch more things ON: every new appliance is a new parallel path, and the house's total resistance FALLS. The wiring of every home the student has ever lived in is a running demonstration of the primary aha.

**Secondary — festival string lights:** The old style of decorative string lights is dozens of tiny bulbs in SERIES — one bulb dies and the whole string goes dark, and someone has to test bulb by bulb to find the culprit. One broken filament breaks the only path. Modern strings (and homes) wire in parallel precisely to escape this.

**Why it hooks Class 10–12 JEE/NEET students:** both anchors are physically true at every depth (branch independence, full-V-per-branch, R_eq drop with each added load), both are inside every student's daily experience, and the series-lights failure is a memory most students personally have. Board and JEE papers repeatedly ask "why are domestic appliances connected in parallel?" — this anchor IS the exam answer.

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 9 states of §2, exactly as tabled in §3 (id, one idea, archetype, delta, controls, budget each — see table).

**(b) Symbol-label table** (every quantity the narration names → exact on-canvas label):

| Quantity | On-canvas label |
|---|---|
| Battery voltage | `V = 6.0 V` (battery badge) |
| Resistors | `R₁ = 6 Ω`, `R₂ = 6 Ω` (box stamps; R₂ live-updates when dragged) |
| Total current | `i = 1.00 A` (main ammeter, numeric + needle) |
| Series in-line meters (S3) | `A₁`, `A₂`, `A₃` with live `0.50 A` readouts + per-second tallies |
| Branch currents (S6–S8) | `i₁ = 1.00 A`, `i₂ = 0.50 A` (branch ammeters) |
| Branch voltages | `V₁`, `V₂` (S4 staircase steps; S6 both branches labelled `6.0 V`) |
| Equivalent resistance | `R_eq` stamp on the equivalent box (`12 Ω` overlay S2; `4 Ω` box S7) |
| Formula overlays | S2: `R_eq = R₁ + R₂ + …` · S4: `V₁ + V₂ = V` · S5: `R_eq < R₁` · S6: `i = i₁ + i₂` · S7: `1/R_eq = 1/R₁ + 1/R₂ + …` · S9: both laws side by side |

Formula overlays carry the general `+ …` form; narration in S7 states the chain-the-rule generalization to three or more resistors.

**(c) Right-hand-rule plan:** N/A — no 3D direction rule exists in this concept. Direction teaching = conventional-current arrows along the circuit path (drawn opposite the electron beads, consistent with drift_velocity/ohms_law convention). Declared explicitly so Gate 0 reads a decision, not an omission.

**(d) Motion plan:** every state's motion is fully specified in the §3 table (nothing passive; one-shots cue-bound with fallbacks; S3's "nothing changes" is an active tally-and-hold beat, never a static frame).

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20 suspension), no `epic_c_branches`, `renderer_pair` = particle_field/particle_field, `available_renderer_scenarios.particle_field = ["combination_of_resistors"]`.

**(f) Assessment + misconception_watch:** `misconception_watch` at exactly S3/S5/S6 as specified in §4. `assessment`/`coverage_map`: **decision — OMIT, following the 3-for-3 Ch.3 sibling precedent** (drift_velocity, ohms_law, resistivity all shipped without one; Gates 19/20 fire only on presence). **FLAG to quality_auditor** to confirm this phase-precedent still holds; if the founder wants the block, physics_author authors the 6-question backward-designed quiz against the §4 pivots.

**Captions (≤5-word delta cues):** listed in §3 delta column, one per state.

---

## Two-pass cognitive lens — Block 1: Pass-1 strategic checklist

**Prerequisite cliffs:**
- `ohms_law` → breaks at **S1**: a student who can't read i = V/R off the meter loses the 1.00 A baseline everything else is measured against. Patch: S1's narration carries one clause — "six volts across six ohms drives one ampere, exactly as the straight line promised" — restating the law in passing without condescending.
- `drift_velocity` → breaks at **S6**: the claim "the thicker stream is the bigger current" assumes electrons-per-second-equals-current. Patch: one S6 clause — "count the beads crossing each second: that count IS each branch's current."
- `resistivity` → breaks at **S7**'s supporting aha (fatter/longer bridge). Patch: the narration phrases it as self-standing imagery — "two side-by-side paths act like one FATTER conductor, and a fatter conductor resists less" — true and complete even for a student who skipped R = ρL/A.

**JEE-backwards trace.** Representative question: *"Three resistors of 6 Ω and 12 Ω are available with a 6 V battery. (i) Find R_eq and the battery current when the two are joined in series. (ii) Repeat for parallel, and find the current through each resistor. (iii) State why the parallel R_eq is less than 6 Ω."* Knowledge pieces → delivering states: series addition + i = V/R_eq (S2); current uniform in series (S3); parallel same-V per branch + per-branch i = V/R (S6); reciprocal formula + inversion (S7); the "less than smallest" reasoning (S5 + S7). Voltage-divider variants → S4. "Why parallel in homes?" board staple → S8. No missing piece; mixed-network reductions are explicitly out of scope (§1).

**Misconception entry mapping (16a):** all three beliefs → pivots per §4 (a→S3, c→S5, b→S6), each with `misconception_watch` (belief + visual_counter + one_line_fix) plus a contrast beat in motion. Planting-moment flags: S2 may plant (a) — guarded by "everywhere at once" narration + immediate S3 kill; S2–S4's earned series intuition deliberately BUILDS (c) — that is the aha setup, resolved two states later, never left dangling past S5. 16b: no EPIC-C branches authored (fallback deferred until real students).

## Two-pass cognitive lens — Block 2: Aha-moment designation

- **PRIMARY aha (S5):** *Add a resistor ACROSS instead of in-line and the ammeter climbs — a new path is room for flow, not a new obstacle; that's why parallel resistance is always less than the smallest branch.* The 10-year memory: more paths, more current.
- **SUPPORTING aha (1, lands in S7, seeded in S2):** *Series is a LONGER conductor, parallel is a FATTER one — R = ρL/A was already telling you both combination laws.* Unifies this concept with the shipped `resistivity` diamond.
- **Cohesion check:** the supporting aha is the microscopic WHY of the primary (fatter ⇒ less resistance ⇒ meter climbs); it reinforces rather than stands alone. Total = 1 primary + 1 supporting — the sweet spot.
- **Wrong-belief setup:** S2–S4 spend three full states making "adding a resistor reduces the current" TRUE, visible, and quantified — the student arrives at S5 confident and slightly wrong, and the flip lands. For the supporting aha, S2's "longer obstacle course" framing plants the length half so S7's "fatter" half completes the pair.
- **Foundational-coverage rule:** PRIMARY aha state S5 is the closing state of `entry_state_map.foundational` (S1→S5). Satisfied — no exit-pill required.

---

## Engine delta flags (BLOCKER — renderer work precedes json_author)

New `scenario_type: "combination_of_resistors"` in `particle_field_renderer.ts` needs, per the prompt's planned extension and the scar list: circuit-path layout (battery + wires + resistor boxes), in-line splice + across-rewire animations (S2/S5 one-shots), junction node with per-branch bead streams whose density/speed ∝ branch current, multi-ammeter primitive (numeric + needle; main + 3 in-line + 2 branch), potential-probe/staircase (S4), equivalent-box collapse morph (S7), branch switch + topology toggle (S8/S9), and — critically — **registration of the new glow keys** (`resistors`, `junction`, `ammeter_total`, `ammeter_branches`, `volt_probe`, `req_box`, `switch`) in `dimFor`, `deriveStateMeta` support + `#sliders` exclusion chain for the new scenario_type, seeded determinism on state entry, and `RESET_TRAJECTORY`/`__PM_supportsTimePin` conformance. Owner: main session (or `peter_parker:renderer_primitives` if routed).

---

## Escalations / FLAGs for downstream
1. Engine delta is a hard blocker before json_author.
2. quality_auditor: re-run the live bug-queue SQL at Gate 8.
3. quality_auditor: confirm the assessment-omission precedent (3-for-3 Ch.3 siblings omit it).
