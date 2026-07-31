I have everything I need: the number lock re-derived, the CSS anchors read (not remembered), the scar directives, the phasors handoff seed, and the fleet archetype vocabulary. Verifying my own arithmetic before committing (X_L = 20.000·f Ω; X_C = 1.2502/f Ω; work-point f = 0.50 Hz → X_L 10.00 / X_C 2.50 / Z 9.01 / iₘ 1.11 A / φ 56.3°; mirror f = 0.125 Hz swaps the reactances exactly; f₀ = 1/(2π√(3.1831·0.1273)) = 0.25002 Hz ✓; at the work point V_R 5.55 + V_L 11.09 + V_C 2.77 = 19.41 V arithmetic vs 10.00 V phasor ✓; instantaneous checks +3.08 +9.23 −2.31 = +10.00 ✓). The skeleton follows.

---

# ARCHITECT SKELETON — `series_lcr_circuit`

> Ch.7 concept 5/8 of the CHAPTER_LOOP run (docs/CHAPTER_LOOP.md), written for founder-proxy Checkpoint A.
> Sibling references (all SEALED): `ac_voltage_resistor` (`6b97ede`), `ac_voltage_inductor` (`35ae566`+`eae16ca`),
> `ac_voltage_capacitor` (`21e1f0f`+`832b1d3`+`219937d`), `phasors` (`62911da`+`9c50ad5`+`04185ac`+`b0a9cf0`).
> Binding handoff packet: `docs/loop_runs/ch7/phasors/skeleton.md` Escalation §5 + `phasors.json` scope prose —
> every DELIVERS/WITHHOLDS clause there is consumed below. This is the concept the whole chapter was engineered
> toward: the withheld set (tip-to-tail addition, reactance numerals side by side, impedance, the resonance
> coincidence) is THIS sim's front door.

**Chapter:** Class 12, Ch.7 Alternating Current — NCERT §7.6 "AC Voltage Applied to a Series LCR Circuit"
(table-of-contents reference only; teaching authored from first principles; no NCERT sequence/example/figure
imported). `concept_id: series_lcr_circuit`, label "Series LCR Circuit — Impedance and Resonance".
**Renderer:** `field_3d` — NEW `scenario_type: "ac_series_lcr"` (Class-B triage; manifest in §0b).
**Position:** 5th of 8 in the founder-approved (reordered 2026-07-22) Ch.7 map: `ac_voltage_resistor →
ac_voltage_inductor → ac_voltage_capacitor → phasors → series_lcr_circuit → ac_power_factor →
lc_oscillations → transformer`. **This sim teaches SYNTHESIS, not element mechanisms** — the three element
behaviours arrive as one-clause settled callbacks, never re-derived (the no-re-teaching constraint, inherited
twice over). Power, power factor and wattless current are NOT touched (deferred to `ac_power_factor`); free
LC energy slosh is NOT touched (deferred to `lc_oscillations`).

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL is not executable from this architect dispatch (no Bash/DB tool — same gap as all four sibling
dispatches; **FLAG to quality_auditor: re-run `query_engine_bug_queue.ts series_lcr_circuit` +
`--field3d --open` at Gate 8**). Consulted in full: `docs/FIELD3D_SCENARIO_CHECKLIST.md`, `docs/loop_runs/
ch7_state.md` (all notes through the phasors seal + the post-seal S8 picker fix `b0a9cf0`),
`docs/loop_runs/ch7/phasors/founder_proxy_report_checkpointC.md`, and `docs/loop_runs/ch7/_engine/
scar_candidates.sql` (all rows read, including the four phasors Checkpoint-A architect rows and the engine-build
probe row). Prevention rules applied:

| Scar / prevention rule | How this skeleton satisfies it |
|---|---|
| **`field3d_new_scenario_engine_ask_precision_checklist` (OPEN directive, scoped to the remaining Ch.7 concepts = THIS dispatch)** | All four items closed in §0b: (1) THREE scripted parameter ramps exist (S2 f-glide 0.25→0.50, S7 f-step 0.50→0.125, S8 f-sweep 0.125→0.50→settle 0.25) — each is a closed-form pure function of the state clock (E3), each MOVES THE SLIDER THUMB visibly (`ghost_compare_cause_invisible_slider_frozen` killed), each is grabbable via the drag-seize pattern; S9's R-steps likewise; (2) every arrow/curve operation named arithmetically in §2/§3 (fan angles from ONE θ(t) + constant offsets; chain node positions = cumulative vector sums of the same phasor set; triangle legs = chip values ÷/× iₘ; plot curves = X_L = 2πfL, X_C = 1/(2πfC), iₘ = vₘ/Z(f)); (3) `applyGlowEmphasis` exemption declared for the live-rotating fan arrows and the live plot dot (dim peers, never overwrite the transform — the total-noop scar); (4) dedicated Cambria-Math formula/derivation panel (`slcr_formula`), never the generic overlay |
| `skeleton_zone_map_asserts_pane_geometry_never_checked_against_built_overlay_css` (OPEN, alex:architect — a PHASORS scar) | Every relative-placement claim below cites READ CSS: siblings' scope 320×150 `bottom:210px;left:12px` (`field_3d_renderer.ts:24377/:25285/:26526`), power slot 320×110 `bottom:88px;left:12px` (`:24382/:25290/:26531`), `phs_band` 500×170 `bottom:185px;left:12px` (`:27684–27686`). The new `slcr_band` clones the `phs_band` envelope exactly; **the 13 px CSS overlap between the band (185–355 px) and the power slot's top (88–198 px) is noted and harmless HERE (the power pane never displays in this scenario — reserved empty all chapter) but is a REAL conflict for `ac_power_factor` — flagged in the handoff seed** |
| `one_shot_over_constrained_by_both_phase_target_and_narration_cue` (OPEN, alex:architect) | ALL one-shots follow the phasors F2 semantics — **cue ARMS, phase/ramp-position FIRES**; every displayed number is DERIVED from the actual firing instant; no authored instant at t = 0 of any state; S4's two freezes fire at the next occurrence of their θ targets after arming |
| `oncanvas_numeric_coincidence_shown_unqualified_with_only_narration_as_guard` (OPEN, alex:architect) | The chapter's coincidences are AUDITED one by one in §10k: X_L = X_C at the S8 crossing is TAUGHT (allowed, and the operating condition `f₀ = 0.25 Hz` renders beside it anyway); the Q = 1 artifacts (X_L(f₀) = R = 5.0; V_L = V_C = vₘ = 10.0 at f₀; Δf = f₀ = 0.25 Hz) are DESIGNED AROUND — V chips ring-gated OFF in S8, the R = 5 width never chipped in S9, and S9 + explore structurally break the false identity live |
| `skeleton_zone_map_sizes_a_subregion_without_a_content_fit_check` (OPEN, alex:architect) | §10h gives per-sub-region fit statements: max curve count, longest label, y-ranges (incl. the V_L = 11.09 V > vₘ excursion and X_C(0.1) = 12.5 Ω), gutter margins — for the strip, the disc region, the plot pair and the chip rows |
| `field3d_freeze_window_must_be_phase_time_subtraction_not_render_halt` (OPEN probe_definition — phasors engine build) | S4's two freezes (and the S5 stop) inherit the phase-time-subtraction contract verbatim: freeze = subtraction from the closed-form phase clock, pose holds, no >1° jump at release, byte-stable under `SET_TIME_FREEZE`; the probe is a REQUIRED Checkpoint-B artifact for S4 |
| "Presence is not correctness" directives (negative-form checks need existence assertions; visibility-restoring fixes need fresh content review) | §10j is a dedicated existence-assertion table (12 pairings) — every ABSENT/NEVER claim paired with a positive probe (chain head-to-tail docking proven by node-distance, not asserted; beads proven to thread ALL THREE elements; X-chip absence before S6 paired with composed presence in S6; etc.) |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (FIXED; recurred once) | ONE closed-form θ(t) per state drives fan, strip pen, chain rotation and HUD; ramps are closed-form in state-t; re-anchor only on a genuine drag (the `acc_`/`phs_` phase-anchor pattern cloned). NO dt-accumulator anywhere |
| `field3d_dim_apparatus_one_way_with_no_restore_on_state_exit` (FIXED, E4) | S10 dims with the pristine-capture + restore-on-else pattern; S11 reached through S10 ships BRIGHT — MEASURED, not asserted (§10j) |
| `field3d_canvas_caption_text_not_cleared_between_sequential_reveals` (F1) + `latched_phase_claim_caption` (E2) | S4's two freeze captions and S8's crossing caption use the clearRect single-latest pattern; live-gating for any "at this instant" claim |
| `field3d_readout_hud_emits_untaught_ring_quantity` (F3) + `hardcoded_sprite_label_prespoils_later_state_reveal` | HUD ring-gated per state (§10b): X/Z chips from S6, φ numeral from S7 (the arc may READ earlier — a delivered phasors tool), plots S8+, Q chips S9 ONLY, derivation chain S10 ONLY, V chips OFF in S8 (coincidence guard); explore = core-ring only |
| `field3d_duplicate_formula_surface` | ONE formula surface per state (§10b list); S2 deliberately has NONE (the mystery state withholds the law) |
| `field3d_rms_subscript_ascii_in_renderer_text_paths` (B2) + the compose-routine chapter law | ALL authored strings carry pinned ASCII tokens — `X_L`, `X_C`, `V_R`, `V_L`, `V_C`, `v_m`, `i_m` — composed to styled subscripts on all THREE text paths, zero literal underscores. The compose decision (clone vs promote) is §0b sub-issue (a) |
| `slider_step_grid_offset_when_min_is_nonzero` (LIVE since phasors F8) | L default 3.1831 H and C default 0.1273 F sit OFF the family grids (step 0.1 / 0.02): off-grid initial value + true-number HUD + snap-on-first-drag, documented per row by json_author (phasors F8 precedent) |
| `canvas_graph_label_collides_with_peak_reference_line` (E9) + Rule 34d chrome collision | Chip rows, plot gutter labels and the struck-sum chip placed on clear baselines (§10h); `top:52px+` both edges; `founder:drive` collision probe + cropped-frame pixel inspection for canvas-internal text (the F7 substitute) |
| `live_player_caption_order_probe_via_filltext_interception` (OPEN probe_definition; hook exists for `phs_band` at `:27481`) | Cloned for `slcr_band` in the SAME engine delta; run on S4/S5/S8 as a REQUIRED Checkpoint-B artifact |
| `field3d_createtubeline_undefined_field_lines_throws` (FIXED) | Conditional duty: if any tie-line/curve uses `createTubeLine`, the JSON authors a `field_3d_config.field_lines` block — resolved by the engine dispatch's JSON contract |
| Concrete before abstract | S1 opens on the MACHINE (three familiar elements docking into one loop, beads threading them), not a definition; the disc/abstraction returns at S3; algebra dead last (S10) |
| Reveal synced to narration / show a quantity live when named | Cue plan §3 — each dock, strike, freeze, chain link, morph, flip, crossing and derivation link lands on its narrating clause |
| Coordinate sim + graph — ONE live parameter moves both | The f-ramps drive beads, fan, chips, triangle, plot dot and curves in lockstep (one clock); L/C drags in explore move the CROSSING and the peak together |
| Don't pre-spoil | No X/Z chip before S6; no φ formula before S7; no resonance plot before S8; no Q before S9; no f₀ derivation before S10; **no power quantity, trace or formula ANYWHERE (the power slot stays empty — `ac_power_factor`'s front door)** |
| Visual must match narration | "the coil and plates erase each other" = the X-leg visibly shrinking to nothing + the chain's vertical arrows mutually annihilating; "the current roars back" = beads accelerating + the plot dot climbing the peak |
| Colour each element by its own identity | §0b sub-issue (b): cyan = source voltage / amber = current (chapter law); V_R white · V_L violet · V_C green; the net-X leg takes the live WINNER's colour (sign-driven); Z rides cyan (v = iₘZ — same family as the source, meaningfully) |
| No frozen tail / one-shots hold end pose / Rule 37 | Chain closure, morph, flip and scoreboard-class holds all `reveal_hold`; S11 free-runs by construction; declared stops bounded (S5 assembly stop; S4 freezes ≤1.0 s each, ≤3.0 s total) |
| Don't gate visuals on the clock in slider states | S11 renders everything at full immediately; cue gates guarded at t = 0 |
| Rule 39g | The new panels follow the discovery conventions (inline `position:fixed` dynamic panels, `_row` slider rows) — ⚙ toggles are inherited free, nothing to author |

**DC Pandey check:** no DC Pandey content consulted this dispatch. Scope validated against the founder-approved
Ch.7 map + the NCERT §7.6 table-of-contents entry only. No teaching sequence, example problem, or figure
imported from any source. All physics re-derived from the series constraint (one i(t)) + KVL + the settled
element phase facts, and verified numerically against the chapter's locked numbers in §2.

---

## 0b. Engine triage + ask — Class-B (engine delta FIRST)

**Triage verdict: Class B — `json_author` may NOT start until a renderer delta lands.** Honest Class-A
evaluation against `ac_phasor` (the closest sibling): can it be extended pure-JSON? **No.** Six hard gaps:
(1) every sealed scenario renders ONE element in the slot — this concept needs all THREE in series
simultaneously, beads threading heater→coil→plates in one loop (new apparatus geometry); (2) `ac_phasor`
draws exactly TWO co-rooted arrows (source v + i) — this concept needs a FIVE-arrow fan with per-element
voltage phasors; (3) tip-to-tail chain machinery exists NOWHERE (phasors existence-asserted co-rooted-only as
a design guarantee — the addition move was deliberately never built); (4) no triangle overlay or unit-morph
(V-triangle → Ω-triangle) machinery; (5) no X-vs-f / iₘ-vs-f plot pane (the resonance-sweep instrument);
(6) the freeze machinery must implement the OPEN phase-time-subtraction probe contract. *Extend a sealed
element scenario instead?* No — same gaps plus no disc. **Decision: NEW `scenario_type: "ac_series_lcr"`,
built as a CLEAN STANDALONE SIBLING of the `ac_*` family. No refactoring of any sealed scenario**
(`6b97ede`/`35ae566`+`eae16ca`/`21e1f0f`+`832b1d3`+`219937d`/`62911da`+fixes) — the mechanism is CLONING;
the family-factoring decision remains the founder's at chapter end.

**REUSE manifest (ADVISORY clone-source note, per the DF1 ruling — never a mandate):** chapter home pose
(source ring, wire loop, slot geometry — widened to three slots); HUD `top:52px; right:12px`; formula panel
`top:40%; right:22px`; sliders `bottom:12px; right:12px`; the `phs_band` combined left-band canvas pattern
(500×170, `bottom:185px; left:12px`, `field_3d_renderer.ts:27684–27686` — disc region left, strip region
right, shared internal y-axis); apparatus assets heater/coil/plates (cloned from their siblings, **bead/current
tint forced amber regardless of the sealed inductor's colour defect** — phasors Escalation-§3 precedent);
sine-stamped source + bead machinery; clock-drawn pen + dashed ghost + legend; cue/`scenario_cue` machinery +
F1 caption pattern + F2 arm/fire semantics + F3 ring-gate + E3 closed-form anchors + E4 dim-restore +
Rule-27 stable IDs; the `phs_band` fillText-interception hook pattern (`:27481`).

**NEW machinery (the genuine asks — physics_author sizes; runs in-loop via CHAPTER_LOOP §3b):**

1. **Three-element series apparatus** — the chapter loop widened to three slots; heater, coil, plates docked
   in series (S1 reveal-build one-shots); ONE amber bead stream threading all three in lockstep (same flow
   crest passes all three — the series fact made visible); element label tints matching their voltage-phasor
   colours (white/violet/green — the Rule-33 zoom-link). All meshes + beads registered in sceneObjects with
   elementType discriminators (the unbuilt-beads scar class).
2. **`slcr_band` combined left-band canvas** — clone of the `phs_band` geometry (500×170,
   `bottom:185px;left:12px`; top edge 355 px inside the sealed 360 px envelope). Disc region left
   (~160 px square): the FIVE-arrow fan (i amber + V_R white + V_L violet + V_C green + source v cyan),
   φ arc, and — per state — the chain / triangle constructions. Strip region right (~330 px): the chapter's
   trace conventions (t-on-x, vₘ/iₘ gutters, signed values); **re-purposable per state** (the phasors S6
   scoreboard-split precedent): in S8/S9/S11 the strip region switches to the RESONANCE PLOT PAIR — upper
   X-vs-f (X_L line rising, X_C curve falling, crossing marked), lower iₘ-vs-f (peak), **shared f-axis,
   crossing and peak VERTICALLY ALIGNED** (the visual argument). The power slot (`bottom:88px;left:12px`,
   `:24382/:25290/:26531`) stays EMPTY in every state (reserved for `ac_power_factor`).
3. **Rigid fan rotation** — one closed-form θ(t) + per-arrow constant offsets (i at 0° reference; V_R at 0°,
   V_L at +90°, V_C at −90°, source v at +φ_circuit); voltage arrows share ONE volt scale (their lengths ARE
   comparable — the point), i on its own amber scale (never length-compared across units — the phasors
   honesty clause inherited).
4. **Tip-to-tail chain machinery (the front door — never built before, by design)** — cue-armed one-shots:
   fan ghosts in place; solid copies translate one at a time into the chain (V_R along the reference from the
   root; V_L from V_R's tip; V_C antiparallel back down from V_L's tip); closure flash when the chain tip
   lands on the ghosted source-arrow tip (tip-distance probe, §10j). Chain then rotates rigidly with the
   resumed clock; the chain-tip's projection re-draws the source trace over its ghost (congruence probe —
   the phasors pen machinery reused).
5. **Triangle + unit-morph** — the closed chain's right triangle detaches (rotation stopped), re-scales
   ÷ iₘ in one scripted morph, re-labels V→Ω (compose-routine tokens); the X-leg's colour is LIVE
   SIGN-DRIVEN (violet when X_L wins, green when X_C wins, gone at zero); declared honestly as a
   representation morph, not physics motion (the Rule-29 exemption class, scripted like the phasors S5 flip).
6. **Resonance plot pair + scripted f-ramps** — closed-form thumb-visible ramps (S2 glide, S7 step, S8
   sweep-then-settle, S9 R-family re-sweeps with ghosted prior curves); live dot riding the iₘ curve;
   crossing marker; off-axis f₀ edge-indicator with true number for explore extremes (L·C pushing f₀ outside
   0.1–0.5 Hz — see §2 edge FLAGs).
7. **Freeze machinery under the phase-time-subtraction contract** (the OPEN probe_definition — implement it
   in this scenario and run the probe on S4 as a Checkpoint-B artifact).
8. **Compose routine — sub-issue (a), the decision this concept finally forces.** This scenario renders
   `X_L` and `X_C` side by side across all three text paths (chips, plot gutter labels, formula panel) —
   the ORIGINAL promotion trigger. Status quo: `accComposeSegments` is `acc_`-scoped with a `phs_`-scoped
   clone; the fleet promotion was DECLINED at the phasors build and decoupled as a founder decision
   (Checkpoint-C §5 item 3). **Default path authored here (trial-safe): a third, `slcr_`-scoped clone —
   works, touches zero sealed code.** **Stated recommendation to the founder: promote NOW** — three
   identical copies is the classic rule-of-three trigger, and every remaining Ch.7 concept (`ac_power_factor`
   reads cos φ off these same diagrams) will need it too. The promotion executes ONLY on explicit founder
   approval at the engine-dispatch boundary; sealed call sites are NOT migrated either way; if promoted, the
   four sealed siblings' EYE re-runs become LOAD-BEARING regression proof, not ceremony.
9. **Colour semantics — sub-issue (b), declared (founder ruling still pending, not consumed).** Chapter law
   authored here: **cyan = voltage, amber = current** (the capacitor's correct convention, phasors'
   precedent). NEW object classes get: **V_R white · V_L violet · V_C green** (voltage-family hues distinct
   from amber; matched to element label tints and the X-curve colours — violet X_L rising, green X_C
   falling, instantly readable at the S8 crossing); **Z = cyan** (meaningful: v = iₘZ — Z is the source
   phasor per ampere). This scenario forces amber beads in its cloned coil asset regardless of the sealed
   inductor's in-place defect; the founder's ruling on fixing `ac_inductor` remains open and untouched.
10. **Same-change duties:** `deriveStateMeta.ts` registration + settle pins for all 11 modes (proposed enum:
    `series_build | off_home | fan | kvl_stack | tip_to_tail | z_triangle | lead_lag_flip | resonance_sweep |
    sharpness | derivation | explore`); proposed `visible_elements` tokens `slcr_circuit | slcr_beads |
    slcr_fan | slcr_arc | slcr_chain | slcr_triangle | slcr_strip | slcr_reso_plot | slcr_chips |
    slcr_formula`; **proposed CLOSED glow-key enum:** `circuit · trace · fan · i_phasor · v_phasor ·
    vr_phasor · vl_phasor · vc_phasor · chain · triangle · reso_plot · formula`; slider rows vₘ/f/R/L/C with
    ramp-drives + drag-seize; the F7 caption-order probe clone; overlays `top:52px+`; `founder:drive`
    collision probe + cropped-frame inspection after the delta. **The engine dispatch's JSON-contract log
    entry is the authoritative final enum set.**
11. **Regression duty (§3b verify chain):** `capacitance` 44/44 H2 0.00% + ALL FOUR sealed siblings re-run
    clean (`ac_voltage_resistor` 39/39, `ac_voltage_inductor` 39/39, `ac_voltage_capacitor` full count,
    `ac_phasor` 35/35) + the zero-sibling-internal-lines diff grep. **Every §3b dispatch prompt restates: no
    DB writes — files only** (the Stage-2 process-violation lesson, verbatim duty).

---

## 1. Atomic claim

This concept teaches what happens when R, L and C share one series AC circuit — one common current, three
element voltages at their settled angles, which add tip-to-tail (never arithmetically) into the source
voltage, giving the circuit a net reactance X_L − X_C, an impedance Z = √(R² + (X_L − X_C)²), a phase angle
tan φ = (X_L − X_C)/R, and one special frequency f₀ = 1/(2π√(LC)) where the two reactances erase each other
and the current peaks at vₘ/R — and only that. It does not re-derive the element mechanisms (settled in the
three sealed siblings; callbacks only), does not treat power, power factor or wattless current (deferred to
`ac_power_factor` — no power quantity renders anywhere), does not treat free LC oscillation (deferred to
`lc_oscillations`), and does not use complex numbers (not in syllabus scope).

---

## 2. State count + arc

**11 states** — very-complex band (10–12, CLAUDE.md §5), and this is the honest count, not padding: the
chapter's synthesis carries FOUR new quantities (net X, Z, φ, f₀), ONE new representation operation (phasor
addition — the front door phasors held shut), TWO genuine misconception pivots, one extended-ring skill (Q)
and one advanced derivation, while every element fact is compressed to a one-clause callback. Graded against
merging: S4+S5 stay separate (the failure and the fix are each a full motion beat); S6+S7 stay separate (Z
closes the magnitude mystery, φ closes the timing mystery — two distinct readings planted at S2); nothing
else is mergeable without stacking two ideas in one state.

**The narrative spine — a mystery opened, then closed:** the sim starts AT the chapter's home defaults,
which secretly sit at resonance. S1 plants the mystery (2.00 A, exactly the bare-heater value, "as if the
coil and plates weren't there"); S2 steps OFF the home frequency and the hidden machinery wakes (current
falls to 1.11 A and slips 56.3° late); S3–S7 build the machinery that explains both numbers; S8 sweeps back
through 0.25 Hz, the reactance curves cross, and the mystery resolves: **the chapter's default operating
point was the resonance point all along** — the payoff four sealed concepts were engineered toward.

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 `three_in_series_one_current` | The series fact: one loop, one current threads all three — current becomes the shared reference; the 2.00 A mystery planted | *(straightforward beat)* |
| S2 `off_home_frequency` | The mystery opens: off the home f the current shrinks AND slips late — the circuit has hidden machinery | *(straightforward beat)* |
| S3 `three_voltages_three_angles` | All three element voltages at once, each at its settled angle on the common clock (callbacks ×3); the source arrow matches NONE of them | *(straightforward beat)* |
| S4 `peaks_dont_add` | 16a PIVOT #1 — peak voltages don't add (19.41 ≠ 10.0); INSTANTS add, signs and all (KVL at every moment) | *(straightforward beat + contrast)* |
| S5 `tips_to_tails` | SUPPORTING AHA — phasor addition revealed: tip-to-tail, V_L and V_C antiparallel, the chain closes exactly onto the source | *(straightforward beat)* |
| S6 `the_impedance_triangle` | Divide the chain by the one current → the Ω triangle: R, X_L−X_C, Z = √(R²+X²); the current mystery closes (iₘ = vₘ/Z = 1.11 A ✓) | *(straightforward beat)* |
| S7 `who_leads_who_lags` | tan φ = (X_L−X_C)/R; the winning reactance sets lead/lag — mirror demo at f = 0.125 Hz (same Z, opposite sign) | *(straightforward beat)* |
| S8 `the_crossing_resonance` | **PRIMARY AHA** + 16a PIVOT #2 — X_L and X_C cross at f₀ = 0.25 Hz: Z collapses to R, current roars back to 2.00 A; the S1 mystery resolves | *(straightforward beat + contrast)* |
| S9 `sharpness_and_q` | R sets how sharp the peak is — Q = f₀/Δf; small R = choosy, big R = indifferent; f₀ never moves | *(straightforward beat)* |
| S10 `f0_from_first_principles` | X_L = X_C → ωL = 1/(ωC) → ω₀ = 1/√(LC) → f₀ = 1/(2π√(LC)) = 0.250 Hz from the sealed decimals | `derivation_first_principles` |
| S11 `lcr_sandbox` | The whole machine under the teacher's hands — L/C move the crossing, R re-shapes the peak, f rides the curve | `exploration_sliders` |

**Locked physics numbers (inherited + re-derived, never trusted).** Defaults: **vₘ = 10.0 V, f = 0.25 Hz,
R = 5.0 Ω, L = 3.1831 H, C = 0.1273 F** (sealed decimals verbatim; 10/π and 0.4/π are design intent only,
never authored). Derived and verified:
- ω = 2πf; at defaults π/2 rad/s = 90.000 °/s exactly. **X_L = 2πfL = 20.000·f Ω** (2π·3.1831 = 20.000).
  **X_C = 1/(2πfC) = 1.2502/f Ω** (2π·0.1273 = 0.79985). At defaults: X_L = 5.0000 Ω, X_C = 5.0009 Ω →
  X ≈ 0, Z = R = 5.0 Ω, iₘ = 2.000 A, φ = 0 — **the defaults ARE the resonance point**
  (f₀ = 1/(2π√(LC)) = 1/(2π√0.40521) = 0.25002 Hz vs default 0.25).
- **Work point f = 0.50 Hz (S2–S6):** X_L = 10.00 Ω · X_C = 2.50 Ω · X = 7.50 Ω · Z = 9.01 Ω (true 9.0135)
  · iₘ = 1.11 A · φ = 56.3° (current lags). V_R = 5.55 V · V_L = 11.09 V · V_C = 2.77 V; arithmetic peak
  sum 19.41 V vs phasor closure √(5.547² + 8.320²) = 10.00 V ✓. Instantaneous checks (S4): at the source
  crest, +3.08 + 9.23 − 2.31 = +10.00 V ✓; at the i crest, +5.55 + 0.00 + 0.00 = +5.55 V = v(t) at that
  instant ✓ (and the source is visibly NOT at its own crest there).
- **Mirror point f = 0.125 Hz (S7):** X_L = 2.50 Ω · X_C = 10.00 Ω · X = −7.50 Ω · Z same · iₘ = 1.11 A ·
  φ = 56.3° current LEADS — the exact swap.
- **Display-precision LAW (a design decision, binding downstream):** X chips 2dp · **Z chips 1dp** · iₘ 2dp
  · φ 1dp · V chips 2dp · f 2dp (3dp only if a scripted value demands it). Reason: C = 0.1273 is not exactly
  0.4/π, so the mirror pair's true Z values differ in the SECOND decimal (9.013 vs 9.015) — at 1dp both
  render 9.0 Ω and S7's "same size of fight" claim is EXACT at display precision (iₘ renders 1.11 A at both,
  identically). The HUD computes from true values and rounds for display (standard).
- **S9 family (R = 2.0 / 5.0 / 10 Ω at fixed L, C):** peak iₘ = 5.00 / 2.00 / 1.00 A; Δf = R/(2πL) =
  0.10 / 0.25 / 0.50 Hz; Q = f₀/Δf = 2.5 / 1.0 / 0.5. (Δω = R/L; at R = 5 it is π/2 exactly — another
  engineered gift.) Half-power points at R = 5: ≈0.155 and ≈0.405 Hz — inside the sweep window.
- **Edge-corner FLAGs for physics_author:** X-plot y-range must hold X_C(0.10 Hz) = 12.5 Ω (set 0–13 Ω);
  S9 i-plot must hold the R = 2 peak (set 0–5.2 A); explore L/C extremes push f₀ outside the 0.1–0.5 Hz
  axis (L = 10 H, C = 0.40 F → f₀ = 0.080 Hz; L = 1.0, C = 0.04 → 0.796 Hz) — the crossing walks off the
  plot; REQUIRED handling: an edge arrow + the true f₀ number, never a silent disappearance; explore
  extremes (vₘ = 20, R = 2 → iₘ = 10 A at f₀) take the family's honest arrow/bead clamps with true-number
  HUD.

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Coined archetypes (one-line justifications; 4 coins, justified by a genuinely new apparatus class —
phasor ARITHMETIC + circuit synthesis):**
- `rigid-fan-rotation` (S3) — five co-rooted vectors rotating as one rigid body with per-arrow locked
  offsets; extends phasors' two-arrow `rigid-pair-rotation`, which is definitionally a pair.
- `tip-to-tail-assembly` (S5) — arrows re-arrange head-to-tail to PERFORM a vector sum; `reveal-build`
  constructs a scene, this executes an operation.
- `unit-morph` (S6) — a closed figure re-scales from one quantity family into another (÷ iₘ, volts → ohms);
  no fleet archetype covers a same-shape quantity-family morph.
- `family-overlay` (S9) — successive parameter values leave overlaid result curves whose SHAPE comparison is
  the teaching; distinct from `ghost-overlay-compare` (whose ghost is a single confirmation/wrong-guess
  trace, not a parameter family).
Fleet/seed reuse: `reveal-build` (S1), `ramp-response` (S2, S8 — the ONE declared contrast pair),
`freeze-and-read` (S4, from phasors), `rotate/flip` (S7), `chain-link-derivation` (S10), `drag-sandbox` (S11).

**Control-gating note (Rule 31c):** f goes plain-live at S2 AFTER its scripted glide (drag-seize — the
state's taught variable is f) and again at S8 after the sweep settles; R goes plain-live at S9. **f is
LOCKED in S3–S7** — with the fan/chain/triangle mid-construction, a live f would re-scale every arrow and
chip and violate 32b (only the taught variable moves); S7's own f-step is scripted choreography, not a
slider. quality_auditor: treat a live f in S3–S7 as a design defect (the phasors precedent, same grounds).
The explore state exposes ALL five.

| State | depth_ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26) | Δ cue (≤5 words) | Live controls | glow_focal | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `three_in_series_one_current` | **core** | One loop, one current — the series fact makes current the shared reference | `reveal-build` (seed) | Home pose = the chapter loop (source ring stamped 10.0 V · 0.25 Hz). The loop WIDENS once (declared construction): heater docks, then coil, then plates — three familiar apparatus assets now in ONE line; amber beads thread all three in lockstep (the same flow crest passes heater → coil → plates — never splitting, never pooling). HUD: iₘ = 2.00 A. Spoken plant: "2.00 amps — exactly what the heater alone drew. As if the coil and plates weren't even there. Park that." | "Three elements, one current" | none | `circuit` | manual_click | 40–55 w |
| S2 `off_home_frequency` | **core** | The mystery: off the home frequency, the current shrinks AND slips late — hidden machinery wakes | `ramp-response` (fleet — declared pair with S8) | Cause first (32a): the f thumb visibly glides 0.25 → 0.50 Hz (closed-form scripted ramp ≈3 s). Effect after a beat: beads slow, the iₘ HUD winds 2.00 → 1.11 A, and in the strip the i-crest detaches from the v-crest and drifts LATE (no φ symbol, no arc, no reactance word — the slip stays purely visual; the law is deliberately withheld). f then plain-live (drag-seize). | "Off home, machinery wakes" | **f** (plain-live post-glide) | `trace` | manual_click | 35–50 w |
| S3 `three_voltages_three_angles` | **core** | Each element's voltage rides the ONE clock at its own settled angle — three callbacks, all at once for the first time | `rigid-fan-rotation` (coin) | The disc pane docks (phasors' delivered tool) with the amber i-arrow spinning as reference. Voltage arrows dock co-rooted, each on its narrating clause: V_R (white, 5.55 V) glued along i — "the heater's voltage copies its current, you proved that"; V_L (violet, 11.09 V) a quarter AHEAD; V_C (green, 2.77 V) a quarter BEHIND. Last, the cyan source arrow (10.0 V) docks at 56.3° ahead of i — "and the source's own arrow matches NONE of them. Hold that." Fan rotates rigidly; the strip draws all four voltage traces in step (i-trace dimmed). | "Three angles, one clock" | none | `fan` | manual_click | 45–55 w |
| S4 `peaks_dont_add` | **core** | **16a PIVOT #1** — peak voltages do NOT add; instantaneous values add, signs and all (KVL at every instant) | `freeze-and-read` (fleet/phasors) | The wrong expectation's consequence FIRST: the chip `5.55 + 11.09 + 2.77 = 19.41 V?` appears over the strip and is STRUCK beside the measured source `10.0 V` — and the coil ALONE reads 11.09 V, more than the source. Then the truth, two cue-ARMED phase-FIRED freezes (phase-time-subtraction contract, ≤1.0 s each): at the SOURCE crest, signed chips stack tip-to-tail along the freeze line — +3.08 +9.23 −2.31 = **+10.00 ✓**; at the i-crest — +5.55 +0.00 +0.00 = +5.55 = v at that instant ✓, and the source is visibly NOT at its own crest. Peaks live at different instants; instants, not peaks, must balance. | "Instants add, peaks don't" | none | `trace` | manual_click | 45–55 w |
| S5 `tips_to_tails` | **core** | **SUPPORTING AHA** — the phasor sum: tips to tails, V_L and V_C antiparallel, the chain closes exactly onto the source arrow | `tip-to-tail-assembly` (coin) | Rotation eases to a stop on its clause — "freeze the clock: the angles can't change, you proved that" (phasors' PRIMARY aha cashed in). The fan ghosts in place; solid copies translate one at a time: V_R lays out from the root; V_L climbs from V_R's tip; V_C bites BACK down V_L's own line — antiparallel, 2.77 of the 11.09 erased; the chain's far tip lands EXACTLY on the ghosted source tip (closure flash). Bridge clause: "the stacking you watched at one instant, done for every instant at once." Clock resumes — the whole chain rotates rigidly and the chain-tip's shadow re-draws the source trace over its ghost, congruent. | "Tips to tails — chain closes" | none | `chain` | manual_click | 45–55 w |
| S6 `the_impedance_triangle` | **core** | Divide the closed chain by the one current → the circuit's own Ω triangle; Z closes the current mystery | `unit-morph` (coin) | Rotation stopped. The chain's right triangle (5.55 / 8.32 / 10.0 V) detaches and re-scales ÷ iₘ = 1.11 A in one scripted morph; legs re-label: R = 5.0 Ω (white), X_L − X_C = 10.00 − 2.50 = **7.50 Ω** (violet — X_L winning), hypotenuse **Z = 9.0 Ω** (cyan). The X chips debut side by side WITH the on-canvas condition `at f = 0.50 Hz` (A0-3 duty). Mystery #1 closes on the HUD: iₘ = vₘ/Z = 1.11 A ✓ — the S2 number, explained. One clause: "this triangle doesn't spin — it's the circuit's fingerprint, not a phasor." | "Divide by i — ohm triangle" | none | `triangle` | manual_click | 45–55 w |
| S7 `who_leads_who_lags` | **core** | φ lives in the triangle — tan φ = (X_L−X_C)/R; whichever reactance wins drags the current its way | `rotate/flip` (seed) | The triangle's angle brightens: φ = 56.3° — the S2 slip, explained (arc on the fan agrees; mystery #2 closes). Then the flip: the f thumb STEPS 0.50 → 0.125 Hz (scripted one-shot, thumb visibly moves); the X chips SWAP (10.00 ↔ 2.50); the X-leg swings BELOW the R-leg, its colour flipping violet → green as the winner changes; Z holds 9.0 Ω and iₘ holds 1.11 A — unchanged; on the fan the i-arrow swings from 56.3° behind to 56.3° ahead; the strip shows i now cresting FIRST. Same size of fight, opposite winner. | "Reactance winner sets lead" | none | `triangle` | manual_click | 45–55 w |
| S8 `the_crossing_resonance` | **core** | **PRIMARY AHA + 16a PIVOT #2** — at one frequency X_L = X_C: the opponents erase each other, Z collapses to R, the current roars back — and it is the chapter's home frequency | `ramp-response` — **declared contrast pair with S2: same glide, the delta names the flip (S2 opened the mystery blind; S8 closes it with the levers visible)** | The strip region switches to the resonance plots: upper X-vs-f (violet X_L line rising, green X_C curve falling), lower iₘ-vs-f, shared f-axis. The f thumb glides 0.125 → 0.50: the curves CROSS and directly beneath the crossing the current curve PEAKS — at **f = 0.25 Hz, the home setting**. The wrong belief confronted in motion: more components should mean less current — yet approaching 0.25 the beads ACCELERATE and iₘ climbs to 2.00 A, the bare-heater value, while the triangle's X-leg shrinks to nothing (Z = R = 5.0 Ω, φ → 0). The glide eases back and SETTLES at f₀ = 0.25 Hz: the S1 mystery resolved — the chapter's home operating point was the resonance point all along. | "Two curves cross — resonance" | **f** (re-live post-sweep) | `reso_plot` | manual_click | 45–55 w |
| S9 `sharpness_and_q` | **extended** | R sets how SHARP the resonance is — Q = f₀/Δf; f₀ never moves | `family-overlay` (coin) | At f₀, the R thumb steps 5.0 → 2.0 Ω and a re-sweep re-draws the current curve TALLER and NARROWER (peak 5.00 A, width 0.10 Hz), the old curve ghosted; then R = 10 Ω: a low flat hump (peak 1.00 A, width 0.50 Hz). Three overlaid curves; Q chips 2.5 · 1.0 · 0.5; measured widths drawn on the R = 2 and R = 10 curves ONLY (the R = 5 width numerically equals f₀ = 0.25 — the Q = 1 artifact; spoken, never chipped — A0-3 duty). The crossing point never moves: R changes how much and how sharp, never WHERE. | "R sets the sharpness" | **R** (plain-live) | `reso_plot` | manual_click | 35–50 w |
| S10 `f0_from_first_principles` | **advanced** | The derivation: X_L = X_C → ωL = 1/(ωC) → ω₀ = 1/√(LC) → f₀ = 1/(2π√(LC)) | `chain-link-derivation` (fleet) | Apparatus dims (E4 restore pattern; `reveal_hold`). The Cambria panel's chain docks link by link on narrating clauses; the last link substitutes the chapter's own sealed values: 1/(2π√(3.1831 × 0.1273)) = **0.250 Hz** — the crossing you watched, now in algebra. The dimmed resonance plot's crossing point pulses as the number lands. | "X_L equals X_C, solved" | none | `formula` | manual_click | 45–55 w |
| S11 `lcr_sandbox` | **core** (ring-neutral; surfaces core content only, 38b) | The whole machine under the teacher's hands | `drag-sandbox` (seed) | Free-runs forever (Rule 37). ALL five sliders. Band = disc (fan + mini triangle) + BOTH resonance plots (the strip's time-traces yield to the explore's most valuable surface). Dragging **L or C MOVES the crossing** — f₀ slides live, with the off-axis edge-arrow + true number when pushed outside 0.1–0.5 Hz; dragging **R re-shapes the peak**; dragging **f rides the curve** — the dot climbs to the peak exactly at the crossing; vₘ scales arrows and current together. L/C defaults sit off the slider grids: off-grid initial value + true-number HUD + snap on first drag (documented, F8 precedent). Formula surface: `Z = √(R² + (X_L − X_C)²)` (core, debuted S6). No Q chip, no derivation chain (ring-gate). | "All yours" | **ALL: vₘ · f · R · L · C** | `formula` | interaction_complete | 0 / open |

**No-repeat audit:** reveal-build · ramp-response ×2 (**the ONE declared contrast pair S2/S8** — delta names
the flip: mystery opens blind ↔ mystery closes with the levers visible) · rigid-fan-rotation ·
freeze-and-read · tip-to-tail-assembly · unit-morph · rotate/flip · family-overlay · chain-link-derivation ·
drag-sandbox — eleven states, none static, four coins each justified, drag-sandbox explore-only.

**Rule 32 plan.** 32a cause-first with a readable beat everywhere: elements dock THEN beads thread (S1); the
thumb glides THEN the current sags THEN the crest slips (S2); each arrow docks on its clause (S3); the struck
chip lands THEN the freezes prove the truth (S4); the clock stops THEN the chain assembles THEN the closure
flash (S5); the morph runs THEN the chips re-label THEN the HUD closes the mystery (S6); the thumb steps THEN
chips swap THEN the leg flips (S7); the thumb glides THEN the curves cross THEN the peak lands THEN the
settle (S8). **⚠ 32a caution (binding on physics_author/json_author — the family's fifth):** every fan/chain
angle comes from ONE closed-form θ(t) with constant offsets and every chain node from cumulative sums of the
SAME phasor set — never independently animated arrows that merely happen to close; the closure is exact by
construction and the closure flash fires on a measured tip-distance, not on a timer. 32b one variable per
state (S1 the loop, S2 f, S3 the fan, S4 the sum, S5 the re-arrangement, S6 the unit, S7 the sign, S8 the
crossing, S9 R, S10 the algebra). 32c the Δ column verbatim as caption openers. 32d ONE apparatus from the
chapter home pose; the loop widens ONCE at S1 (declared) and persists through S11; the band docks at S1 and
persists; camera frames the widened loop at S1 and HOLDS through S11 (all new surfaces are DOM overlays — no
further camera motion). 32e one glow focal per state from the proposed CLOSED enum.

**Rule 33 plan.** Macro band = the real circuit (three elements, beads, the source ring, the sliders — the
thing a teacher points at); representation band = the disc/chain/triangle/plots; the explicit link = matched
colours (element label tints = phasor hues = curve hues) + the pen/congruence machinery + the HUD closing
each mystery numerically. Per-state real number: S1 iₘ = 2.00 A · S2 2.00 → 1.11 A · S3 the 5.55/11.09/2.77 V
fan · S4 19.41 V struck, +10.00 V proven · S5 11.09 − 2.77 = 8.32 V net vertical · S6 Z = 9.0 Ω, iₘ = 1.11 A ✓
· S7 φ = 56.3° both sides, Z unchanged · S8 crossing at 0.25 Hz, peak 2.00 A · S9 Q = 2.5/1.0/0.5 ·
S10 f₀ = 0.250 Hz · S11 all live. Instruments per 33d: signed HUD v/i (from S1), iₘ (2dp), f (2dp); V chips
S3–S7 (OFF in S8 — §10k guard); X/Z chips S6+; φ 1dp S7+; plots S8+; Q S9 only.

**Cue plan (arm/fire semantics — F2).** S1 element docks s1–s3, the plant s4; S2 glide arms s1 (fires
immediately after a readable beat), sag-readout s2, slip-naming s3; S3 arrow docks s1–s4 in narration order,
source-dock last; S4 struck chip s1, freeze A armed s2 (fires at the next source crest), freeze B armed s3
(next i crest); S5 stop s1, chain docks s2 (V_R) – s3 (V_L, V_C), closure flash derived, resume s4; S6 morph
s2, chips s3, HUD close s4; S7 φ brighten s1, step+swap+flip s2–s3; S8 plot switch s1, glide s2, crossing
flash DERIVED at the actual crossing, settle s4; S9 R-steps s2/s3; S10 chain links s1–s4. No authored instant
at t = 0 of any state; at_ms kept only as EYE arming fallbacks.

---

## 4. Misconception confrontation plan (Rule 16a — exactly TWO pivots)

**Belief selection reasoning:** the two canonical series-LCR errors are both scalar-addition transfers from
DC habits. (1) "Voltages across series elements add up to the source" — arithmetically true in DC, false for
AC amplitudes; it poisons every voltage reading and makes V_L > vₘ look impossible. (2) "Every component adds
opposition — more elements in the loop always means less current" — true for series resistors, spectacularly
false at resonance; it is precisely the belief the PRIMARY aha must break. The third candidate ("Z = R + X_L
+ X_C, impedances add like resistances") is the SAME scalar-addition error wearing ohm units — killed
structurally by S6's quadrature triangle and demoted to an assessment distractor, not given a third pivot
(founder guardrail 2026-07-04: 1–3 genuine pivots, never a tic).

| Genuine wrong belief | Pivot state + beat |
|---|---|
| **"AC voltages in series add like numbers — V_R + V_L + V_C should equal the source, and no element can read more than the source"** | **S4.** `visual_counter:` the struck chip `5.55 + 11.09 + 2.77 = 19.41 V?` beside the measured source 10.0 V — with the coil's own chip reading 11.09 V, MORE than the source; then the two freezes where the SIGNED instantaneous chips stack to exactly +10.00 and +5.55 = v(t) · `one_line_fix:` "Voltages add at every instant, sign and all — never peak to peak, because the peaks happen at different moments." |
| **"Every component adds opposition — with a coil AND plates in the loop, the current must be smaller than with the resistor alone"** (earned honestly: S2–S7 showed the current DROP at every off-home frequency) | **S8.** `visual_counter:` the current curve CLIMBING as f approaches 0.25 Hz and landing at 2.00 A — the bare-heater value from S1 — while the triangle's X-leg visibly shrinks to nothing and the beads accelerate · `one_line_fix:` "The coil and the plates oppose each other, not just the current — at f₀ they erase each other and the circuit forgets they exist." |

No other state carries a `misconception_watch`. No EPIC-C branches (EPIC-L-first directive, 2026-06-10).

## 5. `has_prebuilt_deep_dive` states

**S5** — phasor addition is the mathematical abstraction of the concept (students who cannot see WHY tip-to-tail
is legitimate never recover; documented patterns: "why can arrows add for voltages", "why do V_L and V_C
subtract", "how can a voltage exceed the source"). **S6** — the quadrature algebra (the historically stuck
computation: Z = √(R²+X²) vs the scalar sum; the triangle construction). **S8** — the core insight + the
exam-heaviest territory (what actually happens at resonance; why current is maximal; the tuning application).
**Divergence from the pivots documented:** pivots sit at S4/S8 but investment goes S5/S6/S8 — S4's confusion
is resolved the moment S5's chain closes (the deep-dive belongs with the TOOL, not the failure), and S6 is
where the algebra sticks. Cache-hint only, not a gate (Rule 18).

## 6. Drill-down clusters

**S5:** `why_voltages_dont_add_arithmetically` · `phasor_addition_tip_to_tail_method` ·
`vl_vc_antiparallel_cancellation`
**S6:** `impedance_vs_resistance_difference` · `z_quadrature_not_scalar_sum` · `impedance_triangle_construction`
**S8:** `what_happens_at_resonance` · `why_current_peaks_at_f0` · `radio_tuning_frequency_selection`

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational:        STATE_1 → STATE_5    # the circuit + the mystery + phasor addition (supporting aha)
  impedance_and_phase: STATE_6 → STATE_7    # Z, the triangle, tan φ, lead/lag
  resonance:           STATE_8 → STATE_10   # the crossing (PRIMARY aha), sharpness/Q, f₀ derivation
  exploration:         STATE_11
```

Default aspect = `foundational`. **Foundational-coverage rule satisfied via the declared MANDATORY exit-pill:**
the PRIMARY aha (S8) sits in the `resonance` slice, so `foundational` ends with a mandatory pill — *"One
frequency makes the whole fight vanish →"* — routing into `resonance`; a second pill *"So how much current
actually flows? →"* routes into `impedance_and_phase`. Every aspect is a valid classifier `aspect` value.

## 8. Prerequisites (advisory only — Rule 23)

- `phasors` (SEALED, Ch.7 #4) — the disc, rigid rotation, the frozen-angle fact, the reading convention;
  cliff at S3.
- `ac_voltage_resistor` (SEALED, #1) — the in-phase fact; cliff at S1/S3.
- `ac_voltage_inductor` (SEALED, #2) — the lag fact + X_L = ωL (its own S5); cliff at S3/S6.
- `ac_voltage_capacitor` (SEALED, #3) — the lead fact + X_C = 1/(ωC); cliff at S3/S6.
- (Class-12 Ch.3 series circuits / Kirchhoff's loop rule — legacy-bundle concept, not a sealed diamond;
  patched by a single S4 clause, Block 1.)

Required-by (rest of Ch.7): `ac_power_factor` (reads cos φ off THIS triangle), `lc_oscillations` (the L–C
pair alone), `transformer` (indirectly).

## 9. Real-world anchor (Rule 35 + 38f)

**Primary — tuning a radio.** Every station on the air arrives at the antenna at once, each broadcasting on
its own frequency — yet the radio plays exactly one. Behind the tuning dial sits this circuit: turning the
dial changes the capacitance, which slides the circuit's special frequency f₀ along the band. The one station
whose frequency matches f₀ meets almost no opposition — its current surges hundreds of times stronger than
its neighbours' — and that is the station you hear. The S8 resonance curve IS the tuning curve, and S9's
sharpness IS the radio's selectivity: a sharper peak separates two nearby stations cleanly. Culture-neutral
(radio receivers exist everywhere), the widest-syllabus-overlap resonance device in physics teaching (38f),
and physics-true at every depth — a real tuner is exactly a driven RLC loop selecting by resonance.
**Secondary (narration-only):** a contactless card held near a reader — both carry small tuned coil-capacitor
loops set to the SAME f₀, so energy transfers only between matched pairs. Mains frequency, where mentioned,
stays neutral ("the mains frequency") — 35b. Nothing radio- or card-shaped is drawn (Rule 24; anchors live in
narration).

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the eleven of §2, ids as named, `state_count: 11`, contiguous STATE_1–STATE_11;
`advance_mode`: 10× `manual_click` + 1× `interaction_complete` (Gate 12 ✓; no
`wait_for_answer`/`pause_after_ms`/`narrative_socratic` anywhere).

**(b) Symbol-label table** (38d dialect: dual-label once, then bare; ALL authored source strings carry the
pinned ASCII tokens — `v_m`, `i_m`, `X_L`, `X_C`, `V_R`, `V_L`, `V_C` — composed to styled subscripts on all
three text paths, zero literal underscores):

| Quantity | On-canvas label | First |
|---|---|---|
| source voltage / current | cyan v-trace + arrow; amber i-beads/trace/arrow; HUD `i_m = 2.00 A`, `f = 0.25 Hz` | S1 |
| the three element voltages | `V_R` white · `V_L` violet · `V_C` green — arrow tags + trace hues + element label tints (the 33 zoom-link); chips 2dp | S3 |
| the arithmetic-sum error | struck chip `5.55 + 11.09 + 2.77 = 19.41 V?` (F1 caption pattern; struck ONLY while wrong) | S4 only |
| phase angle | φ arc on the fan (delivered phasors tool — may READ from S3); numeral + law first at S7, dual-labeled once "phase angle φ" | S3/S7 |
| net reactance | X chips `X_L = 10.00 Ω` / `X_C = 2.50 Ω` side by side + condition `at f = 0.50 Hz` (A0-3); X-leg colour = live winner | S6 |
| impedance | `Z = 9.0 Ω` (1dp — the display-precision law, §2), cyan hypotenuse | S6 |
| resonance | crossing marker + banner `f₀ = 0.25 Hz`; the settle holds it as end pose | S8 |
| sharpness | Q chips `Q = 2.5 / 1.0 / 0.5` + measured widths on the R = 2/10 curves only | S9 only |
| derivation chain | Cambria panel, S10 only | S10 |

**Formula surface per state (Rule 34b — ONE each; 38c ladder: algebra-only in core/extended, the ω-form
confined to S10):** S1 `i_R = i_L = i_C = i — one current` · S2 **NONE (deliberate — the mystery state
withholds the law)** · S3 `V_R ∥ i · V_L 90° ahead · V_C 90° behind` · S4 `v(t) = v_R + v_L + v_C — at every
instant` · S5 `v_m² = V_R² + (V_L − V_C)²` · S6 `Z = √(R² + (X_L − X_C)²)` · S7 `tan φ = (X_L − X_C)/R` ·
S8 `f₀ = 1/(2π√(LC))` (the RESULT, given — core; its derivation is S10's) · S9 `Q = f₀/Δf` ·
S10 chain: `X_L = X_C → ωL = 1/(ωC) → ω₀ = 1/√(LC) → f₀ = 1/(2π√(LC)) = 0.250 Hz` · S11 `Z = √(R² +
(X_L − X_C)²)` (core, 38b). All real Unicode across all THREE text paths (34c): Ω √ ² φ ω ω₀ f₀ Δ π ° ∥ → ×;
subscripted element tokens via the compose routine (§0b sub-issue (a)).

**(c) RHR plan:** N/A as a performed rule — no magnetic directions. Direction conventions this concept DOES
carry, stated deliberately: the disc's CCW rotation (inherited from phasors, untouched); the sign convention
**φ = angle by which the source voltage leads the current** (positive → current lags → inductive), rendered
as a lead/lag BADGE beside the arc rather than a signed numeral (physics_author states the convention once,
at S7).

**(d) Motion plan:** the §3 table is it — every state's motion named; rotation/beads run in every state
except inside the declared bounded stops (S4 freezes ≤1.0 s each ≤3.0 s total under the phase-time-subtraction
contract; S5's assembly stop is the taught beat, with the chain motion carrying the dwell and rotation
resuming in-state); S8 settles to an end-pose hold at f₀; S10 dims with restore; S11 free-runs.

**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`. `renderer_pair` =
field_3d/field_3d; `available_renderer_scenarios.field_3d = ["ac_series_lcr"]`.

**(f) Assessment + coverage:** AUTHOR the 6-question backward-designed `assessment` + `coverage_map`.
Q1 the series fact — what is common to R, L, C (current, the reference) → S1 · Q2 why V_R + V_L + V_C ≠
v_source + the phasor rule (distractor: the 30 V arithmetic sum at resonance; distractor: "an element can
never read more than the source") → S4/S5 · Q3 compute Z and iₘ from R, X_L, X_C (distractor: Z = R + X_L +
X_C = 17.5 Ω — the demoted third belief) → S6 · Q4 given X_L and X_C, who leads (distractor: "L always makes
current lag whenever a coil is present") → S7 · Q5 resonance condition + f₀ = 1/(2π√(LC)) + Z = R there
(distractor: "at resonance Z = 0 and the current is infinite") → S8/S10 · Q6 at f₀, what does adding the L–C
pair do to the current vs R alone (the aha question; distractor: "always reduces it") → S8.
`non_assessed_states: [STATE_9, STATE_11]` (S9 extended-ring skill — its Q idea appears as a JEE-trace
extension, not a core quiz row). `misconception_watch` at exactly S4, S8. Gate 20: ≥3 distinct tested_ideas ✓,
aha state hit (Q5, Q6) ✓.

**(g) Macro↔micro plan:** §3 Rule-33 block — real circuit band ↔ representation band, colour-matched
zoom-link, per-state real numbers, live instruments, declared.

**(h) Canvas budget (Rule 34) + zone map (CSS READ, not remembered):** caption = the ≤5-word Δ cue only
(F1 single-latest draw); narration prose in the capStrip below the canvas; ONE Cambria-Math formula surface
per state on `slcr_formula` (`top:40%; right:22px` family slot); HUD value-only at `top:52px; right:12px`;
**`slcr_band` 500×170 at `bottom:185px; left:12px`** (clone of `phs_band`, `field_3d_renderer.ts:27684–27686`;
top edge 355 px inside the sealed 360 px envelope); **power slot (`bottom:88px; left:12px; 320×110`,
`:24382/:25290/:26531`) EMPTY in every state** (reserved for `ac_power_factor`; the 13 px CSS overlap with the
band is moot while it never displays — flagged forward); sliders `bottom:12px; right:12px`. **Sub-region fit
statements (A1-1):** disc region ~160 px square — worst case S5: 5 ghost arrows + 3 chain arrows + closure
flash; volt scale chosen so the chain box (5.55 × 8.32 V) fits with ≥12 px margin; longest disc label `V_L`
(composed, ~22 px). Strip ~330×150 — worst case S4: 4 signed traces + the struck chip + 2 freeze chip-stacks;
y-axis ±12 V (holds V_L = 11.09), separate amber gutter for i; longest gutter label `V_C` — ≤5 curves ever,
chip rows on clear baselines above the crest line (E9). Plot pair (S8/S9/S11, strip region re-purposed): two
stacked ~330×70 graphs + shared f-axis 0.10–0.50 Hz; upper y 0–13 Ω (holds X_C(0.1) = 12.5), lower y 0–2.2 A
guided / 0–5.2 A in S9 (holds the R = 2 peak — axis re-scale between S8 and S9 is a declared, labeled change);
longest gutter labels `X_C (Ω)` / `i_m (A)`; ≥10 px gutter margins. Engine may fine-tune ±20 px; binding
invariants: one canvas · disc left of strip · plots stacked with ALIGNED f-axes · sealed envelope ·
`left:12px` · power slot empty.

**(i) Curriculum-flex block (Rule 38):**

**(i-1) Coherence check, BOTH preset cuts:**
- **Hide advanced (S10):** S1–S9 + S11 survive. S8 states f₀ = 1/(2π√(LC)) as a given result (formula
  surface); no surviving state references the derivation or says "we'll prove this later" (**constraint
  binding on physics_author**). **Coherent** — the full lesson through resonance + sharpness.
- **Hide advanced + extended (S9–S10):** S1–S8 + S11 survive. No surviving state names Q, bandwidth, Δf, or
  sharpness (S8's script may not trail "and R controls how sharp…" — same constraint). Explore shows no Q
  chip. **Coherent** — the complete core story: circuit → mystery → addition → Z → φ → resonance.
- (S2's withheld-law design means no early state depends on later vocabulary in ANY cut.)

**(i-2) Explore = core-ring only (38b):** S11 surfaces fan + triangle + both resonance plots + v/i/f/X/Z/φ
HUD + the FIVE sliders. Q chips and the derivation chain deliberately ABSENT (ring-gate enforced); formula
surface is the core Z equation.

**(i-3) `curriculum_tags` (claims, not facts — 38g; only CBSE/NCERT marked verified at authoring time):**

| Curriculum | Coverage | Note |
|---|---|---|
| CBSE/NCERT Class 12 (+ JEE/NEET) | **✓ full — verified** | NCERT §7.6 exactly: series LCR (phasor treatment), impedance, phase, resonance; S9 sharpness/Q = JEE-relevant, CBSE-board weighting `needs_teacher_verification`; S10 is NCERT's own algebra |
| CAIE A-level 9702 | ✗ absent (believed) | AC topic is rms + rectification · `needs_teacher_verification` |
| Cambridge IGCSE 0625 | ✗ absent (believed) | No AC circuit analysis · `needs_teacher_verification` |
| IB DP Physics (2023) | ✗ absent (believed) | AC analysis believed removed in the 2023 reform · `needs_teacher_verification` |
| AP Physics 2 | ✗ absent (believed) | DC circuits only · `needs_teacher_verification` |
| AP Physics C: E&M | ✗ absent (believed) | AC steady-state/phasor analysis believed beyond the CED · `needs_teacher_verification` |
| Ontario SPH4U | ✗ absent (believed) | · `needs_teacher_verification` |

**(i-4) Preset proposal (hide, never reorder — 38h/25d):** CBSE/NCERT + JEE/NEET → S1–S11 (all); a
board-lean CBSE cut (if a teacher requests) → hide S9–S10; all others → none shipped pending teacher
verification (38g).

**(i-5) Graph-axis conventions (38e):** traces t-on-x (universal); X-vs-f and iₘ-vs-f with f-on-x (the
universal resonance-curve convention in every syllabus that teaches it — no genuine board conflict → no
axis toggle; noted `needs_teacher_verification` alongside any future phasor-teaching curriculum).

**(j) Existence-assertion table ("presence is not correctness" — binding on the engine dispatch,
quality_auditor and eye-walker):**

| Negative/absence claim | Paired existence assertion |
|---|---|
| "One current threads all three — beads never split or pool" (S1) | All THREE element meshes + the bead stream EXIST in sceneObjects; a bead-path probe passes through heater, coil AND plates segments with conserved bead count |
| "V_L and V_C are antiparallel in the chain" (S5) | Both chain arrows EXIST; direction-dot probe ≈ −1; lengths map 11.09/2.77 V within tolerance |
| "The chain closes exactly onto the source" (S5) | Chain-tip vs ghosted source-tip distance < tolerance, BOTH objects existing — never a lone chain passing as "closed"; the flash fires on the measured distance, not a timer |
| "Head-to-tail, never co-rooted" (S5 — the INVERSE of phasors' guarantee) | Node-position probe: each chain arrow's root == predecessor's tip (the co-rooted probe from phasors, inverted) |
| "The struck chip is struck ONLY while wrong" (S4) | The struck 19.41 V chip EXISTS in S4 AND both freeze stacks read exactly the source's instantaneous value (+10.00 / +5.55) un-struck |
| "X/Z chips absent before S6" | Composed `X_L`/`X_C`/`Z` chips EXIST in S6 (styled subscripts, zero literal underscores — proving the compose path live); the same detector finds zero matches in S1–S5 |
| "The crossing is at f₀ and the peak sits beneath it" (S8) | Both curves EXIST in the plot; intersection abscissa = 0.250 ± 0.005; iₘ-peak abscissa equals it (vertical-alignment probe) |
| "Triangle legs equal their chips" (S6/S7) | Measured px lengths ∝ 5.0 / 7.50 / 9.0 within tolerance; the S7 flip measurably swaps the X-leg's side AND colour |
| "V chips OFF in S8" (§10k guard) | V chips EXIST in S3–S7 frames AND are absent in S8 by the same detector |
| "Scripted ramps move the thumb" (S2/S7/S8/S9) | Slider-thumb position probe: thumb px displaced during each ramp (ghost-compare scar killed) |
| "Freezes are phase-time subtraction" (S4) | The OPEN probe run: angle holds during the window, no >1° discontinuity at release, byte-stable under `SET_TIME_FREEZE` |
| "S11 ships BRIGHT after S10; Q/derivation absent outside S9/S10" | MEASURED S10→S11 traverse vs pristine S1 capture (E4); Q chips + chain present in their own states, absent elsewhere by the same detector |

**(k) Coincidence audit (A0-3 — the scar this chapter's engineered numbers make load-bearing):**
(1) X_L = X_C at the S8 crossing — TAUGHT equality, allowed; the condition `f₀ = 0.25 Hz` renders beside it
anyway. (2) X_L(f₀) = R = 5.0 Ω — the Q = 1 artifact, NOT a law: never chip-paired (the X chips merge into
one `X_L = X_C = 5.00 Ω` equality chip at the crossing; R lives only in the triangle), one spoken guard
clause ("with THIS resistor — our build, not a law"), and S9 + explore break it live (R = 2/10 with the
crossing fixed). (3) V_L = V_C = vₘ = 10.0 V at f₀ — V chips ring-gated OFF in S8 entirely. (4) Δf(R=5) =
f₀ = 0.25 — R = 5's width never chipped in S9 (Q chip 1.0 instead). (5) iₘ = 2.00 A = vₘ/R at S1 — single
HUD numeral, comparison spoken as the parked mystery, resolved by S8 which TEACHES it.

**TTS:** author `teacher_script` EN now (25–55 words/guided state); `text_hi` via the Rule-30g Sonnet-5
subscription sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h). **Registration
(8 sites):** `series_lcr_circuit.json` · `concept_panel_config`/`CONCEPT_PANEL_MAP` · `CONCEPT_RENDERER_MAP`
→ field_3d · `VALID_CONCEPT_IDS` · deep-dive flags (S5/S6/S8) · synonyms n/a · `PCPL_CONCEPTS` N/A ·
`CLASSIFIER_PROMPT` + the four aspects; plus clusters migration (FILE-ONLY per trial rules) +
`_seed_series_lcr_circuit_cache.ts`. **THE EYE:** 11/11 after the §0b delta; DENSE frames required for the
S2/S8/S9 ramps (the checklist's ramp rule); eye-walker ∥ quality-auditor; zero new scar rows; regression =
`capacitance` 44/44 + all FOUR sealed siblings clean; the F7 caption-order probe on S4/S5/S8 and the S4
freeze probe are REQUIRED Checkpoint-B artifacts; founder-drive hand-tests the S2/S8 f-grabs, S9 R-grab and
all five explore sliders + the L/C off-grid snap + the off-axis f₀ indicator (trusted interactions — THE EYE
can't fire them).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `phasors` breaks at **S3** if the frozen-angle reading isn't owned — patch clause:
"each arrow's angle to the current is that element's settled phase — frozen forever, because everything rides
one clock." `ac_voltage_resistor` breaks at **S1/S3** — patch: "the heater's voltage copies its current, beat
for beat." `ac_voltage_inductor` breaks at **S3/S6** — patch: "the coil's voltage runs a quarter ahead, and
its opposition X_L = ωL grows with frequency — you watched it climb." `ac_voltage_capacitor` breaks at
**S3/S6** — patch: "the plates' voltage trails a quarter behind, and X_C = 1/ωC falls as frequency rises."
DC series/KVL breaks at **S4** — patch: "around one loop, instantaneous voltages add — the loop rule from DC,
still true at every single moment." Each is one clause, never a re-teach (the inherited no-re-teaching
constraint).

**JEE-backwards trace.** *"A series LCR circuit (R = 5 Ω, L = 3.18 H, C = 0.127 F) is driven by
v = 10 sin(2π·0.5·t) V. (i) Find X_L and X_C. (ii) Find Z and the peak current. (iii) Does the current lead
or lag, and by what angle? (iv) At what frequency is the current maximum, and what is it there? (v) The three
voltmeter readings sum to more than 10 V — explain. (vi) How does halving R change the resonance curve?"* →
(i) sibling callbacks consolidated at **S6** · (ii) **S6** (Z = 9.0 Ω, 1.11 A) · (iii) **S7** (lags 56.3°) ·
(iv) **S8/S10** (0.25 Hz, 2.00 A) · (v) **S4/S5** (peaks at different instants; phasor sum) · (vi) **S9**
(taller, narrower, f₀ fixed). No missing piece; every guided state is used by some stem (S1 grounds the
common-current assumption every part relies on; S2 is the measured data the stem quotes). M1–M6 carve-out
N/A (not Ch.26).

**Misconception entry mapping (16a).** The two pivots of §4, each wrong-consequence-first (the struck
arithmetic chip; the current climbing against the "more opposition" expectation). **Planting audit (6 items):**
(1) S1's "as if the coil and plates weren't there" could itself plant "L and C do nothing in series" →
prevented at the planting moment: phrased as a PARKED mystery ("park that"), and S2 immediately shows them
doing plenty. (2) S3's proud separate angles could plant "each element has its own current phase" → prevented
by S1's one-current beat + S3's opening clause ("the same current, three different answers"). (3) S4's
V_L = 11.09 > 10.0 could plant "free voltage/energy" → one clause: "no contradiction — instants, not peaks,
must balance" (power itself stays unspoken — `ac_power_factor`'s door). (4) S6's triangle could plant "Z is a
phasor that rotates" → killed in-state: "this triangle doesn't spin — it's the circuit's fingerprint, not a
phasor." (5) The Q = 1 artifacts could plant "at resonance, reactance equals resistance" → §10k guards +
S9/explore break it live. (6) The engineered coincidence could plant "resonance always sits at the dial's
default" → one honest clause at S8: "we BUILT this circuit so its special frequency is the home setting."

## Block 2 — Aha-moment designation

- **PRIMARY (S8):** *The coil and the plates are opponents, not teammates — at one frequency they erase each
  other completely, the circuit forgets they exist, and the current roars back to its bare-resistor value;
  that is how a radio picks one station out of the air.*
- **SUPPORTING (S5):** *AC voltages add tip-to-tail, not number-to-number — V_L and V_C pull in opposite
  directions, so eleven volts and three volts make eight, and the chain closes exactly onto the source.*
- **Cohesion:** S5's antiparallel bite is the SEED of S8's total cancellation — the supporting aha builds the
  exact picture (two opposing verticals) whose limiting case (equal and opposite) IS the primary. One primary
  + one supporting; nothing stands alone. (S6's triangle is machinery, S9 is skill — deliberately not ahas.)
- **Wrong-belief setup:** for S5 — S3 shows the three voltages proudly separate and S4 builds + strikes the
  earned arithmetic expectation. For S8 — S2, S6 and S7 train "reactance = added opposition; off the home
  frequency the current only ever DROPPED" (an earned, confident generalization: Z ≥ R everywhere they
  looked); S8 breaks it at the one frequency where the fight cancels.
- **Foundational-coverage rule:** PRIMARY aha (S8) is NOT inside `entry_state_map.foundational` → the
  MANDATORY exit-pill is declared in §7 (foundational → *"One frequency makes the whole fight vanish →"* →
  `resonance`).

---

## Escalations / FLAGs for downstream

1. **Engine delta first (§0b)** — NEW `scenario_type: "ac_series_lcr"` via the CHAPTER_LOOP §3b engine loop
   before json_author starts. Regression = `capacitance` 44/44 + all FOUR sealed siblings clean + the
   zero-sibling-internal-lines diff grep. Every §3b dispatch prompt restates **"no DB writes — files only."**
2. **Compose-routine decision (sub-issue (a)) — the founder's call, forced now:** default = a third,
   `slcr_`-scoped clone (trial-safe, zero sealed code touched); recommendation = promote to the shared text
   layer (rule-of-three satisfied: `acc_` + `phs_` + `slcr_`; `ac_power_factor` will need it too). Execute
   the promotion ONLY on explicit founder approval at the engine-dispatch boundary; sealed call sites never
   migrated; if promoted, the four sibling EYE re-runs are load-bearing.
3. **Colour semantics (sub-issue (b)) — declared, founder ruling still open, not consumed:** cyan = voltage /
   amber = current authored as chapter law; NEW hues V_R white · V_L violet · V_C green · Z cyan · X-leg =
   live winner's colour; this scenario forces amber beads in its cloned coil asset regardless of the sealed
   inductor's in-place defect. The founder's ruling on fixing `ac_inductor` remains open.
4. **Binding 32a caution (the family's fifth):** one closed-form θ(t) + constant offsets drives fan AND
   chain; chain nodes are cumulative sums of the same phasor set; the closure flash fires on measured
   tip-distance, never a timer. "Never let the chain close by animation luck."
5. **Zone-map conflict flagged FORWARD:** the band (185–355 px) overlaps the power slot's top 13 px
   (88–198 px, CSS cited §0a). Harmless here (power pane never displays — reserved empty all chapter), but
   **`ac_power_factor` will need BOTH surfaces live — its architect must resolve the 13 px conflict
   explicitly** (shift/shrink one of them), citing this note.
6. **Handoff seed to `ac_power_factor` (Ch.7 #6) — DELIVERS vs WITHHOLDS.** Delivers: (a) the series-LCR
   apparatus + the five-arrow fan + the impedance triangle with φ as the circuit's own angle — cos φ is one
   step away; (b) the two locked work points with their angles (f = 0.50 Hz → φ = 56.3°, cos φ = 0.555;
   f₀ = 0.25 Hz → φ = 0, cos φ = 1 — the power-factor numbers are already engineered); (c) the resonance
   operating point + the sweep instrument; (d) the EMPTY power slot (`bottom:88px;left:12px`, reserved all
   chapter) as its natural canvas — subject to item 5. Withholds (its front door): any power quantity, trace
   or formula (P, cos φ, wattless current — NONE renders here, existence-asserted via the empty power slot),
   and the energy interpretation of the V_L/V_C cancellation (which `lc_oscillations` also draws on). This
   concept must NOT mention any of it.
7. **quality_auditor:** re-run the live `engine_bug_queue` SQL at Gate 8 (not executable from this dispatch);
   run §10j item by item + the §10k coincidence audit; verify composed subscripts across all THREE text paths
   with zero literal underscores; verify HUD ring-gating (X/Z from S6, φ numeral from S7, plots S8+, Q S9
   only, V chips OFF in S8, explore core-only); verify the S2/S8 archetype pair is the ONLY repeat; treat a
   live f in S3–S7 as a design defect; check the built sim against the §3 control table; confirm the power
   slot is empty in every state.
8. **eye-walker pre-refutations:** the S5 assembly stop and S4 freezes are DECLARED bounded holds (file
   over-budget holds, not declared ones); the S9 ghosted curves are a deliberate family-overlay (not
   stale-frame residue); the S8→S9 i-axis re-scale is a declared, labeled change (not a regression); the S11
   trace-strip absence is designed (plots take the strip region in explore). Caption-ORDER evidence = the F7
   fillText probe on S4/S5/S8, not frame inference.
9. **No Write tool in this architect dispatch** — skeleton returned in the dispatch result for the loop
   session to persist (same authority-hole class as the live-SQL gap; standing chapter-end process note).

---

## Self-review checklist

- [x] Atomic claim ONE sentence; exclusions named with deferral targets (no re-teach; no power/power-factor;
  no LC slosh; no complex numbers).
- [x] State count 11 = very-complex band, justified as the chapter synthesis (four new quantities + one new
  operation + two pivots), with the merge-grading documented (S4/S5 and S6/S7 kept separate, reasons given).
- [x] Per-state control table present: teaches × archetype × distinct motion × Δ × controls × glow ×
  advance_mode × budget × `depth_ring`; none static; FOUR coins each one-line justified; exactly ONE declared
  contrast pair (S2/S8, delta names the flip); drag-sandbox explore-only.
- [x] Rule 32 plan incl. the concept-specific "never let the chain close by animation luck" caution; one glow
  focal per state from a proposed CLOSED enum (final enum owned by the engine dispatch's JSON contract).
- [x] Rule 33 dual-band plan with per-state real numbers + live instruments (33d) + the colour zoom-link.
- [x] Rule 34 canvas budget: Δ-cue captions, ONE formula surface per state (S2's deliberate NONE declared),
  value-only ring-gated HUD, zone map with READ CSS cites + sub-region fit checks (A0-1/A1-1 discharged),
  chrome clearance, power slot empty.
- [x] Rule 38: `depth_ring` column; qualitative → quantitative → derivation order; extended (S9) before the
  contiguous advanced block (S10) immediately before explore; BOTH cuts checked coherent (f₀ given in core at
  S8; no dangling references — constraints named); explore core-only; `curriculum_tags` claims with
  `needs_teacher_verification`; presets derived (hide, never reorder); graph-axis conventions decided, no
  toggle needed; anchor = widest-overlap device (radio tuning, 38f).
- [x] Misconception_watch at exactly TWO genuine pivots (S4, S8) with selection reasoning; the third
  candidate demoted to a distractor, documented; contrast beats wrong-consequence-first; no per-state tic; no
  EPIC-C branches.
- [x] 3 `has_prebuilt_deep_dive` states (S5/S6/S8) with 3 clusters each; divergence from the pivots
  documented (investment follows stuck-ness).
- [x] `teaching_method` per state; no `narrative_socratic`; Gate 12 ✓ (manual_click ×10 +
  interaction_complete); no wait_for_answer/pause_after_ms.
- [x] `entry_state_map` with foundational + 3 aspects; PRIMARY aha (S8) outside foundational → **mandatory
  exit-pill declared** (coverage rule satisfied via the declared fallback).
- [x] Prerequisites advisory; all four SEALED siblings + the DC-loop patch; cliffs named with single-clause
  patches.
- [x] Anchor universal + culture-neutral (radio tuning; contactless-card secondary), plain English,
  physics-true at depth (selectivity = S9's sharpness); mains constants neutral; nothing anchor-shaped drawn.
- [x] DoD complete, zero TBDs — symbol table under the pinned ASCII-token law; RHR N/A stated deliberately
  with the φ sign convention declared; motion plan total; modes declared; assessment + coverage mapped; the
  NEW §10k coincidence audit discharges A0-3 design-side; §10j existence table (12 pairings) discharges
  presence-is-not-correctness.
- [x] **Number lock verified, zero new defaults:** sealed decimals consumed verbatim; X_L = 20.000·f and
  X_C = 1.2502/f re-derived; work point (10.00/2.50/7.50/9.01/1.11/56.3°), mirror point, both S4 instant
  checks (+10.00 ✓ / +5.55 ✓), the 19.41 V and 30.0 V wrong sums, f₀ = 0.25002 Hz, and the S9 family
  (5.00/2.00/1.00 A · 0.10/0.25/0.50 Hz · Q 2.5/1.0/0.5) all re-computed here, not trusted; the
  display-precision law (Z at 1dp) decided WITH its honest reason (the 2nd-decimal mirror asymmetry).
- [x] Engine bug queue consulted via the checklist mirror + ch7 state + Checkpoint-C packet + all scar rows
  (the four phasors architect scars applied as binding duties); live-SQL gap FLAGged to Gate 8; the OPEN
  precision-checklist directive's four items each explicitly closed in §0b.
- [x] Engine triage explicit: Class-A honestly evaluated and rejected (six hard gaps vs `ac_phasor`);
  Class-B clean standalone sibling; both dispatch sub-issues (a) compose and (b) colour addressed with
  declared defaults + the founder's open rulings left un-consumed; json_author blocked until the delta lands.
- [x] Block 1 + Block 2 complete (cliffs, JEE trace, 6-item planting audit, PRIMARY + 1 supporting, cohesion,
  wrong-belief setups, coverage-rule disposition).
- [x] Handoff-ready for founder-proxy Checkpoint A, then physics_author.
agentId: a9ba78dd750aa08df (use SendMessage with to: 'a9ba78dd750aa08df', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 216760
tool_uses: 11
duration_ms: 1539678</usage>