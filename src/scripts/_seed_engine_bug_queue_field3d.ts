/**
 * Seed engine_bug_queue with the field_3d diamond run's bug/scar ledger
 * (electrostatics + magnetism), mined from recorded sources: deriveStateMeta.ts +
 * field_3d_renderer.ts comments, PROGRESS.md, docs/notes/*-pass2-notes.md, git
 * fix-commits. One row per bug CLASS (not per occurrence), tagged with the concept
 * name(s) in concepts_affected.
 *
 * row_type:
 *   incident  — a real observed defect (engine/render/visual), status FIXED unless noted.
 *   directive — a teaching-methodology lesson the architect/physics_author read BEFORE
 *               authoring (probe_type='manual'; needs the directive row_type ALTER first —
 *               see supabase_2026-06-25_engine_bug_queue_directive_rowtype_migration.sql).
 *
 * Idempotent: upsert onConflict 'bug_class'. Incidents land headlessly now; directives
 * land once the ALTER is applied in the Supabase SQL editor (safe to re-run).
 *
 * Also (re)writes the archival SQL migration so the repo carries the canonical record:
 *   supabase_2026-06-25_seed_engine_bug_queue_field3d_diamonds_migration.sql
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_field3d.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-25_field3d_diamonds';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string;
  title: string;
  severity: Severity;
  owner_cluster: Owner;
  root_cause: string;
  prevention_rule: string;
  probe_type: ProbeType;
  probe_logic: string;
  status: Status;
  concepts_affected: string[];
  fixed_in_files: string[];
  row_type: RowType;
}

const R = 'peter_parker:renderer_primitives';
const JA = 'alex:json_author';
const RG = 'peter_parker:runtime_generation';
const VV = 'peter_parker:visual_validator';
const AR = 'alex:architect';
const PA = 'alex:physics_author';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const META = ['src/lib/validators/visual/deriveStateMeta.ts'];

const incidents: Row[] = [
  // ── gauss_law_sphere ──────────────────────────────────────────────────────
  { bug_class: 'field3d_scenario_missing_devstatemeta_recognition', title: 'New field_3d scenario keys not recognised by deriveStateMeta → THE EYE mis-classifies reveal/hold/motion (false D7/D1p)', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'A new field_3d scenario\'s per-state gauss_sphere keys were not recognised in maxRevealForField3dState/deriveHoldExpectations, so every state classified at the 1500ms default and false-failed D7/D1p.',
    prevention_rule: 'When you add a field_3d scenario, add its per-state reveal/hold/motion recognition block to deriveStateMeta.ts in the SAME change as the renderer scenario.',
    probe_type: 'manual', probe_logic: 'Run visual:eyes; the new scenario\'s states must classify reveal_hold/interactive (not the 1500ms default) in the Reveal map line.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: META, row_type: 'incident' },
  { bug_class: 'field3d_reveal_too_subtle_fails_d7', title: 'One-shot text/opacity reveal <0.1%/frame → D7 "animation died"', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'A subtle one-shot reveal (equation fade, small-element opacity) moves far less than 0.1% of the canvas, so D7 reads the tail as frozen.',
    prevention_rule: 'A state\'s reveal must either sustain continuous >=0.1%/frame motion OR be declared reveal_hold in deriveStateMeta so D7 relaxes.',
    probe_type: 'js_eval', probe_logic: 'D7 dense-frame check: last 3 adjacent pairs must not all be <0.1% unless the state is reveal_hold/interactive.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: [...RENDERER, ...META], row_type: 'incident' },
  { bug_class: 'field3d_explorer_state_static_d1p', title: 'Explorer/slider state static under headless capture → D1p fail', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'A slider/interaction_complete state with no auto motion shows 0% pixel change under headless capture (the harness never drags).',
    prevention_rule: 'Explorer states need an idle auto-sweep of their key param OR must be classified interactive (hold-intent) in deriveHoldExpectations.',
    probe_type: 'js_eval', probe_logic: 'D1p first-vs-last frame; an explorer state must either be interactive (relaxed) or show motion via an idle sweep.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: [...RENDERER, ...META], row_type: 'incident' },
  { bug_class: 'field3d_time_gated_visual_invisible_in_slider_state', title: 'Time-gated visual invisible in a slider state (clock frozen at the opening frame)', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'A radius line gated on the state-clock emergence ramp stayed at length 0 in STATE_7 because the player freezes the clock at the opening frame and the user drives only the slider — the clock never reached the cue.',
    prevention_rule: 'In slider/interactive states do NOT gate visuals on the state-clock emergence ramp; render at full immediately and track the slider value live.',
    probe_type: 'manual', probe_logic: 'Open the explorer state without pressing play; drag the slider; the slider-driven visual must be present and track immediately.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'field3d_position_vector_foreshortened_3q_camera', title: 'Position/radius vector along a world axis reads diagonal "toward viewer" under a 3/4 camera', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'A radius vector pointed along a fixed world direction; under the 3/4 cameras it foreshortened into a diagonal pointing at the viewer instead of reading horizontal.',
    prevention_rule: 'Position/radius vectors that must read horizontal should billboard to the camera-right vector each frame (screen-horizontal), not a fixed world direction.',
    probe_type: 'manual', probe_logic: 'Inspect a 3/4-camera state; the radius line must read horizontal on screen, not a diagonal into the camera.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'field3d_overlay_line_occluded_over_geometry', title: 'Thin reference line washed out / occluded over a wireframe or translucent sphere', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'A thin white reference line rendered with depthTest on was occluded/low-contrast where it crossed the red shell + blue Gaussian wireframe.',
    prevention_rule: 'Reference overlays that must read over busy 3D geometry use material.depthTest=false + a high renderOrder so they draw on top.',
    probe_type: 'manual', probe_logic: 'Inspect the line where it crosses the sphere; it must read clearly, not be washed out by the geometry behind/over it.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'field3d_oneshot_element_vanishes_after_animation', title: 'One-shot animated element vanishes after the animation instead of holding its end pose', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'STATE_5 Gaussian sphere was animated by a one-shot shrink and then became invisible (opacity/scale fell to 0) instead of holding at its inside end pose.',
    prevention_rule: 'One-shot animated elements must persist visible at their end pose after the animation completes; never let opacity/scale fall to 0 at completion.',
    probe_type: 'manual', probe_logic: 'After the one-shot completes, the element must still be visible at its end pose in the frozen frame.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'field3d_radius_vector_tip_not_tracking_surface', title: 'Slider-driven radius line tip does not land on the live sphere surface', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'A vertical stagger pushed the r-line tip off the equator, so a length-r horizontal line no longer landed on the sphere\'s silhouette edge as r changed.',
    prevention_rule: 'A radius line that must touch a sphere uses length = the live radius and sits near the equator so its tip lands on the silhouette edge across the whole range.',
    probe_type: 'manual', probe_logic: 'Drag the radius slider inside→outside; the line tip + tip-marker must stay on the sphere surface at every value.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'gsph_compare_offset_lt_object_radius', title: 'Side-by-side compare offset smaller than the object radius → groups overlap at centre', severity: 'MAJOR', owner_cluster: JA,
    root_cause: 'STATE_4 compare offsets (±2.2) were smaller than the Gaussian sphere radius (2.4), so the left group crossed centre and crowded the right-side point charge.',
    prevention_rule: 'Side-by-side group offsets must exceed each object\'s visual extent; shrink the groups (compare_scale), widen the offsets, and pull the camera back so the halves are clearly separate.',
    probe_type: 'manual', probe_logic: 'Inspect the compare state; the two groups must sit in clearly separate halves with empty space between, no overlap.', status: 'FIXED', concepts_affected: ['gauss_law_sphere'], fixed_in_files: ['src/data/concepts/gauss_law_sphere.json', ...RENDERER], row_type: 'incident' },
  { bug_class: 'field3d_label_sprite_overlap', title: 'Two 3D sprite labels placed too close overlap (Gaussian-sphere vs charged-shell top labels)', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The "Gaussian sphere, radius r" and "charged shell, radius R" top labels are placed close enough that they slightly overlap.',
    prevention_rule: 'Stack/space 3D sprite labels with adequate vertical separation so no two labels overlap.',
    probe_type: 'manual', probe_logic: 'Inspect the top labels; no two label sprites should overlap.', status: 'OPEN', concepts_affected: ['gauss_law_sphere'], fixed_in_files: [], row_type: 'incident' },

  // ── gauss_law ─────────────────────────────────────────────────────────────
  { bug_class: 'gauss_signed_pair_recolored_by_net_not_own_sign', title: 'STATE_5 signed pair: both inner charges recoloured by net sign (the +q should stay red)', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'Dragging the negative charge recoloured the ENTIRE inner charge pair by the net sign; each sphere should keep its own sign colour.',
    prevention_rule: 'Colour each charge sphere and label by its OWN sign; only the field lines follow the net charge direction.',
    probe_type: 'manual', probe_logic: 'Add a −q to a +q; the +q must stay red and the −q blue (only lines follow net).', status: 'FIXED', concepts_affected: ['gauss_law'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'gauss_state1_readout_prespoils_epsilon', title: 'STATE_1 readout pre-spoils ε₀ before STATE_2 introduces it (sequencing / Rule 25)', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'STATE_1 readout showed the full "Φ = q_enc/ε₀" although STATE_2 is the first reveal of ε₀; the base readout wording was not gated on show_equation.',
    prevention_rule: 'Gate readout wording on show_equation: STATE_1 shows "∝ q_enc" (no ε₀); STATE_2 first introduces "= q_enc/ε₀".',
    probe_type: 'manual', probe_logic: 'STATE_1 readout must not contain ε₀; STATE_2 is the first state that shows it.', status: 'FIXED', concepts_affected: ['gauss_law'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'gauss_state5_drag_neg_invisible_no_motion', title: 'STATE_5 narrated "−q grows" but the drag_neg tween was invisible (reads static)', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'The drag_neg_to mechanic changed only the readout + field, with no visible animation of the −q; the narrated change had no on-screen motion.',
    prevention_rule: 'Every narrated change needs a visible animation. Replaced with an add_charge choreography (a 3rd enclosed −q + inward lines fade in).',
    probe_type: 'manual', probe_logic: 'When the narration says a charge appears/grows, a charge sphere must visibly fade/grow in on screen.', status: 'FIXED', concepts_affected: ['gauss_law'], fixed_in_files: [...RENDERER, 'src/data/concepts/gauss_law.json'], row_type: 'incident' },
  { bug_class: 'gauss_surface_morph_must_be_deterministic', title: 'Morphing/blob surface geometry must be deterministic (no per-frame randomness → flicker)', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'A per-frame-randomised blob/morph geometry would flicker and trip D1p/D7 pixel checks.',
    prevention_rule: 'Compute morph/blob geometry once with a deterministic sin/cos basis; never randomise per frame.',
    probe_type: 'manual', probe_logic: 'Two captures at the same sim-time must be pixel-identical for a static morph surface.', status: 'FIXED', concepts_affected: ['gauss_law'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'gauss_outside_charge_flow_true_not_revealhold', title: 'Continuous field-line-flow state must be marked motion, not reveal_hold', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'A flow:true continuous-motion state, if mis-marked reveal_hold, would expect a static tail and could mis-gate.',
    prevention_rule: 'States with flow:true declare continuous motion in deriveMotionExpectations (not reveal_hold); D5/D6/D7 then expect ongoing pixel motion.',
    probe_type: 'manual', probe_logic: 'flow:true states classify as motion-expected, not reveal_hold.', status: 'FIXED', concepts_affected: ['gauss_law'], fixed_in_files: META, row_type: 'incident' },

  // ── electric_flux ─────────────────────────────────────────────────────────
  { bug_class: 'flux_theta_anim_face_accumulate_reveal_hold', title: 'theta tilt sweep + face accumulation are one-shot reveals that hold → need reveal_hold pinning', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The open-surface theta_anim tilt and closed-surface face accumulation complete then hold still; without reveal_hold, D7/D1p false-fail the static tail.',
    prevention_rule: 'Pin maxReveal past the theta_anim/accumulate payoff and mark these states reveal_hold in deriveStateMeta.',
    probe_type: 'manual', probe_logic: 'electric_flux sweep/accumulate states classify reveal_hold and pin past their payoff.', status: 'FIXED', concepts_affected: ['electric_flux'], fixed_in_files: META, row_type: 'incident' },
  { bug_class: 'flux_epsilon0_cutline_inversion_guard', title: 'electric_flux must NOT show ε₀ (net flux ∝ q_enc only); gauss_law deliberately inverts this', severity: 'MODERATE', owner_cluster: JA,
    root_cause: 'electric_flux ends at "net Φ ∝ q_enc" in arbitrary units (no ε₀); gauss_law is the concept that flips the label to "= q_enc/ε₀". Mixing them breaks the teaching cut-line.',
    prevention_rule: 'Keep the cut-line: electric_flux stays ∝ q_enc (no ε₀); only gauss_law writes ε₀ on-canvas from STATE_2.',
    probe_type: 'manual', probe_logic: 'electric_flux on-canvas text contains no ε₀; gauss_law does from STATE_2.', status: 'FIXED', concepts_affected: ['electric_flux', 'gauss_law'], fixed_in_files: RENDERER, row_type: 'incident' },

  // ── charge_distribution ───────────────────────────────────────────────────
  { bug_class: 'cdist_state6_chunks_occluded_by_transparency', title: 'STATE_6 dq chunks dimmed/hidden by transparency render-sort behind the solid', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'dq chunks positioned behind the semi-transparent solid were dimmed/reordered by transparency render-sort.',
    prevention_rule: 'Render accumulation chunks opaque (transparent:false) and position them in front of the body (z > the solid\'s front face).',
    probe_type: 'manual', probe_logic: 'All six STATE_6 chunks visible and crisp on the front face, none dimmed/occluded.', status: 'FIXED', concepts_affected: ['charge_distribution'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'cdist_state6_chunks_arrows_undersized', title: 'STATE_6 dq chunks + dE arrows too small/dim → accumulation aha unreadable', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'Chunks (0.26) and dE arrows (0.9) were too small/dim for the founder visual review.',
    prevention_rule: 'Size accumulation chunks ~0.40 with emissive ~0.9 and dE arrows ~1.2 length with bright heads so the aha reads.',
    probe_type: 'manual', probe_logic: 'STATE_6 chunks + dE arrows are clearly legible at review resolution.', status: 'FIXED', concepts_affected: ['charge_distribution'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'cdist_morph_accumulate_reveal_hold', title: 'rod→sheet→solid morph + dq accumulation are one-shot reveals that hold → need reveal_hold pinning', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The morph cross-fade and dq accumulation complete then hold; without reveal_hold pinning, D7/D1p false-fail the static tail.',
    prevention_rule: 'Pin maxReveal past the morph/accumulate payoff and mark these states reveal_hold.',
    probe_type: 'manual', probe_logic: 'charge_distribution morph/accumulate states classify reveal_hold.', status: 'FIXED', concepts_affected: ['charge_distribution'], fixed_in_files: META, row_type: 'incident' },

  // ── magnetic_field_solenoid ───────────────────────────────────────────────
  { bug_class: 'solenoid_dropped_prediction_pauses_x4', title: 'Four prediction pause_after_ms dropped in the JSON handoff (cross-agent regression)', severity: 'MAJOR', owner_cluster: JA,
    root_cause: 'json_author cloned the electric_flux JSON (which has no predictions) and dropped 4 of 5 prediction pause_after_ms; Gate 3c does not run on field_3d so nothing caught it.',
    prevention_rule: 'When porting a field_3d JSON, carry every pause_after_ms from the physics block; field_3d DOES consume pause_after_ms via deriveStateMeta.',
    probe_type: 'manual', probe_logic: 'Each prediction sentence retains its pause_after_ms per the physics block.', status: 'FIXED', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: ['src/data/concepts/magnetic_field_solenoid.json'], row_type: 'incident' },
  { bug_class: 'solenoid_state2_bare_coil_no_orientation_4s', title: 'STATE_2 bare coil for ~4s before B-circles appear (no orientation cue)', severity: 'MODERATE', owner_cluster: JA,
    root_cause: 'per_turn_field_circles.reveal_at_ms ~4000 left an unlabeled bare coil during the state-entry window.',
    prevention_rule: 'Every non-intro state needs an orientation cue within the first reveal window (~1.5s); lower late reveal_at_ms.',
    probe_type: 'manual', probe_logic: 'STATE_2 shows a meaningful cue within ~1.5s of entry, not a bare coil for 4s.', status: 'FIXED', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: ['src/data/concepts/magnetic_field_solenoid.json'], row_type: 'incident' },
  { bug_class: 'solenoid_state3_annotation_orphaned_from_referent', title: 'STATE_3 labels render at t=0 while their referent arrows reveal 6–8.5s later', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'scene_composition annotations have no reveal timing and render at t=0, but the arrows they describe reveal at 6000/8500ms — the label sits with no referent.',
    prevention_rule: 'Gate annotations to appear WITH their referent arrows (verify the field_3d renderer consumes annotation reveal timing first).',
    probe_type: 'manual', probe_logic: 'A label and the visual it describes appear together, not 6s apart.', status: 'OPEN', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: [], row_type: 'incident' },
  { bug_class: 'solenoid_state4_outside_fade_narrated_not_shown', title: 'STATE_4 "outside ≈ 0" is narrated but no cancellation/fade is shown', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'STATE_4 narrates that the field outside is ~0 but there is no fade/cancellation visual; only sparse static lines.',
    prevention_rule: 'Add an outside-field-fade/cancellation primitive keyed to reveal_at_ms so the "outside ≈ 0" claim is shown, not just said.',
    probe_type: 'manual', probe_logic: 'STATE_4 visibly fades/cancels the outside field; not narration-only.', status: 'OPEN', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: [], row_type: 'incident' },
  { bug_class: 'solenoid_state5_gesture_sequencing_absent', title: 'STATE_5 grip cross-fade narrated but the right-hand does not animate (no gesture sequencing)', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'extras.right_hand applies at state-enter only; there is no delayed/triggered gesture-reveal, so the wire-grip→solenoid-grip cross-fade is a static overlay.',
    prevention_rule: 'Add a gesture-sequencing primitive so the grip animation lands after the prediction pause (reveal after the question).',
    probe_type: 'manual', probe_logic: 'STATE_5 animates the grip transition on cue, not a static hand.', status: 'OPEN', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: [], row_type: 'incident' },
  { bug_class: 'solenoid_state7_hand_flip_unimplemented', title: 'STATE_7 narrates a hand-flip but has no right_hand object / motion primitive', severity: 'MAJOR', owner_cluster: JA,
    root_cause: 'STATE_7 narration promises "watch the hand flip as current reverses" but the state instantiates no hand and no flip motion.',
    prevention_rule: 'Instantiate the hand + flip animation in STATE_7, or do not narrate a visual that is not drawn.',
    probe_type: 'manual', probe_logic: 'STATE_7 shows the promised hand-flip when current reverses.', status: 'OPEN', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: [], row_type: 'incident' },
  { bug_class: 'solenoid_focal_primitive_on_title_not_physics', title: 'focal_primitive_id points at the title label on 7/8 states, not the physics element', severity: 'MODERATE', owner_cluster: JA,
    root_cause: 'focal_primitive_id was placed on the top-centre title because the physics-bearing field_3d elements live outside scene_composition.',
    prevention_rule: 'Point focal_primitive_id at the physics-bearing element per state (or confirm field_3d uses it at all before gating).',
    probe_type: 'manual', probe_logic: 'Each state\'s focal cue lands on the physics element, not the heading.', status: 'OPEN', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: [], row_type: 'incident' },
  { bug_class: 'solenoid_per_turn_circles_reveal_hold', title: 'per_turn_field_circles / coil-morph reveals are one-shot then hold → reveal_hold pinning', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The per-turn field-circle reveal and wire→coil morph complete then hold; without reveal_hold pinning D7/D1p false-fail the tail.',
    prevention_rule: 'Pin maxReveal past per_turn_field_circles / wire_to_coil_morph payoff and mark reveal_hold.',
    probe_type: 'manual', probe_logic: 'solenoid reveal states classify reveal_hold.', status: 'FIXED', concepts_affected: ['magnetic_field_solenoid'], fixed_in_files: META, row_type: 'incident' },

  // ── rhr_force_direction ───────────────────────────────────────────────────
  { bug_class: 'rhr_state5_glyph_force_desync_ignored_per_state_ambient', title: 'STATE_5 ⊗/⊙ glyph and F derived from different B fields → F points opposite to RHR', severity: 'CRITICAL', owner_cluster: R,
    root_cause: 'The frame read the global ambient_field and ignored STATE_5\'s per-state override [0,0,-1]; the glyph char came from the global field while F came from the override (or vice versa), so they desynced.',
    prevention_rule: 'Honour the per-state ambient_field override and derive the glyph char from the SAME bEff used to compute F, so glyph and F can never desync.',
    probe_type: 'manual', probe_logic: 'In every RHR state the ⊗/⊙ glyph sign matches the F direction the right-hand rule gives.', status: 'FIXED', concepts_affected: ['magnetic_force_direction_right_hand_rule'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'rhr_direction_only_hard_cutline', title: 'Direction-only scenario must never show magnitude / r=mv/qB / period / zero-length F stub', severity: 'MAJOR', owner_cluster: JA,
    root_cause: 'A direction-of-F=qv×B concept must teach direction only; showing a magnitude number, orbit radius, period, or a zero-length F at v∥B is off-scope/misleading.',
    prevention_rule: 'Hide F when v∥B (no zero stub); never render a Newton/Tesla magnitude, r=mv/qB, or period T in the direction concept.',
    probe_type: 'manual', probe_logic: 'No magnitude/r/T anywhere; F hidden at v∥B.', status: 'FIXED', concepts_affected: ['magnetic_force_direction_right_hand_rule'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'rhr_reveal_beats_reveal_hold', title: 'RHR reveal gestures (f_appear/show_hand/camera_orbit/glyph_toggle/ghost_f) are one-shot then hold', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The RHR reveal beats complete then hold; without reveal_hold pinning D7/D1p false-fail the static tail.',
    prevention_rule: 'Pin maxReveal past each RHR beat and mark non-slider RHR states reveal_hold.',
    probe_type: 'manual', probe_logic: 'RHR reveal states classify reveal_hold.', status: 'FIXED', concepts_affected: ['magnetic_force_direction_right_hand_rule'], fixed_in_files: META, row_type: 'incident' },

  // ── magnetic_force_perpendicular_no_work ──────────────────────────────────
  { bug_class: 'nowork_state1_trajectory_mode_mismatch_caption', title: 'STATE_1 trajectory_mode "straight" while the caption says "round and round"', severity: 'MODERATE', owner_cluster: JA,
    root_cause: 'STATE_1 set trajectory_mode "straight" but narrates circular motion; the visual contradicts the words.',
    prevention_rule: 'trajectory_mode must match the narrated motion (set "circle" when the narration says it goes round).',
    probe_type: 'manual', probe_logic: 'STATE_1 shows circular motion matching the caption.', status: 'FIXED', concepts_affected: ['magnetic_force_perpendicular_no_work'], fixed_in_files: ['src/data/concepts/magnetic_force_perpendicular_no_work.json'], row_type: 'incident' },
  { bug_class: 'nowork_state5_meters_overlap_caption', title: 'STATE_5 split-screen work/speed meters overlap the bottom-left caption', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'Both meters were at the bottom-left, competing with the caption for space.',
    prevention_rule: 'Place the two comparison meters top-left/top-right above the caption; keep the bottom for the caption.',
    probe_type: 'manual', probe_logic: 'STATE_5 meters and caption do not overlap.', status: 'FIXED', concepts_affected: ['magnetic_force_perpendicular_no_work'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'nowork_generic_legend_on_every_state_rule24', title: 'Generic B-field legend (Red=N/Blue=S/Lines=B) drawn on every state (Rule 24 violation)', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The renderer drew the generic field legend by default on every field_3d state, adding prose-y chrome that violates the silent-visual rule.',
    prevention_rule: 'Suppress the generic legend per scenario (as charge_distribution/electric_flux/gauss_law do); keep on-canvas to labels/equations.',
    probe_type: 'manual', probe_logic: 'No generic legend on the scenario\'s states.', status: 'FIXED', concepts_affected: ['magnetic_force_perpendicular_no_work'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'nowork_hard_cutline_no_magnitude', title: 'No-work scenario must never show force magnitude / r=mv/qB / period; F is direction-only', severity: 'MAJOR', owner_cluster: JA,
    root_cause: 'The direction+no-work concept must not show a force magnitude, orbit radius, or period; F is a fixed-length centripetal glyph hidden at v∥B; B changes orbit tightness only.',
    prevention_rule: 'Enforce the cut-line in the frame: speed meter ties to KE (not force), W pinned 0 (asserted not integrated), never a magnitude number.',
    probe_type: 'manual', probe_logic: 'No magnitude/r/T; F fixed-length; W=0 asserted on the magnetic side.', status: 'FIXED', concepts_affected: ['magnetic_force_perpendicular_no_work'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'nowork_speed_work_meter_flat_vs_rising_contract', title: '|v| meter must hold flat + W pinned 0 on the magnetic side; both rise on the electric side', severity: 'MODERATE', owner_cluster: R,
    root_cause: 'The teaching contract is: magnetic side keeps |v| constant (W=0); electric side speeds up (W>0). A meter that drifts on the magnetic side breaks the proof.',
    prevention_rule: 'Magnetic side: speed meter dead-flat, W pinned 0 (asserted). Electric side: both rise as F·v does work.',
    probe_type: 'manual', probe_logic: 'Magnetic |v|/W flat/0; electric |v|/W rising.', status: 'FIXED', concepts_affected: ['magnetic_force_perpendicular_no_work'], fixed_in_files: RENDERER, row_type: 'incident' },

  // ── magnetic_field_wire / magnetic_field_concept_B ────────────────────────
  { bug_class: 'field3d_visible_elements_substring_match_greedy', title: 'visible_elements substring match is greedy ("wire" matches fl_wire_*/arr_wire_*) → premature blooming', severity: 'MODERATE', owner_cluster: JA,
    root_cause: 'applyState\'s visible_elements matcher uses substring indexOf, so a token like "wire" matches wire_main AND the field-line/arrow groups, blooming the field too early.',
    prevention_rule: 'Use specific element tokens (wire_main, curr_arr) in visible_elements; the renderer exact/separator-aware match is the proper fix (deferred).',
    probe_type: 'manual', probe_logic: 'STATE_1 shows only the intended elements, not everything matching a substring.', status: 'FIXED', concepts_affected: ['magnetic_field_wire', 'magnetic_field_concept_B'], fixed_in_files: ['src/data/concepts/magnetic_field_wire.json'], row_type: 'incident' },

  // ── circular_motion_charge_in_uniform_B ───────────────────────────────────
  { bug_class: 'field3d_orbit_spiral_on_radius_ramp', title: 'Orbit trail accumulates into a spiral with drifting centre + stray X during a radius ramp', severity: 'CRITICAL', owner_cluster: R,
    root_cause: 'During a radius ramp (ghost_compare/sliders) the orbit trajectory was accumulated frame-by-frame; at varying R the points no longer form a closed circle → broken spiral, drifting centre, self-crossing X.',
    prevention_rule: 'When R can change within a state, draw a COMPLETE ring each frame at the current R about a FIXED origin (never accumulate trail); capture the ghost at the true reveal-time R; THE EYE must read DENSE ramp frames, not only the frozen end.',
    probe_type: 'manual', probe_logic: 'During a radius ramp, every dense frame shows a clean closed ring at a fixed centre — no spiral, no stray X.', status: 'FIXED', concepts_affected: ['circular_motion_charge_in_uniform_B'], fixed_in_files: RENDERER, row_type: 'incident' },

  // ── electric_dipole_in_field ──────────────────────────────────────────────
  { bug_class: 'field3d_array_form_show_sliders_not_marked_interactive', title: 'Array-form show_sliders not recognised as interactive → static sandbox false-fails D1p', severity: 'MODERATE', owner_cluster: VV,
    root_cause: 'deriveHoldExpectations marks a field_3d state interactive only when show_sliders===true (strict boolean), but field_3d allows show_sliders as a string array of slider names; an array-form sandbox false-failed the static-image check.',
    prevention_rule: 'Treat array-form show_sliders and advance_mode==="interaction_complete" as interactive in the field_3d branch (match the PCPL branch).',
    probe_type: 'manual', probe_logic: 'A field_3d state with array-form show_sliders classifies interactive, not strict.', status: 'FIXED', concepts_affected: ['electric_dipole_in_field'], fixed_in_files: ['src/data/concepts/electric_dipole_in_field.json', ...META], row_type: 'incident' },

  // ── magnetic_force_moving_charge ──────────────────────────────────────────
  { bug_class: 'field3d_i2_tts_synced_math_invisible_to_capture', title: 'TTS-synced SET_MATH formulas invisible to headless capture → I2 false-fail', severity: 'MODERATE', owner_cluster: VV,
    root_cause: 'The validator never plays TTS, so formulas revealed at TTS timestamps via SET_MATH were absent from captured frames.',
    prevention_rule: 'Replay the per-sentence SET_MATH schedule and snapshot one equation-panel frame per formula for the vision gate.',
    probe_type: 'manual', probe_logic: 'I2 frames include the TTS-revealed formulas.', status: 'FIXED', concepts_affected: ['magnetic_force_moving_charge'], fixed_in_files: ['src/lib/validators/visual/screenshotter.ts'], row_type: 'incident' },

  // ── cross-cutting (multiple concepts) ─────────────────────────────────────
  { bug_class: 'crossagent_jsonauthor_drops_pause_after_ms_cloning_electric_flux', title: 'json_author drops pause_after_ms when cloning electric_flux (cross-agent regression pattern)', severity: 'MAJOR', owner_cluster: JA,
    root_cause: 'Cloning electric_flux (which has no predictions, hence no pause_after_ms) as a template drops the physics block\'s prediction pauses; Gate 3c does not run on field_3d so it is not caught automatically.',
    prevention_rule: 'When porting any field_3d JSON, explicitly carry every pause_after_ms from the physics block; field_3d consumes them via deriveStateMeta.',
    probe_type: 'manual', probe_logic: 'Every prediction sentence retains its pause_after_ms after the JSON port.', status: 'FIXED', concepts_affected: ['gauss_law', 'magnetic_field_solenoid', 'gauss_law_sphere'], fixed_in_files: ['src/data/concepts'], row_type: 'incident' },
  { bug_class: 'gate3c_does_not_run_on_field3d_use_gate15', title: 'Gate 3c (Socratic-reveal) never fires on field_3d (no teaching_method) → use Gate 15', severity: 'MAJOR', owner_cluster: VV,
    root_cause: 'Gate 3c only fires on states with teaching_method:"narrative_socratic", a PCPL-only field absent on every field_3d concept; so it structurally never runs on diamonds.',
    prevention_rule: 'Gate 15 (Pass-2 four-question) is the cognitive-flow gate for field_3d; audit pause-before-resolution + motion-before-words there.',
    probe_type: 'manual', probe_logic: 'field_3d concepts are audited by Gate 15, not Gate 3c.', status: 'FIXED', concepts_affected: ['gauss_law', 'gauss_law_sphere', 'magnetic_field_solenoid', 'magnetic_force_direction_right_hand_rule', 'magnetic_force_perpendicular_no_work', 'charge_distribution', 'electric_flux'], fixed_in_files: ['.agents/quality_auditor/CLAUDE.md'], row_type: 'incident' },
  { bug_class: 'rule29_size_pulse_emphasis_drift', title: 'Emphasis via size-pulse (vector bulge / hand scale / point-P scale) violates Rule 29', severity: 'MAJOR', owner_cluster: R,
    root_cause: 'Attention/TTS emphasis used a size-pulse (vector 70% bulge, right-hand 4% scale, highlighted point 15% scale) instead of brightness.',
    prevention_rule: 'Emphasis = brightness only (applyGlowEmphasis / emissive shimmer); a length changes ONLY when a real physical magnitude changes (e.g. tauThrob).',
    probe_type: 'manual', probe_logic: 'No time-based scale/zoom pulse for emphasis anywhere in field_3d.', status: 'FIXED', concepts_affected: ['gauss_law', 'gauss_law_sphere', 'charge_distribution', 'magnetic_force_direction_right_hand_rule', 'torque_on_current_loop_in_field'], fixed_in_files: RENDERER, row_type: 'incident' },
  { bug_class: 'field3d_routing_downgrade_to_mechanics2d_in_strict_bypass', title: 'field_3d concepts silently downgraded to mechanics_2d in the strict-engines bypass', severity: 'CRITICAL', owner_cluster: RG,
    root_cause: 'The strict-engines bypass only routed PCPL vs mechanics_2d; field_3d concepts fell into the else and were assembled as p5.js mechanics_2d, silently downgrading the Three.js diamonds.',
    prevention_rule: 'Route any concept with a field_3d_config block via assembleField3DHtml (engine threejs) in the strict-engines bypass.',
    probe_type: 'manual', probe_logic: 'A field_3d concept served through the bypass returns Three.js HTML (PM markers), not M2_* mechanics_2d.', status: 'FIXED', concepts_affected: ['gauss_law', 'electric_flux', 'charge_distribution', 'magnetic_field_wire', 'magnetic_field_solenoid', 'magnetic_field_concept_B'], fixed_in_files: ['src/lib/aiSimulationGenerator.ts'], row_type: 'incident' },
  { bug_class: 'classifier_capital_B_suffix_truncation', title: 'Intent classifier regex truncates a trailing capital _B → misclassification', severity: 'MAJOR', owner_cluster: RG,
    root_cause: 'extractAdvertisedConcepts regex ^([a-z][a-z0-9_]*) only matched lowercase after the first char, stripping a trailing capital _B.',
    prevention_rule: 'Use ^([a-z][A-Za-z0-9_]*) so concept ids with a capital suffix (…_B) classify correctly.',
    probe_type: 'manual', probe_logic: 'A query for a _B-suffixed concept classifies to the full id, not a truncated one.', status: 'FIXED', concepts_affected: ['magnetic_field_concept_B', 'circular_motion_charge_in_uniform_B'], fixed_in_files: ['src/lib/intentClassifier.ts'], row_type: 'incident' },

  // ── validator/THE EYE hardenings ──────────────────────────────────────────
  { bug_class: 'eye_e2_e3_storyboard_metadata_not_plumbed', title: 'E2/E3 (focal/anchor) false-fail because storyboard metadata not passed to the vision gate', severity: 'MODERATE', owner_cluster: VV,
    root_cause: 'E2 (focal_primitive_id) and E3 (real_world_anchor) false-failed because the smoke context never sourced them from the concept JSON.',
    prevention_rule: 'Source real_world_anchor + focal_primitive_ids + tts_visual_bindings from the concept JSON into VisionGateContext.',
    probe_type: 'manual', probe_logic: 'E2/E3 read the JSON metadata and stop false-failing when it is present.', status: 'FIXED', concepts_affected: ['magnetic_force_moving_charge'], fixed_in_files: ['src/lib/validators/visual/visionGate.ts'], row_type: 'incident' },
  { bug_class: 'eye_vision_json_parser_brittle_on_escalation', title: 'Vision-gate JSON parser crashed on Sonnet escalations (prose wrap / LaTeX escapes)', severity: 'MODERATE', owner_cluster: VV,
    root_cause: 'Sonnet escalation responses wrapped JSON in prose or echoed LaTeX (\\sin) as invalid JSON escapes, crashing the parser (false-fail batch).',
    prevention_rule: 'Use a balanced-brace, string-aware JSON extractor + escape sanitizer + output rules (end after }, escape formulas).',
    probe_type: 'manual', probe_logic: 'Escalation responses with prose/LaTeX parse without crashing.', status: 'FIXED', concepts_affected: ['magnetic_force_moving_charge'], fixed_in_files: ['src/lib/validators/visual/promptTemplates.ts'], row_type: 'incident' },
];

const directives: Row[] = [
  { bug_class: 'teach_concrete_before_abstract_compare', title: 'When a derived result equals a simpler known one, show the simple case ALONE first, then the complex one beside it', severity: 'MODERATE', owner_cluster: AR,
    root_cause: 'Founder: the shell-field derivation lands far better when the point charge is explained alone first, then the shell appears beside it for comparison (concrete → abstract).',
    prevention_rule: 'For a "this equals that simpler thing" aha, stage it: simple case alone (left empty), THEN introduce the complex case beside it, THEN highlight that the formulas match.',
    probe_type: 'manual', probe_logic: 'Architect: the compare state explains the simple object first, alone, before the complex one appears.', status: 'OPEN', concepts_affected: ['gauss_law_sphere'], fixed_in_files: [], row_type: 'directive' },
  { bug_class: 'teach_reveal_synced_to_narration', title: 'Author timed reveals so the visual beat lands as the narration introduces it (no early pop / no static wait)', severity: 'MODERATE', owner_cluster: PA,
    root_cause: 'Founder: a reveal that fires long before the narrating sentence pops in early then sits static; it reads as unexplained.',
    prevention_rule: 'Tune each reveal at_ms to the cumulative narration pacing of the sentence that introduces it (Rule 26 keeps motion on the sim clock; tune the times to the script).',
    probe_type: 'manual', probe_logic: 'Physics-author: each timed reveal lands within ~1s of its introducing narration beat.', status: 'OPEN', concepts_affected: ['gauss_law_sphere', 'magnetic_field_solenoid'], fixed_in_files: [], row_type: 'directive' },
  { bug_class: 'teach_coordinate_sim_with_graph', title: 'When a state has both a 3D sim and a graph, drive ONE live parameter that moves BOTH together', severity: 'MODERATE', owner_cluster: AR,
    root_cause: 'Founder: a static E-vs-r curve teaches less than a live coordinated sweep where the sphere radius and the graph dot move in lockstep.',
    prevention_rule: 'For sim+graph states, drive a single live parameter that animates both the 3D scene and a tracking dot on the graph together; never ship a static curve.',
    probe_type: 'manual', probe_logic: 'Architect: the sim+graph state moves both in lockstep off one parameter.', status: 'OPEN', concepts_affected: ['gauss_law_sphere'], fixed_in_files: [], row_type: 'directive' },
  { bug_class: 'teach_show_quantity_live_when_named', title: 'When the narration names a quantity, draw/grow its visual live at that moment', severity: 'MODERATE', owner_cluster: PA,
    root_cause: 'Founder: showing the radius line grow live exactly when the narration says "radius r" maps the word to the picture.',
    prevention_rule: 'When narration first names a quantity (radius r, the field E…), reveal/grow its visual live on that beat so the word maps to the picture.',
    probe_type: 'manual', probe_logic: 'Physics-author: each named quantity has a visual that appears/grows on its naming beat.', status: 'OPEN', concepts_affected: ['gauss_law_sphere'], fixed_in_files: [], row_type: 'directive' },
  { bug_class: 'teach_distinct_reference_lines_for_two_radii', title: 'When two radii appear (R shell vs r field-point), draw both as distinct, clearly-labelled lines', severity: 'MODERATE', owner_cluster: AR,
    root_cause: 'Founder: students conflate the shell radius R with the field-point distance r; two distinct labelled lines from the centre prevent this.',
    prevention_rule: 'When two radii are in play, draw both as separate, clearly-labelled reference lines (e.g. R to the shell, r to the field point) so they are never conflated.',
    probe_type: 'manual', probe_logic: 'Architect: distinct labelled R and r reference lines wherever both appear.', status: 'OPEN', concepts_affected: ['gauss_law_sphere'], fixed_in_files: [], row_type: 'directive' },
  { bug_class: 'teach_visual_must_match_narration', title: 'The visual must match what is said (trajectory matches "round and round"; "outside ≈ 0" must be SHOWN)', severity: 'MAJOR', owner_cluster: AR,
    root_cause: 'Founder/THE EYE: states narrated circular motion while drawing straight drift, or narrated "outside ≈ 0" with nothing fading — the picture contradicted or omitted the words.',
    prevention_rule: 'Every claim the narration makes must be visible: motion mode matches the described motion, and any "becomes zero / cancels / grows" is shown, not just said.',
    probe_type: 'manual', probe_logic: 'Architect: walk the script; every narrated claim has a matching on-screen visual.', status: 'OPEN', concepts_affected: ['magnetic_force_perpendicular_no_work', 'magnetic_field_solenoid'], fixed_in_files: [], row_type: 'directive' },
  { bug_class: 'teach_do_not_prespoil_a_later_reveal', title: 'Do not show a quantity/formula before the state that introduces it (ε₀ at STATE_2, not STATE_1)', severity: 'MODERATE', owner_cluster: AR,
    root_cause: 'gauss_law STATE_1 pre-showed ε₀ before STATE_2 was meant to introduce it, spoiling the sequenced reveal.',
    prevention_rule: 'Gate on-canvas quantities/formulas to the state that teaches them; earlier states use the simpler form (∝) and do not pre-spoil the later reveal.',
    probe_type: 'manual', probe_logic: 'Architect: no state shows a quantity earlier than the state that introduces it.', status: 'OPEN', concepts_affected: ['gauss_law'], fixed_in_files: [], row_type: 'directive' },
  { bug_class: 'teach_color_each_element_by_its_own_sign', title: 'Colour each element by its own sign/identity; only aggregates/fields follow the net', severity: 'MODERATE', owner_cluster: PA,
    root_cause: 'gauss_law recoloured both charges by the net sign; each object should keep its own identity colour.',
    prevention_rule: 'Colour each object (each charge) by its own sign/identity; only aggregate indicators (net field lines, readout) follow the net.',
    probe_type: 'manual', probe_logic: 'Physics-author: each element keeps its own-sign colour; only the net indicator changes.', status: 'OPEN', concepts_affected: ['gauss_law'], fixed_in_files: [], row_type: 'directive' },
];

// ── SQL emit (archival migration record) ────────────────────────────────────
function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  if (a.length === 0) return `ARRAY[]::text[]`;
  return `ARRAY[${a.map(sqlStr).join(', ')}]`;
}
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- ============================================================================
-- 2026-06-25: seed engine_bug_queue with the field_3d diamond run bug/scar ledger
-- (electrostatics + magnetism). Mined from deriveStateMeta.ts + field_3d_renderer.ts
-- comments, PROGRESS.md, docs/notes/*-pass2-notes.md, git fix-commits. One row per
-- bug CLASS, tagged with concepts_affected. row_type 'incident' or 'directive'.
-- REQUIRES the directive row_type ALTER first (see the companion migration).
-- Generated by src/scripts/_seed_engine_bug_queue_field3d.ts — idempotent.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO NOTHING;
`;
}

async function upsertBatch(rows: Row[], label: string): Promise<boolean> {
  const payload = rows.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) {
    console.error(`  ✗ ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ✓ ${label}: ${rows.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  // 1. Emit the archival SQL migration (single source of truth = these arrays).
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-25_seed_engine_bug_queue_field3d_diamonds_migration.sql');
  writeFileSync(sqlPath, emitSql([...incidents, ...directives]), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident + ${directives.length} directive rows)`);

  // 2. Land incident rows headlessly (row_type 'incident' is always allowed).
  console.log('Upserting incident rows…');
  await upsertBatch(incidents, 'incidents');

  // 3. Land directive rows (needs the row_type='directive' ALTER applied first).
  console.log('Upserting directive rows (needs the directive row_type ALTER)…');
  const ok = await upsertBatch(directives, 'directives');
  if (!ok) {
    console.log('  → Run supabase_2026-06-25_engine_bug_queue_directive_rowtype_migration.sql in the');
    console.log('    Supabase SQL editor, then re-run this script to land the directive rows.');
  }

  // 4. Verify.
  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('row_type, status')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  const byType: Record<string, number> = {};
  for (const row of data ?? []) byType[row.row_type] = (byType[row.row_type] ?? 0) + 1;
  console.log('In engine_bug_queue for this session:', JSON.stringify(byType));
}

main().catch((err) => {
  console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
