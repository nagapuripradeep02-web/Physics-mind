# lom-a loop state

updated: 2026-07-25 (worktree created, Phase 0 engine build starting)
review_port: 8089
regression_sample: electric_flux, magnetic_flux
next: (Phase 0 engine build - no concept until newtons_laws_body is committed)
done: (none)
parked: (none)
in_flight: (none)
engine_commits: (none yet)
chapter_map (founder-approved 2026-07-25): free_body_diagram, connected_bodies, block_on_incline

notes: This worktree is HALF of the Laws of Motion chapter. The other half (newton_first_law, newton_second_law, newton_third_law) runs concurrently in C:\Tutor\physics-mind-lom-b on branch feat/lom-b. Two worktrees because git cannot check out one branch twice and two sessions must never race the same working tree.

notes: Concept split rationale. This worktree owns the two STRUCTURAL EXTREMES that prove the engine - free_body_diagram (force-arrow overlay + ghost bodies, no integrator) and connected_bodies (the coupled Branch B integrator + the new pulley/rope geometry). Everything worktree B needs is a strict subset of what these two exercise. block_on_incline is third here because it shares the friction/threshold path with connected_bodies.

notes: Phase 0 is a ONE-TIME engine build - scenario_type newtons_laws_body in field_3d_renderer.ts, per docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md. Its whole purpose is that concepts 2-6 need ZERO renderer edits. If a later concept requires a renderer change, the design under-generalized: STOP and report rather than quietly extending the engine per concept.

notes: Base is commit ec09b28 on feat/field3d-draggable-sensor, NOT master. Chosen 2026-07-25 because the kinematics_1d_track engine and displacement_vs_distance were uncommitted work-in-progress in another live session at the time. Consequence: this branch does NOT contain kinematics_1d_track, and at merge time expect 2-3 trivial textual conflicts where both branches appended a new scenario (the scenario_type union line and the dispatch switch). Nothing else overlaps.

notes: Agent roster is 11 - the base 10 plus field3d-surgeon. founder-proxy is deliberately ABSENT (this is the traditional pipeline, founder-approved 2026-07-25). field3d-surgeon was KEPT despite the strip-down because token forensics showed it averages ~3.4M/dispatch on field_3d engine work versus ~25M for a general-purpose dispatch doing the same job.

notes: Auto-approve is ON. quality-auditor PASS plus eye-walker clean (zero new engine_bug_queue rows) triggers npm run visual:approve automatically - no founder checkpoint. TTS, PILOT_CONCEPTS, build:pilot and deploy remain FOUNDER-GATED: the founder reviews each sealed concept, iterates anything wrong, and only then ships.
