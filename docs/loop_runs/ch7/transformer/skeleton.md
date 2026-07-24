All references consumed: the lc_oscillations skeleton + seal packet (the freshest-format exemplar, read in full), `docs/loop_runs/ch7_state.md` (through the lc seal + the transformer handoff), the FIELD3D checklist, the complete lc CpB scar block in `ch7/_engine/scar_candidates.sql` (F1–F6 + the F6 prevention-rule correction), the ac_power_factor skeleton's transformer DELIVERS/WITHHOLDS clauses, and the LIVE `lco_` chrome CSS + `#formula_overlay` suppression list READ from `field_3d_renderer.ts` this dispatch (`:30544–30569`, `:37958`, `:38198`). The skeleton follows.

**Number self-verification (before committing):** per-turn = Vₚ/Nₚ = 10.0/100 = 0.100 V ✓; 100 × 0.100 = 10.0 V ✓; 200 × 0.100 = 20.0 V ✓; ratio 1: Iₛ = 10.0/25.0 = 0.40 A, P = 4.0 W, Iₚ = 0.40 A ✓; ratio 2: Iₛ = 20.0/25.0 = 0.80 A, Pₛ = 16.0 W, Iₚ = 16.0/10.0 = 1.60 A, Iₚ/Iₛ = 2.00 = Nₛ/Nₚ ✓, chip 10.0×1.60 = 16.0 = 20.0×0.80 ✓ exact; ratio ½: 5.0 V/0.20 A/1.0 W/Iₚ = 0.10 A ✓; leaks 0.4+0.2+0.1+0.1 = 0.8 W, Pₚ = 16.8 W, η = 16.0/16.8 = 0.95238 → 95% ✓; transmission: I = 16.0/20.0 = 0.800 A → 0.800²×5.0 = 3.200 W; stepped ×10: 0.0800²×5.0 = 0.032 W; 3.200/0.032 = 100.0 ✓ exact at 3dp; Φₘ = √2·10.0/(100×1.5708) = 14.142/157.08 = 0.09004 → 0.090 Wb ✓; f = 0.25 Hz, T = 4.00 s, ω = 1.571 rad/s (chapter decimals verbatim).

---

# ARCHITECT SKELETON — `transformer`

> Ch.7 concept 8/8 — the FINAL concept of the CHAPTER_LOOP run (docs/CHAPTER_LOOP.md), written for
> founder-proxy Checkpoint A. Sibling references (all SEALED): `ac_voltage_resistor` (`6b97ede`),
> `ac_voltage_inductor` (`35ae566`+`eae16ca`), `ac_voltage_capacitor` (`21e1f0f`+`832b1d3`+`219937d`),
> `phasors` (`62911da`+fixes), `series_lcr_circuit` (`cec3a50`+`5dc7cd`), `ac_power_factor`
> (`9df14e3`+`f997ede`), `lc_oscillations` (`0c24436`+6 fixes, SEALED 2026-07-24). Binding handoff packet:
> lc skeleton Escalation §6 + `ch7_state.md` — every DELIVERS/WITHHOLDS clause consumed below. The withheld
> set (TWO coils sharing flux, mutual induction, turns ratio, voltage step-up/down, transmission-loss
> arithmetic) is THIS sim's entire front door. ac_power's grid-transmission anchor seed is cashed in at §9.

**Chapter:** Class 12, Ch.7 Alternating Current — NCERT §7.9 "Transformers" (table-of-contents reference
only; teaching authored from first principles; no NCERT sequence/example/figure imported).
`concept_id: transformer`, label "The Transformer — Trading Voltage for Current".
**Renderer:** `field_3d` — NEW `scenario_type: "transformer"` (Class-B triage; manifest in §0b — a
CLONE-sibling of the sealed `lc_oscillation`, never an in-place extension).
**Position:** 8th of 8 in the founder-approved Ch.7 map — the chapter CLOSES here. **This sim teaches the
two-coil machine** — one changing flux shared by two windings, and what that buys civilization. Faraday's
law, rms meters, real power P = V·I, and I²R heating arrive as one-clause settled callbacks, never
re-derived.

---

## 0a. Engine bug queue consultation (pre-authoring)

Live SQL is not executable from this architect dispatch (no Bash/DB tool — same gap as all seven sibling
dispatches; **FLAG to quality_auditor: re-run `npx tsx --env-file=.env.local
src/scripts/query_engine_bug_queue.ts transformer` + `--field3d --open` at Gate 8**). Consulted in full:
`docs/FIELD3D_SCENARIO_CHECKLIST.md`, `docs/loop_runs/ch7_state.md` (through the lc_oscillations seal),
the lc_oscillations skeleton §0a distillation (which read the complete pre-lc scar lineage), and the SIX
lc CpB scar rows + reconciles + the F6 prevention-rule correction (READ verbatim in
`ch7/_engine/scar_candidates.sql:1160–1402` this dispatch). Prevention rules applied:

| Scar / prevention rule | How this skeleton satisfies it |
|---|---|
| **`field3d_new_scenario_engine_ask_precision_checklist` (OPEN directive scoped to remaining Ch.7 = THIS dispatch, the last)** | All four items closed in §0b: (1) drag-seize + thumb-lockstep declared for the ONE live guided control (S5 Nₛ post-ramp; the scripted ramp MOVES the thumb 100→200 visibly); (2) every motion op named arithmetically (§0b ask 12 — v(t), Φ(t), i(t) closed forms; tick cascade; ramp law; lamp ∝ i²; line glow ∝ I²R); (3) glow exemptions + the F5 pane-level multiplier law declared per focal; (4) dedicated Cambria `tfr_formula` panel, generic `#formula_overlay` suppressed |
| `skeleton_zone_map_asserts_pane_geometry_never_checked` | Every placement cites CSS READ this dispatch from the live `lco_` family the clone inherits: `lco_readout` top:52px;right:12px;min-width:150px (`:30545`); `lco_band` bottom:210px;left:12px (`:30550`); `lco_gauges` bottom:88px;left:12px (`:30555`); `lco_formula` top:40%;right:22px Cambria (`:30559`); `lco_sliders` bottom:12px;right:12px;min-width:230px (`:30563`); band content-gate (`:30668–30673`); sliders-exclusion note (`:37958`) |
| `ghost_compare_cause_invisible_slider_frozen` (lc F1, FIXED `056eb47`) | THE load-bearing scar for S5: the scripted Nₛ ramp 100→200 must drive the physics variable AND the DOM thumb+label in lockstep (syncThumb), dense-verified across the full reveal window; §10j probe 5 |
| `pivot_frozen_frame_precedes_crossing_event` (lc F2, FIXED `30b28d5`) | Frozen/settled pins are PHASE-pinned per state: lamp states pin at a v-extremum (θ = 90° mod 180° — never a zero-crossing dim instant); S3 pins inside the post-blip dead-hold; S7 pins in the stepped-up (cool-line) phase; S9 pins on the laminated half. The lc F2 live-player follow-up (narration-end freeze off-crossing) is mitigated BY DESIGN here: no state's money-moment is a recurring instantaneous crossing — every settled pose is a held level (§0b ask 10) |
| `field3d_unauthored_bottomright_formula_echo_duplicates_authored_surface` (lc F3, FIXED `840fcb0`) | `transformer` adds itself to the `#formula_overlay` suppression list (READ `:38198` — the mag/mem/acg/cap/acr/acl/acc/phs/lco list); ONE formula surface = `tfr_formula` Cambria (34b) |
| `energy_bar_chart_total_label_collides_with_last_bar_label` (lc F4, FIXED `c0651f4`) | The `tfr_gauges` clone inherits the FIXED header-row total-label geometry; the S8 five-label ledger (Pₛ + 4 leaks) re-verifies label disjointness on the tallest-rightmost-bar state (§10h) |
| `glow_focal_on_live_driven_object_exempted_becomes_total_noop` (lc F5, FIXED `749e625` — pane-level `lcoPaneBrighten`) | The tfr clone inherits the pane-brighten helper pattern but MUST wire it per pane: S6/S8 focal = gauges (whole-pane multiplier, never per-bar — a Pₚ/Pₛ pair must not imply one side "matters more"); S1 flux focal = multiplier on tube emissive; §0b ask 11 |
| `energy_readout_rounding_seam_vs_displayed_total` (lc F6, FIXED `e4505b8`, prevention rule CORRECTED to largest-component `b1bcace`) | Display law §2: all work-point values are EXACT at their declared precision (no rounding boundary anywhere by design — verified in the number block above); the S8 leak ledger closes at displayed addends 16.0+0.4+0.2+0.1+0.1 = 16.8 ✓; largest-component closure armed anyway for explore extremes |
| `field3d_generic_element_value_renders_nothing_leaving_open_loop_with_live_current` | The apparatus scar inverted twice: S1's OPEN secondary carries NO beads and no lamp; from S2 the closed secondary loop is a rendered conducting path with beads (honestly zero during the S3 secondary-dead hold) — and NO conductor ever bridges the two circuits (§10j probes 1–2) |
| `field3d_scenario_missing_maxreveal_block` | §0b ask 9: register `transformer` at all THREE deriveStateMeta sites + per-mode maxReveal pins (flux build, secondary close, blip+dead-hold, tick cascade, ramp end, ghost strike, mode swap, ledger, cutaway swap, chain end) |
| `field3d_explore_picker_updates_global_but_frame_reads_authored_state_value` | Explore contract: the frame READS live `PM_tfr*` globals; dragging Nₛ changes Vₛ/Iₛ/lamp measured live (§10j probe 11) |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` | ONE closed-form source phase clock per state drives flux, beads, lamp, meters, bars, traces — no accumulators; the tick cascade and Nₛ ramp are closed-form clamp/smoothstep functions of state time |
| `field3d_rms_subscript_ascii_in_renderer_text_paths` + the slcr digit-subscript recurrence | Pinned ASCII tokens `V_p / V_s / I_p / I_s / N_p / N_s / P_p / P_s / R_line / Phi→Φ / eta→η` composed to styled subscripts on all THREE text paths, zero literal underscores; the LETTER-subscript compose (ₚ/ₛ, U+209A/209B) must be verified live on all three paths (the digit-subscript lesson, re-applied to letters) |
| `field3d_freeze_window_must_be_phase_time_subtraction` | All settled pins phase-pinned (see F2 row); no state freezes the clock mid-guided |
| "Presence is not correctness" | §10j existence-assertion table (12 pairings), incl. the no-bridge probe, the frozen-flux-still-PRESENT probe (S3), and the flux-untouched-by-turns-ramp probe (S5) |
| `oncanvas_numeric_coincidence_shown_unqualified` (A0-3) | §10k audits EIGHT items, incl. the Vₚ = 10.0 V rms vs chapter vₘ = 10 V reconciliation, the R_line = 5.0 Ω echo of the retired chapter R, and the ×100 ratio being chip-safe ONLY at the declared 3dp |
| `ac_power_factor_s10_signed_near_zero` (−0.000) | v(t)/i(t)/Φ(t) cross zero every cycle: declared HUD duty — |value| < half-LSB renders unsigned 0.00 |
| `ac_power_factor_s7_close_chip_dead_cue` | Every cue field authored in the JSON must have a named renderer draw path in the §0b JSON contract; json_author may author NO cue the contract doesn't list |
| `field3d_slcr_empty_band_leaks` (F6-class display gating) | Band/gauges/chips strictly content-gated per state; the sibling `pwr_ppane` slot (bottom:88px;left:194px) draws NOTHING in any state (declared empty) |
| Checklist pedagogy directives | Concrete before abstract (the lamp lights before any ratio; the ratio is measured before it is derived; algebra dead last); reveal synced to narration (cue plan §3); coordinate sim+graph (ONE phase clock drives flux tubes, Φ trace, beads, lamp, waveforms, meters); don't pre-spoil (home pose Nₛ = Nₚ = 100 so NO voltage difference exists before S5 teaches it; no power bars before S6; no η before S8; no calculus before S10); visual matches narration ("the lamp lights" = it visibly lights; "the line runs cooler" = the glow visibly collapses); colour by identity (§0b ask 13) |
| Rule 39g | New panels follow the discovery conventions (inline `position:fixed`, `_row` slider rows) — ⚙ toggles inherited free |

**DC Pandey check:** no DC Pandey content consulted this dispatch. Scope validated against the
founder-approved Ch.7 map + the NCERT §7.9 table-of-contents entry only. No teaching sequence, example
problem, or figure imported. All physics re-derived from Faraday's law on a shared flux + power
conservation + I²R heating, verified numerically above.

---

## 0b. Engine triage + ask — Class-B (engine delta FIRST; clone-sibling, NOT in-place extension)

**Triage verdict: Class B — `json_author` may NOT start until a renderer delta lands.**

**Class-A rejected (can any sealed scenario carry this pure-JSON? No — six hard gaps):** (1) no sealed
scenario renders TWO magnetically-coupled circuits — every ac_* loop is a single series loop; the thesis
here is two electrically-separate loops sharing a core; (2) no closed iron core with circulating internal
flux tubes exists anywhere (faraday's Ch.6 coil is a different renderer vintage and NOT in the ch7 chrome
family); (3) no winding whose TURN COUNT is a live, visibly-growing variable exists; (4) no lamp/load with
an honest 2f glow envelope, and no four-meter V/I instrument set; (5) no per-turn EMF tick machinery, no
Pₚ|Pₛ ledger with named leak branches, no transmission schematic strip, no lamination cutaway; (6) the
AC/DC source selector needs lco's two-position switch INVERTED (pose A = AC source in loop, pose B = DC
battery in loop) — an asset reuse, not a JSON capability. *Extend `lc_oscillation` in place?* No — it
would edit shared draw functions inside a SEALED scenario whose EYE baselines are chapter regression
proof. The chapter has cloned seven times. **Decision: NEW `scenario_type: "transformer"`, prefix `tfr_`,
cloned from `lc_oscillation` (closest parent — chrome family, two-position switch, bar-gauge pane,
band/strip machinery) + coil/source-ring assets from the element scenarios. No refactoring of any sealed
scenario.**

**REUSE manifest (advisory clone-source note):** the `lco_` chrome family CSS verbatim (readout
top:52px;right:12px `:30545` · band bottom:210px;left:12px `:30550` · gauges bottom:88px;left:12px
`:30555` · Cambria formula top:40%;right:22px `:30559` · sliders bottom:12px;right:12px `:30563` — all
READ this dispatch); the lco battery + two-position switch assembly (inverted use: AC↔DC selector); the
F4-fixed bar-gauge header-row geometry; the F5 `lcoPaneBrighten` pane-level focal pattern; the F6
largest-component closure helper pattern; strip pen + cue/`scenario_cue` + F1 single-latest caption + F2
arm/fire + E3 closed-form phase anchors + E4 dim-restore + drag-seize + syncThumb patterns; amber bead
streams; coil meshes from the element scenarios; Rule-27 stable IDs.

**NEW machinery (the genuine asks — physics_author sizes; runs in-loop via §3b):**

1. **`tfr_` scenario skeleton** — clone of `lc_oscillation`, additive code only; plates/glyphs/inset/
   envelope machinery NOT cloned (unused); zero-sibling-internal-lines diff grep is a verify-chain duty.
2. **The core + two-coil apparatus (the front door).** A rectangular laminated soft-iron core (visible
   lamination striations from S1 — they become the S9 payoff); primary winding left limb, secondary
   winding right limb; NO conductor between the two circuits ever. Winding render honesty: rendered
   loops are a ×10 schematic bundle; the `Nₚ`/`Nₛ` COUNTERS are authoritative (declared, §10j probe 4).
3. **Circulating flux tubes** (violet) INSIDE the closed core: opacity/thickness ∝ |Φ(t)|/Φₘ, direction
   glyph = sign(Φ), breathing on the source clock; Φₘ = √2·Vₚ/(Nₚω) closed-form (0.090 Wb at defaults —
   independent of Nₛ and load, the honest invariant §10j probe 6 rides).
4. **AC/DC source selector** — lco switch assembly inverted: pose A = AC source ring in the primary loop;
   pose B = DC battery swapped in. The throw is a scripted one-shot (S3 cue); the DC blip = a single
   closed-form needle kick + lamp flash at the throw instant, then: the PRIMARY carries a STEADY one-way
   DC current (beads streaming at constant speed, Iₚ meter reading a steady nonzero DC value) sustaining
   flux frozen at full density (breathing amplitude → 0, tubes PRESENT); the SECONDARY dead — zero beads,
   Iₛ/Vₛ = 0.00, lamp dark; Φ HUD in S3 = steady value with dΦ/dt = 0 emphasized OR numeral hidden
   (physics_author sizes — never the AC-peak numeral). Rule-27 stable ID `tfr_switch`.
5. **Secondary-close one-shot (S2)** — the secondary's own switch closes on cue; beads + lamp + meters
   wake after a readable beat. Pose open = zero beads on the secondary (the open-loop scar, both ways).
6. **Lamp + load** — lamp glow ∝ iₛ(t)² (honest 2f envelope, its mean tracking Pₛ); R_load resistor mesh.
7. **Four meters (Rule 33d)** — Vₚ/Iₚ pair by the primary, Vₛ/Iₛ pair by the secondary, in-scene needle +
   live numeral; needles settle-lerp to displayed values. HUD numerals echo top-right.
8. **Per-turn tick cascade (S4)** — turns light sequentially with a running counter 0→100 and a voltage
   bar filling 0→10.0 V in lockstep (count(t) = round(100·smoothstep); bar = count × 0.100 V).
9. **Turns-ramp machinery (S5)** — scripted Nₛ 100→200: winding visibly gains loops (bundle-honest),
   counter runs, Vₛ = Nₛ × 0.100 at every frame, thumb+label lockstep (F1 scar duty), lamp brightens on
   the same closed form; Nₛ slider drag-seize live post-ramp. THREE-site deriveStateMeta registration +
   per-mode maxReveal pins; proposed mode enum: `flux_link | close_secondary | dc_dead | per_turn |
   turns_ramp | power_lock | transmission | loss_ledger | lamination | derivation | explore`.
10. **Settled-pin plan (F2 discipline)** — lamp states pin at a v-extremum; S3 pins inside the dead-hold;
    S5 pins at ramp-complete; S6 pins with bars level; S7 pins in the cool-line phase; S9 pins on the
    laminated half. No money-moment is a recurring instantaneous crossing by design.
11. **Power-bars pane + leak ledger** — `tfr_gauges` clone: Pₚ | Pₛ bars (S6+, level by law); S8 adds four
    named leak mini-bars (copper 0.4 · eddy 0.2 · hysteresis 0.1 · stray flux 0.1, warm heat hue) whose
    displayed sum + Pₛ closes to Pₚ = 16.8 exactly; F4 header-row total geometry inherited; F5 pane-level
    focal multiplier wired for gauges AND band; F6 largest-component closure armed for explore.
12. **Transmission strip (S7)** — the band swaps to a schematic journey (declared labeled change):
    station → line (R_line = 5.0 Ω, glow ∝ I²R_line) → mini step-down → house. Two phases cycled: direct
    send at 20 V (line hot, 3.200 W) vs stepped ×10 to 200 V (line cool, 0.032 W). Line-loss readouts 3dp
    in this state only (declared). **Motion arithmetic (precision-checklist item 2, all states):**
    v(t) = √2·10·sin(ωt), ω = 1.571; Φ(t) = −0.090·cos(ωt) Wb; iₛ(t) = √2·Iₛ·sin(ωt), iₚ = (Nₛ/Nₚ)·iₛ;
    lamp ∝ iₛ²; bead speed ∝ |i| per loop; bars P = V·I from the same forms; line glow ∝ I²_line·R_line;
    tick/ramp laws per asks 8–9; eddy swirls deterministic seeded loops, extent ∝ slab width (S9); S3 DC
    hold: iₚ = a steady one-way constant (physics_author sizes), Φ = const, iₛ = 0.
13. **Lamination cutaway (S9)** — a zoom-lens circle on the core (the Rule-33 link): solid slab with wide
    seeded eddy swirl loops + heat shimmer → laminated stack with swirls chopped to slivers, shimmer
    collapsing. **Colour semantics (declared; founder colour-law ruling still open):** amber = current/
    beads (chapter law); cyan = primary-side voltage family (chapter v); **green = secondary-side voltage
    family** (free in this sim; declared); violet = flux/magnetic (inherits lc's coil/E_B); warm
    red-orange = heat/losses (pwr hue); lamp warm white; battery greyed when out of the loop (E4 class).
14. **Same-change duties:** proposed `visible_elements` tokens (specific — substring-matcher lesson):
    `tfr_core | tfr_flux | tfr_primary | tfr_secondary | tfr_lamp | tfr_meters | tfr_beads | tfr_switch |
    tfr_band | tfr_gauges | tfr_chips | tfr_formula`; proposed CLOSED glow enum: `core · flux · primary ·
    secondary · lamp · switch · meters · beads · gauges · band · chips · formula`; slider rows Nₛ (25–400
    step 25 def 200) / Vₚ (2–20 step 1 def 10.0) / f (0.10–1.00 step 0.05 def 0.25) / R_load (5–100 step
    5 def 25.0) — 4 rows, under the family max; `#sliders` exclusion chain + `#formula_overlay`
    suppression list (`:38198`) both joined; near-zero unsigned-0.00 clamp; overlays top:52px+;
    founder:drive collision probe. **The engine dispatch's JSON-contract log is the authoritative enum set.**
15. **Compose routine — rule-of-SIX.** The directive's own forecast lands: acc/phs/slcr/pwr/lco identical,
    transformer makes six. Default (trial-safe): a sixth `tfr_`-scoped clone. Recommendation to the
    founder RESTATED AND STRENGTHENED a final time — see Escalation §2. Letter-subscript compose (ₚ/ₛ)
    verified live on all three text paths.
16. **Regression duty:** `capacitance` 44/44 H2 0.00% + ALL SEVEN sealed ch7 siblings clean (incl.
    `lc_oscillation` full count) + the zero-sibling-internal-lines diff grep. Every §3b dispatch restates
    "no DB writes — files only". **RUNAWAY GUARD: engine-loop commit count enters at 27** (under the
    founder's whole-chapter grant) — surface at every boundary; this is the chapter's LAST build.

---

## 1. Atomic claim

This concept teaches what two coils wound on one closed iron core do — the primary's alternating current
drives a changing flux that threads BOTH windings, inducing in each turn an equal share of EMF so that
Vₛ/Vₚ = Nₛ/Nₚ, while an ideal transformer passes power through unchanged (VₚIₚ = VₛIₛ, so voltage up means
current down), works ONLY on changing flux (never steady DC), leaks a little in real cores (copper heat,
eddy currents fought by lamination, hysteresis, stray flux), and thereby makes long-distance power
transmission possible (step up to cut I²R line loss, step down for safe use) — and only that. It does not
re-derive Faraday's law, rms values, real power, or I²R heating (settled callbacks), does not quantify
mutual inductance M in henries (a Ch.6 atomic), does not treat the loaded-primary back-EMF regulation
story or magnetizing current (beyond syllabus; declared honest-unnarrated behaviour), and does not treat
rectification or switch-mode electronics (out of scope).

---

## 2. State count + arc — **11 states**

Top of the complex band, edging very-complex (CLAUDE.md §5; the brief's authorized 8–11), honest not
padded: a DEVICE concept carrying mechanism (3 beats), law (2), a conservation pivot (1), application (1),
non-ideality (2), one derivation, one explore — with TWO NCERT-explicit misconception pivots.
Merge-graded: step-down NEVER gets its own state (named at S5, rendered at S7's house end, discovered in
explore); the DC switch-on blip is folded INTO S3 as its opening event; transformer hum is folded into S8
as a clause; back-EMF load regulation and magnetizing current are EXCLUDED (atomic claim); a quantitative
mutual-inductance state was graded and REJECTED (Ch.6's atomic, not this one). S8/S9 stay separate: the
loss ledger and the eddy/lamination engineering are distinct ideas with distinct motions, and "why is the
core laminated?" is an exam-guaranteed question.

**The narrative spine — the chapter's payoff machine:** S1 builds one flux through two strangers; S2 lights
a lamp across empty space; S3 kills the battery dream (DC dead — why the grid is AC); S4 shows every turn
drinking an equal share; S5 cranks the turns and watches the voltage obey; S6 presents the bill — nothing
was amplified, volts were traded for amps; S7 cashes the trade into the grid (step up, lose less); S8
confesses the leaks; S9 slices the core; S10 derives the ratio; S11 hands it over.

| State | Purpose (one line) | teaching_method |
|---|---|---|
| S1 `one_flux_two_coils` | One AC-driven flux circulates the closed core and threads BOTH windings — the secondary sits open and dark | *(straightforward beat)* |
| S2 `the_wireless_handoff` | **SUPPORTING AHA** — close the secondary's own loop: current flows and the lamp lights, with NO wire to the source | *(straightforward beat)* |
| S3 `dc_is_dead` | **16a PIVOT #2** — swap in a DC battery: one blip at the throw, then a large STEADY flux hands over nothing | *(straightforward beat + contrast)* |
| S4 `every_turn_an_equal_share` | Each turn rides the same changing flux → the same 0.100 V per turn; turns in series stack | *(straightforward beat)* |
| S5 `the_turns_ratio` | Crank Nₛ 100→200 and Vₛ obeys: Vₛ/Vₚ = Nₛ/Nₚ (step-up; fewer turns = step-down) | *(straightforward beat)* |
| S6 `no_free_power` | **16a PIVOT #1 + PRIMARY AHA** — the volts doubled but the amps halved: VₚIₚ = VₛIₛ, the watts pass through untouched | *(straightforward beat + contrast)* |
| S7 `the_long_journey` | Step up → tiny current → the line loss collapses ×100; step down at the house — why the grid exists | *(straightforward beat)* |
| S8 `real_leaks` | Real transformers leak: copper heat, eddy, hysteresis, stray flux — η = 95%, and the hum | *(straightforward beat)* |
| S9 `why_thin_slices` | Inside the core: solid metal breeds wide eddy whirlpools; lamination chops them — the leak quenched | *(straightforward beat)* |
| S10 `the_ratio_derived` | Derivation: ε = −N·dΦ/dt on the SAME Φ → εₛ/εₚ = Nₛ/Nₚ; ideal power → Iₚ/Iₛ = Nₛ/Nₚ | `derivation_first_principles` |
| S11 `transformer_sandbox` | The machine under the teacher's hands — turns, voltage, frequency, load | `exploration_sliders` |

**Locked physics numbers (declared + verified, never trusted).** Chapter rate verbatim: **f = 0.25 Hz,
T = 4.00 s, ω = 1.571 rad/s** (the watchable flux rhythm; the real mains frequency is phrased neutrally
and NEVER numeralized — 35b). **NEW work point, chosen and declared: Vₚ = 10.0 V rms** — every meter in
this sim reads rms ("what meters read", settled in `ac_voltage_resistor`); the same ten-volt numeral as
the chapter's source dial, now specified rms because transformer relations are rms relations
(reconciliation: the siblings' 7.07 V rms work point is NOT inherited or rendered; the 14.1 V peak exists
only as the waveform amplitude, never numeralized). **Nₚ = 100 fixed; home pose Nₛ = 100** (ratio 1 — no
voltage difference exists before S5 teaches it). **R_load = 25.0 Ω.**
- Per-turn share = Vₚ/Nₚ = **0.100 V/turn** (= the rms rate of flux change per turn — self-consistent).
- Ratio 1 (S2–S4): Vₛ = **10.0 V**, Iₛ = Iₚ = **0.40 A**, P = **4.0 W**.
- Ratio 2 (S5–S9 work point): Vₛ = **20.0 V**, Iₛ = **0.80 A**, Iₚ = **1.60 A**, Pₚ = Pₛ = **16.0 W**;
  the money chip `10.0 × 1.60 = 20.0 × 0.80 = 16.0 W` ✓ exact at displayed values.
- Flux amplitude Φₘ = √2·Vₚ/(Nₚω) = **0.090 Wb** — independent of Nₛ and load (the S5 invariant).
- S8 leaks: copper **0.4** + eddy **0.2** + hysteresis **0.1** + stray flux **0.1** = **0.8 W**;
  Pₚ = **16.8 W**; η = 16.0/16.8 = **95%** (true 0.95238, single-round ✓ — matches the "well-designed
  transformers exceed 95%" fact; physics-true).
- S7 transmission (the NCERT syllabus model, declared: line loss ≈ (P/V)²·R_line with P = 16.0 W,
  R_line = 5.0 Ω): direct at 20.0 V → I = 0.800 A → **3.200 W** lost (a fifth); stepped ×10 to 200 V →
  I = 0.0800 A → **0.032 W** (**3.200/0.032 = 100.0 exactly** at the declared 3dp).
- **Display-precision LAW (binding):** V 1dp · I 2dp · P 1dp · leaks 1dp · η integer % · per-turn V 3dp
  (0.100) · Φ 3dp Wb · line-loss 3dp W (S7 ONLY, declared exception — the ×100 chip is exact ONLY at 3dp;
  a 2dp form 3.20/0.03 = 106 is FORBIDDEN) · N integer · f 2dp Hz. All values single-rounded from true;
  every work-point value above is EXACT at its precision (no boundary anywhere — checked). Near-zero
  clamp: |v|, |i|, |Φ| < half-LSB render unsigned 0.00.
- **Explore extremes (FLAGged):** Nₛ = 400, Vₚ = 20 → Vₛ = 80.0 V, Iₛ = 3.20 A, P = 256.0 W → bead-speed
  honest clamp + bars normalized so extremes re-scale; Nₛ = 25 → Vₛ = 2.5 V (1dp "2.5" ✓); f = 1.00 Hz at
  Vₚ = 10 → Φₘ = 0.023 Wb (flux breathing visibly shrinks — honest, declared, unnarrated).

---

## 3. Per-state choreography + control plan (Rule 31 — with `depth_ring`, Rule 38a)

**Archetypes (4 coins + fleet inherits, one-line justifications):**
- `tally-stack` (S4, coin) — identical per-element contributions light one-by-one and SUM into a growing
  total bar; no seed archetype expresses equal-share summation.
- `grow-and-track` (S5, coin) — the apparatus structurally GROWS while a locked meter tracks
  proportionally; monotone structural change is neither periodic tracking (oscillate/track) nor scene
  construction (reveal-build).
- `branch-off` (S8, coin) — a conserved flow visibly sheds named side-streams while the ledger closes; no
  seed archetype shows conservation-with-losses accounting.
- `slice-and-quench` (S9, coin) — the same interior re-run after the medium is sliced, the circulating
  effect visibly quenched; an interior-morphology contrast no seed covers.
Fleet/seed reuse: `reveal-build` (S1), `flow-along-path` (S2), `null-result-hold` (S3 — the 16a contrast
beat in its canonical form), `ghost-overlay-compare` (S6, fleet inherit from pwr S4 / lc S3),
`cycle-compare` (S7), `chain-link-derivation` (S10, fleet inherit), `drag-sandbox` (S11, explore only).

**Control-gating (Rule 31c):** Nₛ plain-live at S5 AFTER the scripted ramp (drag-seize; winding, counter,
Vₛ, lamp all re-scale live). ALL sliders LOCKED in every other guided state (S1–S4, S6–S10). Explore
exposes all four. quality_auditor: any other live control = a design defect.

| State | ring | Teaches (ONE idea) | Archetype | DISTINCT motion (state clock, Rule 26) | Δ cue (≤5 words) | Controls | glow | advance | Budget |
|---|---|---|---|---|---|---|---|---|---|
| S1 `one_flux_two_coils` | **core** | One changing flux, driven by the primary, threads BOTH windings through the closed core | reveal-build | Home pose constructed once (declared): laminated rectangular core docks, primary winding + AC source ring left, secondary winding + lamp + OPEN switch right — no conductor between the circuits, ever. The source wave starts; violet flux tubes draw in and BREATHE around the closed core loop at the 4-second rhythm, direction alternating; the Φ trace pens on the band; HUD `Φ` live, Vₚ meter docks reading 10.0 V. The secondary side stays dark: open loop, zero beads, lamp off. Plant: "two circuits, touching nothing — only the flux passes through both." | "One flux, two coils" | none | flux | manual_click | 35–50 |
| S2 `the_wireless_handoff` | **core** | **SUPPORTING AHA** — a closed loop riding a changing flux carries current: power crosses with no wires | flow-along-path | Cause first (32a): the secondary's own switch closes on its cue. After a readable beat the right loop WAKES — amber beads stream, the lamp lights (glow honestly pulsing at 2f, its envelope steady), the Vₛ/Iₛ and Iₚ meters dock and settle: Vₛ = 10.0 V (equal turns — same reading, unremarked), Iₛ = 0.40 A. Faraday callback, one clause: "a changing flux through a loop drives an EMF — the law that kicked your needle in the induction chapter. No wire joins these circuits; the flux alone hands the power across." Settled pin at a v-extremum (lamp visibly lit). | "No wires — power crosses" | none | lamp | manual_click | 35–50 |
| S3 `dc_is_dead` | **core** | **PIVOT #2** — a transformer needs CHANGING flux; steady DC, however large, hands over nothing | null-result-hold | The wrong expectation staged then killed: the source switch throws AC→DC (battery swings in, source ring greys — lco assembly inverted). AT the throw instant one closed-form blip: the secondary needles kick once, the lamp flashes once — then the SECONDARY dies while the primary keeps working. Primary beads flow in a STEADY one-way DC stream and the Iₚ meter reads a steady nonzero DC value — that steady current SUSTAINS the flux tubes at FULL density, frozen solid (breathing amplitude zero — large flux, no change). The secondary: zero beads, Iₛ = Vₛ = 0.00, lamp dark under a huge steady flux. Φ HUD: steady value with `dΦ/dt = 0` emphasized OR numeral hidden — exact treatment FLAGged to physics_author (never the AC-peak 0.090 Wb). Chip: `steady Φ → nothing crosses`. Fix clause: "the current still flows and the flux is still there — but nothing CHANGES, so the secondary gets nothing; the throw was the last change this circuit ever saw. That is why the grid is AC." Settled pin inside the dead-hold. | "Steady flux — nothing crosses" | none | switch | manual_click | 40–55 |
| S4 `every_turn_an_equal_share` | **core** | Every turn embraces the SAME changing flux, so every turn contributes the SAME 0.100 V; turns in series stack | tally-stack | AC restored (blade back, one beat). The primary winding takes focus: its turns light ONE BY ONE while a counter runs 0→100 and a cyan voltage bar fills 0→10.0 V in lockstep — chip at cascade end: `100 × 0.100 V = 10.0 V`. One clause each: "in this ideal core ALL the flux threads EVERY turn, so each turn gets an equal 0.1-volt share" and "the secondary's hundred turns ride the SAME flux — its equal count is why it reads the same ten volts." (Counter authoritative; rendered loops a declared ×10 bundle.) | "Every turn, equal share" | none | primary | manual_click | 40–55 |
| S5 `the_turns_ratio` | **core** | The turns set the voltage: Vₛ/Vₚ = Nₛ/Nₚ — more turns step UP, fewer step DOWN | grow-and-track | Cause first: the scripted Nₛ ramp runs 100→200 — the secondary winding VISIBLY gains loops, the counter climbs, the slider thumb+label move in lockstep (F1 scar duty). Tracking it: Vₛ climbs 10.0→20.0 V, Iₛ 0.40→0.80 A, the lamp brightens — while the flux breathing NEVER changes (Φₘ untouched by turns — the quiet invariant, one clause: "the flux never changed; only how many turns ride it"). Chip: `Vₛ/Vₚ = Nₛ/Nₚ = 200/100 = 2`. Naming clause: "more turns than the primary — a step-up transformer; wind fewer and it steps DOWN." Nₛ then plain-live. | "Turns set the voltage" | **Nₛ** (post-ramp) | secondary | manual_click | 45–55 |
| S6 `no_free_power` | **core** | **PIVOT #1 + PRIMARY AHA** — nothing is amplified: VₚIₚ = VₛIₛ; voltage up means current DOWN | ghost-overlay-compare | The four meters take focus. The wrong expectation latches as a dimmed ghost chip: `step-up = free power?` — the brighter lamp seems like winning. The live meters refute it: Vₛ = 20.0 V doubled Vₚ, but Iₛ = 0.80 A is HALF of Iₚ = 1.60 A — the primary is paying MORE current in. The Pₚ|Pₛ bars dock and sit dead level at 16.0 W; the ghost is STRUCK on a cue-armed settle. Chip: `10.0 × 1.60 = 20.0 × 0.80 = 16.0 W`. Close: "a transformer is a trade, not a gift — volts up, amps down; the watts pass through untouched (a little less, in real ones)." | "Volts up, amps down" | none | gauges | manual_click | 45–55 |
| S7 `the_long_journey` | **core** | Transmit at high voltage: I = P/V falls, and line loss I²R collapses ×100 for ×10 voltage | cycle-compare | The band swaps to the transmission strip (declared labeled change): station → long line (R_line = 5.0 Ω) → house. Phase A: send 16.0 W directly at 20 V — I = 0.800 A, the line GLOWS hot, `loss = 3.200 W` (a fifth of everything, gone as wire heat — Ch.3's I²R, one clause). Phase B: a step-up transformer lifts it ×10 to 200 V — I = 0.0800 A, the glow collapses, `loss = 0.032 W` — one-hundredth. At the house a step-down transformer returns it to the mains voltage for safe use. Chip: `×10 V → ÷100 loss` (the algebra: P_loss = I²R, I = P/V). Loop A→B; settled pin in the cool phase. | "Step up, lose less" | none | band | manual_click | 45–55 |
| S8 `real_leaks` | **extended** | Real transformers leak a little: four named losses; η = Pₛ/Pₚ ≈ 95% | branch-off | Back on the apparatus. The gauges take focus: Pₚ re-reads **16.8 W** while Pₛ holds 16.0 — the ideal equality opens a 0.8 W gap. Four warm mini-bars branch off the flow one per clause: copper heat in the windings (0.4), eddy swirls in the core (0.2 — "S9 opens that one"), magnet-flip hysteresis losses (0.1), stray flux missing the secondary (0.1 — "the ideal all-flux-threads-every-turn promise, slightly broken"). The ledger closes on screen: 16.0 + 0.8 = 16.8 ✓; chip `η = 16.0/16.8 = 95%`. Clause: "that hum near a big transformer is the core itself flexing with the flux." | "Real transformers leak" | none | gauges | manual_click | 45–55 |
| S9 `why_thin_slices` | **extended** | Eddy currents whirl in solid cores; laminating chops the loops — the eddy leak quenched | slice-and-quench | A zoom-lens circle opens on the core (the Rule-33 link — the ONE interior state). Inside, run as SOLID metal: the changing flux drives wide eddy whirlpools (seeded deterministic loops) with heat shimmer rising — a shorted one-turn coil, going nowhere. Then the slab SLICES into insulated laminations: the same flux, but the whirlpools are chopped to slivers, the shimmer collapses. Chip: `thin slices → no wide loops`. Retro-link: "that is S8's eddy bar, fought by engineering — every real core you will ever see is laminated." Settled pin on the laminated half. | "Thin slices stop eddies" | none | core | manual_click | 35–50 |
| S10 `the_ratio_derived` | **advanced** | Derivation: the SAME dΦ/dt in every turn → εₛ/εₚ = Nₛ/Nₚ; ideal power → Iₚ/Iₛ = Nₛ/Nₚ | chain-link-derivation | Apparatus dims (E4 restore; `reveal_hold`). The Cambria chain docks link by link: `εₚ = −Nₚ·dΦ/dt` → `εₛ = −Nₛ·dΦ/dt` (same Φ — the shared-core fact) → divide: `εₛ/εₚ = Nₛ/Nₚ` → ideal, no drops, no loss: `Vₛ/Vₚ = Nₛ/Nₚ` → power through unchanged: `VₚIₚ = VₛIₛ → Iₚ/Iₛ = Nₛ/Nₚ` → substitute: `200/100 = 2 → 20.0 V, 0.80 A` — the numbers S5 and S6 measured, now in algebra. | "The ratio, derived" | none | formula | manual_click | 45–55 |
| S11 `transformer_sandbox` | **core** (ring-neutral, 38b) | The machine under the teacher's hands | drag-sandbox | Free-runs forever (Rule 37). ALL controls: **Nₛ · Vₚ · f · R_load**. Surfaces: apparatus + flux + beads + lamp, four meters, waveform band (vₚ/vₛ twin sines, auto-ranged), Pₚ|Pₛ bars, HUD. Drag **Nₛ** through 100 → the step-up/step-down flip live (at 50: Vₛ = 5.0 V, Iₚ = 0.10 < Iₛ = 0.20 — the current ratio visibly inverted; declared discovery, unnarrated); drag **Vₚ** → everything scales, ratio constant; drag **f** → flux breathing rate up, amplitude honestly down; drag **R_load** → lamp and BOTH currents move together (the primary feels the load). NO η, NO leak bars, NO derivation chain (ring/clutter gate). Formula: `Vₛ/Vₚ = Nₛ/Nₚ` (core, debuted S5). | "All yours" | **ALL** | formula | interaction_complete | 0/open |

**No-repeat audit:** reveal-build · flow-along-path · null-result-hold · tally-stack · grow-and-track ·
ghost-overlay-compare · cycle-compare · branch-off · slice-and-quench · chain-link-derivation ·
drag-sandbox — eleven distinct, none static, no repeat (no contrast pair needed); 4 coins one-line
justified, 3 fleet inherits declared; drag-sandbox explore-only.

**Rule 32 plan.** 32a cause-first with a readable beat everywhere: source wave starts THEN flux breathes
(S1); the switch closes THEN the loop wakes (S2); the blade throws THEN the blip THEN the dead-hold (S3);
turns light THEN the bar fills THEN the chip (S4); the winding grows THEN Vₛ climbs THEN the lamp
brightens (S5); the ghost latches THEN the meters refute THEN the strike (S6); the line glows THEN the
step-up cools it (S7); the gap opens THEN the branches peel (S8); the whirlpools rage THEN the slicing
quenches them (S9); links dock one per clause (S10). **⚠ 32a caution (binding — the family's rule):**
flux tubes, Φ trace, beads, lamp envelope, meters, waveforms and power bars are ALL driven by the ONE
closed-form source phase clock + the algebraic ratio laws — never independently animated surfaces that
merely agree; the lamp envelope IS iₛ(t)²; the line glow IS I²R_line; "never let the twin agree by
animation luck." 32b one variable per state (S1 the flux, S2 the closure, S3 the source kind, S4 the
per-turn share, S5 Nₛ, S6 the power account, S7 the send voltage, S8 the ledger, S9 the core morphology,
S10 the algebra). 32c the Δ column verbatim as caption openers (F1 single-latest). 32d ONE apparatus
constructed at S1 persisting through S11; the switch throws, the winding growth, the band swap and the
cutaway are the taught causes; camera frames the core at S1 and HOLDS (the S9 zoom is a lens overlay, not
a camera move). 32e one glow focal per state from the proposed CLOSED enum; pane-level multiplier law per
F5.

**Rule 33 plan (macro↔micro decision, justified):** the taught variables (Φ, V, I, P, N) live ON the
apparatus — the flux tubes ARE the mechanism view, the bead streams ARE the currents, the winding loops
ARE N (same ruling as all seven sealed siblings) — EXCEPT S9, where the mechanism is genuinely interior:
it gets the chapter's one true zoom-lens cutaway (33 link explicit). Dual-band = apparatus (macro) ↔
band/gauges (representation), linked by matched colours (cyan vₚ trace = primary meters; green vₛ =
secondary; violet Φ trace = flux tubes; amber beads = currents; warm hue = every heat surface) and the ONE
phase clock. Per-state real number: S1 Φₘ = 0.090 Wb, 10.0 V · S2 10.0 V / 0.40 A both sides · S3 Iₚ a
steady nonzero DC value with Iₛ = 0.00 under full flux · S4 0.100 V/turn × 100 · S5 Vₛ = Nₛ×0.100 live ·
S6 16.0 W both bars · S7 3.200 → 0.032 W · S8 the 16.8 ledger + 95% · S9 the swirl count collapsing · S10
the chain's decimals · S11 all live. Instruments (33d): four needle+numeral meters (S2+), power bars with
live W numerals (S6+), line-loss readout (S7); no decorative dials.

**Cue plan (F2 arm/fire):** S1 apparatus dock s1, wave start s2, flux draw+breathe s2–s3, Φ trace s3,
dark-secondary plant s4; S2 close armed s1 (fires after a readable beat), wake derived from the closure
instant, meters settle s3, no-wire clause s4; S3 throw armed s1 fires s2, blip AT the throw instant
(derived, never t=0), dead-hold from blip end, chip s3, fix clause s4; S4 restore beat s1, cascade armed
s1 runs s2–s3, chip fires at cascade end, ideal-core clause s4; S5 ramp armed s1 fires s2 (thumb
lockstep), invariant clause s3, chip at ramp end, naming clause s4, Nₛ un-gate at script end; S6 meter
focus s1, ghost latch s2, STRIKE cue-armed fires at bar-settle s3, trade clause s4; S7 strip swap s1,
phase A s2, step-up swap s3, house clause s4; S8 gap opens s1, branches peel s2–s4, η chip at end, hum
clause s4; S9 lens opens s1, solid-run s2, slice swap s3, retro-link s4; S10 links s1–s4. No authored
instant at t=0; `*_at_ms` = EYE arming fallbacks only; every authored cue field must exist in the engine's
JSON contract (the dead-cue scar).

---

## 4. Misconception confrontation plan (Rule 16a — exactly TWO pivots)

**Belief selection reasoning:** the brief's two candidates are BOTH genuine, documented, NCERT-explicit
errors — and both get pivots, per the brief's instruction (one PRIMARY, one seeded second). (1) **"A
step-up transformer amplifies — more voltage out means more power out"** is the PRIMARY: it is earned
honestly by this sim's own S2 wonder (power crossing on nothing) and S5's brightening lamp (stepping up
FEELS like winning), and it is the belief the exam's power numericals punish. (2) **"A transformer works
on DC — any current makes flux, so any current works"** is the second pivot: the universal battery
intuition, killed by the null-result beat. A third candidate ("more secondary turns squeeze out more
flux") is real but smaller: demoted to S5's declared invariant clause (Φ untouched by the ramp) + §10j
probe 6, not a third pivot (founder guardrail 2026-07-04: 1–3 genuine pivots, never a tic).

| Genuine wrong belief | Pivot + beat |
|---|---|
| **"Step-up = free power: if the voltage doubled, the secondary delivers more than the primary draws"** (earned: S2's wireless magic + S5's brightening lamp) | **S6.** `visual_counter:` the dimmed ghost chip `step-up = free power?` latched beside the four live meters — struck as Iₚ = 1.60 A visibly DOUBLES Iₛ = 0.80 A and the Pₚ\|Pₛ bars sit dead level at 16.0 W; chip `10.0 × 1.60 = 20.0 × 0.80 = 16.0 W` · `one_line_fix:` "A transformer trades volts for amps — every watt the secondary delivers, the primary drew; nothing is amplified." |
| **"A transformer works on DC too — steady current still makes flux"** | **S3.** `visual_counter:` the DC throw gives ONE blip (secondary needles kick, lamp flashes — the change itself), then the primary keeps a steady one-way current flowing (Iₚ steady nonzero, beads streaming) sustaining flux tubes frozen at FULL density — while Iₛ = Vₛ = 0.00 and the lamp is dark: current still flowing, flux still there, nothing crossing · `one_line_fix:` "The current is still flowing and the flux is still there — but nothing CHANGES, so the secondary gets nothing; only change crosses, and that is why transformers, and the grid, live on AC." |

No other state carries a `misconception_watch`. No EPIC-C branches (EPIC-L-first directive, 2026-06-10).

## 5. `has_prebuilt_deep_dive` states

**S3** — the AC-only principle + its documented confusions ("why exactly does DC fail", "what was the blip
at switch-on", "then how do phone chargers work on DC electronics"). **S5** — the turns-ratio mathematics
(the exam-heaviest numerical site: identify step-up/down, compute Vₛ, volts-per-turn design thinking).
**S6** — the power-conservation crux (compute Iₚ, why the primary current rises with load, the
free-energy error in every form). **Divergence from pivots documented:** pivots S3/S6, investment
S3/S5/S6 — S5 is where the ratio algebra sticks even after both pivots land. Cache-hint only, not a gate
(Rule 18).

## 6. Drill-down clusters

**S3:** `why_transformer_needs_ac` · `dc_switch_on_blip_explained` · `steady_flux_zero_emf`
**S5:** `turns_ratio_numericals` · `step_up_vs_step_down_identify` · `volts_per_turn_design`
**S6:** `power_conservation_current_inverse` · `step_up_free_energy_error` · `primary_current_feels_the_load`

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 → STATE_6    # flux link, wireless handoff (SUPPORTING aha), DC-dead, per-turn, ratio, no-free-power (PRIMARY aha)
  turns_ratio:  STATE_4 → STATE_5    # "how does it change voltage" / numericals
  power:        STATE_6              # "does it amplify power"
  transmission: STATE_7              # "why high-voltage lines"
  losses:       STATE_8 → STATE_9    # real transformers, lamination
  derivation:   STATE_10             # advanced ring
  exploration:  STATE_11
```
Default aspect = `foundational`. **PRIMARY aha (S6) and SUPPORTING aha (S2) both INSIDE foundational — no
mandatory exit-pill required.** Optional pill at the foundational end: *"So why are the pylon cables at
hundreds of thousands of volts? →"* into `transmission`.

## 8. Prerequisites (advisory only — Rule 23)

- `faraday_law_induction` (shipped diamond, Ch.6) — changing flux through a loop drives an EMF; cliff S2.
- `ac_voltage_resistor` (SEALED, #1) — meters read rms; the source-wave conventions; cliff S1.
- `ac_power_factor` (SEALED, #6) — P = V·I real watts + the grid-transmission motivation seeded there;
  cliffs S6/S7.
- `electrical_power_in_resistor` (shipped diamond, Ch.3) — wire heat = I²R; cliff S7.
- `ac_voltage_inductor` (SEALED, #2) — the ideal-primary εₚ ≈ Vₚ clause; cliff S10 (advanced only).
- `lc_oscillations` NOT required (operationally independent — the lc handoff's own declaration); its
  energy-story delivery ("only R spends") frames S8's η in one clause.

Required-by: none — this concept CLOSES Ch.7. The chapter arc completes: elements → phasors → impedance →
power → the circuit's own rhythm → the machine that carries AC to the world.

## 9. Real-world anchor (Rule 35 + 38f)

**Primary — the journey every watt makes to reach a wall socket.** `ac_power_factor` seeded the grid
story; this concept cashes it. Between any power station and any home stand transformers — the voltage is
stepped UP to hundreds of thousands of volts at the station (S7's ×100 arithmetic is the entire reason),
carried across country on pylons at a current too small to waste itself as wire heat, then stepped DOWN —
substation by substation, finally to the mains voltage at the street — before it reaches a socket.
Culture-neutral (no country, no named utility; "the mains voltage" phrased neutrally per 35b), the
widest-syllabus-overlap device there is (38f names the transformer explicitly), and physics-true at
depth. **Secondary (narration-only, feeds S5/S8):** the small warm brick that charges a phone — inside it
a genuinely tiny transformer works the same turns trick (at a much faster rhythm than the mains, by
design) to step the wall's voltage down to the few volts a phone can drink; and the low hum near any large
transformer — S8's flexing core, audible. Nothing anchor-shaped is drawn (Rule 24; anchors live in
narration); no regional constant is ever numeralized.

---

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the eleven of §2, ids as named, `state_count: 11`, contiguous STATE_1–STATE_11;
`advance_mode` 10× `manual_click` + 1× `interaction_complete` (Gate 12 ✓); no
`wait_for_answer`/`pause_after_ms`/`narrative_socratic` anywhere.

**(b) Symbol-label table** (38d dialect: dual-label once then bare — "Voltage V (p.d.)" at S1, then bare;
pinned ASCII tokens `V_p/V_s/I_p/I_s/N_p/N_s/P_p/P_s/R_line/Phi/eta` composed to styled subscripts on all
THREE text paths, zero literal underscores; the LETTER-subscript compose path (ₚ/ₛ) verified live):

| Quantity | On-canvas label | First |
|---|---|---|
| flux | violet tubes + trace; HUD `Φ = 0.090 Wb`; dual-label once "magnetic flux Φ" | S1 |
| primary voltage | meter `Vₚ = 10.0 V`; dual-label once "Voltage V (p.d.)" | S1 |
| secondary V/I, primary I | meters `Vₛ = 10.0 V` / `Iₛ = 0.40 A` / `Iₚ = 0.40 A` | S2 |
| turns counters | chips `Nₚ = 100` / `Nₛ = 100` | S4 |
| per-turn share | tick tag `0.100 V/turn`; bar 0→10.0 V | S4 |
| the ratio | chip `Vₛ/Vₚ = Nₛ/Nₚ = 2`; "step-up / step-down" named | S5 |
| power | bars `Pₚ = 16.0 W` / `Pₛ = 16.0 W`; money chip `10.0 × 1.60 = 20.0 × 0.80 = 16.0 W` | S6 |
| transmission | strip labels `R_line = 5.0 Ω`, `loss = 3.200 W → 0.032 W`; chip `×10 V → ÷100 loss` | S7 |
| losses | leak bars copper/eddy/hysteresis/stray (warm hue); chip `η = 16.0/16.8 = 95%` | S8 |
| lamination | cutaway labels "solid / laminated"; chip `thin slices → no wide loops` | S9 |
| derivation chain | Cambria panel, S10 only | S10 |

**⚠ Symbol notes:** lowercase v/i reserved for instantaneous waveform axes only; all meter/chip values are
UPPERCASE rms per the §2 declaration ("every meter reads rms", stated once at S1). ε appears ONLY inside
S10's chain (core states speak of "voltage" — 38c). No board conflict on N (turns) — universal.

**Formula surface per state (Rule 34b — ONE each; 38c ladder: algebra-only in core/extended, calculus
confined to S10):** S1 **NONE (deliberate — the picture states it; Φ HUD carries the number)** · S2
**NONE (deliberate — the aha is visual; the faraday callback is narration)** · S3 **NONE (deliberate —
the dead beat needs no law; the chip carries it)** · S4 `Vₚ/Nₚ = 0.100 V per turn` · S5
`Vₛ/Vₚ = Nₛ/Nₚ` (THE transformer equation, given as measured — core) · S6 `Vₚ·Iₚ = Vₛ·Iₛ` · S7
`P_loss = I²·R_line` (with I = P/V as the chip's algebra) · S8 `η = Pₛ/Pₚ` · S9 **NONE (deliberate —
the cutaway IS the statement)** · S10 the chain `εₚ = −Nₚ·dΦ/dt → εₛ = −Nₛ·dΦ/dt → Vₛ/Vₚ = Nₛ/Nₚ →
Iₚ/Iₛ = Nₛ/Nₚ` · S11 `Vₛ/Vₚ = Nₛ/Nₚ` (core, 38b). All real Unicode on all three text paths (34c):
Φ ω ε η Ω ₚ ₛ ² × → ÷ ·.

**(c) RHR plan:** N/A as a performed rule — no hand rule is taught. Sign conventions stated deliberately:
flux positive = one declared circulation sense, alternating with the source; the winding-sense/polarity
(dot) convention is NEVER mentioned; vₛ drawn in phase with vₚ (the declared ideal same-sense
convention); current positive = each loop's first-run bead direction.

**(d) Motion plan:** §3 table — every state's motion named; the flux/bead/lamp rhythm runs continuously
in S1–S2 and S4–S9 (closed-form, ≥1 full cycle per dwell at T = 4.00 s); S3's secondary dead-hold is the
DESIGNED null-result (the blip is its pivot event; the steady one-way primary bead stream is its
continuous motion, sustaining the frozen flux; declared `reveal_hold` after the blip); S10 dims with E4
restore (`reveal_hold`); S11 free-runs (Rule 37); NO clock freeze anywhere; explore renders at full
immediately.

**(e) Modes:** conceptual-only — NO `mode_overrides`, NO `epic_c_branches`; `renderer_pair` =
field_3d/field_3d; `available_renderer_scenarios.field_3d = ["transformer"]`.

**(f) Assessment + coverage:** 6 questions: Q1 how energy reaches the secondary with no contact
(distractor: "electrons conduct through the iron") → S2 · Q2 Nₚ=100, Nₛ=200 on 10 V rms: identify
step-up, find Vₛ (distractor: "10 V — voltage can't change without contact") → S5/S4 · Q3 ideal secondary
delivers 16 W — power the primary draws (distractors: "8 W", "32 W — step-up doubles it"; real-world
clause: "slightly MORE than 16 W in a real one" → touches S8) → S6 · Q4 why a transformer fails on DC +
what happens at switch-on (distractor: "it works, just weaker") → S3 · Q5 why the core is laminated
(distractor: "to increase the flux") → S9 · Q6 why transmission runs at high voltage (distractor: "high
voltage travels faster") → S7. `non_assessed_states: [STATE_10, STATE_11]`. `misconception_watch` at
exactly S3, S6. Gate 20 ✓ (aha states hit: Q1→S2, Q3→S6).

**(g) Macro↔micro:** §3 Rule-33 block — apparatus ↔ representation bands, colour zoom-links, ONE phase
clock, per-state real numbers, live instruments; interior-band decision made and justified (flux
tubes/beads/loops ARE the mechanism view — the seven-sibling ruling — EXCEPT S9's declared zoom-lens
cutaway, the concept's one genuine interior).

**(h) Canvas budget (Rule 34) + zone map (CSS READ §0a, not remembered):** caption = the ≤5-word Δ cue
only (F1 single-latest); prose in capStrip; ONE Cambria formula surface on `tfr_formula` (top:40%;
right:22px family slot, `:30559`); HUD value-only top:52px;right:12px (min-width fits `Φ = 0.090 Wb`,
`:30545`); `tfr_band` @ bottom:210px;left:12px (`:30550`) — Φ trace (S1–S3) / tick bar (S4) / vₚ-vₛ twin
sines (S5–S6, y auto-ranged, longest gutter label `20.0`) / transmission strip (S7, declared swap) /
dim (S10); `tfr_gauges` @ bottom:88px;left:12px (`:30555`) — Pₚ|Pₛ bars S6+, five-label ledger S8 (F4
header-row geometry inherited; label disjointness re-verified on the S8 tallest-rightmost pose); the
sibling `pwr_ppane` slot (bottom:88px;left:194px) stays EMPTY every state; sliders bottom:12px;right:12px
(`:30563`, 4 rows — under the family max); generic `#formula_overlay` suppressed (`:38198` list joined).
Engine fine-tunes ±20 px; binding invariants: rows disjoint · band/bottom-row 12 px clearance · left:12px ·
top:52px+ both edges · one canvas per pane.

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Coherence check, BOTH cuts:** hide advanced (S10): S1–S9+S11 survive — S5 gives the ratio as a
  measured law, S6 gives power conservation as a measured fact; no surviving state promises a proof
  (binding on physics_author). **Coherent.** Hide advanced+extended (S8–S10): S1–S7+S11 — flux → wireless
  → AC-only → per-turn → ratio → power → transmission → explore. S7's line heat is Ch.3's I²R (external to
  the transformer), NOT S8's internal leaks — no dependency; S6's "(a little less, in real ones)" clause
  is self-contained honesty, not a forward reference. **Coherent.** S1/S2/S3/S9's formula-NONE design
  means no early state depends on later vocabulary in any cut.
- **(i-2) Explore = core-ring only (38b):** S11 surfaces apparatus + meters + waveforms + power bars +
  four sliders; η, leak bars, the cutaway and the derivation chain deliberately ABSENT; formula = the
  core ratio law.
- **(i-3) `curriculum_tags` (claims, not facts — 38g; only CBSE/NCERT marked verified):**

| Curriculum | Claim | Verification |
|---|---|---|
| CBSE/NCERT Class 12 (+ JEE/NEET) | ✓ **full — verified** (NCERT §7.9 exactly: principle, turns relation, step-up/down, all four losses incl. lamination + hum, transmission; JEE/NEET weighting on Q2/Q3-class numericals) | verified (NCERT is the authoring backbone) |
| CAIE A-level 9702 | ◐ believed FULL (ideal transformer equation + high-V transmission are in the syllabus) | `needs_teacher_verification` |
| IGCSE 0625 | ◐ believed PRESENT (transformer equation + transmission qualitative; losses lighter) | `needs_teacher_verification` |
| IB DP | ◐ believed PRESENT pre-2023, possibly trimmed since | `needs_teacher_verification` |
| AP Physics 2 | ✗ believed marginal (induction yes; transformer device treatment thin) | `needs_teacher_verification` |
| AP Physics C: E&M | ✗ believed absent as a device topic | `needs_teacher_verification` |
| Ontario SPH4U | ✗ believed absent | `needs_teacher_verification` |

- **(i-4) Presets (hide, never reorder — 38h/25d):** CBSE+JEE → S1–S11 (all); board-lean CBSE → hide S10;
  generic core → hide S8–S10; A-level/IGCSE candidates → hide S10 (S8–S9 pending verification); others
  none shipped pending 38g.
- **(i-5) Graph axes (38e):** vₚ/vₛ and Φ traces t-on-x (universal); power/leak bars vertical; no known
  board conflict → no axis toggle.

**(j) Existence-assertion table (binding on the engine dispatch, quality_auditor, eye-walker):**

| Negative/absence claim | Paired existence assertion |
|---|---|
| "No wire joins the two circuits" (S1–S11) | The two loop meshes are disjoint; no bead ever crosses between loops; no conductive path intersects both (probed every state) |
| "The open secondary carries nothing" (S1) | Secondary switch EXISTS rendered open; ZERO beads on the secondary; lamp dark — while the flux tubes visibly thread its coil (the open-loop scar, inverted) |
| "DC gives one blip, then the secondary gets nothing" (S3) | The needle-kick + lamp-flash event EXISTS at the throw instant AND the SECONDARY meters read Iₛ = Vₛ = 0.00 for the rest of the dwell — PAIRED: the Iₚ meter reads a steady nonzero DC value and the primary beads flow one-way throughout |
| "The flux is frozen, not gone" (S3) | Flux tubes PRESENT at full density with breathing amplitude = 0, visibly SUSTAINED by the steady primary current — "no change" rendered as distinct from "no flux" |
| "The counter is authoritative" (S4/S5) | Rendered loop count tracks Nₛ proportionally (declared ×10 bundle tag); counter numeral = actual Nₛ at every frame |
| "The flux is untouched by the turns ramp" (S5) | Φ trace amplitude identical pre/post ramp (0.090 Wb) while Vₛ doubles — the "more turns squeeze more flux" belief killed by probe |
| "The scripted ramp shows its thumb" (S5) | Slider-thumb + label displacement probe across the full ramp window; Vₛ = Nₛ×0.100 at every dense frame (F1 scar) |
| "The power bars sit level while V/I trade" (S6) | Pₚ = Pₛ = 16.0 at every sampled frame; Iₚ needle at 2× Iₛ; ghost chip EXISTS latched then STRUCK, both frames captured |
| "The line runs ×100 cooler" (S7) | Line-glow intensity computed from the SAME displayed I²R values; the 3.200/0.032 pair exact at the declared 3dp |
| "The leak ledger closes" (S8) | 16.0 + 0.4 + 0.2 + 0.1 + 0.1 = 16.8 at displayed addends (exact by construction; largest-component closure armed for explore) |
| "Slicing quenches the whirlpools" (S9) | Eddy-loop extent + heat shimmer strictly lower on the laminated half of the SAME cutaway, same flux drive |
| "Explore is alive" (S11) | Dragging Nₛ changes Vₛ/Iₛ/lamp measured live (frame reads `PM_tfr*` globals — the picker scar); dragging f changes breathing rate AND amplitude honestly; S11 ships BRIGHT after S10 (E4 measured) |

**(k) Coincidence audit (A0-3):** (1) **Vₚ = 10.0 V rms shares its numeral with the chapter's vₘ = 10 V**
— a declared NEW work point (§2 reconciliation); the siblings' 7.07 V rms is never rendered here, the two
never juxtaposed. (2) Iₚ = 1.60 A and Pₚ = 16.0 W echo digits because Vₚ = 10 shifts the decimal — honest
arithmetic, never called a coincidence. (3) f = 0.25 Hz is the chapter's visualization rate — the real
mains frequency is phrased neutrally, NEVER numeralized (35b). (4) R_line = 5.0 Ω numerically equals the
chapter's retired series resistor R = 5.0 Ω — different object entirely (a transmission line), never
juxtaposed; chosen because it makes both loss displays EXACT. (5) The ×100 loss ratio is chip-safe ONLY at
the declared 3dp (3.200/0.032 = 100.0); the 2dp form (3.20/0.03 = 106) is FORBIDDEN on any surface.
(6) η = 95% aligns with the settled "well-designed transformers exceed 95%" fact — physics-true, not
engineered. (7) At ratio 1, Iₚ = Iₛ = 0.40 A — a LAW (taught identity), not a coincidence. (8) Φₘ = 0.090
Wb carries no claimed relation to any other number. Verified chips: `100 × 0.100 = 10.0` ✓ ·
`Vₛ/Vₚ = 200/100 = 2` ✓ · `10.0 × 1.60 = 20.0 × 0.80 = 16.0` ✓ · `16.0 + 0.8 = 16.8` ✓ ·
`16.0/16.8 → 95%` ✓ · `3.200/0.032 = 100.0` ✓.

**TTS:** author `teacher_script` EN (25–55 w/guided state); `text_hi` via the Rule-30g Sonnet-5
subscription sub-agent pre-ship (30i — never `text_te`); audio on-demand EN only (30h). **Registration
(8 sites):** `transformer.json` · `concept_panel_config`/`CONCEPT_PANEL_MAP` (file-only in trial) ·
`CONCEPT_RENDERER_MAP` → field_3d · `VALID_CONCEPT_IDS` · deep-dive flags S3/S5/S6 · synonyms n/a ·
`PCPL_CONCEPTS` N/A · `CLASSIFIER_PROMPT` + the seven aspects; + clusters migration (FILE-ONLY) +
`_seed_transformer_cache.ts`. **THE EYE:** 11/11 after the delta; DENSE frames REQUIRED for S1 (flux
build), S3 (blip → dead-hold), S4 (cascade), S5 (ramp), S6 (latch → strike), S7 (mode swap), S9 (slice
swap) — the checklist's ramp rule; eye-walker ∥ quality-auditor; zero new scar rows; regression =
`capacitance` 44/44 + ALL SEVEN sealed ch7 siblings clean; founder:drive hand-tests the S5 Nₛ grab, all
four explore sliders, and the explore Nₛ crossing through 100 (trusted interactions THE EYE can't fire).

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs + one-clause patches:** `faraday_law_induction` breaks at **S2** — "a changing flux
through a loop drives an EMF — the law that kicked your needle in the induction chapter."
`ac_voltage_resistor` breaks at **S1** — "every meter in this sim reads rms — the steady-equivalent value,
settled at the chapter's start." `ac_power_factor` breaks at **S6** — "P = V·I — the real watts that
land, from the last two concepts." `electrical_power_in_resistor` (Ch.3) breaks at **S7** — "wire heat is
I²R — the heating law from the current chapter." `ac_voltage_inductor` breaks at **S10** only — "with
negligible winding resistance the applied voltage is entirely matched by the induced EMF" (one clause,
advanced ring only). Each one clause, never a re-teach.

**JEE-backwards trace.** *"An ideal transformer with Nₚ = 100 and Nₛ = 200 runs from a 10 V rms AC
supply; the secondary feeds a 25 Ω resistive load. (i) Step-up or step-down? Find Vₛ. (ii) Find Iₛ, Iₚ
and the power drawn from the supply. (iii) The same device is connected to a 10 V battery — what does the
load receive, and why? (iv) Why is the core laminated? (v) The same power is sent down a 5 Ω line at 20 V
and then at 200 V — compare the line losses. (vi) [adv] Derive Vₛ/Vₚ = Nₛ/Nₚ from Faraday's law."* →
(i) **S5** (with S4's per-turn machinery) · (ii) **S6** (measured + the conservation chip) · (iii) **S3**
· (iv) **S9** (+ S8 for the loss family) · (v) **S7** (the exact numbers) · (vi) **S10**. No missing
piece; S1/S2 ground the principle every stem assumes; S11 is the teacher's what-if surface. M1–M6
carve-out N/A (not Ch.26).

**Misconception entry mapping (16a) + planting audit (6 items):** the two pivots of §4,
wrong-consequence-first (the ghost free-power chip struck by level bars; the blip-then-dead null result).
Planting: (1) **S2 DELIBERATELY plants pivot #1's soil** — power crossing on nothing FEELS like magic
that could give more; declared, billed at S6. (2) **S5 waters it** — the lamp brightens as Nₛ climbs
(with a fixed load, stepping up genuinely delivers more watts) — so S5's OWN beat shows Iₚ climbing
0.40→1.60 A in the same motion (the primary pays live, unnarrated until S6's strike; declared earned
setup). (3) S3 could plant "DC can never induce anything" → the blip IS the guard + the fix clause names
the throw as the last change. (4) S4's "ALL the flux threads EVERY turn" is the ideal-core promise → S8's
stray-flux leak explicitly breaks it (declared retro-link). (5) S7's grid schematic could plant
"transformers are only grid hardware" → the anchor's charger clause. (6) Explore f-drag lowers Φₘ at
fixed Vₚ — honest, declared, unnarrated (no state claims flux amplitude is f-independent).

## Block 2 — Aha-moment designation

- **PRIMARY (S6):** *A transformer is a trade, not a gift — volts up means amps down, and the watts pass
  through untouched; nothing in physics hands out free power.*
- **SUPPORTING (S2):** *Energy crosses between two circuits that share nothing but a changing flux — no
  contact, no wire, just Faraday's law working between strangers.*
- **Cohesion:** S2's wireless wonder is precisely the confidence S6 bills — the device that seems to give
  something for nothing is shown to keep perfect books. One primary + one supporting; S5's ratio and S7's
  grid story are machinery that set up and cash the primary (deliberately not ahas).
- **Wrong-belief setup:** for S6 — S2 builds the magic and S5 makes it pay visibly (brighter lamp, higher
  Vₛ): the student is confident and slightly wrong exactly when the four meters present the bill. For
  S2 — S1 builds "two separate circuits, secondary open and dark; nothing can cross."
- **Foundational-coverage rule:** PRIMARY aha (S6) and SUPPORTING aha (S2) both INSIDE
  `entry_state_map.foundational` (S1–S6) — no exit-pill required.

---

## Escalations / FLAGs for downstream

1. **Engine delta first (§0b)** — NEW `scenario_type: "transformer"` (prefix `tfr_`) via §3b before
   json_author; clone-sibling of `lc_oscillation` + element coil assets; zero sealed-internal edits
   (diff-grep duty); regression = capacitance 44/44 + ALL SEVEN sealed ch7 siblings. Every §3b dispatch
   restates **"no DB writes — files only."** **Runaway guard: engine-commit count enters at 27** —
   surface at every boundary; this is the chapter's final build.
2. **Compose routine — now rule-of-SIX (the directive's own forecast):** default a sixth `tfr_`-scoped
   clone (trial-safe); the promotion recommendation to the founder is RESTATED a FINAL time — with the
   chapter complete, all six clones exist and the refactor has its full regression corpus. Promotion only
   on explicit founder approval, with its own full-fleet regression dispatch. The LETTER-subscript (ₚ/ₛ)
   compose is new surface — verify live on all three text paths.
3. **Colour semantics — declared, founder ruling open:** amber = current/beads (chapter law); cyan =
   primary-voltage family; **green = secondary-voltage family (declared new use — lc's green was charge;
   different sim)**; violet = flux/magnetic (inherits lc); warm red-orange = every heat surface (line
   glow, leak bars, eddy shimmer); lamp warm white; greyed source/battery when out of loop. The
   ac_inductor cool-colour divergence remains the founder's standing item.
4. **Binding 32a caution (the family's rule):** ONE closed-form source phase clock + the algebraic ratio
   laws drive flux tubes, Φ trace, beads, lamp envelope, meters, waveforms, bars, line glow — never
   independently animated surfaces; "never let the twin agree by animation luck."
5. **The lc F2 live-player follow-up (recurring-crossing end-freeze) is MITIGATED BY DESIGN here** — no
   state's money-moment is a recurring instantaneous crossing; settled pins are phase-pinned
   (v-extremum / dead-hold / cool-phase / laminated-half, §0b ask 10). The fleet-wide player invariant
   remains the founder's standing chapter-end item — this skeleton neither needs nor consumes it.
6. **CHAPTER END.** transformer is #8 of 8 — with its seal, Ch.7 is COMPLETE. The chapter-end packet
   rolls up to the founder: compose promotion (rule-of-six), the colour-law reconciliation, all scar
   apply-decisions in `ch7/_engine/scar_candidates.sql`, curriculum_tags verification, and the standing
   items logged in `ch7_state.md`. No further concept handoff — no DELIVERS/WITHHOLDS seed is emitted.
7. **quality_auditor:** run the live `engine_bug_queue` SQL at Gate 8; §10j item-by-item + §10k audit
   (esp. the 3dp-only ×100 chip, the 10 V rms reconciliation, the R_line echo); composed LETTER
   subscripts on all three text paths, zero underscores; ring gating (leak bars S8 only, cutaway S9 only,
   chain S10 only, explore core-only); display-precision law + the unsigned-0.00 clamp; any live slider
   outside S5/S11 = a design defect; confirm NO clock freeze; confirm the sibling ppane slot draws
   nothing; check the built sim against the §3 control table.
8. **eye-walker pre-refutations:** S3's dead SECONDARY (zero beads, 0.00 meters, dark lamp) under a
   steadily-flowing one-way primary bead stream and frozen full-density flux is the DESIGNED null-result
   (not a motion-loss regression — the blip precedes it, and the primary beads keep streaming); the S6
   ghost latch→strike is the F1 caption pattern (not stale-frame residue); the lamp's 2f flicker is honest
   physics (not a strobe defect); S7's band swap to the transmission strip is a declared labeled change;
   S10's dim is E4-restored (S11 BRIGHT measured); the greyed battery persisting after S3 is designed
   removal-made-visible.
9. **No Write tool in this dispatch** — skeleton returned for the loop orchestrator to persist to
   `docs/loop_runs/ch7/transformer/skeleton.md`.

---

## Self-review checklist

- [x] Atomic claim ONE sentence; exclusions named with deferral targets (no re-derives; no mutual-M
  quantification (Ch.6); no back-EMF regulation/magnetizing current; no rectification).
- [x] State count 11 = top of complex band, justified (device concept: mechanism ×3 + law ×2 +
  conservation pivot + application + non-ideality ×2 + derivation + explore; two NCERT-explicit pivots);
  merge-grading documented (step-down folded into S5/S7/explore; blip into S3; hum into S8; back-EMF and
  mutual-M rejected).
- [x] Per-state control table: teaches × archetype × distinct motion × Δ × controls × glow × advance ×
  budget × `depth_ring`; none static; FOUR coins one-line justified; zero archetype repeats; drag-sandbox
  explore-only; narration 35–55 EN words guided, explore 0/open.
- [x] Rule 32 plan incl. the "animation luck" caution; one glow focal per state from a proposed CLOSED
  enum (final enum owned by the engine dispatch's JSON contract); F5 pane-level multiplier law wired.
- [x] Rule 33 plan with per-state real numbers + four live needle+numeral meters; interior-band decision
  made and justified (apparatus IS the mechanism view; S9 = the one declared zoom-lens cutaway).
- [x] Rule 34: Δ-cue captions, ONE formula surface per state (four deliberate NONEs declared), value-only
  HUD, zone map with READ CSS cites (`:30545–30563`, `:37958`, `:38198`) + sibling ppane slot declared
  empty, top:52px+ chrome clearance, `#formula_overlay` suppression joined.
- [x] Rule 38: `depth_ring` column; qualitative → quantitative → derivation order; advanced (S10)
  contiguous immediately before explore; extended = S8–S9 (real-device engineering — genuinely the next
  rung, unlike lc's declared-empty ring); BOTH cuts checked coherent; explore core-only;
  `curriculum_tags` claim table with `needs_teacher_verification` (only CBSE/NCERT verified); presets
  derived (hide, never reorder); graph axes decided, no toggle; anchor = THE widest-overlap device
  (38f names the transformer itself).
- [x] `misconception_watch` at exactly TWO genuine pivots (S6 primary, S3 second) with selection
  reasoning; third candidate demoted to the S5 invariant clause + probe; contrast beats
  wrong-consequence-first; no per-state tic; no EPIC-C branches.
- [x] 3 `has_prebuilt_deep_dive` states (S3/S5/S6), 3 clusters each; divergence from pivots documented.
- [x] `teaching_method` per state; no `narrative_socratic`; Gate 12 ✓; no wait_for_answer/pause_after_ms.
- [x] `entry_state_map` with foundational + 6 aspects; BOTH ahas inside foundational — coverage rule
  satisfied without an exit-pill.
- [x] Prerequisites advisory (faraday + three sealed siblings + Ch.3 power), cliffs named with
  single-clause patches; lc_oscillations deliberately NOT required (documented).
- [x] Anchor universal + culture-neutral (the grid journey primary — cashing ac_power's seed; charger
  brick + transformer hum secondary), plain English, physics-true at depth (the charger clause states the
  faster-rhythm truth); nothing anchor-shaped drawn; NO regional constant numeralized (35b).
- [x] DoD complete, zero TBDs — symbol table under the pinned ASCII-token law with the NEW
  letter-subscript duty; sign conventions declared (RHR N/A stated; dot convention excluded); motion plan
  total incl. the designed S3 dead-hold; modes declared; assessment + coverage mapped (both ahas hit);
  §10j existence table (12 pairings incl. the flux-invariant and no-bridge probes); §10k coincidence
  audit (8 items incl. the rms reconciliation and the 3dp-only ×100 chip).
- [x] **Number lock verified, one NEW work point declared:** Vₚ = 10.0 V rms chosen and justified
  (reconciliation vs the chapter's vₘ = 10 V stated); every value re-computed here, not trusted; ALL
  work-point displays exact at declared precision (no rounding boundary anywhere — the lc 6.365 lesson
  applied at design time); the S7 3dp exception declared with its reason.
- [x] Engine bug queue consulted via the checklist + the lc skeleton's full distillation + the SIX lc CpB
  rows READ verbatim; live-SQL gap FLAGged to Gate 8; the OPEN precision-checklist directive's four items
  each closed in §0b (its "remaining Ch.7" scope ENDS with this dispatch).
- [x] Engine triage explicit: Class-A honestly evaluated and rejected (six hard gaps); Class-B
  clone-sibling of `lc_oscillation`; compose rule-of-six + colour sub-issues addressed with declared
  defaults, founder rulings left un-consumed; json_author blocked until the delta lands.
- [x] Block 1 + Block 2 complete (cliffs, JEE trace, 6-item planting audit, PRIMARY + 1 supporting,
  cohesion, wrong-belief setups, coverage disposition).
- [x] Chapter-end disposition declared (Escalation §6): no successor handoff seed — Ch.7 closes here.
- [x] Handoff-ready for founder-proxy Checkpoint A, then physics_author.
agentId: a62e722ad6b98b71d (use SendMessage with to: 'a62e722ad6b98b71d', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 129643
tool_uses: 2
duration_ms: 461441</usage>