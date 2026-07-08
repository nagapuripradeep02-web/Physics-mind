# Physics block — `drift_velocity` (Ch.3 §3.5, particle_field renderer)

> physics_author output, 2026-07-08. Companion to `drift_velocity_skeleton.md` (architect). Handoff target: json_author.

## 0. Engine bug queue consultation + renderer-reality note

Prevention rules applied (from local canonical seed mirrors):
- **`default_variables_only_first_var_merged`** → explicitly declare `formula_anchor.constants = {e, m_e, n}` in the JSON even though they numerically match the renderer's hardcoded fallbacks — never rely on the fallback silently.
- **Glow-target validity** → every `glow`/`glow_focal` value below is one of the six declared valid targets (`electrons | lattice | field | drift_arrow | current_meter | formula`) and nothing else.
- **Orphaned-annotation analog** → on-canvas text lives ONLY in `states.{label,caption,formula_overlay}`; `epic_l_path.scene_composition` annotations are not rendered. json_author must not try to "fix" a missing label by editing `scene_composition`.
- **Caption/layout scar** → all captions single short line (≤5 words), under the 68%-max-width DOM banner.
- **Forwarded PA rules** (`teach_reveal_synced_to_narration`, `teach_show_quantity_live_when_named`, `teach_color_each_element_by_its_own_sign`) → honored in §3/§4.

**Renderer-reality correction (important for json_author):** this concept does NOT use the `physics_engine_config.formulas` / PM_interpolate runtime convention — `particle_field_renderer.ts` computes `v_d` and `i` **natively in engine JS** (`realDriftVelocity()`, `realCurrent()`), reading `slider_controls.{E,tau,A}` and `formula_anchor.constants.{e,m_e,n}`. §2 below is documentation + rigor-check; the only JSON keys carrying the physics layer are `slider_controls` and `formula_anchor.constants` (plus the standard `physics_engine_config` block the Zod schema requires — author it as documentation).

## 1. Variables

| symbol | name | unit | min | max | default | step | kind |
|---|---|---|---|---|---|---|---|
| `E` | electric field | V/m | 0 | 0.1 | **0.02** | 0.005 | slider |
| `tau` | relaxation time (τ) | fs (×10⁻¹⁵ s in formula) | 5 | 50 | **25** | 1 | slider |
| `A` | conductor cross-section | mm² (×10⁻⁶ m² in formula) | 0.5 | 5 | **1** | 0.1 | slider |
| `e` | elementary charge | C | — | — | `constant: 1.6e-19` | — | locked constant |
| `m_e` | electron mass | kg | — | — | `constant: 9.11e-31` | — | locked constant |
| `n` | free-electron number density (copper) | m⁻³ | — | — | `constant: 8.5e28` | — | locked constant, material property |
| `u` | thermal (random) speed | m/s | — | — | `constant: ~1.17e5` | — | documentary only, no slider |
| `a` | acceleration between collisions | m/s² | — | — | `derived: e*E/m_e` | — | intermediate |
| `v_d` | drift velocity | m/s | — | — | `derived: e*E*tau/m_e` | — | live readout (engine) |
| `i` | current | A | — | — | `derived: n*e*A*v_d` | — | live readout (engine) |

**JSON shape (`particle_field_config`):**
```json
"slider_controls": {
  "E":   { "min": 0,   "max": 0.1, "step": 0.005, "default": 0.02, "label": "Electric field E",  "unit": "V/m" },
  "tau": { "min": 5,   "max": 50,  "step": 1,     "default": 25,   "label": "Relaxation time τ", "unit": "fs" },
  "A":   { "min": 0.5, "max": 5,   "step": 0.1,   "default": 1,    "label": "Cross-section A",    "unit": "mm²" }
},
"formula_anchor": {
  "constants": { "e": 1.6e-19, "m_e": 9.11e-31, "n": 8.5e28 }
}
```

## 2. Formulas — derived, rigor-checked

Derivation chain: F = eE (opposite E for the electron) → a = eE/m_e → averaging the per-flight velocity gain over the population's random free times with mean τ:

**`v_d = aτ = eEτ/m_e`** (NCERT §3.5 form — NO ½ factor) and **`i = n·e·A·v_d`**.

**DC Pandey / coaching-book discrepancy — do NOT "fix":** some references write v_d = eEτ/(2m) by averaging within one flight instead of across flights. NCERT's `v_d = eEτ/m` is the version authored AND the one the renderer computes (`realDriftVelocity()` has no /2). Auditor: this is a documented convention choice, not an error.

**Numerical verification at defaults (E=0.02 V/m, τ=25 fs, A=1 mm², n=8.5×10²⁸ m⁻³):**
```
u   ≈ 1.17 × 10⁵ m/s  (equipartition, 300 K)
a   ≈ 3.51 × 10⁹ m/s²
v_d ≈ 8.78 × 10⁻⁵ m/s   ✓
i   ≈ 1.19 A            ✓
u/v_d ≈ 1.33 × 10⁹      ✓ (the 10⁹ paradox)
```

**S3 "≈14 hours" rigor:** at default v_d, wire run d ≈ 4.4 m → t ≈ 13.9 h ≈ 14 h. Author the anchor/S3 narration around ~4–5 m and ≈14 h so the spoken number and the live readout agree.

**Slider-extreme sanity:** even at E and τ both maxed, drift stays 8 orders of magnitude below thermal speed; A∈[0.5,5] spans i ∈ [0.60, 5.97] A. Contrast never collapses.

## 3. Within-state motion timeline + choreography

**Top-level config (once):**
```json
"particles": { "thermal_speed": 2.2, "color": "#42A5F5" },
"lattice":   { "color": "#90A4AE" },
"field_arrows": { "direction": "left_to_right", "color": "#FF9800" },
"animation_constraints": { "collision_glow": false }
```
`collision_glow` deliberately OFF (fires for all 40 particles, would make S4's close-read noisy — see §9).

| state | t-window (state clock) | what animates | driven by | drift_speed px/f | controls |
|---|---|---|---|---|---|
| **S1** | continuous | full-speed zigzag, no bias; net-shift 0 | thermal_speed 2.2 | **0** (`drift_direction:'none'`) | none |
| **S2** | cue ~1.0–1.2s: arrows fade 600ms (CAUSE) → 900ms hold → drift ramps 800ms (EFFECT) | `cue:{id:'field_on'}` engine gate | E, τ at default | **0.35** | none |
| **S3** | same cue mechanism, ONE clean OFF→ON; highlighted electron crawls a few px over the whole state | `cue:{id:'field_on'}` + `highlight_particle:true` (`dim_others:false`) | defaults | **0.35** | none |
| **S4** | continuous; spotlighted electron trail kinks at each collision reset; background dimmed 0.25 | `collisionFrames()` scaled by τ slider | **τ** | **0.35** | **τ** |
| **S5** | continuous; drift arrow length tracks E live; teacher-driven | E slider scales `effDriftPx()` | **E** | **0.35** base | **E** |
| **S6** | continuous; current meter climbs as A widens; v_d readout holds (A not in `effDriftPx()`) | A slider scales `realCurrent()` only | **A** | **0.35** | **A** |
| **S7** | continuous; all live | E, τ, A | teacher | **0.35** base | ALL (`show_sliders:true`) |

## 4. Exact `text_en` narration (word counts verified)

### STATE_1 `thermal_chaos` — 40 words — glow_focal: `electrons`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s1_1 | "Inside this idle wire, free electrons already tear around at about a hundred thousand metres per second, bouncing off the lattice constantly." | electrons | — |
| s1_2 | "Yet the whole cloud goes nowhere — net displacement is exactly zero." | electrons | — |
| s1_3 | "All that speed, and still no current." | electrons | — |

### STATE_2 `field_on_drift` — 53 words — glow_focal: `field`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s2_1 | "Now switch the electric field on." | field | **`field_on`** |
| s2_2 | "Watch the field arrows fill the wire, and a heartbeat later a tiny drift appears in the electron cloud, moving opposite to the field." | field | — |
| s2_3 | "That drift rides on the same violent zigzag: thermal speed near a hundred thousand metres per second, drift barely a ten-thousandth of that." | electrons | — |

### STATE_3 `instant_everywhere` — 50 words (PRIMARY aha) — glow_focal: `electrons`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s3_1 | "Flip a switch — what actually reaches the fan first?" | field | — |
| s3_2 | "Not the electron — this spotlighted one would take about fourteen hours to crawl the few metres from switch to fan." | electrons | — |
| s3_3 | "What arrives instantly is the field itself, filling the whole wire at once — every electron everywhere starts drifting the same moment." | field | **`field_on`** |

### STATE_4 `collision_clock` — 54 words — glow_focal: `formula`
| id | text_en | glow |
|---|---|---|
| s4_1 | "Follow just one electron between collisions." | electrons |
| s4_2 | "The electric field pushes it with a constant acceleration — a equals e E over m — for the free time between two collisions, call that time tau." | formula |
| s4_3 | "Average that little kick over every electron's tau, and you get the drift speed: v d equals e E tau over m." | formula |

### STATE_5 `field_scales_drift` — 38 words — glow_focal: `drift_arrow`
| id | text_en | glow |
|---|---|---|
| s5_1 | "Drag the field slider and watch the labelled v d arrow respond." | field |
| s5_2 | "Double the field E, and the drift velocity doubles too — it's a straight-line relationship, v d equals e E tau over m, with tau held fixed." | drift_arrow |

### STATE_6 `current_count` — 53 words — glow_focal: `current_meter`
| id | text_en | glow |
|---|---|---|
| s6_1 | "Now widen the wire's cross-section, A." | current_meter |
| s6_2 | "Current is just the number of electrons crossing a plane every second — i equals n e A v d — so a wider wire carries more lanes of traffic." | current_meter |
| s6_3 | "Watch the meter climb as A grows — but the drift speed readout barely moves. More lanes, not faster cars." | current_meter |

### STATE_7 `sandbox` — 16 words (explore-exempt) — glow_focal: `current_meter`
| id | text_en | glow |
|---|---|---|
| s7_1 | "All three dials are yours now — E, tau, and A — explore how drift and current respond." | current_meter |

## 5. Per-state control spec

| state | `visible_controls` | `show_sliders` | glow_focal | advance_mode |
|---|---|---|---|---|
| S1 | `[]` | false | `electrons` | manual_click |
| S2 | `[]` | false | `field` | manual_click |
| S3 | `[]` | false | `electrons` | manual_click |
| S4 | `["tau"]` | false | `formula` | manual_click |
| S5 | `["E"]` | false | `drift_arrow` | manual_click |
| S6 | `["A"]` | false | `current_meter` | manual_click |
| S7 | — | **true** | `current_meter` | interaction_complete |

## 6. Physical constraints

```
"constraints": [
  "v_d << u at every slider setting — ratio never drops below ~10^8, even at E and tau both maxed",
  "drift velocity direction is opposite to the electric field direction (electron charge is negative)",
  "conventional current i points along E, opposite to the electron drift direction",
  "current i scales linearly with cross-section A; drift velocity v_d does NOT depend on A",
  "v_d is directly proportional to both E and tau (independently, holding the other fixed)",
  "n = 8.5 x 10^28 /m^3 is a fixed material property of copper — not a slider, not battery-dependent",
  "thermal/random motion (u) is present and non-zero in every state, including S1 with the field off"
]
```

## 7. Drill-down cluster trigger phrases (5 × 9 clusters)

**S3 — `field_travels_not_electrons`**: "so electrons dont actually travel down the wire" · "what is moving so fast then if not electrons" · "is it the field that travels not the electron" · "why do people say current flows if electrons barely move" · "does the electron itself go all the way to the bulb"

**S3 — `why_bulb_lights_instantly`**: "why does the bulb light up instantly when electrons are so slow" · "how is the switch instant if drift velocity is tiny" · "bulb turns on immediately but electrons take hours doesnt that contradict" · "why is there no delay when i flip the switch" · "if v d is 10 to the minus 4 why is light instant"

**S3 — `signal_speed_vs_electron_speed`**: "whats the difference between signal speed and electron speed" · "is drift velocity the same as the speed of electricity" · "three different speeds im confused which one is which" · "why is thermal speed so much bigger than drift speed" · "does current travel at speed of light or at v d"

**S4 — `relaxation_time_meaning`**: "what exactly is relaxation time" · "is tau the time between two collisions or something else" · "why do we call it relaxation time not collision time" · "is tau same for every electron or an average" · "what does tau physically mean in the formula"

**S4 — `collision_reset_mechanism`**: "why does the electron lose its velocity after every collision" · "does the drift velocity reset to zero at each collision" · "why doesnt the electron just keep speeding up forever" · "what happens to the extra speed gained between collisions" · "why does hitting the lattice cancel the electrons motion"

**S4 — `why_vd_proportional_tau`**: "why is v d proportional to tau and not tau squared" · "if collisions are less frequent why does drift increase" · "longer tau means what physically for the electron" · "why does more time between collisions mean more drift" · "is v d proportional to tau because of v equals u plus at"

**S6 — `current_area_dependence`**: "why does a thicker wire carry more current" · "does area affect the speed of electrons or just the count" · "if v d stays same why does i change with area" · "why does current depend on area but not drift speed" · "wider wire same field why is current different"

**S6 — `number_density_n_confusion`**: "what is n in i equals n e a v d" · "is n the number of electrons in the whole wire or per volume" · "does n change if i use a different wire" · "is n same for every material or only copper" · "why is n a property of the metal not the battery"

**S6 — `same_current_thinner_wire_faster_drift`**: "if current is same why does drift speed change in a thinner wire" · "same current thinner wire does that mean electrons move faster" · "why does v d increase when area decreases at constant current" · "in a series circuit does drift velocity change wire to wire" · "thinner wire same current so is v d higher there"

## 8. Captions + formula_overlay per state

| state | `caption` | `label` (single line — fixed 24px rect, NEVER multi-line) | `formula_overlay` |
|---|---|---|---|
| S1 | "Fast everywhere, going nowhere" | `"u ≈ 1.2×10⁵ m/s · net shift = 0"` | *(empty)* |
| S2 | "Field on — drift begins" | `"u ≈ 1.2×10⁵ m/s · v_d ≈ 8.8×10⁻⁵ m/s"` | *(empty)* |
| S3 | "Field arrives, not electrons" | `"field ≈ instant · electron ≈ 14 h to cross ~4.4 m"` | *(empty — gated to S4+)* |
| S4 | "One electron, kicked between collisions" | `"u ≈ 1.2×10⁵ m/s (zigzag) · v_d ≈ 8.8×10⁻⁵ m/s (avg drift)"` | `"a = eE/m\nv_d = aτ = eEτ/m"` |
| S5 | "Double the field, double drift" | `"v_d ∝ E (linear)"` | `"v_d = eEτ/m"` |
| S6 | "Crossings per second = current" | `"i → (current)   electrons ← (actual drift)"` | `"v_d = eEτ/m\ni = neAv_d\nn = 8.5×10²⁸ /m³ (copper)"` |
| S7 | "All three dials yours" | `"Explore: E, τ, A"` | `"a = eE/m\nv_d = eEτ/m\ni = neAv_d\nn = 8.5×10²⁸ /m³ (copper)"` |

## 9. Engine capability gaps — route via quality_auditor as `[owner: peter_parker:renderer_primitives]`, never faked in JSON

1. **No repeating on/off loop primitive** (S3 ideal was a ~6s OFF→ON→OFF cycle; engine has ONE single-shot `field_on` cue). Worked around: a single cue already shows "field appears everywhere at once" (no travelling wavefront in the engine) vs the crawling spotlight electron. Nice-to-have, not a blocker.
2. **No scripted slider auto-sweep** (S5/S6 ideal auto-sweeps). Worked around: teacher-driven live instrument, consistent with the live-instrument doctrine.
3. **No A-bracket visual, no direction-pair graphic, no single-particle collision flash.** Worked around: direction-pair as S6 `label` text; τ read from trail kinks; `collision_glow` OFF. Recommend future primitives: `show_area_bracket`, spotlight-scoped collision flash.

## Self-review (physics_author checklist)
All variables declared ✓ · controls match architect table ✓ · no board mark scheme (Rule 20) ✓ · 45 drill-down phrases ✓ · 7 constraints ✓ · defaults verified numerically ✓ · word budgets: S1=40, S2=53, S3=50, S4=54, S5=38, S6=53, S7=16 ✓ · cause-first via engine cue gate ✓ · NCERT eEτ/m (no ½) documented ✓ · 3 engine gaps flagged, not faked ✓
