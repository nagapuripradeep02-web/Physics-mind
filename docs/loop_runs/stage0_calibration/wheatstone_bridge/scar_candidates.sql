-- ============================================================================
-- CANDIDATE engine_bug_queue rows — `wheatstone_bridge`
-- founder-proxy, Stage 0 calibration, 2026-07-22 (EXPERIMENTAL chapter-loop trial)
--
-- *** NOT APPLIED. DO NOT RUN WITHOUT FOUNDER REVIEW. ***
-- Trial rule (docs/CHAPTER_LOOP.md §3.4): candidate scars stay FILES. No agent
-- and no loop session inserts them. The founder rules on each row (apply / edit /
-- discard) at chapter end.
--
-- Provenance: one blinded founder-proxy run against HEAD. NOTHING WAS PLANTED in
-- this concept -- the build reviewed is exactly what ships, and it is live in
-- PILOT_CONCEPTS. Every row below is a candidate against production code.
--
-- Blinding note: the exclusion filter (rows whose concepts_affected contains
-- 'wheatstone_bridge') matched 0 of 304 rows -- this concept has never carried a
-- scar row, so no answer key existed in the DB to leak.
--
-- NORMALISED by the orchestrating session (agent output used values outside the
-- column enums and would have failed on insert):
--   probe_type 'automated' -> 'js_eval'
--   '%%' escape sequences in prose -> literal '%'
--   all rows status 'OPEN', row_type 'incident'
--
-- Rows 1, 2 and 3 were independently verified in the source by the orchestrating
-- session before filing (particle_field_renderer.ts:727; the missing bp.balanced
-- guard at ~L1949 vs the present one at L1927; bridgeTol()=0.01 at L1371/L1415
-- vs the 1e-4 bead early-out at L1836).
-- ============================================================================

INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
   probe_type, probe_logic, status, concepts_affected, fixed_in_files,
   discovered_in_session, row_type)
VALUES

-- 1 ── MAJOR. Fleet-wide chrome collision on every particle_field concept. ────
('pf_slider_panel_collides_with_review_chrome_fullscreen',
 'particle_field #pm-sliders is position:fixed top:10px right:10px, so the review-chrome Widgets/Full-screen buttons cover 197 of its 264px width across its top 30px -- the FIRST slider row label is clipped and its live numeric value is entirely hidden on every state that exposes a control, across every particle_field concept',
 'MAJOR', 'peter_parker:renderer_primitives',
 'The panel top offset was never migrated to the Rule-34d reserved zone (top:52px+) when field_3d''s HUDs were; particle_field kept the pre-chrome top:10px. THE EYE captures the raw sim with no chrome, so this class passes every deterministic gate and ships. Same class as the OPEN row field3d_sliders_panel_top12_vs_fsbtn_top10, on the other renderer.',
 'Rule 34d -- any renderer-created fixed overlay in a top corner must start at top:52px or below, on BOTH edges (#fsTopControls right, #simPenBar left). A chrome-overlap assertion belongs in THE EYE against the BUILT review page, not in per-concept review.',
 'js_eval',
 'Playwright: getBoundingClientRect of #pm-sliders (in-iframe, offset by the iframe box) vs the chrome Full-screen / Widgets / pen-bar buttons; FAIL on any intersection area > 0.',
 'OPEN',
 ARRAY['wheatstone_bridge','ohms_law','combination_of_resistors','kirchhoff_junction_rule_KCL','kirchhoff_loop_rule_KVL','emf_definition','internal_resistance','electrical_power_in_resistor','resistivity','drift_velocity','meter_bridge'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 2 ── MAJOR. Explore state prints a measurement that is false off-balance. ───
('bridge_s_readout_unguarded_prints_false_measurement',
 'wheatstone_bridge: show_s_readout prints S = R*(Q/P) unconditionally, so the explore sandbox displays a "measured" unknown that is flatly wrong away from balance -- canvas shows an S = 18.0 ohm chip beside an arm labelled S = 11 ohm with the ratio HUD reading unbalanced (P=27,Q=27,R=18,S=11)',
 'MAJOR', 'alex:json_author',
 'The sibling i_g=0 label is gated on bp.balanced twenty lines earlier; the S readout was written without the same guard, and the JSON enabled it on the all-sliders explore state where a teacher can break balance at will.',
 'A derived quantity valid only under a condition must be gated on that condition at the draw call, and must never be authored onto a state where the condition is teacher-breakable. Content mitigation: show_s_readout:false on the explore state. Structural fix: the bp.balanced guard (engine).',
 'js_eval',
 'Sweep the explore-state integer slider grid; assert show_s_readout renders only when |P/Q - R/S| is inside tolerance, and that the printed value never disagrees with the S arm label.',
 'OPEN', ARRAY['wheatstone_bridge'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 3 ── MAJOR. Two tolerances for one physical fact. ──────────────────────────
('bridge_two_tolerances_ig_zero_claimed_while_beads_flow',
 'wheatstone_bridge: the ratio HUD and the literal "i_g = 0" label gate on |P/Q - R/S| < 0.01 while drawBridgeWireBeads early-outs on |V_B - V_D| < 1e-4 -- 1220 reachable integer slider tuples print "i_g = 0" and a green tick while current beads are visibly streaming down the B-D chord (e.g. P=5,Q=13,R=3,S=8,eps=10V: ratio gap 0.0096, delta-V 0.0505V)',
 'MAJOR', 'alex:json_author',
 'Two independent tolerances on two different physical quantities (a dimensionless ratio gap vs a voltage) gate two surfaces that assert the same fact. Reachable only via the explore sliders -- the scripted states S1-S4 land on exact balance, so guided teaching is unaffected.',
 'One predicate per physical fact: every surface asserting "balanced" must read the same boolean. Author the tolerance so the ratio gate is strictly tighter than the visual-current gate.',
 'js_eval',
 'Enumerate the explore integer slider grid; FAIL on any tuple where the balanced predicate is true and the bead-render predicate is also true.',
 'OPEN', ARRAY['wheatstone_bridge'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 4 ── MODERATE. Rule-29 dimming applied to an opaque backing fill. ──────────
('pf_resistor_body_transparent_under_dim_wire_shows_through',
 'particle_field drawResistorBoxC fills the body at alpha 235*dim, so with any glow_focal other than "resistors" (dimLevel 0.35) the arm wire draws visibly THROUGH the resistor zigzag -- wheatstone_bridge S1-S4 all render resistors with a diagonal wire crossing the symbol; only the focal-free explore state renders correctly',
 'MODERATE', 'peter_parker:renderer_primitives',
 'Rule-29 brightness dimming was applied to the symbol''s opaque backing fill as well as to its stroke, so emphasis dimming degrades symbol correctness rather than just prominence.',
 'Rule 29 dims STROKE and TEXT brightness only; an occluding backing fill that establishes symbol correctness must stay opaque at every dim level. A circuit diagram never draws a wire through a resistor body.',
 'js_eval',
 'Sample the pixel run along each arm wire inside the resistor box bounds; FAIL if wire-colour pixels are detectable inside the box on any state.',
 'OPEN',
 ARRAY['wheatstone_bridge','combination_of_resistors','kirchhoff_junction_rule_KCL','kirchhoff_loop_rule_KVL','meter_bridge'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 5 ── MAJOR. A corner chip cannot carry focal prominence. ───────────────────
('pf_formula_surface_monospace_corner_chip_as_declared_focal',
 'particle_field #pm-formula is 12px ui-monospace at right:12px/bottom:12px -- 83x34px, about 0.43 percent of the canvas; wheatstone_bridge STATE_4 declares glow_focal:"formula", so the state''s focal element is the smallest thing on screen while the galvanometer its narration names is dimmed to 0.35',
 'MAJOR', 'peter_parker:renderer_primitives',
 'The formula overlay was built as a corner annotation and never upgraded to the Rule-34b dedicated math-serif surface that field_3d received; nothing stops a concept declaring it the glow focal, and doing so dims the element the narration actually points at.',
 'Rule 34b -- the single formula surface renders in a math-serif Unicode face at a size proportional to its role, and any surface eligible as a glow_focal must be able to carry focal prominence. No state may dim an element its own narration names.',
 'manual',
 'For every state with glow_focal:"formula", assert the formula surface area exceeds a floor fraction of canvas and that no element named in that state''s narration renders at dimLevel.',
 'OPEN',
 ARRAY['wheatstone_bridge','ohms_law','combination_of_resistors','kirchhoff_loop_rule_KVL'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 6 ── MAJOR. The null method has no unknown to find. ───────────────────────
('bridge_unknown_arm_labelled_with_its_answer_from_state_1',
 'wheatstone_bridge: drawResistorBoxC unconditionally prints the arm value, so "S = 6 ohm" is on canvas in all five states -- STATE_4 then narrates "the unknown resistor works out to six ohms" and pops an S = 6.0 ohm chip 130px below a label already reading S = 6 ohm; the mastery claim "find an unknown resistance" is never staged',
 'MAJOR', 'alex:architect',
 'No per-arm label-suppression affordance exists, so a null-method concept cannot hide the quantity the null is supposed to reveal. Recurrence of the OPEN class teach_do_not_prespoil_a_later_reveal.',
 'A concept whose payoff is measuring an unknown must be able to render that arm as "S = ? ohm" until the reveal state; check the pre-spoil at design time.',
 'manual',
 'For any concept declaring a measured-unknown aha, assert the unknown''s numeric value is absent from every frozen frame before the reveal state.',
 'OPEN',
 ARRAY['wheatstone_bridge','meter_bridge','potentiometer'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 7 ── MODERATE. The aha state dims its own evidence. ───────────────────────
('bridge_misconception_counter_dimmed_and_unnumbered',
 'wheatstone_bridge STATE_3 (PRIMARY aha): misconception_watch promises "arm streams keep flowing at 0.2 A and 0.67 A", but glow_focal:"galvanometer" dims the arm beads and resistors to 0.35 and neither current value is printed anywhere on canvas -- the refutation of the concept''s headline misconception is the dimmest, least legible thing in the state',
 'MODERATE', 'alex:json_author',
 'The glow focal was chosen for the needle (the effect) rather than for the evidence the state''s misconception counter depends on, and visual_counter prose was authored describing numbers no surface renders.',
 'Rule 16a -- every misconception_watch.visual_counter must name only elements that are (a) rendered and (b) not dimmed in that state; a promised number must have a surface.',
 'js_eval',
 'Cross-check each visual_counter string against the state''s rendered element set and glow_focal; FAIL on any named element resolving to dimLevel or to no surface.',
 'OPEN', ARRAY['wheatstone_bridge'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 8 ── MODERATE. The orientation state is a still diagram. ──────────────────
('bridge_state1_fourteen_second_still_diagram',
 'wheatstone_bridge STATE_1: canvas pixel delta t0 to late (6.1s) is 1.52 percent (bead drift only) vs 6.2 percent for S2/S3 -- the narration names battery, node A, P, Q, R, S, node C, meter, B and D in sequence and not one is emphasised in turn; glow_focal:"junction" holds node A lit for the whole 14s while the meter s1_2 names is dimmed to 0.35',
 'MODERATE', 'alex:json_author',
 'The topology hook was authored as a single static tableau with no staged reveal, repeating the FIXED class pm_state1_hook_zero_motion_full_duration.',
 'Rule 31 no-static-state -- an orientation state stages its named objects in narration order using the existing clock-driven reveal pattern; ambient particle drift is not motion.',
 'js_eval',
 'Canvas-only pixel diff between the state''s t0 and late frames; FAIL when the delta is within noise of a pure-ambient-drift baseline.',
 'OPEN', ARRAY['wheatstone_bridge'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 9 ── MODERATE. Battery symbol illegible and colliding with its own label. ──
('bridge_battery_symbol_hairline_and_label_collision',
 'wheatstone_bridge: drawBridgeBattery draws the + plate to by+15 and the eps label at by+12 CENTER/TOP, so the plate line cuts through the "eps = 6.0 V" string; the cell is about 30px tall, carries no +/- marking, renders at 0.35 dim in S1/S4, and a current bead lands on the + plate',
 'MODERATE', 'peter_parker:renderer_primitives',
 'Plate extent and label origin were chosen independently; no clearance was reserved between the symbol''s bounding box and its value label, and the bead lane was not excluded around the cell. Partial recurrence of combo_cells_bank_illegible_scale_no_standard_symbol (the long-thin/short-thick convention IS correct here -- this is scale and collision, not wrong symbology).',
 'Rule 34d -- a symbol and its value label reserve disjoint boxes; the source symbol is drawn at a size a teacher can read at projection distance and marks its polarity.',
 'manual',
 'Assert no stroke primitive intersects a text bounding box on the canvas; assert the cell symbol height exceeds a legibility floor.',
 'OPEN',
 ARRAY['wheatstone_bridge','combination_of_cells','meter_bridge'],
 ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident');
