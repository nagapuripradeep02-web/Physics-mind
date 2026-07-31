# eye_walker report — newton_third_law
Run: `.visual_runs/newton_third_law/20260725-221918/`

Deterministic gate summary (verbatim): 📊 19 deterministic checks · 19 passed · 0 failed · $0.00 · run ms n/a

## Bug queue pre-walk consultation
`query_engine_bug_queue.ts newton_third_law --field3d --open` → No matching engine_bug_queue rows (nothing OPEN/DEFERRED named this concept). Skeleton/physics_block both name the `field3d_nlb_two_body_lane_offset_missing_causes_full_occlusion` CRITICAL scar as "fix landed, commit 3a576ea" — carried into the walk as the #1 thing to look for.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 | ✗ | ✓ | ✓ (vs black baseline) | ✓ | frozen pin (~t=1-2s) shows m₁/m₂ blocks ~85% overlapped, stacked labels — recoil later (t≥5s) resolves cleanly to ±7.2m, arrows equal-length throughout |
| STATE_2 | ✗ | ✓ | ✓ (arrows stay identical while masses/accel split visibly by t≥5s) | ✓ | same occlusion at reveal pin; m₂ slider thumb tracks 900kg plausibly; resolves by t=5-6s |
| STATE_3 | ✓ | ✓ | ✓ (ghost at distinct −1.5m pose, no occlusion, mg/N visibly cancel, F₁₂ un-partnered glows) | ✓ | clean — ghost avoids the two-real-body occlusion by design |
| STATE_4 | ✗ | ✓ | ✓ (all sliders exposed, F-sweep visible via thumb + readout together) | ✓ | same t=0 occlusion; F-slider thumb correctly tracks idle auto-sweep value across frames (15→37→44N observed, no rail-pin defect) |

## Frames for founder eyes
1. `.visual_runs/newton_third_law/20260725-221918/STATE_1__frozen.png` — reveal-pin shows the two 300kg blocks (m₁/m₂) merged into one blob with stacked labels, at the exact moment the pedagogy needs "two equal blocks side by side, legible."
2. `.visual_runs/newton_third_law/20260725-221918/STATE_1__dense_t00000.png` — t=0 confirms the same ~85% overlap is present from the very first frame, not just the freeze pin.
3. `.visual_runs/newton_third_law/20260725-221918/STATE_2__frozen.png` — same occlusion recurs in the declared S1/S2 contrast-pair state.
4. `.visual_runs/newton_third_law/20260725-221918/STATE_4__dense_t00000.png` — confirms occlusion recurs a third time in the sandbox state (all three states using two independent real bodies via `nlbBodyLaneZ`).
5. `.visual_runs/newton_third_law/20260725-221918/STATE_1__dense_t05000.png` — for contrast: by t=5s the two blocks ARE cleanly separated with legible labels, showing the defect is confined to the early window, not the whole state.

## Candidate engine_bug_queue rows
1. `bug_class`: `field3d_nlb_two_body_lane_offset_insufficient_separation_at_shared_start` (new — recurrence of the CRITICAL scar the commit 3a576ea fix was believed to close)
   `severity`: CRITICAL
   `owner_cluster`: peter_parker:renderer_primitives
   `prevention_rule`: at t=0 and at any state's H2/reveal-complete freeze pin, `nlbBodyLaneZ`'s lane offset must clear enough screen-space separation (in the concept's own authored camera framing) that two same-size bodies at the same `initial_position_m` never render with >~30% bounding-box overlap or stacked co-located labels — verify against the actual camera/projection, not just world-space Z offset magnitude.

No other findings — arrows, HUD numerics, formula surfaces, slider tracking (incl. the idle F-sweep on STATE_4), Rule 34 clutter/Unicode, and STATE_3's ghost isolation were all clean.

## Overall read
FINDINGS (1)
