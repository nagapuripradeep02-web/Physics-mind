# resistivity — architect skeleton (Rule 31/32, word-budget native)

> **Pipeline position:** architect output → physics_author. Chapter 3 — Current Electricity (NCERT Class 12 Part 1, §3.6 Resistivity of Various Materials + §3.7 Temperature Dependence of Resistance). **Third concept of Ch.3, third on the `particle_field` renderer (2D p5.js)** — authored against the particle_field capability surface (`particle_field_config` as shipped in `drift_velocity.json` + `ohms_law.json`, plus the Phase-B additions FLAGged in §"Engine delta" below). No field_3d vocabulary anywhere downstream (field_3d pre-flight checklist: N/A — 2D renderer).
> Shape cloned from `.agents/proof_run/ohms_law_skeleton.md` / `drift_velocity_skeleton.md` (the word-budget-native siblings — drift S1–S6 = 40/53/50/54/38/53 EN words; match THAT discipline).

## ⚠ PHASE-B ENGINE DELTA REQUIRED (read first — `peter_parker:renderer_primitives`, routed via quality_auditor, never cold-called)

`particle_field_renderer.ts` today has NO geometry-morph-as-taught-variable beyond the drift S6 `A` sweep, NO material presets, NO temperature model, NO ρ/R readouts. This concept needs, as engine capability (data-driven per state, mirroring the Phase-A `show_vi_graph`/`ohmic` pattern):

1. **`L` slider + on-screen wire-length morph** — wire visibly elongates/shortens; engine keeps E = V/L so drift responds physically. (The `A` width morph + counting plane already exist from drift S6 — reuse, do not rebuild.)
2. **`material` preset control** (discrete toggle, not a slider — a new control-row type): `copper | nichrome | manganin`, each carrying {n, τ₀, α, lattice tint}. Switching material re-tints the lattice and re-scales collision frequency.
3. **Temperature model:** `T` slider → lattice-ion jitter amplitude + collision-flash frequency scale with T; τ(T) shrinks per the material's α; thermometer/`T` readout.
4. **Live readouts as NEW glow-enum targets:** `r_readout` (`R = ρL/A`, Ω) and `rho_readout` (`ρ`, Ω·m), plus `lattice` and `thermometer` as glow targets. **The glow enum is CLOSED** (known scar: a non-keyed `glow_focal` silently dims the whole panel) — the enum extension is part of the engine delta, and json_author must verify every focal string against the built enum before shipping.
5. **Coupled-stretch cue** for S3 phase 3 (L↑ while A↓ at constant volume) — a scripted geometry cue, clock-driven, deterministic under SET_TIME_FREEZE for THE EYE.

Everything else (current meter, formula overlays, captions, `visible_controls` rows, `scenario_cue`/SET_CUE_TIME channel, V slider) exists — reuse verbatim. **Sequencing:** engine delta lands and is browser-verified BEFORE json_author starts (the ohms_law Phase-A precedent).

## 1. Atomic claim

This concept teaches that resistance factorizes into shape × material — R = ρL/A, where resistivity ρ = m/(ne²τ) is the material's own number (set by n and τ, independent of geometry) and, for metals, rises with temperature as ρ_T = ρ₀(1 + α(T − T₀)) because hotter lattices cut τ. It does not cover conductivity/current density σ, j (deferred to `current_density_conductivity`), semiconductor band theory (deferred to Ch.14 `semiconductors_energy_bands`), superconductivity (deferred to `superconductivity`), mobility (deferred to `electron_mobility`), series/parallel combinations, or power/heating P = I²R (deferred to `electric_power_heating`).

## 2. State count + arc (7 — complexity-driven, documented)

The §5 table puts a medium concept at 5–6; resistivity lands at 7 because it carries TWO laws (R = ρL/A and ρ_T = ρ₀(1+αΔT)) bridged by one microscopic formula (ρ = m/ne²τ), plus three genuine misconception pivots each needing its own contrast beat, plus the alloy counter-case the brief mandates. Not padded: S1/S2 and S5/S6 are declared contrast pairs (each half kills a distinct wrong belief or closes the anchor); nothing merges without losing a beat; nothing splits (each state = one idea, one motion).

Guided distinct-motion beats → combined explore last. The hook MOVES (S1: wire stretching under a steady battery from frame one). **No `teaching_method` fields on S1–S6** (Rule 31 default); S7 = `exploration_sliders`.

| state | one-line purpose |
|---|---|
| S1 `longer_chokes` | Same material, same battery — stretch the wire longer and the current visibly drops: R ∝ L (misconception pivot #1) |
| S2 `wider_frees` | Widen the same wire and the current climbs back: R ∝ 1/A — more lanes for the same drift |
| S3 `shape_times_material` | **PRIMARY aha:** R = ρL/A — geometry dances (including the constant-volume stretch), R dances with it, but ρ stays pinned: the material's own number (pivot #2) |
| S4 `what_rho_is_made_of` | Swap copper → nichrome at identical geometry: drift collapses, ρ jumps ~65× — ρ = m/(ne²τ); a material IS its n and τ |
| S5 `heat_raises_rho` | Heat the copper wire: lattice shakes harder, collisions come sooner, τ falls, ρ and R climb — ρ_T = ρ₀(1+αΔT) (pivot #3) |
| S6 `the_steady_alloy` | The identical heat sweep on the alloy barely moves ρ (tiny α) — why standards use manganin and heater coils trust nichrome |
| S7 `sandbox` | Explore: all four dials (L, A, material, T), R/ρ/i readouts live |

## 3. Per-state choreography + control plan — THE CONTROL TABLE (Rule 31 — first design artifact)

| state | teaches | archetype | DISTINCT motion (pure fn of state clock; deterministic for THE EYE) | delta (→ ≤5-word caption cue, Rule 32c) | live control(s) | narration budget (EN words) |
|---|---|---|---|---|---|---|
| S1 `longer_chokes` | R ∝ L — geometry alone changes resistance | `reshape-apparatus` (coined: the apparatus's own dimensions are the driven variable — no seed archetype covers geometry morph; nearest is densify/rarefy but that's field/particle density, not the object's shape) | battery on at home pose (i ≈ 1.2 A, continuous with drift/ohms); `L` auto-sweeps 1 m → 2 m (the CAUSE, wire visibly elongating) → readable beat → drift slows along the whole wire and the current meter falls to half (the EFFECT); `R = …Ω` readout climbs in step; teacher may grab L | Longer wire, less current | **L** | 35–50 |
| S2 `wider_frees` | R ∝ 1/A — area multiplies lanes, not speed | `reshape-apparatus` — **DECLARED CONTRAST PAIR with S1**; flip: S1 stretches the wire ALONG the flow (chokes it), S2 widens it ACROSS the flow (frees it) | from S1's end pose, `A` auto-sweeps 1 mm² → 2 mm² (cause, wire visibly thickening) → beat → the counting plane flashes faster, meter climbs, `R` readout falls to half; drift speed readout holds (reuse of drift S6's verified A-morph) | Wider wire, more current | **A** | 35–50 |
| S3 `shape_times_material` | R = ρL/A — R factorizes into geometry (yours) × ρ (the material's); PRIMARY aha | `oscillate/track` | three-phase geometry cycle on the clock: (1) L sweeps up-down, (2) A sweeps up-down, (3) constant-volume stretch (L×2 while A halves — `R` readout jumps ×4, the stock JEE trap drawn live); throughout, `R = ρL/A` readout dances while the `ρ` readout sits PINNED, never moving; formula overlay `R = ρL/A` lands only after phase 1 is watched (concrete → abstract); both sliders then live | Geometry moves, ρ doesn't | **L · A** | 40–55 |
| S4 `what_rho_is_made_of` | ρ = m/(ne²τ) — the material's identity is its n and τ, nothing geometric | `cycle-compare` | geometry frozen at home pose; material toggles copper → nichrome → copper on a ~6 s loop: lattice re-tints, collision flashes come far sooner, drift visibly collapses, `ρ` readout jumps 1.7×10⁻⁸ → ~1.1×10⁻⁶ Ω·m (~65×) and back; after one full loop the overlay `ρ = m/(ne²τ)` lands; then the material toggle is live | New metal, new ρ | **material** | 40–55 |
| S5 `heat_raises_rho` | metals resist MORE when hot — T↑ → lattice shakes → τ↓ → ρ↑; ρ_T = ρ₀(1+αΔT) (Rule 16a contrast beat) | `agitate` (coined: the driven variable is the vibration AMPLITUDE of the lattice — no seed archetype covers agitation-as-cause; oscillate/track is a readout tracking a mover, not thermal disorder growing) | on copper at home geometry, `T` auto-sweeps 20 °C → 220 °C (cause: thermometer climbs, lattice ions visibly shiver harder, collision flashes multiply) → beat → drift slows at the SAME V, meter falls, `ρ` readout climbs; overlay `ρ_T = ρ₀(1 + αΔT)` lands after the climb is watched; T slider then live | Hotter metal resists more | **T** | 40–55 |
| S6 `the_steady_alloy` | some materials are built flat — alloy α ~ 20× smaller; why manganin sets standards and nichrome heats reliably | `agitate` — **DECLARED CONTRAST PAIR with S5**; flip: the IDENTICAL T sweep, but on the alloy the ρ readout barely moves (α_manganin ≈ 10⁻⁵ vs copper's 3.9×10⁻³) | material switches to manganin (cue on its narrating sentence), then the same 20 → 220 °C sweep replays: lattice shivers just as hard, but ρ readout crawls — side caption pins copper's S5 end-value for contrast; T slider live | The alloy barely flinches | **T** (material pinned) | 35–50 |
| S7 `sandbox` | synthesis — recover R = ρL/A and ρ(T) live from any dial | `drag-sandbox` | teacher drives L, A, material, T; wire morphs, lattice responds, R/ρ/i readouts + counting plane + thermometer all live; home-pose wire persistent | All four dials yours | **ALL: L · A · material · T** | 0 / open |

Archetypes: `reshape-apparatus` ×2 (S1↔S2, declared pair — along-flow vs across-flow flip), `oscillate/track`, `cycle-compare`, `agitate` ×2 (S5↔S6, declared pair — metal-α vs alloy-α flip), `drag-sandbox` (explore only). Two coined archetypes, each with its one-line justification in-table.

Rule 32 per row: cause→effect ordering everywhere (geometry/material/T changes visibly FIRST, drift + readouts respond after a readable ~800 ms beat); ONE taught variable moves per guided state (S1 = L, S2 = A, S3 = geometry with ρ deliberately pinned, S4 = material, S5/S6 = T); delta column = the caption's opening cue; home pose = the same conductor strip + seeded electron layout as the drift/ohms family, S2 resumes from S1's end pose then returns to home for S3+ (32d); glow focal, exactly one per state: S1 `current_meter`, S2 `r_readout`, S3 `rho_readout`, S4 `lattice`, S5 `thermometer`, S6 `rho_readout`, S7 `r_readout` (all pending the Phase-B enum extension — json_author verifies each against the built enum).

Control-panel catches: panel built ONCE (`L` / `A` / `material` / `T` rows; `V` is NOT exposed — the supply is fixed so current changes are purely R's doing); rows shown per state via `visible_controls`; shared sliders keep position and row order. Recommended specs for physics_author to finalize: `L` 0.5–2 m, step 0.1, default 1; `A` 0.5–5 mm², step 0.25, default 1 (drift's row — keep identical spec); `T` 20–220 °C, step 10, default 20; `material` preset {copper, nichrome, manganin}. True exam values on the ρ readout: copper 1.7×10⁻⁸, nichrome ≈ 1.1×10⁻⁶, manganin ≈ 4.4×10⁻⁷ Ω·m; α: 3.9×10⁻³ / 1.7×10⁻⁴ / ~1×10⁻⁵ per °C. **Calibration FLAG for physics_author:** real copper at 1 m/1 mm² is R = 0.017 Ω — the meter cannot honestly read ~1.2 A off a 6 V supply. Keep the ρ readout TRUE (those are the numbers exams test) and let the engine's supply/meter scale be a declared demo adapter (the same fudge ohms_law's τ-adapter already made) so defaults land i ≈ 1.2 A, continuous with the siblings; the RATIOS (×2 on L, ×½ on A, ×4 on stretch, ×65 on nichrome, +39% per 100 °C on copper) are what must be numerically honest on screen.

Cue binding (scar rule): the S3 formula landing, S4 loop onset, S5 overlay landing, and S6 material switch bind to their narrating sentences via `scenario_cue` (SET_CUE_TIME channel), `at_ms` kept only as THE EYE fallback — never a bare hardcoded `at_ms`. All auto-sweeps clock-driven and deterministic under SET_TIME_FREEZE (engine-delta acceptance criterion).

## 4. Misconception confrontation plan (Rule 16a — contrast beats, no predict→reveal; EXACTLY 3 pivots)

| wrong belief (genuine, documented) | state | how the MOTION confronts it | `misconception_watch` |
|---|---|---|---|
| "Same material means same resistance — a longer or thinner wire of the same copper resists just the same" | S1 | nothing changes but shape: the identical copper, the identical battery, and the meter still falls to half as the wire stretches — geometry alone did it (S2 completes the beat from the area side) | `belief:` "resistance is fixed by the material; length and thickness don't matter" · `visual_counter:` the same copper wire, same battery — stretched to 2L the meter reads half, and the R readout doubles, live · `one_line_fix:` "Same copper, twice the wire — twice the resistance. Shape is half the story." |
| "R is the material's constant" (conflating R with ρ) | S3 | geometry cycles while TWO readouts sit side by side: R dances with every morph, ρ never moves a digit — the material's constant is ρ, and R = ρL/A is how shape wears it | `belief:` "R is a property of copper itself" · `visual_counter:` R readout swinging through the whole geometry cycle while the ρ readout stays pinned at 1.7×10⁻⁸ Ω·m · `one_line_fix:` "ρ belongs to the material; R = ρL/A belongs to this particular wire." |
| "Heating a metal helps it conduct — hot things carry current better" | S5 | the wrong expectation is given its chance and broken in motion: T climbs, and at the same voltage the drift visibly SLOWS and the meter falls — the shaking lattice cuts τ; ρ climbs on the readout | `belief:` "metals conduct better when hot" · `visual_counter:` thermometer up → lattice shivering harder → collision flashes sooner → drift slower, meter down, ρ readout up — all at fixed V · `one_line_fix:` "Heat shakes the lattice, collisions come sooner, τ shrinks — a hot metal resists MORE." |

**No other state carries a `misconception_watch`** (founder guardrail 2026-07-04 — S2, S4, S6, S7 are straightforward teaching). Deliberate boundary note for physics_author: S5's narration must NOT conflate this T-mechanism with ohms_law S5's V–I curve — one clause may bridge ("this is why the filament's line bent") but the taught variable here is T at fixed V, a different axis entirely. EPIC-C branches: NOT authored (EPIC-L-first directive 2026-06-10). No `mode_overrides` (Rule 20).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates; V1 ships zero authored deep-dives — Rule 18)

- **S3 `shape_times_material`** — the factorization abstraction (R vs ρ) plus the constant-volume stretch trick; the chapter's heaviest numerical trap territory.
- **S4 `what_rho_is_made_of`** — the microscopic formula ρ = m/(ne²τ); classic "why does n differ / why does τ differ / where did A and L go" confusion.
- **S5 `heat_raises_rho`** — the temperature mechanism; stock assertion-reason trap (metal vs semiconductor vs the filament's V–I curve, three things students braid together).

These coincide with the Pass-1 cliff/stuck states (Block 1) — no divergence to document. Un-authored deep-dive buttons route to the feedback form.

## 6. Drill-down clusters (3 candidates each; physics_author fleshes out trigger_examples)

- S3: `stretched_wire_r_scales_l_squared` (constant-volume stretch → R ∝ L², the ×4 trap), `r_vs_rho_which_is_material` (which one the data book lists and why), `units_of_resistivity` (why Ω·m, reading ρ off R = ρL/A).
- S4: `why_nichrome_resists_more` (alloy disorder → shorter τ, and n differences), `where_geometry_went` (how L and A cancel out of ρ = m/ne²τ), `rho_from_drift_chain` (full derivation from i = neAv_d + v_d = eEτ/m).
- S5: `metal_vs_semiconductor_temperature` (opposite signs of dρ/dT — n frozen in metals, n exploding in semiconductors; band theory itself deferred), `alpha_meaning_and_units` (reading α, the linear-approximation window), `filament_curve_explained` (closing the loop on ohms_law S5 — the bend WAS ρ(T)).

## 7. entry_state_map (v2.2)

```
entry_state_map:
  foundational:  STATE_1 → STATE_3   # "what is resistivity / R = ρL/A / does length matter"
  microscopic:   STATE_4             # "why do materials differ / ρ = m/ne²τ"
  temperature:   STATE_5 → STATE_6   # "resistance when heated / α / why nichrome-manganin"
  exploration:   STATE_7
```

PRIMARY aha (S3) is inside `foundational` ✓ (foundational-coverage rule satisfied, no exit-pill needed). json_author registers all four aspects in `ASPECT_VOCABULARY` + `CLASSIFIER_PROMPT` (verify whether `resistivity` already sits in `VALID_CONCEPT_IDS` as a placeholder before adding).

## 8. Prerequisites (advisory, Rule 23)

- `drift_velocity` (SHIPPED, Ch.3 #1, same renderer) — i = neAv_d, v_d = eEτ/m, τ, the lattice-collision picture S4/S5 ride on.
- `ohms_law` (SHIPPED, Ch.3 #2, same renderer) — R as V/I and the slope; this concept explains WHY R takes the value it does, and S5 retroactively explains ohms_law's filament bend.

## 9. Real-world anchor (Indian, plain English, physics-true)

> **[pre-Rule-35 — do NOT clone this anchor section. Anchors are UNIVERSAL/culture-neutral since 2026-07-10 (no country phrasing, festivals, brands, or asserted mains values). Clean clone targets: internal_resistance_skeleton.md, bar_magnet_in_uniform_field_skeleton.md.]**

**Primary:** open the back of a room heater — the coil that glows orange is nichrome, but the cord feeding it is copper, and the same current flows through both. The coil is long, thin, and made of a material whose ρ is about sixty-five times copper's, so almost all the resistance — and therefore almost all the heat — lives in the coil, while the copper cord stays cool in your hand. R = ρL/A, engineered on purpose: the coil maximizes all three levers, the cord minimizes them. **Secondary (S5/S6):** touch a multimeter to a cold filament bulb and you read a fraction of its rated resistance — the tungsten's ρ climbs several-fold as it heats to glowing; and the reason lab-standard resistance boxes are wound with manganin is exactly its near-zero α — a resistance that refuses to drift with the weather.

Why it hooks Class 11-12 JEE/NEET students: the heater coil is a physical object in most Indian homes every winter; "why nichrome for the element and copper for the wiring?" is a stock NCERT-derived board and NEET assertion-reason question, and the cold-bulb multimeter reading is checkable at home. Plain English, no Hinglish; no DC Pandey/HC Verma prose or figures.

## 10. Definition of Done (Gate 0 — zero TBDs)

- **(a) States:** the seven rows of §3, exactly as tabled.
- **(b) Symbol-label table** (every narrated quantity → exact on-canvas label; symbolic only, Rule 24):

| quantity | on-canvas label | where |
|---|---|---|
| wire length | `L` bracket along the wire + `L` slider row (m) | S1+ |
| cross-section | `A` bracket on the wire + `A` slider row (mm²) | S2+ |
| resistance | `R = ρL/A` live readout (Ω) | S1+ (readout; formula form of the label lands S3) |
| resistivity | `ρ` readout (Ω·m, scientific notation) | S3+ |
| the geometry law | `R = ρL/A` formula overlay | lands S3 after phase 1 watched, persists S4+ |
| the microscopic law | `ρ = m/(ne²τ)` formula overlay | lands S4 after one compare loop |
| material | preset row `copper / nichrome / manganin` + lattice tint | S4+ |
| relaxation time | `τ` tick between collision flashes (drift S4's element, reused) | S4/S5 |
| temperature | thermometer + `T` readout (°C) + `T` slider row | S5+ |
| the temperature law | `ρ_T = ρ₀(1 + αΔT)` overlay + per-material `α` tag | lands S5; α tag persists S6 |
| current | meter `i` (A) + counting plane (drift/ohms elements, reused) | S1+ |

- **(c) Right-hand-rule plan:** N/A — no magnetic directions in this concept (declared, not TBD).
- **(d) Motion plan:** all seven table rows in §3; every state animates on the state clock (Rule 26); thermal jitter never stops by engine design; all auto-sweeps deterministic under SET_TIME_FREEZE (Phase-B acceptance criterion).
- **(e) Modes:** conceptual-only (Rule 20) — no `mode_overrides`, no `epic_c_branches`.
- **(f) Assessment:** deferred this phase (conceptual-only directive — declared, not TBD). `misconception_watch` at exactly the 3 pivots of §4. `advance_mode`: `manual_click` S1–S6 + `interaction_complete` S7 = 2 distinct (Gate 12); never `wait_for_answer` / `narrative_socratic` / `pause_after_ms`.
- `scene_composition.primitives.length ≥ 3` per state (Gate 19), `focal_primitive_id` per state (the §3 glow list); on-canvas text lives in `particle_field_config.states.{label,caption,formula_overlay}` — scene_composition annotations are NOT rendered (known scar).
- TTS: author `teacher_script` EN now (25–55 words/guided state; symbols expanded in speech per Rule 30 — "resistivity rho", "resistance R", "cross-section A", "relaxation time tau", "R equals rho L by A"); EN + Telugu AUDIO rendered LAST, post-founder-approval (Rule 30f/30g — Telugu via the Sonnet-5 subscription sub-agent, never `tts:translate`); narration off by default.
- Registration: the 8 sites — `resistivity.json`, `concept_panel_config`, `CONCEPT_RENDERER_MAP` → particle_field, `VALID_CONCEPT_IDS` (check for placeholder first), `CLASSIFIER_PROMPT` + `ASPECT_VOCABULARY` (four aspects of §7), clusters migration `supabase_<date>_seed_resistivity_clusters_migration.sql` (authored-not-applied), NOT `PCPL_CONCEPTS` (particle_field ≠ PCPL — confirm exclusion, drift/ohms precedent). Mirror the siblings' `regeneration_variants` block shape.
- THE EYE clean (`visual:eyes -- resistivity` 7/7 ×2 + `smoke:visual-validator --dense`, dense frames read through S3's three-phase cycle, S4's compare loop, and both T sweeps) + zero new `engine_bug_queue` rows; eye-walker ∥ quality-auditor; founder hand-tests S7 trusted-drag sliders + the material toggle (THE EYE can't fire trusted events).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** `drift_velocity`: S4 breaks if the student doesn't carry the collision picture and τ — patch: S4's narration carries one bridging clause ("each electron flies free for a time tau between collisions — that tau, and how many carriers n the metal offers, are all a material is"); drift graduates read it as a one-second recap. `ohms_law`: S1 breaks if R means nothing — patch: S1's opening clause anchors it ("the R you read off the V–I slope — here is what sets its value"). The full ρ-from-drift derivation lives in the S4 deep-dive cluster `rho_from_drift_chain`, never in a guided beat.

**JEE-backwards trace.** Question: *"(i) A copper wire is stretched to double its length at constant volume — by what factor does R change? (ii) Why is a heater's element nichrome while its cord is copper? (iii) A metal's resistance rises when heated — explain microscopically, and state why manganin is used in standard resistance coils."* Needed: R ∝ L → S1; R ∝ 1/A → S2; the coupled ×4 stretch → S3 phase 3 (drawn live); ρ ordering copper vs nichrome + geometry levers → S4 + the anchor payoff; T mechanism (τ falls) → S5; near-zero α → S6. No missing piece; every fragment has a named state. (Board/competitive coverage deferred per the conceptual-only directive.)

**Misconception entry mapping (Rule 16, 16a-primary).** All three beliefs of §4 are confronted proactively in-path at S1 / S3 / S5 with `misconception_watch` + contrast-in-motion (no predict-pause). Planting-moment audit: S3's "ρ never moves" framing could itself plant "ρ is absolutely constant" — S3's narration carries one boundary clause ("at this steady temperature"), planting the S5 hinge without spoiling it; S5's "hot metals resist more" could over-generalize to ALL materials — S6's alloy beat plus one S5 clause ("for metals") bound it, and the semiconductor case is explicitly deferred to the S5 drill-down cluster `metal_vs_semiconductor_temperature`, never taught in-path (per the brief: not a band-theory concept). S2's "more lanes" framing could re-plant "area speeds electrons up" — countered as in drift S6 by the drift-speed readout visibly holding during the A sweep. No EPIC-C branches authored (16b fallback deferred until real students exist).

## Block 2 — Aha-moment designation

- **PRIMARY aha (S3):** *resistance factorizes — R = ρL/A: the shape part (L, A) is yours to engineer, and the material part (ρ) is nature's own number that no amount of cutting or stretching can touch.* The 10-year memory: "geometry dances, ρ doesn't."
- **SUPPORTING aha (S5, one only):** *a hot metal resists MORE — heat shakes the lattice, collisions come sooner, τ shrinks — the opposite of what "hot things flow better" intuition says.* (1 primary + 1 supporting = sweet spot.)
- **Cohesion check:** S5 serves the primary — it is ρ itself (never L or A) that moves with temperature, which is only a meaningful statement because S3 first separated ρ from geometry; S4's ×65 material jump is not a third aha, it is the primary's payoff (what "the material's own number" buys you); S6 is S5's boundary condition. Nothing stands alone.
- **Wrong-belief setup:** for the PRIMARY, S1–S2 earn the confident half-belief "so resistance is all about shape, then" — S3 breaks it by pinning ρ while shape dances (the aha is the factorization, not either factor). For the SUPPORTING, S1–S4's fixed-temperature world lets the incoming "heat helps flow" intuition arrive intact at S5, where the slowing drift breaks it.
- **Cross-reference:** deep-dive picks (S3, S4, S5) and the misconception pivots (S1, S3, S5) diverge at S1/S4 — documented: S1's pivot is cheap to confront in-beat (one motion suffices, no pre-built investment needed), while S4 is a stuck-point (the microscopic formula) without being a misconception pivot.

## Engine bug queue consultation (scar compliance)

DB query not run in the architect dispatch (architect has no Bash tool — same declared exception as the drift/ohms skeletons); directives read from the canonical seed mirrors + the drift/ohms forwarded scar lists:

- `teach_concrete_before_abstract_compare` (AR) → every formula lands AFTER its motion is watched: `R = ρL/A` after S3 phase 1, `ρ = m/(ne²τ)` after S4's first loop, `ρ_T = ρ₀(1+αΔT)` after S5's climb.
- `teach_coordinate_sim_with_graph` (AR) → every guided state drives ONE live parameter moving scene + readout in lockstep (L ↔ wire + meter + R; A ↔ width + plane + R; material ↔ lattice + ρ; T ↔ thermometer + lattice + ρ); no static readout ships.
- `teach_visual_must_match_narration` (AR, MAJOR) → every narrated claim is drawn: "half the current" = meter (S1); "ρ never moves" = pinned readout beside the dancing R (S3); "sixty-five times" = the ρ readout jump (S4); "collisions come sooner" = flash frequency (S5); "barely flinches" = the crawling readout with copper's end-value pinned alongside (S6).
- `teach_do_not_prespoil_a_later_reveal` (AR) → ρ readout gated to S3; material row gated to S4; thermometer + T gated to S5; α tag gated to S5/S6. S1–S2 carry only R + the meter.
- `teach_distinct_reference_lines_for_two_radii` (AR, analog) → the R readout and ρ readout are two permanently distinct, separately-styled instruments — the entire S3 aha depends on this distinction; likewise τ tick vs T thermometer never conflated.
- `teach_reveal_synced_to_narration` + `teach_show_quantity_live_when_named` (PA — forwarded to physics_author) → bind each formula landing, the S4 loop onset, and the S6 material switch to their narrating sentences via `scenario_cue`.
- `teach_color_each_element_by_its_own_sign` (PA — forwarded) → electrons keep the electron colour; each material gets a stable lattice tint reused consistently S4→S7.
- Glow-enum-closed scar → all seven `glow_focal` strings depend on the Phase-B enum extension; json_author verifies each against the built enum, never ships a non-keyed focal.
- Stale-panel / deriveStateMeta scar → new control rows (`material` toggle, `T`) must join the `#sliders` exclusion chain + deriveStateMeta handling in the SAME engine delta, else THE EYE false-fails — a failure there routes to `peter_parker:renderer_primitives`, don't bend the JSON.
- Pacing/pivot scars (word budget 25–55; `misconception_watch` at 3 pivots only) → applied throughout.

**Exceptions / FLAGS to quality_auditor and downstream:**
1. **Phase-B engine delta is a hard precondition** (top of this skeleton): L-morph, material presets, T/lattice-agitation model, ρ/R readouts + glow-enum extension, coupled-stretch cue, discrete-toggle control row. Route through quality_auditor to `peter_parker:renderer_primitives`; browser-verify (the ohms_law Phase-A precedent) before json_author starts.
2. **Calibration FLAG:** true ρ values on the readout + a declared demo supply/meter adapter so defaults stay continuous with the siblings' i ≈ 1.2 A; on-screen RATIOS must be numerically honest (§3 control-panel catches). physics_author finalizes the adapter and verifies with node arithmetic.
3. **Bug-queue query not run in-dispatch** (no Bash tool) — parent session should run `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts resistivity` before physics_author dispatch and forward any rows not mirrored above.
4. **S2 resumes from S1's end pose** (then home for S3+) — a declared 32d note, not a violation: the elongated wire IS the delta being answered.

**DC Pandey check:** Consulted chapter-scope only (Current Electricity ToC: resistivity / temperature-dependence / combination sections) against NCERT §3.6/§3.7 to confirm atomic boundaries — R = ρL/A + ρ = m/ne²τ + ρ(T) + alloy contrast here; conductivity/current density, semiconductors, superconductivity, combinations, power deferred. No teaching method, no example problem, no figure reference imported.

## Self-review (architect checklist)

Atomic claim one sentence ✓ · 7 states with documented deviation rationale ✓ · control table complete (teaches × archetype × distinct motion × delta × controls × budget); archetype repeats ONLY as the two declared contrast pairs (S1↔S2, S5↔S6) with named flips; two coined archetypes each justified; sandbox explore-last ✓ · Rule 32 plan (cause-first, one-variable-moves, delta-cue captions, home-pose continuity + declared S2 exception, one glow focal per state) ✓ · misconception_watch at exactly 3 genuine pivots with belief/visual_counter/one_line_fix ✓ · deep-dive picks (3) + 9 clusters ✓ · entry_state_map with foundational containing the PRIMARY aha ✓ · prerequisites advisory, both shipped same-renderer ✓ · anchor Indian/plain-English/physics-true (nichrome coil vs copper cord — same current, resistance engineered into the coil) ✓ · DoD zero TBDs (RHR declared N/A) ✓ · Block 1 + Block 2 complete ✓ · scars satisfied, 4 FLAGs declared ✓ · advance modes manual_click ×6 + interaction_complete (Gate 12) ✓ · conceptual-only (no mode_overrides, no EPIC-C) ✓ · no field_3d vocabulary ✓.

**Handoff:** Phase-B engine delta FIRST (via quality_auditor → `peter_parker:renderer_primitives`, browser-verified), then physics_author — finalize slider ranges/defaults + the demo-supply adapter (ratios honest, readouts true-valued), per-material {n, τ₀, α, tint} constant sets, the S3 three-phase cycle timing, cue bindings, and exact `text_en` scripts inside the per-state word budgets above.

---

**Files referenced:** `C:\Tutor\physics-mind\.agents\proof_run\ohms_law_skeleton.md`, `C:\Tutor\physics-mind\.agents\proof_run\drift_velocity_skeleton.md`, `C:\Tutor\physics-mind\.agents\proof_run\ohms_law_physics_block.md`, `C:\Tutor\physics-mind\src\data\concepts\ohms_law.json`, `C:\Tutor\physics-mind\src\data\concepts\drift_velocity.json`, `C:\Tutor\physics-mind\src\lib\renderers\particle_field_renderer.ts` (grep-verified: no resistivity/temperature/material primitives exist — hence the Phase-B flag).

---

## Physics Author Block

> physics_author output, 2026-07-08. Companion to `resistivity_skeleton.md` (architect). Handoff target: json_author. Siblings: `drift_velocity`, `ohms_law` (both SHIPPED/authored, same `particle_field_renderer.ts` engine family). **Phase-B engine delta is already BUILT and verified** — this block was authored against the shipped adapter code (`particle_field_renderer.ts` lines ~130-335, ~640-670), not a speculative design. No engine gap flagged.

### 0. Engine bug queue consultation + renderer-reality note

Prevention rules applied (from the architect's forwarded list §"Engine bug queue consultation" + physics_author's own standing contract):

- **`default_variables_only_first_var_merged`** -> `L`, `A`, `material`, `T` are ALL explicitly declared in `slider_controls` with their own `default` -- never rely on a first-var-only merge. `formula_anchor.constants` explicitly declares `e`, `m_e`, `n`, `T0_ref`, `V_supply` even though `e`/`m_e`/`n` numerically match the drift/ohms fallbacks -- never rely on a silent engine default.
- **Glow-target validity (verified in code this session, not just claimed)** -> `r_readout`, `rho_readout`, `lattice`, `thermometer`, `current_meter` are each read by a live `dimFor('<name>')` call in the shipped renderer (`particle_field_renderer.ts` lines 844/846/869/914/1075). All five glow_focal strings used below are confirmed real, not speculative.
- **Orphaned-annotation scar** -> on-canvas text lives ONLY in `particle_field_config.states.{label, caption, formula_overlay}` -- `epic_l_path.scene_composition` annotations are NOT rendered (same scar as drift_velocity/ohms_law). Do not "fix" a missing label there.
- **Caption/layout scar** -> every caption is the single <=5-word delta cue from the architect's §3 delta column, one line, no wrap.
- **teach_concrete_before_abstract_compare** -> `R = rho*L/A` lands only after S3 phase 1 is watched; `rho = m/(ne^2 tau)` lands only after S4's first compare loop; `rho_T = rho0(1+alpha*dT)` lands only after S5's climb is watched.
- **teach_do_not_prespoil_a_later_reveal** -> rho readout gated to S3 onward (`show_thermometer`/`material` rows likewise gated per §3 `visible_controls`); S1/S2 show only R + the current meter.
- **teach_distinct_reference_lines_for_two_radii (analog)** -> the `R` readout and `rho` readout are two permanently distinct, separately-styled instruments from S3 onward (confirmed in the shipped `updateReadouts()` -- `pm-ro-r` and `pm-ro-rho` are separate spans, each independently dimmable via their own `dimFor()` call) -- the entire S3 aha depends on this, and S6's "rho barely moves" needs it too.
- **Stale-panel / deriveStateMeta scar** -> the `material` toggle row and `T` row must already be in the `#sliders` exclusion chain per the shipped code (`sliderDefs()`, `hasSlider()`) -- confirmed present; no new gap.
- **Cue binding scar** -> the S3 formula landing, S4 loop onset (native, clock-driven -- no cue needed, see §4), and S6 `material_switch` are bound via `scenario_cue`/`material_switch.cue`, never a bare hardcoded `at_ms`.

**Renderer-reality note for json_author (inherited from drift_velocity/ohms_law):** this concept does NOT drive `i`/`R`/`rho` via `physics_engine_config.formulas`/PM_interpolate -- `particle_field_renderer.ts` computes them natively in engine JS via the shipped "resistivity adapter" (`condLength`/`condAreaM2`/`materialList`/`materialAt`/`rhoOf`/`tauFromRho`/`curL`/`curA`/`curMaterialIndex`/`curTemperature`/`curRho`/`realCurrent`/`realResistance`), reading `slider_controls.{L,A,material,T}` and `formula_anchor.constants.{e,m_e,n,T0_ref,V_supply}`. §2 below is documentation + rigor-check only; the JSON keys that actually carry the physics are `slider_controls` + `formula_anchor.constants` + the state flags (`length_autosweep`, `area_autosweep`, `geometry_cycle`, `material_cycle`, `material_switch`, `temperature_autosweep`), plus the standard `physics_engine_config` block authored as Zod-required documentation.

### 1. Variables

| symbol | name | unit | min | max | default | step | kind |
|---|---|---|---|---|---|---|---|
| `L` | conductor length | m | 0.5 | 2 | 1 | 0.1 | slider (live S1, S3, S7) |
| `A` | cross-section area | mm^2 | 0.5 | 5 | 1 | 0.25 | slider (live S2, S3, S7) -- identical spec to drift_velocity's `A` row |
| `material` | material index (0=copper, 1=nichrome, 2=manganin) | -- | 0 | 2 | 0 | 1 | slider, no unit, engine special-cases display to the material NAME (live S4, S7; pinned S6) |
| `T` | temperature | C | 20 | 220 | 20 | 10 | slider (live S5, S6, S7) |
| `R` | resistance | Ohm | -- | -- | derived: rho*L/A (engine: `realResistance()`) | -- | live readout, S1+ |
| `rho` | resistivity | Ohm*m | -- | -- | derived: `rhoOf(material, T)` | -- | live readout, S3+ |
| `i` | current | A | -- | -- | derived: `realCurrent()` | -- | live readout, S1+ (via current meter) |
| `e` | elementary charge | C | -- | -- | constant: 1.6e-19 | -- | locked, cancels algebraically (see §2) |
| `m_e` | electron mass | kg | -- | -- | constant: 9.11e-31 | -- | locked, cancels algebraically |
| `n` | free-electron number density | m^-3 | -- | -- | constant: 8.5e28 | -- | locked, cancels algebraically -- held fixed across ALL materials (declared simplification, see §6) |
| `T0_ref` | reference temperature for alpha | C | -- | -- | constant: 20 | -- | locked, matches the `T` slider's own default (rho = rho0 exactly at default) |
| `V_supply` | fixed hidden internal supply | V | -- | -- | constant: 0.0204 | -- | locked, NEVER shown to the student -- see §6 |

**JSON shape (`particle_field_config`):**
```json
"slider_controls": {
  "L": { "min": 0.5, "max": 2, "step": 0.1, "default": 1, "label": "Length L", "unit": "m" },
  "A": { "min": 0.5, "max": 5, "step": 0.25, "default": 1, "label": "Area A", "unit": "mm2" },
  "material": { "min": 0, "max": 2, "step": 1, "default": 0, "label": "Material" },
  "T": { "min": 20, "max": 220, "step": 10, "default": 20, "label": "Temperature T", "unit": "C" }
},
"materials": [
  { "id": "copper",   "label": "Copper",   "rho0": 1.7e-8, "alpha": 3.9e-3, "tint": "#CE7B4B" },
  { "id": "nichrome", "label": "Nichrome", "rho0": 1.1e-6, "alpha": 1.7e-4, "tint": "#B0BEC5" },
  { "id": "manganin", "label": "Manganin", "rho0": 4.4e-7, "alpha": 1.0e-5, "tint": "#C9A66B" }
],
"formula_anchor": {
  "constants": { "e": 1.6e-19, "m_e": 9.11e-31, "n": 8.5e28, "T0_ref": 20, "V_supply": 0.0204 }
}
```

Note on continuity with `drift_velocity`/`ohms_law`: `materials` is a top-level `particle_field_config` key (NOT nested under `slider_controls`), array order fixed copper/nichrome/manganin -- index IS the `material` slider value, engine reads it via `materialAt(idx)`.

### 2. Formulas -- derived, rigor-checked

**Macroscopic law (what the readouts show):** R = rho*L/A, and rho_T = rho0*(1 + alpha*(T - T0)) -- documentary; NOT how the engine computes `i`. The engine computes `i` from the microscopic bridge below, and R = rho*L/A falls out as a consequence (exactly as ohms_law's V=IR falls out of its own drift chain).

**Microscopic bridge (continuous with drift_velocity/ohms_law -- the same i = neAv_d chain, this time with L/A/material/T as the driven sliders instead of E/tau or V/R):**
```
rho(T) = rho0(material) * (1 + alpha(material) * (T - T0_ref))     [rhoOf]
tau  = m_e / (n * e^2 * rho)                                        [tauFromRho]
E    = V_supply / L                                                  [effEField, resistivity branch]
v_d  = e * E * tau / m_e                                             [realDriftVelocity]
i    = n * e * A * v_d                                               [realCurrent]
R    = V_supply / i        (algebraically = rho * L / A)             [realResistance]
```
Substituting tau into v_d and i, the `n`, `e`, `m_e` constants cancel exactly, leaving:
```
i = V_supply * A / (rho * L)   =>   R = V_supply / i = rho * L / A   exactly, for ANY choice of n/e/m_e
```
This is why `n`/`e`/`m_e` are declared as true physical constants but are NOT calibration levers -- the calibration lever is `V_supply` alone (§6). R and rho ratios on screen are true-valued independent of that choice -- confirmed algebraically and numerically below.

**Numerical verification (node, this session -- script recorded, reproducible):**
```
default       L=1,  A=1,   copper, T=20    -> rho=1.700e-8 Ohm*m, R=0.0170 Ohm, i=1.2000 A
S1 end        L=2,  A=1,   copper, T=20    -> i=0.6000 A   (exactly half -- R doubled, R proportional to L)
S2 end        A=2,  L=1,   copper, T=20    -> i=2.4000 A   (exactly double -- R halved, R proportional to 1/A)
S3 phase 3    L=2,  A=0.5, copper, T=20    -> R=0.0680 Ohm   (exactly 4x the default 0.0170 Ohm -- constant-volume stretch, R proportional to L^2, NOT L)
S4            copper -> nichrome, L=1,A=1,T=20 -> rho ratio = 64.706x  (1.1e-6 / 1.7e-8)
S5            copper, L=1,A=1, T:20->220   -> rho ratio = 1.780x (= 1 + 3.9e-3*200 exactly), i drop factor = 0.5618 (i falls to 56% of its 20 C value)
S6            manganin, L=1,A=1, T:20->220 -> rho ratio = 1.002x (= 1 + 1.0e-5*200 exactly) -- visually flat next to S5's 1.78x
```
All six verified with `node -e` this session, matching the numbers pre-supplied in the dispatch to the decimal. The `n`-cancellation claim (constants are documentation, not calibration) was verified by construction -- `n`, `e`, `m_e` never appear in the final `i = V_supply*A/(rho*L)` closed form.

**S3 constant-volume math (exam-correctness check, per dispatch §7):** at constant volume, L*A = L0*A0, so A = A0*L0/L. Then R = rho*L/A = rho*L*L/(A0*L0) = rho*L^2/(A0*L0) -- **R is proportional to L^2, not L**. At L: 1->2 m (a factor of 2), R scales by 2^2 = 4x, confirmed numerically above (0.0680/0.0170 = 4.000 exactly). **Narration must say "quadruples", never "doubles" -- this is the stock JEE trap the state exists to draw live.**

### 3. Constraints (physical invariants)

```
"constraints": [
  "R = rho * L / A exactly, at every (L, A, material, T) combination -- the geometric factorization is exact, not approximate",
  "rho depends ONLY on material and temperature, never on L or A -- geometry and material identity are independent factors",
  "at constant volume (L*A held fixed), R scales as L^2, not L -- a stretched-and-thinned wire's resistance quadruples when length doubles",
  "rho_T = rho0 * (1 + alpha*(T - T0_ref)) is a linear approximation valid over 20-220 C for these three metals/alloys; no phase transitions or superconducting/semiconducting regimes are modeled",
  "n (free-electron density) is held fixed across ALL three materials in this simulation as a declared teaching simplification -- the taught quantity is rho itself, never n or tau individually (real materials differ in BOTH n and tau; this concept isolates tau's temperature dependence only)",
  "V_supply is a fixed hidden internal constant (0.0204 V), never shown to the student -- the taught quantities are R, rho, and their RATIOS across states, which are numerically honest independent of V_supply's value"
]
```

### 4. Within-state motion timeline + per-state control spec (all t-windows relative to state-clock `PM_simTimeMs`, per Rule 26; engine timings below are the SHIPPED clock functions, not proposals)

**Top-level config (additive to drift_velocity/ohms_law's engine, already shipped):**
```json
"particles": { "count": 40, "thermal_speed": 2.2, "color": "#42A5F5" },
"lattice": { "count": 24, "color": "#90A4AE" },
"field_arrows": { "count": 5, "direction": "left_to_right", "color": "#FF9800" }
```

| state | t-window (state clock) | what animates | driven by | cause-to-effect gap (32a) | live control(s) |
|---|---|---|---|---|---|
| S1 `longer_chokes` | field/battery on at entry (continuous with drift/ohms home pose, i~1.2 A settled); `length_autosweep` engine-clock sweeps `L` 1->2 m over ms 500-3100 (`autoSweepLSimple`: start=500, dur=2600) -- CAUSE = wire visibly elongating; current meter + `R` readout track LIVE off `curL()` every frame, so the meter visibly falls in step as L grows, reaching 0.60 A (half) by ms 3100 -- EFFECT, continuous, not a separate beat (the readout IS the effect, no artificial gap needed beyond the sweep's own ramp); teacher may grab `L` after | `length_autosweep` (deterministic under SET_TIME_FREEZE) then live L slider | the sweep's own ramp (2600 ms) IS the readable cause-to-effect window -- meter falls continuously as L visibly grows, never a jump-cut | L |
| S2 `wider_frees` | resumes from S1's end pose (L=2, elongated -- 32d declared exception, architect-flagged); `area_autosweep` sweeps `A` 1->2 mm2 over ms 500-3100 (`autoSweepASimple`, identical timing shape) -- CAUSE = wire visibly thickening; counting-plane flash rate + `R` readout track live, R falling continuously to its new value (R at L=2,A=2 is exactly the S1-default R, i.e. current climbs back toward 1.2 A as A doubles from the S1 end-state) -- EFFECT, continuous | `area_autosweep` then live A slider | continuous sweep-ramp, same shape as S1 | A |
| S3 `shape_times_material` | geometry resets to home pose (L=1, A=1) on entry; `geometry_cycle` runs the shipped 3-phase clock (`geometryPhaseLA`, 12000 ms period, repeats): phase 1 (ms 0-4000) L sweeps 1->2->1 via sin easing, phase 2 (ms 4000-8000) A sweeps 1->2->1, phase 3 (ms 8000-12000) coupled constant-volume stretch (L up, A down inversely -- R visibly spikes to 4x mid-phase); `R` readout dances through all three phases while `rho` readout (visible from entry, glow_focal target) sits VISUALLY PINNED at 1.700e-8 Ohm*m throughout -- this is the state's whole point; formula_overlay `R = rho*L/A` lands via `scenario_cue` bound to the sentence that names it, timed to land just after phase 1 completes (~ms 4200) so the abstraction follows the first concrete demonstration (teach_concrete_before_abstract_compare); L and A sliders live throughout (grabbing either freezes that axis's auto-sweep per `userTouched`) | `geometry_cycle` (deterministic, SET_TIME_FREEZE-safe) then live L/A sliders | phase-internal cause(geometry morph)->effect(R readout) is continuous per-frame, same as S1/S2; the rho-pinned CONTRAST is the real payload, always visible, no gap needed | L and A |
| S4 `what_rho_is_made_of` | geometry frozen at home pose (L=1, A=1, no controls this state); `material_cycle` runs the shipped `autoMaterialIndex()` clock (6000 ms period: ms 0-3000 = copper (idx 0), ms 3000-6000 = nichrome (idx 1), loops) -- CAUSE = lattice re-tint + collision-flash rate visibly jumping at each 3000 ms boundary (nichrome's shorter tau means far more frequent collision flashes -- this IS the visible cause, not merely a colour change); `rho` readout jumps 1.700e-8 -> 1.100e-6 Ohm*m (64.7x) and back in lockstep, continuous with the tint-swap -- EFFECT is simultaneous with the tint because both are direct functions of `curMaterialIndex()`, but the readable "beat" is the flash-RATE change, which the eye registers over the first ~500-800 ms of each new segment as flashes visibly speed up/slow down; formula_overlay `rho = m/(n e^2 tau)` lands via `scenario_cue` after one full 6000 ms loop is watched; `material` slider live after (grabbing it pins `curMaterialIndex()` via `userTouched`) | `material_cycle` (deterministic) then live material slider | tint-swap is instant (a material property, not a morph) but the flash-RATE settling into its new frequency reads as the effect beat over ~500-800ms -- Rule 32a satisfied via the settling behavior, not a hard pause | material |
| S5 `heat_raises_rho` | geometry + material frozen at home pose (copper, L=1, A=1); `temperature_autosweep` sweeps `T` 20C->220C over ms 500-3300 (`autoSweepT`: start=500, dur=2800) -- CAUSE = thermometer column visibly rising + lattice-ion jitter amplitude visibly growing (`drawLattice`'s `thermJitter` maps T linearly 20->220 to jitter 0->3.0 px, so the shiver is continuously visible as T climbs, not a jump); current meter + `rho` readout track live, rho climbing continuously to 1.78x its start value by ms 3300 (current correspondingly falls to 56% of its 20C value) -- EFFECT, continuous with the sweep's own ramp; formula_overlay `rho_T = rho0(1+alpha*dT)` lands via `scenario_cue` after the climb is watched (~ms 3400); `T` slider live after | `temperature_autosweep` then live T slider | 2800 ms sweep ramp; thermometer+jitter (cause) visibly precede the meter/rho fall (effect) because the jitter maps directly off T while the current only responds through the tau chain each frame -- same "continuous but ordered" pattern as S1/S2/S5's siblings | T |
| S6 `the_steady_alloy` | on entry, `material_switch` cue (bound via `scenario_cue` to the narrating sentence naming the swap) fires the one-shot switch copper(0)->manganin(2) -- CAUSE = lattice re-tints to manganin's tint, `rho` readout jumps from copper's 1.700e-8 down to manganin's 4.400e-7 Ohm*m; after a readable ~600-800 ms beat post-cue, `temperature_autosweep` replays the IDENTICAL 20C->220C sweep (same `autoSweepT` timing) -- thermometer rises, lattice shivers just as hard as S5's copper did (same jitter-vs-T mapping, material-independent), but `rho` readout crawls from 4.400e-7 to only 4.409e-7 Ohm*m (1.002x) -- a side caption pins copper's S5 end-ratio (1.78x) for direct on-screen contrast; `T` slider live after the sweep (material stays pinned -- not user-editable this state, per visible_controls) | `material_switch` cue then `temperature_autosweep` then live T slider | ~600-800 ms beat between the material-switch cue firing and the T sweep starting (so the swap itself is registered before the second cause begins) | T (material pinned) |
| S7 `sandbox` | duration 0/open; teacher drives L, A, material, T; wire morphs, lattice re-tints and re-jitters, thermometer tracks, R/rho/i readouts + counting plane all live and continuous; home-pose wire persistent from S6's end layout | teacher, all sliders | n/a -- explore exempt from 32a/32b | ALL: L, A, material, T |

**32b confirmation:** S1=L only (A/material/T frozen), S2=A only (L pinned at S1's end value per the declared 32d resume, material/T frozen), S3=L and A together (both ARE the single taught idea -- geometry vs material -- material/T frozen), S4=material only (geometry/T frozen), S5=T only (geometry/material frozen at copper), S6=T only (material pinned at manganin post-switch, geometry frozen). S7 is the explore exception.

**Cue binding table (scar rule -- every cue bound to a narrating sentence via `scenario_cue`, `at_ms`/timer kept only as THE EYE fallback):**

| cue / flag | bound to sentence | fallback timing |
|---|---|---|
| S3 formula_overlay landing (`R = rho*L/A`) | s3_3 (the sentence that names the formula, after phase 1 is described) | ~4200 ms (post phase-1 completion) |
| S4 formula_overlay landing (`rho = m/(n e^2 tau)`) | s4_3 (after one full compare loop is narrated) | ~6000 ms |
| S5 formula_overlay landing (`rho_T = rho0(1+alpha*dT)`) | s5_3 (after the climb is described) | ~3400 ms |
| S6 `material_switch.cue` (`{cue:'switch_to_manganin', from:0, to:2}`) | s6_1 (the sentence naming the swap) | ~600 ms |

### 5. Board-mode mark scheme

**Deferred.** Conceptual-only directive active (Rule 20 suspension) -- SKIP entirely, no `mode_overrides` authored. Declared per architect §10(e), not a TBD.

### 6. Drill-down cluster phrasings (5 real student-voice phrases x 9 clusters, from architect §6)

**S3 -- `stretched_wire_r_scales_l_squared`**: "if I stretch a wire to double length does R just double" - "why does resistance become four times not two times" - "whats different about stretching vs just having a longer wire" - "does the volume staying same change the answer" - "why cant I just use R proportional to L here"

**S3 -- `r_vs_rho_which_is_material`**: "which one is actually the material property R or rho" - "why does R change but rho stays exactly the same" - "if I cut the wire in half does rho change" - "is rho like density for resistance" - "so R is not really a property of copper then"

**S3 -- `units_of_resistivity`**: "why is resistivity measured in ohm meter" - "how do you get rho from R if you know L and A" - "whats the physical meaning of ohm times meter" - "why does area go in the bottom and length on top" - "is rho ever negative or can it only be positive"

**S4 -- `why_nichrome_resists_more`**: "why does nichrome resist so much more than copper" - "is it the atoms themselves or something else that makes nichrome different" - "does nichrome have fewer free electrons than copper" - "why would an alloy resist more than a pure metal" - "is tau different or is n different between the two"

**S4 -- `where_geometry_went`**: "if rho equals m over ne squared tau where did L and A go" - "does rho depend on the wires length at all" - "why does the microscopic formula not have length or area in it" - "so is rho only about what atoms the wire is made of" - "how is rho the same for a thick wire and a thin wire of the same metal"

**S4 -- `rho_from_drift_chain`**: "how do you actually derive rho from the drift velocity stuff" - "wheres the connection between i equals neAv_d and rho" - "how does e squared tau over m become resistivity" - "is rho derived the same way R was in the ohms law chapter" - "how is tau related to rho exactly"

**S5 -- `metal_vs_semiconductor_temperature`**: "does every material get more resistive when heated" - "why do semiconductors do the opposite of metals when heated" - "is n changing too when a metal heats up or just tau" - "why does this only apply to metals" - "whats different about semiconductors that flips the sign"

**S5 -- `alpha_meaning_and_units`**: "what does alpha actually represent physically" - "why is alpha different for every material" - "what are the units of alpha in this formula" - "does the linear formula work for any temperature range" - "is alpha the same as a thermal expansion coefficient"

**S5 -- `filament_curve_explained`**: "is this why the bulb graph from ohms law bent upward" - "so the filament bending was really about rho changing with heat" - "why didnt we call it rho then in the ohms law chapter" - "is a hot filament like the hot copper wire here" - "does the filaments material even matter or just its temperature"

### 7. `text_en` narration per state (word budgets verified this session; symbols expanded per Rule 30)

### STATE_1 `longer_chokes` -- 44 words -- glow_focal: `current_meter`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s1_1 | "Same copper wire, same battery -- watch what happens when it simply gets longer." | field | -- |
| s1_2 | "As the wire stretches from one metre to two, the current meter falls -- all the way to half." | current_meter | -- |
| s1_3 | "Nothing about the copper changed. Length alone doubled the resistance R." | current_meter | -- |

### STATE_2 `wider_frees` -- 42 words -- glow_focal: `r_readout`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s2_1 | "Now widen this same wire instead of stretching it." | field | -- |
| s2_2 | "As the cross-section area A grows, more lanes open for the drifting electrons, and the current climbs back up." | current_meter | -- |
| s2_3 | "Resistance R has exactly halved -- area and resistance move opposite ways." | r_readout | -- |

### STATE_3 `shape_times_material` -- 53 words (PRIMARY aha) -- glow_focal: `rho_readout`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s3_1 | "Watch the wire's shape dance -- length stretches, then area widens, then both together." | field | -- |
| s3_2 | "The resistance R readout swings through every change, but resistivity rho never moves a single digit." | rho_readout | -- |
| s3_3 | "That's the law: R equals rho L over A -- shape is yours to engineer, rho is the material's own fixed number." | formula | -- |
| s3_4 | "Stretch the wire to double length at constant volume and R doesn't double -- it quadruples." | r_readout | -- |

### STATE_4 `what_rho_is_made_of` -- 50 words -- glow_focal: `lattice`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s4_1 | "Keep the shape frozen and swap the metal itself -- copper, then nichrome." | lattice | -- |
| s4_2 | "Nichrome's lattice ions collide with electrons far more often, and resistivity rho jumps about sixty-five times higher." | rho_readout | -- |
| s4_3 | "Rho equals m over n e squared tau -- a material's identity is its electron count n and its collision time tau, nothing geometric." | formula | -- |

### STATE_5 `heat_raises_rho` -- 52 words -- glow_focal: `thermometer`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s5_1 | "Heat this copper wire from room temperature up toward two hundred twenty degrees." | thermometer | -- |
| s5_2 | "The lattice ions shiver harder, collisions come sooner, and the current visibly slows -- resistivity rho climbs by nearly eighty percent." | thermometer | -- |
| s5_3 | "Heat shakes the lattice, relaxation time tau shrinks, and rho rises: rho at T equals rho-zero times one plus alpha delta T." | formula | -- |

### STATE_6 `the_steady_alloy` -- 47 words -- glow_focal: `rho_readout`
| id | text_en | glow | scenario_cue |
|---|---|---|---|
| s6_1 | "Switch the metal to manganin, an alloy built for stability, and repeat the identical heat sweep." | lattice | switch_to_manganin |
| s6_2 | "The lattice shivers just as hard as copper did, but resistivity rho barely crawls -- nowhere near copper's climb." | rho_readout | -- |
| s6_3 | "This near-zero alpha is why standard resistance coils and heater elements trust manganin and nichrome, not copper." | rho_readout | -- |

### STATE_7 `sandbox` -- 17 words (explore-exempt) -- glow_focal: `r_readout`
| id | text_en | glow |
|---|---|---|
| s7_1 | "All four dials are yours -- length, area, material, temperature. Watch R and rho respond live." | r_readout |

### 8. `misconception_watch` blocks (Rule 16a -- exactly 3 pivots, refined to verified numbers)

**S1** -- `belief:` "resistance is fixed by the material; length and thickness don't matter" - `visual_counter:` the same copper wire, same fixed supply -- stretched from 1 m to 2 m, the current meter falls to exactly half and the R readout doubles, live, on screen - `one_line_fix:` "Same copper, twice the wire -- twice the resistance R. Shape is half the story."

**S3** -- `belief:` "R is a property of copper itself" (conflating R with rho) - `visual_counter:` the R readout swinging through the full three-phase geometry cycle (including the x4 constant-volume spike) while the rho readout sits pinned at 1.700e-8 Ohm*m the entire time, both instruments visible simultaneously - `one_line_fix:` "Rho belongs to the material; R = rho L over A belongs to this particular wire's shape."

**S5** -- `belief:` "metals conduct better when hot" - `visual_counter:` thermometer climbing -> lattice visibly shivering harder -> collision flashes coming sooner -> drift slowing -> current meter falling -> rho readout climbing 1.78x, all at the same fixed supply - `one_line_fix:` "Heat shakes the lattice, relaxation time tau shrinks -- a hot metal resists MORE, not less."

**No other state carries a `misconception_watch`** (S2, S4, S6, S7 are straightforward teaching, per the founder guardrail -- matches architect §4).

### 9. Self-review (physics_author checklist)

- [x] Every symbol in the skeleton's state narratives (L, A, R, rho, material, T, tau, i) appears in §1 variables.
- [x] No `radians()` needed -- no angles in this concept.
- [x] Every state's live control(s) match the architect's §3 control table exactly: S1=[L], S2=[A], S3=[L,A], S4=[material], S5=[T], S6=[T] (material pinned), S7=ALL.
- [x] No `variable_overrides` block needed in the Zod-schema sense -- geometry/material/T "special values" are handled natively by the engine's `curL`/`curA`/`curMaterialIndex`/`curTemperature` clock-vs-slider logic (autosweep/cycle/switch state flags), not by a static override; documented per state in §4.
- [x] Mark scheme: N/A, declared per Rule 20 (not a TBD).
- [x] 45 drill-down phrases (5 x 9 clusters), plain-English student voice, no Hinglish, no teacher-prose.
- [x] 6 constraints, short and factual, including the S3 constant-volume R proportional to L^2 exam-trap invariant.
- [x] Numerical sanity checked via `node -e` this session, independently re-derived (not just copy-checked against the dispatch): default i=1.2000A/R=0.0170 Ohm, S1 i=0.6000A (exact half), S2 i=2.4000A (exact double), S3 constant-volume R=0.0680 Ohm (exactly x4 -- confirms "quadruples" not "doubles"), S4 rho ratio=64.706x, S5 rho ratio=1.780x (i falls to 0.5618x), S6 rho ratio=1.002x. All six match the dispatch's pre-supplied numbers to 3+ significant figures.
- [x] Within-state motion timeline written for all 7 states, each a pure function of the state clock (Rule 26), grounded in the ACTUAL shipped clock functions (`autoSweepLSimple`, `autoSweepASimple`, `geometryPhaseLA`, `autoMaterialIndex`, `autoSweepT`) -- no invented timing.
- [x] Rule 32 sequencing verified per state: S1/S2/S5 = continuous sweep-ramp cause-to-effect (meter/readout tracks the morph in real time, no jump-cut); S3 = rho-pinned contrast always visible; S4 = tint-swap instant but flash-rate settling reads as the effect beat (~500-800ms); S6 = explicit ~600-800ms beat between the material-switch cue and the T sweep start. Only the taught variable moves per guided state (32b) -- confirmed S1=L, S2=A, S3=L and A, S4=material, S5=T, S6=T (material/geometry frozen each time).
- [x] Word budget verified: S1=44, S2=42, S3=53, S4=50, S5=52, S6=47 (all inside the 35-55 EN word band); S7=17 (open/explore-exempt).
- [x] Engine bug queue consulted (forwarded scars from architect §"Engine bug queue consultation" + physics_author's own list); all satisfied; no new exceptions beyond the pre-flagged S2 32d resume-pose (already documented by architect, re-confirmed here).
- [x] DC Pandey check: no formula, explanation, or example problem imported. R=rho*L/A and rho=m/(n e^2 tau) built strictly from the drift_velocity/ohms_law microscopic chain (Newton's laws + the existing shipped derivation) plus the linear rho(T) approximation from first-principles Drude reasoning; NCERT §3.6/§3.7 scope only, per architect's Block-1 consultation.

### 10. Handoff notes for json_author

1. Slider specs are LOCKED and verified: `L` 0.5-2m step 0.1 default 1, `A` 0.5-5mm2 step 0.25 default 1 (identical to drift_velocity's A row -- reuse verbatim), `material` 0-2 step 1 default 0 (no unit; engine displays the material NAME automatically, do not author a custom label formatter), `T` 20-220C step 10 default 20 -- all four give i=1.2000A at S1/S2/S3/S7 defaults, exactly continuous with drift_velocity/ohms_law's shipped operating point.
2. `materials` array is a TOP-LEVEL `particle_field_config` key, exactly 3 entries, order fixed copper(0)/nichrome(1)/manganin(2) -- this order IS the material slider's index mapping, verified against the shipped `materialAt(idx)`.
3. State flags to author verbatim per §4/architect §3: S1 `length_autosweep:true`, S2 `area_autosweep:true`, S3 `geometry_cycle:true`, S4 `material_cycle:true`, S5 `temperature_autosweep:true`, S6 `material_switch:{cue:'switch_to_manganin', from:0, to:2}` + `temperature_autosweep:true`, S5/S6/S7 `show_thermometer:true`, `show_current_meter:true` on all states.
4. Cue: `switch_to_manganin` bound to s6_1 via `scenario_cue`, ~600ms fallback `at_ms` for THE EYE only.
5. S2 resumes from S1's end pose (L=2, elongated) then S3 resets to home (L=1,A=1) -- a declared 32d exception per the architect, not a continuity bug; do not "fix" it.
6. `V_supply` (0.0204V, hidden) and `n`/`e`/`m_e` (true constants, algebraically cancel) are NOT sliders and NEVER appear in any on-canvas label -- only R, rho, and their state-to-state RATIOS are shown, per §6 constraints.
7. Glow-target strings `r_readout`/`rho_readout`/`lattice`/`thermometer`/`current_meter` are CONFIRMED wired in the shipped renderer (verified via `dimFor()` call-site grep this session, lines 844/846/869/914/1075 of `particle_field_renderer.ts`) -- no enum-mismatch risk for json_author to re-check.
8. No engine gap to flag -- this is the first resistivity dispatch authored entirely against ALREADY-SHIPPED engine code, unlike ohms_law's post-hoc-verified Phase A or drift_velocity's flagged gaps.
