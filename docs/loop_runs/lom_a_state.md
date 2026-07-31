# lom-a loop state

updated: 2026-07-26 (CHAPTER COMPLETE - block_on_incline SEALED; all 3 lom-a concepts done)

>> LOOP COMPLETE FOR THIS WORKTREE - NOTHING IN FLIGHT <<
   All three chapter_map concepts are SEALED with baselines locked. The remaining work is
   FOUNDER-GATED and deliberately not done here: founder review of each sealed concept, then
   TTS, PILOT_CONCEPTS, build:pilot, deploy, and the merge of feat/lom-a (expect the 2-3 trivial
   scenario-union/dispatch-switch conflicts noted below). The other half of the chapter
   (newton_first_law, newton_second_law, newton_third_law) is in C:\Tutor\physics-mind-lom-b.

review_port: 8089
regression_sample: electric_flux, magnetic_flux
next: (none - chapter complete; founder review + merge is the next action, and it is founder-gated)
done: Phase 0 - newtons_laws_body field_3d engine (all 14 spec sites, both structural extremes proved, regression clean)
done: free_body_diagram - 298f140 - 6 states, RETROFIT mechanics_2d -> field_3d, baselines locked
done: connected_bodies - 7 states, coupled Branch B + pulley/rope + Atwood, baselines locked, auto-approved on quality-auditor PASS + eye-walker CLEAN
done: block_on_incline - ab34ffe - 5 states, param_ramp break-away beat, baselines locked, auto-approved on quality-auditor PASS + eye-walker CLEAN (both recommended SEAL)
parked: (none)
in_flight: (none)
engine_commits:
  2ca62ad  chore(lom-a): Phase 0 scaffolding - engine spec, field3d-surgeon agent, loop state
  6c7a319  seam A - types + config surface + scene build + dispatch + #sliders exclusion (sites 1,2,6-partial,7,8-partial,9)
  e642bc5  seam B - integrator, both branches + animate() frame call site (sites 10, 8-physics)
  be12f32  seam C - force-arrow overlay, 6 kinds + components + ghost (site 6-arrows, 8-arrows)
  349e1af  seam D - pulley post/wheel/rope geometry + real hang anchor (site 6-pulley, 8-pulley)
  9c413f8  seam E - sliders/explorer/PARAM_UPDATE/trusted drag/idle sweep (sites 3,4,5,11,8-controls)
  9c4438e  seam F - deriveStateMeta reveal + hold + F3D_REVEAL_KEYS (sites 12, 13, +13a)
  f921a3c  bring-up proof harness + hanging-body HUD stub fix
  cd8fe67  RESET_TRAJECTORY was a silent no-op for newtons_laws_body (concept-1 fix, 1 of the 5-commit runaway budget)
  ff408ed  nlb two-body lane offset (concept-1 fix, 2 of 5)
  5a07aa9  nlb_coupled_initial_velocity_never_seeded (concept-2 fix, 3 of 5)
  bc649d4  nlb_coupled_readouts_revert_to_rest_values_on_bound_halt (concept-2 fix, 4 of 5)
  aa7daf5  nlb_pulley_group_hidden_with_surface_in_atwood_mode (concept-2 fix, 5 of 5 - GUARD TRIPPED)
  ada18a4  nlb_param_ramp monotonic guided-state parameter reveal (concept-3, PRE-AUTHORIZED per CHAPTER_LOOP.md 7.1 - does NOT count against the budget)
  37d6e68  nlb_uncoupled_readouts_flip_to_static_on_bound_halt (concept-3 fix, 1 of the fresh 3 - budget NOT exhausted, 2 unused)
  d9d07a0  feat(engine): nlb push-off phase + fixed body (PUSH-OFF SEAM A - docs/NLB_PUSH_OFF_SPEC.md; NOT a concept fix)
  208a8ba  feat(engine): nlb push-off spring geometry + glow/lane wiring (PUSH-OFF SEAM B)

engine_verify: check:renderer-syntax OK - tsc 0 errors - validate:concepts 125 PASS / 0 FAIL (after every seam)
engine_regression: electric_flux 62/62 gates + magnetic_flux 38/38 gates, eye-walker NO REGRESSION on both (zero nlb_* leakage)
chapter_map (founder-approved 2026-07-25): free_body_diagram, connected_bodies, block_on_incline

notes: 2026-07-29 PUSH-OFF ENGINE SEAM (founder-directed, engine-only - NO concept authored here). Built
  the three capabilities of docs/NLB_PUSH_OFF_SPEC.md into the shared newtons_laws_body engine: the
  push_off contact-then-release force phase (engine-enforced equality, state-local eng.t_ms, inert in
  sandbox per Rule 37), the visible spring carried from the nlbSetBodyPosition funnel (brighten-only
  apparatus in nlbApplyGlow's solidApparatus list), and fixed?: boolean bodies (never integrate, but
  real - forces and arrows draw normally, rendered as a wall slab), plus lane 0 for head-on pairs.
  Two field3d-surgeon dispatches, d9d07a0 + 208a8ba. The consumer is newton_third_law, which lives in
  the OTHER worktree (C:\Tutor\physics-mind-lom-b) - this seam is the engine half only. Full report,
  including the NON-OPTIONAL spring-geometry authoring contract (cart spacing 1.82 m, wall 1.545 m,
  release_at_ms = 1000*sqrt(1.76/(F*(1/m_a+1/m_b)))), is in docs/loop_runs/push_off_report.md.

notes: This worktree is HALF of the Laws of Motion chapter. The other half (newton_first_law, newton_second_law, newton_third_law) runs concurrently in C:\Tutor\physics-mind-lom-b on branch feat/lom-b. Two worktrees because git cannot check out one branch twice and two sessions must never race the same working tree.

notes: Concept split rationale. This worktree owns the two STRUCTURAL EXTREMES that prove the engine - free_body_diagram (force-arrow overlay + ghost bodies, no integrator) and connected_bodies (the coupled Branch B integrator + the new pulley/rope geometry). Everything worktree B needs is a strict subset of what these two exercise. block_on_incline is third here because it shares the friction/threshold path with connected_bodies.

notes: Phase 0 is a ONE-TIME engine build - scenario_type newtons_laws_body in field_3d_renderer.ts, per docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md. Its whole purpose is that concepts 2-6 need ZERO renderer edits. If a later concept requires a renderer change, the design under-generalized: STOP and report rather than quietly extending the engine per concept.

notes: Base is commit ec09b28 on feat/field3d-draggable-sensor, NOT master. Chosen 2026-07-25 because the kinematics_1d_track engine and displacement_vs_distance were uncommitted work-in-progress in another live session at the time. Consequence: this branch does NOT contain kinematics_1d_track, and at merge time expect 2-3 trivial textual conflicts where both branches appended a new scenario (the scenario_type union line and the dispatch switch). Nothing else overlaps.

notes: Agent roster is 11 - the base 10 plus field3d-surgeon. founder-proxy is deliberately ABSENT (this is the traditional pipeline, founder-approved 2026-07-25). field3d-surgeon was KEPT despite the strip-down because token forensics showed it averages ~3.4M/dispatch on field_3d engine work versus ~25M for a general-purpose dispatch doing the same job.

notes: free_body_diagram (concept 1) outcome, 2026-07-25. SEALED at 298f140, 6 states, baselines locked
  by auto-approve. Took 3 content fix cycles (the full budget) plus 2 field3d-surgeon dispatches. THREE
  founder-visible decisions were made in the loop, all recorded with reasoning in
  docs/loop_runs/lom/free_body_diagram/engine_gap.md - iterate any of them if you disagree:
  (1) the hanging-body/tension state was DELETED rather than rescued (the engine defines `hanging` as
  hanging off the pulley, so an uncoupled body genuinely has no string and T = 0); tension is now
  connected_bodies' job. (2) STATE_5's incline is STATIC at theta=30 instead of sweeping 0->30, because
  the engine has NO monotonic parameter-reveal path for a guided state - idle_auto_sweep is a 4 s
  triangle and phases[] only drives glow, not physics. The text was rewritten so nothing promises a tilt
  the student never sees, but this is the weaker beat and block_on_incline will likely want the same
  ramp (tilt until break-away at tan theta = mu_s IS that concept's central beat). A `param_ramp` knob
  is the minimal fix if you want it. (3) STATE_3's frozen frame - the canonical reviewer screenshot -
  pins at 3000 ms, which leaves the coasting body still overlapping the ghost and under-sells the
  growing-gap idea; nudging the coast reveal candidate later is a one-line deriveStateMeta change but
  moves H2 pixels, so it was deferred to you (noted at the end of scar_candidates.sql).

notes: Review-process lesson from concept 1, worth carrying through the chapter. EVERY defect found in
  free_body_diagram passed 31/31 deterministic checks AND a full quality-auditor gate 0-20 PASS at cycle
  0; all of them were caught only by eye-walker reading frames. But eye-walker was also confidently wrong
  twice on specifics - it quoted a halt instant a runtime probe disproved, and its final MAJOR
  ("body jumps backward") was a false positive that cost a whole engine dispatch: a __frozen frame is a
  RE-ENTERED state pinned at maxRevealMs, not the end of the dense series, so a continuously-translating
  body is legitimately BEHIND its last dense frame. The auditor was likewise wrong once in the other
  direction (it certified T = 19.60 N for the hanging body from the worksheet's arithmetic while the
  runtime showed 0.00). Conclusion: keep both reviewers, in parallel, and when a visual finding and a
  worksheet disagree, PROBE THE RUNTIME rather than reasoning from either. A probe_definition scar row
  for the frozen-frame semantic is in docs/loop_runs/lom/_engine/scar_candidates.sql (text only, not
  applied) so the next concept does not pay for that dispatch again.

notes: connected_bodies (concept 2) outcome, 2026-07-26. SEALED, 7 states, baselines locked by
  auto-approve on quality-auditor PASS + eye-walker CLEAN (both explicitly recommended SEAL). Cost:
  ONE content fix cycle (of 3) and THREE engine dispatches, each a genuinely distinct bug_class.
  Full narrative in docs/loop_runs/lom/connected_bodies/engine_gap.md; SQL text (not applied) in
  that dir's scar_candidates_connected_bodies.sql, also appended to lom/_engine/scar_candidates.sql.
  THREE items ship UNFIXED and are yours to judge - both reviewers independently cleared all three:
  (1) the sandbox F slider can drive a > g where a real rope would go slack, giving a magnitude-masked
  impossible tension (needs deliberate extreme input; not JSON-fixable - the slider range is the
  engine's shared panel); (2) STATE_7's m2 HUD bleeds into the slider panel, and its formula_overlay
  was REMOVED rather than moved because the engine has no per-state positional override for those
  hardcoded CSS zones; (3) STATE_6's pulley post base FLOATS now that the slab is hidden - that layer
  had never rendered before the third fix, so nobody had ever seen it.

notes: Two lessons from concept 2 worth carrying, both confirming concept 1's. FIRST: all three
  defects passed 31/31 deterministic checks and were caught ONLY by the two reviewers reading the
  runtime - eye-walker found the static S1/S2 in the pixels (byte-identical frames), quality-auditor
  found a reverting HUD by probing readouts LATE in the state, and the invisible pulley was found
  independently by BOTH. Keep them mandatory and parallel. SECOND, and this one paid for itself:
  "probe the runtime rather than reason from either reviewer" - the first engine dispatch found that
  the NAMED fix (seed the velocity) did not clear the symptom at all, and only a live probe revealed
  the second link (the bounds veto zeroing the seed). A dispatch that trusted the diagnosis would
  have reported success on a still-dead state. Unlike concept 1, neither reviewer produced a false
  positive this time - both dispatch prompts listed concept 1's known false-positive classes
  (frozen-frame semantics, the designed-around halt, the static incline) explicitly. Keep doing that.

notes: Auto-approve is ON. quality-auditor PASS plus eye-walker clean (zero new engine_bug_queue rows) triggers npm run visual:approve automatically - no founder checkpoint. TTS, PILOT_CONCEPTS, build:pilot and deploy remain FOUNDER-GATED: the founder reviews each sealed concept, iterates anything wrong, and only then ships.

notes: 2026-07-26 RUNAWAY GUARD RELEASED BY FOUNDER. The guard tripped at 5 loop-phase engine commits and correctly paused before block_on_incline. Founder reviewed the breakdown and released it. Rationale on the record: the guard exists to catch the Ch.7 pattern of EXTENDING THE ENGINE PER CONCEPT (28 commits across 8 concepts). That is not what these 5 were. Four were genuine shared-engine defects concentrated in the coupled Branch B path - RESET_TRAJECTORY no-op, two-body lane occlusion, coupled v0 never seeded, coupled readouts reverting on a bound halt - and Branch B is exercised by exactly ONE concept, connected_bodies, which is now SEALED. The fifth was a founder-introduced regression, not an engine gap: the surface.hidden fix suppressed nlb_surface_group, which is also the pulley bracket's parent, so hiding the table took the pulley with it. Across all 5 sealed concepts, ZERO renderer edits appear inside any concept commit - the design claim held.

notes: ENGINE-FIX BUDGET RESET to 0 for block_on_incline. Fresh guard: pause again at 3 NEW engine commits during this concept. It is a single body on a slope - no coupling, no second body, no pulley - so it uses the simplest path in the engine and 3 fixes would genuinely indicate something systemic.

notes: param_ramp IS PRE-AUTHORIZED and does NOT count against the fresh 3-commit budget (see CHAPTER_LOOP.md section 7.1). It is a deliberate, named ENGINE ADDITION, not a defect: the engine has no monotonic parameter reveal for a guided state (idle_auto_sweep is a repeating triangle, phases[] drives glow only), and tilt-until-break-away at tan(theta) = mu_s IS this concept's central beat. free_body_diagram STATE_5 was allowed to author around a static incline because tilt was not its point; block_on_incline is NOT allowed to. Do not rewrite the narration to dodge it - dispatch field3d-surgeon per section 7.1, and if the addition fails twice, PARK the concept and report rather than shipping a weakened break-away beat.

notes: block_on_incline (concept 3) outcome, 2026-07-26. SEALED at ab34ffe, 5 states, baselines locked
  by auto-approve on quality-auditor PASS + eye-walker CLEAN (both explicitly recommended SEAL). Cost:
  ONE content fix cycle (of 3) and ONE engine fix (37d6e68) on top of the pre-authorized param_ramp
  (ada18a4). The fresh 3-commit guard was NOT exhausted - two unused. The founder's release rationale
  held: a single body on a slope really is the simplest engine path, and it needed one fix, not five.
  THE CENTRAL BEAT SHIPPED AS SPECIFIED - STATE_3's ramp tilts monotonically 0 -> 35 deg, the block is
  EXACTLY stuck (v = 0.0000, stuck = true) at every sample while theta < 24.23 deg, and break-away is
  bracketed at t ~ 8307 ms, theta_c = tan-1(mu_s). No static incline, no narration written around a
  missing tilt. param_ramp is now proven in both a guided state and (correctly inert) in a sandbox.
  ONE residual ships unfixed, cleared by BOTH reviewers: the S2/S3 friction-arrow ~15 N length floor,
  where a sub-floor force renders as a clamped stub rather than being suppressed. Mitigated by design
  (glow_focal only walks to the friction arrow at 6112 ms, once it renders floor-faithfully). The true
  fix is per-kind arrow-visibility gating in phases[] - an engine change, text-only scar candidate
  logged as field3d_phases_cannot_gate_per_kind_arrow_visibility.

notes: Concept 3 confirms the chapter's review lesson for the THIRD time, now with zero ambiguity. The
  one defect that mattered - STATE_4's sliding block B collapsing onto the static block A's HUD row the
  instant it ran out of track - passed 23/23 deterministic checks AND a full quality-auditor gate 0-20
  PASS at cycle 0. The auditor had actually SEEN the post-bound readouts and certified them ("physically
  correct, the accepted designed halt"); only eye-walker reading the pixels caught that B's row had gone
  byte-identical to A's, inverting the two-fates beat the state exists to teach. Neither reviewer
  produced a false positive this cycle - both dispatch prompts again listed the known false-positive
  classes (frozen-frame semantics, the designed end-of-run halt, N/A-DORMANT registry, absent audio)
  explicitly. Three for three: keep both reviewers, mandatory and parallel, and keep naming the
  false-positive classes in the prompt.

notes: The root cause was worth the commit and generalizes beyond this chapter. A velocity zeroed by a
  GEOMETRIC clamp (a body hitting the end of finite track) was being fed straight into a PHYSICS rest
  test, which could not tell a wall from a force balance and upgraded kinetic friction to static. In the
  normal mu_s > mu_k case a sliding body never decelerates to rest on its own, so it is ALWAYS still
  sliding when it hits the bound - the flip was reachable on every such state, not an edge case. This is
  the exact Branch A twin of the coupled bug bc649d4 found in concept 2; the same class surfaced
  independently in both integrator branches, which is the strongest argument in this chapter for the
  scar list being kept as a real artifact rather than a per-concept note.
