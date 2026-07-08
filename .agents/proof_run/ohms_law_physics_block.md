# Physics block — `ohms_law` (Ch.3 §3.4/§3.6, particle_field renderer)

> physics_author output, 2026-07-08. Companion to `ohms_law_skeleton.md` (architect, binding V-on-y/I-on-x engine note honored throughout). Handoff target: json_author. Sibling: `drift_velocity` (shipped, same engine family).

## 0. Engine bug queue consultation + renderer-reality note

Prevention rules applied (from local canonical seed mirrors, per architect's forwarded list + the standing physics_author contract):

- **`default_variables_only_first_var_merged`** → `V` and `R` are BOTH explicitly declared in `slider_controls` with their own `default` — never rely on only-first-var-merges; `formula_anchor.constants = {e, m_e, n, L, A_mm2, filament_k}` explicitly declared even though `e`/`m_e`/`n` numerically match drift_velocity's fallbacks — never rely on a silent fallback.
- **Glow-target validity** → every `glow`/`glow_focal` value below is one of the declared valid targets for this scenario: `field | electrons | drift_arrow | current_meter | vi_graph | vi_operating_point | vi_trace | slope_readout | flux_tallies | formula`. json_author must confirm each string against the actual renderer glow-target enum before shipping (Phase A additions) — flag to quality_auditor if any name here does not match the built enum exactly.
- **Orphaned-annotation analog** → on-canvas text lives ONLY in `particle_field_config.states.{label, caption, formula_overlay}`; `epic_l_path.scene_composition` annotations are NOT rendered (same scar as drift_velocity). Do not "fix" a missing label by editing `scene_composition`.
- **Caption/layout scar** → every caption is the single 5-word-or-fewer delta cue from the architect's control table, one line, no wrap.
- **Stale-panel / deriveStateMeta scar (32d exception, architect-flagged)** → S1 (no panel) and S4 (panel hidden) are a DECLARED exception, not a bug; json_author verifies show_vi_graph:false in S1/S4 does not leave a stale docked panel from a prior state (known #sliders exclusion chain gap) — if THE EYE flags panel bleed here, route to peter_parker:renderer_primitives, do not bend this JSON.
- **Forwarded PA rules** (teach_reveal_synced_to_narration, teach_show_quantity_live_when_named) → honored in §4 via `scenario_cue` on the S1 `field_on` cue and the S3 entry re-tilt cue; every first-naming (slope readout, tallies, gradient, non-ohmic tag) lands on its own narrating sentence, never pre-empted.
- **teach_distinct_reference_lines_for_two_radii (analog)** → the faint straight ohmic reference and the bright swept trace are two permanently distinct, separately-styled primitives (`ohmic_reference` vs `vi_trace`) from S2 onward — S5 depends on this distinction already existing.

**Renderer-reality correction (important for json_author, inherited from drift_velocity):** this concept does NOT drive `i` via `physics_engine_config.formulas` / PM_interpolate — `particle_field_renderer.ts` computes `i` natively in engine JS via the Phase-A `realResistance()` / drift-chain adapter, reading `slider_controls.{V,R}` and `formula_anchor.constants.{e,m_e,n,L,A_mm2,filament_k}`. §2 below is documentation + rigor-check only; the JSON keys that actually carry the physics are `slider_controls` (`V`, `R`) and `formula_anchor.constants`, plus the standard `physics_engine_config` block authored as Zod-required documentation.

## 1. Variables

| symbol | name | unit | min | max | default | step | kind |
|---|---|---|---|---|---|---|---|
| `V` | potential difference (voltage) | V | 0 | 12 | 6 | 0.5 | slider (live S2, S5, S6) |
| `R` | resistance | Ω | 1 | 20 | 5 | 0.5 | slider (live S3, S6) |
| `i` | current | A | — | — | derived: V/R (ohmic) or V/R_eff (non-ohmic) | — | live readout (engine) |
| `R_eff` | effective resistance (non-ohmic states only) | Ω | — | — | derived: R*(1 + filament_k*V/Vmax) | — | live readout, S5 only |
| `e` | elementary charge | C | — | — | constant: 1.6e-19 | — | locked constant (shared with drift_velocity) |
| `m_e` | electron mass | kg | — | — | constant: 9.11e-31 | — | locked constant |
| `n` | free-electron number density (copper) | m^-3 | — | — | constant: 8.5e28 | — | locked constant, material property |
| `L` | conductor length | m | — | — | constant: 1 | — | locked, wire geometry never changes on screen |
| `A_mm2` | conductor cross-section | mm^2 | — | — | constant: 1 | — | locked, drift_velocity's variable, fixed here |
| `filament_k` | non-ohmic heating coefficient | dimensionless | — | — | constant: 1.4 | — | locked, S5 only; tuned so the curve departs visibly within the V sweep |
| `Vmax` | sweep ceiling used in the R_eff formula | V | — | — | constant: 12 | — | locked, equals slider max |

**JSON shape (`particle_field_config`):**
```json
"slider_controls": {
  "V": { "min": 0, "max": 12, "step": 0.5, "default": 6, "label": "Voltage V", "unit": "V" },
  "R": { "min": 1, "max": 20, "step": 0.5, "default": 5, "label": "Resistance R", "unit": "Ω" }
},
"formula_anchor": {
  "constants": { "e": 1.6e-19, "m_e": 9.11e-31, "n": 8.5e28, "L": 1, "A_mm2": 1, "filament_k": 1.4, "Vmax": 12 }
}
```

Note on continuity with `drift_velocity`: `A` is NOT re-exposed as a slider here (deferred; the skeleton reserves it for the drift concept) — `A_mm2` is a locked constant so the wire's on-screen geometry never changes across states (per design spec §4.3).

## 2. Formulas — derived, rigor-checked

**Macroscopic law (what the graph shows):** V = IR, equivalently R = V/I (documentary — NOT how the engine computes i; the engine computes i from the microscopic bridge below, and V=IR falls out as a consequence, exactly as drift_velocity's v_d/i fall out of the drift chain).

**Microscopic bridge (continuous with drift_velocity — the S1 to S2 derivation clause and the ohms_law_from_drift drill-down cluster):**
```
E = V/L                              (field from the applied voltage over the wire length)
v_d = eEτ/m_e                        (drift velocity, NCERT form, no 1/2 — same as drift_velocity)
i = n*e*A*v_d                        (current, drift_velocity's definition)
  = n*e*A * e*(V/L)*τ/m_e
  = (n*e^2*A*τ/(m_e*L)) * V
  = V/R                              where  R = m_e*L / (n*e^2*A*τ)
```
So the R slider is exposed as ONE labelled "Resistance R" dial that inversely drives τ under the hood (τ = m_e*L/(n*e^2*A*R)) — a higher R slider setting means a LOWER τ (electrons collide sooner, drift is more damped), reproducing i = V/R exactly. A and L stay fixed constants so the on-screen wire never changes shape when R changes — only the drift responsiveness does (design spec §4.3, verified).

**Non-ohmic (filament, S5 only, ohmic:false):**
```
R_eff = R * (1 + filament_k * V / Vmax)
i = V / R_eff
```
As V rises, R_eff rises with it (filament heating leads to a shorter effective τ), so i grows LESS than proportionally — on the V-on-y/I-on-x axes this means the trace steepens (curves upward, concave up) away from the straight ohmic reference, exactly per the binding engine note at the top of the skeleton.

**Numerical verification (node, this session):**
```
S2 defaults   V=6,  R=5,  ohmic      -> E=6 V/m, τ≈8.373e-17 s, v_d≈8.824e-5 m/s, i = 1.2000 A   [matches drift_velocity's continuous operating point]
S3            V=6,  R=15, ohmic      -> i = 0.4000 A  (steeper line: same V, 1/3 the current, 3x the slope)
S5            V=6,  R=5,  filament k=1.4 -> R_eff = 8.4999... Ω, i = 0.7059 A   [matches design spec §4.4]
S5 sweep-end  V=12, R=5,  filament k=1.4 -> R_eff = 11.999... Ω, i = 1.0000 A   (departs visibly from the ohmic i=2.4 A the straight line would give at V=12,R=5)
V=0 (any R)                            -> E=0, v_d=0, i=0   (line through the origin, both ohmic and non-ohmic — S2's proportionality claim holds exactly at the anchor point)
```
All four verified with `node -e` this session (script recorded, arithmetic reproducible). The S5 sweep-end check confirms the concave-upward departure is visible across the full V range, not just at V=6 — at V=12 the ohmic line (same R=5) would predict i=2.4 A but the filament delivers only i=1.0 A, a factor-2.4 gap, more than enough for THE EYE to register the bend.

**Slope-reading sanity (Gate — axis convention, per binding note):** on V-on-y / I-on-x axes, geometric slope = ΔV/ΔI = R directly. At S2 defaults the line passes through (0,0) and (1.2, 6) -> slope = 6/1.2 = 5.0 Ω = R. Matches the live readout the skeleton records ("slope R = 5.0 Ω"). At S3 (R=15): line passes through (0,0) and (0.4, 6) -> slope = 6/0.4 = 15.0 Ω. Steeper (larger ΔV per ΔI) for the higher-R line, confirming "steeper means more R" is literally true on these axes — never "bends below."

## 3. Constraints (physical invariants)

```
"constraints": [
  "i = V/R exactly, for every (V,R) pair on the ohmic states (S1-S4, S6-ohmic-default) — the swept trace passes through the origin",
  "on the V-on-y / I-on-x axes, geometric slope dV/dI equals R directly — steeper line means larger R, never smaller",
  "current i is conserved through a series resistor: the number of electrons crossing any plane per second is identical before and after the resistor band",
  "what drops across a resistor is potential difference V, never current i — the colour gradient in S4 represents a V-drop, not a flow reduction",
  "R is constant (independent of V) only for an ohmic conductor at constant temperature; for the filament (S5, ohmic:false) R_eff rises with V",
  "at V = 0, i = 0 on every state, ohmic or non-ohmic — the line/curve always passes through the origin",
  "wire geometry (L, A_mm2) never changes on screen as R changes — R is realized purely as a change in electron relaxation time tau under the hood"
]
```

## 4. Within-state motion timeline + per-state control spec (all t-windows relative to state-clock PM_simTimeMs, per Rule 26)

**Top-level config (once, additive to drift_velocity's engine — per design spec §4, Phase A verified):**
```json
"particles": { "count": 40, "thermal_speed": 2.2, "color": "#42A5F5" },
"lattice": { "count": 24, "color": "#90A4AE" },
"field_arrows": { "count": 5, "direction": "left_to_right", "color": "#FF9800" },
"vi_graph": { "position": "bottom_corner", "x_axis": "I (A)", "y_axis": "V (volts)" }
```

| state | t-window (state clock) | what animates | driven by | cause-to-effect gap (32a) | live control(s) |
|---|---|---|---|---|---|
| S1 push_drives_flow | cue field_on at ~800 ms (CAUSE: battery/field-arrows appear) then ~600-800 ms readable beat then electron cloud ramps into drift ~800-1600 ms (EFFECT, top) then show_current_meter climbs 0 to i_default over ~1600-2400 ms and settles (EFFECT, meter) | cue:{id:'field_on', at_ms:800} bound via scenario_cue to s1_1's narrating sentence; V, R held at defaults (6, 5) | ~800 ms field-to-drift gap, ~800 ms drift-to-meter gap — both exceed the Rule 32a 0.5-1s minimum | none (watch) |
| S2 straight_line_law | graph panel appears on entry (show_vi_graph:true); vi_autosweep clock-drives V 0 to 6 over ~400-2800 ms: drift in the wire visibly quickens first (cause, ~400-1200 ms) then after ~600-800 ms gap the operating point climbs and the bright vi_trace extends dead-straight over the faint ohmic_reference (effect, ~1200-2800 ms); formula_overlay (V = IR) lands AFTER the trace is watched, at ~3000 ms (per teach_concrete_before_abstract_compare); teacher may grab the V slider mid/post-sweep and the point obeys live | vi_autosweep (engine clock-driven, deterministic under SET_TIME_FREEZE) then live V slider | drift-quickens-before-trace-extends, ~600-800 ms gap (engine cue-gate machinery, Phase A verified) | V |
| S3 slope_is_resistance | on entry, a cue re-tilts the trace from S2's slope (R=5) to R=15 over ~600-1000 ms, bound via scenario_cue to s3_1's narrating sentence — CAUSE = the R slider value changing (shown on the slider row + slope readout ticking up first), EFFECT = the visible tilt, after a ~500-700 ms beat; then R slider is live: drag R up leads to line tilts steeper, drift in the wire visibly slows at the same V (V held at 6), slope_readout (slope R = ... Ω) tracks continuously | R slider (post-entry-cue) | ~500-700 ms slider-value-changes to tilt-visible gap | R |
| S4 nothing_used_up | graph panel hidden this state (32d exception — full canvas on the wire); on entry, resistor band + flux_tallies appear (~0-400 ms, CAUSE: the band placed on the wire) then after ~600 ms beat, twin counting planes begin flashing per electron crossing (~1000 ms onward, EFFECT) and the two tallies run live, staying MATCHED (N/s in = N/s out) for the full dwell; colour gradient (ΔV tag) across the band fades in parallel, showing what IS spent | electron crossings (native drift engine, R fixed at default 5, V fixed at default 6) | ~600 ms band-appears to tallies-begin gap | none (watch) |
| S5 when_the_line_bends | graph panel returns (show_vi_graph:true, ohmic:false); vi_autosweep re-runs the S2 sweep (V 0 to 6 to up to 12 across the state) on the filament: drift in the wire gains LESS than proportionally as V climbs (cause, visible in the wire first, ~400-1200 ms) then after ~600-800 ms gap the bright vi_trace peels away from the faint straight ohmic_reference, curving upward/steepening (effect, ~1200-3000 ms); slope_readout switches to showing R_eff = ... Ω (non-constant) once the curve departs; non-ohmic tag (filament — R rises with V) lands with the departure | vi_autosweep (ohmic:false), then live V slider | ~600-800 ms drift-gains-less-before-curve-departs gap | V |
| S6 sandbox | duration 0/open; teacher drives V and R (show_sliders:true); operating point rides the live line/curve, vi_trace, slope_readout, current meter, and drift all respond continuously; home-pose wire + graph panel both persistent from S5's layout | teacher, all sliders | n/a — explore exempt from 32a/32b | ALL: V, R |

**32b confirmation:** S1/S4 have zero controls (motion is not interactivity — the watch-beats auto-play, consistent with drift_velocity's S1/S2 pattern). S2/S5 move ONLY V (R stays at default 5 for the whole sweep). S3 moves ONLY R (V stays at default 6). S6 is the explore exception.

**Cue binding table (scar rule — every cue bound to a narrating sentence via scenario_cue, at_ms kept only as THE EYE fallback):**

| cue id | bound to sentence | at_ms fallback |
|---|---|---|
| field_on (S1) | s1_1 | 800 |
| retilt_to_r15 (S3) | s3_1 | 700 |

## 5. Board-mode mark scheme

N/A this phase. Conceptual-only directive active (Rule 20 suspension) — SKIP entirely, no mode_overrides authored. Declared per architect §10(e), not a TBD.

## 6. Drill-down cluster phrasings (5 real student-voice phrases x 9 clusters, from architect §6)

**S2 — slope_axis_confusion**: "why is slope R and not 1 over R" · "on this graph which axis gives resistance" · "if I flip the axes does slope become 1/R" · "why did we put V on y not I on y" · "im confused which line slope actually equals R"

**S2 — why_straight_through_origin**: "why does the line have to pass through zero" · "does zero volts always mean zero current" · "why is it a straight line and not just increasing" · "whats the difference between proportional and just increasing" · "why cant the line start above zero on the graph"

**S2 — ohms_law_from_drift**: "how do we get V=IR from drift velocity" · "wheres the connection between i=neAv_d and ohms law" · "how does e E tau over m become V equals IR" · "is ohms law derived or just observed experimentally" · "how is R related to tau and n from the drift chapter"

**S4 — current_conservation_series**: "is current the same everywhere in a series circuit" · "does current change after passing through a resistor" · "why is i the same before and after the resistor" · "in series does every component get the same current" · "how can current be constant if energy is being lost"

**S4 — what_the_resistor_spends**: "what does a resistor actually use up" · "is it current or voltage that drops across a resistor" · "why do we say voltage drops not current drops" · "whats actually being consumed by the resistor" · "does the resistor eat electrons or eat energy"

**S4 — where_the_energy_goes**: "where does the lost voltage energy actually go" · "does the resistor convert electricity into heat" · "why does the wire get warm near a resistor" · "is the energy drop the same as power dissipated" · "whats the connection between voltage drop and heat"

**S5 — ohmic_vs_non_ohmic**: "which materials actually obey ohms law" · "is a metal wire always ohmic" · "what makes something non ohmic" · "does ohms law ever completely fail" · "how do I know if a component is ohmic from its graph"

**S5 — filament_resistance_rises**: "why does a bulbs resistance change when it heats up" · "does more current make the filament resistance go up" · "why isnt R constant for a light bulb" · "how does heating affect tau and resistance" · "why does the filament curve bend upward not downward"

**S5 — dynamic_resistance_meaning**: "whats the difference between R equals V over I and dV over dI" · "on a curved graph what does resistance even mean" · "is there one R value or many for a filament" · "how do you find resistance at a single point on a curve" · "why is static resistance different from dynamic resistance"

## 7. teacher_script text_en per state (word budgets verified this session)

### STATE_1 push_drives_flow — 50 words — glow_focal: current_meter
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s1_1 | "The battery's push sets up a field along the wire, and every electron picks up that same slow drift you met before." | field | field_on |
| s1_2 | "Watch the current meter climb from zero as the battery switches on, then settle." | current_meter | — |
| s1_3 | "More push means more current — cause and effect, the whole law in miniature." | current_meter | — |

### STATE_2 straight_line_law — 53 words (PRIMARY aha) — glow_focal: vi_operating_point
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s2_1 | "Sweep the voltage up from zero and watch two things happen." | field | — |
| s2_2 | "In the wire the drift quickens as V climbs; the graph point climbs too, leaving a bright trace." | vi_operating_point | — |
| s2_3 | "That trace is dead straight through the origin — current is exactly proportional to voltage, at steady temperature." | vi_trace | — |
| s2_4 | "This straight line is Ohm's law." | formula | — |

### STATE_3 slope_is_resistance — 50 words — glow_focal: slope_readout
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s3_1 | "Drag resistance up and watch the line itself tilt steeper." | slope_readout | retilt_to_r15 |
| s3_2 | "A bigger R needs more volts for the same amp, so the slope climbs — more resistance, steeper line." | vi_trace | — |
| s3_3 | "In the wire the drift visibly slows at the same voltage, and the readout confirms: slope R equals V over I." | slope_readout | — |

### STATE_4 nothing_used_up — 53 words — glow_focal: flux_tallies
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s4_1 | "Two counting planes sit before and after this resistor, tallying electrons crossing every second." | flux_tallies | — |
| s4_2 | "Watch both tallies through the whole dwell — they stay matched, in equals out; current never drops crossing a resistor." | flux_tallies | — |
| s4_3 | "What drops is voltage — watch the colour gradient fade across the band; the resistor spends voltage, never current." | field | — |

### STATE_5 when_the_line_bends — 54 words — glow_focal: vi_trace
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s5_1 | "Sweep voltage again, but now on a glowing filament bulb, not a plain wire." | field | — |
| s5_2 | "Watch the bright trace peel away from the faint straight reference, curving upward as voltage grows." | vi_trace | — |
| s5_3 | "The filament heats, its resistance rises with voltage, and the slope keeps changing — Ohm's law holds only for ohmic conductors at constant temperature." | slope_readout | — |

### STATE_6 sandbox — 19 words (explore-exempt) — glow_focal: vi_operating_point
| id | text_en | glow |
|---|---|---|
| s6_1 | "Both dials are yours now — drag voltage and resistance and watch the operating point ride the live curve." | vi_operating_point |

## 8. Per-state control spec (mirrors drift_velocity's §5 table)

| state | visible_controls | show_sliders | show_vi_graph | ohmic | glow_focal | advance_mode |
|---|---|---|---|---|---|---|
| S1 | [] | false | false | — | current_meter | manual_click |
| S2 | [V] | false | true | true | vi_operating_point | manual_click |
| S3 | [R] | false | true | true | slope_readout | manual_click |
| S4 | [] | false | false (32d) | true | flux_tallies | manual_click |
| S5 | [V] | false | true | false | vi_trace | manual_click |
| S6 | — | true | true | true (default; changes if teacher toggles) | vi_operating_point | interaction_complete |

Note: S6 explore is ohmic by default at engine entry (matches the continuous-with-S2 operating point) — flag to json_author: if the Phase-A engine does not expose an S6 ohmic/non-ohmic toggle, ohmic:true is a locked assumption for the explore state; no gap, just document the choice.

## 9. Captions + formula_overlay per state (5-words-or-fewer delta cue per Rule 32c, matches architect §3 delta column)

| state | caption | label | formula_overlay |
|---|---|---|---|
| S1 | "Battery on" | "i = V/R (settling)" | (empty) |
| S2 | "Double the push" | "V (volts) vs I (A)" | "V = IR" (lands after trace watched) |
| S3 | "Steeper means more R" | "slope R = ... Ω" | "R = V/I" |
| S4 | "Same current, less V" | "N/s in = N/s out" | (empty) |
| S5 | "The bulb bends it" | "filament — R rises with V" | "R_eff = R(1 + k*V/V_max)" |
| S6 | "Both dials yours" | "Explore: V, R" | "V = IR" |

## 10. Engine capability confirmation — no gaps flagged this concept

Unlike drift_velocity (3 flagged gaps), the Phase-A engine additions (show_vi_graph, vi_autosweep, ohmic, show_flux_conservation, V/R slider rows, realResistance()) were built AND verified live before this physics block was authored (per skeleton binding note + design spec §4). No [owner: peter_parker:*] routing needed from physics_author. One soft flag: confirm the vi_graph/vi_operating_point/vi_trace/slope_readout/flux_tallies glow-target strings (§0/§10) against the actual built enum before json_author locks them in — if any string mismatches, it is a one-line rename, not a re-derivation.

## Self-review (physics_author checklist)

- [x] Every symbol in the skeleton's state narratives (V, R, i, slope, R_eff) appears in §1 variables.
- [x] No radians() needed — no angles in this concept.
- [x] Every state's live control(s) match the architect's control table exactly (S1/S4 none, S2/S5 V-only, S3 R-only, S6 ALL).
- [x] No variable_overrides needed — V/R hold at defaults in every guided state except where explicitly swept/dragged; no state depicts a special-case value divergent from defaults.
- [x] Mark scheme: N/A, declared per Rule 20 (not a TBD).
- [x] 45 drill-down phrases (5 x 9 clusters), plain-English student voice, no Hinglish, no teacher-prose.
- [x] 7 constraints, short and factual.
- [x] Numerical sanity checked via node -e this session: S2 i=1.2000A, S3 i=0.4000A, S5 i=0.7059A (all match design spec §4.4's pre-verified numbers exactly), V=0 gives i=0 on both ohmic/non-ohmic, S5 sweep-end (V=12) shows a 2.4x departure from the ohmic prediction — curve visibly concave-up across the full sweep, not just at the default.
- [x] Within-state motion timeline for all 6 states, cause-before-effect gaps of at least 500ms (Rule 32a) documented per row, no two states share a motion (archetype table already enforces distinctness at the architect layer; motion content here is per-state unique).
- [x] Rule 32 sequencing verified: S1 field-drift-meter (two ~800ms gaps), S2/S5 drift-quickens-before-trace (~600-800ms), S3 slider-changes-before-tilt (~500-700ms), S4 band-appears-before-tallies (~600ms). Only the taught variable moves per guided state (32b) — confirmed S2/S5=V only, S3=R only, S1/S4=zero.
- [x] Word budget verified via script this session: S1=50, S2=53, S3=50, S4=53, S5=54 (all inside their 35-50/40-55 bands per architect's per-state budget column); S6=19 (open/explore-exempt).
- [x] Engine bug queue consulted (forwarded scars from architect + physics_author's own list); all satisfied, no exceptions needed beyond the pre-flagged 32d panel-visibility exception (already documented by architect, re-confirmed here).
- [x] DC Pandey check: no formula, explanation, or example problem imported. V=IR derivation built strictly from the drift_velocity microscopic chain (Newton's laws + the existing shipped derivation), scope-only consultation per architect Block-1.

## Handoff notes for json_author

1. Slider defaults are LOCKED and verified: V 0-12V step 0.5 default 6, R 1-20Ω step 0.5 default 5 -> i=1.2A at S2 defaults, exactly continuous with drift_velocity's shipped operating point.
2. filament_k = 1.4 is locked — produces a clearly-visible concave-up departure (i drops from the ohmic-predicted 2.4A to the actual 1.0A by V=12).
3. Cue timings: field_on at 800ms bound to s1_1; retilt_to_r15 at 700ms bound to s3_1 — both via scenario_cue, at_ms as THE EYE fallback only.
4. 32d exception is real and pre-approved by the architect — S1 no panel, S4 panel hidden. Do not "fix" this as a continuity violation.
5. A_mm2 and L are locked constants, not sliders — this concept does not re-expose drift_velocity's A slider; wire geometry never visibly changes.
6. No physics concerns for json_author — the engine (Phase A) was built and verified BEFORE this physics block, so there is no derivation risk; the only open item is confirming the exact glow-target enum strings (§0/§10) against what Phase A actually shipped.
