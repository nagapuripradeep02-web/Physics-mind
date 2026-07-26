# eye_walker re-verify -- newton_third_law (post camera-axis fix)

Run dir: .visual_runs/newton_third_law/20260725-223325/
Prior dump 20260725-221918 ignored as stale (pre-fix).

Deterministic gate summary (verbatim): 19 deterministic checks . 19 passed . 0 failed . $0.00

## Engine bug queue consultation
query_engine_bug_queue.ts newton_third_law --field3d --open -> No matching engine_bug_queue rows.

## Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| STATE_1 One push two forces | ok | ok | ok | ok | see finding 1 |
| STATE_2 Unequal masses equal forces | ok | ok | ok | ok | none |
| STATE_3 Cancel needs one body | ok | ok | ok | ok | camera discontinuity see finding 2 |
| STATE_4 All yours explore | ok | ok | ok | ok | inherits finding 1 |

## Q1 resolved

RESOLVED. Two clearly separated distinctly colored blocks with two independently legible labels.

## Q2 new risk

Finding 1 MODERATE. Screen space recoil asymmetry over time.

## Q3 framing

No clipping observed.

## Q4 continuity

Finding 2 MODERATE pre-existing.

## Q5 checklist

No contradictions found.

## Frames for founder eyes

1. C:/Tutor/physics-mind-lom-b/.visual_runs/newton_third_law/20260725-223325/STATE_1__dense_t12000.png
2. C:/Tutor/physics-mind-lom-b/.visual_runs/newton_third_law/20260725-223325/STATE_1__frozen.png
3. C:/Tutor/physics-mind-lom-b/.visual_runs/newton_third_law/20260725-223325/STATE_3__frozen.png
4. C:/Tutor/physics-mind-lom-b/.visual_runs/newton_third_law/20260725-223325/STATE_2__frozen.png

## Candidate rows

1. bug_class: field3d_nlb_oblique_camera_recoil_screen_asymmetry severity MODERATE owner peter_parker:renderer_primitives
2. bug_class: field3d_two_body_camera_discontinuity_S3_isolation_shot severity MODERATE owner ambiguous

## Overall read

FINDINGS (2)

## Detail -- Q1 (CRITICAL resolution)

Contact sheets and frozen frames for STATE_1, STATE_2, and STATE_4 (the three states that previously
showed the overlap defect) all now show two clearly separated, distinctly colored blocks with two
independently legible labels (m1 in blue/cyan/pink depending on state, m2 in red/crimson) at t=0 and at
the SET_TIME_FREEZE reveal-complete pin. No stacking, no label overlap. Confirmed via pixel-level crops
of STATE_1__frozen.png, STATE_2__frozen.png, and STATE_4__frozen.png (region roughly x 550-780, y 300-380,
upscaled 4x) -- the two bodies sit close together (touching/near-touching) but are visually and
geometrically distinct cubes, and both labels are individually readable, not stacked.

## Detail -- Q2 (arrow-length equality and the new recoil-asymmetry finding)

The F12/F21 arrows themselves are too small at this render scale to forensically confirm identical length
(the rendered arrow-plus-label pixel cluster is only about 6px tall and the two blend together at this
resolution) -- visually they read as comparable stub arrows with no gross asymmetry, but this is a
founder-eyes call rather than a settled one; see the frame list for STATE_2__frozen.png where the arrows
are largest relative to the blocks.

More consequential is a new effect: the bodies own screen-space recoil visibly desyncs over time in
STATE_1 and STATE_4, even though the underlying physics is perfectly symmetric (equal 300 kg masses,
equal-and-opposite 30 N forces). Measured from the STATE_1 dense-frame series, block-center x-pixel
position relative to the t=0 midpoint (about x=640):
  t=6000ms:  m2 at -43px, m1 at +43px  (symmetric)
  t=9000ms:  m2 at -78px, m1 at +88px  (starting to drift)
  t=12000ms: m2 at -125px, m1 at +160px (m1 about 28 percent farther on screen than m2)

This is a perspective artifact of the new oblique camera positions (the [8, 3.0, 13]-class of positions
used for the fix): the lane-offset separation axis (world z) combined with along-rail motion (world x)
means m1 and m2 traverse screen space at different apparent rates as they separate further from the
shared start point, even though their world-space displacement is exactly mirror-symmetric. STATE_1's own
caption and pedagogy explicitly claim "both bodies recoil symmetrically" -- by about t=12s (the state's
own reveal-complete pin) the screen picture no longer looks symmetric, which undercuts the state's core
visual claim. STATE_4 (the explore state, same default 300/300 masses) inherits the identical effect.

This is NOT a re-introduction of the old overlap bug -- it is a new, smaller side effect of the camera fix,
and is worth a prevention_rule entry so it is not silently reintroduced on other two-body concepts that
adopt the same oblique-camera pattern to fix lane-offset legibility.

## Detail -- Q3 (framing / clipping)

No clipping observed at any sampled dense frame. At STATE_1/STATE_2 t=12000ms, when the bodies are at
their farthest recorded travel, both blocks remain inboard of the rail's rendered ends with visible
margin; the full rail surface stays in frame across all four states, including STATE_3's front-on shot
and STATE_4's continuous loop. No label, arrow, or block touches or crosses the canvas edge in any of the
frames reviewed (contact sheets, t=0/6000/9000/12000 dense frames, both frozen pins).

## Detail -- Q4 (Rule 32d home-pose continuity across S1 -> S2 -> S3 -> S4)

This is a pre-existing condition, not introduced by this session's patch -- calling it honestly rather
than soft-pedaling it. S1, S2, and S4 now share a consistent ~35-degree oblique framing (by design, the
fix), which makes S3's front-on camera read as a much more noticeable cut than it did before: previously
all four states were mutually inconsistent with each other (S1/S2/S4 were axis-on, S3 was also axis-on,
just a different axis), so the discontinuity was less salient. Now that three of the four states visually
match each other, S3 stands out clearly as the odd one.

Walking the sequence in authored order: S1 -> S2 is a smooth continuation (same oblique camera family,
same two-body composition). S2 -> S3 is a hard cut: oblique two-body-with-forces view switches to a
front-on single-body free-body-diagram isolation view, with vertical N and mg vectors newly added and a
dimmed, static ghost m2. S3 -> S4 is a hard cut back: front-on FBD returns to the oblique two-body explore
view. This is arguably defensible pedagogically -- S3 is a genuinely different diagram type (an isolated
free-body diagram, not a two-body recoil shot) -- but it is a literal violation of Rule 32d's "same
apparatus, recognizable home pose, only the new thing changes" if judged strictly across the whole state
sequence rather than within each state individually. This question was already open before this session's
fix; the fix did not touch STATE_3's camera and did not create the discontinuity -- it simply made the
discontinuity more visually apparent by resolving the inconsistency in the other three states.

## Detail -- Q5 (standing checklist)

Slider thumb vs printed value: STATE_2's m2 = 900.0 kg slider thumb sits near the right end of its track,
consistent with a range topping out well above 300 kg -- no rail-pin contradiction found. STATE_4's three
sliders (m1=300, m2=300, F=37.3 N) all show thumb positions consistent with their printed values.

HUD / caption / position: no contradictions found -- HUD numbers (F, a, v) match caption claims in every
state, e.g. STATE_2's HUD shows a1 = 0.10 and a2 = -0.03, roughly a 3:1 ratio matching the "3:1
accelerations" caption text.

STATE_2 contrast delta: confirmed -- the mass slider changes m2 from 300 to 900 kg, F stays fixed at
30.00 N / -30.00 N unchanged in the HUD across the whole state, and the arrows stay visually static in
size while only the acceleration readout changes to tell the "unequal masses, equal forces" story --
correct per Rule 32b (only the taught variable's motion changes within a guided state).

STATE_3 ghost pose: confirmed -- m2 (the dimmed red ghost block) stays pixel-static across every
STATE_3 dense frame while m1 (teal) visibly translates to the right; the N and mg vectors render as
equal-length, opposite-direction, vertical arrows; the sum-of-forces readout holds steady at 30.00 N
throughout, matching F12 = 30.00 N.

Rule 34: every caption uses real Unicode subscripts and operators (F12 = -F21, the equal-magnitude-implies-
inverse-mass-ratio relation, and the sum-of-forces-on-m1-not-equal-to-zero relation) -- no ASCII math
transcription was found anywhere on canvas (no literal spelled-out arrows or proportional-sign
substitutions); rendered glyphs are proper Unicode subscripts and operators throughout. Exactly one
formula surface appears per state, the HUD stays value-only, and no overlay collides with a screen corner
or the review-chrome zone in any frame sampled.
