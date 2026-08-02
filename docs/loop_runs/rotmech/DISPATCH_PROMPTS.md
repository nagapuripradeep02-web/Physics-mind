# ROTMECH PHASE-0c — COPY-PASTE DISPATCH PROMPTS

**Where to run them:** open a Claude Code session with its working directory set to
`C:\Tutor\physics-mind-rotmech-engine` (the desk, branch `feat/rotmech-engine`).
**Not** `C:\Tutor\physics-mind` — that is master, and Rule 40 says engine work lands via a PR.

**Order:** Prompt 1 first (or in its own session alongside). Prompts 2 and 3 are independent
of each other; either order, or in parallel sessions.

**These are chapter-opening Phase-0 builds** — the one case where the surgeons are dispatched
directly rather than by a FAIL routing (`docs/AUTHORING_PIPELINE.md` §0). Each prompt says so,
so the receiving session does not refuse on the "never call these directly" rule.

---

## PROMPT 1 — E1, the state-local physics clock (pcpl-surgeon)

> Copy everything between the lines.

---

Dispatch the **pcpl-surgeon** agent for a planned Phase-0 chapter-opening build. This is the
authorised direct-dispatch path in `docs/AUTHORING_PIPELINE.md` §0, not a cold call.

**Bug class:** `E1` — state-local physics clock rebase.
**Owner tag:** `peter_parker:renderer_primitives`.
**Branch:** you are already on `feat/rotmech-engine` in the desk. Work here. Never touch master.

**Read first, in this order:**
1. `docs/loop_runs/rotmech/phase0_survey.md`
2. `docs/loop_runs/rotmech/phase0_survey_amendment.md` — Part 2 item **U9**, and Part 3
3. `docs/loop_runs/rotmech/rolling_on_incline/physics_block.md` — every per-state t-window
4. `docs/loop_runs/rotmech/pure_rolling/physics_block.md` — same

**The job.** Every timing row in both rolling concepts is written relative to the moment its
own state begins. Today the physics clock does not rebase on a state change, so an authored
`at_ms` means "since the sim loaded", which is wrong for every state after the first and
drifts further the longer a teacher stays on a state. `activate_at_ms` (U10) and
`formula_overlay[].at_ms` (U16) are both meaningless without this, which is why E1 blocks
both 0c builds.

Rebase the physics clock per state apply. Preserve, do not break:
- Rule 36 — fixed 1/60 s stepping, 0–3 steps per frame, forced to 1 step under `SET_TIME_FREEZE`.
  Every integrator stays linear in dt. Never hardcode a per-frame delta.
- Rule 37 — the explore state (`interaction_complete`) free-runs and is never auto-frozen.
- THE EYE's frozen-frame capture path must stay byte-reproducible.

**Before you build:** run `git fetch origin && git log --all -S "<symbol>" --oneline` for the
clock symbols you plan to add (Rule 40a). The parametric player clock has already been built
twice independently. Confirm this does not exist somewhere already.

**Verify chain, all must pass before you report:**
```
npm run check:renderer-syntax
npx tsc --noEmit
npm run validate:concepts
```

**Back-compat acceptance.** Same-session A/B THE EYE on two existing concepts that use the
timing path — pick from the baseline-locked fleet, and say which you picked and why.
Criterion: H2 passes its tolerance, and any non-zero diff percentage either reproduces on the
pre-change renderer or has a max channel delta ≤ 3.

**Do not:** edit any concept JSON, run `visual:approve`, run any `tts:*`, touch
`PILOT_CONCEPTS`, run any `deploy:*`, or commit to master. Report what you changed and what
the verify chain returned.

---

## PROMPT 2 — 0c-1, the `rigid_body_rotation` scenario (field3d-surgeon)

> Copy everything between the lines.

---

Dispatch the **field3d-surgeon** agent for a planned Phase-0 chapter-opening build. This is the
authorised direct-dispatch path in `docs/AUTHORING_PIPELINE.md` §0, not a cold call, and it is
the named exception to Amendment 4's one-bug-class rule: a Phase-0 scenario build is a single
coherent unit of work.

**Bug class:** `0c-1` — a NEW `scenario_type` called `rigid_body_rotation` in
`field_3d_renderer.ts`, with the mandatory `deriveStateMeta.ts` co-edit.
**Owner tag:** `peter_parker:field3d_surgeon`.
**Branch:** you are already on `feat/rotmech-engine` in the desk. Work here. Never touch master.

**Read first, in this order:**
1. `docs/loop_runs/rotmech/phase0_survey.md` — the 0c-1 union table
2. `docs/loop_runs/rotmech/phase0_survey_amendment.md` — **Part 1**, the four addenda A/B/C/D
3. `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` — REV 4, `DESIGN_OK`
4. `docs/loop_runs/rotmech/conservation_of_angular_momentum/physics_block.md` — the numbers

**What you are building.** One configurable scenario serving twelve concepts in this chapter.
Build it against the union in the survey plus the four amendment addenda:
- **A** — `reference_marks[]` in TWO surface forms: a labelled value chip with a match cue beside
  a value-only readout, and a labelled tick on a bar scale. A value-only readout has no scale, so
  these are genuinely two surfaces, not one parameterised one.
- **B** — a visible brake actuator, `brake_drum_radius_m`, and a drawn drum reference line. The
  pad is a real rendered object, never an implied torque.
- **C** — a re-pin cue: a ≥0.5 s hold with readouts blanked, fired on any restart that
  re-initialises L, so a discontinuity reads as a restart and not as an uncaused torque.
- **D** — bounded/asymptotic mapping for the pull-force arrow (founder ruling, 2026-08-02).
  Guided states span 3.60–19.35 N. The explore state's slider corners (m 5.0, r 0.90, ω₀ 3.0)
  reach hundreds of newtons. A fixed linear scale clips there. Keep guided-state arrow lengths
  comparable and degrade gracefully at the corners.

The S5 brake numbers are in the physics block: τ = 0.92 N·m, L 4.59 → 2.29, ω 0.75, KE 0.86,
drum R 0.55. The engine computes these; the physics block is the prediction you check against.

**Rules that bind this build:** 29 (emphasis is brightness, never size), 32e (exactly one glow
focal at any instant), 33d (instruments show a live numeric reading and a needle that tracks),
34 (one formula surface per state, value-only HUD, real Unicode math on all three text paths —
DOM, `ctx.fillText`, and `createLabelSprite`), 36 (fixed-step clock), 37 (explore free-runs),
39f (widget auto-discovery — follow the conventions and ⚙ comes free), 40a (search before you
build: `git log --all -S "<symbol>"`).

**Also required:** register every new element type in the visible-elements matcher, and register
every new `*_at_ms` field in `deriveStateMeta.ts` — an unregistered one makes THE EYE false-fail.

**Verify chain, all must pass before you report:**
```
npm run check:renderer-syntax
npx tsc --noEmit
npm run validate:concepts
```
Then a THE EYE run on an existing field_3d concept of your choice to prove no regression, and
say which you picked.

**Do not:** author or edit any concept JSON (that is 0d, after this PR merges), run
`visual:approve`, run any `tts:*`, touch `PILOT_CONCEPTS`, run any `deploy:*`, change schema
beyond the additive fields named above, or commit to master. If you approach your call ceiling,
stop and write a handoff note rather than rushing the tail.

---

## PROMPT 3 — 0c-2, the `newtons_laws_body` extension (field3d-surgeon)

> Copy everything between the lines.

---

Dispatch the **field3d-surgeon** agent for a planned Phase-0 chapter-opening build. This is the
authorised direct-dispatch path in `docs/AUTHORING_PIPELINE.md` §0, not a cold call, and it is
the named exception to Amendment 4's one-bug-class rule: this sixteen-item union is one bounded
extension of one existing scenario, signed as a single unit.

**Bug class:** `0c-2` — a bounded extension of the existing `newtons_laws_body` scenario in
`field_3d_renderer.ts`, with the mandatory `deriveStateMeta.ts` co-edit.
**Owner tag:** `peter_parker:field3d_surgeon`.
**Branch:** you are already on `feat/rotmech-engine` in the desk. Work here. Never touch master.
**Precondition:** E1 (the state-local clock) must be landed on this branch first. If it is not
there, stop and say so — U10 and U16 are meaningless without it.

**Read first, in this order:**
1. `docs/loop_runs/rotmech/phase0_survey_amendment.md` — **Part 2**, the U1–U16 build sheet.
   This is your scope. Nothing outside it.
2. `docs/loop_runs/rotmech/rolling_on_incline/skeleton.md` — REV 6, `DESIGN_OK`. Read the
   **ACTIVATION SEMANTICS** block in full; it is canonical for the pair.
3. `docs/loop_runs/rotmech/rolling_on_incline/physics_block.md`
4. `docs/loop_runs/rotmech/pure_rolling/skeleton.md` — REV 3, `DESIGN_OK`. Its activation
   paragraph is imported verbatim from REV 6.1 of the sibling; if you change one, you change
   both in the same session and restate the source revision. That is a paired edit, and
   "the sibling quotes this verbatim" is a claim to be diffed, never asserted.
5. `docs/loop_runs/rotmech/pure_rolling/physics_block.md`

**Three things that have already bitten this design — do not re-derive them:**

1. **`nlbDriveArrowsForBody` (around `:40815`) reads arrow magnitudes LIVE off the body.**
   An authored arrow magnitude is a *prediction of what the engine will report*, never an
   instruction to it. "Not integrated" in the activation semantics means s and v do not advance
   — it does **not** mean the forces are not solved.
2. **Presence is resolved by `typeof`/`in`, never truthiness.** `lane_gap_m = 0`,
   `activate_at_ms = 0` and `visible_before_activation: false` are all legal falsy values.
   `x || DEFAULT` silently restores the old constant and reproduces the exact defect the field
   was bought to fix.
3. **The timed surface is exactly TWO field classes** — `bodies[].activate_at_ms` and
   `formula_overlay[].at_ms`. No per-arrow reveal, no per-label reveal, no choreography DSL.
   The founder ruled per-arrow reveal OUT: arrows are static from entry and sequenced by
   `phases[].glow_focal`. **If you find yourself needing a third timed class, STOP and report
   it — that is the Phase-0 alarm rule, not a thing to build.**

**Scope note on U4:** the `readouts` enum extension covers **three** tokens — `contact`, `Rω`,
and bare `ω` — declaration, reader, and validator co-edit for each. The earlier draft named only
bare `ω`; that gap was closed in the amendment. Build all three.

**Every field you add is OPTIONAL. Absent must mean today's behaviour, byte-identically.**

**Rules that bind this build:** 29, 32e, 33d, 34, 36, 37, 39f, 40a — same list as 0c-1.
Register every new element type in the visible-elements matcher and every new `*_at_ms` in
`deriveStateMeta.ts`.

**Verify chain, all must pass before you report:**
```
npm run check:renderer-syntax
npx tsc --noEmit
npm run validate:concepts
```

**Back-compat acceptance, mandatory here.** Same-session A/B THE EYE runs on `rolling_friction`
and `work_done_by_constant_force` — both existing `newtons_laws_body` consumers. Criterion: H2
passes its tolerance, and any non-zero diff percentage either reproduces on the pre-change
renderer or has a max channel delta ≤ 3. A diff you cannot explain is a fail, not a
re-baseline.

**Do not:** author or edit any concept JSON (that is 0d, after this PR merges), run
`visual:approve`, run any `tts:*`, touch `PILOT_CONCEPTS`, run any `deploy:*`, or commit to
master. If you approach your call ceiling, stop and write a handoff note rather than rushing
the tail.

---

## AFTER ALL THREE LAND

The desk gets carried to a PR by the **git-steward** agent, not by hand:

> Dispatch the **git-steward** agent. The desk `C:\Tutor\physics-mind-rotmech-engine` on branch
> `feat/rotmech-engine` holds the rotmech Phase-0c engine build. Sync `origin/master`, run the
> full verify chain, stage the named file list, commit, push, and open the PR. Stop and route to
> the owning surgeon on any conflict under `src/`.

**Phase 0d — authoring the eighteen remaining concepts as pure JSON — does not open until that
PR merges** (Rule 40: engine files are platform, and a chapter branch must not sit on top of
unmerged engine work). A second desk for 0d opens then, not now.
