# ohms_law — architect skeleton (Rule 31/32, word-budget native)

> **⚠ PARENT-SESSION ENGINE NOTE (2026-07-08, binding — read first).** During Phase-A browser verification the V–I graph axis convention was CORRECTED and re-verified. The panel plots **I on the x-axis, V on the y-axis** (NCERT V–I convention), so the line's geometric slope ΔV/ΔI **is literally R** and the live readout `slope R = … Ω` is correct. Consequences that OVERRIDE any "bends below / I-on-y" wording that survives in the body below:
> - Ohmic line = straight through the origin; **a bigger R tilts it STEEPER** (toward the V-axis). "Steeper means more R" is literal.
> - Filament (`ohmic:false`) = the trace **curves UPWARD / steepens away from the straight reference** (concave up) as R rises with V — matching design-spec §4 "curves upward (concave)". It does NOT bend below.
> - Verified live: S2 straight `slope R = 5.0 Ω` (V=6,i=1.2); S3 R=15 visibly steeper (i=0.4); S5 filament R_eff=8.5 at V=6 (i=0.71), curve concave-up; S4 tallies matched. Zero console errors, tsc clean.
> physics_author + json_author: keep all narration + labels consistent with "steepens / curves upward", never "bends below".

> **Pipeline position:** architect output → physics_author. Chapter 3 — Current Electricity (NCERT Class 12 Part 1, §3.4/§3.6). **Second concept of Ch.3, second on the `particle_field` renderer (2D p5.js)** — authored strictly against the particle_field capability surface (`particle_field_config` + the Phase A additions verified in-browser 2026-07-08: `show_vi_graph`, `vi_autosweep`, `ohmic`, `show_flux_conservation`, `V`/`R` slider rows, `realResistance()`). No field_3d vocabulary anywhere downstream.
> Design is FOUNDER-APPROVED: `docs/superpowers/specs/2026-07-08-ohms-law-design.md` — this skeleton implements that spec; it does not re-litigate it. Structure cloned from `.agents/proof_run/drift_velocity_skeleton.md` (the word-budget-native sibling — drift S1–S6 = 40/53/50/54/38/53 EN words; match THAT discipline, not faraday's 67–94).

## 1. Atomic claim

This concept teaches that for a metallic conductor at constant temperature, current is directly proportional to the potential difference across it — V = IR — and that R (resistance) is the constant of proportionality, visible as the slope of the straight V–I line. It does not cover resistivity ρ = mL/(ne²Aτ) or its temperature dependence (deferred to `resistivity` / `temperature_dependence_of_resistance`), series/parallel combinations (deferred to `series_resistance` / `parallel_resistance`), power P = VI (deferred to `electric_power_heating`), or EMF/internal resistance/Kirchhoff (deferred).

## 2. State count + arc (6 — per approved spec §5)

Medium concept, 6 states — inside the §5 sanity band (5–6). Six is earned, not padded: one macroscopic law (V = IR) but it carries the chapter's TWO heaviest misconceptions ("current is used up" → S4; "V = IR always" → S5), each needing its own contrast beat, plus the graph-as-law abstraction (S2/S3) that every later Ch.3 concept leans on. Nothing merges without losing a beat; nothing splits (each state = one idea, one motion).

Guided distinct-motion beats → combined explore last. The hook MOVES (S1 is a cause→effect cue from frame one — battery on, drift begins, meter climbs). **No `teaching_method` fields on S1–S5** (Rule 31 default: straightforward motion beat); S6 = `exploration_sliders`.

| state | one-line purpose |
|---|---|
| S1 `push_drives_flow` | Voltage is the CAUSE of current — battery on → field → drift → the meter reads i |
| S2 `straight_line_law` | **PRIMARY aha:** i ∝ V — the swept V–I trace is a perfect straight line through the origin; that line IS Ohm's law |
| S3 `slope_is_resistance` | R = V/i — a bigger R tilts the line steeper (I on x, V on y: steeper = more volts per amp = more R) |
| S4 `nothing_used_up` | Current is conserved through a resistor; what is spent is VOLTAGE (misconception pivot #1) |
| S5 `when_the_line_bends` | Ohm's law is ohmic-only — a filament's trace curves upward off the straight reference as R rises with V (misconception pivot #2) |
| S6 `sandbox` | Explore: both dials (V, R), operating point rides the live curve, all readouts live |

## 3. Per-state choreography + control plan — THE CONTROL TABLE (Rule 31 — first design artifact)

| state | teaches | archetype | DISTINCT motion (pure fn of state clock; deterministic for THE EYE) | delta (→ ≤5-word caption cue, Rule 32c) | live control(s) | narration budget (EN words) |
|---|---|---|---|---|---|---|
| S1 `push_drives_flow` | voltage is the cause of current (macroscopic handle on the drift chain) | `flow-along-path` | `cue: field_on` (battery on, the CAUSE) → readable ~800 ms beat → electron cloud ramps into slow drift → `show_current_meter` climbs from 0 and settles at the default i (the EFFECT). No graph panel yet — wire only | Battery on | **none** (watch) | 35–50 |
| S2 `straight_line_law` | i ∝ V — the straight line through the origin IS Ohm's law (PRIMARY aha) | `trace-accumulate` (coined: an operating point sweeps and leaves a data trace on a graph panel — no seed archetype covers graph-trace accumulation; nearest is reveal-build but this is data-driven, not scene construction) | graph panel appears (`show_vi_graph`); `vi_autosweep` clock-drives V 0→default: drift in the wire visibly quickens (cause, top) → after a beat the operating point climbs and the bright trace extends dead-straight over the faint ohmic reference (effect, bottom); teacher may grab the V slider and the point obeys | Double the push | **V** | 40–55 |
| S3 `slope_is_resistance` | R = V/i — resistance is the slope; more R = steeper line (more volts per amp) | `trace-accumulate` — **DECLARED CONTRAST PAIR with S2**; flip: in S2 the point sweeps ALONG a fixed line; in S3 the LINE ITSELF re-tilts as R changes, V held at default | on entry a cue re-tilts the trace from S2's slope to a higher-R (steeper) slope (cause = the R value changing, shown on the slider row + slope readout; effect = the tilt, after a beat); then the R slider is live — drag R up: line tilts steeper, drift in the wire visibly slows at the same V, `slope R = … Ω` readout tracks | Steeper means more R | **R** | 35–50 |
| S4 `nothing_used_up` | current is conserved through a resistor; VOLTAGE is what drops (Rule 16a contrast beat #1) | `null-result-hold` | `show_flux_conservation`: resistor band on the wire + V-drop colour gradient across it; two counting planes flash per electron crossing, twin tallies run live and stay MATCHED (`N/s in = N/s out`) the entire dwell — the wrong expectation ("fewer after the resistor") is given every chance to show up and never does; the gradient shows what IS spent. Graph panel hidden this state (full canvas on the wire — deliberate 32d exception, documented below) | Same current, less V | **none** (watch) | 40–55 |
| S5 `when_the_line_bends` | Ohm's law holds only for ohmic conductors — a filament's R rises with V and the trace curves upward (Rule 16a contrast beat #2) | `trace-accumulate` — **DECLARED CONTRAST PAIR with S2**; flip: same autosweep, same axes, but `ohmic: false` — the trace curves UPWARD / steepens away from the straight reference instead of riding it | graph panel returns; `vi_autosweep` re-runs the S2 sweep on a filament (`ohmic: false`): the bright trace peels away from the faint straight reference, curving upward (steepening toward the V-axis) as V grows; slope readout switches to the non-ohmic form; in the wire, drift gains less than proportionally as V climbs | The bulb bends it | **V** | 40–55 |
| S6 `sandbox` | synthesis — recover V = IR live from either dial | `drag-sandbox` | teacher drives V and R (`show_sliders`); operating point rides the live line, trace + slope readout + current meter + drift all respond; home-pose wire + graph both persistent | Both dials yours | **ALL: V · R** | 0 / open |

Archetypes: `flow-along-path`, `trace-accumulate` ×3 (S2↔S3 and S2↔S5 are the two DECLARED contrast pairs, each delta naming its flip), `null-result-hold`, `drag-sandbox` (explore only). Rule 32 per row: cause→effect ordering via the S1 `field_on` cue, S2/S5 sweep (drift quickens before the trace extends — engine cue-gate machinery, verified), S3 entry re-tilt, S4 gradient-vs-tally; ONE taught variable moves per guided state (S2/S5 = V only, S3 = R only, S1/S4 = zero controls, watch beats); delta column = the caption's opening cue; home pose = the same conductor strip + seeded electron layout as drift_velocity's family, graph panel docked bottom-corner from S2 (32d); glow focal, exactly one per state: S1 `current_meter`, S2 `vi_operating_point`, S3 `slope_readout`, S4 `flux_tallies`, S5 `vi_trace`, S6 `vi_operating_point`.

**32d exception (documented):** the graph panel is absent in S1 (not yet taught) and hidden in S4 (full canvas on the resistor band). The APPARATUS (wire + electron cloud) persists in home pose across all six states; the panel is an instrument that docks in at S2 and returns at S5 — at each click the only visible change is still the new thing. json_author: verify no stale-panel bleed (known scar class: `#sliders` exclusion chain / deriveStateMeta).

Control-panel catches: panel built ONCE (`V` / `R` rows); rows shown per state via `visible_controls` (S1/S4 none — motion ≠ interactivity); shared sliders keep position and row order. Recommended specs for physics_author to finalize (defaults physics-true and CONTINUOUS with drift_velocity's operating point i ≈ 1.2 A) — VERIFIED live at these values: `V` 0–12 V, step 0.5, default 6; `R` 1–20 Ω, step 0.5, default 5 (→ i = 1.2 A at defaults). Under the hood V → E = V/L, R → τ inversely (engine adapter) — wire geometry never changes on screen; A stays drift_velocity's variable. `formula_anchor.constants`: e, m_e, n (copper 8.5×10²⁸), L, A_mm2, filament_k.

Cue binding (scar rule): the S1 `field_on` cue and the S3 entry re-tilt bind to their narrating sentence via `scenario_cue` (SET_CUE_TIME channel), `at_ms` kept only as THE EYE fallback — never a bare hardcoded `at_ms`. S2/S5 autosweeps are clock-driven by engine design (already deterministic under SET_TIME_FREEZE — verified Phase A).

## 4. Misconception confrontation plan (Rule 16a — contrast beats, no predict→reveal; EXACTLY 2 pivots)

| wrong belief (genuine, documented) | state | how the MOTION confronts it | `misconception_watch` |
|---|---|---|---|
| "Current is used up crossing a resistor — less comes out than went in" | S4 | twin counting planes tally crossings per second before AND after the resistor band; the tallies stay matched for the whole dwell (the null-result-hold), while the colour gradient shows the thing that DOES drop — the potential | `belief:` "current gets used up in a resistor, so less flows out than in" · `visual_counter:` two live tallies, N/s in = N/s out, matched every second while the V-gradient visibly drops across the band · `one_line_fix:` "The resistor spends voltage, never current — every electron that enters, leaves." |
| "V = IR always; R is a universal constant of the object" | S5 | the identical autosweep that drew S2's straight line is re-run on a filament: the bright trace curves upward off the straight reference in the same axes — the law's boundary is SHOWN, not stated | `belief:` "V = IR holds for everything; R never changes" · `visual_counter:` the filament's V–I trace curves upward / steepens away from the straight ohmic reference as V grows; the slope stops being a single number · `one_line_fix:` "V = IR defines R at each point — R stays constant only for ohmic conductors at constant temperature." |

**No other state carries a `misconception_watch`** (founder guardrail 2026-07-04 — S1, S2, S3, S6 are straightforward teaching). EPIC-C branches: NOT authored (EPIC-L-first directive 2026-06-10; conceptual-only per approved spec). No `mode_overrides` (Rule 20).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates; V1 ships zero authored deep-dives — Rule 18)

- **S2 `straight_line_law`** — the graph-as-law abstraction; reading a physical constant off a slope is the mathematical move students historically fumble (axis-swap confusion: on V-on-y/I-on-x axes the slope is R, on I-on-y/V-on-x it would be 1/R — the sim commits to slope = R).
- **S4 `nothing_used_up`** — the chapter's heaviest conceptual stuck-point; feeds every series-circuit numerical downstream.
- **S5 `when_the_line_bends`** — non-ohmic behaviour is a stock JEE/NEET assertion-reason trap (dynamic vs static resistance territory).

These coincide with the Pass-1 cliff/stuck states (see Block 1) — no divergence to document. Un-authored deep-dive buttons route to the feedback form.

## 6. Drill-down clusters (3 candidates each; physics_author fleshes out trigger_examples)

- S2: `slope_axis_confusion` (which slope is R — the sim uses V-on-y so slope = R), `why_straight_through_origin` (zero V = zero i, proportionality vs mere increase), `ohms_law_from_drift` (how i = neAv_d + v_d = eEτ/m give V = IR).
- S4: `current_conservation_series` (same i through every series element), `what_the_resistor_spends` (voltage drop vs current drop), `where_the_energy_goes` (the drop becomes heat — bridge to power, deferred concept).
- S5: `ohmic_vs_non_ohmic` (which materials obey, and when), `filament_resistance_rises` (heating → shorter τ → higher R), `dynamic_resistance_meaning` (R = V/I vs dV/dI on a curved trace).

## 7. entry_state_map (v2.2)

```
entry_state_map:
  foundational:  STATE_1 → STATE_3   # "what is Ohm's law / what is resistance / V=IR"
  conservation:  STATE_4             # "is current used up / same current in series"
  non_ohmic:     STATE_5             # "non-ohmic conductors / filament / when V=IR fails"
  exploration:   STATE_6
```

PRIMARY aha (S2) is inside `foundational` ✓ (foundational-coverage rule satisfied, no exit-pill needed). json_author registers all four aspects in `ASPECT_VOCABULARY` + `CLASSIFIER_PROMPT` (note: `ohms_law` already sits in `VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT` as an unbuilt placeholder — verify the existing entry's aspect line, don't duplicate).

## 8. Prerequisites (advisory, Rule 23)

- `drift_velocity` (SHIPPED, Ch.3 #1, same renderer) — the microscopic chain i = neAv_d, v_d = eEτ/m that S1 rides on and S2's bridge compresses into R.
- `electric_field_point_charge` (shipped, Ch.1) — inherited transitively via drift_velocity; listed advisory for students who jump straight to Ohm's law.

## 9. Real-world anchor (Indian, plain English, physics-true)

**Primary:** the round fan regulator on the wall — turn the knob and the fan speeds up in step; each notch raises the voltage across the motor and the current climbs in exact proportion. That steady, predictable "more push, proportionally more flow" is the straight line of Ohm's law, and how MUCH current each volt buys is set by one number: the resistance. **Secondary (S5):** the old filament bulb on the same board — as it warms from a dull orange to full glow, it stops obeying the straight line; its resistance rises with the heat, which is exactly the curving trace of S5.

Why it hooks Class 11-12 JEE/NEET students: the regulator knob is a daily physical act in every Indian home; the filament bulb is NCERT's own non-ohmic example, and "does the bulb obey Ohm's law?" is a stock board/JEE assertion-reason question. Plain English, no Hinglish; no DC Pandey/HC Verma prose or figures.

## 10. Definition of Done (Gate 0 — zero TBDs)

- **(a) States:** the six rows of §3, exactly as tabled.
- **(b) Symbol-label table** (every narrated quantity → exact on-canvas label; symbolic only, Rule 24):

| quantity | on-canvas label | where |
|---|---|---|
| potential difference | `V` — slider row label + graph **y-axis** `V (volts)` | S2+ (slider), S2/S3/S5/S6 (axis) |
| current | meter `i = V/R` readout (A) + graph **x-axis** `I (A)` | S1+ (meter), S2+ (axis) |
| resistance | `slope R = … Ω` live readout on the graph panel + `R` slider row | S2+ (readout), S3/S6 (slider) |
| the law | `V = IR` formula overlay | lands S2 (after the straight trace is watched — concrete before abstract), persists S3+ |
| operating point | bright dot at live (I, V) | S2+ |
| ohmic reference | faint straight line through origin | S2/S3/S5/S6 |
| conservation tallies | `N/s in` / `N/s out` twin plane counters | S4 |
| voltage drop | colour gradient across the resistor band (+ `ΔV` tag) | S4 |
| non-ohmic tag | `filament — R rises with V` panel note | S5 |

- **(c) Right-hand-rule plan:** N/A — no magnetic directions in this concept (declared, not TBD).
- **(d) Motion plan:** all six table rows in §3; every state animates on the state clock (Rule 26); electron drift never stops by engine design; autosweeps deterministic under SET_TIME_FREEZE (Phase A verified).
- **(e) Modes:** conceptual-only (Rule 20) — no `mode_overrides`, no `epic_c_branches`.
- **(f) Assessment:** deferred this phase (conceptual-only directive — declared, not TBD). `misconception_watch` at exactly the 2 pivots of §4. `advance_mode`: `manual_click` S1–S5 + `interaction_complete` S6 = 2 distinct (Gate 12); never `wait_for_answer` / `narrative_socratic` / `pause_after_ms`.
- `scene_composition.primitives.length ≥ 3` per state (Gate 19), `focal_primitive_id` per state (the §3 glow list); on-canvas text lives in `particle_field_config.states.{label,caption,formula_overlay}` — scene_composition annotations are NOT rendered (known scar).
- TTS: author `teacher_script` EN now (25–55 words/guided state; symbols expanded in speech per Rule 30 — "voltage V", "current I", "resistance R", "V equals I R"); EN + Telugu AUDIO rendered LAST, post-founder-approval (Rule 30f); narration off by default.
- Registration: the 8 sites per approved spec §7 — `ohms_law.json`, `concept_panel_config`, `CONCEPT_RENDERER_MAP` → particle_field, `VALID_CONCEPT_IDS` (already present — verify), `CLASSIFIER_PROMPT` (already present — extend aspects), `ASPECT_VOCABULARY`, clusters migration `supabase_<date>_seed_ohms_law_clusters_migration.sql` (authored-not-applied), mirror drift_velocity's `PCPL_CONCEPTS` handling (particle_field is NOT PCPL — confirm exclusion). Mirror drift's `regeneration_variants` block shape.
- THE EYE clean (`visual:eyes -- ohms_law` 6/6 ×2 + `smoke:visual-validator --dense`, dense frames read through the S1 cue window and both autosweeps) + zero new `engine_bug_queue` rows; eye-walker ∥ quality-auditor; founder hand-tests S6 trusted-drag sliders (THE EYE can't fire trusted events).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** `drift_velocity`: S1 breaks if the student doesn't know the field-drives-drift chain — patch: S1's narration carries one bridging clause ("the battery's push sets up a field along the wire, and every electron picks up that slow drift — that drift is the current"); a student who watched drift_velocity reads it as a one-second recap, not condescension. S2's bridge (i = neAv_d compresses to i = V/R) is stated in ONE clause and shown only as the formula overlay landing — the derivation itself lives in the S2 deep-dive cluster `ohms_law_from_drift`, not the guided beat.

**JEE-backwards trace.** Question: *"A 4 V supply drives 0.8 A through a conductor. (i) Find R. (ii) The same conductor is placed in series with a second one — a student claims the current after the first conductor is smaller. Correct him. (iii) The V–I graph of a filament bulb is not a straight line — does the bulb violate Ohm's law?"* Needed: R = V/i off the graph/slope → S2 + S3; series-current conservation → S4; ohmic-only scope + what "R" means on a curve → S5; qualitative V-causes-i grounding → S1. No missing piece; every fragment has a named state. (Board/competitive coverage deferred per the conceptual-only directive.)

**Misconception entry mapping (Rule 16, 16a-primary).** Both beliefs of §4 are confronted proactively in-path at S4 / S5 with `misconception_watch` + contrast-in-motion (no predict-pause). Planting-moment audit: S2's "the line is ALWAYS straight" framing could itself plant the S5 misconception — S2's narration says "for this metal wire, at steady temperature" (one clause, plants the boundary condition without spoiling S5); S4's "voltage is spent" could plant "voltage is a fluid that flows" — countered in the same beat by the gradient being drawn ACROSS the band (a level difference, not a flow), and the tallies carrying the only per-second counting. No EPIC-C branches authored (16b fallback deferred until real students exist).

## Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** *the swept V–I trace is a perfect straight line through the origin — that line IS Ohm's law, and its slope is a single number, R, that characterizes the conductor.* The 10-year memory: "Ohm's law isn't a formula to memorize — it's the straightness of that line."
- **SUPPORTING aha (S4, one only):** *nothing is used up — exactly as many electrons leave the resistor per second as enter it; what the resistor spends is voltage.* (1 primary + 1 supporting = sweet spot.)
- **Cohesion check:** S4 serves the primary — V = IR is only meaningful because "I" is ONE number for the whole conductor (the same current everywhere makes R = V/I well-defined per element). S5's curve is not a third aha; it is the primary's boundary condition (the contrast that sharpens what "straight" bought us). Nothing stands alone.
- **Wrong-belief setup:** for the PRIMARY, S1 earns the confident-but-vague belief "more push → more flow, somehow" — S2 breaks the vagueness with exact proportionality (the aha is the exactness, not the direction). For the SUPPORTING, S1–S3's meter framing ("current flows THROUGH") lets the student carry their incoming "it gets consumed" intuition confidently into S4, where the matched tallies break it.
- **Cross-reference:** deep-dive picks (S2, S4, S5) and the misconception pivots (S4, S5) + the abstraction state (S2) coincide exactly — no divergence to document.

## Engine bug queue consultation (scar compliance)

DB query not run in the architect dispatch (architect has no Bash tool); directives read from the canonical seed mirrors + the drift-session scars:

- `teach_concrete_before_abstract_compare` (AR) → `V = IR` overlay lands only AFTER S2's straight trace has been watched; the slope readout precedes the S3 formula framing.
- `teach_coordinate_sim_with_graph` (AR) → S2/S3/S5 each drive ONE live parameter moving scene + graph in lockstep (V ↔ drift + operating point; R ↔ drift + tilt); no static readout ships.
- `teach_visual_must_match_narration` (AR, MAJOR) → every narrated claim is drawn: "in step" = point riding the line (S2); "steeper means more R" = the tilt + slope readout (S3); "same current" = matched tallies (S4); "less V" = the gradient (S4); "curves upward" = trace steepening away from the reference (S5).
- `teach_do_not_prespoil_a_later_reveal` (AR) → graph panel gated to S2 (S1 is wire-only); R slider gated to S3; conservation viz gated to S4; `ohmic:false` gated to S5. S2's boundary clause ("at steady temperature") plants without spoiling.
- `teach_distinct_reference_lines_for_two_radii` (AR, analog) → the faint straight OHMIC REFERENCE and the bright SWEPT TRACE are two permanently distinct, separately-styled lines — never conflated (the whole S5 beat depends on this distinction existing since S2).
- `teach_reveal_synced_to_narration` + `teach_show_quantity_live_when_named` (PA — forwarded to physics_author) → bind the S1 `field_on` cue, the S2 formula landing, the S3 re-tilt, and each first-naming (slope readout, tallies, gradient) to their narrating sentences via `scenario_cue`.
- Stale-panel / deriveStateMeta scar (particle_field analog) → S4 hides the graph panel: json_author verifies no panel bleed and THE EYE meta handles the hide correctly; a false-fail here is a `peter_parker:*` validator gap, not a content bug — route, don't bend the JSON.
- Pacing/pivot scars (word budget 25–55; `misconception_watch` at 2 pivots only) → applied throughout.

**Exceptions / FLAGS to quality_auditor and downstream:**
1. **Filament curve direction — RESOLVED (2026-07-08).** The Phase-A engine was corrected to the NCERT V-on-y/I-on-x convention (see the binding note at top): slope = R is literal, and the filament trace **curves upward / steepens** away from the straight reference (concave up) — matching design-spec §4 "curves upward (concave)". All body wording here follows the corrected engine (verified live). No open discrepancy.
2. **Placeholder registration:** `ohms_law` already exists in `VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT` as an unbuilt placeholder — json_author verifies rather than duplicates, and extends the classifier line with the four aspects of §7.
3. **32d panel-visibility exception** (S1 no panel, S4 panel hidden) — documented in §3; quality_auditor's Gate on home-pose continuity should read it as the declared exception, not a violation.

**DC Pandey check:** Consulted chapter-scope only (Current Electricity ToC: Ohm's law / V–I characteristics / combination-of-resistors sections) against NCERT §3.4/§3.6 to confirm atomic boundaries — V = IR + slope + conservation + ohmic-only here; resistivity, combinations, power deferred. No teaching method, no example problem, no figure reference imported.

## Self-review (architect checklist)

Atomic claim one sentence ✓ · 6 states, in-band, per approved spec ✓ · control table complete (teaches × archetype × distinct motion × delta × controls × budget); archetype repeats ONLY as the two declared contrast pairs (S2↔S3, S2↔S5) with named flips; sandbox explore-last ✓ · Rule 32 plan (cause-first cues, one-variable-moves, delta-cue captions, home-pose wire + documented panel exception, one glow focal per state) ✓ · misconception_watch at exactly 2 genuine pivots with belief/visual_counter/one_line_fix ✓ · deep-dive picks (3) + 9 clusters ✓ · entry_state_map with foundational containing the PRIMARY aha ✓ · prerequisites advisory, drift_velocity shipped ✓ · anchor Indian/plain-English/physics-true (regulator = proportional; filament = non-ohmic, NCERT's own example) ✓ · DoD zero TBDs (RHR declared N/A) ✓ · Block 1 + Block 2 complete ✓ · scars satisfied, filament-direction FLAG resolved ✓ · advance modes manual_click ×5 + interaction_complete (Gate 12) ✓ · conceptual-only (no mode_overrides, no EPIC-C) ✓ · no field_3d vocabulary ✓.

**Handoff:** ready for physics_author — finalize slider ranges/defaults (VERIFIED live: V 0–12 V default 6, R 1–20 Ω default 5 → i = 1.2 A, continuous with drift's operating point), the `filament_k` value so S5's curve departs visibly (verified: k = 1.4 → R_eff = 8.5 Ω at V = 6, i = 0.71 A — the curve is clearly concave-up within the sweep), the S3 entry re-tilt cue timing, and exact `text_en` scripts inside the per-state word budgets above.
