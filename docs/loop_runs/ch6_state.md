# ch6 loop state — Work, Energy & Power (Class 11)

updated: 2026-08-01
desk: C:\Tutor\physics-mind-ch6-work-energy-power  (branch feat/ch6-work-energy-power)
review_port: 8093
regression_sample: capacitance + parallel_currents_force
  # DISJOINT from any other running loop (Amendment 5). ch6 touches newtons_laws_body, so the
  # regression pair must also include a locked newtons_laws_body concept once one exists —
  # see engine verify chain below.

phase: 0 (chapter opening — Phase-0 doctrine, AUTHORING_PIPELINE.md §0)
phase0_survey: docs/loop_runs/ch6/phase0_survey.md   (0a DONE — founder-approved 2026-08-01)
engine_decision: EXTEND `newtons_laws_body` with an ENERGY LAYER. Do NOT build a new scenario_type.

next: 0c — dispatch field3d-surgeon to build the ENERGY LAYER against skeleton.md ENGINE SPEC NOTES
done: (none yet)
parked: (none)
in_flight: conservation_of_mechanical_energy  stage=0c-ready  checkpointA=CLOSED
engine_commits: (none yet)

## Approved chapter map (founder 2026-08-01) — teaching order

1. work_done_by_constant_force
2. positive_negative_zero_work
3. kinetic_energy_definition
4. work_energy_theorem
5. conservative_vs_nonconservative_forces
6. potential_energy_definition
7. gravitational_potential_energy
8. elastic_potential_energy_spring
9. conservation_of_mechanical_energy      ← 0b spec driver (deepest)
10. mechanical_energy_loss_with_friction
11. instantaneous_power
12. average_power

Deferred to a later batch (needs a U(x) graph panel — a separate Phase 0):
  work_done_by_variable_force_integral · F_equals_minus_dU_dx · potential_energy_curve_reading ·
  stable_unstable_neutral_equilibrium_from_U · potential_energy_curve_turning_points
Deferred (different apparatus): pendulum · vertical loop · walking stride · hanging chain

## Checkpoint A result (2026-08-01) — DESIGN_FIX, cycle 1 of 2

Report: docs/loop_runs/ch6/conservation_of_mechanical_energy/founder_proxy_A.md
Pedagogy PASSED (arc, aha, misconception beats, Rule 35/41 all clean — keep verbatim).
The ENGINE SPEC failed: 3 claims the engine cannot render + 4 of 11 union concepts still needing
renderer edits (the survey's own STOP condition).

BLOCKING, independently verified by the dispatching session:
  F1 no spring constant `k` exists; the spring is the founder-approved SCRIPTED spring_action cycle
     → an energy layer plotting 1/2kx^2 over it draws a non-flat total. **FOUNDER DECISION NEEDED.**
  F3 nlbBoundsM forces v=0 at the track bound (L42897-42901) → K and E_total collapse to zero for
     ~85% of every guided state, including the frozen frame + H2 baseline.
  F2 S4's theta->0 ramp makes U_grav identically 0 (three-segment claim false) + apparatus teleport
     at S4->S5.
Fix 1 (incline + fixed wall + spring at the base, permanent home pose) collapses F2, most of F3, F8.

NOTHING dispatches to field3d-surgeon until the spec is corrected — building against the current
text would build the wrong engine, the exact failure Phase-0 exists to prevent.

## CHECKPOINT A CLOSED 2026-08-01 — skeleton.md IS the 0c build contract

Cycle 1: DESIGN_FIX, 16 findings (3 blocking, independently verified against renderer source).
Cycle 2: 14/16 landed; 2 must-fix spec-text patches supplied VERBATIM by the reviewer and applied by
the dispatching session (no third cycle — the reviewer explicitly directed "apply and proceed to 0c,
no re-review needed"). Union table CLOSED: all 11 sibling concepts now authorable as pure JSON.

The cycle-2 catch worth remembering: the architect asserted the symplectic energy ripple would sit
"below 0.1 J display precision". The real figure is ~0.55 J (|dE| ~ (w*dt/2)*E is LINEAR in w*dt) —
re-derived independently before applying. Building it as written would have visibly wobbled the total
in the very state whose caption claims it is constant. Fix = a display-side shadow-Hamiltonian
correction term, NOT a bigger slow_factor.

## 0c DISPATCH BRIEF (field3d-surgeon) — read before dispatching

Build target: an ENERGY LAYER on `newtons_laws_body` per skeleton.md "ENGINE SPEC NOTES" (19 notes).
- ONE bug_class per dispatch, ~100-call ceiling, clean handoff note at the ceiling (Amendment 4).
- Rule 40: this is a SHARED platform file. lom-f and lom-g are LIVE on branches touching it —
  diff-first, region-disjoint, and land the engine commit on master separately from concept work.
- Regression EYE sample MUST include `newton_third_law` (owns the legacy scripted spring apparatus,
  which note 8c keeps working) AND — because note 19c changes shared `N` — a wider sample than the
  choreography spec's list (~10 shipped concepts read N).
- Verify chain: check:renderer-syntax -> tsc -> validate:concepts -> re-seed cache -> visual:eyes ->
  regression sample. Never leave the build broken.
- Scar candidates from Checkpoint A (3 directive rows) are FILES only, not yet applied to the DB.

## FOUNDER DECISION 2026-08-01 — spring: real physics, slowed playback (AMENDS the 2026-07-30 directive)

F1 surfaced a collision: `NLB_SPRING_CHOREOGRAPHY_SPEC.md` (founder-approved 2026-07-30) scopes the
SCRIPTED `spring_action` cycle to "every state that uses a spring, in every concept, now and later",
but an honest energy layer needs a real force law.

**Ruling: build GENUINE spring physics (authored `k`, force `F = -kx` inside the integrator, `x`
exposed to the energy layer), and achieve the teachable slow-motion look by SLOWING PLAYBACK over
that real physics — never by scripting the stroke.** The 2026-07-30 directive's INTENT (a real spring
bounces too fast to teach from) is preserved in full; only its mechanism changes. `slow_factor`
becomes a playback modifier over real physics rather than a replacement for it.

Consequences:
- Unblocks union concept #8 `elastic_potential_energy_spring`, which cannot be authored honestly
  without a real force law.
- `NLB_SPRING_CHOREOGRAPHY_SPEC.md` MUST be amended to record this when the engine change lands on
  master (Rule 40: the platform doc travels with the platform change, not with chapter work).
- The existing scripted push-off states must keep working — the surgeon's build is additive and must
  re-verify `newton_third_law` (which owns the push-off apparatus) as part of its regression sample.

## Notes the next resume must know

- **`newtons_laws_body` is a SHARED engine file** and two other sessions (lom-f, lom-g) are live on
  branches that also touch it. Rule 40: land the energy-layer commit on master separately and
  immediately; never bundle it into concept work. Re-check `git log --all -S "<symbol>"` before
  building any mechanism (Rule 40a).
- Source catalog is PRE-Rule-35: its India-specific anchors must be re-authored universal. See the
  survey's Rule 35 section.
- Engine verify chain (AUTHORING_PIPELINE.md engine-dispatch discipline): check:renderer-syntax →
  tsc → validate:concepts → re-seed target cache → visual:eyes → regression sample. ONE bug_class
  per dispatch, ~100-call ceiling.
- THE CALCULATOR (`npm run numeric:calc -- <id>`) is ADVISORY and applies from concept #1 onward.
- Machine is loaded (8 cores, 2 other live sessions running THE EYE). Expect slower visual runs.
