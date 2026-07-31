# lom-f loop state — Laws of Motion, momentum tray

updated: 2026-07-31 (Phase 0 SEAMs A + B built and green — the bring-up harness PASSES 50/50 with
         zero PENDING. Assertion 4 CLEARED: `impulse` is teachable. Paused for founder review
         before SEAM C. The dispatch blocker is RESOLVED — see below.)

design: docs/MOMENTUM_BENCH_ENGINE_SPEC.md  (founder-approved 2026-07-30)
worktree: C:\Tutor\physics-mind-lom-f
branch: feat/lom-f-momentum
base: master @ 06a3ee0 (clean cut — deliberately NOT feat/lom-a, see the note below)
review_port: 8092          (8080-8082 / 8087-8091 / 8099 are in use by other worktrees)
regression_sample: gauss_law_sphere, coulombs_law   (Amendment 5 — disjoint from every other loop)

chapter_map (founder-approved 2026-07-30, in build order):
  1. impulse                    — NCERT ball-and-wall, stiffness as the taught variable
  2. conservation_of_momentum   — two carts, elastic / inelastic / explosion

next: Phase 0 SEAM C — the control/sandbox layer, via `field3d-surgeon`. PAUSED FOR FOUNDER REVIEW
      (the CHAPTER_LOOP runaway guard was set at 3 engine commits; 2 have landed and there are
      open design questions listed under "For the founder" below). Still nothing authored.
in_flight: (none)
parked: (none)
engine_commits:
  2987cf4  momentum_bench SEAM A — config surface + compliant-contact integrator + bring-up harness
           [peter_parker:field3d_surgeon]
  73ea98c  momentum_bench SEAM B — force arrows, momentum HUD, force-trace panel, slow-motion honesty
           [peter_parker:field3d_surgeon]
scar_candidates: docs/loop_runs/lom_f/_engine/scar_candidates.sql — 4 rows, NOT applied (3 FIXED
                 in-diff, 1 OPEN: the gauss_law_sphere STATE_6 regression-sample finding)

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

### Verify chain evidence (both commits)

`check:renderer-syntax` OK on all three renderers · `tsc --noEmit` 0 errors · `validate:concepts`
**145 PASS / 0 FAIL** (unmoved — nothing authored) · harness 50/50 · regression EYE `coulombs_law`
**50/50, all 16 H2 entries 0.00%**. Step 3b.2 (target-concept re-seed + EYE) is N/A — no
`momentum_bench` concept exists.

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

### SEAM C scope (still parse-and-ignore)

`controls_visible` (the `#mb_sliders` rows — bottom-right zone reserved), `trusted_drag_seizes`
(sandbox seize + Rule 37 idle-sweep cancel), `param_ramp`, `lanes[].contact_override` (the second
independent contact), and a `momentum_bench` formula surface.

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
