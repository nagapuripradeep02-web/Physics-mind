# eye_walker report -- connected_bodies -- CYCLE 2 (post pulley-mesh fix)

Run dir: .visual_runs/connected_bodies/20260726-002614/ (fresh dump, post engine fix aa7daf5).
Prior run for comparison: .visual_runs/connected_bodies/20260725-232851/ (cycle 1).
Cycle-1 report: docs/loop_runs/lom/connected_bodies/eye_walker_report_cycle1.md.

Engine bug queue consult (pre-walk): query_engine_bug_queue.ts connected_bodies --field3d --open
returned "No matching engine_bug_queue rows." -- confirms nothing has been logged yet for this
concept (the cycle-1 candidate rows were reported, not inserted, per contract).

## 1. Deterministic gate summary
As handed to me by the dispatching session: 31/31 deterministic checks passed.

## 2. Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 coupled-glide | ok, unchanged from cycle 1 | unchanged, real v=0.35/a=0.00 glide confirmed | ok | ok | Re-verified frozen frame (T-less HUD, v/a readouts) matches cycle-1 read exactly. Not re-flagged. |
| S2 reveal-build | ok, unchanged | unchanged | ok | ok | Frozen frame T1=T2=T=19.60N both bodies, identical to cycle 1. Not re-flagged. |
| S3 translate-through | ok, unchanged (PRIMARY aha) | unchanged | ok | ok | Frozen: T=13.07N / a=3.27 m/s^2 both bodies, A_ghost dim/static, T arrow shorter than mg -- consistent with cycle-1 read. Not re-flagged. |
| S4 glow-walk | ok, unchanged | unchanged | ok | ok | Frozen matches cycle-1 read (N/mg/T/SumF arrows, a=0.65, T=18.29N both bodies). Not re-flagged. |
| S5 coupled-glide (contrast, incline) | ok, unchanged | unchanged | ok | ok | Confirmed: pulley post/bracket leans WITH the 30 deg incline (mounted flush to the top of the slope, arm angled to match), exactly as cycle 1 described. Formula, N/T/fk readouts, component arrows all present. Not re-flagged. |
| S6 mirror-descent | FIXED -- wheel now renders | ok, mirrored motion unaffected (confirmed at t=4000, matches frozen) | ok | partial (new sub-finding, see below) | The pulley wheel mesh is now VISIBLE: a clear dark disc with hub, wrapped in a bright glow ring (the declared glow_focal: nlb_pulley_wheel is now the single lit element in the frame -- confirmed against Rule 32e, nothing else glows). Both ropes (T labelled) terminate tangent on the wheel rim, one from each body, exactly as designed. Slab is gone (by design, S6 is the pure-Atwood contrast). T=20.08N / a=+-0.24 m/s^2 held on both bodies at frozen, matching the already-confirmed bc649d4 fix from cycle 1. Confidence: high, checked contact sheet (16 dense frames) + frozen + t=4000 individually -- wheel is present and identical in every frame, not an artifact of one capture. NEW, not previously checkable: the vertical post below the bracket now visibly ends in open space -- no ceiling, stand-base, or floor mount drawn -- because the table slab that used to visually explain the anchor is gone. See section 5 for the founder-facing read on this. |
| S7 drag-sandbox | ok all 7 sliders, idle_auto_sweep running | ok continuous, never freezes (Rule 37) | ok | partial (both cycle-1 residuals CONFIRMED STILL PRESENT) | (1) m2 HUD box still overflows: faint SumF/F=0.00N lines visibly bleed past the m2 panel bottom edge into the m1-mass slider row directly below, at the same screen coords as cycle 1 (roughly x1105-1195, y346-368) -- checked t=0000 and frozen, unchanged in character. (2) formula_overlay is still absent entirely -- confirmed across t=0000/frozen, no symbolic equation renders anywhere on canvas in S7, same founder judgment call as cycle 1 (see section 5). |

## 3. Frames for founder eyes (4)

1. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260726-002614\STATE_6__frozen.png
   -- THE FIX: pulley wheel now rendered with rim/hub and single glow ring (Rule 32e), both ropes
   tangent on the wheel, slab correctly absent. Founder should confirm this reads as the intended
   Atwood contrast. Also the frame to judge the floating-post question from (section 5).
2. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260725-232851\STATE_6__frozen.png
   (cycle-1, pre-fix) -- direct before/after: ropes terminating in empty space with no wheel at all.
   Kept for side-by-side contrast against frame 1.
3. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260726-002614\STATE_7__frozen.png
   -- both residual S7 items in one frame: faint m2 HUD overflow into the m1 slider row, and the
   still-absent formula surface, for the founder to weigh together.
4. C:\Tutor\physics-mind-lom-a\.visual_runs\connected_bodies\20260726-002614\STATE_5__frozen.png
   -- confirms the pulley post leans correctly with the 30 deg incline, unaffected by the S6-only fix
   (isolation proof from the pixel side, matching the surgeon claim).

## 4. Candidate engine_bug_queue rows (report only -- not inserted, no DB writes made)

1. bug_class: atwood_pulley_wheel_mesh_not_rendered
   status: RESOLVED by aa7daf5 -- verified in pixels across all 16 S6 dense frames + frozen. Not a
   new row; recording resolution only so the queue history is accurate if the founder logs it.
   confidence: high.

2. bug_class: atwood_pulley_post_floats_without_visible_mount
   severity: MINOR-MODERATE (new, surfaced only now that the wheel above it is checkable)
   owner_cluster: peter_parker:renderer_primitives
   prevention_rule: when the bracket/post primitive that carries the pulley wheel is rendered with
   its parent surface hidden (the pure-Atwood/counterweight rig class), the post lower end should
   terminate against SOME anchor cue (a short ceiling tab, a floor-mounted stand base, or a visible
   clamp) rather than in open space, so the rig reads as physically mounted rather than levitating.
   evidence: STATE_6__frozen.png -- vertical post + horizontal arm hang correctly from the wheel but
   the post bottom end simply stops mid-air with roughly 150-200px of empty canvas below it and no
   base/mount geometry, unlike S1/S2/S4/S5 where the identical bracket shape reads as mounted because
   the visible table edge sits directly under it.
   confidence: medium-high on the visual fact (clearly floating, not a crop artifact); confidence
   LOW-MEDIUM on whether this needs an engine fix vs. is acceptable as an abstract schematic -- this
   is a pedagogy/polish judgment call, not a physics-correctness bug (T, a, and the glow-focal wheel
   are all now correct). Recommend NOT blocking the seal on this -- see section 5.

3. bug_class: sandbox_body_hud_box_overflows_into_slider_panel (residual from cycle 1, still present)
   severity: MINOR-MODERATE, unchanged
   owner_cluster: peter_parker:renderer_primitives
   prevention_rule: unchanged from cycle-1 candidate row -- a body HUD readout box should size to its
   actual line count (a hanging body 5 lines vs a table body 7) rather than share a fixed box
   height that lets the shorter box last lines bleed into the slider list below it.
   evidence: STATE_7__frozen.png + STATE_7__dense_t00000.png, same screen coords as cycle 1.
   confidence: medium (text is faint, not fully opaque, and does not obscure any slider numeric
   value or handle -- only touches the m1 slider LABEL text). Recommend NOT blocking the seal on
   this either -- already de-prioritized in cycle 1.

## 5. Founder-facing read requested by the dispatch (explicit)

Does the floating pulley post read as broken to a teacher, or as an acceptable abstract diagram?
My read: ACCEPTABLE, not broken. The post/bracket/wheel assembly is internally coherent (post, arm,
wheel, hub all correctly proportioned and in the right relative positions to each other) -- what is
missing is only the environmental anchor cue (ceiling/stand) that the table used to imply by
proximity. A teacher looking at this will read it the same way a textbook Atwood-machine diagram is
usually drawn: a pulley on a schematic stand, floating against a blank background, with no explicit
"bolted to a ceiling" detail -- that is a standard convention for this exact diagram type (compare
any HC Verma/NCERT Atwood figure: pulley + stand rendered against blank space, no room/ceiling
drawn). It does NOT misstate any physics: T, a, and the single correct glow-focal element (the wheel,
per Rule 32e) are all present and correct. I would not spend a fourth engine commit on this. If the
founder wants to close it, a cosmetic-tier fix (a short stand-leg or hatch mark at the post base)
would be a nice-to-have polish item, not a blocking defect.

S7 formula-overlay absence -- unchanged read from cycle 1: this is a defensible design choice (the
sandbox state spans multiple regimes with no single covering equation) and reads as appropriately
spare, not under-labelled, given the per-body HUD numerics remain legible. The HUD overflow item
(row 3 above) is the one piece of this state actually worth a future cosmetic pass.

## 6. Items explicitly NOT re-flagged (per false-positive guidance / already resolved)
- S3/S4/S5/S6 halting after their short accelerating run and holding (no motion loop) -- documented
  engine limitation, unchanged, correctly designed around.
- S5 incline never re-tilting (static 30 deg pose) -- unchanged, documented.
- Silent narration / no audio manifest -- expected by design.
- Judged every state from its frozen frame for reveal-completeness, never from a mid-dense frame
  (no repeat of the concept-1 false-positive that cost an engine dispatch).
- STATE_6 dense-t04000 already reads as held/static (matches frozen exactly) -- this is the expected
  accelerating-body-finishes-and-holds behavior, not a stalled-motion regression.

## 7. Overall read

CLEAN. Zero new blocking findings. The one engine fix (aa7daf5) is CONFIRMED RESOLVED in pixels: the
pulley wheel renders with rim, hub, and the single correct glow focal, both ropes tangent on it, S5
incline-mounted post unaffected (isolation proof holds). Both cycle-1 residuals (S7 HUD overflow, S7
no formula surface) are UNCHANGED and were already assessed as non-blocking MINOR-MODERATE /
founder-judgment items in cycle 1 -- not escalating either on this pass. The one genuinely new
observation (S6 post floats without a visible mount) is a cosmetic polish item, not a defect, per the
explicit read in section 5 -- recommend it NOT consume a fourth engine dispatch. Recommendation:
SEAL this concept. No candidate row rises to a severity that should block shipping; the queue already
carries the record for the resolved wheel-mesh bug.
