/**
 * engine_bug_queue — the `vector_products_in_space` gate rounds (2026-08-09).
 *
 * TWENTY rows authored across four dispatches and TWO EYE walks, none of which
 * were ever seeded: every dispatch carried "no DB writes", so they existed only
 * inside agent reports. Verified before writing this: the live queue held 7 rows
 * for this concept and ALL were FIXED — none of the below was in it.
 *
 * WHY THIS MATTERS BEYOND HOUSEKEEPING. Every MAJOR finding in both EYE walks is
 * the same shape — A TEXT SURFACE THAT DISAGREES WITH THE PICTURE BESIDE IT.
 * None was a rendering failure; all were claims. 570 headless assertions and a
 * "35 passed" headline were structurally blind to every one of them. That class
 * is the durable output of this wave and it belongs in the queue, not in a log.
 *
 * ⚠ ONE STATUS IS CORRECTED HERE, DELIBERATELY. The field3d-surgeon filed
 * `eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass` as FIXED
 * after registering the `vg` motion expectations. The SECOND EYE walk then found
 * D5 still "Skipped — motion expectation unknown" on all eight states. The fix
 * did not take, so the row is seeded OPEN. A row is FIXED when the product has
 * the thing it describes — not when a change intended to deliver it has landed.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vector_products_gate_rounds.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-09_vector_products_gate_rounds';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author' | 'alex:mathematics_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const R = 'src/lib/renderers/field_3d_renderer.ts';
const GATE = 'src/scripts/check_vector_geometry_3d.ts';
const DERIVE = 'src/lib/validators/visual/deriveStateMeta.ts';
const C = ['vector_products_in_space'];

const rows: Row[] = [
  // ───────────────── FIXED by PR #78 / #79 ─────────────────
  {
    bug_class: 'field3d_vg_a_value_surface_can_disagree_with_the_geometry_it_names',
    title: 'Three vg text surfaces made claims about geometry they did not read from (readout label, slider row, readout timing)',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      '(a) VG_READOUT_LABEL.cross_mag was the hardcoded literal "|a x b|" while the cross sprite one namespace away already derived its name from flip_frac, so on the ORDER-MATTERS state the picture read b x a and the number beside it read |a x b|. (b) vgAnimValue resolves a knob as a pure function of state-local ms and never wrote the slider row, so a state ramping b_mag 2.00->2.50 left its own live row frozen at 2.00 with the thumb at t=0. (c) value_readouts rendered unconditionally, so Volume/Base/Height printed at t=0 -- 4.6 s before c appeared and 8.2 s before the solid was built; the same gate also fixed STATE_4, which printed a.(a x b) = 0.00 for 7.5 s before the arrow existed to be perpendicular to anything. All three were invisible to 475 headless assertions and to a 35/35 deterministic EYE pass, because in every case the NUMBER was correct.',
    prevention_rule:
      'A surface that NAMES or MEASURES a thing derives from the same value the thing is drawn from -- never a compile-time constant, never a value written once at state entry, never before the thing exists. SIBLING SURFACES OF ONE FIXED DEFECT ARE FIXED IN THE SAME PASS: when a defect is fixed on one surface, grep every other surface carrying the same claim in the same state before closing it.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d sections 17/18/19 against the SHIPPED frame driver with a DOM registry: readout text at flip_frac 0/0.5/1 names the same arrow the sprite does; the row label at 7 sampled ms equals the value the geometry is built from with drag-seize preserved; no readout row is present in the panel HTML before its subject reveal fraction reaches 1.',
    status: 'FIXED', concepts_affected: C, fixed_in_files: [R, GATE], row_type: 'incident',
  },
  {
    bug_class: 'field3d_vg_overlay_relocation_moved_the_collision_instead_of_removing_it',
    title: 'An overlay moved out of one occupied corner into another occupied corner, because the destination was enumerated by hand',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      '#vg_sliders was moved off #formula_overlay to bottom:12/left:12 to fix an earlier collision. The destination was enumerated by hand in a code comment (#vg_readout is top-anchored, #simPenBar is at top:10) and asserted exhaustive. #legend is fixed bottom:8/left:8 at the SAME z-index 10 with max-width 280, sharing 304px of width on the same bottom edge, and was never named -- so on both slider states a slider track struck through the state-label card. Recurrence of the OPEN scar call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep, in layout.',
    prevention_rule:
      'A panel is placed against a PARSED set, never a remembered one, and a collision is REMOVED rather than relocated where a rule already says the other occupant does not belong (Rule 24: a scenario that labels its own objects suppresses the generic legend). Every position:fixed surface -- shell CSS and dynamically created panels alike -- must be classified by the gate, and an unclassified one fails.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d section 21 parses every position:fixed rule from the emitted style block (with ${...} interpolations neutralised -- a naive brace match silently loses #legend) plus every dynamically created panel paired to its own id assignment; 174 classified today. Negative controls: an unsuppressed #legend is reported, the hand enumeration is re-run and shown to miss it, and a panel moved back to bottom-right is reported.',
    status: 'FIXED', concepts_affected: C, fixed_in_files: [R, GATE], row_type: 'incident',
  },
  {
    bug_class: 'field3d_vg_split_detaches_the_base_face_so_base_times_height_is_unreadable_as_one_solid',
    title: 'A decomposition threw the extracted base farther than the body is wide, reading as loss rather than as base x height',
    severity: 'MODERATE', owner_cluster: 'alex:json_author',
    root_cause:
      'The concept authored split_gap_k = 1, and the offset is k*(b+c) where |b+c| = 3.93 -- farther than |b| = 2.5 or |c| = 2.0, so the base travelled farther than the body is wide. Two of the three sub-claims in the visual report were REFUTED on measurement: the slide is exactly IN the base plane ((b+c).n_hat = 1.1e-16, deliberate -- an exploded lift along n would add the gap to the on-screen height while the readout prints h), and the silhouette shrink is CORRECT (the oblique solid becomes the right prism of the same base and height; that shrink IS the lesson). Only the gap was real.',
    prevention_rule:
      'A decomposition gap is measured as OVERLAP of the extracted piece against the body silhouette, not as centroid separation: 0.35 leaves 54 percent of the base still inside the solid while 0.6 leaves 20 percent. Note k = 1 is exactly the TANGENCY value, because the offset is k*(b+c) and |b+c| IS the base parallelogram own diagonal -- the knob has a natural geometric meaning and authored values should be read against it.',
    probe_type: 'js_eval',
    probe_logic: 'Rasterise the extracted base against the projected prism silhouette at the authored camera; assert residual overlap between 10 and 30 percent and travel below the body widest edge.',
    status: 'FIXED', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'eye_capture_ms_pins_the_baseline_at_a_mid_state_hold_so_the_second_half_of_the_claim_is_unbaselined',
    title: 'A frozen pin landed on the zero beat, so the baseline archived the half of the state that was not its lesson',
    severity: 'MAJOR', owner_cluster: 'alex:json_author',
    root_cause:
      'STATE_3 teaches that the dot product is zero at 90 degrees AND NEGATIVE BEYOND IT, and authored eye_capture_ms 11500 against an animation end of 22400 -- so the frame that would be locked as the H2 baseline showed the zero and never the reversal. Fixed to 23000; the pin now archives theta = 130 and a.b = -3.86 (6 cos 130 = -3.857).',
    prevention_rule:
      'eye_capture_ms is derived from the animation end, never from the beat the author finds most photogenic. Where a state teaches a SEQUENCE of claims, the pin lands past the LAST of them.',
    probe_type: 'js_eval',
    probe_logic: 'For every state, assert eye_capture_ms is greater than the last animate[] window end; report any pin that lands inside a hold that precedes a later beat.',
    status: 'FIXED', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'vg_s1_theta_label_renders_before_its_arc_and_holds_for_18s_without_it',
    title: 'A label appeared 18 seconds before the primitive it names',
    severity: 'MODERATE', owner_cluster: 'alex:json_author',
    root_cause:
      'STATE_1 drew the theta glyph alone on an otherwise empty canvas at t=0 and did not open its arc until 18400 ms of a 22 s state. Delaying the label was not authorable: the sprite gates on show_angle_arc only and fires at frame 0 regardless of arc_reveal_frac, so the ramp was dropped instead and the arc now rides the shared grow-in.',
    prevention_rule: 'A label appears with the primitive it names. Where the renderer gates a label on a boolean rather than a reveal fraction, the fix is to remove the ramp, not to delay the label.',
    probe_type: 'js_eval',
    probe_logic: 'For each state, assert no label primitive is visible at a time when its tracked object reveal fraction is 0.',
    status: 'FIXED', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },

  // ───────────────── STILL OPEN — the concept is banked with these live ─────────────────
  {
    bug_class: 'field3d_vg_slider_range_is_concept_wide_so_a_guided_state_cannot_bound_its_own_control',
    title: 'A guided state at a fixed camera inherited the sandbox slider range, so 47 percent of its control travel drove the picture off frame',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'vgSc reads config.slider_controls, which is CONCEPT-WIDE, and there was no per-state override. The cross-product-area state is camera_mode "authored" at a fixed R=16 and exposes b_mag, whose concept-wide range is 1.0-5.0 step 0.25 = 17 detents. Measured at the state OWN authored camera, FOV 60 / 16:9: 9 of 17 detents put the a x b tip OR ITS LABEL outside the frustum, on the state whose entire claim is that the arrow LENGTH IS THE AREA. The design was verified over the authored RAMP [2.0,2.5] and never over the live SLIDER range -- the worst-case law applied to a subset of what moves.',
    prevention_rule:
      'A control range is a CAMERA CLAIM. Every state exposing a live row at a fixed camera is swept over EVERY DETENT that row can reach, not over the authored ramp, and the sweep projects the LABEL as well as the object -- at 3.00 the label centre projects to NDC 1.0158 while the arrow tip is still on frame, so a tip-only sweep green-lights a clipped name. A guided state bounds its own row with vg.control_ranges, and the bound may never exclude the state own authored value or either end of its ramp (widen and PUBLISH instead of clamping silently).',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d section 20: enumerate every detent of the RESOLVED range and project the quad, the a x b tip AND the tip label quad through the shipped vgProjectPoint at the STATE own authored camera; assert zero off-frame. Negative controls: the concept-wide range leaves 9 of 17 off frame, and an auto_frame camera CANCELS the taught growth (screen arm ratio 1.0000 while the true length grows 1.25x).',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [R, GATE], row_type: 'incident',
  },
  {
    bug_class: 'eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass',
    title: 'D5 was Skipped on all eight states and the EYE run still headlined 35/35 — and the registration fix did NOT take',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'deriveMotionExpectations had no entry for vector_geometry_3d, so every state resolved to undefined and pixelGate emitted D5 as passed with evidence "Skipped -- motion expectation unknown"; visual_eyes aggregates those skips into the pass count, so a scenario with ZERO motion coverage reported a full deterministic pass (9 of the 35 were skips: 8x D5 plus H2). STATUS CORRECTED 2026-08-09: a vg entry WAS added and the SECOND EYE walk found D5 still skipped on all eight states, so the fix did not take. Unverified hypothesis from the walk: visual_eyes.ts:68 feeds deriveMotionExpectations(cached.physics_config) while the sibling reveal/hold derivations at :84-85 feed conceptJson ?? cached.physics_config, so the siblings resolve and this one does not.',
    prevention_rule:
      'A gate that is SKIPPED is not a gate that passed. Every new scenario_type registers in deriveMotionExpectations in the SAME change as its builder, and the registration is verified by an EYE run that shows D5 RUNNING -- not by the presence of the code. Separately, the EYE headline must report skips distinctly from passes; a run whose motion gate never executed cannot honestly read 35/35.',
    probe_type: 'js_eval',
    probe_logic: 'After any visual:eyes run, count D5 lines whose evidence contains "Skipped"; refuse the summary if any state with a non-empty animate[] is among them.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [DERIVE, GATE], row_type: 'incident',
  },
  {
    bug_class: 'vg_flip_state_draws_two_equal_magnitudes_at_unequal_screen_lengths',
    title: 'The order-contrast state renders |a x b| and |b x a| — equal by definition — at 275 px and 182 px',
    severity: 'MAJOR', owner_cluster: 'alex:architect',
    root_cause:
      'STATE_6 teaches b x a = -(a x b): SAME LENGTH, opposite direction. At its authored pose (az 90 / el 30 / R 16) the +y arrow tip sits 13.94 units from the camera and the -y tip 20.06, so perspective renders them 275 px and 182 px -- a ratio of 0.662, the second arrow 34 percent shorter -- and the frozen baseline archives the short one. THE cross_mag LABEL FIX IS WHAT MADE THIS LEGIBLE: before it both readouts printed |a x b| so nobody would compare them; now one reads |b x a| = 6.50 beside a visibly shorter arrow. Fixing one truth-surface exposed the one beneath it.',
    prevention_rule:
      'A state whose taught claim is an EQUALITY of two magnitudes must be scored on the projected SCREEN length of both at the authored camera, not on their world lengths -- an angular-separation solve with a length floor has no term that can see this. Measured escape routes, neither free: R ~100+ or elevation ~2 degrees (the a-b plane is the xz-plane, so low elevation is edge-on). The third option is a design decision: accept the foreshortening and let the readout carry the claim, which is consistent with the standing invariant that every geometric claim carries a 3D-computed number.',
    probe_type: 'js_eval',
    probe_logic: 'For any state asserting an equality of two drawn magnitudes, project both at the authored camera and assert their screen-length ratio is above 0.95.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'vg_camera_solve_frames_the_figure_at_one_sixth_of_canvas_width',
    title: 'A camera solve scored only on separation and a length floor leaves the drawn figure at 11-17 percent of frame width',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'Every guided state places the origin at exact frame centre with all content growing right and down, so the left ~48 percent of the canvas is permanently empty and the drawn figure spans 11-17 percent of the 1280 px frame (S4 12 percent, S6 11 percent). The camera solve has terms for pairwise separation and a screen-length floor but NO FILL TERM, so a pose can be simultaneously correct and tiny. Not fixable without an authorable camera TARGET -- see the OPEN row field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable.',
    prevention_rule: 'A camera solve carries a bound on the drawn content bounding box as a fraction of frame AND on the empty margin, or every pose it certifies is also a small one.',
    probe_type: 'js_eval',
    probe_logic: 'Project every rendered vertex at the authored camera; assert the content bbox spans at least a declared fraction of frame width and that no single margin exceeds a declared share.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'vg_state_1_hud_prints_magnitudes_before_either_vector_exists',
    title: 'A reveal-gate fixed on the state that reported it was not applied to the state one earlier',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The value_readouts reveal-gate shipped for STATE_7 and STATE_4, but STATE_1 still prints |a| = 3.00 and |b| = 2.00 at t=0 beside a lone theta glyph, before either vector is drawn.',
    prevention_rule: 'When a gate is added to a readout set, it is applied to EVERY state readout set in the same dispatch -- a gate fixed on the state that reported it and skipped elsewhere ships the same defect one state earlier.',
    probe_type: 'js_eval',
    probe_logic: 'Assert no readout row is present in the panel HTML at any ms before its subject reveal fraction reaches 1, across ALL states.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'vg_decomposition_pieces_lose_their_names_when_the_legend_is_suppressed',
    title: 'Suppressing the generic legend left the taught objects with no on-canvas label at all',
    severity: 'MODERATE', owner_cluster: 'ambiguous',
    root_cause:
      'The legend was removed for this scenario to end a corner collision (correct -- removing beats relocating). But STATE_7 base quad and height segment, and STATE_5 parallelogram -- whose entire claim is "this area is |a x b|" -- now carry no on-canvas label, and the only naming is a corner readout card.',
    prevention_rule: 'Suppressing a legend is only safe when every element it named carries its own on-canvas label. Diff the legend key set against the labelled-element set BEFORE removing it.',
    probe_type: 'js_eval',
    probe_logic: 'For a scenario suppressing the generic legend, assert every element the legend would have named has either its own label primitive or an authored sprite.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'vg_theta_readout_rounds_to_integer_degrees_while_its_product_uses_the_unrounded_angle',
    title: 'Two numbers on screen beside their own formula do not satisfy it at the displayed precision',
    severity: 'MODERATE', owner_cluster: 'ambiguous',
    root_cause:
      'theta prints as an integer while a.b is computed from the unrounded angle: STATE_2 t=8000 shows theta = 47 and a.b = 4.07, but 6 cos 47 = 4.09. STATE_3 t=17000 shows 100 and -1.03 against -1.04; t=20000 shows 121 and -3.12 against -3.09. A teacher checking the formula on screen finds it does not close.',
    prevention_rule: 'Two numbers rendered beside their own formula must satisfy that formula AT THE DISPLAYED PRECISION -- either raise the angle precision or derive the product from the rounded value.',
    probe_type: 'js_eval',
    probe_logic: 'For every state rendering a formula and its operands, recompute the formula from the DISPLAYED operand strings and assert it matches the displayed result.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'vg_projection_label_overprints_the_theta_arc_and_the_vertex',
    title: 'A label obstacle set covering text and panels does not cover strokes, so a label lands on the arc it measures against',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'The |b| cos theta label renders directly on the theta arc stroke at the vertex in STATE_3 (t=17000, t=20000 and the FROZEN frame that would become the H2 baseline) and on the a x b shaft in STATE_8.',
    prevention_rule: 'A label obstacle set includes the arc stroke and every shaft passing through the vertex, not only text and panels. A collision present on the frozen frame is a collision baked into the baseline.',
    probe_type: 'js_eval',
    probe_logic: 'Project every label quad and assert zero intersection with any drawn stroke polyline at the pinned frame.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'visual_eyes_d7_passes_a_state_that_never_moved_at_all',
    title: 'The stuck-tail gate cannot fail a wholly static state, because its precondition is earlier motion',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'STATE_8 is byte-identical across all 18 dense frames and 5 keyframes, and D7 passes it with the evidence "no frozen tail (last 3 pairs not all <0.1% AFTER EARLIER MOTION)" -- it passes because there was never any motion to die. Rule 37 requires the interaction_complete state to keep moving; whether a teacher drag animates it is not verifiable from frames either way.',
    prevention_rule: 'A zero-motion series routes to a distinct verdict, never to the stuck-tail gate OK. A precondition of "after earlier motion" makes the wholly static case unfailable.',
    probe_type: 'js_eval',
    probe_logic: 'If every adjacent frame pair in a state series is below the noise floor, emit a distinct STATIC verdict rather than passing D7.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'engine_bug_queue_filters_are_blind_to_subject_subdirectories',
    title: 'query_engine_bug_queue --field3d and --scenario cannot see concepts/mathematics/ or concepts/chemistry/',
    severity: 'MODERATE', owner_cluster: 'peter_parker:runtime_generation',
    root_cause:
      'loadConceptIndex in query_engine_bug_queue.ts does a NON-RECURSIVE readdirSync over src/data/concepts, so every subject-namespace concept is invisible to the derived fleet: --field3d omits this concept entirely and --scenario vector_geometry_3d hard-exits with "no concept declares scenario_type". The file own header already records a 2026-08-02 scar that a blind fleet list is a FALSE ALL-CLEAR; this is the same class reintroduced through a directory the derivation cannot walk. It is also the concrete mechanism behind the finding that a defect CLASS does not respect renderer boundaries: a row filed against a PCPL concept never surfaces for a field_3d dispatch.',
    prevention_rule:
      'Concept-index derivation walks subdirectories. And a subject- or renderer-FILTERED scar query is a claim about relevance: an engine dispatch queries its filter AND sweeps the table unfiltered for the CLASS it is about to build against.',
    probe_type: 'js_eval',
    probe_logic: 'Assert loadConceptIndex returns every concept under src/data/concepts including subject subdirectories; assert --scenario resolves a scenario_type authored only by a subject-namespace concept.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'onframe_gate_projects_no_sprite_labels_and_uses_a_solver_pose_not_the_states_own',
    title: 'The on-frame gate would have green-lit a control range that clips the arrow own name',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'check_vector_geometry_3d section 20 derives its camera from vgAutoFramePos rather than the state authored camera, and scores off-frame on the arrow tip and parallelogram vertices only -- it never projects the label. It therefore reports the widest on-frame detent as |b| = 3, while at the shipped state authored camera the label centre at 3.00 projects to NDC 1.0158 and the true answer is 2.75.',
    prevention_rule: 'An on-frame gate projects EVERY RENDERED element including sprite labels, at the STATE own camera, never at a solver-derived one. A gate that measures a different camera from the one that ships is measuring a different sim.',
    probe_type: 'js_eval',
    probe_logic: 'Assert section 20 resolves its pose via vgCamBaseFromState on the state block and includes label quads in the off-frame set.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'vg_explore_state_is_a_still_picture_for_its_entire_captured_life',
    title: 'The interaction_complete sandbox authors no continuous beat, so it is static until dragged',
    severity: 'MODERATE', owner_cluster: 'alex:json_author',
    root_cause:
      'All 18 dense frames and 5 keyframes of STATE_8 are byte-identical. Rule 37 requires the explore state to keep moving -- the player skips the freeze for interaction_complete precisely so the motion loops -- but this scenario authors no idle beat, so the sandbox is a still photograph until a teacher drags. Not verifiable from frames either way; flagged rather than passed.',
    prevention_rule: 'An interaction_complete state authors a continuous idle beat (a slow turn, a looping phase) so Rule 37 free-run has something to run, and so the headless gate can see motion the teacher would see.',
    probe_type: 'js_eval',
    probe_logic: 'Assert the explore state has either a non-empty animate[] or an idle sweep; assert its dense series is not byte-identical across all frames.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'skeleton_dod_declares_rendered_strings_the_shipped_engine_cannot_draw',
    title: 'A Definition of Done named three on-canvas strings with no renderer path, and carried stale derived numbers',
    severity: 'MODERATE', owner_cluster: 'alex:architect',
    root_cause:
      'The skeleton section 10b declares a b x c label, an "Area = 6.50" string inside the quad, and a direction +y/-y HUD token -- none of which the engine can render (there is exactly one cross arrow, vg_cross_vector = a x b, and no direction token exists in VG_READOUT_LABEL). Two of the three are undocumented as substitutions. Its Base 4.25 / Height 2.34 are also stale: the measured-correct values are 4.27 / 2.33, and the skeleton triple sits exactly on the 2-dp rounding boundary and cannot close.',
    prevention_rule: 'Every string a Definition of Done declares is checked against a rendering path before the DoD is written, and every derived number is stated at the precision the sim will print, computed from the authored inputs -- never hand-rounded to a nicer value.',
    probe_type: 'manual',
    probe_logic: 'Grep each DoD-declared on-canvas string against the renderer element and label token sets; recompute every derived DoD number from the authored inputs at display precision.',
    status: 'OPEN', concepts_affected: C, fixed_in_files: [], row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-09 — vector_products_in_space gate rounds: ${all.length} rows authored across four\n` +
    `-- dispatches and TWO EYE walks, none previously seeded (every dispatch carried "no DB writes").\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vector_products_gate_rounds.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-09_seed_engine_bug_queue_vector_products_gate_rounds_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  const open = rows.filter((r) => r.status === 'OPEN').length;
  console.log(`✓ upserted ${payload.length} row(s) — ${rows.length - open} FIXED, ${open} OPEN`);
}

main();
