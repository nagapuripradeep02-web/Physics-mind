-- =====================================================================
-- Ch.7 engine-loop scar CANDIDATES  (trial branch feat/ch7-alternating-current)
--
-- NOT APPLIED. The chapter-loop trial forbids DB writes (docs/CHAPTER_LOOP.md
-- §3 "Never, under any verdict ... DB writes to engine_bug_queue (candidates
-- stay files)"). The founder rules on each row at chapter end (apply / edit /
-- discard). Append-only; newest block at the bottom.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Stage 1a · 2026-07-22 · [owner: peter_parker:renderer_primitives]
-- Finding source: docs/loop_runs/stage0_calibration/CALIBRATION_REPORT.md §4
-- Fix landed in: src/lib/renderers/particle_field_renderer.ts (pm-sliders top:10px -> top:52px)
-- After-proof:   npm run founder:drive -- --id wheatstone_bridge  =>  collisions 8 -> 0
-- ---------------------------------------------------------------------

-- (1) UPDATE the existing fleet-wide row: particle_field is now migrated too.
--     Row STAYS OPEN — helical_motion_charge_in_uniform_B and
--     cyclotron_period_independent_of_speed still carry the unfixed field_3d pattern.
UPDATE engine_bug_queue
SET
  title = 'Every renderer DOM panel anchored top:10/12px in a top corner collides with build_review_site.ts review-chrome — #fsTopControls (Widgets + Clean + Full screen, top:10/right:10, ~30px tall) on the right, #simPenBar (Move/Draw/Clear, top:10/left:10) on the left. Affects BOTH live renderers: field_3d (partially migrated) and particle_field (migrated 2026-07-22).',
  prevention_rule = 'Any DOM overlay in EITHER live renderer anchored to a TOP corner must use top:52px+ on both the right and the left edge (Rule 34d). top:10px/top:12px is unsafe on both edges. THE EYE cannot catch this (it screenshots the raw sim page with no chrome) — the only gate that sees it is founder_drive''s overlay-vs-chrome collision probe, so run `npm run founder:drive -- --id <id>` on any concept whose renderer gains a new top-anchored panel.',
  probe_logic = 'AUTOMATED: `npm run founder:drive -- --id <id> --url <review-server>` must report collisions=0. The probe measures every position:fixed div/canvas + .pm_hud static inside the sim iframe against #fsBtn / #wgBtn / #fsCleanBtn / #simPenBar in page coordinates. particle_field verified 2026-07-22: wheatstone_bridge 8 -> 0 collisions. field_3d capacitance verified 2026-07-21 (#cap_readout top:52px;right:12px, #cap_ratio_readout top:52px;left:12px). helical_motion_charge_in_uniform_B and cyclotron_period_independent_of_speed remain UNFIXED -> row stays OPEN.',
  concepts_affected = ARRAY[
    'helical_motion_charge_in_uniform_B','cyclotron_period_independent_of_speed','capacitance',
    'wheatstone_bridge','ohms_law','drift_velocity','resistivity','combination_of_resistors',
    'combination_of_cells','electrical_power_in_resistor','emf_definition','internal_resistance',
    'kirchhoff_junction_rule_KCL','kirchhoff_loop_rule_KVL','meter_bridge','potentiometer'
  ],
  fixed_in_files = ARRAY[
    'src/lib/renderers/field_3d_renderer.ts','src/lib/renderers/particle_field_renderer.ts'
  ],
  status = 'OPEN'
WHERE bug_class = 'field3d_sliders_panel_top12_vs_fsbtn_top10';


-- (2) NEW — the audit finding this dispatch surfaced but deliberately did NOT fix.
--     Canvas-drawn HUDs are invisible to founder_drive's probe (it walks the DOM;
--     a p5 canvas HUD has no element), so this collision class has NO after-proof
--     available today. Fixing it blind would also perturb ohms_law, which the §3b
--     verify chain uses as the particle_field regression sample. Needs its own
--     routed finding AFTER the driver probe learns to read canvas HUD rects.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, concepts_affected, fixed_in_files,
  discovered_in_session, status
) VALUES (
  'pf_canvas_hud_top_corner_vs_review_chrome',
  'particle_field CANVAS-drawn HUDs anchored to a top canvas corner sit under the review chrome: drawCurrentMeter draws at (10,10,158x52) directly beneath #simPenBar (Move/Draw/Clear, top:10/left:10, ~200x30), and the legacy drawPowerMeter (width-160,10,150x50) / drawHeatCounter (width-160,66,150x34) sit beneath #fsTopControls',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'Same Rule-34d class as field3d_sliders_panel_top12_vs_fsbtn_top10, but in CANVAS space instead of DOM space. assembleParticleFieldHtml defaults design.fill_viewport=true, so the p5 canvas is windowWidth x windowHeight and canvas coordinates are viewport coordinates — a HUD drawn at y=10 lands in exactly the band the review chrome occupies (y 10..40). The DOM overlays were migrated to top:52px on 2026-07-22; the canvas HUDs were not.',
  'Any particle_field canvas HUD drawn near a top corner uses y >= 52 (the same clearance the DOM overlays use), on both the left and the right edge. New canvas HUDs are checked against build_review_site.ts chrome geometry at author time, since no automated gate can see them yet.',
  'manual',
  'MANUAL until founder_drive''s probe is extended: open the built review site for drift_velocity STATE_6/STATE_7 and ohms_law STATE_6 and confirm the "i = V/R" ammeter box at canvas (10,10) is not overlapped by the Move/Draw/Clear pen bar. Automation ask: extend founder_drive''s probeChromeCollisions to accept renderer-reported canvas HUD rects (e.g. a PM_HUD_RECTS postMessage) so the probe stops being DOM-only. show_power_meter / show_heat_counter are set by ZERO shipped concepts today, so only drawCurrentMeter is live; resistivity is exempt (macro_view suppresses the meter via !mvOn()).',
  ARRAY['drift_velocity','ohms_law'],
  ARRAY['src/lib/renderers/particle_field_renderer.ts'],
  'ch7-stage1a-engine-loop-shakedown',
  'OPEN'
);


-- (3) NEW — latent, reported not fixed: the caption's max-width is the only thing
--     standing between a long caption and a two-sided chrome collision.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, concepts_affected, fixed_in_files,
  discovered_in_session, status
) VALUES (
  'pf_caption_maxwidth_68pct_can_reach_review_chrome',
  'particle_field #pm-caption (top:10px, centred, max-width:68%) shares the review chrome''s vertical band (y 10..40); it clears today only because Rule 34a keeps the caption to a <=5-word delta cue — a caption allowed to grow toward its 68% max-width WOULD collide with #simPenBar on the left and #fsTopControls on the right simultaneously',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'The caption is centred with max-width:68%, so its half-width can reach 34% of the stage width. The left chrome (#simPenBar) ends near x=210 and the right chrome (#fsTopControls) begins near x=W-206, leaving a safe centred budget of roughly (W-420)px. At W=800 a caption wider than ~390px collides on both sides. Measured captions are ~150-280px (Rule 34a), so there is real but unenforced headroom.',
  'On-canvas top captions stay a <=5-word delta cue (Rule 34a/32c). This is an AUTHORING invariant, not a renderer clamp — clamping max-width in the renderer would silently re-wrap or truncate authored text on every concept for zero measured benefit. Enforce via the word/character budget at author time; the driver''s collision probe catches any regression.',
  'manual',
  'AUTOMATED (already covered): `npm run founder:drive -- --id <id>` reports a pm-caption x chrome collision if a caption ever grows past the safe budget. wheatstone_bridge 2026-07-22: zero pm-caption collisions across all 5 states.',
  ARRAY['wheatstone_bridge','ohms_law','drift_velocity','resistivity','combination_of_resistors','combination_of_cells','electrical_power_in_resistor','emf_definition','internal_resistance','kirchhoff_junction_rule_KCL','kirchhoff_loop_rule_KVL','meter_bridge','potentiometer'],
  ARRAY['src/lib/renderers/particle_field_renderer.ts'],
  'ch7-stage1a-engine-loop-shakedown',
  'OPEN'
);


-- (4) NEW — latent, reported not fixed: the tallest slider panel gained 42px of
--     downward reach from fix (1) and can meet the bottom-right formula overlay
--     on a short stage.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, concepts_affected, fixed_in_files,
  discovered_in_session, status
) VALUES (
  'pf_tall_slider_panel_can_reach_formula_overlay_on_short_stage',
  'particle_field #pm-sliders has no max-height: the 7-row explore panel (combination_of_cells) is ~400px tall, so from top:52px it reaches y~452 and can meet #pm-formula (right:12px;bottom:12px) once the sim iframe is shorter than ~520px',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'The panel grows unbounded with slider_controls count (2 rows for ohms_law, 7 for combination_of_cells) while #pm-formula is pinned to the bottom-right. The Rule-34d chrome fix moved the panel down 42px, reducing the clearance by that much. Pre-existing on short viewports (the panel already overflowed the stage below ~460px); the fix narrows the margin, it does not create the class.',
  'A right-edge stacked panel that grows with content declares a max-height (e.g. calc(100vh - 120px)) with overflow-y:auto, or the bottom-right formula overlay moves out of its growth path. Any particle_field concept with >5 slider_controls is driven at a short viewport before ship.',
  'manual',
  'MANUAL: `npm run founder:drive -- --id combination_of_cells` with the browser window sized so the sim iframe is <520px tall; the explore state''s panel must not overlap the bottom-right formula overlay. Measured 2026-07-22 at the default driver viewport (stage ~660px): wheatstone_bridge panel spans y 88..390 vs formula overlay at y~628 — clear by ~240px.',
  ARRAY['combination_of_cells','combination_of_resistors','electrical_power_in_resistor','wheatstone_bridge','meter_bridge'],
  ARRAY['src/lib/renderers/particle_field_renderer.ts'],
  'ch7-stage1a-engine-loop-shakedown',
  'OPEN'
);


-- =====================================================================
-- Stage 1a · 2026-07-22 (re-dispatch) · [owner: peter_parker:renderer_primitives]
-- CORRECTION + authoritative record for the pm-sliders chrome-collision fix.
--
-- Blocks (1)-(4) above were written by an EARLIER stab that HARD-CODED
-- pm-sliders to top:52px (that stab's uncommitted top:52px edit was still in
-- the working tree when this re-dispatch opened). The founder decision for this
-- re-dispatch REJECTS the hardcode: THE EYE screenshots the RAW sim page (no
-- review chrome), so pm-sliders sits inside the LOCKED visual baselines of all
-- 13 particle_field concepts, and this trial forbids visual:approve — a literal
-- top:10px->top:52px would move every raw baseline and trip the regression gate
-- with no way to re-lock. The landed fix is therefore CHROME-AWARE CONDITIONAL:
-- pfInReviewChrome() shifts the panel to top:52px ONLY when the review chrome is
-- actually present, and leaves it at top:10px otherwise.
--
-- => Founder action on block (1): its prevention_rule / title / after-proof
--    ("top:10px is unsafe", "pm-sliders top:10px -> top:52px", "must use
--    top:52px+") is TRUE for field_3d (which hardcodes, baselines already
--    re-locked at authoring time) but MUST be edited for particle_field to read
--    "CONDITIONAL on review-chrome presence" before that row is applied. This
--    block (5) is the authoritative particle_field record; prefer it.
--
-- Both proofs captured this re-dispatch:
--   chrome branch  : npm run founder:drive -- --id wheatstone_bridge --url http://localhost:8087
--                    => states=5 collisions=8 -> 0, flags=0, consoleErrors=0
--   raw-EYE branch : npm run visual:eyes -- wheatstone_bridge => 32/32 checks, 0 diffs vs locked baseline
--                    regression sample: npm run visual:eyes -- ohms_law => 38/38 checks, 0 diffs
-- Fix landed in: src/lib/renderers/particle_field_renderer.ts
--   - new pfInReviewChrome() helper (before buildOverlayUI)
--   - pm-sliders cssText: top:52px  ->  top:(pfInReviewChrome() ? '52px' : '10px')
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, concepts_affected, fixed_in_files,
  discovered_in_session, status
) VALUES (
  'particle_field_sliders_panel_top10_vs_reviewchrome',
  'particle_field #pm-sliders panel was pinned at top:10px;right:10px and rendered its first slider row under the review chrome''s top-right glass cluster (#fsTopControls -> #fsBtn Full screen + #wgBtn Widgets, top:10/right:10, ~30px tall). Same Rule-34d class as the field_3d scar field3d_sliders_panel_top12_vs_fsbtn_top10, but particle_field was never migrated. Fleet-wide across all 13 shipped Ch.3 particle_field concepts.',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'buildOverlayUI() created #pm-sliders with a literal top:10px. The sim always runs inside an iframe; in the review tool the PARENT document carries the top-anchored chrome, so a right-edge overlay at top:10px collides with #fsBtn/#wgBtn (y 10..40). Not caught before ship because THE EYE screenshots the raw sim page (no chrome) and every other gate reads that raw capture.',
  'A top-anchored DOM overlay in particle_field must NOT be hard-coded to top:52px the way field_3d does — under the trial that would move the LOCKED raw-capture baselines of all 13 particle_field concepts (THE EYE shoots the raw page) and there is no visual:approve to re-lock them. Instead it must be CONDITIONAL on review-chrome presence via pfInReviewChrome() (window.parent !== window AND window.parent.document has #fsTopControls/#fsBtn): top:52px only under the chrome, top:10px in the raw capture so baselines stay byte-identical. Verify with `npm run founder:drive` (chrome branch => collisions 0) AND `npm run visual:eyes` (raw branch => 0 baseline diffs).',
  'js_eval',
  'DUAL-BRANCH. Chrome branch: `npm run founder:drive -- --id <id> --url <review-server>` must report collisions=0 (probe measures every position:fixed div/canvas + .pm_hud static in the sim iframe against #fsBtn/#wgBtn/#fsCleanBtn/#simPenBar in page coords). Raw branch: `npm run visual:eyes -- <id>` must report 0 diffs vs locked baseline (proves the panel stays at top:10px when no chrome is present). Verified 2026-07-22: wheatstone_bridge drive 8->0 collisions + EYE 32/32 0-diff; ohms_law EYE 38/38 0-diff (regression sample). Detection helper, in js: function pfInReviewChrome(){ try { if (window.parent === window) return false; var d = window.parent.document; return !!(d && (d.getElementById(''fsTopControls'') || d.getElementById(''fsBtn''))); } catch(e){ return false; } }',
  ARRAY[
    'wheatstone_bridge','ohms_law','drift_velocity','resistivity','combination_of_resistors',
    'combination_of_cells','electrical_power_in_resistor','emf_definition','internal_resistance',
    'kirchhoff_junction_rule_KCL','kirchhoff_loop_rule_KVL','meter_bridge','potentiometer'
  ],
  ARRAY['src/lib/renderers/particle_field_renderer.ts'],
  'ch7-stage1a-engine-loop-shakedown',
  'FIXED'
);
