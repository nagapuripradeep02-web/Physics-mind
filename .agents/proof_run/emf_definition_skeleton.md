# ARCHITECT SKELETON — `emf_definition`
**Chapter:** Class 12, Ch.3 Current Electricity — NCERT §3.11 (Electromotive Force)
**Renderer:** `particle_field` (2D p5.js) — `scenario_type: "emf_definition"`, CIRCUIT family. **Engine Phase A is DONE and verified (THE EYE 10/10)** — this skeleton authors strictly against the built surface: sliders `emf` (1–12 V, step 0.1, default 1.5) / `R` (0.5–12 Ω, default 1.5) / `switch` (0/1); state flags `pump_focus · show_ladder · charge_double · open_circuit · show_voltmeter · show_sliders · visible_controls`; glow enum (CLOSED) `pump · ladder · voltmeter · load · electrons · formula`. **No new flags are invented anywhere below.**
**Position:** 5th Ch.3 diamond, after `drift_velocity` → `ohms_law` → `resistivity` → `combination_of_resistors` (all shipped). **Diamond 1 of the two-diamond split** — `internal_resistance` (A13) is authored next and reuses this cell + ladder verbatim.
**Design authority:** `docs/superpowers/specs/2026-07-10-emf-definition-design.md` (founder-approved 2026-07-10). This skeleton implements that spec; it does not re-litigate it.

---

## 0a. Engine bug queue consultation (pre-authoring)

The bug-queue SQL is not executable from the architect's read-only toolset this dispatch (no Bash/DB tool). Consulted the read-only mirrors: the particle_field family scar notes (drift/ohms/resistors bring-ups), the `_seed_engine_bug_queue_*.ts` catalog, and design-spec §4's bring-up contract. **FLAG to quality_auditor: re-verify against live `engine_bug_queue` rows at Gate 8.** Prevention rules applied:

| Scar / prevention rule | How this skeleton satisfies it |
|---|---|
| Glow enum is CLOSED — a non-keyed `glow_focal` or per-sentence `glow` silently dims the whole panel (the ohms_law scar) | Every glow used below is from the registered set `pump · ladder · voltmeter · load · electrons · formula` — no coined glow names anywhere; per-sentence shifts stay inside the enum |
| Clock-driven in-state animation with no cue → THE EYE `__frozen` lands mid-animation (needs `deriveStateMeta.pfRevealMs` settle time) | `charge_double` (S3) and the ladder draw-in (S2) are the two clock-driven beats — Phase A registered them (10/10); json_author re-verifies after restructuring to 6 states + re-seeds cache |
| Cue-gated visuals must be derivable at any pinned time incl. t=0; `__PM_supportsTimePin`; `RESET_TRAJECTORY`; `ceil` steps | Engine contract per spec §4, Phase A verified; every one-shot below carries an `at_ms` fallback |
| One-shots bind to the narrating sentence via `scenario_cue`, never a bare hardcoded `*_at_ms` | Cue plan in §3 names the carrying sentence per one-shot (S2 ladder reveal, S3 charge-double, S5 switch-open) |
| `teach_do_not_prespoil_a_later_reveal` (AR) | Ladder gated to S2 (`show_ladder` false in S1 — the dev stub's S1 ladder is corrected); voltmeter gated to S5; sliders gated to S4/S6. **The stub JSON is disposable — json_author replaces it wholesale, keeping only the engine flag/slider shapes** |
| `teach_concrete_before_abstract_compare` (AR) | S1 shows the pump WORKING (charges visibly lifted) before any symbol; `ε = W/q` overlay lands only in S2, after the ladder step has been traced with the real number 1.5 |
| `teach_coordinate_sim_with_graph` (AR) | The ladder IS this concept's graph: from S2 on, loop and ladder move in lockstep (S3 bead-doubling ↔ W readout; S4 ε drag ↔ step height; S5 loop-open ↔ flat-top) |
| `teach_visual_must_match_narration` (AR, MAJOR) | Every narrated claim is drawn: "lifts each charge" = the pump rise; "1.5 joules per coulomb" = the labeled step; "step doesn't grow" = the held step under `charge_double`; "reads the full emf" = the settling needle |
| `misconception_watch` only at genuine pivots (founder 2026-07-04) | Exactly ONE pivot (S3) across 6 states |
| Rule 31a word budget 25–55 EN words on `text_en` | Budget column in §3 |
| Never `auto_after_animation` on a static-but-live state; ≥2 distinct advance_mode | `manual_click` ×5 + `interaction_complete` (S6) |
| No backticks in the renderer code string | Engine work done (Phase A); no renderer edits in this pass |

**DC Pandey check:** Consulted the Current Electricity table of contents (EMF / cells / internal resistance / grouping-of-cells sections) for SCOPE only — confirms emf's definition is a distinct sub-topic ahead of internal resistance and cell grouping, matching the A12/A13 split. No teaching method, no example problem, no figure reference imported.

---

## 1. Atomic claim

This concept teaches that a cell is a charge pump whose emf is the work done per unit charge — ε = W/q, in volts = joules per coulomb — a fixed property of the cell's chemistry, not a force, and readable as the open-circuit terminal voltage. It does **not** cover internal resistance or the terminal-voltage droop V = ε − Ir (deferred to `internal_resistance`, Diamond 2 — this diamond's cell is IDEAL, r = 0, so V = ε always and every on-screen statement stays honest), grouping of cells (deferred to `combination_of_cells`), Kirchhoff's rules, or the electrochemistry of electrode reactions (outside the atomic scope — see §Rule 33 note).

---

## 2. State count + arc

**6 states — medium tier** (§5 band 5–6 ✓, per the approved spec §5). Six is earned: one definition (ε = W/q) but it carries the chapter's naming-trap misconception ("electromotive *force*") needing its own invariance beat (S3), the pump model that all of the cells half of Ch.3 rides on (S1–S2), the chemistry-sets-ε fact (S4), and the measurement condition that bridges to Diamond 2 (S5). Nothing merges without losing a beat; nothing splits (each state = one idea, one motion). The hook MOVES from t=0 — S1's pump is lifting charges on entry, no static setup state.

**No `teaching_method` fields on S1–S5** (Rule 31 default: straightforward motion beat); S6 = `exploration_sliders`.

| State | Purpose (one line) |
|---|---|
| S1 `cell_does_work` | The cell is a charge pump — inside it, every charge is visibly lifted from − to +; the cell spends energy on each one |
| S2 `how_big_is_the_lift` | ε = W/q — the potential ladder appears; the lift is a measured step: 1.5 joules for every coulomb |
| S3 `per_charge_not_a_force` | **PRIMARY AHA** — double the charge: total work W doubles, but the step height ε holds; emf is energy PER charge in volts, never a force in newtons |
| S4 `different_cells` | ε is set by the cell's chemistry — different cell, different step; the circuit never sets it |
| S5 `measuring_emf` | Open the loop: no current, beads halt, and the voltmeter across the terminals settles at the full ε — that is how emf is measured (bridge to Diamond 2) |
| S6 `sandbox` | Explore — all dials live (ε, R, switch); i = ε/R everywhere the loop is closed |

**Fixed numbers (physics_author to verify):** defaults ε = 1.5 V, R = 1.5 Ω → i = 1.0 A closed-loop. The ladder step reads `1.5 J/C`; S3's charge-double shows W: 1.5 J → 3.0 J while W/q holds at 1.5 J/C. S4's slider sweeps through the anchor's real chemistries: 1.5 (dry cell) · 2 (lead-acid) · 3.7 (Li-ion) · 12 (car battery) — all reachable at step 0.1.

---

## 3. Per-state choreography + control plan (Rule 31 — REQUIRED table)

**Coined archetypes (one-line justifications):**
- `pump-lift` — charges visibly hoisted through a source from low to high potential; the seed vocabulary (built from magnetism) has no work-done-on-carriers-inside-a-source motion, and it is THE defining emf picture.
- `ladder-trace` — a carrier's energy ridden around the loop as a live staircase (up ε, flat, down across the load); no seed archetype names an energy-accounting trace tied to a moving carrier.
- `intensive-invariance` — a quantity is doubled while the taught per-unit quantity visibly holds; the null-result is the teaching, but unlike `null-result-hold` something DOES change (W doubles) while the ratio doesn't — a distinct motion class.
- `halt-settle` — the flow is cut and an instrument settles to its true reading in the stillness; no seed archetype covers measurement-by-stopping.

**Declared contrast pair — S2 ↔ S4 (`ladder-trace` family, the one allowed repeat):** S2 reveals and TRACES the ladder at fixed ε (ride the step); S4 SCALES the step itself (`step-scale`, the ladder-trace's flip: the path is fixed, the height moves). The delta lines name the flip: "The lift, measured" → "Bigger ε, taller lift".

| State | Teaches (ONE idea) | Archetype | DISTINCT motion (deterministic on the state clock) | Δ cue (≤5 words, Rule 32c) | Live controls (31c) | `glow_focal` | advance_mode | Narration budget |
|---|---|---|---|---|---|---|---|---|
| S1 `cell_does_work` | The cell does work on each charge — it is a pump, not a passive box | `pump-lift` (coined) | `pump_focus`: closed loop at defaults, beads flow; INSIDE the cell each bead is visibly hoisted − → + (the lift cycle loops continuously, ≥1 full cycle per dwell); ammeter reads i = 1.0 A. No ladder, no voltmeter, no sliders yet | "Cell lifts each charge" | none (watch) | `pump` | manual_click | 30–45 words / ~14 s |
| S2 `how_big_is_the_lift` | ε = W/q — the lift has a size: 1.5 joules per coulomb | `ladder-trace` (coined; **pair w/ S4**) | Ladder inset draws in (`show_ladder`, cue on the narrating sentence): a bead's ride is traced as the staircase — step UP labeled `ε = 1.5 J/C` at the cell (cause: the pump lift, already watched), flat along the wire, equal drop across the load after a readable beat; `ε = W/q` overlay lands after the trace completes | "The lift, measured" | none (watch) | `ladder` | manual_click | 40–55 words / ~17 s |
| S3 `per_charge_not_a_force` | **PRIMARY AHA:** ε is energy PER charge — intensive; volts = J/C, never newtons | `intensive-invariance` (coined) | `charge_double` cue fires on its narrating sentence: the bead packet doubles `q = 1 C → 2 C` (cause, visible first) → readable beat → the W readout doubles `1.5 J → 3.0 J` while the ladder step height visibly HOLDS at 1.5 J/C (effect: the non-change is the teaching); `1 V = 1 J/C` overlay lands last | "Per charge — not a force" | none (watch) | `ladder` | manual_click | 40–55 words (aha + misconception) |
| S4 `different_cells` | ε is fixed by chemistry — different cell, different step; the circuit never sets it | `step-scale` (`ladder-trace` contrast twin — **declared pair w/ S2**; flip: trace the fixed step vs move the step's height) | The `emf` slider row appears (only control on screen — the silent "this is the variable"); dragging ε: pump lift height grows FIRST (cause), then the ladder step stretches to match after a beat, bead speed and ammeter follow (i = ε/R); chemistry tags label the stops — `1.5 V dry cell · 2 V lead-acid · 3.7 V Li-ion · 12 V car` | "Bigger ε, taller lift" | **emf** | `ladder` | manual_click | 35–50 words / ~15 s |
| S5 `measuring_emf` | No current → the voltmeter reads the full ε; that is how emf is measured | `halt-settle` (coined) | `open_circuit` cue on its narrating sentence: the loop visibly breaks (cause) → beads coast to a halt, ammeter dies to 0 → after the beat the voltmeter (`show_voltmeter`, docks across the terminals) settles at `V = ε = 1.5 V`; the ladder goes FLAT at ε (step up, no drop — the full lift is sitting at the terminals). Narration teases D2, claims nothing about droop | "No current → V = ε" | none (watch) | `voltmeter` | manual_click | 40–55 words / ~18 s |
| S6 `sandbox` | Synthesis — i = ε/R live under the teacher's hands | `drag-sandbox` | Teacher drives all three dials (`show_sliders`, all rows): ε scales the step + pump + speed, R throttles the flow, the switch replays S5's halt-settle at will; pump, ladder, voltmeter, ammeter all live; `i = ε/R` overlay | "All yours" | **ALL: emf · R · switch** | `formula` | interaction_complete | 0 / open (one sentence ≤20 words) |

**No-repeat audit:** `pump-lift` ×1, `ladder-trace` family ×2 (S2↔S4, the ONE declared contrast pair, flip named), `intensive-invariance` ×1, `halt-settle` ×1, `drag-sandbox` ×1 (explore only). No static state — the pump/bead motion runs continuously in every closed-loop state; S5's stillness is itself an active settle beat, never a static frame.

**Rule 32 legibility plan:**
- **32a cause-first:** S2 — the already-watched pump lift is the cause; the ladder trace is its measurement, drawn after the reveal cue. S3 — beads double FIRST, W/step respond after ~0.7 s. S4 — ε value + pump lift change first, ladder step follows. S5 — the loop breaks first; halt, then the needle settles. Never simultaneous.
- **32b one variable:** S3 only q changes; S4 only ε; S5 only the loop state (open); S1/S2 zero controls, watch beats. Explore exempt.
- **32c:** the Δ column above = the caption openers, verbatim, all ≤5 words.
- **32d home pose:** ONE apparatus throughout — cell + loop + load + beads + ammeter persisting from S1's pose; the ladder is an instrument that docks in at S2 and persists through S6; the voltmeter docks at S5 and persists into S6 (documented instrument-dock exceptions, sibling precedent ohms_law §3). No teleport-rebuild; S5's break is an on-screen motion of the same loop.
- **32e single focal:** per-state `glow_focal` in the table (one at any instant); per-sentence `glow` shifts allowed within the closed enum only (e.g., S1 sentence 1 `electrons` → sentence 2 `pump`; S2 drop sentence `load` → back to `ladder`).

**Cue plan (`scenario_cue` bound to the narrating sentence; `at_ms` fallback for THE EYE):** S2 `ladder_reveal` (s2_1) · S3 `charge_double` (s3_2 — after the one-coulomb baseline sentence re-anchors) · S5 `switch_open` (s5_1). S1's pump cycle and S6 are continuous, no one-shot. S4 is teacher-driven (see FLAG 1).

---

## 4. Misconception confrontation plan (Rule 16a — exactly ONE pivot)

EPIC-C branches: NOT authored (EPIC-L-first directive 2026-06-10). No `mode_overrides` (Rule 20). The confrontation is a straightforward contrast beat in motion — no predict-pause, no reveal question.

| Genuine wrong belief | Pivot state + `misconception_watch` beat |
|---|---|
| **"emf is a force — the name says so"** (the electromotive-*force* misnomer; the catalog's A12 EPIC-C belief, confronted in-path) | **S3.** `belief:` "emf is a force that pushes the charges — electromotive FORCE" · `visual_counter:` the units on screen are volts = joules per coulomb, and when the charge count doubles the total work W doubles while the ladder step height ε visibly holds — an intensive per-charge energy, not a force that would scale with the amount of charge · `one_line_fix:` "emf is the energy the cell hands each coulomb — measured in volts, never newtons." |

**No other state carries a `misconception_watch`** (founder guardrail 2026-07-04 — S1, S2, S4, S5, S6 are straightforward teaching). Two adjacent wrong beliefs are handled by teaching, not flagged pivots: "the circuit/current sets ε" is dissolved by S4's chemistry framing, and "V = ε always" (true only for this ideal cell) is fenced by S5's explicitly conditional cue "No current → V = ε" + the D2 tease — see Block 1 planting audit.

---

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates; V1 ships zero authored deep-dives — Rule 18)

| State | Why invest |
|---|---|
| **S2** | The mathematical abstraction — ε = W/q and the unit identity volt = J/C; "why is an energy measured in volts?" has multiple documented phrasings |
| **S3** | The PRIMARY aha + the concept's naming-trap; the intensive-vs-total distinction is the historically stuck idea (the misnomer misleads every fresh cohort) |
| **S5** | The measurement condition — "why must nothing flow?"; stock board/JEE assertion-reason territory (potentiometer-vs-voltmeter seed) and the live bridge to `internal_resistance` |

These coincide with the Pass-1 cliff/stuck states (see Block 1) — no divergence to document. Un-authored deep-dive buttons route to the feedback form.

---

## 6. Drill-down clusters (3 per deep-dive state; physics_author fleshes out trigger_examples)

**S2:**
- `why_volts_not_joules` — "If emf is energy, why is it measured in volts and not joules?"
- `emf_vs_potential_difference` — "Is emf just another name for voltage / potential difference?" (definitional distinction at the ideal level; the operational split is D2)
- `who_does_the_work` — "What actually lifts the charge inside the cell — the electric field?" (the non-electrostatic agency, at definition level)

**S3:**
- `emf_is_not_a_force` — "It's called electromotive force — how is it not a force?"
- `double_charge_double_energy` — "If more charge takes more energy, why doesn't ε grow with the charge?"
- `volts_equal_joules_per_coulomb` — "Show me why 1 volt is exactly 1 joule per coulomb."

**S5:**
- `why_no_current_to_measure` — "Why must no current flow to read the emf?"
- `voltmeter_draws_no_current` — "Doesn't the voltmeter itself complete the circuit and draw current?" (ideal-voltmeter assumption)
- `emf_when_current_flows` — "Will the meter still read ε when the loop is closed?" (honest answer here: yes for THIS ideal cell — real cells are the next concept; the D2 bridge)

---

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:   STATE_1 → STATE_3   # "what is emf / define emf / why volts" — ends ON the primary aha
  cell_chemistry: STATE_4             # "why is a battery 1.5 V / what decides a cell's emf / cell types"
  measuring_emf:  STATE_5             # "how is emf measured / open circuit voltage"
  exploration:    STATE_6
```

Default aspect = `foundational`. PRIMARY aha (S3) is the closing state of the foundational range — satisfied, no exit-pill needed. Cross-slice pills after foundational ends: "Why is a car battery 12 V?" → S4; "How do you actually measure ε?" → S5. All four aspect names go into `ASPECT_VOCABULARY` + `CLASSIFIER_PROMPT` (registration site 8).

---

## 8. Prerequisites (advisory only — Rule 23)

- `ohms_law` (shipped) — i = ε/R read off the ammeter in S1/S4/S6; the closed-loop baseline is ohms_law's picture with ε doing the pushing.
- `drift_velocity` (shipped) — beads-per-second = current is this scenario's whole visual language.

Both gold-standard shipped diamonds on the same renderer family. Ch.3 graph edge added: `ohms_law → emf_definition → internal_resistance (next)`; catalog A12 `required-by`: A13, A14, A18, A22.

---

## 9. Real-world anchor (Indian, plain English, physics-true)

> **[pre-Rule-35 — do NOT clone this anchor section. Anchors are UNIVERSAL/culture-neutral since 2026-07-10 (no country phrasing, festivals, brands, or asserted mains values). Clean clone targets: internal_resistance_skeleton.md, bar_magnet_in_uniform_field_skeleton.md.]**

**Primary — the emf hierarchy of real cells:** the 1.5 V Eveready dry cell in a torch, the 2 V lead-acid cell inside an inverter bank, the 3.7 V lithium-ion cell in every phone, the 12 V car battery — four everyday objects, four different numbers, and the number means one exact thing: how many joules that cell's chemistry hands every coulomb that passes through it. A dry cell the size of a thumb and a fat D-cell both say 1.5 V, because the chemistry is the same — **the chemistry sets ε; the circuit never does.** S4 puts these four chemistry tags on the slider stops, so the anchor is literally on-canvas.

**Why it hooks Class 10–12 JEE/NEET students:** every student has read these numbers off real batteries their whole life without knowing what the number promises; "define emf and state its SI unit" and "distinguish emf from terminal potential difference" are board staples, and the hierarchy makes the definition concrete four times over. Physics-true at every depth (each value follows from electrode chemistry). Plain English, no Hinglish.

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the six states of §2, exactly as tabled in §3 (id, one idea, archetype, delta, controls, glow, advance_mode, budget each).

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label; symbolic only, Rule 24):

| Quantity | On-canvas label | Where |
|---|---|---|
| emf | `ε = 1.5 V` cell badge (live number) + `EMF ε` slider row | badge S1+; slider S4, S6 |
| work per charge (the definition) | `ε = W/q` formula overlay | lands S2 (after the trace — concrete before abstract), persists |
| the ladder step | step-height label `ε = 1.5 J/C` (live number, tracks the slider) | S2+ |
| work | `W = 1.5 J` readout on the lifted packet (doubles to `3.0 J` in S3) | S2–S3 |
| charge | `q = 1 C` → `q = 2 C` packet tag | S3 |
| unit identity | `1 V = 1 J/C` overlay | lands S3, after the invariance beat |
| chemistry stops | `1.5 V dry cell · 2 V lead-acid · 3.7 V Li-ion · 12 V car` slider tags | S4 |
| load | `R = 1.5 Ω` box stamp + matching ladder drop across it | S1+ |
| current | ammeter `i = 1.0 A` numeric + needle (dies to `0` in S5) | S1+ |
| terminal voltage | voltmeter `V = 1.5 V` numeric + needle, settles at ε | S5, S6 |
| open-circuit law | `V = ε (no current)` formula overlay | S5 |
| loop law | `i = ε/R` formula overlay | S6 |

**(c) Right-hand-rule plan:** N/A — no magnetic directions exist in this concept. Direction teaching = conventional-current arrows along the loop (opposite the electron beads, consistent with the Ch.3 sibling convention). Declared, not omitted.

**(d) Motion plan:** every state's motion fully specified in §3 (pump cycle continuous S1–S4/S6; ladder trace S2; charge-double invariance S3; step-scale S4; halt-settle S5; sandbox S6 — nothing passive; one-shots cue-bound with `at_ms` fallbacks; runs on the state clock, Rule 26).

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20), NO `epic_c_branches` (EPIC-L-first). `renderer_pair` = particle_field/particle_field; `available_renderer_scenarios.particle_field = ["emf_definition"]`.

**(f) Assessment + misconception_watch:** `misconception_watch` at exactly S3 per §4. `assessment`/`coverage_map`: **OMIT, following the 4-for-4 Ch.3 sibling precedent** (drift_velocity, ohms_law, resistivity, combination_of_resistors all shipped without one; Gates 19/20 fire only on presence) — FLAG to quality_auditor to confirm the phase precedent still holds.

**Rule 33 note (declared so the auditor doesn't false-fail):** N/A by design, per approved spec §7 — emf's true mechanism is electrochemical (electrode reactions), which is outside A12's atomic scope; there is no macro/micro split-canvas. **The potential ladder IS the mechanism visualization at the correct level** (energy per charge, carrying the real number 1.5 J/C). Instruments still honor 33d: ammeter and voltmeter show live numeric readings + tracking needles.

**Scene composition (Rule 19, ≥3 primitives/state + `focal_primitive_id`):** json_author authors ≥3 annotation/marker primitives per state mirroring the label table — e.g., S1: pump-rise arrow tag, − and + terminal tags, ammeter callout; S2: step-height tag, flat-wire tag, load-drop tag; S3: q-packet tag, W-readout tag, held-step tag; S4: chemistry-stop tags ×2 + step tag; S5: broken-loop tag, dead-ammeter tag, voltmeter callout; S6: three formula/readout tags. Known scar: for this renderer the RENDERED text lives in `particle_field_config.states.{label, caption, formula_overlay}` — scene_composition annotations satisfy the schema but are not the visible surface; json_author keeps both in agreement.

**TTS:** author `teacher_script` EN now (budgets per §3; symbols expanded in speech per Rule 30 — "the emf epsilon", "work W", "charge q", "one point five joules for every coulomb", "volts, joules per coulomb"); EN + Telugu AUDIO rendered LAST post-founder-approval (Rule 30f), Telugu via the Sonnet-5 subscription sub-agent (Rule 30g), draft until native review.

**Registration (8 sites, per approved spec §9):** `emf_definition.json` (wholesale stub replacement) · `concept_panel_config` INSERT · `CONCEPT_RENDERER_MAP` → particle_field · `VALID_CONCEPT_IDS` · `PCPL_CONCEPTS` N/A (mirror the sibling exclusion — verify) · `CLASSIFIER_PROMPT` + `ASPECT_VOCABULARY` (the four aspects of §7) · clusters migration `supabase_2026-07-10_seed_emf_definition_*_migration.sql` (authored-not-applied; Gate 8 clusters probe is N/A-DORMANT this phase) · seed script `_seed_emf_definition_cache.ts` storing `{epic_l_path, particle_field_config}` for THE EYE.

**THE EYE:** `visual:eyes -- emf_definition` 6/6 ×2 + `smoke:visual-validator --dense`; dense frames read through the S2 ladder reveal, the S3 charge-double window, and the S5 open-settle; eye-walker ∥ quality-auditor; zero new `engine_bug_queue` rows; founder hand-tests S4/S6 trusted-drag sliders (THE EYE can't fire trusted events).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `drift_velocity` → breaks at **S1**: a student who doesn't read the bead stream as current loses "the pump drives the flow." Patch: one S1 clause — "these moving charges are the current, and something must be spending energy to keep them moving" — a one-second recap for anyone who watched drift_velocity, a complete sentence for anyone who didn't. `ohms_law` → breaks at **S6** (and mildly S4): i = ε/R is read off the ammeter as the dials move. Patch: one S6/S4 clause — "the same law as before, i = V/R — with the emf epsilon doing the pushing." Neither clause condescends; both ride inside existing narration budgets.

**JEE-backwards trace.** Representative question: *"A cell of emf 2 V drives charge around a circuit. (i) Define emf and state its SI unit. (ii) How much work does the cell do to circulate 5 C of charge? (iii) An ideal voltmeter connected across the isolated cell reads what value, and why? (iv) Two cells of the same size read 1.5 V and 3.7 V — what accounts for the difference?"* Knowledge pieces → delivering states: definition ε = W/q + volt = J/C → S2 + S3; W = εq rearrangement (10 J) → S2/S3 (the packet's W readout is literally εq); open-circuit reading = ε + the no-current condition → S5; chemistry sets ε → S4; qualitative pump grounding → S1. No missing piece. (Board/competitive coverage deferred per the conceptual-only directive; V = ε − Ir questions are Diamond 2's trace by design.)

**Misconception entry mapping (Rule 16, 16a-primary).** The one genuine belief ("emf is a force") → S3 pivot with `misconception_watch` + the intensive-invariance contrast beat (§4), no predict-pause. **Planting-moment audit:** (1) S1's own pump/"lift" language is the classic planting moment for force-ness — guard: S1's narration is energy-first from sentence one ("the cell spends its chemical energy doing work on each charge"), with "lift" always attached to work, never to push; S2 then quantifies in joules per coulomb BEFORE S3 names and kills the misnomer. (2) S5 could plant "V = ε always" (true only for this ideal cell) — guard: S5's delta cue is explicitly conditional ("No current → V = ε"), and its closing sentence plants the D2 hook ("a real cell has a story to tell the moment current flows — that is the next concept") while claiming nothing about the droop. (3) S4's chemistry tags could plant "bigger battery = bigger emf" — guard: the narration names the D-cell/AA-cell same-1.5-V fact (size ≠ chemistry). 16b: no EPIC-C branches authored (reactive fallback deferred until real students exist).

## Block 2 — Aha-moment designation

- **PRIMARY aha (S3):** *Double the charge and the cell does double the work — but the step each coulomb climbs stays exactly 1.5 J/C: emf is energy per charge, an intensive property in volts, never a force in newtons.* The 10-year memory: "the number on a battery is the joules it promises every coulomb."
- **SUPPORTING aha (1, lands in S5):** *To measure a cell's emf you ask it when it's doing nothing — no current, and the voltmeter shows the full ε sitting at the terminals.* (1 primary + 1 supporting = the sweet spot.)
- **Cohesion check:** the supporting aha operationalizes the primary — "open-circuit voltage = ε" is only meaningful because ε is a fixed per-charge property of the cell (the primary); it also hands Diamond 2 its opening move. S4 (chemistry sets ε) is reinforcement teaching of the primary's intensive-property claim, not a third aha. Nothing stands alone.
- **Wrong-belief setup:** for the PRIMARY, S1–S2 deliberately earn the force-flavored intuition — watching charges get "lifted" FEELS like watching a force at work, and S2 even puts a number on the lift; the student arrives at S3 confident the cell pushes, and the held step under doubled charge breaks the force framing (a force's total effect would scale; the per-charge tag doesn't). For the SUPPORTING, S1–S4 always show the loop closed and working — the student confidently assumes measuring the cell means watching it work; S5 flips it: you measure by making it do nothing.
- **Foundational-coverage rule:** PRIMARY aha state S3 is the closing state of `entry_state_map.foundational` (S1→S3). Satisfied — no exit-pill required.
- **Cross-reference:** deep-dive picks (S2/S3/S5) coincide with the abstraction state, the aha/misconception pivot, and the supporting-aha bridge — no divergence to document.

---

## Escalations / FLAGs for downstream

1. **S4 unattended-motion note (to physics_author + json_author + quality_auditor).** The built engine's flag surface has no ε autosweep — S4's step-scale motion is teacher-driven via the live `emf` slider (legitimate under Rule 31: motion ≠ interactivity, and the pump/bead choreography auto-plays continuously regardless). BUT its THE-EYE `__frozen` frame at default ε will resemble S2's ladder pose except for the visible slider row + chemistry tags. If eye-walker/THE EYE flags distinctness, the fix is a `scenario_cue`-bound ε nudge on S4 entry (e.g., glide 1.5 → 12 V on the narrating sentence, teacher-seizable) — a minimal ADDITIVE ask to the engine session, not a JSON workaround. Do not invent a new flag in the JSON.
2. **The dev stub is disposable.** `src/data/concepts/emf_definition.json` is the Phase-A harness (2 states; its STATE_1 shows the ladder + formula at S1). json_author replaces it wholesale with the 6-state arc — the ladder is GATED to S2 and the formula overlay to S2+ (do-not-prespoil). Keep only the stub's `particle_field_config` shapes (slider specs, `pvl_colors`, scenario_type) as the engine-truth reference.
3. **quality_auditor:** re-run the live `engine_bug_queue` SQL at Gate 8 (architect had no DB tool); the clusters-migration probe is N/A-DORMANT this phase (authored-not-applied precedent); confirm the assessment-omission precedent (4-for-4 Ch.3 siblings).
4. **Rule 33 N/A declaration** (§10) is per the approved spec §7 — read it as a decision, not an omission.
5. **Diamond 2 contract:** the ladder + cell + voltmeter built here are reused verbatim by `internal_resistance`; nothing in this JSON may claim V < ε or mention the droop beyond S5's single tease sentence.

---

## Self-review (architect checklist)

Atomic claim one sentence, non-scope named ✓ · 6 states, medium band, per approved spec ✓ · control table complete (teaches × archetype × distinct motion × delta × controls × glow × advance × budget); coined archetypes justified; ONE declared contrast pair (S2↔S4) with the flip named; sandbox explore-last ✓ · Rule 32 plan (cause-first per state, one-variable-moves, delta-cue captions verbatim, home-pose apparatus + documented instrument docks, one glow focal — all from the CLOSED enum) ✓ · misconception_watch at exactly ONE genuine pivot (S3) with belief/visual_counter/one_line_fix ✓ · deep-dive picks (S2/S3/S5) + 9 clusters ✓ · entry_state_map with foundational containing the PRIMARY aha ✓ · prerequisites advisory, both shipped ✓ · anchor Indian/plain-English/physics-true, on-canvas in S4 ✓ · DoD zero TBDs (RHR declared N/A; Rule 33 declared N/A per spec) ✓ · Block 1 (cliffs, JEE trace, planting audit ×3) + Block 2 (1 primary + 1 supporting, cohesion, wrong-belief setup, coverage) ✓ · scars satisfied, S4 distinctness FLAGged not hidden ✓ · advance modes manual_click ×5 + interaction_complete (Gate 12) ✓ · conceptual-only (no mode_overrides, no EPIC-C, no assessment per sibling precedent — FLAGged) ✓ · no invented engine flags, no field_3d vocabulary ✓ · word budgets 25–55 per guided state ✓.
