# lom-b loop state

updated: 2026-07-25 (worktree created off feat/lom-a after the newtons_laws_body engine commit)
review_port: 8090
regression_sample: gauss_law_sphere, gauss_law_solid_sphere
next: newton_first_law
done: (none)
parked: (none)
in_flight: (none)
engine_commits: (none - the newtons_laws_body engine was built on feat/lom-a and is inherited by this branch; engine fixes here are NOT expected)
chapter_map (founder-approved 2026-07-25): newton_first_law, newton_second_law, newton_third_law

notes: This worktree is HALF of the Laws of Motion chapter. The other half (free_body_diagram, connected_bodies, block_on_incline) runs concurrently in C:\Tutor\physics-mind-lom-a on branch feat/lom-a. Two worktrees because git cannot check out one branch twice and two sessions must never race the same working tree.

notes: These three concepts are deliberately the SIMPLEST of the six - every one of them is a strict subset of what worktree A's free_body_diagram and connected_bodies already exercise. All three are flat ground (theta = 0), frictionless (mu = 0), no pulley. newton_third_law uses the action_reaction block; the other two are plain single/two-body cases. If any of them appears to need a renderer change, that is a RED FLAG that the Phase 0 engine under-generalized: park it with an engine_gap.md and stop, do not extend the engine here.

notes: The newtons_laws_body engine is INHERITED, not built here. Engine fixes should be rare-to-none in this worktree. If engine_commits: reaches 3 in this branch, pause and notify the founder.

notes: Agent roster is 11 - the base 10 plus field3d-surgeon. founder-proxy is deliberately ABSENT (traditional pipeline, founder-approved 2026-07-25).

notes: Auto-approve is ON. quality-auditor PASS plus eye-walker clean (zero new engine_bug_queue rows) triggers npm run visual:approve automatically. TTS, PILOT_CONCEPTS, build:pilot and deploy remain FOUNDER-GATED.

notes: Merge order at chapter end is feat/lom-b into feat/lom-a, then the founder reviews and merges onward. The only expected conflict surface is three append-style registration lists (panelConfig.ts, intentClassifier.ts, aiSimulationGenerator.ts).
