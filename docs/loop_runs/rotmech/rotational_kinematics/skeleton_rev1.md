# Skeleton — `rotational_kinematics` (rotmech · Class 11 Ch.7 · concept #4 · Desk D 0b design pass) — REV 1

> **Status:** Phase-0b design (rotmech_d_state.md wave-1 docs pass). This concept is **BLOCKED on build 0c-3**; no concept JSON may be authored until the 0c-3 engine PR merges. This skeleton is one of the two authoritative statements of 0c-3's scope (the other is the `tau_eq_i_alpha` skeleton). It renders on the FROZEN 0c-1 `rigid_body_rotation` (rbr) scenario (`field_3d_renderer.ts:939-1059` contract, `:49700-50700` implementation) plus the 0c-3 items in ENGINE REQUIREMENTS.
> **Renderer-readiness declaration (scar `archetype_live_tier_unverified_against_renderer`):** every `[LIVE]` claim below was verified against renderer CODE this session and cites file:line. Every `[NEEDS-0c-3]` motion transfers its verification obligation to the 0c-3 build and its bring-up probes.
> **Bug-queue consultation (2026-08-04, LIVE table via Bash):** `--owner alex:architect` · `--row-type directive` · `--field3d --open` · `rotational_kinematics` (0 rows — concept not yet authored, expected). Union extracted mechanically: **157 unique `bug_class` strings**, every one dispositioned VERBATIM in the SCAR AUDIT (superset diff run per `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`).
> **DC Pandey check:** chapter table of contents only (rotational-motion chapter scope confirmed). No teaching method, example problem, or figure imported. NCERT = syllabus backbone (angular kinematics is core NCERT Ch.7 material); HC Verma sequence consulted for ordering only (angle → rate → rate-of-rate → equations → v = ωr).
> **Namespace check:** `rotational_kinematics` appears in neither `src/data/concepts/` nor `chemistry/` — no collision (ids pre-registered on master in `4b289d4`; registration files READ-ONLY on this desk).
> **Apparatus contract:** `APPARATUS_CONTRACT.md` §1 binding — home pose r = 0.80 m, ω = +1.50 rad/s, m = 2.0 kg, I_frame 0.50, rod_half 1.00, drum 0.55, rod height 0.25, r ∈ [0.15, 0.90]. S1 opens EXACTLY at the home pose. Requested deviations are in ENGINE REQUIREMENTS §"Apparatus-contract items for the office" — none is taken unilaterally.

---

## 1. Atomic claim

This concept teaches ONE thing: **rotation is described by three quantities — angle turned θ, turning rate ω, and rate of change of turning α — that obey the SAME equations as straight-line motion (ω = ω₀ + αt is v = u + at with new letters), and v = ωr ties each point's linear speed to the one shared turning rate.** It does not cover what makes the spin change (`torque`, #5), rotational mass (`moment_of_inertia`, #6), the τ = Iα law (`tau_eq_i_alpha`, #7), or ω as a vector along the axis (`angular_momentum`, #9 — this concept treats ω and α as signed rates only, no right-hand rule).

**The Rule-25 problem, answered here (the sharpest design constraint):** this concept sits BEFORE torque and moment of inertia, so whatever produces α on screen must be introducible without dynamics vocabulary. The design: α is produced by two familiar rendered objects — a **motor drive wheel** that presses the drum and turns it (spin-up), and the existing **brake pad** (slow-down) — narrated purely kinematically: "the motor wheel presses the drum; the spin rate rises steadily — that steady rise is α." The words τ, torque, I, and inertia appear in NO reader-facing string, no formula surface, no label. The authored `applied_torque_Nm`/`tau_brake_Nm` values are internal implementation numbers physics_author computes from the target α (τ = 3.06·α at the fixed home r), exactly as `pend_k` is internal to the dipole scenarios. The HUD shows ONLY θ, ω, α — never I, L, or KE (do-not-prespoil: those belong to #6-#10).

## 2. State count + arc — 9 states (8 guided + 1 explore)

Complexity call: **complex (7-9 band)**. The concept carries three new quantities (θ, ω, α), two equations (ω = ω₀ + αt core; θ = ω₀t + ½αt² extended), one link law (v = ωr), a sign story (negative α), and an advanced calculus/graph ring. Nine states, none padding: each grades against "what does this state prove the previous ones don't?"

The apparatus is the SHARED chapter turntable (Rule 32d): axle + drum (R 0.55) + rod (half-length 1.00) + two symmetric masses **fixed at r = 0.80 for the whole concept** — no radial slide anywhere; this concept's motion vocabulary is purely rotational, visibly distinct from the radial slides of `conservation_of_angular_momentum` on the same machine. All states author `theta0_rad: 0` (the rim marker starts ON the start line at every entry re-pose). State entry is an instantaneous single-frame re-pose. Camera: ONE home framing for all nine states (slightly elevated three-quarter view showing the drum face, rod, start line, and HUD) — no reframe anywhere (Rule 32d; scar `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` trivially discharged by having no camera solve).

**Authored numeric ground truth (all 2 dp; physics_author recomputes at the engine's 16 ms grid):**
I at r = 0.80 is 3.06 kg·m² (internal only, never rendered). Home spin ω = 1.50 rad/s → period T = 2π/1.5 = **4.19 s**; one full turn = **6.28 rad**. S3: from rest, α = **+0.60 rad/s²** for 4.0 s → ω = **2.40** (internal τ_app = 1.84 N·m). S4: from ω₀ = 1.50, α = +0.60 for 3.0 s → predicted ω = **3.30**. S5: from ω₀ = 1.50, α = **−0.50** (internal τ_brake = 1.53 N·m, inside the [0, 2.0] contract range) → rest at **3.00 s** after engagement. S6: at ω = 1.50 — v(0.40) = **0.60 m/s**, v(0.80) = **1.20 m/s**, ratio exactly **2.00** (= 0.80/0.40; scar `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims`: the rendered factor equals the factor the strings claim). S7: from rest at α = 0.60 — θ at 1, 2, 3 s = **0.30, 1.20, 2.70 rad**; per-second increments **0.30 : 0.90 : 1.50 = 1 : 3 : 5**. No numeral triple repeats an earlier state's (scar `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` — cross-tabulated: S3 (0→2.40, 4.0 s), S4 (1.50→3.30, 3.0 s), S5 (1.50→0, 3.0 s, α −0.50) all distinct).

| State | Title (Rule 41 — literal, first words carry meaning) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | The angle turned is θ | θ defined and measured: start line, rim marker, growing arc; 2π rad = one full turn | *(straightforward beat)* | core (qualitative) |
| S2 | ω is radians turned per second | ω = θ/t for steady turning; equal-time ticks land equally spaced | *(straightforward beat)* | core (quantitative) |
| S3 | α is how fast ω changes | Spin-up from rest under a visible motor wheel; ω climbs steadily; α readout | *(straightforward beat)* | core |
| S4 | The same equation as straight-line motion | THE PRIMARY AHA: ω = ω₀ + αt predicts 3.30 BEFORE the run; the live readout meets the chip | *(straightforward beat)* | core |
| S5 | Slowing down is negative α | Brake beat: ω falls in a straight line to rest while α sits at −0.50 | *(straightforward beat)* | core |
| S6 | One turning rate, many speeds | v = ωr: two points, one ω, tangent arrows in ratio 2:1 | `misconception_confrontation` | core |
| S7 | The angle grows as t squared | θ = ω₀t + ½αt²: equal-time ticks now land 1 : 3 : 5 apart | *(straightforward beat)* | extended |
| S8 | ω is the slope of the θ graph | Calculus forms ω = dθ/dt, α = dω/dt on live θ(t)/ω(t) curves | `derivation_first_principles` | advanced |
| S9 | Try it yourself | Sandbox: ω₀ and α sliders, all readouts and arrows live | `exploration_sliders` | *(explore — core-ring content)* |

**Rule 38a — both clauses:** ladder = qualitative (S1) → quantitative (S2-S6) → extended (S7) → derivation (S8); rings monotone; the advanced ring (S8) is a contiguous block immediately before the explore state ✓. `advance_mode`: S1-S8 `manual_click`, S9 `interaction_complete` (Gate 12: ≥2 distinct modes ✓).

## 3. Per-state choreography + control plan (Rule 31 control table)

**Beat-termination contract (scar `authored_beat_ends_by_undoing_the_state_own_claim` — declared per state, no third shape invented):** S1, S2, S6 are **steady-continuous** — ω is constant (τ_ext = 0), the closed-form spin runs for the whole state, and nothing ever changes back (a steady spin cannot undo a claim; each revolution completes the motion cycle Rule 31 requires). S3, S4, S5, S7, S8 are **one-shot-hold**: the drive/brake engages at an authored instant, releases at an authored instant, and ω then HOLDS at its end value for the remainder of the state (τ_ext = 0 after release ⇒ ω exactly constant by the closed form `field_3d_renderer.ts:49933-49943`; ticks and marks persist). **No `param_ramp` is authored anywhere in this concept** (scar `field3d_param_ramp_authoring_contract` N/A-by-design — the timed surface used is the engagement window `engage_at_ms`/`release_at_ms`/`pad_travel_ms`, `:1002-1006`, read for the applied source at `:50533`). S9 free-runs (Rule 37). Entry configs are stated per row; every state entry is a single-frame re-pose.

**Coined archetypes (four, each justified once):**
- `equal-time-ticks` — marks dropped on the rim path at equal time intervals make the growth law visible as SPACING. Declared by S2/S7 as a contrast pair (even spacing = constant ω; widening 1:3:5 = constant α).
- `converge-on-mark` — a live readout sweeps toward a pre-stated prediction chip and the match cue fires when it arrives. The distinct picture is the arrival itself (the inverse of the sibling skeleton's `diverge-from-mark`).
- `paired-tangent-ride` — two tangent arrows ride their points around one shared revolution; their lengths differ in exact proportion to radius. The distinct picture is the riding pair.
- `slope-trace` — a live dot draws a curve on a graph while a tangent-slope indicator rides it; the indicator's steepness IS the derived quantity.

**Archetype-discharge rule:** every archetype is discharged by motion the AUTHORED beat produces with no teacher input, within the state duration. The S5 slider is a Rule-31 contextual control layered ON TOP of an authored beat.

| State | Teaches (one idea) | Archetype | ENTRY CONFIG (r · ω₀ · source, t = 0) | Authored beat (cause → effect) | Delta cue | Live controls | Words | Ring |
|---|---|---|---|---|---|---|---|---|
| S1 | θ = the angle turned, measured in radians from a start line | `reveal-build` | r 0.80 · ω₀ +1.50 (HOME POSE) · no source | Turntable spins steadily. In narration sync (ledger §10b): the space-fixed **start line** draws in; the body-fixed **rim marker** brightens; the **θ arc** begins growing from line to marker; the **θ readout** starts counting. At one full turn the readout shows **6.28 rad** and narration names it: 2π radians = one full turn. Steady-continuous | **"θ: the angle turned"** | none | 30-45 | core |
| S2 | ω = radians turned per second — the steady rate the angle grows | `equal-time-ticks` | r 0.80 · ω₀ +1.50 · no source | Same steady spin. Every 1.0 s a **tick** drops onto the rim path at the marker's position — four ticks land **equally spaced** (1.50 rad apart, evenly around 6.28). After the fourth tick the **ω readout** reveals: 1.50 rad/s. Formula surface `ω = θ / t`. Steady-continuous | **"ω: radians per second"** | none | 30-50 | core |
| S3 | α = how fast ω itself changes; a steady spin-up means constant α | `translate-through` | r 0.80 · ω₀ 0 (from rest) · drive engages at 2.0 s | CAUSE first — the **motor drive wheel** translates in (~1.0 s) and touches the drum, visibly turning (Rule 32a). After a readable ~0.7 s beat the EFFECT follows: the table starts from rest and the **ω readout climbs steadily** 0.00 → 2.40 over 4.0 s while the **α readout** sits pinned at **0.60 rad/s²**. At release the wheel withdraws; ω HOLDS at 2.40. One-shot-hold. Narration notes in passing: at the first instant ω still reads 0.00 while α already reads 0.60 — a rate can be changing even when it is momentarily zero | **"α: the rate ω changes"** | none | 35-55 | core |
| S4 | ω = ω₀ + αt — the straight-line equation with new letters, used to PREDICT | `converge-on-mark` | r 0.80 · ω₀ +1.50 · drive engages at 3.5 s | The formula surface shows **ω = ω₀ + αt**; narration computes the prediction aloud: 1.50 + 0.60 × 3.0 = 3.30 — and the **chip `predicted ω = 3.30`** prints beside the live ω readout `[LIVE]`. THEN (readable beat) the drive wheel engages for 3.0 s: ω sweeps 1.50 → 3.30 and **the match cue fires** — chip and readout hold-glow together `[LIVE]`. Wheel withdraws; ω holds at 3.30. One-shot-hold. Bridge clause (prerequisite patch): "exactly like a car speeding up steadily — v = u + at, same equation, new letters" | **"Same equation, new letters"** | none | 40-55 | core |
| S5 | Slowing down is also α — with a negative sign | `translate-through` (declared contrast pair of S3 — the delta names the flip: drive in → α +0.60; brake in → α −0.50) | r 0.80 · ω₀ +1.50 · brake engages at 2.0 s | CAUSE — the **brake pad** translates in and touches the drum `[LIVE]`. EFFECT after the beat: ω falls in a straight line 1.50 → 0.00 over 3.0 s while the **α readout sits at −0.50** the whole way; the table stops and stays stopped (rest clamp, `:49933-49943`). One-shot-hold. Anchor sentence (§9, ~9 words, verbatim in this state's narration): **"like a ceiling fan after the switch is turned off."** Slider retry: dragging α re-runs the stop — a larger negative α stops it sooner | **"Slowing down: negative α"** | α slider, range [−0.60, −0.10] *(min_ring: core; drives the brake — K7 semantics)* | 35-55 | core |
| S6 | v = ωr — one shared ω, but each point's speed grows with its radius | `paired-tangent-ride` | r 0.80 · ω₀ +1.50 · no source | Two **radius lines** draw from the axle, distinctly labelled r = 0.40 m (to a paint mark on the rod) and r = 0.80 m (to the mass) — two radii, two labelled lines (scar `teach_distinct_reference_lines_for_two_radii`). Then two **tangent arrows** reveal and RIDE their points through one full shared revolution: the outer arrow exactly **twice** the inner (labels `v = 1.20 m/s`, `v = 0.60 m/s`), while both points stay on one straight rod line and finish the turn together. The axle centre carries a labelled **v = 0 dot** (never a floored arrow — K4). Formula surface `v = ωr`. Steady-continuous. Anchor sentence (§9, ~11 words, verbatim here): **"on a bicycle wheel, the rim moves faster than points near the hub."** Focal = the tangent-arrow PAIR as one grouped focal (both arrows are the relation; scar `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach`) | **"One ω, many speeds"** | none | 40-55 | core |
| S7 | θ = ω₀t + ½αt² — from rest, the angle grows as t² | `equal-time-ticks` (declared contrast pair of S2 — the delta names the flip: even spacing under constant ω → widening 1:3:5 under constant α) | r 0.80 · ω₀ 0 · drive engages at 2.0 s | Drive wheel engages (cause, familiar from S3); the table spins up from rest and ticks drop at 1, 2, 3 s — landing **0.30, then 0.90, then 1.50 rad apart: 1 : 3 : 5**, visibly widening around the rim, against the remembered even spacing of S2. θ readout confirms 0.30 → 1.20 → 2.70. Wheel withdraws; holds. One-shot-hold. Formula surface `θ = ω₀t + ½αt²` | **"Angle grows as t²"** | none | 35-55 | extended |
| S8 | ω = dθ/dt and α = dω/dt — rate IS slope | `slope-trace` | r 0.80 · ω₀ 0 · drive engages at 1.5 s | The **graph panel** (K6) shows empty θ-t and ω-t axes; the same spin-up replays (drive engages, 4.0 s) while a live dot **draws θ(t) as a curving-upward parabola** and a second dot draws ω(t) as a straight rising line — one state clock drives table, dots, and curves together (scar `teach_coordinate_sim_with_graph`). A **tangent-slope indicator** rides the θ curve, steepening as ω grows; narration: the slope of θ is ω; the slope of ω is α — that is all "d/dt" says. Calculus notation allowed here ONLY (38c). One-shot-hold; curves persist. **Fallback if K6 is descoped by Desk E:** this state is redesigned as an equation-build beside the replayed spin-up with a per-grid Δθ/Δt readout printing live and visibly equal to the ω readout — the concept survives with the advanced ring intact but weaker | **"Slope of θ is ω"** | none | 35-55 | advanced |
| S9 | Sandbox | `drag-sandbox` | r 0.80 · ω₀ +1.50 · α 0 | Free-running (Rule 37). Teacher sets **ω₀** (restart-seed, re-pin cue on change `[LIVE]`) and drags the **α slider** [−0.60, +0.60] — the applied drive acts live while the slider is nonzero; θ/ω/α readouts, the marker/arc, and the S6 tangent arrows all live. **Declared semantics:** a sustained negative α CAN take ω through zero and reverse the spin — that is real physics for a driven wheel (unlike the friction brake), the θ arc runs backwards, and the v arrows flip; declared intended, never clamped (K1 paragraph). Long-drive speeds are honest: v arrows clamp at the K4 map max with exact labels | **"Try it yourself"** | ALL: ω₀ *(core; slider min extended to 0 — office item)* · α drive *(core)* | 0 / open | *(explore)* |

**Archetype audit:** reveal-build (S1), equal-time-ticks ×2 (S2/S7 declared pair), translate-through ×2 (S3/S5 declared pair), converge-on-mark (S4), paired-tangent-ride (S6), slope-trace (S8), drag-sandbox (S9). No repeat outside the two declared pairs; no static state; every guided beat auto-plays on the state clock.

**Explore controls — ring-gated (scar `explore_controls_not_ring_gated_survive_the_ring_cut`):** both S9 controls (ω₀, α) are core-ring, taught by S2-S5 — they survive BOTH preset cuts ✓. The S9 formula surface `ω = ω₀ + αt` is stated and performed by S4 (core), surviving every preset (scar `explore_state_formula_surface_asserts_a_relation_no_state_derives` ✓).

**Readout metrics (scar `derived_readout_asserted_by_value_without_defining_its_metric`):** `θ` = `rbrThetaAt(tMs)` — the engine's own fixed-16 ms-grid integral of ω, already computed and published as `PM_rbrTheta` (`:49952-49966`, `:50232`); displays the accumulated value (beyond 2π), 2 dp; the arc draws θ mod 2π. `ω` = L/I as today (`:49945-49948`). `α` (new, K2) = τ_signed_eff(t)/I(t) — the signed engaged source torque over the live I, published from the SAME post-step snapshot as ω and θ (`:50220-50232` pattern; scar `derived_energy_sum_pairs_prestep_position_with_poststep_velocity`); reads 0.00 when no source is engaged. `v` labels (S6) = ω·r_point from the same snapshot. All values closed-form and noise-free — the taught deltas (0.60 rad/s² steps, 2:1 arrow ratio) dwarf display resolution (scar `taught_delta_smaller_than_the_instruments_own_live_noise` ✓). Every taught variable has a geometric correlate, never digits alone: θ = the arc + marker; ω = the visible spin rate + tick spacing; α = the actuator + the steady climb; v = arrow length (scar `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` ✓).

**Rule 33 macro↔micro:** N/A-with-justification — θ, ω, α ARE the visible motion of the macro apparatus itself; there is no hidden micro mechanism. Instruments per 33d: value-only HUD, live 2-dp numbers.

**Rule 34 canvas budget:** top caption = the ≤5-word delta cue only. ONE formula surface per state (Cambria-Math surface `[LIVE]` `:50570-50574`): S1 none · S2 `ω = θ / t` · S3 `α = Δω / Δt` · S4 `ω = ω₀ + αt` · S5 `ω = ω₀ + αt  (α < 0)` · S6 `v = ωr` · S7 `θ = ω₀t + ½αt²` · S8 `ω = dθ/dt · α = dω/dt` · S9 `ω = ω₀ + αt`. All math real Unicode (θ ω α ω₀ ½ π ² Δ). Algebra only outside S8 (38c — Δ-notation is NCERT pre-calculus; d/dt confined to the advanced ring). All surfaces symbolic; numerals live only in the HUD, the chip, and the tick labels.

**Pin-margin discipline (margins in ms; pin = clamp(0.60·R, 150, R−150); the budgeted instant is the COMPLETION of the last asserted reveal, per scar `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it`):**

| State | Last asserted reveal completes (design est.) | State duration R (min) | Pin at 0.60R | Margin |
|---|---|---|---|---|
| S1 | full turn + 2π sentence ≈ 5.5 s | ≥ 10 s | 6.0 s | 500 ms ✓ |
| S2 | 4th tick 4.0 s + ω reveal ≈ 5.0 s | ≥ 10 s | 6.0 s | 1000 ms ✓ |
| S3 | drive 2.0 + run 4.0 = 6.0 s (holds) | ≥ 11 s | 6.6 s | 600 ms ✓ |
| S4 | chip ≈ 3.0 s; engage 3.5 + 3.0 = 6.5 s → match cue | ≥ 12 s | 7.2 s | 700 ms ✓ |
| S5 | engage 2.0 + stop 3.0 = 5.0 s (rest clamp fires within one 16 ms step of 5.0 s — computed at grid, scar `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows`) | ≥ 10 s | 6.0 s | ~980 ms ✓ |
| S6 | arrows ≈ 2.5 s + one shared turn 4.19 s ≈ 6.7 s | ≥ 12 s | 7.2 s | 500 ms ✓ |
| S7 | 3rd tick lands 5.0 s (engage 2.0 + 3.0) | ≥ 10 s | 6.0 s | 1000 ms ✓ |
| S8 | curves complete 1.5 + 4.0 = 5.5 s (persist) | ≥ 10 s | 6.0 s | 500 ms ✓ |

All margins ≥ 167 ms ✓. One-shot-hold states hold their end configuration from end time to R, so the pin photographs the held claim by construction. THE EYE must read DENSE frames across the S3/S4/S5/S7/S8 drive windows, not only frozen frames (scar `teach_read_dense_ramp_frames_not_just_frozen`).

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots)

| Wrong belief | At | `misconception_watch` beat |
|---|---|---|
| "When the switch goes off, the story is over — while it slows there is no acceleration" | **S5** | belief: slowing is just 'stopping', not acceleration · visual_counter: the α readout sits at **−0.50** for the entire slow-down while ω falls in a straight line through 1.00, 0.50, to 0.00 — the fan keeps turning long after the switch, at a steadily falling rate · one_line_fix: slowing down IS angular acceleration, with a negative sign |
| "Every point of a spinning body moves at the same speed" | **S6** | belief: one body, one speed · visual_counter: both marked points stay on ONE straight rod line and finish the revolution together (one shared ω) — while the outer tangent arrow is exactly twice the inner (1.20 vs 0.60 m/s) · one_line_fix: one turning rate ω for the whole body, but each point's speed is v = ωr |
| | | Named primitives for each wrong picture (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`): S5 needs the α readout row (**K2**) + the brake pad `[LIVE]`; S6 needs the two radius lines + paired tangent arrows + v labels (**K4**) |

S1-S4, S7-S9 carry NO misconception_watch (founder guardrail 2026-07-04). Both watches are straightforward contrast beats — the correct physics runs continuously; no wrong-physics sub-beat is ever rendered, so any pin instant photographs correct physics (scar `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` discharged: no sequential wrong-picture half exists). EPIC-C branches: **zero**.

## 5. `has_prebuilt_deep_dive` states (2)

**S4** (the equation-use skill — where exam work concentrates, and where rad-vs-rev unit confusions surface) and **S6** (v vs ω conflation — the most documented rotational-kinematics confusion). V1.0 ships zero authored deep-dives (Rule 18); the flag marks investment priority.

## 6. Drill-down clusters

**S4:** `radians_vs_revolutions` (θ in rad vs turns; the 2π conversion) · `sign_of_alpha` (speeding vs slowing; deceleration as negative α) · `linear_angular_mapping` (x↔θ, v↔ω, a↔α — which linear equation becomes which).
**S6:** `same_omega_different_v` (one turning rate, radius-dependent speed) · `which_r_in_v_omega_r` (r is the point's distance from the AXIS, not the body's size) · `omega_vs_v_confusion` (rad/s vs m/s — units untangle the two).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:    STATE_1 → STATE_5   # θ, ω, α, the equation, negative α — the exam core
  v_and_omega:     STATE_6             # "how are v and ω related" routes straight to v = ωr
  angle_equation:  STATE_7             # θ = ω₀t + ½αt² questions
  calculus_graphs: STATE_8
```

Default `foundational`. PRIMARY aha (S4) inside the foundational range ✓ — the silent student meets the same-equation aha and the negative-α confrontation on the default slice.

## 8. Prerequisites (advisory — Rule 23)

- `rigid_body_rotation` (#3, in-chapter, precedes in the approved order — will exist at 0d): every point traces a circle; outer points travel farther in the same time. This concept quantifies that picture.
- Linear kinematics (v = u + at; Class 11 straight-line motion): **no new-architecture concept id exists** (the ~60 legacy kinematics JSONs are old architecture, not product) — advisory prose note only, patched inside S4 (Block 1).

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral)

**Primary: a ceiling fan after the switch is turned off — it keeps turning and slows at a steady rate.** Assigned to **S5**, ~9 words; draft sentence quoted verbatim in the S5 row and required verbatim in the S5 narration draft (scar `skeleton_anchor_specified_in_section_9_reaches_no_narration_line`): *"like a ceiling fan after the switch is turned off."* A ceiling fan is a widest-overlap household device (38f), recognisable in any country, and physically exact: near-uniform angular deceleration to rest.
**Secondary: a bicycle wheel — the rim moves faster than points near the hub.** Assigned to **S6**, ~11 words; draft sentence, verbatim in the S6 narration draft: *"on a bicycle wheel, the rim moves faster than points near the hub."* Physically exact v = ωr, universal.
No region constants, no brands, no places. The India-specific catalog anchors (Vande Bharat, cricket spin) are NOT imported (survey Rule-35 table).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 9 of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger (I, L, KE, τ are NEVER printed anywhere in this concept):**

| Quantity / element | Label | DEFINED at | First PRINTED at | ✓ |
|---|---|---|---|---|
| Angle turned | `θ` (arc + HUD `6.28 rad`) | S1 sentence 1-2 | S1, after it | ✓ |
| Radian / start line / rim marker | start-line label; marker | S1 ("measured from this start line") | S1 | ✓ |
| Time | `t` (in formula surfaces) | S2 | S2 | ✓ |
| Angular speed | `ω` (HUD `1.50 rad/s`) | S2, after the ticks | S2 | ✓ |
| Equal-time ticks | tick marks on the rim path | S2 ("a mark every second") | S2 (reused S7) | ✓ |
| Angular acceleration | `α` (HUD `0.60 rad/s²`) | S3, as the climb is seen | S3 | ✓ |
| Motor drive wheel | plain visual (no symbol) | S3 ("a motor wheel presses the drum") | S3 | ✓ |
| Initial angular speed | `ω₀` | S4, one clause | S4 | ✓ |
| Prediction chip | `predicted ω = 3.30` | S4, the prediction sentence | S4 | ✓ |
| Brake pad | plain visual (no symbol) | S5 ("a brake pad presses the drum") | S5 | ✓ |
| Point radius | `r` (two labelled radius lines) | S6, first sentence | S6 — never earlier | ✓ |
| Linear speed of a point | `v` (tangent arrows + `1.20 m/s`) | S6 | S6 | ✓ |
| Graph axes θ-t, ω-t | axis labels (Unicode) | S8 | S8 only | ✓ |

json_author note: every glow target names a primitive the state builds (glow-target set ⊆ built ids; focal on physics primitives, never titles).

**(c) Right-hand-rule plan: N/A-with-justification.** This concept teaches θ, ω, α as signed scalar rates; ω as a VECTOR along the axis (grip rule) is the payload of `angular_momentum` (#9) and is deliberately not pre-spoiled. No hand primitive is consumed.

**(d) Motion plan:** S1 steady spin + reference build (line → marker → arc → readout, sentence-synced) · S2 steady spin + four even ticks + ω reveal · S3 wheel translate-in (cause) → 0.7 s beat → steady climb from rest, held · S4 chip prints → wheel engages → readout sweeps to meet chip, match cue, held · S5 pad translate-in → straight-line fall to rest, α pinned negative, held at rest · S6 radius lines → paired tangent arrows ride one shared revolution, 2:1 · S7 wheel engages → ticks land 1:3:5, widening, held · S8 spin-up replay + live parabola/line drawing + riding slope indicator, curves persist · S9 free-running sandbox, live sliders. No passive state; every stated agent (wheel, pad) is a rendered object; every stated number is produced by the §3 metrics.

**(e) Modes:** conceptual-only (Rule 20 [D]); no `mode_overrides`.

**(f)** `assessment` + `coverage_map` authored at 0d; `misconception_watch` exactly the 2 of §4.

**(g) Macro↔micro:** N/A-with-justification per §3.

**(h) Canvas budget:** per §3. New DOM panels at `top:52px+` both edges (scars `field3d_sliders_panel_top12_vs_fsbtn_top10`, `cyclotron_timers_sliders_fullscreen_button_corner_collision`); caption / HUD / formula / graph / slider zones distinct so nothing clips (`caption_clipped_by_adjacent_stat_box`, `nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud` — the K6 graph gets its OWN reserved zone; the HUD is 3 rows max).

**(i) Curriculum-flex (Rule 38):**
- **(i-1) Preset-cut coherence:** *Hide advanced (drop S8):* S1-S7 + S9 coherent; no surviving state references d/dt or the graph. *Hide advanced+extended (drop S7-S8):* S1-S6 + S9 coherent; nothing surviving references t², 1:3:5, or calculus; S9's controls (ω₀, α) map to surviving states S2-S5 ✓.
- **(i-2)** Explore = core content only: surface `ω = ω₀ + αt`, stated and performed by S4, surviving every preset ✓.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT — covered, marked verified (angular kinematic variables + equations are core NCERT Ch.7). JEE Main core+extended+advanced · NEET core+extended · IB DP / A-level / AP Physics 1 and C — every non-CBSE cell `needs_teacher_verification: true`.
- **(i-4) Presets (hide, never reorder):** `full` = S1-S9 · `no_calculus` = hide S8 · `core_only` = hide S7-S8. Controls auto-survive (both core).
- **(i-5) Graph axes (S8):** t on the horizontal axis, θ and ω on the vertical — the universal convention for motion-time graphs across every surveyed board; no genuine conflict exists, so NO axis-swap toggle (decided, not deferred). Graph title/caption z-order named as a K6 build obligation (scar `graph_title_caption_zorder_overlap`).

**Teacher-usability walk (scar `directive_no_gate_asks_whether_a_teacher_could_use_it`):** (1) *Does anything state the law and show it in the assessed representation?* Yes — S4 states ω = ω₀ + αt AND performs the exam's exact skill (compute the prediction, watch it verified); S7 adds the second equation; S8 formalizes. (2) *First thing a teacher tries after the aha?* "What if it slows instead?" — S5's beat + its α slider over [−0.60, −0.10]; then free play with both signs in S9 over the full declared ranges. (3) *Definition precedes use?* Yes — ledger §10(b); τ/I/L/KE never appear.

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `rigid_body_rotation` → **S1**: a student who missed it may not accept that every point turns through the same angle; patch = one S1 sentence, "the table turns as one piece — every point turns through the same angle together" (no condescension: it doubles as the setup for θ being a single number). Linear kinematics → **S4**: the aha assumes v = u + at is familiar; patch = the one bridge clause already in the S4 row ("exactly like a car speeding up steadily — v = u + at"), naming the IDEA only, no off-screen apparatus (scar `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen`).

**JEE-backwards trace.** *"A fan rotating at 3.00 rad/s is switched off and comes to rest in 6.0 s under uniform angular deceleration. Find (i) α, (ii) the number of revolutions before it stops, (iii) the speed of a blade tip at r = 0.60 m at the instant of switch-off."* (i) α = −ω₀/t via ω = ω₀ + αt → S3 (α defined) + S4 (equation) + S5 (negative sign). (ii) θ = ω₀t + ½αt², then rev = θ/2π → S7 (equation) + S1 (2π rad = one turn). (iii) v = ωr → S6. No missing piece. Note: item (ii) needs the extended ring — under the `core_only` preset that item is out of scope by design (recorded in i-3).

**Misconception entry mapping.** Both confronted proactively per §4. Planting risk 1: S1-S5 must say "turning rate", never "speed", for ω — so S6 breaks a belief the narration never endorsed. Planting risk 2: S3's "the motor makes it speed up" must not become "α needs a motor" — S5 immediately shows α from a brake, and S3's narration says "whatever changes the spin, the RATE of change is α".

## Block 2 — Aha-moment designation

- **PRIMARY aha, at S4:** *rotation needs no new mathematics — ω = ω₀ + αt IS v = u + at with new letters, and the readout lands exactly on the number the old equation predicted.*
- **SUPPORTING aha, at S6:** *one ω, many speeds — the whole body shares a single turning rate, yet every point has its own speed, tied by v = ωr.* Total = 2.
- **Cohesion check:** the v = ωr law of S6 is precisely the physical bridge that makes the linear↔angular identification of S4 more than notation — each point's linear motion literally obeys the linear equations at its own radius. The supporting aha serves the primary ✓.
- **Wrong-belief setup.** Primary: S1-S3 introduce three unfamiliar Greek-lettered quantities in a row, deliberately building "this is a new subject with its own strange rules" — S4 breaks it with the old equation predicting the new machine. Supporting: S1-S2 speak of THE turning rate (one number describes the whole body), building "one number, one motion" — S6 keeps the ω half and breaks the speed half.
- **Foundational coverage:** S4 ∈ foundational (S1-S5) ✓.

---

## ENGINE REQUIREMENTS (for Desk E, build 0c-3) — the authoritative gap statement

**Gap classes: PHYSICS (the engine cannot compute/produce it) · DISPLAY (computed but cannot be shown) · VOCABULARY (no rendering path for the picture) · CONTROL (no authorable knob). Ranked. Every field added is OPTIONAL with absence reproducing today's behavior byte-identically (scar `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause`); regression pair after 0c-3: `conservation_of_angular_momentum` (rbr path) + this desk's samples `normal_force`, `inductance` — EYE runs must show no pixel regression.**

1. **K1 `[NEEDS-0c-3 · PHYSICS · structural but cheap — rank 1, nothing works without it]` Signed applied torque (spin-up).** Verified today: the single closed-form integrator `rbrLAt` computes `mag = |L0| − tau·engaged_seconds`, clamped at 0 (`field_3d_renderer.ts:49933-49943`), and the `applied_torque` source takes `Math.abs(...)` (`:50532`) — **every source can only REDUCE |L|; no torque can spin the body up; from rest (ω₀ = 0) the body never moves at all.** Required: the `applied_torque` source accepts a SIGNED `applied_torque_Nm`, closed form `L(t) = L_anchor + τ_signed·engaged_seconds(t)` — still accumulator-free, still a pure function of state-local t (preserves `:969-976` and the dt-fold property). **CANONICAL SEMANTICS PARAGRAPH (the sibling `tau_eq_i_alpha` skeleton must QUOTE this verbatim, never restate — scar `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`):** *"The `brake` source is frictional: it opposes the existing sign of ω, carries the rest clamp on L, and can never reverse the spin. The `applied_torque` source is a signed driven torque: `L(t) = L_anchor + τ_signed·engaged_seconds(t)` with NO rest clamp — a sustained opposing applied torque legitimately carries L through zero and reverses the spin (θ then decreases; sign-carrying displays follow). Engagement timing for BOTH sources rides the existing `engage_at_ms` / `release_at_ms` / `engage_cue` / `release_cue` / `pad_travel_ms` surface (`:1002-1006`, read for the applied source at `:50533`)."* Legal-zero check (scar `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness`): `rbrNum` resolves by `typeof` (`:49828`) ✓ — bring-up probes: author `omega0_rad_s: 0` and assert entry ω is 0.00, not the 1.50 default; author τ_signed = +1.84 from rest for 4.0 s and assert ω = 2.40 within 1e-9. No GUIDED state of this concept crosses zero; the S9 sandbox reversal is emergent, declared physics. Fail-without: S3, S4, S7, S8, S9.
2. **K2 `[NEEDS-0c-3 · DISPLAY · cheap — rank 2, the concept's named quantities]` θ and α readout rows.** Verified today: `RBR_RO_META` (`:50147-50154`) implements exactly six rows `I · omega · L · KE · dLdt · F_pull` — **no `theta`, no `alpha`** — and `rbrRebuildReadout` (`:50162-50163`) plus `rbrWriteReadouts` (`:50236-50237`) do `if (!meta) continue`, so an unknown token is skipped in TOTAL SILENCE (a JSON naming `"theta"` passes Zod, validates, renders, and could be sealed with θ never on screen). θ is already computed and published (`rbrThetaAt` `:49952-49966`; `PM_rbrTheta` `:50232`) — a pure display gap. Required: add `theta: { label: "θ", unit: " rad", dp: 2 }` and `alpha: { label: "α", unit: " rad/s²", dp: 2 }` to `RBR_RO_META`, to the `readouts` doc-enum (`:1043`), and to the same one-post-step-snapshot publish (`:50220-50232`). **α metric (defined):** α(t) = τ_signed_eff(t)/I(t) while a source is engaged, else 0.00 — same snapshot as ω and θ. **Enum hygiene (scar `deferred_enum_members_must_be_declared_not_merely_unimplemented`):** `reference_marks[].surface` (`:1023`) is NOT extended — `'theta'`/`'alpha'` mark surfaces are declared out-of-scope for 0c-3 (no state needs them; the only chip used rides the existing `'omega'` surface). Fail-without: every state (θ); S3-S5, S8, S9 (α); and the desk-state silent-seal trap stays live.
3. **K3 `[NEEDS-0c-3 · DISPLAY · cheap — rank 3, makes θ readable in principle]` Angular reference set: start line + rim marker + θ arc.** Verified today: **no angular reference of any kind exists on screen** — no start line, no body-fixed mark, no arc — so a rotation angle is currently unreadable even in principle. And `theta0_rad` is **wired but unobservable** (read at `:50499` into `eng.theta0`, seeding `rbrThetaAt` via `rbrThetaReset` `:49967-49971` — the desk-state file's "declared but inert" is imprecise and is corrected here): rotating the start pose produces no readable difference, and the symmetric two-mass rod is π-symmetric, so θ₀ and θ₀+π are visually identical. Required: (a) a space-fixed **start line** on the pad plane; (b) a **body-fixed rim marker** (breaks the π-symmetry); (c) a **θ arc** from line to marker drawing θ mod 2π (the readout carries the full accumulated value). This is exactly what `theta0_rad` needs in order to mean something: the entry re-pose places the marker at θ₀ from the start line. This concept authors `theta0_rad: 0` everywhere. All three register in the exact-token element gate (`:50581+`). Fail-without: S1, S2, S7 (and every θ claim).
4. **K4 `[NEEDS-0c-3 · VOCABULARY · small — rank 4, the stated payload]` Tangential velocity arrows at marked points.** Verified today: `show_pull_arrows` draws the radial arrow only; **no tangential velocity arrow and no per-point marker exists — v = ωr has no rendering path.** Required config shape: `point_markers: [{ id, r_m, show_v_arrow, show_radius_line, show_circle_trace }]` — a paint-mark at an authorable radius on the rod plus the mass point; tangent arrows ride the rotation with length ∝ ω·r_m on **their OWN magnitude-to-length map** (scar `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero`, remedy adopted verbatim): the smallest authored nonzero v (0.60 m/s) clears the floor with margin; map sized for v up to ~3.5 m/s, clamped above with EXACT labels; **exact-zero renders as a labelled dot at the axle, never a stub or floored arrow**. Ratio probe: rendered length ratio = speed ratio within 10% for every pair. Labels decollided/kerned (scars `field3d_label_sprite_overlap`, `radius_scenario_F_r_label_kerning_collision`, hysteretic decollision). Optional `show_circle_trace` is shared machinery with concept #3's per-point circular traces (survey 0c-1 row 3) — build once. Fail-without: S6 (and S9's arrows).
5. **K5 `[NEEDS-0c-3 · DISPLAY · small — rank 5]` Equal-time rim ticks.** Config shape: `time_ticks: { every_ms, count }` — at each k·every_ms a persistent tick lands on the rim path at the marker's position. Positions are CLOSED-FORM: derived from `rbrThetaAt(k·every_ms)` — re-derivable under a time pin, no accumulator (preserves `:969-976`; a rewind reproduces the tick set exactly; scar `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls`: the rebuild-from-zero branch `:49958` and `rbrThetaReset` `:49967-49971` are the terminating lines of the trace). Ticks register in the exact-token gate. Consumed: S2 (even) + S7 (1:3:5). Fail-without: the S2/S7 archetype.
6. **K6 `[NEEDS-0c-3 · DISPLAY · moderate — rank 6, the ONE declared descope candidate]` θ(t)/ω(t) graph panel.** **SURVEY CORRECTION (the dispatching session should note this against `phase0_survey.md` row #4):** the survey's claim *"θ(t)/ω(t) graph panel already exists in field_3d"* is **FALSE for rbr** — verified this session: no graph token appears anywhere in the rbr config contract (`:977-1059`) or the rbr implementation region (`:49700-50700` swept); the graphs of other scenarios are scenario-local canvas code, not a shared surface. Required: a compact 2-curve panel (θ-t parabola, ω-t line) in its OWN reserved overlay zone, driven by the SAME state clock as the 3D scene (scar `teach_coordinate_sim_with_graph`: one live parameter moves both together), with a live dot per curve + a tangent-slope indicator on the θ curve; axes labelled in Unicode; title/caption z-order explicitly stacked (scar `graph_title_caption_zorder_overlap` — this row IS that scar's remedy); redrawn from closed forms each frame (time-pin safe). **If Desk E descopes K6:** S8's declared fallback (its §3 row) keeps the advanced ring alive without a graph. Fail-without: S8 as designed (the concept survives via the fallback; the derivative-as-slope picture is lost).
7. **K7 `[NEEDS-0c-3 · CONTROL · small — rank 7]` `alpha` control token + slider row.** Verified today: `controls_visible` is the closed set `'r'|'m'|'omega0'|'tau_brake'|'spin_dir'` (`:1051`, spec `:49995-50003`) — **the explore state cannot expose this concept's taught variable.** Required: token `alpha` with slider row (glyph `α`, unit ` rad/s²`, dp 2, range [−0.60, +0.60], step 0.05, default 0), per-state range override for S5's [−0.60, −0.10]. Semantics: the slider drives the SIGNED applied source live, τ_signed = I(t_entry)·α_slider (r and m are hidden in every state of this concept, so I is constant 3.06 and the α promise is exact); drag re-anchors via the existing trusted-drag/event-anchor pattern (`:49911-49925`); in S5 (brake source) the α row writes `tau_brake = 3.06·|α|` and displays the negative sign — stated here once, quoted by the sibling. Thumb + numeric label in lockstep (`:50563` pattern). The `tau_brake` N·m row and `spin_dir` are NOT exposed anywhere in this concept (τ untaught — Rule 25; direction-as-vector untaught — deferred to #9).
8. **K8 `[NEEDS-0c-3 · DISPLAY · small — rank 8]` Visible motor drive wheel (the spin-up cause).** A drive wheel that translates in to contact the drum — mirror of the brake pad translate-in (reuse the pad travel machinery; the engage/release timing surface already reads for the applied source at `:50533` — `[LIVE timing, NEEDS mesh]`) — visibly TURNING while engaged (cause before effect, Rule 32a), withdrawing on release. Built once at scene build; per-state visibility only (scar `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently`); registers in the exact-token gate. This mesh is the whole Rule-25 answer: a motor wheel is narratable in plain kinematic words. Fail-without: S3, S4, S7, S8 have no rendered cause (scar `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain`).
9. **K9 `[LIVE]` — existing rows this concept consumes (verified at file:line):** brake pad + drum + drawn drum line (`:50518-50527`) · `reference_marks` chip form on the `omega` surface with match cue + co-hold-glow (`:1021-1030`, `:50164-50176`; surface enum includes `'omega'` ✓) with per-frame churn-guarded re-measure for mid-state chips (S4) · `readout_at_ms` per-row reveal (`:1047`, `:50234+`) · `hold_glow` instrument channel (`:50206-50219`) · the ONE Cambria-Math formula surface (`:50570-50574`) · re-pin cue with readout blanking (`:49896-49903`) and restart-on-seed-change (`:50544-50550`) · accumulator-free state clock + time-pin exactness (`:969-976`) · slider row slots with visibility-hidden reservation (`:49988-49995`) · `glow_focal`/`phases` (`:1053-1058`) · exact-token `visible_elements` gate (`:50581-50587`) · fresh engine-record rebuild on entry (`:50490+`, fresh object literal — scar `field3d_integrating_scenario_state_entry_must_rebuild_the_whole_engine_record` satisfied by construction; rbr poses from closed forms anyway).
10. **K10 `[NEEDS-0c-3 · co-edit]` `deriveStateMeta.ts` in the SAME change:** every new timed key (K5 tick instants, K4 arrow reveals, K6 graph window) registered across the three sites (`F3D_REVEAL_KEYS` · reveal-ms in `maxRevealForField3dState` · hold classification in `deriveHoldExpectations`); steady-spin states classified so the always-turning apparatus never reads as a frozen tail (scar `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl`); **plus** the rbr declaration in `deriveMotionExpectations` verified — if 0c-1 left rbr undeclared, THE EYE's D5/D6 motion gates are silently hollow for this whole chapter (scar `galvanometer_family_motion_expectation_undeclared`); Desk E confirms and declares.

### Apparatus-contract items for the office (contract §4 — requested, never taken unilaterally)

1. **Per-state entry ω₀ ≠ 1.50 (S3/S7/S8 enter at ω₀ = 0).** S1 opens at the pinned home pose exactly; precedent: the sibling's S6 authors ω₀ = −1.50. Request: confirm the contract pins the CONCEPT-OPENING pose only.
2. **`omega0` slider min 0.5 → 0** (`RBR_SLIDER_SPEC` `:49999` is global to the shared apparatus). S9 wants from-rest starts; `tau_eq_i_alpha` will want the same. Chapter-wide decision.
3. **Readout subset:** this concept's HUD shows ONLY θ/ω/α (Rule 25 — I/L/KE untaught at #4). The fixed HUD-order clause of the contract is satisfied on the subset (declared order: θ · ω · α, matching the RBR_RO_META extension order).

### Scriptability walk (scar `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable`; every authored ms classified per scars `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant`, `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static`)

| State | Animated knob / timed item | Cue surface | Class |
|---|---|---|---|
| S1 | start line / marker / arc / θ-row reveals | `readout_at_ms` `[LIVE]` + K3 reveal cues (named build fields) | reveal window |
| S2 | tick drops at 1-4 s; ω-row reveal | K5 `time_ticks` (bought field) + `readout_at_ms` `[LIVE]` | bought field / reveal |
| S3, S4, S7, S8 | drive engage/release; pad travel | `engage_at_ms`/`release_at_ms`/`pad_travel_ms` `[LIVE :1002-1006, :50533]` | physics event |
| S4 | chip print + match cue | `reference_marks.at_ms` + match `[LIVE]` | reveal / physics event |
| S5 | brake engage; rest-clamp instant | `engage_at_ms` `[LIVE]`; clamp = closed-form event | physics event |
| S6 | radius lines + arrow reveals | K4 reveal fields (named) | reveal window |
| S8 | graph draw window | K6 (bought field; state clock) | bought field |

No authored millisecond falls outside these classes; no overlay is scheduled on a surface without a time input.

**Per-state × engine-row WALK (both directions):**

| State | Consumes |
|---|---|
| S1 | K2 (θ row), K3, K9 (clock, readout_at_ms, glow), K10 |
| S2 | K2 (θ, ω), K3, K5 (even), K9 (formula, readout_at_ms), K10 |
| S3 | K1, K2 (ω, α), K8, K9 (cues, HUD), K10 |
| S4 | K1, K2, K8, K9 (chip + match cue, formula), K10 |
| S5 | K2 (ω, α), K7 (restricted range), K9 (brake `[LIVE]`, formula), K10 |
| S6 | K2 (ω), K4, K9 (formula, grouped-pair focal), K10 |
| S7 | K1, K2 (θ, ω, α), K5 (1:3:5), K8, K9, K10 |
| S8 | K1, K2, K6, K8, K9, K10 |
| S9 | K1, K2, K3, K4 (arrows live), K7 (full ranges), K9 (re-pin, sliders, Rule 37), K10 |

Reverse: K1 → S3/S4/S7/S8/S9 ✓ · K2 → all ✓ · K3 → S1/S2/S9 ✓ · K4 → S6/S9 ✓ · K5 → S2/S7 ✓ · K6 → S8 ✓ · K7 → S5/S9 ✓ · K8 → S3/S4/S7/S8 ✓ · K9/K10 → all ✓. Every K-row claimed by ≥1 state; every state claims ≥1 row; every primitive named in §3 maps to a K-row (scars `phase0_union_table_asserted_not_walked_state_by_state`, `signed_engine_union_drops_items_its_own_state_table_still_consumes`, `named_primitive_declared_without_the_surface_that_can_render_it` ✓).

**Explicitly NOT required:** any `param_ramp` use · radial mass motion · `r`/`m`/`tau_brake`/`spin_dir` control rows · I/L/KE/F_pull readouts · `reference_marks` surfaces beyond `'omega'` · the grip hand (`show_grip_hand` unused) · energy bars · a human/fan/bicycle mesh (anchors are narration-only) · through-zero choreography in any GUIDED state (the S9 reversal is emergent, declared in K1) · precession, vectors, cross products.

---

## SCAR AUDIT

**Queries run (2026-08-04, LIVE table via Bash):** `--owner alex:architect` · `--row-type directive` · `--field3d --open` · `rotational_kinematics` (0 rows, expected — concept not yet authored). `bug_class` strings extracted by script (`grep -E "^●" | sed | sort -u`) → **157 unique rows**, each dispositioned VERBATIM below. Not queried: anything beyond these four commands; rows outside this union are not dispositioned here.

**Verdicts: B = binds this design (with how) · B-sat = binds and satisfied in this document · 0c-3 = binds the Desk-E build (carried into the K-rows) · 0d = binds json_author / registration / EYE sessions later · N/A = with reason.**

| # | bug_class (verbatim) | Verdict |
|---|---|---|
| 1 | `archetype_live_tier_unverified_against_renderer` | B-sat — every [LIVE] cites file:line verified this session; [NEEDS-0c-3] obligations transfer to K-row probes |
| 2 | `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range` | N/A — no multi-force free-body state; the only multi-arrow compare is velocity, on its OWN map (K4) |
| 3 | `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | B-sat — every limit claim quotes BOTH the config-contract line and the reader-function line (K1 `:50532`+`:49933`; K2 `:50147`+`:50162`/`:50236`; K7 `:1051`+`:49995`; rbrNum `:49828`) |
| 4 | `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on` | B-sat — the S4 chip reuse diffed four ways: enum member `'omega'` ✓ (`:1023`), render target = readout-row DOM (`:50164-50176`), capacity = one mark, presence switches on nothing beyond the chip span. K5 ticks are a NEW build, not a reuse |
| 5 | `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | B-sat — `--field3d --open` included; the OPEN rbr-scenario rows (filed under conservation_of_angular_momentum) are rows 6, 7, 121, each dispositioned |
| 6 | `authored_beat_ends_by_undoing_the_state_own_claim` | B — §3 termination contract: steady-continuous (S1/S2/S6) vs one-shot-hold (S3-S5/S7/S8) declared per state; no ramp, so entry-equals-from is N/A; the probe transfers to the engagement window |
| 7 | `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` | B-sat — no new lumped constant; geometry inherited from the checked contract; internal τ values (1.84, 1.53 N·m) sit inside the plausible [0, 2.0] range for the drawn pad/drum |
| 8 | `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` | 0d — json_author: per state use either state-level focal or sentence glows knowingly, never both blindly |
| 9 | `biot_single_element_states_static_pose` | N/A — biot precedent; no static pose here (every state's apparatus turns) |
| 10 | `biot_state6_dotcross_lesson_not_rendered` | N/A — biot-specific |
| 11 | `biot_state8_db_arrow_not_scaled_by_contribution` | B-adopted — K4 arrows scale exactly ∝ ωr with a ratio probe |
| 12 | `CACHE_UPSERT_CONFLICT_TARGET_MISSING` | 0d — serving/cache path |
| 13 | `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` | B-sat — ONE home framing for all nine states, no camera solve anywhere; the K6 panel is a DOM zone, not a camera move |
| 14 | `caption_clipped_by_adjacent_stat_box` | B — DoD (h): caption/HUD/formula/graph/slider zones distinct |
| 15 | `capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin` | 0d — EYE harness row |
| 16 | `chemistry_concept_id_collides_with_rostered_physics_id` | B-sat — namespace check in header (both trees, zero hits) |
| 17 | `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius` | N/A — no translating run; fixed apparatus footprint framed whole in every state |
| 18 | `closed_enum_cannot_name_a_substance_the_design_teaches` | B — exactly this concept's trap; discharged by K2/K7 naming the enum additions explicitly as 0c-3 scope |
| 19 | `concept_ships_zero_narration_glow_bindings` | 0d — physics_author authors per-sentence glow bindings |
| 20 | `concept_taught_its_own_quantity_without_the_canonical_picture` | B-sat — θ arc, tick-spacing ω, actuator-driven α, chip-verified ω = ω₀ + αt (the exam's use, performed), tangent-arrow v = ωr |
| 21 | `contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt` | N/A — engagement is an authored cue, not detection; the one discrete event (S5 rest) is computed at grid size (§3 pin table) |
| 22 | `contrast_ghost_coresident_with_the_real_set_fuses_both` | N/A — no ghosts; the two S6 markers are both real parts of one body |
| 23 | `cyclotron_timers_sliders_fullscreen_button_corner_collision` | B — `top:52px+` both edges (DoD h) |
| 24 | `deferred_enum_members_must_be_declared_not_merely_unimplemented` | B-sat — K2 declares the mark-surface members NOT added; K7 names the token added; existing declared-inert members untouched |
| 25 | `derivation_principle_applied_to_one_beat_but_not_its_sibling` | B — both declared pairs carry their principle in BOTH directions (S3/S5: actuator-translate + readable beat both ways; S2/S7: identical tick machinery both ways) |
| 26 | `derived_energy_sum_pairs_prestep_position_with_poststep_velocity` | B — K2: θ/ω/α/v published from ONE post-step snapshot (`:50220-50232` pattern) with a same-frame consistency probe |
| 27 | `derived_readout_asserted_by_value_without_defining_its_metric` | B-sat — §3 metrics block defines θ, ω, α, v exactly |
| 28 | `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` | 0c-3 — K10 three-site co-edit |
| 29 | `directive_no_gate_asks_whether_a_teacher_could_use_it` | B-sat — teacher-usability walk (§10) |
| 30 | `ecp_glow_targets_missing_primitives` | 0d — glow-target set ⊆ built ids (§10b note) |
| 31 | `energy_layer_two_body_groups_stack_vertically_so_a_bar_height_compare_is_not_side_by_side` | N/A — no energy layer, no bars |
| 32 | `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause` | B — every K-field optional, absence byte-identical; regression pair named (ENGINE REQUIREMENTS preamble) |
| 33 | `engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work` | 0c-3 — Desk-E ops discipline; this desk never touches the renderer |
| 34 | `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires` | N/A — constant-magnitude sources only, closed-form; no linear drag anywhere |
| 35 | `explore_controls_not_ring_gated_survive_the_ring_cut` | B-sat — both S9 controls core; both cuts walked (§3) |
| 36 | `explore_state_formula_surface_asserts_a_relation_no_state_derives` | B-sat — the S9 surface `ω = ω₀ + αt` is stated and performed by S4, survives every preset |
| 37 | `eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31` | 0d/EYE — noted: every guided state here moves continuously, so the hash check has real motion to find |
| 38 | `eye_h2_baseline_nondeterministic_electric_potential_meaning_state6` | N/A — another concept's harness record |
| 39 | `eye_h2_frozen_frames_of_moving_elements_wobble_sub_perceptually_so_zero_percent_is_not_a_valid_gate` | 0d/EYE harness |
| 40 | `eye_motion_map_reads_cached_physics_config_which_holds_only_epic_l_path` | 0d — EYE session |
| 41 | `field3d_arrow_label_sprite_renders_at_under_half_the_body_label_glyph_height` | 0c-3 — K4 label sizing named |
| 42 | `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently` | 0c-3 — K8: drive wheel built once, per-state visibility only |
| 43 | `field3d_dt_accumulated_motion_invisible_to_eye_timepin` | B-sat — rbr is accumulator-free (`:969-976`); every K-item specified closed-form (K5 ticks, K6 curves) |
| 44 | `field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` | 0c-3 fleet row — noted for K-item glows |
| 45 | `field3d_formula_overlay_generic_not_cambria_math` | B — the existing RBR_MATH_FONT surface is reused (`:50570`) |
| 46 | `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` | B-sat — rbr uses the exact-token registry (`:50581-50587`); every K-item element registers there (K3/K4/K5/K8) |
| 47 | `field3d_hanging_body_gravity_sign_inverted_vs_own_axis` | B-adopted — every closed-form checksum executed numerically (§2 ground truth: 2.40, 3.30, 3.00 s, 2:1, 1:3:5) |
| 48 | `field3d_hard_threshold_label_decollision_pops_when_the_pair_separates` | 0c-3 — K4 labels hysteretic |
| 49 | `field3d_integrating_scenario_state_entry_must_rebuild_the_whole_engine_record` | B-sat — rbr poses from closed forms and rebuilds a fresh engine literal on entry (`:50490+`) |
| 50 | `field3d_label_sprite_overlap` | 0c-3 — K3/K4 labels anchored + decollided |
| 51 | `field3d_measured_overlay_fit_runs_once_against_a_sibling_blanked_on_entry` | B — the S4 mid-state chip: per-frame churn-guarded re-measure (already the built chip pattern; K9) |
| 52 | `field3d_newtons_laws_body_surface_slab_cannot_be_hidden_for_a_both_hanging_atwood_state` | N/A — nlb apparatus flag |
| 53 | `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | N/A nlb — principle adopted in the K4 own map |
| 54 | `field3d_nlb_body_label_overlaps_the_pulley_mesh` | N/A — nlb |
| 55 | `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` | 0c-3 — K-item overlays checked against the slider-panel zone |
| 56 | `field3d_param_ramp_authoring_contract` | N/A-by-design — NO param_ramp authored anywhere; entry configs still stated per state (§3) |
| 57 | `field3d_particle_field_vestigial_dual_panel_config_gap` | 0d — registration (default_panel_count=1) |
| 58 | `field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump` | B-sat — rbr reserves hidden-row slots via visibility:hidden (`:49989-49991`); the new K7 row joins that pattern |
| 59 | `field3d_pinned_rewind_reproduces_the_instant_but_not_the_last_float_bit` | B-sat — closed forms throughout; K5 rewind trace cited |
| 60 | `field3d_release_widens_ground_plane_per_state_causing_unnarrated_apparatus_jump` | B — apparatus footprint fixed once for the concept; no per-state resizing |
| 61 | `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive` | B-sat — §4 names each watch's primitives (K2 α row + brake; K4 arrows + radius lines) |
| 62 | `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` | 0c-1 built rbr centred; the K6 panel is DOM, no camera dependency — noted for Desk E |
| 63 | `field3d_sliders_panel_top12_vs_fsbtn_top10` | B — `top:52px+` (DoD h) |
| 64 | `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` | 0d/EYE — probe design note |
| 65 | `force_rig_short_reveal_pin_below_catchup_threshold_keeps_prefreeze_jitter` | N/A — force_rig scenario |
| 66 | `force_rig_slider_panel_renders_full_height_when_one_row_visible` | N/A — rbr panel already per-row slotted |
| 67 | `frozen_frame_read_as_dense_series_continuation_on_translating_body` | 0d — EYE reading protocol for the always-turning apparatus |
| 68 | `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` | B-sat — neither watch renders a wrong-physics sub-beat; any pin instant photographs correct physics (§4) |
| 69 | `galvanometer_family_motion_expectation_undeclared` | 0c-3 — K10: Desk E verifies/declares rbr in deriveMotionExpectations |
| 70 | `ghost_compare_b_handoff_instant_snap` | N/A — no ghost handoff; restarts (S9 seed changes) use the built re-pin cue |
| 71 | `ghost_compare_cause_invisible_slider_frozen` | B — S5/S9 drags move thumb + numeric label in lockstep (`:50563` pattern) |
| 72 | `glow_focal_fr_ring_whiteouts_the_ring_and_occludes_it` | 0c-3 fleet glow row — noted for the K3 arc glow |
| 73 | `graph_title_caption_zorder_overlap` | B — carried INTO K6 as a named build obligation |
| 74 | `harness_source_grep_comment_strip_defeated_by_crlf_line_endings` | N/A — harness ops row |
| 75 | `hysteretic_state_cannot_be_latched_under_a_time_pin` | B-sat — engagement windows are closed-form piecewise; replayed, never latched |
| 76 | `lesson_never_states_the_principle_it_is_named_after` | B-sat — S4 states + performs the equation; S8 derives the calculus forms |
| 77 | `loop_dipole_couple_simultaneous_reveal` | N/A — dipole scenario |
| 78 | `loop_dipole_micro_claim_without_micro_visual` | N/A — Rule 33 N/A here |
| 79 | `magnetic_flux_loop_scenario_new_build` | N/A — precedent record |
| 80 | `mfl_loop_footprint_inverted_vs_theta` | N/A — mfl scenario |
| 81 | `named_primitive_declared_without_the_surface_that_can_render_it` | B-sat — the walk maps every named primitive to a K-row with its surface |
| 82 | `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` | B — every α has a rendered actuator (K8 wheel / LIVE pad); no off-screen agent is ever credited |
| 83 | `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` | 0d physics_author — the S4 bridge names the IDEA (a car speeding up steadily), never off-screen apparatus (Block 1) |
| 84 | `narration_timing_probe_uses_a_speech_model_the_shipped_player_does_not` | 0d/EYE harness |
| 85 | `nlb_angle_arc_radius_overruns_the_neighbouring_lane_body` | N/A — nlb lanes |
| 86 | `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` | N/A nlb — the rbr label channel is 0c-1's |
| 87 | `nlb_camera_rotated_body_label_bleed_through_slider_panel` | N/A — nlb |
| 88 | `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | N/A — no checkpoints |
| 89 | `nlb_coupled_sandbox_F_slider_exceeds_string_tautness_bound` | N/A nlb — the analog (S9 slider envelope) walked: sustained α at range max is honest fast spin; v arrows clamp with exact labels (K4) |
| 90 | `nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one` | N/A — single body; the S6 compare is two points of ONE rigid body |
| 91 | `nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud` | B — DoD (h): the K6 graph gets its own reserved zone; HUD is 3 rows max |
| 92 | `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` | N/A — nlb |
| 93 | `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger` | B — the exact analog is DECLARED intended in S9 (K1: a driven torque legitimately reverses; no work ledger exists here to unwind); guided states never cross zero |
| 94 | `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | B-sat — §3 pin table: ms margins ≥ 167 stated; the S5 discrete stop computed at grid size |
| 95 | `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones_so_sequential_phases_split_laterally` | N/A — no lanes, no multi-body |
| 96 | `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | B-sat structurally — no loop resets authored; one-shot-hold beats hold their claim; steady states never blank |
| 97 | `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | B-sat — archetype-discharge rule (§3): every archetype discharged by the authored in-state beat |
| 98 | `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` | N/A — single body |
| 99 | `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` | N/A — no wrap, no multibody |
| 100 | `nlb_overlay_ink_lift_is_bounded_to_the_families_whose_length_is_a_magnitude` | N/A — nlb overlay system |
| 101 | `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` | N/A-by-construction — no fixed-scale bar in any slider state (the fixed graph axes of S8 live in a sliderless state) |
| 102 | `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` | N/A — no track; r fixed strictly inside [0.15, 0.90] |
| 103 | `nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate` | N/A — no work bars |
| 104 | `nlb_work_bar_track_tops_lose_collinearity_when_a_3d_label_size_changes` | N/A — no work bars |
| 105 | `nlb_work_probe_globals_disagree_on_multibody_states` | N/A — single body |
| 106 | `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | B-sat — surfaces symbolic; numerals only in HUD/chip/tick labels the renderer computes |
| 107 | `optional_config_field_with_a_legal_zero_value_is_resolved_by_truthiness` | B — legal zeros audited: `omega0_rad_s: 0`, α 0, `engage_at_ms: 0` — `rbrNum` is typeof-resolved (`:49828`) ✓; K1 carries the probe for the new signed field |
| 108 | `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` | B — the sibling `tau_eq_i_alpha` is referenced by CONTENT only; the shared K1 semantics paragraph is quoted verbatim, never restated (handoff note) |
| 109 | `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` | B — exactly this concept's situation (a served concept extending the spec-driver's enums); discharged by K2/K7 naming the additions as 0c-3 scope with hygiene |
| 110 | `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` | B-sat — scriptability walk table included |
| 111 | `phase0_union_table_asserted_not_walked_state_by_state` | B-sat — both-direction walk |
| 112 | `ppc_probe_points_primitive_new_build` | N/A — 2D precedent record |
| 113 | `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` | B-noted — REV 1; on any Checkpoint-A restructure every ledger (§10b, prespoil, glow, min_ring, camera, watches) re-runs over the new state list, stated in the response table |
| 114 | `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` | B-sat — numeral triples cross-tabulated (§2); no delta cue shares a content phrase |
| 115 | `radius_scenario_F_r_label_kerning_collision` | 0c-3 — K4: the two r labels + v labels kern-checked |
| 116 | `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims` | B-sat — the S6 rendered factor 2.00 = the claimed "twice"; the S7 1:3:5 stated in strings and computed beside them |
| 117 | `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | B-sat — anchors state-assigned (S5 ~9 words, S6 ~11 words) with draft sentences |
| 118 | `review_site_build_is_stale_against_the_concept_under_review` | 0d — ops |
| 119 | `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` | B-sat — the θ-rewind trace cites its terminating lines (`:49958` rebuild branch; `:49967-49971` reset) |
| 120 | `rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas` | B-sat — every state's motion is apparatus motion; labels ride it, never substitute |
| 121 | `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate` | B-sat — this table IS the mechanical superset diff (157/157, script-extracted, verbatim) |
| 122 | `seam_r_ink_lift_reveals_sub_surface_force_arrows_fleet_wide_and_no_gate_reads_it_as_a_change` | N/A — nlb seam; no sub-surface arrows |
| 123 | `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step` | N/A — no bars, no cross-state bar scale |
| 124 | `signed_engine_union_drops_items_its_own_state_table_still_consumes` | B — REV 1 (no prior list); the walk enforces state↔row closure; any future rewrite shows the old→new mapping |
| 125 | `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` | B — anchor sentences quoted in §9 AND in the S5/S6 rows, inside budget; the 0d probe carries |
| 126 | `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed` | B-sat — the S6 compared points are rigidly joined; values constant all state; separate finishes cannot exist |
| 127 | `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time` | B-sat — no multi-body phases; the only in-state timing rides the READ engagement surface (`:1002-1006`, `:50533` — reader checked) |
| 128 | `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant` | B-sat — the scriptability walk classifies EVERY authored ms as reveal / physics event / bought field; none left over |
| 129 | `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static` | B-sat — timed reveals ride surfaces WITH time inputs (`readout_at_ms`, `reference_marks.at_ms`, cues) or are NAMED build items with config shapes (K4/K5/K6) |
| 130 | `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` | B-sat — the pin table budgets last-reveal COMPLETION per state |
| 131 | `solenoid_focal_primitive_on_title_not_physics` | 0d — focal on physics primitives, never titles |
| 132 | `solenoid_state3_annotation_orphaned_from_referent` | 0c-3 — K3/K4 labels anchored to referents |
| 133 | `solenoid_state4_outside_fade_narrated_not_shown` | B-sat — DoD (d): no claim without a rendered measurement/agent |
| 134 | `solenoid_state5_gesture_sequencing_absent` | N/A — no hand gestures (RHR plan N/A, §10c) |
| 135 | `solenoid_state7_hand_flip_unimplemented` | N/A — no hand |
| 136 | `spec_semi_implicit_euler_position_not_step_count_invariant` | B-sat — `rbrThetaAt` is fixed-grid, step-count-invariant by construction (`:49952-49966`, `:969-976`); K1 preserves closed forms |
| 137 | `state_added_at_review_outruns_the_config_contract_shape` | B-sat — every §3 state expressible as ONE rbr config object under the frozen shape + K-fields (checked per state) |
| 138 | `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | B — the S6 focal is the tangent-arrow PAIR as one grouped focal; neither half dims (carried to 0d) |
| 139 | `symbol_printed_on_canvas_before_the_lesson_defines_it` | B-sat — §10(b) ledger with DEFINED/PRINTED columns; I/L/KE/τ never printed at all |
| 140 | `taught_delta_smaller_than_the_instruments_own_live_noise` | B-sat — closed-form noise-free readouts; taught deltas dwarf the 0.01 display resolution (§3 metrics note) |
| 141 | `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` | B-sat — every taught variable's geometric correlate named (§3): arc, spin+ticks, actuator+climb, arrow length |
| 142 | `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` | 0d — the audit reads `field_3d_config` + frames |
| 143 | `teach_color_each_element_by_its_own_sign` | 0d physics_author — the α readout and (S9 reversal) v arrows coloured by their own sign, consistently |
| 144 | `teach_concrete_before_abstract_compare` | B-sat — concrete spin/ticks (S1-S3) before equations (S4/S7); ticks (S7) before calculus (S8) |
| 145 | `teach_coordinate_sim_with_graph` | B — carried INTO K6: one state clock drives table + dots + curves together |
| 146 | `teach_distinct_reference_lines_for_two_radii` | B — S6 draws r = 0.40 and r = 0.80 as two distinct labelled radius lines |
| 147 | `teach_do_not_prespoil_a_later_reveal` | B-sat — r/v not before S6; t² not before S7; d/dt not before S8; I/L/KE/τ/RHR never (deferred to #5-#9) |
| 148 | `teach_field3d_explore_grab_and_move_field_point` | B-sat — the live S9 α/ω₀ sliders drive continuous live motion; no field point exists to grab |
| 149 | `teach_inverted_scenario_inverts_cutline_flags` | N/A — no inverted sibling scenario |
| 150 | `teach_read_dense_ramp_frames_not_just_frozen` | B — THE EYE reads dense frames across the S3/S4/S5/S7/S8 drive windows (§3) |
| 151 | `teach_reveal_synced_to_narration` | B — the S1 reference build is sentence-synced (§3 S1); carried to the physics block |
| 152 | `teach_show_quantity_live_when_named` | B-sat — θ live from S1, ω from S2, α from S3, v labels live in S6 |
| 153 | `teach_visual_must_match_narration` | B — claim-by-claim audit at 0d; the dispatching session appends this concept to the OPEN row |
| 154 | `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` | N/A — single body; the S6 arrows are radially separated by 0.40 m, never occluding |
| 155 | `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` | B — the K1 canonical semantics paragraph exists ONCE, here; the sibling quotes it verbatim (handoff) |
| 156 | `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero` | B — K4 adopts the row's remedy verbatim: own map, ratio probe, labelled-dot zero case |
| 157 | `verification_via_applystate_bypasses_player_false_hang` | 0d — verification drives the real player |

---

*Handoff: → founder-proxy Checkpoint A. On `DESIGN_OK`: physics_author (physics block), then this document + the `tau_eq_i_alpha` skeleton feed Desk E's 0c-3 scope via `docs/loop_runs/rotmech/_engine/findings_d.md` (the dispatching session copies the ENGINE REQUIREMENTS digest there EARLY — Desk E freezes scope before its first dispatch). The dispatching session also: (1) records the phase0_survey.md row-#4 graph-panel claim as CORRECTED (K6); (2) ensures the sibling `tau_eq_i_alpha` skeleton QUOTES the K1 canonical semantics paragraph verbatim; (3) appends `rotational_kinematics` to the OPEN `teach_visual_must_match_narration` row at 0d. NO concept JSON until the 0c-3 PR merges and this desk syncs (rotmech_d_state.md).*
