All references consumed: both sibling skeletons (series_lcr + ac_power_factor), the chapter state handoff, the FIELD3D checklist, the full scar-candidates lineage (including the ac_power CpB rows + the compose rule-of-four directive), the sealed `ac_power` scenario's built CSS geometry (READ at `field_3d_renderer.ts:29201–29208, 29500–29532`), and the ac_power_factor.json state/mode structure. The skeleton follows.

**Number self-verification (before committing):** LC = 3.1831 × 0.1273 = 0.40521 → √ = 0.63656 → ω₀ = 1/0.63656 = 1.57095 rad/s ✓ (display 1.571); f₀ = 1.57095/6.28319 = 0.25002 Hz ✓ (display 0.25); T₀ = 3.9997 → 4.00 s ✓. V₀ = 10.0 V → Q₀ = C·V₀ = 1.273 C; I₀ = V₀√(C/L) = 10 × 0.19998 = 2.00 A ✓ (cross-check ω₀Q₀ = 1.57095 × 1.273 = 1.9998 ✓); E_total = ½CV₀² = 6.3650 J (= ½Q₀²/C = 6.3650 ✓); half-split instant t = T₀/8 = 0.50 s → 3.18 + 3.18 = 6.36 ✓ at displayed addends; exchange period T₀/2 = 2.00 s; damped R = 2.0 Ω → α = R/2L = 0.31416 s⁻¹, per-swing amplitude ratio e^(−α·4.08) = 0.277 (~¼ per swing), underdamped (R_crit = 2√(L/C) = 10.0 Ω) ✓.

---

# ARCHITECT SKELETON — `lc_oscillations`

> Ch.7 concept 7/8 of the CHAPTER_LOOP run (docs/CHAPTER_LOOP.md), written for founder-proxy Checkpoint A.
> Sibling references (all SEALED): `ac_voltage_resistor` (`6b97ede`), `ac_voltage_inductor` (`35ae566`+`eae16ca`),
> `ac_voltage_capacitor` (`21e1f0f`+`832b1d3`+`219937d`), `phasors` (`62911da`+fixes), `series_lcr_circuit`
> (`cec3a50`+`5dc7cd`), `ac_power_factor` (`9df14e3`+`f997ede`, SEALED 2026-07-24). Binding handoff packet:
> `docs/loop_runs/ch7/ac_power_factor/skeleton.md` Escalation §6 + `docs/loop_runs/ch7_state.md` lc handoff note —
> every DELIVERS/WITHHOLDS clause consumed below. The withheld set (the UNDRIVEN circuit, free oscillation at
> ω₀ as a NATURAL frequency, the q/i SHM analogy, damped decay) is THIS sim's front door.

**Chapter:** Class 12, Ch.7 Alternating Current — NCERT §7.8 "LC Oscillations" (table-of-contents reference
only; teaching authored from first principles; no NCERT sequence/example/figure imported).
`concept_id: lc_oscillations`, label "LC Oscillations — The Circuit's Own Rhythm".
**Renderer:** `field_3d` — NEW `scenario_type: "lc_oscillation"` (Class-B triage; manifest in §0b — a
CLONE-sibling of the sealed `ac_power`, never an in-place extension).
**Position:** 7th of 8 in the founder-approved Ch.7 map. **This sim teaches the FREE circuit** — the source is
physically removed and the L–C pair oscillates by itself. Impedance/resonance/power arrive as one-clause
settled callbacks, never re-derived. Mutual coupling / turns ratio / voltage step (transformer's front door)
are NOT touched.

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL is not executable from this architect dispatch (no Bash/DB tool — same gap as all six sibling
dispatches; **FLAG to quality_auditor: re-run `npx tsx --env-file=.env.local
src/scripts/query_engine_bug_queue.ts lc_oscillations` + `--field3d --open` at Gate 8**). Consulted in full:
`docs/FIELD3D_SCENARIO_CHECKLIST.md`, `docs/loop_runs/ch7_state.md` (through the ac_power_factor seal),
both sibling skeletons + the ac_power_factor CpB adjudication notes, and the COMPLETE
`docs/loop_runs/ch7/_engine/scar_candidates.sql` (all 1,125 lines read this dispatch, including the five
ac_power_factor rows + the Stage-6 compose directive). Prevention rules applied:

| Scar / prevention rule | How this skeleton satisfies it |
|---|---|
| **`field3d_new_scenario_engine_ask_precision_checklist` (OPEN directive scoped to remaining Ch.7 = THIS dispatch)** | All four items closed in §0b: (1) drag-seize + thumb-lockstep declared per live guided control (S1 V₀ post-transient, S7 R post-insert; the S7 scripted R-insert MOVES the thumb 0→2.0 visibly); (2) every motion op named arithmetically (§3 — q(t)/i(t) closed forms, bead position = k·(Q₀−q(t)) signed, glyph count = round(N·|q|/Q₀) with polarity = sign(q), gauge heights = E/E_total, envelope = ±Q₀e^(−αt), inset x = x_max·q/Q₀); (3) applyGlowEmphasis exemptions declared (coil live emissive ∝ i², the phase-locked inset, gauges as focal); (4) dedicated Cambria-Math `lco_formula` panel, never the generic overlay |
| `skeleton_zone_map_asserts_pane_geometry_never_checked` | Every placement cites CSS READ this dispatch: `pwr_readout` top:52px;right:12px (`:29500–29501`); `pwr_band` 500×150 bottom:210px;left:12px (`:29201`, `:29504–29506`); `pwr_ppane` 304×110 bottom:88px;left:194px (`:29205–29206`, `:29509–29511`); `pwr_gauges` 170×110 bottom:88px;left:12px (`:29208`, `:29514–29516`); `pwr_formula` top:40%;right:22px Cambria (`:29519–29520`); `pwr_sliders` bottom:12px;right:12px + `pwr_<var>_row` rows (`:29523–29532`). The lc clone inherits the pwr-RESOLVED band/bottom-row geometry (the 13px conflict closed at pwr §0b item 2 — cite closed) |
| `one_shot_over_constrained_by_both_phase_target_and_narration_cue` (F2) | Cue ARMS, phase FIRES everywhere: S3's ghost fires at the actual q=0 crossing after arming; S2's release anchors the phase clock at the throw instant; no authored instant at t=0 of any state |
| `oncanvas_numeric_coincidence_shown_unqualified` (A0-3) | §10k audits SIX coincidences, incl. the Q=1 artifact I₀ = 2.00 A = the driven resonance iₘ (never juxtaposed) and the E_total = 6.365 J rounding boundary |
| `field3d_freeze_window_must_be_phase_time_subtraction` | N/A by design — NO state freezes the clock; S3's "wrong expectation" is a ghost overlay beside live continuing motion, not a freeze |
| "Presence is not correctness" | §10j existence-assertion table (11 pairings), incl. the closed-loop-in-pose-B probe and the E_R-bar ABSENT-in-S1–S6/present-in-S7 pairing |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` | ONE closed-form phase clock per state; the damped envelope is analytic e^(−αt), the E_R heat ledger is computed AS the complement E_total − E_LC(t) (never an accumulator); bead positions are closed-form transported-charge functions |
| `field3d_rms_subscript_ascii_in_renderer_text_paths` + slcr digit-subscript recurrence | All authored strings carry pinned ASCII tokens — `Q_0`, `I_0`, `V_0`, `T_0`, `omega_0→ω₀`, `f_0→f₀`, `E_C`, `E_B`, `E_R` — composed to styled subscripts on all THREE text paths, zero literal underscores; the DIGIT-subscript compose path (fixed `5dc7ccd`) is load-bearing here (Q₀/I₀/V₀/T₀ are all digit subscripts) and must be verified live |
| `field3d_struck_sum_rounds_full_not_displayed_addends` (F7) + the ac_power double-rounding directive (OPEN) | Display law §2: every chip verified at DISPLAYED addends (3.18+3.18=6.36 ✓; 1/4.00=0.25 ✓; the S8 chain at 4dp intermediates ✓); **½LI₀² is NEVER chipped as arithmetic** (displayed 0.5×3.1831×2.00² = 6.37 ≠ 6.36 — symbolic only, the pwr S²=P²+Q² precedent); all values single-rounded from true (I_rms-class slip guarded) |
| `ac_power_factor_s3_ppane_fixed_yrange` lesson | Per-state trace y-ranges sized to that state's actual excursion (±Q₀ guided; explore auto-ranges with V₀); gauges NORMALIZED to E_total with live J numerals so explore extremes (80 J) re-scale automatically |
| `ac_power_factor_s10_signed_near_zero` (−0.000) | q and i cross zero every cycle: declared HUD duty — |value| < half-LSB renders unsigned 0.00 |
| `ac_power_factor_s7_close_chip_dead_cue` | Every cue field authored in the JSON must have a named renderer draw path in the §0b JSON contract — the engine dispatch's contract log is authoritative; json_author may author NO cue the contract doesn't list |
| `field3d_generic_element_value_renders_nothing_leaving_open_loop_with_live_current` | THE central apparatus scar for this concept: the switch must render a CLOSED conducting path in pose B (source out, loop closed) — beads may NEVER flow through an open gap; in pose A the L-branch is visibly open AND carries no beads. §10j probe |
| `field3d_scenario_missing_maxreveal_block` | §0b ask 9: register `lc_oscillation` at all THREE deriveStateMeta sites + per-mode maxReveal pins (charge transient, throw+first quarter, ghost fire+latch, pen past one full period, half-split chip, inset lock, envelope visibly decayed, chain end) |
| `field3d_explore_picker_updates_global_but_frame_reads_authored_state_value` | Explore contract: the frame READS the live `PM_lco*` globals the sliders/switch write; the explore switch re-runs the SAME apply path as state entry (shared helper); §10j probe (dragging L changes the measured trace period) |
| `field3d_slcr_empty_band_leaks_ac_source_mini_schematic` (F6) | Band/gauge/inset display strictly content-gated per state; the unused `pwr_ppane` slot draws NOTHING in any state (declared empty) |
| `field3d_hud_label_clipped_by_readout_box` | HUD min-width sized for the longest line (`E_total = 6.36 J`); fit statement §10h |
| `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (FIXED in ac_capacitor — but the fix is scenario-local `accApplyGlow`; the `lco_` clone does NOT inherit it) | S5 focal = gauges and S6 focal = inset are BOTH live-driven exempt objects: exemption + brightenOnly alone = silent no-op (this exact class deleted three ac_capacitor narration beats). The lco_ glow pass must apply the focal boost as a MULTIPLIER on each object's own live channel — engine ask §0b item 4 |
| `field3d_subscript_compose_routine_cloned_four_times` (OPEN directive) | Default: a FIFTH `lco_`-scoped clone (trial-safe). Recommendation to the founder RESTATED AND STRENGTHENED — see Escalation §2 |
| Checklist pedagogy directives | Concrete before abstract (the machine charges and discharges before any formula; algebra dead last); reveal synced to narration (cue plan §3); coordinate sim+graph (ONE phase clock drives beads, glyphs, gauges, pen, inset); don't pre-spoil (no f₀ numeral before S4, no energy formula before S1's own, no SHM vocabulary before S6, no derivation before S8); visual matches narration ("the current is largest exactly here" = beads visibly fastest at the q=0 crossing); colour by identity (§0b ask 11) |
| Rule 39g | New panels follow the discovery conventions (inline `position:fixed`, `_row` slider rows) — ⚙ toggles inherited free |

**DC Pandey check:** no DC Pandey content consulted this dispatch. Scope validated against the
founder-approved Ch.7 map + the NCERT §7.8 table-of-contents entry only. No teaching sequence, example
problem, or figure imported. All physics re-derived from KVL on the source-free loop + the settled element
energy facts, verified numerically above.

---

## 0b. Engine triage + ask — Class-B (engine delta FIRST; clone-sibling, NOT in-place extension)

**Triage verdict: Class B — `json_author` may NOT start until a renderer delta lands.**

**Class-A rejected (can any sealed scenario carry this pure-JSON? No — six hard gaps):** (1) every sealed
ac_* scenario is built around the DRIVEN sine-stamped source ring — the source is structural, not removable;
this concept's thesis is the source's physical ABSENCE (a battery + two-position switch replace it); (2) no
initial-condition machinery exists anywhere (charge-to-V₀ transient, release-from-rest phase anchor);
(3) every sealed bead stream is source-phase-driven — free oscillation needs beads driven by the circuit's
OWN closed-form i(t) with true direction reversal and no source phase; (4) no decay machinery (analytic
envelope, amplitude-shrinking traces, the E_R-as-complement ledger); (5) no mechanical-analog inset exists
in any scenario (the mass–spring twin is a genuinely new canvas class); (6) the energy gauges live in
`ac_power` but always run UNDER the driven source — the L↔C direct exchange (two bars antiphase, flat total,
NO E_R bar) is a new gauge configuration. *Extend `ac_power` in place?* No — it would edit shared draw
functions inside a SEALED scenario whose EYE baselines are the chapter's regression proof. The chapter has
cloned six times. **Decision: NEW `scenario_type: "lc_oscillation"`, prefix `lco_`, cloned from `ac_power`
(closest parent — it owns the gauges, band/strip, chrome family) + apparatus assets from the element
scenarios. No refactoring of any sealed scenario.**

**REUSE manifest (advisory clone-source note):** chapter loop geometry + coil/plates apparatus assets (amber
beads forced regardless of the sealed inductor's colour defect — standing precedent); plate charge-glyph
machinery (polarity conventions per `219937d`); the `pwr_` chrome family CSS verbatim (readout top:52px;
right:12px · band 500×150 bottom:210px;left:12px · gauge pane 170×110 bottom:88px;left:12px · Cambria
formula top:40%;right:22px · sliders bottom:12px;right:12px, CSS READ §0a); the `acl_u_gauge`→`pwr_gauges`
bar-gauge draw code; strip clock-pen + dashed-ghost machinery; cue/`scenario_cue` + F1 single-latest caption
+ F2 arm/fire + F3 ring-gate + E3 closed-form phase anchors + E4 dim-restore + F8 off-grid slider snap +
drag-seize patterns; Rule-27 stable IDs; the fillText caption-order probe hook pattern.

**NEW machinery (the genuine asks — physics_author sizes; runs in-loop via §3b):**

1. **`lco_` scenario skeleton** — clone of `ac_power`, additive code only; fan/triangle/meter/p-pane
   machinery NOT cloned (unused); zero-sibling-internal-lines diff grep is a verify-chain duty.
2. **Battery + two-position switch assembly (the front door).** Replaces the source ring in the loop:
   pose A = battery→capacitor charging branch closed, L-branch visibly open (no beads anywhere on the open
   segment); pose B = battery FULLY out of the conducting path, L–C loop closed through the switch blade
   (a rendered bridging conductor — the open-loop-with-live-current scar inverted, §10j probe). The throw is
   a scripted one-shot (blade swings A→B on its cue); in explore the switch is teacher-draggable/clickable
   (Rule-27 stable ID `lco_switch`, param `position: "A"|"B"`, postMessage-drivable — the V2 Professor-Pack
   seed). Battery mesh dims/greys in pose B (E4-class restore on re-throw).
3. **Charge-up transient (S1)** — closed-form smoothstep: glyph count climbs 0→N_max, HUD V climbs 0→V₀,
   E_C gauge fills 0→6.36 J over ~2 s. (Physically a small unspoken series resistance; qualitative-honest.)
4. **Free-oscillation drive** — ONE closed-form phase clock from the release instant: q(t)=Q₀cos(ω₀t),
   i(t)=−I₀sin(ω₀t); beads at closed-form transported-charge positions ∝ (Q₀−q(t)) signed (TRUE direction
   reversal twice per cycle); glyph count = round(N·|q|/Q₀), polarity = sign(q) (both plates flip); coil
   emissive ∝ i² (applyGlowEmphasis exemption); HUD q/i/E live. Re-anchor only on a genuine drag/throw.
   **Glow-focal multiplier law (`glow_focal_on_live_driven_object_exempted_becomes_total_noop` — the
   ac_capacitor fix is scenario-local `accApplyGlow`, NOT inherited by the clone):** every live-driven
   object used as a state's glow_focal (S5 gauges, S6 inset, and any of plates/beads/strip so used) applies
   the focal boost as a MULTIPLIER on its own live channel (gauge fill brightness, inset draw brightness,
   coil emissive, bead intensity) — never rely on exemption alone; exemption + brightenOnly = a silent
   no-op that deletes the Rule-32e emphasis in exactly the states that need it most.
5. **Two-bar energy gauges + flat-total line** — `pwr_gauges` clone re-configured: E_C (green) + E_B
   (violet) antiphase, a fixed total marker at 6.36 J (computed at runtime from the ONE pinned canonical
   expression `0.5*C*V0*V0`, §2 display law — the SAME expression feeds the S1 gauge-fill target, HUD
   E_total and the S7 E_R ceiling; never a hand-copied literal), live J numerals; bars NORMALIZED to
   E_total (explore
   re-scale automatic); NO E_R bar in S1–S6 (its absence is load-bearing, §10j); S7 adds the E_R heat bar
   (warm power hue, inherited ratchet convention) computed as E_total − E_C(t) − E_B(t).
6. **Strip traces** — q(t) pen (green) S4+; i(t) pen (amber) added S6 (the "velocity" trace); dashed ±Q₀
   envelope rails; S7 swaps rails for the analytic decay envelope ±Q₀e^(−αt) with the trace shrinking
   inside it. Guided y-range ±Q₀; explore auto-ranges.
7. **Mass–spring analog inset (NEW canvas class, S6+)** — drawn in the band's left region (~150 px, the
   slot the disc occupied in siblings): wall + spring + block on a rail; block x = x_max·q(t)/Q₀
   (phase-locked to the SAME clock — never independently animated); thin tie-lines block↔plates; labels
   x, v. In S7 the block's swing decays inside the same envelope.
8. **Damping machinery (S7)** — a small resistor mesh translates INTO the loop on its cue (declared
   apparatus change; R thumb moves 0→2.0 in lockstep); all motion switches to the analytic damped forms
   q(t)=Q₀e^(−αt)cos(ω′t) (α=R/2L; ω′ internal, never rendered); E_R ledger per ask 5.
9. **Same-change duties:** THREE-site `deriveStateMeta.ts` registration + per-mode maxReveal pins
   (proposed mode enum: `charge_up | switch_throw | through_zero | free_run | energy_slosh | shm_twin |
   damped | derivation | explore`); proposed `visible_elements` tokens: `lco_circuit | lco_switch |
   lco_battery | lco_beads | lco_glyphs | lco_strip | lco_gauges | lco_inset | lco_chips | lco_formula`
   (specific tokens — substring-matcher lesson); proposed CLOSED glow-key enum: `circuit · switch · plates
   · coil · beads · strip · gauges · inset · chips · formula`; slider rows V₀/L/C/R (V₀ 2–20 step 1 def
   10.0; L/C rows verbatim from `pwr` `:29528–29529` — defaults OFF-GRID, F8 snap + true-number HUD;
   R 0–10 step 0.5 def 0); explore reads live globals + shared switch-apply helper (the picker scar);
   near-zero unsigned-0.00 clamp; overlays top:52px+; founder:drive collision probe + cropped-frame
   inspection. **The engine dispatch's JSON-contract log entry is the authoritative final enum set.**
10. **Compose routine — rule-of-FIVE.** Default (trial-safe): a fifth `lco_`-scoped clone. Recommendation
    restated to the founder: promote NOW (acc/phs/slcr/pwr identical; transformer #8 makes six). Promotion
    only on explicit founder approval at the engine-dispatch boundary. Digit-subscript compose (Q₀/I₀/V₀/T₀)
    verified live on all three text paths.
11. **Colour semantics (declared; founder colour-law ruling still open):** amber = current/beads (chapter
    law); **q/charge/plate family = green** (inherits V_C/plates); **magnetic-energy/coil family = violet**
    (inherits V_L/X_L); E_C gauge green · E_B gauge violet · E_R bar the warm power hue (pwr's real-power
    red-orange); total-line + HUD neutral white; inset block neutral grey, its motion tied to q by a
    green dashed tie-line. Battery greyed in pose B. ONE hue = one physical idea, contrast-checked by the
    engine.
12. **Regression duty:** `capacitance` 44/44 H2 0.00% + ALL SIX sealed ac siblings clean (incl. `ac_power`
    full count) + the zero-sibling-internal-lines diff grep. Every §3b dispatch restates "no DB writes —
    files only". **RUNAWAY GUARD: engine-loop commit count enters at 18** (past the §3b guard, under the
    founder's whole-chapter grant) — surface at every boundary.

---

## 1. Atomic claim

This concept teaches what a charged capacitor and an inductor do when connected alone — with the source
removed, charge and current oscillate forever (ideally) at the circuit's OWN natural frequency
ω₀ = 1/√(LC), the current is maximum exactly when the charge is zero, the energy sloshes intact between the
capacitor's electric field (½q²/C) and the inductor's magnetic field (½Li²), the whole motion is the exact
electrical twin of a mass on a spring (q↔x, i↔v, L↔m, 1/C↔k), and real resistance damps it out — and only
that. It does not re-derive element behaviour, impedance, resonance, or power (settled in the six sealed
siblings; callbacks only), does not treat driven/forced oscillation (that WAS `series_lcr_circuit`), does
not treat mutual coupling or voltage transformation (deferred to `transformer`), and does not quantify the
damped frequency/envelope algebra (beyond syllabus scope; damping stays qualitative).

---

## 2. State count + arc — **9 states**

Complex band (7–9, CLAUDE.md §5), honest not padded: THREE new quantities (the natural frequency as the
circuit's own property, the two-form energy account under exchange, the SHM correspondence), ONE new
apparatus operation (source removal / free release), TWO genuine misconception pivots, one advanced
derivation; every driven-circuit fact a one-clause callback. Merge-graded: S2+S3 stay separate (the
discharge and the through-zero pivot are each a full motion beat; S3 is the PRIMARY aha); S4+S5 stay
separate (the rhythm and the energy ledger are distinct readings); the energy-exchange-at-2f₀ fact is
FOLDED into S5 as its measured number (a 10th "frequency-doubling" state was graded and rejected — same
motion, second face); the quarter-cycle q–i offset is FOLDED into S6 where it is EXPLAINED (current is the
velocity of charge) rather than merely shown.

**The narrative spine — the chapter's engine, unplugged:** six concepts ran on a source that imposed its
frequency. S1 charges the capacitor from a battery and then S2 throws it away — and the circuit runs
anyway. S3 breaks the "empty = over" belief at the zero-charge crossing; S4 measures the swing and lands
the reframe: 0.25 Hz, the exact frequency the driven circuit favoured at resonance — the circuit owned it
all along. S5 opens the books (nothing ever lands — the all-wattless loop); S6 reveals the machine is a
pendulum in copper; S7 confesses the ideal lie (real coils leak); S8 derives ω₀; S9 hands it over.

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 `charge_the_plates` | Battery charges C to 10.0 V — 6.36 J stored in the electric field; the coil waits on an OPEN branch | *(straightforward beat)* |
| S2 `throw_the_switch` | The battery leaves the circuit; the loop closes; with no source at all, current flows — the field's energy drives it | *(straightforward beat)* |
| S3 `empty_is_not_over` | **16a PIVOT #1 + PRIMARY AHA** — at q = 0 the current is MAXIMUM (2.00 A); the coil carries the motion through and recharges the plates reversed | *(straightforward beat + contrast)* |
| S4 `its_own_rhythm` | **SUPPORTING AHA** — the swing repeats every 4.00 s: f₀ = 0.25 Hz, chosen by L and C alone — the resonance frequency was the circuit's own number all along | *(straightforward beat)* |
| S5 `the_energy_slosh` | **16a PIVOT #2** — E_C ↔ E_B trade places twice per swing (every 2.00 s); the total never moves: all wattless, nothing ever lands | *(straightforward beat + contrast)* |
| S6 `a_block_on_a_spring` | The SHM twin: charge behaves as displacement, current as velocity; L is the mass (inertia — why S3 happened), 1/C the spring | *(straightforward beat)* |
| S7 `real_coils_leak` | Insert R: the swing decays inside an envelope; the total sags into heat — why every real LC ring dies | *(straightforward beat)* |
| S8 `the_shm_equation` | Derivation: KVL source-free → d²q/dt² = −q/(LC) → SHM with ω₀ = 1/√(LC) → 0.250 Hz from the sealed decimals | `derivation_first_principles` |
| S9 `lc_sandbox` | The free circuit under the teacher's hands — charge it, release it, reshape it | `exploration_sliders` |

**Locked physics numbers (inherited + re-derived, never trusted).** L = 3.1831 H, C = 0.1273 F (sealed
chapter decimals verbatim). **NEW work point, chosen and declared: V₀ = 10.0 V** — the same ten volts the
chapter's source supplied, for continuity; ac_power_factor's E_L 1.96 J / E_C 0.49 J were DRIVEN work-point
values and are NOT inherited or rendered here (reconciliation: same L and C, fresh initial condition).
- ω₀ = 1/√(LC) = 1.57095 → **1.571 rad/s**; f₀ = **0.25 Hz** (true 0.25002); T₀ = **4.00 s** (true 3.9997).
- Q₀ = C·V₀ = **1.27 C** (true 1.273); I₀ = V₀√(C/L) = **2.00 A** (true 1.9998; cross-check ω₀Q₀ = 1.9998 ✓).
- E_total = ½CV₀² = exactly 6.365 J (true value dead ON the 2dp boundary) → displays **6.36 J on EVERY
  surface** via the ONE pinned canonical expression `0.5*C*V0*V0` (left-to-right float, C = 0.1273,
  V0 = 10 → 6.364999… → `"6.36"`; ⚠ boundary — see display law for the pin).
  Half-split instant t = T₀/8 = 0.50 s: E_C = E_B = **3.18 J** (3.18 + 3.18 = 6.36 ✓ displayed addends).
  Energy-exchange period = T₀/2 = **2.00 s** (twice per charge swing — S5's measured number).
- Characteristic √(L/C) = 5.00 Ω — NEVER rendered (Q=1 coincidence guard, §10k).
- **S7 damped (R = 2.0 Ω, scripted):** α = R/2L = 0.31416 s⁻¹; each swing carries ≈ 28% of the last (three
  swings ≈ dead); underdamped margin: R_crit = 2√(L/C) = 10.0 Ω = the R slider's max (explore discovery —
  at max R the ring barely fails to swing; declared, unnarrated). ω′/envelope algebra NEVER rendered.
- **Display-precision LAW (binding):** V 1dp · q 2dp · i 2dp · energies 2dp · f 2dp · T 2dp · ω₀ 3dp ·
  R 1dp · L/C true-number HUD (off-grid, F8). All single-rounded from true values (the ac_power
  double-rounding directive). **E_total canonical-expression PIN (the boundary fix — CpA F1):** the true
  value 6.365 J sits EXACTLY on the 2dp boundary, and different float orderings land on different sides
  (`0.5*C*V0*V0` → `"6.36"`; the re-ordered `0.5*0.1273*100` → `"6.37"`). The pin: E_total is computed by
  the ONE canonical expression `0.5*C*V0*V0` (left-to-right, C = 0.1273, V0 = 10) on EVERY surface — the S1
  gauge-fill target, the S5 total line, HUD `E_total`, the half-split addends' base, the S7 E_R ceiling —
  so the display is **6.36 J everywhere** and the on-screen ledger closes by construction:
  3.18 + 3.18 = 6.36 ✓. Displayed self-consistency (what the teacher sees adds up) outranks the abstract
  half-up 6.365→6.37 convention; 6.36 for 6.365 is a half-LSB difference, physically fine. V₀ stays 10.0 —
  the clean chapter set (I₀ = 2.00 A, Q₀ = 1.27 C, T₀ = 4.00 s) hangs on it; nudging V₀ off the boundary
  would destroy I₀ = 2.00. **REQUIRED physics_author verification (JS eval of the PINNED expression, not
  arithmetic):** `(0.5*0.1273*10*10).toFixed(2) === "6.36"` ✓ — the re-ordered
  `(0.5*0.1273*100).toFixed(2)` returns `"6.37"` and is FORBIDDEN as a source. **Binding on physics_author
  + json_author + the engine dispatch:** every energy surface derives from the SAME canonical expression at
  runtime — never a hand-copied literal, never a re-ordered algebraic twin. ½LI₀² at displayed addends
  gives 6.37 ≠ 6.36 → NEVER chipped (symbolic only). Near-zero clamp: |q| or |i| < half-LSB renders
  unsigned 0.00.
- **Explore extremes (FLAGged):** L=1.0, C=0.04 → f₀ = 0.796 Hz (T = 1.26 s); L=10, C=0.40 → f₀ = 0.0796 Hz
  (T = 12.6 s — free-runs fine, Rule 37); V₀=20, L=1.0, C=0.40 → I₀ = 12.6 A, E = 80 J → bead-speed honest
  clamp + true-number HUD; gauges normalized so 80 J re-scales automatically.

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Archetypes (3 coins + fleet inherits, one-line justifications):**
- `antiphase-exchange` (S5, coin) — two stores fill and empty in exact antiphase under a visibly flat
  total; no seed archetype expresses a zero-sum conservation pair.
- `mirror-analog` (S6, coin) — a physically DIFFERENT system runs phase-locked beside the apparatus,
  teaching by live correspondence; distinct from `cycle-compare` (which contrasts phases of one system).
- `decay-envelope` (S7, coin) — a periodic motion's amplitude shrinks inside a drawn analytic envelope
  while a loss ledger ratchets; `densify/rarefy` is spatial density, not amplitude.
Fleet/seed reuse: `reveal-build` (S1), `flow-along-path` (S2), `ghost-overlay-compare` (S3, fleet inherit
from pwr S4 — here the ghost is the WRONG-EXPECTATION pose), `oscillate/track` (S4), `chain-link-derivation`
(S8), `drag-sandbox` (S9, explore only).

**Control-gating (Rule 31c):** V₀ plain-live at S1 AFTER the scripted charge transient (drag-seize; glyphs +
gauge + HUD re-scale live); R plain-live at S7 AFTER the scripted insert (thumb visibly moves 0→2.0 first).
ALL sliders LOCKED in S2–S6 and S8 (mid-oscillation re-scaling violates 32b). Explore exposes all four +
the draggable switch. quality_auditor: any other live control = a design defect.

| State | ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26) | Δ cue (≤5 words) | Controls | glow | advance | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `charge_the_plates` | **core** | A charged capacitor is a full energy tank — ½CV₀², sitting still | reveal-build | NEW home pose, constructed once (declared): the chapter loop with the source ring GONE — battery + two-position switch in its place, coil and plates docked. Switch in pose A: charge glyphs accumulate on the plates (closed-form ~2 s transient), HUD V climbs to 10.0 V, the E_C gauge fills to **6.36 J**; the coil's branch is visibly OPEN — nothing moves through it. Plant: "all the energy sits in the field between the plates. Nothing flows. Now — remove the battery entirely." V₀ then plain-live. | "Fill the tank" | **V₀** (post-transient) | plates | manual_click | 40–55 |
| S2 `throw_the_switch` | **core** | With NO source in the loop, current flows — the stored field drives it | flow-along-path | Cause first (32a): the switch blade swings A→B on its cue — the battery greys and is OUT of the conducting path; the L–C loop closes through the blade. After a readable beat: amber beads begin to stream, glyphs drain, the coil's glow wakes, HUD q falls / i rises, the E_C gauge starts to pour into E_B. The narration tracks the charge as the engine: "the plates are emptying — the charge is driving everything." (Deliberate planting, resolved at S3.) | "No source — current flows" | none | beads | manual_click | 35–50 |
| S3 `empty_is_not_over` | **core** | **PIVOT #1 + PRIMARY AHA** — at q = 0 the current is MAXIMUM; the coil's inertia carries it through and recharges the plates REVERSED | ghost-overlay-compare | The wrong expectation rendered FIRST: as q approaches zero a dimmed ghost pose latches beside the live loop — beads stopped, chip `q = 0 → i = 0?` — the "discharged, story over" picture. The live circuit refutes it in motion: at the actual crossing (phase-FIRED) the chip is STRUCK, the beads are visibly at their FASTEST — HUD **i = 2.00 A, q = 0.00 C** — the E_B gauge is FULL, and the glyphs re-appear FLIPPED: the plates recharge with opposite polarity. One clause: "the coil will not let a flowing current die — you watched it fight change all chapter." | "Empty — yet current peaks" | none | chips | manual_click | 45–55 |
| S4 `its_own_rhythm` | **core** | **SUPPORTING AHA** — the swing repeats at a frequency L and C choose by themselves: f₀ = 1/(2π√(LC)) — the resonance number, reframed | oscillate/track | The strip docks; the green pen traces q(t) live — a clean cosine through +Q₀ → −Q₀ → +Q₀ while beads reverse and glyphs flip in step. Crest-to-crest measured on the trace: **T₀ = 4.00 s**; chip `f₀ = 1/4.00 = 0.25 Hz`. The reframe lands: "no source sets this pace — L and C do. 0.25 hertz — the exact frequency your driven circuit favoured at resonance. That number was never the source's. It was the circuit's own." | "Its own natural rhythm" | none | strip | manual_click | 40–55 |
| S5 `the_energy_slosh` | **core** | **PIVOT #2** — the energy only changes ADDRESS: E_C ↔ E_B, total flat forever; the ideal LC loop is ALL wattless | antiphase-exchange | The gauges take focus: E_C (green) and E_B (violet) breathe in exact antiphase under a fixed total line at **6.36 J** — the trade completes every **2.00 s**, twice per swing. The wrong expectation confronted in motion: "surely each cycle spends something" — yet there is NO heat bar, and the total line never dips (its flatness IS the counter; the E_R bar's absence is the point). At the half-split instant a cue-armed chip: `3.18 + 3.18 = 6.36 J ✓`. Callback: "borrowing with no lender now — L and C trade with each other. All wattless: nothing ever lands." | "Energy only changes address" | none | gauges | manual_click | 45–55 |
| S6 `a_block_on_a_spring` | **core** | The exact mechanical twin: q↔x, i↔v, L↔m, 1/C↔k — the coil is the MASS | mirror-analog | The inset docks in the band's left region: a block on a spring, phase-locked to the SAME clock — block position mirrors the q-trace exactly (green tie-line to the plates). The amber i(t) pen now joins the strip: the current is the charge's VELOCITY — cresting exactly where q crosses zero, a quarter cycle apart — the block is fastest at the middle, momentarily still at the ends. Retro-link: "THAT is S3 — the mass doesn't stop at the centre. The coil plays the mass; the capacitor plays the spring." One guard clause: "it's the charge COUNT that swings, not electrons flying plate to plate." | "The circuit is a pendulum" | none | inset | manual_click | 45–55 |
| S7 `real_coils_leak` | **core** | Real resistance drains the swing — the oscillation decays; the energy lands as heat | decay-envelope | Cause first: a small resistor translates INTO the loop (declared apparatus change; the R thumb moves 0→2.0 Ω in lockstep). Response: the trace's rails become a shrinking envelope — each swing carries barely a quarter of the last; the block's swing dies with it; the gauges' total sags as a NEW warm E_R bar ratchets up toward 6.36 J. Close: "every real coil has resistance, so every real LC ring fades — to keep one swinging, something must push at its natural rhythm. Your driven circuit was doing exactly that." R then plain-live (0–10 Ω). | "Real swings die out" | **R** (post-insert) | strip | manual_click | 40–55 |
| S8 `the_shm_equation` | **advanced** | Derivation: source-free KVL → d²q/dt² = −q/(LC) → SHM → ω₀ = 1/√(LC) | chain-link-derivation | Apparatus dims (E4 restore; `reveal_hold`). The Cambria chain docks link by link: `L·di/dt + q/C = 0` → `d²q/dt² = −q/(LC)` → "acceleration ∝ −displacement — the SHM signature (a = −ω²x)" → `ω₀ = 1/√(LC)` → substitute the sealed decimals: `LC = 0.4052 → ω₀ = 1/0.6366 = 1.571 rad/s → f₀ = 0.250 Hz`. The dimmed strip's crest spacing pulses as the number lands — the 4.00 s you measured, now in algebra. | "The swing, solved" | none | formula | manual_click | 45–55 |
| S9 `lc_sandbox` | **core** (ring-neutral, 38b) | The free circuit under the teacher's hands | drag-sandbox | Free-runs forever (Rule 37). ALL controls: **V₀ · L · C · R** + the DRAGGABLE SWITCH (throw to A → recharge to the V₀ setting; throw to B → release — the reset verb). Surfaces: circuit + beads + glyphs, strip (q + i traces, auto-ranged), gauges (normalized, live J), HUD q/i/f₀/T₀/E. Drag **L or C** → the trace spacing and f₀ HUD move together (frame reads live globals); drag **V₀** then re-throw → amplitude changes, period does NOT (the amplitude/frequency discovery, declared); drag **R** → decay returns; at R = 10 the ring barely fails to swing (declared discovery, unnarrated). NO inset, NO derivation chain, NO ω′ (ring/clutter gate). Formula: `f₀ = 1/(2π√(LC))` (core, debuted S4). | "All yours" | **ALL + switch** | formula | interaction_complete | 0/open |

**No-repeat audit:** reveal-build · flow-along-path · ghost-overlay-compare · oscillate/track ·
antiphase-exchange · mirror-analog · decay-envelope · chain-link-derivation · drag-sandbox — nine distinct,
none static, no repeat (no contrast pair needed); 3 coins justified, 2 fleet inherits declared;
drag-sandbox explore-only.

**Rule 32 plan.** 32a cause-first with a readable beat everywhere: battery docks THEN glyphs accumulate
(S1); blade swings THEN beads flow (S2); ghost latches THEN the crossing refutes it (S3); pen draws THEN
the period is measured THEN the reframe (S4); gauges breathe THEN the half-split chip (S5); inset docks
THEN the i-pen joins (S6); resistor inserts THEN the envelope shrinks THEN the heat bar climbs (S7); links
dock one per clause (S8). **⚠ 32a caution (binding on physics_author/json_author — the family's rule):**
beads, glyphs, gauges, pen, inset and HUD are ALL driven by the ONE closed-form q(t)/i(t) pair — never
independently animated surfaces that merely agree; the inset block position IS x_max·q(t)/Q₀; E_R is
computed AS the complement E_total − E_C − E_B so the ledger closes by construction. "Never let the twin
agree by animation luck." 32b one variable per state (S1 the charge, S2 the release, S3 the crossing, S4
the rhythm, S5 the ledger, S6 the correspondence, S7 R, S8 the algebra). 32c the Δ column verbatim as
caption openers (F1 single-latest). 32d ONE apparatus constructed at S1 (declared) persisting through S9;
the switch, battery, resistor changes are the taught causes; camera frames the loop at S1 and HOLDS. 32e
one glow focal per state from the proposed CLOSED enum.

**Rule 33 plan (macro↔micro decision, justified):** the taught variables (q, i, E) live ON the apparatus —
the plate glyphs ARE the charge count, the bead stream IS the current, the coil glow IS the magnetic
store; a separate lattice-interior band would duplicate what the apparatus already exposes (same ruling as
all six sealed siblings). Dual-band = real circuit (macro) ↔ representation (strip/gauges/inset), linked by
matched colours (green q: glyphs=trace=E_C bar=tie-line; violet: coil glow=E_B bar; amber: beads=i-trace)
and by the ONE phase clock. Per-state real number: S1 10.0 V/6.36 J · S2 q falling, i rising live · S3
i = 2.00 A at q = 0.00 C · S4 T₀ = 4.00 s, f₀ = 0.25 Hz · S5 3.18 + 3.18 = 6.36 J, trade every 2.00 s ·
S6 the quarter-cycle offset on twin traces · S7 ~28% per swing, E_R climbing · S8 f₀ = 0.250 Hz derived ·
S9 all live. Instruments (33d): HUD (q/i/V/E live numerals from S1), gauges with live J values (S1+),
period measured on the strip (S4+); no decorative dials.

**Cue plan (F2 arm/fire):** S1 glyph-fill s1–s2, gauge-fill s2, plant s4, V₀ un-gate at transient end; S2
throw armed s1 (fires after a readable beat), bead-start derived from the throw instant, gauge-pour s3; S3
ghost latch armed s1, STRIKE phase-fired at the actual q=0 crossing, polarity-flip derived, fix-clause s4;
S4 strip dock s1, period bracket armed s2 (fires at the next crest pair), f₀ chip s3, reframe s4; S5
gauge-focus s1, half-split chip phase-fired at ω₀t=π/4 after arming s3; S6 inset dock s1, i-pen join s2,
retro-link s3, guard s4; S7 resistor insert s1 (thumb lockstep), envelope draw s2, E_R bar s3, R un-gate at
script end; S8 chain links s1–s4. No authored instant at t=0; `*_at_ms` = EYE arming fallbacks only; every
authored cue field must exist in the engine's JSON contract (the dead-cue scar).

---

## 4. Misconception confrontation plan (Rule 16a — exactly TWO pivots)

**Belief selection reasoning:** both canonical LC errors are momentum-blind steady-state transfers. (1)
"When the capacitor is fully discharged the current stops — discharge ends the story" — earned honestly
from every DC RC intuition AND from S2's own framing (charge drains → things happen); it is precisely the
belief the PRIMARY aha must break, and the brief names it the highest-value error. (2) "Each cycle uses up
some energy — an ideal oscillation must still run down" — the universal lived experience of every real
oscillator; it poisons the conservation account. A third candidate ("the starting voltage sets the
frequency" — amplitude/frequency conflation) is real but smaller: demoted to the S9 declared discovery
(V₀ drag changes amplitude, never period) + an assessment distractor, not a third pivot (founder guardrail
2026-07-04: 1–3 genuine pivots, never a tic).

| Genuine wrong belief | Pivot + beat |
|---|---|
| **"q = 0 means i = 0 — a discharged capacitor is a finished circuit"** (earned: S2 tracks the draining charge as the engine) | **S3.** `visual_counter:` the dimmed ghost pose (beads stopped, chip `q = 0 → i = 0?`) latched beside the live loop — struck at the actual crossing while the live beads run FASTEST (HUD i = 2.00 A at q = 0.00 C), E_B full, glyphs re-appearing flipped · `one_line_fix:` "The charge is empty but the motion is full — the coil's inertia keeps the current flowing and reloads the plates backwards." |
| **"The oscillation spends energy every cycle — even an ideal LC must run down"** | **S5.** `visual_counter:` the two gauges trading in perfect antiphase under a total line that NEVER dips, with NO heat bar anywhere (absence existence-asserted, §10j), and the half-split chip closing exactly: 3.18 + 3.18 = 6.36 J · `one_line_fix:` "Nothing is spent — the energy only changes address between field and coil; only resistance can make it leave, and that is S7's story." |

No other state carries a `misconception_watch`. No EPIC-C branches (EPIC-L-first directive, 2026-06-10).

## 5. `has_prebuilt_deep_dive` states

**S3** — the concept's core insight + densest documented confusion ("why doesn't it stop", "where does the
current come from with no source", "why does the polarity reverse"). **S5** — the energy mathematics
(computing I₀ from ½CV₀² = ½LI₀²; when is the energy half-and-half; the 2f₀ exchange rhythm — the
exam-heavy computation site). **S6** — the correspondence mapping (which maps to which and WHY L is mass,
not spring — the abstraction students memorize wrong). **Divergence from pivots documented:** pivots S3/S5,
investment S3/S5/S6 — S6 is where the algebra of the analogy sticks even after both pivots land.
Cache-hint only, not a gate (Rule 18).

## 6. Drill-down clusters

**S3:** `why_current_max_at_zero_charge` · `inductor_opposes_change_not_current` ·
`capacitor_recharges_reversed_polarity`
**S5:** `lc_energy_conservation_math` · `max_current_from_energy_balance` · `energy_exchange_twice_per_cycle`
**S6:** `lc_shm_correspondence_table` · `inductance_as_inertia` · `reciprocal_c_as_spring_constant`

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_4   # charge, release, through-zero (PRIMARY aha), natural rhythm (supporting aha)
  energy:       STATE_5             # the slosh + conservation
  shm_analogy:  STATE_6
  damping:      STATE_7
  derivation:   STATE_8             # advanced ring
  exploration:  STATE_9
```
Default aspect = `foundational`. **PRIMARY aha (S3) and SUPPORTING aha (S4) both INSIDE foundational — no
mandatory exit-pill required.** Optional pill at the foundational end: *"Where does the energy live while it
swings? →"* into `energy`.

## 8. Prerequisites (advisory only — Rule 23)

- `ac_voltage_capacitor` (SEALED, #3) — plate glyphs = readable charge; cliff S1/S2.
- `ac_voltage_inductor` (SEALED, #2) — the coil fights CHANGE in current; cliff S3 (the aha's mechanism).
- `series_lcr_circuit` (SEALED, #5) — f₀ = 0.25 Hz as the resonance point; cliff S4 (the reframe).
- `ac_power_factor` (SEALED, #6) — the energy gauges + borrow/return convention + wattless vocabulary; cliff S5.
- `capacitance` (shipped diamond, Ch.2) — E = ½CV²; cliff S1.
- (Ch.6 self-inductance concept — E_B = ½Li²; cliff S5; patched by a single clause.)
- `phasors` NOT required (no phasor renders — deliberately: free oscillation is taught in the time domain).

Required-by: none in Ch.7 (`transformer` is operationally independent); this concept CLOSES the chapter's
conceptual arc — the driven story's f₀ revealed as the circuit's own property.

## 9. Real-world anchor (Rule 35 + 38f)

**Primary — where a radio station's frequency is born.** `series_lcr_circuit` taught how a receiver PICKS
one station; this concept teaches where that station's frequency comes FROM. Inside every radio transmitter
sits exactly this loop: charge sloshing between a coil and a capacitor at 1/(2π√(LC)) — the tank circuit.
The broadcast frequency isn't typed in; it is BUILT, by choosing L and C so the tank's own natural rhythm is
the station's frequency. The chapter's two halves close into one story: a transmitter's LC tank chooses a
rhythm; a receiver's LC circuit resonates to it. Culture-neutral, the widest-syllabus-overlap oscillator
device (38f), physics-true at depth — real oscillators are exactly this tank plus a small feedback push that
replaces what S7's resistance leaks. **Secondary (narration-only, feeds S6/S7):** a struck tuning fork —
hit it hard or soft, it rings at ITS note, never yours (amplitude changes, pitch doesn't — the S9
discovery), and the ring fades because energy leaks away; the LC loop is the same instrument in copper.
Mains/regional constants: none referenced (35b). Nothing radio- or fork-shaped drawn (Rule 24; anchors live
in narration).

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the nine of §2, ids as named, `state_count: 9`, contiguous STATE_1–STATE_9; `advance_mode`
8× `manual_click` + 1× `interaction_complete` (Gate 12 ✓); no `wait_for_answer`/`pause_after_ms`/
`narrative_socratic` anywhere.

**(b) Symbol-label table** (38d dialect: dual-label once then bare; pinned ASCII tokens `V_0/Q_0/I_0/T_0/
f_0/omega_0/E_C/E_B/E_R` composed to styled subscripts on all THREE text paths, zero literal underscores;
digit-subscript compose verified live — the `5dc7ccd` path is load-bearing):

| Quantity | On-canvas label | First |
|---|---|---|
| initial voltage / stored energy | HUD `V = 10.0 V`; gauge `E_C = 6.36 J`; dual-label once "energy of the charged capacitor E_C" | S1 |
| charge / current | HUD `q = 1.27 C` (dual-label once "charge q") / `i = 0.00 A`; green glyphs; amber beads | S1/S2 |
| peak values | `I₀ = 2.00 A` (S3, at the crossing); `Q₀ = 1.27 C` (S4, trace rail label) | S3/S4 |
| period / natural frequency | trace bracket `T₀ = 4.00 s`; chip `f₀ = 1/4.00 = 0.25 Hz`; dual-label once "natural frequency f₀" | S4 |
| energy ledger | gauges `E_C` (green) / `E_B` (violet, dual-label once "magnetic energy E_B") + total line `6.36 J`; half-split chip `3.18 + 3.18 = 6.36 J ✓` | S5 |
| SHM correspondence | inset labels `x`, `v`; chips `q↔x · i↔v · L↔m · 1/C↔k` | S6 only |
| damping | `R = 2.0 Ω` row; E_R bar (warm hue, dual-label once "lost as heat E_R"); envelope rails (no ω′/α numeral EVER) | S7 |
| derivation chain | Cambria panel, S8 only | S8 |

**⚠ Q symbol collision (third in the family):** slcr used Q = quality factor, pwr used Q = reactive power;
HERE lowercase q = instantaneous charge and Q₀ = peak charge. Disarmed: q always lowercase, Q₀ always with
its subscript, "Q factor"/"reactive power" never spoken or rendered (binding on physics_author).

**Formula surface per state (Rule 34b — ONE each; 38c ladder: algebra-only in core, calculus confined to
S8):** S1 `E = ½CV₀²` · S2 **NONE (deliberate — the mystery state: motion with no law)** · S3 **NONE
(deliberate — the aha is visual; chips carry the numbers)** · S4 `f₀ = 1/(2π√(LC))` (the RESULT, given —
core; derived at S8) · S5 `½CV₀² = ½LI₀²` (symbolic; never chipped numerically — §10k) · S6 the
correspondence line `q↔x · i↔v · L↔m · 1/C↔k` · S7 **NONE (deliberate — qualitative ring; the envelope IS
the statement)** · S8 the chain `L·di/dt + q/C = 0 → d²q/dt² = −q/(LC) → ω₀ = 1/√(LC) → f₀ = 0.250 Hz` ·
S9 `f₀ = 1/(2π√(LC))` (core, 38b). All real Unicode on all three text paths (34c): ω₀ f₀ Q₀ I₀ V₀ T₀ ½ ² √
↔ Ω → · ε-free.

**(c) RHR plan:** N/A as a performed rule — no 3D field-direction teaching. Sign conventions stated
deliberately: current positive = the S2 discharge direction (beads' first run); q positive = the S1 plate
polarity; the S3 polarity flip renders as glyph-sign reversal on BOTH plates (the `219937d` polarity class);
p<0/energy-returned language inherited from pwr is NOT used (no source to return to — the gauges' own
fill/empty convention carries the account).

**(d) Motion plan:** §3 table — every state's motion named; the oscillation runs continuously in S2–S7
(closed-form, loops whole cycles per dwell); S8 dims with E4 restore (`reveal_hold`); S9 free-runs
(Rule 37); NO clock freeze anywhere; explore renders at full immediately (no clock-gated visuals in slider
states).

**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`; `renderer_pair` =
field_3d/field_3d; `available_renderer_scenarios.field_3d = ["lc_oscillation"]`.

**(f) Assessment + coverage:** 6 questions: Q1 current at the fully-discharged instant (distractor "zero —
the pivot belief") → S3 · Q2 compute I₀ from V₀, L, C via energy balance (distractor: I₀ = V₀/R-style
DC habits) → S5 · Q3 what sets the oscillation frequency (distractor: "the initial voltage" — the demoted
belief) → S4 · Q4 total energy after many ideal cycles + time for fully-electric→fully-magnetic (T₀/4 =
1.00 s; distractor "it gradually converts to heat even without R") → S5 · Q5 the mechanical analog of L
(distractor: "the spring constant") → S6 · Q6 why real LC oscillations die away + what sustains one
(distractor: "the capacitor wears out") → S7. `non_assessed_states: [STATE_8, STATE_9]`.
`misconception_watch` at exactly S3, S5. Gate 20 ✓ (aha states hit: Q1→S3, Q3→S4).

**(g) Macro↔micro:** §3 Rule-33 block — apparatus band ↔ representation band, colour zoom-links, ONE phase
clock, per-state real numbers, live instruments; no separate interior band (justified — glyphs/beads ARE
the mechanism view, the six-sibling ruling).

**(h) Canvas budget (Rule 34) + zone map (CSS READ §0a, not remembered):** caption = the ≤5-word Δ cue only
(F1 single-latest); prose in capStrip; ONE Cambria formula surface on `lco_formula` (top:40%;right:22px
family slot); HUD value-only top:52px;right:12px (min-width fits `E_total = 6.36 J`); `lco_band` 500×150 @
bottom:210px;left:12px — strip region right ~330 px (traces; y ±Q₀ guided, longest gutter label `Q₀`),
inset region left ~150 px (S6+; block + spring + rail with ≥10 px margins); `lco_gauges` 170×110 @
bottom:88px;left:12px (three bars max ≥8 px gutters, live J labels on clear baselines); the sibling
`pwr_ppane` slot (bottom:88px;left:194px) stays EMPTY every state (content-gated — the F6 leak scar);
sliders bottom:12px;right:12px (4 rows + switch note — under the 5-row family max). Engine fine-tunes
±20 px; binding invariants: rows disjoint · band/bottom-row 12 px clearance (inherited RESOLVED from pwr) ·
left:12px · top:52px+ both edges · one canvas per pane.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Coherence check, BOTH cuts:** hide advanced (S8): S1–S7+S9 survive — S4 gives f₀ = 1/(2π√(LC))
  as a given result; no surviving state promises a proof (binding on physics_author). **Coherent.** Hide
  advanced+extended: IDENTICAL cut — **the extended ring is deliberately EMPTY** (declared: LC's genuine
  next rung beyond the core story IS the derivation; the 2f₀ exchange fact is core-taught inside S5 as its
  measured number, and quantitative damping is out of scope entirely). Both cuts coherent by construction;
  S2/S3/S7's formula-NONE design means no early state depends on later vocabulary in any cut.
- **(i-2) Explore = core-ring only (38b):** S9 surfaces circuit + traces + gauges + HUD + four sliders +
  the switch; the derivation chain, correspondence chips, and any ω′/α quantity deliberately ABSENT;
  formula = the core f₀ result.
- **(i-3) `curriculum_tags` (claims, not facts — 38g; only CBSE/NCERT marked verified):** CBSE/NCERT
  Class 12 (+ JEE/NEET) **✓ full — verified** (NCERT §7.8 exactly: free oscillation, energy exchange, the
  SHM analogy, qualitative damping; S8's differential equation is NCERT's own algebra; JEE weighting on
  Q2/Q4-class numericals). AP Physics C: E&M **◐ believed PRESENT** (LC circuits appear in the induction/
  circuits CED; the calculus S8 fits it) — `needs_teacher_verification`. CAIE 9702 ✗ believed absent ·
  IGCSE 0625 ✗ · IB DP ✗ (believed removed 2023) · AP Physics 2 ✗ · Ontario SPH4U ✗ — all
  `needs_teacher_verification`.
- **(i-4) Presets (hide, never reorder — 38h/25d):** CBSE+JEE → S1–S9 (all); board-lean CBSE → hide S8;
  generic core → hide S8; AP-C candidate → all 9 (pending verification); others none shipped pending 38g.
- **(i-5) Graph axes (38e):** q–t and i–t traces t-on-x (universal); gauge bars vertical; no known board
  conflict → no axis toggle.

**(j) Existence-assertion table (binding on the engine dispatch, quality_auditor, eye-walker):**

| Negative/absence claim | Paired existence assertion |
|---|---|
| "The battery is OUT of the circuit in pose B" (S2+) | Battery mesh EXISTS greyed AND no bead path intersects it; the switch blade EXISTS as a closed conductor bridging the L–C loop — beads never cross an open gap (the open-loop scar probe, inverted both ways: pose A = L-branch open AND bead-free) |
| "At q = 0 the current is maximum" (S3) | HUD i extremum instant == q zero-crossing instant (same closed form); ghost chip EXISTS latched then STRUCK at the fired crossing, both frames captured |
| "The plates recharge REVERSED" (S3+) | Glyph polarity sign flips on BOTH plates across the half-period (the `219937d` polarity probe) |
| "Beads truly reverse" (S4+) | Signed bead-velocity probe changes sign twice per T₀ |
| "The total never dips / nothing is spent" (S5) | E_C(t) + E_B(t) == E_total ± tol at every sampled frame AND the E_R bar is ABSENT S1–S6 by the same detector that finds it PRESENT in S7 |
| "The half-split chip closes" (S5) | Chip fires at the phase target; displayed addends 3.18 + 3.18 = 6.36 exactly |
| "The inset is phase-locked, not decorative" (S6) | Block x == x_max·q(t)/Q₀ within tol at ≥3 non-aliased sampled instants |
| "The i-trace crests where q crosses zero" (S6) | Trace extremum/zero abscissa alignment probe on the SAME sample arrays |
| "The decay is real and monotone" (S7) | Successive |q| peaks strictly decreasing ≈ ×0.28; E_R strictly increasing; E_C+E_B+E_R == E_total ± tol (complement construction) |
| "Scripted moves show their thumb" (S1/S7) | Slider-thumb displacement probe during the S7 R-insert (and V₀ un-gate state verified live post-transient) |
| "Explore controls are alive" (S9) | Dragging L changes the measured trace period (frame reads live globals — the picker scar probe); the switch re-throw re-runs the shared apply path; S9 ships BRIGHT after S8 (E4 measured) |

**(k) Coincidence audit (A0-3):** (1) f₀ = 0.25 Hz equals the driven chapter's resonance frequency — TAUGHT
identity (the SUPPORTING aha; same law both sides), allowed and load-bearing. (2) **I₀ = 2.00 A equals the
driven resonance iₘ = 2.00 A — the Q=1 artifact** (√(L/C) = 5.00 Ω numerically = the retired R = 5.0 Ω),
NOT a law: never chipped, never narrated, √(L/C) never rendered; S9's V₀ drag breaks it live. (3) E_total =
6.365 J sits EXACTLY ON the 2dp rounding boundary → canonical display 6.36 J, pinned to the ONE canonical
expression `0.5*C*V0*V0` on every surface (§2 display law; verified `(0.5*0.1273*10*10).toFixed(2) ===
"6.36"` ✓ — the re-ordered `0.5*0.1273*100` lands `"6.37"` and is forbidden as a source); the
factor-arithmetic form `0.5 × 0.1273 × 100 = …` is never chipped (pwr F1 symbolic-chip precedent). (4) ½LI₀² at displayed addends = 6.37 ≠ 6.36 → the S5
equality stays SYMBOLIC; the visual proof is both gauges topping at the same height reading the same 6.36 J
(same closed-form source). (5) The 2.00 s exchange period numerically equals pwr's work-point period T —
different quantities, never juxtaposed. (6) α = π/10 and ω₀ ≈ π/2 are engineered gifts — never labeled as π
fractions. Verified chips: `1/4.00 = 0.25 Hz` ✓ · `3.18 + 3.18 = 6.36 J` ✓ · S8 chain at 4dp intermediates
`0.4052 → 0.6366 → 1.571 → 0.250` ✓.

**TTS:** author `teacher_script` EN (25–55 w/guided state); `text_hi` via the Rule-30g Sonnet-5 subscription
sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h). **Registration (8 sites):**
`lc_oscillations.json` · `concept_panel_config`/`CONCEPT_PANEL_MAP` (file-only in trial) ·
`CONCEPT_RENDERER_MAP` → field_3d · `VALID_CONCEPT_IDS` · deep-dive flags S3/S5/S6 · synonyms n/a ·
`PCPL_CONCEPTS` N/A · `CLASSIFIER_PROMPT` + the six aspects; + clusters migration (FILE-ONLY) +
`_seed_lc_oscillations_cache.ts`. **THE EYE:** 9/9 after the delta; DENSE frames REQUIRED for S1 (charge
transient), S3 (the crossing + strike), S4 (pen), S7 (decay) — the checklist's ramp rule; eye-walker ∥
quality-auditor; zero new scar rows; regression = `capacitance` 44/44 + ALL SIX sealed ac siblings clean;
the fillText caption-order probe on S3/S5 is a REQUIRED Checkpoint-B artifact; founder:drive hand-tests the
S1 V₀ grab, S7 R grab, all four explore sliders, the explore switch throw/recharge cycle, the L/C off-grid
snap (trusted interactions THE EYE can't fire).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs + one-clause patches:** `capacitance` breaks at **S1** — "a charged capacitor stores
energy in the field between its plates: ½CV₀², one number." `ac_voltage_capacitor` breaks at **S1/S2** —
"the plate glyphs you've watched all chapter — count them and you're reading q." `ac_voltage_inductor`
breaks at **S3** — "the coil fights every CHANGE in current — you watched it strangle a rising one; now it
refuses to let a flowing one die." Ch.6 self-inductance breaks at **S5** — "the coil's field banks ½Li² —
the account the violet gauge reads." `series_lcr_circuit` breaks at **S4** — "0.25 hertz — the frequency
where your driven circuit's current peaked." `ac_power_factor` breaks at **S5** — "the same energy gauges —
but with no source and no heater, L and C can only trade with each other." Each one clause, never a re-teach.

**JEE-backwards trace.** *"A 0.127 F capacitor charged to 10 V is connected across a 3.18 H inductor at
t = 0. (i) Find ω₀ and f₀. (ii) Find the maximum current. (iii) After how long is the energy entirely
magnetic? (iv) State the phase relation between q and i. (v) What happens if the coil has small resistance?
(vi) [adv] Show d²q/dt² = −q/(LC) and hence ω₀."* → (i) **S4/S8** · (ii) **S3** (measured) + **S5** (the
energy-balance computation I₀ = V₀√(C/L) = 2.00 A) · (iii) **S5** (T₀/4 = 1.00 s — the gauges' quarter-turn)
· (iv) **S4/S6** (quarter cycle; i is q's velocity) · (v) **S7** · (vi) **S8**. No missing piece; every
guided state serves a stem (S1 grounds the initial condition every part quotes; S2 is the t = 0 event).
M1–M6 carve-out N/A (not Ch.26).

**Misconception entry mapping (16a) + planting audit (6 items):** the two pivots of §4,
wrong-consequence-first (the ghost stop-pose; the missing-heat-bar-plus-flat-total). Planting: (1) **S2
DELIBERATELY plants belief #1** ("the draining charge drives everything") — the earned setup, resolved one
click later at S3 (declared). (2) S4's "swings forever" could plant "real circuits oscillate forever" →
narration marks "in this ideal loop"; S7 kills it. (3) S6's block could plant "electrons physically fly
plate to plate" → in-state guard clause ("it's the charge COUNT that swings"). (4) S1's battery could plant
"the battery is part of the oscillation" → S2's whole beat is its removal (blade + greyed mesh). (5) The
I₀ = 2.00 A echo of the resonance current → §10k guards (never juxtaposed). (6) S7's insert could plant "R
changes the frequency a lot" → unnarrated either way (ω′ suppressed); the explore R-drag shows period
near-constant at small R — declared honest behaviour, no claim made.

## Block 2 — Aha-moment designation

- **PRIMARY (S3):** *An empty capacitor is not a finished circuit — at zero charge the current is at its
  largest, because the coil's inertia will not let it stop; the swing passes through empty the way a
  pendulum passes fastest through the bottom.*
- **SUPPORTING (S4):** *The frequency was never the source's property — remove the source and the circuit
  still swings at 0.25 Hz; L and C own that number, and "resonance" was just the driven circuit meeting the
  rhythm it already had.*
- **Cohesion:** S3's carry-through is the mechanism that MAKES the motion repeat; S4 names the repetition's
  rhythm and cashes the whole chapter's resonance story into it. One primary + one supporting; S5's ledger
  and S6's twin are machinery that deepen the primary (deliberately not ahas).
- **Wrong-belief setup:** for S3 — S1 builds "the charge is the fuel gauge" and S2 explicitly narrates the
  draining charge as the engine (earned, confident, wrong at the crossing). For S4 — six sealed concepts
  trained "frequency is what the source imposes"; S4 breaks it with the source physically grey and gone.
- **Foundational-coverage rule:** PRIMARY aha (S3) INSIDE `entry_state_map.foundational` (S1–S4) — no
  exit-pill required.

---

## Escalations / FLAGs for downstream

1. **Engine delta first (§0b)** — NEW `scenario_type: "lc_oscillation"` (prefix `lco_`) via §3b before
   json_author; clone-sibling of `ac_power` + element apparatus; zero sealed-internal edits (diff-grep
   duty); regression = capacitance 44/44 + all SIX sealed ac siblings. Every §3b dispatch restates **"no DB
   writes — files only."** **Runaway guard: engine-commit count enters at 18** — surface at every boundary.
2. **Compose routine — now rule-of-FIVE:** default a fifth `lco_`-scoped clone (trial-safe); recommendation
   to the founder RESTATED AND STRENGTHENED (acc/phs/slcr/pwr identical, lc makes five, transformer makes
   six — the directive row's own forecast now underestimates). Promotion only on explicit founder approval
   at the engine-dispatch boundary, with its own full-fleet regression dispatch.
3. **Colour semantics — declared, founder ruling open:** amber = i (chapter law); green = q/plates/E_C;
   violet = coil/E_B; warm power hue = E_R heat; neutral white = total line/HUD; battery greys in pose B.
   The ac_inductor cool-colour divergence remains the founder's standing item.
4. **Binding 32a caution (the family's rule):** ONE closed-form q(t)/i(t) pair drives beads, glyphs,
   gauges, pen, inset, HUD; E_R is the computed complement; the inset is x_max·q(t)/Q₀ — "never let the
   twin agree by animation luck."
5. **The E_total boundary is PINNED to one canonical expression** (§2 display law / §10k item 3 — CpA F1):
   E_total = exactly 6.365 J (2dp boundary) → display **6.36 J on every surface** via the ONE pinned
   expression `0.5*C*V0*V0` (S1 gauge-fill target, S5 total line, HUD, half-split base, S7 E_R ceiling —
   never a hand-copied literal or re-ordered twin; binding on physics_author, json_author AND the engine
   dispatch). REQUIRED JS-eval verification: `(0.5*0.1273*10*10).toFixed(2) === "6.36"` ✓ (the re-ordered
   `(0.5*0.1273*100).toFixed(2)` returns `"6.37"` — forbidden as a source). The on-screen ledger closes by
   construction (3.18 + 3.18 = 6.36 ✓). The ac_power 5.54/5.55 class must not recur; factor-arithmetic
   never chipped, ½LI₀² symbolic only.
6. **Handoff seed to `transformer` (Ch.7 #8).** DELIVERS: (a) the completed chapter energy story ("an ideal
   L–C pair spends nothing; only R spends") — transformer's efficiency framing builds on it; (b) the settled
   wattless vocabulary + ac_power's grid-transmission anchor (already seeded there) as its motivation;
   (c) the chapter apparatus conventions (coil assets, amber beads, chrome family, compose tokens — now five
   clones deep). WITHHOLDS (its front door): TWO coils sharing flux, mutual inductance, turns ratio, voltage
   step-up/down, transmission-loss arithmetic — NONE renders here; this concept must not mention any of it.
7. **quality_auditor:** run the live `engine_bug_queue` SQL at Gate 8; §10j item-by-item + §10k audit (esp.
   the never-chipped ½LI₀², the I₀/iₘ echo, the 6.36 boundary); composed DIGIT subscripts on all three text
   paths, zero underscores; HUD/ring gating (correspondence chips S6 only, E_R S7 only, chain S8 only,
   explore core-only); display-precision law + the unsigned-0.00 clamp; any live slider outside S1/S7/S9 =
   a design defect; confirm NO clock freeze; confirm the sibling p-pane slot draws nothing; check the built
   sim against the §3 control table.
8. **eye-walker pre-refutations:** the S3 ghost is a DELIBERATE wrong-expectation overlay (latch→strike is
   the F1 pattern, not stale-frame residue); the S7 shrinking amplitude is the designed decay (not a
   motion-loss regression); S8's dim is E4-restored (S9 BRIGHT measured); the battery's greyed persistence
   in S2–S9 is designed (removal-made-visible, not a lighting defect); the explore trace re-ranging is a
   declared labeled change.
9. **No Write tool in this dispatch** — skeleton returned for the loop orchestrator to persist to
   `docs/loop_runs/ch7/lc_oscillations/skeleton.md`.

---

## Self-review checklist

- [x] Atomic claim ONE sentence; exclusions named with deferral targets (no re-teach; no driven/forced
  oscillation; no mutual coupling; no quantitative damping).
- [x] State count 9 = complex band, justified (three new quantities + one new apparatus operation + two
  pivots + one derivation); merge-grading documented (2f₀ folded into S5; q–i offset folded into S6; S2/S3
  and S4/S5 kept separate, reasons given).
- [x] Per-state control table: teaches × archetype × distinct motion × Δ × controls × glow × advance ×
  budget × `depth_ring`; none static; THREE coins one-line justified; zero archetype repeats; drag-sandbox
  explore-only; narration 35–55 EN words guided, explore 0/open.
- [x] Rule 32 plan incl. the "never let the twin agree by animation luck" caution; one glow focal per state
  from a proposed CLOSED enum (final enum owned by the engine dispatch's JSON contract).
- [x] Rule 33 dual-band plan with per-state real numbers + live instruments; interior-band decision made and
  justified (glyphs/beads ARE the mechanism view).
- [x] Rule 34: Δ-cue captions, ONE formula surface per state (three deliberate NONEs declared), value-only
  HUD, zone map with READ CSS cites + sub-region fit, sibling p-pane slot declared empty, top:52px+ chrome
  clearance.
- [x] Rule 38: `depth_ring` column; qualitative → quantitative → derivation order; advanced (S8) contiguous
  immediately before explore; extended ring EMPTY — deliberately, with justification; BOTH cuts checked
  coherent; explore core-only; `curriculum_tags` claims with `needs_teacher_verification` (only CBSE/NCERT
  verified); presets derived (hide, never reorder); graph axes decided, no toggle; anchor =
  widest-overlap device (radio transmitter tank + tuning fork, 38f).
- [x] `misconception_watch` at exactly TWO genuine pivots (S3, S5) with selection reasoning; third candidate
  demoted to an explore discovery + distractor; contrast beats wrong-consequence-first; no per-state tic;
  no EPIC-C branches.
- [x] 3 `has_prebuilt_deep_dive` states (S3/S5/S6), 3 clusters each; divergence from pivots documented.
- [x] `teaching_method` per state; no `narrative_socratic`; Gate 12 ✓; no wait_for_answer/pause_after_ms.
- [x] `entry_state_map` with foundational + 5 aspects; PRIMARY aha inside foundational — coverage rule
  satisfied without an exit-pill.
- [x] Prerequisites advisory (four sealed siblings + capacitance + Ch.6 inductance), cliffs named with
  single-clause patches; phasors deliberately NOT required (documented).
- [x] Anchor universal + culture-neutral (transmitter tank primary, tuning fork secondary), plain English,
  physics-true at depth; nothing anchor-shaped drawn; no regional constants.
- [x] DoD complete, zero TBDs — symbol table under the pinned ASCII-token law with the digit-subscript duty;
  sign conventions declared (RHR N/A stated); motion plan total; modes declared; assessment + coverage
  mapped; §10j existence table (11 pairings); §10k coincidence audit incl. the rounding-boundary and Q=1
  artifacts.
- [x] **Number lock verified, one NEW value declared:** V₀ = 10.0 V chosen and justified (chapter
  continuity); ω₀/f₀/T₀/Q₀/I₀/E_total/half-split/exchange-period/damped-α all re-computed here, not
  trusted; ac_power's driven energy numbers explicitly NOT inherited; the display-precision law decided
  with its honest reasons (the 6.365 boundary; the never-chipped ½LI₀²).
- [x] Engine bug queue consulted via the checklist + the COMPLETE scar_candidates.sql + both sibling
  packets; live-SQL gap FLAGged to Gate 8; the OPEN precision-checklist directive's four items each closed
  in §0b.
- [x] Engine triage explicit: Class-A honestly evaluated and rejected (six hard gaps); Class-B clone-sibling
  of `ac_power`; compose rule-of-five + colour sub-issues addressed with declared defaults, founder rulings
  left un-consumed; json_author blocked until the delta lands.
- [x] Block 1 + Block 2 complete (cliffs, JEE trace, 6-item planting audit, PRIMARY + 1 supporting,
  cohesion, wrong-belief setups, coverage disposition).
- [x] Handoff-ready for founder-proxy Checkpoint A, then physics_author.
agentId: a8a24df4fa3b53b26 (use SendMessage with to: 'a8a24df4fa3b53b26', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 223963
tool_uses: 17
duration_ms: 968400</usage>