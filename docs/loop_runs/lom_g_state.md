# lom-g loop state — Laws of Motion, off-axis forces tray

updated: 2026-07-30 (Phase 0 SPEC written; engine build BLOCKED on agent dispatch — see BLOCKER)

design: docs/FORCE_RIG_ENGINE_SPEC.md  (founder-approved 2026-07-30)
worktree: C:\Tutor\physics-mind-lom-g
branch: feat/lom-g-offaxis
base: master @ 06a3ee0 (clean cut)
review_port: 8093          (8080-8082 / 8087-8092 / 8099 are in use by other worktrees)
regression_sample: electric_potential_meaning, eddy_currents   (Amendment 5 — disjoint from lom-f's
                   gauss_law_sphere + coulombs_law and from every other running loop)

chapter_map (founder-approved 2026-07-30, in build order):
  1. equilibrium_of_particles   — the force table (ring, 3 pulleys, hanging weights)
  2. uniform_circular_motion    — the whirl: flat, then conical, then cut the string

  BUILD ORDER IS DELIBERATE. `equilibrium_of_particles` is the static branch — low risk — and it
  PROVES the off-axis force solver before `uniform_circular_motion` depends on it. Same
  structural-extremes-first logic lom-a used. Do not reorder to do the exciting one first.

next: Phase 0 — build the `force_rig` scenario per the spec, via `field3d-surgeon`.
      BLOCKED: see below. Nothing may be authored until the engine harness passes.
in_flight: (none)
parked: (none)
engine_commits: (none yet)

## BLOCKER — field3d-surgeon does not dispatch from a session rooted elsewhere

Identical to lom-f. `field3d-surgeon` is NOT dispatchable from a session whose cwd is
`C:\Tutor\physics-mind` (currently on `feat/field3d-draggable-sensor`). Live probe 2026-07-30
returned `Agent type 'field3d-surgeon' not found`.

**ROOT CAUSE, now diagnosed** (previously recorded as never root-caused, with a "session freshness"
explanation that was already disproven): the agent registry loads from the SESSION'S OWN CHECKOUT —
`<session cwd>/.claude/agents/` — not from the worktree being operated on. `field3d-surgeon.md`
exists on `master` (so it is in THIS worktree) but not on `feat/field3d-draggable-sensor`. Not a
worktree problem; per-branch file presence in the session's own checkout.

**FIX:** run the engine work from a session rooted IN THIS WORKTREE:

    claude --cwd C:\Tutor\physics-mind-lom-g

**DO NOT fall back to general-purpose** for field_3d engine work — banned by CHAPTER_LOOP.md
Amendment 4 (~3.4M vs ~25M tokens for the same job); §0.1 bans the orchestrator editing
`field_3d_renderer.ts` itself. Parking is correct; a fallback is not.

## The known risk on this tray, recorded before the build

`force_table` is a damped 2-D particle solver — low risk, expected to land cleanly.

`whirl` is the genuinely new capability in the whole chapter: a constrained bob integrated in 3-D
with a SOLVED cone angle (`cos θ = g/(ω²L)`, never authored) and a constraint-removal event. If it
fights the build across two `field3d-surgeon` attempts, the correct outcome is to seal
`equilibrium_of_particles` standalone and PARK `uniform_circular_motion` with the engine finding as
the named cause. **Do not weaken the cut-the-string beat and do not author around a missing cone.**

## Founder decisions on the record (2026-07-30)

- **Two new engines, not four.** Four apparatus, two engines — a scenario is what is on screen, an
  engine is the code behind it. Ch.7/Ch.8 forensics: new scenario work is 34-42% of a chapter, and
  extending the engine per concept was the expensive failure mode.
- **Circular motion scope: ball on a string + conical pendulum.** Banked road and vertical circle are
  deliberately OUT (vertical circle is non-uniform and normally taught after work-energy).
- **The misconception beat is cutting the string** — the bob leaves along the tangent, straight, not
  outward. No outward force is drawn at any point, because none exists. The picture proves it rather
  than a caption denying it.
- **Review gate: FOUNDER REVIEW PER CONCEPT**, as lom-c/d/e ran. No founder-proxy on this tray.
  quality-auditor PASS is NOT approval and does NOT trigger visual:approve.

## Rule 31 trap specific to this tray

A force table at equilibrium is visually STILL, and `equilibrium_of_particles` is therefore the
concept most at risk of authoring a static state — which passes every deterministic gate. The
`newtons_laws_body` scar is explicit: `phases[]` only re-times `glow_focal`, and an opacity-only
delta renders as a 0.00% frame-to-frame diff. Every guided state must carry real motion — use
`param_ramp` on an angle or a hanging mass so tensions visibly change and the ring visibly
re-settles. Distinctness must be carried by geometry, position, or arrow LENGTH.

## Hard prohibitions on this tray

Never: `visual:approve` · `tts:*` · PILOT_CONCEPTS · `build:pilot` / `deploy:*` · DB writes to
`engine_bug_queue` (scar candidates stay files) · any merge · touching another branch or worktree ·
engine edits outside the §3b verify chain (a routed `field3d-surgeon` dispatch is the ONLY
legitimate path to a renderer edit).

**Renderer co-ordination:** `feat/lom-f-momentum` is building `momentum_bench` in the same
`field_3d_renderer.ts` concurrently, and another session is finishing `feat/lom-a` / `feat/lom-b`.
Keep every edit region-disjoint — append `fr*` functions and the `force_rig` config block only.
The sole expected overlap is the one-line `scenario_type` union and the dispatch switch, which is the
trivial textual conflict lom-a already predicted. Never edit another tray's regions.

## Verification of the base cut (2026-07-30)

`npx tsc --noEmit` → 0 errors. `npm run validate:concepts` → 145 PASS / 0 FAIL (verified in the
sibling lom-f cut of the same commit). node_modules junctioned; `.env.local` copied.
