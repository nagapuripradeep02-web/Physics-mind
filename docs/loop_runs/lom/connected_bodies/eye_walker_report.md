# eye_walker report -- connected_bodies
Run dir: `.visual_runs/connected_bodies/20260725-220424/`
Engine bug queue consult: `query_engine_bug_queue.ts connected_bodies --field3d --open` and
`... newtons_laws_body --field3d --open` both returned **no matching rows** -- no known scar to carry
into this walk.

## 1. Deterministic gate summary
As handed to me by the dispatching session (not re-run by me; no raw stdout captured in the run dir):
**31/31 deterministic checks passed.** Confirms: this concept is the case where the deterministic
gates are silent and pixel-judgment is the real gate, per the dispatch brief.

## 2. Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 coupled-glide | ok apparatus complete, labels present | CRITICAL FAIL | ok (vs black baseline) | ok | v/a readouts read 0.00 at every sampled t (0,1,2,...,15s) and frozen -- body never moves. Design demands constant v=0.35 m/s the WHOLE state. |
| S2 reveal-build | ok T arrows on both bodies, T1=T2=T formula present | MAJOR FAIL (same root cause as S1) | ok (arrows appear) | ok | Identical apparatus pixel-for-pixel from t=0 to t=17000 (checked t=0,1,2,17s) -- the "glide continues" home-pose motion never happens; arrows also show no fade-in across sampled frames (already full at t=1000ms) |
| S3 translate-through | ok ghost A_ghost present, dim, frozen at start; T/weight readouts correct (13.07 vs 19.60) | ok visible progressive motion t=0 to 2000, then held to t=20000 | ok (strong -- ghost + moved body + unequal arrows) | ok | Best state in the set. PRIMARY aha lands cleanly. No clipping. |
| S4 glow-walk | ok all four arrow kinds present (N, mg, T, SumF) on both bodies, formula present | ok visible progressive motion t=0 to ~2500ms, held after | ok (arrow census changes vs S3) | ok | Cannot confirm single-glow-focal sequencing (Rule 32e) from stills -- arrow brightness differences are subtle at this resolution; needs runtime probe, not asserted as a defect |
| S5 coupled-glide (contrast pair) | ok incline posed at 30 deg, component arrows (mg sin theta, mg cos theta) drawn, N/T/f readouts match design exactly (N=33.95, T=28.11, f=6.79, a=0.43) | ok visible creep t=0 to 4000, held after | ok (incline vs flat table -- large delta) | ok | Clean state, no clipping, numbers match physics_block section 6 exactly |
| S6 mirror-descent | ok P/Q labels, mg arrows both bodies, T readout on both = 20.08 N, a=+0.24/-0.24 mirrored | ok P descends / Q ascends mirrored, visible t=0 to ~4000ms | ok (slab vanishes -- large delta) | MAJOR FAIL | Framing defect. The entire Atwood apparatus is confined to a small area in the bottom-right ~15% of the canvas, off-center, in EVERY sampled frame (checked t=0,4000,8000, contact sheet all 16 frames). The pulley wheel itself is not visible -- only two vertical rope/T labels running off the TOP edge of frame, consistent with the pulley being cropped above frame. This does not read as a deliberate composition; it reads as a camera-calibration miss for the "S6 gets its own vertical framing" note in physics_block's framing note section. |
| S7 drag-sandbox | ok all 7 sliders present (m,m2,F,theta,mu_s,mu_k,v0), idle_auto_sweep on m visibly running (4.0 to 6.8 to 7.1 to 8.5 to 9.8 across samples) | ok continuous motion, never freezes (Rule 37 compliant) | ok (cyan explorer body + full slider rail -- large delta from S6) | MODERATE FAIL (34d) | Overlay collision. A faint duplicate "SumF / Summ" formula-surface glyph renders BEHIND the m2 HUD block's v= / T= text, at the same fixed screen position in every S7 frame sampled (t=0,3000,10000, and frozen). S7's HUD is taller than S1-S6's (7 readout lines per body: N,fk,a,v,T,SumF,F vs S1-S6's 1-4 lines) and appears to grow down into the fixed formula-surface zone used by earlier states. |

## 3. Frames for founder eyes (5 max)

1. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-220424\STATE_1__dense_t00000.png -- S1 shows v=0.00/a=0.00; compare against any other S1 dense frame (identical) to see the state never advances despite the "One rope, one motion" constant-glide claim.
2. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-220424\STATE_1__dense_t15000.png -- pixel-identical to frame 1 above (15 s apart) -- the confirming pair for finding 1.
3. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-220424\STATE_6__dense_t04000.png -- the S6 Atwood framing: apparatus tiny, off-center bottom-right, pulley wheel not visible in frame.
4. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-220424\STATE_7__dense_t00000.png -- the "SumF / Summ" ghost text overlapping the m2 HUD block (right side, approx x1195,y300).
5. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-220424\STATE_3__frozen.png -- for contrast: the PRIMARY aha state done RIGHT (ghost, unequal arrows, clean motion) -- founder reference for what S1 should also look like.

## 4. Candidate engine_bug_queue rows (report only -- not inserted, no DB writes made)

1. bug_class: connected_body_zero_a_state_never_advances_clock
   severity: CRITICAL
   owner_cluster: ambiguous (peter_parker:renderer_primitives most likely -- looks like the
   newtons_laws_body scenario's motion clock doesn't drive a nonzero initial_velocity_mps glide
   when the state's solved a = 0 exactly; alex:json_author is a secondary candidate only if some
   required override is missing that json_author should have added -- but physics_block section 2 already
   specifies initial_velocity_mps: 0.35 on body A, so the override IS authored)
   prevention_rule: Any connected_incline_hanging-family state whose solved a == 0 (a
   deliberately balanced coupling) must still integrate s = s0 + v0*t frame-by-frame from the
   authored initial_velocity_mps -- a=0 must not gate the position/velocity integrator to a static
   pose. THE EYE's own dense-series sampling (not just the frozen frame) is what caught this; a
   frozen-only read would have missed it since S1 has no reveal phases to judge.
   evidence: S1 v/a read 0.00/0.00 at t=0,1,2,3,...,15000ms and the frozen frame -- 17 identical
   samples across the full 15 s window, body position unchanged to the pixel.

2. bug_class: atwood_state_pulley_apparatus_offcenter_offframe
   severity: MAJOR
   owner_cluster: peter_parker:renderer_primitives (camera_position/lookAt calibration for
   connected_atwood + surface.hidden: true)
   prevention_rule: any state that hides the surface (Atwood/counterweight rigs) needs its OWN
   camera framing pass proven with a Playwright projection probe BEFORE authoring -- physics_block's
   framing note already flagged this as a to-do for json_author ("S6 gets its own vertical framing"
   / probe not yet run) but the captured frames show it was not actually recalibrated: apparatus
   occupies roughly the bottom-right 15% of the canvas, pulley wheel appears to be cropped above the
   visible frame.
   evidence: all 16 S6 dense frames + the frozen frame + the contact sheet show the identical
   small, off-center composition.

3. bug_class: formula_surface_collides_with_tall_multiline_hud
   severity: MODERATE
   owner_cluster: peter_parker:renderer_primitives (the fixed formula-surface screen zone doesn't
   account for a HUD readout list that grows past approx 4 lines/body)
   prevention_rule: the formula-surface placement (Rule 34b/34d "ONE formula surface... overlays
   never collide") should be computed relative to the ACTUAL rendered HUD height for the state
   (S7 exposes 7 readout lines/body -- N, fk, a, v, T, SumF, F -- vs S1-S6
's 1-4), not a fixed y-offset
   that only clears the shorter guided-state HUDs.
   evidence: faint "SumF / Summ" text visible bleeding behind the m2 readout block's v=/T= lines
   in every S7 frame sampled (t=0, 3000, 10000, frozen) at the same screen position.

## 5. Items explicitly NOT flagged (per false-positive guidance)
- S3/S4/S5/S6 halting at the end of their short accelerating run and holding for the rest of
  narration -- this is the documented "no motion loop" engine limitation (GAP CANDIDATE 1), correctly
  designed around, not a defect.
- S5's incline never tilting (static 30 deg pose) -- GAP CANDIDATE 3, designed around per skeleton.
- S7's idle_auto_sweep monotonically climbing 4.0 to 9.8 across my 3-4 widely-spaced samples rather
  than visibly triangling -- I only have 4 samples across 10s against a stated 4000ms period, so I
  cannot rule out a working triangle from stills this sparse; not asserted as a defect, needs runtime
  probe if the founder wants it settled precisely.
- S1/S2 arrows appearing "already full" by t=1000ms rather than mid-fade -- given finding 1 (the
  whole state's clock appears not to be advancing motion), I read this as the SAME root cause rather
  than a second independent phases[] bug, so I am not logging it separately.

## 6. Overall read
FINDINGS (3) -- one CRITICAL (S1's entire taught content -- constant-v coupling -- is not rendering
as motion, readouts pinned at zero), one MAJOR (S6 Atwood framing), one MODERATE (S7 formula/HUD
overlay collision). S3, S4, S5 are clean and S3 in particular is an exemplary PRIMARY-aha state.
