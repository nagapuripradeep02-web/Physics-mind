-- =====================================================================
-- Ch.7 CHAPTER-END VERIFICATION — scar candidates, 2026-08-10
--
-- NOT APPLIED. Founder rules on each row (apply / edit / discard), per
-- CHAPTER_LOOP.md section 4 step 5. This file is SEPARATE from the
-- 28 rows already sitting in scar_candidates.sql from the authoring loop.
--
-- Context: all 8 Ch.7 concepts were re-seeded against the current master
-- renderer (~400 commits after they were sealed), captured by THE EYE, and
-- every frame read. The deterministic gates returned 40/40, 48/48, 36/36 on
-- five of the eight while real defects were live in them. Everything below
-- was found by reading pixels or source, never by a gate.
--
-- bug_class is the upsert key. Rows 2 and 3 are UPDATES to existing rows,
-- not INSERTs — check before applying.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. THE GATE ITSELF. Highest value row here: it made 44 states across
--    6 concepts unmeasurable, in BOTH directions.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'eye_dense_cadence_phase_locks_to_sim_drive_frequency',
  'THE EYE sampled dense frames at exactly 1000ms, phase-locking to every f_demo=0.5Hz state so sinusoidal motion was photographed at the identical phase in every frame — producing both false D5 failures and false passes',
  'MAJOR',
  'peter_parker:field3d_surgeon',
  'field_3d computes bead displacement as disp = beadAmp * sin(thetaDeg) with thetaDeg = theta0_deg + f_demo*360*t. At f_demo=0.5 and theta0_deg=0 that is 180*t degrees, so sin is EXACTLY 0 at every whole second and bead opacity (0.45 + 0.4*|sin|) is a constant 0.450. THE EYE captured at exactly 1000ms. Proven, not inferred: two integer-second dense frames were byte-identical (max channel delta 0/255, zero changed pixels) on states whose beads were provably moving, while the frozen frame pinned at the NON-integer 4700ms differed by 190/255 across 750px. f_demo=0.25 aliases the same way for sin(2wt)/sin^2/cos^2 power and energy terms. Exposure measured at 44 states across 6 concepts in Ch.7 alone. Compounding it, the cadence was hardcoded as intervalMs:1000 at BOTH call sites (visual_eyes.ts and smoke_visual_validator.ts), so changing the DENSE_DEFAULT_INTERVAL_MS default alone was dead code. Fixed by removing both overrides and setting the default to 700ms (126 deg/sample at 0.5Hz, a 7-sample phase cycle), plus raising DENSE_DEFAULT_MAX_FRAMES 61 to 87 because frameCount = min(maxFrames, floor(duration/interval)+1) means the frame cap, not the duration, bounds coverage — left at 61 it would have silently clipped every state at 42s.',
  'The dense-capture interval must stay INCOMMENSURATE with the drive periods sims actually animate at: require (interval_ms * f_hz * 360) mod 180 != 0 for every f a sim drives at. It must have exactly ONE definition — a caller that hardcodes the value silently overrides the documented default and its reasoning. Any change to the interval must move DENSE_DEFAULT_MAX_FRAMES with it or coverage is silently truncated. NOTE this does NOT affect H2: regression compares like-for-like frames at the same cadence, so a fleet sweep stays valid even when the motion gates are blind.',
  'js_eval',
  'For a state failing D5, diff its dense frames against its FROZEN frame (whose pin lands at a non-integer time, printed in the EYE log Reveal map). Byte-identical between integer-second dense frames PLUS a large localized change against the frozen pin = aliasing, the motion is real. If the frozen frame ALSO matches, the state is genuinely static. Reference 2026-08-10: series_lcr_circuit STATE_5 dense t5000 vs t9000 = 0 changed px; frozen t4700 vs dense t5000 = 190/255 across 750px in bbox x[467..817] y[300..421].',
  'FIXED',
  ARRAY['series_lcr_circuit','ac_power_factor','ac_voltage_resistor','ac_voltage_inductor','ac_voltage_capacitor','phasors']::text[],
  ARRAY['src/lib/validators/visual/screenshotter.ts','src/scripts/visual_eyes.ts','src/scripts/smoke_visual_validator.ts']::text[],
  'ch7-chapter-end-verification-2026-08-10',
  'incident'
);


-- ---------------------------------------------------------------------
-- 2. D5 IS CANVAS-RELATIVE — framing decides whether real motion is
--    visible. OPEN: lc_oscillations STATE_1 needs a design decision.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'single_monotonic_reveal_cannot_satisfy_an_adjacent_frame_motion_gate',
  'lc_oscillations STATE_1: a state whose ONLY motion is one monotonic charge-up fails D5 at every duration — short leaves a dead frame, long makes every adjacent-frame delta sub-threshold',
  'MAJOR',
  'alex:architect',
  'STATE_1 (mode charge_up) animates a single smoothstep fill and then holds. At the authored 2000ms it moved for 2s under 54 words (~19s) of narration, leaving ~16s of a byte-identical frame — and its final sentence instructed the viewer to "remove the battery from the circuit completely", an action the sim never depicts (STATE_2 shows it). Cutting that sentence and stretching the fill to 17000ms closed the dead-frame half but NOT the gate: an 8.5x slower animation makes each frame delta 8.5x smaller. Measured after the change: 0.02% peak adjacent diff against a 0.1% bar. The deeper constraint is framing — this concept sets camera_position z=12.0 on every state where ac_voltage_resistor (which passes comfortably) uses 8.5, so its apparatus occupies ~5% of a 1280x720 canvas and the ENTIRE 17s charge-up moves only 717px = 0.078% of canvas, under the bar before any timing question arises. D5 is canvas-relative, so no authoring value can fix a single monotonic reveal across a narration-length state.',
  'A guided state needs CONTINUING motion, not one completing reveal, if its narration outlasts the reveal — e.g. charge visibly flowing from source to plates throughout, not just an end-state fill. When a state fails D5, compare its camera_position against a sibling concept that passes BEFORE assuming a timing or motion defect. And never diagnose from a change bounding box: a bbox is the UNION of changed pixels, not a map of where they cluster — reading bbox x[744..1174] as "only the HUD moved" wrongly concluded the capacitor plates never animate, when the capacitor sits at x~740-800 inside that box. Open the frame.',
  'js_eval',
  'For a state failing D5 whose frozen frame ALSO matches its dense frames (i.e. not aliasing): diff the FIRST and LAST dense frame of the state. If the total change across the entire animation is itself below the D5 threshold, the defect is framing/design, not timing — no duration value will fix it. Reference 2026-08-10: lc_oscillations STATE_1 t00000 vs t16800 = 717px, 0.0778% of canvas.',
  'OPEN',
  ARRAY['lc_oscillations']::text[],
  ARRAY[]::text[],
  'ch7-chapter-end-verification-2026-08-10',
  'incident'
);


-- ---------------------------------------------------------------------
-- 3. A REVEAL PIN THAT LANDS AFTER ITS OWN CUE CYCLE COMPLETES.
--    Currently worked around in JSON; the clean repair is engine-side.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'wattless_reveal_pin_lands_after_the_paradox_has_reverted',
  'ac_power_factor STATE_6: deriveStateMeta pins the wattless state 800ms AFTER its R-cycle returns to default, so the settled frame — what a teacher sees on pause and what visual:approve would baseline forever — shows no paradox at all',
  'MAJOR',
  'peter_parker:field3d_surgeon',
  'deriveStateMeta computes the wattless pin as an unconditional sum: r_cycle_start_at_ms + r_down_dur_ms + r_hold_dur_ms + r_up_dur_ms + 800. The renderer has a matching unconditional terminal branch (else R = rTop) firing at exactly start+down+hold+up. The two are mathematically locked: the pin is ALWAYS 800ms past the moment R returns to r_cycle_top, for any positive durations, so no small values can make it land on the low-R paradox. Measured at the authored 800+1200+1000+1200=4200ms against a 5000ms pin: the frozen frame read R=5.0 Ohm, I_rms=0.784A, P=3.08W — the baseline values, identical in every number to STATE_5. The state whose caption reads "More amps, fewer watts" held a frame showing neither. Worked around in JSON by setting r_hold_dur_ms=65000 so the raw pin exceeds DURATION_MAX_MS (60000) and clamps mid-hold; verified after: R=2.0 Ohm, I_rms=0.911A, P=1.66W. That workaround depends on a clamp constant and forces THE EYE to crawl that state to 60s.',
  'A reveal pin must land on the instant the state EXISTS to show, not after its cue cycle completes. For any mode whose cue schedule returns a driven variable to its default, the pin belongs mid-hold, not at cycle end. Verify by reading the frozen frame and confirming the taught quantity actually differs from the previous state — a passing gate count cannot see this, and neither can a word count.',
  'js_eval',
  'For each state whose caption or title asserts a CHANGE (more/fewer, larger/smaller), compare its frozen frame numeric readouts against the previous state. Assert at least one asserted quantity differs. Reference 2026-08-10: ac_power_factor STATE_5 vs STATE_6 frozen both read I_rms=0.784A / P=3.08W before the fix.',
  'OPEN',
  ARRAY['ac_power_factor']::text[],
  ARRAY[]::text[],
  'ch7-chapter-end-verification-2026-08-10',
  'incident'
);


-- ---------------------------------------------------------------------
-- 4. FALSE FINDING — file NOTHING as an incident. Kept as a probe so the
--    method that caught it survives. A MAJOR was routed to the engine on
--    a contact-sheet misread; the pixel probe disproved it in minutes.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'cue_timing_verdict_from_contact_sheet_is_unreliable',
  'Cue-gated canvas reveals must be judged by a per-row pixel profile on full-resolution dense frames, never a contact sheet',
  'MODERATE',
  'peter_parker:field3d_surgeon',
  'Contact-sheet tiles are 25% scale. A 1.2px canvas strike-through and a panel border stroke 14px away collapse into the same ~3px red smear, so a correctly cue-gated reveal reads as "already fired at t=0". A false MAJOR (ac_power_factor STATE_4, chip_strike_at_ms:1500) was routed to the engine cluster on this basis and cost a dispatch; a per-row pixel count showed the chip unstruck through t=1400 and struck from the first sample after 1500 in two independent runs at two different cadences. All four of that state at_ms cues were confirmed correct.',
  'Before routing any "reveal fired early/late" finding: run a per-row pixel count over the reveal element x-span on FULL-RESOLUTION dense frames bracketing the authored at_ms. A line reveal spans the element width (100+ px on one or two rows); glyph rows never exceed ~35px. Judge the bracket, not the thumbnail. More generally: a frame-reading claim about BEHAVIOUR needs a pixel-level check before it becomes a work order — confirming the authored field exists is not confirmation the behaviour is wrong.',
  'js_eval',
  'For frames bracketing at_ms: for each row y in the reveal band, count pixels matching the reveal hue across the element x-span; the reveal is PRESENT iff max row count >= ~0.8 * element width. Assert absent in the last frame before at_ms and present in the first frame after.',
  'OPEN',
  ARRAY['ac_power_factor']::text[],
  ARRAY[]::text[],
  'ch7-chapter-end-verification-2026-08-10',
  'probe_definition'
);


-- ---------------------------------------------------------------------
-- 5. RULE 41a AT FLEET SCALE — a structural gate gap, not 8 accidents.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'rule41a_banned_phrases_survive_seal_because_no_gate_matches_strings',
  'All 8 sealed Ch.7 concepts shipped Rule 41a violations, including the exact banned word "win" and four uses of the banned-family "rides" — 107 reader-facing strings fixed at chapter end',
  'MAJOR',
  'alex:json_author',
  'Rule 41a names its banned vocabulary explicitly ("wins", "rides on", "gives back", "All yours", ...) but every automated gate checks STRUCTURE (word counts, primitive counts, binding integrity), never register. So a concept can pass 40/40 deterministic checks and the full validator while carrying an exact string match to a named banned word. Measured at chapter end: transformer shipped "looks like a win" plus "rides"/"ride" x4; ac_voltage_capacitor carried 19 violations; the phrase "All yours" appeared in 37 concepts fleet-wide, 27 of them baseline-locked and 17 already DEPLOYED to teachers. lc_oscillations additionally shipped a caption ("A pendulum in copper") that was not merely metaphorical but physically WRONG — the concept teaches the mass-on-spring SHM analogy, not a pendulum.',
  'quality_auditor plain-language probe must run a literal string match against Rule 41a''s named banned list over every RENDERED string before seal, not a structural check. Scope matters and is scenario-dependent: on-canvas text comes from field_3d_config.states.<S>.{caption, formula_overlay} plus teacher_script narration — but `label` is SUPPRESSED for at least ac_power and ac_series_lcr (field_3d_renderer legend gate), and epic_l_path.scene_composition[].text is never rendered for field_3d at all. Do not treat a raw grep count as the defect count; roughly half the hits sit in paths that never reach a screen.',
  'js_eval',
  'Grep every rendered string (field_3d_config.states.*.caption + formula_overlay, teacher_script.*.text_en, state titles) against the Rule 41a banned list. Exclude misconception_watch blocks, which deliberately voice a student''s wrong belief. Assert zero matches.',
  'FIXED',
  ARRAY['ac_voltage_resistor','ac_voltage_inductor','ac_voltage_capacitor','phasors','series_lcr_circuit','ac_power_factor','lc_oscillations','transformer']::text[],
  ARRAY['src/data/concepts/']::text[],
  'ch7-chapter-end-verification-2026-08-10',
  'incident'
);


-- =====================================================================
-- ALSO AUTHORED THIS SESSION, as SQL text inside the agent reports —
-- copy from those if you want them, not duplicated here:
--   field3d_transformer_sprite_labels_render_literal_ascii_underscore_subscripts  (INSERT, FIXED)
--   field3d_hardcoded_sprite_label_prespoils_later_state_reveal                   (UPDATE — recurrence on ac_voltage_inductor)
--   field3d_ascii_underscore_subscript_in_secondary_readout                       (UPDATE — sibling instance closed)
--   fan_and_triangle_insets_overlap_when_both_declared_visible                    (INSERT, FIXED)
--   field3d_dim_apparatus_declared_but_contract_not_honoured                      (INSERT, FIXED)
--
-- STILL OPEN, no row authored — founder decisions:
--   * ghost_swing_at_ms:0 with no tween — ac_power_factor STATE_4 ghost needle
--     pops in at its final angle with no visible cause (Rule 32a).
--   * 16 rendered ASCII subscripts remain fleet-wide, including eps_L in
--     `inductance` and theta_max in `bar_magnet_in_uniform_field` — both
--     baseline-locked AND deployed, so fixing them forces a Rule 34e re-baseline.
--   * tfr_/lco_/pwr_ each write opacity per frame on live-driven channels their
--     dim pass does not multiply — the same partial-dim shape just fixed in slcr_.
-- =====================================================================
