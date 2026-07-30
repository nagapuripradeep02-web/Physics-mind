# lom-f loop state — Laws of Motion, momentum tray

updated: 2026-07-30 (Phase 0 SPEC written; engine build BLOCKED on agent dispatch — see BLOCKER)

design: docs/MOMENTUM_BENCH_ENGINE_SPEC.md  (founder-approved 2026-07-30)
worktree: C:\Tutor\physics-mind-lom-f
branch: feat/lom-f-momentum
base: master @ 06a3ee0 (clean cut — deliberately NOT feat/lom-a, see the note below)
review_port: 8092          (8080-8082 / 8087-8091 / 8099 are in use by other worktrees)
regression_sample: gauss_law_sphere, coulombs_law   (Amendment 5 — disjoint from every other loop)

chapter_map (founder-approved 2026-07-30, in build order):
  1. impulse                    — NCERT ball-and-wall, stiffness as the taught variable
  2. conservation_of_momentum   — two carts, elastic / inelastic / explosion

next: Phase 0 — build the `momentum_bench` scenario per the spec, via `field3d-surgeon`.
      BLOCKED: see below. Nothing may be authored until the engine harness passes.
in_flight: (none)
parked: (none)
engine_commits: (none yet)

## BLOCKER — field3d-surgeon does not dispatch from a session rooted elsewhere

`field3d-surgeon` is NOT dispatchable from a Claude session whose cwd is `C:\Tutor\physics-mind`
(currently on `feat/field3d-draggable-sensor`). Live probe 2026-07-30:

    Agent type 'field3d-surgeon' not found. Available agents: architect, claude, claude-code-guide,
    Explore, eye-walker, feedback-collector, general-purpose, json-author, physics-author, Plan,
    quality-auditor, retrofit-surgeon, runtime-generation, shipper, statusline-setup

**ROOT CAUSE, now diagnosed** (the earlier lom-a/lom-b note recorded this as never root-caused, and
its "session freshness" explanation was already disproven). The agent registry is loaded from the
SESSION'S OWN CHECKOUT — `<session cwd>/.claude/agents/` — not from the worktree being operated on.
`field3d-surgeon.md` exists on `master` (and therefore in THIS worktree) but does NOT exist on
`feat/field3d-draggable-sensor`, which is the branch the main checkout has checked out. Nothing to
do with git worktrees as such; it is per-branch file presence in the session's own checkout.

**FIX:** run the engine work from a session rooted IN THIS WORKTREE:

    claude --cwd C:\Tutor\physics-mind-lom-f

That session sees `.claude/agents/field3d-surgeon.md` and dispatches it normally.

**DO NOT fall back to general-purpose** for field_3d engine work — banned by CHAPTER_LOOP.md
Amendment 4 (~3.4M tokens per field3d-surgeon dispatch vs ~25M for general-purpose doing the same
job), and §0.1 bans the orchestrator editing `field_3d_renderer.ts` itself. Parking is the correct,
founder-blessed outcome; a fallback is not.

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
