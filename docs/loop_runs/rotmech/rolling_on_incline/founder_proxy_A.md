# Checkpoint A — `rolling_on_incline` (rotmech 0b, REV 2)

**VERDICT: `DESIGN_FIX` → `alex:architect` (fix cycle 1 of 2)** · founder-proxy, 2026-08-02 · skeleton commit `45d1226`

REV 2 is a serious document and most of its judgement is right: the atomic claim is well-bounded, the 8-state arc is genuinely cut-coherent, the misconception plan hits two real pivots and no more, the founder's no-energy-bars ruling is honoured in letter *and* spirit, and the physics arithmetic recomputed is correct to the last digit. But the two things this revision exists to fix are both still unsound, and unsound in the same way — **a number was asserted where a reader would have been consulted.** The framing plan's projected separations contain no projection factor at all. The home-pose/finish-line paragraph is built on a track model the renderer does not have. And the SCAR AUDIT's completeness claim is false in a way that matters: it skips `field3d_nlb_physics_clock_not_state_local` — CRITICAL/OPEN, on the exact scenario being extended. No physics-correctness doubt; one focused revision.

**Credit, so the fix cycle does not undo it:** the no-stagger decision is *correct* and correctly reasoned; the F7 downgrade is *code-true*; the S5 geometry correction is exact; the min_ring table and term-introduction ledger are real improvements. Do not churn any of those.

---

## Verified

**Renderer line citations — all nine verified, all honest.** `:1340` is verbatim the closed enum `'m'|'m2'|'F'|'F_ang'|'theta'|'mu_s'|'mu_k'|'v0'`; `:39895/:40245/:44663` all loop `bodies.length`; `:41746` is `#nlb_formula` with `'Cambria Math'`; `:42295` is the `param_ramp` §7.1 block; `:43247/:43356` are the two `slice(0,2)` caps and — whole file checked — the **only** two, the other hits being hex parsing at `:32036/:32927`. A skeleton whose citations survive spot-checking is rare; this one does.

**Arithmetic — every number recomputed, all correct.** g sin 25° = 4.1417 · a = 2.9583 / 2.7611 / 2.4850 / 2.0709 · μ_min = tan25°/2 = 0.23315 · d = 1.00/sin25° = 2.3662 m · mgh = 9.8 J, sphere 7.0 + 2.8, ring 4.9 + 4.9 ✓. Timing: S1 2084.7 ms · S4 1744.2 ms · S5 1511.6 ms · S7 ramp crossing at **3372.0 ms** — computed from the unrounded μ_min, not the printed 0.233, the mark of an executed calculation. All four pin margins ✓. The REV-1 → REV-2 correction (9.8 J over 4.5 m at 25° was indeed 18.6 J) is right.

---

## P1 findings — block the design

**P1-1 · The framing plan's projected separations were never projected.** *(S1, S4, S5 — the item this revision exists to fix)*
The numbers are internally consistent with **no camera projection applied**. S1: 0.8 m gap ↦ "≈110 px"; body diameter 0.30 m ↦ "≈40 px" — implied scale 137 vs 133 px/m. S4: 1.2 m ↦ "≈165 px"; half-width sum 0.40 m ↦ "≈54 px" — 137.5 vs 135 px/m. A sphere's screen diameter carries **no** foreshortening; a lane offset carries cos ψ. Both yield cos ψ ≈ 1.02, i.e. ψ ≈ 0. At the authored "yaw 35°" the factor must be 0.819 (yaw off the track axis) or 0.574 (conventional three-quarter, 35° off side-on). Stated clearances are literal subtractions of the same unprojected figures (110 − 40 = 70; 165 − 54 = 111). Consequences: (a) the "≥ 70 px" S1 claim becomes 50 px or 23 px; (b) **"yaw 35° off the track axis" is ambiguous and the ambiguity changes the answer by 43%.** *(A feasibility solve fitting a 6 m run plus 2.4 m of lane spread into ~1200 px does clear at ψ = 35° from the track axis — sep ≈ 145 px, clearance ≈ 79 px — so the design is probably fine; the document's evidence does not establish it, and at ψ = 55° clearance is ≈ 30 px.)*
**Fix:** state the yaw convention as an explicit angle between camera view axis and track axis; recompute each separation as `lane_gap × s × cos ψ` with `s` stated; make the surgeon's acceptance criterion **disjointness under the projection probe**, not a px target.

**P1-2 · The monotonicity proof is orthographic; the renderer is `PerspectiveCamera(60, …)` (`:3341`).**
The speed-ordered-lane argument is **correct and elegant under orthographic projection**, and it is the right idea. Under perspective it is not closed: each body's scale changes as depth changes, and at ψ ≈ 35° the run sweeps ~4.9 m of depth, so a *receding* race shrinks the lane term while the track term grows. The skeleton never states whether the run approaches or recedes. **Fix:** author the run as approaching the camera (start far, finish near) so perspective *aids* monotonicity, and state that the 100 ms-sampled probe is the proof, not the geometry argument.

**P1-3 · The track-coordinate model is wrong in two independent ways — both readable in the declaration and the reader.**
- `length_m?: number; // visible half-length, default 6` (`:941`), read as `halfWorld = lenM * NLB_WORLD_PER_M`, `slab.scale.set(halfWorld*2,…)` (`:40060–40067`), with `span = (eng.length_m||0) * 2` (`:44176`). **`surface.length_m = 6.0` renders a 12 m plank spanning s ∈ [−6, +6]**, not the 6 m ramp §3 designs against. That doubles the apparatus, halves on-screen scale, and invalidates every px figure in P1-1 a second time — exactly R5 ("the apparatus fills the frame instead of floating in empty canvas").
- `nlbGravAlong` returns `-b.m * NLB_G * Math.sin(theta)` under the comment **"surface body: +axis is UP-slope"** (`:45095`, `:40867`). A body released from rest moves toward **decreasing** s. `s_finish = initial_position_m + 4.5` **runs the race up the hill.**
- Consequently `initial_position_m = 0.6` is not "0.6 m inset from the upper bound" — the bound is at ±6.0, so it sits 5.4 m inside, near mid-plank — and "finish inset ≥ 0.9 m" does not describe the resulting geometry. The `0.6` appears to be the scar row's own example number ("inset it by at least the body half-width (0.6 m for a cart)") lifted as an absolute coordinate rather than applied as an inset.
- This is where the skeleton claims two rows fixed/satisfied that are not: `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate` and `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` (whose DO is literally *"read BOTH the config type declaration and the reader function… Quote both line numbers"* — five other claims are line-quoted, these two are not).
**Fix (concrete):** one `length_m` for the whole concept (Rule 32d + the OPEN `field3d_release_widens_ground_plane_per_state…` row); `length_m = 3.0` gives a 6.0 m plank, `initial_position_m = +2.4` (0.6 m inset from +3.0), `s_finish = initial_position_m − 4.5 = −2.1` (0.9 m inset from −3.0); S5's finish at `initial_position_m − 2.366`.

**P1-4 · Per-body physical radius R is load-bearing in three states and appears nowhere in the build sheet.**
There is **no `radius_m` field anywhere in the renderer** (grep: zero hits). Three hard-wired constants stand in its place:
- `nlbSetBodyPosition` lifts every body by `NLB_BODY_SIZE / 2` (`:40015`). A 0.30 m-radius sphere and a 0.10 m one both float at 0.55 m — **the contact point, the entire subject of S2/S3/S7 and the thing that prints `contact 0.00 m/s`, would not be on the ramp.**
- Wheel spin is `wgrp2.rotation.z = -(s * NLB_WORLD_PER_M) / NLB_WHEEL_R` (`:40053`) — a constant. **S4's small sphere must visibly spin 3× faster than the large one** (same v, R = 0.10 vs 0.30); today they spin identically, so the state whose payoff is "these two are physically equivalent except in size" renders a false picture.
- `NLB_WHEEL_R = NLB_BODY_SIZE / 2` carries `// do NOT decouple from NLB_BODY_SIZE`, and `NLB_BODY_SIZE` carries `// MASS-INDEPENDENT (Rule 29: size is never a magnitude cue here)`. The surgeon reading that comment will stop. The skeleton must state the ruling: **here R is a real physical magnitude the concept teaches, so a size change is Rule-29-legal** (same clause that lets a vector's length change).
(b)-1 authors *k*; (b)-2 uses R in the constraint; F12 adds `R`/`R2` **slider tokens** — but no item names R as an authored per-body quantity driving mesh size, contact height and spin, nor the live re-lift under an `R` drag.

**P1-5 · Four lanes do not fit the existing apparatus, and lane geometry is not authorable.**
`nlbBodyLaneZ` returns `(k - (lanes.length-1)/2) * NLB_LANE_GAP` (`:40001`) — lane z is **derived from lane index × a hard constant** `NLB_LANE_GAP = 0.85` world units (= 1.7 m at `NLB_WORLD_PER_M = 0.5`), auto-centred, no authoring surface; returns 0 outright if any body is `fixed`. `NLB_SURFACE_DEPTH = 1.6` wu is likewise constant. Four bodies at the existing gap span 2.55 wu on a 1.6 wu slab — **the outer two lanes render off the plank**; even three overhang. The skeleton's per-state gaps (0.8 m, 1.2 m) and its speed-ordered lane *assignment* both require new authoring, and slab depth must be sized from the widest state's lane span (once per concept, per the second DO on `field3d_scenario_renders_offcentre…`). F13's wording does not reach lane gap or slab depth.

**P1-6 · No state except S7 authors μ_s, and no slip envelope is computed over S8's slider ranges.**
Every rolling state silently requires μ_s ≥ k tan θ/(1 + k) — 0.233 for S1's ring at 25°. §3 authors μ_s only in S7 (0.50). Worse: under the **full** preset S8 exposes both advanced dials (θ, μ_s) while (i-2) bans μ_min from the explore state on a 38b reading — so a teacher can drag μ_s to 0.05, or θ to 40° (μ_min = 0.42), and watch the sim contradict its own core claim **with the one cue that explains it deliberately suppressed**. The row whose lesson is precisely *"compute the ENVELOPE, not the authored point"* was dispositioned "N/A" on a letter-reading of its work-ledger surface; its generalisable half applies exactly.
**Fix:** author μ_s per state; compute the envelope over the full (θ, μ_s) ranges; and either ring-gate the μ_min tick *together with* the μ_s row it explains, or clamp the S8 μ_s floor above max μ_min.

**P1-7 · The SCAR AUDIT's completeness claim is false, and one skipped row is CRITICAL and on this exact scenario.**

| Skipped row | Why material |
|---|---|
| **`field3d_nlb_physics_clock_not_state_local`** (CRITICAL/OPEN) — *"nlb integrates from SET_STATE instead of from the state-local reveal start, so a body silently moves before the state visibly begins"* | The **entire §3 timing table**, all four pin margins, the S7 ramp crossing, and the truth of "released together"/"released simultaneously" all assume a state-local clock. The DO — *"Any new scenario carrying its own integrator must rebase on RESET_TRAJECTORY — a free-running physics clock is invisible to every deterministic gate"* — is a precondition of this design. |
| **`the_eye_passes_a_frame_in_which_one_compared_body_is_hidden_behind_another`** (MAJOR/OPEN) | The automated gate that would catch a framing-plan failure **does not exist yet**. Its DO (emit `PM_NLB_LANE_OCCLUSION`, surface in `manifest.warnings`) is a one-line build item; a 4-body race is the highest-occlusion state ever authored on nlb. |
| **`nlb_camera_rotated_body_label_bleed_through_slider_panel`** (MODERATE/OPEN) | The known consequence of *the exact fix this skeleton prescribes*: under a rotated camera, body labels bleed under the slider panel. Five of eight states author a rotated camera plus labels, k chips and finish chips. |
| **`nlb_angle_arc_radius_overruns_the_neighbouring_lane_body`** (MAJOR/OPEN) | The θ arc is drawn at fixed world radius `R = 1.05` (`:40074`); this concept authors θ = 25° beside up to four lanes. |
| **`nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud`** (MODERATE/OPEN) | S8 carries four bodies × (v, Rω, contact) + k chips + finish chips — far past the five rows that already collide. |
| **`field3d_edge_anchored_formula_surface_wraps_back_over_the_apparatus_for_a_long_equation`** (MODERATE/OPEN, nlb) | `#nlb_formula` is `max-width:340px`. `a = g sin θ / (1 + I/mR²)` at `600 22px 'Cambria Math'` is the longest equation nlb has held; the DO says verify in pixels with the longest equation any state authors. |
| **`field3d_world_space_label_decollision_is_projection_blind…`** (MODERATE/OPEN, nlb) | Corollary directly against this design: *"the shared default camera is an oblique three-quarter view… and it foreshortens exactly the angles a force decomposition exists to show"* — S6's decomposition needs a near-side-on camera, which the skeleton gets right by instinct but never justifies. Also confirms `camera_position` **is** per-state authorable, de-risking half of F13. |

Honest dispositions sampled: `nlb_frictionless…` (letter-correct N/A), `teach_coordinate_sim_with_graph`, `teach_distinct_reference_lines_for_two_radii`, `chemistry_concept_id_collides` (verified), `deferred_enum_members_must_be_declared`. The audit is not dishonest wholesale — it is **complete over the rows it chose and claims completeness over rows it did not query.**

**P1-8 · S4's TIE is judged on centres; the picture shows the big sphere's edge over the line first.**
R = 0.30 m and R = 0.10 m abreast in centres means leading edges differ by **0.20 m of track** for the whole descent — ~25–30 screen px at any camera in the feasible band, and it is the picture a teacher reads at the finish line while both chips stamp "TIE". This is `teach_visual_must_match_narration` on the state carrying the PRIMARY aha. **Fix:** author a centre marker (axle dot / vertical tick) on each body, define the crossing test on the CoM track coordinate, and draw the finish line so the centre-crossing is what the eye sees.

---

## P2 findings

**P2-1 · S6's derivation route silently imports the parallel-axis theorem and discards the arrow it draws.** Torques about the contact point need `I_contact = I_cm + mR² = (1+k)mR²` — the *advanced ring of prerequisite #6*, unshipped, and Block-1 supplies patch sentences for three prerequisites but **not for the parallel-axis step S6 actually uses**. Second, S6 draws f_s then chooses the one axis about which f_s has zero moment — a teacher will ask why the arrow was drawn. The CoM route (`f R = I_cm α ⇒ f = k m a`; `mg sin θ − f = ma ⇒ a = g sin θ/(1+k)`) needs no theorem, consumes the f_s arrow, and *produces* the f_s = k mg sin θ/(1+k) that (b)-2 already requires. Either switch, or add the patch sentence.

**P2-2 · §4's `one_line_fix` for S4 prints the advanced formula that (i-1) requires S4 to avoid.** §4 writes *"m and R both cancel from a = g sin θ/(1+I/mR²)"*; (i-1) says physics_author must keep S4's narration formula-free. physics_author will copy §4 verbatim. Make §4's text the ring-safe version.

**P2-3 · S5's motion is the third full-track race; the frame-difference disposition checks the pairs that pass and skips the pair that does not.** S1, S4 and S5 share one authored rhythm under two archetype labels and one declared contrast pair. S5's *idea* is genuinely new but its *motion* is not. The skeleton's own disposition asserts "S3/S4 and S1/S4 opening frames differ by far more than a caption" — S4/S5 is precisely the pair it does not name. Either give S5 a different rhythm (e.g. `freeze-and-read` at arrival with the split held side by side) or declare the S1/S4/S5 family explicitly with justification.

**P2-4 · F13 is under-scoped on the camera.** `camera_position` is per-state authorable, but **`field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` (MAJOR/OPEN) records that the camera TARGET is not** — and S2/S6/S7's "camera closes on the contact point" is exactly a target change. F13 must name the target as the missing surface, and reconcile the per-state camera plan with that row's second DO ("sized ONCE so the apparatus does not resize between states").

**P2-5 · The 0c-2 union cannot be closed from this skeleton alone.** (b)-3 waves the contact-point picture / cycloid through as *"shared with `pure_rolling` #11 — same build, not new scope"*, but #11 has no skeleton. The survey named #12 the spec driver; the union it closes is one-of-two, and the success test is measured against an incomplete union. State this as a known limit, or hold the 0c-2 dispatch until #11's skeleton exists.

---

## P3 notes

**P3-1 · `regime-switch` is a defensible coin but justified against the wrong axis.** The corpus carries `ramp-response` (8 uses), naming the same authored beat shape. The skeleton justifies the coin as "no existing archetype names a threshold crossing" — a claim about the *name*. An archetype is a claim about **rhythm**, and S7's rhythm (nothing → nothing → sudden discontinuity) genuinely differs from a proportional ramp response. Restate it that way and name `ramp-response` as the nearest neighbour it is not.

**P3-2 · "value-only readouts … fill as they descend" (S5) invites a bar downstream.** Say "count up".

---

## Rulings on the questions asked

1. **Multi-body framing.** The **no-stagger decision is right** and is the best judgement in the document — the DO mandates a stagger, but that DO came from Ch.6 compare states where a stagger was harmless; here it falsifies S1's narrated "released together" and destroys S4's dead heat, and the skeleton names the competing scar as its reason. A considered override, not a skip; it stands. The **geometry is not sound as written** (P1-1/2/3/5). Design intent sound and almost certainly feasible; the *spec* is not yet.
2. **S5 geometry and arithmetic.** All verified correct. **No physics doubt anywhere** — hence DESIGN_FIX, not ESCALATE.
3. **F7–F14.** **F7's downgrade is right.** But its residual list is too thin: it must also carry authorable lane gap + slab depth (P1-5) and the `PM_NLB_LANE_OCCLUSION` warning (P1-7). **F8 correctly scoped, the largest item** — caveat: at R = 0.15 m each body is ~5% of track length, so "the hollow sphere must read as hollow" needs a stated minimum on-screen diameter or distinctness must come from silhouette + colour; resolve at design time, not by the surgeon. **F12 real** — `:1340` verbatim lacks `R`, `R2`, shape tokens. **F13 real but under-scoped** (P2-4). **F14 real and cheap.** **Alarm rule:** F8/F9/F12/F13 + P1-4 + P1-5 together *do* show the survey's 0c-2 union row under-specified the race apparatus — but all inside the same apparatus family, none forcing a new scenario. **Ruling: amend the survey's 0c-2 union row once, before the surgeon dispatch, so the success test is measured against a true union; do not stop the chapter.**
4. **`regime-switch`.** Justified, weakly argued (P3-1).
5. **State-idea distinctness.** **S1 vs S4 is a genuine pair** — S1 confounds nothing (equal m, R), S4 removes the confound; neither derivable from the other. **S2 earns its place**, and the alternative would violate Rule 23: prerequisites are advisory, a teacher can open this cold, and S3's `contact 0.00 m/s` claim and S5's energy route both need v = Rω on screen first. It is thin (the D1 = 1 score) and must stay at its declared 30–45 word floor. The real distinctness problem is **S5's motion, not its idea** (P2-3).
6. **Rule 41: clean.** All eight titles and delta cues are basic literal English; "links", "ranks", "cancel", "beats" literal in context; "cancel" is the word the algebra uses (41b); titles carry meaning in first words (41d). Watch "instantaneously" and any temptation to say bodies "grip"/"rub" — Block-1 already flags. **Rule 35 / 38f: clean and good.** A food can and a roll of tape are universal, physics-true (a tape roll really is k ≈ 1), checkable in thirty seconds anywhere, and the hook and the misconception kill are the same object. No India-specific anchor imported.
7. **Rule 38 rings.** Ordering qualitative → quantitative → derivation ✓; advanced contiguous and immediately before explore ✓; both cuts coherent ✓; notation ladder holds ✓; dialect dual-labels once ✓; `curriculum_tags` carry `needs_teacher_verification` ✓; 38e declared N/A ✓. **min_ring table holds under both cuts** — re-run independently, same answer. **Two leaks:** §4's `one_line_fix` prints advanced content into a core state (P2-2), and explore exposes the advanced μ_s dial with its explanatory cue ring-suppressed (P1-6).

---

## Additions the 0c-2 build sheet must carry

1. **Per-body physical radius** as an authored field driving mesh size, contact-height lift, spin `ω = v/R`, and live re-lift under an `R`/`R2` drag — with the explicit Rule-29 ruling that size here is a real physical magnitude (P1-4).
2. **Authorable lane gap + lane assignment, and slab depth sized once per concept** from the widest state's lane span (P1-5).
3. **`PM_NLB_LANE_OCCLUSION`** renderer warning surfaced in `manifest.warnings` — without it the framing plan is un-gated (P1-7).
4. **State-local physics clock / `RESET_TRAJECTORY` rebase** for the nlb integrator — precondition for the entire timing table (CRITICAL/OPEN row).
5. **Camera target authoring** (P2-4), plus verification of `#nlb_formula` at S6's equation length and of the θ-arc radius against the outer lane.

---

## Candidate scar rows (report-only)

Four proposed: `skeleton_projected_screen_separation_quoted_without_the_projection_factor` (MAJOR, directive) · `nlb_track_length_m_is_a_half_length_and_plus_s_is_up_slope` (MAJOR, directive) · `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` (MAJOR, directive) · `explore_state_exposes_an_advanced_control_whose_threshold_cue_is_ring_suppressed` (MODERATE, directive). Full SQL in the Checkpoint A transcript; the dispatching session must confirm no `bug_class` collision (605 rows live) before filing.

---

## Rubric (advisory, unratified — did not affect the verdict)

Checkpoint A subset — D1 1 · D2 2 · D8 2 · D9 2 · D10 1 = **8/10**.
Weakest: **D1** — S2 is a full state recapping concept #11's entire core claim; defensible under Rule 23 and consumed by S3/S5, but the one thin state. **D10** — every dial changes something a teacher would demonstrate, but under the full preset the two advanced dials can drive the sandbox into the slip regime while (i-2) suppresses the cue that explains it.
**D2 (2):** the ring cut IS the arc. **D8 (2):** exactly two beats at genuine pivots, explicitly "no per-state tic". **D9 (2):** all eight titles Rule-41 plain with meaning in the first words.

**Fix cycle 1 of 2.** `physics_author` and the 0c-2 dispatch are **not** authorised until this returns `DESIGN_OK`.
