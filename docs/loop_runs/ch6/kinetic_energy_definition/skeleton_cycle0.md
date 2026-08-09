# ARCHITECT SKELETON — `kinetic_energy_definition`

> Chapter: Class 11 Ch.6 Work, Energy and Power · concept **#3** of 12 (approved teaching order, founder 2026-08-01)
> Renderer: `field_3d` / `scenario_type: "newtons_laws_body"` + the Phase-0c ENERGY LAYER (SEAMS K/L/M/N).
> **This is a 0d pure-JSON concept. Design target and verdict: ZERO renderer edits — see ENGINE FIT CHECK. No alarm.**
> Doctrine: Rules 11 · 16a · 19 · 23 · 24 · 25 · 31 · 32 · 33 · 34 · 35 · 38 · 41. Conceptual-only (Rule 20 [D]); EPIC-C branches: none.
> Siblings shipped: `work_done_by_constant_force` (#1), `positive_negative_zero_work` (#2) — clone their arc/controls discipline, not their content.
> **First-ever exercise of `energy_layer`.** No shipped concept authors one (`field_3d_renderer.ts` L43368, verbatim: *"No shipped concept authors one."*). Every `energy_layer` field this design uses is flagged in ENGINE FIT CHECK with its contract line and its exercise status.

---

## 0. Engine bug queue — consulted, live, this dispatch

Ran (Bash granted to this role 2026-08-02):

- `query_engine_bug_queue.ts --owner alex:architect` → 32 rows read.
- `query_engine_bug_queue.ts positive_negative_zero_work --open` → 10 rows read.

The six inherited directives named in the dispatch are all discharged below and each is cited where it binds. Further architect-owned rows from the full sweep that also bind here are discharged explicitly:

| Row | Where discharged |
|---|---|
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | §3 home-pose paragraph + §10(d): every `s_m` authored as `initial_position_m + d_target` arithmetic, never a literal. |
| `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` | §3: every home pose \|s₀\| ≤ 5.4 < 5.45; §3 bounding discipline proves no state ever REACHES a bound either. |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | §3 + §10(d): S5's later crossing at 0.34·R < 0.55·R. |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | §10(d) margin table — every asserted event ≥ 167 ms before `clamp(0.60R,150,R−150)`, computed at h = 1/60 with the 2-step discrete allowance. |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | §3 archetype audit — every archetype discharged by the AUTHORED beat between t = 0 and loop reset; the only slider-bearing state is the explore state. |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | §3 glow paragraph — **this concept authors ZERO `glow_focal`**, argued per state. |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` | §10(a)/(b) — every teaching string placed on a rendering path; §10(a) lists RENDERED primitives per state for Rule 19. |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` | §3 — S2/S4 author an off-axis camera AND a stagger; §3 states the world separation and hands physics-author the projection check. |
| `phase0_union_table_asserted_not_walked_state_by_state` | §"Phase-0 union walk" — walked in BOTH directions. |
| `teach_do_not_pre_spoil_a_later_reveal` / `symbol_printed_on_canvas_before_the_lesson_defines_it` | §10(b) TERM-INTRODUCTION LEDGER — formula reveal ladder (S1 none → S2 `K ∝ v²` → S3 `K = ½mv²`). |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | §10(b) — every number named anywhere is produced by a rendered instrument; DoD carries the "no claim without a rendered measurement" line. |
| `lesson_never_states_the_principle_it_is_named_after` | S3 STATES `K = ½mv²` in the **core** ring and S5 SHOWS it measured; both survive every preset cut. |
| `explore_controls_not_ring_gated_survive_the_ring_cut` | §10(i-2) — every explore control carries a `min_ring` and is re-checked under both cuts. |
| `explore_state_formula_surface_asserts_a_relation_no_state_derives` | §10(i-2b) — the explore formula is derived by S3, which is core and survives every preset. |

---

## 1. Atomic claim

This concept teaches ONE idea: **a moving body has kinetic energy `K = ½mv²` — proportional to its mass, proportional to the SQUARE of its speed, and never negative** — and only that.

It does NOT cover: what CHANGES kinetic energy (`W = ΔK` — the whole property of `work_energy_theorem`, #4); where kinetic energy goes when friction stops a body (`mechanical_energy_loss_with_friction`, #10); potential energy of any kind (#6/#7/#8); conservation (#9); power (#11/#12).

**Boundary with #4, stated deliberately and enforced mechanically — not merely claimed.** #3 owns *what K is and what it depends on*. #4 owns *work changes it*. The enforcement is a config invariant json-author can be held to and quality-auditor can grep:

> **`kinetic_energy_definition` authors ZERO `work_accumulators` blocks, in every state, guided and explore. No reader-facing string in this concept — title, delta cue, caption, formula surface, label, narration — contains the word "work" or the symbol W.**

That is the exact mirror of #1's boundary (#1 authors no `energy_layer`; verified at L42747/L43241 and shipped). It also has a mechanical side-effect that proves it on screen: `nlbEnergyPanelLabel()` (L43480-93) composes the left panel's teacher-facing name from what the CONCEPT authors — with energy bars and no work ledgers it returns **`"Energy bars"`**. #1's panel says `Work done`; #3's says `Energy bars`; #4's will say `Energy and work bars`. The boundary is legible in the chrome.

**A second boundary, declared rather than buried (see Refutations R3):** S5 uses friction to slow a cart so its K falls. Friction does work. #3 never draws a friction work bar, never asks where the energy went, and never states an equality — that question is #10's PRIMARY aha and stays intact.

---

## 2. State count + arc — 6 states (5 guided + 1 explore)

Medium concept (§5 calibration: medium = 5–6). Five separable claims plus a sandbox; each guided state proves something no other state proves:

| # | id | Ring | What this state PROVES that no earlier state does | teaching_method |
|---|---|---|---|---|
| S1 | `moving_body_has_energy` | core | Kinetic energy exists and is measurable: a cart in steady motion holds a reading of 40.0 J on the left-edge meter. Introduces K and its instrument. | (straightforward beat) |
| S2 | `speed_counts_twice` | core | K depends on the SQUARE of the speed: two identical 5 kg carts, one at 2 m/s and one at 4 m/s — the bars read 10.0 J and 40.0 J. **Four times, not two. PRIMARY aha.** | misconception_confrontation |
| S3 | `mass_counts_once` | core | K depends on mass, and only in proportion: at a fixed 4 m/s the mass climbs 2 to 8 kg and the bar climbs 16.0 to 64.0 J in lockstep. With both factors taught, the full formula `K = ½mv²` is assembled here. | (straightforward beat) |
| S4 | `never_negative` | core | K is a scalar with no direction and no sign: two identical carts at the same speed in opposite directions read exactly the same 22.5 J. **SUPPORTING aha.** | misconception_confrontation |
| S5 | `check_the_numbers` | extended | The meter's number really is ½mv², measured at two named points on ONE body: as the cart slows from 4.00 to 2.00 m/s the stamps read 40.0 J then 10.0 J — and when it stops, exactly 0.0 J. | (straightforward beat) |
| S6 | `explore` | core (explore) | Teacher's sandbox: speed and mass live, meter live. | exploration_sliders |

Rule 38a ladder: qualitative (S1–S4) then quantitative (S5) then derivation (**none — argued in §10(i) and Refutation R1**).

The hook MOVES from the first frame: S1 opens with the cart already crossing the floor, not a static setup pose.

---

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Home pose (Rule 32d — PERMANENT).** Flat floor (`surface.theta_deg: 0`, `length_m: 6` — a HALF-length, so the track spans −6…+6), frictionless in every state except S5. **Two stable body ids across the whole concept: `cart_a` (blue #42A5F5) and `cart_b` (red #EF5350)** — the mesh set is built once from the union of every state's bodies and only shown/hidden and re-seeded per state (config type L954-957), so there is no mid-concept rebuild. Single-body states author `cart_a` alone; `cart_b` appears only in S2 and S4. Body labels are rewritten on every state entry (L40404 comment, verbatim: *"rewritten on every state entry"*), so a per-state label is contracted, not a hope.

**Bounding discipline — load-bearing, because `energy_layer` makes `energy_active` true in EVERY state.** `eng.energy_active = !!(eng.energy_layer || eng.work_state || eng.checkpoint_state)` (L43075), and a body within 1e-9 of a track bound takes the clamp branch, which calls `nlbEnergyClampGuard` and emits `[PM_NLB_ENERGY_CLAMP]` — a prefix THE EYE asserts zero of. #1 could reason about this state by state; **#3 cannot, because every one of its states arms the guard.** Two binding consequences:

1. every home pose is inset — the largest magnitude authored here is **5.4**, against the 5.45 bound (`length_m − 0.55`);
2. every guided state's `loop_reset_ms` fires **before** its body reaches plus or minus 5.4 — arithmetic in §10(d). The clamp must never fire in an authored run. (S6 is `mode: 'sandbox'`: SEAM J's wrap is its loop and no clamp branch is taken.)

**Checkpoint arithmetic (scar row 1).** `checkpoints.s_m` is an ABSOLUTE track coordinate. Every flag is authored as `s_m = initial_position_m + d_target`, never as a bare literal. S5's two values are computed in §10(d).

**Camera.** Single-body states run the fleet-standard head-on `[0, 2.0, 10]`. **S2 and S4 place two independent bodies, whose lane separation is along z (`NLB_LANE_GAP = 0.85`, L39610; `nlbBodyLaneZ` L40179-40207) — a head-on camera would stack them.** Both author an off-axis camera `[3.5, 2.6, 9.5]` AND a start stagger that keeps the two bodies separated ALONG THE TRACK for the whole loop (a monotonically increasing gap in both states — neither pair ever closes). The camera moves only when the body count changes, which is precisely the new thing being framed (Rule 32d).

| # | Teaches | Archetype | Distinct motion (the AUTHORED beat, no teacher input) | Delta cue (max 5 words) | Controls | Camera | Ring | Words |
|---|---|---|---|---|---|---|---|---|
| S1 | Kinetic energy exists and has a meter | `translate-through` | ONE cart (`cart_a`, 5 kg) coasting at a steady 4 m/s on a frictionless floor, s0 = −5.4, crossing the whole visible track; the left-edge K bar stands at **40.0 J** and the HUD carries its live speed. `loop_reset_ms = 2400` so the cart re-enters from the left and crosses again, forever. No formula surface (the ½mv² reveal is S3's — pre-spoil directive) | "Moving cart, K above zero" | none | `[0, 2.0, 10]` | core | 30–45 |
| S2 | K goes as v², not as v | **`race-compare`** (COINED — see audit) | TWO identical 5 kg carts released together on the same track in their own z lanes: `cart_a` "slow cart" at 2 m/s from s0 = −5.4, `cart_b` "fast cart" at 4 m/s from s0 = −3.4. The fast cart is 2.0 m AHEAD at release and pulls further ahead every frame (gap 2.0 m to 6.0 m over the loop — monotone, they never close). Two K bars, two captions: **10.0 J and 40.0 J**. The fast cart covers twice the ground per second and its bar is FOUR times as tall. `loop_reset_ms = 2000` | "Double speed, four times K" | none | `[3.5, 2.6, 9.5]` | core | 40–55 |
| S3 | K rises in proportion to mass — and the full formula | **`ramp-and-track`** (COINED — see audit) | ONE cart at a fixed 4 m/s (frictionless, so the speed genuinely never changes), `param_ramp {param:'m', from: 2, to: 8, end_ms: 7200}`. Across three traverses (`loop_reset_ms = 2400`) the billboard climbs `cart = 2 kg` to `cart = 8 kg` and the K bar climbs **16.0 J to 64.0 J** in exact proportion, while the HUD speed sits unmoved at 4 m/s (Rule 32b: only the taught variable moves). The formula surface assembles `K = ½mv²` here | "Double mass, double K" | none | `[0, 2.0, 10]` | core | 30–45 |
| S4 | K is a scalar: direction and sign do not enter | `race-compare` — **DECLARED CONTRAST PAIR with S2** (the delta names the flip: in S2 the carts differ in the SIZE of v and the bars come out 4:1; here they differ only in the SIGN of v and the bars come out identical) | TWO identical 5 kg carts starting 2.4 m apart near the centre and sliding APART: `cart_a` "left cart" at s0 = −1.2 with v = −3 m/s, `cart_b` "right cart" at s0 = +1.2 with v = +3 m/s. The gap only ever grows. Both K bars stand at exactly **22.5 J** — same height, same number, opposite motions. `loop_reset_ms = 1300` | "Backward: the same K" | none | `[3.5, 2.6, 9.5]` | core | 30–45 |
| S5 | The number on the meter IS ½mv² — measured | `flow-along-path` | ONE cart, 5 kg, launched at **6 m/s** onto a ROUGH floor (mu_k = 0.5, the only frictional state in the concept), s0 = −5.4. It flows past two flags. The first stamps `v = 4.00 m/s · K = 40.0 J`; the second stamps `v = 2.00 m/s · K = 10.0 J` — the speed halves, K quarters — both appended live beneath the authored `K = ½mv²`. It then slides to rest and the bar settles on exactly **0.0 J** and holds. `loop_reset_ms = 2400` | "Speed halves, K quarters" | none | `[0, 2.0, 10]` | extended | 40–55 |
| S6 | Teacher's sandbox | `drag-sandbox` | `mode: 'sandbox'` plus `trusted_drag_seizes`: drag the cart, drive the v0 and m sliders; the K bar and the HUD track continuously and the state free-runs forever (Rule 37, automatic). Sliders clamped concept-wide so K can never exceed the bar scale | "Change speed and mass" | ALL: `v0`, `m` (plus drag) | `[3, 2.5, 9]` | core | 0 / open |

**Archetype audit (scar `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control`).** Each archetype below names a motion the AUTHORED beat produces with NO teacher input, inside the state, between t = 0 and loop reset:

- `translate-through` (S1) — the cart traverses the track. Used once.
- **`race-compare` (S2, S4) — COINED, justified:** no seed archetype names a SIMULTANEOUS two-lane compare. `cycle-compare` is explicitly SEQUENTIAL (A, then B, then A again), the opposite of what these states do — their whole legibility claim is that both readings are on screen at the same instant. Used twice as a **declared contrast pair**, with the delta cues naming the flip (size of v becomes sign of v; 4:1 bars become equal bars).
- **`ramp-and-track` (S3) — COINED, justified:** an authored `param_ramp` drives ONE quantity monotonically on the state clock while an instrument tracks it. It is not `oscillate/track` (that is periodic) and not `reveal-build` (nothing is constructed). It is the engine's own §7.1 one-shot mechanism, is authored, and takes no teacher input.
- `flow-along-path` (S5) — the cart flows past flags that stamp. Used once.
- `drag-sandbox` (S6) — explore only. Used once.

No state is static: in S1/S2/S4 the carts translate; in S3 the mass and the bar both climb while the cart traverses; in S5 the bar falls continuously and two stamps land. No undeclared repeat.

**Glow focal — this concept authors ZERO `glow_focal`, in every state.** Rule 32e caps the focal at one; it does not require one (scar `state_glow_focal_dims_one_half_of_the_relation`). Argued per state: S1's claim is a relation between the moving cart and the bar (a focal on either dims the other); S2's and S4's claims are relations between TWO bars; S3's is a relation between the billboard mass and the bar; S5's is a relation between the flags and the formula surface. Every one is a relation. With no state-level focal, `glowActive` stays false, nothing dims, and any per-sentence `tts_sentences[].glow` bindings physics-author writes actually take effect — so the second open scar (`authored_state_glow_focal_silently_voids_every_tts_sentence_glow`) is avoided by construction rather than by luck.

**Cause-before-effect (Rule 32a).** S1/S2/S4: the carts are the cause and are the only things moving; the bars are readings, not events. S3: the mass ramp is the cause and the billboard number changes first — the bar's climb is its consequence. S5: the cart crosses the flag first and the stamp lands after; the cart comes to rest first and the bar settles on 0.0 J after.

---

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| Wrong belief (real, and the one this concept exists to break) | State | `misconception_watch` beat |
|---|---|---|
| "Twice as fast means twice the energy" — kinetic energy scales with speed the way momentum does | **S2** | `belief`: kinetic energy is proportional to speed · `visual_counter`: two carts of the SAME 5 kg mass, one at 2 m/s and one at 4 m/s, released together; the fast cart's bar reads 40.0 J against the slow cart's 10.0 J — four times as tall, not twice · `one_line_fix`: the speed is squared, so doubling the speed multiplies the kinetic energy by four |
| "A body moving backward has negative kinetic energy" — K inherits the sign of v | **S4** | `belief`: reversing the direction of motion reverses the sign of the kinetic energy · `visual_counter`: two identical carts at the same 3 m/s in opposite directions; both bars stand at exactly 22.5 J · `one_line_fix`: squaring the speed removes the sign, so kinetic energy is never negative |

S1, S3, S5 and S6 carry **no** `misconception_watch` — straightforward teaching. EPIC-C branches: NONE (EPIC-L-first directive 2026-06-10).

**Declared limitation on the 16a delivery, stated at design time rather than improvised at authoring time** (scar `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`): the wrong expectation in S2 would ideally be a DIM GHOST BAR at 20 J beside the real 40 J bar. **The engine has no ghost-bar primitive** — `energy_layer` renders one fill per authored quantity per group (L43536), a `ghost` body is excluded from the energy groups entirely, and the panel supports at most 2 groups (L43626). So the wrong expectation is NAMED IN NARRATION at the moment the two real bars are already on screen, and refuted by the measured heights. This is a deliberate descope, not an oversight, and **it is not routed** — building a ghost bar would be a renderer edit and therefore a Phase-0 alarm. Physics-author writes S2's narration to name the expectation and let the rendered bars answer it, and must not describe a bar that is not drawn.

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S2 `speed_counts_twice`** — the v-squared abstraction is the stickiest point in this concept and the one students re-ask in three or four phrasings.
- **S4 `never_negative`** — the sign/scalar confusion, historically tangled with momentum.

Two picks. Both coincide exactly with the Pass-1 cliff/misconception states (Block 1) — no divergence to document.

## 6. Drill-down clusters (3 candidates each; physics_author writes trigger_examples)

- S2: `why_v_squared` (where the square comes from, and why it is not the same as momentum) · `double_speed_quadruple_energy` (the 2x/4x arithmetic in words) · `speed_vs_momentum_scaling` (one is linear in v, the other quadratic)
- S4: `negative_velocity_positive_energy` (a signed velocity, an unsigned energy) · `energy_is_a_scalar` (no direction to point) · `kinetic_energy_cannot_be_negative` (v squared is never negative, so K is never negative)

## 7. `entry_state_map` (v2.2)

```
entry_state_map:
  foundational: STATE_1 -> STATE_3   # "what is kinetic energy" — contains the PRIMARY aha (S2)
  direction:    STATE_4              # "is kinetic energy negative when it moves backward?"
  quantitative: STATE_5              # "calculate the kinetic energy of ..."
```

Default aspect `foundational`. **Foundational-coverage rule satisfied directly** — S2 is inside STATE_1 to STATE_3, so no exit-pill is required. Cross-slice pills offered after the foundational slice: "What if it moves backward?" to STATE_4, and "Check it with numbers?" to STATE_5.

## 8. Prerequisites (advisory — Rule 23)

Shipped and relevant: `newton_second_law` (S5's deceleration under a real friction force) and `friction_force` (S5's mu_k, and the fact that a rough floor slows a body). Ch.5 kinematics groundwork (mass and speed as measured quantities) is assumed and patched in-state — see Block 1.

**Deliberately NOT prerequisites: `work_done_by_constant_force` (#1) and `positive_negative_zero_work` (#2).** Kinetic energy is definable and fully teachable without work — that independence is exactly what makes the #3/#4 boundary clean, and a teacher may open this concept first. The forward edges point from here to #4 and #9.

## 9. Real-world anchor (Rule 35 universal · Rule 38f widest-overlap · Rule 41 plain)

**Primary — a vehicle braking.** Everyone has been in a car or a bus that had to stop suddenly. Drive at twice the speed and the vehicle needs about FOUR times the distance to stop, not twice. That factor of four is the square in `K = ½mv²`, measured on the road. It is universal — vehicles, brakes and speed limits exist on every syllabus and in every country — and it names no place, brand, currency, festival or person. It is physics-true at full depth (the stopping distance really is v²/2μg, which #10 takes further), and it is the widest-overlap example in this topic: CBSE, IB, AP and A-Level all teach braking distance.

**Secondary — a hammer driving a nail.** Swing the hammer twice as fast and it drives the nail much deeper in one blow, because it has four times the kinetic energy when it lands. Universal, hands-on, no cultural framing.

The source catalog's mined anchors for A6 (railway porter, named-resort chairlift, ISRO casings) are pre-Rule-35 and India-specific — **NOT imported** (survey warning section).

---

## 10. Definition of Done (Gate 0 — no TBDs)

### (a) States and rendered primitives (Rule 19 measured against what is DRAWN)

The six states of §2, exactly as tabled in §3. `field_3d` never paints `scene_composition` annotations, so Rule 19 is counted against drawn objects only (scar `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations`):

| State | Drawn objects (3 or more each) |
|---|---|
| S1 | floor slab · cart_a · cart_a billboard (`cart = 5 kg`) · K bar with numeric · HUD `v` row |
| S2 | floor slab · cart_a · cart_b · two billboards · TWO K bars with group captions · HUD rows for both bodies |
| S3 | floor slab · cart_a · billboard (mass climbing) · K bar with numeric · HUD `v` row · formula surface |
| S4 | floor slab · cart_a · cart_b · two billboards · TWO K bars with group captions · HUD rows for both bodies |
| S5 | floor slab · cart_a · billboard · friction arrow · two checkpoint flags · K bar with numeric · formula surface carrying two stamps |
| S6 | floor slab · cart_a · billboard · K bar with numeric · HUD `v` row · two slider rows |

### (b) Symbol-label table — the ENGINE'S REAL strings (Rule 34c Unicode; read at source this dispatch, not cited from a report)

| Narrated quantity | On-canvas rendering (engine-true, with its source) |
|---|---|
| the energy panel's teacher-facing name | **engine-composed `"Energy bars"`** (`nlbEnergyPanelLabel`, L43480-93 — returns `"Energy bars"` when the concept authors energy bars and no work ledgers). NOT authorable; nothing authored may duplicate it |
| kinetic energy | bar symbol **`K`** (engine-hardcoded, `NLB_EN_SYM.K`, L43392), amber `#FFCA28` (`NLB_EN_COL`, L43396) |
| the reading | bare value under the bar: **`40.0 J`** (`nlbEnFx`, L43447-52). This concept authors `precision: 1` explicitly so the digit count is a decision, not a default |
| which cart a bar belongs to (S2/S4 only) | the group caption is the body's **raw authored `label`**, verbatim (L43637-44): `slow cart` · `fast cart` · `left cart` · `right cart` |
| the cart and its mass | floating billboard, composed as `<label> = <mass> kg` by `nlbBodyLabelText` (L40385-98) — e.g. `cart = 5 kg`, `slow cart = 5 kg`. Mass digits come from `nlbFxMass` (integers bare) |
| speed | HUD row per body: label `v` plus unit ` m/s` (`NLB_READOUT_LABELS` / `NLB_READOUT_UNITS`, L40301-13). **Rows are per body** (`nlbReadoutRowId(bodyId, key)`, L40319), so a two-cart state genuinely shows both speeds |
| friction (S5 only) | HUD row `f` plus ` N`, and the friction arrow |
| the checkpoint stamps (S5 only) | `nlbCpStampText` (L44755-96) composes `label + ":  " + parts.join("  ·  ")` with `K = <val> J` and `v = <val> m/s` (v at 2 dp, K at `precision`). Authored labels `first flag` / `second flag` render as **`first flag:  v = 4.00 m/s  ·  K = 40.0 J`** and **`second flag:  v = 2.00 m/s  ·  K = 10.0 J`**, appended in checkpoint order beneath the authored base formula (`nlbRenderStamps`, L44800+) |
| the formula | see the ladder below |

**TERM-INTRODUCTION LEDGER** (scars `symbol_printed_on_canvas_before_the_lesson_defines_it` and `teach_do_not_pre_spoil_a_later_reveal`). Every symbol that appears on canvas, and the state that DEFINES it:

| Symbol | First appears | Defined by |
|---|---|---|
| `K` (the bar symbol — unavoidable from S1, since the panel prints it) | S1 | **S1 narration must name it: "the meter on the left reads the cart's kinetic energy, K."** Non-negotiable: the instrument prints the symbol whether or not the narration earns it |
| `v` (HUD) | S1 | prerequisite (Ch.5); S1 narration names it as the cart's speed |
| `J` | S1 | S1 narration says "joules" |
| the proportional sign and `v²` | S2 | S2's formula surface **`K ∝ v²`** — the proportional form ONLY, so S3's full formula is not pre-spoiled and S2's own aha is not printed before the bars make it |
| `½`, `m`, and the full closed form | S3 | S3's formula surface **`K = ½mv²`** — assembled only after BOTH factors have been shown (v² in S2, m in S3). This is the state that STATES the law the concept is named after, and it is CORE ring, so it survives every preset cut |
| a negative v | S4 | S4's formula surface **`K = ½m(−v)² = ½mv²`** (U+2212 minus, U+00BD half, U+00B2 square) |

**S1 authors NO `formula_overlay`.** A formula-free guided state is precedented and Rule-34-clean; here it is load-bearing, because `K = ½mv²` on screen in S1 would print the answer to S2 one click before S2 earns it.

**"No claim without a rendered measurement"** — carried as an explicit DoD line per the `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` scar. Every number this concept names in narration is produced by a rendered instrument: K by the bar, v by the HUD row, m by the billboard, the checkpoint values by the stamps. **Nothing in this concept may name momentum, joules per metre, work, or a stopping distance as a NUMBER — none of those is rendered.**

### (c) Direction-rule plan

N/A, and deliberately so: kinetic energy is a scalar, which is literally S4's content. There is no right-hand rule and no direction glyph anywhere in this concept. The direction content here is the ABSENCE of direction, expressed by two carts moving oppositely with identical readings.

### (d) Motion plan, loop arithmetic, and the frozen-pin margins

`g = NLB_G = 9.8` (L39589). Body half-width 0.55 m; track half-length 6 m; usable inset bound at 5.4.

| State | Home pose | Motion | `loop_reset_ms` R | Position at t = R | Reaches a bound? |
|---|---|---|---|---|---|
| S1 | cart_a s0 = −5.4, v = 4 | constant-speed coast | 2400 | −5.4 + 9.6 = **+4.2** | no |
| S2 | cart_a s0 = −5.4 v = 2 · cart_b s0 = −3.4 v = 4 | constant-speed coast, two lanes | 2000 | **−1.4** and **+4.6** | no |
| S3 | cart_a s0 = −5.4, v = 4, m ramping | coast plus `param_ramp` m 2 to 8 over [0, 7200] ms | 2400 | **+4.2** | no |
| S4 | cart_a s0 = −1.2 v = −3 · cart_b s0 = +1.2 v = +3 | coast apart, two lanes | 1300 | **−5.1** and **+5.1** | no |
| S5 | cart_a s0 = −5.4, v0 = 6, mu_k = 0.5 | decelerate to rest past two flags | 2400 | at rest at **−1.727** from t = 1.225 s | no |
| S6 | cart_a s0 = −5.4, v0 = 4, m = 5 | sandbox, free-run | none (SEAM J wrap) | wraps | n/a |

**S5 flag arithmetic** (authored as `s_m = initial_position_m + d_target`, never a literal). a = mu_k · g = 0.5 × 9.8 = **4.9 m/s²**; d(v) = (v0² − v²) / 2a.

- first flag: v = 4.00 gives d = (36 − 16)/9.8 = **2.0408 m**, so `s_m = −5.4 + 2.0408 = −3.3592`; t1 = (6 − 4)/4.9 = **0.4082 s**; K = ½ × 5 × 16 = **40.0 J**
- second flag: v = 2.00 gives d = (36 − 4)/9.8 = **3.2653 m**, so `s_m = −5.4 + 3.2653 = −2.1347`; t2 = (6 − 2)/4.9 = **0.8163 s**; K = ½ × 5 × 4 = **10.0 J**
- rest: d = 36/9.8 = **3.6735 m**, s = −1.7265; t = **1.2245 s** analytic, and at most **1.2578 s** discrete (two steps of h = 1/60 allowed, because the rest clamp fires on a sign flip and the frame that fires it still reports the sliding value)

**Frozen-pin margins** (scar `nlb_frozen_pin_lands_within_one_frame_of_the_beat`). Pin at `clamp(0.60·R, 150, R−150)`. Only S5's DoD asserts discrete events:

| Asserted event | Event time at h = 1/60 (discrete) | Pin (R = 2400) | Margin | 167 ms or more? |
|---|---|---|---|---|
| the first stamp is on the formula surface | 0.4082 s, at most 0.4415 s | 1440 ms | **999 ms** | yes |
| the second stamp is on the formula surface | 0.8163 s, at most 0.8496 s | 1440 ms | **591 ms** | yes |
| the cart is at rest and the bar reads 0.0 J | 1.2245 s, at most 1.2578 s | 1440 ms | **182 ms** | yes |

**Checkpoint-versus-loop invariant** (scar `nlb_loop_reset_clears_checkpoint_stamp`). `nlbRunLoopReset` calls `nlbResetTrajectory()`, which wipes every stamp each cycle and re-fires it at that cycle's crossing. The later crossing must occur before 55% of R: t2/R = 816/2400 = **0.34, under 0.55**. The live consequence is stated honestly — the stamps blink off at each loop boundary and re-stamp within the same cycle; every instant from 34% of the loop onward, including the frozen pin, shows both stamped.

**Accepted trade in S5:** the cart is at rest from 1.26 s to 2.40 s, about 48% of the loop. This is NOT a dead tail — the cart at rest with the bar on exactly 0.0 J IS the state's closing claim (kinetic energy is zero when the motion stops). Declared, not overlooked.

**Pacing trade FLAGGED for founder-proxy, S4 only.** S4's 1300 ms loop is the briskest in the concept, forced by wanting bars tall enough to compare (22.5 J is 22.5% of the shared 100 J scale). The alternative is plus or minus 2 m/s with R = 2000 ms and calmer motion, at 10.0 J and therefore 10% bars. I chose deflection over calm because S4's whole claim is that two bars are EQUAL, and a 10% bar makes equality hard to read. Physics-author may take the alternative if the loop reads frantic at THE EYE; both are arithmetically clean.

**One-shots:** two checkpoints in S5 only, `capture: ['v','K']`, `capture_mode: 'first'` (re-arms per cycle). No `sum_merge`, no `height_markers`, no `phases`.

### (e) Modes

Conceptual-only (Rule 20 [D]) — no `mode_overrides`. `advance_mode`: `manual_click` on S1 to S5, `interaction_complete` on S6, which is 2 distinct modes and satisfies Gate 12. No `wait_for_answer` and no `pause_after_ms` anywhere (Rule 31).

### (f) `assessment` + `coverage_map` + `misconception_watch`, and the binding numeric constraints

`assessment` and `coverage_map` are authored by physics_author; every assessment item whose `teaches_state` is S6 must be answerable from something S6 actually RENDERS (scar). `misconception_watch` is exactly as §4 — **two entries, S2 and S4 only.**

- **(f-1) ONE shared `energy_layer.bar_max_J = 100` across ALL FIVE guided states.** This is deliberate and is what makes the concept legible as a whole: a bar's height means the same joules in every guided state, so a teacher can compare S2's 40 J bar with S4's 22.5 J bar by eye (Rule 32d taken to its conclusion). Peak values: S1 40.0 · S2 10.0 and 40.0 · S3 16.0 rising to 64.0 · S4 22.5 and 22.5 · S5 90.0 at launch. **Every one is under 100 J, so `[PM_NLB_ENERGY_SCALE]` is unreachable in any authored run** — the warn fires only at `val > maxJ + 1e-9` (L43798).
- **(f-2) The explore state authors `bar_max_J = 110` and clamps its own sliders so overflow is impossible by construction:** concept-wide `slider_controls.v0 {min: −5, max: 5, step: 0.5, default: 4}` and `slider_controls.m {min: 1, max: 8, step: 0.5, default: 5}`, giving K_max = ½ × 8 × 25 = **100.0 J, under 110**. Note the key is `default`, not `def` (`nlbSc` reads `o["default"]`). This scale deviation from the guided 100 J is the only one in the concept and is declared.
- **(f-3) Friction is declared everywhere, by name.** S1, S2, S3, S4 and S6 author `surface.frictionless: true` — a contracted key that hard-zeroes every body's mu for that state. Without it, S1 to S4's carts would decelerate and their constant-K claims would be false on screen. **S5 alone omits it and authors `mu_s: 0.5, mu_k: 0.5` on cart_a.**
- **(f-4) `energy_layer` is authored on every state**, with `bars: ['K']` and `precision: 1`. The two-body states additionally author **`body_ids: ['cart_a','cart_b']`**. Without it the panel shows ONE group carrying the RIG AGGREGATE (L43626-27, L43748-51), which for S2 renders a single 50.0 J bar and destroys the entire concept. **This is the single most dangerous line in the build.**
- **(f-5) `h_ref_m` is NOT authored** (default 0). Every state is flat (`theta_deg: 0`), so U_grav is identically zero and the negative-U warn at L43782 cannot fire. No U bar is shown anywhere.
- **(f-6) The S3 ramp's `from` must equal the authored body mass** (`mass_kg: 2` with `param_ramp.from: 2`) so state entry does not visibly jump — the engine's own §7.1 authoring contract (L1573-75).

### (g) Macro-micro plan (Rule 33)

**N/A with rationale.** The taught variable (a body's kinetic energy) and its cause (that body's own mass and speed) live at the same macroscopic level; there is no microscopic mechanism in scope. Where the energy goes when friction stops a body IS a micro story, and it is #10's — deliberately not opened here (see §1 and R3).

**Rule 33d instruments DO apply, and every one is a live numeric rather than a decorative dial:** the K bar carries its own value in joules; the HUD carries a per-body `v` row (and `f` in S5); the mass sits on the billboard and changes live as S3's ramp runs; the checkpoint stamps carry measured values at named places.

### (h) Canvas budget (Rule 34)

ONE formula surface per state, math-serif Unicode: S1 **none** · S2 `K ∝ v²` · S3 `K = ½mv²` · S4 `K = ½m(−v)² = ½mv²` · S5 `K = ½mv²` with the two stamps appended beneath it by the engine (the authored formula is held separately as `formula_base`, so a stamp can never eat it) · S6 `K = ½mv²`.

On-canvas caption is the 5-word delta cue ONLY; prose narration lives in `#capStrip` below the canvas. The HUD is value-only. **Zone map, verified non-colliding:** the energy panel is a `position:fixed` panel pinned to the LEFT edge at `left:12px, top:52px` with a measured reflow ladder (L43511-13; `NLB_EN_TOP_MIN_PX = 52` clears the review chrome), while the HUD, formula surface and slider rows all sit at the RIGHT edge. Different edges, no overlap. All math is real Unicode: ½ (U+00BD), ² (U+00B2), the proportional sign (U+221D), minus (U+2212), middot (U+00B7).

### (i) Curriculum-flex block (Rule 38)

- **(i-1) Cut check 1, hide `advanced`:** this concept has **no advanced-ring state** (argued in R1 below), so the cut is a no-op and `standard` is identical to `full`. Declared, not overlooked.
  **Cut check 2, hide `advanced` and `extended`, leaving S1, S2, S3, S4, S6:** coherent. Nothing in S1 to S4 or S6 references the checkpoint stamps, the flags, friction, or S5's 6 m/s launch. The concept still STATES its own law (S3's `K = ½mv²`, core ring) and still SHOWS both dependences with measured bars. What is lost is only the two-point numerical verification, which is a genuine extended-ring loss and exactly what the ring is for.
- **(i-2) The explore state surfaces CORE content only (38b):** S6's formula surface is `K = ½mv²` (established in S3, core), its instruments are the K bar and the `v` HUD row (S1, core), and its two controls are speed and mass — the two quantities S2 and S3 teach, both core. Nothing from S5 (flags, stamps, friction) appears in S6. **Every explore control carries a `min_ring`** (scar `explore_controls_not_ring_gated_survive_the_ring_cut`): `v0` has `min_ring: core` (taught by S2), `m` has `min_ring: core` (taught by S3). Under BOTH cuts every surviving control still maps to a surviving guided state.
- **(i-2b) The explore formula surface is derived by a surviving state under every preset** (scar `explore_state_formula_surface_asserts_a_relation_no_state_derives`): S3 states `K = ½mv²`, and S3 is core, so it survives every cut. There is no second closed form anywhere in this concept, so there is nothing to reconcile.
- **(i-3) `curriculum_tags` are CLAIMS, not facts (38g).** CBSE / NCERT Class 11 Ch.6 (Work, Energy and Power), NCERT Eq. 6.7 — **verified** at authoring. IB DP Physics, AP Physics 1, A-Level (AQA / OCR / Edexcel energy modules), JEE Main, JEE Advanced, NEET — all authored with **`needs_teacher_verification: true`**. No preset goes teacher-visible until a real teacher of that curriculum confirms it.
- **(i-4) Preset proposal (hide, never reorder — 38h and 25d):** `full` = S1 to S6 · `standard` = S1 to S6 (identical, since there is no advanced ring) · `intro` = S1, S2, S3, S4, S6.
- **(i-5) Graph-axis convention:** N/A — there is no graph panel. The K bar is a vertical magnitude meter with a fixed zero at the bottom, not a plot, so no board-dialect axis conflict exists and no axis-swap toggle is needed.

### Rule 41 audit of every reader-facing string

**State titles** (short, literal, front-loaded, because the rail truncates): "A moving cart has kinetic energy" (S1) · "Twice the speed, four times the energy" (S2) · "Twice the mass, twice the energy" (S3) · "Kinetic energy is never negative" (S4) · "Check the numbers: K = ½mv²" (S5) · "Explore: change speed and mass" (S6).

**Delta cues:** "Moving cart, K above zero" · "Double speed, four times K" · "Double mass, double K" · "Backward: the same K" · "Speed halves, K quarters" · "Change speed and mass".

**Body labels:** `cart` · `slow cart` · `fast cart` · `left cart` · `right cart`. **Flag labels:** `first flag` · `second flag`.

**Banned-register sweep, done.** Energy does not carry, store up, pack a punch, want, arrive, get lost or go anywhere in any string this concept ships. The cart moves, slows down and stops; the meter reads; the bar rises and falls. **Carried explicitly to physics-author:** the words *carry / carries / carrying*, *packs*, *possesses*, *lost*, and *goes into* must not appear in any `text_en`. Write "the cart has 40 joules of kinetic energy" and "the reading falls to zero" — never "the energy is lost", which both personifies and opens #10's question. "Kinetic energy" and "joule" are physics vocabulary, not jargon (Rule 41b): use them plainly and often.

---

## ENGINE FIT CHECK (0d — every state mapped to a built, contracted block)

> Discipline inherited from #1: **every row asserting a limit or an absence quotes BOTH the config-type line and the reader-function line behind it.** Line numbers were read from `src/lib/renderers/field_3d_renderer.ts` in this working tree, this dispatch — not carried over from a seam report.

| # | Needs | Engine block (contract line, then reader line) | Exercised by a shipped concept? |
|---|---|---|---|
| all | a K bar rendered at all | `energy_layer {bars, bar_max_J, precision}` (config type L1357-1414), read by `nlbEnCfg` L43429, `nlbApplyEnergyLayer` L43609, `nlbUpdateEnergyPanel` L43715, fill write L43818 | **NO — first pixel ever. See RISK-1** |
| all | K published each frame | `nlbPublishEnergy` L43180; `snap.K` read at L43751, `b.K_J` at L43745 | computed and shipped (SEAM K), but never DISPLAYED |
| S1 | constant-speed coast, no force | `mode:'coast_no_force'` (enum L933) with `initial_velocity_mps` (L976), `surface.frictionless` (L942) and `loop_reset_ms` (L1558) | YES — `positive_negative_zero_work` STATE_3 is exactly this configuration |
| S2, S4 | TWO K bars, one per cart | `energy_layer.body_ids` (L1381), read by the group loop L43626-49, per-body values L43744-47, caption from `bodies[].label` L43637-44 | **NO. See RISK-2** |
| S2, S4 | two independent bodies side by side | `bodies[]` of length 2 with no `pulley` (L951-53), laid out by `nlbBodyLaneZ` L40179-207 with `NLB_LANE_GAP = 0.85` L39610 | lanes are shipped in Ch.5 compare states; **never together with an energy panel** |
| S2, S4 | per-body speed readouts | `readouts: ['v']` (L1336), rows keyed by `nlbReadoutRowId(bodyId, key)` L40319, built at L40498-500 | YES — per-body rows are the shipped shape |
| S3 | mass climbs on the state clock | `param_ramp {param:'m', from, to, end_ms}` — `'m'` is in the closed enum (L1577), driving `nlbApplyParam('m')` which writes `bA.m` (L42343); ramp driver L42646 | `param_ramp` is shipped (`'F'` in #1 S2, `'theta'` in `block_on_incline`); **`param:'m'`, and the `param_ramp` plus `loop_reset_ms` COMBINATION, are both firsts. See RISK-3** |
| S3 | the billboard shows the climbing mass | `nlbBodyLabelText` L40385-98 through `nlbSetBodyLabelText`, described in place as *"rewritten on every state entry + live on a mass-slider drag"* | live on a **slider** drag is shipped; live on a **ramp** rides the same `nlbApplyParam` write path but has never been observed. Folded into RISK-3 |
| S5 | flags that stamp v and K | `checkpoints[{s_m, label, capture, capture_mode}]` (L1494-1502) — `'K'` and `'v'` are both in the closed `capture` enum (L1500); crossing detector L44203, `nlbCpStampText` L44755-96, `nlbRenderStamps` L44800+ | `checkpoints` shipped in #1 STATE_4 with `capture:['W']`; **the `'K'` and `'v'` branches have never run. See RISK-4** |
| S5 | two stamps coexisting rather than overwriting | `nlbRenderStamps` (L44800+), verbatim: *"the authored formula is kept verbatim as the base and the stamps are appended under it in checkpoint order"* | #1 authored ONE checkpoint; **two concurrent stamps have never rendered. Folded into RISK-4** |
| S5 | friction deceleration to rest | `mu_s` / `mu_k` (L977-78) with `mode:'coast_with_friction'`, Branch A | YES — `positive_negative_zero_work` STATE_2 |
| S6 | sandbox with speed and mass live | `mode:'sandbox'` with `trusted_drag_seizes` (L1341) and `controls_visible: ['v0','m']` — `'v0'` IS in the closed enum (L1340), written by `nlbApplyParam('v0')` L42396-402, which sets both `b.v` AND `b.v0` so a replay survives | sandbox is shipped; the `v0` slider itself has no shipped exercise I could find. Low risk: its write path is three lines and self-evidently correct |
| S6 | slider ranges | `slider_controls` (top-level config key L1877), merged by `nlbSc(token)` over `NLB_SLIDER_SPEC` (v0 default −5 to 5, L42220) | YES — shipped in both #1 and #2 |
| — | `deriveStateMeta.ts` co-edit | none: no new `scenario_type`, no new reveal key, no new cue time. `loop_reset_ms` and `checkpoints` were registered by SEAM M | zero edits |
| — | NOT used, deliberately | `work_accumulators` / `work_scale_J` (the §1 boundary) · `sum_merge` (needs `E_total`) · `height_markers` · the `U_grav` / `U_spring` / `E_total` / `E_dissipated` bars · `h_ref_m` · spring · pulley · `angle_arc` · `displacement_vector` · `P` / `P_avg` | — |

### The four risks physics-author must PROBE before json-author commits

**RISK-1 (highest) — `energy_layer` has never drawn a pixel.** The dispatch is right and I am not designing around it. The specific unverified behaviours this design depends on, in the order they would bite:

- the panel becomes visible at all when a state authors `energy_layer` and no `work_accumulators`. The gate is `if (!cfg && !hasWk) { hide }` (L43624), so `cfg` alone should show it, but that branch has never been taken with `hasWk` false;
- a single-group state renders with an EMPTY caption (`capTxt = ""` then `cap.style.display = "none"`, L43643-44), so S1/S3/S5/S6 show a bare K bar and no orphan caption line;
- `nlbEnPct` (L43453-68) writes a 3-decimal percentage straight into `style.height`. The code says in place that it was rounded *"before the first ch6 concept authors an energy_layer and makes it live"* — this concept IS that first one, so the frozen-frame byte-identity fix is itself unexercised;
- the measured reflow ladder `nlbFitEnergyPanel` (L43690-712) has never fitted a real panel, and `nlbEnergyTopPx` re-measures against `#nlb_slowmo` every frame. With no spring in this concept the badge is never shown, which is the simplest case but still the first one.

**Probe:** drive S1 headless; assert `#nlb_energy` is displayed, its `g0_K` fill height is 40% within half a percent, its value text is exactly `40.0 J`, and the console carries zero lines beginning `[PM_NLB_ENERGY_SCALE]`, `[PM_NLB_ENERGY_CLAMP]` or `[PM_NLB_ENERGY_DRIFT]` over 10 s.

**RISK-2 — two-group `body_ids` is the single line S2 and S4 live or die on.** Omit it and the panel silently shows ONE bar carrying the aggregate (L43626-27 to L43748-51), which for S2 is 50.0 J — the sum of 10 and 40. That is a correct number for a question nobody asked, it renders cleanly, and it passes every structural gate. It is the same failure class as #2's two-body work bars against two zero lines: a permitted-but-unexercised path producing a plausible wrong picture.

There is a second, softer finding inside the same block that I want on the record before the build rather than after: **both groups' K bars are the SAME amber**, told apart only by their captions, and group 1 is laid out with `marginTop: 9px` BELOW group 0 (L43633) — so the two bars are stacked VERTICALLY, one above the other, not placed side by side. I have made the group captions and the body billboards use identical words so the mapping is unambiguous, but **physics-author must confirm at THE EYE that a vertically stacked pair of same-coloured bars reads as a comparison.** If it does not, that is a legibility finding for founder-proxy, not something to paper over in narration.

**Probe:** drive S2; assert two `nlb_en_g*` groups are displayed, captions read `slow cart` and `fast cart`, values read `10.0 J` and `40.0 J`, and the fills are 10% and 40%.

**RISK-3 — `param_ramp` on `'m'`, combined with `loop_reset_ms`, in one state, is a first.** Two failure modes to check. (a) Does `nlbResetTrajectory` re-seed the body's mass from the authored `mass_kg` at each loop boundary, snapping the bar back to 16 J? The ramp is a closed form of the monotonic `t_ms` and re-applies every frame, and `eng._ramp_last = null` is cleared on the reset path (L45467), which should force an immediate rewrite — but that is inference from reading, not observation. (b) Does the billboard text follow the ramped mass live, or only on state entry?

**Probe:** drive S3 for 8 s across three loop cycles; sample the K bar value and the billboard text at 0, 1200, 2500 (just after the first reset), 4800 and 7200 ms; assert the bar climbs MONOTONICALLY from 16.0 J to 64.0 J with no snap-back at any cycle boundary, and that the billboard reads `cart = 8 kg` at the end.

**If it snaps back, S3 cannot simply drop `loop_reset_ms`** — without the loop the cart reaches the track bound at 2.7 s and fires `[PM_NLB_ENERGY_CLAMP]`, which THE EYE asserts zero of. That would be a genuine design problem rather than a tuning one. Escalate it rather than patching it.

**RISK-4 — the `'K'` and `'v'` capture branches, and two concurrent stamps, have never rendered.** The interpolation branch (L44766-72) recovers the exact crossing instant from the step segment (`vsq = v² − 2·a·back`), which is what lets me promise `v = 4.00` and `v = 2.00` to two decimal places rather than whatever the post-step frame happened to hold. That branch is arithmetically exact for constant acceleration, which friction deceleration is — but it has never run.

**Probe:** drive S5, pin at 1440 ms, and assert `#nlb_formula` contains all three of `K = ½mv²`, a `first flag:` line carrying `v = 4.00 m/s` and `K = 40.0 J`, and a `second flag:` line carrying `v = 2.00 m/s` and `K = 10.0 J`, in that order.

**No renderer edit is required by any of the four.** Every one is a verification of a built contract, which is exactly what the Phase-0 alarm rule asks for. If a probe fails in a way that needs a renderer change, that IS the alarm firing, and it is a re-scope decision — do not absorb it.

### Phase-0 union walk (scar `phase0_union_table_asserted_not_walked_state_by_state`)

Walked in BOTH directions, not asserted.

| State | Union row it consumes |
|---|---|
| S1 | **K bar** |
| S2 | **K bar** (two groups) |
| S3 | **K bar** |
| S4 | **K bar** (two groups) |
| S5 | **K bar** plus `checkpoints` |
| S6 | **K bar** |

Every state claims at least one row. The survey's row for concept #3 is "**`K` bar** — live ½mv², updates as the body moves", and it is claimed by all six states. **One capability is consumed that the union table does not list as a row for #3: `checkpoints` (S5).** That is not a gap — checkpoints are a SEAM M instrument already built and shipped for #1, and #3 reuses it with a different `capture` list. Recorded here so it is a declared reuse and not a silent overrun of the survey.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** (1) Ch.5 kinematics (speed as a measured quantity) missing breaks **S1** — what is the HUD number? Patched by one narration clause naming the HUD row: "the cart is moving at 4 metres per second, and that number is on the right of the screen." (2) `friction_force` missing breaks **S5** — why is it slowing? Patched by one clause, "the floor here is rough, so the cart slows down steadily", with the `f` readout on screen; sufficient without re-teaching Ch.5. (3) `newton_second_law` missing also breaks **S5**, and the same clause covers it: the state's claim needs only that the cart slows, not that a = F/m. **No state in this concept requires #1 or #2** (see §8) — that independence is a design property, not an accident.

**JEE-backwards trace.** Question: *"A body of mass 2 kg moves with speed 10 m/s. Find its kinetic energy. If a second body of half the mass moves at twice the speed, what is the ratio of their kinetic energies?"* Each piece of knowledge, and the state that delivers it:

- kinetic energy is a real, measurable quantity in joules — **S1**
- it goes as the SQUARE of the speed, so twice the speed is four times the energy — **S2**
- it goes in direct proportion to the mass, so half the mass is half the energy — **S3**
- the exact form with the one-half, so that ½ × 2 × 10² = 100 J can be computed — **S3** states it, **S5** verifies it against a measurement

Ratio = (1/2) × 4 = 2 : 1. Every piece is delivered. The standard follow-up, *"how much work was done to give it that energy?"*, is **deliberately out of scope and delivered by #4** (§1). No missing piece within scope.

**Misconception entry mapping (16a).**

1. *"Twice as fast means twice the energy."* Arrives WITH the student: it is how every everyday quantity they have met (distance, cost, and momentum if they have met it) behaves. Confronted at **S2**. **What plants it inside this concept is S1 itself** — S1 shows one cart, one speed, one reading, and invites exactly the linear reading. That adjacency is deliberate: S1 earns the confident wrong belief one click before S2 breaks it. But it must be flagged at the planting moment, so **S1's narration states the reading as a fact about THIS cart at THIS speed, and must not say anything of the form "faster means more".**
2. *"Backward motion means negative energy."* Planted by S1, S2 and S3, all of which move left to right, leaving "the energy follows the velocity, sign and all" untested and confident. Confronted at **S4**.

No EPIC-C branches (the reactive fallback is deferred until real students exist).

### Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** doubling the speed does not double the kinetic energy — it QUADRUPLES it. The ten-year memory is two identical carts side by side, one moving twice as fast as the other, and its energy bar standing four times as tall.
- **SUPPORTING aha (S4):** kinetic energy has no direction and no sign — run the same cart backward at the same speed and the reading does not move by a joule.
- **Cohesion check:** both are consequences of the SAME feature of the formula, the square. The primary is the square's magnitude consequence; the supporting is the square's sign consequence. S4 does not stand alone — it is the primary aha seen from its other side, which is why it belongs in this concept rather than in a sibling. S3 (mass) and S5 (arithmetic) are deliberately NOT designated ahas: they are the necessary scaffolding and the verification, and designating them would dilute the 1 + 1 sweet spot.
- **Wrong-belief setup:** for the primary, **S1** builds the confident belief "the meter reads the motion, so more motion means more reading" — true as far as S1 shows it — one state before S2 breaks its unstated linearity. For the supporting, **S1, S2 and S3** all run left to right at positive speeds, so "energy follows velocity, sign and all" is live and untested entering S4.
- **Foundational-coverage:** S2 is inside `foundational` (STATE_1 to STATE_3). No exit-pill required.

---

## Refutations and declared decisions

The dispatch invited refutation. Three, each with arithmetic behind it.

**R1 — This concept has NO advanced ring, and inventing one would be padding.** Rule 38a orders states qualitative, then quantitative, then derivation, and says the advanced ring is a contiguous block immediately before explore. It does not require one to EXIST, and Rule 11 forbids padding. `K = ½mv²` is taught at identical depth by CBSE, IB, AP and A-Level — there is no deferred deeper form. The one genuine derivation (where the one-half comes from) IS the work-energy theorem, which is #4 and is ceded.

I actively considered and REJECTED two candidate advanced states:

- **`K = p²/2m`** — momentum is not in the `readouts` enum (L1336) and nothing in this scenario renders p, so the state would assert a number the renderer cannot show. That is the filed scar `oncanvas_formula_asserts_a_value_the_renderer_cannot_show`, and it is exactly how a designed-in defect gets built.
- **frame-dependence of K** — nothing renders a second reference frame.

**Consequence, stated plainly: the `standard` preset is identical to `full`.** If founder-proxy wants a non-trivial `standard` preset, the honest way to get one is to re-ring S5 as advanced, leaving `extended` empty instead. I have not done that, because S5 is quantitative rather than a derivation, and mislabelling a ring to make a preset table look full is precisely the authored-outcome failure the scar list warns about.

**R2 — The K bar must be authored as one bar per BODY, not one bar per concept, and this is where the dispatch's framing needed correcting.** The dispatch asked whether K is authorable as a single bar. It is — but the default is a trap. With `body_ids` OMITTED the panel renders ONE group carrying the WHOLE RIG's aggregate K (L43626-27 and L43748-51). For S2 that is a single bar reading 50.0 J, the sum of 10 and 40: a correct number for a question nobody asked, which renders cleanly and destroys the PRIMARY aha silently. Structurally this is the same failure as #2's two-body work bars against two different zero lines. It is called out as RISK-2 and as DoD line (f-4), and it is the one line I would have json-author read twice.

**R3 — I am deliberately using friction in S5, and I want the decision visible rather than buried.** Every state in which K CHANGES has a force doing work on the body. There is no way around that, and the engine offers no mechanism to change v without a force: `param_ramp`'s enum is `theta | F | mu_s | mu_k | m` (L1577) with no v, and `idle_auto_sweep`'s is `F | theta | m` (L1559). So the boundary with #4 cannot be "no state changes K" — it has to be "no state draws or names work", which is the invariant in §1.

I also **rejected the obvious alternative — an accelerating cart under an applied force — on arithmetic, not on taste.** Under a constant force, K grows as t squared. The frozen-pin margin forces the last flag to satisfy t_flag at most 0.60·R − 0.20 s, so the loop's peak K exceeds the K at that flag by at best (R / t_flag)², which is about 3.9 at R = 2.2 s. `bar_max_J` would therefore have to be roughly four times the value being taught: the 40 J flag would render as a 25% bar and the 10 J flag as a 6% one, and the bar would sit pegged near the top for most of the loop — unreadable at exactly the instant it matters. A DECELERATING cart has its peak at t = 0 (90 J), so `bar_max_J = 100` gives 90% at launch, 40% at the first flag, 10% at the second and 0% at rest: a full, readable sweep of the track. **The deceleration is chosen by the arithmetic of the instrument, not by preference.**

The residual cost of R3 is a small, declared brush against #10's territory (a friction-slowed body). It is bounded by the §1 invariant: no friction work bar, no `E_dissipated` bar, and no "where did it go" sentence anywhere. #10's PRIMARY aha is untouched.

## Compliance lines

- **Source check:** consulted NCERT Ch.6 scope (Eq. 6.7 placement) and HC Verma §8.1 for teaching SEQUENCE only. No teaching method, example problem, figure or phrasing imported. The catalog's India-specific anchors for A6 (railway porter, named-resort chairlift, ISRO casings) are **not used** — Rule 35 and the survey warning.
- **Engine bug queue:** consulted LIVE this dispatch (§0). Every relevant `prevention_rule` is satisfied at a named site. **One exception is documented and FLAGGED for quality-auditor Gate 8** — the Rule 16a ghost-bar descope in §4, since the engine has no ghost-bar primitive and building one would be a Phase-0 alarm. **FLAG for quality-auditor:** run `query_engine_bug_queue.ts kinetic_energy_definition` and `--field3d --open` against the built JSON before verdict.
- **Rule 40:** no engine mechanism is proposed, so no `git log --all -S` search is owed. This concept is pure JSON on master's shipped renderer.
- **Boundary reconciliation with #4:** recorded in §1 as a checkable config invariant (zero `work_accumulators`, and no "work" or W in any reader-facing string). #4's opening move is to author both a work bar and a K bar in the same panel and make the equality — every block it needs is already built and is deliberately unused here.

## Self-review checklist — all items verified

Atomic claim in one sentence with a mechanically-enforced #4 boundary · 6 states in the medium band with per-state justification · control table complete (teaches, archetype, distinct motion, delta, controls, camera, ring, words), one declared contrast pair, two coined archetypes each justified, no static state, drag-sandbox explore-only, every archetype discharged by the authored beat with no teacher input · Rule 32 plan (cause-first, one-variable-moves, 5-word delta cues, permanent home pose with stable body ids, ZERO glow focals argued per state) · every state proves something no other state proves · Rule 33 N/A with rationale plus all instruments live numerics · Rule 34 one formula surface per state (S1 deliberately none), left and right zone map verified non-colliding, all math real Unicode · Rule 35 universal anchor (braking vehicle, hammer and nail), Rule 38f widest-overlap, Rule 41 full plain-language audit with a banned-word list carried to physics-author · Rule 38 rings tagged and ordered, BOTH cuts run, explore core-only with ring-gated controls, tags as claims, presets derived, axis N/A, absent advanced ring ARGUED · `misconception_watch` at exactly 2 genuine pivots with a declared unbuildable-picture descope · deep-dive picks of 2 with 3 clusters each, coincident with the cliff states · `entry_state_map` with `foundational` containing the PRIMARY aha · prerequisites advisory, independence from #1 and #2 stated · DoD with zero TBDs and all numeric constraints binding with arithmetic (bar scale, loop bounds, flag positions, pin margins, slider clamps) · Block 1 and Block 2 complete · **ENGINE FIT CHECK: every state mapped to a built contract with config-type AND reader lines; four never-exercised behaviours named with probes; Phase-0 union walked in both directions; ZERO renderer edits, no alarm.**

---

**Handoff to physics-author.** Inputs owed: the four RISK probes, run BEFORE writing the physics block (RISK-3 can invalidate S3's design); narration inside the tabled word budgets, with the Rule-41 banned-word list honoured and S1's linearity-flag clause included; `assessment` and `coverage_map`; confirmation of the S2 and S4 projected screen-x disjointness at t = 0 and at every 100 ms through one loop (world gaps are 2.0 m and 2.4 m against a 1.1 m body width, but the projection through the off-axis camera is physics-author's to verify, per the lane directive); and a verdict on the S4 pacing trade in §10(d).

**json-author authors from this document's arithmetic ONLY:** `s_m = initial_position_m + d_target` for both flags; the shared `bar_max_J = 100` on all five guided states; `body_ids: ['cart_a','cart_b']` on S2 and S4 (DoD f-4, the single most dangerous omission in the build); `surface.frictionless: true` on S1, S2, S3, S4 and S6; and zero `work_accumulators` and zero `glow_focal` anywhere.
