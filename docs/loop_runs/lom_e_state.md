# lom-e loop state

updated: 2026-07-30 (Phase 0 COMPLETE — both engine seams landed + verified 36/36; authoring next)

design: docs/loop_runs/lom/lom_e_design.md  (founder-approved 2026-07-30)
worktree: C:\Tutor\physics-mind-lom-e
branch: feat/lom-e-rolling-tension
base: feat/lom-friction-force @ a039841, then feat/lom-normal-force merged, then BOTH tips
      re-merged after they advanced mid-session (Rule 41 passes — see the Rule 41 note below)
review_port: 8091          (8080–8082 / 8087–8090 / 8099 are all in use by other worktrees)
regression_sample: electric_flux, magnetic_flux

chapter_map (founder-approved 2026-07-30): rolling_friction, tension_force
  — plus this branch carries the already-authored normal_force + friction_force through to master,
    so the final merge lands the whole contact-force set at once.

next: Phase 1 — author rolling_friction (architect → physics-author → json-author)
in_flight: (none — Phase 0 sealed)
parked: (none)

done: Phase 0 — worktree + node_modules junction + .env.local; both lom branches merged (registration
      -site conflicts resolved by keeping BOTH entries); SEAM G + SEAM H landed at 76a8791 and
      verified 36/36 by src/scripts/_scratch_nlb_seams.ts; engine spec §6 updated with both seams.

engine_commits:
  76a8791  SEAM G (bodies[].shape 'wheel' + position-derived spin) + SEAM H (train, per-segment T₁/T₂)
  c214cf2  SEAM I  shared_applied_force — opt-in, an F write reaches every non-ghost surface body

## AUTHORING GOTCHA found by json_author 2026-07-30 — the word-budget gate counts em-dashes

`checkConceptWordBudget` in `src/scripts/validate-concepts.ts` tokenizes with
`t.trim().split(/\s+/).filter(Boolean).length`, so a SPACED EM-DASH (" — ") counts as a WORD.
Hand counts that ignore punctuation therefore under-report, and for a Rule-31-era concept (one that
declares `motion_archetype`/`delta_cue`) the >55 finding is FATAL, not a warning. rolling_friction
STATE_2 measured 54 by hand and 56 by the gate; fixed by replacing one em-dash with a comma (55).
Verified independently by the orchestrator by reading the tokenizer. Count with the gate, never by eye.

## FIX 2026-07-30 — `atwood_machine` synonym repointed to `connected_bodies`

It pointed at `tension_in_string`, a DEAD mechanics_2d concept with no `field_3d_config`, so every
"Atwood machine" query resolved to a non-product sim. Now `connected_bodies`, which is sealed on
master and teaches exactly that case. NOT sent to `tension_force`: that concept owns what tension is
and where it changes along a chain and deliberately has no Atwood state. (The orchestrator's own
json_author dispatch prompt asserted this synonym already pointed at `connected_bodies` — it did not;
json_author flagged the discrepancy instead of silently changing it, which was the right call.)

## FOUNDER DECISION 2026-07-30 — rolling_friction S5 F slider (json_author: TAKE THIS, DO NOT GUESS)

The engine's F write targets ONE body by default (`nlbForceTargetBody()` → first non-ghost in
AUTHORED `bodies[]` order), so in a same-push comparison state a teacher dragging F would move only
the block's push while two visibly different-length applied arrows contradicted the caption.

**Founder chose the opt-in engine flag (option b).** `rolling_friction` STATE_5 therefore:
- KEEPS `F` in `controls_visible` and keeps its `idle_auto_sweep { param: 'F', ... }`;
- ADDS `shared_applied_force: true` to that state's `newtons_laws_body` block, so the slider, the
  sweep and any ramp all write BOTH bodies and the race stays a fair same-push comparison.
- Requires the concept-level `slider_controls.F` widening the skeleton already specifies (max 50 N,
  which clears the heaviest block's 39.2 N break-away). A range input CLAMPS an out-of-range write,
  so without the widening a drag past 20 N is silently swallowed — this is exactly what made the
  seam harness fail its first run, and the same trap lom-c and lom-d each hit as a fix cycle.
- Do NOT set `shared_applied_force` on any state with `action_reaction.engaged` — that path wins and
  the shared write would be overwritten every frame.
Guided states S1/S2/S4 author their per-body F as CONSTANTS and do not need the flag.

engine_verify: check:renderer-syntax OK (all 3 renderers) · tsc 0 errors · validate:concepts 143 PASS
      / 0 FAIL · seam harness 36/36 · regression EYE electric_flux 62/62 + magnetic_flux 38/38 clean
      (re-seed + EYE re-run on the final committed renderer state).

## Notes the next session must know

notes: This is the FOURTH lom worktree. lom-a/lom-b (newton 1/2/3, free_body_diagram,
  connected_bodies, block_on_incline) are ALREADY MERGED TO MASTER along with the newtons_laws_body
  engine. lom-c (normal_force) and lom-d (friction_force) are NOT merged — both are folded into THIS
  branch, so master gets one merge, not three.

notes: BOTH lom-c and lom-d advanced AFTER this branch was cut (56427fe on lom-d, 2edf679 on lom-c —
  the Rule 41 plain-language passes). Both tips are merged in as of this state file. If either branch
  moves again before the final master merge, RE-MERGE it first: this branch is the integration point
  and a stale copy of friction_force/normal_force would silently ship the pre-Rule-41 wording.

notes: RULE 41 (plain-language law, founder 2026-07-30) and RULE 40 (engine files are PLATFORM) both
  landed mid-session and are now in CLAUDE.md §7 + CLAUDE_RULES.md on this branch. Rule 41 changes
  the AUTHORING work directly — every reader-facing string must be basic literal English, no idioms
  or personification ("fate", "grip", "ceiling", "All yours" are all named and banned). The design
  doc's draft delta cues predate it and must be re-worded at architect time, not accepted as written.

notes: RULE 40 DEVIATION, stated openly. Rule 40 says land engine changes on master "separately and
  immediately", never bundled in a chapter branch. The seam commit is NOT on master: merging into
  master means operating the worktree that has master checked out (physics-mind-curriculum), which
  another session may be using, and the founder's own instruction puts the merge after visual
  approval. Rule 40's actual failure mode — a mechanism built twice on branches nobody pushed — IS
  covered: 76a8791 is an isolated, single-purpose, already-PUSHED commit, so a `git log --all -S`
  search finds it. It is deliberately isolated so it can be cherry-picked to master the moment the
  founder wants it. Rule 40a search was run retroactively (nlb_wheel / T_seg / nlbFitTrainRope /
  nlbSignFactor / shape === "wheel"): zero prior occurrences on any branch, no duplicate work.

notes: Rule 36 for SEAM G is satisfied BY CONSTRUCTION, not by a test — wheel spin is
  `rotation.z = -s / r` read from the body's current position every frame, never accumulated. There
  is no dt in the expression, so 60 Hz and 120 Hz agree exactly and SET_TIME_FREEZE (dt = 0, s
  unchanged) reproduces the previous frame byte-for-byte. The harness asserts both anyway.

notes: SEAM H authoring constraint — space train carts ≥ ~1.5 m apart. A body is 1.1 m wide, so a
  tighter spacing overlaps the carts and there is no rope to draw. The engine hides a non-positive
  segment rather than drawing a backwards stub, so the symptom is a MISSING rope. (Found by the seam
  harness on a fixture that spaced 1.1 m carts 1.0 m apart, where a "rope is drawn?" check passed on
  a 0.05-long rope pointing backwards through two interpenetrating carts.)

notes: tension_force must teach BOTH halves — what tension is AND when it differs (T₁ vs T₂). Founder
  requirement 2026-07-30, and the entire reason the concept is not a duplicate of the sealed
  connected_bodies. Do not trim the T₁/T₂ states to save work; trim S1/S2 instead if the state count
  needs to come down.

notes: `tension_in_string` is a DEAD mechanics_2d concept that still owns the classifier synonyms
  `tension` and `rope_tension`. Redirect those to tension_force at registration time; leave
  `atwood_machine` → connected_bodies alone (that IS the sim that teaches Atwood).

notes: Neither normal_force nor friction_force is baseline-locked (no visual_baselines entry for
  either). Both are authored + founder-review-fixed but NOT visual:approve'd. Phase 3 rebuilds their
  review sites on the shared engine code so the founder reviews all four sims together.

notes: Auto-push hooks are live and shared across every worktree. Feature branches push on every
  commit; master does NOT (deliberate — needs an explicit `git push` or PM_AUTOPUSH_MASTER=1). Never
  force-push; the hook refuses to and so should any session.

notes: Do NOT run visual:approve, tts:*, PILOT_CONCEPTS, build:pilot or deploy:* without an explicit
  founder approval statement (Rule 17 / Rule 30h-i). The founder reviews the visuals personally in
  this run — there is no founder-proxy on this branch.
