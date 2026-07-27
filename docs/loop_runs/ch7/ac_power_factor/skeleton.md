# ARCHITECT SKELETON — `ac_power_factor`

> Ch.7 concept 6/8 of the CHAPTER_LOOP run (docs/CHAPTER_LOOP.md), written for founder-proxy Checkpoint A.
> Sibling references (all SEALED): `ac_voltage_resistor` (`6b97ede`), `ac_voltage_inductor` (`35ae566`+`eae16ca`),
> `ac_voltage_capacitor` (`21e1f0f`+`832b1d3`+`219937d`), `phasors` (`62911da`+fixes), `series_lcr_circuit`
> (`cec3a50`+`5dc7ccd`, CpC SEALED 2026-07-24). Binding handoff packet: `docs/loop_runs/ch7/series_lcr_circuit/skeleton.md`
> Escalations §5+§6 + `docs/loop_runs/ch7_state.md` handoff note — every DELIVERS/WITHHOLDS clause consumed below.
> This is the concept the EMPTY power slot was reserved for all chapter: the withheld set (any power quantity,
> trace, or formula; the energy interpretation's POWER face) is THIS sim's front door.

**Chapter:** Class 12, Ch.7 Alternating Current — NCERT §7.7 "Power in AC Circuit: The Power Factor"
(table-of-contents reference only; teaching authored from first principles; no NCERT sequence/example/figure
imported). `concept_id: ac_power_factor`, label "Power in AC Circuits — The Power Factor".
**Renderer:** `field_3d` — NEW `scenario_type: "ac_power"` (Class-B triage; manifest in §0b — a CLONE-sibling
of the sealed `ac_series_lcr`, never an in-place extension).
**Position:** 6th of 8 in the founder-approved Ch.7 map. **This sim teaches the POWER consequence of the
series-LCR circuit** — impedance, the triangle, φ, and resonance arrive as one-clause settled callbacks, never
re-derived. Free LC energy slosh (source removed) is NOT touched (deferred to `lc_oscillations`); the
transformer's use of high-voltage/low-current transmission is NOT touched (deferred to `transformer`).

**Number self-verification (before committing):** P = I²ᵣₘₛR = 0.785²·5 = 3.08 W ✓; S·cosφ = 5.55·0.555 = 3.08 ✓; components 0.435² + 0.653² = 0.785² ✓; R-step paradox R 5→2 Ω gives I 0.785→0.911 A UP while P 3.08→1.66 W DOWN ✓; gauge peaks E_L 1.96 J / E_C 0.49 J ✓.

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL is not executable from this architect dispatch (no Bash/DB tool — same gap as all five sibling
dispatches; **FLAG to quality_auditor: re-run `npx tsx --env-file=.env.local
src/scripts/query_engine_bug_queue.ts ac_power_factor` + `--field3d --open` at Gate 8**). Consulted in full:
`docs/FIELD3D_SCENARIO_CHECKLIST.md`, `docs/loop_runs/ch7_state.md` (through the series_lcr seal),
`docs/loop_runs/ch7/series_lcr_circuit/skeleton.md` + `founder_proxy_report_checkpointC.md`, and
`docs/loop_runs/ch7/_engine/scar_candidates.sql` lineage (all rows referenced by the sibling packets,
including the six series_lcr Stage-2b rows). Prevention rules applied (summary):

- `field3d_new_scenario_engine_ask_precision_checklist` (OPEN directive) — all four items closed in §0b:
  scripted ramps closed-form + thumb-visible + grabbable; every curve/arrow/gauge op named arithmetically;
  applyGlowEmphasis exemptions declared; dedicated Cambria formula panel (`pwr_formula`).
- `skeleton_zone_map_asserts_pane_geometry_never_checked` — every placement cites CSS READ this dispatch
  (slcr_band 500×170 bottom:185px:left:12px `:28571–28573`; slcr_readout top:52px:right:12px `:28567–28568`;
  slcr_formula top:40%:right:22px `:28576–28577`; slcr_sliders bottom:12px:right:12px `:28580–28581`;
  element power pane `acl_graph_p` `:25288`). The 13px band/power-slot conflict flagged by series_lcr
  (Escalation §5) RESOLVED here by construction (§0b item 2).
- `one_shot_over_constrained_by_both_phase_target_and_narration_cue` — F2 semantics (cue ARMS, phase FIRES).
- `oncanvas_numeric_coincidence_shown_unqualified` — five coincidences audited in §10k + the Q symbol
  collision (quality-factor vs reactive power) dual-labeled.
- `field3d_freeze_window_must_be_phase_time_subtraction` — N/A by design: no state freezes the clock.
- "Presence is not correctness" — §10j existence-assertion table (12 pairings).
- `field3d_dt_accumulated_motion_invisible_to_eye_timepin` — ONE closed-form θ(t) per state; E_R(t) is the
  closed-form integral, never an accumulator.
- `field3d_rms_subscript_ascii_in_renderer_text_paths` (recurred as series_lcr row 2) — all authored strings
  carry pinned ASCII tokens composed to styled subscripts on all THREE text paths, zero literal underscores.
- `field3d_struck_sum_rounds_full_not_displayed_addends` (F7) — every chip verified at DISPLAYED addends;
  S8's S²=P²+Q² NEVER chipped as arithmetic (numeric check stays P/S=0.555=cosφ).
- `field3d_slcr_impedance_triangle_downleg_clips_band` (series_lcr row 6, P3) — cloned triangle draws with
  ≥12px vertex margins BOTH winner cases (scar class closed in-clone; the sealed slcr original stays queued).
- `field3d_slcr_empty_band_leaks_ac_source_mini_schematic` (F6) — pwr_band/ppane/gauge display content-gated.

**DC Pandey check:** no DC Pandey content consulted. Scope validated against the founder-approved Ch.7 map +
the NCERT §7.7 ToC entry only. All physics re-derived from p(t)=v·i + the settled series-LCR facts.

---

## 0b. Engine triage + ask — Class-B (engine delta FIRST; clone-sibling, NOT in-place extension)

**Triage verdict: Class B — `json_author` may NOT start until a renderer delta lands.**

**Class-A rejected (can `ac_series_lcr` carry this pure-JSON? No — seven hard gaps):** (1) no p(t) product
curve anywhere (the power slot was existence-ASSERTED empty in all 11 sealed states; sealed EYE baselines lock
that emptiness); (2) no averaging wattmeter (meter machinery lives in the element scenarios `acl_meter`
`:25245`, never in slcr); (3) no current-component decomposition (projection machinery exists nowhere —
slcr's tip-to-tail is composition, the inverse); (4) no power triangle / ×I²ᵣₘₛ morph, no W/VA/VAR chips;
(5) no cosφ readout; (6) no per-element energy gauges (one gauge exists in the inductor scenario only);
(7) the 13px band/power-slot conflict needs MOVING panes — a CSS change inside a sealed scenario.

**Why not extend in place:** an in-place extension would edit shared draw functions inside a SEALED scenario
whose EYE baselines just became the chapter's regression proof. The chapter has cloned five times (slcr §0b
DF1 ruling). **Decision: NEW `scenario_type: "ac_power"`, prefix `pwr_`, cloned from `ac_series_lcr` + the
element scenarios' power machinery. No refactoring of any sealed scenario.**

**REUSE manifest (advisory clone-source note):** chapter home pose (WIDENED three-slot loop, heater/coil/
plates docked ASSEMBLED, sine-stamped source ring, amber beads); slcr_band geometry + fillText hook;
readout/formula/sliders chrome; the fan's closed-form θ(t) + constant-offset arrows (only v cyan + i amber);
the impedance triangle + ÷iₘ morph as the ×I²ᵣₘₛ template; element power machinery — `ac*_graph_p` pane, the
resistor product-walk cursor, `acl_meter` (3D averaging meter, live numeric + needle, never dimmed —
`:25406` exemption READ), `acl_u_gauge`; scripted-ramp + drag-seize + F8 off-grid slider patterns; Rule-27
stable IDs.

**NEW machinery (the genuine asks — physics_author sizes; runs in-loop via §3b):**
1. **`pwr_` scenario skeleton** — clone of `ac_series_lcr`; additive code only; zero-sibling-internal-lines
   diff grep is a verify-chain duty.
2. **Zone re-plan (resolves the flagged 13px conflict):** `pwr_band` 500×150 @ `bottom:210px;left:12px`
   (210–360px = element-sibling scope envelope; disc ~150px left, strip ~330px right, x-origins ±20px).
   Bottom row @ `bottom:88px` height 110 (88–198px — 12px clear of the band): `pwr_ppane` ~330×110 x-aligned
   under the strip, gauge pane ~150×110 @ `left:12px` under the disc (S7 only). **Binding invariant: the
   p-pane's time-axis x-range is PIXEL-ALIGNED with the strip's time axis** (the S2 multiply cursor is one
   vertical line through v, i, p). Engine fine-tunes ±20px; invariants: rows disjoint · alignment · left:12px
   · sealed envelope.
3. **Averaging wattmeter** — clone of `acl_meter`: needle + live numeric `P = 3.08 W`, trailing-cycle average
   (settles to closed-form P); never dimmed. NEW: a **ghost needle** overlay (S4 one-shot) parked at the
   naive V_rms·I_rms with its own chip; F1-cleared on exit.
4. **`pwr_ppane` product pane** — clone of element `ac*_graph_p` generalized to arbitrary φ: p-curve =
   pointwise product of the SAME sample grid as the strip traces (power hue); zero line; signed lobe fills
   (positive translucent power hue, negative desaturated blue-grey "returned"); dashed ⟨p⟩ line + chip; the
   walking multiply cursor for S2/S3.
5. **Current-component split** — cue-armed one-shot: from the amber i-arrow, two dashed co-rooted components
   materialize — i∥ (I_rms·cosφ, along v's unit vector, power hue) + i⊥ (I_rms·sinφ, perpendicular, reactive-
   winner hue) — with a projection guide from i's tip; the solid amber i persists; rotates rigidly after.
   Vector-sum probe: i∥ + i⊥ = i (§10j).
6. **Power-triangle morph** — parameterized re-use of the slcr morph: the impedance triangle (5.0/7.50/9.0 Ω)
   re-scales × I²ᵣₘₛ = 0.616 and re-labels Ω→W/VAR/VA in one scripted move (P=3.08 W power hue · Q=4.62 VAR
   winner hue · S=5.55 VA cyan); right angle preserved; ≥12px vertex margins both winner cases.
7. **Per-element energy gauges (S7)** — three `acl_u_gauge` clones side by side: E_L=½L·i(t)² and
   E_C=½C·v_C(t)² breathe (net zero); E_R=closed-form ∫i²R dt ratchets (+6.15 J/cycle at work point); heater
   mesh warm-glows in the power hue as E_R climbs, coil/plates stay cold. All gauge dynamics closed-form.
8. **cosφ machinery** — HUD chip (F3-gated from S4), triangle ratio chip `cos φ = R/Z = 0.555`, the S4 chip-
   arithmetic sequence under the F1 single-latest pattern.
9. **Compose routine — rule-of-FOUR.** Default (trial-safe): a fourth `pwr_`-scoped clone of
   `accComposeSegments`. Restated recommendation to the founder: promote NOW (acc/phs/slcr/pwr identical;
   transformer #8 needs it too). Promotion only on explicit founder approval at the engine-dispatch boundary.
10. **Same-change duties:** `deriveStateMeta.ts` registration + settle pins for all 10 modes (proposed enum:
    `meter_dock | product_wave | wave_sinks | apparent_vs_real | current_split | wattless | energy_ledger |
    power_triangle | derivation | explore`); proposed `visible_elements`: `pwr_circuit | pwr_beads | pwr_meter
    | pwr_strip | pwr_ppane | pwr_fan | pwr_split | pwr_triangle | pwr_gauges | pwr_chips | pwr_formula`;
    proposed CLOSED glow-key enum: `circuit · beads · meter · strip · p_pane · fan · i_split · triangle ·
    gauges · chips · formula`; slider rows vₘ/f/R/L/C with ramp-drives + drag-seize; the fillText caption-
    order hook on band + p-pane; overlays top:52px+; founder:drive collision probe + cropped-frame inspection.
    The engine dispatch's JSON-contract log entry is the authoritative final enum set.
11. **Colour semantics (declared; founder colour-law ruling still open):** cyan=v, amber=i consumed. NEW:
    **real-power hue = warm red-orange** (engine-owned hex, contrast-checked vs amber) for p-curve/⟨p⟩ line/
    meter accent+needle/P-leg/i∥/heater glow — ONE hue = ONE physical idea. **i⊥ and Q-leg = live reactive-
    winner hue** (violet X_L wins / green X_C wins — slcr's X-leg convention). **S = cyan** (inherits Z's hue;
    S is the source's volt-amp product). Negative-lobe "returned" tint = desaturated blue-grey.
12. **Regression duty:** `capacitance` 44/44 H2 0.00% + ALL FIVE sealed ac siblings clean (incl.
    `series_lcr_circuit` 47/47) + the zero-sibling-internal-lines diff grep. Every §3b dispatch restates
    "no DB writes — files only". RUNAWAY GUARD: engine-loop commit count enters at 16 (past the guard, under
    the founder's whole-chapter grant) — keep surfacing at every boundary.

---

## 1. Atomic claim

This concept teaches how much average power an AC circuit actually consumes — p(t)=v·i as a double-frequency
wave riding a DC offset, that offset ⟨p⟩ = V_rms·I_rms·cosφ, the power factor cosφ = R/Z as the fraction of
apparent power that is real, the wattless quadrature current I_rms·sinφ that flows without spending, where the
real power physically lands (P = I²ᵣₘₛR — all in R), and the power triangle P/Q/S as the impedance triangle
scaled by I²ᵣₘₛ — and only that. It does not re-derive impedance/phase/resonance (settled in
`series_lcr_circuit`; callbacks only), does not treat free LC oscillation (deferred to `lc_oscillations`),
does not treat transmission-line design/voltage step-up (deferred to `transformer`; transmission is narration
only), and does not use complex power (out of syllabus scope).

---

## 2. State count + arc — **10 states**

Top of the complex band + 1, honest not padded: FOUR new quantities (p(t) + offset, cosφ, wattless current,
P/Q/S), ONE new representation operation (projecting the current phasor — inverse of slcr's tip-to-tail), TWO
misconception pivots, one extended-ring structure (power triangle), one advanced derivation; every LCR fact a
one-clause callback. Merge-graded: S1+S2 separate (instrument-and-naive-law vs product-wave construction);
S5+S6 separate (the split is the mechanism, the R-step paradox its shocking consequence + its own pivot);
cosφ=R/Z FOLDED into S4 (callback to the delivered triangle, not new teaching) — the 11-state cut rejected.

**Spine — a law that works, fails, comes back deeper:** at the home setting (secretly resonance) a wattmeter
reads 10.0 W = V_rms·I_rms = the bare heater's number: the naive law LOOKS perfect. Step off the home
frequency and it breaks: meter reads 3.08 W while volts-times-amps says 5.55. The missing factor is the
circuit's own angle — cos 56.3° = 0.555 — because only the current's in-phase shadow does work. The chapter's
two extremes (heater cosφ=1; lone coil/plates cosφ=0, current flowing, meter dead) are the two ends of one dial.

| State | Purpose | teaching_method |
|---|---|---|
| S1 `the_wattmeter_reads_ten` | Averaging wattmeter on the home circuit: 10.0 W = V_rms·I_rms exactly — naive law seems perfect; mystery parked | straightforward |
| S2 `the_product_wave` | p(t)=v·i built instant by instant: a double-frequency wave, all positive at unity, whose AVERAGE is the meter's number | straightforward |
| S3 `off_resonance_the_wave_sinks` | Off the home f the product wave sinks below zero, average slides 10.0→3.08 W — some power flows BACK | straightforward |
| S4 `volts_times_amps_fails` | 16a PIVOT #1 — V_rms·I_rms=5.55 over-predicts the measured 3.08; ratio 0.555 IS cos 56.3°=R/Z: the power factor | straightforward + contrast |
| S5 `only_the_shadow_works` | PRIMARY AHA — the current splits: only I_rms·cosφ rides in phase with v and delivers power; the perpendicular rest does nothing | straightforward |
| S6 `wattless_current` | 16a PIVOT #2 + SUPPORTING AHA — drop R and the current GROWS while the meter FALLS: the extra amps are wattless | straightforward + contrast |
| S7 `where_the_power_goes` | Energy ledger: L and C borrow and return every cycle (net zero); R alone ratchets — P=I²ᵣₘₛR, all in the heater | straightforward |
| S8 `the_power_triangle` | Impedance triangle × I²ᵣₘₛ = power triangle: P(W) real, Q(VAR) reactive, S(VA) apparent; cosφ=P/S | straightforward |
| S9 `the_average_from_the_algebra` | Derivation: p=vₘiₘ sinωt·sin(ωt−φ) → offset (vₘiₘ/2)cosφ + zero-average wiggle → P=V_rms·I_rms·cosφ=3.08 W | derivation_first_principles |
| S10 `power_sandbox` | The whole power story under the teacher's hands — every slider moves wave, needle, split, cosφ together | exploration_sliders |

**Locked physics numbers (inherited + re-derived, never trusted).** Defaults vₘ=10.0 V, f=0.25 Hz, R=5.0 Ω,
L=3.1831 H, C=0.1273 F. X_L=20.000·f Ω, X_C=1.2502/f Ω.
- RMS: V_rms=vₘ/√2=7.0711→**7.07 V**; I_rms=iₘ/√2.
- **Default=resonance (S1–S2):** Z=R=5.0, iₘ=2.00, I_rms=1.4142→**1.414 A**, φ=0, cosφ=**1.000**,
  P=V_rms·I_rms=7.0711×1.4142=**10.00 W**=I²ᵣₘₛR=2.000×5.0=the resistor concept's ⟨p⟩. S=10.0 VA, Q=0. p(t)
  spans 0…20.0 W, offset 10.0 W.
- **Work point f=0.50 (S3–S9):** X_L=10.000, X_C=2.5004, X=7.4996, Z=9.0136→**9.0 Ω**, iₘ=1.1094→**1.11 A**,
  I_rms=0.78449→**0.785 A**, φ=56.31→**56.3°**, cosφ=5/9.0136=0.55472→**0.555**. S=V_rms·I_rms=5.5470→
  **5.55 VA**. P=S·cosφ=I²ᵣₘₛR=3.0771→**3.08 W**. Q=S·sinφ=I²ᵣₘₛX=4.6153→**4.62 VAR**. p(t) offset 3.08,
  swing ±5.55 → spans **−2.47…+8.62 W**. sinφ=0.83203→0.832.
- **S5 components:** i∥=I_rms·cosφ=0.43518→**0.435 A**; i⊥=I_rms·sinφ=0.65272→**0.653 A**. Checks:
  V_rms×i∥=7.0711×0.43518=3.077=P ✓ (displayed: 7.07×0.435=3.0755→3.08 ✓); 0.435²+0.653²=0.6157≈0.785²=
  0.6162 ✓ (never chipped — §10k).
- **S6 R-step (R=2.0, f=0.50):** Z=√(4+56.244)=7.7617, φ=75.06→**75.1°**, cosφ=**0.258**, I_rms=7.0711/7.7617=
  **0.911 A** (UP from 0.785), P=I²ᵣₘₛR=0.830×2=**1.66 W** (DOWN from 3.08), i⊥=**0.880 A**, i∥=**0.235 A**,
  S=6.44 VA. Paradox exact: +16% current, −46% power.
- **S7 energies (f=0.50, R=5):** T=2.00 s; E_R/cycle=P·T=6.154→**6.15 J**; E_L=½L·iₘ²=½×3.1831×1.2308=
  **1.96 J**; V_C,peak=iₘX_C=2.774 V → E_C=½C·V²=**0.49 J**. L/C gauges return to floor each cycle (net zero).
- **Display-precision LAW (binding, extends slcr's):** V_rms 2dp · I_rms 3dp (0.785 — REQUIRED so S4/S7
  displayed-addend arithmetic closes; 2dp breaks F7) · P/S/Q 2dp · cosφ 3dp · φ 1dp · f 2dp · Z 1dp ·
  energies 2dp. HUD computes from true values, rounds for display.
- **Edge FLAGs:** p-pane guided y −4…+21 W (holds both points); explore extremes (vₘ=20 at resonance → p peaks
  80 W, P=40 W; R=2 at resonance → P=25.0 W) take a labeled auto-range or honest clamp + true-number chip.
  R=2 AT RESONANCE **raises** P to 25 W (P=V²ᵣₘₛ/R) while the same drop at f=0.50 LOWERED it — the S6 planting
  guard + an explore discovery, both declared.

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Archetypes (2 coins + fleet inherits):** `product-walk` (S2, fleet element reuse — cursor walks two aligned
traces multiplying pointwise into a third); `component-split` (S5, coin — one arrow decomposes into two
perpendicular co-rooted dashed components + projection guide; inverse of slcr tip-to-tail); `unit-morph` (S8,
fleet inherit from slcr S6). Fleet/seed: `reveal-build` (S1), `ramp-response` (S3), `ghost-overlay-compare`
(S4), `cycle-compare` (S6, A→B→A′), `oscillate/track` (S7), `chain-link-derivation` (S9), `drag-sandbox` (S10).

**Control-gating (Rule 31c):** f plain-live at S3 after its scripted glide (drag-seize); R plain-live at S6
after the scripted cycle returns it to 5.0. ALL sliders LOCKED in S1–S2, S4–S5, S7–S9 (mid-construction
chips/morphs/gauges must not re-scale, 32b). Explore exposes all five. quality_auditor: any other live slider
= a design defect.

| State | ring | Teaches (ONE idea) | Archetype | DISTINCT motion | Δ cue | Controls | glow | advance_mode | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 | core | A real power meter — volts-times-amps seems to nail it | reveal-build | Home pose = the settled slcr machine at resonance (nothing re-assembled). An averaging wattmeter docks; needle climbs to **10.0 W**, live numeric. HUD chips V_rms=7.07, I_rms=1.414; one spoken 7.07×1.414=10.0. Plant: "the bare heater ate exactly this; a lone coil ate nothing. Does volts-times-amps always work? Park that." | "A meter for watts" | none | meter | manual_click | 40–55 |
| S2 | core | Power is the INSTANT product p=v·i — a 2f wave whose average is the meter's number | product-walk | Band docks (strip cyan v + amber i, in step at resonance); the p-pane docks beneath, time-axes pixel-aligned (fills the chapter-long empty slot). A cursor walks one cycle: samples multiply, power-hue p-curve rises — twin humps/cycle, touching zero, never negative. Dashed average at 10.0 W; needle sits on it. | "Multiply v and i" | none | p_pane | manual_click | 40–55 |
| S3 | core | Off the home frequency, part of every cycle flows BACKWARD — the average sinks | ramp-response | Cause first: f thumb glides 0.25→0.50 Hz (closed-form ≈3s). Effect: i-crest slips 56.3° late (callback), the p-curve SINKS — troughs below zero, negative lobes filling grey "returned", average slides 10.0→**3.08 W**, needle follows. No formula, no new word. f then plain-live. | "The wave dips negative" | **f** (plain-live) | p_pane | manual_click | 35–50 |
| S4 | core | 16a PIVOT #1 — V_rms·I_rms is only APPARENT power; real = that × cosφ | ghost-overlay-compare | Wrong consequence FIRST: a ghost needle swings to where V·I points — chip `7.07×0.785=5.55 W?` — while the REAL needle holds 3.08. Chip STRUCK. Repair: ratio chip `3.08/5.55=0.555`; the delivered impedance triangle docks, its angle brightening — cos 56.3°=R/Z=5/9.0=**0.555. Same number.** Named: power factor cos φ. F1-cleared sequence. | "Real is apparent × cos φ" | none | chips | manual_click | 45–55 |
| S5 | core | PRIMARY AHA — only the in-phase current component delivers power; P=V_rms×(I_rms cosφ) | component-split | Fan docks (v cyan + i amber, 56.3° apart, one clock). Rotation holds; from i's root two dashed components materialize with a projection guide: **i∥=0.435 A** along v (power hue) + **i⊥=0.653 A** perpendicular (violet). Check: 7.07×0.435=3.08 W — the meter's number from the shadow alone. Solid amber i stays (one current, two accountings). Clock resumes; split rotates rigidly. | "Split the current arrow" | none | i_split | manual_click | 45–55 |
| S6 | core | 16a PIVOT #2 + SUPPORTING AHA — current and power move OPPOSITE; the growth is wattless | cycle-compare | Scripted R-cycle, thumb visibly moving: R steps 5.0→2.0 Ω. Beads speed up — I_rms 0.785→**0.911 A** — yet the needle FALLS 3.08→**1.66 W**: on the fan i⊥ fattens to 0.880 A while i∥ shrinks to 0.235. More amps, fewer watts. Callback: a lone coil ran two full amps, meter dead — all i⊥. R steps back to 5.0 (A′); guard: "here reactance dominates — at the home frequency dropping R does the opposite." Dual-label: wattless (idle) current, I_rms sinφ. R then plain-live. | "More amps, fewer watts" | **R** (plain-live) | meter | manual_click | 45–55 |
| S7 | core | All real power lands in R — L/C only borrow and return; P=I²ᵣₘₛR | oscillate/track | Three energy gauges dock: over one cycle **E_L 0→1.96→0** and **E_C 0→0.49→0** (net zero — borrowed, returned), while **E_R only ratchets** +6.15 J/cycle. Heater warms into the power hue as E_R climbs; coil/plates stay cold. Close: 0.785²×5.0=**3.08 W** — the meter's number a third way. | "Only the heater keeps it" | none | gauges | manual_click | 40–55 |
| S8 | extended | Impedance triangle × I²ᵣₘₛ IS the power triangle — P real, Q reactive, S apparent | unit-morph | The impedance triangle (5.0/7.50/9.0 Ω) detaches and re-scales × I²ᵣₘₛ=0.616 in one morph; legs re-label/re-colour: **P=3.08 W** (power hue), **Q=4.62 VAR** (violet), **S=5.55 VA** (cyan hypotenuse). Dual-labels once: real(active) W · reactive VAR · apparent VA. Check chip cos φ=P/S=3.08/5.55=0.555 ✓. Clause: "Q isn't lost — borrowed and returned — but the wires must still carry it. At the home frequency this triangle collapses flat: all real." | "Same triangle, watt units" | none | triangle | manual_click | 45–55 |
| S9 | advanced | Derivation p=vₘiₘ sinωt·sin(ωt−φ) → ⟨p⟩=(vₘiₘ/2)cosφ=V_rms I_rms cosφ | chain-link-derivation | Apparatus dims (E4 restore, reveal_hold). Cambria chain docks link by link: product → product-to-sum (vₘiₘ/2)[cosφ − cos(2ωt−φ)] → the cosine term averages ZERO (dimmed p-pane wiggle pulses) → survivor (vₘiₘ/2)cosφ=V_rms I_rms cosφ → substitute: 5.55×0.555=**3.08 W** — the needle, now in algebra. | "Average the product wave" | none | formula | manual_click | 45–55 |
| S10 | core (ring-neutral, 38b) | The whole power story under the teacher's hands | drag-sandbox | Free-runs (Rule 37). ALL five sliders. Surfaces: circuit+beads+meter, strip+p-pane (live product, lobes, average), fan with live split, HUD f/V_rms/I_rms/cosφ/P. Drag **f** → lobes+cosφ move together (0.25 Hz: negatives vanish, needle peaks = unity PF rediscovered); **R** replays the S6 paradox — and at resonance does the OPPOSITE (P→25 W at R=2); **L/C** move the unity point; **vₘ** scales all. L/C off-grid F8 snap. p-pane auto-ranges. NO Q/VAR chips, NO triangle, NO derivation (ring-gate). Formula: `P=V_rms·I_rms·cosφ`. | "All yours" | **ALL: vₘ·f·R·L·C** | formula | interaction_complete | 0/open |

**No-repeat audit:** reveal-build · product-walk · ramp-response · ghost-overlay-compare · component-split ·
cycle-compare · oscillate/track · unit-morph · chain-link-derivation · drag-sandbox — ten distinct, none
static, no repeat (no contrast-pair needed); 1 coin justified, 2 fleet inherits declared; drag-sandbox
explore-only.

**Rule 32:** 32a cause-first everywhere (meter docks THEN climbs; cursor walks THEN curve rises; thumb glides
THEN crest slips THEN lobes sink; ghost swings THEN strike THEN ratio THEN naming; rotation holds THEN split
THEN check; thumb steps THEN beads accelerate THEN needle falls; cycle turns THEN gauges breathe THEN ratchet;
triangle detaches THEN re-scales THEN re-labels; links dock one per clause). 32b one variable per state. 32c
Δ column verbatim as caption openers. 32d ONE apparatus from the slcr home pose, inherited ASSEMBLED (no
re-build/teleport); meter docks S1 persists; band+p-pane dock S2 persist; camera holds S1→S10. 32e one glow
focal/state from the CLOSED enum. **⚠ 32a caution (binding):** the p-curve is the pointwise product of the
SAME sample arrays that draw the strip traces — never an independently-computed curve that merely agrees; the
average line and needle read the SAME closed-form P; the split components computed from live phys; vector-sum
probe closes the loop. "Never let the product agree by animation luck."

**Rule 33:** macro = real circuit (elements, beads, warm heater, wattmeter a teacher reads); representation =
strip/p-pane/fan/triangle/gauges; link = matched colours (power hue: needle=⟨p⟩ line=P-leg=i∥=heater glow;
winner hue: i⊥=Q-leg) + needle on the average line + HUD closing every mystery numerically. Per-state real
number: S1 10.0 W · S2 0–20 W humps avg 10.0 · S3 −2.47 troughs avg 3.08 · S4 5.55 vs 3.08 ratio 0.555 · S5
0.435/0.653 A check 3.08 · S6 0.911 A up/1.66 W down · S7 6.15 J/cycle peaks 1.96/0.49 · S8 3.08/4.62/5.55 ·
S9 3.08 W · S10 all live. Instruments per 33d: wattmeter (never dimmed), HUD, cosφ (S4+), component chips
(S5–S6), gauges (S7), P/Q/S chips (S8 only).

**Cue plan (F2 arm/fire):** per-state cue lists in §3 detail; no authored instant at t=0; `*_at_ms` = EYE
arming fallbacks only.

---

## 4. Misconception confrontation (Rule 16a — exactly TWO pivots)

Both canonical power-factor errors are DC-habit transfers. (1) "Power is volts times amps" — true in DC + for
the AC resistor, arrives EARNED, fails at φ≠0. (2) "More current means more power" — co-move in every circuit
the student computed; wattless current breaks it. A third candidate ("reactive elements consume their share")
is the same error's energy face — killed by S7's gauges, demoted to a distractor (Q5), not a third pivot.

| Wrong belief | Pivot + beat |
|---|---|
| "Average AC power is V_rms × I_rms" (earned: S1 showed it at unity; the resistor proved it) | **S4.** counter: ghost needle at 5.55 W vs real 3.08, chip `7.07×0.785=5.55 W?` struck · fix: "Volts times amps is the apparent power — the ceiling; the real power is that times cos φ, the fraction that survives the circuit's angle." |
| "A big AC current always means big power consumption" (earned: S1–S4 co-moved) | **S6.** counter: R-step, beads accelerate, I_rms 0.785→0.911 while the meter FALLS 3.08→1.66, i⊥ fattening · fix: "Only the in-phase part of the current does work — the extra amps are wattless: they shuttle energy back and forth without spending it." |

No other state carries `misconception_watch`. No EPIC-C branches.

## 5. `has_prebuilt_deep_dive` states
**S4** (apparent-vs-real — "why isn't power just VI", "what is a volt-ampere"), **S5** (the projection — "what
does cos φ mean physically", "why cosine and not sine"), **S8** (units — "why kVA not kW"). Divergence from
pivots documented: pivots S4/S6 but investment S4/S5/S8 (S6 resolves in-state; S5/S8 are where algebra
sticks). Cache-hint only, not a gate (Rule 18).

## 6. Drill-down clusters
S4: `apparent_vs_real_power` · `why_power_less_than_v_times_i` · `volt_ampere_vs_watt_units`
S5: `power_factor_physical_meaning` · `in_phase_current_component` · `cos_phi_as_projection`
S8: `power_triangle_pqs_relations` · `reactive_power_var_meaning` · `kva_vs_kw_rating`

## 7. `entry_state_map`
```
foundational:   STATE_1 → STATE_5    # meter, product wave, failure, cosφ, split (PRIMARY aha inside)
wattless:       STATE_6 → STATE_7
power_triangle: STATE_8              # extended ring
derivation:     STATE_9
exploration:    STATE_10
```
Default aspect = `foundational`. PRIMARY aha (S5) INSIDE foundational → no mandatory exit-pill. Optional pill
at the foundational end: "So where do the other 0.653 amps go? →" into `wattless`.

## 8. Prerequisites (advisory — Rule 23)
`series_lcr_circuit` (Z/triangle/φ/resonance; cliffs S1/S3/S4), `ac_voltage_resistor` (rms, sin² product, ⟨p⟩=
10 W; S1/S2), `ac_voltage_inductor`+`ac_voltage_capacitor` (wattless extremes; S6), `phasors` (co-rooted arrows;
S5). Required-by: `lc_oscillations` (energy-ledger instrument + borrow/return), `transformer` (wattless-current
transmission motivation).

## 9. Real-world anchor (Rule 35 + 38f)
**Primary — the electricity grid's least-known enemy.** A factory of electric motors draws current through
kilometres of line. Motors are coils — inductive — so part of the current is wattless: no energy delivered, but
the wires carry ALL of it, and wires heat by I²R on the full current, working and wattless alike. Hence the
power-factor rating on heavy machines, the poor-power-factor penalty on large consumers, and the twin rating
(kW delivered / kVA the wires survive). S6's paradox is the grid engineer's daily arithmetic. Culture-neutral,
widest-syllabus-overlap power-factor context (38f), physics-true at every depth. **Secondary (narration-only):**
a compressor/motor nameplate "1.5 kW / 2.1 kVA" quotes P, S, and (silently) cosφ. Mains constants neutral (35b).
Nothing grid/motor-shaped drawn (Rule 24).

---

## 10. Definition of Done (Gate 0 — zero TBDs)
**(a) States:** the ten of §2, `state_count: 10`, contiguous; advance_mode 9× manual_click + 1×
interaction_complete; no wait_for_answer/pause_after_ms/narrative_socratic.
**(b) Symbol-label table** (dual-label once then bare; pinned ASCII tokens V_rms/I_rms/v_m/i_m/E_R/E_L/E_C
composed to styled subscripts, zero literal underscores): HUD f/V_rms=7.07 V/I_rms=1.414 A (S1); wattmeter
P (power hue, dual-label "real(active) power P" S4); p-curve `p=v·i` + ⟨p⟩ dashed line (S2); grey "returned"
lobes (S3); ghost+struck chip `7.07×0.785=5.55 W?` (S4 only); `cos φ=0.555` chip + `cos φ=R/Z` (S4); dashed
`I_rms cos φ`/`I_rms sin φ` arrows, dual-label "wattless (idle) current" (S5/S6); gauges E_R/E_L/E_C +
`+6.15 J` (S7); `P=3.08 W`/`Q=4.62 VAR`/`S=5.55 VA` (S8 only). **⚠ Q symbol collision:** slcr S9 used Q=quality
factor; HERE Q=reactive power — disarmed by dual-labeling "reactive power Q (VAR)" at S8, never saying "Q
factor", rendering no sharpness/bandwidth quantity (binding on physics_author).
**Formula surface per state (ONE each; algebra-only in core/extended; trig confined to S9; no integral
rendered):** S1 NONE (deliberate — enshrining V_rms·I_rms would consecrate the belief S4 breaks) · S2
`p(t)=v(t)·i(t)` · S3 NONE (the mystery state) · S4 `P=V_rms·I_rms·cos φ` · S5 `P=V_rms·(I_rms cos φ)` · S6
`I_wattless=I_rms·sin φ` · S7 `P=I²_rms·R` · S8 `S²=P²+Q²` (symbolic only — never chipped, §10k) · S9 the
chain · S10 `P=V_rms·I_rms·cos φ` (core). All real Unicode across three text paths.
**(c) RHR:** N/A performed. Sign conventions carried: φ inherited from slcr (source v leads i → inductive,
stated once at S4); **p-pane sign convention stated once at S3** — p>0 = source delivering, p<0 = circuit
returning; gauges inherit it (fill=absorbing, empty=returning).
**(d) Motion:** §3 table; beads+traces run every state (rotation holds briefly S5); no clock freeze anywhere;
S8 morph holds end pose; S9 dims E4-restored; S10 free-runs (Rule 37).
**(e) Modes:** conceptual-only; NO mode_overrides/epic_c_branches; renderer_pair field_3d/field_3d;
available_renderer_scenarios.field_3d=["ac_power"].
**(f) Assessment + coverage:** 6 questions: Q1 instantaneous vs average (2f about non-zero offset; distractor
"at the source frequency") → S2/S3 · Q2 compute P (distractor P=V·I=5.55 — the pivot belief) → S4 · Q3 cosφ
meaning (distractor "fraction lost as heat in L/C") → S5 · Q4 large current at zero power (distractor "no") →
S6 · Q5 where dissipated + P=I²ᵣₘₛR (distractor "shared by reactances" — the demoted belief) → S7 · Q6 PF and
power at resonance (distractor "cosφ=0 at resonance") → S1. `non_assessed_states:[STATE_8,STATE_10]`.
misconception_watch S4,S6. Gate 20 ✓ (aha states hit Q3→S5, Q4→S6).
**(g) Macro↔micro:** §3 Rule-33 block.
**(h) Canvas budget + zone map (CSS READ §0a):** caption = Δ cue only (F1 single-latest); prose in capStrip;
ONE Cambria formula surface on `pwr_formula` (top:40%:right:22px); HUD value-only top:52px:right:12px;
`pwr_band` 500×150 @ bottom:210px:left:12px (disc ~150 left, strip ~330 right); bottom row @ bottom:88px h110
(88–198px, 12px clear): `pwr_ppane` ~330×110 x-aligned under the strip (time axes pixel-aligned — binding),
gauge pane ~150×110 @ left:12px (S7 only); sliders bottom:12px:right:12px. Sub-region fit: strip 2 traces (<
slcr's 4); p-pane guided y −4…+21 W; disc worst S5/S6 (v+i+2 components+arc+2 labels < slcr's 5-arrow); gauge
3 bars ≥8px gutters; S8 morph ≥12px vertex margins BOTH cases (closes slcr clip in-clone). Engine ±20px;
invariants: rows disjoint · p-pane/strip pixel alignment · left:12px · one canvas/pane · top:52px+.
**(i) Curriculum-flex (Rule 38):**
- (i-1) Hide advanced (S9): S1–S8+S10 survive; S4 gives P as a MEASURED law, no surviving state promises the
  proof (binding on physics_author). Coherent. Hide advanced+extended (S8–S9): S1–S7+S10; no surviving state
  names Q/VAR/VA-triangle (S4 names apparent power S=V_rms·I_rms in VA — CORE, needed to state pivot #1; the
  TRIANGLE/Q are extended); S7 close is complete; explore no P/Q/S. Coherent. (S1/S3 formula-NONE means no
  early state depends on later vocabulary.)
- (i-2) Explore core-only: circuit+meter+strip+p-pane+split fan+f/V_rms/I_rms/cosφ/P HUD+5 sliders; Q/VAR/
  triangle/derivation ABSENT; formula = core P=V_rms·I_rms·cosφ.
- (i-3) curriculum_tags (claims; only CBSE/NCERT verified on founder-as-in-trial-authority per slcr A4):
  CBSE/NCERT+JEE/NEET ✓ full-verified (S8 triangle = JEE-adjacent extension, board-weighting
  needs_teacher_verification); CAIE A-level ◐ partial (rms + mean power in resistive; PF believed absent)
  needs_teacher_verification; IGCSE ✗ / IB DP ✗ / AP Phys 2 ✗ / AP Phys C E&M ✗ / Ontario SPH4U ✗ all
  needs_teacher_verification.
- (i-4) Presets (hide, never reorder): CBSE+JEE → S1–S10; board-lean CBSE → hide S8; generic core → hide
  S8–S9; others none pending teacher verification.
- (i-5) Graph axes: strip + p-pane t-on-x (universal); no board conflict → no toggle.
**(j) Existence-assertion table (binding):** 12 pairings — the p-pane EXISTS with sampled non-zero product =
v[i]·i[i]; min(p)≥0 at resonance + 2f periodicity; min(p)=−2.47 W + grey fill at f=0.50; average line ==
needle == closed-form P; both needles exist + struck chip S4 only; composed cosφ zero S1–S3 present S4+; solid
i persists + vector-sum i∥+i⊥=i; both-ways probe I_rms↑ while needle↓ (S6); gauge net-zero L/C, E_R strictly
increasing +6.15 J; morph leg-ratio ∝ R/X/Z, right angle, ≥12px margins; VAR present S8 only + chain S9 only +
S10 BRIGHT; thumb-displacement S3/S6 + p-pane/strip pixel x-alignment.
**(k) Coincidence audit (A0-3):** (1) P(resonance)=10.0 W=the resistor's ⟨p⟩ — TAUGHT callback, load-bearing.
(2) S=10·cosφ at R=5 (artifact of vₘ²/2R=10) — the 5.55/0.555 digit echo: chips never juxtaposed as an
equation, caption never pairs them, S6's R-step breaks the ratio live (R=2→S=6.44, cosφ=0.258); guard clause
"with THIS source and heater — our build, not a law". (3) V_R,peak (slcr S3)=5.55 V=S here — structurally
avoided (element voltage chips never render here). (4) I_rms=√2 A at resonance — shown 1.414, never symbolized
√2. (5) S²=P²+Q² fails at displayed addends (30.80 vs 30.83) — never chipped as arithmetic; check stays
symbolic+geometric, numeric check P/S=0.555=cosφ ✓ (F7 law). (6) Q collision — §10b dual-label duty. Verified
chips: 7.07×0.785=5.55 ✓ · 3.08/5.55=0.555 ✓ · 0.785²×5.0=3.08 ✓ · 7.07×0.435=3.08 ✓ · 5.55×0.555=3.08 ✓.

**TTS:** author teacher_script EN (25–55 w/guided state); text_hi via the Rule-30g Sonnet-5 sub-agent pre-ship
(30i — never text_te); audio on-demand EN only (30h). **Registration (8 sites):** JSON · concept_panel_config/
CONCEPT_PANEL_MAP (file-only in trial; ship-time default_panel_count=1) · CONCEPT_RENDERER_MAP → field_3d ·
VALID_CONCEPT_IDS · deep-dive flags S4/S5/S8 · synonyms n/a · PCPL_CONCEPTS N/A · CLASSIFIER_PROMPT + five
aspects; + clusters migration (FILE-ONLY) + _seed_ac_power_factor_cache.ts. **THE EYE:** 10/10 after the delta;
DENSE frames for S3/S6 ramps + the S2 cursor walk; eye-walker ∥ quality-auditor; zero new scar rows;
regression = capacitance 44/44 + all five sealed ac siblings (incl. series_lcr_circuit 47/47); the fillText
caption-order probe on S2/S3/S4 is a REQUIRED Checkpoint-B artifact; founder-drive hand-tests the S3 f-grab,
S6 R-grab, all five explore sliders, the L/C off-grid snap, the p-pane auto-range at extremes.

---

## Block 1 — Pass-1 strategic checklist
**Prerequisite cliffs + one-clause patches:** series_lcr S1/S3/S4 ("this is the circuit you built — at its
home setting, where coil and plates erase each other"; "off the home frequency the current shrinks and slips —
the angle φ you measured"; "cos of THAT angle — the triangle's R over Z"); ac_voltage_resistor S1/S2 ("rms are
the DC-equivalents you built; the heater's ten steady watts"); inductor/capacitor S6 ("a lone coil ran two
full amps and its wattmeter stayed dead — you watched it"); phasors S5 ("two arrows, one clock, a frozen angle").
**JEE-backwards trace:** a 7-part series-LCR power stem (PF, average power, the 5.55 error, the wattless
component, dissipation site + per-cycle energy, PF+power at resonance, [ext] verify S²=P²+Q²) → S4·S4/S7·S4·
S5/S6·S7·S1+S10·S8. No missing piece; S2/S3 ground the p-vs-average distinction; S9 is the "show that" stem.
**Planting audit (6 items):** (1) **S1 DELIBERATELY plants belief #1** ("volts times amps works — 10.0 W"),
the earned setup for S4, phrased as a parked question, resolved three clicks later. (2) S2's all-positive wave
("AC power always positive") broken at the next click (S3 lobes), narration says "at THIS setting". (3) S5's
split ("two separate currents flow") killed in-state (solid amber i persists; "one current — two accountings").
(4) S6 ("lowering R always lowers power") in-state guard + the explore R=2-at-resonance→25 W discovery. (5) S8
("Q is wasted") one clause "borrowed and returned — but the wires must carry it". (6) the S=10·cosφ echo →
§10k guards.

## Block 2 — Aha designation
- **PRIMARY (S5):** Only the current's in-phase shadow does work — real power is voltage times the current's
  projection onto it; the perpendicular remainder flows forever without spending a joule.
- **SUPPORTING (S6):** Current and power can move opposite ways — drop R and amps go UP while watts go DOWN,
  because the growth is all wattless.
- Cohesion: S6 is the primary made shocking (the S5 split predicts which part is idle; the falling needle
  proves it). One primary + one supporting; S8/S7 are machinery/ledger, deliberately not ahas.
- Wrong-belief setup: S5 — S1 builds the confident naive law, S4 strikes it. S6 — S1–S4 train perfect
  current–power co-movement; S6 breaks it with one slider step.
- Foundational-coverage: PRIMARY aha (S5) INSIDE foundational (S1–S5) — no exit-pill required.

---

## Escalations / handoff seed
1. **Engine delta first (§0b)** — NEW `scenario_type: "ac_power"` (prefix `pwr_`) via §3b before json_author;
   clone-sibling of ac_series_lcr + element power machinery; zero sealed-internal edits (diff-grep duty);
   regression = capacitance 44/44 + all five sealed ac siblings. Every §3b dispatch restates "no DB writes —
   files only". Runaway guard: engine-commit count enters at 16 — surface at every boundary.
2. **The 13px zone conflict (series_lcr Escalation §5) is RESOLVED here** (§0b item 2 / §10h). Cite closed.
3. **Compose-routine — now rule-of-FOUR:** default a fourth `pwr_`-scoped clone (trial-safe); recommendation
   to the founder RESTATED AND STRENGTHENED (acc/phs/slcr/pwr identical; transformer will need it too).
   Promotion only on explicit founder approval at the engine-dispatch boundary.
4. **Colour semantics — declared, founder ruling open:** cyan=v/amber=i consumed; NEW real-power hue (warm
   red-orange) threading needle → ⟨p⟩ line → P-leg → i∥ → heater glow; i⊥/Q-leg = live reactive-winner hue;
   S=cyan; grey "returned" tint. The ac_inductor cool-colour divergence remains the founder's standing item.
5. **Slcr S7 down-leg clip scar (OPEN, P3):** closed IN-CLONE here (§10h margins); the sealed original stays
   queued, untouched.
6. **Handoff seed to `lc_oscillations` (Ch.7 #7).** DELIVERS: (a) the energy-ledger instrument (per-element
   E_L=½Li², E_C=½Cv² gauges + borrow/return convention) — EXACTLY the L↔C slosh instrument lc_oscillations
   needs, + "L and C only borrow and return; R alone spends"; (b) the p<0=energy-returned sign convention;
   (c) locked energy numbers (E_L peak 1.96 J, E_C peak 0.49 J, E_R +6.15 J/cycle); (d) the settled power
   vocabulary so lc can say "an ideal LC loop is ALL wattless — nothing ever lands." WITHHOLDS (its front
   door): the UNDRIVEN circuit — source removal, free oscillation at ω₀=1/√(LC) as a NATURAL frequency (here
   f₀ was only a driving condition), the q(t)/i(t) SHM analogy, any damped decay — NONE renders here; gauges
   always run under the driven source. lc_oscillations will likely need a source-disconnect/switch primitive
   + an initial-charge state, and should note the L–C exchange is INDIRECT here (both breathe against the
   driven source).
7. **quality_auditor:** run the live engine_bug_queue SQL at Gate 8; §10j item-by-item + §10k coincidence
   audit (esp. never-chipped S²=P²+Q² and the 5.55/0.555 echo); composed subscripts across all three text
   paths, zero underscores; HUD ring-gating (cosφ from S4, components S5–S6, gauges S7, P/Q/S S8, NO VAR in
   explore); display-precision (I_rms 3dp — F7 closure); any live slider outside S3/S6/S10 = a defect; confirm
   no clock freeze; check built sim vs the §3 control table.
8. **eye-walker pre-refutations:** the S5 rotation hold is a DECLARED in-state beat (resumes before state end);
   S6's A→B→A′ is live (no ghosts); the S4 ghost needle is a deliberate wrong-guess overlay; the S9 dim is
   E4-restored (S10 BRIGHT measured); the p-pane guided-fixed vs explore auto-range is a declared labeled
   change. Caption-ORDER evidence = the fillText probe on S2/S3/S4.
9. **No Write tool in this dispatch** — skeleton returned for the loop session to persist to
   docs/loop_runs/ch7/ac_power_factor/skeleton.md.

---
(Persisted verbatim by the loop session from the architect's returned skeleton; the agent's transcript
.output file was 0 bytes so this is the reproduced copy. Self-review checklist all items marked complete in
the returned skeleton.)
