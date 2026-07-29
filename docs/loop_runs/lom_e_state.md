# lom-e loop state

updated: 2026-07-30 (Phase 0 in flight — worktree built + lom-c merged; engine seams next)

design: docs/loop_runs/lom/lom_e_design.md  (founder-approved 2026-07-30)
worktree: C:\Tutor\physics-mind-lom-e
branch: feat/lom-e-rolling-tension
base: feat/lom-friction-force @ a039841 (= master + founder-review apparatus fix + friction_force),
      with feat/lom-normal-force merged in at d8967c6
review_port: 8091          (8080–8082 / 8087–8090 / 8099 are all in use by other worktrees)
regression_sample: electric_flux, magnetic_flux

chapter_map (founder-approved 2026-07-30): rolling_friction, tension_force
  — plus this branch carries the already-authored normal_force + friction_force through to master,
    so the final merge lands the whole contact-force set at once.

next: Phase 0 seam 1 (bodies[].shape 'wheel' + position-derived spin)
in_flight: Phase 0 — engine seams
parked: (none)

done: worktree created; node_modules junctioned to C:\Tutor\physics-mind\node_modules; .env.local
      copied from lom-d; feat/lom-normal-force merged (2 registration-site conflicts resolved by
      keeping BOTH entries — panelConfig.ts + aiSimulationGenerator.ts CONCEPT_RENDERER_MAP);
      verified tsc 0 errors + validate:concepts 143 PASS / 0 FAIL + agent emissions 12/12.

engine_commits: (none yet — 2 planned)
  seam 1  bodies[].shape 'block'|'wheel' + hub/spoke marker + rotation.z = -s/r  → rolling_friction
  seam 2  train?: { body_ids } — N bodies, inter-body ropes, shared a, per-segment T1/T2  → tension_force

## Notes the next session must know

notes: This is the FOURTH lom worktree. lom-a/lom-b (newton 1/2/3, free_body_diagram,
  connected_bodies, block_on_incline) are ALREADY MERGED TO MASTER along with the newtons_laws_body
  engine. lom-c (normal_force) and lom-d (friction_force) are NOT merged — they live on their own
  branches and both are folded into THIS branch, so master gets one merge, not three.

notes: Neither normal_force nor friction_force is baseline-locked (no visual_baselines entry for
  either). They are authored + founder-review-fixed but NOT visual:approve'd. This session rebuilds
  their review sites on the shared engine code so the founder reviews all four together.

notes: Engine work is done by the ORCHESTRATOR directly, not field3d-surgeon. Neither
  field3d-surgeon nor renderer-primitives resolves in this session's dispatch registry (the
  documented worktree registry gap — `npm run check:agents` passing is NOT evidence they dispatch).
  general-purpose is ~25M tokens/dispatch for field_3d work vs ~3.4M for the specialist, so the
  fallback is worse than doing it inline. Each seam is its own commit for founder diff review.

notes: Rule 36 for seam 1 is satisfied BY CONSTRUCTION, not by a test — wheel spin is
  `rotation.z = -s / r` read from the body's current position every frame, never accumulated. There
  is no dt in the expression, so 60 Hz and 120 Hz agree exactly and SET_TIME_FREEZE (dt = 0, s
  unchanged) reproduces the previous frame byte-for-byte.

notes: tension_force must teach BOTH halves — what tension is AND when it differs (T1 vs T2). This
  was a founder requirement on 2026-07-30 and it is the entire reason the concept is not a duplicate
  of the sealed connected_bodies. Do not trim the T1/T2 states to save engine work; trim S1/S2
  instead if state count needs to come down.

notes: `tension_in_string` is a DEAD mechanics_2d concept that still owns the classifier synonyms
  `tension` and `rope_tension`. Redirect those to tension_force at registration time; leave
  `atwood_machine` → connected_bodies alone (that IS the sim that teaches Atwood).

notes: Auto-push hooks are live and shared across every worktree. Feature branches push
  automatically on every commit; master does NOT (deliberate — needs an explicit `git push` or
  PM_AUTOPUSH_MASTER=1). Never force-push; the hook refuses to and so should any session.

notes: Do NOT run visual:approve, tts:*, PILOT_CONCEPTS, build:pilot or deploy:* without an explicit
  founder approval statement (Rule 17 / Rule 30h-i). The founder reviews the visuals personally in
  this run — there is no founder-proxy on this branch.
