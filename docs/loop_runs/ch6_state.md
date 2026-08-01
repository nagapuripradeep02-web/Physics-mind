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

next: FOUNDER DECISION on the spring-directive collision (F1), then architect cycle 2
done: (none yet)
parked: (none)
in_flight: conservation_of_mechanical_energy  stage=design(0b) checkpointA=DESIGN_FIX cycle 1 of 2
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
