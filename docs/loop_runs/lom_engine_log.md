# Laws of Motion — chapter engine log

One line per verified engine fix (one commit each). Rollback point for cycle 1: `04aa6fa`.

- 2026-07-25 · `coast_body_halts_mid_state_despite_authored_length_m` (free_body_diagram STATE_3) → root cause was NOT the surface bound: `newtons_laws_body` integrates, so the shared `RESET_TRAJECTORY` handler's `stateStartTime` rebase never rewound `b.s`/`b.v`/`eng.t_ms`; every EYE capture (and every teacher replay) started downrange from the previous one and hit the +22 m clamp mid-series. Fixed by implementing `nlbResetTrajectory()` (+ `s0`/`v0` seeds, `v0` slider writes the seed) in `field_3d_renderer.ts` (+54/−1). EYE: free_body_diagram 27/27, electric_flux 62/62 (H2 0.00% all 20), magnetic_flux 38/38. Scar candidate: `field3d_integrating_scenario_ignores_reset_trajectory_and_carries_stale_accumulator`.
