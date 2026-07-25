# lom-a loop state

updated: 2026-07-25 (free_body_diagram SEALED - concept 1 of 3 done)
review_port: 8089
regression_sample: electric_flux, magnetic_flux
next: connected_bodies - the coupled Branch B integrator + pulley/rope geometry (the second structural extreme, already proved in Phase 0 bring-up). Read docs/loop_runs/phase0_engine_report.md §6 (JSON authoring contract) AND docs/loop_runs/lom/free_body_diagram/engine_gap.md (3 gaps found in concept 1 - one of them, the missing monotonic parameter ramp, most likely bites block_on_incline next). TENSION IS THIS CONCEPT'S JOB: free_body_diagram deliberately dropped its hanging-body/tension state because an uncoupled hanging body has no string to carry T - connected_bodies owns the pulley/rope path and must cover the tension arrow.
done: Phase 0 - newtons_laws_body field_3d engine (all 14 spec sites, both structural extremes proved, regression clean)
done: free_body_diagram - 298f140 - 6 states, RETROFIT mechanics_2d -> field_3d, baselines locked
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

engine_verify: check:renderer-syntax OK - tsc 0 errors - validate:concepts 125 PASS / 0 FAIL (after every seam)
engine_regression: electric_flux 62/62 gates + magnetic_flux 38/38 gates, eye-walker NO REGRESSION on both (zero nlb_* leakage)
chapter_map (founder-approved 2026-07-25): free_body_diagram, connected_bodies, block_on_incline

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

notes: Auto-approve is ON. quality-auditor PASS plus eye-walker clean (zero new engine_bug_queue rows) triggers npm run visual:approve automatically - no founder checkpoint. TTS, PILOT_CONCEPTS, build:pilot and deploy remain FOUNDER-GATED: the founder reviews each sealed concept, iterates anything wrong, and only then ships.
