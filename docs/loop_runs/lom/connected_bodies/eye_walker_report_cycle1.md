# eye_walker report -- connected_bodies -- CYCLE 1 (post-fix)

Run dir: .visual_runs/connected_bodies/20260725-232851/ (fresh dump, post 5a07aa9 + content fixes).
Prior run for comparison only: .visual_runs/connected_bodies/20260725-220424/.
Cycle-0 report: docs/loop_runs/lom/connected_bodies/eye_walker_report.md.

Engine bug queue consult (pre-walk): query_engine_bug_queue.ts connected_bodies --field3d --open
returned no matching rows -- confirms no scar was carried into cycle 0, and none has since been
logged for this concept.

## 1. Deterministic gate summary
As handed to me by the dispatching session: 31/31 deterministic checks passed (re-confirmed after
fixes; not re-run by me directly).

## 2. Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 coupled-glide | ok apparatus complete, labels present | RESOLVED (confidence: high) | ok | ok | v=0.35 m/s, a=0.00 both bodies at t=0 AND t=15000 AND frozen; block visibly slides table-length toward pulley across the full dense series (contact sheet t=0..15000, 16 frames, monotonic progressive translation), hanging body descends in lockstep, rope stays taut and attached to both bodies at every sampled frame. CRITICAL finding from cycle 0 is FIXED. |
| S2 reveal-build | ok T1=T2=T formula + arrows on both bodies | RESOLVED (confidence: high) | ok | ok | Same glide confirmed continuing under the T-arrow reveal (t=0 through t=17000, contact sheet), block visibly progresses across all 18 sampled frames; T=19.60 N both bodies, consistent with a=0 (T=m2g exactly, which is the correct physics for this specific zero-acceleration coupling -- distinct from S3 contrast state, which is a different, accelerating case). MAJOR finding from cycle 0 is FIXED. |
| S3 translate-through | ok ghost A_ghost dim/static, T arrow visibly shorter than mg arrow | ok progressive motion t=0-2000, held after (by design) | ok | ok | Still the exemplary PRIMARY-aha state. New verification (per dispatch item 4): frozen frame AND t=19000 (late-held) both read T=13.07 N / a=3.27 m/s^2 on both bodies -- the achieved accelerating solution, NOT the reverted m2g=19.60N rest answer. Readout-revert-on-halt bug (bc649d4) confirmed fixed here. |
| S4 glow-walk | ok N/mg/T/SumF arrows both bodies, formula present | ok progressive motion then held (by design) | ok | ok | Unaffected by this cycle fixes, unchanged from cycle-0 clean read. Not re-flagged. |
| S5 coupled-glide (contrast pair) | ok incline 30 deg, component arrows, N/T/f readouts | ok visible creep then held (by design) | ok | ok | Unaffected by this cycle fixes, unchanged from cycle-0 clean read. Not re-flagged. |
| S6 mirror-descent | partial -- see notes | ok P descends / Q ascends mirrored, t=0-~4000 then held | ok | partial (new finding) | Framing FIXED: rig now centred on-screen (P and Q both fully in frame with clear margin, checked t=0/4000/frozen + full contact sheet). T=20.08 N held on both bodies at frozen (not reverted to individual weights) -- confirms item 4 also holds here. NEW: the pulley wheel mesh itself is not visible in ANY S6 frame -- both ropes rise from the two bodies and simply terminate in empty space at the top of the visible apparatus (well within frame, not a crop) with no disc/hub drawn, unlike S1/S2/S5 where a grey pulley wheel is clearly rendered at the rope turn point. S6 is also the one state whose JSON declares glow_focal: nlb_pulley_wheel -- so the intended single glow-focal element for this state is invisible, a legibility miss even though centering is now correct. |
| S7 drag-sandbox | ok all 7 sliders, idle_auto_sweep visible running | ok continuous motion, never freezes (Rule 37 compliant) | ok | partial (new finding) | Original formula-vs-HUD collision CONFIRMED GONE -- no formula_overlay renders in S7 at all (removed for this state per the dispatch note), verified across t=0/3000/10000/frozen. Founder judgment call, see section 5. NEW, smaller collision found in its place: m2 HUD block (which only needs a/v/T/SumF/F -- N and fk correctly suppressed for a hanging body) still occupies a fixed-height box that extends slightly past the m1/m2 HUD panel bottom edge, and its last one-to-two lines (SumF=.../F=0.00N) render faint/dim, partially overlapping the m1-mass slider label + track directly below at the same fixed screen position. Visible at t=0000 and frozen (same screen coords, roughly x1105-1195,y346-368). Much milder than the cycle-0 formula collision (this is a same-panel internal overflow, not two independent surfaces crossing), but it is a genuine Rule 34d overlay-adjacency defect. |

## 3. Frames for founder eyes (5 max)

1. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-232851\STATE_1__dense_t00000.png
   -- S1 now shows real v=0.35/a=0.00 motion; compare to the equivalent cycle-0 frame to see the CRITICAL fix land.
2. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-232851\STATE_6__frozen.png
   -- S6 centering fix confirmed (both bodies + margin), but shows the pulley wheel is simply absent
   from the render -- ropes terminate in empty space. Founder should judge whether this needs a
   follow-up engine fix.
3. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-232851\STATE_1__dense_t01000.png
   -- shows what a real pulley wheel looks like in this concept, for direct contrast against frame 2.
4. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-232851\STATE_7__frozen.png
   -- the new, smaller HUD/slider-panel overlap in the m2 block (faint SumF/F lines bleeding into the
   m1 slider row) -- for the founder to weigh against the removed-formula-overlay judgment call below.
5. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-232851\STATE_3__frozen.png
   -- confirms the readout-revert fix: T=13.07N held (not reverted to 19.60N), tension arrow visibly
   shorter than weight arrow -- the PRIMARY aha now reads correctly at rest too.

## 4. Candidate engine_bug_queue rows (report only -- not inserted, no DB writes made)

1. bug_class: atwood_pulley_wheel_mesh_not_rendered
   severity: MODERATE
   owner_cluster: peter_parker:renderer_primitives
   prevention_rule: when newtons_laws_body.surface.hidden: true is set (the Atwood/counterweight
   rig class), the pulley wheel mesh must still be drawn at the post position -- likely the wheel
   primitive is currently parented to (and hidden along with) the surface mesh rather than being an
   independent object. This is the same state that declares glow_focal: nlb_pulley_wheel, so the
   state one designated focal element is currently invisible (Rule 32e single-focal intent
   defeated by omission, not collision).
   evidence: all 16 S6 dense frames + frozen + contact sheet -- ropes from both P and Q converge and
   terminate in open space at the top of the apparatus with no disc/hub mesh visible, contrasted
   against S1/S2/S5 (surface visible, not hidden) where the same pulley wheel renders as a clear grey
   circle at the rope turn point.
   confidence: high (visually absent across every sampled frame; ruled out as a framing/crop artifact
   since the empty space above the rope ends has roughly 250px of headroom before the canvas edge).

2. bug_class: sandbox_body_hud_box_overflows_into_slider_panel
   severity: MINOR-MODERATE
   owner_cluster: peter_parker:renderer_primitives
   prevention_rule: a body HUD readout box height should be sized to the actual number of
   readouts it displays for that body (a hanging body showing a/v/T/SumF/F = 5 lines vs a
   table body showing N/fk/a/v/T/SumF/F = 7 lines), not a shared fixed box height -- currently the
   shorter box last 1-2 lines bleed past its own panel edge into the slider list positioned
   directly below it on-screen.
   evidence: STATE_7 t=0000/frozen frames, faint SumF/F=0.00N text visible overlapping the
   m1-mass slider row at the same screen position in both frames.
   confidence: medium -- text is faint/dim rather than fully opaque, so severity reads lower than the
   cycle-0 formula-vs-HUD collision; a runtime probe of the actual DOM/canvas z-order would settle
   whether this is a rendering bug or an intentional very-low-opacity secondary-body HUD style choice
   (if intentional, it should still be repositioned, not just dimmed, since it currently touches the
   slider label text).

## 5. Founder judgment call (not a defect -- flagging per dispatch instruction)

STATE_7 formula_overlay was removed entirely to resolve the cycle-0 collision. Verified: the
overlay is genuinely gone (not just moved) across all sampled S7 frames. The sandbox state now shows
no symbolic equation on canvas -- only the two per-body numeric HUD blocks and 7 sliders. Given S1-S6
each show one governing formula, and S7 is explicitly the every-body-every-control free-exploration
state, this reads as a defensible design choice (the explore state does not need to re-teach a specific
equation since m1 controls now span multiple regimes -- flat/incline/friction/applied-force -- with
no single formula covering all of them). Founder should confirm this reads as appropriately spare
rather than under-labelled -- this cannot be settled from pixels alone, it is a pedagogy judgment.

## 6. Items explicitly NOT re-flagged (per false-positive guidance / already resolved)
- S3/S4/S5/S6 halting after their short accelerating run and holding (no motion loop) -- unchanged
  documented engine limitation, correctly designed around.
- S5 incline never tilting (static 30 deg pose) -- unchanged, documented.
- Silent narration / no audio manifest -- expected by design (dispatch note).
- S1/S2 ropes/arrows appearing fully formed rather than mid-fade at t=1000ms -- same as cycle 0,
  not re-asserted as a separate defect; this is now clearly NOT related to a stalled clock (S1/S2
  motion is confirmed real), so if this is worth settling it is a reveal-timing question, not a
  motion-engine question -- flagging as low-priority / needs runtime probe only if founder cares.

## 7. Overall read
FINDINGS (2) -- both MODERATE or lower, both new/residual rather than repeats of the original three.
All three cycle-0 findings are CONFIRMED RESOLVED: S1/S2 constant-velocity glide is real and
continuous (was CRITICAL), S6 Atwood rig is centred with both bodies in frame (was MAJOR, though a
new sub-issue -- the pulley wheel itself being invisible -- surfaced once centering was fixed and
made the wheel absence checkable for the first time), and S7 original formula/HUD collision is
gone (was MODERATE, replaced by a much milder HUD/slider-panel overlap in its place). The bc649d4
readout-revert-on-halt fix is also confirmed correct on both S3 (T=13.07N held) and S6 (T=20.08N
held, mirrored a=+/-0.24).
