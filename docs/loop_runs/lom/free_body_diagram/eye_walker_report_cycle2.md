# EYE_WALKER REPORT - free_body_diagram (CYCLE 2, post engine-fix cd8fe67 + content fix cycle 2)
Run: .visual_runs/free_body_diagram/20260725-203742/ (6 states) - engine_bug_queue: no matching OPEN/DEFERRED rows for free_body_diagram (field3d) at time of walk (query re-run this pass, same result as cycle 1).

## 0. Correction acknowledgment
Cycle 1 asserted the v=2.00 to 0.00 snap occurred between t6000 and t7000 for STATE_3. field3d-surgeon true-clock probe found v=2.00 held through t06000/07000/08000/09000, only t10000+frozen read 0.00 - the defect class was real, the cited instant was not. This pass, every numeric HUD claim below is read from the exact frame cited; no crossing point is asserted unless both bracketing frames were actually read.

## 1. Deterministic gate summary (verbatim, founder-supplied)
27 deterministic checks - 27 passed - 0 failed - $0.00

## 2. Verification of the engine fix (RESET_TRAJECTORY, cd8fe67) + content re-frame (cycle 2)
STATE_3 (coast_no_force) - read t00000, t02000, t05000, t07000, t09000, t10000, and frozen individually (not sampled from the contact sheet thumbnail):
- v = 2.00 m/s and SumF = 0.00 N are IDENTICAL text in every one of those six frames plus frozen. No snap to 0.00 anywhere in the run.
- Body (cyan cube) is fully on-canvas, unoccluded, and legible in every frame from t=0 through t=10000. It never approaches the right-side HUD panel (body y-band approx 300-360px; HUD panels start at x=1088/y=53 top-right and x=1010/y=393 bottom-right - no vertical or horizontal overlap at any sampled frame).
- Ghost G3 sits static and dimmed (approx 0.40 opacity, no arrows, no glow) at a fixed screen position across the whole state - correct reference-marker behavior.
- The frozen frame shows the body partway along its traverse (between t approx 2000-3000 by extrapolated pixel speed, not at t=10000) - this is EXPECTED per the reading protocol: the frozen capture is pinned at the state reveal-complete time (all elements/labels present), not the state terminal position; STATE_3 has no staggered reveals so its reveal-complete pin lands early. Not a defect.
- Verdict: engine fix CONFIRMED. STATE_3 CRITICAL halt bug (cycle 0 + cycle 1) is resolved.

STATE_4 (coast_with_friction) - read t00000, t05000, t07000, t10000, and frozen:
- F = 5.88 N, fk = 5.88 N, SumF = 0.00 N identical across every frame checked; formula F = fk present and static.
- Body fully on-canvas and unoccluded throughout, same pattern as STATE_3 (left start, steady rightward travel, no off-screen exit, no HUD overlap).
- Verdict: RESOLVED - matches STATE_3 fix, no new regression.

Both states now show the body ON SCREEN with its N/mg (and F/fk) arrows for the full 10s, which is what this cycle brief asked to confirm in pixels. Confirmed.

## 3. Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29/34 | note |
|---|---|---|---|---|---|
| S1 fbd_isolate | OK G1/G2 dimmed, no arrows on ghosts, mg on body, body brighter than ghosts | OK settled by t=0 (non-finding) | OK "One body at a time" vs black baseline | OK | unchanged from cycle 1 |
| S2 rest_equilibrium | OK N=19.60N=mg, single formula surface, no net-force stub arrow | OK static equilibrium held | OK "Each contact becomes an arrow" | OK | unchanged from cycle 1 |
| S3 coast_no_force | OK body on-canvas, v=2.00 constant, SumF=0, ghost G3 dimmed and static | OK RESOLVED - confirmed above, full 10s on-screen, constant v | OK caption and physics now agree (no forward force needed and v genuinely stays constant) | OK | Findings 1/2 (cycle 1) CLOSED - see section 4 for one new MODERATE note on continuity |
| S4 coast_with_friction | OK body on-canvas, F=fk=5.88N constant | OK RESOLVED - confirmed above | OK "Applied force balances friction" reads true throughout | OK formula F=fk single surface, no wrap | Finding 2 (cycle 1) CLOSED |
| S5 incline_decompose | OK theta=30.00 deg constant, N=16.97N, mg-sin-theta/mg-cos-theta labels legible near-side-on | OK static, no oscillation (re-confirmed) | OK caption matches static physics | OK single formula N=mg-cos-theta, no collision | unchanged from cycle 1, still CLOSED |
| S6 sandbox (idle_auto_sweep) | n/a explore | OK genuinely oscillates - v sign flips (e.g. v=-1.47 to -1.11 with a=-0.12 to +1.46 across two samples), body stays fully on-canvas, SumF/F track live | n/a explore | OK value-only HUD, no clipping | unchanged from cycle 1, still CLOSED |

## 4. New observation this pass - home-pose continuity S2 to S3 (Rule 32d)

Not a regression of a prior finding; a byproduct of the cycle-2 camera/track re-frame worth recording:
- S2 frozen: plank spans screen x approx 368-910 (width 542px), body centered at x approx 639 (screen-center, world x=0).
- S3 t=0: plank spans screen x approx 247-1032 (width 785px, roughly 45 percent wider in-frame - the pulled-back camera plus longer 13m track), body starts at x approx 357, left-of-center (world x=-10m).
- So the SAME apparatus (plank + cube) changes both apparent scale and the body starting screen position in the very next state, rather than picking up from S2 centered home pose. S3 to S4 themselves stay consistent with each other (both start at the same x approx 357), so this is specifically an S2-to-S3 seam, not a running problem.
- This is a plausible, deliberate trade-off from the cycle-2 occlusion fix (pull back plus widen track), not a blank/broken frame - but it is a visible discontinuity a viewer would notice as the same box getting smaller and jumping left. Judgment call: MODERATE, not blocking, and arguably a reasonable price for fixing the CRITICAL off-canvas bug. Reporting per this cycle explicit brief to judge it rather than silently pass it.

## 5. Rule 32/34 sweep across all 6 states
- Cause-before-effect (32a): S4 caption (Applied force balances friction) and formula describe an already-balanced steady state rather than a visible push-then-friction-responds beat, but this matches its physics (constant v, not an onset transient) - no finding.
- Single glow focal (32e): in every state sampled, only the manipulated body reads brighter than its ghosts/surroundings; no two simultaneous bright focals observed.
- Genuinely-zero-force hides its arrow: confirmed in S3 - no net-force stub arrow is drawn on the body, only the text formula SumF = 0.
- Ghost bodies: G1/G2 (S1) and G3 (S3) all read dimmed (approx 0.40), arrow-free, and static across every frame checked.
- Rule 34 caption/formula/HUD: every state top caption is a short delta cue, one formula surface per state (math-serif Unicode style, theta/Sigma/dot/degree render correctly, no ASCII theta-word/deg/arrow-text), HUD numeric-only, no corner clipping or Full-screen-chrome collision observed in any frame read.
- No blank/partial scenes, no black/NaN materials, no mid-animation stuck frames, no off-canvas geometry in any state this cycle.

## 6. Candidate engine_bug_queue rows (0 blocking; 1 informational)
1. bug_class: coast_state_home_pose_scale_jump_from_rest_equilibrium (NEW, informational - not a defect, a design trade-off worth a permanent note)
   severity: MODERATE
   owner_cluster: alex:json_author
   prevention_rule: When a state camera_position/surface.length_m is widened to fix off-canvas travel (as done here for STATE_3/4), check whether the immediately preceding state shares a body that was centered/near-camera - if so, consider an intermediate camera move or an explicit zoomed-out framing beat rather than a hard cut, so Rule 32d recognizable home pose still reads cleanly across the seam. Not required to fix before shipping; log so future camera-widen fixes check this seam by default.

## 7. Frames for founder eyes (3)
1. .visual_runs/free_body_diagram/20260725-203742/STATE_3__dense_t10000.png - proof the CRITICAL halt/off-canvas bug is fixed: v=2.00 m/s, body fully visible near the right side of frame at the state last dense sample.
2. .visual_runs/free_body_diagram/20260725-203742/STATE_4__dense_t10000.png - same proof for STATE_4: F=fk=5.88N constant, body visible, no off-canvas exit.
3. STATE_2__frozen.png vs STATE_3__dense_t00000.png (paired) - the S2-to-S3 home-pose scale/position jump described in section 4, for founder judgment on whether it needs a fix.

## 8. Overall read
CLEAN (both previously-CRITICAL findings confirmed resolved with frame-level evidence; the three cycle-1 already-fixed items re-confirmed stayed fixed) - one new MODERATE informational note logged (S2-to-S3 home-pose scale jump) that does not block approval. Recommend proceeding to founder review / visual:approve at founder discretion; no routing needed.
