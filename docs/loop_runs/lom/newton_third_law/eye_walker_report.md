# eye-walker report — newton_third_law (THIRD / FINAL pass — post SumF-removal + Rule 34c Unicode sweep)

Run dir: `C:\Tutor\physics-mind-lom-b\.visual_runs\newton_third_law\20260729-231113\`
Prior report (STALE per dispatch instruction — superseded by this pass): same path, prior content
described the RESOLVED STATE_4-static scar and the now-fixed SumF-arithmetic MAJOR.

## Deterministic gate summary (verbatim)

```
31 deterministic checks - 23 passed - 8 failed - $0.00 - 140737ms
```

All 8 failures are [H2] visual-regression checks on STATE_1/1__frozen/2/2__frozen/3/3__frozen/4/4__frozen
vs the OLD (rejected v1) baseline — EXPECTED per Rule 34e, this arc is about to replace it via
`visual:approve`. STATE_5 correctly has no baseline. All D1p/D5/D6/D7/H1/H3 passed, including STATE_4's
D6 profile still showing real motion (0.00% to 0.00% to 0.30% ...), confirming the friction-ramp fix is intact.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29/34 | note |
|---|---|---|---|---|---|
| STATE_1 | OK | OK - symmetric recoil, spring compresses then releases then hides | OK | OK | F21=-F12 renders clean bold Unicode; m1/m2 subscripts correct |
| STATE_2 | OK | OK - arrows pixel-identical, a=7.50 vs -2.50 exact 3:1, positions split 3:1 by t=12000 | OK | OK | pair formula clean Unicode, no ASCII found |
| STATE_3 | OK | OK - wall (Earth) static, cart recoils away, full-length full-bright wall-reaction arrow | OK | OK | a=F/m arrow renders with real Unicode arrow, no ASCII "->" found |
| STATE_4 | OK - SumF contradiction CONFIRMED GONE (see verdict below) | OK - held then breakaway then bound-stop, real motion, not static | OK | OK | see detailed verdict below |
| STATE_5 | OK | OK - sandbox stays live/draggable across the whole capture (Rule 37 continuous run) | n/a (explore) | OK | slider labels m1 = 6.0 kg / m2 = 6.0 kg correct subscripts |

## STATE_4 - the whole point of this pass

1. Is the SumF contradiction gone? YES, confirmed at every sampled frame from t=0 through FROZEN
(t=0, 1000, 2000, 3000, 4000, 6000, 14000, frozen - 8 samples read directly). The HUD readout block now
reads only F = plus/minus 30.00 N and f_s/f_k per body - there is no SumF row anywhere in the HUD any
more (confirmed removed, matching the reported JSON change to F_applied and f). The formula_overlay is
now the pair identity F21 = -F12, a symbolic relation with no live numeric substitution, so there is no
arithmetic for a student to check against the HUD and find false. The specific frame that broke the last
pass (F=30.00 / f_k=0.00 / SumF=0.00 next to a SumF1 = F21 + f1 overlay) no longer exists in any form:
STATE_4__dense_t06000.png, t14000.png, and __frozen.png are now pixel-identical bound-stop tableaux
reading m1: F=30.00N, f_k=0.00N / m2: F=-30.00N, f_k=0.00N next to the pair-identity overlay -
arithmetically inert, not false. MAJOR RESOLVED.

2. Does STATE_4 still teach "the pair lives on different bodies, so it doesn't cancel" now that the live
SumF number is gone? YES - and arguably it reads more cleanly now than with the SumF row present. The
held phase (t=0 to ~2000ms, confirmed in t00000/t01000) shows, on one cart pair, two equal-magnitude
arrows: the green applied-force arrow and the pink static-friction arrow, both reading 30.00 N, rendered
on each body (visible at pixel level in a 4x crop of the contact region - labels F21/f_s legible,
subscripts intact). The caption "Cancelling needs one body" plus the narration walk tells the student
directly: this 30=30 cancellation is two forces on the SAME body (that is why the cart sits still), which
is the deliberate contrast against the formula's actual subject - the F21=-F12 pair, which lives on
DIFFERENT bodies and therefore never appears in any single body's own free-body sum. The picture and the
formula now agree completely: nothing on screen claims to be "the sum" that is not. This is a cleaner
teaching device than the previous SumF-readout approach, not a downgrade.

3. Still a real, watchable breakaway, not static? YES - reconfirmed independently of the prior pass:
t00000/t01000 = held tableau (friction arrows present, pegged to 30N); t02000 = still held; t03000/t04000
= friction arrows gone (f_k=0.00N), carts visibly separated and separating further; t06000 onward through
t14000/frozen = carts parked at the track ends, holding. Real, non-teleporting, non-static motion arc,
matching D6's motion profile.

4. F_applied exact plus/minus 30.00N throughout: confirmed at all 8 sampled frames, no drift.

## Rule 34c Unicode sweep - pixel check across all three text paths

- DOM/canvas formula overlays (5 states): F21 = -F12 (S1/S4/S5), |F21| = |F12| implies a proportional to
  1/m (S2), a = F/m, a_wall approx 0 (S3) - all render as correct math-serif Unicode glyphs (subscripts,
  the implies arrow, the proportional sign, the right-arrow). Zero ASCII transcription found (no "Phi",
  "omega", "->", "m2", "deg") in any captured frame.
- HUD/readout labels: m1/m2 section headers and all value rows render correctly, value-only per Rule 34b
  (no formula duplicated in the HUD).
- 3D sprite labels: cart labels m2/m1 above each cube, and the S3 "wall (Earth)" label, all render clean,
  no tofu/mojibake, no clipping.
- Slider labels (S5): m1 = 6.0 kg, m2 = 6.0 kg, F = 15.0 N - correct subscripts, legible.
- Small in-canvas arrow-tail labels (F21/F12/f_s/f_k, tiny by design): read correctly at 4x crop
  magnification in STATE_4's held phase - no missing glyphs, subscripts intact. The two friction
  arrowheads (one per cart, pointing toward each other) visually cross near track-center - this is the
  SAME crossing-arrow convention already used and passed in S1-S3's F21/F12 pairs (arrows drawn from each
  body toward the contact point), not a new collision defect.
- No overlay collision found: HUD (top-right), formula surface (mid-right, below HUD), top delta-cue
  caption (top-center), bottom-left caption strip, and (S5 only) bottom-right slider panel each occupy
  disjoint screen regions in every sampled frame.

## Founder criterion - do students SEE two bodies push each other?

YES, unambiguously, across every guided state:
- STATE_1__dense_t00000.png: both carts touching a visible compressed spring between them, in contact,
  before release.
- STATE_2__dense_t00000.png: same contact-spring pose at the instant of push-off, with both force arrows
  anchored at the actual touching bodies.
- STATE_3__dense_t00000.png: the cart visibly touching the green wall block, spring compressed at the
  real contact point, both arrows drawn from that literal touching surface.
- STATE_4__dense_t00000.png: two carts side-by-side with BOTH the applied-force pair AND the
  friction-reaction pair drawn from their real contact points, mid-track, before either moves.

This directly answers v1's rejection reason (two separate blocks, arrows from nowhere, nothing touching):
every state's t=0 frame shows actual contact between the interacting bodies with arrows rooted at that
contact, not floating in empty space.

## Known-carried informational note (not re-litigated, not a new finding)

- nlb_pushoff_true_t0_compressed_pose_unsampled - THE EYE cadence characteristic (dense sampling starts
  slightly after the true compressed-contact pose in S1/S2), carried forward as-is per instruction.

## Candidate engine_bug_queue rows

None. The prior MAJOR (nlb_bound_stop_sigma_f_zeroed_contradicts_shown_formula) is resolved by the JSON
change (SumF readout removed, formula changed to a non-numeric pair identity) - no replacement defect
found in its place.

## Frames for founder eyes (2)

1. C:\Tutor\physics-mind-lom-b\.visual_runs\newton_third_law\20260729-231113\STATE_4__dense_t01000.png
   - the held-by-grip tableau: both friction arrows pegged to 30N=30N next to the applied-force arrows,
   the same-body cancellation the state is now built to teach cleanly.
2. C:\Tutor\physics-mind-lom-b\.visual_runs\newton_third_law\20260729-231113\STATE_4__frozen.png
   - the bound-stop tail/FROZEN pin: confirms the former SumF-vs-formula contradiction is gone (no SumF
   row exists; the formula overlay carries no live number to contradict).

## Overall read

CLEAN - zero new findings. The prior MAJOR is resolved, the Rule 34c Unicode sweep is clean across all
three text paths, STATE_4 still teaches its payload and is not static, and the founder criterion (visible
contact + arrows rooted at real touching bodies) is met in all four guided states.
