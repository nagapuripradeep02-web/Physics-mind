# drift_velocity — architect skeleton (Rule 31/32, word-budget native)

> **Pipeline position:** architect output → physics_author. Chapter 3 — Current Electricity (NCERT Class 12 Part 1, §3.5). **FIRST concept of Ch.3 and FIRST concept on the `particle_field` renderer (2D p5.js)** — authored strictly against the particle_field capability surface (`particle_field_config`): no field_3d vocabulary anywhere downstream.
> Shape cloned from `.agents/proof_run/faraday_law_induction_skeleton.md` (arc/controls/archetype discipline only — narration here is budgeted 25–55 EN words/state per Rule 31a; faraday's counts predate the budget).

## 1. Atomic claim

This concept teaches that electric current is a tiny collective drift (v_d = eEτ/m, ~10⁻⁴ m/s) superposed on enormous random thermal motion (~10⁵ m/s), and that i = neAv_d. It does not cover the resistivity derivation ρ = m/ne²τ or Ohm's law (deferred to `origin_of_resistivity`), mobility μ = v_d/E (deferred to `electron_mobility`), or temperature dependence of resistance (deferred to `resistivity_temperature_dependence`).

## 2. State count + arc (7 — complexity-driven, documented)

Sanity-check note: the §5 table puts a "medium" concept at 5–6 states. Drift velocity lands at 7 because it carries TWO formulas (v_d = eEτ/m and i = neAv_d), the chapter's heaviest misconception (light-speed electrons — deserving its own contrast beat, the PRIMARY aha), and the 10⁹ speed-ratio paradox that must be built (S1–S2) before it can be resolved (S3). Not padded: every state below has a distinct archetype and a unique delta; nothing merges without losing a beat.

Guided distinct-motion beats → combined explore last. The hook MOVES (thermal chaos at full speed from frame 1 — this renderer cannot be static, and S1 exploits that). **No `teaching_method` fields on S1–S6** (Rule 31 default: straightforward motion beat); S7 = `exploration_sliders`.

| state | one-line purpose |
|---|---|
| S1 `thermal_chaos` | Idle wire: electrons already tear around at ~10⁵ m/s — net displacement exactly zero |
| S2 `field_on_drift` | Switch E on (cause-first): a tiny collective drift, opposite to E, rides on the chaos |
| S3 `instant_everywhere` | **PRIMARY aha:** the FIELD fills the wire at near light speed — every electron everywhere drifts at once; each electron merely crawls |
| S4 `collision_clock` | One spotlighted electron: kicked by E for time τ between collisions → v_d = eEτ/m |
| S5 `field_scales_drift` | v_d ∝ E — sweep the field, watch the labelled v_d arrow track it |
| S6 `current_count` | i = neAv_d — count crossings per second at a plane; widen A, current climbs, crawl speed doesn't |
| S7 `sandbox` | Explore: all three dials (E, τ, A), all readouts live |

## 3. Per-state choreography + control plan — THE CONTROL TABLE (Rule 31 — first design artifact)

| state | teaches | archetype | DISTINCT motion (pure fn of state clock; thermal jitter never stops) | delta (→ ≤5-word caption cue, Rule 32c) | live control(s) | narration budget (EN words) |
|---|---|---|---|---|---|---|
| S1 `thermal_chaos` | random thermal motion, huge speed, zero NET transport | `null-result-hold` | full-speed zigzag walk of the whole cloud; a labelled net-shift marker ("net shift = 0") stays pinned at the wire's centre the entire dwell; `field_visible: false`, `drift_direction: 'none'`; readout "u ≈ 10⁵ m/s" | Fast everywhere, going nowhere | **none** (watch) | 35–45 |
| S2 `field_on_drift` | applying E superposes a tiny drift opposite to E | `flow-along-path` | `cue: field_on` — E arrows fade in across the conductor (600 ms, the CAUSE) → 900 ms readable beat → drift ramps (800 ms, the EFFECT): the cloud begins streaming slowly opposite the arrows, zigzag intact; twin readouts land: "u ≈ 10⁵ m/s · drift ≈ 10⁻⁴ m/s" | Field on — drift begins | **none** (guided) | 40–55 |
| S3 `instant_everywhere` | the signal is the FIELD (≈ light speed), not the electrons — instant response, crawling carriers (PRIMARY aha, Rule 16a contrast beat) | `cycle-compare` | field toggles OFF→ON→OFF on a ~6 s loop: at each ON, arrows appear along the ENTIRE wire in the same frame and every electron at both ends picks up the bias simultaneously; one highlighted electron (`highlight_particle: true`, `dim_others: false` — population stays visible) crawls only a few pixels across the whole loop; overlay: "field: instant · electron: ≈ 14 h to cross the wire" | Field arrives, not electrons | **none** (guided) | 40–55 |
| S4 `collision_clock` | mechanism: E accelerates the electron for time τ between collisions → v_d = eEτ/m | `translate-through` | close read: `highlight_particle: true` + `dim_others: true`; the spotlighted electron speeds up slightly along −E during each free flight, a collision flash resets it; τ labelled between successive flashes; AFTER the motion is watched, the formula overlay v_d = eEτ/m lands (concrete → abstract); longer τ on the slider → visibly longer flights, steeper bias, electron makes it across a marked span | One electron, kicked between collisions | **τ** (tau, fs) | 40–55 |
| S5 `field_scales_drift` | v_d ∝ E (linear scaling) | `oscillate/track` | E auto-sweeps low→high→low until the teacher grabs the slider; field arrows brighten with E while the labelled v_d drift arrow (`show_drift_arrow: true`) grows/shrinks and the live v_d = eEτ/m readout tracks — one parameter drives scene + readout in lockstep; τ and A frozen | Double the field, double drift | **E** (V/m) | 25–40 |
| S6 `current_count` | i = neAv_d — current is crossings per second, and area multiplies carriers, not speed | `densify/rarefy` | cross-section A auto-sweeps narrow→wide; a marked counting plane flashes at each electron crossing; the meter (`show_current_meter: true`, i = neAv_d) climbs with A while the v_d readout stays FIXED — more lanes, not faster cars; small "i →" vs "electrons ←" direction pair | Crossings per second = current | **A** (mm²) | 40–55 |
| S7 `sandbox` | synthesis — recover every relation live | `drag-sandbox` | teacher drives E, τ, A; drift arrow, v_d readout, counting plane, current meter all live; spotlight electron available | All three dials yours | **ALL: E · τ · A** (`show_sliders: true`) | 0 / open |

All seven archetypes distinct — no repeat, so no contrast-pair declaration needed; `drag-sandbox` on the explore state only. Rule 32 honored per row: cause→effect ordering is the S2 engine cue (arrows 600 ms → 900 ms beat → drift 800 ms) and the S3 loop onsets; one taught variable moves per guided state (S5 = E only, S6 = A only, S4 = τ only); delta column doubles as the caption's opening cue; home pose = the same conductor strip + same seeded electron layout + fixed lattice every state (engine reseeds identically — 32d); glow focal, exactly one per state: S1 `electrons`, S2 `field`, S3 `electrons`, S4 `formula`, S5 `drift_arrow`, S6 `current_meter`, S7 `current_meter`.

Control-panel catches: panel built ONCE (`E` / `tau` / `A` rows); rows shown per state via `visible_controls`; a shared slider keeps the same screen position and row order; S1–S3 having zero controls is fine (motion ≠ interactivity). Recommended slider specs for physics_author to finalize (defaults must land physics-true: v_d ~10⁻⁴ m/s, i ~1 A): `E` 0–0.1 V/m, step 0.005, default 0.02; `tau` 5–50 fs, default 25; `A` 0.5–5 mm², default 1; with n = 8.5×10²⁸ m⁻³ (copper) the defaults give v_d ≈ 8.8×10⁻⁵ m/s and i ≈ 1.2 A.

Cue binding (scar rule): the S2 `field_on` cue and the S3 loop's first onset are bound to their narrating sentence via `scenario_cue` on that `tts_sentence` (SET_CUE_TIME channel), keeping `at_ms` only as THE EYE fallback — never a bare hardcoded `at_ms` (desyncs after pacing trims).

## 4. Misconception confrontation plan (Rule 16a — contrast beats, no predict→reveal; 3 pivots only)

| wrong belief (genuine, documented) | state | how the MOTION confronts it |
|---|---|---|
| "Electrons sit still until the battery pushes them" (and its twin: "all that motion must be current") | S1 | electrons visibly tear around at ~10⁵ m/s in an idle wire while the net-shift marker stays pinned at 0 the whole beat — huge speed, zero transport |
| **"Electrons race through the wire near light speed when you flip a switch"** (PRIMARY) | S3 | the wrong expectation's consequence is SHOWN: if the signal were the electrons, the crawling spotlighted electron sets the timescale — "≈ 14 h to cross the wire" on the overlay; the real physics plays beside it in the same loop: arrows fill the whole wire in one frame and every electron everywhere starts drifting that instant |
| "v_d is how fast an electron actually moves" | S4 | the spotlighted electron's actual motion is a violent zigzag at u ≈ 10⁵ m/s; v_d appears as the tiny average bias per collision cycle — two labelled speeds on screen, never conflated |

Each carries a `misconception_watch` entry (`belief` + `visual_counter` + `one_line_fix`). **No other state carries one** (founder guardrail 2026-07-04 — S2, S5, S6, S7 are straightforward teaching). EPIC-C branches: NOT authored (EPIC-L-first directive 2026-06-10; none requested).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates; V1 ships zero authored deep-dives — Rule 18)

- **S3 `instant_everywhere`** — the chapter's historic stuck-point; three distinct confusion phrasings documented (signal speed vs electron speed vs "electricity speed").
- **S4 `collision_clock`** — the mathematical abstraction (τ, averaging over collisions → eEτ/m); classic "why τ and not 2τ / why average" confusion territory.
- **S6 `current_count`** — the i = neAv_d plumbing (what n means, why A multiplies current but not speed) is where numericals go wrong.

Flags are future-investment markers; un-authored deep-dive buttons route to the feedback form.

## 6. Drill-down clusters (3 candidates each; physics_author fleshes out trigger_examples)

- S3: `field_travels_not_electrons` (what actually moves at light speed), `why_bulb_lights_instantly` (the switch-to-lamp timeline), `signal_speed_vs_electron_speed` (three speeds: signal ~10⁸, thermal ~10⁵, drift ~10⁻⁴).
- S4: `relaxation_time_meaning` (what τ is and is not), `collision_reset_mechanism` (why velocity gained is lost each collision), `why_vd_proportional_tau` (longer free flight → more gained speed).
- S6: `current_area_dependence` (same v_d, wider wire, more current), `number_density_n_confusion` (n is the material's property, not the battery's), `same_current_thinner_wire_faster_drift` (series wire of smaller A → v_d must rise).

## 7. entry_state_map (v2.2)

```
entry_state_map:
  foundational:      STATE_1 → STATE_4   # "what is drift velocity / why is current instant"
  current_relation:  STATE_5 → STATE_6   # "how does v_d relate to i / E / A" (numericals)
  exploration:       STATE_7
```

PRIMARY aha (S3) is inside `foundational` ✓ (foundational-coverage rule satisfied, no exit-pill needed). json_author registers all three aspects in `ASPECT_VOCABULARY` + `CLASSIFIER_PROMPT`.

## 8. Prerequisites (advisory, Rule 23)

- `electric_field_point_charge` (shipped, Ch.1) — E as a real vector field filling space.
- `force_on_charge_in_field` (shipped, Ch.1) — F = qE, so a = eE/m on the electron.

No shipped atomic exists for "electric current" itself; drift_velocity is Ch.3's opener and builds i microscopically from scratch — no gap.

## 9. Real-world anchor (Indian, plain English, physics-true)

**Primary:** You flip the switch by the bedroom door and the ceiling fan hums the same instant — yet each electron in that wire crawls at about a tenth of a millimetre per second and would need roughly fourteen hours to travel the few metres to the fan. What reaches the fan instantly is the electric field, not the electrons. **Secondary:** when power returns after a monsoon outage, every streetlight down the road comes on together — the field is established along the whole line at once; no electron "delivered" the electricity to the far end.

Why it hooks Class 11-12 JEE/NEET students: the fan-switch is a daily, physical act in every Indian home; the "fourteen hours" number is shocking, checkable with the formula they just learned (a genuine i = neAv_d numerical in disguise), and it is a stock JEE assertion-reason trap.

## 10. Definition of Done (Gate 0 — zero TBDs)

- **(a) States:** the seven rows of §3, exactly as tabled.
- **(b) Symbol-label table** (every narrated quantity → exact on-canvas label; labels stay symbolic, Rule 24):

| quantity | on-canvas label | where |
|---|---|---|
| electric field | `E` on the field arrows | S2+ |
| thermal speed | `u ≈ 10⁵ m/s` readout | S1+ |
| drift velocity | `v_d` on the labelled drift arrow + readout `v_d ≈ 10⁻⁴ m/s` | arrow from S5 (readout from S2) |
| relaxation time | `τ` tick between collision flashes | S4 |
| drift formula | `v_d = eEτ/m` overlay | S4+ (gated — see pre-spoil rule) |
| number density | `n = 8.5 × 10²⁸ /m³` on the meter panel | S6 |
| cross-section | `A` bracket on the wire | S6 |
| current | meter `i = neAv_d` + `i →` vs `electrons ←` direction pair | S6+ |

- **(c) Right-hand-rule plan:** N/A — no magnetic directions in this concept (declared, not TBD).
- **(d) Motion plan:** all seven table rows in §3; every state animates on the state clock (Rule 26); thermal jitter never stops by engine design.
- **(e) Modes:** conceptual-only (Rule 20) — no `mode_overrides`.
- **(f) Assessment:** deferred this phase (conceptual-only directive; Gates 19/20 fire only when the block exists — declared, not TBD). `misconception_watch` at exactly the 3 pivots of §4. `advance_mode`: `manual_click` S1–S6 + `interaction_complete` S7 = 2 distinct (Gate 12); no `wait_for_answer`, no `pause_after_ms`, never `auto_after_animation`.
- `scene_composition.primitives.length ≥ 3` per state (Gate 19 structural), `focal_primitive_id` per state; on-canvas text lives in `particle_field_config.states.{label,caption,formula_overlay}` (scene_composition annotations are not rendered — known scar).
- TTS: author `teacher_script` EN now (25–55 words/guided state, symbols expanded in speech per Rule 30 — "drift velocity v d", "relaxation time tau"); EN + Telugu AUDIO rendered LAST, post-founder-approval (Rule 30f), narration off by default.
- THE EYE clean (`visual:eyes` + `smoke:visual-validator --dense`, dense frames read through the S2 cue window and the S3 loop, not just frozen) + runtime Playwright console probe + zero new `engine_bug_queue` rows.

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** `electric_field_point_charge`: S2 breaks if the student doesn't know E is a real field filling the wire — patch: S2's narration carries one clause, "the field, everywhere inside the wire, pushes every electron"; students with the prerequisite read it as confirmation, not condescension. `force_on_charge_in_field`: S4 breaks without F = eE → a = eE/m — patch: S4's formula overlay includes the one intermediate line `a = eE/m` before `v_d = eEτ/m` lands, so the chain is visible without a detour.

**JEE-backwards trace.** Question: *"A copper wire of cross-section 1 mm² carries 1.2 A. Given n = 8.5×10²⁸ m⁻³, find v_d — and explain why the lamp lights instantly although v_d is so small."* Needed: i = neAv_d rearrangement → S6 (formula + meaning of n, A); order-of-magnitude sense that the answer ~10⁻⁴ m/s is right → S2 (twin readouts); the "explain why instant" assertion-reason half → S3 (field-speed vs drift-speed); what sets v_d physically if E or the material changes → S4 + S5. No missing piece; every fragment has a named state. (Board/competitive coverage deferred per the conceptual-only directive.)

**Misconception entry mapping (Rule 16, 16a-primary).** All three beliefs of §4 are confronted proactively in-path at S1 / S3 / S4 with `misconception_watch` + contrast-in-motion (no predict-pause). Planting-moment audit: S1's "huge speeds" sentence could itself plant "fast electrons = fast current" — S1's closing clause pre-flags it ("all that speed, and the cloud goes nowhere"), and S2 immediately shows the drift as the *new, tiny* thing. S6's "wider wire, more current" could plant "area speeds electrons up" — countered in the same beat by the v_d readout visibly holding constant during the A sweep. No EPIC-C branches authored (16b fallback deferred until real students exist).

## Block 2 — Aha-moment designation

- **PRIMARY aha (S3):** *The signal is the field, not the electrons — the field fills the wire at near light speed, so every electron everywhere starts drifting the same instant, while each electron merely crawls.* The 10-year memory: "the fan starts instantly, though each electron would take hours."
- **SUPPORTING aha (S1, one only):** *the electrons in an idle wire are already moving at a hundred kilometres per second — with exactly zero net effect.* (1 primary + 1 supporting = sweet spot.)
- **Cohesion check:** the S1 aha exists to serve S3 — it builds the "these things are FAST" frame that S2's crawling drift then contradicts, creating the paradox ("then why is the switch instant?") that only S3 resolves. Nothing stands alone.
- **Wrong-belief setup:** for the PRIMARY, S1 (electrons are fast → surely current is fast) and S2 (but the drift is absurdly slow → confident confusion) are the two earned-belief states before S3 breaks the frame. For the SUPPORTING, the student's incoming belief ("idle wire = still electrons") is broken within S1 itself by the null-result-hold.
- **Cross-reference:** deep-dive picks (S3, S4, S6) vs cliff states (S2, S4) diverge at S2/S3 — documented: S2's cliff is prerequisite-patching (one clause suffices, cheap), while S3/S4/S6 are the historically expensive stuck-points worth pre-built investment.

## Engine bug queue consultation (scar compliance)

Directive rows read from the canonical seed mirrors (`_seed_engine_bug_queue_field3d.ts`, `_seed_engine_bug_queue_radius_period_chain.ts`):

- `teach_concrete_before_abstract_compare` (AR) → S4 shows the collision-kick motion FIRST; `v_d = eEτ/m` lands only after the motion has been watched.
- `teach_coordinate_sim_with_graph` (AR) → S5 and S6 each drive ONE live parameter moving scene + readout in lockstep (E ↔ v_d arrow/readout; A ↔ counting plane/meter); no static readout ships.
- `teach_visual_must_match_narration` (AR, MAJOR) → every narrated claim is drawn: "zero net displacement" = pinned net-shift marker (S1); "10⁹ ratio" = twin labelled speed readouts (S2/S3); "everywhere at once" = full-wire same-frame arrow onset (S3); "current climbs, crawl doesn't" = meter rises while v_d readout holds (S6).
- `teach_do_not_prespoil_a_later_reveal` (AR) → `v_d = eEτ/m` gated to S4; labelled v_d arrow gated to S5; current meter + `i = neAv_d` + n gated to S6; earlier states carry readouts only.
- `teach_distinct_reference_lines_for_two_radii` (AR, analog) → the two SPEEDS (u thermal vs v_d drift) are two permanently distinct, separately-labelled readouts in different colours — never conflated (same scar class as R vs r).
- `teach_reveal_synced_to_narration` + `teach_show_quantity_live_when_named` (PA — forwarded to physics_author) → bind the S2 `field_on` cue, the S4 formula landing, and each first-naming (τ tick, A bracket, meter) to their narrating sentences via `scenario_cue`.
- `teach_color_each_element_by_its_own_sign` (PA — forwarded) → electrons keep the electron colour, lattice ions their own; only the meter follows the aggregate.
- Pacing/pivot scars (word budget 25–55; misconception_watch at pivots only) → applied throughout.

**Exceptions / FLAGS to quality_auditor and downstream:**
1. **Bundle split (registration site #6):** `drift_velocity` currently resolves to the legacy bundle `src/data/concepts/class12_current_electricity.json` via the `loadConstants` fallback. The new standalone `src/data/concepts/drift_velocity.json` shadows it (data/concepts is read first). json_author must retire the bundle's drift_velocity routing per `docs/archive/LEGACY_SPLIT_BACKLOG.md`, verify `VALID_CONCEPT_IDS` (it may already list the id), and NOT add a `CONCEPT_SYNONYMS` self-redirect.
2. **First-on-renderer risk:** this is the first concept on `particle_field`; THE EYE's `deriveStateMeta` / slider-exclusion chain has field_3d precedent only. If THE EYE false-fails motion/reveal classification on particle_field frames, that is a `peter_parker:*` validator/renderer gap, not a content bug — route accordingly, don't bend the JSON.
3. **Renderer map:** `CONCEPT_RENDERER_MAP` → particle_field; NOT `PCPL_CONCEPTS`, NOT field_3d. Any capability beyond the declared `particle_field_config` vocabulary = renderer escalation, never invented JSON fields.

**DC Pandey check:** Consulted chapter-scope only (Current Electricity ToC: drift velocity / current density / Ohm's law sections) against the brief's NCERT §3.5 citation to confirm atomic boundaries — drift + i = neAv_d here; resistivity, mobility, temperature dependence deferred. No teaching method, no example problem, no figure reference imported.

## Self-review (architect checklist)

Atomic claim one sentence ✓ · 7 states with documented deviation rationale ✓ · control table complete (teaches × archetype × distinct motion × delta × controls × budget), all archetypes unique, sandbox explore-last ✓ · Rule 32 plan (cause-first cue, one-variable-moves, delta-cue captions, home-pose reseed, one glow focal per state) ✓ · misconception_watch at exactly 3 genuine pivots ✓ · deep-dive picks + 9 clusters ✓ · entry_state_map with foundational containing the PRIMARY aha ✓ · prerequisites advisory, both shipped ✓ · anchor Indian/plain-English/physics-true (14 h ≈ 5 m ÷ 10⁻⁴ m/s — checked) ✓ · DoD zero TBDs (RHR declared N/A) ✓ · Block 1 + Block 2 complete ✓ · scar directives satisfied, 3 exceptions FLAGged ✓ · no field_3d vocabulary anywhere ✓.

**Handoff:** ready for physics_author — the physics block should finalize slider ranges/defaults (physics-true: defaults land v_d ~10⁻⁴ m/s, i ~1 A with copper n = 8.5×10²⁸ m⁻³), the per-state reveal/cue timelines against the narration, and exact `text_en` scripts inside the per-state word budgets above.
