# lom-b loop state

updated: 2026-07-25 (newton_first_law UNPARKED - the blocking engine defect was fixed on feat/lom-a and cherry-picked here as 3e1b159; needs re-verification only)
review_port: 8090
regression_sample: gauss_law_sphere, gauss_law_solid_sphere
next: newton_first_law (RE-VERIFY ONLY - content is complete and committed; do NOT re-author. Re-seed its cache, re-run THE EYE + eye-walker, and seal if the motion now happens inside the reveal window.)
done: (none)
parked: (none - newton_first_law unparked 2026-07-25, see notes)
in_flight: (none)
engine_commits: 3e1b159 nlb state-local clock / RESET_TRAJECTORY rewind [owner: peter_parker:field3d_surgeon] (cherry-picked from feat/lom-a cd8fe67)
chapter_map (founder-approved 2026-07-25): newton_first_law, newton_second_law, newton_third_law

notes: This worktree is HALF of the Laws of Motion chapter. The other half (free_body_diagram, connected_bodies, block_on_incline) runs concurrently in C:\Tutor\physics-mind-lom-a on branch feat/lom-a. Two worktrees because git cannot check out one branch twice and two sessions must never race the same working tree.

notes: These three concepts are deliberately the SIMPLEST of the six - every one of them is a strict subset of what worktree A's free_body_diagram and connected_bodies already exercise. All three are flat ground (theta = 0), frictionless (mu = 0), no pulley. newton_third_law uses the action_reaction block; the other two are plain single/two-body cases. If any of them appears to need a renderer change, that is a RED FLAG that the Phase 0 engine under-generalized: park it with an engine_gap.md and stop, do not extend the engine here.

notes: The newtons_laws_body engine is INHERITED, not built here. Engine fixes should be rare-to-none in this worktree. If engine_commits: reaches 3 in this branch, pause and notify the founder.

notes: Agent roster is 11 - the base 10 plus field3d-surgeon. founder-proxy is deliberately ABSENT (traditional pipeline, founder-approved 2026-07-25).

notes: Auto-approve is ON. quality-auditor PASS plus eye-walker clean (zero new engine_bug_queue rows) triggers npm run visual:approve automatically. TTS, PILOT_CONCEPTS, build:pilot and deploy remain FOUNDER-GATED.

notes: Merge order at chapter end is feat/lom-b into feat/lom-a, then the founder reviews and merges onward. The only expected conflict surface is three append-style registration lists (panelConfig.ts, intentClassifier.ts, aiSimulationGenerator.ts).

notes (2026-07-25, concept 1 newton_first_law): FOUNDER ATTENTION - two things worth a look. (1) The blocking defect was INVISIBLE to all 19 deterministic EYE gates: it manifests as an HUD-numeric + position-vs-caption contradiction, not a pixel regression, and a NEW concept has no prior baseline to diff against. Only the eye-walker frame read caught it. That is an argument for a deterministic probe asserting "v at the first captured frame equals the authored initial_velocity_mps" on any scenario carrying its own integrator. (2) engine_commits is still 0, but this is the first data point against the Phase 0 "concepts 2-6 need ZERO renderer edits" success criterion - it is a DEFECT in the built engine rather than an under-generalization (no config knob was missing; both upstream agents reported ENGINE GAP: none), so it does not by itself invalidate the one-scenario design.

notes (2026-07-25): DISPATCH-REGISTRY GOTCHA that will bite the next session too - field3d-surgeon exists on disk and check:agents reports 11/11, but a newly added agent type only becomes dispatchable in a session started AFTER it landed. Any session that needs field3d-surgeon must be a fresh one. The second, MODERATE finding (field3d_nlb_phase_glow_handoff_not_visible, STATE_3 weight->normal glow handoff not perceptible) is deliberately NOT dispatched - owner is ambiguous between renderer_primitives and json_author and needs founder triage; Amendment 4 also caps one bug_class per engine dispatch. Both rows are in docs/loop_runs/lom/_engine/scar_candidates.sql (report only, no DB writes).

notes: 2026-07-25 CROSS-BRANCH ENGINE FIX. newton_first_law parked on field3d_nlb_physics_clock_not_state_local - the nlb integrator accumulated wall-clock from SET_STATE instead of the reveal window, so a body moved before anyone saw it (STATE_1 froze at v=0.00 under a 'never slows' caption; STATE_2's whole deceleration finished pre-reveal). Worktree A independently hit the SAME root cause on free_body_diagram STATE_3 and fixed it properly in cd8fe67: a real nlbResetTrajectory() that rewinds s/v from new s0/v0 seeds and rebases eng.t_ms, while deliberately preserving live teacher controls (m, F, theta, mu). Cherry-picked here as 3e1b159 rather than fixing twice - two divergent fixes to the same function would have conflicted at merge. Verified after the pick: check:renderer-syntax OK, tsc 0, validate:concepts 126 PASS / 0 FAIL.

notes: The park note's instruction to 'follow the kt / kinematics_1d_track RESET_TRAJECTORY convention' was WRONG for these branches - that scenario does not exist here (grep returns 0); it was uncommitted work in another worktree when feat/lom-a was cut from ec09b28. The conventions that DO exist here are stateStartTime (~118 sites) and RESET_TRAJECTORY (~9). Do not go looking for kt.

notes: Root cause of the parked-not-fixed outcome was a dispatch-registry gap: field3d-surgeon exists on disk and check:agents reports 11/11, but it was absent from that session's registry (new agent types only dispatch from a session started after they were added). The session correctly refused both fallbacks - general-purpose is banned for field_3d work by Amendment 4, and the orchestrator editing the renderer is banned by section 0.1 - and spent zero of its 2-attempt repair budget. Fresh sessions from now on do have it.
