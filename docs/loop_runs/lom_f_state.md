# lom-f loop state — Laws of Motion, momentum tray

updated: 2026-08-01 (**PHASE 1 CLOSED for this session — `impulse` built, audited, repaired through TWO
         founder video reviews, and driven by the founder. 11 commits. Runaway guard raised 2 → 8 by the
         founder across four separate rulings, all spent. 17 rows in `engine_bug_queue`. THE EYE 35/35,
         harness 95/95, validator 147 PASS / 0 FAIL. NOT sealed, NOT approved — no `visual:approve`, no
         TTS, no catalog, no deploy. NEXT: `conservation_of_momentum` in a FRESH session, founder's call.
         Full narrative in PROGRESS.md's top entry.**

         Engine commits, in order: `4ecae93` mbSetParam state-guarding (+ mass branch) · `bfabb6c`
         param_ramp step mode + Gate 8n · `28ec871` cherry-picked lom-g EYE capture fix (a stalled pin is
         now FATAL) · `828c715` MB_TR_H → MB_TRACE_H · `311b5ea` contact element/label/seize-lease ·
         `8fc6be4` departure-based re-arm · `08142ec` contact element DELETED + slow_window.from_cycle.
         Content: `c8f980a` B1+R4 · `39a89cf` B4+B5 · `3d82ed7` wall labels · `11db1a1` STATE_5 camera ·
         `b6c4b24` focals + from_cycle · `f0106cf` natural_length 0 · `2e77895` ball labels.

         STILL OPEN for the founder: STATE_3's frozen review frame lands after a real-speed release (live
         playback is CORRECT — only the captured still is wrong; the reveal-pin cushion is tied to the old
         always-slowed behaviour) · the STATE_5 HUD shows two rows both headed "ball" (R1 reopened by
         founder ruling; fixing it needs the readout header sourced from the lane, i.e. a renderer change,
         not authoring) · the padded wall's peak interpenetration is 38% of a ball diameter, which may read
         as the soft wall yielding or as clipping · the guided ramp states 4/6/7 do not author
         `trusted_drag_seizes`, so a teacher's drag there is overwritten by the scripted sweep next frame
         (pre-existing, different bug_class, deliberately not widened into).)

previously: 2026-07-31 (**PHASE 1 — B2/B3 FIXED (`4ecae93`), step mode IN FLIGHT.** Founder ruled on
         both open questions and RAISED THE RUNAWAY GUARD 3 → 4 for one more engine commit. B2+B3
         landed as ONE bug_class in one dispatch; the surgeon then surfaced a THIRD defect
         (`param_ramp` sweeps through free flight) which is now the in-flight dispatch. B1 + R4 are
         queued behind it. See "Phase 1 — resolution log" below.)

previously: 2026-07-31 (**PHASE 1 — `impulse` AUTHORED, quality-auditor FAIL.** Pipeline ran clean
         (architect → physics-author → json-author); `tsc` 0, `validate:concepts` **146 PASS / 0
         FAIL**. Auditor found 3 BLOCKING, and **2 of the 3 are ENGINE defects in the `v1` ramp
         write-path — an unproved Phase-0 seam.** STOPPED per the runaway guard. Visual gate NOT
         run, per the stop line. See "Phase 1" below.)

previously: 2026-07-31 (**PHASE 0 COMPLETE** — SEAMs A + B + C all green. Harness PASSES 63/63.
         Assertion 4 CLEARED and the TWO-LANE payoff beat now proved. Every key in the spec's §1
         config surface has behaviour — nothing parses-and-ignores. New sentinel VERIFIED
         deterministic. Paused for founder review before authoring begins.)

design: docs/MOMENTUM_BENCH_ENGINE_SPEC.md  (founder-approved 2026-07-30)
worktree: C:\Tutor\physics-mind-lom-f
branch: feat/lom-f-momentum
base: master @ 06a3ee0 (clean cut — deliberately NOT feat/lom-a, see the note below)
review_port: 8092          (8080-8082 / 8087-8091 / 8099 are in use by other worktrees)
regression_sample: electric_field_point_charge, coulombs_law   (REASSIGNED 2026-07-31 — see
                   "Sentinel swap" below. Do NOT use gauss_law_sphere.)

chapter_map (founder-approved 2026-07-30, in build order):
  1. impulse                    — NCERT ball-and-wall, stiffness as the taught variable
  2. conservation_of_momentum   — two carts, elastic / inelastic / explosion

next: **Step-mode dispatch is IN FLIGHT** (`param_ramp.mode: 'step'`). When it lands: apply B1 + R4 to
      `impulse.json` via `alex:json_author`, re-run the verify chain, then re-dispatch quality-auditor.
      The visual gate stays deferred until this tray cherry-picks lom-g's capture fix.

## Phase 1 — resolution log (2026-07-31, founder present)

**Founder ruling 1 — B2 + B3 as ONE dispatch.** Both defects were adjacent branches of the same
if/else chain in `mbSetParam`, i.e. genuinely one `bug_class` ("writes are not state-guarded"), so
one dispatch and one commit — landing the guard at 3 of 3 rather than breaching to 4. **DONE:
commit `4ecae93`.** Verify chain fully green: `check:renderer-syntax` OK · `tsc` 0 · `validate:concepts`
146 PASS / 0 FAIL · harness **63 → 69/69, 0 failed** (all 6 new checks fail on the pre-fix engine and
pass after) · regression EYE `electric_field_point_charge` 44/44 all 14 H2 entries 0.00% and
`coulombs_law` 50/50 all 16 entries 0.00% · Rule 36b clock guard NOT tripped (zero diff lines touch
`__pmSteps`/`dtStep`/`__pmAccumMs`/`__pmLastWall`).

Fix shape: a body is **STAGED** from arming until it first meets a contact and **SPENT** thereafter
(mid-impact *and* flying away) — only a staged body may have its live `v` retimed; `b.v0 = val` still
runs unconditionally so the per-cycle re-arm is preserved. For `k`, a write into an already-solved
segment is DEFERRED (`mbContactBusy(c) = c.engaged && !c.latched`, tested per-contact so a busy lane
never blocks a free neighbour); no pending value is stored because the ramp is closed-form of the
clock, so the deferred write self-heals on the first free frame.

**A THIRD manifestation was found and fixed in the same class:** an unguarded mid-contact **mass**
write moved `p = mv` instantly and broke `Σp` by **2–3% across a contact** — in the one scenario whose
entire job is conserving `Σp`. Now conserved to `1.5e−14 %`. Taken under the Amendment-4 "same file
AND same root cause" exception.

**Founder ruling 2 — R4: DROP the `c` slider from STATE_8.** Damping makes the contact
non-conservative, so a teacher dragging `c` in the sandbox silently breaks the equal-area invariant
(`∫F dt = 2mv`) the whole concept rests on — and no state teaches damping. Rule 38b (explore surfaces
CORE-ring only) points the same way. `controls_visible` becomes `["m1","v1","k"]`. **QUEUED**, applied
with B1.

**Founder ruling 3 — guard RAISED 3 → 4 for `param_ramp.mode: 'step'`.** The surgeon's report flagged
a residual it declined to fix unilaterally: the staged boundary must be "has not yet met a contact"
(not "has not yet moved") to keep check C5 and the Rule-31 live-instrument contract, so under a `v1`
ramp the **run-up speed still tracks the ramp** — a free ball accelerating with nothing touching it,
with the climbing number printed in the HUD (`readouts` include `v` on both S4 and S7).

Measured, using the contract's contact formula (contact begins at ball centre `s = 1.02`; both states
start the ball at `−1.6`, so every approach is a **2.62 m run-up**):

| state | ramp | `end_ms` | rate | run-up drift |
|---|---|---|---|---|
| S4 as authored | v₁ 1.5→3.0 | 4894 | 0.31 m/s² | 1.50 → 2.04 (**+36%**) |
| S7 as authored | v₁ 1.5→6.0 | 4894 | 0.92 m/s² | 1.50 → 3.11 (**+107%**) |
| S6 (k ramp) | k 2000→200 | — | — | **none** — stiffness acts only during contact |

**Lengthening `end_ms` cannot reach zero** — the fraction of the sweep leaking into each run-up is
`t_runup / T_cycle` regardless of ramp length (S4 → +9%, S7 → +36% at 4× the length). The root cause is
a mismatch: the pedagogy is DISCRETE ("each bounce launches faster"), the mechanism is a CONTINUOUS
sweep. Every JSON workaround (shorter run-up, narrower range, hiding the `v` readout) trades away
pedagogy AND leaves residual drift — and none is visually verifiable while the visual gate is deferred.
Hence the engine fix: quantise the clock to the cycle boundary
(`t_q = floor(t/repeat) * repeat`) so the value is constant within a cycle and steps only at re-arm.
Stays closed-form (Rule 36 pin/rewind safe), does not touch `mbSetParam`, and a teacher's live drag is
unaffected because drags bypass the ramp.

**DONE — step mode shipped as `bfabb6c`.** Harness 69 → **77/77, 0 failed**; free-flight drift measured
**0.000000000** across 26/17/12 run-up frames per cycle (continuous, same fixture: +15.33% / +6.67% /
+3.67%). `mode` defaults to `'continuous'`, which is the old arithmetic character-for-character — C13e
proves `continuous` and `mode`-absent produce byte-identical 250-frame sequences. Rewind/pin determinism
proved (2600 → 7000 → 2600 returns byte-identical bodies JSON). New **Gate 8n** rejects `mode:'step'`
without `repeat_every_ms > 0`; renderer logs once at state-apply and degrades to continuous.
Verify chain green: `tsc` 0 · `validate:concepts` 146 PASS / 0 FAIL · EYE `electric_field_point_charge`
44/44 (14 H2 @ 0.00%) + `coulombs_law` 50/50 (16 H2 @ 0.00%) · Rule 36b NOT tripped.

### B1 sizing — FINAL values (N=3 on all three; in flight with `alex:json_author`)

`end_ms = N × repeat_every_ms` gives N+1 launches at `from + (to−from)·i/N`, spanning `from`→`to`
INCLUSIVE. All three states take **N=3 → four launches on round numbers**:

| state | `repeat_every_ms` | `end_ms` | launches |
|---|---|---|---|
| STATE_4 | 4894 | **14682** | v₁ = 1.5, 2.0, 2.5, 3.0 |
| STATE_6 | 3966 | **11898** | k = 2000, 1400, 800, 200 |
| STATE_7 | 4894 | **14682** | v₁ = 1.5, 3.0, 4.5, 6.0 |

**STATE_6 takes `mode:'step'` too — overriding the engine author's "leave S6 continuous" advice.**
Its `k` ramp has no run-up drift (stiffness acts only during contact) so that advice was right on the
narrow question, but it misses the narration: all three states narrate explicit ENDPOINTS ("ramps down
from 2000 to 200"), and a continuous sweep never lands on an endpoint at a launch — the engine run
measured k hitting **1906/1374/834/294, never 2000 and never 200**. Step mode hits both endpoints
exactly, which is what makes the sentence true. Same reasoning covers S4 and S7.

Narration cross-check done before dispatch: S6's "area stays fixed at 6.00 N·s" ✓ (m=1.0, v=3.0 →
2mv = 6.00); S7's "contact time pinned at 70 ms, does not depend on speed" ✓
(t_c = π√(μ/k) = π√(1/2000) = 70.2 ms, amplitude-independent for a linear spring).

## Phase 1 — `impulse` (2026-07-31): authored, audited, FAILED, stopped

Pipeline artefacts (each stage read its input BY PATH, nothing pasted):
`docs/loop_runs/lom_f/impulse/00_BRIEF.md` (founder brief) →
`01_architect_skeleton.md` → `02_physics_block.md` → `src/data/concepts/impulse.json`.

**Authoring is COMPLETE and mechanically clean.** 8 states (7 guided + explore).
`npx tsc --noEmit` 0 errors · `npm run validate:concepts` **146 PASS / 0 FAIL** (was 145),
`impulse.json` PASS with zero WARN lines · all 8 registration sites done (site 7 `PCPL_CONCEPTS`
correctly N/A — this is field_3d) · drill-down cluster migration authored and **unapplied** by design.

**The founder's mandated payoff beat (S5) is numerically perfect and must not be touched.** Probe on
the real renderer: padded `k=200` → `222.1 ms / 42.43 N / area 6.0000`; rigid `k=2000` →
`70.2 ms / 134.16 N / area 5.9998`; both on ONE shared axis. Areas 0.0033% apart, peaks 3.162× (√10).

### quality-auditor verdict: **FAIL** — 3 BLOCKING, 6 ride-along, 3 deferred

The auditor could not use THE EYE (stop line), so it drove the REAL emitted renderer headlessly with
the real `impulse.json` and read engine state + DOM geometry. That is how it caught defects a
screenshot gate would have missed.

**B1 — the three ramp states never show the trend their narration claims** `[owner: alex:json_author]`
`param_ramp.end_ms` equals `repeat_every_ms` on S4/S6/S7 (`4894/4894`, `3966/3966`, `4894/4894`), so
the whole ramp is consumed inside the FIRST repeat cycle and every later cycle is identical.
Measured S4 peaks: `87.92, 105.02, 120.37, then 134.16 ×4 constant`. Direct hit on the OPEN scar
`teach_visual_must_match_narration`. Fix is one line per state (`end_ms` must span several cycles) —
**but it cannot be verified until B2 lands.**

**B2 — on a `v1` ramp the ball can never leave the wall** `[owner: peter_parker:field3d_surgeon]`
`mbRunParamRamp` calls `mbSetParam` EVERY FRAME with no churn guard and no early-out after
saturation (`field_3d_renderer.ts:42271-42280`), and `mbSetParam` overwrites live velocity whenever
the body is not engaged (`:42210-42226`) — erasing the NEGATIVE post-rebound velocity. Measured: 15
contact events where ~4 belong, clustered exactly 71 ms apart (one contact duration); the free ball
also visibly ACCELERATES during its approach with nothing touching it. Control: S2, identical
apparatus, no ramp → 5 clean bounces at `70.2 ms / 134.16 N` each. **No JSON value avoids this while
`param_ramp.param === 'v1'`.**

**B3 — a mid-contact `k` write breaks elasticity** `[owner: peter_parker:field3d_surgeon]`
`mbSetParam` writes `eng.contacts[0].k` unconditionally, including while `c.engaged` is true
(`:42226-42229`), changing stiffness underneath an already-solved contact segment. Measured S6 first
event: `k=1601, 82.8 ms, 111.13 N, area 5.8136`, ball departs at `−2.811 m/s` instead of `−3.000`.
Closed forms for a fixed `k=1601` give `120.04 N / 78.5 ms` — the observed pair matches NEITHER,
confirming the mid-contact rewrite.

**Routing correction (orchestrator):** the auditor tagged B2/B3 `peter_parker:renderer_primitives`.
That agent was renamed **`pcpl-surgeon`** on 2026-07-31 and now owns the 2D renderers only. The root
cause is in `field_3d_renderer.ts`, so the correct owner is **`peter_parker:field3d_surgeon`**.

### Why Phase 0 missed this — an honest gap in my own harness

`_scratch_mb_seams.ts:415` ramps **`param: 'k'` and only `'k'`.** Check C6 proved the ramp mechanism
against one parameter and I reported the config surface as fully implemented on that basis. The
`'v1'` ramp write-path was never exercised, and `impulse` is the first artefact to touch it. B3 shows
even the proven `'k'` path was only tested BETWEEN contacts, never DURING one.

**The harness lesson for SEAM D:** a ramp test must cover every value of `param_ramp.param`
(`v1 | k | m2`), and must assert across a CONTACT, not only between contacts. "Config key implemented"
was proved for one enum value and generalised to three — that generalisation was mine, and it was wrong.

### Stop-line compliance

**No `visual:eyes`, no `eye-walker`, no `smoke:visual-validator`, no `visual:approve`, no `tts:*`,
no `build:pilot`/deploy, no DB writes, no other branch or worktree.** The authoring IS committed to
this feature branch (validator-green, nothing shipped) so the diff is reviewable via `git log -p` and
the work survives the session — but the concept is **NOT sealed and NOT approved**; the auditor's
FAIL stands until B1–B3 are resolved and the deferred visual gate runs.

Three findings are DEFERRED to the visual gate, not failed: camera framing (`[0,3.2,12]`, S5 pulls
back to `[0,3.6,13]`), THE EYE frame-level legibility, and the Next.js route walk — the last is
environmentally blocked (`TurbopackInternalError: Symlink node_modules … points out of the
filesystem root`, the worktree junction), **not a concept defect**; all 8 sites were verified
statically instead.

### Ride-along findings (not blocking)

R1 both S5 balls carry `label: "m"`, so the HUD cannot name either lane on the PRIMARY aha
(`alex:json_author`) · R2 `text_hi` is romanized Hinglish, not the fleet's Devanagari-with-inline-
English convention (`alex:json_author`; zero product impact — Hindi is never voiced) · R3 the HUD's
"true Δt" reports ELAPSED not TRUE contact time mid-contact, which undercuts the badge's own honesty
claim (`peter_parker:field3d_surgeon`) · R4 S8 exposes a `c` slider for a quantity no state teaches
(architect flagged deliberately — founder judgment) · R5 `parallel_form_stem` absent (Gate 20
dormant) · R6 "pinned" in S7 is mildly idiomatic.

---

[SUPERSEDED — Phase 0 planning] next: **Phase 1 — authoring `impulse`**, pending founder review
      (`git log --grep=engine-loop -p`, 3 commits). The engine is complete and proved; the
      architect can now be handed hard facts (the JSON contract below) instead of wishful config.
      Nothing authored yet.

      [DONE 2026-07-31] Phase 0 SEAM C — **AUTHORISED, review passed, SHIPPED as `3d827ae`**. Carried
      (a) `lanes[].contact_override` — two simultaneous contacts feeding the proven two-trace panel;
      (b) the control/sandbox layer; (c) a MINIMAL formula surface (see below). Then authoring.

      **SEAM C does NOT count against the runaway guard.** Precedent: CHAPTER_LOOP.md §7.1, where
      `param_ramp` was pre-authorised for block_on_incline as a named engine ADDITION rather than a
      defect fix. `lanes[]` is in the spec's own §1 config surface — this is spec completion, not
      engine creep. The guard stays at 2 of 3 for genuine defects.

      WHY IT IS REQUIRED, not optional: without two simultaneous lanes there is no rigid-wall vs
      padded-wall comparison, and that IS `impulse`'s payoff beat. The harness passing 50/50 was the
      stated stop condition but it never covered the two-lane case — "harness green" and "engine
      ready for impulse" were not the same thing. That gap is the ORCHESTRATOR'S spec error, not
      this tray's.

      FORMULA SURFACE (new, approved): `momentum_bench` currently has none, and spec §3's "the
      formula overlay carries J = FΔt, once" therefore had nowhere to live. Add a minimal one.
      Rationale: `impulse`'s claim is an equation chaining three quantities (J = FΔt = Δp); the
      force-trace shows the AREA but can never NAME it as the momentum change, and Rule 34b's "ONE
      formula surface per state" presumes the option exists. Value-only HUD stays separate (34b).

      Still nothing authored — authoring begins only after SEAM C.
in_flight: (none)
parked: (none)
engine_commits:
  2987cf4  momentum_bench SEAM A — config surface + compliant-contact integrator + bring-up harness
           [peter_parker:field3d_surgeon]
  73ea98c  momentum_bench SEAM B — force arrows, momentum HUD, force-trace panel, slow-motion honesty
           [peter_parker:field3d_surgeon]
  3d827ae  momentum_bench SEAM C — two-lane contacts, control/sandbox layer, formula surface
           [peter_parker:field3d_surgeon]
  05ddfd5  docs: SEAM C scar candidates
  4ecae93  fix: mbSetParam writes are not state-guarded — staged/spent velocity guard, per-contact
           busy guard for k/c, same guard extended to the mass branch (Σp broke 2–3% without it)
           [peter_parker:field3d_surgeon]  (guard 3 of 4)
  bfabb6c  feat: param_ramp step mode — per-cycle discrete values, Gate 8n, harness 69 → 77/77
           [peter_parker:field3d_surgeon]  (guard 4 of 4 — BUDGET NOW FULLY SPENT)
scar_candidates: docs/loop_runs/lom_f/_engine/scar_candidates.sql — **6 rows**, NOT applied
                 (4 FIXED in-diff; 2 OPEN: the retired-sentinel finding and the
                 `zod_superrefine_gate_silently_never_runs...` probe trap)
runaway_guard: **3 of 4** — the founder RAISED the budget 3 → 4 on 2026-07-31, specifically and only
               for the `param_ramp.mode: 'step'` addition (in flight). `4ecae93` spent commit 3.
               SEAM C was pre-authorised and does not count; its two in-seam defect fixes were inside
               its own new surface.

## Sentinel swap — `gauss_law_sphere` is RETIRED from this tray (founder-approved 2026-07-31)

`gauss_law_sphere` → **`electric_field_point_charge`** (15 committed baseline files, verified present
in this worktree). `coulombs_law` stays — it was clean at 50/50 with all 16 H2 entries at 0.00%.

**TWO independent reasons, either sufficient:**

1. **It is non-deterministic** (this tray's own finding, proved with a stashed-engine control run):
   STATE_6 frozen H2 wandered 0.26% / 5.18% / 10.18% across identical runs on stock code, and its
   baselines are ~90 renderer commits old. A sentinel that swings 10% on unchanged code cannot tell a
   regression from vintage.
2. **It collided with `feat/lom-b`**, which claims `gauss_law_sphere` + `gauss_law_solid_sphere` and
   is being actively worked by another session. That is exactly the Amendment 5 collision the
   disjoint-pair rule exists to prevent — two loops re-seeding one baseline concurrently. **The
   orchestrator assigned the colliding pair originally; the error was upstream of this tray.**

**REQUIRED on first use — double-run determinism check: DONE 2026-07-31, PASSED.**
`electric_field_point_charge` EYE run twice back to back on unmodified code with no re-seed between
runs: **44/44 both times, all 14 H2 entries 0.00% in both — IDENTICAL on every entry, STATE_6
included.** The sentinel is trustworthy. It then held at 44/44 / 0.00% again post-SEAM-C, and
`coulombs_law` held at 50/50 / 0.00% on all 16 entries. `gauss_law_sphere` was never run.

**NEW EVIDENCE for the escalated frozen-capture defect — a concrete candidate mechanism.** Both
step-0 runs emitted:

    Sim-time poll stalled for STATE_3/5/6/7 — reached 1248–1376/1500 ms … capturing anyway

**The capture harness is not reaching its nominal pin time**, and captures anyway. Here it was
harmless only because this concept's frames are static at those offsets. On a MOVING state, a stalled
poll captures a different phase every run — which is exactly the wandering `__frozen` signature seen
on `gauss_law_sphere` (this tray) and `electric_potential_meaning` (lom-g). That makes the defect
machine-load-dependent rather than concept-specific, and it means "the baseline is stale" was the
wrong first diagnosis. Not fixed here: out of scope, and this tray may not run `visual:approve` or
touch master.

**NOT this tray's job, escalated to the founder:** the underlying finding is that frozen captures are
not byte-identical when they must be by construction (`SET_TIME_FREEZE` forces one step). lom-f and
lom-g hit it independently, on different concepts, **both on STATE_6**. That points at a shared cause
and it undermines the H2 gate protecting all ~55 baseline-locked concepts. It cannot be fixed here —
this tray may not run `visual:approve` and may not touch master.

## Phase 0 progress — the `momentum_bench` engine (2026-07-31)

Spec: `docs/MOMENTUM_BENCH_ENGINE_SPEC.md`. Harness: `src/scripts/_scratch_mb_seams.ts`
(`npx tsx src/scripts/_scratch_mb_seams.ts`). Built entirely via `field3d-surgeon` dispatches — the
orchestrator never edited `field_3d_renderer.ts` (§0.1 held).

### SEAM A — physics core (commit `2987cf4`)

Config surface (spec §1, whole surface authored so later seams add behaviour not type churn),
compliant-contact integrator (spec §2), force-sample buffer, minimal scene (track / bodies /
compressing contact element), `deriveStateMeta` registration, `#sliders` exclusion, `__PM_supportsTimePin`.
Harness: 34/34, 2 clauses PENDING (both needed instruments).

### SEAM B — instrument layer (commit `73ea98c`)

Equal-and-opposite force arrows (the `fixed` wall's at full brightness), value-only momentum ledger
HUD, force–time trace panel with the area FILLED + peak marker + `compare_with_previous_lane`,
`slow_window` (pure `dt` multiplier at one call site, `slow motion ×N` badge, HUD keeps reporting TRUE
physical values), `contact.label`. Harness: **50/50, zero PENDING** — A7d and A8e both closed.

### SEAM C — control/sandbox layer + spec completion (commit `3d827ae`)

`lanes[].contact_override` (a second SIMULTANEOUS contact), the control layer (`controls_visible`
slider rows, `trusted_drag_seizes`, `param_ramp`), a minimal `formula` surface, and the ruling-4
mutual-exclusion gate. Harness: **63/63, 0 failed** — all 50 SEAM A/B checks still pass untouched.

**Every key in the spec's §1 config surface now has behaviour. Nothing parses-and-ignores.** The only
non-behavioural residue is `lanes[].id`, deliberately carried as an event tag rather than rendered —
the trace legend names a lane by its contact `label` ("foam pad" / "steel bumper"), which is the
teacher-facing name. Rendering the id instead is a one-line legend change if the founder wants it.

Implementation note that kept the blast radius small: `eng.contact` became `eng.contacts[]` with
`eng.contact` retained as an alias for `contacts[0]`, so every single-lane path reads exactly as
before — which is why all 50 prior checks passed without edits.

### THE TWO-LANE PAYOFF BEAT — proved (SEAM C, check C1b/C1c)

Two contacts engaged **at the same instant** (4 frames with both live), same ball, same speed,
stiffness differing 10×:

| | soft lane (`foam pad`) | rigid lane (`steel bumper`) |
|---|---|---|
| `k` (N/m) | 200 | 2000 |
| **area ∫F dt** | **5.999975 N·s** (0.0004% off `m·Δv`) | **5.999750 N·s** (0.0042%) |
| **F_peak** | **42.4264 N** | **134.1620 N** |

Areas agree to **0.0038%**; peak ratio **3.16223** vs `√10 = 3.16228` (0.0015%). Both drawn on ONE
shared axis pair. **Equal areas, very different peaks, side by side — `impulse` has its payoff beat.**
This is the claim SEAM B could only prove for sequential runs; it is now proved for the side-by-side
presentation the concept will actually use.

### THE GATE IS GREEN — assertion 4 (the founder go/no-go)

| | soft wall | rigid wall |
|---|---|---|
| `k` (N/m) | 200 | 2000 (**10×**) |
| **area ∫F dt** | **5.999975 N·s** | **5.999750 N·s** |
| area vs `2mv = 6.000000` | −0.0004% | −0.0042% |
| **F_peak** | **42.4264 N** | **134.1620 N** |
| `t_c` | 222.1441 ms | 70.2481 ms |

Areas agree to **0.0038%** (tol 1%); `F_peak` ratio **3.1622×** (√10 = 3.16228, need ≥ 3);
`F_peak · t_c = πJ/2` holds on both. **`impulse` IS teachable.** The closed forms EMERGE — the
harness greps the executable renderer source (comments stripped) and confirms no textbook collision
formula is present.

### Verify chain evidence (all three commits)

`check:renderer-syntax` OK on all three renderers · `tsc --noEmit` 0 errors · `validate:concepts`
**145 PASS / 0 FAIL** (unmoved across every seam — nothing authored, and SEAM C's new schema gate did
not move the count) · harness **63/63** · regression EYE `coulombs_law` **50/50, all 16 H2 entries
0.00%** and `electric_field_point_charge` **44/44, all 14 entries 0.00%**. Step 3b.2 (target-concept
re-seed + EYE) is N/A — no `momentum_bench` concept exists.

**Rule 36b clock guard NOT tripped:** zero diff lines touch `__pmSteps` / `dtStep` / `__pmAccumMs` /
`__pmLastWall`. The integrator consumes the existing shared fixed-step mechanism; `slow_window` is a
pure multiplier. No full-fleet sweep required.

### The regression sample is compromised — `gauss_law_sphere` STATE_6

`gauss_law_sphere` fails H2 on **STATE_6 only**, and it fails on STOCK code: SEAM A proved it with a
stashed-engine control run (9.48% with our changes reverted). Its baselines were locked at `0ce9fb5`
(2026-07-11), **90 renderer commits ago**. Worse, the magnitude WANDERS between identical runs against
the same locked baseline — non-frozen 9.48% / 8.30% / 3.03%, frozen 0.26% / 5.18% / 10.18%. A frozen
capture is supposed to be byte-identical by construction under `SET_TIME_FREEZE`, so this is a
non-deterministic state, not merely a stale baseline.

**Consequence for this tray:** STATE_6 cannot distinguish a regression from vintage, so it is treated
as a known exclusion and `coulombs_law` (clean 50/50) carries the real regression signal. Logged OPEN
in `scar_candidates.sql`. **Founder decision wanted:** swap `gauss_law_sphere` for a
freshly-verified locked concept, or re-baseline it (which this tray may not do — `visual:approve` is
prohibited here).

### For the founder — open design questions before SEAM C

1. **No formula surface exists for `momentum_bench`.** The generic `#formula_overlay` is suppressed
   for this scenario, so spec §3's "the formula overlay carries `J = FΔt`, once" currently has no
   home. Needs a new config key in SEAM C.
2. **`compare_with_previous_lane` overlays the last two RECORDED contact EVENTS**, not two
   simultaneous lane contacts — a second independent contact is `lanes[].contact_override`, which is
   SEAM C. The shared-axis panel is built and proven (both drawn areas 5.99990 N·s); SEAM C only has
   to feed it a second event. **This is the last missing piece of `impulse`'s payoff beat.**
3. **The spec's "reuse nlb's `spring_action` / `#nlb_slowmo` slow-motion path" was not possible** —
   no such code exists in `field_3d_renderer.ts` (0 grep hits for `spring_action`, `nlb_slowmo`,
   `slowmo`). Same discipline was implemented at the single `mbDtScale` hook instead. Likewise nlb has
   no `cart` or `wall` mesh (its shapes are `block` and `wheel`), so `mb` owns its own box/slab meshes
   following nlb's material conventions.
4. **`sticks` wins if a state authors both `sticks` and `preload_m`** — the spec calls them mutually
   exclusive but names no winner.
5. **Cart/wall extents are physics, not decoration** (they set where contact begins): cart half-length
   0.4 m, ball r 0.28 m, wall half-thickness 0.3 m. Move these if the apparatus should look different.

### RULINGS on all five (2026-07-31) — take these, do not re-litigate

1. **Formula surface: ADD IT**, minimal, in SEAM C. `impulse`'s claim is an equation chaining three
   quantities (J = FΔt = Δp); the force-trace shows the AREA but can never NAME it as the momentum
   change, and Rule 34b's "ONE formula surface per state" presumes the option exists. The value-only
   HUD stays a separate surface (34b) — do not merge them.
2. **`lanes[].contact_override`: BUILD IT** in SEAM C. It is required, not optional — without two
   simultaneous lanes there is no rigid-vs-padded comparison and `impulse` has no payoff beat.
3. **The spec was WRONG and the tray was right.** `spring_action` / `#nlb_slowmo` / the cart+wall
   meshes live on `feat/lom-a`, which is UNMERGED; this tray is cut from master where none of it
   exists. The orchestrator wrote both engine specs after reading the renderer on `feat/lom-a` and
   then based the trays on master — so several "reuse that code path" instructions were impossible
   as written. **The `mbDtScale` single-hook implementation and `mb` owning its own meshes are
   APPROVED as the permanent design.** Do not attempt to converge on lom-a's code later; two
   independent implementations of a slow-motion hook is the correct outcome when the branches are
   not merged, and re-basing this tray onto lom-a now would be far more expensive than the
   duplication.
4. **`sticks` + `preload_m` authored together: `preload_m` WINS, and the combination must never
   ship.** Two parts, both required: (a) `npm run validate:concepts` REJECTS a state declaring both —
   this is a config contradiction and the validator is where contradictions die; (b) if one somehow
   reaches the renderer, log a console error and honour `preload_m`. Rationale for that precedence:
   if `sticks` won, a pre-loaded spring would release and instantly latch, producing a completely
   dead sim — the most confusing possible failure. A silent precedence rule with no validator error
   is exactly the fails-silently class this chapter keeps paying for; loud beats clever.
5. **Cart/wall extents: KEEP AS BUILT** (cart half-length 0.4 m, ball r 0.28 m, wall half-thickness
   0.3 m). Ball radius matches spec §3 exactly. They are physics, so they are now an apparatus
   constant like nlb's cart size — record them in the JSON contract so authoring can compute contact
   positions from them rather than guessing, the same way nlb's spring authoring contract works.

### How each ruling landed (all five, SEAM C)

1. **Formula surface: BUILT** — `momentum_bench.formula`, one authored Unicode algebra string per
   state, `'Cambria Math'`, its own bottom-centre zone, harness-checked to contain **no digits**. The
   value-only momentum HUD stays a separate surface; they were NOT merged.
2. **`lanes[].contact_override`: BUILT** — see the two-lane proof above. Cap `MB_MAX_CONTACTS = 3`.
3. **`mbDtScale` + `mb`-owned meshes: KEPT** as the permanent design. No convergence on `feat/lom-a`
   attempted.
4. **`sticks` + `preload_m`: BOTH parts built.** (a) **Gate 8m** in `src/schemas/conceptJson.ts`
   rejects the pair — narrow and targeted, no Zod mirror of the config surface. (b) The renderer logs
   a `console.error` and honours `preload_m`; the harness proves the pair genuinely explodes
   (`v_A = −6.3246`, `v_B = +1.5811`, `Σp = 0` exactly) rather than latching dead. SEAM A's
   "sticks wins" comment is gone from both the type block and the apply site.
5. **Apparatus constants: KEPT AS BUILT** and recorded in the JSON contract below.

### JSON authoring contract — hand this to `architect` / `json_author`

**Apparatus constants (PHYSICS — compute contact positions from these, never guess):** cart
half-length **0.4 m**, ball radius **0.28 m**, wall half-thickness **0.3 m**, `natural_length_m`
default **0.4 m**. Scene scale **0.5 world units per metre**. **Contact begins when
`s_hi − half_hi − (s_lo + half_lo) ≤ natural_length_m`** — e.g. a ball closing on a wall at `s = 0`
first touches at ball centre `−0.98`.

**Closed enums.** `mode`: `single_body | wall_impact | collision | explosion | sandbox` ·
`readouts[]`: `v | p | sum_p | KE | sum_KE | F_contact | J` · `controls_visible[]`:
`m1 | m2 | v1 | v2 | k | c` · `param_ramp.param`: `v1 | k | m2` · `shape`: `cart | ball | wall` ·
`glow_focal`: exactly ONE of `mb_body_<id>` / `mb_track` / `mb_contact_element` / a bare body id.

**Slider ranges (renderer-fixed; a `param_ramp` must stay inside its param's range):** `m1,m2`
0.5–10 kg step 0.1 · `v1,v2` −6…6 m/s step 0.1 · `k` 50–5000 N/m step 25 · `c` 0–300 N·s/m step 1.

**Per-state keys:** `formula` — ONE Unicode algebra string, no digits, no values · `lanes[]` —
`{id, offset_z_m, bodies[], contact_override?}`, **±1.3 m offsets read cleanly** ·
`trusted_drag_seizes: true` on the explore state ONLY, paired with `repeat_every_ms` (~1400 ms) ·
`force_trace.compare_with_previous_lane: true` for the two-lane beat · `slow_window` MANDATORY on any
state with a contact (spec §5).

**Never author `sticks` and `preload_m` on the same contact** — Gate 8m rejects it.
**Do not author `'J'` in `readouts` on a state that shows the trace** — the trace's shaded area
already carries its own `J = … N·s` label (duplication, not a conflict).
**No `field_lines` block required** — `momentum_bench` draws no tube field lines.
**No `*_at_ms` fallbacks in this scenario** — `param_ramp.start_ms` defaults 0; `repeat_every_ms` and
`phases[].at_ms` are the only clocks, and every gate holds at `t = 0`.

**Overlay zones (measured, pairwise disjoint, all clear of review chrome at `y ≥ 52`):**
`#mb_slowmo` top-left · `#mb_readout` top-right · `#mb_trace` bottom-left · `#mb_sliders`
bottom-right · `#mb_formula` bottom-centre (capped `max-width:330px`) · `#caption` top-centre.

## RESOLVED — field3d-surgeon would not dispatch (ROOT-CAUSED + FIXED 2026-07-30, VERIFIED 2026-07-31)

**Verified fixed.** A fresh session in this worktree resolved `field3d-surgeon` on the first try and
both Phase 0 dispatches ran through it. The registry snapshot theory was correct. Original analysis
preserved below.


### The real root cause: INVALID YAML in the emission frontmatter

**The previous diagnosis in this file was WRONG and is retracted.** It claimed the registry loads
from the session's own checkout and that `field3d-surgeon.md` was simply absent on the main
checkout's branch. A session rooted IN THIS WORKTREE, with `.claude/agents/field3d-surgeon.md`
present on disk, still got:

    Agent type 'field3d-surgeon' not found. Available agents: architect, chemistry-author, claude,
    claude-code-guide, Explore, eye-walker, feedback-collector, founder-proxy, general-purpose,
    json-author, physics-author, Plan, quality-auditor, retrofit-surgeon, statusline-setup

13 agent files on disk, 9 loaded, 4 silently dropped: `field3d-surgeon`, `renderer-primitives`,
`runtime-generation`, `shipper`. Not frontmatter model/effort (identical to loading agents), not
mtime (all 13 identical), not settings, not file presence.

**The discriminator, with 1:1 correlation across all 13 files: an unquoted YAML `description:`
value containing a colon-space (`": "`).** A YAML plain scalar may not contain `": "` — it is the
key/value separator. The frontmatter fails to parse and Claude Code drops the agent SILENTLY.

    field3d-surgeon      [owner: peter_parker:*]
    renderer-primitives  [owner: peter_parker:renderer_primitives]
    runtime-generation   [owner: peter_parker:runtime_generation]
    shipper              (Rule 30i, 2026-07-17): it never refuses ...

Proof (js-yaml over the pre-fix text; `founder-proxy` is the control — same model/effort, loads):

    PRE-FIX FAIL  field3d-surgeon      -> bad indentation of a mapping entry (2:136)
    PRE-FIX FAIL  renderer-primitives  -> bad indentation of a mapping entry (2:56)
    PRE-FIX FAIL  runtime-generation   -> bad indentation of a mapping entry (2:56)
    PRE-FIX FAIL  shipper              -> bad indentation of a mapping entry (2:489)
    PRE-FIX OK    founder-proxy

This is ALSO why the bug looked branch-correlated for so long: the offending text was introduced by
ordinary spec edits on different dates (shipper's on 2026-07-17), so which agents vanished changed
per branch — exactly mimicking "the file isn't on that branch."

### The fix (applied)

Each of the 4 `description:` values wrapped in single quotes. None contained a quote character, so
this is lossless. All 13 frontmatter blocks now parse.

**Editing the emission is CORRECT here and is NOT a violation of "never edit the emission
directly."** `scripts/sync-agents.js` preserves the emission's frontmatter VERBATIM and replaces
only the body below the first H1 — `description:` has no canonical source, it is authored in the
emission by design. `npm run check:agents` → "OK — all 13 emissions are up-to-date."

**`check:agents` is NOT evidence of a working registry** — it only compares mtimes; it never
validates the YAML. That is how this survived so long. A frontmatter validator belongs in it.

### What is still required: ONE SESSION RESTART

The registry is snapshotted at session start, so the fix does NOT take effect in the session that
made it (re-probed after the fix: same error). Phase 0 engine work resumes in a FRESH session:

    cd C:\Tutor\physics-mind-lom-f
    claude

First action there: confirm `field3d-surgeon` appears in the agent list, then dispatch Phase 0 part 1
(config surface + integrator + scene skeleton + harness) per `docs/MOMENTUM_BENCH_ENGINE_SPEC.md`.

**DO NOT fall back to general-purpose** for field_3d engine work — banned by CHAPTER_LOOP.md
Amendment 4 (~3.4M tokens per field3d-surgeon dispatch vs ~25M for general-purpose doing the same
job), and §0.1 bans the orchestrator editing `field_3d_renderer.ts` itself. Parking is the correct,
founder-blessed outcome; a fallback is not.

### PLATFORM — needs to land on master (Rule 40)

This fix is not chapter work: it restores `renderer-primitives`, `runtime-generation` and `shipper`
fleet-wide, on every branch and worktree carrying the same text. It is committed HERE only because
this tray may not touch another branch. **It should be cherry-picked to master promptly** — until
then, every other session is still silently missing those three agents.

## Why base = master and not feat/lom-a

The first plan based this tray on `feat/lom-a` to inherit its `push_off` + `spring_action`
apparatus. The founder then chose to build a purpose-built `momentum_bench` engine instead
(2026-07-30), so this tray needs nothing from `lom-a` and cuts cleanly from master. That also keeps
it entirely clear of the unmerged `feat/lom-a` / `feat/lom-b` work another session is finishing.

**Known, NOT this tray's job:** `master` currently carries the REJECTED `newton_third_law` (two
blocks, arrows appearing from nowhere — the interaction asserted rather than shown). The approved
rebuild is on `feat/lom-b` and its engine on `feat/lom-a`, both unmerged. Another session owns that
merge. Do not touch either branch from here.

## Founder decisions on the record (2026-07-30)

- **Two new engines, not four.** A scenario is what is on screen; an engine is the code behind it.
  Four apparatus, two engines. Rationale: Ch.7/Ch.8 forensics — new scenario work is 34-42% of a
  chapter, and extending the engine per concept was the expensive failure mode.
- **Impulse uses NCERT's ball-and-wall**, with WALL STIFFNESS as the taught variable (rigid wall vs
  springy padded wall, both rebounding). Rejected: wall-vs-cushion, because a cushion absorbs while a
  wall returns, so Δp changes from 2mv to mv and the comparison is confounded — the student cannot
  tell which variable caused what.
- **No firearm anywhere in `conservation_of_momentum`.** The gun-and-bullet recoil example is
  rejected on two grounds: the ~400:1 rifle/bullet speed ratio cannot be drawn honestly at a single
  scale (either the bullet is an invisible blur or the recoil is a sub-pixel twitch), and the product
  ships to schools internationally. Anchor the explosion state on a person throwing a heavy ball
  while standing on a skateboard, or a rocket.
- **Review gate: FOUNDER REVIEW PER CONCEPT**, as lom-c/d/e ran. No founder-proxy on this tray.
  quality-auditor PASS is NOT approval and does NOT trigger visual:approve.

## Hard prohibitions on this tray

Never: `visual:approve` · `tts:*` · PILOT_CONCEPTS · `build:pilot` / `deploy:*` · DB writes to
`engine_bug_queue` (scar candidates stay files) · any merge · touching another branch or worktree ·
engine edits outside the §3b verify chain (the orchestrator never edits `field_3d_renderer.ts`
itself; a routed `field3d-surgeon` dispatch is the ONLY legitimate path).

## Verification of the base cut (2026-07-30)

`npx tsc --noEmit` → 0 errors. `npm run validate:concepts` → 145 PASS / 0 FAIL.
node_modules junctioned to the main checkout; `.env.local` copied.
