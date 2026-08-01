# eye-walker report — `uniform_circular_motion`

run dir: `.visual_runs\uniform_circular_motion\20260801-022955\`
deterministic gates: 31/31, exit 0 (NOT re-run by eye-walker — capture matches HEAD)

> **Orchestrator note (2026-08-01):** eye-walker's CRITICAL finding is CONFIRMED, but its
> *hypothesised root cause* (a stale `simulation_cache` row) is WRONG and was disproved before
> filing — see "Orchestrator root-cause" at the bottom. The corrected owner is
> `peter_parker:field3d_surgeon`.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 | ✓ all elements present | ✓ continuous orbit ~7 rev/15 s, arrows rotate | ✓ | ✓ no formula, one focal = velocity | CONCERN: tension arrow at floor magnitude (T = 13.5 N, constant for all 15 s) renders as a near-invisible stub collinear with the string — the state's OWN delta cue ("Tension pulls inward, always") is hard to actually see |
| STATE_2 | ✓ held end T = 54.00 N, ω = 6.00 — matches design exactly | ✓ ramp reads as slow continuous unfolding 13.5→54 N, slider tracks | ✓ formula surface + growing arrow vs S1 | ✓ one formula, one focal = tension | transient tiny-arrow only in the first ~1.2 s static hold; resolves as the ramp proceeds |
| STATE_3 | **✗ FAIL** — frozen shows T = 12.96 N (pre-cut orbit) instead of the designed post-cut departure | ✓ dense t19000→t21000 shows orbit → cut → straight tangent trail, T→0, v unchanged 1.80 m/s, ghost circle held | n/a — reveal capture itself unreliable | ✓ no formula, one focal = bob | **the PRIMARY AHA state's canonical reveal photograph is wrong.** Live dense-clock motion is physically correct; only the `frozen` (H2 pin) capture is wrong |
| STATE_4 | ✓ T = 24.00 N, θ = 52.2° — matches design | ✓ continuous conical revolution, 3 tracked arrows | ✓ plane gone, ΣF arrow, formula appear | ✓ one formula, one focal = ΣF, bright + inward | clean |
| STATE_5 | ✓ held end θ = 75.2°, T = 57.66 N, ω = 6.20 — matches design exactly | ✓ cone opens 32°→75.2° continuously; tension arrow well-distinguished from string by ramp end | ✓ opening cone vs S4 steady state | ✓ one formula, one focal = string | same transient floor-magnitude tiny arrow at ramp start (T = 17.34 N); resolves by mid-ramp |
| STATE_6 | ✓ θ = 0.0°, amber `ω min = 3.13 rad/s` row visible and held | ✓ cone closes 61°→0° smoothly, clamp engages exactly at ω = 3.13, guide ring disappears | ✓ reversal pair vs S5 | ✓ one formula, one focal = guide_ring | eye-walker: "the strongest state in the concept — the clamp payoff is exactly as physics-verified" (**but see orchestrator finding 3 — the last 11 s are byte-frozen**) |
| STATE_7 | ✓ default conical pose, readouts live | ✓ bob position differs between keyframes t=200 and t=7753 — never freezes, Rule 37 respected | n/a (explore, exempt) | ✓ one formula, one focal = bob, all 3 sliders | clean |

## Arrow-collinearity scar — verdict: mostly FIXED, one narrower recurrence

At mid-to-high magnitudes (S2 mid-ramp, S4, S5 end, S6 mid-collapse) the tension/resultant arrow is
clearly colour-distinct (gold/white) from the grey string and geometrically offset, readable at BOTH
flat and conical geometries — the `7c6bbb3` mesh-shaft fix **generalizes to the whirl branch**.

The residual is narrower: **at floor-band magnitude (~11.5–17 N) the arrow is too SHORT to read
direction at all**, regardless of shaft/string colour distinction. Most damaging in STATE_1, where it
is not transient — T is constant at 13.5 N for the state's whole 15 s.

## No outward force anywhere — CONFIRMED

Every state's frozen frame + multiple dense samples checked: tension always points bob→anchor, weight
always down, resultant (S4) always horizontal-inward, velocity always tangent. **Zero outward-pointing
arrows in any frame.** The concept's central claim survives the visual walk.

## Frames worth founder eyes

1. `STATE_3__frozen.png` — the anomalous pre-cut capture (the defect).
2. `STATE_3__dense_t21000.png` — proves the LIVE clock's cut/departure/trail/ghost-circle is correct.
3. `STATE_1__frozen.png` — tension arrow barely legible at the state's own constant floor magnitude.
4. `STATE_6__dense_t08000.png` — the clamp payoff (amber ω_min row + collapsed cone), the concept's best moment.
5. `STATE_5__dense_t00000.png` — same floor-magnitude tiny-arrow pattern as STATE_1: systemic, not a fluke.

## Candidate `engine_bug_queue` rows (report only — never inserted)

### 1. `force_rig_whirl_release_not_reproduced_under_set_time_freeze_pin` — CRITICAL
`[owner: peter_parker:field3d_surgeon]` *(corrected by orchestrator; eye-walker filed it `ambiguous`
pending a cache re-seed, which has since been disproved as the cause)*

**prevention_rule:** before trusting a captured `frozen` (H2) pin as ground truth, cross-check its HUD
numeric readout against the state's own physics at the documented pin instant. A reveal beat that the
renderer reconstructs rather than integrates can photograph a pixel-perfect but physically wrong
baseline, and the deterministic gates cannot see it.

### 2. `force_rig_whirl_tension_arrow_illegible_at_floor_band_magnitude` — MODERATE
`[owner: peter_parker:field3d_surgeon]` (arrow-length scaling lives in `field_3d_renderer.ts`, same
family as the collinearity scar, narrower manifestation)

**prevention_rule:** when a guided state's entire teaching claim rests on a force arrow, verify the
arrow's rendered pixel length at the state's OWN authored magnitude is long enough to read direction —
not merely that the arrow exists in the schema. A magnitude at or near the engine's arrow-length floor
(~11.5 N) collapses the arrow into a coloured dot indistinguishable from the apparatus line it lies
along, and it is worst when that magnitude never changes (STATE_1: 13.5 N for 15 s).

---

## Orchestrator root-cause (2026-08-01) — eye-walker's hypothesis disproved

eye-walker attributed the STATE_3 frozen defect to a stale `simulation_cache` row and recommended a
re-seed before filing. **That is not the cause.** Evidence, gathered before filing:

1. The cache was cleared (`cache:clear:scoped`, 0 rows existed) and seeded FRESH from the current
   concept JSON minutes before the capture — the `sim_html` was assembled in that same command.
2. `deriveMaxRevealTimeMs` called directly on the concept JSON returns
   **STATE_3 = 20800 ms** (= `release.at_ms` 19600 + 1200), exactly per contract.
3. `visual_eyes.ts:82` sets `revealSource = conceptJson ?? cached.physics_config`, and the concept
   JSON authors no `eye_capture_ms` override — so the pin used WAS 20800 ms.
4. Independent corroboration that the JSON source is live: STATE_2 / STATE_5 / STATE_6 frozen frames
   land exactly on their ramp-end pins (10800 / 11800 / 10800 ms) with the designed end-of-ramp
   values. Only the release-driven state is wrong.
5. `STATE_3__dense_t20000.png` — the SAME sim time as the pin — shows the cut correctly
   (T = 0.00 N, v = 1.80 m/s unchanged, bob off the ghost circle with a trail).

**Conclusion:** the dense path integrates through the release and gets it right; the
`SET_TIME_FREEZE` pin path does not reproduce the constraint-deletion event. This is the same defect
CLASS as last session's E1 (`force_rig` returning steady state instead of the pinned instant), which
`frResetTrajectory` fixed for the `param_ramp` / `phases` beats — the `release` beat appears never to
have been covered. Root cause lives in `field_3d_renderer.ts` → `peter_parker:field3d_surgeon`.

**Impact is baseline integrity, not teaching.** A teacher pressing play sees the cut correctly, so the
concept teaches fine. But if `visual:approve` is ever run, the locked H2 baseline for the PRIMARY AHA
state would be a pre-cut frame — the aha itself would carry no regression protection, the same class
of blind spot that let seven dead states pass 31/31 last session.

**NOT dispatched:** the tray's runaway guard is AT its limit (9 engine commits) — any further engine
fix on this tray needs an explicit founder call first.
