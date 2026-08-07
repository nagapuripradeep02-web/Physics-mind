# Checkpoint A — `rolling_on_incline` (rotmech 0b, REV 3 / fix cycle 1 response)

**VERDICT: `DESIGN_FIX` → `alex:architect` (fix cycle 2 of 2 — the last)** · founder-proxy, 2026-08-02

REV 3 is an honest revision. Every row of the FIX-CYCLE-1 RESPONSE table was diffed against the skeleton text and **every claimed fix actually landed**; every number was re-derived independently: the track model is now correct against the renderer on both sides, S7 is rebuilt and completes inside the plank, the energy split is exact for the geometry that produces it, and the slip envelope is computed rather than asserted. No silent skips. That is the highest-value thing available to catch and it is not there to catch.

But the corrected geometry exposed a class of question the document has never asked: **what happens at the end of a run.** Nothing in the skeleton says what a body does when it reaches the finish line, and once that is followed through, S5's payoff frame — the frozen pin of the entire extended ring — prints `14.0 J` under a caption that says the totals are identical. Separately, the one enum this design genuinely must touch (`checkpoints.capture`) is the one it did not diff, S6's three force arrows are arithmetically unrenderable at their true ratio on the shipped nlb arrow map at *any* authored mass, and three OPEN nlb rows that the audit's own query #5 returned land on the two payoff states. No physics-correctness doubt anywhere — the physics is right; the **rendering of it** is where this fails.

**Credit, so cycle 2 does not undo it:** the half-length + up-slope correction and its cascade · the S7 re-derivation · the ψ convention with px figures demoted to estimates and the probe as acceptance · the approach-the-camera decision (correct, and the reasoning is right) · the μ_min-tick-rides-the-μ_s-row solution to P1-6 (that is the *right* answer, not a workaround) · the CoM derivation route for S6 · the union-scope limit stated plainly. Do not churn any of it.

---

## Verified — the REV 2 → REV 3 diff, checked independently

**Renderer citations — re-verified, all nine correct.**
`:941` is verbatim `length_m?: number; // visible half-length, default 6`, and the `hidden?` comment two lines below says "*an empty **12 m** plank*" for the default 6 — the half-length reading is confirmed twice over. `:40060–40067` `halfWorld = lenM * NLB_WORLD_PER_M; slab.scale.set(halfWorld*2,…)` ✓ · `:44176` `span = (eng.length_m||0)*2` ✓ · `nlbBoundsM` (`:45166`) returns `{lo: -lenM, hi: lenM}` ✓ · `nlbGravAlong` (`:45093–45096`) returns `-b.m*NLB_G*sin θ` for a non-hanging body ✓ · `NLB_BODY_SIZE/2` lift `:40015` ✓ · `wgrp2.rotation.z = -(s*NLB_WORLD_PER_M)/NLB_WHEEL_R` `:40053` ✓ · lane `(k-(lanes.length-1)/2)*NLB_LANE_GAP`, `return 0` on any `fixed` body `:39998–40001` ✓ · `NLB_LANE_GAP = 0.85` `:39610` ✓ · `PerspectiveCamera(60,…)` `:3341` ✓ · θ-arc `R = 1.05` `:40074` ✓ · `NLB_SURFACE_DEPTH = 1.6` `:39621` ✓.

**Geometry — recomputed, correct.** `length_m = 3.0` ⇒ 6.0 m plank, s ∈ [−3.0, +3.0] ✓. `initial_position_m = +2.4` = 0.6 m inset (= 2× the largest half-width R = 0.30) ✓. Race runs toward −s ✓. `s_finish = −2.1` = 0.9 m inset ✓. S5 `s_finish = 2.4 − 2.366 = +0.034`, in bounds ✓. Slab depth: widest lane span 2.4 + 2(0.15) = 2.7 m ≤ 1.6 wu / 0.5 = 3.2 m, margin 0.25 m per side ✓ — the default `NLB_SURFACE_DEPTH` therefore needs no change, correctly stated.

**Energy against the run geometry the design actually produces.** S5's d = 2.366 m at 25° gives h = 2.366 × sin 25° = **1.00000 m** — the geometry is chosen *to* produce the 1.00 m drop, not asserted alongside it. mgh = 9.8 J; sphere 9.8/1.4 = 7.0 + 2.8; ring 9.8/2 = 4.9 + 4.9 ✓. (S1/S4's 4.5 m run drops 1.902 m — no energy claim made there, correctly.)

**S7 — fully re-derived from scratch, every digit correct.** μ_min(ring) = tan 25°/2 = 0.2331538 · ramp 600–1600 crosses it at 600 + 1000(0.2668462/0.45) = **1192.99 ms** ✓ · rolling distance ½(2.07083)(1.193²) = **1.4735 m**, s = **+0.9265** ✓ · v = **2.4705 m/s** ✓ · post-slip a = 9.8(sin 25° − 0.05 cos 25°) = **3.69757 m/s²** ✓ · remaining 3.0265 m via 1.84879t² + 2.4705t − 3.0265 = 0 ⇒ t = **0.77535 s** ⇒ arrival **1968 ms** ✓. **S7 now completes inside the track** (finish at s = −2.1, 0.9 m clear of the bound) and the skid is ~775 ms of visible motion. The REV 2 defect is genuinely gone.

**Timing table.** S1 2084.7 ms · S4 1744.2 ms · S5 1511.7 ms — all recomputed, all correct, and correctly unchanged (d and a were not touched by the coordinate fix). Pin margins all ≥ 167 ms ✓. S5's pin at 2700 ms lands inside the 1512–3012 ms freeze-and-read hold ✓.

**Slip envelope.** Per-shape μ_min at 25°: 0.1333 / 0.1553 / 0.1865 / 0.2332 ✓ — all under the fleet-wide 0.50. Full-preset maximum = ring at 40° = tan 40°/2 = **0.41955** ✓ > the 0.05 floor, so slip is reachable *with* its cue riding the same row; reduced presets max 0.2332 < 0.50, provably slip-free ✓. The reasoning is sound and the tick-on-the-row is the right structural answer.

**Projection arithmetic.** 0.8 × 220 × cos 35° = 144.1 px ✓ · diameter 0.30 × 220 = 66 px (correctly carrying no foreshortening) ✓ · clearance 78 ✓ · S4: 1.2 × 220 × 0.819 = 216.2, half-widths 0.40 × 220 = 88, clearance 128 ✓. Frame fit 6 sin 35° + 2.4 cos 35° = 3.44 + 1.97 m ⇒ 1189 px at 220 px/m ✓, self-consistent. Demoted to estimates with probe disjointness as the criterion — exactly the fix asked for.

**Every RESPONSE-table claim traced to the skeleton text and found present:** P1-1 §3 bullet 1 ✓ · P1-2 bullet 2 ✓ · P1-3 home-pose ¶ + timing ¶ + audit ✓ · P1-4 (b)-9 + S4 row + DoD (b)/(d) ✓ · P1-5 (b)-10 + (a)-9 + S6 row ✓ · P1-6 envelope ¶ + min_ring + (i-2) + (b)-5 ✓ · P1-7 audit rebuilt with six queries + (b)-11/12/14 ✓ · P1-8 S1/S4 + DoD (b) + (b)-15 + F9 ✓ · P2-1 §2/§3 S6 + §6 + §8 + Block 1 ✓ (and the chain `fR = I_cm α`, `α = a/R` ⇒ `f = kma`, `mg sinθ − f = ma` ⇒ `a = g sinθ/(1+k)` is correct and needs no parallel-axis theorem) · P2-2 §4 ✓ · P2-3 S5 ✓ · P2-4 (b)-13 ✓ · P2-5 preamble ✓ · P3-1 S7 ✓ · P3-2 three places ✓ · F8 caveat resolved at design time ✓. **No claimed fix is missing or overstated.**

---

## Pass 1 — scar consultation (re-run live; the `--field3d` gap confirmed)

`FIELD3D` at `query_engine_bug_queue.ts:23` holds 22 concept ids, **zero of them `newtons_laws_body`** — confirmed by reading the array. Queried instead by the eleven concept ids that actually carry the scenario (`grep -rl "newtons_laws_body" src/data/concepts/*.json`): `block_on_incline`, `connected_bodies`, `free_body_diagram`, `friction_force`, `newton_first_law`, `newton_second_law`, `newton_third_law`, `normal_force`, `rolling_friction`, `tension_force`, `work_done_by_constant_force` — plus a direct read-only SELECT on named classes. 606 rows live; 29 distinct OPEN rows across the nlb fleet.

**Recurrence check (the ratchet) — three cycle-1 finding classes recur in narrower form. Automatic P1 per Pass 1.**

| Class | Status in REV 3 |
|---|---|
| `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | **Root cause correctly named** (the `--field3d` list), and the seven rows handed to it are now dispositioned. But the direct SELECT queried *the rows named for it*, not *the rows the scenario has* — the sweep is still keyed to a hand-list. Query #5 (`friction_force`, `normal_force`) **returned** `nlb_body_label_is_brighten_only…`; it is not dispositioned. Four more OPEN nlb rows likewise. → P1-C |
| `closed_enum_cannot_name_a_substance_the_design_teaches` (MAJOR/OPEN, alex:architect — DO: *"diff it against the union of every substance, cell and quantity named in the state tables… Read the table; do not cite it"*) | Applied to `controls_visible` ✓. **Not applied to `checkpoints.capture`** (`:1494`) — the enum this design's finish stamps and S5's split most directly need. → P1-A |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | Genuinely fixed for length_m / gravity / lane / lift / spin / camera / arc — line-quoted both sides, verified. But **F9 declares finish chips a NEW build item without reading `checkpoints`** (`:1484–1501`), the near-identical existing mechanism (track-coordinate `s_m`, per-body, capture-on-pass, latch-and-hold). Same class, inverted. → P1-A |

**Classes checked and clean:** `nlb_multibody_lane_gap…` (override justified) · `nlb_static_state_authored_on_the_track_bound…` (0.6 m inset now a real inset) · `nlb_checkpoint_s_m_authored_as_displacement…` · `nlb_motion_archetype_declared_from_a_between_state_delta…` · `explore_controls_not_ring_gated…` · `field3d_param_ramp_authoring_contract` · `hysteretic_state_cannot_be_latched_under_a_time_pin` · `spec_semi_implicit_euler…` · `derivestatemeta_new_scenario_key…` · `field3d_build_once_body_reads_a_per_state_flag…` · `contrast_ghost…` · `symbol_printed_on_canvas_before_the_lesson_defines_it` · `real_world_anchor_declared…` · `chemistry_concept_id_collides…` · `camera_solve_searched_in_one_axis…` · `deferred_enum_members…`.

**N/A with reason, verified:** `nlb_work_probe_globals_disagree_on_multibody_states`, `nlb_coupled_sandbox_F_slider_exceeds_string_tautness_bound`, `field3d_nlb_body_label_overlaps_the_pulley_mesh`, `nlb_displacement_vector_is_single_body…`, `nlb_work_bar_glow_ids…`, `nlb_frictionless_state_…work_ledger` (no energy layer, no work accumulators, no pulley, no string, no displacement_vector — confirmed against DoD).

**Routing correction for the dispatching session:** `field3d_nlb_physics_clock_not_state_local` (CRITICAL/OPEN) carries owner **`peter_parker:renderer_primitives`**, which maps to **`pcpl-surgeon`** under the 2026-07-31 rename table — *not* `field3d-surgeon`. (b)-11 must be dispatched on that tag or it lands on the wrong agent. Also note: `RESET_TRAJECTORY` **is** implemented and rebases the state-local clock (`:45002–45018`), and production's `rollTimeline()` sends it on every state entry — the row is OPEN because THE EYE's `SET_STATE` path still free-runs. (b)-11's framing is correct; the fix is smaller than the CRITICAL tag suggests.

---

## P1 findings — block the design

### P1-A · Nothing says what a body does at the finish line — and in S5 the payoff frame prints a false total

This is the geometry fix's un-followed consequence, and it is the highest-severity finding in the report.

**The engine's only end-of-run behaviour is the track-bound clamp** (`:45582–45591`): `if (s1 < bd.lo) s1 = bd.lo; … v1 = 0; a = 0;`. There is no halt at an authored `s_finish`, and the skeleton authors none.

**(a) S5 — the frozen pin photographs `14.0 J` under "Same energy, different split".** The sphere reaches `s_finish = +0.034` at **1265 ms**; the ring at **1512 ms**. The freeze-and-read hold begins at the *ring's* arrival, so at that instant the sphere has run on to s = 2.4 − ½(2.95833)(1.5117²) = **−0.980**, a drop of 3.380 m along the slope = **h = 1.4286 m**. Its live readouts — derived exactly as DoD (g) specifies, `KE_trans = ½mv²`, `KE_rot = ½k·mv²` — read **`KE_trans 10.0 J · KE_rot 4.0 J`**, total **14.0 J** beside the ring's 9.8 J. The state's delta cue, its narration, and the extended ring's entire reason for existing all assert the totals are identical. The pin at 2700 ms sits squarely inside that hold. `teach_visual_must_match_narration` and `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` both fire.

**(b) The latch mechanism exists and its enum is closed.** `checkpoints` (`:1484–1501`) is exactly "latch a value at a track-coordinate crossing and hold it to state end" — `s_m` (absolute track coordinate), `body_id`, `capture_mode: 'first'` latch, plus a CRITICAL/FIXED crossing-instant interpolation (`nlb_checkpoint_capture_overshoots_exact_crossing_value`, `:44263`) that is precisely what a finish stamp needs. Three constraints the skeleton never states: **`capture` is closed** — `'K'|'U_grav'|'U_spring'|'E_total'|'v'|'s'|'W'`, no `KE_trans`, no `KE_rot`; **stamps render into the state's ONE formula surface** (`:1487`, Rule 34b) and S5 authors *no* formula surface (DoD (h): "S5: none"); **`NLB_CP_MAX = 3`** (`:43547`) against S1's four finish stamps. And `eng.energy_active = !!(energy_layer || work_state || checkpoint_state)` (`:42747`) — authoring checkpoints turns the energy paths on, which the founder's no-bars ruling makes a decision, not a detail.

**(c) S8's sandbox wrap is PER BODY, so the race desynchronises permanently after one lap.** `nlbSandboxWrap()` (`:42185`) is true exactly for `mode: 'sandbox'` — which DoD (e) reuses for S8 — and the wrap at `:45569–45577` re-anchors only the body that crossed: `if (s1 > bd.hi) { s1 -= span; v1 = b.v0; … }`. Four bodies with a = 2.958 / 2.761 / 2.485 / 2.071 reach the bound at 1911 / 1978 / 2085 / 2284 ms and each restarts alone. From lap 2 onward there is no start line and no finish order. **The DoD's own teacher-walk answer (j)(2) — "then S8 pit a marble against a huge ring" — is not achievable on the engine as specified.** `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` (MODERATE/OPEN) is the recorded shape of this.

**(d) S1's last 62% is a static heap.** Bodies overshoot the finish by 0.9 m and are clamped at s = −3.0 with v = 0, a = 0 from 1911–2284 ms onward; the loop runs to 6000 ms and the pin fires at 3600 ms. The pinned frame is four motionless bodies at the bound with the finish line 0.9 m behind them — not the race, and not "stamped on crossing".

**Concrete correction (all four are one decision):**
1. Author the finish-line semantics explicitly in §3: bodies **HALT at `s_finish`** (a named build item — no such stop exists) *or* per-body readouts and stamps **LATCH at that body's own crossing** and hold. State which.
2. Add the `checkpoints.capture` enum diff to the build sheet alongside the `controls_visible` one, name `KE_trans`/`KE_rot` as the missing members, resolve the formula-surface routing for a state with no formula surface, and resolve `NLB_CP_MAX = 3` vs four stamps. State whether F9 reuses checkpoints or bypasses them — and if it bypasses, say why, with the line numbers.
3. Add a **synchronised all-body race restart** for `mode: 'sandbox'` (the per-body wrap is a defect for a race, not a feature), or author S8 on a non-sandbox mode with `loop_reset` and state how Rule 37's continuous-run invariant is met.
4. Re-derive the four `loop_reset_ms` values against the halted geometry so the pin photographs a race, not a heap. (At the halted geometry, S1 with R = 4000 puts the pin at 2400 ms — 315 ms after the ring's crossing, dead zone 48% instead of 65%.)

**[owner: alex:architect]** · engine items 1/3 tagged **blocking** in the engine queue below.

### P1-B · S6's force triangle cannot be drawn at its true ratio on the shipped arrow map — at any authored mass

The nlb arrow map is `NLB_ARROW_SCALE = 0.048` wu/N, `NLB_ARROW_MIN_LEN = 0.55`, `NLB_ARROW_MAX_LEN = 2.80` (`:39661–39663`), applied at `:40603–40604`: `L = |F|·0.048; if (L < 0.55) L = 0.55`.

At S6's only stated mass anywhere in the concept (m = 1 kg, from S1):

| Arrow | F (N) | raw L (wu) | rendered L |
|---|---|---|---|
| mg sin θ | 4.1417 | 0.199 | **0.55** (floored) |
| N = mg cos θ | 8.8818 | 0.426 | **0.55** (floored) |
| f_s = k·mg sin θ/(1+k) | 1.3806 | 0.066 | **0.55** (floored) |

**All three render at exactly the same length.** The state whose entire derivation is `mg sin θ − f = ma` with `f = k m a` draws three identical arrows on a 0.15 wu-diameter ball (MIN_LEN is 3.7× the body diameter at R = 0.15 m).

And no mass rescues it. The map's usable dynamic range is 2.80/0.55 = **5.09 : 1**. The ratio S6 must show is N : f_s = (1+k)cos θ / (k sin θ) = (1.5 × 0.90631)/(0.5 × 0.42262) = **6.43 : 1** for a disc at 25°. 6.43 > 5.09 — at every mass, one of the two clamps. The OPEN row `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (MAJOR/OPEN, `alex:physics_author`) states the requirement quantitatively — *"Where two force magnitudes are compared on the same canvas for their LENGTH ratio, the SMALLER of the pair must clear the floor… Scale masses… rather than shrinking forces"* — and it is not in the audit. (It is also reachable: the row's `concepts_affected` is `newton_second_law`, an nlb concept.)

Secondary: S3's contrast draws f_k = μ_k N = 0.15 × 8.8818 = **1.33 N** against the rolling f_s = **1.38 N** — both floored, so the two friction arrows the misconception beat contrasts are pixel-identical in length. (Not fatal — the claim is the *type* — but the skeleton should say so rather than leave it to be discovered.)

**Concrete correction — pick one at design time and show the three lengths:**
- **(i)** Drop N from the *compared* set and author S6's disc at **m ≈ 12–14 kg**: f_s = 17.2 N ⇒ 0.825 wu (1.5× floor, per the row's own margin), mg sin θ = 51.6 N ⇒ 2.48 wu (under MAX), ratio 3 : 1 rendered honestly. DoD (b) then must drop N or mark it explicitly not-to-scale.
- **(ii)** Raise S6's θ to ≥ 31° (3 cot θ ≤ 5.09) — but that breaks the one-θ-concept-wide rule and Rule 32d, so it is the weakest option.
- **(iii)** Make `arrow_scale` / `min_len` **authorable per concept**, defaulting to today's constants. Cheapest and the highest-quality answer per the PRIME DIRECTIVE — but it is a **sixth 0c-2 item not in the survey's union row**, so it is an alarm-rule item, not a free choice.

**[owner: alex:architect]** (design-time mass/θ decision) · option (iii) is an engine item, tagged **blocking**.

### P1-C · Three OPEN nlb glow rows land on the two payoff states; none is dispositioned

All three were reachable from the audit's own query #5.

**(a) `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal`** (MAJOR/OPEN, `peter_parker:field3d_surgeon`; concepts: `work_done_by_constant_force, newton_third_law, connected_bodies, friction_force, normal_force`). DO: *"brightenOnly protects OBJECTS, never text. Any `*_label` elementType is a normal emphasis peer and must dim."* Consequence here: **on S4 — the PRIMARY aha, the state whose whole claim is that mass does not matter — the brightest text on canvas will be `m 5 kg` and `m 0.5 kg`**, outranking the k chips the state glows. Block 1 requires those mass labels to be visible for the state to work at all.

**(b) `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach`** (MAJOR/OPEN, `alex:json_author`). DO: *"Rule 32e caps the focal count at one; it does NOT require one… if it is a RELATION between two overlays, author no glow_focal."* §3's legibility paragraph authors a single focal in every state including **S4** (a relation between two k chips) and **S5** (a relation between two KE pairs, *"one body at a time during the hold"*). Glowing the sphere's pair drops the ring's pair below the contrast floor — during the held frame that IS the payoff, and that the pin photographs.

**(c)** `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` (MAJOR/OPEN, **FOUNDER DECISION PENDING**) — *not* a blocker here, stated explicitly so cycle 2 does not chase a pending ruling: nlb has its own in-state sequenced focal channel, `phases[].glow_focal` with a windowed hand-back (`nlbRunPhases`, `:45296–45310`), which is independent of `SET_GLOW`. S5's "one at a time" must name **that** channel.

**Concrete correction:** §3's single-focal line states, per state, whether the focal is a state-level default or a `phases[]` event; **S4 and S5 author NO state-level `glow_focal`** and drive emphasis from `phases[].glow_focal`; the body-label brighten-only row becomes a named build-sheet precondition for S4 (engine-owned).

**[owner: alex:architect]** · (a) tagged **blocking** in the engine queue.

### P1-D · S2, S3 and S6 carry no loop/pin timing — and S3's first sub-beat is the misconception picture

The §3 timing table covers S1/S4/S5/S7. **S3 is the state where the omission costs most:** it is a two-half sequential beat whose *first* half renders the wrong physics (locked block skidding, `f_k` label, skid trail), and THE EYE's frozen pin at 0.60 × `loop_reset` produces the archived representative frame for STATE_3. Nothing in the skeleton constrains that pin to land in the second (rolling-disc) half. If the block half runs past 60% of the loop, **the concept's own archive shows the misconception as STATE_3's picture** — and eye_walker and quality_auditor read exactly that frame. The two rows the skeleton applied to four states (`nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows`, `nlb_loop_reset_clears_checkpoint_stamp…`, both DIRECTIVE/OPEN, `alex:architect`) are unapplied to the one state where the failure mode is worst.

Secondary, same root: **S2's "rolls slowly" is not achievable** at the concept-wide θ = 25°. A disc has a = 2.7611 m/s², so the authored ≈2 m of run takes 1.20 s at ~1.75 rev/s (R = 0.15 m ⇒ 2.12 revolutions) — the cycloid's "visible pause at each ground touch" is ~0.1 s per cusp. The skeleton neither reduces θ for S2 (which would break Rule 32d and its own one-θ rule) nor states S2's loop. S6 likewise has an authored beat (arrows in sequence → formula build → release → live `a` matches) with no loop budget.

**Concrete correction:** extend the timing table to **S2, S3 and S6** with sub-beat schedules; for S3 state the block-half / dissolve / disc-half boundaries and show that 0.60 × R lands ≥ 167 ms after the rolling disc's descent begins and before its loop end; for S2 restate the motion against the physics the concept actually authors (a longer run, a bigger R, or an explicit statement that the cycloid reads at 2.1 revolutions).

**[owner: alex:architect]**

### P1-E · Three shared nlb constants are directed to be REPLACED with no absent-field fallback and no regression pair

(b)-9 requires `radius_m` to drive mesh scale, contact-height lift (today `NLB_BODY_SIZE/2`, `:40015`) and spin divisor (today `NLB_WHEEL_R`, `:40053`). (b)-10 requires authorable `lane_gap_m` + explicit lane assignment where lane z is today `index × NLB_LANE_GAP = 0.85` (`:39610`, `:39998–40001`). Both are written as unconditional requirements. **Eleven shipped concepts sit on this scenario** — `block_on_incline`, `connected_bodies`, `free_body_diagram`, `friction_force`, `newton_first_law`, `newton_second_law`, `newton_third_law`, `normal_force`, `rolling_friction`, `tension_force`, `work_done_by_constant_force`.

The coupling is load-bearing and documented: `NLB_WHEEL_R` carries *"Radius is exactly HALF the block size, which is what makes the swap free: nlbSetBodyPosition already lifts a body's centre to NLB_BODY_SIZE/2, so a wheel of that radius touches the surface at y = 0 with no positioning branch, and a wheel and a block of equal mass occupy the same footprint — the side-by-side race is honest."* `NLB_LANE_GAP` carries *"1.55 × body size, so the blocks read as clearly separate rows."* A surgeon implementing (b)-9/(b)-10 as written resizes and re-lifts every body and re-lanes every compare state in all eleven.

The skeleton's Rule-29 ruling correctly addresses the *mass-independence* comment but not either of these *geometric* couplings, and the build sheet contains no back-compat clause and no acceptance test.

**Concrete correction — one clause:** every field added by (b)-9/(b)-10 is **optional; absent ⇒ today's constant, byte-identical**. Acceptance = THE EYE re-run with **zero** pixel diff on two shipped nlb concepts: one carrying `shape: 'wheel'` (`rolling_friction` or `friction_force`) and one two-body lane compare (`work_done_by_constant_force` or `connected_bodies`).

**[owner: alex:architect]**

---

## P2 findings

**P2-1 · The audit's completeness claim is *still* stronger than its query set.** REV 3 writes *"A row I did not query is not dispositioned; every disposition traces to one of these six queries"* — an honest formulation — but then dispositions "all other REV 2 rows … verdicts unchanged" while five OPEN nlb rows returned by its own query #5 go unmentioned: the three of P1-C plus `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` (MAJOR/OPEN — S2/S6/S7 close the camera on the contact point, which is exactly where a body screen anchor migrates) and `frozen_frame_read_as_dense_series_continuation_on_translating_body` (MODERATE/OPEN — this concept is eight states of translating bodies read from frozen frames). **Fix:** replace the hand-list with the eleven-concept sweep above and disposition what it returns.

**P2-2 · §4's rewritten `one_line_fix` answers mass but not radius.** The state is titled "Mass and radius cancel" and the fix line is *"doubling the mass doubles both the pull down the slope and the resistance to speeding up… only the shape factor k survives."* Radius is never addressed. Ring-safe and Rule-41 clean, but half the claim. Add a clause for R (the driving torque and the rotational inertia both scale with R², at fixed shape).

**P2-3 · The framing estimates are quoted at mid-run; the probe's worst case is t = 0.** Because the race *approaches* (correctly authored), the scale is smallest at t = 0 — precisely where the scar row's probe samples first (*"disjoint at t=0 and at every 100 ms sample"*). The 220 px/m reference is mid-run. State the t = 0 scale, or state that the acceptance criterion is evaluated at the far end. (The design almost certainly clears — a ~15% scale reduction leaves ~66 px of clearance — but the document should say which end it is defending.)

**P2-4 · The frame-fit estimate treats the along-track run as horizontal.** 6 m × sin ψ omits the cos 25° the incline introduces (true horizontal extent 5.44 m). Conservative — it over-states the required screen-x — so it is safe, but it should be stated as a bound rather than a value.

**P2-5 · The 0c-2 union is now further from the survey row than it was last cycle, not closer.** See ruling 5.

---

## P3 notes

**P3-1 · Bodies come to rest at an invisible wall.** `:45582–45591` clamps s and sets v = 0, a = 0 with no visible cause. Whatever P1-A resolves, the surface bound should never be the thing that stops a raced body on screen.

**P3-2 · D9: "The race: four shapes" is the one title that names a topic rather than a result.** The other seven state results. Not a Rule-41 problem — a rubric-D9 note only.

---

## Rulings on the questions asked

1. **Did the claimed fixes land?** **Yes — all seventeen, verified in the skeleton text, with the arithmetic independently recomputed.** No silent skips, no overstatement. The RESPONSE table is trustworthy.

2. **Is S7 renderable now?** **Yes.** Independently re-derived to the digit; slip onset at s = +0.93 (1193 ms), arrival at s = −2.1 (1968 ms), both comfortably inside s ∈ [−3.0, +3.0], 775 ms of visible skid, pin at 2400 ms in the held slip picture. The REV 2 defect is fully gone. **Every other state's geometry also checks out against the corrected model** — S1/S4 (4.5 m run, +2.4 → −2.1), S5 (2.366 m, +2.4 → +0.034), S2 (≈2 m, +2.4 → +0.4), S6/S3 at the home pose. What the corrected model *exposes* is behaviour past the finish (P1-A) and S2's pacing (P1-D).

3. **Energy accounting vs the geometry.** **Correct, and correctly derived rather than asserted:** S5's d = 2.366 m is chosen to give h = 1.00000 m exactly, mgh = 9.8 J, sphere 7.0/2.8, ring 4.9/4.9. The REV 1 defect is genuinely closed. **The failure is not the arithmetic but the instant at which the readouts are read** — every one of those numbers is the true value at *that body's own* finish crossing, and the design holds the frame at a *later* instant (P1-A).

4. **Does the design still leave the closed SEAM-L enum alone?** **Yes — completely.** No energy bars anywhere; (b)-6 says *"no SEAM-L change, no new bar, ever"*; `E_total`'s stacked column and the 10+ shipped concepts on it are untouched. **But the other three shared constants named are NOT protected by anything in the document** — the contact lift at `:40015`, the spin divisor at `:40053` and `NLB_LANE_GAP = 0.85` at `:39610` are all directed to be replaced with no absent-field fallback and no regression pair. That is **P1-E and it is blocking**. And there is a *fourth* closed enum in play the document never diffed: `checkpoints.capture` (P1-A).

5. **Does REV 3 close the 0c-2 union against the survey row?** **No — and the gap is now larger than it was last cycle.** REV 3 genuinely closes the race-apparatus items flagged in cycle 1: per-body radius (b)-9, authorable lane geometry (b)-10, the occlusion warning (b)-12, camera target (b)-13, centre markers (b)-15, the state-local clock (b)-11. That was good work. But this pass adds **three more items outside the survey's 0c-2 row**: (α) the finish-line halt / per-body latch, plus the `checkpoints.capture` enum and `NLB_CP_MAX` resolution; (β) a synchronised all-body race restart for `mode: 'sandbox'`; (γ) an authorable arrow map, if that is the chosen route for P1-B. **Ruling unchanged in direction, stronger in degree: the survey's 0c-2 row needs a founder-signed amendment BEFORE the surgeon is dispatched, and the amendment is now ~9 items against a row that reads "shape factor · acceleration branch · N bodies racing".** Still no new `scenario_type`, still inside the nlb apparatus family — the alarm rule is firing loudly but correctly, at Phase 0, which is where it is supposed to fire. Do not stop the chapter; do sign the amendment.

6. **Dependence on `pure_rolling` (#11).** Judge these as a **pair**, not one-of-two:
   - **P1-B (arrow map)** — #11 draws the contact-point friction call-out; the same floor applies to its `f_s`. The mass/θ/scale decision must be made **once for both**, or the two concepts will disagree on apparatus scale (Rule 32d across the chapter).
   - **P1-C (glow ruling)** — fleet-wide on nlb; #11's contact-picture states are relation states too. One ruling covers both.
   - **(b)-11 state-local clock, (b)-3 cycloid/trace replayability** — shared preconditions.
   - **P1-D S2 timing** — S2 *is* #11's recap; whatever pacing #11 authors for the cycloid, S2 must match.
   - **#12-only:** the finish-line halt/latch, lane geometry for four lanes, finish chips + TIE, the shape-factor chip, the slip regime.
   **Recommendation stands and hardens: author #11's skeleton and run its Checkpoint A before the 0c-2 dispatch.** REV 3 already states this as a limit; with P1-B and P1-C it becomes a genuine dependency, not a tidiness preference.

7. **Rule 41 / 35 / 38 — re-checked, still clean.** All eight titles and delta cues basic literal English; "cancel", "ranks", "links" are the words the algebra uses (41b); meaning in the first words (41d). The food-can/tape-roll anchor remains universal, physics-true (k ≈ 1) and checkable in thirty seconds anywhere. Rule 38 holds in full: ordering qualitative → quantitative → derivation ✓, advanced contiguous before explore ✓, both ring cuts re-run independently and coherent ✓, notation ladder ✓, dialect dual-labels once ✓, `curriculum_tags` carry `needs_teacher_verification` ✓, 38e declared N/A ✓. **The 38b leak flagged last cycle is genuinely closed** — the μ_min tick riding the μ_s row is the correct structural fix, not a workaround.

---

## Additions the 0c-2 build sheet must carry (on top of REV 3's (b)1–15)

1. **Finish-line semantics** — an authored halt at `s_finish`, or a per-body latch of KE/finish values at that body's own crossing; with the `checkpoints.capture` enum diff (`KE_trans`, `KE_rot`), the formula-surface routing for a state with no formula surface, and `NLB_CP_MAX = 3` vs four stamps resolved. *(P1-A)*
2. **Synchronised all-body race restart for `mode: 'sandbox'`** — the per-body wrap at `:45569–45577` is a defect for a race. *(P1-A(c))*
3. **Arrow map** — either an authorable `arrow_scale`/`min_len` (default = today's constants) or a design-time mass/θ decision that clears the floor with the row's 1.5× margin, with the three rendered lengths tabled. *(P1-B)*
4. **`nlb_body_label` removed from the brighten-only set** — precondition for S4's focal to mean anything. *(P1-C(a))*
5. **Back-compat clause + regression pair** — every (b)-9/(b)-10 field optional, absent ⇒ today's constant; zero-pixel-diff THE EYE on one `shape:'wheel'` concept and one two-body lane compare. *(P1-E)*

---

## `engine_queue` — `FIX(engine)` items this design implies

| # | Item | Owner | Tag | Evidence the engine agent needs |
|---|---|---|---|---|
| E1 | State-local physics clock / `RESET_TRAJECTORY` rebase for the nlb integrator | **`peter_parker:renderer_primitives`** (row's own tag → `pcpl-surgeon`) | **blocking** | `field3d_nlb_physics_clock_not_state_local` CRITICAL/OPEN. `RESET_TRAJECTORY` exists (`:45002–45018`); the gap is the `SET_STATE`-without-reset path THE EYE uses. Precondition for the entire §3 timing table. Probe: pin two states, assert `PM_nlbTimeMs` is 0 at reveal start. |
| E2 | `PM_NLB_LANE_OCCLUSION` warning → `manifest.warnings` | `peter_parker:field3d_surgeon` | **blocking** | `the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another` MAJOR/OPEN, DO verbatim. Without it the framing plan is un-gated at 4 bodies. |
| E3 | Finish-line halt **or** per-body crossing latch; `checkpoints.capture` extension; `NLB_CP_MAX` ≥ 4 | `peter_parker:field3d_surgeon` | **blocking** | `:1484–1501` (config), `:43547` (`NLB_CP_MAX = 3`), `:44240–44262` (crossing detector), `:45582–45591` (bound clamp is the only current stop). Expectation: at t = 1512 ms in S5 the sphere's readouts read 7.0/2.8, not 10.0/4.0. |
| E4 | Synchronised all-body wrap for `mode: 'sandbox'` | `peter_parker:field3d_surgeon` | **blocking** | `nlbSandboxWrap()` `:42185`; per-body wrap `:45569–45577`. Expectation: four bodies restart from a common start line every lap. |
| E5 | Authorable `arrow_scale` / `min_len` (default 0.048 / 0.55) — *only if option (iii) is chosen for P1-B* | `peter_parker:field3d_surgeon` | **blocking** if chosen | `:39661–39663`, clamp `:40603–40604`. Usable range 5.09:1 < required 6.43:1. |
| E6 | `nlb_body_label` out of the brighten-only set | `peter_parker:field3d_surgeon` | **blocking** (S4) | `nlb_body_label_is_brighten_only…` MAJOR/OPEN, DO verbatim. Probe already written in the row. |
| E7 | Per-body `radius_m`; authorable `lane_gap_m` + assignment — **each optional, absent ⇒ today's constant** | `peter_parker:field3d_surgeon` | **blocking** | `:40015`, `:40053`, `:39610`, `:39998–40001`. Acceptance: zero-pixel THE EYE diff on `rolling_friction` + `work_done_by_constant_force`. |
| E8 | Camera **target** authoring; θ-arc clamp vs outer lane; `#nlb_formula` at S6's longest line; readout zone sized off rendered neighbour height | `peter_parker:field3d_surgeon` | ride-along | `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` MAJOR/OPEN; `nlb_angle_arc_radius_overruns…` MAJOR/OPEN (`:40074`, R = 1.05); `nlb_formula_and_readout_zones_are_fixed_css…`; `field3d_edge_anchored_formula_surface…` (340 px). |

founder-proxy routes; it does not dispatch. All eight are 0c-2 scope, none forces a new `scenario_type`.

---

## Candidate scar rows (report-only — dispatching session files; no `bug_class` collision confirmed against 606 live rows)

```sql
-- 1
('skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed',
 'A freeze-and-read comparison state prints each body''s value at ITS OWN finish, but holds the frame at the SLOWEST body''s arrival',
 'MAJOR','alex:architect',
 'The design specified live-derived readouts and a held payoff frame, but never specified what a body does after it crosses the finish line. The faster body runs on, so at the held instant its live values are those of a larger drop and the state''s "identical totals" claim is false on screen.',
 'A state that HOLDS a comparison must state, at design time, what happens to each compared body at its own finish: it halts, or its compared quantities latch at its own crossing. Compute every asserted value at the instant the frozen pin actually fires, not at the instant the value is first reached.',
 'js_eval',
 'For each state authoring a held comparison of two or more bodies: read each body''s asserted readout values from the skeleton, drive the state to the frozen-pin time, and assert each rendered readout equals its asserted value within 2%.',
 'OPEN', ARRAY['rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 2
('architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range',
 'A free-body state authors three forces whose true length ratio cannot be rendered at ANY mass on the renderer''s clamped arrow map',
 'MAJOR','alex:architect',
 'newtons_laws_body clamps arrow length to [NLB_ARROW_MIN_LEN, NLB_ARROW_MAX_LEN] = [0.55, 2.80] world units, a usable range of 5.09:1. A rolling free-body at theta = 25 deg needs N : f_s = (1+k)cos(theta)/(k sin(theta)) = 6.43:1 for a disc, so one arrow always clamps; at m = 1 kg all three floor to the same length.',
 'Before authoring a multi-arrow free-body state, compute every force at the authored mass and angle, divide by the renderer''s arrow scale, and check BOTH ends of the clamp. If max(F)/min(F) exceeds MAX_LEN/MIN_LEN the state is unrenderable at any mass: change the angle, drop an arrow from the compared set, or make the arrow map authorable. Quote the arrow-map constants with line numbers.',
 'js_eval',
 'For each state authoring two or more force arrows: read the rendered arrow world lengths, compute the authored force magnitudes, and assert the length ratio matches the force ratio within 10% for every pair. Any pair whose rendered lengths are equal while the forces differ is this bug.',
 'OPEN', ARRAY['rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 3
('engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause',
 'A bounded scenario extension directs a surgeon to replace hard constants with authored fields, with no default preserving shipped concepts',
 'MAJOR','alex:architect',
 'The build sheet named three shared constants (body lift NLB_BODY_SIZE/2, spin divisor NLB_WHEEL_R, NLB_LANE_GAP) and required authored fields to drive them, but stated no absent-field fallback and no regression pair. Eleven shipped concepts sit on the same scenario.',
 'Every field an extension adds to a SHARED scenario is OPTIONAL and its absence must reproduce today''s constant byte-identically. State this clause in the build sheet, and name the regression pair (one shipped concept per affected code path) whose EYE run must show zero pixel diff.',
 'js_eval',
 'After a shared-scenario extension lands, re-run THE EYE on the named regression pair and assert zero H2 pixel diff against the pre-build baselines.',
 'OPEN', ARRAY['rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 4
('frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture',
 'A 16a state whose first sub-beat renders the wrong physics carries no loop budget, so the frozen pin may archive the misconception as the state''s picture',
 'MAJOR','alex:architect',
 'The skeleton tabled loop_reset and pin margins for four of eight states and omitted the sequential contrast state, whose first half deliberately draws the wrong physics. THE EYE pins at 0.60 x loop_reset and that frame becomes the state''s representative image for eye_walker, the auditor and the founder.',
 'Any state with a sequential wrong-picture-then-right-picture beat MUST appear in the skeleton timing table with its sub-beat boundaries, and must show that 0.60 x loop_reset lands at least 167 ms after the CORRECT half begins and before the loop ends. A misconception state is the LAST state whose pin budget may be left to downstream authoring.',
 'js_eval',
 'For each state carrying a misconception_watch with a sequential contrast: read the frozen frame and assert the elements unique to the wrong-picture half are absent and the elements unique to the correct half are present.',
 'OPEN', ARRAY['rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive')
```

**Also:** the prior cycle's `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` should be **UPSERT-refined, not re-minted** — its `prevention_rule` needs the enumeration clause: *"sweep by the concept ids that actually carry the scenario (`grep -rl "<scenario>" src/data/concepts/*.json`), never by a hand-list of rows a reviewer named."* Same for `skeleton_projected_screen_separation_quoted_without_the_projection_factor` and `nlb_track_length_m_is_a_half_length_and_plus_s_is_up_slope` — both were **honoured in full this cycle**; file them as FIXED-with-evidence rather than as new incidents.

---

## Key artefacts (no frames exist at Checkpoint A — these are the five reads that decide the fix)

1. `src/lib/renderers/field_3d_renderer.ts:39661–39663` — the arrow map constants; the 5.09:1 range that makes P1-B arithmetic rather than opinion.
2. `src/lib/renderers/field_3d_renderer.ts:1484–1501` — the `checkpoints` config: the latch mechanism the design needs and the closed `capture` enum it never diffed.
3. `src/lib/renderers/field_3d_renderer.ts:45569–45591` — the per-body sandbox wrap and the bound clamp; the two behaviours that decide what S1/S5/S8 actually show after the finish.
4. `src/lib/renderers/field_3d_renderer.ts:39610` + `:39639` + `:40015` + `:40053` — the three shared constants (b)-9/(b)-10 direct the surgeon to replace, with their coupling comments.
5. `docs/loop_runs/rotmech/rolling_on_incline/skeleton.md` §3 S5 row + the timing table — where the 7.0/2.8 assertion and the freeze-and-read hold sit two lines apart.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
  Checkpoint A subset:  D1 1 · D2 2 · D8 2 · D9 2 · D10 1   = 8/10   (was 8/10 at REV 2)
  weakest: D1 information gain — S2 remains the one thin state: a full state recapping
           concept #11's entire core claim. Defensible under Rule 23 (a teacher can open
           this cold) and genuinely consumed by S3's contact-0.00 claim and S5's energy
           route, but it adds no idea this concept owns (evidence: §2 purpose column,
           "Recap: v = Rω on screen"; §8 lists pure_rolling as the prerequisite it recaps).
           D10 explore earns its place — the control set is now fully ring-gated with a
           computed envelope, which is real improvement over REV 2; but the sandbox's
           own demonstration is not achievable: mode 'sandbox' wraps PER BODY
           (field_3d_renderer.ts:42185, :45569–45577), so the four racers desynchronise
           permanently after one lap and DoD (j)(2)'s "pit a marble against a huge ring"
           has no start line from lap 2 onward.
  D2 (2): the ring cut IS the arc; both cuts re-run independently and stay coherent.
  D8 (2): exactly two beats at genuine pivots, explicitly "no per-state tic".
  D9 (2): seven of eight titles state a result in Rule-41 plain English with the meaning
          in the first words; "The race: four shapes" names a topic (P3-2).
  This section did not change the verdict; every finding above stands on its own evidence.
```

**Fix cycle 2 of 2.** `physics_author` and the 0c-2 `field3d-surgeon` dispatch remain **unauthorised** until this returns `DESIGN_OK`. There is no cycle 3 — a third failure is an ESCALATE to the founder, and the survey's 0c-2 union-row amendment (ruling 5) needs a founder signature regardless of how this concept's next revision lands.
