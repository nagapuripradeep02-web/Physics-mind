# eye_walker report — newton_third_law — re-verify 2 (cycle 2, elevation fix)

Run dir: `.visual_runs/newton_third_law/20260725-224800/`
Prior runs `20260725-221918` / `20260725-223325` ignored (stale) per dispatch instructions.

## Deterministic gate summary (verbatim)
19 checks / 19 passed / 0 failed / $0.00

## Bug-queue consultation (pre-walk)
`query_engine_bug_queue.ts newton_third_law --field3d --open` → "No matching engine_bug_queue rows."
No prior OPEN/DEFERRED prevention_rule to carry into this walk (the two cycle-1 MODERATEs were reported,
not yet logged as rows per this agent's report-only contract).

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 "One push — two forces" | ✓ | ✓ | ✓ (cue: setup, two blocks + F₁₂=−F₂₁) | ✓ | recoil now ~2% asymmetric (was ~28%) — see finding 1 resolution below |
| STATE_2 "Unequal masses — equal forces" | ✓ | ✓ | ✓ (cue: "1:3 masses… 3:1 accelerations") | ✓ | m2 displaces ~⅓ of m1 by t=12000 — matches caption ratio |
| STATE_3 "Cancel needs one body" | ✓ | ✓ | ✓ (cue: isolate m1's own FBD; N/mg appear) | ✓ | ghost m2 correctly dims + holds pose while m1 alone accelerates |
| STATE_4 "All yours" (explore) | ✓ | ✓ (continuous, Rule 37) | n/a (explore exempt) | ✓ | slider thumb positions verified against printed values (m1/m2/F) — all consistent, no rail-pin bug |

## Resolution of prior findings

1. **CRITICAL `field3d_nlb_two_body_lane_offset_insufficient_separation_at_shared_start`** — RESOLVED
   (confirmed already in cycle 1, unaffected by cycle 2's camera-only change; re-confirmed here: two
   visibly distinct, separately labelled blocks in every state at t=0 and at the frozen pin).

2. **MODERATE `field3d_nlb_oblique_camera_recoil_screen_asymmetry`** — RESOLVED. Measured screen
   displacement of the two equal-mass blocks from their shared start point at the t=12000 dense frame:
   - STATE_1 (m1=m2=100 kg-class, F=±30 N): m1 ≈ 136 px, m2 ≈ 139 px — ≈2% apart (was ≈28%).
   - STATE_4 explore at m1=m2=300 kg, t=10000: m1 ≈ 91 px, m2 ≈ 92 px — ≈1% apart.
   Moving the camera to the x=0 plane and encoding the lane gap as elevation (θ≈55°) instead of a lateral
   x-offset eliminated the asymmetric-perspective magnification. STATE_2's contrast case (1:3 masses) now
   also shows a screen-displacement ratio ≈2.9:1 against the physics ratio of 3.3:1 (a1=0.10, a2=−0.03),
   consistent within the expected rounding/measurement tolerance.

3. **MODERATE `field3d_two_body_camera_discontinuity_S3_isolation_shot`** — STILL PRESENT, improved but
   not resolved. S1→S2→S4 are now internally consistent (all x=0, elevation 55.0–55.1°, same apparatus
   scale) so that sub-sequence reads as a single continuous camera language. STATE_3 remains at its
   original near-front-on, low-elevation shot (`[0, 2.4, 9]`, θ≈15°) for the documented reason (steep
   elevation would foreshorten the vertical N/mg arrows). The S2→S3 and S3→S4 cuts are still a visible
   camera-angle jump (top-down-ish oblique ↔ front-on), i.e. Rule 32d's "no teleport-rebuild" reads as
   "camera re-frames" rather than "apparatus persists identically" across that boundary. This is a smaller
   jump than the pre-cycle-1 lateral swing (both endpoints are now on the symmetric x=0 plane, so at least
   left-right framing doesn't shift), so I'm keeping severity at MODERATE rather than raising it, but it is
   not closed.

## New checks this cycle (no new defects found)
- Elevation cost (Q4): F₁₂/F₂₁ horizontal arrows remain clearly visible and comparably lengthed at ~55°
  (STATE_1/2 frozen + dense frames); no clipping of blocks or the platform surface at the widest recoil
  extents (STATE_1 t=12000, STATE_4 t=10000); m₁/m₂ labels and the HUD stay legible (screen-space overlay,
  unaffected by 3D camera angle); the scene still reads as two blocks on a physical surface, not a flattened
  plan view, at this elevation.
- Slider-thumb-vs-label consistency (STATE_2 m2=900 kg, STATE_4 m1/m2/F at multiple values) verified by
  pixel-position math against each control's authored min/max/step — all consistent, no recurrence of the
  rail-pin defect class.
- No ASCII math found in any rendered text path (F₁₂, F₂₁, ΣF, m₁, m₂, →, ² all correct Unicode).
- No overlay collisions: caption (top-center), HUD (top-right), formula (mid/lower-right), sliders
  (bottom-right), misconception strip (bottom-left) — distinct zones in every state.
- STATE_3: N and mg arrows stay vertical and visually equal length throughout; ghost m2 dims and holds
  pose while m1 alone moves — ΣF on m1 = 30.0 N reads correctly.

## Frames for founder eyes (2)

1. `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_third_law\20260725-224800\STATE_2__frozen.png` —
   founder eyeball-check on the 3:1 acceleration/displacement contrast reading correctly at the new
   elevation (finding 1 fix, contrast case).
2. `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_third_law\20260725-224800\STATE_3__frozen.png` —
   founder call on whether the still-open S2↔S3↔S4 camera-angle jump (finding 2) is acceptable given the
   documented vertical-arrow-legibility rationale, or worth a further fix.

## Candidate engine_bug_queue rows

| bug_class | severity | owner_cluster | prevention_rule |
|---|---|---|---|
| `field3d_two_body_camera_discontinuity_S3_isolation_shot` (carried forward, unresolved) | MODERATE | ambiguous (design tradeoff: peter_parker:renderer_primitives if founder wants it fixed, otherwise accept-as-designed) | when a state's payload requires a different camera elevation than its neighbors, either interpolate the camera across the state boundary or accept the cut only if the apparatus scale/position stays pixel-stable (both true here) — flag for founder sign-off rather than auto-failing |

No new candidate rows this cycle beyond the carried-forward one above.

## Overall read
FINDINGS (1) — one carried-forward, improved-but-still-open MODERATE (camera discontinuity at STATE_3);
the CRITICAL and the recoil-asymmetry MODERATE are both RESOLVED.
