# ARCHITECT SKELETON — `kinetic_energy_definition` (CYCLE 1)

> Chapter: Class 11 Ch.6 Work, Energy and Power · concept **#3** of 12 (approved teaching order, founder 2026-08-01)
> Renderer: `field_3d` / `scenario_type: "newtons_laws_body"` + the Phase-0c ENERGY LAYER (SEAMS K/L/M/N).
> **This is a 0d pure-JSON concept. Design target and verdict: ZERO renderer edits — see ENGINE FIT CHECK. No alarm, including on F2 (see D3).**
> Doctrine: Rules 11 · 16a · 19 · 23 · 24 · 25 · 31 · 32 · 33 · 34 · 35 · 38 · 41. Conceptual-only (Rule 20 [D]); EPIC-C branches: none.
> Siblings shipped: `work_done_by_constant_force` (#1), `positive_negative_zero_work` (#2).
> **First-ever exercise of `energy_layer`.** No shipped concept authors one (`field_3d_renderer.ts` L43368, verbatim: *"No shipped concept authors one."*).
> **Cycle 1 revised 2026-08-02 against Checkpoint A `DESIGN_FIX` (`founder_proxy_A.md` — 4 P1, 4 P2, 6 P3). Cycle 1 of a hard maximum 2.** Cycle 0 preserved at `skeleton_cycle0.md`.

## CYCLE 1 CHANGES

| Finding | What changed |
|---|---|
| **F1 (P1)** | S3's ramp is now `m` **2 → 4 kg** (was 2 → 8). K climbs **16.0 → 32.0 J**, an honest ×2 against S2's ×4 — so the linear-versus-quadratic contrast now appears ON SCREEN for the first time, which is the finding's real half. Every S3 string is now true against its own animation. |
| **F2 (P1)** | Shared guided scale is now **`bar_max_J = 45`** (was 100), which the F4 and F1 fixes made reachable — S2 renders at **22.2% and 88.9%** of the 186 px track (was 10%/40%). The **vertical stacking is now written into §3, §10(f) and §10(h)** as a design fact, not a risk. The PRIMARY aha is re-worded to *"four times the reading"* with height as reinforcement, which is also what makes it survive F6. Fallback named. **I do NOT request a row layout — see D3. No Phase-0 alarm.** |
| **F3 (P1)** | S3 now authors `arrows: [{body_id:'cart_a', show:['weight']}]`. The weight arrow runs **0.94 → 1.88 world units** as the mass doubles (`NLB_ARROW_SCALE = 0.048`, clamp `[0.55, 2.80]`, L39661-63) — a visibly doubling object that IS the mass. The label is **`mg`**, not `W` (`NLB_ARROW_DEFAULT_LABELS`, L39679), so the §1 boundary invariant survives. The false "billboard changes first" claim is **DELETED** and replaced with an argued 32a exemption. |
| **F4 (P1)** | S5 rebuilt: **m = 3 kg, v₀ = 5 m/s, ONE flag at v = 4.00 m/s → K = 24.0 J**, then the fall to exactly 0.0 J. New mass, new joules, no reuse of S2's numbers, and the state is re-cued on its own claim — K falling continuously on ONE body to zero, which no other state shows. Dropping to one flag also discharges F13. |
| **F5 (P2)** | Resolved by F2's scale: S4's equal bars now render at **50.0%** each, not 22.5%. |
| **F6 (P2)** | The shared scale's rationale is rewritten: it is for **within-state legibility and overflow safety**, NOT cross-state height comparison, which is void below a ~579 px viewport. Declared in §10(f). |
| **F7 (P2)** | "The fast cart covers twice the ground per second" **deleted** from S2. |
| **F8 (P2)** | S6's drag is re-declared with its real semantics (reposition **and stop**, `b.v = 0`, L42578) and is no longer listed as a live control. It is now put to work: it is the only way the `intro` preset can reach K = 0. |
| **F9 (P3)** | Citation corrected: the engine clamp is at **±`length_m` = ±6.0** (`nlbBoundsM` L45599-616). `length_m − 0.55` is the DIRECTIVE's authoring inset for the home pose; the separate ±5.4 run limit is **slab geometry** (a cart centred at 6.0 overhangs the drawn slab by half its width). Three distinct numbers, now distinguished. |
| **F10 (P3)** | S2/S4 cameras moved to the shipped `[3, 2.5, 9]`. |
| **F11 (P3)** | Moot — S5's cue is now "K falls to zero". |
| **F12 (P3)** | The braking anchor is now **qualitative in narration** (twice the speed, four times the kinetic energy — this concept's own claim); the ×4 stopping distance is recorded in §9 as a declared forward-reference to #10 and must not be spoken. |
| **F13 (P3)** | Discharged by F4's single flag. Width re-estimated at **~319 px against the 340 px cap** with spaces at half-advance; probe and fallback both named. |
| **F14 (P3)** | §4 now records that Rule 16a is delivered as a **numeric contrast**, not a rendered wrong-expectation. |
| **friction scar** | `nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` named as known-inherited on S5 (§0 and §10(d)). Engine-owned, not routed. |
| (endorsed) | Kept verbatim: the §1 boundary invariant and its `"Energy bars"` proof, R1's empty advanced ring, R3's deceleration arithmetic, the ghost-bar descope, zero `glow_focal`, the S2/S4 contrast pair, `entry_state_map`, prerequisites, deep-dive picks. |

---

## 0. Engine bug queue — consulted, live, this dispatch

Ran (Bash granted to this role 2026-08-02):

- `query_engine_bug_queue.ts --owner alex:architect` (32 rows) and `query_engine_bug_queue.ts positive_negative_zero_work --open` (10 rows).

| Row | Where discharged |
|---|---|
| `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` | §3 home pose and §10(d): the flag is authored as `initial_position_m + d_target` arithmetic, never a literal. |
| `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm` | §3 — home poses inset, and the run-end limit stated separately with its correct source (F9). |
| `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` | §10(d): S5's single crossing at 0.097·R, far under 0.55·R. |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` | §10(d) margin table, recomputed at h = 1/60 by Checkpoint A's own C4 method. |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | §3 archetype audit — and the S3 partial recurrence Checkpoint A found is closed by F3's weight arrow. |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | §3 — **zero `glow_focal` in this concept**, argued per state. |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` | §10(a)/(b) — every teaching string on a rendering path. |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` | §3 — S2/S4 use the shipped off-axis camera `[3, 2.5, 9]` plus a stagger (F10). |
| `phase0_union_table_asserted_not_walked_state_by_state` | §"Phase-0 union walk", both directions. |
| `teach_do_not_pre_spoil_a_later_reveal` / `symbol_printed_on_canvas_before_the_lesson_defines_it` | §10(b) TERM-INTRODUCTION LEDGER. |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` | §10(b), and now also §9 for the anchor (F12). |
| `lesson_never_states_the_principle_it_is_named_after` | S3 STATES `K = ½mv²` in the CORE ring; S5 SHOWS it measured. |
| `explore_controls_not_ring_gated_survive_the_ring_cut` / `explore_state_formula_surface_asserts_a_relation_no_state_derives` | §10(i-2) and (i-2b). |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | The inverted recurrence Checkpoint A found (F9) is corrected in §3; three separate bounds are now named with three separate sources. |
| **`nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` — OPEN, INHERITED** | **Binds S5**, the only state rendering a friction arrow: the arrow's first-frame reveal tint bypasses the SEAM Q ink floor, so t = 0 fails the contrast floor the settled colour passes. **Engine-owned (`peter_parker:field3d_surgeon`), not routed from here and not blocking** — recorded so quality-auditor and eye-walker do not re-file it as new. |

---

## 1. Atomic claim

This concept teaches ONE idea: **a moving body has kinetic energy `K = ½mv²` — proportional to its mass, proportional to the SQUARE of its speed, and never negative** — and only that.

It does NOT cover: what CHANGES kinetic energy (`W = ΔK` — the whole property of `work_energy_theorem`, #4); where kinetic energy goes when friction stops a body (#10); potential energy of any kind (#6/#7/#8); conservation (#9); power (#11/#12).

**Boundary with #4, enforced mechanically rather than claimed.** #3 owns *what K is and what it depends on*. #4 owns *work changes it*. The invariant json-author is held to and quality-auditor can grep:

> **`kinetic_energy_definition` authors ZERO `work_accumulators` blocks, in every state, guided and explore. No reader-facing string in this concept — title, delta cue, caption, formula surface, label, narration — contains the word "work" or the symbol W.**

That is the exact mirror of #1's boundary (#1 authors no `energy_layer`). It has a side-effect that proves it on screen: `nlbEnergyPanelLabel()` (L43480-93) composes the left panel's teacher-facing name from what the CONCEPT authors, and with energy bars and no work ledgers it returns **`"Energy bars"`**. #1's panel says `Work done`; #3's says `Energy bars`; #4's will say `Energy and work bars`.

**F3 check against this invariant:** S3's new weight arrow is labelled **`mg`**, not `W` (`NLB_ARROW_DEFAULT_LABELS`, L39679). The invariant survives, and the `W`-means-weight / `W`-means-work collision that would have poisoned #1, #2 and #4 never arises.

**A second boundary, declared rather than buried (Refutation R3):** S5 uses friction to slow a cart so its K falls. Friction does work. #3 never draws a friction work bar, never asks where the energy went, and never states an equality — that question is #10's PRIMARY aha and stays intact.

---

## 2. State count + arc — 6 states (5 guided + 1 explore)

Medium concept (§5 calibration: medium = 5–6). Each guided state proves something no other state proves:

| # | id | Ring | What this state PROVES that no earlier state does | teaching_method |
|---|---|---|---|---|
| S1 | `moving_body_has_energy` | core | Kinetic energy exists and is measurable: a cart in steady motion holds a reading of 40.0 J on the left-edge meter. Introduces K and its instrument. | (straightforward beat) |
| S2 | `speed_counts_twice` | core | K depends on the SQUARE of the speed: two identical 5 kg carts, one at 2 m/s and one at 4 m/s, read 10.0 J and 40.0 J. **Four times, not two. PRIMARY aha.** | misconception_confrontation |
| S3 | `mass_counts_once` | core | K depends on mass, and only in PROPORTION: at a fixed 4 m/s the mass doubles 2 to 4 kg, the weight arrow doubles with it, and the bar doubles 16.0 to 32.0 J. **Double, against S2's quadruple — the contrast this concept exists to teach.** The full formula `K = ½mv²` is assembled here. | (straightforward beat) |
| S4 | `never_negative` | core | K is a scalar with no direction and no sign: two identical carts at the same speed in opposite directions read exactly the same 22.5 J. **SUPPORTING aha.** | misconception_confrontation |
| S5 | `falls_to_zero` | extended | K is a property of the body's OWN current speed, changing continuously as that speed changes, and reaching exactly 0.0 J at rest. One cart, one flag, one measured check of ½mv². | (straightforward beat) |
| S6 | `explore` | core (explore) | Teacher's sandbox: speed and mass live, meter live. | exploration_sliders |

**The S2 to S3 adjacency is now the concept's spine (F1).** S2 multiplies the bar by four when the speed doubles; S3 multiplies it by two when the mass doubles. Cycle 0 authored both as four, which made the whole distinction invisible. The two states are now a quantitative pair, and physics-author should let S3's narration name the comparison explicitly.

Rule 38a ladder: qualitative (S1 to S4), then quantitative (S5), then derivation (**none — argued in R1, and concurred by Checkpoint A as C2**).

The hook MOVES from the first frame: S1 opens with the cart already crossing the floor, not a static setup pose.

---

## 3. Per-state choreography + control table (Rule 31 — REQUIRED artifact)

**Home pose (Rule 32d — PERMANENT).** Flat floor (`surface.theta_deg: 0`, `length_m: 6`, a HALF-length so the track spans −6 to +6), frictionless in every state except S5. **Two stable body ids across the whole concept: `cart_a` (blue #42A5F5) and `cart_b` (red #EF5350).** The mesh set is built once from the union of every state's bodies and only shown/hidden and re-seeded per state (config type L954-957). Single-body states author `cart_a` alone; `cart_b` appears only in S2 and S4. Body labels are rewritten on every state entry (L40404), so a per-state label is contracted.

**THREE DIFFERENT BOUNDS, with three different sources (F9 — cycle 0 conflated them into one false citation).**

| Bound | Value with `length_m = 6` | Source | What it governs |
|---|---|---|---|
| the ENGINE clamp | **±6.0** | `nlbBoundsM` returns `{lo: −lenM, hi: lenM}` (L45599-616) | where the body is arrested and, with `energy_active` true, `[PM_NLB_ENERGY_CLAMP]` fires |
| the DIRECTIVE's authoring inset | **±5.45** (`length_m − 0.55`) | the OPEN scar's probe, `nlb_static_state_authored_on_the_track_bound…` | the authored `initial_position_m` only |
| the SLAB-GEOMETRY run limit | **±5.4** | the slab is drawn to exactly `±length_m` (`nlbApplySurface`) against a 0.55 half-width, so a cart centred past 5.45 overhangs the drawn floor | how far a body may travel inside an authored loop |

`energy_layer` makes `eng.energy_active` true in EVERY state of this concept (L43075: `!!(eng.energy_layer || eng.work_state || eng.checkpoint_state)`), so unlike #1 this design cannot reason about the clamp state by state — it must hold everywhere. Every home pose is at most 5.4 in magnitude, and every guided loop resets before its body passes ±5.4 (§10(d) arithmetic). S6 is `mode: 'sandbox'`, where SEAM J's wrap is the loop and no clamp branch is taken.

**Checkpoint arithmetic.** `checkpoints.s_m` is an ABSOLUTE track coordinate; S5's single flag is authored as `s_m = initial_position_m + d_target` and computed in §10(d).

**Camera (F10).** Single-body states run the fleet-standard head-on `[0, 2.0, 10]`. S2, S4 and S6 use **`[3, 2.5, 9]`** — the camera the shipped two-body compare on this exact apparatus (`work_done_by_constant_force` STATE_5/6) already passed the lane directive's projection check with. The two-body states need it because lane separation is along z (`NLB_LANE_GAP = 0.85`, L39610; `nlbBodyLaneZ` L40179-207) and a head-on camera would stack them. The camera moves only when the body count changes, which is exactly the new thing being framed (Rule 32d).

**THE ENERGY PANEL'S ACTUAL LAYOUT — write this into every downstream artifact (F2b).** This is a design fact, not a risk to be discovered later:

- the panel is a `position:fixed` box at `left:12px, top:52px` (L43511-13) with a measured reflow ladder;
- with `body_ids` of length 2 it renders **TWO GROUPS STACKED VERTICALLY**, group 1 below group 0 (`gEl.style.marginTop = (g > 0) ? "9px" : "0"`, L43633) — **NOT side by side.** The engine's own comment at L43206 claims "two compact side-by-side bar groups" and **that comment is wrong**; Checkpoint A verified this independently and filed it as a ride-along for `peter_parker:field3d_surgeon`;
- both groups' K bars draw the same amber `#FFCA28` (L43396). They are told apart by their group captions, which are the raw authored body labels;
- track height is 186 px at step 0 (`NLB_EN_STEPS[0].trk`, L43413), and the two fills' baselines sit about 252 px apart.

**Consequence for authoring, binding:** the comparison a teacher makes in S2 and S4 is between two FILL FRACTIONS of two identical tracks, plus two numerals. **No narration, caption, title or aha statement in this concept may describe one bar as physically beside another, and none may rest solely on relative height.** The scale in §10(f) is chosen so the fractions are unmistakable (22.2% against 88.9% in S2), and the aha is worded on the READING with height as reinforcement.

| # | Teaches | Archetype | Distinct motion (the AUTHORED beat, no teacher input) | Delta cue | Controls | Camera | Ring | Words |
|---|---|---|---|---|---|---|---|---|
| S1 | Kinetic energy exists and has a meter | `translate-through` | ONE cart (`cart_a`, 5 kg) coasting at a steady 4 m/s on a frictionless floor from s0 = −5.4, crossing the whole visible track; the K bar stands at **40.0 J (88.9%)** and the HUD carries its live speed. `loop_reset_ms = 2400` re-enters it from the left, forever. No formula surface | "Moving cart, K above zero" | none | `[0, 2.0, 10]` | core | 30–45 |
| S2 | K goes as v², not as v | **`race-compare`** (COINED) | TWO identical 5 kg carts released together in their own z lanes: `cart_a` "slow cart" at 2 m/s from s0 = −5.4, `cart_b` "fast cart" at 4 m/s from s0 = −3.4. The fast cart starts 2.0 m ahead and the gap only grows (2.0 to 6.0 m over the loop), so their screen-x extents never close. Two K bars, two captions, stacked: **10.0 J (22.2%) and 40.0 J (88.9%)** — a stub against nearly the whole track. `loop_reset_ms = 2000` | "Double speed, four times K" | none | `[3, 2.5, 9]` | core | 40–55 |
| S3 | K rises in PROPORTION to mass — and the full formula | **`ramp-and-track`** (COINED) | ONE cart at a fixed 4 m/s (frictionless, so its speed genuinely never changes), `param_ramp {param:'m', from: 2, to: 4, end_ms: 7200}` across three traverses (`loop_reset_ms = 2400`). Three things move together and nothing else does: the **weight arrow grows 0.94 to 1.88 world units** (`arrows: [{body_id:'cart_a', show:['weight']}]`, label `mg`), the billboard climbs `cart = 2 kg` to `cart = 4 kg`, and the K bar climbs **16.0 to 32.0 J (35.6% to 71.1%)** — a doubling, where S2 showed a quadrupling. The HUD speed sits unmoved at 4 m/s (Rule 32b). Formula surface assembles `K = ½mv²` | "Double mass, double K" | none | `[0, 2.0, 10]` | core | 30–45 |
| S4 | K is a scalar: direction and sign do not enter | `race-compare` — **DECLARED CONTRAST PAIR with S2** (the delta names the flip: S2's carts differ in the SIZE of v and read 4:1; these differ only in the SIGN of v and read identically) | TWO identical 5 kg carts starting 2.4 m apart near the centre and sliding APART: `cart_a` "left cart" at s0 = −1.2 with v = −3 m/s, `cart_b` "right cart" at s0 = +1.2 with v = +3 m/s. The gap only ever grows. Both K bars read exactly **22.5 J (50.0%)** — same fill, same numeral, opposite motions. `loop_reset_ms = 1300` | "Backward: the same K" | none | `[3, 2.5, 9]` | core | 30–45 |
| S5 | K tracks ONE body's own falling speed, right down to zero | `flow-along-path` | ONE cart, **3 kg**, launched at **5 m/s** onto a ROUGH floor (mu_k = 0.5 — the only frictional state in the concept) from s0 = −5.4. The bar starts at **37.5 J (83.3%)** and falls continuously. It crosses ONE flag at v = 4.00 m/s, which stamps `v = 4.00 m/s · K = 24.0 J` (53.3%) beneath the authored `K = ½mv²` — a check a teacher can do aloud, since ½ × 3 × 16 = 24. The cart then slides to rest and the bar settles on exactly **0.0 J** and holds. `loop_reset_ms = 2100` | "K falls to zero" | none | `[0, 2.0, 10]` | extended | 40–55 |
| S6 | Teacher's sandbox | `drag-sandbox` | `mode: 'sandbox'` with `trusted_drag_seizes`: the v0 and m sliders drive the cart and the meter continuously and the state free-runs forever (Rule 37, automatic). Dragging the cart is a **reposition-and-stop** gesture, not a live control (F8) — `nlbApplyBodyDrag` sets `b.v = 0` (L42578), so a drag parks the cart and the bar reads 0.0 J until the teacher raises v0 again. That is honest and useful: it is how the reduced `intro` preset can still reach K = 0 | "Change speed and mass" | `v0`, `m` (sliders). Drag = reposition and stop | `[3, 2.5, 9]` | core | 0 / open |

**Archetype audit.** Each archetype names a motion the AUTHORED beat produces with NO teacher input, between t = 0 and loop reset:

- `translate-through` (S1) — the cart traverses the track. Once.
- **`race-compare` (S2, S4) — COINED, justified:** no seed archetype names a SIMULTANEOUS two-lane compare, and `cycle-compare` is explicitly SEQUENTIAL, which is the opposite of what these states do. Used twice as a **declared contrast pair**, with the delta cues naming the flip.
- **`ramp-and-track` (S3) — COINED, and now genuinely discharged (F3).** In cycle 0 this archetype was carried by a digit incrementing on a billboard, which Checkpoint A correctly read as a partial recurrence of the archetype scar: `NLB_BODY_SIZE = 0.55` is declared MASS-INDEPENDENT in its own comment (L39592), so the cart is pixel-identical at any mass. The weight arrow supplies a real, exactly-proportional moving object: `nlbArrowLen(magN) = |F| × 0.048` clamped `[0.55, 2.80]` (L39661-63, L40808-13), so 19.6 N gives 0.94 and 39.2 N gives 1.88. The archetype is now discharged by an arrow that visibly doubles.
- `flow-along-path` (S5) — the cart flows past a flag that stamps. Once.
- `drag-sandbox` (S6) — explore only. Once.

No state is static, and no undeclared repeat.

**Rule 32a, and an ARGUED EXEMPTION for S3 (F3).** S1/S2/S4: the carts are the cause and the only things moving; the bars are readings, not events. S5: the cart crosses the flag first and the stamp lands after; the cart comes to rest first and the bar settles on 0.0 J after.

S3 is different, and cycle 0 asserted something false about it. `nlbUpdateMassText` (L40597-611) and `nlbPublishEnergy` (L43209) read the same `b.m` on the same frame, and `nlbUpdateEnergyPanel` consumes it that frame — **there is no "first", and no delay mechanism exists to create one.** The claim is deleted rather than re-worded. **S3 is exempted from 32a's temporal ordering on a stated principle: its cause is a continuously-varying PARAMETER, not an event, and cause and effect are simultaneous by physics.** 32a's readability purpose is met a different way — the cause is made a visible OBJECT (the doubling weight arrow) rather than a digit, so a viewer reads "the cart is getting heavier" from the picture. Recorded here so quality-auditor scores the exemption rather than the rule.

**Glow focal — this concept authors ZERO `glow_focal`, in every state.** Rule 32e caps the focal at one; it does not require one. Argued per state: S1's claim is a relation between the moving cart and the bar; S2's and S4's are relations between two bars; S3's is a relation between the weight arrow, the billboard and the bar; S5's is a relation between the flag and the formula surface. Every one is a relation, so a focal would dim half of it. With no state-level focal, `glowActive` stays false, nothing dims, and any per-sentence `tts_sentences[].glow` bindings actually take effect — so the OPEN scar `authored_state_glow_focal_silently_voids_every_tts_sentence_glow` is avoided by construction.

---

## 4. Misconception confrontation plan (Rule 16a — 2 genuine pivots, no per-state tic)

| Wrong belief | State | `misconception_watch` beat |
|---|---|---|
| "Twice as fast means twice the energy" — kinetic energy scales with speed the way momentum does | **S2** | `belief`: kinetic energy is proportional to speed · `visual_counter`: two carts of the SAME 5 kg mass, one at 2 m/s and one at 4 m/s, released together; the fast cart's bar reads 40.0 J against the slow cart's 10.0 J — four times the reading, not twice, and nearly the full track against a stub · `one_line_fix`: the speed is squared, so doubling the speed multiplies the kinetic energy by four |
| "A body moving backward has negative kinetic energy" — K inherits the sign of v | **S4** | `belief`: reversing the direction of motion reverses the sign of the kinetic energy · `visual_counter`: two identical carts at the same 3 m/s in opposite directions; both bars read exactly 22.5 J · `one_line_fix`: squaring the speed removes the sign, so kinetic energy is never negative |

S1, S3, S5 and S6 carry **no** `misconception_watch`. EPIC-C branches: NONE (EPIC-L-first directive 2026-06-10).

**Two declarations for quality-auditor, so neither is scored as something it is not:**

1. **The wrong expectation is not RENDERED (engine-forced descope).** The ideal 16a picture is a dim ghost bar at 20 J beside the real 40 J bar. The engine has no ghost-bar primitive: `energy_layer` renders one fill per authored quantity per group (L43536), `nlbPublishEnergy` skips ghost bodies outright (L43205: `if (!b || b.ghost || b.fixed) continue;`), and the panel is capped at 2 groups (L43515, L43626). Building one would be a renderer edit and therefore a Phase-0 alarm, so it is **not routed**.
2. **Rule 16a is therefore delivered here as a NUMERIC CONTRAST (F14):** narration names the expectation while the two real bars are already on screen, and the measured readings refute it. The wrong expectation's *consequence* is never drawn. Quality-auditor should score this as a declared partial, not as a full rendered 16a beat.

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S2 `speed_counts_twice`** — the v-squared abstraction is the stickiest point in this concept.
- **S4 `never_negative`** — the sign/scalar confusion, historically tangled with momentum.

Both coincide with the Pass-1 cliff/misconception states (Block 1) — no divergence to document.

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

Default aspect `foundational`. **Foundational-coverage rule satisfied directly** — S2 is inside STATE_1 to STATE_3, so no exit-pill is required. Cross-slice pills after the foundational slice: "What if it moves backward?" to STATE_4, and "Watch it fall to zero" to STATE_5.

## 8. Prerequisites (advisory — Rule 23)

Shipped and relevant: `newton_second_law` (S5's deceleration under a real friction force) and `friction_force` (S5's mu_k). Ch.5 kinematics groundwork (mass and speed as measured quantities) is assumed and patched in-state — see Block 1. S3's weight arrow assumes only that a heavier body is pulled down harder, which is Ch.5 material.

**Deliberately NOT prerequisites: `work_done_by_constant_force` (#1) and `positive_negative_zero_work` (#2).** Kinetic energy is definable and fully teachable without work — that independence is what makes the #3/#4 boundary clean, and a teacher may open this concept first. The forward edges point from here to #4 and #9.

## 9. Real-world anchor (Rule 35 universal · Rule 38f widest-overlap · Rule 41 plain)

**Primary — a vehicle at speed.** Everyone has been in a car or a bus. Drive at twice the speed and the vehicle has **four times the kinetic energy** — which is this concept's own claim, and the reason speed matters so much more than it feels like it should. Universal: vehicles and speed limits exist on every syllabus and in every country, and no place, brand, currency, festival or person is named. Widest-overlap: CBSE, IB, AP and A-Level all use a moving vehicle for kinetic energy.

**F12 — the stopping-distance payload is a DECLARED FORWARD REFERENCE and must not be spoken here.** The familiar form of this anchor is "twice the speed needs about four times the distance to stop", and that is `v²/2μg` — work-energy plus friction, i.e. #4 and #10 content, and a number this sim never renders. §10(b)'s "no claim without a rendered measurement" line forbids it. **The anchor is kept qualitative: it names the energy, never the distance.** The stopping-distance consequence is recorded here as the hook #10 inherits, so #10's architect can pick it up deliberately instead of rediscovering it.

**Secondary — a hammer driving a nail.** Swing the hammer twice as fast and it drives the nail much deeper in one blow, because it has four times the kinetic energy when it lands. Universal, hands-on, and it names only energy.

The source catalog's mined anchors for A6 (railway porter, named-resort chairlift, ISRO casings) are pre-Rule-35 and India-specific — **NOT imported**.

---

## 10. Definition of Done (Gate 0 — no TBDs)

### (a) States and rendered primitives (Rule 19 measured against what is DRAWN)

`field_3d` never paints `scene_composition` annotations, so Rule 19 is counted against drawn objects only:

| State | Drawn objects |
|---|---|
| S1 | floor slab · cart_a · billboard `cart = 5 kg` · K bar with numeric · HUD `v` row |
| S2 | floor slab · cart_a · cart_b · two billboards · TWO stacked K bars with group captions · HUD rows for both bodies |
| S3 | floor slab · cart_a · billboard (mass climbing) · **weight arrow `mg` (length doubling)** · K bar with numeric · HUD `v` row · formula surface |
| S4 | floor slab · cart_a · cart_b · two billboards · TWO stacked K bars with group captions · HUD rows for both bodies |
| S5 | floor slab · cart_a · billboard · friction arrow · one checkpoint flag · K bar with numeric · formula surface with its stamp |
| S6 | floor slab · cart_a · billboard · K bar with numeric · HUD `v` row · two slider rows |

### (b) Symbol-label table — the ENGINE'S REAL strings (Rule 34c Unicode; read at source)

| Narrated quantity | On-canvas rendering, with its source |
|---|---|
| the energy panel's teacher-facing name | **engine-composed `"Energy bars"`** (`nlbEnergyPanelLabel`, L43480-93). Not authorable; nothing authored may duplicate it |
| kinetic energy | bar symbol **`K`** (`NLB_EN_SYM.K`, L43392), amber `#FFCA28` (L43396) |
| the reading | bare value under the bar, e.g. **`40.0 J`** (`nlbEnFx`, L43447-52). `precision: 1` is authored explicitly |
| which cart a bar belongs to (S2/S4) | the group caption is the body's **raw authored `label`** (L43637-44): `slow cart` · `fast cart` · `left cart` · `right cart` |
| the cart and its mass | billboard `<label> = <mass> kg` (`nlbBodyLabelText`, L40385-98), e.g. `cart = 2 kg`. Digits from `nlbFxMass` (integers bare) |
| **the cart's weight (S3 only)** | **arrow labelled `mg`** (`NLB_ARROW_DEFAULT_LABELS`, L39679), colour `#FFD54F` (L39670). Length is `\|F\| × 0.048` clamped `[0.55, 2.80]` — 0.94 at 2 kg, 1.88 at 4 kg. **The label is `mg`, never `W`** — §1's invariant holds |
| speed | HUD row per body: label `v`, unit ` m/s` (L40301-13), rows keyed by `nlbReadoutRowId(bodyId, key)` (L40319) so a two-cart state shows both |
| friction (S5 only) | HUD row `f`, unit ` N`, plus the friction arrow (see the inherited t=0 ink scar, §0) |
| the checkpoint stamp (S5 only) | `nlbCpStampText` (L44755-96) composes `label + ":  " + parts.join("  ·  ")`. Authored label `flag` renders **`flag:  v = 4.00 m/s  ·  K = 24.0 J`** beneath the base formula (`nlbRenderStamps`, L44800+) |

**TERM-INTRODUCTION LEDGER.** Every symbol that appears on canvas, and the state that DEFINES it:

| Symbol | First appears | Defined by |
|---|---|---|
| `K` (the bar symbol — the panel prints it from S1) | S1 | **S1 narration must name it: "the meter on the left reads the cart's kinetic energy, K."** Non-negotiable |
| `v` (HUD) | S1 | prerequisite; S1 narration names it as the cart's speed |
| `J` | S1 | S1 narration says "joules" |
| the proportional sign and `v²` | S2 | S2's formula surface **`K ∝ v²`** — the proportional form ONLY, so S3's full formula is not pre-spoiled |
| `½`, `m`, and the full closed form | S3 | S3's formula surface **`K = ½mv²`**, assembled only after BOTH factors have been shown. This is the state that STATES the law the concept is named after, and it is CORE ring |
| **`mg`** | S3 | S3 narration names the arrow as the cart's weight, in the same state that introduces `m`. No earlier state draws it |
| a negative v | S4 | S4's formula surface **`K = ½m(−v)² = ½mv²`** (U+2212, U+00BD, U+00B2) |

**S1 authors NO `formula_overlay`** — `K = ½mv²` on screen in S1 would print S2's answer one click before S2 earns it.

**"No claim without a rendered measurement."** Every number narrated is produced by a rendered instrument: K by the bar, v by the HUD row, m by the billboard and the weight arrow, the flag value by the stamp. **Nothing may name momentum, joules per metre, work, or a stopping distance as a NUMBER — none is rendered** (this is what F12 corrected in §9, and what F7 removed from S2).

### (c) Direction-rule plan

N/A, deliberately: kinetic energy is a scalar, which is literally S4's content. No right-hand rule, no direction glyph. The direction content here is the ABSENCE of direction, shown by two carts moving oppositely with identical readings.

### (d) Motion plan, loop arithmetic, and the frozen-pin margins

`g = NLB_G = 9.8` (L39589). Body half-width 0.55 m; slab drawn to ±6.0; engine clamp at ±6.0; run limit ±5.4 (see §3's three-bound table).

| State | Home pose | Motion | R (ms) | Position at t = R | Past ±5.4? |
|---|---|---|---|---|---|
| S1 | cart_a s0 = −5.4, v = 4 | constant-speed coast | 2400 | **+4.2** | no |
| S2 | cart_a s0 = −5.4 v = 2 · cart_b s0 = −3.4 v = 4 | constant-speed coast, two lanes | 2000 | **−1.4** and **+4.6** | no |
| S3 | cart_a s0 = −5.4, v = 4, m ramping 2 to 4 | coast plus `param_ramp` over [0, 7200] ms | 2400 | **+4.2** | no |
| S4 | cart_a s0 = −1.2 v = −3 · cart_b s0 = +1.2 v = +3 | coast apart, two lanes | 1300 | **−5.1** and **+5.1** | no |
| S5 | cart_a s0 = −5.4, v0 = 5, mu_k = 0.5, m = 3 | decelerate to rest past one flag | 2100 | at rest at **−2.849** from t = 1.020 s | no |
| S6 | cart_a s0 = −5.4, v0 = 4, m = 5 | sandbox, free-run | none (SEAM J wrap) | wraps | n/a |

**S5 flag arithmetic** (authored as `s_m = initial_position_m + d_target`). a = mu_k · g = 0.5 × 9.8 = **4.9 m/s²** (mass-independent, so the new 3 kg mass does not move it). d(v) = (v0² − v²) / 2a.

- the flag: v = 4.00 gives d = (25 − 16)/9.8 = **0.9184 m**, so `s_m = −5.4 + 0.9184 = −4.4816`; t = (5 − 4)/4.9 = **0.2041 s**; K = ½ × 3 × 16 = **24.0 J**
- launch: K0 = ½ × 3 × 25 = **37.5 J**
- rest: d = 25/9.8 = **2.5510 m**, s = **−2.849**; analytic t = 5/4.9 = **1.0204 s**. Discrete, by Checkpoint A's C4 method: v_n = 5 − 4.9n/60 crosses zero between n = 61 (v = 0.0183) and n = 62, so the discrete rest holds at **t = 1.0333 s**

**Frozen-pin margins.** Pin at `clamp(0.60·R, 150, R−150)` = `clamp(1260, 150, 1950)` = **1260 ms**:

| Asserted event | Event time at h = 1/60 | Pin | Margin | 167 ms or more? |
|---|---|---|---|---|
| the stamp is on the formula surface | 0.2041 s, at most 0.2374 s | 1260 ms | **1023 ms** | yes |
| the cart is at rest and the bar reads 0.0 J | **1.0333 s** (discrete) | 1260 ms | **227 ms** | yes |

**Checkpoint-versus-loop invariant.** `nlbRunLoopReset` calls `nlbResetTrajectory()`, wiping the stamp each cycle and re-firing it at that cycle's crossing. The crossing must occur before 55% of R: 204/2100 = **0.097**, far under 0.55. Every instant from 10% of the loop onward, including the pin, shows it stamped.

**Accepted trade in S5:** the cart is at rest from 1.03 s to 2.10 s, about 51% of the loop. This is inherent, not sloppy — the pin sits at 0.60·R and needs a 167 ms margin, so the stop must land at or before 0.53·R for any R. And it is not a dead tail: the cart at rest with the bar on exactly 0.0 J IS the state's closing claim.

**S4 pacing note (minor):** 1300 ms is the briskest loop here. Physics-author may raise it to 1400 ms, which ends the carts at ±5.4 — still inside the slab. With the new 45 J scale the bars read 50.0% either way, so this is a pure pacing choice with no legibility cost.

**Inherited engine scar on S5 (§0):** the friction arrow's first-frame reveal tint bypasses the SEAM Q ink floor, so its t = 0 contrast can fail where its settled colour passes. Engine-owned and OPEN; named so eye-walker does not re-file it.

**One-shots:** ONE checkpoint, in S5 only, `capture: ['v','K']`, `capture_mode: 'first'`. No `sum_merge`, no `height_markers`, no `phases`.

### (e) Modes

Conceptual-only (Rule 20 [D]) — no `mode_overrides`. `advance_mode`: `manual_click` on S1 to S5, `interaction_complete` on S6 — 2 distinct modes, Gate 12 satisfied. No `wait_for_answer`, no `pause_after_ms`.

### (f) `assessment` + `coverage_map` + `misconception_watch`, and the binding numeric constraints

`assessment` and `coverage_map` are authored by physics_author; every item whose `teaches_state` is S6 must be answerable from something S6 RENDERS. `misconception_watch` is exactly §4 — two entries, S2 and S4 only.

**(f-1) ONE shared `energy_layer.bar_max_J = 45` across ALL FIVE guided states (F2, and D1 below).** The peaks, all exactly determined because no guided state carries a slider:

| State | Peak K | Fill at `bar_max_J = 45` |
|---|---|---|
| S1 | 40.0 J | **88.9%** |
| S2 slow / fast | 10.0 J / 40.0 J | **22.2% / 88.9%** |
| S3 (ramp end) | 32.0 J | 35.6% rising to **71.1%** |
| S4 (each cart) | 22.5 J | **50.0%** |
| S5 (launch) | 37.5 J | **83.3%** (flag 53.3%, rest 0%) |

Concept peak = 40.0 J against a 45 J scale: **11% headroom, so `[PM_NLB_ENERGY_SCALE]` is unreachable in any authored run** (the warn fires only at `val > maxJ + 1e-9`, L43798).

**(f-2) The rationale for a SHARED scale is within-state legibility and overflow safety, NOT cross-state height comparison (F6).** `nlbFitEnergyPanel` (L43690-712) steps the whole panel down a rung when its bottom passes `innerHeight − 12`. A single-group panel bottoms at ~315 px and a two-group panel at ~567 px, so below a roughly 579 px viewport S2 and S4 drop to `NLB_EN_STEPS[1]` (`trk: 138`) while S1, S3, S5 and S6 stay at step 0 (`trk: 186`) — the same joules would render 74 px in S1 and 55 px in S2. THE EYE runs 1280×720 and can never see this. **No narration, caption or aha in this concept may compare a bar's height in one state to a bar's height in another.** Within a state both groups share one ladder rung, so the S2 and S4 comparisons are safe at every viewport.

**(f-3) The explore state authors `bar_max_J = 80`, with sliders clamped so overflow is impossible by construction:** concept-wide `slider_controls.v0 {min: −5, max: 5, step: 0.5, default: 4}` and `slider_controls.m {min: 1, max: 6, step: 0.5, default: 5}`, giving K_max = ½ × 6 × 25 = **75.0 J, under 80**. The key is `default`, not `def`. The default pose (5 kg at 4 m/s) reads 40.0 J at 50% — a live instrument, not a flat one. The `m` range contains S3's 2-to-4 ramp. This is the concept's only scale deviation and it is declared.

**(f-4) Friction is declared everywhere, by name.** S1, S2, S3, S4 and S6 author `surface.frictionless: true`, which hard-zeroes every body's mu for that state — without it S1 to S4's carts would decelerate and their constant-K claims would be false on screen. **S5 alone omits it and authors `mu_s: 0.5, mu_k: 0.5` on cart_a.**

**(f-5) `energy_layer` is authored on every state**, with `bars: ['K']` and `precision: 1`. **S2 and S4 additionally author `body_ids: ['cart_a','cart_b']`.** Without it the panel shows ONE group carrying the RIG AGGREGATE (L43626-27, L43748-51) — for S2 a single bar reading 50.0 J, the sum of 10 and 40, which renders cleanly and destroys the PRIMARY aha silently. **This is the single most dangerous line in the build.**

**(f-6) `h_ref_m` is NOT authored** (default 0). Every state is flat, so U_grav is identically zero and the negative-U warn (L43782) cannot fire. No U bar anywhere. S3's `mg` arrow is a mass indicator on a flat floor and creates no height and no potential energy.

**(f-7) S3's ramp `from` must equal the authored body mass** (`mass_kg: 2` with `param_ramp.from: 2`) so state entry does not jump — the engine's §7.1 authoring contract (L1573-75). The ramp `to: 4` also keeps the weight arrow inside `NLB_ARROW_MAX_LEN`: the clamp bites at 58.3 N, about 5.95 kg, so cycle 0's 8 kg would have flattened the top of the ramp into a constant-length arrow.

### (g) Macro-micro plan (Rule 33)

**N/A with rationale.** The taught variable (a body's kinetic energy) and its cause (that body's own mass and speed) are at the same macroscopic level; there is no microscopic mechanism in scope. Where the energy goes when friction stops a body IS a micro story, and it is #10's.

**Rule 33d instruments all carry live numerics:** the K bar's own joules; the per-body `v` HUD row (and `f` in S5); the mass on the billboard, now doubled by a physical arrow rather than only a digit; the stamp's measured values at a named place.

### (h) Canvas budget (Rule 34)

ONE formula surface per state: S1 **none** · S2 `K ∝ v²` · S3 `K = ½mv²` · S4 `K = ½m(−v)² = ½mv²` · S5 `K = ½mv²` with ONE stamp appended beneath by the engine · S6 `K = ½mv²`.

On-canvas caption is the delta cue only; prose narration lives in `#capStrip`. HUD is value-only.

**Zone map, with the panel's true shape (F2b):** the energy panel occupies the LEFT edge from `top:52px`, and in S2 and S4 it is **TWO GROUPS STACKED VERTICALLY** (group 1 below group 0 by 9 px, L43633), both bars the same amber, about 252 px between the fills' baselines, each with its own caption above and its own numeral below. Total two-group height about 567 px. The HUD, formula surface and slider rows sit at the RIGHT edge. Different edges, no overlap — but the two-group panel is tall, so **json-author must not add any left-edge overlay to S2 or S4.**

**Formula-surface width (F13).** `#nlb_formula` is `max-width: 340px` at `600 22px/1.45 'Cambria Math'` (L41957). S5's single stamp, `flag:  v = 4.00 m/s  ·  K = 24.0 J`, is 34 characters of which about 10 are spaces; at roughly 11 px per glyph and 5.5 px per space that is about **319 px — one line, inside the cap**, giving a two-line surface in total. Cycle 0's two stamps at 40 characters each would have run to five ragged lines. **Probe handed to physics-author:** at the pin, assert `#nlb_formula` renders at most two lines. **Fallback named now:** if it wraps, drop `'v'` from `capture` (leaving `flag:  K = 24.0 J`, about 18 characters) and move the speed into the state title, which then reads "At 4 m/s the meter reads 24 joules". The check stays verifiable either way.

All math is real Unicode: ½ (U+00BD), ² (U+00B2), the proportional sign (U+221D), minus (U+2212), middot (U+00B7).

### (i) Curriculum-flex block (Rule 38)

- **(i-1) Cut check 1, hide `advanced`:** no advanced-ring state exists (R1, concurred as C2), so the cut is a no-op and `standard` is identical to `full`. Declared, not overlooked.
  **Cut check 2, hide `advanced` and `extended`, leaving S1, S2, S3, S4, S6:** coherent. Nothing in the survivors references the flag, the stamp, friction, or S5's 5 m/s launch. The concept still STATES its law (S3's `K = ½mv²`, core) and still shows both dependences with measured bars — including, after F1, the linear-versus-quadratic contrast, which now lives entirely in the core ring. **What is lost is the fall to exactly 0.0 J**, which only S5 renders as a guided beat. That loss is bounded rather than total: S6 survives every cut, and a drag parks the cart at v = 0 with the bar reading 0.0 J (F8), so the reduced preset can still reach K = 0 on the teacher's own move.
- **(i-2) The explore state surfaces CORE content only (38b):** S6's formula surface is `K = ½mv²` (S3, core), its instruments are the K bar and the `v` HUD row (S1, core), and its controls are speed and mass — the quantities S2 and S3 teach, both core. Nothing from S5 (the flag, the stamp, friction) appears. **Every explore control carries a `min_ring`:** `v0` is `min_ring: core` (S2), `m` is `min_ring: core` (S3). Under both cuts every surviving control still maps to a surviving guided state.
- **(i-2b) The explore formula is derived by a surviving state under every preset:** S3 states `K = ½mv²` and S3 is core. There is no second closed form anywhere in the concept.
- **(i-3) `curriculum_tags` are CLAIMS (38g).** CBSE / NCERT Class 11 Ch.6, NCERT Eq. 6.7 — **verified** at authoring. IB DP Physics, AP Physics 1, A-Level (AQA / OCR / Edexcel energy modules), JEE Main, JEE Advanced, NEET — all with **`needs_teacher_verification: true`**.
- **(i-4) Presets (hide, never reorder):** `full` = S1 to S6 · `standard` = S1 to S6 (identical, no advanced ring) · `intro` = S1, S2, S3, S4, S6.
- **(i-5) Graph-axis convention:** N/A — no graph panel. The K bar is a vertical magnitude meter with a fixed zero, not a plot.

### Rule 41 audit of every reader-facing string

**State titles** (short, literal, front-loaded — the rail truncates): "A moving cart has kinetic energy" (S1) · "Twice the speed, four times the energy" (S2) · "Twice the mass, twice the energy" (S3 — **now true against its own ramp**, F1) · "Kinetic energy is never negative" (S4) · "Kinetic energy falls to zero" (S5 — replaces "Check the numbers", F4) · "Explore: change speed and mass" (S6).

**Delta cues:** "Moving cart, K above zero" · "Double speed, four times K" · "Double mass, double K" · "Backward: the same K" · "K falls to zero" (replaces "Speed halves, K quarters", which used *quarter* as a verb — F11) · "Change speed and mass".

**Body labels:** `cart` · `slow cart` · `fast cart` · `left cart` · `right cart`. **Flag label:** `flag`.

**Banned-register sweep.** Energy does not carry, store up, pack a punch, want, arrive, get lost or go anywhere in any string this concept ships. The cart moves, slows down and stops; the meter reads; the bar rises and falls. **Carried to physics-author:** the words *carry / carries / carrying*, *packs*, *possesses*, *lost*, *goes into*, and *quarters* (as a verb) must not appear in any `text_en`. Write "the cart has 40 joules of kinetic energy" and "the reading falls to zero" — never "the energy is lost", which both personifies and opens #10's question. "Kinetic energy", "joule" and "weight" are physics vocabulary, not jargon (41b).

**Two claims deleted this cycle, both because nothing renders them:** S2's "the fast cart covers twice the ground per second" (F7 — the carts start 2.0 m apart, the gap runs 2.0 to 6.0 m, and the `displacement_vector` remedy is blocked by the OPEN scar `nlb_displacement_vector_is_single_body_so_a_compare_state_measures_only_one`), and the anchor's ×4 stopping distance (F12).

---

## ENGINE FIT CHECK (0d — every state mapped to a built, contracted block)

> Every row asserting a limit or an absence quotes BOTH the config-type line and the reader-function line behind it. All line numbers read at source; the four cycle-0 RISK claims were independently re-verified by Checkpoint A and all four were confirmed correct.

| # | Needs | Engine block (contract line, then reader line) | Exercised by a shipped concept? |
|---|---|---|---|
| all | a K bar rendered at all | `energy_layer {bars, bar_max_J, precision}` (config type L1357-1414), read by `nlbEnCfg` L43429, `nlbApplyEnergyLayer` L43609, `nlbUpdateEnergyPanel` L43715, fill write L43818 | **NO — first pixel ever. RISK-1** |
| all | K published each frame | `nlbPublishEnergy` L43180; `snap.K` L43751, `b.K_J` L43745 | computed and shipped (SEAM K), never DISPLAYED |
| S1 | constant-speed coast, no force | `mode:'coast_no_force'` (L933) with `initial_velocity_mps` (L976), `surface.frictionless` (L942), `loop_reset_ms` (L1558) | YES — `positive_negative_zero_work` STATE_3 |
| S2, S4 | TWO K bars, one per cart, STACKED | `energy_layer.body_ids` (L1381), group loop L43626-49, per-body values L43744-47, caption L43637-44, vertical stack L43633 | **NO. RISK-2** |
| S2, S4 | two independent bodies in lanes | `bodies[]` of length 2 with no `pulley` (L951-53), `nlbBodyLaneZ` L40179-207, `NLB_LANE_GAP` L39610 | lanes shipped in Ch.5 compares and in #1 STATE_5/6 with camera `[3, 2.5, 9]`; **never with an energy panel** |
| S2, S4 | per-body speed readouts | `readouts: ['v']` (L1336), `nlbReadoutRowId(bodyId, key)` L40319, rows L40498-500 | YES |
| S3 | mass climbs on the state clock | `param_ramp {param:'m', from, to, end_ms}` — `'m'` in the closed enum (L1577), `nlbApplyParam('m')` writes `bA.m` (L42343), driver `nlbRunParamRamp` L42645-66 | `param_ramp` shipped for `'F'` and `'theta'`; **`param:'m'` and the ramp-plus-loop COMBINATION are firsts. RISK-3** |
| S3 | the weight arrow doubles with the mass | `arrows: [{body_id, show:['weight']}]`; `nlbArrowLen = \|F\| × NLB_ARROW_SCALE (0.048)` clamped `[NLB_ARROW_MIN_LEN 0.55, NLB_ARROW_MAX_LEN 2.80]` (L39661-63, L40808-13); label `mg` from `NLB_ARROW_DEFAULT_LABELS` (L39679); colour `#FFD54F` (L39670) | YES — the weight arrow is shipped fleet-wide. **What is new is only that its length is being read as a mass cue**, which is the same magnitude-to-length map it already uses |
| S5 | a flag that stamps v and K | `checkpoints[{s_m, label, capture, capture_mode}]` (L1494-1502) — `'K'` and `'v'` both in the closed `capture` enum (L1500); crossing detector L44203, `nlbCpStampText` L44755-96, interpolation branch L44767-69, `nlbRenderStamps` L44800+ | `checkpoints` shipped in #1 STATE_4 with `capture:['W']`; **the `'K'` and `'v'` branches have never run. RISK-4** |
| S5 | friction deceleration to rest | `mu_s` / `mu_k` (L977-78), `mode:'coast_with_friction'`, Branch A | YES — `positive_negative_zero_work` STATE_2 |
| S6 | sandbox with speed and mass live | `mode:'sandbox'`, `trusted_drag_seizes` (L1341), `controls_visible: ['v0','m']` — `'v0'` IS in the closed enum (L1340), `nlbApplyParam('v0')` L42396-402 writes both `b.v` and `b.v0`. Drag semantics: `nlbApplyBodyDrag` L42577-79 sets `b.s = sNew; b.v = 0` | sandbox shipped; the `v0` slider has no shipped exercise. Low risk (a three-line write path), and the drag's stop semantics are now DECLARED rather than assumed (F8) |
| S6 | slider ranges | `slider_controls` (L1877), `nlbSc(token)` merging over `NLB_SLIDER_SPEC` (v0 default −5 to 5, L42220) | YES — shipped in #1 and #2 |
| — | `deriveStateMeta.ts` co-edit | none: no new `scenario_type`, reveal key or cue time | zero edits |
| — | NOT used, deliberately | `work_accumulators` / `work_scale_J` (the §1 boundary) · `sum_merge` · `height_markers` · the `U_grav` / `U_spring` / `E_total` / `E_dissipated` bars · `h_ref_m` · spring · pulley · `angle_arc` · `displacement_vector` (blocked by an OPEN scar for two-body states anyway) · `P` / `P_avg` | — |

### The four risks physics-author must PROBE before json-author commits

All four were re-verified at source by Checkpoint A and confirmed. They remain PROBES because a verified contract is still an unrun code path — but note the change in status of RISK-2: **it is no longer a deferred decision, only a verification.**

**RISK-1 — `energy_layer` has never drawn a pixel.** Depends on: the panel becoming visible when a state authors `energy_layer` and no `work_accumulators` (`if (!cfg && !hasWk) { hide }`, L43624 — never taken with `hasWk` false); the empty-caption hide on single-group states (L43643-44); `nlbEnPct`'s 3-dp rounding (L43466-67), which its own comment says was added *"before the first ch6 concept authors an energy_layer and makes it live"* — this is that concept; and `nlbFitEnergyPanel`'s measured ladder (L43690-712), never used on a real panel.

**Probe:** drive S1 headless; assert `#nlb_energy` is displayed, `g0_K`'s fill height is 88.9% within half a percent, the value text is exactly `40.0 J`, and the console carries zero lines beginning `[PM_NLB_ENERGY_SCALE]`, `[PM_NLB_ENERGY_CLAMP]` or `[PM_NLB_ENERGY_DRIFT]` over 10 s.

**RISK-2 — the two-group panel, now a stated design fact rather than a deferred question.** Cycle 0 found the vertical stacking and then routed the proof forward, which was the concept-#2 failure repeated. **Cycle 1 resolves it in the design instead** (see D3 for why this needs no engine change): the stacking is written into §3, §10(f) and §10(h); the scale is chosen so the fills read 22.2% against 88.9%; and the aha is worded on the READING, with height as reinforcement, which also makes it immune to F6's viewport step-down. The remaining probe is verification, not a decision.

**Probe:** drive S2; assert two `nlb_en_g*` groups are displayed, captions read `slow cart` and `fast cart`, values read `10.0 J` and `40.0 J`, and the fills are 22.2% and 88.9%.

**Fallback, named now:** if THE EYE shows the stacked pair does not read as a comparison, the JSON-only remedy is to lean the S2 and S4 narration and delta cues entirely on the two NUMERALS and captions ("the slow cart reads ten joules, the fast cart reads forty") and drop every height word. No engine change, no state loss. **The one remedy I will NOT propose is a row layout** — see D3.

**RISK-3 — `param_ramp` on `'m'` combined with `loop_reset_ms` is a first.** Checkpoint A verified at source that `nlbResetTrajectory` (L45447-84) rewinds `s`, `v`, `a` and `F_net`, nulls `_ramp_last` (L45467) and **never touches `b.m`**, and that `nlbRunParamRamp` (L42645-66) is a pure closed form of `t_ms` — so a snap-back should be impossible. Verify it anyway, and verify the two rendered correlates.

**Probe:** drive S3 for 8 s across three loop cycles; sample the K bar value, the billboard text and the weight arrow's rendered length at 0, 1200, 2500 (just after the first reset), 4800 and 7200 ms. Assert the bar climbs monotonically from 16.0 J to 32.0 J with no snap-back at any cycle boundary, the billboard ends at `cart = 4 kg`, and the arrow length ends at 1.88 within a pixel of twice its starting 0.94.

**RISK-4 — the `'K'` and `'v'` capture branches have never rendered.** The interpolation branch (L44767-69) recovers the exact crossing instant as `vsq = v² − 2·a·back`, exact for constant acceleration, which is what lets this design promise `v = 4.00` to two decimals.

**Probe:** drive S5, pin at 1260 ms, assert `#nlb_formula` contains `K = ½mv²` and a `flag:` line carrying `v = 4.00 m/s` and `K = 24.0 J`, and that the whole surface renders in at most two lines (the F13 assertion).

**No renderer edit is required by any of the four.** Each is a verification of a built contract. If a probe fails in a way that needs a renderer change, that IS the alarm firing and it is a re-scope decision — do not absorb it.

### Phase-0 union walk

| State | Union row it consumes |
|---|---|
| S1 | **K bar** |
| S2 | **K bar** (two groups) |
| S3 | **K bar** |
| S4 | **K bar** (two groups) |
| S5 | **K bar** plus `checkpoints` |
| S6 | **K bar** |

Every state claims at least one row, and the survey's single row for concept #3 ("**`K` bar** — live ½mv², updates as the body moves") is claimed by all six. **Two capabilities are consumed that the union table does not list for #3: `checkpoints` (S5) and the weight arrow (S3).** Neither is a gap — both are shipped instruments from earlier chapters being reused with new parameters, and neither needs an engine line. Recorded so this is a declared reuse rather than a silent overrun.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** (1) Ch.5 kinematics (speed as a measured quantity) missing breaks **S1** — what is the HUD number? Patched by one clause naming the HUD row. (2) `friction_force` missing breaks **S5** — why is it slowing? Patched by one clause, "the floor here is rough, so the cart slows down steadily", with the `f` readout on screen. (3) `newton_second_law` missing also breaks S5, and the same clause covers it. (4) **New this cycle:** S3's weight arrow assumes only that a heavier body is pulled down harder — one clause, "the yellow arrow shows how heavy the cart is, and it grows as the cart gets heavier". **No state requires #1 or #2.**

**JEE-backwards trace.** *"A body of mass 2 kg moves with speed 10 m/s. Find its kinetic energy. If a second body of half the mass moves at twice the speed, what is the ratio of their kinetic energies?"*

- kinetic energy is a real, measurable quantity in joules — **S1**
- it goes as the SQUARE of the speed, so twice the speed is four times the energy — **S2**
- it goes in direct PROPORTION to the mass, so half the mass is half the energy — **S3** (and after F1 the student has actually SEEN the difference between the two scalings, which cycle 0 never showed)
- the exact form with the one-half, so ½ × 2 × 10² = 100 J can be computed — **S3** states it, **S5** verifies it against a measured value

Ratio = (1/2) × 4 = 2 : 1. Every piece is delivered. The follow-up *"how much work was done to give it that energy?"* is out of scope and belongs to #4.

**Misconception entry mapping (16a).**

1. *"Twice as fast means twice the energy."* Arrives with the student. Confronted at **S2**. **What plants it inside this concept is S1 itself** — one cart, one speed, one reading, inviting the linear reading. The adjacency is deliberate, but must be flagged at the planting moment: **S1's narration states the reading as a fact about THIS cart at THIS speed and must not say anything of the form "faster means more".**
2. *"Backward motion means negative energy."* Planted by S1 to S3, all moving left to right. Confronted at **S4**.

No EPIC-C branches.

### Block 2 — Aha-moment designation

- **PRIMARY aha (S2):** doubling the speed does not double the kinetic energy — it QUADRUPLES it. **The ten-year memory is two identical carts, one moving twice as fast as the other, and its meter reading four times as much: forty joules against ten, nearly the whole track against a stub.** *(Re-worded this cycle. Cycle 0 said "its energy bar standing four times as tall", which is a claim about relative HEIGHT between two vertically stacked bars — true, but fragile: F6 shows bar height is viewport-dependent, and F2 shows the bars are stacked rather than side by side. Anchoring the memory on the READING, with the fill fraction as reinforcement, is both true and durable.)*
- **SUPPORTING aha (S4):** kinetic energy has no direction and no sign — run the same cart backward at the same speed and the reading does not move by a joule.
- **Cohesion check:** both are consequences of the same feature of the formula, the square. The primary is the square's magnitude consequence; the supporting is its sign consequence. Checkpoint A confirmed S4 is not derivable from S2 (both S2 carts move right, so sign is never tested) — it IS derivable from S3's formula, which is precisely why Rule 16a exists. S3 and S5 are deliberately not designated ahas.
- **Wrong-belief setup:** for the primary, **S1** builds "the meter reads the motion, so more motion means more reading" one state before S2 breaks its unstated linearity. For the supporting, **S1 to S3** all run left to right, so "energy follows velocity, sign and all" is live entering S4.
- **Foundational-coverage:** S2 is inside `foundational` (STATE_1 to STATE_3). No exit-pill required.

---

## Refutations and declared decisions

R1 to R3 are cycle 0's, all concurred by Checkpoint A (C2, C3) and kept. D1 to D4 are cycle 1's disagreements with the review's proposed remedies — the findings are accepted, the arithmetic behind three of the fixes is not.

**R1 — no advanced ring, and inventing one would be padding.** Rule 38a does not require one to exist, and Rule 11 forbids padding. `K = ½mv²` is taught at identical depth by CBSE, IB, AP and A-Level. The one genuine derivation is the work-energy theorem, which is #4. Rejected candidates: `K = p²/2m` (momentum is not in the `readouts` enum, L1336 — the state would assert an unrendered number) and frame-dependence (nothing renders a second frame). **Consequence: `standard` equals `full`.** Concurred as C2.

**R2 — the K bar must be authored per BODY, not per concept.** With `body_ids` omitted the panel renders the rig aggregate; S2 would show one bar at 50.0 J. DoD (f-5).

**R3 — friction in S5 is chosen by the instrument's arithmetic.** No engine mechanism changes v without a force (`param_ramp` has no v, L1577; `idle_auto_sweep` has none, L1559), so the #4 boundary must be "no state draws or names work". An accelerating cart was rejected because K grows as t²: the pin margin forces the flag to t ≤ 0.60·R − 0.20 s, so the loop peak beats the taught value by about 3.9× and the teaching value renders as a sliver. Concurred as C3.

**D1 — `bar_max_J` should be 45, not the 55 the review proposed.** F2's 55 was derived from a concept peak of 50.6 J, which assumed S5 stays at 5 kg with `v0` merely lowered to 4.5. But F4 requires S5's numbers to change anyway, and taking S5 to **m = 3 kg, v0 = 5 m/s** puts its launch peak at 37.5 J — below S1 and S2's 40.0 J, which then becomes the concept peak. **45 J is therefore reachable, and it beats 55 on F2's own metric:** S2 reads 22.2% against 88.9% rather than 18% against 73%, and S4's equality reads at 50.0% rather than 41%. It also solves F4 in the same move instead of separately. Headroom is 11%, and since no guided state carries a slider every peak is exactly determined, so the overflow warn stays unreachable.

**D2 — F13's remedy should be ONE flag, not a shortened pair.** The review offered "shorten, or hand physics-author a probe". But F4 independently establishes that S5's second flag only re-states S2's 4:1 ratio. Dropping to one flag discharges F4 and F13 together, matches #1's shipped precedent exactly (one stamp), and leaves S5 with a single clean claim. I also re-estimated the width: at 22 px Cambria Math with spaces at roughly half advance, the 34-character stamp is about **319 px against the 340 px cap**, not the ~374 px a flat 11 px per character gives. It should fit on one line — but the probe and the fallback are both authored (§10(h)) because that estimate is not a measurement.

**D3 — a row layout is NOT required, and I am not escalating.** This is the founder-note question F2 asked to be answered explicitly, so here is the answer rather than a deferral.

The comparison a teacher actually performs in S2 is between two FILL FRACTIONS of two identical 186 px tracks, each captioned and each carrying its own numeral. That is the standard reading of stacked progress bars, and at 22.2% against 88.9% it is unmistakable — a stub against nearly the whole track. Vertical stacking makes it worse than side-by-side, but not illegible, and three things now carry the claim independently of the layout: the two numerals, the two captions, and the fill fractions.

There is also a reason to prefer NOT depending on the layout at all: **F6 proves that bar height is viewport-dependent**, so any design resting on height alone is already fragile on real classroom hardware. Re-wording the aha onto the READING (Block 2) fixes F2 and F6 with one change and no engine line.

And the cost side is real: as F2's founder note observes, a blanket `flex-direction:row` is unsafe because #9 authors up to five slots per group, so two groups would run about 570 px and eat the left half of the canvas. **A safe row layout would have to be conditional on group and slot count — a genuine engine feature, not a one-line change.** It is not warranted by a state that already reads.

**Recommendation, not a request:** if the founder later wants two-body compares to read optimally across #4, #9 and #10 (all of which need one), the right form is a `field3d_surgeon` scoped change gated on `bars.length <= 2 && groups === 2`, filed as a ride-along alongside Checkpoint A's E1 (the false "side-by-side" comment at L43206). **Not blocking, not requested here, and #3 does not need it.**

**D4 — one caution about F3's remedy that the review did not raise.** The weight arrow's colour is `#FFD54F` (L39670) and the K bar's is `#FFCA28` (L43396) — nearly the same amber. They sit in different screen zones (the arrow on the cart, the bar in the left panel), so this is almost certainly fine, but physics-author should confirm at THE EYE that the doubling arrow does not read as an extension of the meter. If it does, the JSON-only remedy is to author a different `color` on the S3 body so the arrow is read against a distinct cart, since the arrow colour itself is engine-fixed per kind.

## Compliance lines

- **Source check:** consulted NCERT Ch.6 scope (Eq. 6.7 placement) and HC Verma §8.1 for teaching SEQUENCE only. No teaching method, example problem, figure or phrasing imported. The catalog's India-specific anchors for A6 are not used.
- **Engine bug queue:** consulted LIVE this dispatch (§0). Every relevant `prevention_rule` is satisfied at a named site. **Two items are declared rather than discharged, both FLAGGED for quality-auditor Gate 8:** the Rule 16a ghost-bar descope (§4, engine-forced) and the inherited OPEN friction-arrow ink scar on S5 (§0, engine-owned). **FLAG:** run `query_engine_bug_queue.ts kinetic_energy_definition` and `--field3d --open` against the built JSON before verdict.
- **Rule 40:** no engine mechanism is proposed, so no `git log --all -S` search is owed. Pure JSON on master's shipped renderer.
- **Boundary reconciliation with #4:** §1's invariant (zero `work_accumulators`, no "work" or W in any string), re-checked this cycle against F3's new arrow, whose label is `mg`.

## Self-review checklist — all items verified

Atomic claim in one sentence with a mechanically-enforced #4 boundary, re-checked against the new weight arrow · 6 states in the medium band · control table complete, one declared contrast pair, two coined archetypes both now discharged by real motion, no static state, drag-sandbox explore-only · Rule 32 plan with an ARGUED 32a exemption for S3 replacing a false claim, and zero glow focals argued per state · every state proves something no other state proves, including S5 after its rebuild · Rule 33 N/A with rationale, all instruments live numerics · Rule 34 one formula surface per state, the panel's true vertical-stack layout written into the design, formula width estimated with a probe and a fallback · Rule 35 universal anchor now qualitative with its forward reference declared · Rule 38 rings tagged, both cuts run with the S5 loss bounded and named, explore core-only with ring-gated controls, tags as claims, presets derived · Rule 41 audit over every string including the two deleted claims · misconception_watch at exactly 2 pivots with the 16a delivery mode declared · deep-dive picks of 2 with 3 clusters each · entry_state_map with foundational containing the PRIMARY aha · prerequisites advisory · DoD with zero TBDs and every numeric constraint binding with arithmetic · Block 1 and Block 2 complete · **ENGINE FIT CHECK: every state mapped to a built contract with both lines cited; four never-exercised behaviours named with probes; three separate track bounds now correctly attributed; union walked both directions; ZERO renderer edits, no alarm.**

---

**Handoff to physics-author.** Inputs owed: the four RISK probes, run BEFORE writing the physics block (RISK-3 can still invalidate S3, and its fallback is not free); the F13 formula-width assertion and, if it fails, the named fallback in §10(h); the D4 arrow-colour check at THE EYE; narration inside the tabled word budgets, with the Rule-41 banned-word list honoured, S1's linearity-flag clause included, and S3's narration naming the S2-versus-S3 comparison explicitly (that comparison is the concept's spine and it now finally exists on screen); `assessment` and `coverage_map`; and confirmation of the S2 and S4 projected screen-x disjointness at t = 0 and every 100 ms through one loop (world gaps 2.0 m and 2.4 m against a 1.1 m body width, through the shipped `[3, 2.5, 9]` camera).

**json-author authors from this document's arithmetic ONLY:** the S5 flag as `s_m = initial_position_m + 0.9184`; the shared `bar_max_J = 45` on all five guided states and `80` on the explore state; `body_ids: ['cart_a','cart_b']` on S2 and S4 (the single most dangerous omission in the build); `param_ramp {param:'m', from: 2, to: 4, end_ms: 7200}` with `mass_kg: 2` on S3, plus `arrows: [{body_id:'cart_a', show:['weight']}]`; `surface.frictionless: true` on S1, S2, S3, S4 and S6; and zero `work_accumulators` and zero `glow_focal` anywhere.
