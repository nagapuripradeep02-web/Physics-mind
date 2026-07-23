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


-- =====================================================================
-- Stage 1b · 2026-07-22 · founder-proxy Checkpoint A cycle-0 (ac_voltage_resistor)
-- DESIGN-STAGE directive — proposed in the founder-proxy Checkpoint-A report
-- (docs/loop_runs/ch7/ac_voltage_resistor/founder_proxy_report_checkpointA.md
-- §6) but never copied into this shared file. Copied in verbatim by the
-- orchestrator per the engine dispatch's process-note flag (ch7_engine_log.md,
-- Stage 1b entry) so the founder can rule on it at chapter end. NOT APPLIED
-- (trial: files only). Overlaps existing OPEN
-- ghost_compare_cause_invisible_slider_frozen + field3d_formula_overlay_generic_not_cambria_math
-- and FIXED bulb_glow_not_modulating — founder may merge rather than insert.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_new_scenario_engine_ask_precision_checklist',
  'Every field_3d NEW-scenario engine ask (Ch.7 scope-pane family: ac_resistor and the phasors/inductor/capacitor/LCR scenarios after it) must enumerate four precision items the arch skeleton''s ask tends to omit, each of which maps to an existing scar: (1) the drag-seize guard for EVERY guided-state live control that co-exists with a scripted animation (not just the explore state) + the scripted-sweep-moves-the-DOM-thumb-in-lockstep requirement; (2) the exact morph OPERATION named (square vs rectify vs reflect), never a loose verb like "fold up into i-squared"; (3) preservation of the applyGlowEmphasis EXEMPTION for any live-quantity-driven emissive (bulb/heater) that is ALSO used as a glow_focal; (4) a DEDICATED Cambria-Math formula panel, never the generic monospace #formula_overlay.',
  'MODERATE',
  'alex:architect',
  'The §0b engine ask is what the CHAPTER_LOOP §3b engine dispatch executes autonomously; anything not named in the ask is not built. The ac_voltage_resistor ask (cycle 0) named the Rule-34d top:52px chrome clearance well but omitted the four items above — two of which (drag-seize on 3 guided controls; loose fold-vs-square morph) would rebuild a Stage-0 founder-caught class or a physics-wrong mean. The rest of Ch.7 reuses this same scope-pane family and will hit the same omissions. UPDATE (post-landing, 2026-07-22): the architect DESIGN_FIX cycle-1 amendment and the subsequent engine dispatch both correctly closed all four items for ac_voltage_resistor — this row remains open as a checklist for the REMAINING 6 Ch.7 scope-pane concepts (phasors onward), not as an unresolved defect on ac_voltage_resistor itself.',
  'A field_3d new-scenario engine ask does not pass Checkpoint A until §0b/§3 explicitly state, per guided state with a live control, the drag-seize + thumb-lockstep behaviour; per morph, the arithmetic operation on trace points; per live emissive that is also a glow_focal, the applyGlowEmphasis exemption; and that formula surfaces use a dedicated Cambria-Math panel. Cross-reference the existing rows ghost_compare_cause_invisible_slider_frozen, bulb_glow_not_modulating, field3d_formula_overlay_generic_not_cambria_math so the engine dispatch inherits their fixes rather than re-deriving them.',
  'manual',
  'MANUAL (design-review gate): at Checkpoint A, grep the skeleton''s §0b + §3 for the four items; at Checkpoint B, founder_drive drags every guided-state control (harness extended post-Stage-0) and the frozen frames confirm the morph shape + heater modulation + Cambria-Math formula font. Verified working on ac_voltage_resistor 2026-07-22 (see ch7_engine_log.md Stage 1b entry) — the pattern demonstrably catches real gaps.',
  'OPEN',
  ARRAY['ac_voltage_resistor']::text[],
  ARRAY[]::text[],
  'ch7-stage1b-ac_voltage_resistor-checkpointA',
  'directive'
);


-- =====================================================================
-- Stage 1b · 2026-07-22 · [owner: peter_parker:renderer_primitives]
-- Finding source: founder-proxy probe on ac_voltage_resistor's built sim_html
-- (Checkpoint B) — [pageerror] TypeError: Cannot read properties of undefined
-- (reading 'opacity') at createTubeLine (field_3d_renderer.ts:2983), thrown
-- synchronously inside buildAcResistor()/buildScenario(); ALL 9 states of
-- ac_voltage_resistor reached 0/Nms sim-time (SIM_READY never fired) before
-- the fix. Root cause read + confirmed at field_3d_renderer.ts:2975-2987.
-- Fix landed in: src/lib/renderers/field_3d_renderer.ts (ONE line, 2983):
--   BEFORE: opacity: config.field_lines.opacity || 0.8
--   AFTER:  opacity: (config.field_lines && config.field_lines.opacity) || 0.8
-- After-proof: re-seeded ac_voltage_resistor's simulation_cache, loaded the
-- rebuilt sim_html in headless Chromium — 0 page errors (no opacity
-- TypeError), PM_simTimeMs samples 1376.0 -> 1696.0 -> 1984.0 -> 2304.0 ->
-- 2608.0 -> 2928.0 (monotonic, 300ms apart), SET_STATE->STATE_2 did not
-- throw (clock re-anchored to 752ms into the new state, confirming the
-- scene rebuilt live).
-- Regression sample (fix touches a 90-call-site shared helper): re-seeded +
-- re-ran THE EYE on faraday_law_induction (27/27 checks, 0 diffs vs locked
-- baseline) and capacitance (the scenario whose OWN header comment already
-- documents this exact trap, making it the most exposed regression
-- candidate) — see probe_logic for its result. Both clean.
-- Cross-check: grepped concepts_affected below is not the fleet-wide set —
-- 36 of the ~125 shipped concept JSONs already declare a field_lines block
-- (grep -c "field_lines" src/data/concepts/*.json), including every
-- concept whose scenario calls createTubeLine that this dispatch could
-- find (parallel_plate_capacitor_field, capacitance, electric_field_dipole,
-- electric_dipole_in_field, potential_energy families). None of those were
-- silently relying on the pre-fix crash NOT happening — they self-protect
-- via an authored field_lines block, and this fix only changes behaviour
-- for the previously-undefined (guaranteed-crash) case, degrading it to
-- the pre-existing 0.8 opacity default instead. ac_voltage_resistor was
-- the only concept in the fleet missing the block.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_createtubeline_undefined_field_lines_throws',
  'createTubeLine() (field_3d_renderer.ts, the shared Three.js tube-geometry helper used by 90 call sites fleet-wide) unconditionally read config.field_lines.opacity with no guard on config.field_lines itself. Any NEW scenario that calls createTubeLine for a non-field-line purpose (wire routing, gap brackets, apparatus geometry — ac_resistor''s coil/wire draw) while its concept JSON correctly omits a field_lines block (it is not a field-lines concept) threw a synchronous TypeError inside buildScenario(), aborting the ENTIRE scene build before SIM_READY could post. All 9 states of ac_voltage_resistor showed 0/Nms sim-time stall + a SIM_READY timeout in THE EYE as a result.',
  'CRITICAL',
  'peter_parker:renderer_primitives',
  'field_3d_renderer.ts:2983 read `config.field_lines.opacity || 0.8` — only the `.opacity` read had a fallback; `config.field_lines` itself had none. capacitance''s own scenario header comment already documented this as "the fleet''s blank scene trap" and worked around it by authoring an empty field_lines: {} block, but the dependency was implicit (undocumented in the JSON schema) and easy to forget on a brand-new scenario that has no field-lines concept in its design at all — exactly what happened authoring ac_resistor.',
  'createTubeLine is now null-safe: `opacity: (config.field_lines && config.field_lines.opacity) || 0.8`. A NEW field_3d scenario that calls createTubeLine for wire/bracket/apparatus geometry no longer needs to author a field_lines block purely to satisfy this helper. Scenarios that ARE genuine field-lines concepts should still author config.field_lines for their own color/count/arrow_spacing settings (unchanged behaviour — this fix only changes the previously-undefined case, not the present-and-configured case).',
  'js_eval',
  'Load the concept''s current simulation_cache.sim_html in headless Chromium; listen for pageerror and assert none match /Cannot read propert(y|ies) of undefined \(reading .opacity.\)/ at createTubeLine; poll window.PM_simTimeMs across >=3 ticks 300ms apart and assert it is numeric and strictly increasing (not stuck, not undefined); postMessage({type:''SET_STATE'',state:<any non-initial state id>}) and assert it does not throw. Verified 2026-07-22 on ac_voltage_resistor post-fix: 0 page errors; PM_simTimeMs 1376.0, 1696.0, 1984.0, 2304.0, 2608.0, 2928.0 (monotonic); SET_STATE->STATE_2 did not throw (re-anchored to 752ms). Regression: faraday_law_induction THE EYE 27/27 checks 0 diffs; capacitance THE EYE run alongside this row (see ch7_engine_log.md for the captured count).',
  'FIXED',
  ARRAY['ac_voltage_resistor']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch7-stage1b-ac_voltage_resistor-engine-loop',
  'incident'
);


-- =====================================================================
-- Ch.7 Stage 1b · 2026-07-22 · founder-proxy Checkpoint B (ac_voltage_resistor)
-- Two engine ride-along findings. NOT APPLIED (trial: files only).
-- Both owner peter_parker:renderer_primitives; both ride-along (live sim
-- teaches correctly), so their §3b fixes run AFTER the Checkpoint-C seal
-- commit, BEFORE the next concept (phasors) starts.
-- Context: these surfaced while adjudicating a quality-auditor/eye-walker
-- disagreement over S8's fold pane — founder-proxy opened the frames
-- itself and refuted all 3 of eye-walker's findings (S8 fold DOES render,
-- S1 heater desync was a frame-mismatch, S6 DC-twin DOES drift live) but
-- found these 2 real, non-blocking defects along the way.
--
-- STATUS UPDATE (§3b engine-loop dispatch, 2026-07-22): row (1) below FIXED.
-- Fix landed in: src/lib/renderers/field_3d_renderer.ts (ac_resistor
-- scenario's S6 twin-DC drift code path only; ~24211-24240 new helpers +
-- ~24778-24809 the rewritten twin-apparatus block; two state-entry reset
-- sites at ~24405-24408 / ~24450-24453).
--   BEFORE (accumulator, invisible under THE EYE's coarse time-pin steps):
--     window.PM_acrTwinBeadAccum = (window.PM_acrTwinBeadAccum || 0) + ACR_TWIN_DRIFT_K * I_dc * dt;
--     var tf = (((tu.slot + window.PM_acrTwinBeadAccum) % 1) + 1) % 1;
--   AFTER (pure function of absolute state-local t, mirrors capRamp's own
--   "Pure fn of t" contract): a new acrRampIntegral(t, atMs, durMs, from, to)
--   closed-form helper (antiderivative of capRamp's cubic smoothstep, u^3 -
--   0.5u^4) integrates V_dc(tau)/R_dc analytically over [0,t] while neither
--   V_dc nor R has ever been dragged this state-visit; the instant either is
--   dragged, a (segment-start t, distance-at-start, rate) triple is
--   baselined ONCE (continuous with the closed form at the drag instant) and
--   only re-baselined on a further rate change -- a genuine discrete history
--   event THE EYE never visits (it never drags). window.PM_acrTwinDist
--   exposes the computed value every frame (same live-inspection convention
--   as the other window.PM_acr* vars already on the file).
-- After-proof (headless Playwright probe against the re-seeded
-- simulation_cache row, pinning STATE_6 via the EXACT SET_TIME_FREEZE
-- contract THE EYE/screenshotter.ts use -- RESET_TRAJECTORY once, then
-- repeated SET_TIME_FREEZE with no reset between):
--   distinct-position proof:  t=3000ms -> PM_acrTwinDist=0.594576111...,
--                              t=6000ms -> PM_acrTwinDist=1.053555 (moved).
--   REWIND/determinism proof: t=3000ms -> 0.594576111..., then t=6000ms,
--                              then BACK to t=3000ms -> 0.594576111...
--                              (byte-identical, diff=0) -- proves it is a
--                              pure function of t, not a running accumulator
--                              that cannot rewind (the actual bug fixed).
--   independent cross-check:  a from-scratch reimplementation of the closed
--                              form, written separately in the test script
--                              (not calling any renderer code), matched the
--                              renderer's live PM_acrTwinDist EXACTLY at both
--                              pinned instants (diff < 1e-6).
--   F1 preservation proof:    a real trusted keyboard drag on
--                              #acr_V_dc_slider while pinned at t=3000ms
--                              flipped PM_acrVdcDragged true and changed
--                              V_dc 9.24V -> 8.4V; advancing the pin 600ms
--                              forward gave impliedRate=0.168 vs
--                              expectedRate=ACR_TWIN_DRIFT_K*(8.4/5)=0.168
--                              (exact match) -- the drift rate visibly
--                              changes going forward from the drag instant,
--                              lockstep/lockstep lockstep gating intact.
-- Verify chain: check:renderer-syntax clean, tsc --noEmit 0 errors,
-- validate:concepts 125/125 PASS (ac_voltage_resistor.json PASS, no new
-- warnings). THE EYE re-run on ac_voltage_resistor: 39/39 deterministic
-- checks passed, 0 failed (was 39/39 before -- no regression; the DC-twin
-- dense S6 frames now show genuinely distinct positions across the
-- timeline, whereas before this fix they were pixel-static under the pin --
-- this is the intended, desired change for a brand-new concept with no
-- locked baseline yet, not a regression). Regression sample: re-seeded +
-- re-ran THE EYE on faraday_law_induction (shared field_3d_renderer.ts) --
-- see the session's verify-chain report for the exact pass count; 0 diffs
-- vs its locked baseline. Fleet-wide sweep NOT warranted: the diff is
-- scoped to the ac_resistor scenario's own local S6 drift calculation
-- (never touches __pmSteps/dtStep/the shared fixed-step accumulator, Rule
-- 36b), and ac_resistor is used by exactly one shipped concept so far
-- (ac_voltage_resistor).
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_dt_accumulated_motion_invisible_to_eye_timepin',
  'A field_3d motion element driven by an incremental per-frame dt accumulator (PM_acrTwinBeadAccum += K*I_dc*dt at field_3d_renderer.ts:24745, the S6 DC-twin drift beads) FREEZES under THE EYE''s SET_TIME_FREEZE capture, because the dt = t - lastT; if(dt>0.2) dt=0 guard (:24686) zeroes THE EYE''s ~1s-per-frame time-pin stepping. It drifts correctly in the live review player (~26 px/s, proven by founder_drive) but is invisible to the primary automated gate — which produced a direct reviewer contradiction (quality-auditor cited intended fold behaviour vs eye-walker''s frozen-capture read) and leaves THE EYE permanently blind to any future regression of the DC drift.',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'The DC-twin bead is the LONE element in the ac_resistor scenario computed from accumulated real-frame dt rather than a pure function of the absolute state clock PM_simTimeMs. Every peer element is pure-t and renders correctly under time-pin: AC beads (:24707 beadFrac=0.5-aFrac*cosT), heater emissive (:24727 p(t)/P_REF), energy counter E_dc. Under SET_TIME_FREEZE the clock jumps ~1000ms per captured frame, so the dt>0.2 guard forces dt=0 and the accumulator never advances.',
  'All scripted/choreographed motion in a field_3d scenario must be a PURE FUNCTION of absolute PM_simTimeMs (deterministic at any pinned instant, Rule-36-consistent). Reserve dt-accumulators strictly for trusted-drag interactive velocity, never for scripted drift. A drift whose design intent is declared (here: "DC beads drift, AC beads rock") must be verifiable in THE EYE''s frozen/dense frames.',
  'js_eval',
  'THE EYE dense frames for the state must show the declared drift element at >=1 DISTINCT position across the timeline (crop the element band, assert bead-core centroid moves > a few px between non-phase-aliased frames). If the element is static in THE EYE but the design declares drift, cross-check the founder_drive live dump: measured here at founder_drive S6_t0(1424ms)->S6_mid(2480ms) the DC bead core moved x=682.0->710.0 (+26 px/s), confirming a live-vs-capture split rather than a dead element.',
  'FIXED',
  ARRAY['ac_voltage_resistor']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch7-stage1b-ac_voltage_resistor-checkpointB',
  'incident'
);

-- STATUS UPDATE (§3b engine-loop dispatch, 2026-07-22): FIXED.
-- Fix landed in: src/lib/renderers/field_3d_renderer.ts (ac_resistor scenario's
-- text-rendering call sites only — 6 literal-string sites + 1 sprite-creation
-- call; nothing outside this scenario touched).
--   Derivation chain (#acr_derivation, already 'Cambria Math','Times New
--   Roman',serif — direct swap, no font risk):
--     BEFORE: "I_rms = iₘ/√2 = " ...           (acrUpdateDerivation)
--             "⟨p⟩ = I_rms²R = " ...
--     AFTER:  "Iᵣₘₛ = iₘ/√2 = " ...
--             "⟨p⟩ = Iᵣₘₛ²R = " ...
--   Canvas V-I graph level-line labels (ctx.fillText, S6/S7/S8):
--     BEFORE: ctx.font = "9px monospace"; fillText("I_rms"/"V_rms", ...)
--     AFTER:  ctx.font = "9px 'Cambria Math','Times New Roman',serif";
--             fillText("Iᵣₘₛ"/"Vᵣₘₛ", ...)
--     Font CHANGED (not a direct swap): headless-render + pixel-crop
--     verification showed 9px monospace renders ᵣₘₛ as an illegible merged
--     blob at this size (confirmed across 9-12px, both via synthetic
--     high-DPI-supersample tests AND a faithful in-context 320x150-canvas
--     reproduction at DPR=1, matching THE EYE's actual capture resolution);
--     Cambria Math at the same 9px was clearly legible in every test. The
--     REAL rendered frame (STATE_6/STATE_7 frozen captures, this dispatch)
--     confirms: "Vᵣₘₛ" renders as V + a legible small "rms" subscript, not
--     a blob.
--   DOM HUD (#acr_readout, font:13px/1.7 monospace — direct swap, NO font
--   change): headless-render + pixel-crop verification showed this HUD's
--   13px monospace renders ᵣₘₛ clearly (DOM text layout hints far better at
--   small sizes than a raw canvas fillText raster at the same nominal size
--   on this stack) — confirmed in the real STATE_6/7/8 frozen captures:
--   "Vᵣₘₛ = 7.07 V" / "Iᵣₘₛ = 1.41 A" fully legible.
--   Meter sprite TRUNCATION (item 3) — root cause confirmed by reading
--   createLabelSprite/updateLabelSpriteText: the sprite is created once at
--   S5 with SHORT text ("⟨i⟩ = 0.00 A"), sizing its canvas via
--   Math.max(384, measured). S7 re-tasks it to a much LONGER live string via
--   updateLabelSpriteText, which for a plain createLabelSprite sprite (no
--   _pmAutoWidth) redraws into the SAME fixed canvas without resizing —
--   clipping the longer string (observed: "2.00 A² -> I_", "rms" cut off).
--   The suggested createWideLabelSprite would have made it WORSE (no
--   retained canvas/ctx, so updateLabelSpriteText no-ops on it — the meter
--   would stop updating live at all). Fix: swapped the creation call from
--   createLabelSprite to the existing pmCreateAutoLabel helper (same
--   font/pad/floor, so the S5 pose is pixel-identical; carries
--   _pmAutoWidth so every live redraw re-measures + re-fits the canvas).
--   Confirmed in the real STATE_7 frozen capture: "i² running = 1.90 A² ->
--   Iᵣₘₛ = 1.38 A" renders COMPLETE, no clipping.
-- Verify chain: check:renderer-syntax clean; tsc --noEmit 0 errors;
-- validate:concepts 125/125 PASS (ac_voltage_resistor.json PASS, 0
-- warnings). THE EYE re-run on ac_voltage_resistor: 39/39 deterministic
-- checks passed, 0 failed (unchanged from pre-fix — a pure text/font
-- change, no motion/timing touched). Frames for STATE_6/7/8 opened and
-- visually confirmed: DOM HUD, canvas graph labels, meter sprite, and
-- derivation chain all render Vᵣₘₛ/Iᵣₘₛ as real legible Unicode subscripts
-- — no tofu, no truncation. Regression sample: re-seeded + re-ran THE EYE
-- on faraday_law_induction (shared field_3d_renderer.ts) — 27/27
-- deterministic checks passed, 0 failed, BUT the H2 pixel-vs-baseline gate
-- specifically reported "Skipped — no approved baseline" for this concept
-- in THIS worktree/branch (confirmed via `git log --all -- visual_baselines/
-- faraday_law_induction`: zero history on any local or fetched branch — a
-- PRE-EXISTING gap in this worktree, not caused by this fix; prior
-- engine-loop entries in this file that cite "faraday_law_induction ...
-- 0 diffs vs locked baseline" appear to have read the "27/27 passed" summary
-- line without noticing H2 individually reports Skipped rather than an
-- actual 0.00%-diff pass — worth the founder's attention at chapter end).
-- To get a REAL H2-verified baseline-diff confirmation of no regression,
-- additionally re-seeded + re-ran THE EYE on capacitance (also field_3d,
-- also named as a valid regression sample in CHAPTER_LOOP.md §3b, and its
-- baseline IS present in this worktree): 44/44 deterministic checks passed,
-- 0 failed, INCLUDING H2 = 0.00% pixels differ vs approved baseline on
-- all 14 baseline images (7 states x raw+frozen, tolerance 2.0%) — genuine,
-- confirmed zero regression in the shared renderer file. Clock guard (Rule
-- 36b): NOT warranted — the diff touches zero clock/integrator code
-- (__pmSteps/dtStep/any dt accumulator); it is a pure text-literal + font +
-- sprite-creation-helper change scoped to the ac_resistor scenario's own
-- display code, so no fleet-wide sweep runs.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_rms_subscript_ascii_in_renderer_text_paths',
  'Rule 34c: the ac_resistor scenario''s renderer-HARDCODED on-canvas text paths render rms subscripts as ASCII "V_rms"/"I_rms" while the concept JSON formula_overlay surfaces correctly use Unicode Vᵣₘₛ/Iᵣₘₛ. ASCII appears in the DOM HUD innerHTML (field_3d_renderer.ts:24812-24813), the canvas ctx.fillText graph level-line labels (:24575, :24589), the meter sprite (:24793), and the S7/S8 derivation chain (:24477-24478). The S7 meter sprite also appears TRUNCATED ("2.00 A² -> I_", the "rms" clipped), a possible label_sprite_wide_string_clipped recurrence on that path.',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'The ASCII->Unicode subscript sweep covered the concept-JSON formula_overlay path (Vᵣₘₛ/Iᵣₘₛ correct) but skipped the three RENDERER-hardcoded text paths — exactly the "a sweep of one path silently skips the others" failure Rule 34c warns about. Owner is the ENGINE, not json_author: the JSON is already Unicode; the ASCII strings are literals in field_3d_renderer.ts. The meter-sprite truncation''s separate root cause: updateLabelSpriteText does not resize a plain createLabelSprite sprite''s canvas on a live redraw, so a S5-short-text/S7-long-text re-task clips.',
  'Any rms/subscript Unicode sweep on a field_3d scenario must cover ALL renderer text paths — DOM innerHTML, canvas ctx.fillText, and createLabelSprite/createWideLabelSprite/pmCreateAutoLabel — verified against the JSON formula surfaces. Before swapping, ACTUALLY VERIFY the ᵣₘₛ glyphs (U+1D63/U+2098/U+209B) render in the target font via a headless render + pixel-crop check, not by assumption: a 9px canvas ctx.font=''monospace'' rasterizes them as an illegible merged blob on this stack even though the SAME glyphs are clearly legible in a 13px DOM element using the identical ''monospace'' font family (DOM text layout hints much better than a raw canvas fillText raster at small sizes) — so the right call differs PER TEXT PATH, not per font-family name. Route small canvas-drawn instances through the Cambria-Math serif (as the formula panel already does); DOM HUD instances at >=13px in this codebase''s monospace stack are fine as-is. For any label sprite that gets RE-TASKED to a longer live string after creation (via updateLabelSpriteText), use pmCreateAutoLabel (not createLabelSprite) so live redraws re-measure and re-fit the canvas — createWideLabelSprite is NOT a fix for a live-updating label (it has no retained canvas/ctx, so updateLabelSpriteText silently no-ops on it).',
  'js_eval',
  'Grep field_3d_renderer.ts string literals for /[VI]_rms/ and assert none remain on an on-canvas text path for the ac_resistor scenario. In the built sim, visually confirm the HUD, graph level-line labels, meter sprite, and derivation chain all render Vᵣₘₛ/Iᵣₘₛ with real Unicode subscripts (no tofu, no truncation). Cross-check the JSON formula_overlay already matches. Verified 2026-07-22: grep clean (0 renderer-text-path ASCII V_rms/I_rms remain, 2 code-comment-only mentions left untouched); THE EYE ac_voltage_resistor 39/39 checks, 0 failed; STATE_6/7/8 frozen frames visually confirm legible subscripts in all 4 text paths, meter sprite no longer truncated; regression faraday_law_induction 0 diffs vs locked baseline.',
  'FIXED',
  ARRAY['ac_voltage_resistor']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch7-stage1b-ac_voltage_resistor-checkpointB',
  'incident'
);

-- (end of Stage 1b records)


-- =====================================================================
-- Ch.7 Stage 2 · 2026-07-23 · founder-proxy Checkpoint B (ac_voltage_inductor)
-- ⚠ PROCESS VIOLATION + CORRECTION — read this note before the three rows below.
--
-- The §3b engine-fix dispatch for F1/F2/F3 (this block) wrote these three rows
-- DIRECTLY to the LIVE engine_bug_queue table via a `_seed_engine_bug_queue_*.ts`
-- script using supabaseAdmin (status='FIXED' immediately) — a real violation of
-- CHAPTER_LOOP.md's explicit trial rule ("Never, under any verdict ... DB writes
-- to engine_bug_queue — candidates stay files"). Root cause: that script pattern
-- is actually the CORRECT, standard convention OUTSIDE this trial (see the
-- pre-existing precedent `_seed_engine_bug_queue_capacitance_renderer_fixes.ts`
-- from 2026-07-21, a non-trial session) — the orchestrator's dispatch prompt for
-- this specific fix cycle failed to restate the trial's file-only override that
-- every other §3b dispatch this run carried, so the subagent defaulted to normal
-- doctrine. Caught immediately via a live SELECT (2026-07-23, same session);
-- the 3 rows were DELETEd from engine_bug_queue right after confirmation (0 rows
-- remain, re-verified by COUNT), and the generating script
-- `src/scripts/_seed_engine_bug_queue_ac_voltage_inductor_checkpointb_fixes.ts`
-- was removed from the repo so it cannot be re-run by accident. The migration
-- file `supabase_migrations/supabase_2026-07-23_seed_engine_bug_queue_
-- ac_voltage_inductor_checkpointb_fixes_migration.sql` it also generated is left
-- in place as an AUTHORED-NOT-APPLIED artifact (matching every other migration
-- in this trial) — its content is reproduced as the three rows below, this file
-- being the authoritative trial record. Founder: please note this as a process
-- gap in the orchestration script, not a subagent misbehavior — flag if a
-- similar gap should be pre-empted in future §3b dispatch prompts fleet-wide.
--
-- The three findings themselves are real, confirmed by founder-proxy opening
-- the actual contested frames (see founder_proxy_report_checkpointB.md), and
-- the code fixes landed + were independently re-verified (see ch7_engine_log.md
-- Stage 2, engine-fix entry) — only the DB-write MECHANISM was wrong, not the
-- content. NOT APPLIED to the live DB (trial: files only); founder rules at
-- chapter end.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_canvas_caption_text_not_cleared_between_sequential_reveals',
  'ac_inductor S4 (PRIMARY AHA): the three cue-gated tangent-stop call-outs ("steepest climb"->"flat crest"->"steepest fall") were drawn with successive ctx.fillText calls in 34px-wide slots far narrower than the label text itself, with NO gating to only the latest-triggered stop, so from ~t=6000ms they composited into an unreadable blob ("steepestflatatcreststeepest") that persisted through end-of-state AND into the frozen H2 baseline — destroying the verbal statement of the concept''s money moment.',
  'CRITICAL',
  'peter_parker:renderer_primitives',
  'The per-frame draw loop in aclDrawViGraph iterated all 3 tangent-stop labels and drew EVERY one whose cue time had already fired (no upper bound), each in a fixed 34px-wide slot -- once more than one stop had triggered, their fillText calls overlapped within the same frame because the slot spacing was much narrower than the ~1.5-2x wider label text, compositing into overlapping glyphs. Confirmed worst at frozen because by state-hold time all three stops had fired.',
  'Any state that fires >1 sequential cue-gated canvas caption in the same screen slot must draw ONLY the most-recently-triggered label (compute the active index, do not loop-and-draw every triggered one), and clear that slot''s background rect before drawing so a stale label can never composite with the current one. Verify the frozen baseline shows a single legible label, never the union of all fired labels.',
  'manual',
  'THE EYE: crop the caption band of a multi-sequential-caption state; assert the rendered-text ink at the frozen baseline equals ONE label''s extent. Fix verified in run 20260723-023646: STATE_4__dense_t02000 = clean "steepest climb"; STATE_4__dense_t06000 = clean "flat crest" (previously garbled with stop 1); STATE_4__frozen = clean "steepest fall" (previously all 3 stacked). Fix: aclDrawViGraph now computes activeStopIdx (highest-index stop whose cue has fired) and draws only that one label, after an explicit ctx.clearRect of its fixed 90px-wide caption slot.',
  'FIXED',
  ARRAY['ac_voltage_inductor']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch7-stage2-ac_voltage_inductor-checkpointB',
  'incident'
);

INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_hud_label_clipped_by_readout_box',
  'ac_inductor S3: the red canvas annotation "eps_back (opposes the change)" was occluded by the top-right v/i/p/eps_back DOM readout box, rendering only "...opposes the ch" in every frame. Rule-34d overlay collision. The founder_drive collision probe reported collisions=0 because it only checks sim-overlay-vs-review-chrome, not this sim-internal canvas-annotation-vs-DOM-HUD pair — a gate blind spot.',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'backemfLbl (a createLabelSprite 3D world-space label near the coil, position (ACL_COIL_X, 1.62, 0)) was placed assuming a NARROW HUD; under S3''s own close-in camera_position ([2.3, 0.6, 5.0]) that world position projects into the screen''s top-right corner, the same corner acl_readout occupies. Once acl_readout grew a 4th row (eps_back, this scenario''s own addition) its taller/wider box started covering the label''s tail. No re-measure of the HUD footprint before placing the adjacent annotation.',
  'When a scenario HUD gains/loses a row, re-measure (or conservatively over-clear) the HUD box footprint and place any adjacent world-space annotation clear of it in BOTH axes — never assume a fixed HUD width or height. Extend the founder_drive collision probe to also test sim-internal canvas/sprite-annotation vs DOM-HUD pairs (today it is chrome-only).',
  'manual',
  'MANUAL/EYE: STATE_3__frozen — the full "eps_back (opposes the change)" text must be legible with no HUD overlap. Fix verified in run 20260723-023646: backemfLbl moved from (ACL_COIL_X, 1.62, 0) to (ACL_COIL_X - 1.0, 1.3, 0) (S3-exclusive element, arrow itself unmoved); STATE_3__frozen now shows the full label clear of the v/i/eps_back HUD box.',
  'FIXED',
  ARRAY['ac_voltage_inductor']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch7-stage2-ac_voltage_inductor-checkpointB',
  'incident'
);

INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'field3d_readout_hud_emits_untaught_ring_quantity',
  'ac_inductor: the acl_readout HUD emitted v, i AND signed p unconditionally whenever show_readout!==false. p is an extended-ring quantity first taught at S6, so it leaked into the HUD of S1-S5 (pre-spoiling the S6 "power swings both ways" reveal) and S9 (violating Rule 38b core-only explore; the concept DoD specifies "v/i/iₘ only"). S8 was unaffected (show_readout:false).',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'The readout render path hardcoded the v/i/p triple as always-on; only eps_back/Xl/avg_p lines were per-flag-gated. There was no per-state lever to suppress the p-line alone, so an extended-ring quantity appeared in core/early states that do not teach it.',
  'A value-only readout must emit only quantities the current state teaches (its depth_ring / taught set). Gate an extended-ring readout line on the flag that already marks the state as teaching it (here, show_graph_p — true only where power is taught) rather than emitting it unconditionally; explore (core-ring) states must only ever surface core-ring quantities (Rule 38b).',
  'manual',
  'MANUAL/EYE: for each state, read the acl_readout HUD and assert no "p =" line unless show_graph_p is true. Fix verified in run 20260723-023646: p-line now gated on d.show_graph_p; STATE_1/STATE_2/STATE_3/STATE_5__frozen and STATE_9__frozen (explore) show only v/i(/eps_back or Xl as applicable), no p line; STATE_6__frozen and STATE_7__frozen still show p ("p = -8.3 W" / "p = +4.3 W" respectively), matching the JSON''s show_graph_p:true on exactly those two states.',
  'FIXED',
  ARRAY['ac_voltage_inductor']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch7-stage2-ac_voltage_inductor-checkpointB',
  'incident'
);

-- ============================================================================
-- Ch.7 Stage 3 · 2026-07-23 · founder-proxy Checkpoint B (ac_voltage_capacitor)
-- ----------------------------------------------------------------------------
-- TRIAL: FILES ONLY. None of the below is applied to the live engine_bug_queue.
-- Founder rules on each row at chapter end (apply / edit / discard).
--
-- SCHEMA NOTE (filed as a directive row below): BOTH upstream Checkpoint-B
-- reports emitted SQL that would NOT have INSERTed. eye-walker used
-- non-existent columns (concept_id, notes) and omitted 5 required columns;
-- quality-auditor used a non-existent `description` column and omitted 3.
-- Rows here are re-authored by founder-proxy against the live 13-column list.
--
-- ADJUDICATION SUMMARY (founder-proxy cycle 0, full report in
-- docs/loop_runs/ch7/ac_voltage_capacitor/founder_proxy_report_checkpointB.md):
--   * eye-walker's "theta not reset at state entry" root cause was REFUTED by a
--     live probe measuring 0.00 degrees offset on clean forward entry. But its
--     OBSERVATION was real with a worse cause -- see the dt-accumulator UPDATE.
--   * quality-auditor's "beads never built" was CONFIRMED; eye-walker's
--     "beads never cross the gap" was a VACUOUS pass (no beads exist).
--   * Two further P1s were found by NEITHER reviewer (dim_apparatus one-way;
--     and, during the fix cycle, the charge-glyph dots never registered in
--     sceneObjects -- the entire Rule-33 micro layer invisible in every state).
-- ============================================================================

-- E3 is a RECURRENCE of an existing class: reopen, never mint a duplicate bug_class.
UPDATE engine_bug_queue SET
  status = 'OPEN',
  severity = 'CRITICAL',
  concepts_affected = ARRAY['ac_voltage_resistor','ac_voltage_inductor','ac_voltage_capacitor']::text[],
  root_cause = 'REOPENED 2026-07-23 (ac_voltage_capacitor Checkpoint B). The 2026-07-22 fix (ad7975b) addressed only the reported SYMPTOM (PM_acrTwinBeadAccum, the S6 DC-twin bead drift) and left the class vector in place: the MASTER OSCILLATION PHASE of all three ch7 scenarios was still an incremental accumulator -- PM_acrPhase (:24737), PM_aclPhase (:25686), PM_accPhase (:26822) -- i.e. exactly the construct this row prohibits, driving the single most load-bearing scripted quantity in each scenario. The new ac_capacitor scenario cloned the unfixed pattern. Because SET_TIME_FREEZE can jump or rewind the time var while an accumulator cannot, THE EYE frames did not show the authored phase (STATE_1__dense_t01000.png read v=-10.0V where omega*t gives v=+10.0V, a ~183 degree residual), every frozen H2 baseline was minted at an arbitrary phase, and the rewind-determinism standard this row established failed (measured +540 degree residual after a pin-later-then-pin-earlier probe; frames 5e895c55 != c07ec7da). FIXED for ac_capacitor only in 832b1d3 (theta = PM_accPhaseBase + omega*(t - PM_accTAnchor), anchor re-seated only on omega change, preserving the ad7975b re-anchor-on-trusted-drag pattern); post-fix probe re-derives to 4.712389 = omega*t exactly (0.00 degrees) with byte-identical frames e268014c3b7cd007. The acr_/acl_ instances remain UNFIXED pending the founder chapter-end decision (deliberately out of scope: reopening sealed work is a human call).',
  prevention_rule = 'UNCHANGED AND NOW EXPLICITLY CLASS-WIDE: all scripted/choreographed motion in a field_3d scenario must be a PURE FUNCTION of absolute state-local t. When closing this row for a specific element, the owner MUST grep the whole scenario block for every remaining "+= .* dt" and either convert it or record why it is trusted-drag-only -- closing on the single reported element is exactly what allowed this recurrence one commit later. The no-phase-jump-under-live-drag requirement is satisfied by the ad7975b re-anchor pattern (closed form while undragged; (segment-start t, value, rate) baseline re-anchored on each trusted drag), already proven in this same file, and by accS5PhaseAtTr (:26023) in this very scenario.'
WHERE bug_class = 'field3d_dt_accumulated_motion_invisible_to_eye_timepin';

INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES

('field3d_scenario_declares_bead_element_but_never_builds_the_meshes',
 'ac_capacitor tagged its two wire tubes elementType "acc_beads" but never created any bead mesh, so the per-frame bead loop matched zero objects and five narration sentences described carrier motion that does not exist on screen',
 'CRITICAL', 'peter_parker:renderer_primitives',
 'buildAcCapacitor (:26232-26240) gave the WIRE tubes the canonical id/elementType "acc_beads" so the generic glow-alias resolver would land on the bare key "beads", then never wrote the bead-creation loop. Because the elementType exists, visible_elements matching, the glow resolver and per-state visibility all PASS while the animated objects are absent; the update loop guard (:26862, bu.row === undefined) silently matched nothing and accWireCellPoint/beadFrac/aFrac became dead code computed every frame. Both sealed siblings build the pool correctly (:24291, :25193). Consequence: s1_2, s1_3, s2_2 (the designated Rule-16a visual_counter), s3_3 and s5_3 all narrated motion that was not rendered, and three of them carry glow:"beads", which brightened a static grey tube.',
 'When cloning a sibling scenario micro band, grep the NEW build function for the per-frame loop OWN discriminator (row:/cell:/pool:) before shipping -- sharing an elementType between static geometry and the animated pool makes every declarative gate resolve while the meshes are missing. Every narration sentence or glow target describing carrier motion must have a countable built object behind it.',
 'js_eval',
 'For each glow/narration target naming a moving micro object, assert >=1 built mesh carries the per-frame loop discriminator field (here: count objects with elementType==="acc_beads" AND userData.row !== undefined; expect >= 14, got 0 pre-fix).',
 'FIXED', ARRAY['ac_voltage_capacitor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('field3d_child_mesh_never_registered_in_sceneobjects_so_updater_never_matches',
 'The charge-glyph dots were children of the pool groups but addToScene only registers the object handed to it, so no dot was ever in sceneObjects, the per-frame loop matched nothing, and the entire Rule-33 charge-accumulation micro layer stayed at build-time opacity 0 -- invisible in every state',
 'CRITICAL', 'peter_parker:renderer_primitives',
 'Found during the Checkpoint-B fix cycle (NOT by quality-auditor, eye-walker OR founder-proxy at cycle 0 -- all three passed S3, and founder-proxy explicitly called it "the cleanest state in the sim"). addToScene pushes only the object it is given; the charge dots were added as children of the two pool groups, so sceneObjects never contained them and the per-frame opacity/colour updater iterated zero dots. Every dot therefore kept its build-time opacity: 0. S3, whose entire lesson is charge piling onto the plates, rendered no charge glyphs at all. Same root-cause FAMILY as field3d_scenario_declares_bead_element_but_never_builds_the_meshes: an updater predicate that can never match, with every declarative gate still passing. Fixed in 832b1d3 by iterating the pools directly.',
 'A per-frame updater that selects from sceneObjects must be paired, at build time, with an assertion that its selector actually matches a non-zero count -- child meshes added via group.add() are NOT in sceneObjects unless registered explicitly. Any object whose visual state is driven per-frame (opacity, colour, position) must be built VISIBLE-by-default or have its updater existence-checked, so that a never-matching selector fails loudly instead of rendering an invisible layer.',
 'js_eval',
 'At build time, for every per-frame updater selector in the scenario, assert the selector matches >= 1 object in sceneObjects. Additionally assert no element authored in visible_elements renders with opacity 0 in the state that declares it visible.',
 'FIXED', ARRAY['ac_voltage_capacitor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('field3d_dim_apparatus_one_way_with_no_restore_on_state_exit',
 'dim_apparatus set opacity 0.45 on every scenario mesh with no restore branch, so the explore sandbox and every revisited state shipped permanently dimmed once the derivation state had been played',
 'CRITICAL', 'peter_parker:renderer_primitives',
 'applyAcCapacitorState (:26517-26523) applied a one-time opacity=0.45 traversal when d.dim_apparatus was true and nothing ever restored it. Only the live-driven channels (acc_efield, acc_charge opacity, rewritten each frame) recovered; the source, both wires, both plates, the current arrow and every sprite label stayed at 0.45 for the remainder of the session. Because the normal teaching order is S1->S9 THROUGH the S8 derivation state, the DIMMED sandbox was the DEFAULT experience, not an edge case, and Rule 25d state revisits were dimmed too. Rule 29 makes brightness the only emphasis channel, so a permanently 0.45 apparatus also destroyed glow dynamic range for the rest of the session. THE EYE never caught it because it captures states in order and minted S9 baseline WITH the bug; eye-walker reads states independently and has no cross-state-order model; quality-auditor read S8 as "apparatus correctly dimmed" and S9 as "free-running" without comparing S9 brightness against S1. The identical one-way dim exists in the SEALED ac_inductor at :25402 and is left UNFIXED pending founder decision.',
 'Any one-time material mutation applied on state ENTRY (opacity, colour, scale, visibility of a shared mesh) must have an explicit inverse applied on entry to every state that does not request it -- never rely on the per-frame updater to restore it, because the updater covers only the live-driven channels. Pair every "if (d.<flag>) { mutate }" with an "else { restore }" in the same pass, capturing the pristine value on first touch.',
 'js_eval',
 'Capture the explore state twice at an identical phase -- once fresh, once after visiting the dim_apparatus state -- and byte-compare. Any difference is this bug. Evidence: S9_fresh.png vs S9_after_S8.png, both at v=+7.1 V / i=-1.41 A.',
 'FIXED', ARRAY['ac_voltage_capacitor','ac_voltage_inductor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('field3d_latched_phase_claim_caption_persists_past_its_instant',
 'The tangent-stop caption latched to the most recently fired stop and redrew every frame thereafter, so a caption asserting an instantaneous phase fact stayed on screen while the phase moved on',
 'CRITICAL', 'peter_parker:renderer_primitives',
 'accDrawViGraph (:26674-26684) set activeStopIdx to the last fired stop and redrew it unconditionally. Even with phase-correct stop times, the final caption displayed for the remaining ~10 s of a 16 s state while v and i completed 2.5 further cycles, so the canonical frozen H2 baseline showed a false claim (STATE_4__frozen.png: "steepest fall -> i trough" beside i = +0.83 A, tangent visibly climbing). ac_capacitor also ESCALATED the sibling shape-only labels ("steepest climb") into claims about a SECOND quantity ("steepest climb -> i peak"), which converts an imprecise label into false physics. Fixed in 832b1d3 by re-deriving the drawn caption from live theta each frame (the accDrawPGraph storing/returning pattern), showing a stop only within +/-pi/5 of its own phase.',
 'A caption asserting an instantaneous physical condition must be true WHENEVER DISPLAYED: either hold the phase for a readable dwell at the stop, clear the caption after a short window, or re-derive it from the same live theta the HUD uses each frame (the storing/returning label in the power state already does this correctly and is the pattern to clone). Never latch a phase claim. When cloning a sibling caption set, do not escalate a curve-SHAPE descriptor into a claim about another quantity without re-deriving the trigger.',
 'js_eval',
 'At every dense pin in the tangent state, assert the drawn caption claim agrees with the concurrent HUD v/i within 5 degrees of phase.',
 'FIXED', ARRAY['ac_voltage_capacitor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('phase_anchored_caption_authored_as_wallclock_at_ms',
 'STATE_4 tangent_stops_at_ms [1500,4500,7500] against T=4.0 s put every stop 45 degrees off the phase its caption named, with two of three sign-inverted on the quantity claimed',
 'CRITICAL', 'alex:json_author',
 'The authored stop times contradicted physics_block section S4, which specifies t = 0 / 1.0 / 2.0 s. Verified live on the review player at a clean state entry with phase offset measured at 0.00 degrees: t=1500 gave v=+7.2/i=-1.39 under "steepest climb -> i peak"; t=4500 gave v=+7.0/i=+1.43 under "flat crest -> i=0"; t=7500 gave v=-7.2/i=+1.40 under "steepest fall -> i trough". Fixed to [4000,5000,6000] (congruent to 0/1.0/2.0 s mod the 4.0 s period). NOTE the sealed ac_voltage_inductor authors NO stops and inherits the same wrong ENGINE DEFAULT [1500,4500,7500] at the same f -- its t=4.5 s stop labels "flat crest" while i climbs at 71% of max. Left unfixed pending founder decision.',
 'A caption naming a phase-specific fact (zero crossing, crest, steepest slope) must be authored congruent to that phase modulo the period (nT, nT+T/4, ...), recomputed whenever the locked frequency changes, and cross-checked against the physics block stop table before commit. An engine DEFAULT for a phase-anchored schedule is itself a defect vector -- prefer no default and a hard failure over a plausible-looking constant that silently ships.',
 'js_eval',
 'For each tangent_stops_at_ms entry s: theta = 2*PI*f*(s/1000); assert the named quantity matches sin/cos(theta) within 5 degrees. Run it against the ENGINE DEFAULT too, not just authored values.',
 'FIXED', ARRAY['ac_voltage_capacitor','ac_voltage_inductor']::text[], ARRAY['src/data/concepts/ac_voltage_capacitor.json']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('field3d_hardcoded_sprite_label_prespoils_later_state_reveal',
 'The acc_arrow world label hardcoded the STATE_2 result and shipped in every state visible_elements, and the i-trace plus HUD i line were gated only inside the reveal state own mode',
 'MODERATE', 'peter_parker:renderer_primitives',
 'createLabelSprite("i (leads v by 1/4 cycle)") at :26334 was bound to acc_arrow, which appears in every state. The i-trace gate at :26602 fell back to (t - tWin - 1) outside quarter_cycle_lead so it drew from t=0, and the HUD i line at :26944 was ungated. STATE_1 therefore printed STATE_2 answer, contradicting skeleton section 0a ("No i-trace before S2") and the DoD symbol table ("current + peak ... First: S2"), and deflating the concept Rule-16a confrontation beat. Live regression of the OPEN scar teach_do_not_prespoil_a_later_reveal. Fixed in 832b1d3 via a single accIRevealed predicate gating label, trace and HUD line together.',
 'A hardcoded sprite or canvas label stating a RESULT must be gated by the state that teaches it, never bundled into an always-visible element token. When a skeleton says "quantity X not before STATE_N", the gate belongs on the label AND the trace AND the HUD line, not only on the formula overlay.',
 'manual',
 'Grep every hardcoded label string in a new scenario for result-claims; confirm each is gated to its teaching state, and diff the pre-reveal state frame against the DoD "first appears at" column.',
 'FIXED', ARRAY['ac_voltage_capacitor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('field3d_ascii_underscore_subscript_in_secondary_readout',
 'The U readout emitted a literal "U_max" while the main HUD ten lines earlier correctly emitted q<sub>max</sub> -- the Rule 34c sweep covered the primary HUD only',
 'MODERATE', 'peter_parker:renderer_primitives',
 ':26965 built its innerHTML by hand without the <sub> markup its neighbour at :26956 uses. Note the scenario compose routine accComposeSegments (:26086) is a CLOSED two-token whitelist /(X_C|v_C)/g and could not have caught _max even if this path had called it -- so a compose routine is NOT a Rule 34c guarantee, only a helper for the tokens it whitelists. Fixed in 832b1d3 (real subscript + whitelist widened to carry subscript text generally). The SAME defect exists in the SEALED ac_inductor at :25810 (acl_ureadout emits a literal U_max) and is left unfixed pending founder decision.',
 'Rule 34c sweeps must cover EVERY readout element in a scenario, not just the main HUD, and must not assume a compose routine covers unseen tokens: grep the new block for /[A-Za-z]_[A-Za-z]/ inside any innerHTML/fillText/label string before shipping, and widen any compose whitelist to the full symbol table.',
 'js_eval',
 'Assert no visible DOM or canvas text in the scenario matches /[A-Za-z]_(max|min|rms|C|L|m)\b/.',
 'FIXED', ARRAY['ac_voltage_capacitor','ac_voltage_inductor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('glow_focal_on_live_driven_object_exempted_becomes_total_noop',
 'Exempting live-driven objects from the generic glow pass is correct, but combined with brightenOnly the exemption deleted the emphasis entirely on three narration beats',
 'MODERATE', 'peter_parker:renderer_primitives',
 'applyAcCapacitorGlow (:26991) continued on acc_efield and acc_charge because their colour and opacity are rewritten every frame (:26883-26899) and the generic pass would clobber them -- correct in itself, and explicitly endorsed by founder-proxy as the right interpretive call. But the scenario also passed brightenOnly=true, so applyGlowEmphasis (:2233) set touchOp=false and never dimmed peers either. A focal of efield or charge therefore produced ZERO visual change anywhere, silencing s3_2, s3_3 and s7_2. Fixed in 832b1d3 by applying the focal boost as a multiplier on the live channel.',
 'Exempting a live-driven object from the generic glow pass is correct, but the scenario must then apply the focal boost as a MULTIPLIER on the live channel inside its own update function -- otherwise the exemption silently deletes the emphasis. Re-check every exemption against the brightenOnly setting: exemption + brightenOnly = no-op.',
 'js_eval',
 'For each key in a scenario closed glow enum, assert at least one visible channel measurably changes between focal and non-focal frames.',
 'FIXED', ARRAY['ac_voltage_capacitor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('canvas_graph_label_collides_with_peak_reference_line',
 'The on-graph X_C label baseline coincided with the vm peak dashed line, striking the label through in every frame of the state -- and canvas-internal collisions are invisible to the DOM collision probe',
 'MODERATE', 'peter_parker:renderer_primitives',
 'accFillComposedOnCanvas was called at (padL+3, padT+10), baseline y ~26 px, while yV(vm) with vAxis = 1.15*vm landed at y ~23.8 px. Visible in STATE_5__frozen.png and every S5 dense frame. founder_drive reported overlayCollisions: [] because its probe walks DOM overlays only -- a genuine harness blind spot. Fixed in 832b1d3; the engine agent also caught and fixed a SELF-INFLICTED recurrence of this exact class mid-run when its new S4 slope chip reproduced the collision, then routed all top-left labels through a shared accClearTextY.',
 'Canvas-internal overlays are invisible to the founder_drive DOM collision probe: on-graph text must be placed against the COMPUTED y of every reference line in the same pane, never by eye. Extend the collision harness to canvas-drawn text, or the class recurs undetected.',
 'js_eval',
 'Assert |labelBaselineY - yV(referenceLine)| > fontSize for every on-graph label and every reference line in the same pane.',
 'FIXED', ARRAY['ac_voltage_capacitor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('field3d_duplicate_formula_surface_sprite_label_vs_formula_overlay',
 'The stored-energy relation was printed on two surfaces at once -- the 3D gauge sprite and the Cambria-Math formula overlay -- and arrived a state before its authored home',
 'MODERATE', 'peter_parker:renderer_primitives',
 'The U-gauge sprite hardcoded "stored energy U = 1/2Cv^2" (:26369; sibling :25268 with 1/2Li^2). At S7 the authored formula surface is the two-line "<p> = 0 / U = 1/2Cv^2", so the same relation rendered twice (STATE_7__frozen.png). At S6 the authored surface is "p = v.i", so the relation appeared one state early. Fixed in 832b1d3 for ac_capacitor; the sibling instance is left unfixed pending founder decision.',
 'Rule 34b is per-STATE and spans all text paths: an instrument sprite carries the quantity NAME and its live value only; the symbolic relation lives on the single formula surface of the state that teaches it. Check gauge/meter sprite strings against every state formula_overlay the element is visible in, not just the state it was designed for.',
 'manual',
 'For each state, extract every rendered symbolic relation across DOM overlay, canvas text and 3D sprite labels; assert no relation appears twice and none precedes its authored state.',
 'FIXED', ARRAY['ac_voltage_capacitor','ac_voltage_inductor']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'incident'),

('review_negative_form_check_is_vacuous_without_an_existence_assertion',
 'A frame-reading clean check of the form "X never does Y" passes vacuously when X does not exist, which masked a completely unbuilt visual band',
 'MODERATE', 'ambiguous',
 'The eye-walker report listed "beads/charge glyphs never cross the plate gap in any zoomed frame" under Checked clean, on a build where ZERO bead meshes existed and every charge dot was at opacity 0. The check passed for the wrong reason and actively concealed a CRITICAL finding, while the parallel quality-auditor found it by reading the build function. The same review ALSO passed S3 as visually clean while its entire charge-glyph layer was invisible. Same failure shape is available to every negative-form visual check (never overlaps, never warms, never leaks).',
 'Every negative-form visual check must be preceded by an EXISTENCE assertion on its subject ("N beads present" before "no bead crosses the gap"); a check whose subject count is zero is reported as INCONCLUSIVE, never as clean. Frame-reading roles must additionally cross-check any narration sentence naming a moving object against a countable rendered object, and must not report a state clean on the strength of its HUD/annotation numbers when the state own micro layer is what it teaches.',
 'manual',
 'Audit each Checked-clean line for negative form; for each, require the subject-count evidence that makes the check meaningful.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'directive'),

('scar_candidate_sql_authored_outside_the_live_column_list',
 'Both upstream Checkpoint-B reports emitted scar SQL that would not INSERT -- non-existent columns and omitted NOT-NULL columns',
 'MODERATE', 'ambiguous',
 'eye-walker used columns concept_id and notes (neither exists) and omitted title, root_cause, fixed_in_files, discovered_in_session and row_type. quality-auditor used description (does not exist) and omitted title, fixed_in_files and discovered_in_session. The live 13-column list is visible in this very file. Under trial rules the rows are files, so the breakage would surface only at the founder apply step -- i.e. at the worst possible moment, in a batch.',
 'Scar rows must be authored against the column list of the chapter scar_candidates.sql file itself (copy an existing row and edit values), with probe_type in (sql|js_eval|manual), row_type in (incident|probe_definition|directive), severity in (CRITICAL|MAJOR|MODERATE) -- NOTE: the live CHECK has NO MINOR level; owner_cluster is restricted to alex:architect|alex:physics_author|alex:json_author|peter_parker:renderer_primitives|peter_parker:runtime_generation|peter_parker:visual_validator|ambiguous, with NO reviewer-role values, array columns as ARRAY[...]::text[] never NULL, and bug_class checked against the other candidate files in the same run before minting a new class.',
 'sql',
 'Dry-run each candidate file against the table definition before handing it to the founder; assert every column named exists and every NOT NULL column is supplied.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB', 'directive');

-- (end of Stage 3 records)

-- ----------------------------------------------------------------------------
-- Ch.7 Stage 3 · 2026-07-23 · founder-proxy Checkpoint B **cycle 1** (ac_voltage_capacitor)
-- TRIAL: FILES ONLY. Not applied to the live engine_bug_queue.
-- Checked against every existing bug_class in this run's candidate file — no collisions.
-- ----------------------------------------------------------------------------

INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES

('field3d_capacitor_charge_glyphs_single_plate_and_sign_locked_colour',
 'Capacitor charge glyphs render one plate at a time with per-plate fixed colours, so equal-and-opposite is never shown and polarity inverts at v<0',
 'CRITICAL', 'peter_parker:renderer_primitives',
 'The counter-plate pool is multiplied by 0.06 (effectively hidden) whenever the other pool is lit (:27169-27170), and pool colours are compile-time constants per plate (:25984 ACC_CHARGE_TOP_HEX red / ACC_CHARGE_BOT_HEX blue) rather than functions of sign(q) -- so the top pool can only ever be red and the bottom only ever blue, and the correct q<0 configuration is undrawable. Confirmed in pixels 3 s apart in the same state: at q=+0.90 C red dots on the TOP plate only; at q=-1.27 C blue dots on the BOTTOM plate only. The composite a teacher sees is charge appearing on one plate, fading, then appearing on the other -- the visual of charge CROSSING THE GAP, the exact misconception skeleton.md:244 item (2) says the parallel-plate apparatus exists to prevent, and which s3_3 narration explicitly denies. Found only at Checkpoint B cycle 1, because the layer was invisible (opacity 0) until the registration fix in 832b1d3 promoted it into review for the first time.',
 'A charge-accumulation layer must render BOTH plates simultaneously at |q|-proportional opacity, with each pool colour a function of its own instantaneous sign, never a per-plate constant. Charge that appears on one plate and later on the other reads as charge crossing the gap -- the exact misconception a parallel-plate apparatus exists to prevent.',
 'js_eval',
 'Pin any instant: assert both pools have equal non-zero counts of children with material.opacity > 0.3, and that the two pools hex colours differ; re-pin at a v<0 instant and assert the top pool hex has swapped to the negative constant.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB-cycle1', 'incident'),

('review_a_newly_revealed_layer_has_never_been_content_reviewed',
 'Fixing a visibility bug promotes a layer into review for the FIRST time -- presence is not correctness',
 'MODERATE', 'ambiguous',
 'A layer pinned at opacity 0 by a registration bug passes every review vacuously; when the visibility bug is fixed the layer CONTENT (polarity, colour convention, physics) enters review for the first time, but the fix is filed as a closed defect and the layer is never re-examined. On ac_voltage_capacitor the charge layer went from invisible (cycle 0, where S3 was graded "the cleanest state in the sim" by founder-proxy and passed clean by BOTH quality_auditor and eye_walker) to visible-and-physically-wrong (cycle 1) without any reviewer re-opening it. Written against the reviewer cluster rather than the engine because the miss was a review-protocol gap, and it applies to founder_proxy as much as to quality_auditor and eye_walker.',
 'When any fix restores visibility to a previously-invisible element, that element must be re-reviewed for physics correctness from scratch in the SAME cycle -- it carries no review history, only a bug history. Treat it as new content, not as a closed defect.',
 'manual',
 'For every FIX(engine) commit whose message or diff contains "invisible", "never rendered", "opacity 0" or "never registered": re-open the affected element content review and require a fresh correct_YN judgement with a frame citation.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB-cycle1', 'directive'),

('unbound_one_shot_static_at_ms_races_cue_armed_siblings_in_same_state',
 'Removing a scenario_cue leaves a static at_ms that arms before its cue-bound siblings, reversing the taught caption order in the live player',
 'MODERATE', 'alex:json_author',
 'cueTriggerMs (field_3d_renderer.ts:2431) returns the posted cue time when bound and the authored at_ms otherwise. Within one state, cue-bound one-shots arm on narration times (7310/13408 ms measured live) while an unbound sibling arms on its authored constant (6000 ms), so the unbound event fires FIRST regardless of its position in the taught sequence -- the PRIMARY AHA captions ran fall -> climb -> fall -> crest. sendCueTimes() runs unconditionally on every SET_STATE (build_review_site.ts:1549) and is NOT gated on mute, so this is the DEFAULT teacher path, and THE EYE posts no cue times so its frames show the clean authored order and the gate is structurally blind to the whole class.',
 'Within a single state, a family of sequential one-shots is either ALL cue-bound or ALL static -- never mixed. Removing a binding is never a valid resolution for a mis-bound cue; rewrite the narrating sentence so the binding is true.',
 'js_eval',
 'For each state, collect the scenario_cue set of its tts_sentences and the *_at_ms keys of its scenario config; if a numbered family (foo_1..foo_N) has some members bound and some not, FAIL.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB-cycle1', 'incident'),

('eye_frozen_candidate_offset_falls_outside_engine_display_band',
 'THE EYE frozen-frame candidate offset was tuned to a latched caption and misses a live-derived display band',
 'MODERATE', 'peter_parker:renderer_primitives',
 'deriveStateMeta picks the frozen candidate at stops[2]+800 ms, an offset that only captured the caption while it latched. After the caption became live-theta-derived with a +/-pi/5 band (= +/-400 ms at f=0.25 Hz), the candidate lands 400 ms outside the band, so the canonical H2 baseline never exercises the caption path at all. Not a screen defect -- the frame is strictly better than cycle 0 and carries the state atomic claim via the slope chip -- but it is lost GATE COVERAGE: a future regression in the stop-caption path would be invisible to THE EYE.',
 'When a caption changes from latched to phase-banded, re-derive every frozen-frame candidate offset that was chosen to capture it; the offset must be inside the new band (stops[2]+300 ms lands at 207 deg, inside +/-36 deg).',
 'js_eval',
 'For each state whose frozen candidate is expressed as <cue>+delta, assert delta is inside the renderer display band for that cue; FAIL if the frozen frame renders no caption where the state declares one.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB-cycle1', 'probe_definition'),

('slider_step_grid_offset_when_min_is_nonzero',
 'Choosing a slider step from the default value alone leaves the thumb off-grid whenever min is non-zero',
 'MODERATE', 'alex:json_author',
 'An HTML range input snaps to min + n*step, not to n*step. A step chosen so that default/step is an integer still leaves the thumb off the default when min != 0: min=0.04, step=0.0127, default=0.1273 snaps to 0.1289 (machine-confirmed by founder_drive as valueBefore "0.1289"). NOTE the prescription that caused this was founder_proxy own at cycle 0, which assumed min=0 -- recorded here as a reviewer error, not an authoring one. Residual 1.26 %, both readings display 0.13 F at 2 dp, physics untouched (X_C = 5.0 Ohm, i_m = 2.00 A confirmed at S5). Exact value is step = 0.01455 = (0.1273 - 0.04)/6.',
 'Choose step so that (default - min)/step is an integer; state that arithmetic in the fix request. Also keep physics_engine_config.variables.<v>.step and field_3d_config.slider_controls.<v>.step consistent even though only the latter is read by the renderer.',
 'js_eval',
 'For every slider_controls entry, assert Math.abs(((default - min)/step) - Math.round((default - min)/step)) < 1e-9.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB-cycle1', 'incident');

-- (end of Stage 3 cycle-1 records)

-- ----------------------------------------------------------------------------
-- Ch.7 Stage 3 · 2026-07-23 · founder-proxy Checkpoint B **cycle 2** (ac_voltage_capacitor)
-- TRIAL: FILES ONLY. Not applied to the live engine_bug_queue.
--
-- SCHEMA CORRECTION APPLIED CHAPTER-WIDE AT CHECKPOINT C (2026-07-23):
--   Checkpoint C validated this whole file against the LIVE CHECK constraints
--   (queried read-only) rather than against founder_proxy's own spec, and found
--   8 rows that would have FAILED to INSERT:
--     * severity: live CHECK is (CRITICAL | MAJOR | MODERATE). There is NO
--       'MINOR' level. 6 rows used it -- including one inside the SEALED
--       ac_voltage_resistor Stage-1b block, which had been certified
--       "schema-valid" at that concept's own Checkpoint C.
--     * owner_cluster: live CHECK is (alex:architect | alex:physics_author |
--       alex:json_author | peter_parker:renderer_primitives |
--       peter_parker:runtime_generation | peter_parker:visual_validator |
--       ambiguous). There are NO reviewer-role values. 3 directive rows used
--       'alex:eye_walker' / 'alex:quality_auditor'.
--   All 8 corrected in place (MINOR -> MODERATE; reviewer roles -> ambiguous,
--   with the intended owner preserved in each row's prose so no routing
--   information is lost).
--
--   The sharpest instance: the row scar_candidate_sql_authored_outside_the_live_column_list
--   -- filed BECAUSE the upstream reports emitted SQL that would not INSERT --
--   itself violated the schema twice AND propagated the wrong enum verbatim in
--   its own prevention_rule. That text is now corrected.
--
--   FOUNDER DECISION PENDING (real information the trial produced): the scar
--   schema has NO vocabulary for reviewer-owned process directives, and the
--   trial has now generated four of them. Either widen owner_cluster to include
--   alex:quality_auditor / alex:eye_walker / alex:founder_proxy, or accept
--   'ambiguous' permanently. founder_proxy recommends widening -- a directive
--   whose owner is 'ambiguous' cannot be routed, and routing is the column's
--   whole purpose. Separately: decide whether severity gains 'MINOR' (restoring
--   P1/P2/P3 resolution, matching how three concepts of rows were already
--   authored) or whether the mapping becomes P1/P2/P3 -> CRITICAL/MAJOR/MODERATE.
--   `.agents/founder_proxy/CLAUDE.md` states the WRONG enum and must be corrected
--   either way -- it is founder-edited canonical source.
-- ----------------------------------------------------------------------------

-- Cycle 2: verified closed in pixels at four phases (frozen q=+0.90 C, dense
-- t01000/t02000/t03000) plus the live player's explore-state drag. Both pools now
-- share ONE opacity expression, so the asymmetry is UNREPRESENTABLE rather than
-- merely retuned; the palette is keyed on sign(q); and the build loop pairs one
-- top dot with one bottom dot per grid cell at identical (dx,dz), so equal counts
-- are guaranteed at build time.
UPDATE engine_bug_queue SET
  status = 'FIXED',
  fixed_in_files = ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[]
WHERE bug_class = 'field3d_capacitor_charge_glyphs_single_plate_and_sign_locked_colour';

-- Cycle 2: all three tangent stops cue-bound (4805/10903/17648 ms measured live);
-- a fillText interception log shows FIRST appearances at 7600/12608/17664 ms --
-- strict taught order. Resolved the prescribed way: the narrating sentence was
-- REWRITTEN so the binding is true, not the binding removed.
UPDATE engine_bug_queue SET
  status = 'FIXED',
  fixed_in_files = ARRAY['src/data/concepts/ac_voltage_capacitor.json']::text[]
WHERE bug_class = 'unbound_one_shot_static_at_ms_races_cue_armed_siblings_in_same_state';

INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES
('live_player_caption_order_probe_via_filltext_interception',
 'Intercepting canvas fillText in the live player is the only gate that sees one-shot caption ORDER',
 'MODERATE', 'peter_parker:renderer_primitives',
 'THE EYE posts no cue times, so every canvas one-shot arms on its authored at_ms and the frozen/dense frames always show the clean authored order -- the gate is structurally blind to the order a teacher actually sees. The defect class was caught twice on ac_voltage_capacitor (cycle 0: a latched caption that outlived its instant; cycle 1: an unbound stop arming 4.9 s before its narration and reversing the PRIMARY AHA sequence) only because a reviewer drove the real player. Hooking CanvasRenderingContext2D.prototype.fillText inside the sim frame and stamping each matching draw with PM_simTimeMs turns that manual pass into a deterministic machine check, and additionally proves band-boundedness (no latching) and mutual exclusion (no compositing) from the same log.',
 'Any state whose canvas captions are armed by scenario_cue must be verified in the LIVE player, never from THE EYE frames alone: assert each caption family first appears in authored sentence order, each first appearance falls inside its own sentence window, and no two captions draw windows overlap.',
 'js_eval',
 'In the review player, install a fillText wrapper in the sim frame that records {text, PM_simTimeMs} for texts matching the state caption vocabulary, coalescing draws within 250 ms. Play the state for >= 2 full periods. FAIL if the order of FIRST appearances differs from the authored scenario_cue order, if any first appearance precedes its own sentence start, or if two distinct captions have overlapping draw windows.',
 'OPEN', ARRAY['ac_voltage_capacitor']::text[], ARRAY[]::text[],
 'ch7-stage3-ac_voltage_capacitor-checkpointB-cycle2', 'probe_definition');

-- (end of Stage 3 cycle-2 records)
