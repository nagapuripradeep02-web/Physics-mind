# PARK NOTE — `newton_first_law` (lom-b concept 1/3)

**Parked 2026-07-25.** Status: **content COMPLETE and PASSING; blocked on ONE engine defect.**
This is NOT an `engine_gap.md` — the `newtons_laws_body` engine has every capability this concept
needs (both upstream agents independently confirmed "ENGINE GAP: none", and the concept is authored
as pure configuration per spec §6). The blocker is a *defect* in the inherited engine, which
`docs/CHAPTER_LOOP.md` §5 explicitly classes as a §3b engine-loop item, not an escalation.

## Why it is parked rather than fixed

The §3b routing rule (Amendment 4) is: **field_3d engine work goes to the `field3d-surgeon` agent,
never a general-purpose dispatch** (~3.4M tokens vs ~25M for the same work). `field3d-surgeon` is
present on disk (`.claude/agents/field3d-surgeon.md`, and `npm run check:agents` reports 11/11) but
is **not in this session's dispatch registry**:

```
Agent type 'field3d-surgeon' not found. Available agents: architect, claude, Explore, eye-walker,
feedback-collector, general-purpose, json-author, physics-author, Plan, quality-auditor,
retrofit-surgeon, statusline-setup
```

It was added on `feat/lom-a` after this session's registry was built — the known "a new agent type
dispatches natively only from the NEXT session" behaviour. So the one permitted route to this fix is
closed for the duration of this session, and the two alternatives are both barred:

- a `general-purpose` dispatch — **banned by Amendment 4** for field_3d engine work;
- the orchestrator editing the renderer itself — **banned by §0.1** (the orchestrator never reads
  `field_3d_renderer.ts`, ~2.3 MB).

Zero repair attempts were made, so the §3b two-attempt budget is **untouched** — the next session can
dispatch `field3d-surgeon` and land the fix immediately.

## The blocking defect

`field3d_nlb_physics_clock_not_state_local` — **CRITICAL**, owner `peter_parker:renderer_primitives`.
Full row appended to `docs/loop_runs/lom/_engine/scar_candidates.sql` (report only; no DB write).

`updateNewtonsLawsBodyFrame` accumulates `eng.t_ms` from a per-tick wall-clock `dtStep` that is never
rebased by `RESET_TRAJECTORY`, unlike every other reveal timeline in the file (which is a pure
function of `time - stateStartTime` and IS rebased). The body starts integrating the instant
`applyNewtonsLawsBodyState` builds a fresh `eng` at `SET_STATE`, before the state-local reveal window
opens. Any gap between state entry and reveal start (THE EYE's capture overhead, ~1–4 s; equally a
teacher pausing before pressing Play) advances the body by an uncontrolled amount.

| State | Symptom | Evidence frame |
|---|---|---|
| STATE_1 `coast_no_force` | `v` correct (1.00) through t=15000, but the frozen H2 pin reads `v = 0.00` — block hit the +10 m bound and stopped, contradicting the "No force — never slows" cue at exactly the frame a teacher leaves frozen | `.visual_runs/newton_first_law/20260725-191906/STATE_1__frozen.png` |
| STATE_2 `coast_with_friction` | FIRST capture already reads `v = 0.02` m/s (98% decelerated from v₀ = 1.0) — the ~4 s deceleration the state exists to teach happens before the reveal clock starts; state renders as a static block for its full ~14 s | `.visual_runs/newton_first_law/20260725-191906/STATE_2__panel_a.png` |

This undermines the concept's PRIMARY aha: STATE_2 is the declared contrast pair for STATE_1's
never-slows claim, and it currently shows no motion to contrast against.

**Named fix for the next dispatch** (do not re-derive): make the nlb integrator state-local — either
gate accumulation on the `(time - stateStartTime)` basis the other reveal systems already use, or
hold the engine at `dt = 0` from `SET_STATE` until the first `RESET_TRAJECTORY` / Play and rebase
`eng.t_ms` there. Follow the `kt` (`kinematics_1d_track`) `RESET_TRAJECTORY` convention rather than
inventing a mechanism. Preserve Rule 36 (linear in `dt`, no `+= 0.016`, byte-stable under
`SET_TIME_FREEZE`) and Rule 37 (the sandbox state must keep free-running).

**Re-seed is required before re-running THE EYE** — the sim HTML is assembled from the renderer and
cached, so a renderer edit does not reach THE EYE without
`npx tsx --env-file=.env.local src/scripts/_seed_newton_first_law_cache.ts`.

## Second, non-blocking finding

`field3d_nlb_phase_glow_handoff_not_visible` — MODERATE, owner **ambiguous** (renderer glow
application vs authored phase tuning). STATE_3's authored `weight → normal` glow handoff at 4000 ms
fires in code but produces no perceptible brightness delta. Also in `scar_candidates.sql`. Not
dispatched: Amendment 4 allows one `bug_class` per engine dispatch, and needs founder triage on
ownership first.

## What is already done and should NOT be re-run

| Stage | Artifact | Result |
|---|---|---|
| architect | `skeleton.md` | 4 states, no engine gap |
| physics-author | `physics_block.md` | binding numbers; caught + corrected a trajectory arithmetic error in the skeleton |
| json-author | `src/data/concepts/newton_first_law.json` + 4 registration sites + SQL migration | `tsc` 0 errors · `validate:concepts` PASS |
| THE EYE | `.visual_runs/newton_first_law/20260725-191906/` | 19 checks, 19 passed, 0 failed, $0 |
| quality-auditor | `quality_auditor_report.md` | **VERDICT: PASS** (both open items adjudicated acceptable; zero scar candidates from the audit) |
| eye-walker | `eye_walker_report.md` | **EYE VERDICT: 2 CANDIDATE(S)** — the blocker above + the MODERATE one |

`npm run visual:approve` was **NOT** run — Amendment 6 auto-approve requires quality-auditor PASS
*and* eye-walker clean. eye-walker was not clean, so the gate correctly did not fire. There is no
visual baseline for this concept yet, by design.

## Resume recipe for the next session

1. Dispatch `field3d-surgeon` with the single `bug_class`
   `field3d_nlb_physics_clock_not_state_local` and the named fix above.
2. Verify chain: `check:renderer-syntax` → `tsc --noEmit` → `validate:concepts` →
   `cache:clear:scoped -- newton_first_law` → re-seed → `visual:eyes -- newton_first_law` →
   regression sample `gauss_law_sphere`, `gauss_law_solid_sphere` (locked baselines — an H2 diff
   there is a real regression, not a re-baseline).
3. Commit the engine fix separately:
   `fix(engine): field3d_nlb_physics_clock_not_state_local [owner: peter_parker:field3d_surgeon]`,
   append the SHA to `engine_commits:` and a line to `docs/loop_runs/lom_engine_log.md`.
4. Re-dispatch eye-walker on the fresh frames. If clean (quality-auditor already PASSed and the
   concept JSON is unchanged), run `npm run visual:approve -- newton_first_law` and SEAL.

**Runaway-guard note:** this branch's `engine_commits:` is still 0. The state file's threshold is 3
(the chapter-wide `CHAPTER_LOOP` §3b threshold is 5). One defect surfacing on the first concept is
not yet evidence that the Phase 0 engine under-generalized — but it IS the first data point, and it
was invisible to all 19 deterministic gates, which is worth the founder's attention.
