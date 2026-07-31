# ARCHITECT SKELETON — `ac_voltage_resistor`

> Stage 1b of the CHAPTER_LOOP trial (docs/CHAPTER_LOOP.md) — first concept of Ch.7, first through the full closed loop. Written for founder-proxy Checkpoint A immediately after this document.

**Chapter:** Class 12, Ch.7 Alternating Current — NCERT §7.2 (AC Voltage Applied to a Resistor, including rms values). `concept_id: ac_voltage_resistor`, label "AC Voltage Applied to a Resistor".
**Renderer:** `field_3d` — NEW `scenario_type: "ac_resistor"` (Class-B triage: the scenario does not exist; the engine delta is declared FIRST in §0b and runs in-loop via CHAPTER_LOOP §3b).
**Position:** 1st of 8 in the founder-approved Ch.7 map (`ac_voltage_resistor → phasors → ac_voltage_inductor → ac_voltage_capacitor → series_lcr_circuit → ac_power_factor → lc_oscillations → transformer`). This concept is the chapter's baseline: every later concept compares its component against "the resistor: v and i in phase, power always dissipated." `phasors` comes NEXT — this skeleton deliberately shows the in-phase relationship ONLY on time-traces (peaks together, zeros together) and never draws a rotating-vector diagram; that formalization is `phasors`' whole job, and the clean handoff is: "two traces locked in step — the next concept gives you a machine for reading that lock at a glance."

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL is not executable from this architect dispatch (no Bash/DB tool). Consulted the canonical read-only mirror `docs/FIELD3D_SCENARIO_CHECKLIST.md` in full, plus `docs/loop_runs/ch7_engine_log.md` (Stage 1a record). **FLAG to quality_auditor: re-run `query_engine_bug_queue.ts ac_voltage_resistor` + `--field3d --open` at Gate 8.** Prevention rules applied:

| Scar / prevention rule (mirror) | How this skeleton satisfies it |
|---|---|
| Concrete before abstract | S1 is pure phenomenon (charge rocks back and forth, trace draws — no current formula yet); Ohm algebra S2; power S4; rms number S6; the recipe S7; the sin² proof dead last (S8) |
| Reveal synced to narration | Cue plan in §3 — sample-cursor, product-walk, meter dock, twin dock, fold morphs, chain docks each land on their narrating sentence via `scenario_cue`; `at_ms` fallbacks kept for THE EYE |
| Coordinate sim + graph — ONE live parameter moves both | The single state-clock phase ωt drives beads, glow, meters, AND every trace dot in lockstep in every state; never a static curve |
| Show a quantity live when it's named | v-trace starts drawing on the sentence naming "voltage"; the i-dot plants as "current" is said (S2); the rms level line lands exactly as "root mean square" is spoken (S6) |
| Don't pre-spoil a later reveal | No i-trace in S1; no p-strip before S4; ⟨ ⟩ average notation first at S5; √2/0.707 first at S6; sin² = (1−cos 2ωt)/2 ONLY in S8; no phasor arrow anywhere (next concept's reveal) |
| Visual must match narration | "current reverses" = wire arrow + beads visibly reversing; "meter reads zero" = needle held at dead zero on screen; "same brightness" = the two heaters visibly matching (S6) |
| Distinct reference lines | vₘ peak line, Vᵣₘₛ level line (0.707vₘ), and the ⟨p⟩ mean line are three separately labelled dashed lines, never conflated; the p-strip has its OWN highlighted zero baseline |
| Colour each element by its own sign/identity | v-trace and i-trace each own a fixed colour with colour-matched y-scales; the signed HUD values flip sign, colours don't; p-strip is a third fixed colour |
| Register the NEW scenario in `deriveStateMeta.ts` in the SAME change | §0b requirement 7 — per-state reveal/settle pins for every one-shot, or THE EYE false-fails D7/D1p at the 1500 ms default |
| No frozen tail / one-shots hold end pose | Fold morphs (S7/S8) hold end pose + `reveal_hold` declared; beads/glow/traces sustain ≥0.1%/frame motion in every state, including S5's dead-needle beat (the needle is dead; the beads are not) |
| Explorers must move | S9's AC cycle free-runs by construction (Rule 37 explore never freezes); trusted-drag seizes manual — no motion gap for D1p |
| Don't gate visuals on the clock in slider states | S9 renders every element at full immediately; slider-driven, no emergence ramp; cue gates guarded at t=0 |
| Interactivity in the LAST state only → superseded by Rule 31c | Contextual controls per state (S1 f, S2 R, S6 V_dc); full sandbox only S9 |
| Specific `visible_elements` tokens | `acr_src`, `acr_beads`, `acr_heater`, `acr_vtrace`, `acr_itrace`, `acr_pstrip`, `acr_avgmeter`, `acr_twin_dc`, `acr_ecounter`, `acr_rmsline` — no generic substrings |
| Rule-34d chrome collision (Stage-1a class; field_3d fixed scar `field3d_sliders_panel_top12_vs_fsbtn_top10`) | Every NEW overlay this scenario adds (graph strips, wattmeter, energy counters) is specced `top:52px+` / corner-disjoint per the existing fixed pattern in `field_3d_renderer.ts`; §10h zone map |

**DC Pandey check:** no DC Pandey content consulted this dispatch. Scope validated against the founder-approved Ch.7 chapter map + the NCERT Ch.7 index (§7.2 named in the dispatch brief). No teaching sequence, example problem, or figure imported from any source book.

---

## 0b. Renderer decision + engine ask — `peter_parker:renderer_primitives` delta, declared FIRST (Class-B triage; §3b engine-loop candidate)

**Decision: `field_3d`, NEW `scenario_type: "ac_resistor"`.** Reasoning:

1. **The closest precedent is `ac_generator` (field_3d), not the Ch.3 circuit engine.** This concept is about TIME-VARYING signals; `ac_generator` already ships the live time-graph pane with two overlaid traces + tracking dots + auto-scale (`show_graph: "both"` machinery), a brightness-∝-ε² bulb (literally the sin² power visual, already computed as `bulb_brightness`), and the external-circuit current arrow that flips at the sine's zero crossings. Most of this concept's engine surface is a clone-and-retint of machinery that exists.
2. **Chapter continuity.** `ac_generator`'s output IS this concept's input; the source object can visually quote the spinning coil (home-pose callback, Rule 32d at chapter scale). `phasors` and everything after it will live on the same graph-pane family — choosing field_3d here sets the Ch.7 platform once.
3. **`particle_field` is the wrong fit.** Its circuit engine is DC-topology bead flow (series/parallel/bridge/wire) with a V–I graph, not a time-domain scope. AC oscillating beads + dual time traces + a product strip + a twin circuit would be MORE new engine work on the less-suited renderer.
4. **Rule 33 wants 3D beads + glow.** The macro band (heater glow, meters) and micro band (charges rocking in place) are native field_3d patterns.

**The engine ask (json_author must NOT start until this lands; physics_author/json_author to size; runs in-loop via CHAPTER_LOOP §3b):**

1. **AC circuit apparatus** — source (sine-stamped ring quoting the generator coil), two wires, heater element R that glows with p(t) — clone of `acg_bulb` brightness machinery (already squares a sinusoid) + faraday bead flow, with beads OSCILLATING (displacement ∝ ∫i dt, direction reversing each half-cycle) instead of streaming. **The heater emissive is driven by p(t) EVERY frame and EXEMPTED from `applyGlowEmphasis` (FIXED scar `bulb_glow_not_modulating` — the glow loop's frame-0 restore otherwise clobbers the modulation). This exemption is NOT inherited-safe from the clone: unlike `acg_bulb`, the heater here is ALSO a glow_focal (S3) — when `heater` is the focal, emphasis is expressed by DIMMING PEERS only, never by overwriting the heater's own live emissive.**
2. **Scope pane, two stacked strips** — top strip: v(t) and i(t) overlaid on a shared time axis with colour-matched dual y-scales + tracking dots (clone of ac_generator's dual-trace graph); bottom strip: p(t) with its own **highlighted zero baseline** (the "never below zero" claim must read against its own zero line). Strips appear per state (`show_graph` modes).
3. **Sampling cursor + product walk** — a vertical cursor that samples v, plants the i = v/R dot (S2), and walks the cycle raising an always-positive p bar (S4). New graph-pane behaviors, modest.
4. **Instruments (Rule 33d)** — signed live HUD values (`v = +7.1 V`, `i = +1.41 A`, `p = 10.0 W`); an **averaging meter** (moving-coil style: needle = cycle-average, sits dead at zero on AC — S5) that re-tasks as the running-⟨p⟩ wattmeter settling at 10.0 W (S7); an **energy counter** `E = … J` climbing monotonically (S4+). Needle/readout precedents exist (galvanometer machinery). **Formula panel (Rule 34b):** every per-state formula surface renders on a DEDICATED Cambria-Math math-serif panel built for this scenario — explicitly NOT the shared generic `#formula_overlay`, which carries the OPEN scar `field3d_formula_overlay_generic_not_cambria_math` (still renders 13px monospace); the engine dispatch must build the dedicated panel, never default to the generic overlay.
5. **Twin DC circuit** (S6) — a second, smaller copy of heater+source on a DC supply with a dial; both heaters' glow computed from the same brightness function; two energy counters climbing side by side. Side-by-side precedent exists (`split_ring_contrast`); respect the compare-offsets scar (offsets > object extent, camera pulls back).
6. **Curve morphs** — S7: the i-trace is SQUARED point-by-point — each trace point maps y → y², the vertical axis rescaling to A² (the squaring also carries the negative lobes positive; the operation is explicitly squaring, NOT a fold/reflection about the axis — reflecting would build |i|, peak iₘ, mean 2iₘ/π, from which the √ step cannot land at 1.41 A; squaring builds i², peak iₘ², mean iₘ²/2 = 2.0 A²); running-mean line settles, root lands the rms line; S8: chop-the-humps-above-½-and-flip-into-the-troughs area morph → flat rectangle. Deterministic geometry (seeded, no per-frame randomness), end poses held, `reveal_hold` declared.
7. **Scar compliance in the SAME change** — **drag-seize guard on EVERY guided-state live control (`f` S1 · `R` S2 · `V_dc` S6):** each implements a per-variable "dragged" flag that HALTS that variable's scripted animation the moment the teacher touches its slider, per the `capacitance` fix pattern (the Stage-0 dead-guided-slider class — a scripted ramp must never clobber a dragged value); and S6's scripted dial-wind-down drives the `V_dc` DOM slider thumb position + its numeric label in LOCKSTEP with the scripted value (Rule 32a; OPEN scar `ghost_compare_cause_invisible_slider_frozen`) — the scripted sweep and a live teacher drag must never fight, and both move the same visible thumb + label; `deriveStateMeta.ts` registration + settle pins for every one-shot; `#sliders` exclusion chain; cue gates safe at t=0; `__PM_supportsTimePin`; NO backticks in the renderer template; no `field_lines` tubes drawn → no field_lines block needed (note: if any tube line IS drawn, the block becomes mandatory — checklist scar); overlays `top:52px+`/corner-disjoint; Rule 27 explorer pattern — stable IDs + params (`acr_*`) postMessage-addressable (V2-ready). **Proposed CLOSED glow-key enum:** `source · beads · arrow · heater · v_trace · i_trace · p_strip · meter · twin_dc · rms_line · energy_counter · formula`.
8. **Regression duty (§3b verify chain):** re-seed + THE EYE on `faraday_law_induction` + `capacitance` after the renderer edit; locked baselines must stay pixel-identical.

---

## 1. Atomic claim

This concept teaches how a resistor responds to a sinusoidal AC voltage — Ohm's law holds at every instant, so current is in phase with voltage, power is always dissipated (never returned), and the RMS value is the single DC-equivalent number that honestly rates AC — and only that. It does not cover phasor diagrams (deferred to `phasors`), the phase shifts of inductors/capacitors (deferred to `ac_voltage_inductor` / `ac_voltage_capacitor`), or how the sinusoidal EMF is generated (prerequisite `ac_generator`, shipped).

**Scope decision:** rms is NOT split into a sibling — NCERT §7.2 teaches it here because rms is unmotivated without the resistor's heating (and the resistor lesson is incomplete without its measure); the two share one student question: "what does AC do to a resistor, and what number rates it?" The advanced-ring slot is the ⟨sin²⟩ = ½ derivation, which belongs to this atomic.

---

## 2. State count + arc

**9 states** — four ideas (what AC is · in-phase Ohm · power never negative · rms) carried by 8 guided beats + explore. Complex band (7–9, CLAUDE.md §5): justified because this is the chapter's foundation — every later Ch.7 concept assumes all four ideas. The hook MOVES from t=0; no static setup state.

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 `ac_swings_both_ways` | AC means magnitude AND direction both vary — charge rocks back and forth as v = vₘ sin ωt draws | *(straightforward beat — omit)* |
| S2 `ohm_at_every_instant` | Ohm's law holds instant by instant → i = iₘ sin ωt, iₘ = vₘ/R — v and i IN PHASE (the chapter's baseline) | *(straightforward beat)* |
| S3 `both_halves_heat` | The reversed half-cycle heats exactly as much — reversal is not undo | *(straightforward beat + contrast)* |
| S4 `power_never_negative` | p = v·i ≥ 0 always — (−)×(−) = +; a resistor only ever eats energy (SUPPORTING AHA; L/C foreshadow) | *(straightforward beat)* |
| S5 `the_zero_average_paradox` | The cycle-average of i is exactly ZERO — an averaging meter sits dead while the heater glows | *(straightforward beat + contrast)* |
| S6 `rms_the_dc_equivalent` | **PRIMARY AHA** — the DC voltage that matches the AC's heating is 0.707vₘ, not vₘ: ratings are RMS | *(straightforward beat + contrast)* |
| S7 `square_mean_root` | The recipe behind 0.707: square → mean (½ peak²) → root; Iᵣₘₛ = iₘ/√2, ⟨p⟩ = Iᵣₘₛ²R | *(straightforward beat)* |
| S8 `why_half` | ADVANCED TAIL — proof that ⟨sin²⟩ = ½: chop-and-flip the humps into a flat rectangle; sin²ωt = (1−cos 2ωt)/2 also names the 2f pulse | `derivation_first_principles` |
| S9 `ac_resistor_sandbox` | Explore — vₘ, f, R live; traces, glow, beads, signed HUD all continuous | `exploration_sliders` |

**Locked physics numbers:** defaults **vₘ = 10.0 V, R = 5.0 Ω, f_demo = 0.25 Hz** (T = 4 s; demo-compressed like `ac_generator` — real mains is tens of Hz, unwatchable) → **iₘ = 2.00 A**, p peaks at **vₘiₘ = 20.0 W**, **⟨p⟩ = 10.0 W**, **Vᵣₘₛ = 7.07 V**, **Iᵣₘₛ = 1.41 A**; checks: Vᵣₘₛ·Iᵣₘₛ = 7.07 × 1.41 ≈ 10.0 W ✓ = Iᵣₘₛ²R = 2 × 5 ✓ = ½iₘ²R ✓. S6's DC twin: dialled to 10.0 V it visibly out-glows the AC heater; the match lands at **7.1 V**. Slider ranges: vₘ 2–20 V · R 2–20 Ω · f_demo 0.1–0.5 Hz · V_dc 0–20 V (S6 only).

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Coined archetypes (one-line justifications):**
- `trace-product` (S4) — two existing live traces combine point-by-point into a computed third; distinct from `reveal-build` (the new object is a walked COMBINATION, not new scene furniture).
- `twin-compare` (S6) — a second copy of the apparatus is driven toward equivalence with the first; distinct from `cycle-compare` (which contrasts phases of ONE apparatus in time).
- `fold-and-settle` (S7) — an existing trace transforms in place (lobes fold up) while a running-mean converges to stillness; distinct from `reveal-build` (nothing new enters the scene) and from `trace-product` (one trace self-transforms).
- `chain-link-derivation` (S8) — reused from the fleet (coined on `capacitance`): visible pieces light in turn while algebra lines dock into one building formula surface.

**No contrast-pair repeats needed — all nine archetypes distinct.**

| State | depth_ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26) | Δ cue (≤5 words) | Live controls | glow_focal | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `ac_swings_both_ways` | **core** | AC = size AND direction of the push both vary sinusoidally (unlike DC) | `oscillate/track` | Home pose: sine-stamped source (visually quoting the `ac_generator` coil), two wires, heater R, scope pane docked right. From t=0 the beads in the wires rock forward-then-back, the wire arrow flips each half-cycle, and the v-trace draws live with the vₘ peak line marked — the ONE headline number (deliberate plant, §Block 2) | "Voltage swings both ways" | **f** (demo; drag-seize guard — §0b req 7) | `beads` | manual_click | 30–45 w |
| S2 `ohm_at_every_instant` | **core** | i = v/R at EVERY instant → iₘ = vₘ/R; v and i peak and vanish together — in phase | `reveal-build` | Sampling cursor stops at three instants (peak, mid, zero): reads v, divides by R, plants the i-dot after a readable beat — then the full i-trace sweeps in, locked onto v; peak/zero alignment ticks land. Dragging R live: i-trace amplitude shrinks/grows while v is untouched (teacher drag SEIZES R from any scripted motion — drag-seize guard, §0b req 7). **NO time lag between the running v and i traces — see the Rule-32a caution below** | "Current copies voltage instantly" | **R** (drag-seize guard — §0b req 7) | `i_trace` | manual_click | 40–55 w |
| S3 `both_halves_heat` | **core** | The reversed half heats exactly the same — reversal ≠ undo | `cycle-compare` | A→B→A′ loop: positive half (arrow →, beads forward) → heater glows; negative half (arrow ←, beads back) → the SAME glow; at each zero crossing the glow visibly dips — the 2-per-cycle pulse. Energy counter E ticks up through BOTH halves, never down | "Reversed current heats equally" | none | `heater` | manual_click | 30–45 w |
| S4 `power_never_negative` | **core** | p = v·i is never negative — a resistor only ever dissipates (the L/C baseline) | `trace-product` (coin) | p-strip docks below the v/i strip with its zero baseline highlighted. The cursor walks one full cycle: at each step the v and i values multiply into an always-upward p bar — at the both-negative quarter the two minus signs flash and the product still rises. The painted p-curve pulses 0→20 W at twice the frequency, TOUCHING zero, never crossing. One clause: "inductors and capacitors will hand energy back — a resistor never does" | "Power never goes negative" | none | `p_strip` | manual_click | 40–55 w |
| S5 `the_zero_average_paradox` | **extended** | The full-cycle average of i is exactly zero — averages cannot rate AC | `null-result-hold` | The averaging meter (the kind that reads steady DC) docks on the wire; its needle sits DEAD at zero, cycle after cycle, while beads keep rocking, the heater keeps glowing, and E keeps climbing. Formula ⟨i⟩ = 0 lands; the question "then which number rates AC?" is left hanging | "Average current: exactly zero" | none | `meter` | manual_click | 30–45 w |
| S6 `rms_the_dc_equivalent` | **extended** | **PRIMARY AHA** — the honest rating is the DC-equivalent: Vᵣₘₛ = vₘ/√2 ≈ 0.707vₘ | `twin-compare` (coin) | Camera widens; a twin heater on a DC supply docks beside. The dial starts at vₘ = 10.0 V — the "obvious" guess — and the twin visibly OUT-GLOWS the AC heater (wrong expectation's consequence first, 16a). The dial winds down — the scripted sweep drives the `V_dc` DOM slider thumb + its numeric label in LOCKSTEP with the scripted value (Rule 32a; OPEN scar `ghost_compare_cause_invisible_slider_frozen`), and a teacher grab of the dial SEIZES it (drag-seize guard, §0b req 7) — the two glows and the two energy counters' climb rates lock at **7.1 V**. The Vᵣₘₛ level line lands on the v-trace at 0.707vₘ, below the peak line. One clause: "your region's mains rating is this rms number — the peak is √2 higher" | "Match lands below peak" | **V_dc** (match dial; drag-seize + thumb-lockstep — §0b req 7) | `twin_dc` | manual_click | 40–55 w |
| S7 `square_mean_root` | **extended** | The recipe: square → mean → root; Iᵣₘₛ = iₘ/√2 and ⟨p⟩ = Iᵣₘₛ²R = ½iₘ²R | `fold-and-settle` (coin) | On the scope: the i-trace is SQUARED point-by-point — each trace point maps y → y², the vertical axis rescaling to A² (the squaring also carries the negative lobes positive; explicitly NOT a fold/reflection about the axis, which would draw \|i\| instead of i²) — becoming the all-positive i² curve; the meter (re-tasked as running mean) climbs and settles at iₘ²/2 = 2.0 A²; the √ pulls the rms line back down onto the i-trace at 1.41 A. Formula chain docks: ⟨i²⟩ = iₘ²/2 → Iᵣₘₛ = iₘ/√2 → ⟨p⟩ = Iᵣₘₛ²R = 10.0 W | "Square, average, root" | none | `rms_line` | manual_click | 45–55 w |
| S8 `why_half` | **advanced** | Why the mean of sin² is exactly ½ — geometry, then the identity that also names the 2f pulse | `chain-link-derivation` (fleet coin) | Nothing physical moves; the scene holds pose dimmed. On the p-strip: the humps above the ½-line are chopped and FLIP down into the troughs — the curve levels into a perfect rectangle at ½ (mean exact, not approximate). Then the algebra docks: sin²ωt = (1 − cos 2ωt)/2 → the cos 2ωt term IS the double-frequency pulse seen since S3; its average dies, leaving ½ | "Humps fill the troughs" | none | `formula` | manual_click | 45–55 w |
| S9 `ac_resistor_sandbox` | **core** (ring-neutral) | Synthesis — the whole instrument under the teacher's hands | `drag-sandbox` | AC cycle free-runs forever (Rule 37); vₘ, f, R all live — traces re-scale, beads re-pace, glow re-pulses, signed HUD tracks; trusted drag seizes manual. Formula surface `i = v/R` (core-only, Rule 38b); HUD = live v, i, p values only | "All yours" | **ALL: vₘ · f · R** | `formula` | interaction_complete | 0 / open |

**No-repeat audit:** oscillate/track · reveal-build · cycle-compare · trace-product · null-result-hold · twin-compare · fold-and-settle · chain-link-derivation · drag-sandbox — nine states, nine distinct archetypes, none static.

**Rule 32 plan.** 32a cause-first with a readable beat in every state (cursor reads v THEN plants i; dial moves THEN glow answers; chop THEN flip THEN level). **⚠ 32a caution — binding on physics_author/json_author:** the in-phase lock IS the taught physics; legibility must come from the sampling/dial choreography and from slider-cause→trace-effect, **NEVER from a time lag between the running v and i traces** — an injected v→i delay would draw an inductor and contradict the concept's core claim on screen (a Checkpoint-B blocking defect by definition). 32b one variable per state (S1 the alternation, S2 R, S4 the product, S6 the dial…). 32c the Δ column verbatim as caption openers. 32d ONE apparatus from S1's home pose throughout; p-strip docks at S4 and persists; twin docks at S6 only; camera moves twice (widen S6, frame-graph S8). 32e one glow focal per state from the CLOSED enum (§0b).

**Rule 33 plan (macro↔micro).** Macro band = heater glow, meters, traces. Micro = the beads (the charges) rocking IN PLACE — each state's interior tells its own story with a real number: S1 the excursion itself (narration clause: at real mains frequency the swing is under a millimetre — the charges never travel to the appliance); S2 excursion halves when R doubles; S3 same jiggle both halves, E counter climbs through both; S4 energy deposits on BOTH strokes (E climbs monotonically while i oscillates — the micro proof of p ≥ 0); S5 E still climbing while the needle sits at zero; S6 twin's beads DRIFT steadily one way vs the AC beads' rock — yet the two E counters climb at the SAME rate (the equivalence made numeric); S7/S8 graph-band states, apparatus holds pose dimmed (32b). Instruments per 33d: signed HUD values, averaging-meter needle, wattmeter settling at 10.0 W, twin E counters — all live numerics, no decorative dials.

**Cue plan.** S2 three cursor-samples on sentences 2–3, i-sweep on 4; S4 product-walk window opening on the "(−)×(−)" sentence; S5 meter dock on sentence 1, ⟨i⟩ = 0 on the naming sentence; S6 twin dock s1, dial-down window s2–3, match+rms-line on the naming sentence; S7 fold on s1, settle s2, root s3, ⟨p⟩ dock s4; S8 chop-flip s1–2, identity dock s3. All via `scenario_cue` + `deriveStateMeta` pins; `at_ms` fallbacks kept.

---

## 4. Misconception confrontation plan (Rule 16a — exactly THREE pivots)

| Genuine wrong belief | Pivot state + beat |
|---|---|
| **"The negative half-cycle undoes the positive half — over a whole cycle the resistor receives nothing"** | **S3.** `visual_counter:` the A→B→A′ loop shows identical glow on both halves while the energy counter climbs through both, never down · `one_line_fix:` "Heating doesn't care which way the charge moves — both halves deposit energy." |
| **"A meter's average reading is the honest measure of AC"** | **S5.** `visual_counter:` the averaging needle held at dead zero across whole cycles while the heater glows and E climbs · `one_line_fix:` "A symmetric AC averages to exactly zero — the average can't rate AC." |
| **"The rating on the socket/appliance is the peak voltage"** | **S6 (PRIMARY).** `visual_counter:` the DC twin set to the peak vₘ visibly OUT-GLOWS the AC heater; the match lands at 0.707vₘ, below the marked peak line · `one_line_fix:` "Ratings are RMS — the peak is √2 higher." |

No other state carries a `misconception_watch` (founder guardrail 2026-07-04). "Ohm's law is DC-only" is handled as straightforward teaching in S2 (planting audit, Block 1). No EPIC-C branches (EPIC-L-first directive).

## 5. `has_prebuilt_deep_dive` states

**S2** — the whole chapter leans on this baseline; documented confusions "why in phase", "does Ohm's law even apply to AC". **S6** — historically THE stuck point of AC (rms meaning; students who can compute iₘ/√2 without knowing what it means). **S7** — the mathematical abstraction (why √2 exactly; square-mean-root order). Divergence from the misconception pivots at S3/S5 is deliberate: investment follows stuck-ness. Cache-hint only, not a gate (Rule 18: un-flagged states route Explain → feedback form).

## 6. Drill-down clusters

**S2:** `why_v_i_in_phase` · `ohms_law_ac_validity` · `peak_current_from_peak_voltage`
**S6:** `rms_vs_average_confusion` · `mains_rating_meaning` · `why_not_peak_value`
**S7:** `why_root_two` · `square_mean_root_order` · `average_power_half_peak_power`

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_4   # what AC does to a resistor (in-phase, always dissipating)
  rms:          STATE_5 → STATE_7   # contains the PRIMARY aha (S6)
  derivation:   STATE_8
  exploration:  STATE_9
```

Default aspect = `foundational`. **Foundational-coverage rule: the PRIMARY aha (S6) sits OUTSIDE the foundational range → a MANDATORY exit-pill is declared:** at the end of the foundational slice, the pill "So which single number rates an AC supply? →" routes into the `rms` slice. Cross-slice pill at S7: "Why exactly ½? →" routes to S8. Every aspect is a valid classifier `aspect` value.

## 8. Prerequisites (advisory only — Rule 23)

- `ohms_law` (shipped, Ch.3 particle_field) — i = v/R; cliff at S2.
- `electrical_power_in_resistor` (shipped, Ch.3) — p = vi = i²R as heating; cliff at S4.
- `ac_generator` (shipped, Ch.5/6) — where v = vₘ sin ωt comes from; cliff at S1 (callback only, never re-derived).

Required-by (the rest of Ch.7): `phasors`, `ac_voltage_inductor`, `ac_voltage_capacitor`, `series_lcr_circuit`, `ac_power_factor`, `transformer`.

## 9. Real-world anchor (Rule 35 + 38f)

**Primary — the heating element (kettle / toaster / room heater) on the wall socket.** The element glows the same steady orange even though the current through it reverses back and forth many times every second — nothing about the glow betrays the reversals, because heating doesn't care about direction. And the number stamped near every socket and on every appliance nameplate is not the peak of that swing — it is the RMS, the DC-equivalent; the peak is √2 higher. Universal, physics-true, and the single widest-syllabus-overlap AC device there is (38f); mains voltage/frequency phrased neutrally throughout — "your region's mains rating", "the mains frequency" — never asserted as one value (35b).
**Secondary (narration-only):** point a phone's slow-motion camera at some mains lamps — they blink at TWICE the mains frequency, exactly the sin² power pulse of S4/S8. Modern, universal, and physics-true (the double-frequency pulse made visible with a device every student owns).

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the nine of §2, ids as named, `state_count: 9`, contiguous STATE_1–STATE_9.

**(b) Symbol-label table** (dialect per 38d — dual-label once, then bare):

| Quantity | On-canvas label | First |
|---|---|---|
| instantaneous voltage | HUD `v = +7.1 V` (signed, live) + v-trace (own colour) | S1 |
| peak (amplitude) | dashed `vₘ` peak line on the v-trace; spoken once as "peak — the amplitude" | S1 |
| frequency | slider "Frequency f" (demo-compressed; narration clause: real mains is tens of hertz); ω only inside formula surfaces | S1 |
| time | scope x-axis `t (s)` | S1 |
| current + peak | HUD `i = +1.41 A` (signed) + i-trace (own colour) + `iₘ` marker | S2 |
| resistance | slider "Resistance R" + `R` tag on the heater; spoken once as "the resistor — the heating element" | S1 (tag) / S2 (slider) |
| current direction | conventional-current wire arrow, flipping at zero crossings | S1 |
| instantaneous power | p-strip trace + HUD `p = 10.0 W`; highlighted zero baseline | S4 |
| energy delivered | counter `E = 47 J` (climbing, never down) | S3 |
| cycle-average notation | `⟨i⟩ = 0`; ⟨ ⟩ spoken once as "the average over a full cycle" | S5 |
| rms values | `Vᵣₘₛ` level line at 0.707vₘ; `Iᵣₘₛ` line at 0.707iₘ; spoken once as "RMS — the effective value" | S6 / S7 |
| average power | wattmeter `⟨p⟩ = 10.0 W` | S7 |
| mains | spoken once as "the mains supply — the wall socket" (dual-dialect) | S6 |

**Formula surface per state (Rule 34b — ONE each; notation ladder 38c: algebra/trig only in core+extended, the identity manipulation confined to advanced):** S1 `v = vₘ sin(ωt)` · S2 `i = v/R` + `iₘ = vₘ/R` (one two-line surface) · S3 none · S4 `p = v·i ≥ 0` · S5 `⟨i⟩ = 0` · S6 `Vᵣₘₛ = vₘ/√2 ≈ 0.707 vₘ` · S7 build-in-place: `⟨i²⟩ = iₘ²/2 → Iᵣₘₛ = iₘ/√2 → ⟨p⟩ = Iᵣₘₛ²R` · S8 `sin²ωt = (1 − cos 2ωt)/2 → ⟨sin²⟩ = ½` · S9 `i = v/R` (core-only, 38b). All real Unicode across all THREE text paths — DOM overlays, canvas graph text, 3D sprite labels (34c): vₘ iₘ ω ⟨ ⟩ ᵣₘₛ √ ² ½ ≥ ≈ — **FLAG json_author: verify the subscript glyphs ᵣₘₛ render in the sprite font; fallback = styled small "rms" text, never ASCII `I_rms`.**

**(c) RHR plan:** N/A — no magnetic directions. Direction teaching = the conventional-current arrow's zero-crossing flips (S1/S3), synced to the trace's sign.

**(d) Motion plan:** the §3 table is it — every state's motion named, none static, the S5 null-result beat carries bead/glow motion around the dead needle.

**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`. `renderer_pair` = field_3d/field_3d; `available_renderer_scenarios.field_3d = ["ac_resistor"]`. `advance_mode`: 8× `manual_click` + 1× `interaction_complete` (Gate 12 ✓; no `wait_for_answer`/`pause_after_ms`/`narrative_socratic` anywhere).

**(f) Assessment + coverage:** AUTHOR the 6-question backward-designed `assessment` + `coverage_map` (Ch.5/Ch.2 precedent — `ac_generator` ships both). Tested ideas → states: Q1 what-AC-means → S1 · Q2 in-phase + iₘ = vₘ/R → S2 · Q3 both-halves-heat / p ≥ 0 → S3/S4 · Q4 rating-is-rms-not-peak → S6 · Q5 compute Iᵣₘₛ + ⟨p⟩ → S7 · Q6 why-½ / 2f pulse → S8. `non_assessed_states: [S9]`. `misconception_watch` at exactly S3, S5, S6. Distractors drawn from the three pivot beliefs.

**(g) Macro↔micro plan:** §3 Rule 33 block — per-state micro story + real number + live instruments, declared.

**(h) Canvas budget (Rule 34):** caption = the ≤5-word Δ cue only, top-center; narration prose in the capStrip below the canvas; ONE math-serif Unicode formula surface per state (list above); HUD value-only, top-right at `top:52px+`; scope pane right; sliders panel per the existing fixed `top:52px` pattern; wattmeter/energy counters in the lower-left zone — all four corners disjoint, nothing clipping the chrome Full-screen button (34d; Stage-1a scar class).

**(i) Curriculum-flex block (Rule 38):**

**(i-1) Coherence check, BOTH preset cuts:**
- **Hide advanced (S8):** S1–S7 + S9 survive. S7 asserts the mean via the settling meter (self-contained, empirical); no surviving narration/caption/formula references the chop-flip proof or cos 2ωt. **Coherent** — the full quantitative lesson.
- **Hide advanced + extended (S5–S8):** S1–S4 + S9 survive. Lesson = what AC is → in-phase Ohm → both halves heat → power never negative → explore. No surviving state names rms, √2, ⟨ ⟩, or average power (S4's forward-reference is to LATER CONCEPTS — inductors/capacitors — never to hidden states of this concept). S9's formula `i = v/R`, HUD v/i/p, sliders vₘ/f/R: all core-established symbols. **Coherent** — a complete qualitative-AC lesson.

**(i-2) Explore = core-ring only (38b):** S9 surfaces `i = v/R` + live v/i/p values ONLY. The rms readout is deliberately NOT in S9 (strict 38b — it would surface extended symbols under the core cut); teachers reach rms numbers in S6/S7, which carry their own controls.

**(i-3) `curriculum_tags` (claims, not facts — 38g; only CBSE/NCERT marked verified at authoring time):**

| Curriculum | Coverage | Note |
|---|---|---|
| CBSE/NCERT Class 12 (+ JEE/NEET) | **✓ full — verified** | Ch.7 §7.2 incl. rms; the full ring set IS this lesson |
| CAIE A-level 9702 | **✓ full (believed)** | "Alternating currents" topic: sinusoidal AC, peak vs rms, Iᵣₘₛ = I₀/√2, mean power ½ peak — S8 proof beyond outcomes · `needs_teacher_verification` |
| Cambridge IGCSE 0625 | **◐ partial (believed)** | AC vs DC distinction qualitative only (S1–S4); rms believed absent · `needs_teacher_verification` |
| IB DP Physics (2023) | **✗ absent (believed)** | AC circuit analysis/rms believed removed in the 2023 reform (legacy HL 11.2 had it) · `needs_teacher_verification` |
| AP Physics 2 | **✗ absent (believed)** | CED circuits are DC-only · `needs_teacher_verification` |
| AP Physics C: E&M | **✗ absent (believed)** | AC/rms beyond the CED · `needs_teacher_verification` |
| Ontario SPH4U | **◐ marginal (believed)** | · `needs_teacher_verification` |

**(i-4) Preset proposal (hide, never reorder — 38h/25d):** CBSE/NCERT + JEE/NEET → **S1–S9 (all)** · CAIE 9702 → S1–S7, S9 · IGCSE 0625 → S1–S4, S9 · IB DP 2023 → none shipped (legacy-HL opt-in: S1–S7, S9) · AP 2 / AP C → none shipped (full set on opt-in) · Ontario → pending verification. No preset teacher-visible until its board's teacher confirms (38g).

**(i-5) Graph-axis convention (38e):** time-domain traces with t on x — universal across NCERT/9702/IB/AP; v and i overlaid on a shared time axis (NCERT Fig-7.2 convention, also standard everywhere) with colour-matched dual y-scales; p in its own stacked strip against its own zero baseline. **No genuine board conflict → no axis-swap toggle.**

**TTS:** author `teacher_script` EN now; `text_hi` via the Rule-30g Sonnet-5 subscription sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h). **Registration (8 sites):** `ac_voltage_resistor.json` · `concept_panel_config`/`CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP` → field_3d · `VALID_CONCEPT_IDS` · deep-dive flags (S2/S6/S7) · synonyms n/a · `PCPL_CONCEPTS` N/A · `CLASSIFIER_PROMPT` + the four aspects; plus clusters migration (file-only per trial rules) + `_seed_ac_voltage_resistor_cache.ts`. **THE EYE:** 9/9 after the §0b delta lands; eye-walker ∥ quality-auditor; zero new scar rows; `faraday_law_induction` + `capacitance` baselines pixel-identical; founder-drive hand-tests the S6 dial + S9 sliders (trusted drags — THE EYE can't fire them).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `ohms_law` breaks at **S2** if i = v/R isn't owned → one S2 clause: "Ohm's law — current is voltage over resistance — and it holds at every single instant of the swing." `electrical_power_in_resistor` breaks at **S4** if p = vi is unfamiliar → one S4 clause: "power — voltage times current, the rate energy lands in the resistor." `ac_generator` breaks at **S1** if v = vₘ sin ωt appears from nowhere → one S1 clause: "this is exactly the voltage a coil spinning in a field produces — here we take it as given." Each patches without condescending (single clauses, not re-teaches).

**JEE-backwards trace.** *"A voltage v = 10 sin(ωt) V is applied across a 5 Ω resistor. Find (i) the peak current, (ii) the rms current, (iii) the average power dissipated, (iv) the frequency at which the instantaneous power pulses, and (v) the peak voltage of a supply rated 230 V rms."* → (i) iₘ = vₘ/R = 2 A: **S2** (with these exact numbers) · (ii) Iᵣₘₛ = iₘ/√2 = 1.41 A: **S7** · (iii) ⟨p⟩ = Iᵣₘₛ²R = 10 W: **S7** (motivated by S5–S6) · (iv) 2f: shown at **S4**, named by the cos 2ωt term at **S8** · (v) √2 × rating: **S6**. No missing piece; no state exists that the trace doesn't use.

**Misconception entry mapping (16a).** The three pivots of §4, each a contrast beat (wrong expectation's consequence shown first — S6's dial literally starts at the wrong answer). **Planting audit:** (1) S1's headline vₘ peak line deliberately PLANTS "peak = THE number" — an intentional plant, flagged here, broken explicitly at S6 (it is the primary aha's setup; §Block 2). (2) S2's "current copies voltage" could over-generalize to all AC circuits → S2/S4 clause "only the resistor is this obedient — the next concepts break it." (3) The demo-compressed frequency could plant "mains is seconds-slow" → S1 clause "slowed enormously for watching; real mains reverses every few milliseconds." (4) "Ohm is DC-only" is prevented at its planting moment by S2's "at every single instant" framing.

## Block 2 — Aha-moment designation

- **PRIMARY (S6):** *An AC current whose average is exactly zero still delivers full power — and the one honest number for it is the RMS, the DC-equivalent: every mains rating is an RMS value, and the peak is √2 higher.*
- **SUPPORTING (S4):** *A resistor's power is never negative — even with voltage and current both negative, the product is positive; a resistor only ever eats energy.* (The chapter's baseline: L and C will hand energy back.)
- **Cohesion:** S4 is what makes S6 possible — only because dissipation never cancels does a nonzero "equivalent steady value" exist for rms to name. One primary + one supporting; nothing stands alone.
- **Wrong-belief setup:** for S6 — S1–S4 headline vₘ as THE number on every trace (earned confidence), then S5 kills "average" as the alternative; the student arrives at S6 confident and slightly wrong twice over. For S4 — S1's vividly reversing arrow builds "reversal = undoing"; S3 confronts it empirically, S4 mechanistically.
- **Foundational-coverage rule:** PRIMARY aha (S6) is outside `foundational` → the mandatory exit-pill from the foundational slice into the `rms` slice is declared in §7.

---

## Escalations / FLAGs for downstream

1. **Engine delta first (§0b)** — `scenario_type: "ac_resistor"` must land via the CHAPTER_LOOP §3b engine loop (physics_author sizes the ask; json_author does not start until it's verified). Regression duty: `faraday_law_induction` + `capacitance` baselines pixel-identical.
2. **Rule-32a caution is binding (§3):** never inject a v→i time lag — in-phase IS the content; a lag draws an inductor and is a blocking defect.
3. **quality_auditor:** re-run the live `engine_bug_queue` SQL at Gate 8 (not executable from this dispatch); check the built sim against the §3 control table; verify sprite-font rendering of ᵣₘₛ subscript glyphs.
4. **Handoff to `phasors` (next concept):** this sim ends with two in-phase time-traces and NO rotating-vector diagram anywhere — phasors opens by formalizing exactly that lock as a 0° angle. Do not let any fix cycle add a phasor arrow here.
5. **Anchor discipline:** kettle/toaster/slow-mo-lamp live in NARRATION only; nothing appliance-shaped is drawn (Rule 24).
6. **Sibling queue seeded:** S4's foreshadow clause is the hook `ac_voltage_inductor`/`ac_voltage_capacitor` will pay off; S8's cos 2ωt term is reusable context for `ac_power_factor`.

---

## Self-review checklist

- [x] Atomic claim ONE sentence; rms inclusion justified (shared student question; NCERT §7.2 unit); exclusions named with deferral targets.
- [x] State count 9 = complex band, justified (chapter foundation, four ideas).
- [x] Per-state control table present: teaches × archetype × distinct motion × Δ × controls × glow × advance_mode × budget × `depth_ring`.
- [x] Nine distinct archetypes, none static, no repeats (no contrast pair needed); 3 coins + 1 fleet-reuse, each justified in one line; drag-sandbox explore-only.
- [x] Rule 32 plan (incl. the concept-specific 32a/in-phase caution); one glow focal per state from a CLOSED enum.
- [x] Rule 33 macro↔micro plan per state with real numbers + live instruments.
- [x] Rule 34 canvas budget: one formula surface per state, Δ-cue captions, value-only HUD, zone map clearing chrome (top:52px+ scar honored).
- [x] Rule 38: `depth_ring` column; qualitative → quantitative → derivation order; advanced ring (S8) contiguous immediately before explore; BOTH cuts checked coherent; explore core-only (rms readout deliberately excluded); `curriculum_tags` with `needs_teacher_verification` on every non-CBSE cell; presets derived (hide, never reorder); graph-axis convention decided (no board conflict, no toggle).
- [x] Misconception_watch at exactly 3 genuine pivots (S3, S5, S6), contrast beats, no per-state tic; no EPIC-C branches.
- [x] 3 `has_prebuilt_deep_dive` states with 3 clusters each; divergence from pivots documented.
- [x] `teaching_method` per state; no `narrative_socratic`; ≥2 advance_modes; no wait_for_answer/pause_after_ms.
- [x] `entry_state_map` with foundational + 3 aspects; PRIMARY aha outside foundational → mandatory exit-pill declared.
- [x] Prerequisites advisory, all shipped, cliffs named with patch clauses.
- [x] Anchor universal + widest-syllabus-overlap (heating element / slow-mo lamp flicker); mains constants neutral (35b); plain English.
- [x] DoD complete, zero TBDs (assessment mapped by tested-idea, symbols tabled, RHR N/A stated, motion plan = table, modes declared).
- [x] Engine bug queue consulted via mirror + Stage-1a log; live-SQL gap FLAGged to Gate 8; every applicable prevention rule mapped in §0a.
- [x] Renderer decision explicit with reasoning; new scenario flagged as the §3b engine-loop candidate, clone sources named, Class-B order enforced.
- [x] Block 1 + Block 2 complete (cliffs, JEE trace, planting audit, PRIMARY + 1 supporting, cohesion, wrong-belief setups).
- [x] M1–M6 carve-out N/A (not a Ch.26 magnetism concept).
- [x] Handoff-ready for founder-proxy Checkpoint A, then physics_author.
