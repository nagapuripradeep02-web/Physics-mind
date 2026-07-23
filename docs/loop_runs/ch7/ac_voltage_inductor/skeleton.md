Both files read. DF1 is a surgical rewrite of the §0b decision block + escalation §1. For DF2 I'm making a real call: **add the live vₘ control at S4** — and my reason is that the reviewer's own counter-argument ("the insight is timing/geometry, which is vₘ-independent") is precisely why the control teaches: dragging vₘ steepens every tangent in step with the taller v-trace while the i-crest stays *pinned* at the v-zero, so the teacher demonstrates the taught causation (v sets the slope) **and** its geometric invariance (the lag never moves, at any voltage) live — the strongest possible proof that the lag is geometry, not magnitude, with zero spoil risk (vₘ is frequency-blind; the vₘ→iₘ proportionality is resistor-familiar, not S5's reveal). Engine cost is minimal: no scripted driver on vₘ, so no lockstep/closed-form duty — a plain live slider.

Touched spots (everything else byte-identical to cycle 0): **DF1** — §0b Decision paragraph, manifest header downgraded to advisory note (list verbatim), escalation §1. **DF2** — S4 row (controls + motion clause), §3 gating-note justification, §0b req 3. **Consequential accuracy edits, flagged**: §0a row 1 ("the ONLY guided-state live control" would now be false), §0b req 9's rationale parenthetical (old one cited the now-forbidden factoring), §10's founder hand-test list (+S4 drag), the triage self-review bullet ("binding" → advisory), one closing checklist line documenting this cycle.

---

# ARCHITECT SKELETON — `ac_voltage_inductor`

> Ch.7 concept 2/8 of the CHAPTER_LOOP run (docs/CHAPTER_LOOP.md), written for founder-proxy Checkpoint A. Sibling reference: `docs/loop_runs/ch7/ac_voltage_resistor/skeleton.md` (SEALED `72910d1` + ride-alongs `ad7975b`, `4dc1c76`).

**Chapter:** Class 12, Ch.7 Alternating Current — NCERT §7.3 (AC Voltage Applied to an Inductor). `concept_id: ac_voltage_inductor`, label "AC Voltage Applied to an Inductor".
**Renderer:** `field_3d` — NEW `scenario_type: "ac_inductor"` (Class-B triage, but a **sibling-clone delta** of the shipped `ac_resistor` family — reuse manifest in §0b; materially smaller than Stage 1b's ask).
**Position:** 2nd of 8 in the founder-approved (re-ordered 2026-07-22) Ch.7 map: `ac_voltage_resistor → ac_voltage_inductor → ac_voltage_capacitor → phasors → series_lcr_circuit → ac_power_factor → lc_oscillations → transformer`. **`phasors` now comes AFTER the three elements** — this concept must stand entirely on time-domain reasoning (traces, slopes, lag brackets). **No rotating-vector diagram appears anywhere in this sim**; the lag is shown only as two time-traces displaced by a quarter cycle, deliberately named "¼ cycle = 90°" so `phasors` can later formalize exactly that phrase. The clean handoff: "two traces, one running a quarter-cycle late — two concepts from now you get a machine that reads that lateness as an angle at a glance."

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL is not executable from this architect dispatch (no Bash/DB tool). Consulted the canonical mirror `docs/FIELD3D_SCENARIO_CHECKLIST.md` in full, plus `docs/loop_runs/ch7_engine_log.md` (all four Stage 1a/1b entries) and `docs/loop_runs/ch7/_engine/scar_candidates.sql` (all 8 candidate rows read). **FLAG to quality_auditor: re-run `query_engine_bug_queue.ts ac_voltage_inductor` + `--field3d --open` at Gate 8.** Prevention rules applied:

| Scar / prevention rule | How this skeleton satisfies it |
|---|---|
| **`field3d_new_scenario_engine_ask_precision_checklist` (OPEN directive — explicitly scoped to "the remaining 6 Ch.7 scope-pane concepts", i.e. THIS dispatch)** | All four items closed in §0b: (1) drag-seize + DOM-thumb-lockstep named for the guided-state live controls (S5's `f_demo`, which co-exists with a scripted ramp and carries the full lockstep duty; S4's `vₘ` — added cycle 1, DF2 — has NO scripted driver, so its duty is live-recompute + a conflict-free grab, no lockstep); (2) every trace operation named arithmetically — the real i-trace is CLOCK-DRAWN (never a phase-slide morph), S6 bars are SIGNED pointwise products, S8 lobe-cancel is a 180° point-rotation congruence; (3) `applyGlowEmphasis` EXEMPTION declared for the coil-field emissive (live-driven by U(t) AND used as glow_focal); (4) dedicated Cambria-Math formula/derivation panel (clone of `#acr_formula`/`#acr_derivation`), never the generic `#formula_overlay` |
| `field3d_createtubeline_undefined_field_lines_throws` (FIXED) + checklist "a scenario drawing flux tubes MUST ship a field_lines block" | This scenario DOES draw coil field loops → the concept JSON MUST author a `field_3d_config.field_lines` block (don't lean on the crash fix's 0.8 fallback) — §10h + FLAG to json_author |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (FIXED yesterday — freshest scar; S5 re-hits the exact class) | S5's scripted f-ramp changes ω mid-state → phase MUST be the closed-form integral ∫ω(τ)dτ of the scripted profile while undragged (pure function of t, rewindable under `SET_TIME_FREEZE`), with the B1 baseline-triple pattern only after a genuine drag — §0b req 3, binding |
| `field3d_rms_subscript_ascii_in_renderer_text_paths` (FIXED) — Rule 34c sweeps must cover all THREE text paths | The new subscript glyph here is `ₗ` (Xₗ) — §10b flags the glyph check across DOM HUD, canvas graph labels (9px path needs Cambria Math per the B2 finding), and sprite labels; fallback = styled small "L", never ASCII `X_L` |
| `ghost_compare_cause_invisible_slider_frozen` (OPEN) | S5's scripted f-ramp drives the DOM slider thumb + numeric label in LOCKSTEP; scripted XOR dragged, never both — §0b req 3 |
| `bulb_glow_not_modulating` (FIXED) + heater-as-focal extension from Stage 1b | Same class here: the coil's field-brightness channel is driven by U(t)=½Li² every frame AND `coil`/`bfield` serve as glow_focal (S1/S3/S7) → exemption: peers dim, live emissive never overwritten — §0b req 5 |
| `field3d_formula_overlay_generic_not_cambria_math` (OPEN) | Dedicated panel reused from `ac_resistor` — §0b req 6 |
| Rule-34d chrome collision (`field3d_sliders_panel_top12_vs_fsbtn_top10` pattern) | Every overlay this scenario adds (lag bracket is in-pane; U-gauge, wattmeter, ghost legend) specced `top:52px+`/corner-disjoint — §10h |
| Concrete before abstract | S1 is pure phenomenon (beads pause at the v-peak, field breathes at the v-zero — visible, unnamed); the lag named S2; mechanism S3; law S4; Xₗ number S5; power S6–S7; calculus dead last (S8) |
| Reveal synced to narration | Cue plan §3 — ghost dock, real-trace sweep, lag-bracket land, emf-arrow flips, tangent samples, f-ramp window, product walk, meter dock, lobe-cancel each land on their narrating sentence via `scenario_cue`; `at_ms` fallbacks kept for THE EYE |
| Coordinate sim + graph — ONE live parameter moves both | The single state-clock phase drives beads, field loops, U-gauge, HUD AND every trace dot in lockstep in every state; never a static curve |
| Show a quantity live when it's named | The lag bracket lands exactly as "a quarter cycle late" is spoken (S2); Xₗ readout climbs exactly as the ramp runs (S5); U-gauge docks as "stored in the field" is said (S6) |
| Don't pre-spoil a later reveal | No i-trace before S2; no ⟨ ⟩ notation before S7; no p-strip before S6; amplitude formula deferred to S5 (S2 teaches only WHEN i peaks, not how big); no phasor arrow anywhere (two concepts away); f slider LOCKED until S5 — see §3 note (in this concept, unlike the sibling, dragging f changes the amplitude and would pre-spoil S5) |
| Visual must match narration | "runs late" = the real trace visibly peaking after v + beads pausing at v-peak; "fights the change" = emf arrow flipping to oppose rising AND falling i; "nothing consumed" = needle held dead at 0.00 W + coil body never glowing |
| Distinct reference lines | vₘ peak line (v-trace) and iₘ peak line (i-trace) separately labelled; the lag bracket is its own annotation between the two peaks, never conflated with either; the p-strip keeps its own highlighted zero baseline (which p now CROSSES — the sibling's touched-never-crossed contrast) |
| Colour each element by its own sign/identity | v-trace and i-trace keep the sibling's exact colours (chapter continuity); ghost trace = dashed grey; p-strip third colour with distinct store/return lobe tints; coil field loops COOL blue-cyan geometry, never heat-orange (the coil must read COLD — §3 Rule 33 plan) |
| Register the NEW scenario in `deriveStateMeta.ts` in the SAME change | §0b req 8 — per-mode reveal/settle pins for all 9 modes |
| No frozen tail / one-shots hold end pose | Ghost trace, lag bracket, lobe-cancel hold end pose + `reveal_hold` declared; beads/field/traces sustain ≥0.1%/frame motion in every state including S7's dead-needle beat (needle dead; field and U-gauge breathing) |
| Explorers must move / Rule 37 | S9 free-runs by construction; trusted drag seizes manual |
| Don't gate visuals on the clock in slider states | S9 renders every element at full immediately; cue gates guarded at t=0 |
| Specific `visible_elements` tokens | Proposed `acl_*` tokens in §0b — final CLOSED enum is owned by the engine dispatch's JSON contract (Stage 1b precedent: the log's contract DEVIATED from the skeleton's guess; json_author builds against the LOG, not this guess) |

**DC Pandey check:** no DC Pandey content consulted this dispatch. Scope validated against the founder-approved Ch.7 map + the NCERT §7.3 index named in the dispatch brief. No teaching sequence, example problem, or figure imported from any source book. All physics re-derived from v = L di/dt + trig (verified numerically in §2's locked numbers, including the ∫p dt = ½Liₘ² lobe-area check).

---

## 0b. Engine triage + ask — Class-B (engine delta FIRST), sibling-clone scale

**Triage verdict: Class B — `json_author` may NOT start until a renderer delta lands — but NOT a from-scratch scenario like Stage 1b.** The dispatch brief asked concretely: can `ac_resistor` be extended pure-JSON (Class A)? **No.** Five hard gaps make JSON-only impossible:

1. `ac_resistor` computes i = v/R **in-phase by construction**; no config key produces a phase-shifted current (the entire concept).
2. Its p-strip renders p ≥ 0 against a floor baseline; this concept's p swings **±10 W symmetric** (negative lobes below zero are the S6 teaching).
3. Its energy counter is **monotone by construction** (dE/dt = p ≥ 0); this concept needs a **breathing** stored-energy gauge U = ½Li² that returns to zero twice per cycle.
4. Its apparatus has a heater, no coil, no field loops, no back-emf arrows (the S3 mechanism band).
5. No ghost-trace, lag-bracket, or tangent-cursor machinery exists in any scenario.

**Decision: NEW `scenario_type: "ac_inductor"`, built as a CLEAN STANDALONE SIBLING of `ac_resistor`** (not new modes bolted into `ac_resistor` — that scenario is SEALED under a shipped concept (`72910d1`) and its mode enum is resistor-specific; fleet convention is one scenario per concept family). **Build scope for THIS dispatch: `ac_inductor` alone.** The engine dispatch must **NOT refactor the sealed `ac_resistor` scenario** as part of this build — no shared-helper extraction, no touching its shipped code paths; the expected mechanism is CLONING from the manifest below into the new scenario. Shared-helper factoring across the `ac_*` family is **explicitly DEFERRED** to a future deliberate decision, made when ≥2 real reusers actually exist and the true shared surface is known (`ac_voltage_capacitor` mirrors this family but is not identical; `series_lcr_circuit`, `ac_power_factor`, and `lc_oscillations` diverge further) — it is not decided now, and never by an autonomous dispatch on this concept's authority. The reuse note below is **informational only**, kept as a forward-looking clone-source list for that eventual decision.

**REUSE manifest (advisory clone-source NOTE — what exists in `ac_resistor` for this build to CLONE; informational for any future factoring decision, never a mandate):** sine-stamped source + wires + oscillating-bead system (`bead_frac` machinery — pure math change: bead velocity ∝ the now-lagging i(t)) · dual-strip scope pane with colour-matched dual y-scales, tracking dots, peak/level lines · sampling-cursor + product-walk cue machinery · arc+needle averaging meter (new trivial mode `avg_p`) · dedicated Cambria-Math formula/derivation chain-dock panel · drag-seize guard helper · local phase-accumulator pattern (f live-draggable) · `#sliders` exclusion chain, `__PM_supportsTimePin`, no-backticks, Rule 27 stable `acl_*` IDs.

**NEW machinery (the genuine asks — physics_author sizes; runs in-loop via CHAPTER_LOOP §3b):**

1. **Coil apparatus** — a multi-turn coil in the heater's slot (same home pose otherwise — Rule 32d at chapter scale), with breathing field loops whose brightness/density tracks |i| (equivalently U). Field loops are **cool blue-cyan geometry** and the coil **body never receives any emissive** (the coil must read COLD in every state — the anti-heater). Field-loop direction flips with the current's sign at zero crossings, synced to the existing wire arrow. **Ships an authored `field_lines` block in the JSON** (createTubeLine scar class).
2. **Phase machinery on the scope** — i-trace drawn as iₘ sin(ωt − π/2) live by the clock; a **static dashed grey ghost trace** iₘ sin(ωt) (the in-phase "resistor's rhythm") with a short legend label; a **lag bracket** annotation between the v-peak and the i-peak reading "1.0 s = ¼ cycle = 90°". **The real trace is CLOCK-DRAWN, never produced by animating/morphing the ghost sideways** — a phase-slide morph would draw intermediate phase angles that correspond to no device on screen (binding; the §0a precision-checklist item 2).
3. **Scripted f-ramp (S5)** with **drag-seize + DOM-thumb+label lockstep** (`ghost_compare_cause_invisible_slider_frozen` pattern) AND — because ω changes mid-state — **phase = the closed-form integral of the scripted ω(τ) profile while undragged** (pure function of t, rewindable under THE EYE's time pin; baseline-triple only on genuine drag) per the B1 fix pattern `field3d_dt_accumulated_motion_invisible_to_eye_timepin`. Trace y-scales rescale smoothly on the ramp (continuous, no per-frame jitter). **Plus S4's live `vₘ` slider (DF2, cycle 1) — a strictly SIMPLER guard:** nothing scripts vₘ, so there is NO thumb-lockstep and NO closed-form-phase duty; the slider is plainly live from t=0 — tangent tilt, trace amplitudes, HUD, and the three stop readouts recompute continuously (each stop's slope value is computed as vₘ/L live, never hardcoded 3.14 A/s) — and a grab conflicts with nothing scripted (the cursor walk keeps running on the state clock).
4. **Signed p-strip + signed product walk (S6)** — symmetric ±range about a highlighted zero baseline the curve now CROSSES; product bars extend DOWNWARD for p < 0 (signed pointwise v·i, never magnitude); store/return lobes tinted distinctly; one store-lobe shading readout "area = 6.37 J" (the U link).
5. **U = ½Li² stored-energy gauge** — a breathing bar/gauge 0 ↔ 6.37 J, twice per cycle, docked beside the coil; the coil field-loop brightness is driven by the same U(t) every frame and is **EXEMPTED from `applyGlowEmphasis`** (coil/bfield are also glow_focals in S1/S3/S7 → emphasis = dim peers only, never overwrite the live emissive).
6. **Back-emf arrow pair (S3)** — source-drive arrow vs induced-emf arrow on the coil, the induced arrow always opposing the CHANGE (flips role as i goes from rising to falling), plus a live HUD pair `v = +7.1 V / ε_back = −7.1 V` mirrored at every instant. **Formula surfaces on the dedicated Cambria-Math panel** (clone `#acr_formula`/`#acr_derivation`), never the generic `#formula_overlay`.
7. **Tangent-walk cursor (S4)** — the sampling cursor carries a live tangent arrow on the i-trace whose tilt tracks v instant-by-instant; three cue-gated sample stops (v-peak/steepest-climb, v-zero/flat-crest, v-negative-peak/steepest-fall). Static cue-gated markers acceptable per the Stage 1b simplification precedent.
8. **Same-change duties:** `deriveStateMeta.ts` registration + settle pins for all 9 modes; specific `visible_elements` tokens (proposed: `acl_source | acl_beads | acl_arrow | acl_coil | acl_bfield | acl_emf_arrows`; DOM panels via typed flags per the Stage 1b contract convention — **the engine dispatch's JSON-contract log entry is the authoritative final enum**, Stage 1b precedent). **Proposed CLOSED glow-key enum:** `source · beads · arrow · coil · bfield · backemf · v_trace · i_trace · ghost_trace · lag_bracket · tangent · xl_readout · p_strip · u_gauge · meter · formula`.
9. **Regression duty (§3b verify chain):** re-seed + THE EYE on **`capacitance`** (the reliable field_3d baseline sample per the B2 process correction — NOT `faraday_law_induction`, which has no committed baseline in this worktree) — must stay 44/44, H2 = 0.00%; plus `ac_voltage_resistor` re-run stays 39/39 clean (guards that the clean-sibling build left the SEALED scenario's code paths untouched).

---

## 1. Atomic claim

This concept teaches how a pure inductor responds to a sinusoidal AC voltage — the current lags the voltage by exactly a quarter cycle because the voltage sets the current's SLOPE (v = L di/dt, the back-emf fighting every change), the opposition is the frequency-made reactance Xₗ = ωL, and the average power is exactly zero (energy is borrowed into the field and fully returned) — and only that. It does not cover the capacitor's mirror behaviour (deferred to `ac_voltage_capacitor`), the rotating-vector formalism (deferred to `phasors`), inductor DC transients / LR time constants (taught in `inductance`, shipped), or combining L with R and C (deferred to `series_lcr_circuit`).

---

## 2. State count + arc

**9 states** — four ideas (the lag · the mechanism/law behind it · the frequency-made opposition · the zero-net-power energy shuttle) carried by 8 guided beats + explore. Complex band (7–9, CLAUDE.md §5): justified because this concept must first DEMOLISH the prior its own sibling just installed ("current copies voltage") before it can build, and because L is the first AC element whose opposition and power story both differ from everything the student has seen. Mirrors the sibling's 9-state rhythm deliberately (chapter-scale pacing continuity; `ac_voltage_capacitor` will mirror this arc again for a cheap, beautiful L↔C symmetry going into `series_lcr_circuit`). The hook MOVES from t=0; no static setup state.

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 `coil_joins_the_circuit` | Same AC source, heater swapped for an ideal coil — everything still oscillates, but the beads pause at the WRONG moment and the coil stays cold (both visible, unnamed) | *(straightforward beat — omit)* |
| S2 `current_lags_quarter_cycle` | 16a CONFRONTATION — the resistor-trained expectation (dashed ghost, in phase) vs the real current, peaking exactly ¼ cycle late | *(straightforward beat + contrast)* |
| S3 `coil_fights_change` | WHY, mechanism — the coil answers every change with an opposing emf, volt for volt (Faraday/Lenz inside its own turns) | *(straightforward beat)* |
| S4 `voltage_sets_the_slope` | **PRIMARY AHA** — v = L × slope of i: voltage steers the current's steepness, not its size — so the ¼-cycle lag is geometrically inevitable | *(straightforward beat)* |
| S5 `reactance_grows_with_frequency` | The opposition is frequency-made: Xₗ = ωL, iₘ = vₘ/Xₗ — the same coil chokes fast AC 5× harder than slow AC | *(straightforward beat + contrast)* |
| S6 `power_swings_both_ways` | p = v·i goes NEGATIVE half the time — quarter-cycles of storing into the field alternate with quarter-cycles of giving back | *(straightforward beat)* |
| S7 `nothing_consumed` | SUPPORTING AHA — the wattmeter sits dead at 0.00 W and the coil never warms: reactance opposes without eating (the anti-resistor) | *(straightforward beat + contrast)* |
| S8 `one_integral_both_results` | ADVANCED TAIL — integrate v = L di/dt once: the −cos IS the 90° lag and the 1/ωL IS the reactance; p = −(vₘ·iₘ/2)sin 2ωt, lobes cancel exactly | `derivation_first_principles` |
| S9 `ac_inductor_sandbox` | Explore — vₘ, f, L live; traces, beads, field breathing, HUD all continuous | `exploration_sliders` |

**Locked physics numbers (chapter-continuity by design):** defaults **vₘ = 10.0 V, f_demo = 0.25 Hz (T = 4.0 s), L = 10/π ≈ 3.18 H** → **ω = π/2 rad/s and Xₗ = ωL = 5.00 Ω EXACTLY** — the deliberate echo of the sibling's R = 5.0 Ω — so **iₘ = 2.00 A exactly, the same peak current as last lesson**, and the S2 ghost is literally the sibling's current trace. **Lag = T/4 = 1.0 s** on screen (the bracket reads "1.0 s = ¼ cycle = 90°"). **p swings ±10.0 W** (amplitude vₘiₘ/2), **⟨p⟩ = 0**; **U_max = ½Liₘ² = 20/π ≈ 6.37 J**, and the shaded store-lobe area of p(t) equals exactly 6.37 J (∫p dt over a store quarter = ½Liₘ² — verified: (10/π)(cos 2π − cos π) = 20/π ✓). **S5 sweep: Xₗ = 20f Ω exactly** → f = 0.1 Hz: Xₗ = 2.0 Ω, iₘ = 5.0 A; f = 0.5 Hz: Xₗ = 10.0 Ω, iₘ = 1.0 A — a 5× visible amplitude collapse. Slider ranges: vₘ 2–20 V · f_demo 0.1–0.5 Hz · L 1.0–10.0 H. **Edge-corner FLAG for physics_author:** vₘ=20, f=0.1, L=1.0 → iₘ = 31.8 A — confirm graph auto-scale + bead clamp absorb it honestly, or floor L.

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Coined archetypes (one-line justifications):**
- `ghost-overlay-compare` (S2) — a wrong-expectation GHOST TRACE docks in the same pane and the real trace visibly diverges from it; distinct from `twin-compare` (no second apparatus — the compare object is a hypothesis) and from `cycle-compare` (not phases of one apparatus in time). Fleet-inspired by the `capacitance` ghost-compare beat.
- `tangent-walk` (S4) — a cursor walks a curve carrying its live TANGENT, mapping the cause (v) to the slope of the effect (i); distinct from `reveal-build` (nothing new docks — an existing trace is re-read through its steepness).
- `ramp-response` (S5) — a scripted parameter ramp with the response's amplitude ENVELOPE and a live readout tracking it; distinct from `oscillate/track` (what is watched is the envelope across the ramp, not the oscillation itself).
- `trace-product` (S6) and `chain-link-derivation` (S8) — fleet reuse (coined on `ac_voltage_resistor` / `capacitance`).

**Control-gating note (deliberate, and OPPOSITE to the sibling):** in `ac_voltage_resistor` S1 exposed `f` safely because R is frequency-blind. Here **f is LOCKED until S5** — dragging f changes iₘ = vₘ/(ωL) and would pre-spoil S5's whole reveal. The lock is itself the lesson's shape: frequency is this concept's star variable and gets its own state. **vₘ, by contrast, goes LIVE at S4 (DF2 — control added, cycle 1):** the state that teaches v→slope exposes the one handle on v — the same Rule-31 contextual-control principle that locks f, applied in the positive direction. Dragging vₘ steepens every tangent in step with the taller v-trace while the i-crest stays pinned at the v-zero, so the teacher demonstrates the taught causation (voltage sets the slope) AND its geometric invariance (the lag never moves, at any voltage) live — with zero spoil risk: vₘ is frequency-blind and touches neither the 90° phase nor S5's reactance story.

| State | depth_ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26) | Δ cue (≤5 words) | Live controls | glow_focal | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `coil_joins_the_circuit` | **core** | Same source, new component: an ideal coil (near-zero resistance — its only power is magnetism); everything still oscillates | `oscillate/track` | Home pose = the sibling's apparatus with the coil in the heater's slot; scope docked right. From t=0 the v-trace draws with its vₘ peak line, beads rock, the wire arrow flips, cool blue field loops breathe around the coil. TWO strange things are visible but unnamed (deliberate plants, §Block 2): the beads PAUSE and turn exactly when v is at its PEAK, and the field swells brightest exactly when v is ZERO. The coil body never glows | "Heater out, coil in" | none (see gating note) | `coil` | manual_click | 30–45 w |
| S2 `current_lags_quarter_cycle` | **core** | The current does NOT copy the voltage — it peaks exactly ¼ cycle (90°) late | `ghost-overlay-compare` (coin) | The dashed grey ghost docks first — "the resistor's rhythm," last lesson's exact 2.00 A in-phase trace (wrong expectation shown first, 16a). A readable beat: the beads visibly DISOBEY it (paused at v-peak where the ghost claims maximum flow). Then the REAL i-trace sweeps in, clock-drawn, same iₘ = 2.00 A, peaking 1.0 s after v; the lag bracket lands: "1.0 s = ¼ cycle = 90°". iₘ marked; how BIG the current is stays an open question (deferred to S5 — phrased with no forward state-reference) | "Current arrives quarter-cycle late" | none | `i_trace` | manual_click | 40–55 w |
| S3 `coil_fights_change` | **core** | The mechanism: changing current → changing flux through the coil's own turns → induced emf OPPOSING the change, volt for volt | `cycle-compare` | A→B→A′ loop on the coil close-up (camera nudges in — the one new thing): **A** (i rising): flux loops thicken, the induced-emf arrow points AGAINST the drive; **B** (i falling): flux collapses, the arrow FLIPS to prop the current up — it opposes the change both ways, never the current itself. HUD pair mirrors live all state: `v = +7.1 V` / `ε_back = −7.1 V` — equal and opposite at every instant (the Rule 33c real number) | "Coil fights every change" | none | `backemf` | manual_click | 35–50 w |
| S4 `voltage_sets_the_slope` | **core** | **PRIMARY AHA** — v = L × (slope of i): voltage steers the current's steepness, so i must crest exactly where v vanishes — the ¼-cycle lag is inevitable | `tangent-walk` (coin) | The cursor walks the traces carrying a live tangent arrow on the i-curve, its tilt tracking v. Three cue-gated stops: **t=1.0 s** — v at +10.0 V peak → i climbing STEEPEST (through zero); **t=2.0 s** — v = 0 → tangent goes FLAT exactly as i coasts over its +2.00 A crest; **t=3.0 s** — v at −10 V → steepest fall. The beads' S1 pause is called back: they turn where the push is strongest because the push sets their acceleration of flow, not their flow. **Live vₘ:** dragging the voltage steepens every tangent in step with the taller v-trace while the crest stays PINNED at the v-zero — magnitude scales, timing never moves (stop readouts live-computed: slope = vₘ/L, never a hardcoded 3.14) | "Voltage sets the slope" | **vₘ** (live; no scripted driver — see §0b req 3) | `tangent` | manual_click | 40–55 w |
| S5 `reactance_grows_with_frequency` | **extended** | The opposition is frequency-made: Xₗ = ωL, iₘ = vₘ/Xₗ — same coil, different frequency, different choke (16a pivot #2) | `ramp-response` (coin) | Scripted eased f-ramp 0.25 → 0.5 → 0.1 → 0.25 Hz, **thumb + numeric label in lockstep, drag-seize on grab, phase via the closed-form ∫ω dτ (B1 scar pattern — §0b req 3)**. As f climbs: the i-envelope collapses 2.00 → 1.0 A and beads barely budge before turning back ("turned around before they get going" — the micro WHY); as f falls: iₘ swells to 5.0 A. The live Xₗ readout tracks 5.0 → 10.0 → 2.0 → 5.0 Ω. One clause: "the resistor never cared about frequency — the coil is deaf to nothing else" | "Faster swing, stronger choke" | **f_demo** (drag-seize + thumb-lockstep) | `xl_readout` | manual_click | 40–55 w |
| S6 `power_swings_both_ways` | **extended** | p = v·i is negative half the time — quarter cycles of storing into the field alternate with quarter cycles of paying back | `trace-product` (fleet reuse) | The p-strip docks with its zero baseline highlighted. The cursor walks one period starting at a store-quarter boundary: v and i share sign → SIGNED bars rise, U-gauge fills 0 → 6.37 J, field loops swell; then signs DISAGREE → bars extend BELOW zero, U-gauge drains back to 0, field collapses — energy flowing back out. The curve **crosses** zero (the sibling's curve only touched it). The shaded store lobe shows "area = 6.37 J" = exactly the gauge's peak | "Power flows both ways" | none | `p_strip` | manual_click | 40–55 w |
| S7 `nothing_consumed` | **extended** | SUPPORTING AHA + 16a pivot #3 — ⟨p⟩ = 0 exactly: the coil borrows and returns; opposition without consumption | `null-result-hold` | The meter (avg_p mode) docks; its needle sits DEAD at 0.00 W cycle after cycle — while 2.00 A of peak current visibly flows, the field breathes, the U-gauge fills and empties. The coil body: cold, never a glow (vs the sibling's heater at a steady 10.0 W on the SAME source with the SAME 5-ohm opposition). Formula lands: ⟨p⟩ = 0, U = ½Li² — borrowed, returned | "Average power: exactly zero" | none | `meter` | manual_click | 30–45 w |
| S8 `one_integral_both_results` | **advanced** | One integration of v = L di/dt yields BOTH headline results: −cos = the 90° lag, and the 1/ωL prefactor = the reactance; and p = −(vₘiₘ/2)sin 2ωt averages to zero exactly | `chain-link-derivation` (fleet reuse) | Apparatus holds pose dimmed (`reveal_hold`). Chain docks on the Cambria-Math panel: v = L di/dt → i = −(vₘ/ωL)cos ωt = iₘ sin(ωt − π/2) — the ω landing in the denominator IS Xₗ's frequency dependence. Then p = −(vₘiₘ/2)sin 2ωt; on the p-strip each positive half-lobe **rotates 180° about its trailing zero crossing** onto the following negative lobe — exact point-symmetry congruence, areas cancel pairwise, ⟨p⟩ = 0 exact (not approximate). End pose held | "One integral, both results" | none | `formula` | manual_click | 45–55 w |
| S9 `ac_inductor_sandbox` | **core** (ring-neutral) | Synthesis — the whole instrument under the teacher's hands | `drag-sandbox` | Free-runs forever (Rule 37). vₘ, f, L all live — traces re-scale, beads re-pace, field re-breathes, HUD (v, i, iₘ) tracks. Formula surface: "i lags v by ¼ cycle (90°)" (core-only, 38b). p-strip, Xₗ readout, U-gauge deliberately ABSENT (extended-ring content — §10 i-2) | "All yours" | **ALL: vₘ · f_demo · L** | `formula` | interaction_complete | 0 / open |

**No-repeat audit:** oscillate/track · ghost-overlay-compare · cycle-compare · tangent-walk · ramp-response · trace-product · null-result-hold · chain-link-derivation · drag-sandbox — nine states, nine distinct archetypes, none static, no contrast-pair repeat needed; drag-sandbox explore-only.

**Rule 32 plan.** 32a cause-first with a readable beat everywhere: ghost docks THEN beads disobey THEN real trace sweeps (S2); i rises THEN the emf arrow answers (S3); cursor reads v THEN the tangent tilts (S4); f ramps THEN the envelope collapses (S5); signs disagree THEN the bar drops below zero THEN the gauge drains (S6). **⚠ 32a caution — binding on physics_author/json_author (the mirror of the sibling's in-phase caution):** the quarter-cycle lag IS the taught physics — it must come from computing i(t) = iₘ sin(ωt − π/2) exactly, **never from a hand-tuned frame delay**, and the ghost must stay a static dashed hypothesis, **never animated sliding into the real trace** (intermediate phases correspond to no device on screen). 32b one variable per state (S1 the swap, S2 the timing, S3 the emf duel, S4 the slope reading, S5 f, S6 the product, S7 the average). 32c the Δ column verbatim as caption openers. 32d ONE apparatus from S1's home pose (itself quoting the sibling's home pose at chapter scale); p-strip docks at S6 and persists through S8; camera moves twice (nudge-in S3, frame-graph S8). 32e one glow focal per state from the CLOSED enum (§0b).

**Rule 33 plan (macro↔micro).** Macro band = circuit + scope traces + instruments; micro band = beads (the charges) + the coil's field-loop interior. Per-state micro story with its real number: **S1** beads pause at v-peak, field swells at v-zero (excursion ∝ iₘ/ω — same A_frac calibration as the sibling at defaults, clamps [0.08, 0.42]); **S2** beads visibly disobey the ghost at the sampled instants; **S3** ε_back = −v mirrored live (±7.1 V HUD pair); **S4** tangent slope = v/L (3.14 A/s at the v-peak stop); **S5** excursion collapses ∝ 1/ω² while iₘ reads 5.0 → 1.0 A — the charges "turned back before they get going"; **S6** U-gauge 0 ↔ 6.37 J with the store-lobe area = 6.37 J link; **S7** the null is on the METER only — beads, field, gauge all alive around a dead needle (the paradox made visible); **S8** dimmed hold (scope motion carries Rule 26); **S9** all live. Instruments per 33d: signed HUD `v`/`i` (i 2dp signed; **p 1dp SIGNED here, unlike the sibling's unsigned** — p goes negative), ε_back readout (S3), live Xₗ readout (S5), U-gauge with numeric J value, avg-p needle meter dead at 0.00 W (S7).

**Cue plan.** S2 ghost-dock s1, bead-disobey beat s2, real-sweep s3, lag-bracket on the naming sentence; S3 arrow-flip loop synced to the rising/falling clauses; S4 three tangent stops on s2–4; S5 ramp window opening on the "watch what faster does" sentence; S6 walk window + U-gauge dock; S7 meter dock s1, ⟨p⟩ = 0 land on the naming sentence; S8 chain docks s1–2, lobe-rotation s3. All via `scenario_cue` + `deriveStateMeta` pins; `at_ms` fallbacks kept.

---

## 4. Misconception confrontation plan (Rule 16a — exactly THREE pivots)

| Genuine wrong belief | Pivot state + beat |
|---|---|
| **"Voltage and current always move together — Ohm's rhythm is universal"** (the prior the sibling concept just installed, named in the dispatch brief) | **S2 (the concept's front door).** `visual_counter:` the dashed in-phase ghost (last lesson's literal trace) docks first; the beads visibly disobey it; the real trace peaks 1.0 s late with the ¼-cycle bracket · `one_line_fix:` "Only the resistor is that obedient — a coil's current always runs a quarter-cycle behind." |
| **"A component's opposition is a fixed property, like resistance"** | **S5.** `visual_counter:` the SAME coil, nothing about it changed, quintuples its opposition as f ramps — Xₗ readout 2.0 → 10.0 Ω, iₘ 5.0 → 1.0 A · `one_line_fix:` "A coil's opposition isn't built in — the frequency makes it fresh: Xₗ = ωL." |
| **"The coil fights the current all cycle, so it must be burning energy — reactance heats like resistance"** | **S7.** `visual_counter:` the wattmeter needle dead at 0.00 W while 2.00 A peak flows; the coil body cold forever (vs the sibling's heater eating 10.0 W from the same source through the same 5 Ω of opposition); the U-gauge filling and fully draining · `one_line_fix:` "Reactance stores and returns; only resistance eats." |

No other state carries a `misconception_watch` (founder guardrail 2026-07-04). "Back-emf opposes the current itself" was already confronted in the shipped `inductance` concept — S3's "the change, never the current" clause re-encounters it as straightforward teaching, not a new pivot. No EPIC-C branches (EPIC-L-first directive).

## 5. `has_prebuilt_deep_dive` states

**S2** — the chapter's hinge confusion; documented patterns: "why lag and not lead", "how can current be maximum when voltage is zero", "what does 90° even mean without a circle". **S4** — the mathematical abstraction (slope-vs-value reasoning; the calculus-shy student's wall) and the PRIMARY aha. **S7** — the power paradox (reactance-vs-resistance; "where does the energy GO"). **Divergence from the pivots documented:** pivots sit at S2/S5/S7 but the deep-dive investment goes to S4 over S5 — S4 is where students who accept the lag still can't REPRODUCE it (the derivative-reasoning stuck point), while S5's Xₗ confusions are substantially resolved by S7's power contrast; investment follows stuck-ness, not pivot count. Cache-hint only, not a gate (Rule 18).

## 6. Drill-down clusters

**S2:** `why_lag_not_lead` · `current_max_when_voltage_zero` · `quarter_cycle_90_degrees_meaning`
**S4:** `slope_vs_value_confusion` · `v_equals_L_didt_meaning` · `why_exactly_quarter_cycle`
**S7:** `reactance_vs_resistance_heating` · `where_stored_energy_goes` · `zero_power_but_current_flows`

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_4   # the lag + why (contains the PRIMARY aha, S4)
  reactance:    STATE_5             # X_L = ωL, frequency dependence
  power:        STATE_6 → STATE_7   # zero average power, energy shuttle
  derivation:   STATE_8
  exploration:  STATE_9
```

Default aspect = `foundational`. **Foundational-coverage rule satisfied directly: the PRIMARY aha (S4) sits INSIDE the foundational range — no exit-pill required.** Optional cross-slice pills: end of foundational → "So how big is the current? →" routes to `reactance`; end of `reactance` → "And what does all this opposition cost? →" routes to `power`; S7 → "Why exactly a quarter cycle? →" routes to S8. Every aspect is a valid classifier `aspect` value.

## 8. Prerequisites (advisory only — Rule 23)

- `ac_voltage_resistor` (shipped, Ch.7 #1) — the baseline AND the prior this concept confronts; cliff at S2.
- `inductance` (shipped, Ch.6) — L, ε = −L dI/dt, U = ½LI², "current never jumps"; cliff at S3/S4.
- `faraday_law_induction` (shipped, Ch.6) — flux change → induced emf, Lenz; cliff at S3 (via `inductance`).

Required-by (rest of Ch.7): `ac_voltage_capacitor` (the mirror sibling), `phasors` (formalizes THIS lag), `series_lcr_circuit`, `ac_power_factor`, `lc_oscillations`, `transformer`.

## 9. Real-world anchor (Rule 35 + 38f)

**Primary — the loudspeaker crossover coil.** Inside almost every two-way speaker sits a plain coil of wire in front of the bass driver. It lets the drumbeat through and chokes the treble — the SAME coil, opposing different frequencies by different amounts, exactly Xₗ = ωL doing its job. And it does this without warming up: a resistor placed there would waste the music as heat; the coil merely borrows energy and hands it back, twice every cycle. One device, both headline results (frequency-made opposition + zero dissipation), owned by students everywhere — the widest-syllabus-overlap inductor there is (38f). Culture-neutral, physics-true at every depth.
**Secondary (narration-only):** the choke — the current-limiting coil in fluorescent-tube ballasts, LED drivers, and motor soft-starters. Engineers reach for a coil precisely when they need to hold AC current back WITHOUT paying the resistor's heat bill; the name "choke" is the concept in one word. Mains frequency phrased neutrally throughout ("the mains frequency") — 35b.

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the nine of §2, ids as named, `state_count: 9`, contiguous STATE_1–STATE_9.

**(b) Symbol-label table** (dialect per 38d — dual-label once, then bare):

| Quantity | On-canvas label | First |
|---|---|---|
| instantaneous voltage | HUD `v = +7.1 V` (signed, 1dp) + v-trace (sibling's exact colour) | S1 |
| peak voltage | dashed `vₘ` line on the v-trace | S1 |
| frequency | slider "Frequency f" (demo-compressed; narration clause: real mains is tens of hertz); ω inside formula surfaces only | S1 (spoken) / S5 (slider) |
| time | scope x-axis `t (s)` | S1 |
| the inductor | `L` tag on the coil; spoken once as "the inductor — a coil"; "ideal — near-zero resistance" clause | S1 |
| current + peak | HUD `i = +1.41 A` (signed, 2dp) + i-trace (sibling's colour) + `iₘ` marker | S2 |
| the ghost | dashed grey trace, short legend "in-phase guess (resistor's rhythm)" | S2 |
| the lag | bracket between v-peak and i-peak: `1.0 s = ¼ cycle = 90°` | S2 |
| back-emf | opposing arrow on the coil + readout `ε_back = −7.1 V`; spoken once as "the back-emf — the coil's answering voltage" | S3 |
| inductance (slider) | slider "Inductance L" | S9 (first live) |
| reactance | live readout `Xₗ = 5.0 Ω`; spoken once as "inductive reactance — the coil's opposition, in ohms" | S5 |
| instantaneous power | p-strip trace + HUD `p = −7.1 W` (**SIGNED, unlike the sibling**); highlighted zero baseline the curve CROSSES | S6 |
| stored energy | U-gauge `U = 4.25 J` (2dp) + store-lobe shading `area = 6.37 J` | S6 |
| cycle-average power | meter `⟨p⟩ = 0.00 W`; ⟨ ⟩ re-used from the sibling (spoken once as "the average over a full cycle") | S7 |

**Formula surface per state (Rule 34b — ONE each; notation ladder 38c: calculus confined to the advanced ring — the core states carry the slope-WORD form, di/dt debuts only in S8):** S1 `v = vₘ sin(ωt)` · S2 `i = iₘ sin(ωt − 90°)` · S3 none (the ε_back HUD pair does the work) · S4 `v = L × (slope of i)` · S5 two-line `Xₗ = ωL` / `iₘ = vₘ/Xₗ` · S6 `p = v·i` · S7 two-line `⟨p⟩ = 0` / `U = ½Li²` · S8 chain: `v = L·di/dt → i = −(vₘ/ωL) cos ωt = iₘ sin(ωt − π/2)` then `p = −(vₘiₘ/2) sin 2ωt → ⟨p⟩ = 0` · S9 `i lags v by ¼ cycle (90°)` (core-only, 38b). All real Unicode across all THREE text paths (34c): vₘ iₘ Xₗ ω π ε ⟨ ⟩ ½ ° − × ¼ — **FLAG json_author/engine: verify the `ₗ` subscript glyph (U+2097) in the sprite font AND the 9px canvas path (the exact B2 scar class — canvas labels need the Cambria-Math font swap); fallback = styled small "L", never ASCII `X_L`.** Degrees (90°) in core/extended; radians (π/2) debut in S8 alongside the calculus.

**(c) RHR plan:** N/A as a performed rule — no hand object, no cross-product state. Field-loop direction around the coil flips with the current's sign at every zero crossing, visibly synced to the wire arrow (direction consistency, not direction teaching — coil field geometry was taught in `magnetic_field_solenoid`/`inductance`). Stated deliberately, not omitted.

**(d) Motion plan:** the §3 table is it — every state's motion named, none static; S7's null beat carries bead/field/gauge motion around the dead needle; S8's apparatus holds pose (`reveal_hold`) while the scope carries the motion.

**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`. `renderer_pair` = field_3d/field_3d; `available_renderer_scenarios.field_3d = ["ac_inductor"]`. `advance_mode`: 8× `manual_click` + 1× `interaction_complete` (Gate 12 ✓; no `wait_for_answer`/`pause_after_ms`/`narrative_socratic` anywhere).

**(f) Assessment + coverage:** AUTHOR the 6-question backward-designed `assessment` + `coverage_map`. Q1 lag fact + direction (lags, not leads; ¼ cycle) → S2 (S1 context: the pure-inductor idealization as a distractor stem) · Q2 mechanism — why the lag exists (back-emf fights change; voltage sets slope) → S3/S4 · Q3 instantaneous reading — i when v peaks (zero, crossing steepest) and v when i peaks (zero) → S4 · Q4 compute iₘ = vₘ/(ωL); effect of doubling f (or L) → S5 · Q5 ⟨p⟩ = 0 + where the energy goes (stored ½Li², returned) → S6/S7 · Q6 exact forms i = iₘ sin(ωt − π/2), p = −(vₘiₘ/2)sin 2ωt → S8. `non_assessed_states: [S9]`. `misconception_watch` at exactly S2, S5, S7. Distractors drawn from the three pivot beliefs (in-phase; fixed opposition; reactance heats).

**(g) Macro↔micro plan:** §3 Rule 33 block — per-state micro story + real number + live instruments, declared.

**(h) Canvas budget (Rule 34):** caption = the ≤5-word Δ cue only, top-center; narration prose in the capStrip below the canvas; ONE Cambria-Math Unicode formula surface per state (list above); HUD value-only, top-right at `top:52px+`; scope pane right; U-gauge + meter lower-left zone; lag bracket and ghost legend live INSIDE the scope pane (no new floating overlays); sliders panel per the existing fixed pattern — all corners disjoint, nothing clipping the chrome Full-screen button (34d). **Authored `field_lines` block REQUIRED in `field_3d_config`** (this scenario draws coil flux loops — createTubeLine scar class, §0a).

**(i) Curriculum-flex block (Rule 38):**

**(i-1) Coherence check, BOTH preset cuts:**
- **Hide advanced (S8):** S1–S7 + S9 survive. S5 asserts iₘ = vₘ/Xₗ empirically (the ramp's live numbers), S7 asserts ⟨p⟩ = 0 empirically (the dead meter + draining gauge); no surviving narration/caption/formula references the integration, π/2 radians, or the lobe-rotation proof. **Constraint on physics_author: S5/S7 narration must never say "we'll prove this later."** **Coherent** — the full quantitative lesson.
- **Hide advanced + extended (S5–S8):** S1–S4 + S9 survive. Lesson = coil in AC → current lags ¼ cycle → because the coil fights change → because voltage sets the slope → explore. No surviving state names Xₗ, reactance, p, ⟨ ⟩, or U (S2's amplitude deferral is phrased as an open question, never a forward state-reference; S9's HUD is v/i/iₘ only — iₘ named in S2, core). Dragging f/L in S9 visibly changes iₘ — that is explorable phenomenon, not a reference to hidden content. **Coherent** — a complete qualitative-lag lesson.

**(i-2) Explore = core-ring only (38b):** S9 surfaces the lag statement + live v/i/iₘ values + vₘ/f/L sliders ONLY. The p-strip, Xₗ readout, and U-gauge are deliberately ABSENT from S9 (strict 38b — teachers reach those numbers in S5–S7, which carry their own instruments).

**(i-3) `curriculum_tags` (claims, not facts — 38g; only CBSE/NCERT marked verified at authoring time):**

| Curriculum | Coverage | Note |
|---|---|---|
| CBSE/NCERT Class 12 (+ JEE/NEET) | **✓ full — verified** | NCERT §7.3 exactly: lag, Xₗ = ωL, zero average power; S8 = the §7.3 integration itself |
| CAIE A-level 9702 | **✗ absent (believed)** | 9702's AC topic is rms + rectification; reactance/phase believed not in syllabus · `needs_teacher_verification` |
| Cambridge IGCSE 0625 | **✗ absent (believed)** | No AC circuit element analysis · `needs_teacher_verification` |
| IB DP Physics (2023) | **✗ absent (believed)** | AC circuit analysis believed removed in the 2023 reform · `needs_teacher_verification` |
| AP Physics 2 | **✗ absent (believed)** | DC circuits only · `needs_teacher_verification` |
| AP Physics C: E&M | **◐ marginal (believed)** | Inductance + back-emf (S1–S4 conceptual arc) in CED; sinusoidal reactance/AC steady state believed beyond it · `needs_teacher_verification` |
| Ontario SPH4U | **✗ absent (believed)** | · `needs_teacher_verification` |

**(i-4) Preset proposal (hide, never reorder — 38h/25d):** CBSE/NCERT + JEE/NEET → **S1–S9 (all)** · AP C E&M → S1–S4, S9 opt-in (the reduced cut is exactly its conceptual overlap) · all others → none shipped pending teacher verification (full or reduced set on opt-in). No preset teacher-visible until a real teacher of that curriculum confirms (38g).

**(i-5) Graph-axis convention (38e):** time-domain traces, t on x — universal (NCERT Fig 7.7 convention and standard everywhere); v and i overlaid on a shared time axis with colour-matched dual y-scales; p in its own stacked strip against its own zero baseline. **No genuine board conflict → no axis-swap toggle.** The one representational decision with cross-board force — phasor vs time-domain — is settled by the chapter map itself: time-domain only here, phasors two concepts later.

**TTS:** author `teacher_script` EN now; `text_hi` via the Rule-30g Sonnet-5 subscription sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h). **Registration (8 sites):** `ac_voltage_inductor.json` · `concept_panel_config`/`CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP` → field_3d · `VALID_CONCEPT_IDS` · deep-dive flags (S2/S4/S7) · synonyms n/a · `PCPL_CONCEPTS` N/A · `CLASSIFIER_PROMPT` + the five aspects; plus clusters migration (file-only per trial rules) + `_seed_ac_voltage_inductor_cache.ts`. **THE EYE:** 9/9 after the §0b delta lands; eye-walker ∥ quality-auditor; zero new scar rows; regression = **`capacitance` 44/44 H2 0.00%** (the reliable baseline sample — B2 correction) + `ac_voltage_resistor` 39/39; founder-drive hand-tests the S4 vₘ drag + the S5 ramp grab + S9 sliders (trusted drags — THE EYE can't fire them).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `ac_voltage_resistor` breaks at **S2** if the in-phase baseline isn't owned — patch clause: "last time, with a resistor, current copied the voltage instant for instant — that habit is this dashed curve" (the ghost teaches the prerequisite to anyone who missed it, as a hypothesis rather than a callback). `inductance` breaks at **S3/S4** if L and back-emf are unfamiliar — S3 patch clause: "a changing current changes the coil's own flux, and the coil answers with an opposing emf — Faraday and Lenz working inside one component"; S4 patch clause names L in passing as "the coil's stubbornness constant — flux per ampere." `faraday_law_induction` is patched by the same S3 clause. Each is a single clause, not a re-teach.

**JEE-backwards trace.** *"A voltage v = 10 sin(ωt) V, f such that ω = π/2 rad/s, is applied across a pure 10/π H inductor. Find (i) the peak current, (ii) the phase of the current relative to the voltage, (iii) the current at the instant the voltage is maximum, (iv) the average power drawn over a cycle, (v) the peak current if the frequency is doubled, and (vi) the maximum energy stored in the inductor."* → (i) iₘ = vₘ/(ωL) = 2.00 A: **S5** (these exact numbers) · (ii) lags by π/2: **S2** (fact) + **S8** (exact form) · (iii) zero — crossing at its steepest: **S4** (the first tangent stop, verbatim) · (iv) zero: **S7** · (v) halves (Xₗ doubles): **S5** · (vi) ½Liₘ² = 6.37 J: **S6/S7**. Assertion-reason variants ("back-emf opposes the change, not the current") → **S3**. No missing piece; no state the trace doesn't use (S1 grounds the pure-inductor idealization every stem assumes). M1–M6 carve-out N/A (not Ch.26).

**Misconception entry mapping (16a).** The three pivots of §4, each a contrast beat with the wrong expectation's consequence drawn first (S2's ghost IS the wrong answer, drawn dashed on screen). **Planting audit:** (1) S1's two strangenesses (beads pausing at v-peak, field peaking at v-zero) are deliberate plants — flagged here, named at S2 and resolved at S4. (2) S3's "coil fights change" could plant "the coil fights the current / blocks it entirely" → prevented at the planting moment by the S3 clause "the change, never the current itself — a steady current would sail through free" (also the correct seed for the DC-behaviour contrast that `series_lcr_circuit` and `transformer` will lean on). (3) The cool-blue breathing field could be read as heat/glow → prevented by design: the field is geometric line-work, never incandescent tinting, and the coil BODY never glows; S7 names the coldness. (4) The demo-compressed frequency plant → S1 clause reuse ("slowed enormously for watching; real mains reverses every few milliseconds"). (5) S2's ghost could plant "the ghost is a real second circuit" → the legend names it a guess ("in-phase guess"), dashed grey, never animated.

## Block 2 — Aha-moment designation

- **PRIMARY (S4):** *Voltage doesn't set an inductor's current — it sets the current's SLOPE; so the current must crest exactly where the voltage vanishes, and the quarter-cycle lag isn't coil magic, it's geometry.*
- **SUPPORTING (S7):** *A coil that visibly fights the source all cycle consumes exactly nothing — it borrows energy into its field and returns every joule, twice per cycle.* (The anti-resistor: the chapter's power-factor story starts here.)
- **Cohesion:** S7 is the energy-ledger consequence of S4's structure — two sinusoids a quarter-cycle apart multiply into a product that is symmetric about zero; the supporting aha is the primary aha read through p = v·i. One primary + one supporting; nothing stands alone.
- **Wrong-belief setup:** for S4 — S1 plants the strangeness, S2 confirms the lag as raw fact but leaves it feeling ARBITRARY ("some sluggishness of the coil"), S3 gives a fight but not yet the exactness; the student arrives at S4 confident the lag is a vague delay and is broken by its geometric inevitability (exactly ¼, not "roughly late"). For S7 — S3 builds "fighting all cycle must cost something" (confident), S6 shows power going negative (surprising), S7 lands the exact zero on a dead needle.
- **Foundational-coverage rule:** PRIMARY aha (S4) is INSIDE `entry_state_map.foundational` — satisfied directly, no exit-pill needed.

---

## Escalations / FLAGs for downstream

1. **Engine delta first (§0b)** — `scenario_type: "ac_inductor"` lands via the CHAPTER_LOOP §3b engine loop before json_author starts. **Build scope = `ac_inductor` ALONE, as a clean standalone sibling cloned from the §0b manifest; the SEALED `ac_resistor` scenario (`72910d1`) must NOT be refactored as part of this build.** The manifest's cross-concept reuse note is informational only — shared-helper factoring is deferred to a deliberate future decision once ≥2 real family reusers exist and the true shared surface is known. Regression sample = **`capacitance`** (44/44, H2 0.00%) per the B2 process correction, NOT `faraday_law_induction`; plus `ac_voltage_resistor` 39/39 (guards the sealed sibling stayed untouched).
2. **Binding 32a mirror-caution:** the lag comes from computing i = iₘ sin(ωt − π/2) exactly — never a frame delay, and the ghost is NEVER animated into the real trace (a phase-slide draws devices that don't exist). The sibling's caution was "never inject a lag"; this concept's is "never fake the lag."
3. **S5 re-hits yesterday's freshest scar class** (`field3d_dt_accumulated_motion_invisible_to_eye_timepin`): the scripted f-ramp must drive phase via the closed-form ∫ω(τ)dτ while undragged — pure function of t, rewindable under `SET_TIME_FREEZE` — with the B1 baseline-triple pattern on genuine drag. Also full `ghost_compare` thumb-lockstep + drag-seize on the same slider.
4. **f is LOCKED in S1–S4 by design** (it changes amplitude here, unlike the sibling) — quality_auditor should treat a live f slider before S5 as a design defect, not a missing control.
5. **No-phasor discipline:** no rotating vector anywhere, in any fix cycle — `phasors` (two concepts away) owns that formalization; the "¼ cycle = 90°" bracket is the deliberate seed.
6. **Sibling-mirror seed for `ac_voltage_capacitor`:** this arc (ghost-compare → mechanism → slope/lead → reactance → power slosh) is designed to mirror cheaply — the capacitor's ghost beat shows current LEADING, its reactance FALLS with f (1/ωC), its power story is identical. Author the capacitor skeleton against this one for the L↔C symmetry `series_lcr_circuit` will exploit.
7. **quality_auditor:** re-run the live `engine_bug_queue` SQL at Gate 8; verify the `ₗ` glyph across all three text paths; verify the coil body never receives emissive in any frame; check the built sim against the §3 control table.
8. **Anchor discipline:** crossover coil / choke live in NARRATION only; nothing speaker-shaped is drawn (Rule 24).

---

## Self-review checklist

- [x] Atomic claim ONE sentence; exclusions named with deferral targets (capacitor, phasors, LR transients, LCR).
- [x] State count 9 = complex band, justified (must demolish the sibling-installed prior + four ideas; chapter-rhythm mirror).
- [x] Per-state control table present: teaches × archetype × distinct motion × Δ × controls × glow × advance_mode × budget × `depth_ring`.
- [x] Nine distinct archetypes, none static, no repeats (no contrast pair needed); 3 coins + 2 fleet-reuses, each justified in one line; drag-sandbox explore-only.
- [x] Rule 32 plan (incl. the concept-specific "never fake the lag" 32a caution); one glow focal per state from a proposed CLOSED enum (final enum owned by the engine dispatch's JSON contract — Stage 1b precedent).
- [x] Rule 33 macro↔micro plan per state with real numbers (±7.1 V mirror, 3.14 A/s tangent, 6.37 J lobe-area = gauge-peak link) + live instruments (33d).
- [x] Rule 34 canvas budget: one formula surface per state, Δ-cue captions, value-only HUD (p SIGNED — difference from sibling flagged), zone map clearing chrome; `field_lines` block required.
- [x] Rule 38: `depth_ring` column; qualitative → quantitative → derivation order; advanced ring (S8) contiguous immediately before explore; BOTH cuts checked coherent (with the no-forward-reference constraint made binding on physics_author); explore core-only (p-strip/Xₗ/U deliberately absent from S9); `curriculum_tags` with `needs_teacher_verification` on every non-CBSE cell; presets derived (hide, never reorder); graph-axis convention decided (no conflict, no toggle); anchor = widest-syllabus-overlap device (38f).
- [x] Misconception_watch at exactly 3 genuine pivots (S2, S5, S7), contrast beats with the wrong expectation drawn first; no per-state tic; no EPIC-C branches.
- [x] 3 `has_prebuilt_deep_dive` states with 3 clusters each; S4-over-S5 divergence from pivots documented.
- [x] `teaching_method` per state; no `narrative_socratic`; ≥2 advance_modes; no wait_for_answer/pause_after_ms.
- [x] `entry_state_map` with foundational + 4 aspects; PRIMARY aha (S4) inside foundational — coverage rule satisfied directly.
- [x] Prerequisites advisory, all three shipped (`ac_voltage_resistor`, `inductance`, `faraday_law_induction`), cliffs named with single-clause patches.
- [x] Anchor universal + culture-neutral (crossover coil / choke), plain English, physics-true at depth; mains constants neutral (35b).
- [x] DoD complete, zero TBDs (assessment mapped by tested idea, symbols tabled, RHR N/A stated deliberately, motion plan = table, modes declared, edge-corner FLAG for physics_author).
- [x] Engine bug queue consulted via mirror + engine log + all 8 scar-candidate rows; live-SQL gap FLAGged to Gate 8; the OPEN `field3d_new_scenario_engine_ask_precision_checklist` directive's four items each explicitly closed in §0b; both post-seal ride-along scars (B1 time-pin, B2 Unicode-subscript) applied forward.
- [x] Engine triage explicit per the dispatch brief: Class-A reuse honestly evaluated and rejected with five named hard gaps; Class-B clean-standalone-sibling delta declared FIRST with an ADVISORY reuse manifest (clone-source note; build scope = `ac_inductor` alone; sealed `ac_resistor` untouched; helper factoring deferred until ≥2 real reusers exist); json_author blocked until it lands.
- [x] Block 1 + Block 2 complete (cliffs, JEE trace incl. assertion-reason, 5-item planting audit, PRIMARY + 1 supporting, cohesion, wrong-belief setups).
- [x] M1–M6 carve-out N/A (not a Ch.26 magnetism concept).
- [x] Checkpoint-A cycle-1 fixes applied: **DF1** (§0b reuse block reframed advisory + clean-standalone-sibling scope + sealed-`ac_resistor` protection + factoring deferred; escalation §1 aligned; consequential accuracy edits to §0a row 1, §0b req 9's rationale, and the triage bullet above) · **DF2** (call = ADD the live vₘ at S4 — the drag demonstrates both the causation and the lag's vₘ-invariance; S4 row, §3 gating note, §0b req 3, §10 hand-test list updated). Everything else byte-identical to cycle 0; approved design untouched.
- [x] Handoff-ready for founder-proxy Checkpoint A re-review (scope: §0b reuse block, S4 control cell, §0b req 3), then physics_author.