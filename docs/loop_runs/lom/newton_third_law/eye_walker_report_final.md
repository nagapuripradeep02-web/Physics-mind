# eye-walker — FINAL re-walk, newton_third_law (cycle 3), run 20260725-225740

Deterministic gate summary (verbatim): `📊 19 deterministic checks · 19 passed · 0 failed · $0.00`

Engine bug queue pre-walk consult: `query_engine_bug_queue.ts newton_third_law --field3d --open` → **no matching OPEN rows**. Nothing carried into the walk as a known scar to re-check beyond the two named findings in the task history.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 "One push — two forces" | ✓ two distinct lane-separated blocks, F₁₂/F₂₁ equal-length twins | ✓ symmetric recoil, equal masses → equal displacement | ✓ (cue names setup, vs empty baseline) | ✓ | CRITICAL lane-offset stays resolved (bodies read as two separate stacked lanes, not overlapping) |
| STATE_2 "Unequal masses — equal forces" | ✓ arrows identical length despite 1:3 mass ratio | ✓ m₁ travels ~3× the distance of m₂, arrows stay equal-length throughout | ✓ (mass changes, arrows visibly do NOT — Rule 32b contrast intact) | ✓ | none |
| STATE_3 "Cancel needs one body" | ✓ N/mg vertical, equal-opposite, F₁₂ un-partnered, ΣF=30.00N shown | ✓ ghost m₂ dimmed + static throughout; m₁ runs to full extent, no clipping | ✓ (elevation now continuous with S2/S4, not a 40° swing) | ✓ | minor: N/mg develop a slight (~8°) perspective lean by the run's tail (t≥10000ms) as m₁ translates off-center — see note below, not logged as a defect |
| STATE_4 "All yours" | ✓ all sliders shown, F₁₂=-F₂₁ | ✓ continuous free-run motion (Rule 37), symmetric recoil at equal masses, live HUD tracks slider drags | n/a (explore, exempt) | ✓ | none |

## `field3d_two_body_camera_discontinuity_S3_isolation_shot` — **RESOLVED**

Walking S1→S2→S3→S4 in order: all four states now sit on the x = 0 plane, the apparatus (table + two blocks) reads as the same home-pose family throughout, and the S2→S3 / S3→S4 cuts are a ~18° tilt-only change rather than the prior ~40° front-on-vs-elevated swing. S3's own composition (both bodies at the same depth, side-by-side, to support the isolated-FBD payload) differs from S1/S2/S4's stacked-lane recoil shot, but that's a content-driven re-framing for "the new thing" — the explicit Rule 32d carve-out ("camera may re-frame the new thing only") — not a discontinuity. Distance is preserved (9.31→9.28) so there's no zoom jump riding along with the tilt. Calling this closed.

## Did raising STATE_3 cost anything — **no regression**

At the reveal-complete frame (the H2/frozen baseline, the correct judgment point per protocol), `N` and `mg` are crisp verticals, equal length, clearly parallel-and-opposite over the isolated m₁, with `F₁₂` horizontal and un-partnered — the whole "cancel needs one body" argument reads exactly as intended. `ΣF = 30.00 N` is stable and consistent across every sampled frame. The dimmed ghost m₂ holds its pose without drifting for the entire state (~-1.5 m position, unchanged pixel-for-pixel from t=0 to the last dense frame) while m₁ runs its full course to the frame's far side without clipping the plank or the label rail.

One observation, not logged as a defect: by the later dense frames (t≥10000ms, well past the graded reveal), the N/mg arrow pair develops a modest ~8° lean as m₁ translates away from screen-center — a normal wide-camera perspective convergence effect (true-vertical world lines lean toward the vanishing point off-axis), not a new artifact introduced by the elevation change (distance was preserved, only tilt moved, and the same convergence would occur at any camera position given enough lateral travel). The two arrows lean together, staying parallel/equal, so the "equal and opposite, cancel" reading survives — this is cosmetic tail-end drift, not a legibility failure at the moment that matters.

## Regression check, untouched states — **clean**

STATE_1: two visibly distinct blocks at t=0 and at the frozen pin, equal-mass recoil symmetric (a = ±0.10 m/s² both), F₁₂/F₂₁ equal-length twins — CRITICAL stays resolved. STATE_2: labels legible, 1:3 mass ratio visible in the HUD, arrows stay identical length as the contrast payload requires. STATE_4: continuous free-run confirmed (Rule 37), symmetric recoil, live numeric HUD tracks slider drags smoothly (F=39.96N reading against a F=40.0N slider target is normal ramp transient, not a label/thumb mismatch).

## Standing checklist

- Slider thumb vs printed numeric label: consistent in S2 (m₂=900.0kg) and S4 (m₁/m₂/F all match thumb positions) — no rail-pin signature.
- HUD/caption/position: no contradictions found.
- STATE_2 contrast delta (Rule 32b): confirmed — mass changes, arrow length does not.
- Rule 34 clutter/clipping/overlay collisions: none found; ONE formula surface per state; HUD stays clear of the review-chrome corner; all math renders in Unicode (Σ, ≠, ∝, →, ₁, ₂) — no ASCII transcription anywhere sampled.

## Frames for founder eyes

None required — zero findings this walk.

## Candidate engine_bug_queue rows

None. Both prior MODERATEs are now resolved and not re-opened.

## Overall read: CLEAN
