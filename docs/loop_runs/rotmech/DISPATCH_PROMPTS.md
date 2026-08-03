# ROTMECH PHASE-0c — COPY-PASTE DISPATCH PROMPTS

**Where to run them:** open a Claude Code session with its working directory set to
`C:\Tutor\physics-mind-rotmech-engine` (the desk, branch `feat/rotmech-engine`).
**Not** `C:\Tutor\physics-mind` — that is master, and Rule 40 says engine work lands via a PR.

**Order:** Prompts 2 and 3 are independent of each other and of Prompt 1 — run them in either
order, or in two parallel sessions. Prompt 1 is a short VERIFICATION, not a build, and no longer
blocks anything (see the correction note below); run it whenever convenient.

**Correction applied 2026-08-03 (pre-dispatch code audit).** Three claims in the first draft of
this file were checked against `field_3d_renderer.ts` and did not survive:
1. E1 was described as a missing clock owned by `pcpl-surgeon`. The state-local clock **already
   exists** — `applyState()` rebases `stateStartTime` on every state apply (`:59254`), the
   published `PM_simTimeMs` is already state-local (`:63402`), and `newtons_laws_body` carries its
   own `eng.t_ms` rewound through one documented path (`nlbResetTrajectory`, `:45011`). The work
   is a verification, and it belongs to **field3d-surgeon** — `pcpl-surgeon` owns the 2D renderers,
   which contain no `stateStartTime` at all and would have refused on scope.
2. U1 and U3 collide with SEAM G (`rolling_friction`, 2026-07-30), which already ships a rolling
   wheel whose spin is a PURE FUNCTION of position. Prompt 3 now opens with a reconciliation step
   instead of presenting those two items as plain additions.
3. The U4 readout tokens were written in Unicode (`Rω`, `ω`). The codebase's enum tokens are ASCII
   identifiers, and `'omega'` already exists in a sibling enum at `:1700`. Prompt 3 now separates
   token spelling from display spelling.
`docs/loop_runs/rotmech/phase0_survey_amendment.md` carries the matching correction at U9/Part 3.

**These are chapter-opening Phase-0 builds** — the one case where the surgeons are dispatched
directly rather than by a FAIL routing (`docs/AUTHORING_PIPELINE.md` §0). Each prompt says so,
so the receiving session does not refuse on the "never call these directly" rule.

---

## PROMPT 1 — E1, the state-local clock: VERIFY, do not build (field3d-surgeon)

> Copy everything between the lines. **This is a verification, not a build.** Expect a report,
> and quite possibly a report that says "nothing to do."

---

Dispatch the **field3d-surgeon** agent for a planned Phase-0 chapter-opening verification. This
is the authorised direct-dispatch path in `docs/AUTHORING_PIPELINE.md` §0, not a cold call.

**Bug class:** `E1` — state-local physics clock, **verification only**.
**Owner tag:** `peter_parker:field3d_surgeon`.
**Branch:** you are already on `feat/rotmech-engine` in the desk. Work here. Never touch master.

**Do not write code until you have reported.** This dispatch exists because an earlier draft of
the build sheet claimed the state-local clock did not exist. A pre-dispatch audit found that it
does. Your job is to confirm that finding, or refute it, and to name any residual gap — NOT to
build a clock.

**The evidence to check first:**
- `field_3d_renderer.ts:59254` — `applyState()` sets `stateStartTime = time` on every state apply.
- `field_3d_renderer.ts:63402` — `window.PM_simTimeMs = (time - stateStartTime) * 1000`, commented
  in-place as "(state-local ms)".
- `field_3d_renderer.ts:45011` — `nlbResetTrajectory()`, described in the file as "the ONE rewind
  path", sets `eng.t_ms = 0` and `window.PM_nlbTimeMs = 0`, and re-arms `phase_fired`/`phase_active`.
- `field_3d_renderer.ts:66518` — the comment noting that `newtons_laws_body` **integrates** rather
  than posing from a closed form of `(time - stateStartTime)`, so a clock rebase alone does not
  rewind it; its accumulators are rewound explicitly.

**The question to answer, in writing:**
Do `eng.t_ms` / `PM_simTimeMs` already provide everything that `bodies[].activate_at_ms` (U10) and
`formula_overlay[].at_ms` (U16) need — a zero point that is the moment the state was entered, that
survives a `SET_TIME_FREEZE` pin byte-identically, and that a teacher lingering on a state cannot
drift? If yes, say so and stop. If there is a residual gap, describe it precisely and propose the
smallest change that closes it — then STOP and wait, do not implement it in this dispatch.

The `newtons_laws_body` integration note at `:66518` is the most likely place for a real gap. Give
it your attention specifically: does entering a state rewind the accumulators, or only
`RESET_TRAJECTORY`?

**Read for context:**
1. `docs/loop_runs/rotmech/phase0_survey_amendment.md` — Part 2 item **U9**, and Part 3
2. `docs/loop_runs/rotmech/rolling_on_incline/physics_block.md` — every per-state t-window
3. `docs/loop_runs/rotmech/pure_rolling/physics_block.md` — same

Read the physics blocks' timing rows as the *consumer* of the clock: your report should state
whether those rows can be authored as written against the clock that exists today.

**Invariants any eventual change would have to preserve** (context for your recommendation, not a
licence to start):
- Rule 36 — fixed 1/60 s stepping, 0–3 steps per frame, forced to 1 step under `SET_TIME_FREEZE`.
- Rule 37 — the explore state (`interaction_complete`) free-runs and is never auto-frozen.
- THE EYE's frozen-frame capture path stays byte-reproducible.

**Do not:** write or edit any renderer code in this dispatch, edit any concept JSON, run
`visual:approve`, run any `tts:*`, touch `PILOT_CONCEPTS`, run any `deploy:*`, or commit to
master. Report findings only.

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

The S5 brake numbers are in the physics block: τ = 0.92 N·m, **L 4.59 → 2.29 kg·m²/s**, ω 0.75,
KE 0.86, drum R 0.55. The engine computes these; the physics block is the prediction you check
against.

**Two cautions the physics block carries — read them before you build S5's choreography:**
- **"2.29" is two different quantities in these documents.** The L value above is 2.29 kg·m²/s at
  t = 4.0 s. Separately, the skeleton's max-τ *stop time* cell reads "2.29 s" and is a rounding
  slip — the correct value is **2.30 s** (carry-forward 1 in the physics block). Do not reconcile
  the wrong pair, and do not propagate the slip.
- **Carry-forward 2 — the 3.06 coincidence.** At t ≈ 3160 ms absolute (1.66 s into the decay), L
  momentarily equals 3.06, the same number as the constant `I_readout`. Different instruments,
  different units, no defect. **Do not co-glow those two readouts or stage any comparison at that
  instant** — a viewer would read a numeric coincidence as a physical identity. This constrains
  the glow choreography you write, which is why it is here and not left to be discovered.

**Rules that bind this build:** 29 (emphasis is brightness, never size), 32e (exactly one glow
focal at any instant), 33d (instruments show a live numeric reading and a needle that tracks),
34 (one formula surface per state, value-only HUD, real Unicode math on all three text paths —
DOM, `ctx.fillText`, and `createLabelSprite`), 36 (fixed-step clock), 37 (explore free-runs),
39f (widget auto-discovery — follow the conventions and ⚙ comes free), 40a (search before you
build: `git log --all -S "<symbol>"`).

**Also required:** register every new element type in the visible-elements matcher, and register
every new `*_at_ms` field in `src/lib/validators/visual/deriveStateMeta.ts` — an unregistered one
makes THE EYE false-fail.

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
**No E1 precondition.** An earlier draft blocked this build on E1 landing first. A pre-dispatch
audit found the state-local clock already exists (`eng.t_ms`, rewound by `nlbResetTrajectory` at
`:45011`; `PM_simTimeMs` state-local at `:63402`), so U10 and U16 build against what is there.
Prompt 1 is now a parallel verification and does not gate you.

---

### STEP ZERO — reconcile with SEAM G before you build anything

**Report first, build second.** Two of the sixteen items collide with code that already exists,
and the collision is with a documented invariant, not with an accident. Work this out on paper and
state your position **before** you write a line:

- **SEAM G** (`rolling_friction`, 2026-07-30) already ships a rolling wheel — `bodies[].shape ===
  'wheel'`, constants at `:39628`, spin drive at `:40033`. Its spin is a **pure function of
  position**: "Rolling without slipping is s = r·θ, so the wheel's angle is a pure FUNCTION of
  where the body currently is — read, never accumulated." The file states two guarantees that hang
  off that choice: Rule 36 holds *by construction* (no dt in the expression), and `SET_TIME_FREEZE`
  is byte-stable for free, so THE EYE's frozen baselines cannot drift.
- **U1 requires an independent ω integrator** (`omega0_rad_s`, slip in both directions). Slipping
  means s ≠ rθ. That severs the pure-function link, and with it the two guarantees above. **How do
  you preserve Rule 36 and frozen-baseline byte-stability once ω is integrated independently?**
  Answer that before building. A plausible shape is to keep the pure-function path for the
  rolling branch and enter the integrator only on the slip branch, but decide it deliberately and
  write down what you decided.
- **U3 requires per-body `radius_m`.** `NLB_WHEEL_R = NLB_BODY_SIZE / 2` is marked `do NOT decouple
  from NLB_BODY_SIZE` (`:39639`), for two stated reasons: `nlbSetBodyPosition` already lifts a body
  to `NLB_BODY_SIZE / 2`, so a wheel of that radius touches y = 0 **with no positioning branch**;
  and equal footprint is what makes the side-by-side race honest. **A present `radius_m` reinstates
  the positioning branch and reopens the race-honesty question.** Say how you handle both.
- **U4 is partly built already.** SEAM G's wheel carries a hub disc + crossed spokes precisely so
  rotation is visible on a rotation-invariant silhouette ("load-bearing pedagogy, not decoration").
  U4's "rotation marker" is an **extension of that**, not new construction. Do not build a second
  marker system.

Post your reconciliation as a short written position, then proceed. If any of the three has no
clean answer, that is an escalation, not something to improvise past.

---

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

**Scope note on U4:** the `readouts` enum extension covers **three** readouts — contact-point
speed, Rω, and bare ω — declaration, reader, and validator co-edit for each. The earlier draft
named only bare ω; that gap was closed in the amendment. Build all three.

**Token spelling vs display spelling — do not conflate them.** The enum members are ASCII
identifiers, matching every existing enum in this file; the Unicode belongs on screen only.
`'omega'` **already exists** as a token in the sibling circular-motion enum at `:1700`
(`'theta' | 'v' | 'omega' | 'r' | 'a_c'`) — follow that precedent exactly. The
`newtons_laws_body` enum you are extending is at `:1336`. So: tokens `'contact'`, `'r_omega'`,
`'omega'`; rendered labels `Rω` and `ω` in real Unicode per Rule 34c, which governs on-canvas
text and **not** TypeScript identifiers.

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
