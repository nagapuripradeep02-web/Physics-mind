# Checkpoint A — `pure_rolling` (rotmech 0b, REV 1 / fix cycle 0)

**VERDICT: `DESIGN_FIX` → `alex:architect` (fix cycle 1 of 2)** · founder-proxy, 2026-08-02

REV 1 is a strong first submission and, on the one job it was commissioned for, it succeeds: **amendment A2 is correct, material, and it is exactly the alarm-rule catch this dispatch was funded to produce.** It was verified against #12's build sheet and the renderer, and it is if anything *understated* — see P1-B. A3 is the second real catch (founded in the renderer's own SEAM-G comment, verbatim). Every number in §3 and the S6 envelope re-derives correctly to the digit; the μ_k `min_ring` argument is right and is the best-reasoned paragraph in either skeleton; the ring cuts hold under independent re-run; Rules 35/38c/38d/41 are clean.

But the document's central structural claim — *"no two bodies are ever co-present in any frame of this concept"* — is used to discharge the lane machinery, the occlusion gate and the home-pose rule, and **it is not the claim the engine reads.** Lane derivation keys off the state's declared body list, not co-presence, and there is no per-body activation time anywhere in `newtons_laws_body`. Following that through, S4 and S5 — the two multi-phase states, one of them a Rule-16a beat — are not buildable as specified in either direction: with a hold they overrun the track, without one they start mid-track and the S4 pin photographs a **stopped** rolling wheel under the caption "Skid slows; roll does not". Four more defects follow the same seam (the zero-length contact arrow, the S5 pin budget, the checkpoint reuse, the glow ruling). No physics-correctness doubt anywhere: the physics is right, and every failure is in the **rendering of it** — the same shape as the sibling's cycle 2.

**Credit, so cycle 1 does not undo it:** A2 and A3 · the θ = 0 flat-ground reading with the arc self-collapse · the one-`length_m`-concept-wide discipline · `initial_position_m = +2.4` and the mark arithmetic on the home pose · the S6 capture derivation and its computed slider envelope · the μ_k advanced-ring argument · the term-introduction ledger and the do-not-prespoil discipline on `k` and the top arrow · the closed-enum diffs on `controls_visible` and `readouts` · the explicit statement that `--field3d` was *not* used as coverage. Do not churn any of it.

---

## Pass 1 — scar consultation (re-run live, by the eleven concept ids)

`FIELD3D` at `query_engine_bug_queue.ts:23` holds 22 ids, **zero of them nlb** — re-confirmed. Swept instead by the eleven concepts that actually carry the scenario (`grep -rl "newtons_laws_body" src/data/concepts/*.json`): `block_on_incline`, `connected_bodies`, `free_body_diagram`, `friction_force`, `newton_first_law`, `newton_second_law`, `newton_third_law`, `normal_force`, `rolling_friction`, `tension_force`, `work_done_by_constant_force`. **29 distinct OPEN rows.** The skeleton's audit is genuinely broad — it dispositions ~35 classes and most dispositions are correct — but the sweep was again keyed to *"the eight scenario-scoped rows the sibling's Checkpoint A named"*, i.e. a hand-list. That is the precise thing last cycle's prevention rule forbade.

**Recurrence check (the ratchet) — three cycle-1/cycle-2 classes recur. Automatic P1 per Pass 1.**

| Class | Status in REV 1 |
|---|---|
| `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | **Recurs, narrower.** Four OPEN rows the eleven-concept sweep returns are undispositioned: `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio`, `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach`, `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus`, `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` (+ `frozen_frame_read_as_dense_series_continuation_on_translating_body`, `concept_ships_zero_narration_glow_bindings`, `authored_state_glow_focal_silently_voids_every_tts_sentence_glow`). Two of them bite materially → **P1-B, P1-E** |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` | **Recurs, inverted.** `nlb_multibody_lane_gap…` is dispositioned *"N/A by construction — no frame in this concept ever contains two bodies."* The reader was not read: `nlbBodyLaneZ` (`:39992–40001`) counts the state's **declared** non-ghost bodies, never visibility → **P1-A(b)** |
| `closed_enum_cannot_name_a_substance_the_design_teaches` | **Applied** to `controls_visible` (`:1340`) and `readouts` (`:1336`) — both correct. **Not applied** to `checkpoints.capture` (`:1500`), the enum (c)-1 proposes to ride → **P1-D** |

**Classes checked and clean:** `nlb_checkpoint_s_m_authored_as_displacement…` (marks are true track coordinates) · `nlb_static_state_authored_on_the_track_bound…` (0.6 m inset real) · `field3d_release_widens_ground_plane_per_state…` (one `length_m`) · `nlb_angle_arc_radius_overruns…` (genuinely N/A at θ = 0 — `arc.visible = |θ| > 0.5`, `:40079`) · `nlb_motion_archetype_declared_from_a_between_state_delta…` · `contrast_ghost_coresident…` · `symbol_printed_on_canvas_before_the_lesson_defines_it` · `teach_do_not_prespoil…` · `teach_concrete_before_abstract_compare` · `hysteretic_state_cannot_be_latched_under_a_time_pin` (correctly turned into (c)-3's closed-form requirement) · `explore_controls_not_ring_gated_survive_the_ring_cut` · `real_world_anchor_declared…` · `chemistry_concept_id_collides…` · `field3d_param_ramp_authoring_contract` · `phase0_union_table_asserted_not_walked…` (the WALK is real, both directions — but see P1-A(b), one row is walked to the wrong state).

**N/A with reason, verified against the DoD:** `nlb_work_probe_globals…`, `nlb_work_bar_glow_ids…`, `nlb_displacement_vector_is_single_body…`, `nlb_coupled_sandbox_F_slider…`, `field3d_nlb_body_label_overlaps_the_pulley_mesh`, `nlb_multibody_sandbox_wrap_reanchors_only_the_wrapping_body` (S7 is single-body; S4/S5 are not sandbox — the sibling's P1-A(c) genuinely does **not** recur here).

**Routing note, unchanged from cycle 2:** `field3d_nlb_physics_clock_not_state_local` carries owner `peter_parker:renderer_primitives` → **`pcpl-surgeon`**, not `field3d-surgeon`.

---

## Verified independently — every number re-derived

**Renderer citations.** Substantively correct, **all off by one line**: `length_m` half-length is `:941` (cited `:940`); `theta_deg` "0 = flat ground, SAME code path" is `:940` (cited `:939`); the θ-arc collapse block is `:40071–40079` (cited `:40070–40078`, which is the horizontal-reference line). Verified verbatim: `NLB_LANE_GAP = 0.85` `:39610` ✓ · `NLB_WORLD_PER_M = 0.5` `:39591` ✓ · `NLB_BODY_SIZE = 0.55` `:39592` ✓ · lift `NLB_BODY_SIZE/2` `:40015` ✓ · spin `-(s*NLB_WORLD_PER_M)/NLB_WHEEL_R` `:40053` ✓ · `halfWorld = lenM*NLB_WORLD_PER_M`, `slab.scale.set(halfWorld*2,…)` `:40061–40068` ✓ · `readouts` `:1336` = `'N'|'f'|'a'|'v'|'T'|'F_net'|'F_applied'|'T1'|'T2'|'P'|'P_avg'` — no ω, no Rω, no contact ✓ · `controls_visible` `:1340` — no `R`, no `omega0` ✓ · `nlbGravAlong` `:45093–45096` ✓ · bounds `±lenM` `:45166–45174` ✓.

**Geometry.** `length_m = 3.0` ⇒ 6.0 m track, s ∈ [−3.0, +3.0] ✓. Home pose +2.4 = 0.6 m inset ≥ 2R ✓. 2πR = 1.570796 ✓; marks at **+0.8292** / **−0.7416** ✓.

**Timing, recomputed.** S1 4.8 m ⇒ ends −2.400 ✓ · S2 mark 1 at 1745.3 ms (34.9%) ✓, mark 2 at 3490.7 ms ✓, ends −2.100 ✓ · S3 first cusp πR/v = 1308.997 ms (26.2%) ✓, ends −0.600 ✓ · S4 skidder a = 1.96 m/s², stop 1020.4 ms, 1.0204 m ✓ · S5 phase C from 2800 ms ⇒ ends −0.400 ✓.

**S6 in full — every digit correct.** t_c = 2.0(0.5)/(0.05·9.8·1.5) = 1.360544 s ✓ · slide = 2.721088 − 0.453515 = **2.267574 m** ✓ · capture at s = **+0.13243** ✓ · v_roll = v₀/(1+k) = **1.333333 m/s** ✓ · post-capture 2039 ms × 1.3333 = 2.7187 m ⇒ loop end s = **−2.5863**, 0.414 m inside the bound ✓ no clamp ✓ · pin 2040 ms ⇒ s = −0.7733 ✓ · t_c/R = 40.02% ✓.
**Envelope:** the correct closed form is d = v₀²k(2+k)/(2μ_k g(1+k)²) = **0.566893·v₀²** — the numeric coefficient is right, but **the printed formula carries a stray leading `5`** (`d = 5v₀²k(2+k)/…` would give 2.83 v₀²). d_max(2.5) = 3.5431 m ⇒ capture at s = −1.1431, 1.857 m clear ✓.

**Frozen-pin convention confirmed in code** (`deriveStateMeta.ts:2937–2957`): the pin is `cycle·R + clamp(0.60R, 150, R−150)` — the **phase** is always 0.60R; later authored cues raise the *cycle*, never the phase. So "every asserted reveal must be complete by 0.60R" is the correct rule, and the skeleton's "< 55% R" is the right shape. Its error is *which* event it names (P1-C).

---

## P1 findings — block the design

### P1-A · The two multi-phase states are not buildable: no per-body activation time exists, and lane derivation displaces the phase bodies

This is one root with three consequences, and it is the highest-severity finding in the report.

**(a) There is no timed hold/release, and no timed show/hide, in `newtons_laws_body`.** Body visibility is set **once per state apply** — `o.visible = !!bd` where `listed` is the state's body map (`:44766–44771`). The only in-state timeline is `phases[]` (declared `:1583`, run at `:45290–45311`), whose entire effect is `eng.glow_focal` plus `eng.phase_action` — and **`eng.phase_action` is written and never read anywhere in the file** (grep: two writes, zero reads). There is no `scenario_cue` in the nlb block at all; the `scenario_cue` field the skeleton names as (a)-4 belongs to a *different* scenario's `phases[]` (`:919`). The only holds are `fixed` (never integrated — and it zeroes lane derivation, `:39995`) and the `spring_action` latch, both apparatus-specific.

Consequence, computed both ways for **S4**:

| Reading | What actually renders |
|---|---|
| A hold/release is built (not in either union) | Phase B runs 1500 → 4500 ms at 2.0 m/s from +2.4. It reaches −3.0 at **4200 ms** and is clamped (`:45582–45591`, `v1 = 0; a = 0`). The last **300 ms** of the state shows the rolling wheel **stopped dead** under the caption "Skid slows; roll does not". The skeleton's "B ends s = −2.4 at 3900 ms, hold to reset" assumes a halt the engine does not have. |
| No hold (the union as written) | Body B integrates from t = 0. It is at s = −0.6 when it "assembles at the home pose" at 1500 ms, and it hits the bound at **exactly 2700 ms — the frozen pin instant**. `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` fires on the nose: **STATE_4's archived frame is a motionless rolling wheel reading `v 0.00`** — the misconception, not its kill. |

Pre-positioning is not an escape: B would need `initial_position_m = +5.4`, outside the ±3.0 bound. A two-cycle scheme (phase A in cycle 0, phase B in cycle 1 under `loop_reset`) is not an escape either — the pin phase is fixed at 0.60R, so it would land in the **skidder** cycle. Same arithmetic applies to **S5** phase C (assembles at 2800 ms; un-held it is at −0.40 by then, and clamps at 5400 ms) and to phase A's slider.

**(b) Lane derivation splits the phase bodies laterally — the disposition that says otherwise is falsified by the reader.** `nlbBodyLaneZ` (`:39992–40001`) returns `(k − (lanes.length−1)/2) × NLB_LANE_GAP` over every **declared** non-ghost, non-hanging, non-`fixed` body. Visibility is never consulted. At `NLB_LANE_GAP = 0.85` wu and `NLB_WORLD_PER_M = 0.5`:

- **S4 (2 bodies):** z = ±0.425 wu = **±0.85 m** — the two wheels sit **1.7 m apart across the track**, 3.4 wheel diameters. The apparatus visibly jumps sideways at the dissolve. Rule 32d, on a 16a state.
- **S5 (3 bodies):** z = −0.85 / 0 / +0.85 wu = **−1.7 / 0 / +1.7 m**. The slab is `BoxGeometry(1, 0.18, NLB_SURFACE_DEPTH = 1.6)` (`:41417`, `:39621`) and only its **x** is scaled (`:40068`) — so the plank spans z ∈ [−1.6, +1.6] m. **The phase-A and phase-C wheels are centred 0.1 m beyond the plank edge**, and with tread half-width 0.55 m more than half of each wheel hangs over empty space. The state whose payoff is "slide + spin = roll" renders its slide and its roll off the track.

The fix is available — `lane_gap_m = 0` under the sibling's (b)-10 — but **the union walk explicitly excludes (b)-10 from this concept** ("consumed by the SIBLING only"), so as authored there is no way to keep the phase bodies on the centre line.

**(c) Ghosting is not a way out.** A ghost is never integrated (`:45430`, `:40247`), so the skidder cannot skid and the slider cannot slide as ghosts.

**Concrete correction (one decision, four statements):**
1. Add a **per-body activation time** to the build sheet — `bodies[].activate_at_ms` (seed s₀/v₀ at that instant, hidden and un-integrated before it) — and state which states consume it (#11 S4/S5; and it is **shared**: #12's S3 block/disc pair and its S6 "held at the home pose + release cue" need exactly the same surface, which #12's REV 3 also does not name).
2. **Consume (b)-10** in this concept's union walk, with `lane_gap_m = 0` (or an explicit `single_lane` semantics) authored on S4 and S5, and say so in the WALK table.
3. Re-derive S4's and S5's `loop_reset_ms` against held phase starts so **no phase ends against the track bound** (S4: with phase B starting at 1500 ms and v = 2.0, the bound is reached at 4200 ms — R must be ≤ 4200, which then puts the pin at 2520 ms, phase-B t = 1020 ms, s = +0.36 ✓).
4. Alternatively, and worth weighing: **split S5's three phases into separate states**. A state with three complete motions strains Rule 31's "ONE idea + ONE complete motion", and the split removes the three-phase config shape (A5) entirely. It costs two states on a concept already above its band — a genuine trade, not a cost-saving; make it explicitly.

**[owner: alex:architect]** · items 1 and 2 are **blocking** engine items.

### P1-B · A2 is correct and understated: the arrows have no magnitude→length map, and a zero vector cannot be drawn at all

A2's claim — that (b)-3's arrows must be computed from live (v, ω) as v ± ωR, and that building (b)-3 against #12's rolling-only states breaks #11 — **is right, and it was verified both ways.** #12's (b)-3 reads verbatim *"arrows 0/v/2v + cycloid trace + contact-speed readout"*, i.e. three literal constants; #12's only arrow state is S2, which is pure rolling, so a literal implementation passes #12 and fails #11's S5 phase A (all three arrows = v), phase B (centre 0, rim ±Rω) and S6's whole slide phase (contact ≠ 0). That is the alarm-rule catch, and it should go into the build sheet in A2's own words.

**But computing the magnitude correctly is only half the problem, and the other half is arithmetic.** The renderer's only magnitude→length map is `nlbArrowLen` (`:40602–40606`): `L = |F|·NLB_ARROW_SCALE; if (L < MIN) L = MIN; if (L > MAX) L = MAX` with `SCALE = 0.048`, `MIN = 0.55`, `MAX = 2.80` (`:39661–39663`), and a separate hide threshold `NLB_ARROW_EPS = 0.05` ("At or below this the force IS zero: the arrow HIDES. Never a stub").

Route S5's velocity arrows through it and:

| S5 phase C arrow | value | raw L | rendered |
|---|---|---|---|
| top, v + ωR | 2.0 | 0.096 | **0.55** (floored) |
| centre, v | 1.0 | 0.048 | **0.55** (floored) |
| contact, v − ωR | 0.0 | 0.000 | **hidden** (or 0.55) |

**The state whose entire payoff is the ratio 2 : 1 : 0 renders two identical arrows and one that does not exist.** Same for S3 (centre 0.6 vs contact 0). This is `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` (MAJOR/OPEN, `alex:physics_author`) — an OPEN row the eleven-concept sweep returns, undispositioned here, whose DO is quantitative: *"the SMALLER of the pair must clear the floor."*

And the zero case is a design decision no one has made: **you cannot draw a zero vector**, and the engine's own rule forbids a stub. S3's "arrows: centre = v, contact ≈ 0" and S7's "contact + centre arrows" both assert one.

**Concrete correction — and this is the pair ruling cycle-2's ruling 6 deferred to here:**
- Author a **second, independent vector map for velocities** (wu per m/s) with its own floor/ceiling, chosen so the **smallest nonzero** velocity any state draws clears the floor with the row's 1.5× margin. At v_min = 0.6 m/s (S3's centre) a scale of ~0.92 wu·s/m gives centre 0.55 wu, S5 centre 0.92, S5 top 1.84 — all inside MAX, ratio rendered honestly.
- State the **zero-contact representation explicitly**: a labelled stationary marker (dot + `0.00 m/s`), never a stub arrow, never a floored arrow. This is S3's primary aha and S5's payoff; it must be specified at design time, not discovered.
- **Consistency with #12:** #11 draws **no force arrows at all** (its `f_k 1.96 N` / `f 0.00 N` are readouts per DoD (b)) — so #11 does **not** need #12's mass/θ decision, and the two concepts do not collide on apparatus scale (`NLB_BODY_SIZE` is mass-independent by comment, `:39592`). **The right pair answer is cycle-2's option (iii), widened:** make the vector map authorable as **two channels** (`force_scale`/`force_min_len`, `velocity_scale`/`velocity_min_len`, defaults = today's constants). One engine surface resolves #12's 6.43 : 1 force triangle and #11's velocity fan together. Per the PRIME DIRECTIVE this is the engine fix, not the content workaround (re-massing #12's S6 to 12–14 kg), and it should be routed as such.

**[owner: alex:architect]** for the design-time statement · the two-channel map is a **blocking** engine item.

### P1-C · S5's pin budget names the phase start, not the last asserted reveal — and S2's bracket has no second endpoint at the pin

The timing table's discipline is right and the arithmetic is right; the **event chosen** is wrong on two rows.

**S5.** R = 5600 ⇒ pin phase = 3360 ms = **560 ms after phase C begins**. The table's "last asserted event" is *"phase C assembles at 2800 ms"* — but the pin's asserted CONTENT is *"phase C rolling with all three summed arrows + formula"*, and §3 specifies that inside phase C **three arrows reveal in sequence and the formula surface builds two lines** (`v + Rω = 2v`, then `v − Rω = 0`). Five sequential reveals cannot complete in 560 ms at any legible pace; at ~300 ms each the last one lands near 4300 ms. Because the pin phase is fixed at 0.60R (`deriveStateMeta.ts:2947–2951` — later cues raise the *cycle*, never the phase), the pin will photograph a half-built formula with one arrow glowing and two dim. **Correction:** set the last asserted event to the *completion* of phase C's reveal chain and re-solve R. At completion ≈ 4300 ms, R ≥ 7818 ms satisfies both 0.55R and 0.60R; at R = 7800 the pin is 4680 ms ⇒ phase-C t = 1880 ms ⇒ s = +0.52, and phase C's run of 5.0 s ends at s = −2.6, inside the bound ✓. Then re-check S5 against P1-A's hold.

**S2.** DoD (b) authors *"Circumference bracket `2πR = 1.57 m` **between revolution marks**"* and *"Revolution marks: ground ticks `1`, `2` at s_n = 2.4 − 1.5708·n"* — n ∈ {1, 2}. Mark 2 stamps at **3490 ms**; the pin is at **3000 ms**. At the pin only mark 1 exists, so the bracket the table says the pin photographs has **one endpoint**. Either declare a mark at n = 0 on the home pose (then the label set is 0/1/2, three marks — and see P1-D's cap), or draw the bracket from the release point to mark 1 and say so.

**Also unbudgeted:** the timing table asserts nothing about S2's or S6's *reveal* chains (S2 builds `one turn → 2πR` then `v = Rω` after the bracket; S6's readout convergence is continuous, so it is fine). S2's chain must clear 0.60R = 3000 ms.

**[owner: alex:architect]**

### P1-D · (c)-1 proposes to ride `checkpoints`, and that switches on four behaviours the design's own claims depend on being off

*"…may ride the existing checkpoint marker meshes, (a)-5"* is the one reuse claim in the document that was not diffed against its reader. Four collisions, all in code:

1. **`capture` is a closed enum** — `'K'|'U_grav'|'U_spring'|'E_total'|'v'|'s'|'W'` (`:1500`). There is no "turn count" and no "no stamp" member; a revolution mark wants a tick, not a value stamp.
2. **Stamps render into the state's ONE formula surface** (`:1487`; appended under the base at `:44373`, `:44797`). **S2 authors its own formula build on that surface** — the stamp and the authored equation collide (Rule 34b).
3. **`eng.energy_active = !!(energy_layer || work_state || checkpoint_state)`** (`:42747`). Authoring checkpoints turns the energy paths on — which makes false the skeleton's own load-bearing claim (used twice: for the S6 seized bound-stop and for `geometric_track_clamp_rendered_as_an_energy_change`) that *"no energy layer is authored anywhere in this concept."* A bound clamp then runs `nlbEnergyClampGuard` (`:45595`) and emits under `NLB_ENERGY_SCALE_WARN_PREFIX`, which THE EYE asserts zero of.
4. **`NLB_CP_MAX = 3`** (`:43547`) — and the S2 slider envelope breaks it. At the R-slider floor 0.15 m, 2πR = 0.9425 m and the 4.5 m run completes **4.77 turns ⇒ 4 marks wanted**. The R envelope was never computed against the marker cap.

Plus the mechanism mismatch (c)-1 already half-names: `checkpoints[].s_m` is a **static authored coordinate**, but S2's marks must **respace live under an R drag**.

**Concrete correction:** state that the revolution marks are their **own primitive**, not a checkpoint — own mesh, own turn-count trigger, own live respace, **no stamp into the formula surface, and no `energy_active` side effect** — and drop the "(a)-5 may ride" line. Then re-state the R-slider envelope with the mark count at both ends (R = 0.15 ⇒ 4 marks; R = 0.35 ⇒ 2 marks) and the mark positions at both ends.

**[owner: alex:architect]**

### P1-E · The glow ruling is undispositioned, and S5's single focal dims two-thirds of the relation at the pin

`state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` (MAJOR/OPEN, `alex:json_author`) — returned by the sweep, undispositioned. Its DO: *"Rule 32e caps the focal count at one; it does NOT require one… if it is a RELATION between two overlays, author no glow_focal."*

§3's legibility paragraph authors one focal in every state. In **S5 phase C** the focal is *"the currently-revealed arrow"* — but the state's claim is the **set** `2.0 / 1.0 / 0.0` and the two equations that bind them. At the pin (560 ms into phase C, P1-C) one arrow glows and the other two sit below the contrast floor, in the frame that becomes STATE_5's archive. Same shape in **S4**, where the sequential phases make the single focal legitimate but the *channel* is never named: nlb's in-state focal handover is `phases[].glow_focal` with a windowed hand-back (`nlbRunPhases`, `:45296–45310`), which is independent of `SET_GLOW`.

Also undispositioned and relevant: `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` (MAJOR/OPEN, **founder decision pending** — *not* a blocker, stated so cycle 1 does not chase it) and `nlb_body_label_is_brighten_only_so_static_text_outranks_the_state_focal` (MAJOR/OPEN) — the latter is milder here than on #12 (this concept's body labels are "mass symbols or absent") but it is a build-sheet precondition the skeleton lists only under "engine-side, noted for the surgeon" without saying which state depends on it.

**Concrete correction:** §3's single-focal line states, per state, whether the focal is a **state-level default** or a **`phases[].glow_focal` event**; **S5 phase C authors NO state-level `glow_focal`** and drives emphasis entirely from `phases[]`, ending with all three arrows at equal brightness before 0.60R.

**[owner: alex:architect]** · the body-label row is a **ride-along** engine item.

### P1-F · The sweep recurrence itself

Listed for the ratchet, not for extra work: **its entire content is P1-B and P1-E**, plus the P2 rows below. The prevention rule to carry forward, verbatim from last cycle: *sweep by the concept ids that actually carry the scenario, never by a hand-list of rows a reviewer named.*

**[owner: alex:architect]**

---

## P2 findings

**P2-1 · A1 is right but understates the requirement.** At θ = 0, `a = g sinθ/(1+k) = 0` and `f_s = k·mg sinθ/(1+k) = 0` are indeed formula-automatic. The real requirement is **branch priority**: today's Branch A applies `f = −sign(v)·μ_k·N` to *any* moving body with μ_k > 0 (`:45497–45499`), so a rolling body carrying μ_k (S6 must, for its slide phase; S4's roller must read `f 0.00 N` honestly) will be decelerated by sliding friction unless the rolling branch **supersedes** that path while the rolling condition holds. Say that, not "formula-automatic" — it is what the surgeon will get wrong.

**P2-2 · A5 is right but insufficient.** The config *shape* (three body defs in one state) is the easy half; the hard half is that the shape is inert without P1-A's activation time. Fold A5 into P1-A's item.

**P2-3 · S3's camera is asserted against a run that leaves the frame.** *"Camera closed on the contact ((b)-13 target)"* + a 3.0 m run at 0.6 m/s. (b)-13 gives a **static per-state target**; a close frame that makes a 0.5 m wheel's cusp legible spans ~3–3.5 m of track, and the run spans [−0.6, +2.4]. The target must therefore sit at the **run midpoint s ≈ +0.9**, not at the home-pose contact — otherwise the wheel rolls out of frame around 2.5 s and the cusp trace is half off-screen. State the framed track extent in metres and the target coordinate. (Same correction applies to #12's S2/S6/S7 — a pair item; cycle 2 accepted "closes on the contact point" without checking it.) Related undispositioned row: `field3d_nlb_body_screen_anchor_lands_under_the_dom_slider_panel` (MAJOR/OPEN) — a closed camera is exactly where a body screen anchor migrates under the panel.

**P2-4 · S7's wrap re-seeds v but not ω.** `nlbSandboxWrap` (`:42185`) → `:45571–45572`: on wrap `v1 = b.v0`, and nothing else. With (c)-2's independent ω integrator, ω carries **across** the wrap while v resets — so a sandbox in which the teacher set ω₀ ≠ v₀/R and watched capture will, on every lap, restart with the post-capture ω against the seed v, i.e. a spurious unexplained slip. A4 covers the trail break; it must also cover the **ω re-seed** (re-seed to the authored ω₀ so each lap replays the same lesson — the same reasoning `:45547–45557` gives for re-seeding v).

**P2-5 · S2's R-drag seize is undeclared.** A trusted drag seizes and cancels `loop_reset` (`:1553`). After an R drag, S2's wheel rolls from +2.4 to the −3.0 bound (6.0 s at 0.9 m/s) and then sits dead. S6's equivalent is declared; S2's is not. Declare it, or state that the marks/bracket hold their picture at the bound.

**P2-6 · Under the reduced preset the sandbox has nothing that varies.** *Hide advanced* leaves S7 with `v 1.20 · Rω 1.20 · contact 0.00` — two readouts permanently identical and one permanently zero, changing only in absolute magnitude as v₀ and R move. The min_ring reasoning that produced this is correct; the consequence was not followed through. **Cheap fix, entirely core-ring:** enable S2's revolution marks / a turns counter in S7 (core, defined in S2), so the reduced sandbox shows *distance per turn* responding to the R dial — the one thing the reduced lesson owns.

**P2-7 · New apparatus vs the visible-elements matcher.** `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` (DIRECTIVE/OPEN, `peter_parker:renderer_primitives`) — undispositioned. The marks, the bracket, the velocity arrows, the cycloid trace and the skid trail are all new element types; if they are not registered, THE EYE reports them blank and every downstream gate reads an empty state. Build-sheet item.

**P2-8 · D3 / narration binding.** `concept_ships_zero_narration_glow_bindings` (MAJOR/OPEN, `alex:physics_author`) — undispositioned. Add it to the routed set so physics_author authors a `glow` on every `tts_sentences[]` entry naming exactly one on-canvas element.

---

## P3 notes

- **P3-1 · Line citations are uniformly off by one** (`:939`/`:940` should be `:940`/`:941`; `:40070–40078` should be `:40071–40079`). Substantively correct; the prevention rule this concept inherited is *quote both sides with line numbers*, so the numbers should be exact.
- **P3-2 · "both ≥ 2.25 m inside the bounds" is false for mark 1**: +0.8292 is **2.171 m** from the +3.0 bound. Harmless; it is an arithmetic slip in a document whose currency is arithmetic.
- **P3-3 · The stray `5` in the S6 envelope formula** (see the verification section). The coefficient 0.567 is right; the printed expression is not.
- **P3-4 · k = 0.5 on a spoked-wheel mesh whose anchor is a bicycle wheel** (k ≈ 1). It never renders, so nothing is falsified on screen, but #12 will teach that a ring's k = 1 decides everything, and a teacher who computes #11's capture time from the pictured object will get 2041 ms, not 1361 ms. State the modelling ("the wheel is treated as a uniform disc") in the physics block. Note the timing dependence: k = 1 puts t_c at 60% of R = 3400 and would break the pin rule.
- **P3-5 · D1: S1 is the thin state.** Its content — a wheel rolls, v and ω are both live — is almost entirely contained in S2, which also rolls and also shows both readouts. Its distinct residue is the ω dual-label and the anchor sentence. Defensible as a moving hook, and the concept is already above its declared band at 7; say in one line what a student could not answer if S1 were deleted, or fold it into S2.
- **P3-6 · `frozen_frame_read_as_dense_series_continuation_on_translating_body`** (MODERATE/OPEN) undispositioned — six of seven states are translating bodies read from frozen frames.
- **P3-7 ·** The bicycle-wheel anchor is #11's primary and #12's secondary. Shared, not duplicated — fine, but worth a deliberate line so it reads as chapter coherence rather than momentum.

---

## Per-state table (design-level — no frames exist at Checkpoint A)

| state | correct | order_ok | labels_present | reads_sound_off | clearly_different | how_i_would_use | problem_or_missing | pri |
|---|---|---|---|---|---|---|---|---|
| S1 | Y | Y | Y (v, ω dual-labelled) | Y | Weak vs S2 | "Watch it move AND turn — two motions, one wheel." | D1: almost fully contained in S2 (P3-5) | P3 |
| S2 | Y | Y | Y (marks, bracket, formula) | Y | Y (marks stamp) | "One full turn puts exactly one circumference of road behind it." | Bracket has one endpoint at the pin; mark count breaks `NLB_CP_MAX` at the R floor; R-drag seize undeclared | P1 (C, D), P2 |
| S3 | Y | Y | Y (contact readout) | Y | Y (cusp) | "Put your finger on the bottom of the wheel — it is not moving." | Contact arrow is a zero vector with no specified rendering; close camera vs a 3 m run | P1-B, P2-3 |
| S4 | Y (physics) | Y | Y (f_k, f, trail) | Y | Y (two pictures) | "The skid mark is the proof: a rolling tyre leaves none." | Phase B un-holdable; lanes split the wheels 1.7 m; the pin photographs a stopped roller | **P1-A** |
| S5 | Y | Y | Y (three arrows, formula) | Y | Y (superposition) | "Slide plus spin — add the two and the bottom cancels to zero." | Outer lane wheels render off the plank; three arrows floor to one length; pin lands 560 ms into a five-reveal chain; focal dims two-thirds of the relation | **P1-A, P1-B, P1-C, P1-E** |
| S6 | Y | Y | Y (v, Rω, contact converging) | Y | Y (capture) | "Watch the two numbers meet — that instant is when it starts rolling." | Rolling branch must supersede sliding friction after capture (A1 understated) | P2-1 |
| S7 | Y | Y | Y | Y | Y (teacher-driven) | "Give it spin, take spin away, watch it settle into rolling." | ω not re-seeded on the wrap; reduced preset has no varying readout | P2-4, P2-6 |

---

## Rulings on the questions asked

1. **A2 — verified, correct, and the catch this dispatch was funded for.** #12's (b)-3 is written as three literal constants and #12 has only one arrow state, which is pure rolling; a faithful implementation of #12's sheet renders #11's S5 phase A/B and all of S6 falsely. **Understated in one respect:** computing v ± ωR correctly still fails, because the only magnitude→length map in the file floors everything below 11.5 N/units to `MIN_LEN` and hides a true zero. A2 must carry the **two-channel vector map + the zero-vector representation** (P1-B).
2. **A1 — correct in direction, understated.** θ = 0 is formula-automatic; branch *priority* over the sliding-friction path is not (P2-1).
3. **A3 — correct, well-founded, and genuinely serves the sibling.** The renderer's own SEAM-G comment is the authority: *"A smooth cylinder rolling along a flat surface looks PERFECTLY STATIC: its silhouette is rotation-invariant, so without a marked hub and spokes the whole point of the shape … is invisible on screen and in every frozen EYE frame"* (`:39629–39633`). #12's S4 payoff is a sphere visibly spinning 3× faster, and F8's four meshes carry no rotation marker. A3 should go into #12's F8 verbatim.
4. **A4 — correct, incomplete.** Add the ω re-seed (P2-4).
5. **A5 — correct, insufficient.** The shape is inert without a per-body activation time (P1-A).
6. **The μ_k `min_ring` argument — tested and it holds.** Under *hide advanced*, ω₀ defaults to v₀/R so the sandbox is always rolling; on level ground a rolling body has a = 0 and f = 0 for **every** μ_k, so the dial genuinely changes nothing. Under the full preset μ_k drives capture time and its lesson (S6) is advanced. And the cue that explains capture — the converging v / Rω / contact readouts — is **core** furniture, so no ring-suppressed-cue defect is reachable. This is the right answer and the best-reasoned paragraph in either skeleton. Keep it verbatim.
7. **Ring cuts — re-run independently, both coherent.** *Hide advanced* (S1–S5 + S7): no surviving state or control references slipping, capture, ω₀ or μ_k-as-a-dial ✓. *Hide advanced + extended* (S1–S4 + S7): the ledger's "top-point arrows, 2v must not render in S1–S4 or S7" closes the only leak ✓. 38a ordering, 38b explore-core-only (with min_ring gating), 38c algebra-only, 38d dual-label-once, 38f bicycle wheel, 38g tags-as-claims — all clean. 38e declared N/A.
8. **Rule 41 — clean.** All seven titles and all seven delta cues are basic literal English, ≤ 5 words on the cues, meaning in the first words. "circumference", "kinetic friction", "contact point" are the words the formula uses (41b). No idiom, no personification.
9. **Physics correctness — no doubt anywhere.** v = Rω, the cusp, the point-speed field, t_c = v₀k/(μ_k g(1+k)), v_roll = v₀/(1+k) are all correct, and the numbers reproduce. Hence `DESIGN_FIX`, not `ESCALATE`.
10. **End-of-run behaviour (the sibling's P1-A, applied here).** S1 (−2.400), S2 (−2.100), S3 (−0.600), S5 phase C (−0.400) and S6 (−2.586) all finish inside the bound with no clamp ✓ — the skeleton's inset discipline works. **S4 is the exception and it fails in both readings** (P1-A(a)). S7's single-body sandbox wrap is genuinely safe from the multi-body desync that bit #12 ✓, but needs the ω re-seed.

---

## What the 0c-2 union now totals across both concepts

| Source | Items |
|---|---|
| #12 REV 3 build sheet `(b)1–15` | 15 |
| #12 Checkpoint A cycle-2 additions (finish-line semantics + `checkpoints.capture`/`NLB_CP_MAX`; synchronised sandbox wrap; arrow map; `nlb_body_label` out of brighten-only; back-compat clause + regression pair) | 5 |
| #11 `(c)1–4` (revolution marks + bracket; `omega0_rad_s` + token; slip→roll capture; bare-ω readout) | 4 |
| #11 amendment flags A1–A5 (three of them understated but all real) | 5 |
| **This review** — per-body `activate_at_ms`; `lane_gap_m = 0` / single-lane semantics for sequential states (a WALK correction that makes #11 a consumer of (b)-10); the **two-channel** vector map incl. a velocity scale and a defined zero-vector marker (widens cycle-2 item 3); revolution marks as their **own** primitive rather than `checkpoints` (rewrites (c)-1's cost); ω re-seed on the sandbox wrap; visible-elements matcher registration for all new apparatus | 6 |
| **Total named build items** | **≈ 33, over ~28 distinct capabilities** |

The survey's 0c-2 row reads: *"Rolling constraint v_CoM = Rω; contact-point velocity picture (0/v/2v) + cycloid trace; static-vs-kinetic friction called out at the contact"* (#11) and *"per-body shape factor; the acceleration branch; N bodies racing one incline"* (#12), plus the advanced-sweep addition *"rolling-vs-slipping regime switch."* **Five bullets.**

**Is the amendment complete? No.** It is closer than last cycle — #11's skeleton did exactly what it was written to do, and the union is now measured over both concepts rather than one — but three of this review's six additions are *classes* the founder should see plainly:

- **Two are still physics/display extensions** inside the nlb family (the vector map, the marker primitive) — ordinary, sign them.
- **One is not.** `activate_at_ms` + timed body visibility + a three-phase config shape is the beginning of a **choreography layer**, not a rotational physics extension. It is what both concepts' sequential 16a beats require, and it is the item most likely to grow. Recommendation, in the founder's own terms: **either** sign it explicitly as 0c-2 scope (it is genuinely needed — #12's S3 and S6 need it as much as #11's S4 and S5, and neither skeleton had named it), **or** rule that sequential contrast beats are authored as **separate states** rather than phases within one state, which deletes the item, deletes A5, and deletes most of the lane work. That is a pedagogy call about what "one idea, one complete motion" means for a 16a beat, and it belongs to the founder, not to this gate.
- **Still true and worth repeating:** no new `scenario_type` is forced, and nothing here leaves the `newtons_laws_body` apparatus family. The alarm rule is firing loudly and **correctly, at Phase 0** — which is where it is supposed to fire. Do not stop the chapter; do sign the amendment before the surgeon is dispatched.

---

## Additions the 0c-2 build sheet must carry (on top of REV 3's (b)1–15, cycle-2's five, and #11's (c)1–4)

1. **Per-body `activate_at_ms`** — hidden and un-integrated before it, seeded at s₀/v₀ on that instant. Consumers: #11 S4/S5, #12 S3/S6. *(P1-A)*
2. **`lane_gap_m = 0` / explicit single-lane semantics**, and #11 declared a consumer of (b)-10 in its WALK. *(P1-A(b))*
3. **Two-channel authorable vector map** — `force_scale`/`force_min_len` **and** `velocity_scale`/`velocity_min_len`, defaults = today's constants — plus a specified **zero-vector marker** (dot + value, never a stub, never a floored arrow). *(P1-B; supersedes cycle-2 item 3)*
4. **Revolution marks + circumference bracket as their own primitive** — turn-count trigger, live respace under an R drag, **no** `checkpoints` reuse, **no** formula-surface stamp, **no** `energy_active` side effect, no `NLB_CP_MAX` cap. *(P1-D)*
5. **ω re-seeded to the authored ω₀ on the sandbox wrap**, alongside A4's trail break. *(P2-4)*
6. **Every new element type registered with the generic visible-elements matcher.** *(P2-7)*

---

## `engine_queue` — `FIX(engine)` items this design implies

*(E1/E2/E6/E7/E8 from the cycle-2 report stand unchanged and are shared; listed here only where #11 changes their scope.)*

| # | Item | Owner | Tag | Evidence the engine agent needs |
|---|---|---|---|---|
| E1 | State-local physics clock / `RESET_TRAJECTORY` rebase | **`peter_parker:renderer_primitives`** (row's own tag → `pcpl-surgeon`) | **blocking** | `field3d_nlb_physics_clock_not_state_local` CRITICAL/OPEN. Precondition of #11's entire §3 timing table, exactly as for #12. |
| E9 | Per-body `activate_at_ms` (timed hold → seed → integrate) + timed body visibility | `peter_parker:field3d_surgeon` | **blocking** | Visibility set once per apply `:44766–44771`; `phases[]` declared `:1583`, run `:45290–45311` — `eng.phase_action` is written (`:45304`) and **never read**; no `scenario_cue` in the nlb block. Expectation: in #11 S4, body B sits at s = +2.4 with v = 0 until 1500 ms, then integrates at 2.0 m/s. |
| E10 | `lane_gap_m` authorable **including 0** / single-lane semantics for sequentially-shown bodies | `peter_parker:field3d_surgeon` | **blocking** | `nlbBodyLaneZ` `:39992–40001` (counts declared bodies, ignores visibility); `NLB_LANE_GAP = 0.85` `:39610`; slab z-depth `BoxGeometry(1,·,1.6)` `:41417` with only x scaled `:40068`. Expectation: #11 S5's three phase bodies all render at z = 0, on the plank. |
| E11 | Two-channel authorable vector map (`force_*` + `velocity_*`, defaults = today) + zero-vector marker | `peter_parker:field3d_surgeon` | **blocking** | `nlbArrowLen` `:40602–40606`; constants `:39661–39663`; hide threshold `NLB_ARROW_EPS = 0.05` `:39664`. Expectation: #11 S5 renders top : centre = 2 : 1 in pixels and the contact marker is a labelled dot; #12 S6's N : f_s = 6.43 : 1 renders honestly. Supersedes cycle-2 E5. |
| E12 | Revolution-mark primitive independent of `checkpoints` | `peter_parker:field3d_surgeon` | **blocking** | `checkpoints` `:1494–1502` (closed `capture` `:1500`); stamp→formula-surface `:1487`, `:44373`, `:44797`; `energy_active` `:42747`; `NLB_CP_MAX = 3` `:43547`. Expectation: #11 S2 stamps 2–4 ticks with `energy_active` still false. |
| E13 | ω re-seed on the sandbox wrap; trail/trace break at wrap and loop reset | `peter_parker:field3d_surgeon` | ride-along | `nlbSandboxWrap()` `:42185`; wrap `:45568–45573` (re-seeds `v1 = b.v0` only). Expectation: every S7 lap replays identically from the authored (v₀, ω₀). |
| E14 | Register new nlb apparatus with the generic visible-elements matcher | `peter_parker:renderer_primitives` | ride-along | `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` DIRECTIVE/OPEN. |

founder-proxy routes; it does not dispatch. All items remain 0c-2 scope; none forces a new `scenario_type`.

---

## Candidate scar rows (report-only — dispatching session files; no `bug_class` collision against the live directive set)

```sql
-- 1
('skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time',
 'A state authored as sequential phases assumes bodies appear at the home pose on cue, but every declared body integrates from state entry',
 'MAJOR','alex:architect',
 'newtons_laws_body sets body visibility ONCE per state apply and its phases[] block drives only glow_focal (eng.phase_action is written and never read). A body declared for a later phase therefore integrates from t = 0 and is mid-track when the phase is narrated to begin; pre-positioning it is impossible because the seed would sit outside the track bound.',
 'Before authoring any state as sequential phases, read the renderer''s body-visibility path and its in-state timeline block and confirm a per-body activation/hold surface EXISTS. If it does not, either name it as a build item with its config shape, or author each phase as its own STATE. Never assume a dissolve/assemble cue implies the second body was held.',
 'js_eval',
 'For every state declaring more than one non-ghost body: drive the state to each phase boundary and assert each body''s position equals its authored initial_position_m until its own phase begins.',
 'OPEN', ARRAY['pure_rolling','rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 2
('nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones_so_sequential_phases_split_laterally',
 'A skeleton discharges the lane machinery on a "never two bodies in one frame" argument, but lane z is derived from the state''s declared body list',
 'MAJOR','alex:architect',
 'nlbBodyLaneZ counts every declared non-ghost, non-hanging, non-fixed body and returns (k - (n-1)/2) * NLB_LANE_GAP, never consulting visibility. A two-phase state therefore renders its two bodies 1.7 m apart across the track and a three-phase state puts its outer bodies beyond the slab edge, breaking home-pose continuity in exactly the sequential-contrast beats the argument was meant to protect.',
 'Sequential visibility is NOT co-location. Any state declaring two or more integrated bodies must either author an explicit lane geometry (gap 0 for sequential phases) or state, with the lane function''s line numbers, why the derived offset is acceptable. Check the offset against the surface depth constant, not only against the track length.',
 'js_eval',
 'For every state declaring two or more non-ghost bodies while showing one at a time: assert every declared body''s world z is identical, and assert |z| + half the body depth is within the surface slab half-depth.',
 'OPEN', ARRAY['pure_rolling','rolling_on_incline']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 3
('velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero',
 'A point-speed picture authored as 0/v/2v arrows inherits the force-arrow scale, floor and hide threshold, so the ratio flattens and the zero arrow vanishes',
 'MAJOR','alex:architect',
 'The renderer owns one magnitude-to-length map (scale 0.048 wu per newton, floor 0.55, ceiling 2.80, hide below 0.05). Fed metres per second it floors every ordinary classroom speed to the same length, and a genuinely zero contact speed either hides or renders at the floor - destroying the exact ratio a rolling point-speed state exists to teach.',
 'A new physical quantity drawn as an arrow needs its OWN magnitude-to-length map, chosen so the smallest nonzero value any state draws clears the floor with margin, and an explicit rendering decision for the exact-zero case (a labelled marker, never a stub and never a floored arrow). State both at design time with the constants quoted by line number.',
 'js_eval',
 'For each state drawing two or more velocity arrows: read the rendered world lengths and assert the length ratio matches the speed ratio within 10 percent, and assert any arrow whose authored magnitude is exactly zero renders as a marker, not as a minimum-length arrow.',
 'OPEN', ARRAY['pure_rolling']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 4
('skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it',
 'A timing table clears its 55 percent rule against the instant a phase begins, while the content the pin is claimed to photograph reveals well after it',
 'MAJOR','alex:architect',
 'The frozen pin phase is fixed at 0.60 of the loop period; later authored cues raise the cycle, never the phase. A table that names a phase START as its last asserted event therefore leaves every reveal inside that phase - sequenced arrows, a multi-line formula build - unbudgeted, and the archived frame shows a half-built picture.',
 'The last asserted event is the COMPLETION of the last reveal the DoD claims the pin photographs, not the start of the phase containing it. Enumerate the reveal chain, budget each element, and show that the whole chain completes before 0.60 times the loop period.',
 'js_eval',
 'For each state whose DoD asserts pin content: drive to 0.60 times loop_reset_ms and assert every element named in that assertion is present at full opacity.',
 'OPEN', ARRAY['pure_rolling']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive'),

-- 5
('architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on',
 'A design proposes to ride an existing marker block for a new purpose, without checking the closed enum, the render target, the capacity cap or the flags its presence turns on',
 'MAJOR','alex:architect',
 'The checkpoint block was proposed as the substrate for revolution marks. Its capture list is a closed energy enum, its stamps render into the state''s ONE formula surface (which the same state already authors), its mere presence sets energy_active and arms the clamp guard whose warning prefix the visual gate asserts zero of, and it is capped at three flags while the state''s own radius slider produces four marks at its floor.',
 'A reuse claim is a four-part diff, not a sentence: the closed enum members the new purpose needs, the render target the stamp writes to, the capacity constant, and every engine flag the block''s PRESENCE switches on. Quote each with a line number, and re-check the capacity against the state''s full slider envelope, not its authored point.',
 'js_eval',
 'For any state authoring a reused marker block: assert the engine flags that block gates (energy_active and its dependents) match the design''s stated claims, and assert the marker count required at every slider extreme is within the built capacity.',
 'OPEN', ARRAY['pure_rolling']::text[], ARRAY[]::text[], 'founder_proxy Checkpoint A rotmech 2026-08-02', 'directive')
```

**UPSERT, do not re-mint:** `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` — add `concept_id` `pure_rolling` and keep the enumeration clause from last cycle; it recurred verbatim. `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` — add the inverted form (*a disposition that declares a row N/A must quote the reader that decides it, not the design's own intent*). `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` — widen `concepts_affected` to include both rolling concepts.

---

## Key artefacts (no frames exist at Checkpoint A — these are the five reads that decide the fix)

1. `src/lib/renderers/field_3d_renderer.ts:39992–40001` + `:41417` + `:39610` + `:39621` — lane derivation over *declared* bodies, and the 1.6 wu slab that S5's outer phase wheels fall off. The arithmetic that makes P1-A(b) fact, not opinion.
2. `src/lib/renderers/field_3d_renderer.ts:44766–44771` + `:45290–45311` + `:1583` — visibility set once per state apply, and the `phases[]` block whose only live effect is `glow_focal`. The absence P1-A(a) turns on.
3. `src/lib/renderers/field_3d_renderer.ts:40602–40606` + `:39661–39664` — the single clamped magnitude map and the hide threshold; where S5's 2 : 1 : 0 becomes 1 : 1 : nothing.
4. `src/lib/renderers/field_3d_renderer.ts:1494–1502` + `:42747` + `:43547` + `:44797` — the four behaviours `checkpoints` switches on that (c)-1 never diffed.
5. `docs/loop_runs/rotmech/pure_rolling/skeleton.md` §3 S4/S5 rows + the timing table — where "no two bodies are ever co-present" and "assembles at the home pose" sit four lines apart from the pin margins that depend on both.

---

```
RUBRIC (advisory, unratified — docs/EXEMPLAR_RUBRIC.md; did not affect the verdict)
  Checkpoint A subset:  D1 1 · D2 2 · D8 2 · D9 2 · D10 1   = 8/10
  weakest: D1 information gain — S1 is almost fully contained in S2. Both are the same
           wheel rolling the same track with v and ω live; S2 adds the marks, the bracket
           and the relation, and could carry S1's ω dual-label and its 8-word anchor
           without strain (evidence: §2 purpose column "both v and ω are live from the
           first second" vs §3 S2 "readouts v 0.90 and Rω 0.90 sit equal"; §2's own
           calibration note concedes the concept is a 5–6 band landing at 7).
           D10 explore earns its place — the min_ring table and the μ_k ring argument are
           the best reasoning in either skeleton, and the argument survives testing. But
           under the reduced preset the sandbox shows two permanently identical readouts
           and one permanently zero one, and nothing but magnitude changes (evidence: §3
           S7 readout list "v, Rω, contact"; the *hide advanced* row of §3's min_ring
           table leaves only v₀ and R, and a level-ground rolling body has a = 0, f = 0
           for every μ_k — the same fact the μ_k argument correctly relies on).
  D2 (2): the ring cut IS the arc; both cuts re-run independently and stay coherent, and
          the term ledger closes the only leak (top arrows / 2v absent from S1–S4 and S7).
  D8 (2): exactly two beats, at S3 and S4, both at genuine pivots, both naming their
          primitives; explicitly "no other state carries a misconception_watch".
  D9 (2): all seven titles and all seven delta cues are basic literal English with the
          meaning in the first words; the rail truncates safely on every one.
  This section did not change the verdict; every finding above stands on its own evidence.
```

**Fix cycle 1 of 2.** `physics_author` and the 0c-2 `field3d-surgeon` dispatch remain **unauthorised** until this returns `DESIGN_OK`. The survey's 0c-2 union-row amendment now needs a founder signature covering ~33 named items — and one founder decision that is not founder-proxy's to take: **whether sequential contrast beats are phases within a state (buy `activate_at_ms`) or separate states (delete it)**. That decision changes both skeletons and should be made before either goes to cycle 2.
