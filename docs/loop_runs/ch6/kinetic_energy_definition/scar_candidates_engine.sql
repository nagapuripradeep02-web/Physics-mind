-- SEAM Q ink-regime defect found on ch6 concept #3 kinetic_energy_definition (2026-08-02)
-- Authored by peter_parker:field3d_surgeon, NOT applied. The apply step belongs in the
-- ship chain, beside visual:approve.
--
-- ROOT CAUSE AS MEASURED, which is NOT the root cause as routed. The dispatch described
-- an element that "spans both backdrops" while its regime is chosen from one anchor.
-- That is real and is fixed below, but it is the SECOND of two defects and the smaller
-- one. The dominant defect is a SIGN error in the backdrop test:
--
--   nlbInkOverSlab() asked "does the ray camera -> p hit the slab", with no far bound
--   and no comparison of the hit distance to |p - camera|. An unbounded ray answers YES
--   both when the slab is BEHIND p (p really is drawn on the slab) and when the slab is
--   IN FRONT of p (p is hidden behind the slab and is not drawn at all).
--
-- Measured with a Playwright probe against the live scene, kinetic_energy_definition
-- STATE_3, the mg weight arrow (it points DOWN from a cart standing ON the slab):
--   t=0     anchor L=10.25  slab hit at 9.72  -> slab 0.53 units IN FRONT -> "over slab"
--   t=1000  anchor L=10.28  slab hit at 9.46
--   t=2000  anchor L=10.34  slab hit at 9.51
--   t=3000  anchor L=10.41  slab hit NONE     -> "over page"
-- and the drawn shaft colour read back from material.color flipped #181407 -> #ffd54f at
-- exactly that boundary. Pixel-side, split by the backdrop each pixel is actually drawn
-- on (union-plate silhouette over all frames of the state):
--   BEFORE  t=0/1000/2000  page n=160/190/205  ink lum 0.0071 vs page 0.0036 -> 1.07:1
--           t>=3000        page n=280+         ink lum 0.6941               -> 13.89:1
--   slab n=0 AT EVERY INSTANT — the arrow never had ANY visible ink on the slab.
-- So the element did not straddle at all. Its anchor was merely OCCLUDED, and 100% of
-- its drawn ink was on the page while carrying the slab regime. Because the mass ramp
-- grows the arrow until its midpoint clears the silhouette, it self-corrected once per
-- loop_reset_ms=2400 cycle, i.e. it FLICKERED dark -> bright rather than being uniformly
-- dim, which is worse to watch.
--
-- THE S5 ADJUDICATION (two reviewers disagreed; both were partly right).
--   eye-walker said the friction arrow straddles the slab's left edge and the page-side
--   part is invisible. quality-auditor measured (34,14,21) against the slab, got 4.6-6.3:1,
--   and retracted its own earlier "invisible" read.
--   Measured here, per pixel, against a union-plate silhouette:
--     STATE_5 t=0      page n=110  1.07:1   |  slab n=1    7.02:1
--     STATE_5 t=17000  page n=87   1.07:1   |  slab n=1    7.02:1
--     STATE_5 t=3000..15000 (settled)       |  slab n=84-95 7.02:1, page n=0
--   VERDICT: eye-walker is right about the failure and right that it is not a first-frame
--   transient; quality-auditor is right about the frames it actually sampled. The two
--   readings are of DIFFERENT loop phases, not of the same frame. loop_reset_ms=2100, so
--   t=0 and t=17000 are the same phase (17000 mod 2100 = 200 ms): the cart is back at its
--   launch point and the arrow hangs off the slab's left edge over the page. eye-walker's
--   own split (105 page / 86 slab) over-counted the slab side because a plate taken from a
--   single frame is eroded wherever ink covers the slab's edge; a union plate over all
--   frames of the state repairs that and gives 110/1.
--   eye-walker is ALSO right that the existing row is too narrow: this fails at two loop
--   phases in S5 and for a full 2.4 s window in S3, so the existing OPEN row
--   nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix is widened below
--   rather than duplicated.
--
-- STRADDLE IS ALSO REAL, and is the second defect. Census with the fixed classifier, 9
-- samples per element, every 250 ms across all three newtons_laws_body concepts: 19 frames
-- carry an element with visible ink on BOTH backdrops at once — positive_negative_zero_work
-- S2 (1), S4 (9), S5 (3), S6 (2) and kinetic_energy_definition S5 (2+2). Always the
-- FRICTION arrow, which rides a lane 0.035 above the surface and hangs off the slab's edge
-- as its body reaches the end of the run. A majority vote over those frames is not a fix —
-- it only chooses which half of the arrow stays invisible — so they take the page ink plus
-- a dark casing, the construction the angle arc already uses for exactly this reason.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('seam_q_backdrop_raycast_ignores_hit_SIGN_so_an_occluded_anchor_reads_as_over_the_light_slab',
 'SEAM Q classified ink by an unbounded camera raycast, so an anchor HIDDEN BEHIND the slab was treated as DRAWN ON it and every visible pixel of that element got the inverted ink',
 'CRITICAL', 'peter_parker:field3d_surgeon',
 'nlbInkOverSlab(p) built a ray from the camera through the sample point and returned true if intersectObject(slab) returned any hit. It never bounded the ray to |p - camera| and never compared the hit distance to the sample distance, so it conflated two opposite geometries: the slab BEHIND p (p is drawn on the slab, deepen is correct) and the slab IN FRONT of p (p is hidden behind the slab, is not drawn, and has no backdrop at all). Because the two ink regimes are DISJOINT by construction — over the page the lens lifts to luminance 0.62, over the slab it deepens to 0.007 — a misclassification does not degrade contrast, it INVERTS it. Measured on kinetic_energy_definition STATE_3: the mg weight arrow points down from a cart standing on the slab, so its shaft midpoint (the anchor) sits behind the slab at distance 10.25 while the slab is hit at 9.72, and 100 percent of the arrow''s 160-205 drawn pixels lie on the page BELOW the slab''s front edge, rendered at luminance 0.0071 against a 0.0036 page = 1.07:1 against a 3:1 stroke floor. A second, independent defect rode on the same line: the regime was resolved from ONE anchor, so an element whose visible ink genuinely does lie on both backdrops received one regime and the losing side fell below the floor (19 such frames measured across the three newtons_laws_body concepts, always the friction arrow).',
 'A backdrop test must be a test of what is BEHIND the ink, and a raycast only answers that if the hit distance is compared to the sample distance — an unbounded ray answers "is the slab anywhere along this line", which is a different question and is true in the occluded case too. Three rules follow. (1) Classify each sample into three buckets, not two: occluded, over-slab, over-page, and DISCARD the occluded ones — a sample that is not drawn has no legibility to protect and must not vote. (2) Resolve the class over the element''s whole SPAN, never one anchor, and when visible samples disagree do not take a majority — a majority still leaves one side of a disjoint pair of regimes below the floor; give the element the page ink plus a dark casing, which is the one construction that reads over either backdrop. (3) An element''s own body is an occluder too: an arrow is drawn FROM its body centre outward, so its inner samples are always inside the body. Use only the element''s OWN body, never a passing one, so the occlusion is static by construction and cannot make the class flicker. Verification standard: read back material.color from the live scene AND measure the drawn pixels split by the backdrop each pixel actually sits on, using a slab silhouette built as the UNION over all frames of the state — a plate taken from one frame is eroded wherever ink covers the slab''s edge and will under-count the slab side.',
 'js_eval',
 'For every visible nlb ink stroke, sample 25 points along its own axis; for each, cast camera -> p and compare the nearest slab hit distance to |p - camera| (nearer = occluded, discard; farther or equal = slab; no hit = page), first discarding samples occluded by the stroke''s own body. FAIL if any element has visible page samples and visible slab samples while its casing is hidden, or if any element''s drawn material.color is the deepened lens output while its visible-sample set contains no slab sample (and vice versa). Pixel backstop: for each dense frame, split the stroke''s ink pixels by a union-plate slab silhouette and FAIL if the median contrast on either side is below 3:1.',
 'OPEN',
 ARRAY['kinetic_energy_definition','positive_negative_zero_work','work_done_by_constant_force']::text[],
 ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch6-kinetic_energy_definition-seamq-ink-regime', 'incident');

-- The existing OPEN row is too NARROW, not wrong. It files this family as a first-frame
-- reveal transient; measured, it fails at two full loop phases in kinetic_energy_definition
-- STATE_5 (t=0 and t=17000, the same 2100 ms loop phase) and for a continuous 2400 ms
-- window in STATE_3 — and its stated prevention rule ("enumerate every code path that
-- writes that element''s colour") was satisfied while the defect survived, because the
-- defect was never in WHICH path writes the colour but in WHAT the one path asks the
-- geometry. Widen, do not duplicate.
UPDATE engine_bug_queue SET
  title = 'friction/weight vector ink carries the wrong backdrop regime for whole loop phases, not just the first reveal frame',
  severity = 'MAJOR',
  root_cause = root_cause || E'\n\nWIDENED 2026-08-02 (ch6 concept #3). Measured across the full dense series, not the first frame: kinetic_energy_definition STATE_3 renders the mg arrow at 1.07:1 for a continuous 2400 ms window every loop, and STATE_5 renders the friction arrow at 1.07:1 at t=0 AND t=17000 — the same 2100 ms loop phase, not a reveal transient. The mechanism is the SEAM Q backdrop raycast ignoring the SIGN of its hit (see bug_class seam_q_backdrop_raycast_ignores_hit_SIGN_so_an_occluded_anchor_reads_as_over_the_light_slab), so this row''s scope is the recurring phase-locked case, not a one-frame tint.',
  prevention_rule = prevention_rule || E'\n\nWIDENED 2026-08-02: "enumerate every code path that writes the element''s colour" was SATISFIED here and the defect still shipped, because there was only ever one path and the fault was in the question that path asked the geometry. Add: when an element''s colour is chosen from a GEOMETRIC test, the test itself is the code path — probe it across the whole loop period at the state''s own loop_reset_ms, never only at the reveal frame, and never conclude "transient" from a single sampled instant.',
  concepts_affected = ARRAY['kinetic_energy_definition','positive_negative_zero_work']::text[]
WHERE bug_class = 'nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix';

-- Residual, filed honestly rather than left for the next reviewer to rediscover. After the
-- fix, kinetic_energy_definition STATE_5 at the loop-start phase (t=0 and t=17000) still
-- shows a band of arrow pixels abutting the slab's silhouette at 1.67:1 (t=17000: 54 page
-- pixels at 12.52:1 and 49 slab-abutting pixels at 1.67:1). The classifier is per-point
-- correct there — the arrow rides 0.035 above the surface, so within a few pixels of the
-- slab's silhouette edge the camera ray past the sample clears the slab entirely and the
-- point genuinely has the page behind it — but the projected backdrop transitions across
-- less than the stroke's own width, which is precisely what the casing exists for and the
-- casing does not fire because no visible sample is slab-backed. Offsetting each sample by
-- the stroke radius across the view was TESTED and refuted: it reclassifies the offset
-- points as occluded-inside-the-slab, and the census is byte-identical (0 changed frames).
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('seam_q_hovering_stroke_within_a_stroke_width_of_the_slab_silhouette_edge_gets_no_casing',
 'A stroke hovering just above the surface reads 1.67:1 in the few pixels where it abuts the slab silhouette, because every sample there is legitimately page-backed and the straddle casing never fires',
 'MODERATE', 'peter_parker:field3d_surgeon',
 'The span classifier asks, per point, what is behind that point. For a stroke riding NLB_ARROW_LANE 0.035 above the surface, points within a few pixels of the slab''s silhouette edge have their camera ray clear the slab entirely, so they are correctly PAGE — yet the drawn pixels there abut the slab''s projected top face, because the silhouette of a solid seen from above extends past the geometry the ray passes over. The stroke therefore takes the page ink (lifted, luminance 0.62) and the abutting band reads 1.67:1 against the 0.309 slab. Measured on kinetic_energy_definition STATE_5 at the loop-start phase: 54 page pixels at 12.52:1 and 49 slab-abutting pixels at 1.67:1. Before the fix that same band read 7.02:1 while the other 110 pixels read 1.07:1, so the fix is a large net gain and a small relocation, not a wash. Sampling the stroke as a TUBE (axis plus/minus the stroke radius across the view) was implemented and measured and does NOT resolve it: the offset points fall inside the slab and classify as occluded, and the straddle census is unchanged frame for frame.',
 'A per-point backdrop test is exact for the point and approximate for the STROKE whenever the stroke hovers within its own width of a silhouette edge. The cheap and safe remedy is to widen the casing trigger rather than to sharpen the classifier: fire the casing whenever a stroke has visible page samples AND any sample occluded by the slab in the same contiguous run, i.e. whenever the stroke crosses the slab''s silhouette at all. The casing only ever ADDS a dark outline, so a false positive costs pixels and never legibility — but it does move baselines, so it must be measured across the whole newtons_laws_body fleet before it lands, not bolted onto the fix that found it.',
 'js_eval',
 'For each visible ink stroke whose resolved class is PAGE, project its span to screen space and measure the minimum pixel distance from its drawn footprint to the slab silhouette; where that distance is under the stroke width, sample the drawn pixels on the slab side and FAIL if their median contrast against the local slab luminance is under 3:1 while the casing is hidden.',
 'OPEN',
 ARRAY['kinetic_energy_definition']::text[],
 ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch6-kinetic_energy_definition-seamq-ink-regime', 'incident');

-- ═══════════════════════════════════════════════════════════════════════════
-- SEAM R — the OCCLUDED ROOT defect, found on ch6 concept #3
-- kinetic_energy_definition STATE_3 (2026-08-02). Authored by
-- peter_parker:field3d_surgeon, NOT applied. A separate bug_class from the SEAM Q
-- rows above: those are about the COLOUR of the pixels an element draws, this one
-- is about HOW MANY pixels it draws at all.
--
-- MEASURED INDEPENDENTLY (Playwright, virtual clock, camera ease settled before
-- the state clock was advanced, 1280x720, 601 samples along the shaft, each
-- raycast camera -> sample against every other visible mesh). The routing
-- eye-walker fit was visible = 27.77m - 39.3; mine:
--     m        drawn tip-to-tail    ACTUALLY VISIBLE
--     2.004       56.2 px               17.5 px
--     2.480       69.1                  30.5
--     2.960       82.2                  43.6
--     3.440       95.1                  56.5
--     3.920      107.9                  69.3
--   visible = 27.06*m - 36.66, r^2 = 1.000.
-- eye-walker was RIGHT, to within its own pixel resolution. The buried depth is
-- CONSTANT at 0.645 world units (0.644-0.646 at every mass and at every point of
-- the run), so a 2x mass read as 4.08x on screen: at m=2 kg only 31 percent of the
-- arrow reached the eye, at m=4 kg 65 percent.
--
-- WHY 0.645 AND NOT 0.455, WHICH IS THE WHOLE REASON "MOVE THE ORIGIN" FAILS.
-- Solid on the ray is only the body's own half height (0.275) plus the slab
-- (0.18). The other 0.19 is the slab's SCREEN SILHOUETTE: an elevated camera hides
-- a band of empty space BELOW a solid as well as the space inside it. The buried
-- depth is therefore a function of the CAMERA, and this scenario ships
-- drag-to-rotate, so no static origin offset is zero-intercept. Starting at the
-- body's own surface removes 0.275 of the 0.645 and leaves an intercept — it
-- relocates the defect instead of removing it.
--
-- AFTER, same probe, pixel scan of the arrow's own hue in a column around its axis
-- (m driven to 2 / 3 / 4 exactly):
--   m=2.004  ink 54 px   ratio 1.000
--   m=2.987  ink 81 px   ratio 1.500
--   m=4.000  ink 108 px  ratio 2.000
--   fit ink = 27.06*m - 0.09      (intercept 0.09 px, i.e. sub-pixel)
--
-- H2 COST, MEASURED, NOT ESTIMATED (all three regressions PASS, tolerance 2.0%):
--   positive_negative_zero_work  38/38  H2 0.00-0.05%
--   work_done_by_constant_force  38/38  H2 0.02-0.05%
--   normal_force                 32/32  H2 0.28-0.85%  (largest: STATE_4, the
--                                       4 kg vs 8 kg mg contrast — the same
--                                       ratio-destroying case, corrected)
-- No baseline needs re-approval.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_force_arrow_anchored_at_body_centre_so_the_occluded_root_destroys_the_authored_length_ratio',
 'A force arrow drawn from the body centre loses a CONSTANT buried length to the body and to the surface silhouette, so its visible length carries an intercept and a 2x force reads as 4x',
 'CRITICAL', 'peter_parker:field3d_surgeon',
 'nlbUpdateArrow draws each arrow from nlbArrowOrigin (the body centre for weight and applied) with ordinary depth testing, so the apparatus eats the root of every arrow that points into it. Measured on kinetic_energy_definition STATE_3, the mg arrow of a cart standing on the slab, camera [0,2,10] at 1280x720: visible px = 27.06*m - 36.66 with r^2 = 1.000, i.e. a CONSTANT 0.645 world units (36.7 px) of every arrow is buried at every mass. The slope was always right; the INTERCEPT is the defect, and an intercept converts a ratio into a different ratio — 2.00x of physical mass rendered as 4.08x of drawn length. That state exists to contrast "mass doubles, K doubles" against the previous state''s "speed doubles, K quadruples", and the concept''s own assessment files the quadrupling as distractor C, so the sim was rendering its own distractor as the state''s evidence while the K bar beside it read the correct 1.97x. The buried depth is NOT the solid on the ray (0.275 body half height + 0.18 slab = 0.455): the remaining 0.19 is the slab SCREEN SILHOUETTE, because an elevated camera hides a band of empty space below a solid as well as the space inside it. That extra term is a function of the camera, which is why no static origin offset can be zero-intercept in a scenario that ships drag-to-rotate.',
 'An element whose LENGTH carries a magnitude must be drawn in full, or the claim it makes is false: visible length must be proportional to magnitude with ZERO intercept, so that seen(2F)/seen(F) equals 2. Three rules. (1) NEVER validate such an element by its computed length — validate the DRAWN length, in pixels, at three magnitudes, and fit a line: the slope proves the scale and only the INTERCEPT proves nothing is being eaten. A per-frame length that is correct in world units tells you nothing about what reaches the eye, and a clamp is not a substitute — a per-arrow clamp draws two different magnitudes at the same length, which destroys the only thing an arrow means. (2) Do not fix an occluded root by moving the origin. The occluder is the projected silhouette, not the solid, so the required offset is camera dependent; a constant offset is wrong for every other camera, a per-frame raycast offset JUMPS the origin the instant the body clears the silhouette, and starting at the body surface only removes the part of the intercept that lies inside the body. Instead stop pretending the ink is IN the scene: force ink is a diagram drawn ON the picture (which the ink pass already asserts in prose), so give it depthTest false and a renderOrder above the apparatus and visible length equals drawn length by construction, for every camera, with the origin still at the centre of mass where weight actually acts. (3) Once depthTest is off, DRAW ORDER alone decides who wins a pixel, and renderOrder sorts only WITHIN the opaque and the transparent list while three.js draws the whole opaque list first. Any casing or outline construction that relies on depth to stay an outline must have its core and its casing in the SAME list — force transparent on the whole family. The first build of this fix missed that and the transparent casing painted out the opaque arrowhead: measured ink extent 38 px against a 56 px arrow, exactly the shaft span len - headLen.',
 'js_eval',
 'For every visible ink element whose length encodes a magnitude, sample 601 points along its own axis, raycast camera -> sample against every other visible mesh, and take the first and last unoccluded samples; project both and record the pixel span. Drive the state to three magnitudes and least-squares fit span = a*mag + b. FAIL if |b| exceeds 2 percent of the span at the smallest magnitude, or if any pairwise ratio of drawn spans differs from the ratio of magnitudes by more than 5 percent. Pixel backstop, which is the one that catches a lost arrowhead: scan a column of the frame around the element axis for the element''s own hue and compare the ink extent to the projected tip-to-tail distance — FAIL if the ink is shorter by more than the head length.',
 'OPEN',
 ARRAY['kinetic_energy_definition','normal_force','positive_negative_zero_work','work_done_by_constant_force']::text[],
 ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch6-kinetic_energy_definition-seam-r-occluded-root', 'incident');

-- A DIRECTIVE, not an incident. The remedy trades depth ordering for length
-- honesty, and that trade is only safe while it stays bounded. Filed so the next
-- surgeon does not widen it by reflex.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_overlay_ink_lift_is_bounded_to_the_families_whose_length_is_a_magnitude',
 'Only nlb_arrow and nlb_comp are lifted in front of the apparatus; every other ink family stays depth-tested, and the ink classifier must follow the same boundary',
 'MODERATE', 'peter_parker:field3d_surgeon',
 'SEAM R turns depthTest off for the two ink families whose LENGTH carries a magnitude (nlb_arrow and its mg component pair). What is given up is depth ordering between that ink and the apparatus, and between that ink and OTHER bodies: an arrow belonging to a body in a far lane will be drawn over a body in a nearer lane if their screen footprints overlap. That is the free-body-diagram convention and is acceptable for ink; it is not acceptable for apparatus, so the lift is bounded on purpose. The displacement vector, the two angle arcs and the right-angle marker are NOT lifted — they are drawn along the surface, are not anchored inside a body, and an angle is not a length. Label sprites are not lifted — a label sits past the tip, in free space. The SEAM Q backdrop classifier carries the SAME boundary: nlbInkSampleClass takes an overlay flag, and only for the lifted families does an occluder count as a light BACKDROP instead of a discard. Every other family keeps the discard semantics byte for byte, which is what kept the displacement vector and the arcs off the H2 baselines (positive_negative_zero_work and work_done_by_constant_force both moved by 0.05 percent or less).',
 'Do not widen the overlay lift without measuring it. Two specific traps. (1) Lifting a family whose members can overlap each other in screen space removes the only cue saying which one is in front; arrows survive this because they sit on per-body perpendicular lanes, apparatus does not. (2) The lift and the backdrop classifier are ONE decision, not two: an element drawn in front of a solid is BACKED by that solid, so lifting a family without flipping its occluded samples from discard to light leaves its newly revealed pixels carrying the page ink over a lit surface — measured 1.87:1 for a lifted yellow core over the slab and over a cart body, under the 3:1 stroke floor. The casing is what carries it: over the block and the plank the dark outline measures 7.2:1 while the core alone measures 1.87:1. Note the joke this settles — for lifted ink the backdrop test degenerates to "is the slab anywhere along this ray", i.e. exactly the unbounded raycast whose missing SIGN was the SEAM Q bug. It was never the wrong question; it was the right question asked of the wrong geometry.',
 'js_eval',
 'Assert that the set of nlb elementTypes with material.depthTest === false is exactly {nlb_arrow, nlb_comp} plus their casings, and that nlbInkSpanClass passes overlay = true for exactly that set. FAIL on any other nlb ink type having depthTest false, and FAIL if any lifted element resolves to a single backdrop class while its span contains both an occluded sample and an unoccluded one.',
 'OPEN',
 ARRAY['kinetic_energy_definition','normal_force','positive_negative_zero_work','work_done_by_constant_force']::text[],
 ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch6-kinetic_energy_definition-seam-r-occluded-root', 'directive');
