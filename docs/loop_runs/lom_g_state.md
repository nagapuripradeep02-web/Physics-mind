# lom-g loop state — Laws of Motion, off-axis forces tray

updated: 2026-07-31 (**Phase 0 COMPLETE** — the `force_rig` engine is built, both branches, and the
         bring-up harness passes 42/42 with zero SKIP. The dispatch blocker is confirmed fixed.
         Authoring is now UNBLOCKED. `whirl` did NOT need to be parked.)

design: docs/FORCE_RIG_ENGINE_SPEC.md  (founder-approved 2026-07-30)
built:  docs/loop_runs/lom_g/_engine/force_rig_json_contract.md  ← **read this before authoring**
worktree: C:\Tutor\physics-mind-lom-g
branch: feat/lom-g-offaxis
base: master @ 06a3ee0 (clean cut)
review_port: 8093          (8080-8082 / 8087-8092 / 8099 are in use by other worktrees)
regression_sample: electric_potential_meaning, eddy_currents   (Amendment 5 — disjoint from lom-f's
                   gauss_law_sphere + coulombs_law and from every other running loop)
                   ⚠ electric_potential_meaning is NON-DETERMINISTIC — see "Regression-sample
                   finding" below. `eddy_currents` currently carries the whole regression signal.

chapter_map (founder-approved 2026-07-30, in build order):
  1. equilibrium_of_particles   — the force table (ring, 3 pulleys, hanging weights)
  2. uniform_circular_motion    — the whirl: flat, then conical, then cut the string

  BUILD ORDER IS DELIBERATE. `equilibrium_of_particles` is the static branch — low risk — and it
  PROVES the off-axis force solver before `uniform_circular_motion` depends on it. Same
  structural-extremes-first logic lom-a used. Do not reorder to do the exciting one first.

next: **Phase 1 — author `equilibrium_of_particles`** via the Alex pipeline
      (architect → physics-author → json-author → quality-auditor), then FOUNDER REVIEW.
      The engine gate is passed; nothing blocks authoring.
in_flight: (none)
parked: (none)
engine_commits: e5c5d01 (force_table branch + harness), 096157d (whirl branch)
                → 2 commits. Runaway guard is 3 per the tray brief / 8 per CHAPTER_LOOP; not hit.

---

## Phase 0 — DONE (2026-07-30 → 2026-07-31)

`force_rig` is one new `scenario_type` in `src/lib/renderers/field_3d_renderer.ts` serving BOTH
concepts as pure JSON config. Built by two `field3d-surgeon` dispatches, one `bug_class` each, each
under its own §3b verify chain.

| # | commit | branch | seams |
|---|---|---|---|
| 1 | `e5c5d01` | `force_table` — damped 2-D particle, top-down table, pulleys, hanging weights + the shared `fr*` scaffolding, `deriveStateMeta` registration, `_scratch_fr_seams.ts` | 1, 2, 3, 9 |
| 2 | `096157d` | `whirl` — flat + conical, **cone angle solved**, cut-the-string | 4, 5, 6, 7, 8 |

**Bring-up harness `src/scripts/_scratch_fr_seams.ts` — 42 checks · 42 passed · 0 failed · 0 SKIP.**
Re-run independently by the orchestrator at HEAD, not taken on report. `npx tsx src/scripts/_scratch_fr_seams.ts`.

Headline evidence (all spec §5 assertions):
- **S1** balanced fixture settles to `|p| = 3.4e-14 mm`, `|ΣF| = 0.000 N`, unmoved over a further 5 s.
- **S2** +20% on one mass → ring settles at a NEW fixed point, engine `(0.024002, 0.008765)` vs an
  independently coded root solve `(0.024002, 0.008765)` — the settle is SOLVED, not scripted.
- **S3** Lami: `T_i/sin(opposite)` = 49.0000 / 49.0000 / 49.0000, spread 0.0000%, on a deliberately
  non-symmetric 3-4-5 fixture.
- **S4** `cos θ = g/(ω²L)` worst error **0.0006%** across ω = 3.4…6.4, measured off the anchor+bob
  meshes AFTER 2 s of integration — persistence, not seeding. `T = mω²L` worst 0.0000%.
- **S5** below `ω²L > g` the engine clamps to `√(g/L)`, renders no cone, and the write is **not**
  silently swallowed (handle snaps back, HUD shows an amber `ω min = 4.04 rad/s`).
- **S6** period 1.57079 s vs `2π√(L cosθ/g)` = 1.57080 s — 0.0005%.
- **S7** post-cut: largest turn **0.00000°** over 73 steps, speed spread 0.00000%, perpendicular
  distance of the fitted line from the axis = 2.40000 vs abandoned-circle radius 2.40000 (a radial
  "flung outward" path would read 0), r strictly increasing 2.465 → 6.099. Ghost circle + trail drawn.
- **S8** 0 occurrences of `/centrifug/i` in executable lines; largest outward radial arrow component
  `0.000e+0`; `dot(tension, unit(anchor−bob))` min = 1.000000000.
- **S9** Rule 36 fold-exact (`Δ|p| = Δ|v| = 0` across 20 sub-steps 1-at-a-time vs 2-at-a-time, with a
  companion check proving the compared run actually travelled 70.9 mm), frozen frame byte-identical.

**Build state at HEAD (independently verified):** `check:renderer-syntax` OK · `npx tsc --noEmit`
**0 errors** · `npm run validate:concepts` **145 PASS / 0 FAIL** (warning profile unchanged) ·
regression EYE `eddy_currents` **38/38 clean** (twice).

**The success criterion still stands and is now testable:** `uniform_circular_motion` must require
ZERO renderer edits after `equilibrium_of_particles` seals. If authoring forces a renderer change,
this design under-generalized — STOP and re-scope, do not extend the engine per concept.

### The risk that did NOT materialize

The spec §8 / state-file risk note said `whirl` was the genuinely new capability and might need
parking. **It landed on attempt 1 with the beat intact.** The cone emerges from velocity-Verlet +
SHAKE/RATTLE integration (`T = m(û·a_free + |v|²/L)`) — `T = mω²L` and `cos θ = g/(ω²L)` appear
NOWHERE in the renderer, they fall out. `release` deletes the constraint and returns gravity alone
(conical) or the zero vector (flat); the straight line is the OUTPUT, not the instruction. Nothing
was weakened, nothing was scripted, no outward force is drawn or computed anywhere.

### Frame-visible / assertion-invisible defects — the recurring lesson

**Five real defects across the two dispatches were invisible to a fully-passing assertion suite and
visible in the first rendered frame.** Both surgeons flagged it independently; it is now the loudest
signal from Phase 0. Read the frame before declaring anything built.
- Tension arrow collinear with its own string → shaft swallowed (ArrowHelper's shaft is a 1px LINE).
- Hangers drawn screen-down folded back over a top-down table at 90°.
- The whirl rig rendered entirely in the top half (camera TARGET is not authorable).
- The bob slid off the edge of the frictionless plane after the cut — reads as flying, the exact
  misreading that state exists to kill.
- The post-cut trail dimmed to 40% under the glow pass.

Recorded as **5 scar candidates** in `docs/loop_runs/lom_g/_engine/scar_candidates.sql`
(SQL TEXT only — no DB write, per the tray's prohibitions). Founder applies or discards.

---

## Regression-sample finding — `electric_potential_meaning` is non-deterministic

Not a regression, and proven so rather than argued:

| run | code | result |
|---|---|---|
| dispatch 1, run 1 | `e5c5d01` | 43/44 |
| dispatch 1, run 2 | `e5c5d01` (identical) | **44/44** |
| dispatch 2 | `096157d` + diff | 43/44 — H2 STATE_6 at **2.90%** |
| dispatch 2, diff stashed | `e5c5d01` unmodified | 43/44 — H2 STATE_6 at **2.31%** |

Identical code produced different verdicts (rows 1–2), and unmodified code fails the same check at a
different magnitude (row 4). That is a non-deterministic baseline, not a `force_rig` regression —
which is additionally impossible by construction here, since every shared-file edit is either a new
`force_rig` branch or a NOT-list term false for every other scenario.

**Operational consequence, for the founder:** this tray's regression gate is running on ONE concept.
`eddy_currents` is clean and repeatable (38/38, twice); `electric_potential_meaning` STATE_6 cannot
currently distinguish a regression from noise. Either its baseline needs re-locking, or this tray
needs a different Amendment-5-disjoint partner. **Not reassigned unilaterally** — picking a
replacement needs the fleet-wide view of which locked concepts other trays have claimed.
Filed as scar candidate 5.

---

## Dispatch blocker — RESOLVED and CONFIRMED IN PRODUCTION (2026-07-31)

`field3d-surgeon` resolved normally this session and ran both dispatches. The fix in `6821467`
(double-quoting the 4 broken `description:` values) is confirmed working end-to-end, not just parsing.

Root cause, for the record: an unquoted YAML scalar cannot contain `": "` — the parser reads it as a
nested mapping key and throws, and the registry **silently drops** any agent whose frontmatter fails
to parse. The `[owner: peter_parker:*]` routing tag the doctrine requires in these descriptions is
itself what broke them. Proven by parsing all 13 emissions with `js-yaml`: failed on exactly the 4
agents missing from the registry, succeeded on exactly the 9 present. The earlier "wrong checkout
path" theory was wrong and cost lom-f and lom-g a parked phase each.

Edit site is durable: `scripts/sync-agents.js` preserves emission frontmatter VERBATIM and takes only
the body from `.agents/<role>/CLAUDE.md`, so `npm run sync:agents` will not clobber it. The
"never edit the emission directly" rule governs the BODY; frontmatter exists only in the emission.

### STILL BROKEN ON MASTER — founder action, out of scope for this tray

`renderer-primitives`, `runtime-generation` and `shipper` carry the identical defect in
`C:\Tutor\physics-mind\.claude\agents\` and are therefore **silently undispatchable in every session
fleet-wide**. These are doctrine agents, not trial ones — the whole Peter Parker cluster and the
release chain. Any past session that "fell back to general-purpose because the cluster agent wasn't
available" hit this bug. Recommended alongside the fix: make `sync-agents.js --check` FAIL on
frontmatter that does not parse, so a dropped agent can never again be silent.

**DO NOT fall back to general-purpose** for field_3d engine work — banned by CHAPTER_LOOP.md
Amendment 4 (~3.4M vs ~25M tokens for the same job); §0.1 bans the orchestrator editing
`field_3d_renderer.ts` itself. Parking is correct; a fallback is not.

---

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

**The engine now gives you two tools for this the spec did not have:** `ring_start_offset_m` (open a
state displaced so it *visibly settles*) and `param_ramp.param: "omega"` on the whirl branch. Budget
state duration for the settle — the reveal pin is `param_ramp.end_ms + 1600 ms`.

## Hard prohibitions on this tray

Never: `visual:approve` · `tts:*` · PILOT_CONCEPTS · `build:pilot` / `deploy:*` · DB writes to
`engine_bug_queue` (scar candidates stay files) · any merge · touching another branch or worktree ·
engine edits outside the §3b verify chain (a routed `field3d-surgeon` dispatch is the ONLY
legitimate path to a renderer edit).

**Renderer co-ordination:** `feat/lom-f-momentum` is building `momentum_bench` in the same
`field_3d_renderer.ts` concurrently, and another session is finishing `feat/lom-a` / `feat/lom-b`.
Every Phase-0 edit was kept region-disjoint — `fr*` functions and the `force_rig` config block only;
a sibling-contamination grep over changed lines returned 0 real hits across both dispatches. The
expected overlaps are the one-line `scenario_type` union, the dispatch switch, the `#sliders`
exclusion chain and the formula-hide chain — the trivial textual conflicts lom-a predicted.

## Verification of the base cut (2026-07-30)

`npx tsc --noEmit` → 0 errors. `npm run validate:concepts` → 145 PASS / 0 FAIL (verified in the
sibling lom-f cut of the same commit). node_modules junctioned; `.env.local` copied.
