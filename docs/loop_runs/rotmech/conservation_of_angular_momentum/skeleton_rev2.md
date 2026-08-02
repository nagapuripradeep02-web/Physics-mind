# Skeleton — `conservation_of_angular_momentum` (rotmech · Class 11 Ch.7 · 0b spec driver for build 0c-1) — REV 2

> **Status:** Phase-0b deepest-concept design (AUTHORING_PIPELINE.md §0). This skeleton + the physics block ARE the real spec for the NEW field_3d `scenario_type` (working name `rigid_body_rotation`). Rule 12 does not apply — the scenario does not exist yet. Literal config/key names below are guesses; the field3d-surgeon dispatch report's closed enums supersede them. Physics, geometry, and what-must-be-visible are exact.
> **Renderer-readiness declaration (scar: `archetype_live_tier_unverified_against_renderer`):** because the scenario does not exist, **every motion specified in this skeleton is `[NEEDS-SCENARIO]`** — the field_3d renderer family exists, the specific motions do not, and NO archetype here is claimed `[LIVE]`. There is no `file:line` to cite; the verification obligation transfers to the 0c-1 build and its bring-up probes. The one pattern reference (grip-rule hand vocabulary) is a visual-vocabulary precedent only, not a reuse claim — the existing hands are orientation-fixed (survey note) and this build makes orientation live.
> **Bug-queue consultation (2026-08-02, LIVE table via Bash):** ran `query_engine_bug_queue.ts --owner alex:architect` (32 rows), `--row-type directive` (47 rows), `--field3d --open` (30 rows). Every row audited; verdicts in the SCAR AUDIT section at the end. This supersedes the earlier mirror-only consultation via `docs/FIELD3D_SCENARIO_CHECKLIST.md`.
> **DC Pandey check:** consulted chapter table of contents only (Rotational Mechanics — confirms conservation of angular momentum is its own sub-topic, after L = Iω and τ = Iα). No teaching method, no example problem, no figure imported.
> **Namespace check (scar: `chemistry_concept_id_collides_with_rostered_physics_id`):** `conservation_of_angular_momentum` appears in neither `src/data/concepts/` nor `src/data/concepts/chemistry/` — no collision.

---

## 1. Atomic claim

This concept teaches ONE thing: **when the net external torque on a system is zero, its angular momentum L = Iω stays constant — so if the mass distribution changes and I falls, ω must rise (and kinetic energy is NOT conserved while this happens)**. It does not cover what angular momentum is or its formula (taught in `angular_momentum`), how I is computed (taught in `moment_of_inertia`), or how a nonzero torque produces α (taught in `tau_eq_i_alpha`). The Kepler-2nd-law application is deferred to the Gravitation chapter (survey: out of scope).

## 2. State count + arc — 8 states (7 guided + 1 explore)

Complexity call: **complex (7–9 band)**. The concept needs the conservation event itself (2 contrast beats), its energy consequence (the misconception payoff), its vector nature (RM-G6), its boundary condition (τ_ext ≠ 0 breaks it), and the advanced derivation. Fewer states would fold two ideas into one beat and break the 25–55-word budget.

The apparatus is ONE machine throughout (Rule 32d home pose): a **turntable on a vertical axle, carrying a horizontal rod with two equal masses that can slide symmetrically along the rod**. The turntable is ALWAYS spinning from S1 onward — continuous rotation is the home-pose motion; each state's declared "distinct motion" is the change layered on top of that spin. HUD (value-only): `I`, `ω`, `L`, plus `KE` from S4.

**Authored numeric ground truth (so every displayed number derives — scars `derived_readout_asserted_by_value_without_defining_its_metric`, `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain`):** each sliding mass **m = 2.0 kg**; frame (turntable + rod + axle) inertia **I_frame = 0.50 kg·m²**; rod half-length **1.0 m**; mass radius clamp **r ∈ [0.2, 0.8] m** — the home poses are INSET from both bounds (never at the axle r = 0, never at the rod tip 1.0 m; scar `nlb_static_state_authored_on_the_track_bound` generalized). Then: I(0.8) = 0.50 + 2·2.0·0.8² = 3.06 kg·m²; with ω₀ = 2.0 rad/s, L = 6.12 kg·m²/s; I(0.2) = 0.66 kg·m² → ω = 9.27 rad/s; KE goes 6.1 J → 28.4 J. Every number printed anywhere below is this arithmetic — nothing is free-standing.

| State | Title (Rule 41 — literal, first words carry meaning) | Purpose | teaching_method | Ring |
|---|---|---|---|---|
| S1 | Steady spin, constant L | Baseline: no external torque → I, ω, L all steady; L readout established; the LAW stated in words | *(straightforward beat — field omitted)* | core |
| S2 | Masses pulled in — spin speeds up | THE PRIMARY AHA: I drops, ω rises, L stays pinned | *(straightforward beat)* | core |
| S3 | Masses pushed out — spin slows down | Contrast pair of S2: reversible, L still pinned; the assessed equation I₁ω₁ = I₂ω₂ surfaced | *(straightforward beat)* | core |
| S4 | Kinetic energy is not conserved | KE = ½Iω² rises during pull-in; the person does real work | `misconception_confrontation` (Rule 16a contrast beat, in-EPIC-L) | core |
| S5 | L is a vector along the axis | Direction by the right-hand grip rule; reverse the spin → L flips | *(straightforward beat)* | extended |
| S6 | External torque changes L | A brake pad touches the rim → L visibly decays; conservation needs τ_ext = 0 | *(straightforward beat)* | extended |
| S7 | Why L is constant: τ_ext = dL/dt | Derivation ring: τ_ext = dL/dt, so τ_ext = 0 ⇒ L constant | `derivation_first_principles` | advanced |
| S8 | Try it yourself | Sandbox: slide the masses, set the spin, watch L hold | `exploration_sliders` | *(explore — ring-gated controls, core formula surface)* |

Advanced ring = S7, a contiguous block immediately before the explore state (Rule 38a) ✓. `advance_mode`: S1–S7 `manual_click`, S8 `interaction_complete` — ≥2 distinct modes (Gate 12) ✓.

## 3. Per-state choreography + control plan (Rule 31 control table — FIRST design artifact)

**Coined archetype (one, justified):** `radial-slide` — mass elements translate radially WITHIN the rotating body, changing its shape while it spins. No seed archetype captures a shape change of the rotating object itself (translate-through is an object moving past apparatus). Used by S2/S3 as a declared contrast pair.

**Archetype-discharge rule (scar `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control`):** every archetype below is discharged by motion the AUTHORED beat produces with NO teacher input, inside the state, between t=0 and the loop reset. The S5 toggle and S6 slider are Rule-31 contextual controls layered ON TOP of an authored beat that already performs the state's motion by itself — they never discharge the archetype. Verified per state in the "authored beat" column.

| State | Teaches (one idea) | Archetype | Authored beat (no teacher input; cause → effect per Rule 32a) | Delta (one line → ≤5-word cue) | Live controls (Rule 31c) | Words | Ring |
|---|---|---|---|---|---|---|---|
| S1 | With no external torque, L = Iω does not change | `reveal-build` | Turntable spins steadily at ω₀ = 2.0 rad/s, masses at r = 0.8 m; the L vector arrow draws in along the axle, then the I / ω / L readouts build in one by one, **each appearing only AFTER the narration sentence that defines it** (term ledger, §10b). Nothing else changes — the steadiness IS the point. Narration STATES the law: "with no outside twist, L = Iω stays the same" | **"No torque: L constant"** | none | 30–45 | core |
| S2 | Pull the masses in → I falls → ω must rise to keep L fixed | `radial-slide` | Authored ramp: CAUSE first — the two masses slide inward along the rod (r: 0.8 → 0.2 m over ~2 s). After a readable ~0.7 s beat the EFFECT follows: rotation visibly speeds up (2.0 → 9.3 rad/s), ω readout climbs, I readout falls, **L readout sits pinned at 6.12 kg·m²/s with a hold-glow**. One full slow revolution before, several fast revolutions after. Anchor lives HERE: ~8 words of this state's budget — "like a person on a rotating stool pulling their arms in" | **"Masses in: spin faster"** | none (watch beat) | 35–55 | core |
| S3 | Push the masses out → I rises → ω falls; the trade runs both ways | `radial-slide` (declared contrast pair of S2 — delta names the flip) | Same authored choreography reversed: masses slide OUT (0.2 → 0.8 m), spin visibly slows (9.3 → 2.0 rad/s), L readout never moves. Ends back at the S1 home pose. Formula surface shows the ASSESSED form **I₁ω₁ = I₂ω₂** (symbolic — no numbers on the surface; the HUD carries the live numbers); one narration clause defines the subscripts ("before and after"). Secondary anchor here (~10 words): "like a diver stretching out to slow the somersault before the water" | **"Masses out: spin slower"** | none | 25–40 | core |
| S4 | L is conserved but kinetic energy is NOT — pulling in takes real work | `cycle-compare` | SEQUENTIAL contrast (scar `contrast_ghost_coresident…`: wrong expectation first, alone): the thin static reference tick appears FIRST at the starting KE = 6.1 J, labelled "if energy stayed constant", on its own narration beat with nothing else changing. THEN the authored full pull-in → push-out cycle runs: the actual KE bar climbs past the tick to 28.4 J while L stays flat; on push-out KE returns to 6.1 J. The gap between tick and bar IS the work done pulling inward (W = ΔKE — arithmetically what the engine computes; no cause is named that the model lacks). Bar scale sized 1.1× the 28.4 J peak | **"Kinetic energy goes up"** | none | 40–55 | core |
| S5 | L is a vector pointing along the rotation axis (right-hand grip rule) | `rotate/flip` | Camera reframes to see the axle side-on (Rule 32d: camera moves only to frame the new thing). Authored loop, no input: a grip-rule hand curls its fingers with the spin, the L arrow points up the axle; then the AUTHORED spin-reversal cue fires — spin eases through zero and reverses, the L arrow flips to point down; the loop repeats. The toggle lets the teacher drive the same reversal live; it does not discharge the archetype | **"L points along axis"** | spin-direction toggle *(min_ring: extended)* | 30–45 | extended |
| S6 | Conservation holds ONLY while τ_ext = 0; an external torque changes L | `translate-through` (brake pad moves in against the rim; the beat kills the belief "L never changes" by SHOWING the boundary) | Authored beat, no input: brake pad translates in, touches the rim (cause); after a readable beat, ω AND L decay together (effect); the "L" hold-glow breaks. On the authored cue the brake releases → decay stops, L holds at its new lower value — it does not recover. **Brake physics contract:** the brake torque is FRICTIONAL — it opposes ω, clamps at ω = 0, and NEVER reverses the spin (scar `nlb_frictionless_state_with_an_opposing_applied_force_reverses…`: with the slider seized at any reachable value for 20 s, ω decays monotonically to ≥0 and the L readout never changes sign or climbs back). L(t) in this state is a closed-form piecewise function of state-local t (constant → decay → constant), so time-pin rewinds replay it exactly (scar `hysteretic_state_cannot_be_latched_under_a_time_pin`) | **"External torque changes L"** | brake-torque slider *(min_ring: extended)* | 30–50 | extended |
| S7 | τ_ext = dL/dt; zero external torque ⇒ dL/dt = 0 ⇒ L constant | `reveal-build` (declared repeat of S1 — justification: S1 builds instruments, S7 builds the equation; fallback to coined `equation-build` if founder-proxy objects) | The equation builds term by term on the single formula surface, synced to narration; alongside it a slow authored replay of S2's pull-in runs with the dL/dt readout showing 0.00 throughout. **dL/dt metric defined:** per fixed step, (L_k − L_{k−1})/h where L is the frame-recomputed product I·ω — it reads 0.00 because the pinned-L integrator makes the product constant; the readout is a rendered measurement the engine genuinely computes, not an asserted value. Calculus notation allowed here only (Rule 38c) | **"Torque equals dL/dt"** | none | 35–55 | advanced |
| S8 | Sandbox — the teacher drives everything | `drag-sandbox` | Free-running (Rule 37): teacher drags the mass-radius slider live, spin responds instantly, L pinned; can restart with a new ω₀ or mass m; brake and spin-direction available when their ring is present. **Idle auto-sweep** (scar `teach_field3d_explore_grab_and_move_field_point` pattern + bar_magnet sandbox lesson): until the first trusted input, r slowly oscillates 0.8 → 0.2 → 0.8 on the state clock so THE EYE can gate the state and the sandbox is never static | **"Try it yourself"** | ALL controls, ring-gated: r *(core)*, ω₀ *(core)*, m *(core)*, spin-direction *(extended)*, brake-torque *(extended)* | 0 / open | *(explore)* |

**Archetype audit:** reveal-build ×2 (S1/S7 — declared repeat, justification above); radial-slide ×2 (declared contrast pair, delta names the flip); cycle-compare, rotate/flip, translate-through, drag-sandbox ×1 each. No static state — the turntable spins in every state. Every archetype discharged by its authored beat (column above).

**Explore controls — ring-gated, replacing the REV-1 precedence escalation (scar `explore_controls_not_ring_gated_survive_the_ring_cut` [OPEN, alex:architect] — this row ANSWERS the Rule 38b vs Rule 31 tension; no founder-proxy adjudication needed):** every explore control carries a `min_ring`, and the coherent-when-cut check runs over the explore control list as well as the guided states. S8 therefore exposes ALL controls (Rule 31 satisfied literally) with min_ring tags as tabled; cut a ring and its controls are cut with it. Verification per cut: *hide advanced* — S8 keeps r/ω₀/m/spin-direction/brake, each mapping to a surviving guided state (S1–S6) ✓. *Hide advanced+extended* — S8 keeps r/ω₀/m only, each taught by surviving S1–S4 ✓; the brake and spin-direction controls disappear WITH S5/S6. S8's formula surface stays `L = Iω` (core) under every preset — Rule 38b's content clause intact.

**Readout metrics (scar `derived_readout_asserted_by_value_without_defining_its_metric` — metric, never values):** `I` = I_frame + Σmᵢrᵢ(t)², recomputed every fixed step from the live mass positions. `ω` = engine state (mode `L_conserved`: ω = L/I(t) with L set once from entry conditions; mode `torque_driven`: integrated from α = τ_net/I). `L` readout = **the product I(t)·ω(t) recomputed every frame in BOTH modes** — never an echo of the pinned invariant, so it is capable of disagreeing and its flatness in S1–S5/S8 is a demonstrated result (and in S6 it visibly moves). `KE` = ½I(t)ω(t)². `dL/dt` = per-step finite difference of that product (S7 only). Every number in §2's ground-truth paragraph follows from these metrics.

**Rule 33 macro↔micro:** N/A-with-justification — the taught variable (I, from the mass distribution) IS the visible mechanism: the masses at radius r are on screen, and I recomputes live from what the eye sees. No hidden microscopic level exists. Instruments (Rule 33d): value-only HUD with live numbers — `I = 3.06 kg·m²`, `ω = 2.0 rad/s`, `L = 6.12 kg·m²/s`, `KE = 6.1 J` (S4+).

**Rule 34 canvas budget (per state):** top caption = the ≤5-word delta cue only; ONE math-serif Unicode formula surface (S1/S8: `L = Iω` · S2: `ω = L / I` · S3: `I₁ω₁ = I₂ω₂` · S4: `KE = ½Iω²` · S5: none — the hand + arrow carry it · S6: `τ_ext ≠ 0 ⇒ L changes` · S7: `τ_ext = dL/dt`); HUD value-only; all math real Unicode (ω, τ, ½, ², ·, kg·m²/s). All formula surfaces are SYMBOLIC — no numeric claim lives on a surface; numbers live only in the HUD, where the engine computes them (scar `oncanvas_formula_asserts_a_value_the_renderer_cannot_show`).

**Pin-margin discipline (scars `nlb_frozen_pin_lands_within_one_frame…`, `nlb_loop_reset_clears_checkpoint_stamp…`, generalized):** every guided state's asserted end-configuration (masses in + fast spin, tick-vs-bar gap open, arrow flipped, L decayed-and-held) must be reached before 55% of that state's loop period, leaving ≥167 ms (10 frames) margin to THE EYE's 60% frozen pin — computed by physics_author from the authored ramps at the engine's own step size, not the continuum solution. With ~2 s ramps inside ≥8 s loops this is comfortably met by design; physics_author states the exact numbers per state. THE EYE must also read DENSE frames across the S2/S3/S6 ramp windows, not only the frozen end-state (directive `teach_read_dense_ramp_frames_not_just_frozen`).

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots, no per-state tic)

| Wrong belief | Confronted at | `misconception_watch` beat |
|---|---|---|
| "A spin rate cannot change unless something pushes or a motor acts" | **S2** | belief: nothing external touched it, so ω must stay 2.0 rad/s · visual_counter: masses slide in and the spin visibly speeds up 4.6× while the L readout never moves · one_line_fix: no external torque fixes L, not ω — change I and ω must change with it |
| **"If angular momentum is conserved, energy is conserved too"** (the one that matters most) | **S4** | belief: KE should stay at 6.1 J through the pull-in · visual_counter: the static "if energy stayed constant" tick drawn FIRST, alone, then the KE bar climbing past it to 28.4 J while L stays flat — sequential, no pause · one_line_fix: pulling the masses inward takes real work, and that work becomes extra kinetic energy; KE = L²/2I rises as I falls |
| "L is just a number" (RM-G6 — L is a vector) | **S5** | belief: L has a size but no direction · visual_counter: the L arrow along the axle flips when the spin reverses · one_line_fix: L points along the rotation axis by the right-hand grip rule |

The misconception picture each beat needs is drawable by a NAMED primitive (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`): S2/S3 need only the pinned-L hold-glow (E8), S4 needs the reference tick (**F1**, named at design time), S5 needs the flippable hand + arrow (E5/E7/F4).

S1, S3, S6, S7, S8 carry NO misconception_watch — straightforward teaching. EPIC-C branches: **zero** (EPIC-L-first directive, 2026-06-10).

## 5. `has_prebuilt_deep_dive` states (2)

- **S2** — the primary-aha state; the "but WHY does it speed up" question is the historic sticking point (students accept the fact, not the mechanism). Cache-worthy.
- **S4** — energy bookkeeping is where exam mistakes concentrate (KE ratio problems); the L-conserved-therefore-E-conserved confusion has many phrasings. Cache-worthy.

These are the same states carrying the Pass-1 cliff sentences (see Block 1) — no divergence to document. V1.0 ships zero authored deep-dives (Rule 18); the flag marks investment priority only.

## 6. Drill-down clusters

**S2:** `why_omega_rises` ("what pushes it faster") · `L_vs_omega_confusion` (conserving ω instead of L) · `internal_forces_no_torque` (why the pulling force exerts no torque about the axis — it points along r).
**S4:** `ke_not_conserved` (energy bookkeeping in the pull-in) · `who_does_the_work` (the person/agent does work against the inward-force requirement) · `ke_ratio_formula` (KE = L²/2I, KE₂/KE₁ = I₁/I₂).

## 7. `entry_state_map`

```
entry_state_map:
  foundational:   STATE_1 → STATE_4   # "what is conservation of L" / stool demo / energy question
  vector_nature:  STATE_5             # "which direction is L"
  external_torque: STATE_6            # "when is L not conserved"
  derivation:     STATE_7             # "prove L is constant"
```

Default aspect = `foundational`. PRIMARY aha (S2) is inside the foundational range ✓ (foundational-coverage rule satisfied — no exit-pill needed). S4's energy beat also lands inside foundational, so the silent student meets both the aha and the key misconception on the default slice.

## 8. Prerequisites (advisory — Rule 23)

`angular_momentum` (#9, this chapter — L = Iω + vector nature), `moment_of_inertia` (#6 — I = Σmᵢrᵢ²), `tau_eq_i_alpha` (#7 — what a torque does), `rotational_work_energy` (#8 — KE = ½Iω², needed for S4's bar). **All four are in-chapter and NOT yet shipped** — they precede this concept in the approved 14-concept teaching order, so at 0d authoring time they will exist. No cross-chapter prerequisites.

## 9. Real-world anchor (Rule 35 / 38f — universal, culture-neutral; scar `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` — STATE assignments with reserved words)

**Primary: a person sitting on a rotating stool, holding a mass in each hand, arms stretched out — pulling the arms in makes them spin visibly faster; stretching out slows them down again.** Assigned to **S2**, ~8 words reserved inside S2's 35–55-word budget ("like a person on a rotating stool pulling their arms in"). Placement pre-spoils nothing — it lands ON the aha it illustrates. This is the canonical demonstration, physically the EXACT system the sim renders, recognisable in any classroom in any country, and it hooks because the speed-up feels like something-for-nothing — nobody pushed. **Secondary: a diver tucking tight to somersault fast, then stretching out to slow the rotation before entering the water.** Assigned to **S3**, ~10 words of its budget. Both are per the founder-approved survey replacement table; the catalog's Bharatnatyam/Kathak/ISRO anchors are NOT imported. Region-dependent constants: none in this concept. The on-screen apparatus stays the abstract turntable (no human figure mesh — the person lives in the narration, keeping the mesh budget small).

## 10. Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 8 states of §2, exactly as tabled in §3.

**(b) Symbol-label table + term-introduction ledger (scar `symbol_printed_on_canvas_before_the_lesson_defines_it` — an instrument printing a symbol counts as USING it; every reveal appears AFTER its defining narration sentence):**

| Quantity | Label | DEFINED at (narration) | First PRINTED at | Check |
|---|---|---|---|---|
| Angular momentum | `L` (axle arrow + HUD `L = 6.12 kg·m²/s`) | S1 sentence 1–2 ("the spin momentum L — moment of inertia times angular speed") | S1, after that sentence | ✓ |
| Moment of inertia | `I` (HUD `I = 3.06 kg·m²`) | S1, same defining sentence | S1, readout builds after it | ✓ |
| Angular speed | `ω` (HUD `ω = 2.0 rad/s`) | S1, same defining sentence | S1, readout builds after it | ✓ |
| Each sliding mass | `m` (small tag; S8 slider label `m`) | S1 narration: "a rod carrying two equal masses, m each" | S1 tag, after that clause | ✓ (REV 2: definition clause added to S1 — previously the tag printed undefined) |
| Mass radius | `r` (line from axle to a mass, tip tracking) | S2, first "radius" sentence | S2, line grows on that beat | ✓ |
| Before/after subscripts | `I₁ω₁ = I₂ω₂` (S3 formula surface) | S3, one clause ("before and after the slide") | S3 | ✓ |
| Kinetic energy | `KE` (HUD `KE = 6.1 J` + bar with tick) | S4 opening sentence | S4 — never earlier (don't pre-spoil) | ✓ |
| External torque | `τ_ext` (label at the brake pad) | S6, as the pad engages | S6 | ✓ |
| Rate of change of L | `dL/dt` (formula surface + readout) | S7 | S7 only (advanced) | ✓ |

json_author note (scar `ecp_glow_targets_missing_primitives`): every teacher_script glow target must name a primitive the state actually builds — per state, glow-target set ⊆ built object ids.

**(c) Right-hand-rule plan:** S5 uses the **grip rule** (fingers curl with the spin, thumb gives L along the axis) — grip, not cross-product, because this state teaches circulation→axis direction, not a single r × p (that construction belongs to `angular_momentum` #9 / `torque` #5 per the survey union). The hand performs one full curl + flip cycle as an AUTHORED loop; visual vocabulary follows the existing field_3d RHR hands (pattern only — those are orientation-fixed; this one flips, `[NEEDS-SCENARIO]`).

**(d) Motion plan:** S1 spin + instrument build-in · S2 radial slide-in + spin-up (cause 0.7 s before effect) · S3 radial slide-out + spin-down · S4 tick-first, then full in-out cycle + KE bar tracking · S5 camera reframe + hand curl + authored spin-reversal + L-arrow flip loop · S6 brake pad translate-in + joint ω/L decay (rest-clamped, never reversing) + release-and-hold · S7 equation build + slow S2 replay with dL/dt = 0.00 · S8 free-running sandbox with idle auto-sweep (Rule 37 auto-continuous). No passive state. **No claim without a rendered measurement** (scar `oncanvas_formula_asserts…` DoD line): every number any HUD or narration states is produced by the §3 readout metrics for THAT state.

**(e) Modes:** conceptual-only (Rule 20 [D] — no `mode_overrides` authored).

**(f)** `assessment` + `coverage_map` authored (physics_author supplies items: new-ω calculation, KE-ratio item, τ_ext-condition item, L-direction item); `misconception_watch` exactly the 3 entries of §4.

**(g) Macro↔micro (Rule 33):** N/A-with-justification as stated in §3 — mechanism fully visible at the taught level; live numeric instruments per state as tabled.

**(h) Canvas budget (Rule 34):** per state as tabled in §3 — one formula surface, ≤5-word delta cue, value-only HUD, all-Unicode math across DOM + any canvas text + sprite labels. New DOM panels anchor at `top:52px+` on BOTH edges (OPEN scar `field3d_sliders_panel_top12_vs_fsbtn_top10` — clear `#fsTopControls` right AND `#simPenBar` left).

**(i) Curriculum-flex block (Rule 38):**
- **(i-1) Preset-cut coherence — checked over states AND explore controls:** *Hide advanced (drop S7):* S1–S6 + S8 — coherent; nothing in S1–S6/S8 references dL/dt or the derivation; S8 controls r/ω₀/m/spin-direction/brake all map to surviving guided states. *Hide advanced+extended (drop S5–S7):* S1–S4 + S8 — coherent; S1 states the "no external torque" condition qualitatively in its own narration, S4 closes the energy story, S8's surviving controls (r/ω₀/m, min_ring core) all map to S1–S4; the brake and spin-direction controls are CUT with their ring. No surviving state or control names the brake, the vector direction, or dL/dt.
- **(i-2)** Explore state = core-ring CONTENT only: formula `L = Iω` (stated by S1, which survives every preset — scar `explore_state_formula_surface_asserts_a_relation_no_state_derives` checked per preset), labels all established in S1–S2 ✓; controls ring-gated per §3.
- **(i-3) `curriculum_tags` (claims, not facts):** CBSE/NCERT: covered (NCERT Ch.7, conservation of angular momentum §7.13-area) — verifiable at authoring, marked verified. JEE Main/Advanced: core+extended+advanced — `needs_teacher_verification`. NEET: core+extended — `needs_teacher_verification`. IB DP Physics / A-level / AP Physics C: rings claimed core(+advanced for AP C / A-level rotational dynamics options) — every cell `needs_teacher_verification: true`.
- **(i-4) Preset proposal (hide, never reorder):** `full` = S1–S8 · `no_derivation` = hide S7 · `qualitative_core` = hide S5–S7 (explore controls auto-cut by min_ring in each).
- **(i-5) Graph axes (38e):** no graph in this concept's core or extended rings (live readouts carry the numbers; the S7 replay uses a readout, not a curve) → no axis-convention conflict exists. N/A by design, not by omission.

**Teacher-usability walk (directive `directive_no_gate_asks_whether_a_teacher_could_use_it` — answered in writing):** (1) *Does anything on screen state the law and show it in the assessed representation?* Yes — S1's narration states it in words, S3's formula surface shows **I₁ω₁ = I₂ω₂** (the form every exam uses; added in REV 2), S7 formalizes τ_ext = dL/dt. (2) *What is the first thing a teacher will try after the aha, and is it demonstrable in the authored range?* Drag the masses themselves and watch L hold — exactly S8's r slider over [0.2, 0.8] m, with ω responding 2.0–9.3 rad/s in the authored clamp; also "what if something DOES touch it" — S6's brake. (3) *For every term and symbol, does definition precede use?* Yes — the ledger in §10(b), including the REV-2 fix for `m`.

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs.** `angular_momentum` → breaks at **S1**: a student who has never met L = Iω sees three readouts with no meaning; S1's first narration sentence re-states it in one breath ("the spin momentum L — moment of inertia times angular speed") without condescending. `moment_of_inertia` → breaks at **S2**: if I is a mystery, "I falls when the masses come in" is magic; S2's choreography patches it by having the `r` line shrink WITH the I readout so I-follows-r² is seen even if not derived. `rotational_work_energy` → breaks at **S4**: one clause re-anchors KE = ½Iω² as the bar appears. `tau_eq_i_alpha` → breaks at **S6**: one clause — "a torque is what changes rotation" — as the brake engages.

**JEE-backwards trace.** *"A person stands on a frictionless rotating platform with a 2 kg mass in each hand. With arms out, I = 3.0 kg·m² and ω = 2 rad/s. Pulling the masses in reduces I to 0.66 kg·m². Find (i) the new ω, (ii) the ratio of final to initial kinetic energy, (iii) where the extra energy came from."* Piece (i) I₁ω₁ = I₂ω₂ and why → S1–S3 (the equation itself now ON SCREEN at S3). Piece (ii) KE = L²/2I ⇒ KE₂/KE₁ = I₁/I₂ → S4 (algebra surfaced in S4's deep-dive cluster `ke_ratio_formula`; the state itself shows 6.1 → 28.4 J). Piece (iii) work done by the person → S4. Condition-check distractor ("platform has friction") → S6. Vector-direction variant → S5. No missing piece.

**Misconception entry mapping (16a).** All three wrong beliefs are confronted proactively in EPIC-L per §4. Planting risk: S2's narration could itself plant "energy for free" if it says the spin-up "costs nothing" — physics_author is instructed to say "no external torque" (torque-free ≠ effort-free) and S4 detonates the residue two clicks later. No EPIC-C branches (fallback deferred).

## Block 2 — Aha-moment designation

- **PRIMARY aha (the 10-year memory), at S2:** *pull your arms in and you spin faster all by yourself — because L = Iω cannot change when nothing outside twists you.*
- **SUPPORTING aha (1), at S4:** *the speed-up is not free — kinetic energy goes UP, paid for by the real work of pulling the masses inward.* Cohesion: it deepens the primary directly (same event, energy ledger of it) — it does not stand alone. Total = 2 (sweet spot).
- **Wrong-belief setup.** For the primary: S1 deliberately builds "nothing external acts, so nothing about the spin will change" — one full state of confident steadiness before S2 breaks the ω half of that belief while keeping the L half. For the supporting: S2+S3 build "the trade is perfectly reversible, so nothing is gained or lost" — S4 shows exactly what is NOT conserved inside that reversible-looking trade.
- **Foundational coverage:** S2 ∈ foundational (S1–S4) ✓.

---

## ENGINE REQUIREMENTS THIS SKELETON IMPOSES (for `field3d-surgeon`, build 0c-1)

All rows `[NEEDS-SCENARIO]` — nothing here is claimed live. Union rows E1–E9 are from the survey's closed union table; F1–F4 are findings this skeleton adds.

**Union rows (build as listed):**

1. **E1 — Live-recomputed I from the mass distribution, every fixed step** — `I(t) = I_frame + Σ mᵢ rᵢ(t)²` with rᵢ varying DURING rotation. Never an authored constant. (Union #10 — the named hardest requirement.)
2. **E2 — Conservation integrator mode: L pinned, ω responds** — `ω(t) = L / I(t)` each step, θ integrated from ω on the Rule-36 fixed-step clock. L is the state's invariant, set from entry conditions (compute ω from L, don't integrate α — the exactness the pinned-L readout depends on). **Integrator discipline (directives `spec_semi_implicit_euler_position_not_step_count_invariant`, `explicit_linear_drag_is_unstable…`):** θ update must be fold-exact/step-count invariant (trapezoid form where a is involved; dt-fold probe compares POSITION as well as velocity at 1e-9); sub-step count recovered from real dt (n = round(dt/h)); dt = 0 under a pin takes zero steps.
3. **E3 — Torque integrator mode: α = τ_net / I** — used by S6 (brake) and S8 (brake live), shared verbatim by #7 `tau_eq_i_alpha` and (with τ = −κθ) #14.
4. **E4 — Radial mass translation choreography** — two masses slide symmetrically on an authored ramp (r: 0.8 ↔ 0.2 m over ~2 s, clamp [0.2, 0.8] inset from axle and rod tip) while the body rotates; also drivable live by the S8 slider (trusted-drag seizes, live-instrument model); S8 additionally runs an authored idle auto-sweep until first trusted input (so THE EYE can gate the sandbox).
5. **E5 — L vector along the axis** — arrow on the axle, length ∝ |L|, flips with spin sign (S5).
6. **E6 — KE_rot readout** — ½Iω² live; S4 bar scaled 1.1× the reachable peak (28.4 J).
7. **E7 — Grip-rule hand that tracks spin direction** — curl + thumb along axis, must flip when ω reverses (existing hands are orientation-fixed; this makes orientation live).
8. **E8 — Value-only HUD instruments** I / ω / L / KE with live numbers per the §3 metrics (L = the per-frame product I·ω in BOTH modes, never an echo of the invariant) + a hold-glow treatment on a pinned readout (brightness only, Rule 29). New top-anchored DOM panels at `top:52px+` BOTH edges (OPEN scar `field3d_sliders_panel_top12…`). Per-state control rows hide with `visibility:hidden` + disabled input, never `display:none`; rows built only for tokens THIS concept names; thumbs re-synced from the engine record on state entry (directive `field3d_per_state_slider_rows_collapsed…`).
9. **E9 — deriveStateMeta.ts co-edit in the SAME change, THREE sites** (directive `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys…`): (1) append the per-state config key to `F3D_REVEAL_KEYS`, (2) reveal-ms block in `maxRevealForField3dState`, (3) hold classification in `deriveHoldExpectations` — proven against BOTH the concept-JSON shape and the flattened shape. Continuous-spin states classified so the always-rotating home pose never reads as a frozen tail. Plus: no literal backticks anywhere in the renderer template body (verify `new Function(FIELD_3D_RENDERER_CODE)` via tsx — magnetic_flux_loop directive); the new scenario's apparatus must not be blanked by the generic `visible_elements` matcher (directive `field3d_generic_visible_elements_matcher…`); no per-state flag may select a build-time mesh parent/branch (directive `field3d_build_once_body_reads_a_per_state_flag…`).

**Findings — needed by this skeleton but NOT in the union table (raised NOW, at 0b, per the alarm rule):**

- **F1 — Static reference tick on a readout/bar ("wrong expectation" marker).** S4's Rule-16a contrast needs a thin labelled tick at the starting KE ("if energy stayed constant") that the live bar climbs past — the NAMED primitive that draws the misconception picture (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`: naming it at design time is the prevention). Sequencing contract: the tick reveals FIRST, alone, on its narration beat; the cycle starts after (sequential contrast, never superimposed). Generic form: an authored `reference_marks` entry on any readout/bar (value + short label) — #12's rolling race could reuse it. Cost: small.
- **F2 — External brake-torque source with a visible actuator, FRICTIONAL semantics.** A pad mesh that translates in, contacts the rim (cause), applies an authored opposing τ (effect after the readable beat), releases on cue, magnitude drivable by the S6/S8 slider. **Hard contract (scar `nlb_frictionless_state_with_an_opposing_applied_force_reverses…`):** the brake torque opposes ω and rest-clamps at ω = 0 — it must NEVER reverse the spin at ANY reachable slider value; probe: seize the slider, run 20 s, assert ω is monotone-decaying to ≥0 and no rendered sign ever flips. **Time-pin contract (directive `hysteretic_state_cannot_be_latched_under_a_time_pin`):** S6's authored engage/decay/release means L(t) is closed-form piecewise in state-local t — compute it by replay/closed form, never by latched mutation, so `SET_TIME_FREEZE` rewinds reproduce it exactly. A brake is also the natural τ source for #13 `flywheel_application` — build once as generic `external_torque: {type: brake, tau, engaged}`. Cost: small.
- **F3 — Per-state (and in S8, LIVE) integrator-mode switch on one apparatus** (mode E2 ↔ E3 within a single concept; S8 flips to torque_driven while its brake slider > 0 and back). Making the mode per-STATE config (with the S8 live flip driven by the brake control) is what keeps S6/S8 pure JSON. Contract-shape check (scar `state_added_at_review_outruns_the_config_contract_shape`): every §3 state is expressible as ONE config object under this shape — verified state-by-state in the walk below. Cost: zero if designed in now.
- **F4 — Authored spin-reversal cue (NEW in REV 2, surfaced by the per-state walk).** S5's authored loop reverses the spin with no teacher input: an eased ω → −ω transition through zero on the state clock (scenario_cue channel, never a bare hardcoded ms), with the L arrow and grip hand tracking the sign. The S5 toggle drives the SAME mechanism live. The union table's E5 flip-with-sign row covers the ARROW; the authored reversal choreography itself was unlisted. Cost: small.

**Per-state × engine-row WALK (scar `phase0_union_table_asserted_not_walked_state_by_state` — both directions):**

| State | Consumes |
|---|---|
| S1 | E1, E2, E5 (arrow draw-in), E8, E9 |
| S2 | E1, E2, E4 (authored ramp in), E8, E9 |
| S3 | E1, E2, E4 (ramp out), E8, E9 |
| S4 | E1, E2, E4 (full cycle), E6, E8, **F1**, E9 |
| S5 | E5 (flip), E7, **F4**, E8, E9 |
| S6 | E1, E3, **F2**, **F3**, E8, E9 |
| S7 | E1, E2, E4 (slow replay), E8 (dL/dt readout), E9 |
| S8 | E1, E2, E3 (live brake), E4 (slider + idle sweep), E8 (all rows), **F2**, **F3**, E9 |

Reverse direction: every row E1–E9, F1–F4 is claimed by ≥1 state ✓; every state claims ≥1 row ✓. No state is under-specced; no row is speculative.

**Registration note (OPEN scar `field3d_particle_field_vestigial_dual_panel_config_gap`, going-forward clause):** when json_author authors this concept, the `concept_panel_config` row (default_panel_count=1) is inserted in the SAME session — never left to the JSON-fallback default.

**Explicitly NOT required by this concept** (don't build on its account): graphs/curve panels, energy bars beyond the single KE readout+tick, a human figure mesh, precession/gyroscope machinery, multi-body fragmentation (that's #2's row), the r × p cross-product construction (that's #5/#9's row). No inverted-sibling cut-line flags arise (no sibling scenario exists yet — directive `teach_inverted_scenario_inverts_cutline_flags` becomes live when #7/#13/#14 reuse this scenario: each must surface the quantity IT owns, never inherit this concept's suppression choices). No engine value is declared "fixed" anywhere in this skeleton (scar `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` — obligation transfers to 0d authoring, where both the config type and the reader function get quoted by line).

---

## SCAR AUDIT

Every `alex:architect` row + every relevant directive; verdicts against THIS revision.

| bug_class | Owner | Verdict |
|---|---|---|
| `explore_controls_not_ring_gated_survive_the_ring_cut` | alex:architect | **fixed-in-this-revision** — min_ring on every explore control; cut-check runs over the control list (§3); REV-1's founder-proxy escalation removed, answered by this row |
| `archetype_live_tier_unverified_against_renderer` | alex:architect | **fixed-in-this-revision** — explicit blanket `[NEEDS-SCENARIO]` declaration in the header; no [LIVE] claim anywhere; verification obligation transferred to 0c-1 |
| `phase0_union_table_asserted_not_walked_state_by_state` | alex:architect | **fixed-in-this-revision** — per-state × row walk table, both directions; the walk surfaced F4 (spin-reversal cue), proving its value |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | alex:architect | **fixed-in-this-revision** — archetype-discharge rule stated; S5/S6 audited honestly: both have authored beats (looping reversal; authored brake engage/release) that discharge the archetype with zero teacher input; toggle/slider are layered contextual controls only |
| `symbol_printed_on_canvas_before_the_lesson_defines_it` | alex:architect | **fixed-in-this-revision** — full term-introduction ledger in §10(b); the `m` tag previously printed undefined, now defined by an S1 narration clause; instruments build only after their defining sentence |
| `teach_visual_must_match_narration` | alex:architect | **satisfied** — audited claim-by-claim: "L stays pinned" = hold-glow + flat readout; "KE rises" = bar past tick; "does not recover" = held lower L; "work done" = the tick-bar gap (= ΔKE, which the engine computes) |
| `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` | alex:architect | **fixed-in-this-revision** (generalized) — r clamp [0.2, 0.8] m inset from both bounds (axle r=0 and rod tip 1.0 m); no home pose on a bound |
| `narration_attributes_an_effect_to_a_cause_the_model_does_not_contain` | alex:architect | **satisfied** — all numbers recomputed and closed against the stated model (m=2.0, I_frame=0.50): 3.06→0.66 kg·m², 2.0→9.27 rad/s, 6.1→28.4 J; S4's "work" attribution = ΔKE, arithmetically what the engine produces |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | alex:architect | **fixed-in-this-revision** — all formula surfaces symbolic; every HUD number produced by a defined engine metric; S7's `dL/dt = 0.00` re-specified as a per-step finite difference of the frame-recomputed I·ω product (a rendered measurement); "no claim without a rendered measurement" carried as a DoD line |
| `derived_readout_asserted_by_value_without_defining_its_metric` | alex:architect | **fixed-in-this-revision** — §3 metrics block; L readout = per-frame I·ω product in both modes (capable of disagreeing; disagrees in S6), never an echo of the invariant |
| `derivation_principle_applied_to_one_beat_but_not_its_sibling` | alex:architect | **satisfied** — the derived-not-authored test applied to every beat: all readouts (I, ω, L, KE, dL/dt) drive from the same live metrics; no authored-value beat remains |
| `concept_taught_its_own_quantity_without_the_canonical_picture` | alex:architect | **fixed-in-this-revision** — the assessed representation I₁ω₁ = I₂ω₂ now ON the S3 formula surface (REV 1 never showed it) |
| `lesson_never_states_the_principle_it_is_named_after` | alex:architect | **fixed-in-this-revision** — S1 narration STATES the law in words; S3 SHOWS the assessed form; S7 formalizes; teacher-walk question 1 answered in writing |
| `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive` | alex:architect | **satisfied** — every misconception picture has a NAMED primitive (F1 tick; hold-glow; flippable hand/arrow), named at design time as engine requirements |
| `contrast_ghost_coresident_with_the_real_set_fuses_both` | alex:architect | **satisfied** — S4 contrast is SEQUENTIAL (tick alone first, then the cycle); a thin tick vs a bar is not two co-resident similar sets, and countability is not in play |
| `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | alex:architect | **fixed-in-this-revision** — stool → S2 (~8 words reserved), diver → S3 (~10 words); no pre-spoil |
| `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger` | alex:architect | **fixed-in-this-revision** (generalized) — S6/S8 brake specified FRICTIONAL with rest clamp; seized-slider 20 s probe contract written into F2; the state can end and stays ended for every reachable slider value |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | alex:architect | **fixed-in-this-revision** (generalized) — pin-margin discipline: asserted end-configuration before 55% of loop, ≥167 ms margin to the 60% pin, computed at engine step size by physics_author |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | alex:architect | **N/A** (no checkpoints/stamp mechanism in this scenario) — the transferable 55%-of-loop discipline is adopted above |
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | alex:architect | **N/A** (no `newtons_laws_body` checkpoints) — home-pose numerics are nonetheless stated absolutely (r values, clamp) in §2 |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` | alex:architect | **N/A** — single apparatus, no multi-body lanes in any state |
| `explore_state_formula_surface_asserts_a_relation_no_state_derives` | alex:architect | **satisfied** — S8's `L = Iω` is stated by S1, which survives EVERY preset; checked per preset in §10(i-1)/(i-2); no second closed form left unreconciled (S2's ω = L/I is the same relation rearranged, derived on-screen in S2 which also survives every preset) |
| `teach_do_not_prespoil_a_later_reveal` | alex:architect | **satisfied** — KE first at S4, τ_ext at S6, dL/dt at S7; ledger enforces |
| `teach_concrete_before_abstract_compare` | alex:architect | **satisfied** — S1 steady case ALONE before S2's change; S4 tick before bar |
| `teach_distinct_reference_lines_for_two_radii` | alex:architect | **N/A** — only one radius r (symmetric masses share it); no second radius exists to conflate |
| `teach_coordinate_sim_with_graph` | alex:architect | **N/A by design** — no graph in any ring (§10 i-5) |
| `teach_field3d_explore_grab_and_move_field_point` | alex:architect | **satisfied (pattern applied)** — S8 is a live-instrument sandbox (trusted-drag seize) + REV-2 idle auto-sweep so THE EYE can gate it; a direct grab-the-mass handle is a candidate reuse of the draggable-handle primitive when built, not required by this skeleton |
| `teach_inverted_scenario_inverts_cutline_flags` | alex:architect | **N/A now** — no sibling scenario exists; carried as an explicit note for #7/#13/#14 reuse (Engine Requirements, final paragraph) |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | alex:architect | **N/A** — no engine exists, no value declared fixed; quote-both-line-numbers obligation transferred to 0d and noted |
| `closed_enum_cannot_name_a_substance_the_design_teaches` | alex:architect | **fixed-in-this-revision** (generalized) — the control-token enum (r, ω₀, m, spin_sign, brake_τ) diffed against every control named in the state tables ✓; no species enum exists; no renderer table to read yet (scenario unbuilt) |
| `state_added_at_review_outruns_the_config_contract_shape` | alex:architect | **satisfied** — shape check done now: every state expressible as ONE config object under the F3 per-state-mode shape (walk table); rule carried forward for any state added at review |
| `chemistry_concept_id_collides_with_rostered_physics_id` | alex:architect | **satisfied** — checked both `src/data/concepts/` and `chemistry/`: no `conservation_of_angular_momentum` (or any "angular" id) rostered |
| `directive_no_gate_asks_whether_a_teacher_could_use_it` | ambiguous | **fixed-in-this-revision** — the three-question teacher walk answered in writing (§10) |
| `teach_reveal_synced_to_narration` | alex:physics_author | **satisfied** (S1 instrument build, S7 equation build synced to narration; carried as physics_author instruction) |
| `teach_show_quantity_live_when_named` | alex:physics_author | **satisfied** (r line grows at S2 on the first "radius" sentence; ledger enforces the pattern for every symbol) |
| `teach_color_each_element_by_its_own_sign` | alex:physics_author | **N/A** — no signed populations; L's sign is carried by arrow direction, an aggregate indicator, which is the row's permitted case |
| `teach_read_dense_ramp_frames_not_just_frozen` | peter_parker:visual_validator | **satisfied** — S2/S3/S6 in-state ramps flagged for dense-frame reading (§3 pin-margin paragraph) |
| `field3d_sliders_panel_top12_vs_fsbtn_top10` [OPEN] | peter_parker:renderer_primitives | **satisfied** — top:52px+ both-edges requirement written into E8/§10(h) |
| `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` [OPEN] | peter_parker:renderer_primitives | **satisfied** — E9 upgraded to the THREE-site contract + flattened-shape probe |
| `magnetic_flux_loop_scenario_new_build` (backtick + same-change deriveStateMeta) | peter_parker:renderer_primitives | **satisfied** — folded into E9 |
| `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` [OPEN] | peter_parker:renderer_primitives | **satisfied** — E9 note: private id index or force-visible in own apply |
| `field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently` [OPEN] | peter_parker:renderer_primitives | **satisfied** — E9 note: no per-state flag selects a build-time branch; F3's mode switch specified as a runtime path |
| `field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump` [OPEN] | peter_parker:renderer_primitives | **satisfied** — E8: visibility:hidden + disabled, concept-scoped rows, entry re-sync |
| `spec_semi_implicit_euler_position_not_step_count_invariant` [OPEN] | peter_parker:renderer_primitives | **satisfied** — E2 integrator discipline (position fold-exactness probe) |
| `explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires` [OPEN] | peter_parker:field3d_surgeon | **satisfied** — E2/F2: sub-step count from real dt; brake is constant-magnitude frictional with rest clamp (not explicit linear drag); if physics_author adds any velocity-proportional damping it must be implicit |
| `hysteretic_state_cannot_be_latched_under_a_time_pin` | peter_parker:field3d_surgeon | **satisfied** — F2 time-pin contract: S6's L(t) closed-form piecewise, replayed not latched |
| `field3d_particle_field_vestigial_dual_panel_config_gap` [OPEN] | peter_parker:runtime_generation | **satisfied** (going-forward clause) — concept_panel_config row inserted same-session at 0d, noted in Engine Requirements |
| `ecp_glow_targets_missing_primitives` [OPEN] | alex:json_author | **satisfied** — §10(b) json_author note: glow-target set ⊆ built object ids per state |
| `nlb_seized_slider_run_overruns_a_loop_sized_work_scale` | alex:json_author | **satisfied** (generalized) — S4's KE bar (the only bar) sized 1.1× reachable peak; S8 has no bars, only numeric readouts with no scale to overrun |
| `solenoid_*` rows (annotation orphaned / narrated-not-shown / hand-flip unimplemented / gesture sequencing / focal on title) [OPEN] | mixed | **satisfied** (lessons absorbed): every narrated visual here has a named drawn mechanism; reveals ride the ledger + narration sync; F4's reversal cue uses the scenario_cue channel; glow focals point at physics elements (hold-glow on the L readout, pad, arrow — never the title) |
| `ghost_compare_cause_invisible_slider_frozen` / `ghost_compare_b_handoff_instant_snap` [OPEN] | peter_parker:renderer_primitives | **satisfied** (lessons absorbed): S8's idle sweep must move the r slider thumb + numeric label in lockstep; S3's return to home pose is an eased authored ramp, no instant snap between beats |
| `camera_solve_searched_in_one_axis…`, `eye_motion_map_reads_cached_physics_config…`, `CACHE_UPSERT_CONFLICT…`, `field3d_formula_overlay_generic_not_cambria_math`, label-overlap/kerning rows, `radius_scenario_F_r_label_kerning`, `cyclotron_timers…`, `graph_title_caption_zorder`, `caption_clipped_by_adjacent_stat_box` | peter_parker:* | **N/A for the skeleton** (engine/validator-side; the layout rows are absorbed generically by §10(h)'s distinct-zones + 52px clearance; Cambria-Math requirement already in Rule 34b spec for the formula surface) |
| `verification_via_applystate_bypasses_player_false_hang` | peter_parker:visual_validator | **N/A** (verification-procedure directive; binds the 0c-1/0d verification sessions, not the design) |

**Net changes vs REV 1:** min_ring explore controls (escalation removed) · blanket [NEEDS-SCENARIO] declaration · per-state×row walk (surfaced F4) · term ledger + `m` definition fix · S3 formula surface → I₁ω₁ = I₂ω₂ · authored numeric ground truth (m, I_frame, clamp insets) · readout metrics defined (L = live product) · F2 frictional/rest-clamp + time-pin contracts · S4 sequential-contrast ordering + bar scale · anchor state assignments with word reservations · pin-margin discipline · teacher-usability walk · S8 idle auto-sweep · registration/panel-config and E8/E9 engine-hygiene notes. Everything else — atomic claim, 8-state arc, ring design, misconception plan, entry map, prerequisites, aha designation — is preserved from REV 1 unchanged.

*Handoff: → founder-proxy Checkpoint A on this skeleton before any engine code; then physics_author for exact functional forms (including #7's constant-I integrator forms, folded into the same physics block per the survey), then 0c-1 dispatch to field3d-surgeon on `feat/rotmech-engine`.*
