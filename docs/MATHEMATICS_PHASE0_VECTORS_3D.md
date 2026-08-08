# Phase 0 — the 3D-geometry wave (`vector_products_in_space` · `lines_and_planes_in_space` · `solids_of_revolution`)

**Status: 0a COMPLETE · 0b COMPLETE — three skeletons designed, Checkpoint A `DESIGN_OK` ×3 at
cycle 1, inside the founder's 2-cycle budget (2026-08-08, `master` @ `dfca9cf`) ·
0c NOT DISPATCHED (cleared to dispatch) · 0d BLOCKED on 0c + four named conditions (A19).**

> ## ⭐ A19 · THE CONCLUSION OF PHASE 0 — **the camera cannot be hand-solved, and that is the finding**
> All three concepts reached `DESIGN_OK` at cycle 1. Every reviewer re-derived the architect's numbers
> independently rather than accept them; #7 and #8 reproduced exactly, and **#9's did not — for the
> third time in this wave, in the third different way.**
>
> | Round | The camera numbers were falsified by |
> |---|---|
> | the stopped round | verification on **ONE pair** instead of all pairs (A1) |
> | 0b round 0 | solving at **FOV 50** when the renderer is 60 (A10) |
> | 0b cycle 1 | **sweep resolution** — a 1° θ sweep finds a 0.07° collapse where a coarse one reported 11.04° |
>
> Three rounds, three independent methodological failures, by three careful agents who had each read
> the scar warning them. **#9's cycle-1 explore pose puts `M2` and the common perpendicular on ONE
> SCREEN LINE at θ = 102° — a pair that is perpendicular in 3D, not an exempt by-design parallel — and
> a teacher dragging θ lands on it.** The reviewer also found the *search itself* systematically
> sub-optimal: S3 is authored at 23.58° claiming "the length floor is BINDING" when **S2's own pose
> meets the same floor at 59.41°**, forfeiting a free Rule-32d home-pose win.
>
> > ### ⛔ A19 AMENDED BY VG-A (2026-08-08) — **THE RULER WAS BENT, AND EVERYONE SHARED IT**
> > **The remedy below is RIGHT and now more strongly justified. Its RATIONALE is overstated, and the
> > correction is the sixth and worst instance of this wave's defect class.**
> > `vpProjectPoint` returned **normalised device coordinates** — `x: camX/(camZ·tanHalfFov·aspect)`
> > with `y` undivided (verified directly in the source at `3eac36a`). NDC's two axes carry **different
> > physical scales**, so every angle computed from them is **sheared by the aspect ratio — 1.78× at
> > 16:9.** `vpPairwiseScreenSeparationDeg` was therefore measuring NDC angles, not screen angles.
> > **On a corrected, isotropic metric, four independently hand-derived skeleton numbers reproduce
> > EXACTLY:** min pairwise over 529 737 poses **18.914°** (claimed 18.91) · max projected arm
> > **0.4364** (claimed 0.436, and the shipped metric said 0.755 — *off frame, a defect that was not
> > there*) · min arm **0.0412** (claimed 0.0412) · entry pose **az 0.00 / el 30.00 / R 12.99**
> > (claimed exactly that) · worst in-plane angle error at az90/el70 **3.56°** (claimed 3.56°).
> > **Act I's hand-solve was right to four significant figures. The hands were fine; the instrument
> > was bent, and every agent in the wave shared it.**
> >
> > **WHICH FALSIFICATIONS SURVIVE — because not all three were the same kind of error:**
> > | Round | Failure | Metric-dependent? | Verdict |
> > |---|---|---|---|
> > | stopped round | scored **ONE pair** instead of all pairs | no — a *coverage* failure | **STANDS** |
> > | 0b round 0 | solved at **FOV 50**, renderer is 60 | no — a *parameter* error | **STANDS** |
> > | 0b cycle 1 | **sweep resolution** (0.07° vs 11.04°) | **YES** | ⚠ **IN DOUBT — re-measure** |
> >
> > **THE DEEPEST POINT, and it is why this correction matters more than the numbers.** Had VG-A
> > shipped the gate as inherited, **gate §13 would have enforced the broken metric** — rejecting good
> > poses, passing bad ones — while carrying an 8-negative-control pedigree that made it look
> > trustworthy. A gate built to catch projection defects, computing projection wrong. That is the
> > recorded scar's own prevention rule turned on the instrument: *when a measurement is introduced to
> > prevent a defect, check that the thing it measures is the thing that failed* — **including when the
> > measurement is your own gate.**
> >
> > **CONSEQUENCE FOR VG-C, and it is a scope question, not a nicety.** #9's **Δ10 `scene_group`
> > selector** was bought on a measured claim that **no single-scene camera exists** (architect 1.35°,
> > reviewer 8.08° — *a disagreement that now itself looks like a metric discrepancy*). **Both figures
> > were computed on the bent ruler.** **Re-measure S9 on the corrected isotropic metric BEFORE VG-C is
> > dispatched.** If a single-scene pose is in fact feasible, Δ10 is scope bought for nothing; if it is
> > not, the selector stands on a number that can be defended. Either way the de-certification of #9's
> > pose table (A19 condition 1) is **unchanged** — those poses were measured on the bent ruler and
> > none of them may enter a dispatch prompt as fact.
> >
> > **The surgeon's two proposed scar rows are both correct and should be filed:**
> > `field3d_screen_separation_metric_measured_ndc_angles_so_aspect_ratio_sheared_every_camera_solve`
> > [MAJOR] — *a metric introduced to police what a VIEWER sees must be computed in the space the
> > viewer sees* — and
> > `phase0_camera_solve_disagreement_attributed_to_the_hand_when_the_instrument_was_wrong` [MODERATE]
> > — ***before ruling a class of design output un-derivable, verify the instrument that falsified
> > it.*** The second is this document's own error, and it is the more valuable of the two.
>
> > ### THE RULING, and it supersedes any further hand-solving
> > **This is not fixable by another architect cycle. It is fixable by a gate.**
> > A camera pose is no longer a design output that a reviewer certifies — it is a **claim the gate
> > verifies**, at 1° slider resolution, pairwise, in perspective, at FOV 60, over every live slider,
> > with the exempt-pair list and the screen-length floor. Hand-solving proposes; `check:vector-geometry-3d`
> > §13 decides. Every falsified round above would have been caught mechanically, at $0, in seconds.
>
> **CONDITIONS ON #9's `DESIGN_OK` — none blocks 0c; all four block 0d:**
> 1. **Every `camera_position` in #9 is DE-CERTIFIED.** They must NOT enter the VG-C dispatch prompt as
>    measured facts. **Δ1–Δ10 fold in; §5's pose table does not.**
> 2. **Gate §13 verifies every authored pose of every concept** under the A14 worst-case law at **1°
>    resolution**, with a **negative control asserting that `R13 / az −58 / el 64` at θ = 102° FAILS.**
>    This mechanises the one thing three rounds could not get right by hand.
> 3. **S9-B and S3 re-solve before authoring** (working replacements measured: S9-B `R11 / az 9 / el 2`
>    → 55.01°; S3 → S2's pose at 59.41°).
> 4. **#9's §12, §4 M3 and Block-1 are re-swept for stale round-0 text** — carried to
>    `mathematics_author` as authored constraints.
>
> **Δ10 SURVIVED independent re-derivation and VG-C may be dispatched on it.** The reviewer's own probe
> returns a best-anywhere single-scene pose of **8.08°** where the architect measured 1.35° — the two
> disagree on the number and agree on the conclusion: **no single-scene sandbox is legible, so the
> `scene_group` selector is forced, not bought for nothing.**
>
> **Carry-forward constraints from the other two (non-blocking, for the dispatch prompts):**
> - **#8 — dense-frame EYE reading is now LOAD-BEARING, not advisory.** Four post-ramp pins (A18b) buy
>   easing-invariant baselines at a price: **a defect in a ramp itself — wrong easing, mis-placed hold,
>   a jump instead of a sweep — is invisible to every frozen baseline.** Existing scar:
>   `eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31`. Promote it from a disposition
>   line to an explicit instruction in the handoff.
> - **#8 — gate §5 would fail the CORRECT build.** SR-D3 says the total is computed "inside the loop
>   that places the cylinders"; at `n = 20 000` that loop runs 120 times. Resolve with one
>   `srDiscSum(profile, domain, n, rule)` called once per frame publishing to `SR_PUB`, the placement
>   loop reading its per-disc radii for the ≤120 it draws — D11's property preserved, its wording not.
> - **#8 — gate §11 asserts the ≥0.95 floor, NOT the 0.960 solve constraint.** Two aspect metrics
>   disagree by ~0.004; asserting the tighter number ships a gate that fails on metric choice.
> - **#7 — the S8 worst case sits on a FLAT PLATEAU.** The argmax *locations* differ between architect
>   and reviewer while the *values* are identical, so `mathematics_author` must not treat the named
>   corner as a unique worst case.
> - **#7 — `core_only` survives at 5 states but loses M3 and the whole quantitative half.** Coherent by
>   measurement, but thin. Flagged for a Checkpoint-B look at whether that preset is a lesson or a
>   fragment.
> - **#7 — D-8 (arrow length floor) and D-5 (parallelepiped split-vs-fallback)** remain open engine
>   reports routed to `field3d_surgeon`; S8's min arm **0.0412** is the number D-8 is checked against.
>
> **Rubric movement (advisory, unratified): #7 9 → 10/10 · #9 9 → 10/10 · #8 6 → 8/10.**
>
> ### ⚠ A20 · THE WORST-CASE LAW WAS ALREADY WRITTEN DOWN — ONE DAY EARLIER — AND WAS INVISIBLE
> Found while preparing this session's commit, not by any of the six agents.
> `src/scripts/_seed_engine_bug_queue_explore_state_multi_slider_blind_spot.ts` — **untracked, and
> NEVER RUN** — was authored on 2026-08-07/08 by the previous session and carries two rows whose
> prevention rule is A14 in a different geometry:
>
> > *"When a label's `position_expr` references more than one live variable, sweep the **FULL CARTESIAN
> > PRODUCT** of those variables' endpoints… **A constant offset is only validated over the region
> > actually swept; every additional live control multiplies the region.**"*
>
> That is precisely #7's explore-camera defect (a solve reported as covering "the full slider product"
> that held two of four axes fixed) stated a day before we re-derived it from five painful instances.
> Its second row is worse and more useful: **THE EYE cannot see this family at all, on any concept,
> because its capture only sweeps variables named in `variable_choreography`** — which is also why the
> deterministic gates could never have caught instance 4.
>
> **The process failure, and it is the durable finding: a scar row that is AUTHORED but never SEEDED
> is invisible to the very consultation designed to surface it.** §queue made the live
> `engine_bug_queue` query mandatory and this session ran it — correctly, and against 886 rows — and
> still could not see these two, because they exist only as an unrun script in a dirty working tree.
> The static mirror is not a substitute for the live queue (§traps Trap 2); **and the live queue is not
> a substitute for the rows nobody ran.**
>
> **NOT RUN BY THIS SESSION** — the rows are the prior session's authored content, they write to
> `engine_bug_queue` (a non-cache table), and seeding another session's unverified rows is a founder
> call, not a drive-by. **Recommended: run it, then re-run the §queue consultation before VG-A is
> dispatched** — both rows bear directly on this wave's gate design. → open decision 11.

> ## ⚠ AMENDMENT 1 — 2026-08-08, from 0b. **The contract below is amended by this box; where they conflict, this box wins.**
> Three architect skeletons were designed against the 0a contract
> (`docs/skeletons/{vector_products_in_space,lines_and_planes_in_space,solids_of_revolution}_skeleton.md`).
> **They found one falsified solution, one missing union row, one unbuildable engine decision, one
> incomplete collision check, a third instance of the survey's central trap, and a curriculum row that
> is probably wrong.** Every one was caught at DESIGN time, before a line of renderer code. This is
> the argument for ever running a 0b, and it is the same result the `cartesian_plane` 0b produced
> (ten deltas its own sketch missed).
>
> **A1 · FALSIFIED — §camera's explore rule.** `az = (θ + 90°) mod 360°` was carried from the handoff
> as *"verified numerically, measured minimum screen separation 90.0°"*. It was verified on **ONE
> pair** (`b` vs `a×b`). Scored over all three pairs it returns **0.00° at θ=90°, tilt=0** — `a` and
> `a×b` collapse to one screen line, in the state whose claim is that they are perpendicular.
> **This is the THIRD occurrence of the scar `camera_metric_scored_foreshortening_not_pairwise_screen_separation`,
> committed inside the document written to prevent it.** Act I further proved **no continuous
> azimuth-only rule can exist** (continuity forces a sign change). **Replacement:** camera at
> `R · normalize(â + b̂ + ĉ)`, measured over **8 181 poses** across the full slider product →
> **min pairwise 18.9°**, min arm 12.9e-3, worst cases honest. Gate §13's `90.0°` assertion is
> **wrong and must not be built** — see A6.
>
> **A2 · THE INVARIANT GAINS A FOURTH CLAUSE — projection does not preserve SHAPE.** Act III found it
> independently: S3's lesson is *"every slice is a circle"* and a three-quarter camera draws an
> **ellipse**. With Act I's collinearity and Act II's skew, that is **three instances of one class in
> one wave**. The invariant is no longer "angles and intersections"; it is *projection preserves
> **nothing** — every geometric claim carries a 3D-computed number.* Act III's remedy: camera 15°
> off-axis (aspect `cos 15° = 0.9659`, the solid keeps depth) and the claim carried by
> `face area = 3.1416`, gated in **perspective**.
>
> **A3 · MISSING UNION ROW — animation.** Act II's scriptability walk found **8 of its 9 states
> animate a knob with no cue triple anywhere in the contract.** The 0a F-set (F1–F14, F19) inherited
> the engine desk's one-shot `reveal_ms` grow-in and **never asked how a guided state sweeps θ from
> 30° to 90°.** **ADDED: F21 `animate[]` (per-state parameter ramps), F22 free point, F23 comparison
> segment / projection** — #9's PRIMARY AHA needs a point `q`, and the contract carries only `lines[]`
> and `planes[]`.
>
> > ### ⛔ A3 CORRECTED at Checkpoint A cycle 0 — **the REQUEST is right, the REASON was FALSE, and the difference decides a dispatch's scope.**
> > A3 originally read *"the most serious 0a miss… without an `animate[]` block every guided state is
> > byte-static and Rule 31's no-static floor fails by construction… a new F-row, not a refinement."*
> > **That justification is wrong, and I verified the refutation myself rather than accept it:**
> > `field_3d` motion lives in the scenario body on the state clock, and **two authored mechanisms
> > already ship** — **`param_ramp`** declared by three scenarios (`field_3d_renderer.ts:1050`, `:1968`,
> > `:2097`, with its own scar `field3d_param_ramp_authoring_contract` at `:1049`) and
> > **`idle_auto_sweep`** by four (`:374`, `:926`, `:1052`, `:1951`). All three motion sources already
> > route through one path (`:1339`). **So F21 is a PORT of two shipped mechanisms into a new
> > scenario's authoring surface — not an invention, and no guided state was ever going to be
> > byte-static.** The genuine need is *authorability by `json_author` without an engine edit per
> > re-time*, which is a real and sufficient reason on its own.
> > **Why this correction matters more than its size:** left standing, VG-C would have been dispatched
> > to *invent* a mechanism the renderer already has — the exact duplicate-build Rule 40a exists to
> > prevent, committed by the document whose entire value is engine deltas. **The Rule-40a sweep was
> > run on the scenario NAME and never on the MECHANISMS declared missing.** F21's dispatch must name
> > `param_ramp` and `idle_auto_sweep` as clone targets.
>
> **A9 · THE NINTH DELTA — mid-state camera — AND IT ALREADY EXISTS.** No F-row and no delta could
> express a camera that moves *during* a state: `camera_position` is entry-only (`applyState:67196`)
> and F21's `animate[]` ramps scalar knobs, not a pose. Act II's S5 needs exactly that, and so does
> Act I's S4 tilt. **`os.camera_steps` — `[{at_ms, az, el, dist, ease_ms}]` — is declared at
> `:60704` and implemented at `:62213–62290` / `:64631` / `:64858`** (verified). Adopt it as
> `vg.camera_steps`; do not build it.
> **And it partly dissolves open decision 3.** Its header states the design explicitly: *"IT IS
> CLOSED-FORM, AND THAT IS THE WHOLE DESIGN. animateCameraTo is a fixed-rate lerp… and a lerp is
> HISTORY-DEPENDENT… this function returns the pose as a pure function of state-local ms."* A state
> authoring `camera_steps` therefore **bypasses `lerpSpherical` entirely and is frame-rate independent
> by construction** — it eases rather than cuts, starts and ends at rest (Rule 32d), and reproduces
> byte-identically under `SET_TIME_FREEZE`. So the wave can route around the frame-rate defect instead
> of waiting on a platform dispatch.
>
> **A11 · THE CAMERA-METRIC SCAR RECURS A FOURTH TIME — and this instance is an EXISTING OPEN ROW.**
> Act I's replacement rule (A1) survived independent re-derivation: Checkpoint A reproduced the 0.00°
> failure, the 18.91° floor, the 3.56° in-plane error and the S7 44.0° six-pair minimum **exactly**,
> and verified the impossibility proof's algebra separately. **But the sweep that produced it swept
> 2 of the explore state's 4 live sliders** (θ × tilt, not `a_mag` × `b_mag`) while being reported as
> covering *"the full slider product."* The angular floor genuinely survives — the auto-frame direction
> `normalize(â+b̂+ĉ)` is **magnitude-invariant**, which is exactly why an angular sweep returns an
> identical floor at every magnitude and reads as complete. **The framing does not survive:** at the
> authored `|a|=3, |b|=2` the max projected screen arm measures **0.885 against a frame half-extent of
> `tan 30° = 0.577` — already off-frame** — and 8371 at `|a|=|b|=5` against a fixed `R = 9`.
> **This is the OPEN row `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed`
> [MAJOR] recurring verbatim, plus `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius`
> [CRITICAL] which §⓿ claimed was satisfied.** In one wave the camera-metric class has now appeared as:
> per-object vs pairwise (#7), non-intersection (#9), shape (#8), and **axis-held-fixed (#7 again)** —
> *the fourth instance being committed inside the fix for the first.*
> **THE DURABLE RULE, promoted to the §camera invariant:** *an explore-camera solve enumerates EVERY
> live slider in the state, and reports **max projected screen arm against the frustum half-extent**
> alongside min pairwise separation. A solve that omits a live slider is not a solve, and a solve that
> reports only an angle has not measured framing.* The camera radius is auto-framed
> (`R = k · max(|a|, |b|, |a×b|)`), never fixed. Gate §13 asserts both quantities.
>
> **A12 · RULINGS TAKEN BY THE DISPATCHING SESSION (both Checkpoint As refused to open cycle 1 without them).**
> - **F21 is folded into VG-A's scope** — not VG-C, and not as an invention. Both #7 and #9 consume it
>   in every guided state (Act I authors a driven ramp in all seven; Act II in 8 of 9), so it is
>   shell-level. Dispatch names **`param_ramp` (`:1050`, `:1968`, `:2097`) and `idle_auto_sweep`
>   (`:374`, `:926`, `:1052`, `:1951`) as clone targets** per the A3 correction.
> - **F-ROW NUMBERING IS FIXED HERE AND THE VG DISPATCHES ARE SCOPED OFF THESE NUMBERS** (Act I's
>   Checkpoint A found #7 and #9 had already diverged): **F21 = `animate[]`** · **F22 = free point** ·
>   **F23 = comparison segment / projection** · **F24 = `vg.camera_steps`** (adopt the existing
>   `os.camera_steps`, A9 — port, do not build).
> - **COLOUR LANGUAGE: Act II and Act III conform to Act I's table VERBATIM.** This is enforcement of
>   §arc rule 2, not a new decision — Act I declares the chapter mapping, ships first, and its
>   *"green never means an input"* is the load-bearing teaching claim of S4, the chapter's primary aha.
>   Act II had inverted it in both directions (normal violet, patch green) and invented a sixth colour;
>   both are reverted. **§arc rule 5's handoff frame is Act I's S5 final frame, unchanged — same pose,
>   same colours, same objects present; only the words change.**
>
> **A13 · §arc RULE 6 IS AMENDED — I created a rendered-string class and did not gate it.** Both
> Checkpoint As found the same defect independently: the `→ hand-off` sentence is **rendered narration**,
> and **neither ring-cut walk covered it**, so both concepts leave a dangling promise under both
> reduced presets (#7: S6 closes *"So what do THREE vectors span?"* with S7 hidden; #9: S7 closes
> *"so we build the perpendicular ourselves"* with S8 hidden). **Rule 38a's coherent-when-cut walk MUST
> include the hand-off column, and every ring-boundary state authors a cut-safe alternate hand-off.**
> The lesson is mine to record: *a continuity contract that adds a rendered string must extend every
> gate that walks rendered strings, in the same edit — or it manufactures exactly the incoherence the
> ring rule exists to prevent.*
>
> ## A14 · ⭐ THE HEADLINE FINDING — ONE DEFECT CLASS, **FIVE** INSTANCES, THREE CONCEPTS, ONE WAVE
> Every architect and every Checkpoint A in this wave hit the same class independently, in a different
> geometry each time. Listed together because separately each reads as a local fix, and together they
> are the thing this Phase 0 exists to have found:
>
> | # | Concept | The claim that is false on screen | How the check missed it |
> |---|---|---|---|
> | 1 | #7 | perpendicular vectors draw **collinear** | metric scored **per-object**, not pairwise |
> | 2 | #9 | skew lines draw **intersecting** | projection preserves no **intersection** |
> | 3 | #8 | a circular slice draws as an **ellipse** | projection preserves no **shape** |
> | 4 | #7 | the explore sandbox is **already off-frame** at its authored magnitudes (arm 0.885 vs half-extent 0.577) | solve swept 2 of 4 live sliders, reported as "the full slider product" |
> | 5 | #8 | the circle remedy **degrades below its own gate floor** as the disc travels (aspect 0.9690 → 0.9385 vs a ≥0.95 floor) | remedy solved at **one pose**; the gate scored that same pose |
>
> **Instances 1 and 4 were committed inside the fix for instance 1.** Instances 3 and 5 are the same
> pair one concept over. The recorded scar
> `camera_metric_scored_foreshortening_not_pairwise_screen_separation` already states the general form —
> *"when a measurement is introduced to prevent a defect, check that the thing it measures is the thing
> that failed"* — and it was re-violated four more times **by people who had read it**. So the remedy
> cannot be another instance-specific rule. It is one sentence, and it replaces all five:
>
> > ### THE WORST-CASE LAW
> > **A projection metric is scored at the WORST case over EVERYTHING THAT MOVES — every live slider,
> > every driving control, every position the taught object reaches — in perspective, pairwise over
> > every rendered pair, reporting BOTH an angular separation AND a screen extent against the frustum.
> > A metric evaluated at the authored pose, at the pin, or over a subset of the axes is not a
> > measurement; it is a sample that will agree with the design that produced it.**
>
> Gate sections 11 and 13 assert the worst case over the swept range, never the authored pose. Every
> skeleton's camera section states the FOV, the reference aspect, the axes swept and the worst value —
> a camera number without those four beside it is not measured (A10).
>
> **A15 · #8's ticked-frame options table missed the renderer's own graph mechanism.** Checkpoint A
> found `field_3d` already ships canvas-drawn ticked axes today — `acgDrawGraph`, `capDrawGraph`,
> `accDrawViGraph`, `buildClBzGraph`, `tfrDrawTickBar`, the `rbrClampTickLabels` family, and **161
> `fillText` sites**. So a **hybrid** was never priced: region and solid in 3D (which is what makes the
> §c2 "the region that spins must BE the region the frame ticks" argument hold), with the tick **scale**
> drawn as canvas text — DOM/probe-visible, and immune to the three sprite-legibility scars the
> skeleton accepts as *"BOUNDED, not solved."* Price it before choosing. *Third Rule-40a-class find in
> this wave: `param_ramp`/`idle_auto_sweep` (A3), `camera_steps` (A9), and now the graph mechanisms —
> **every one of them a thing we were about to build that already ships.***
>
> ## A16 · CYCLE-1 OUTCOME — what the three amendments changed in the CONTRACT (2026-08-08)
> All three skeletons amended: #7 973 → **1202** lines · #9 826 → **1142** · #8 1332 → **1695**.
> **Across all three, cycle 1 rejected ONE finding and applied several in a stronger form than
> prescribed** — the disagreements are recorded in each skeleton's `CYCLE 1 — CHECKPOINT A RESPONSE`.
>
> **The engine scope the VG dispatches must now carry:**
> - **F21 `animate[]`** and **F24 `vg.camera_steps`** are consumed by all three concepts and are
>   **PORTS** (`param_ramp` / `idle_auto_sweep` / `os.camera_steps`). Both land in **VG-A**.
> - **F24 retires three separate design-arounds.** #7 **withdrew its entire `lerpSpherical`
>   frame-rate workaround** (the 2600 ms-vs-2244 ms tilt arithmetic), #9 dissolved ASSUMPTION A4 /
>   FLAG 2, #8 withdrew FLAG 1 / assumption A5. **Open decision 3 is thereby de-risked for this wave**
>   — the platform defect is real and still worth its own dispatch, but nothing here waits on it.
> - **NEW — Δ10 `scene_group` selector (#9's S9 only), forced by measurement.** Applying the
>   worst-case law honestly to the explore state (8 objects × **all six** sliders) returns a
>   **best-anywhere min pairwise separation of 1.35° — no camera exists.** Per-group poses solve to
>   41.1° and 11.0°. **This is the law's first real result: it did not tune a number, it proved a
>   single-camera design impossible.** VG-C scope grows by one selector.
> - **D-12 — the gate's exempt-pair list is CONFIRMED BY MEASUREMENT, not argued.** A6 predicted it
>   from #9; #7's S6 sweep then hit it — `a×b ^ b×a` returns **0.00°**, antiparallel **by design**,
>   because S6's whole lesson is that reversing the order flips the vector. **Without the exemption
>   the gate fails the state that is correct.** Gate §13 ships the exempt-pair list AND the
>   screen-length floor.
>
> **Every camera in the wave is re-solved at FOV 60 / 16:9, perspective, pairwise, worst-case**, and
> each now states FOV + aspect + axes swept + worst value (A10). Two headline results: #7's explore
> state swept **all four sliders over 266 747 poses** → min pairwise 18.91°, **max arm 0.436 ≤ 0.4619,
> on frame** (was 0.885, off frame); #8's S3 re-solved to 12° off-axis with **worst aspect 0.9661**
> swept over all 81 `x_cut` positions × 720 rim points, **carrying round 0's failing pose as a gate
> negative control**.
>
> **A17 · A FOURTH "IT ALREADY SHIPS", AND THE FIRST ONE THIS SURVEY GOT WRONG.** #8 was asked to
> price A15's canvas-graph hybrid and **priced it, then rejected it with evidence**: the 161
> `fillText` sites are **all inset graph panes** (`cap_graph_canvas`, `:7171`), not scene overlays, so
> the hybrid needs a **new size-synced full-canvas overlay** — and canvas text is **as DOM-invisible
> as a sprite**, dissolving only 2 of the 3 sprite scars. **Adopted instead: DOM tick labels
> positioned from `nlbProjPx` (`:41833`), which already ships** — ~30 lines, CSS glyph height,
> screen-space decollision, **probe-readable**, dissolving **all three** scars and retiring assumption
> A2. *A15 was right that the options table was incomplete and wrong about which option was missing.*
> Running tally of things this wave was about to build that already existed: `param_ramp` /
> `idle_auto_sweep`, `os.camera_steps`, the graph mechanisms (priced, rejected), `nlbProjPx`.
>
> **A18 · TWO FIXES THAT BEAT THEIR PRESCRIPTION — recorded because the pattern is the lesson.**
> (a) #8's S5: `n ≥ 1000` was **necessary but measurably NOT sufficient** — at 4 dp it disagrees at
> **13 of the 101 reachable radii**. Fixed by **quantising `r` to its slider step in both drive paths**
> (making the reachable set exactly 101 values — finite and *exhaustively* gateable) and `n = 20 000`;
> measured **0 of 101** disagree. (b) #8's pins: rather than declare the easing and recompute every
> row, **every pin moved past the end of its ramp**, which makes the baselines invariant to *any*
> monotone easing and **removes the defect class instead of fixing the instance.** Both are the same
> move — *change the question so the fragile quantity stops being load-bearing* — and both are better
> than what Checkpoint A and this document asked for.
>
> **A10 · EVERY CAMERA SOLVE IN THIS WAVE WAS COMPUTED AT THE WRONG FOV.** Act II solved its poses at
> an assumed **50°** vertical FOV, deferring the real value to build time. The renderer is
> **`PerspectiveCamera(60, …)`** — `field_3d_renderer.ts:3733`, corroborated by the renderer's own
> comment at `:56905` (verified). Also `camera.aspect` is live
> (`window.innerWidth / window.innerHeight`), so any "frame fill" figure is undefined until a
> reference aspect is declared — the file itself solves at 16:9 elsewhere (`:57121`, `:57319`).
> **Every pose in every skeleton in this wave must be re-solved at FOV 60 against a declared reference
> aspect before it is authored.** One grep would have caught it, in documents that cite that same file
> by line number repeatedly. **Standing rule for this wave: a camera number is not measured until the
> projection parameters it was measured under are named beside it.**
>
> **A4 · D2 IS UNBUILDABLE AS WRITTEN, and it breaks §arc rule 5.** D2 says a plane patch is the
> parallelogram quad *"built on any two vectors spanning the normal's orthogonal complement."*
> **"Any two" makes the patch orientation arbitrary**, so Act II cannot author a patch that matches
> Act I's parallelogram — which is exactly the Act-I callback §arc rule 5 requires. **The engine
> decision and the continuity contract were mutually unsatisfiable, and neither had been built.**
> D2 now requires an **authorable span** (the patch's two edge vectors are authored, not derived).
>
> **A5 · THE COLLISION CHECK WAS INCOMPLETE.** §0a scanned `src/data/concepts/` **files** and reported
> all ids CLEAR. It missed `src/lib/mathematicsCatalog.ts`, whose ghost catalog already reserves
> `solids_of_revolution` (`:134`, matches) and `lines_and_planes_in_space` (`:139`, matches) — but
> names Act I **`vector_dot_and_cross_product`** (`:114`), and points #9's prerequisite at that id
> (`:141`). Two references, one file, nothing else in the tree. **A concept-id check must sweep the
> catalog and the registries, not only the concept files.** → open decision 8.
>
> **A6 · GATE §13 IS PARTLY WRONG AND GAINS TWO REQUIREMENTS.** Its `90.0°` assertion encodes the
> falsified rule (A1) — replace with the measured `18.9°` closed form. Act II adds: the pairwise gate
> needs **(a) an exempt-pair list** (three pairs in #9 are parallel *by design*; `d₁×d₂` vs the common
> perpendicular measures 0.00° and is correct) and **(b) a screen-LENGTH floor**, because a pairwise
> *angle* cannot see foreshortening. Both are the same lesson as A1 one level up: *a gate that cannot
> distinguish the designed case from the defect will be switched off by whoever meets it first.*
>
> **A7 · #8's EXCLUSION IS CONFIRMED — its GROUNDS ARE CORRECTED.** §ledger item 1 named two
> blockers; Act III dissolved **both** and confirmed the exclusion on a better reason. See the
> rewritten §ledger item 1. **Consequence: #8 is NOT "blocked pending an evaluator and a founder
> ruling" — it is schedulable now, at two dispatches.**
>
> **A8 · #8's CURRICULUM ROW IS PROBABLY WRONG, and our own repo says so.** §0a carries
> #8 as CBSE **F** / JEE **F**. Act III disputes both: current CBSE Class-12 Application of Integrals
> is **area under curves only**, and volume of revolution is not a named JEE Main topic; it **is**
> examined on AP Calc AB/BC, A-level Pure, IB AA HL and ISC. **Corroborated in-repo:**
> `src/data/ncert-boundaries.ts:269` lists `"Area under simple curves"` and **nothing about volumes of
> revolution**, while `:273–277` lists dot product, cross product, equation of a line, equation of a
> plane, angle between lines and planes and shortest distance between skew lines — i.e. **the file
> independently confirms #7 and #9 at CBSE F and independently fails #8.** So §0a's "this is a
> CBSE/JEE/IB-HL depth play" is right for #7 and #9 and **backwards for #8, which is the wave's
> INTERNATIONAL concept.** Still a Rule-38g CLAIM either way — the boundaries file is our own
> authored artifact, not a teacher — but an internal contradiction between two of our own documents is
> worth more than either. → open decision 9.

Doctrine: `docs/AUTHORING_PIPELINE.md` §0 · models: `docs/CHEMISTRY_PHASE0_BONDING.md` (the `field_3d`
precedent) + `docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md` (the mathematics precedent) ·
mandate: `docs/MATHEMATICS_DISCUSSIONS.md` §6 (P3 #7/#8/#9 + the ⚑ 2026-08-08 correction) ·
phase mechanics: `docs/MATHEMATICS_BUILD_PLAN.md` Phase 5 ·
predecessor record: `docs/MATHEMATICS_VECTORS_3D_HANDOFF.md` (the stopped round — read §3/§6/§7 first).
Runs ONCE for the 3D half of mathematics, **before any concept desk opens.**

> ### The one-line result
> **#7 and #9 are ONE engine purchase; #8 is not, and the reason is measured, not preferred.**
> `vector_products_in_space` (dot & cross) and `lines_and_planes_in_space` share **fourteen of
> fifteen** engine features and the entire camera contract — a plane patch *is* the parallelogram
> quad translated, and the common perpendicular of two skew lines *is* `d₁ × d₂`. They land as one new
> `field_3d` `scenario_type` with a two-value `mode`, after which both concepts are pure JSON.
> `solids_of_revolution` shares only the shell (5 of its ~11 needs) and its distinctive half needs two
> things this renderer does not have — an expression evaluator and a ticked coordinate frame — so
> bundling it doubles the dispatch and amortises nothing. **It is ledgered with its cost stated, not
> declined.**

> ### The second result, and it changes what happens to the stopped round's engine desk
> **The engine desk's work is good and should be KEPT — but it must be RENAMED before it lands.**
> It is currently `scenario_type: "vector_products_in_space"`: a *concept id* used as a *scenario
> name*. The moment it merges, `lines_and_planes_in_space` must either author a scenario named after a
> different concept, or a second scenario gets built and the amortisation this survey exists to
> capture is lost. Renaming costs minutes today (nothing is on master, nothing is authored) and is
> impossible later — 60 sibling scenarios and 234 dispatch sites make a scenario name permanent.

> ### The third result — handoff §2 is RESOLVED, at $0, and the answer was the least-likely candidate
> The 10 unexplained EYE failures on the engine desk were **not** the surgeon's diff. Measured below
> (§eye): a clean, freshly-synced `master` carrying **zero** of that diff returns **43/56 on
> `parallel_currents_force`, 13 failures, every single one `H2 / VISUAL_REGRESSION`, zero functional
> gates.** The concept's baselines were approved **2026-07-05** and **199 commits have touched
> `field_3d_renderer.ts` since.** The recorded "56/56" is a 2026-07-05 number that no longer describes
> master. **The surgeon is exonerated.**

---

## 0a — SURVEY

### The concepts this engine must serve

Three, from the ranked list (`MATHEMATICS_DISCUSSIONS.md` §6, P3). Breadth and capability numbers are
carried from §4 there and are **not re-derived**; what is added is the *engine* consequence.

| # | Concept | Rank | Breadth | Cap. | The engine sentence |
|---|---|---|---|---|---|
| 7 | **`vector_products_in_space`** — dot & cross product | P3 (founder-scheduled) | 5.5/7 | 3 | Two vectors from a common origin at a live angle; a cross-product vector perpendicular to their plane; a live parallelogram whose area *is* `|a×b|`; a live parallelepiped whose volume *is* the triple product |
| 9 | **`lines_and_planes_in_space`** — 3D coordinate geometry | P3 | 4.5/7 | 3 | A line as point + direction with a swept λ; a plane as point + normal; their intersection or its absence; feet of perpendiculars; the common perpendicular between skew lines |
| 8 | **`solids_of_revolution`** — volume by integration | P3 | 5.5/7 | 3, 2 | A plane region swept about an axis into a solid; disc / washer / shell decompositions at live `n`; the volume sum converging — **OUT OF SCOPE, §ledger item 1** |

**Concept ids collision-checked clear** across all three namespaces (physics flat dir, `chemistry/`,
`mathematics/`) on 2026-08-08: `vector_products_in_space`, `lines_and_planes_in_space`,
`solids_of_revolution`, `skew_lines`, `plane_in_space`, `volume_of_revolution` — **all CLEAR.**
These ids **already exist as physics concepts and are permanently forbidden** (carried from the
handoff §5, re-verified): `dot_product`, `angle_between_vectors`, `unit_vector`, `unit_vector_form`,
`area_vector`, `scalar_vs_vector`, `vector_addition_law`, `vector_head_to_tail`, `vector_resolution`,
`negative_vector`, `scalar_multiplication`.

### Curriculum reach — Rule 38g CLAIMS, not facts

Carried verbatim from `MATHEMATICS_DISCUSSIONS.md` §4. Every non-CBSE cell ships
`needs_teacher_verification: true` and no preset is teacher-visible until a teacher of that board
confirms it.

| # | CBSE | ICSE | JEE | IB DP | AP | IGCSE | A-lvl |
|---|---|---|---|---|---|---|---|
| 7 | F | F | F | F (HL) | P (Phys C) | — | F |
| 9 | F | F | F | F (HL) | — | — | P |
| 8 | F | P | F | F (HL) | F (Calc AB/BC) | — | F |

**The honest reading, stated plainly because the subject's whole thesis is intersection-first.**
**This is the weakest international wave mathematics has scheduled.** All three concepts are
**absent from IGCSE entirely**, and #9 is absent from AP as well. Rule 38f names this exact shape and
its instruction: *"build it deliberately for that audience, never by momentum."* The audience here is
**CBSE / JEE / IB-HL**, and the wave is a depth play for them — which is a legitimate reason to
build, and the founder has ruled it (`MATHEMATICS_DISCUSSIONS.md` §6 ⚑, 2026-08-08). It is **not** the
IGCSE-hole-filling argument the chemistry bonding wave had. Recording it so a later coverage review
does not mistake this wave for breadth work.

**Standing gap, restated because it now covers two more files:** thirteen concepts across chemistry
and mathematics deep, **not one international `curriculum_tags` cell has ever been confirmed by a
teacher of that board** (`MATHEMATICS_DISCUSSIONS.md` §7 item 1). This wave enlarges that gap; it does
not close it.

---

### The FIRST question: does an existing scenario family stretch?

*"The cheapest Phase 0 is the one you discover you don't need."* Measured against renderer code on
`master` @ `dfca9cf`, not against the pattern doc — whose own header warns that a tier label decays,
and which is exactly what went wrong last round (§traps).

| Existing surface | Stretches? | Evidence |
|---|---|---|
| `field_3d` · `rhr_force_direction` | **No as a surface — YES as the clone SHAPE** | `applyRhrForceDirectionState` (`:11992`, dispatched `:67383`) is the fleet's nearest two-vectors-plus-cross-product scenario and its *structure* is the right template. But it is **DIRECTION-ONLY by design** — the field_3d scar checklist's own instruction is *"never show a magnitude, `r=mv/qB`, or period T"* (`FIELD3D_SCENARIO_CHECKLIST.md`). #7's S5 **is** a magnitude (`|a×b|` = area). Cloning the shape is right; extending the scenario is not |
| `field_3d` · `bonding_scene` | **No as a surface — YES as the MODE ARCHITECTURE** | Charged units on a lattice with inter-unit links. Nothing to do with free vectors. But `BS_CAMERAS[bs.mode]` (`:57062`, `:57434`) is the exact multi-concept pattern this wave needs: ONE `scenario_type`, a `mode` enum, a per-mode camera table. Copy the architecture, not the code |
| `field_3d` · `molecular_geometry` | No | `MG_MOLECULES` / `mgIdealDirs` derive directions about **one central atom from a VSEPR table**. No arbitrary vector, no authored magnitude, no second origin |
| `field_3d` · `dipole` / `charge_distribution` | No | Field visualisers. They draw arrows *sampled from a field*, never two authored vectors and the geometry between them |
| `parametric` (PCPL) + the new `cartesian_plane` | **No for #7/#9 — RELEVANT for #8** | Flat 2D, pixel/data coordinates, no camera. #7 and #9 claim **capability 3** (hold 3D spatial structure), the one thing a 2D canvas cannot reach. But #8's region-under-a-curve half is *precisely* what `cartesian_plane` was just bought to do — see §ledger item 1 |
| `particle_field` | No | 2D, and its engine is circuits |

**Verdict: no existing scenario stretches. A new `scenario_type` is unavoidable — the handoff's
finding, re-confirmed.** What is new here is *which* clone target for *which* half: shape from
`rhr_force_direction`, mode architecture from `bonding_scene`.

---

### <a id="inventory"></a>The measured engine inventory — RE-VERIFIED, with three corrections

All numbers measured on `src/lib/renderers/field_3d_renderer.ts` @ `dfca9cf` (75,120 lines),
2026-08-08. The handoff §3 asked the next session to *"re-verify these and move on"*. Re-verification
found **three things that were wrong or missing, and one that was right.**

| What | Count | What it means |
|---|---|---|
| `scenario_type ===` dispatch sites | **234 lines / 264 occurrences** | Handoff's 234 confirmed (it is the line metric) |
| **distinct `scenario_type` names** | **60** | The better number. Sixty hard-coded scenarios, **not one of them generic.** A new `scenario_type` is structural, not a workaround |
| `ArrowHelper` | 205 | Arrow drawing is genuinely, heavily reusable |
| `PlaneGeometry` | 10 | All fixed axis-aligned rectangles — **not** reusable for a live quad from two arbitrary vectors |
| `BufferGeometry` `setFromPoints` | 40 | Per-frame-rewritten geometry has heavy precedent. Mesh work is conventional here, not novel |
| **`crossProduct`** | **0** | ⚠ **CORRECTION 1 — see below** |
| `crossVectors` / `.cross(` / `.dot(` | 17 / 5 / 25 | The real vector arithmetic, and it is **Three.js's**, not ours |
| `parallelogram` | **0** | No parallelogram mesh exists |
| `parallelepiped` | **0** | No analog at all |
| `LatheGeometry` | **0** | No surface-of-revolution primitive |
| `CylinderGeometry` / `CircleGeometry` / `RingGeometry` | 106 / 19 / 10 | ⚠ Relevant to #8 — a disc stack needs **no** `LatheGeometry` |
| `TubeGeometry` / `CatmullRomCurve3` | 27 / 23 | A 3D polyline through sampled points is already routine |
| **expression evaluation** (`safeEval`, `*_expr`, `new Function`, `PM_interpolate`) | **0 / 0 / 0 / 0** | ⚠ **CORRECTION 2 — the finding that scopes #8 out** |
| `createLabelSprite` / `createWideLabelSprite` | 340 / 60 | Rule 34c's third text path. Any Unicode sweep must cover it |
| `applyGlowEmphasis` | 129 | Rule 29 / 32e emphasis is one funnel and it exists |
| `show_sliders` / `slider_controls` / `visible_controls` | 100 / 424 / 37 | Rule 31 per-state contextual controls have full plumbing |
| `SET_TIME_FREEZE` | 124 | THE EYE's determinism contract is pervasive and must be honoured by any new code |
| `vectorTriad` / `vector_geometry_3d` / `vpParallelogramVerts` (Rule 40a, `git log --all -S`) | **0 hits each** | Nothing is being built twice |

#### ⚠ CORRECTION 1 — `crossProduct` is 0, and this matters more than it looks

`docs/patterns/mathematics.md` archetype D and `MATHEMATICS_DISCUSSIONS.md` §3d both say *"193
occurrences of `crossProduct` / `PlaneGeometry` / `ArrowHelper`"*; the handoff says 215–217. The
composite total re-measures at **215** — but its parts are `ArrowHelper` **205** + `PlaneGeometry`
**10** + `crossProduct` **0**. **There is no symbol called `crossProduct` anywhere in the renderer.**

The claim "the vector maths is already there" — the load-bearing claim behind scheduling #7 into a
"no new engine" tier — is therefore **95 % a claim about arrow *drawing*, and the 5 % that is maths is
`THREE.Vector3.prototype.crossVectors`, which every Three.js project on earth already has.** The
composite grep read as reuse because three symbols were summed under one label and only one of them
was ever large. **Rule for the next survey: never sum unlike symbols into one reuse number.** Count
each, and name what each one buys.

*(This does not change the verdict — the arrows and the mesh technique genuinely are reusable, and
`ArrowHelper` at 205 is a real asset. It changes the confidence with which anyone may say "the maths
is already there," which is the sentence that mis-tiered this concept.)*

#### ⚠ CORRECTION 2 — `field_3d` has ZERO expression evaluation, and nobody had measured it

No `safeEval`, no `*_expr` field, no `new Function`, no `PM_interpolate`. **Every one of the 60
scenarios computes its geometry from NUMERIC parameters in hard-coded JavaScript.** This is a
fundamental architectural difference from `parametric_renderer.ts`, where an author writes
`y_expr: "sin(x)"` and `PM_safeEval` evaluates it against a live variable scope.

**Consequence, and it is the whole reason #8 is ledgered:** a solid of revolution is generated by
rotating **an authored function** `y = f(x)`. In `field_3d` that requires either (a) a **closed enum
of profiles** with numeric coefficients — the `MG_MOLECULES` table pattern, cheap and honest — or
(b) buying an expression evaluator into `field_3d`, a large fleet-wide Rule-40 platform change
affecting all 60 scenarios. Neither is wrong; both are **decisions**, and neither belongs inside a
dispatch scoped to dot and cross products. #7 and #9 need **no** evaluator: every quantity they draw
is pure vector arithmetic on numeric parameters.

#### ✅ CONFIRMED — the camera mechanism exists and does not need building

Handoff §3's claim survives re-verification, and the *method* of verifying it is worth recording.
`applyState()` (`:67131`) contains, at **`:67195`**, an **ungated** top-level block:

```js
// Camera animation
if (stateDef.camera_position) { animateCameraTo(stateDef.camera_position); }
```

so any new scenario inherits per-state camera poses with eased transitions for free.

⚠ **But a near-identical block also lives at `:66995`, inside `applyStraightWireCurrentState`** — a
scenario-specific function. A `grep -n camera_position` returns both and they look the same. **Resolve
every citation to its ENCLOSING FUNCTION, never to the matching line**; the first read of this survey
cited the scenario-local copy and would have "confirmed" a generic mechanism from a private one.

#### ⚠ NEW FINDING — the camera ease is FRAME-RATE DEPENDENT (Rule 36)

`lerpSpherical()` (`:4214`) uses a **fixed per-frame** interpolation factor:

```js
function lerpSpherical() { if (!animating) return; var t = 0.05; ... }
```

and it is called at **`:71310` in `animate()`, once per RENDERED FRAME**, outside the fixed-step
accumulator — it reads neither `dtStep` nor `__pmSteps`. So a camera transition completes in a fixed
number of **frames**, not a fixed **time**: on a 120 Hz classroom tablet it arrives in **half** the
wall-clock duration it takes in dev.

This is Rule 36's named failure class exactly — *"NEVER hardcode a per-frame delta or assume 60 Hz…
the failure is INVISIBLE in dev and only surfaces on real classroom hardware"* — and it is invisible
to THE EYE by construction, because under `SET_TIME_FREEZE` the step count is forced to 1 and frozen
frames are pinned by sim-time, long after the camera has converged.

**Why it is a Phase-0 finding and not a bug report.** Handoff §6's verified camera solution makes
**#7's PRIMARY AHA state (S4) a camera tilt** — *"S4 tilts elevation 70°→30° with azimuth FIXED; the
tilt IS the reveal that a third dimension exists."* That beat's pacing against narration is
frame-rate dependent today. **This must be settled before S4 is designed**, and it is a Rule-40
platform question (all 60 scenarios share it), not a mathematics one. → **§ledger item 4** + a scar
row.

---

### <a id="union"></a>The union of engine needs

**F-rows are features; ✓ means at least one designed state consumes it** (walked below, not asserted).
`EXISTS` = already in the renderer, nothing to build.

| Feature | #7 | #9 | #8 | Status |
|---|:-:|:-:|:-:|---|
| **F1** Scenario shell: new `scenario_type` + `apply…State()` + per-frame update + glow pass | ✓ | ✓ | ✓ | BUILD |
| **F2** Per-state `camera_position` with eased transition | ✓ | ✓ | ✓ | **EXISTS** (`applyState:67195`) |
| **F3** Two arbitrary vectors from a common origin, authored as magnitude + angle | ✓ | ✓ | — | BUILD |
| **F4** A third vector out of the a–b plane, authored by spherical angles | ✓ | ✓ | — | BUILD |
| **F5** Live angle arc between two directions + numeric degree readout | ✓ | ✓ | — | BUILD |
| **F6** Cross-product vector drawn perpendicular to the pair's plane, live | ✓ | ✓ | — | BUILD |
| **F7** Live **parallelogram** mesh — 4 verts `[0, a, a+b, b]`, rewritten per frame, `transparent` + `DoubleSide` | ✓ | ✓ | — | BUILD |
| **F8** Live **parallelepiped** mesh — 8 corners / 6 faces from one shared corner formula | ✓ | — | — | BUILD |
| **F9** Numeric readout panel (`a·b`, `\|a×b\|`, `a·(a×b)`, distance, volume) | ✓ | ✓ | ✓ | BUILD (panel), Rule 33d |
| **F10** Per-state contextual slider rows over one shared panel (Rule 31) | ✓ | ✓ | ✓ | **EXISTS** (`show_sliders`/`visible_controls`) — per-scenario panel wiring only |
| **F11** **Extended line** through a point in a direction, drawn to the scene bounds, with a live λ marker | — | ✓ | — | BUILD |
| **F12** **Plane** from point + normal, sized to read, with its normal arrow | — | ✓ | — | BUILD — *this is F7's quad, oriented from the normal* |
| **F13** **Foot of perpendicular** / shortest-distance segment between two objects + live distance | — | ✓ | — | BUILD |
| **F14** **Intersection marker** that appears only when the intersection exists | — | ✓ | — | BUILD |
| **F19** **Pairwise screen-separation** camera gate (the scar, mechanised) | ✓ | ✓ | ✓ | BUILD (gate, not renderer) |
| **F15** Profile curve `y = f(x)` in a plane from an authored function | — | — | ✓ | **BLOCKED — no evaluator (§ledger 1)** |
| **F16** Disc/washer stack — n cylinders at radius `f(xᵢ)`, live n, published volume sum | — | — | ✓ | not built |
| **F17** Shell stack — n nested cylindrical shells | — | — | ✓ | not built |
| **F18** Region swept about an axis through θ ∈ [0, 2π] | — | — | ✓ | not built |
| **F20** A ticked 2D coordinate frame beside the solid (Rule 33 macro↔micro) | — | — | ✓ | **`cartesian_plane` on a DIFFERENT renderer (§ledger 1)** |

**Two rows earn their place by removing work rather than adding it.** F2 and F10 are **already
built** — the handoff's best Rule-40a catch was discovering F2 *after* a scenario had been scoped to
build it, and F10 is the same shape. Stating them here is the point of a union table: it is as much a
list of what NOT to build.

**One row earns its place by being the same thing twice.** **F12 is F7.** A plane patch is the
parallelogram quad `[p, p+u, p+u+v, p+v]` with `u, v` any two vectors spanning the normal's
orthogonal complement. Build `vpParallelogramVerts` once, orient it two ways, and #9's plane is free.
That single identity is most of the amortisation argument for merging #7 and #9.

**Coverage:** #7 consumes F1–F10 + F19. #9 consumes F1–F7, F9–F14 + F19. **Their union is exactly
F1–F14 + F19, and every one of those is consumed by at least one designed state of at least one of
them.** The reverse check passes: F8 is used only by #7 and F11/F13/F14 only by #9, and both are kept
because their concept is on the ranked list, not because they are nice to have.

**#8 consumes F1, F2, F9, F10, F15–F20.** Its overlap with the #7/#9 purchase is **five shell
features**; its distinctive nine share nothing. → §ledger item 1.

---

### <a id="walk"></a>The union WALK

> ⚠ These are **survey-altitude sketches, not skeletons.** State counts stay complexity-driven
> (Rule 11) and are the architect's call in 0b. The walk's job here is coverage, not pedagogy.

The chemistry precedent's most expensive lesson is that a union table *asserted* rather than walked
state by state missed **seven** designed states consuming capabilities the union did not list
(`CHEMISTRY_PHASE0_BONDING.md`, Checkpoint A cycle 1), and the `cartesian_plane` precedent adds the
sharper form: *"the 0a union walk recorded each state's NEW capability rather than every capability
CO-PRESENT in it, so composition questions were never asked."* **Both walks below name co-present
features, not just new ones.**

**#7 `vector_products_in_space` — 8 states.** The arc is carried from the handoff §5 (it survived
Checkpoint A on pedagogy and is the round's most reusable design output).

| S | Teaches | Consumes (new · co-present) |
|---|---|---|
| S1 | The apparatus: two vectors `a`, `b` from one origin, angle θ between them | F1,F3,F5 · F2,F9 |
| S2 | Dot product measures **alignment** — θ sweeps, `a·b` tracks | F9 (live) · F1,F3,F5,F2,F10 |
| S3 | `a·b = 0` at 90°, **swept on through into the obtuse regime** so the negative dot is actually taught | — · F3,F5,F9,F2,F10 |
| S4 | **PRIMARY AHA** — the cross product gives a **direction** no in-plane construction can. Camera tilts el 70°→30°, azimuth FIXED; the tilt *is* the reveal | F6 · F3,F5,F9,F2 — **and F19, because this is the state the collinearity trap kills** |
| S5 | `\|a×b\|` **is the parallelogram's area** — driven by `‖b‖`, not θ | F7 · F3,F6,F9,F2,F10 |
| S6 | **Order matters:** `b×a = −(a×b)` — declared contrast pair with S4 | — · F6,F7,F9,F2 |
| S7 | *advanced ring* — the scalar triple product **is** the parallelepiped's volume | F4,F8 · F6,F7,F9,F2 |
| S8 | explore (`interaction_complete`) — all controls, **including `b_tilt`** | F10 (all rows) · F3,F4,F6,F7,F8,F9 |

Three design decisions from the stopped round that should carry forward verbatim, because each was
hard-won and each is a *correctness* fix rather than a taste call:
- **S4 displays `a·(a×b) = 0.0` and `b·(a×b) = 0.0`**, not `|a×b|`. An arithmetic proof of
  perpendicularity that survives every camera pose — and it repairs a Rule-38 ring-cut incoherence
  (`|a×b|`'s only explanation lived in a ring that a reduced preset cuts).
- **S5 is driven by `‖b‖`, not θ.** It differentiates S5's rhythm from S2/S3 (three states shared one
  archetype, against Rule 31) *and* removes S5 from the camera-collinearity exposure entirely.
- **S8 needs a `b_tilt` control** or the sandbox can never demonstrate direction — the concept's own
  primary aha. Under the plane invariant (`a` along +x, `b` in-plane) `a×b` points along +z for every
  reachable slider combination, so the explore state would silently contradict S4.
- **The door anchor must not claim area.** *"The swept door panel's area scales with how hard you
  push"* is false — the swept region is pure geometry. Correct, Rule-35-neutral form: *"how much a
  push turns a door depends on both how hard you push and which direction you push relative to the
  door."*

**Consumes: F1–F10, F19. In the set.**

**#9 `lines_and_planes_in_space` — 9 sketched states.**

| S | Teaches | Consumes (new · co-present) |
|---|---|---|
| S1 | A line is a **point plus a direction**: `r = a + λd`, λ sweeps and the point slides along | F11 · F1,F2,F3,F9 |
| S2 | Two lines, three cases — parallel, intersecting, **skew** | F14 · F11,F9,F2 — **and F19, see the skew trap below** |
| S3 | The angle between two lines comes from their **directions only**, not their positions | F5 · F11,F3,F9,F2,F10 |
| S4 | A plane is a **point plus a normal** — the normal arrow, and the patch perpendicular to it | F12 · F1,F2,F3,F9 |
| S5 | **PRIMARY AHA** — the shortest distance from a point to a plane is the perpendicular, and it drops visibly | F13 · F12,F9,F2,F10 |
| S6 | Line ∩ plane: the intersection point; and the parallel case where `d·n = 0` and there is none | — · F11,F12,F14,F9,F2 |
| S7 | The angle between a line and a plane is the **complement** of its angle with the normal | — · F5,F11,F12,F9,F2 |
| S8 | *advanced ring* — the shortest distance between **skew** lines is along `d₁ × d₂` | F6 · F11,F13,F9,F2 |
| S9 | explore (`interaction_complete`) — all controls | F10 (all rows) · F11,F12,F13,F14,F9 |

**Consumes: F1–F7, F9–F14, F19. In the set.**

> ### ⚠ The #9-specific screen trap, found by this walk and new to this document
> **Two skew lines ALWAYS project to intersecting lines.** Projection does not preserve
> non-intersection: unless the two lines happen to draw parallel on screen, their 2D images cross —
> at a pixel where the 3D lines are far apart. So **S2 and S8, whose entire lesson is "these lines do
> NOT meet," draw them meeting.** This is the exact same failure class as the handoff §6
> `b`-collinear-with-`a×b` trap, in a different geometry, and it would be invisible to any per-object
> camera metric for the same reason. The remedy is the same three-part one, generalised in the
> §camera invariant below: a numeric readout carries the claim, the common perpendicular is drawn as
> a real segment so the gap is a visible object rather than an absence, and the camera is scored
> pairwise. **This is what surveying #9 *now* buys: the trap is a design constraint before S2 exists,
> instead of a Checkpoint-B finding after it is built.**

**#8 `solids_of_revolution` — 8 sketched states, walked to prove the exclusion rather than assume it.**
S1 the plane region under a curve `F15,F20`; S2 rotate it, the solid sweeps out `F18`; S3 one disc —
the cross-section is a circle of radius `f(x)` `F16`; S4 n discs stack, the over/undershoot visible
`F16`; S5 n → large, the staircase smooths, the volume converges `F16` + a published sum; S6 the
washer, region between two curves `F15,F16`; S7 *advanced* the shell method `F17`; S8 explore `F10`.
**Consumes F1, F2, F9, F10, F15–F20 — and F15 and F20 are outside any buildable set today.**
**Correctly excluded, declared not discovered → §ledger item 1.**

**Walk result: 15 of 15 in-scope features are consumed by at least one sketched state of #7 or #9;
every sketched state of #7 and #9 needs only features inside the set. #8's needs fall outside it, by
measurement.**

**0b must re-run this walk against a real skeleton.** Sketches are not skeletons, and both
predecessors are explicit about the difference.

---

## The engine decision — ONE scenario, TWO modes, THREE dispatches

`vector_geometry_3d` is a **new `scenario_type` on `field_3d_renderer.ts`** — a new CASE, not a new
file and not a new renderer, on the recorded `CHEMISTRY_ARCHITECTURE.md` §5c lesson (*"named a new
FILE where a new CASE would do"*, the costliest scheduling error this project has made).

### <a id="naming"></a>The naming decision — take it NOW or lose the amortisation

The stopped round built `scenario_type: "vector_products_in_space"`. **That is a concept id in a
scenario slot**, and it is the one thing about the engine desk that must change before it lands:

- If #9 rides it, `lines_and_planes_in_space.json` authors `"scenario_type": "vector_products_in_space"` —
  a concept declaring it renders as a *different concept*. That is the same class as the recorded
  `mechanics_2d` naming trap in `CLAUDE.md` §1, which the project is still explaining to every new
  session.
- If #9 does not ride it, a second scenario gets built and this survey bought nothing.
- The renaming window is **now**: nothing is on master, no JSON authors it, Rule 40a returns
  **0 hits** for `vector_geometry_3d` / `space_geometry_3d` / `vecGeom` across all branches.

**Recommendation:** `scenario_type: "vector_geometry_3d"`, `mode: "products" | "lines_planes"`, and
the helper prefix stays `vp*` **only if** a cheap rename to `vg*` is not free — the prefix is
internal, the scenario name is not. Per-mode camera table keyed exactly like `BS_CAMERAS[bs.mode]`.

### <a id="contract"></a>Config contract (the shape `json_author` will target)

> ⚠ Per `AUTHORING_PIPELINE.md` §0c, **the dispatch REPORT's closed enums supersede this draft.**
> This is the contract the surgeon is asked to build, not the contract until they report.
> Fields marked ⟵ are carried unchanged from the engine desk's built-and-gated contract
> (handoff §4), so the desk's work maps onto this with no re-derivation.

```jsonc
// per state
"camera_position": [x, y, z],          // ⟵ REQUIRED on every state. No fixed pose works (§camera)
"vg": {
  "mode": "products" | "lines_planes", // the scenario's two halves

  // ── mode: "products" (#7) ────────────────────────────────────────────
  "a_mag": 3.0, "b_mag": 2.0, "theta_deg": 60,      // ⟵
  "c_mag": 2.0, "c_theta_deg": 55, "c_phi_deg": 40, // ⟵ third vector by spherical angles
  "b_tilt_deg": 0,                                  // NEW — S8 needs it or the sandbox
                                                    //   cannot demonstrate direction (§walk)
  "show_c": false, "show_cross_vector": true,       // ⟵
  "show_angle_arc": true,                           // ⟵
  "show_parallelogram": false,                      // ⟵ F7
  "show_parallelepiped": false,                     // ⟵ F8

  // ── mode: "lines_planes" (#9) ────────────────────────────────────────
  "lines": [ { "id": "L1", "point": [0,0,0], "dir": [1,0,0], "lambda_span": [-4, 4] } ],
  "planes": [ { "id": "P1", "point": [0,1,0], "normal": [0,1,0], "half_extent": 3.0 } ],
  "show_intersection": true,          // F14 — marker appears ONLY when it exists (D5)
  "show_common_perpendicular": false, // F13 — the skew gap as a DRAWN OBJECT (§walk trap)
  "show_foot_of_perpendicular": false,// F13
  "lambda": 0.0,                      // the swept parameter; a slider in S1/S9

  // ── shared ───────────────────────────────────────────────────────────
  "reveal_ms": 900,                   // ⟵ one-shot grow-in, then HOLD
  "controls": ["a_mag", "b_mag", "theta_deg"],   // ⟵ Rule 31 per-state rows
  "static_readouts": ["a_dot_b"]                 // ⟵ F9, Rule 33d live numbers
},

// concept-level
"config.slider_controls.{a_mag,b_mag,theta_deg,c_mag,c_theta_deg,c_phi_deg,b_tilt_deg,lambda}":
    { "min":…, "max":…, "step":…, "default":…, "label":… },   // ⟵
"config.vg": { "color_a":…, "color_b":…, "color_c":…, "color_cross":…, "color_plane":… }  // ⟵
```

### <a id="decisions"></a>Engine decisions — made now, not discovered later

**D1 · Pure, THREE-free helpers, and that is what makes the gate possible.** ⟵ The engine desk got
this right and it is the single most important structural choice to preserve. `vgSub / vgAdd /
vgCross / vgDot / vgLen / vgNormalize / vgParallelogramVerts / vgParallelepipedFaces / vgProjectPoint
/ vgPairwiseScreenSeparationDeg` take and return plain arrays and touch no THREE symbol. Being
THREE-free is what lets the gate pull the shipped function bodies out of the template literal by
brace matching and run them **in node with no browser**, exactly as `check:sigma-pi` and
`check:cartesian-plane` do.

**D2 · A plane patch IS the parallelogram quad.** `vgParallelogramVerts(a, b)` returns
`[0, a, a+b, b]`; `vgTranslateVerts(verts, p)` moves it. A plane from `(point, normal)` is that quad
built on any two vectors spanning the normal's orthogonal complement, scaled to `half_extent`. **One
mesh builder, two concepts.** Building a second "plane mesh" is the duplicate this survey exists to
prevent, and the gate asserts the two paths produce identical geometry for a shared input.

**D3 · Recompute from scratch every frame, from the clock — never accumulate.** Every mesh is rebuilt
per frame from `(a_mag, b_mag, theta_deg, …)`; nothing caches between frames; no per-frame counters.
A `SET_TIME_FREEZE` re-pin to the same `at_ms` must redraw byte-identical pixels or every H2 baseline
is worthless. The `setFromPoints` precedent (40 sites) already works this way.

**D4 · Every geometric claim carries a NUMERIC readout computed in 3D.** Rule 33d in its mathematics
form, and the hard lesson of §camera: perpendicular, parallel, zero, equal, non-intersecting — none of
these may rest on pixels, because projection preserves none of them. `a·(a×b) = 0.0` on S4 and the
shortest-distance value on #9's S2/S8 are not decoration; they are what makes the state true under an
adversarial camera.

**D5 · An intersection marker is drawn only when the intersection EXISTS, and its absence is the
lesson.** `line ∩ plane` with `d·n = 0` has no point. Drawing a marker at a clamped or fallback
location would be the `os.orbital || "1s"` silent-identity-fallback scar (`patterns/mathematics.md`
hazard 2) in a new costume: *a valid default is more dangerous than one that throws.* When the
intersection does not exist the marker is hidden and the readout says so; the gate carries a negative
control for it.

**D6 · Register the new scenario in `deriveStateMeta.ts` in the SAME change.** ⟵ The engine desk did
this correctly and the diff is directly reusable: `F3D_REVEAL_KEYS += 'vg'`, a
`maxRevealForField3dState` block returning `reveal_ms + cushion`, and an explicit guided→`reveal_hold`
/ explore→`interactive` split. Skipping it means THE EYE mis-classifies **every** state at the
1500 ms default and false-fails D7/D1p — it is the first line of the field_3d scar checklist.
**One judgment to re-review:** the desk deliberately declared no D5 motion expectation, on
`deriveStateMeta`'s own "over-declaring is worse than skipping" doctrine. That is defensible, and
0c should confirm it rather than inherit it.

**D7 · The camera is scored PAIRWISE, and the metric ships with the scenario.** ⟵ See §camera. The
desk's `vgPairwiseScreenSeparationDeg` and its single best gate assertion are kept whatever else
changes.

**D8 · Everything lives inside the state's `vg` block and `scene_composition`. No new top-level
per-state field.** The `cartesian_plane` survey's D9 applies unchanged and for the same reason:
`build_review_site.ts` keeps a **private duplicate** of the config assembler that hand-picks per-state
fields, and it silently dropped `variable_choreography` on every PCPL concept until `f98e9f7`. Until
that duplicate is deleted, any new per-state field is a defect waiting to be authored.

**D9 · Plain English on every rendered string (Rule 41), and mathematics vocabulary is not jargon.**
"perpendicular", "cross product", "normal", "skew" are the plain words — use the word the formula
uses. What is banned is the literary register: a vector does not "want", "know", "fight" or "escape".
Flagged here because #7's most natural narration ("the cross product *refuses* to lie in the plane")
is exactly the phrasing Rule 41 was written against.

### <a id="reuse"></a>Reuse contract — what `vector_geometry_3d` must NOT re-derive

| Do not build | Use | Why |
|---|---|---|
| A per-state camera pose or its easing | `stateDef.camera_position` → `animateCameraTo()` (`applyState:67195`) | **EXISTS and is ungated.** The handoff's best 40a catch |
| A focal glow / peer dim | `applyGlowEmphasis` (129 sites) | Rule 29 + 32e are one funnel or they are nothing |
| An arrow | `ArrowHelper` (205 sites) | The one genuinely large reuse in the inventory |
| A vector cross / dot / normalize | `THREE.Vector3.crossVectors` / `.dot` / `.normalize` for the SCENE; the THREE-free `vg*` twins for the GATE | D1 — the twins exist so the gate can run headless, not because THREE is inadequate |
| A slider, a slider panel, or per-state row visibility | `show_sliders` + `visible_controls` (100 / 37 sites) | Rule 31 muscle memory: a shared slider keeps its screen position across states |
| A ⚙ teacher-widget declaration | Rule 39f auto-discovery | Fleet-wide and automatic since 39g. Follow the discovery conventions (inline `position:fixed` dynamic panels, `class="pm_hud"` statics, `<prefix>_<name>_row` slider rows) and it is inherited free |
| A label | `createLabelSprite` / `createWideLabelSprite` (340 / 60) | And remember they are Rule 34c's third text path — an ASCII→Unicode sweep that skips them is a sweep of one third |
| A frozen-frame determinism story | `SET_TIME_FREEZE` (124 sites) + D3 | Byte-identical pins are a fleet guarantee, not a per-scenario feature |
| A surface of revolution | — | Out of scope. And note `LatheGeometry` is **0** while `CylinderGeometry` is **106**: when #8 is scheduled, its disc stack needs no new geometry class (§ledger 1) |

### <a id="ledger"></a>What this build deliberately does NOT do (the alarm-rule ledger)

The alarm rule: *a later concept forcing an engine edit means Phase 0 under-generalized.* These are
declared **now** so that if they are built later it is a scheduled decision, not an alarm.

1. **`solids_of_revolution` (#8) — EXCLUSION CONFIRMED, GROUNDS CORRECTED (AMENDMENT A7).**
   **Read this box; the paragraph beneath it is the superseded 0a reasoning, kept to show the
   correction.** Act III was explicitly invited to refute the exclusion and **dissolved both stated
   blockers**, then confirmed the exclusion on a better reason:
   - **Blocker (a), the missing evaluator → CLOSED IN FAVOUR OF A CLOSED ENUM, and the argument is
     the GATE, not the cost.** Four families cover every named board's exercises — `power`
     (`a·xᵖ + c` ⇒ line / parabola / √ / reciprocal / cubic), `circle_arc` (the sphere), `sin`, `exp`.
     **Every member has an analytic `∫f² dx`, so the gate asserts the shipped volume against a closed
     form to 1e-12.** An evaluator forces numeric quadrature, which **cannot distinguish an engine bug
     from quadrature error — on the one number the concept exists to produce.** Secondary: an unknown
     enum family **throws**, where an evaluator silently draws the wrong curve (`patterns/mathematics.md`
     hazard 2, *a valid default is more dangerous than one that throws*).
   - **Blocker (b), the ticked 2D frame → CLOSED; it is NOT the `cartesian_plane` duplicate.**
     `cartesian_plane`'s cost is a **data↔pixel transform registry** plus a 2D primitive family, and
     **neither transfers: in a 3D scene, math units ARE world units and there is no transform to
     build.** What is actually built is two `ArrowHelper` axes + tick segments + numeric sprites (545
     fleet precedents, 0 Rule-40a hits). The panel-split alternative is **dead by measurement** —
     `grep -c panel_b src/scripts/build_review_site.ts` → **0**. And the clincher is pedagogical:
     **the region that spins must BE the region the frame ticks**, or the concept's claim dies at the
     panel boundary.
   - **THE REAL REASON IT IS SEPARATE: disjoint geometry.** The shared *build* is one scenario shell.
     **There is no `F12 = F7` identity between a parallelepiped and a disc stack** — which is precisely
     the identity that makes #7 and #9 one purchase. Bundling buys nothing.
   - **CONSEQUENCE — #8 is NOT blocked.** It is **schedulable now at two dispatches** (SR-A: shell +
     profile enum + frame + region mesh + HUD + log-n ramp + `deriveStateMeta`; SR-B: θ-sweep via
     `setDrawRange` + disc/ring stack with a **published** volume sum + axis selector), with its own
     12-section `check:solid-of-revolution` gate, every section negative-controlled.
     `CylinderGeometry` 106 / `LatheGeometry` 0 confirmed; `capRamp` @6678 and `acgThetaArc` @26055
     are the clone targets.

   *(Superseded 0a reasoning follows.)* Excluded on measurement, not preference.
   Its distinctive half needs (a) an **authored profile function**, which `field_3d` cannot evaluate
   (Correction 2) — resolvable cheaply by a **closed profile enum** (`line`, `parabola`, `sqrt`,
   `sin`, `reciprocal`, `circle_arc` with numeric coefficients, the `MG_MOLECULES` table pattern),
   which covers every solid-of-revolution exercise on every named board and needs **no** evaluator;
   and (b) a **ticked 2D coordinate frame** beside the solid, so the region and the solid are legible
   together under Rule 33 — which is **`cartesian_plane`, just bought on `parametric_renderer.ts`
   across four dispatches.** Rebuilding it in `field_3d` is the exact duplicate Rule 40a exists to
   catch. **Marginal cost when scheduled: one dispatch for F16–F18 on this same scenario shell, plus
   a founder ruling on how the 2D frame and the 3D solid share a screen.** `LatheGeometry` is **not**
   needed — a disc stack is `CylinderGeometry`, of which there are already 106.
2. **A general expression evaluator in `field_3d`.** A fleet-wide Rule-40 platform change across 60
   scenarios. Nothing in #7 or #9 needs it. If #8 ever chooses evaluator over enum, that is its own
   Phase 0.
3. **Teacher-draggable vectors (grab a vector head and move it).** There is a standing OPEN directive
   asking for exactly this as a **reusable** field_3d primitive
   (`teach_field3d_explore_grab_and_move_field_point`, `alex:architect`, OPEN). It is the right
   long-term shape and it is explicitly **not** smuggled into a mathematics scenario — building a
   per-scenario drag is how a fleet-wide primitive fails to get built. Sliders serve S8/S9 today.
4. **The frame-rate-dependent camera ease** (`lerpSpherical`, `t = 0.05` per rendered frame). A
   Rule-40 platform defect shared by all 60 scenarios and a **scar row candidate**, not a mathematics
   fix. But #7's S4 pacing depends on it, so it is an **open founder decision** (§open 3), not a
   silent ledger entry.
5. **Camera TARGET authoring.** `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`
   is OPEN [MAJOR, `field3d_surgeon`]: a concept can author `camera_position` but never the camera
   target. Every state here is centred on a common origin, so it does not bite — recorded so that if
   a later state wants an off-origin focus it is known to be a purchase.

---

## <a id="camera"></a>The camera contract — the screen-truth invariant

Handoff §6 is the deepest finding of the stopped round. It was independently verified twice and it
applies to **every** concept in this wave. It is **carried, not re-derived** — and generalised, because
the walk above found the same failure in a second geometry.

**The measured failure.** At the originally authored pose (azimuth 35°, elevation 30°):

| true angle `a^b` | renders on screen as |
|---|---|
| 30° | 44.5° |
| 45° | 73.9° |
| **90°** | **125.2°** |
| 120° | 142.0° |

At **θ = 35°**, `proj(b) = (0.000, −0.500)` and `proj(a×b) = (0.000, 0.866)` — **exactly 180° apart,
one screen line.** Two vectors perpendicular in 3D draw as one.

**The theorem.** `b` goes screen-collinear with `a×b` at exactly **θ ≡ camera azimuth (mod 180°)**,
because the screen-right basis vector `r = û × ẑ` lies in the swept plane. An exhaustive search over
azimuth ∈ [−90°, 90°] × elevation ∈ [5°, 85°] found **ZERO feasible fixed poses.**

**The solution, verified numerically.**
- **Elevation 70°** (near-perpendicular to the a–b plane) for any state claiming an in-plane angle:
  max error **3.47°** over θ ∈ [20°, 160°] — a true 90° renders as **93.3°**, against 125.2° before.
- **S4 tilts elevation 70° → 30° with azimuth FIXED.** The tilt *is* the reveal that a third dimension
  exists, and holding azimuth constant means the collinearity condition is never crossed.
- ~~**For a full-range sandbox slider: live-follow azimuth = `(θ + 90°) mod 360°`** … measured minimum
  screen separation **90.0°**.~~ **⛔ FALSIFIED 2026-08-08 by 0b (AMENDMENT A1) — DO NOT BUILD.**
  That figure was measured on **one pair** (`b` vs `a×b`). Over all three pairs the rule returns
  **0.00° at θ=90°, tilt=0**: `a` and `a×b` collapse to one screen line, in the state that claims they
  are perpendicular. It is the **third** occurrence of the scar this section exists to prevent, and it
  was committed *inside* the fix. Act I also proved **no continuous azimuth-only rule can exist** —
  continuity forces a sign change.
  **REPLACEMENT, measured over 8 181 poses across the full slider product:** put the camera at
  **`R · normalize(â + b̂ + ĉ)`** — the direction equally inclined to all three arms, so no arm can
  align with another on screen. **Min pairwise separation 18.9°, min arm 12.9e-3**, and both worst
  cases are honest rather than hidden (at θ=160° two arms *should* read near-antiparallel).

### The invariant, generalised for the whole wave

> **PROJECTION PRESERVES NEITHER ANGLE, NOR COLLINEARITY, NOR INTERSECTION.** Therefore, in every
> state of every concept in this wave:
>
> 1. **The camera is scored PAIRWISE** over every rendered pair of directed objects — never
>    per-object. A per-object foreshortening margin **passes vacuously** on the real
>    `b`/`(a×b)` collinearity (measured `sepDeg = 0.51` at θ=35°/az=35°/el=30°) while the pairwise
>    metric correctly flags it.
> 2. **The camera azimuth (mod 180°) lies outside every θ range the state sweeps**, and away from
>    0° / 180°.
> 3. **Every geometric claim carries a NUMERIC readout computed in 3D** — perpendicular, parallel,
>    zero, equal, and (new, from #9) **non-intersecting**. Two skew lines always project to
>    intersecting lines; the shortest-distance number is what makes "they do not meet" true on screen,
>    and drawing the common perpendicular turns the gap from an absence into an object.
> 4. **(AMENDMENT A2, from #8) Projection does not preserve SHAPE either.** A circle draws as an
>    ellipse under any oblique camera, so *"every slice is a circle"* is false on screen at the pose
>    that makes the solid readable. Remedy measured by Act III: camera 15° off-axis
>    (aspect `cos 15° = 0.9659` — legible as a circle, and the solid keeps its depth) with the claim
>    carried by a 3D-computed `face area = 3.1416`.
>
> **Three instances of ONE class in one wave — collinearity (#7), intersection (#9), shape (#8) — so
> state the general form and stop enumerating: PROJECTION PRESERVES NOTHING. Any claim a state makes
> about 3D geometry is carried by a number computed in 3D; the picture's job is to make the number
> believable, never to be the evidence.** The gate measures in **perspective**, never orthographic
> (`orthographic_separation_metric_underpredicts_perspective_overlap`, OPEN).
>
> This **replaces** the per-vector foreshortening invariant, which is the already-filed MAJOR OPEN
> scar `camera_metric_scored_foreshortening_not_pairwise_screen_separation` — whose own prevention
> rule states it exactly: *"an occlusion metric must be PAIRWISE over every rendered pair, never
> per-object… when a measurement is introduced to prevent a defect, check that the thing it measures
> is the thing that failed."*

---

## <a id="queue"></a>The live `engine_bug_queue` consultation — mandatory, and it was the trap last time

Run 2026-08-08 with `.env.local` present. **`engine_bug_queue` holds 886 rows, 343 OPEN/DEFERRED**, of
which **102** attach to the 76 concepts that render on `field_3d`.

**⚠ A blind spot in the tool, found by this consultation and worth fixing.** `--field3d` derives its
concept-id list **from the files in `src/data/concepts/`**, so a row filed against a concept that has
not been authored yet is **invisible to that flag**. All four rows the handoff §7 named came back
`MISSING` from `--field3d --open` and had to be fetched by direct query. This is the same class as the
scar already recorded in that script's own header (a hand-maintained 22-id array that was blind to 52
concepts) — **derived-from-files is better than hand-maintained and still not complete.** For a
Phase-0 survey of an unauthored concept, `--field3d` is **not** coverage; query the table directly.

**The four rows the handoff named, re-verified live** (two of the four are attributed differently
than the handoff says — worth knowing before routing anything):

| Row | Severity / status | Owner | Concepts |
|---|---|---|---|
| `camera_metric_scored_foreshortening_not_pairwise_screen_separation` | MAJOR / OPEN | **`alex:json_author`** (not the surgeon) | `hydrogen_bonding`, `vsepr_molecular_shapes` |
| `camera_solve_searched_in_one_axis_hides_the_feasible_region_in_the_axis_held_fixed` | MAJOR / OPEN | `peter_parker:field3d_surgeon` | `bond_polarity_dipole_moment` |
| `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius` | **CRITICAL** / OPEN | `peter_parker:field3d_surgeon` | `atomic_and_ionic_radius`, `ionisation_enthalpy` |
| `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` | MODERATE / OPEN | `alex:architect` | `unit_circle_to_sine_wave` |

**The schema floor, re-verified in code:** `questions: z.array(quizQuestionSchema).min(6)` at
`src/schemas/conceptJson.ts:328`. The stopped round's skeleton specified 4 — the **second** occurrence
of that class. **Every skeleton in this wave authors ≥ 6 assessment questions.**

**Further OPEN rows that bear directly on this wave**, from the live sweep:

- `field3d_explore_camera_fixed_while_its_own_dials_span_two_orders_of_radius` [CRITICAL] — **#7's S8
  and #9's S9 are exactly this shape:** an explore sandbox whose own sliders (`a_mag`, `b_mag`,
  `lambda_span`, `half_extent`) change the rendered extent substantially under one authored camera
  distance. Design the explore camera against the **slider range**, not the default.
- `field3d_sprite_label_text_and_ink_box_are_invisible_to_every_dom_probe` — what a 3D sprite label
  *says* and where its ink *lands* is unreadable by THE EYE and by `founder_drive`'s DOM probe. This
  wave's labels (`a`, `b`, `a×b`, `n`, `d₁`, `d₂`) are all sprites.
- `field3d_world_space_label_decollision_is_projection_blind_and_collides_on_screen` — a world-space
  minimum-separation pass proves nothing about the screen. The same lesson as §camera, for text.
- `field3d_sliders_panel_top12_vs_fsbtn_top10` — every `#*_sliders` DOM panel at `top:12` collides
  with the review chrome. Rule 34d: the panel must clear `top:52px`.
- `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` [MAJOR] and
  `biot_state6_dotcross_lesson_not_rendered` [CRITICAL] — **`field_3d` never paints
  `scene_composition` annotations.** Every teaching string must live on a rendering path: the state
  label, `formula_overlay`, the caption, a `tts_sentences` entry, or a real primitive. Both rows are
  the same defect and one of them is *literally about a dot/cross lesson*.
- `orthographic_separation_metric_underpredicts_perspective_overlap` — the occlusion solver projects
  orthographically while `field_3d` renders perspective, so it can only ever be optimistic. The
  pairwise gate (D7) must use the **perspective** projection.

---

## <a id="eye"></a>Handoff §2 — RESOLVED

**The question.** The engine desk's `npm run visual:eyes -- parallel_currents_force` returned
**46/56, 10 failures**, against a recorded reference of 56/56. The failures were never diagnosed. The
handoff ranked three candidate causes: (1) H2 stale baselines, (2) a genuine shared-glue regression
from the surgeon's 2 shared lines, (3) pre-existing drift unrelated to the work.

**What was measured.** Two things, both $0.

1. **Local `master` was 6 commits behind `origin/master`, and 4 of the 6 touch
   `field_3d_renderer.ts`.** The Build Plan's standing rule — *"sync before you measure; a baseline
   from a stale tree is a false tripwire"* — was live and unnoticed. Fast-forwarded `ad569ae` →
   `dfca9cf` before measuring anything.
2. **THE EYE re-run on that clean master, carrying ZERO of the surgeon's diff:**

```
📊 56 deterministic checks · 43 passed · 13 failed · $0.00
```

**The result decides it.** Master alone is **worse** than the engine desk (13 failures vs 10), and
**all 13 are `H2 / VISUAL_REGRESSION`** — not one functional gate failed:

```
STATE_1__frozen 2.35%   STATE_2 3.03%   STATE_2__frozen 2.73%   STATE_3 2.44%
STATE_3__frozen 3.53%   STATE_4 3.69%   STATE_4__frozen 3.57%   STATE_5 2.49%
STATE_5__frozen 2.46%   STATE_6__frozen 3.08%   STATE_7__frozen 2.70%
STATE_9 3.04%           STATE_9__frozen 3.05%                    (tolerance 2.0%)
```

**And every passing state is drifting too** — STATE_1 1.49%, STATE_6 1.85%, STATE_7 1.33%,
STATE_8 1.14%, STATE_8__frozen 1.65%. **Not one frame in the concept is at 0.00%.** That uniform
1–4% spread across *all* states is the signature of accumulated vintage; a functional regression in
one mechanism leaves most states byte-identical and spikes a few.

**The cause, measured:** `visual_baselines/parallel_currents_force/` was approved by `d220252` on
**2026-07-05**, and **199 commits have touched `field_3d_renderer.ts` since.** The "56/56" reference
is a 2026-07-05 number that has not described master for a month.

**Conclusions.**
- **The surgeon's diff is exonerated.** Candidate (2) is dead: the failures reproduce in full, and
  worse, with none of that diff present.
- **Candidates (1) and (3) are the same thing and are confirmed:** H2 stale baselines of a
  199-commit vintage.
- ~~**⚠ A standing fleet condition the founder should see.**~~ **⛔ MY INFERENCE WAS WRONG — MEASURED
  AND CORRECTED 2026-08-08.** I wrote that *"for any concept of that vintage the H2 gate is currently
  reporting noise, not signal"* and recommended a founder re-baseline sweep. **The founder authorised
  one EYE run to size it, and the run falsified the claim.**

  `coulombs_law` — **the same 2026-07-05 approval commit**, the same 199 intervening
  `field_3d_renderer.ts` commits, a different scenario family — returns **50/50, ZERO failures**:

  | | `coulombs_law` | `parallel_currents_force` |
  |---|---|---|
  | approval | `d1becfe`, 2026-07-05 | `d220252`, 2026-07-05 |
  | result | **50/50, 0 failed** | 43/56, **13 failed** |
  | H2 drift range | **0.16 % – 1.49 %** | 1.14 % – **3.69 %** |
  | frames at 0.00 % | 0 of 16 | 0 of 56 |

  **What is actually true, stated at the precision the measurement supports:**
  1. **General vintage drift is real** — *no frame on either concept is at 0.00 %*; 199 renderer
     commits moved pixels fleet-wide, exactly as expected.
  2. **It is SMALL and well inside tolerance.** `coulombs_law` peaks at 1.49 % against a 2.0 % gate.
     **The H2 gate is working, not reporting noise.**
  3. **`parallel_currents_force` carries ~2.5× EXCESS drift over its own cohort**, and that excess is
     *not* explained by vintage.

  **So: NO fleet re-baseline sweep is warranted, and re-baselining `parallel_currents_force` would be
  the wrong move — it would bake in whatever is causing the excess.** That concept deserves a look
  before it is re-approved.

  **This is the trap in §traps, and I walked into it myself.** I inferred a fleet-wide condition from
  a single concept and proposed the remedy — a blanket re-baseline — that would have *erased the
  signal*. One $0 run, which the founder authorised rather than accepting the inference, was enough to
  falsify it. **The lesson is the same one this whole document is about: "probably vintage" is a
  hypothesis, and the cheapest possible measurement outranks it.** The surgeon's exoneration above is
  **unaffected** — that was measured on a zero-diff tree, not inferred.

---

## <a id="desk"></a>The fate of the two open desks — recommendation

Both desks exist, neither has a PR, nothing is on master.

| Desk | Branch | Contents | Recommendation |
|---|---|---|---|
| `Physics-mind-field3d-vector-products-scenario` | `feat/field3d-vector-products-scenario` | 626 insertions: the scenario, `deriveStateMeta` +40, `check:vector-products` (512 lines, 64 assertions, 8 negative controls), the seed script | **KEEP and WIDEN.** Do not discard |
| `Physics-mind-mathematics-vectors-3d` | `feat/mathematics-vectors-3d` | `docs/skeletons/vector_products_in_space_skeleton.md` (untracked, 509 lines + a cycle-1 amendment) | **KEEP as INPUT to 0b, not as the skeleton.** Its 8-state arc and the four design decisions in §walk carry forward; its Checkpoint-A cycle budget is spent, and the restart resets it cleanly |

**Why keep the engine desk, stated as reasons rather than sentiment.**

1. **The expensive part is the gate, and the gate is scenario-shaped, not concept-shaped.**
   `check:vector-products` is 512 lines / 64 assertions / **8 negative controls, each confirmed to
   fail its target defect first**. Everything it asserts about `vgSub`/`vgCross`/`vgParallelogramVerts`
   /`vgProjectPoint` is equally true under the wider `mode` enum.
2. **Its single best assertion is a fleet-wide scar mechanised**, and it must survive any rebuild:
   > a per-object foreshortening margin **passes vacuously** on the real `b`/`(a×b)` collinearity at
   > θ=35°/az=35°/el=30° (`sepDeg = 0.51`), while the **pairwise** metric correctly flags it.
3. **The helpers transfer to #9 essentially verbatim** — D2 above: a plane patch *is*
   `vgParallelogramVerts` translated, and the skew common perpendicular *is* `vgCross`.
4. **Its `deriveStateMeta` registration is the field_3d scar checklist's first item, done right.**
5. **The one blocking objection has evaporated** — §eye.

**What must change before it lands (the three conditions).**
- **Rename** `scenario_type` to `vector_geometry_3d` and add the `mode` enum (§naming). Non-negotiable
  and only free now.
- **Widen** to F11–F14 (line, plane, foot-of-perpendicular, intersection marker) so #9 is pure JSON.
- **Re-verify on a synced base.** The desk sits on `0d6df82`; `origin/master` is `dfca9cf`. Merge
  master into the desk, re-run the verify chain, and **re-run `check:vector-products` with all 8
  negative controls firing** — a gate that has not failed since its base moved is not known to work.

**One provenance defect to fix.** The desk's seed script was **already run**, so
`engine_bug_queue` currently carries `field3d_no_generic_two_vector_scenario` at status **FIXED** —
for a scenario that **does not exist on master**. The queue is asserting a fix the product does not
have. Reconcile it in the same change that lands the scenario (or reopen the row until it does).

---

## <a id="arc"></a>THE CHAPTER ARC — the storytelling contract (founder directive, 2026-08-08)

**Founder instruction:** *"while creating simulation, it should be like a storytelling. It simulation
should have a continuation really well."*

This section is **binding on every architect dispatch in this wave** and is handed to all three
identically. It exists because chapter continuity cannot be discovered by three agents working
independently — it has to be declared once, by the dispatching session, and then obeyed.

### The one-sentence chapter story

> **A vector is an arrow. This chapter is about what arrows DO: what two of them MAKE (#7), what they
> LOCATE (#9), and what a shape BECOMES when one sweeps it (#8).**

### The three acts, and the hand-off sentence between them

| Act | Concept | The question it answers | Hands to the next act |
|---|---|---|---|
| **I** | **#7 `vector_products_in_space`** | *"I can add two vectors. Can I multiply them?"* — and the answer is TWO different products: one gives a **number** (how aligned), one gives a **VECTOR** (perpendicular to both). Their sizes are an **area** and a **volume**. | The parallelogram of S5 and the perpendicular `a×b` of S4 are exactly what Act II needs: **a patch of a plane, and the normal that defines it.** |
| **II** | **#9 `lines_and_planes_in_space`** | *"Vectors made shapes. Can they give me an ADDRESS?"* — a point plus a direction is a line; a point plus a normal is a plane. Everything after that is **how far apart** things are. | The plane region of Act II is the flat thing Act III spins. And Act II's "shortest distance" is measured with Act I's cross product. |
| **III** | **#8 `solids_of_revolution`** | *"A flat region has an area. What happens if I SPIN it?"* — it sweeps a solid, and the volume is the area idea done infinitely many times. | Closes the chapter: Act I got one volume from three arrows (the triple product). Act III gets **any** volume from one curve. |

### The continuity rules — mechanical, checkable, not vibes

These are what make it read as one chapter rather than three files that happen to be adjacent.

1. **ONE apparatus family across all three concepts.** The same origin marker, the same axis triad,
   the same arrow style and colour language, the same readout panel position. A teacher moving from
   #7 to #9 must recognise the workspace instantly (Rule 32d home-pose continuity, promoted from
   per-concept to per-CHAPTER).
2. **ONE colour language, declared once and never re-assigned.** `a` / first direction · `b` /
   second direction · `c` / third · the derived object (`a×b`, the normal, the axis of revolution) ·
   the measured region (parallelogram, plane patch, swept region). A colour means the same **role**
   in all three concepts. Architects declare their mapping against these five roles and may not
   invent a sixth.
3. **ONE camera language.** Every state authors `camera_position`; every camera obeys the
   §camera screen-truth invariant; and the **camera tilt means one thing only across the chapter —
   "there is a dimension you have not seen yet."** It is spent on #7 S4 and re-used deliberately, never
   decoratively.
4. **Notation ladder is CHAPTER-wide, not concept-wide (Rule 38c).** `a·b` and `a×b` are introduced in
   #7 and are then **assumed**, never re-taught, in #9. `∫` appears only in #8's advanced ring. No
   concept may introduce a symbol an earlier act already owns under a different name.
5. **Every act opens by re-showing the last thing the previous act built.** #9's S1 opens on a plane
   patch the student saw as #7's parallelogram; #8's S1 opens on a plane region the student saw as
   #9's plane. **This is the "continuation" the founder asked for, made mechanical:** the first frame
   of each concept is a frame the student already recognises.
6. **Each concept's own arc is a single continuous motion story, not a slideshow.** Rule 31 already
   requires one idea + one complete motion per state and a distinct declared archetype per state;
   the chapter adds: **the state-to-state hand-off must be narratable in one sentence** ("we know the
   cross product points perpendicular — so how long is it?"). The architect writes that sentence in
   the control table as a **`→ hand-off`** column. A state whose hand-off sentence is "and now,
   separately," is a slideshow state and must be re-designed or merged.
7. **The prerequisite floor is honest.** Carried from the handoff §5, re-verified: `unit_vector`,
   `vector_resolution` and `dot_product` are **NOT shipped product** (no `visual_baselines/` entry,
   absent from `PILOT_CONCEPTS`; `dot_product` even names a `panel_b` that renders nowhere).
   **`scalar_vs_vector` IS baseline-locked.** So the chapter may lean on `scalar_vs_vector` and must
   otherwise **teach its own foundation** — Rule 25 no-untaught-term applies with no rescue from a
   prerequisite the student cannot actually have seen.

### What the arc must NOT become

- **Not a dependency chain that blocks.** Rule 23: prerequisites are advisory. A teacher opening #9
  first must still get a complete lesson — the callback in rule 5 is a *recognition*, not a
  requirement. Every concept stands alone.
- **Not three concepts that share a state.** Continuity is apparatus, colour, camera and notation.
  If two concepts teach the same beat, one of them has a filler state.

---

## 0b — DEEPEST-CONCEPT DESIGN (next step, NOT started)

**The deepest concept is #9, `lines_and_planes_in_space`, and that is a change from the stopped
round.** #9 consumes **13** of the 15 in-scope features against #7's **11**, and it owns every feature
that is unique to one concept on the #9 side (F11, F13, F14) plus the *only* newly-discovered screen
trap (skew lines projecting as intersecting). #7 **ships first**; #9 **specs the engine.** That is the
`cartesian_plane` precedent applied exactly (#1 shipped first; #3 specced the engine) and the
chemistry precedent before it (`hydrogen_bonding` shipped first; the wave was specced on the lattice).

0b produces: the full architect skeleton for **#9**, the exact vector forms (point–plane distance
`|n·(p − a)| / ‖n‖`; skew distance `|(a₂ − a₁)·(d₁ × d₂)| / ‖d₁ × d₂‖`; the `d·n = 0` no-intersection
case), a per-state camera solve against the §camera invariant, and **a re-run of the §walk against
real states.** Then **founder_proxy Checkpoint A** on it.

**The recorded reason to run a 0b at all**, from the predecessor: *"#3's 0b surfaced ten contract
changes its sketch missed."* Sketches are not skeletons.

## 0c — ENGINE ONCE (planned, NOT dispatched)

Three dispatches to **`field3d-surgeon`** (`peter_parker:field3d_surgeon`), sequential, **one
`bug_class` each**, each landing on **master separately and immediately** (Rule 40), each inside the
~100-tool-call ceiling.

| Dispatch | `bug_class` | Builds | Gate sections |
|---|---|---|---|
| **VG-A** | `field3d_has_no_generic_two_vector_scenario_so_every_vector_claim_is_hardcoded_per_physics_scenario` | F1, F3–F9: the scenario shell under the **new name**, the `mode` enum, the THREE-free helpers, two vectors + angle arc + cross vector + readouts, `deriveStateMeta` registration | 1–5, 11 |
| **VG-B** | `field3d_cannot_draw_a_live_quad_or_solid_from_two_arbitrary_vectors` | F7, F8: the parallelogram quad and the parallelepiped, per-frame, `transparent` + `DoubleSide`, adjacent faces sharing edge vertices so the solid closes by construction | 6–7, 12 |
| **VG-C** | `field3d_cannot_draw_a_line_or_plane_in_space_or_the_distance_between_them` | F11–F14: extended line + λ marker, plane from point + normal (via D2's shared quad), foot of perpendicular, common perpendicular, intersection marker with its no-intersection case | 8–10, 13 |

**Mandatory in every dispatch** (pre-paid scars, stated in the prompt so the agent executes rather
than re-derives): D3 no accumulation · D8 no new per-state field · `deriveStateMeta` in the SAME
change · `npm run check:renderer-syntax` **and** `check:renderer-backticks` after every edit (the
renderer body is one template literal — a backtick in a comment terminates it) · sprite labels are
Rule 34c's third text path · `#*_sliders` panels clear `top:52px` · **no teaching string in a
`scene_composition` annotation** (field_3d never paints them) · Rule 41 plain language on every
rendered string · and **the diagnosed root cause named up front with an explicit invitation to refute
it** (the standing Ch.6 lesson: the failure mode to design against is an agent that is wrong *and*
deferential).

### The gate — `npm run check:vector-geometry-3d` ($0, headless, no browser)

The engine desk's `check:vector-products` renamed and extended. Modelled on `check:sigma-pi` /
`check:cartesian-plane`: pull the shipped function bodies out of `FIELD3D_RENDERER_CODE` by brace
matching, run them in node, assert against values solved **independently of the renderer**. **Every
section carries a negative control** — the deliberately-broken behaviour, asserted to FAIL — because
a gate that has never failed is not known to work.

| § | Asserts | Negative control |
|---|---|---|
| 1 | `vgCross`/`vgDot`/`vgLen`/`vgNormalize` against closed forms at 20 sampled `(θ, φ)` pairs, to 1e-12 | A sign-flipped cross component must fail |
| 2 | `a·(a×b) = 0` and `b·(a×b) = 0` to 1e-12 for every sampled pair — **the arithmetic S4 displays** | A cross built from a non-orthogonal basis must fail |
| 3 | `\|a×b\| = \|a\|\|b\| sin θ` and `a·b = \|a\|\|b\| cos θ` across θ ∈ [0°, 180°] incl. the obtuse regime | A `\|sin θ\|`-clamped magnitude must fail on θ > 90° |
| 4 | Vectors built from `(a_mag, b_mag, theta_deg, b_tilt_deg)` reproduce the authored angle to 1e-9 | A `b_tilt` that silently no-ops must fail |
| 5 | `deriveStateMeta` returns `reveal_ms + cushion` for every guided state and `interactive` for the explore state | A state with no `vg` block defaulting to 1500 ms must fail |
| 6 | `vgParallelogramVerts` area equals `\|a×b\|` to 1e-12; winding is consistent; the quad is planar | A quad built as `[0, a, b, a+b]` (crossed) must fail |
| 7 | `vgParallelepipedFaces`: 8 distinct corners, 6 faces, **every edge shared by exactly 2 faces** (the solid closes by construction), volume equals `\|a·(b×c)\|` to 1e-12 | A face built from an independent corner formula must fail the shared-edge count |
| 8 | Point→plane distance equals `\|n·(p−a)\|/‖n‖`; the foot lies **on** the plane to 1e-12 | A distance using the un-normalised normal must fail |
| 9 | Skew-line distance equals `\|(a₂−a₁)·(d₁×d₂)\|/‖d₁×d₂‖`; the common perpendicular is orthogonal to **both** directions to 1e-12; the parallel case (`d₁×d₂ = 0`) is detected, never divided by | A parallel pair reaching the skew formula must fail (division by zero / NaN) |
| 10 | **D5:** line ∩ plane with `d·n = 0` yields **no** marker and a "no intersection" readout; with `d·n ≠ 0` the point satisfies both the line and the plane equation to 1e-12 | A clamped/fallback marker position must fail |
| 11 | **Fleet safety:** every scenario other than `vector_geometry_3d` produces byte-identical emitted template output vs `HEAD~` | Touching a shared line must change it |
| 12 | **D2 identity:** the plane-patch path and the parallelogram path produce identical vertices for a shared input | Two independent quad builders must fail |
| 13 | **D7 / §camera, pairwise — REWRITTEN BY AMENDMENTS A1 / A2 / A6.** At θ=35°/az=35°/el=30° the pairwise screen separation of `b` and `a×b` is **≤ 1°** (the real failure, reproduced), while the per-object foreshortening margin **passes vacuously** at `sepDeg = 0.51`; at el=70° a true 90° projects to **93.3° ± 0.5°**; the explore camera `R · normalize(â+b̂+ĉ)` holds **min pairwise ≥ 18.9°** over the full slider product — ***NOT* the falsified `az = (θ+90°)` rule, and *NOT* 90.0° (A1)**; two skew lines' screen images are asserted to **CROSS** while their 3D distance is nonzero; a circle's projected aspect at the authored pose is asserted **≥ 0.96** (A2). Scored **PAIRWISE over every rendered pair**, in **perspective**, never orthographic. **Plus (A6): an EXEMPT-PAIR list** — pairs parallel *by design* (`d₁×d₂` vs the common perpendicular reads 0.00° and is CORRECT) — **and a screen-LENGTH floor**, since a pairwise angle cannot see foreshortening | **Three, all required.** (a) A per-object metric scored alone must PASS where the pairwise one fails — so the vacuous-pass is *proved*, not assumed. (b) **The falsified `az = (θ+90°)` rule must FAIL at θ=90°, tilt=0** — the gate carries its own history so the rule cannot be re-derived. (c) A gate with no exempt-pair list must FALSE-fail the by-design parallel pair — the defect that gets a real gate switched off by whoever meets it first |

**Exit criteria for 0c:** gate green with **all negative controls firing** · `check:renderer-syntax` +
`check:renderer-backticks` clean · `tsc` 0 · `validate:concepts` **151 PASS / 0 FAIL out of 151
atomic files** (measured on `dfca9cf` 2026-08-08 — note commit `9394694`'s message records "152",
which is the total-file count, not the atomic-pass count; use 151, and re-measure rather than quoting
a commit message) · `validate:chemistry` 10/10
· `validate:mathematics` PASS · `npm test` green · **and THE EYE returns every baseline-locked
`field_3d` concept unchanged relative to a same-day pre-change run** — note **relative**, not against
the approved baselines, until the vintage in §eye is resolved.

## 0d — THE CONCEPT DESKS (pure JSON)

One desk per concept, in order **#7 → #9**, each `feat/mathematics-<concept>`, opened only after
VG-A…VG-C are on master. **Success test: #9 requires ZERO renderer edits.**
**⚠ Alarm rule:** a later concept forcing an engine edit means this survey under-generalized — stop,
re-scope with the surgeon, and amend this document. Never extend the engine per concept.

---

## <a id="risk"></a>The fleet-safety measurement (why a new `scenario_type` is safe)

A new `scenario_type` is **additive by construction**: 60 existing scenarios dispatch on their own
string and none of them can reach a case that did not exist. The blast radius is therefore confined to
**shared glue** — and the stopped round touched exactly two shared lines (the `scenario_type` union
terminator and the `#sliders` NOT-list condition), which is the correct order of magnitude and is what
gate section 11 exists to bound.

**81 concepts are baseline-locked** (`ls visual_baselines`). The regression check is gate section 11
(byte-identical emitted template for every other scenario) plus a relative EYE sweep, and it is the
cheapest possible proof that a shared-engine edit did not move the fleet.

---

## <a id="traps"></a>The two traps, carried forward

Both are from the handoff §7. They are reproduced here because this is the document a future session
will read, and neither has been discharged by anything above.

**Trap 1 — `[LIVE]` has two meanings, and only one is a costing basis.**

| Meaning | Archetypes | Safe to cost against? |
|---|---|---|
| **Proven by shipping** — a concept runs on it today | A (`cartesian_plane`), B (`locus_trace`), C (unit circle) | **Yes** |
| **Proven by code-reading** — primitives exist, nothing ever wired end-to-end | **D**, **E**, and now **F** | **No** |

The *maths* was reusable; the *wiring* was not. **Never schedule a concept into a "no new engine" tier
on a code-read tag** — build one throwaway state on the archetype first, or price the wiring in.
Correction 1 above shows how the tag survived scrutiny for as long as it did: a composite grep summed
three unlike symbols and only one of them was ever large.

> **ACTION — `docs/patterns/mathematics.md` needs an edit this survey does not make.** Archetype **D**
> is still tagged `[LIVE — reuse, verified 2026-08-04]` and **E** `[LIVE — reuse]`. Both are
> **[NEEDS-SCENARIO]** by this survey's measurement, and **F** should carry the same F15/F20 note. The
> ranked list was corrected on 2026-08-08; the pattern file was not, and it is the file the architect
> reads. → §open 4.

**Trap 2 — a check that measures the wrong thing passes vacuously.** Generalised into the §camera
invariant and mechanised as gate section 13. The reason the architect walked into it is worth
repeating: **it could not query the live queue from a read-only desk.** Copy `.env.local` into any
desk that dispatches work needing it, and treat the static mirror in `docs/patterns/mathematics.md` §4
as what it is — of its 12 hazards, exactly **one** touches `field_3d`, and only to say `min_ring` is
inert.

---

## OPEN DECISIONS — founder

1. **The engine desk: keep-and-widen, or rebuild?** §desk recommends **keep**, under three conditions
   (rename, widen to F11–F14, re-verify on a synced base). Rebuilding discards a 512-line gate with 8
   confirmed negative controls to re-derive the same helpers. **Recommended: keep.**
2. ~~**The scenario NAME.**~~ ✅ **DECIDED by the founder 2026-08-08: `vector_geometry_3d`**, with
   `mode: "products" | "lines_planes"` (§naming). The stopped round's `scenario_type:
   "vector_products_in_space"` — a concept id in a scenario slot — is **retired before it ever
   reaches master**, so no concept JSON will ever declare that it renders as a different concept.
   Rule 40a: 0 hits, nothing collides. **VG-A builds under this name.**
3. **The frame-rate-dependent camera ease** (`lerpSpherical`, `t = 0.05`/frame — §inventory). Three
   options: (a) file the scar and design #7's S4 tilt to tolerate a 2× pacing spread; (b) fix it as a
   separate Rule-40 platform dispatch *before* VG-A, since all 60 scenarios share it; (c) fix it
   inside VG-A — **not recommended**, it is a second `bug_class` and a fleet-wide H2 event.
   **Recommended: (b), as its own small dispatch.**
4. **`docs/patterns/mathematics.md` archetype tags D/E/F** are stale in the direction that caused
   Trap 1 (§traps). A one-line-per-archetype correction, and it is the file the architect reads.
   **Recommended: correct it before 0b dispatches.**
5. **The stale-baseline fleet condition** (§eye). Nine `field_3d` concepts are provably on a
   2026-07-05 approval against 199 subsequent renderer commits, and H2 is reporting noise for them.
   `visual:approve` is founder-only (Rule 17), so this is a report. **The cheap next step is one EYE
   run on a second 2026-07-05 concept** to size the sweep before committing to it.
6. **Does #8 (`solids_of_revolution`) stay excluded?** §ledger item 1. Including F15–F18 now is
   roughly one extra dispatch *plus* an unresolved founder question about how a ticked 2D frame and a
   3D solid share one screen. Excluding it leaves #8 scheduled-but-blocked, exactly as `cartesian_plane`
   left #12. **Recommended: stay excluded, and schedule it as its own small Phase 0 once #7 ships.**
8. ~~**THE CONCEPT ID FOR ACT I**~~ ✅ **DECIDED by the founder 2026-08-08: `vector_products_in_space`.**
   Applied — `src/lib/mathematicsCatalog.ts` was the only divergent site and its two lines are
   corrected (`concept_id` and #9's `prerequisites`), with the reason recorded in place. All sites now
   agree. *The durable fix stands: **a concept-id collision check sweeps the catalog and the
   registries, not only `src/data/concepts/`** — §0a scanned files only, which is why one roadmap row
   held a second name for four days until an architect reading it for prerequisites found it.*
   **One residual staleness, NOT fixed and flagged rather than silently reorganised:** that row still
   sits under the catalog's `── P2 — strong, cheapest available ──` heading, while
   `MATHEMATICS_DISCUSSIONS.md` §6's ⚑ correction moved the concept to **P3 #7**. Moving it changes
   array order (which may drive display order), so it is a deliberate one-line follow-up, not a
   drive-by edit.
9. ✅ **DECIDED by the founder 2026-08-08: #8 STAYS SCHEDULED, `ncert-boundaries.ts` is set aside, and
   the two extra engine dispatches (SR-A/SR-B) are approved.** Queue position unchanged; the design
   was never in question. **One narrow residual, raised once and then proceeding:** Rule 38g lets only
   the CBSE/NCERT column ship `verified: true`, and that is the one cell we now hold in-repo evidence
   against — so **#8's `curriculum_tags` should carry `needs_teacher_verification: true` on the CBSE
   cell too**, rather than the usual "CBSE verified, everything else unverified" shape. That costs
   nothing, blocks nothing, and keeps the tag honest until a teacher settles it. *(Original finding
   below, kept as the record.)*
   **#8's CURRICULUM ROW — our own two documents contradict each other** (AMENDMENT A8).
   `MATHEMATICS_DISCUSSIONS.md` §4 carries #8 at CBSE **F** / JEE **F**; `src/data/ncert-boundaries.ts:269`
   lists **"Area under simple curves"** and nothing about volumes of revolution, while `:273–277`
   independently confirms #7 and #9 at CBSE F. If the boundaries file is right, **#8 is the wave's
   INTERNATIONAL concept** (AP Calc AB/BC · A-level Pure · IB AA HL · ISC) and §0a's "CBSE/JEE/IB-HL
   depth play" framing is **backwards for it**. This changes **no engine decision** — it changes the
   `curriculum_tags`, the Rule-38f audience argument, and where #8 sits in the queue. Both remain
   Rule-38g CLAIMS until a teacher of one of those boards confirms them. **Recommended: correct §4 to
   match the boundaries file, tag every cell `needs_teacher_verification: true`, and note that #8 is
   the one concept in this wave that argues for international breadth rather than home depth.**
11. **⭐ RUN THE UNRUN SEED SCRIPT, THEN RE-RUN THE QUEUE CONSULTATION** (AMENDMENT A20).
    `src/scripts/_seed_engine_bug_queue_explore_state_multi_slider_blind_spot.ts` is authored,
    untracked and **never run**; its two rows state THE WORST-CASE LAW a day before this wave
    re-derived it from five instances, and its second row records that **THE EYE is structurally blind
    to this whole family** (it sweeps only `variable_choreography` variables). Both bear directly on
    gate §13's design. Not run here because it writes a non-cache table with another session's
    unverified content. **Recommended: run it before VG-A is dispatched, then re-run §queue.**
12. **Rule 38g, restated because it now covers two more files.** Every non-CBSE cell in §0a ships
   `needs_teacher_verification: true`. This is the **weakest international-breadth wave** mathematics
   has scheduled (three concepts absent from IGCSE, one from AP), and it is a deliberate CBSE/JEE/IB-HL
   depth play. Worth an explicit founder acknowledgement so a later coverage review does not read it
   as breadth work.

---

*This document builds nothing. It makes `vector_geometry_3d` buildable — and checkable before a line
of renderer code lands on master.*
