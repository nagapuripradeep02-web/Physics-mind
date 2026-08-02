# Checkpoint A — `conservation_of_angular_momentum` (rotmech 0b, REV 2)

**VERDICT: `DESIGN_FIX` → `alex:architect` (fix cycle 1 of 2)** · founder-proxy, 2026-08-02 · skeleton commit `45d1226`

REV 2 is a strong skeleton — the scar consultation is real, the term ledger, ring-cut walk, per-state×engine walk, anchor state-assignments and numeric ground truth are all genuine craft, and its arithmetic checks out exactly. Not sent back for polish. Sent back because **three states put a contradiction of the concept's own atomic claim on screen**, because **the engine spec it hands `field3d-surgeon` (F3) is the wrong shape and will ship wrong physics in S8**, and because **S3's declared idea is derivable from S2**. No physics doubt; no escalation.

---

## Scar spot-check — dispositions that do not survive the DO text

Live table pulled (`--owner alex:architect` 32 rows, `--row-type directive` 47 rows). Renderer spot-checks: `momentOfInertia|angularMomentum|moment_of_inertia` → **0** (survey absence claim confirmed); `reference_marker` exists only as the potential-scenario far-field sphere (L284/16973/17295), `energy_layer.h_ref_m` is a track-level dashed line (L1391/1424) — **no bar/readout tick primitive exists**, so F1 is a genuine build; `external_torque|brake` → 0 functional hits.

**Honest dispositions:** `contrast_ghost_coresident_with_the_real_set_fuses_both` · `nlb_multibody_lane_gap_is_along_z…` · `nlb_checkpoint_s_m_authored_as_displacement…` · `teach_coordinate_sim_with_graph` · `architect_declares_an_engine_limit…` · `teach_inverted_scenario_inverts_cutline_flags` · `chemistry_concept_id_collides…` (verified) · `explore_controls_not_ring_gated_survive_the_ring_cut` (the min_ring treatment is exactly the row's DO; killing REV-1's escalation with it was right).

**Dispositions that fail:**

| Row | Skeleton says | What the DO binds |
|---|---|---|
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | N/A (no checkpoints) | The transferable half — *the frozen pin can photograph the wrong phase of a looping beat* — binds, and **S4 falls into it** (F-1). |
| `nlb_frozen_pin_lands_within_one_frame…` | fixed — "~2 s ramps inside ≥8 s loops … comfortably met" | S2's own choreography is one full slow revolution (2π/2.0 = **3.14 s**) + 0.7 s beat + 2 s ramp ⇒ end-config at **≈5.85 s**. At R = 8 s the pin is 4.8 s — **the frozen frame lands mid-slide, before the state's claim exists.** Loop must be ≥ ~10.6 s. |
| `nlb_static_state_authored_on_the_track_bound…` | fixed (generalized) | Inset from *physical* bounds, but every authored home pose sits **exactly on the authored clamp** (S1/S3 at r = 0.8 = max; S2 at r = 0.2 = min). Widen the clamp (e.g. [0.15, 0.90]) and keep taught poses inside it. |
| `derived_readout_asserted_by_value_without_defining_its_metric` + `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` | fixed / satisfied | In mode E2 the skeleton *defines* ω := L/I(t), so the product I·ω **is algebraically the invariant** — structurally incapable of disagreeing. Its flatness is a tautology of the display, not a demonstrated result. And S4 narrates *"the person does real work"* with **no agent in the scene** (§9 omits the human mesh; nothing pulls the masses) — see F-4. |
| `teach_distinct_reference_lines_for_two_radii` | N/A — "only one radius r" | S6's brake acts at **the rim** — a second radius. Turntable/rim radius is never specified anywhere. |
| `closed_enum_cannot_name_a_substance_the_design_teaches` | fixed — five tokens diffed | This is a **12-concept spec driver**. An enum closed against its own five tokens forces #4's α, #5's force-point, #6's axis selector and #14's κ each to become a renderer edit *after* 0c-1 lands — the alarm-rule failure. |

---

## FINDINGS (all routed `alex:architect`)

**F-1 · P1 · S4 · The state ends by undoing its own claim, and the canonical frame lands on the undone version.**
The beat authors "KE climbs past the tick to 28.4 J … **on push-out KE returns to 6.1 J**", while the DoD asserts the end-configuration is "tick-vs-bar gap open" before 55% of loop. Both cannot be true; at 0.60R the frozen frame shows the bar sitting *on* the tick. Pedagogically worse: a teacher shows "KE is not conserved" and the last picture is KE back where it started. **Fix:** tick alone → pull-in → **hold with the gap open** for the rest of the loop. The push-out is not needed and its removal also breaks the fourth radial-slide replay. Rename the archetype (`cycle-compare` no longer describes it).

**F-2 · P1 · S5 · An uncaused spin reversal contradicts the atomic claim, with L visibly crossing zero.**
"The AUTHORED spin-reversal cue fires — spin **eases through zero and reverses**." Reversing ω *requires* an external torque; L is on the HUD in every state, so a teacher sees L go 6.12 → 0 → −6.12 while the sim's whole claim is that L cannot change without a torque — two states before S6 introduces the only torque source. **Fix (preferred):** S5 does not reverse the running spin — it **re-launches** with the opposite initial sign (hard cut / restart, narrated as "run it again the other way"). Preserves the teaching point (arrow up vs down, hand curl tracks sign), removes the contradiction, and **collapses engine finding F4 to "initialise ω₀ with either sign" — free.** A continuous reversal would need a *visible* torque, which is a second idea and belongs after S6.

**F-3 · P1 · Engine spec · F3 (per-state integrator-mode switch) is the wrong shape and ships wrong physics in S8.**
Two modes are specified — `L_conserved` (ω = L/I(t)) and `torque_driven` (α = τ_net/I) — with a live flip in S8 when the brake slider > 0. The correct general law for a fixed axis is a *single* integrator:

```
L(t+h) = L(t) + τ_ext·h        (rest-clamped)
ω(t)   = L(t) / I(t)
θ(t+h) = θ(t) + ω·h            (step-count-invariant form per the two integrator directives)
```

This subsumes both modes exactly (τ_ext = 0 ⇒ L constant by construction, zero accumulation error; I constant ⇒ dω/dt = τ/I identically), needs **no mode flag**, and removes the S8 flip. It also fixes a real shipped bug: in S8 a teacher can drag `r` **while the brake is engaged**, where the true relation is α = (τ − ω·dI/dt)/I — the authored `torque_driven` mode is then **simply wrong on screen**. Same fix retires the L-readout tautology: the honest framing is "the engine integrates dL/dt = τ_ext; with no external torque nothing changes L." **Fix:** replace F3 with a single angular-momentum integrator plus a `τ_ext` source list; delete the mode enum.

**F-4 · P1 · S2/S4 · The agent that does the work is not on screen.**
S4's supporting aha, its `one_line_fix`, and the drill-down `internal_forces_no_torque` all depend on someone pulling the masses. §9 deliberately omits the human mesh and nothing else pulls — the masses simply translate. **Fix:** author a **radial force arrow on each mass along −r̂ during the slide** (S2, S4). Costs one arrow, makes the work visible, and simultaneously renders the `internal_forces_no_torque` answer (force points at the axis ⇒ zero torque about it) — that drill-down currently has no picture. Largely the survey's own #5 row ("force applied at a point"), so reuse — but it must be **claimed in the walk table**, which currently walks only the skeleton's own E1–E9 subset.

**F-5 · P1 · S3 · The declared idea is derivable from its predecessor (R1 class).**
S3's purpose is "Contrast pair of S2: reversible". A student who watched S2 and accepted L = Iω constant can answer everything S3 shows; and S4's beat already contains the push-out. Its only load-bearing payload is I₁ω₁ = I₂ω₂. Separately, **Rule 38a's ordering clause (qualitative → quantitative → derivation) is never addressed** — only the advanced-contiguity half is claimed. **Fix (one edit solves both):** re-declare S3 as the **quantitative** beat — "the trade is exact: I₁ω₁ = I₂ω₂ predicts 9.27 rad/s, and the readout agrees" — with the push-out as its vehicle, title and delta cue saying so. The ring ladder then genuinely reads qualitative (S1–S2) → quantitative (S3–S4) → extended → derivation. Otherwise S3 merges into S2 and this is a 7-state concept.

**F-6 · P2 · S8 · `m` and `ω₀` slider semantics unspecified — the sandbox can contradict the concept.**
Undefined: does changing `m` mid-spin re-pin L (ω held, L jumps), or hold L (ω jumps)? Both are visible on the HUD and one shows L changing with nothing touching the turntable. Also undefined: whether the S8 direction toggle eases through zero (inheriting F-2). **Fix:** state that `m`/`ω₀` **re-initialise** the state (L re-pinned from the new I·ω, with a brief re-pin cue), that `r` is the only live-drag control holding L, and that the S8 direction control is a restart. This is an engine contract; the surgeon will invent it otherwise.

**F-7 · P2 · S2/S6 · Pin-margin arithmetic and apparatus geometry.**
(a) The "≥8 s loop, comfortably met" claim omits S2's own 3.14 s pre-roll revolution — state the per-state loop period explicitly (S2 needs ≥ ~10.6 s), or drop the assertion and carry only the obligation. (b) The **turntable radius, rim radius and rod length beyond the r-clamp are never specified**, yet S6's brake acts at the rim and F2's slider range is meaningless without it. Specify the geometry; if both r and R_rim are drawn, distinguish them per `teach_distinct_reference_lines_for_two_radii`.

**F-8 · P2 · Numbers · KE₁ and L display the same value.**
Arithmetic verified correct: I(0.8) = 3.06 · L = 6.12 · I(0.2) = 0.66 · ω = 9.2727 · KE₁ = 6.12 J · KE₂ = 28.37 J · ratio 4.636 ✓. **But** because ω₀ = 2.0 exactly, KE₁ = ½Lω₀ = **L numerically** — the HUD reads `L = 6.12 kg·m²/s` beside `KE = 6.1 J` at the exact moment the state asks a teacher to watch one hold and the other rise. **Fix:** ω₀ = **1.5 rad/s** (L = 4.59, KE₁ = 3.44 J, ω₂ = 6.95 rad/s, KE₂ = 15.96 J, ratio unchanged 4.64) — also drops top spin from 1.48 to 1.11 rev/s, easier to read from the back of a room. Also fix the rounding inconsistency (9.3 vs 9.27) and state HUD decimal places.

**F-9 · P2 · Ring assignment · the boundary condition sits outside the smallest preset.**
Under `qualitative_core` (drop S5–S7) the concept named *conservation of angular momentum* never shows what breaks it — τ_ext = 0 survives only as words in S1, and the condition is inside the atomic claim. **Rule:** either promote S6 to core (requires moving it before S5 to keep rings monotone: S1–S4, S6 core → S5 extended → S7 advanced), or state in writing why a core-only preset teaching an unconditioned law is acceptable. Leaning to promotion; not mandating the reorder.

**F-10 · P2 · Engine spec · close the config enums against the served concept set, not the spec driver.**
The 0c-1 dispatch brief must declare control-token and scenario-config enums against the survey's union (#1 parts list, #4 α, #5 force-at-a-point + moment arm, #6 axis selector, #14 κ), and the torque source must be a **list** (`brake` | `applied_force_at_point` | `torsion_spring`), not brake-only. Otherwise the alarm rule fires at concept #4 or #5.

**F-11 · P2 · S1/S7 · Archetype repeat rejected — take the offered fallback.**
S1 and S7 are not a contrast pair, so Rule 31's exemption does not apply. **Rename S7's archetype to `equation-build`.** Deeper point the rename does not fix: S7's *physical* motion is a slow replay of S2's slide, so its declared archetype describes text, not motion. Acceptable only because the equation surface + a dL/dt readout pinned at 0.00 while I and ω sweep is a visually distinct picture — say so in the beat. And stop selling `dL/dt = 0.00` as an independent measurement; under any correct integrator it is 0 by construction. Present it as an illustration of the derivation.

**F-12 · P3 · Rule 41 / clamp hygiene.**
(a) S7's rail title *"Why L is constant: τ_ext = dL/dt"* carries a formula into a truncating rail — "Why L stays constant" carries meaning in the first words (41d). (b) S1's delta cue "No torque" vs narration "outside twist" — pick one; `torque` is the plain physics word (41b) and `tau_eq_i_alpha` is an in-chapter prerequisite. (c) Widen the authorable r clamp to e.g. [0.15, 0.90].

**Rule 35 / 38f: clean.** Rotating stool (S2) and diver (S3) are universal, state-assigned with reserved budget; the catalog's 12 India-specific anchors correctly not imported. No region constants. No finding.

---

## Rulings on the questions asked

1. **F1** — real, small, correctly scoped, not gold-plating; no existing bar/readout tick in the renderer. Build as generic `reference_marks`. **F2** — real, best-contracted item in the document, but **under-generalised**: build as one entry in a torque-source list, and give it rim geometry. **F3** — **reject as specified**; replace with the single L-integrator. **F4** — **contingent**: exists only to serve S5's eased reversal, which F-2 removes; if S5 becomes a restart, F4 collapses to "initialise with either sign" and should not be built. **Alarm rule: not tripped** — F1–F4 surfaced at 0b, before code. But F2's actuator and F-4's force arrow being absent from the survey's *shared-capability* list is a mild signal the union is a per-concept needs list rather than a closed capability set; F-10 is the prophylaxis.
2. **Archetype repeat: rejected.** Take `equation-build`.
3. **S3: does not earn its place as declared** — re-purpose as the quantitative beat or merge. **S7: earns its state** — the derivation is the advanced ring's whole content, it is examined, it is a different *kind* of knowledge; its weakness is presentation, not existence.
4. **Numbers: all correct and reachable.** One defect: KE₁ ≡ L at ω₀ = 2.0.
5. **Rule 41 / Rule 35: pass** with three small edits; anchors clean.
6. **Rule 38 rings: contiguous and cuttable ✓; min_ring explore treatment holds under both cuts ✓** — genuinely good work, and it correctly closes the OPEN `explore_controls_not_ring_gated…` row. Caveats: 38a's *ordering* clause unaddressed (F-5), smallest preset loses the law's condition (F-9).

---

## ENGINE QUEUE — advisory to the 0c-1 dispatch brief

Nothing is built, so nothing is `FIX(engine)` yet. These are corrections the **skeleton must carry** before `field3d-surgeon` is dispatched; owner on dispatch = `peter_parker:field3d_surgeon`.

| # | Item | Tag | Evidence |
|---|---|---|---|
| E-a | Single angular-momentum integrator; delete the mode enum | **blocking 0c-1** | F-3; probe: drag `r` with `τ_brake > 0` for 20 s, assert ω(t) matches (L₀ + ∫τ)/I(t) to 1e-9, and a dt-fold (h, h/2, h/4) reproduces **θ** as well as ω |
| E-b | `τ_ext` as a **source list** (`brake` \| `applied_force_at_point` \| `torsion_spring`), frictional rest clamp, closed-form/replay for the pin | blocking 0c-1 | F2's own contracts + F-10; brake needs `rim_radius_m` |
| E-c | `reference_marks[]` on any readout/bar (value + short label) | blocking 0c-1 | F1; confirmed absent |
| E-d | Radial force arrow attachable to any mass (reuse #5's force-at-a-point row) | blocking 0c-1 | F-4 |
| E-e | Config + control-token enums declared against the survey's 12-concept union | blocking 0c-1 | F-10 |
| E-f | Authored eased spin-reversal choreography (F4) | **do not build** pending F-2 | F-2 |

---

## Candidate scar rows (report-only — the dispatching session files these; founder-proxy applied nothing)

Seven rows proposed: `authored_beat_ends_by_undoing_the_state_own_claim` (CRITICAL) · `state_changes_the_conserved_quantity_the_concept_says_cannot_change` (CRITICAL) · `integrator_mode_switch_authored_where_one_conserved_quantity_integrator_suffices` (MAJOR) · `contrast_pair_declaration_substitutes_for_a_new_idea` (MAJOR) · `numeric_ground_truth_makes_two_different_quantities_display_the_same_value` (MODERATE) · `home_pose_authored_exactly_on_the_authored_slider_clamp` (MODERATE) · `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` (MAJOR). Full SQL in the Checkpoint A transcript.

*No row minted for F-4* — the unrendered work agent is covered by the existing OPEN `teach_visual_must_match_narration` (`alex:architect`); minting a near-duplicate would fork the upsert key. Recommend appending this concept to that row's `concepts_affected`.

---

## Rubric (advisory, unratified — did not affect the verdict)

Checkpoint A subset — D1 1 · D2 2 · D8 2 · D9 2 · D10 1 = **8/10**.
Weakest: **D1 information gain** — S3's declared idea is S2 run backwards and S4's beat already contains the push-out; becomes a 2 if S3 is re-declared as the quantitative beat. **D10** — three of five sandbox controls are specified; `m` and `ω₀` have no stated live semantics, and a dial whose behaviour is undefined is not yet a dial a teacher can demonstrate.
Strongest: **D8** (3 misconception beats at genuine pivots, not sprayed) and **D9** (titles plain and literal; only S7's formula-in-the-rail is off).

**Fix cycle 1 of 2.** On re-submission F-1 through F-5 are re-checked first; the rest are cheap and taken on the same pass. `physics_author` and the 0c-1 dispatch are **not** authorised until this returns `DESIGN_OK`.
