# lom-f loop state — Laws of Motion, momentum tray

updated: 2026-07-30 (Phase 0 SPEC written; agent-dispatch blocker ROOT-CAUSED + FIXED — engine build
         needs one session restart to pick up the fixed registry. See BLOCKER.)

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

## BLOCKER — field3d-surgeon would not dispatch (ROOT-CAUSED + FIXED 2026-07-30)

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
