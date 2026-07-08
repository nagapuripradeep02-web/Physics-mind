# Pass-2 four-question lens — drift_velocity

Renderer family: **particle_field** (2D p5.js — `scenario_type: "drift_velocity"`, config-driven, not
scenario-dispatched). FIRST concept authored on this renderer. Rule 31 concept — no `pause_after_ms`, no
`wait_for_answer`, no predict-pause. Q3 motion is authored in `particle_field_config.states.STATE_N.*`
(drift_speed / drift_direction / highlight_particle / dim_others / cue), read natively by
`particle_field_renderer.ts`'s `stepPhysics()` every 1/60s tick — never via `reveal_at_tts_id` /
`animate_in` inside `scene_composition` (those drive only the PCPL/parametric_renderer family; here
`scene_composition` is unrendered documentation metadata per the physics_author's renderer-reality note).
Q2's "feel the confusion before resolving it" is delivered by the MOTION itself (the thermal cloud's huge
zigzag plays for the whole of STATE_1 with zero net shift; the crawl-vs-field-arrival contrast plays out
live in STATE_3's cue), never by a prediction question.

Re-entry rule check: every guided state's home pose is the SAME conductor strip + the SAME seeded
electron layout + fixed lattice (the renderer reseeds the identical PRNG stream on every `SET_STATE`,
Rule 32d) — a returning student sees the familiar wire-and-electron-cloud picture within the first frame,
before any state-specific reveal (S2/S3's `field_on` cue fires no earlier than 1200ms in, well past the
orientation window).

---

## STATE_1 — Thermal chaos: electrons already tear around, going nowhere

1. **Not known yet:** that an idle, field-free wire is NOT a still wire — free electrons are already in
   violent, continuous random motion (~10^5 m/s) with the field off.
2. **Feel the confusion/surprise:** the whole electron cloud is shown zigzagging at full thermal speed
   for the ENTIRE state (no held-still opening) while a labelled net-shift marker stays pinned at exactly
   zero the whole time — huge visible speed, on-screen proof of zero transport, no words needed first.
3. **Moves/appears:** every electron's position updates every frame (`config.particles.thermal_speed`
   drives the zigzag; `drift_speed: 0` / `drift_direction: 'none'` guarantee no net bias); the readout
   `u ≈ 1.2×10⁵ m/s · net shift = 0` is on screen from frame one.
4. **Eye goes:** the electron cloud itself (the only moving thing on screen) — `focal_primitive_id` =
   `electron_cloud`, `glow_focal: "electrons"`.

## STATE_2 — Switch the field on — a tiny collective drift appears

1. **Not known yet:** that turning on E does not replace the chaos with orderly motion — it superposes a
   tiny collective DRIFT on top of the still-violent thermal zigzag.
2. **Feel the confusion/surprise:** the cause-first engine gate (`cue: {id:"field_on", at_ms:1200}`) fades
   the field arrows in FIRST (600ms) across the whole wire, holds for a readable 900ms beat with nothing
   else changing, THEN ramps the drift over 800ms — the student watches the CAUSE arrive before the
   EFFECT responds, never simultaneous (Rule 32a).
3. **Moves/appears:** field arrows fade in (`curFieldAlpha` 0→1), then the whole cloud streams slowly
   opposite the arrows (`curDriftFactor` 0→1 driving `curEffDrift`); twin readouts land together —
   `u ≈ 1.2×10⁵ m/s · v_d ≈ 8.8×10⁻⁵ m/s`.
4. **Eye goes:** the field arrows fading in, then the cloud's slow collective lean — `focal_primitive_id`
   = `field_arrows`, `glow_focal: "field"`.

## STATE_3 — PRIMARY aha: the field arrives instantly; electrons only crawl

1. **Not known yet:** that what travels near light speed on flipping a switch is the FIELD, not the
   electrons — each electron everywhere starts drifting the same instant, but any one electron itself
   only crawls (~14 h to cross a few metres).
2. **Feel the confusion/surprise:** the same `field_on` cue mechanism re-fires (arrows fill the ENTIRE
   wire in the fade window) while `highlight_particle: true` + `dim_others: false` keeps ONE spotlighted
   electron visible crawling only a few pixels across the whole state — the field-wide reveal and the
   single-electron crawl are on screen in the SAME loop, side by side, before any resolving sentence.
3. **Moves/appears:** field arrows fill the whole wire on the same cue timing as S2; the spotlighted
   electron's zigzag+tiny-drift is visibly the SAME small motion as every other electron — nothing about
   it is fast. Label: `field ≈ instant · electron ≈ 14 h to cross ~4.4 m`.
4. **Eye goes:** the spotlighted electron against the whole-wire field arrows — `focal_primitive_id` =
   `field_instant`, `glow_focal: "electrons"`. This is the PRIMARY aha (`aha_moment.state_id: "STATE_3"`,
   11-word statement) and sits inside `entry_state_map.foundational` (STATE_1–4) — no exit-pill needed.
   Drill-downs: `field_travels_not_electrons`, `why_bulb_lights_instantly`, `signal_speed_vs_electron_speed`.

## STATE_4 — One electron, kicked between collisions — v_d = eEτ/m

1. **Not known yet:** the MECHANISM behind v_d — that it is the average of a violent zigzag punctuated by
   brief field-driven kicks between collisions, not some separate slow "drift particle."
2. **Feel the confusion/surprise:** `highlight_particle: true` + `dim_others: true` (`dim_opacity: 0.25`)
   isolates one electron in a close read; the motion (kick → collision reset → kick) is watched BEFORE
   the formula overlay lands (`glow_focal: "formula"` only after the motion has played) — concrete before
   abstract, per the engine-bug-queue `teach_concrete_before_abstract_compare` prevention rule.
3. **Moves/appears:** the spotlighted electron speeds up slightly along −E during each free flight
   (`collisionFrames()` scaled live by the `tau` slider — the only live control this state exposes); a
   longer τ visibly means longer flights and a steeper bias before the next reset.
4. **Eye goes:** the spotlighted electron's kick-reset cycle, then the formula overlay
   (`a = eE/m` / `v_d = aτ = eEτ/m`) — `focal_primitive_id` = `formula_vd`, `glow_focal: "formula"`.
   Drill-downs: `relaxation_time_meaning`, `collision_reset_mechanism`, `why_vd_proportional_tau`.

## STATE_5 — v_d ∝ E — double the field, double the drift

1. **Not known yet:** that v_d scales LINEARLY with E (not some other power), holding τ fixed.
2. **Feel the confusion/surprise:** N/A — this is a straightforward coordinated-sweep beat (no
   misconception pivot here per the founder guardrail: only S1/S3/S4 carry `misconception_watch`); the
   "surprise" register is spent on S1/S2/S3, this state is the payoff demonstration.
3. **Moves/appears:** the ONE taught variable (E) drives BOTH the scene (field-arrow brightness +
   `show_drift_arrow` length via `effDriftPx()`) AND the live readout in lockstep — never a static readout
   beside a moving picture (`teach_coordinate_sim_with_graph` prevention rule); τ and A stay frozen.
4. **Eye goes:** the labelled `v_d` drift arrow growing/shrinking with E — `focal_primitive_id` =
   `drift_arrow`, `glow_focal: "drift_arrow"`.

## STATE_6 — i = neAv_d — current climbs with area, drift speed doesn't

1. **Not known yet:** that widening the cross-section A multiplies the CURRENT (more parallel lanes of
   carriers) without changing the drift speed itself — a thicker wire's electrons are not moving faster.
2. **Feel the confusion/surprise:** N/A — straightforward beat (no misconception_watch here — S6 is the
   only has_prebuilt_deep_dive state that does not carry one, per the founder guardrail that
   misconception_watch lives only at S1/S3/S4's genuine pivots); the counter to "wider wire ⇒ faster
   electrons" is built directly into the readout contrast below.
3. **Moves/appears:** A drives the current meter (`show_current_meter: true`, `i = neAv_d` climbing) while
   the v_d readout visibly HOLDS STILL (v_d has no A dependence in `effDriftPx()`) — "current climbs, crawl
   doesn't" is drawn, not just narrated (`teach_visual_must_match_narration` prevention rule).
4. **Eye goes:** the current meter climbing beside the frozen v_d readout — `focal_primitive_id` =
   `current_meter`, `glow_focal: "current_meter"`. Drill-downs: `current_area_dependence`,
   `number_density_n_confusion`, `same_current_thinner_wire_faster_drift`.

## STATE_7 — Explore: all three dials yours — E, τ, A

1. **Not known yet:** N/A — the open explorer; S1–6 answered every "not known yet," this is the sandbox
   to re-verify every relation live.
2. **Feel the confusion/surprise:** N/A (explore state) — thermal jitter never stops by engine design, so
   the scene is never a dead frame even before the teacher touches a slider.
3. **Moves/appears:** all three sliders (E, τ, A) live simultaneously; drift arrow + current meter +
   both readouts recompute every frame off whichever dial is dragged.
4. **Eye/hand goes:** the slider panel (top-right, all three rows shown — `show_sliders: true` with NO
   `visible_controls` key, so the renderer's `showAll` branch fires; see cut-line note below) and the
   current meter — `focal_primitive_id` = `current_meter_live`, `glow_focal: "current_meter"`.

---

## Cut-line / discipline self-checks

- **Renderer-family note honored:** particle_field, not field_3d/PCPL. Q3 motion lives in
  `particle_field_config.states.STATE_N.{drift_speed, drift_direction, highlight_particle, dim_others,
  dim_opacity, cue}`, read by `stepPhysics()`/`drawParticles()`/`drawFieldArrows()` in
  `particle_field_renderer.ts` — never `reveal_at_tts_id` / `animate_in` inside `scene_composition`.
  `scene_composition` annotations are authored as accurate, unrendered scene descriptions only (Gate 19
  structural — ≥3 primitives/state), per the physics_author's explicit renderer-reality note. No
  `pause_after_ms` anywhere in `teacher_script` (Rule 31 — new concept, nothing to carry forward).
- **`visible_controls: []` + `show_sliders: true` trap (caught during authoring):** the renderer computes
  `showAll = !!state.show_sliders && !vis` where `vis = state.visible_controls || null`. Because `[]` is
  truthy in JS, setting `visible_controls: []` alongside `show_sliders: true` on STATE_7 would have
  silently hidden every slider row (vis present ⇒ showAll false ⇒ loop falls back to `vis.indexOf(id)`,
  which is always −1 for an empty array). STATE_7 therefore OMITS `visible_controls` entirely — only
  `show_sliders: true` — so `vis` resolves to `null` and `showAll` is genuinely true. STATE_1–3 keep
  `visible_controls: []` + `show_sliders: false` (harmless, since `showAll` is already false there).
- **Straightforward + per-state contextual controls (Rule 31):** the slider panel is built ONCE in
  `buildOverlayUI()`; per-state `visible_controls` show/hide rows without rebuilding — S1–S3 show no
  controls (watch-only beats; motion ≠ interactivity), S4 shows only `tau`, S5 only `E`, S6 only `A`, S7
  shows all three. A shared row (e.g. `tau`, appearing in S4 and S7) keeps the same screen position.
- **No two states alike in motion:** S1 (thermal-only, null-result-hold), S2 (cause-first field-fade →
  drift-ramp), S3 (whole-wire field arrival vs single-electron crawl, cycle-compare framing), S4
  (spotlighted kick-collision-reset cycle), S5 (E-driven coordinated arrow+readout sweep), S6 (A-driven
  meter climb with a frozen v_d readout), S7 (full live sandbox) — seven declared, distinct archetypes
  (per the architect's control table), no repeat.
- **Gesture-mirror primitive:** N/A — no RHR / magnetic-direction gesture in this concept (declared, not
  TBD, per the architect skeleton's Definition-of-Done §10c).
- **Plain English / Gate 5:** no `n_hat`, `F_vec`, `\hat{`, `\vec{` anywhere (checked before handoff, and
  confirmed clean by `npm run validate:concepts` Gate 5). `mode_overrides` omitted entirely
  (conceptual-only directive); `epic_c_branches` omitted (EPIC-L-first directive).
- **Numerical self-check (physics_author's verified case, §2):** at defaults E=0.02 V/m, τ=25 fs, A=1
  mm², n=8.5×10²⁸ m⁻³ → u ≈ 1.17×10⁵ m/s, a ≈ 3.51×10⁹ m/s², v_d ≈ 8.78×10⁻⁵ m/s, i ≈ 1.19 A,
  u/v_d ≈ 1.33×10⁹ (the 10⁹ paradox). S3's "~14 h to cross ~4.4 m" anchor checks out at this v_d
  (4.4 m ÷ 8.78×10⁻⁵ m/s ≈ 13.9 h ≈ 14 h) — the spoken number and the live readout agree.
