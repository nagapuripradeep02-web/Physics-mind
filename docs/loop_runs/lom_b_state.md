# lom-b loop state

updated: 2026-07-25 (concept 1 newton_first_law PARKED - content complete + auditor PASS, blocked on one CRITICAL engine defect)
review_port: 8090
regression_sample: gauss_law_sphere, gauss_law_solid_sphere
next: newton_second_law
done: (none)
parked: newton_first_law - BLOCKED ON ENGINE, NOT ON CONTENT. Pipeline ran to completion: architect + physics-author + json-author all delivered, tsc 0, validate:concepts PASS, THE EYE 19/19 deterministic checks clean, quality-auditor VERDICT: PASS. eye-walker then found 2 candidates, one CRITICAL: field3d_nlb_physics_clock_not_state_local - updateNewtonsLawsBodyFrame accumulates eng.t_ms from wall-clock dtStep and is never rebased by RESET_TRAJECTORY (every other field_3d reveal timeline is), so the body integrates from SET_STATE before the state-local reveal window opens. STATE_1 frozen pin reads v=0.00 (block hit the +10m bound, contradicting its never-slows cue); STATE_2's FIRST frame already reads v=0.02 (98% decelerated) so the deceleration it exists to teach is never on screen. Parked because the ONLY permitted route to a field_3d engine fix - the field3d-surgeon agent (Amendment 4) - is NOT in this session's dispatch registry (added on feat/lom-a after this registry was built; native dispatch lags one session), and both alternatives are barred: general-purpose dispatch by Amendment 4, orchestrator renderer surgery by section 0.1. ZERO repair attempts made, so the section 3b 2-attempt budget is untouched. visual:approve deliberately NOT run (auto-approve needs auditor PASS AND eye-walker clean). Full resume recipe: docs/loop_runs/lom/newton_first_law/park_note.md
in_flight: (none)
engine_commits: (none - the newtons_laws_body engine was built on feat/lom-a and is inherited by this branch; engine fixes here are NOT expected)
chapter_map (founder-approved 2026-07-25): newton_first_law, newton_second_law, newton_third_law

notes: This worktree is HALF of the Laws of Motion chapter. The other half (free_body_diagram, connected_bodies, block_on_incline) runs concurrently in C:\Tutor\physics-mind-lom-a on branch feat/lom-a. Two worktrees because git cannot check out one branch twice and two sessions must never race the same working tree.

notes: These three concepts are deliberately the SIMPLEST of the six - every one of them is a strict subset of what worktree A's free_body_diagram and connected_bodies already exercise. All three are flat ground (theta = 0), frictionless (mu = 0), no pulley. newton_third_law uses the action_reaction block; the other two are plain single/two-body cases. If any of them appears to need a renderer change, that is a RED FLAG that the Phase 0 engine under-generalized: park it with an engine_gap.md and stop, do not extend the engine here.

notes: The newtons_laws_body engine is INHERITED, not built here. Engine fixes should be rare-to-none in this worktree. If engine_commits: reaches 3 in this branch, pause and notify the founder.

notes: Agent roster is 11 - the base 10 plus field3d-surgeon. founder-proxy is deliberately ABSENT (traditional pipeline, founder-approved 2026-07-25).

notes: Auto-approve is ON. quality-auditor PASS plus eye-walker clean (zero new engine_bug_queue rows) triggers npm run visual:approve automatically. TTS, PILOT_CONCEPTS, build:pilot and deploy remain FOUNDER-GATED.

notes: Merge order at chapter end is feat/lom-b into feat/lom-a, then the founder reviews and merges onward. The only expected conflict surface is three append-style registration lists (panelConfig.ts, intentClassifier.ts, aiSimulationGenerator.ts).

notes (2026-07-25, concept 1 newton_first_law): FOUNDER ATTENTION - two things worth a look. (1) The blocking defect was INVISIBLE to all 19 deterministic EYE gates: it manifests as an HUD-numeric + position-vs-caption contradiction, not a pixel regression, and a NEW concept has no prior baseline to diff against. Only the eye-walker frame read caught it. That is an argument for a deterministic probe asserting "v at the first captured frame equals the authored initial_velocity_mps" on any scenario carrying its own integrator. (2) engine_commits is still 0, but this is the first data point against the Phase 0 "concepts 2-6 need ZERO renderer edits" success criterion - it is a DEFECT in the built engine rather than an under-generalization (no config knob was missing; both upstream agents reported ENGINE GAP: none), so it does not by itself invalidate the one-scenario design.

notes (2026-07-25): DISPATCH-REGISTRY GOTCHA that will bite the next session too - field3d-surgeon exists on disk and check:agents reports 11/11, but a newly added agent type only becomes dispatchable in a session started AFTER it landed. Any session that needs field3d-surgeon must be a fresh one. The second, MODERATE finding (field3d_nlb_phase_glow_handoff_not_visible, STATE_3 weight->normal glow handoff not perceptible) is deliberately NOT dispatched - owner is ambiguous between renderer_primitives and json_author and needs founder triage; Amendment 4 also caps one bug_class per engine dispatch. Both rows are in docs/loop_runs/lom/_engine/scar_candidates.sql (report only, no DB writes).
