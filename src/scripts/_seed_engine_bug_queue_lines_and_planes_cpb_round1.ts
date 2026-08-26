/**
 * engine_bug_queue — #9 `lines_and_planes_in_space`, CP-B ROUND 1 (the pass-4/pass-5 audit fix round),
 * 2026-08-20.
 *
 * What the round was: the CP-B dispatch was blocked because quality_auditor's last verdict was FAIL.
 * Pass 4 re-audited (FAIL, 8 findings), architect → mathematics-author → json-author fixed them, pass 5
 * re-audited (FAIL on ONE finding: the S6 slide carrier), the carrier was replaced and measured, and the
 * architect reconciled the design document to the measured build. THE EYE returned 39/40 on every capture
 * (the 1 is the known STATE_9:D5 false positive) — nothing below was visible to it.
 *
 * Five kinds of write, all marker-gated, SQL generated from the SAME structures the TS applies, and no
 * write downgrades a protected status:
 *   · NEW OPEN rows (engine / tooling gaps this round exposed — each a founder call, none dispatched)
 *   · NEW rows filed already FIXED (authoring classes found AND closed inside the round, recorded so the
 *     prevention rule and the negative control survive the fix)
 *   · CLOSE of one existing MAJOR row by authoring (the S6 apex scar)
 *   · ANNOTATIONS on existing rows (recurrences measured, scope notes)
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb_round1.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-20_lines_and_planes_cpb_round1';
const FIXED_AT = '2026-08-20T21:30:00.000Z';
const J = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';
const SKEL = 'docs/skeletons/lines_and_planes_in_space_skeleton.md';
const BLOCK = 'docs/skeletons/lines_and_planes_in_space_mathematics_block.md';
const R = 'src/lib/renderers/field_3d_renderer.ts';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  row_type: 'incident'; fixed_at: string | null; marker: string;
}
interface Update { bug_class: string; marker: string; note: string; status?: 'FIXED'; fixed_at?: string; fixed_in_files?: string[]; }

const ROWS: Row[] = [
  // ── NEW, OPEN — engine / tooling, founder calls ─────────────────────────────────────────────
  {
    bug_class: 'vg_direction_arrow_is_collinear_and_same_colour_as_its_tube_so_it_cannot_carry_visible_motion',
    title: 'show_dir_arrow draws an arrow ON its own line in the line\'s own colour, so a beat that uses the arrow as its motion carrier renders ~0 px',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause: 'The vg lines/planes writer places a THREE.ArrowHelper at L.anchor, points it along L.dir, and colours it vgRoleColor(L.role) (' + R + ':14559-14566). The tube it decorates is drawn through the same anchor, along the same dir, in the same colour. So the arrow\'s shaft is a 1px line hidden inside a 3-4px tube and its cone (radius 0.11 wu) is a same-colour bump on the tube. On lines_and_planes_in_space STATE_6 the architect authored the slide beat ("slide one line along itself") with show_dir_arrow: true as the declared visible carrier, explicitly flagged ASSUMPTION - probe-before-authoring. The probe (THE EYE run 20260820-204646) measured 52-99 changed px per second across the whole 1500-10500 slide, 0.006-0.011 % of canvas, an order of magnitude under D5\'s own 0.1 % floor; the two frames t=2000 and t=5000 are indistinguishable at 1x and only a 4x crop shows a faint same-colour cone creeping along the tube. The beat was re-authored without the arrow (lambda_span endpoints + a neutral anchor point) and measures 261-560 px/s on run 20260820-211735. The arrow itself is not wrong as a direction MARKER; it is wrong as a motion CARRIER, and nothing in the renderer or the gate distinguishes the two uses.',
    prevention_rule: 'A MOTION CARRIER MUST DIFFER FROM ITS HOST IN COLOUR OR SHAPE. An element drawn collinear with and in the same colour as the object it rides cannot carry a visible beat, whatever it does in world space. Engine side (founder call): give the vg direction arrow a contrasting head (neutral ink, or a cone radius clearly wider than the tube, or a small offset off-axis) so it reads as an arrowhead and not a bump. Authoring side, effective now: never declare show_dir_arrow as the visible carrier of a slide; use the drawn endpoints (a finite lambda_span) and/or a neutral point riding the same offset knob, and MEASURE the carrier (adjacent-second pixel deltas) before the design document records the beat as visible.',
    probe_type: 'js_eval',
    probe_logic: 'For every vg line with show_dir_arrow true, render two frames that differ only in the line\'s anchor (offset knob at 0 and at +1.5 along dir) and assert the ink-relative pixel delta inside the arrow\'s projected bbox exceeds the D5 floor. Negative control: the shipped arrow on STATE_6 (run 20260820-204646) must FAIL (52-99 px/s); the lambda_span + point a1 carrier (run 20260820-211735) must PASS (261-560 px/s).',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: '52-99 changed px per second across the whole 1500-10500 slide',
  },
  {
    bug_class: 'vg_common_perpendicular_publishes_all_three_readouts_on_its_own_arrival_so_a_number_can_precede_the_vector_it_names',
    title: 'In F13b skew_distance, cross_norm and numerator_triple_product are all gated on the common perpendicular, so a late a2-a1 or d1xd2 beat has its number on the HUD before the vector is drawn',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause: 'F13b (' + R + ':13310-13326) publishes out.readouts.skew_distance, cross_norm and numerator_triple_product inside ONE gate, vgArrived(cfrac) of d.common_perpendicular. The comment there ("all three numbers belong to the common perpendicular, so all three wait for it") is true of skew_distance and false of the other two: cross_norm is the length of d1xd2 and numerator_triple_product is (a2-a1)·(d1xd2), and a state that stages the derivation draws those two vectors as their own beats. lines_and_planes_in_space STATE_8 did exactly that in the pass-4 fix round: a2_minus_a1 was re-timed to reveal 13000 / grow 2500 to cure a 12 s end-freeze, and eye_walker then measured the HUD row "(a2-a1)·(d1xd2) = 1.685" fully populated at t=2000 - 11-13 s before the magenta vector it names existed. This is the same shape as the closed vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn, one construct over. Authoring cannot fix it: the narration ("The two lines return, gap already drawn") needs the perpendicular on screen from the start, and with it come all three numbers. INTERIM AUTHORING (shipped): a2_minus_a1 restored to reveal 1000 / grow 1000 so it arrives WITH the perpendicular and the numbers at 2000; the cross_vec overlay slide widened to 8500-15500 to keep the motion floor. RESIDUAL under the interim: cross_norm = 0.936 publishes at 2000 while cross_vec completes at 6000 - a 4 s lead of the same class, milder, pre-existing since the state was first authored, and closable only here.',
    prevention_rule: 'A READOUT IS GATED BY THE REVEAL OF THE THING IT NAMES (the renderer\'s own Δ2c principle). Engine delta Δ12 (founder call, Rule 40 - platform file, land on master separately): when the same group authors a vectors[] entry with derive "cross" over the same two lines, gate cross_norm on THAT vector\'s vgRevealFrac; when it authors a derive "between" vector over the same two lines, gate numerator_triple_product on that vector\'s arrival; skew_distance keeps the perpendicular\'s gate; fall back to the perpendicular when no such vector exists. git log --all -S numerator_triple_product first (40a); check:renderer-syntax; THE EYE on every concept authoring common_perpendicular (only #9 on master today - verify live). Until Δ12 lands, any state that stages d1xd2 or a2-a1 as a beat must reveal that vector no later than the perpendicular.',
    probe_type: 'js_eval',
    probe_logic: 'For each state authoring common_perpendicular plus a derive "cross" or derive "between" vector over the same lines, sample the resolver every 100 ms and assert cross_norm is absent from out.readouts until the cross vector has arrived, and numerator_triple_product is absent until the between vector has arrived. Negative control: the pass-4 fix-round STATE_8 (a2_minus_a1 at 13000) must FAIL by 11 s; the shipped interim must FAIL on cross_norm by 4 s; a Δ12 renderer must PASS both.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'fully populated at t=2000 - 11-13 s before the magenta vector',
  },
  {
    bug_class: 'vg_formula_overlay_has_no_timed_reveal_so_the_formula_is_on_screen_before_the_beat_that_derives_it',
    title: 'The vg #formula_overlay is written once at state entry, so the PRIMARY-aha state shows D = |n·(q−a)| ⁄ ‖n‖ from frame 0, before the perpendicular is demonstrated',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause: 'The vg apply path sets the DOM formula surface in one write - ff.textContent = stateDef.formula_overlay; ff.style.display = ftext ? "block" : "none" (' + R + ':25527-class) - with no at_ms. The formula_lines[{text, at_ms}] mechanism exists on master for two other scenarios (nlb, rbr) and was never ported to vg (git log --all -S formula_lines run 2026-08-20: no vg port). lines_and_planes_in_space\'s skeleton §12 therefore carried two UNAUTHORABLE cells - S3 "11000-12500 formula surface writes" and S8 "12000-15000 formula surface" - and the JSON repeated the claim in two scene_composition notes ("writes in after the perpendicular locks"). Measured ink in the overlay box is constant from t=0 on both states (S3 382 px at t=0/1000/10000/12000; S8 682 px at t=0/13000). Consequence on the PRIMARY AHA state S3: the closed formula precedes the sweep that earns it - the vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn shape at the formula level. The architect judges S8 tolerable and S3 a genuine weakening. Authoring side this round: the false cells and notes were corrected to "present from state entry - no timed reveal (Δ11 requested)"; nothing else is authorable.',
    prevention_rule: 'A DESIGN DOCUMENT MAY NOT CLAIM A TIMED REVEAL ON A SURFACE THAT HAS NO TIMED-REVEAL FIELD - the architect checks the renderer\'s apply path for the surface before writing an at_ms window into §12. Engine delta Δ11 (founder call, Rule 40): port formula_lines[{text, at_ms}] (nlb :1371, rbr :1976/:51035) into the vg apply path\'s #formula_overlay so a state can stage its formula after the beat that derives it; THE EYE fleet re-verify on every vg concept (the S3/S8 frozen frames will move by design - re-baseline per Rule 34e, not a fix cycle).',
    probe_type: 'js_eval',
    probe_logic: 'Static: for every §12 cell that names a "formula surface writes" window, assert the named surface\'s apply path reads an at_ms field. Runtime: measure ink in the #formula_overlay box at t=0 and at the claimed reveal instant and assert they differ. Negative control: the pre-round skeleton S3/S8 cells must FAIL the static check; the shipped vg overlay must FAIL the runtime check (382 = 382 px).',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'S3 382 px at t=0/1000/10000/12000',
  },
  {
    bug_class: 'eye_d5_scores_a_whole_state_so_an_invisible_taught_beat_inside_a_moving_state_passes',
    title: 'D5 passed STATE_6 40/40 twice while its 9 s taught beat rendered 0-99 px/s, because a later rotation carried the state average',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause: 'D5 (dense motion) judges a STATE: it fails only when the state\'s dense frames do not move enough overall. lines_and_planes_in_space STATE_6 has two beats - a 1500-10500 slide and a 10500-19500 rotation. In both the pre-round build (slide a geometric no-op, 0-3 px/s) and the first fix-round build (arrow carrier, 52-99 px/s) the slide was invisible, and in both THE EYE returned STATE_6 PASS because the rotation\'s 1700-2100 px/s lifted the state\'s series past the floor. The defect was caught each time only by a hand pixel-diff of adjacent dense frames (the dispatching session on run 204646, quality_auditor pass 5 with the same numbers). The gate proves the state moved; the state\'s first taught beat did not, and the narration named it ("Slide one line along itself").',
    prevention_rule: 'WHERE A STATE DECLARES MORE THAN ONE BEAT, D5 IS SCORED PER BEAT, NOT PER STATE. Read the authored animate[] windows (and reveal/grow windows) as the beat boundaries and require each window whose knob MOVES to clear the ink-relative floor on its own frames. A beat under the floor is a failure of that beat even when the state passes. Until built: the eye-walker dispatch must include a per-beat adjacent-second delta table for any state with two or more animate windows, and the dispatching session spot-checks the taught beat by hand.',
    probe_type: 'js_eval',
    probe_logic: 'Partition each state\'s dense frames by its animate[] windows; for every window with from != to, compute the ink-relative D5 statistic over that window alone and assert it clears DENSE_MOTION_INK_EPSILON. Negative control: STATE_6 on run 20260820-204646 must FAIL its 1500-10500 window (52-99 px/s) while passing its 10500-19500 window; run 20260820-211735 must PASS both.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'lifted the state\'s series past the floor',
  },
  {
    bug_class: 'vg_slider_drive_probe_using_synthetic_input_events_never_seizes_the_knob_and_reports_the_authored_static',
    title: 'A drive probe that fires synthetic input/change events on a vg slider reads the authored value for every position - a clean false negative on every vg control',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause: 'vg sliders are behind the trusted-drag guard: a knob leaves its authored static only under an ev.isTrusted event (the drag-seize pattern that lets a guided state\'s choreography keep its hands on a knob the teacher has not touched). quality_auditor pass 5 first drove STATE_9\'s line2_offset with synthetic input/change events and read "shortest distance = 1.800" at every value including ±2.5 - indistinguishable from the inert slider it was trying to confirm fixed. Re-driven with trusted keyboard events (Playwright press ArrowLeft/ArrowRight on the focused range input) the readout tracked 1.800 → 0.800 → 0.000 → 3.500 exactly. Any drive dump built on synthetic events therefore reports the authored static as the slider\'s behaviour on every vg control: false PASSes on a dead slider and false FAILs on a live one.',
    prevention_rule: 'A SLIDER DRIVE PROBE USES TRUSTED INPUT. Drive vg controls with real pointer or keyboard events (Playwright mouse.down/move/up on the thumb, or keyboard.press on the focused input), never dispatchEvent(new Event("input")). The founder_drive dump and every auditor drive must state which event path they used; a dump that cannot show a trusted path is not evidence about a vg control.',
    probe_type: 'js_eval',
    probe_logic: 'Drive one known-live vg slider (STATE_9 line2_offset) both ways: synthetic input events, then trusted keyboard events; assert the synthetic path leaves the readout at its authored value and the trusted path changes it. The probe exists to prove the synthetic path is blind, so a synthetic-only drive can never again be read as a result.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'read "shortest distance = 1.800" at every value including',
  },
  {
    bug_class: 'design_document_engine_facts_go_stale_when_the_renderer_moves_and_a_value_scoped_sweep_cannot_see_them',
    title: 'A design document\'s claims ABOUT THE RENDERER silently rot as the renderer ships, and six consecutive value-scoped sweeps could not see them because no diff of the concept JSON contains the word vgArrived',
    severity: 'MAJOR',
    owner_cluster: 'alex:architect',
    root_cause: 'The mathematics block for lines_and_planes_in_space carries an engine-facts layer — claims about what the renderer can and cannot do — verified once at authoring time and never re-verified. Between its last authoring commit (bf720275) and HEAD, EIGHT vector_geometry_3d renderer commits landed, and one (86eb9190) predated the document entirely, so part of it was stale on the day it was written. Three families of claim went false: readout arrival gating (86eb9190), the animate loop (7c7e963c), group-scoped controls (5eace82d), and a fourth found only at the seventh audit pass (d044dbb1 — an arc reveal_at_ms became the gate on its angle token). The damage is NOT stale numbers. Three sites were live BUILD RECIPES for closed bugs, and two were FLAGs addressed to founder_proxy and quality_auditor BY NAME: the block recommended authoring an explore sweep as eight finite legs to 72000 ms — verbatim the vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes bug, whose row records THIS concept doing exactly that and freezing; it asked Checkpoint B to file an engine_bug_queue row for vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state, already FIXED; and it told the auditor to stand down on a dead-slider defect that does not exist because group_controls ships. A concept whose SIM was verified clean and byte-identical at audit pass 7 then took SIX more full audit rounds, every one of them documentation-only. Each round corrected the site the routing message named and left the other sites of the same family standing, because the family was never enumerated: FLAG 7 was withdrawn while its own source sentence and its own recommendation stayed live; a condensed paraphrase was struck while the nine lines of original prose above it stayed, so a top-down reader met the false version first and the correction second.',
    prevention_rule: 'A DESIGN DOCUMENT THAT MAKES CLAIMS ABOUT AN ENGINE IS VERIFIED AGAINST THAT ENGINE, BY COMMIT, NOT BY PATTERN. (1) A commit-diff over the concept JSON enumerates claims about the JSON and STRUCTURALLY CANNOT reach a claim about the renderer. Enumerate the renderer instead: git log --oneline --full-history --no-merges <last-verified-sha>..HEAD -- <renderer>. Plain git log -- <path> simplified six of eight commits behind merge nodes and would have hidden four families. (2) Each commit is a FAMILY with MULTIPLE sites, found by grepping the family VOCABULARY (\'UNCONDITIONAL / regardless of\', \'infinite / finite / ping_pong / 8 legs\', \'read ONCE per STATE ENTRY / NO visible effect\'), never its values — and grep CASE-INSENSITIVELY, since a lowercase instance in a constraints block survived an otherwise-correct sweep. (3) Correct the whole family in one pass: a citing site and its cited source are one unit, and a paraphrase may never be struck while its original stands. (4) Cite renderer code BY SYMBOL NAME, never by line number — 18 of 19 :NNNNN pointers had drifted +160..+390 lines. (5) Severity is set by whether a stale cell is a BUILD RECIPE or a downstream-addressed FLAG; those block, ordinary drift does not.',
    probe_type: 'js_eval',
    probe_logic: 'For each design document that cites a renderer: resolve its last-verified sha, enumerate renderer commits with --full-history --no-merges, and for each commit extract the identifiers it added or removed; assert no live (non-struck) span of the document asserts the negation of any shipped identifier\'s behaviour. Cheap concrete form: assert every mechanism the document says does NOT exist (\'no engine primitive for\', \'the engine does not have\', \'cannot be built\', \'is NOT set\') is absent from the renderer source, case-insensitively. Negative controls: the pre-fix block must FAIL on animate_loop_ms, group_controls and vgArrived; and every quoted object literal must carry the same field SET as the shipped object, since three separate FAILs were literals that closed early rather than values that were wrong.',
    status: 'OPEN', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [],
    row_type: 'incident', fixed_at: null,
    marker: 'no diff of the concept JSON contains the word vgArrived',
  },
  // ── NEW, filed FIXED — authoring classes found and closed inside the round ────────────────
  {
    bug_class: 'vg_offset_along_a_lines_own_direction_on_a_scene_clipped_line_is_a_geometric_no_op',
    title: 'STATE_6\'s "slide each line along itself" beat and STATE_9\'s line2_offset slider both moved the anchor along the line\'s own dir with no lambda_span, so the drawn segment was provably invariant and nothing moved',
    severity: 'MAJOR',
    owner_cluster: 'alex:json_author',
    root_cause: 'With no lambda_span, vgLineEnds clips a line to the scene sphere (' + R + ':12805-12818): endpoints are anchor + d·(−b ± s) with b = anchor·d and s² = b² − |anchor|² + R². Translate the anchor along d by t: b′ = b + t and s′ = s, so the endpoints are identical. lines_and_planes_in_space authored offset.along EXACTLY parallel to dir (|dot| = 1.000000) on STATE_6 M1 and M2 and on STATE_9 M2 - so the whole 0-8000 slide beat rendered 0-3 px/s and one of only two group-B explore sliders did nothing. Control case that proved the mechanism: STATE_4 Lpar offsets perpendicular (|dot| = 0) and moves. CLOSED 2026-08-20 by authoring: STATE_6 M2 carries no offset (rotate only); M1 keeps its parallel offset but the lines are clipped to lambda_span [−4.5, 4.5] (= VG_SCENE_RADIUS, rest pose pixel-identical) and a neutral point a1 rides the same knob, so the drawn endpoints, the d1 label and the point carry the slide (261-560 px/s, run 20260820-211735); STATE_9 M2\'s offset.along is now the unit common perpendicular n̂c = normalize(d1×d2) so line2_offset opens and closes the gap and skew_distance tracks live (1.800 → 0.800 → 0.000 → 3.500, trusted-event drive).',
    prevention_rule: 'AN OFFSET ALONG A SCENE-CLIPPED LINE\'S OWN DIRECTION DRAWS NOTHING. Before authoring a slide-along-itself beat, either give the line a finite lambda_span so its endpoints carry the motion, or put a point on the anchor, or both - and never declare the beat visible until an adjacent-frame pixel delta says so. A knob whose only effect is invariant under the renderer\'s clipping is an inert control (vg_authored_control_that_drives_nothing class).',
    probe_type: 'js_eval',
    probe_logic: 'Static: for every vg line with offset.along, compute |dot(normalize(along), normalize(dir))|; if ≥ 1 − 1e-4 and the line has neither lambda_span nor bind_lambda_span nor a point riding the same knob, FAIL. Negative control: the pass-4 JSON must FAIL on STATE_6 M1, STATE_6 M2 and STATE_9 M2; the shipped JSON must PASS (STATE_6 M1 has lambda_span + a1; STATE_9 M2 is perpendicular; STATE_4 Lpar and Lcut are perpendicular).',
    status: 'FIXED', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [J, SKEL, BLOCK],
    row_type: 'incident', fixed_at: FIXED_AT,
    marker: 'endpoints are anchor + d·(−b ± s)',
  },
  {
    bug_class: 'state_duration_authored_longer_than_its_choreography_so_narration_plays_over_a_frozen_canvas',
    title: 'Five guided states held a byte-identical frame for 8-15 s while narration continued - the PRIMARY AHA state for its last 15 of 24 s',
    severity: 'MAJOR',
    owner_cluster: 'alex:architect',
    root_cause: 'lines_and_planes_in_space\'s durations were authored from the word count alone, and the choreography ended early: measured on run 20260820-183954 (1 s sampling, zero tolerance) the longest consecutive static run was S3 15 s / 63 %, S8 12 s / 50 %, S5 9 s / 35 %, S4 8 s / 33 %, S7 7 s / 32 %, S6 6 s / 27 % - against a DoD line that asserted "≥ 75 % continuous motion on every state". Rule 31: motion may outrun narration, never the reverse. CLOSED 2026-08-20 by the architect: S3 24→20 s with a slower sweep, S4 24→20 with a new arrival slide for Lcut, S5 26→21 with an earlier slower camera swing, S7 22→19 with a new normal_part segment and a 47-word narration, S8 24→20 with staged reveals. Re-measured on run 20260820-204646 (pass 5): S1 3 s, S2 4, S3 4, S4 4, S5 4, S7 4, S8 4 - all ≤ 4.5 s and ≤ 25 %, every state\'s last motion ≥ 2.5 s before its end; S6 closed on run 20260820-211735 once its carrier was fixed.',
    prevention_rule: 'A STATE\'S DURATION IS SET FROM ITS CHOREOGRAPHY END, NOT ITS WORD COUNT. The architect\'s §12 row must name the last moving instant and the duration must sit within ~2.5-4.5 s of it; the DoD motion line is written as a per-state number the build is measured against, never as a blanket percentage. THE EYE re-measures (1 s sampling, zero tolerance, longest consecutive static run) before the class is recorded closed.',
    probe_type: 'js_eval',
    probe_logic: 'For every guided state, diff adjacent dense frames at 1 s and report the longest run of zero-delta pairs; assert ≤ 4.5 s and ≤ 25 % of duration, and assert duration − last_motion_end ≤ 4.5 s. Negative control: run 20260820-183954 must FAIL on S3/S4/S5/S6/S7/S8; run 20260820-211735 must PASS all nine.',
    status: 'FIXED', concepts_affected: ['lines_and_planes_in_space'], fixed_in_files: [J, SKEL, BLOCK],
    row_type: 'incident', fixed_at: FIXED_AT,
    marker: 'S3 15 s / 63 %, S8 12 s / 50 %',
  },
];

const UPDATES: Update[] = [
  {
    bug_class: 'vg_offset_animate_ends_off_zero_so_a_rotated_line_leaves_its_shared_arc_apex',
    marker: 'CLOSED 2026-08-20 — the rotating line carries no offset',
    status: 'FIXED', fixed_at: FIXED_AT, fixed_in_files: [J, SKEL, BLOCK],
    note: ' CLOSED 2026-08-20 — the rotating line carries no offset. The mechanism was pinned down first: vgObjOffset (' + R + ':13079) and vgObjRotate (:13085) are independent, so offset.along is a FIXED world vector that does not turn with dir; a line carrying both a slide and a rotate leaves the origin the moment θ departs the zero pose while the slide knob is nonzero. Closed-form over the renderer\'s own math, apex miss at the slider bounds was 1.0492 wu (θ=25) and 1.0720 wu (θ=115) with aux_a at ±1.5 — this row\'s own negative control. Two things were also established that the row did not say: (1) on the AUTHORED TIMELINE the apex was never missed (vgAnimValue holds a knob at its final value, so aux_a sat at 0 through the whole rotation) — eye_walker\'s "detached at θ=115°" reading on run 20260820-183954 was wrong, and a pixel fit on run 20260820-204646 put the crossing at (639.5, 359.5) ±0.05 px throughout; the defect lives ONLY under a teacher θ-drag during the slide, which THE EYE never performs and the founder_drive dump (11 drags, none on theta_deg) never reached; (2) vg has no timed control-reveal, so the drag cannot be gated. Fix: STATE_6 M2 (the line with rotate on theta_deg) has NO offset — it only rotates; M1 (never rotates) carries the slide. Acceptance probe sweeps the full θ[25,115] × aux_a[−1.5,1.5] grid on the shipped JSON: worst apex miss 0.0000 wu, PASS (quality_auditor pass 5 reproduced 0.000001 wu independently). Narration s6_2 became "Slide one line along itself: the angle does not change." The lesson for the DO line: a knob that MOVES an object and a knob that TURNS it may not share a line unless the engine rotates the offset with the direction.',
  },
  {
    bug_class: 'vg_lp_angle_arc_apex_rides_its_own_lines_offset_away_from_the_reference_it_measures_against',
    marker: 'RECURRENCE MEASURED 2026-08-20 on STATE_7',
    note: ' RECURRENCE MEASURED 2026-08-20 on STATE_7 (both gates, independently): arc_normal and arc_plane are anchored at Lcut\'s anchor (arcApex = lnA.anchor, ' + R + ':13508 — no apex override is authorable for a line↔normal or line↔plane arc), which sits ~250 px from the green normal arrow and ~14-29 px from the shadow they measure to; each arc has exactly ONE drawn arm (the amber line) and terminates in empty space (t=16000: arc ink bbox x[576-624] y[398-438]; normal x[641-669] y[310-374]; shadow x[503-752] y[362-384]). The 55 + 35 = 90 decomposition is carried by the HUD rows, not the picture. This is the row\'s class exactly; the stepped radii (0.62 / 0.95, closed 2026-08-20) fixed separability, not anchoring. Not re-routed: the remedy is an apex address for line↔plane arcs (the line-plane meeting point, which F14 already computes), i.e. engine, founder call.',
  },
  {
    bug_class: 'skeleton_pacing_table_drifts_from_the_shipped_json_on_a_state_the_state_table_describes_correctly',
    marker: 'SECOND SWEEP 2026-08-20 (pass 4)',
    note: ' SECOND SWEEP 2026-08-20 (pass 4): the fix-round sweep that closed this row corrected five cells and left SIX more, two of them describing behaviour the renderer cannot produce at all (S3 "11000-12500 formula surface writes", S8 "12000-15000 formula surface" — the vg #formula_overlay has no timed reveal; see vg_formula_overlay_has_no_timed_reveal_so_the_formula_is_on_screen_before_the_beat_that_derives_it), plus S6 0-2000 / S7 2000-7000 / S9 0-2500 / S1 0-2000 windows and a duplicated fragment "11000-12500 11000-12500". The architect regenerated every §12 cell from the JSON (pass-5 cross-check: all 9 states match exactly) and the Words column from the shipped text_en (twice — the first pass was off by one on two rows). The generalisation this row proposes — gate the pacing table against the build — is now demonstrably the only thing that closes the class: three rounds of hand-sweeping each left residue.',
  },
  {
    bug_class: 'rule31_motion_floor_satisfied_by_a_late_label_reveal_over_a_frozen_canvas',
    marker: 'MEASURED 2026-08-20 on lines_and_planes_in_space',
    note: ' MEASURED 2026-08-20 on lines_and_planes_in_space: the DoD asserted "≥ 75 % continuous motion on every state so this row cannot be satisfied vacuously" and the build held byte-identical frames for 8-15 s on five states (closed under state_duration_authored_longer_than_its_choreography_so_narration_plays_over_a_frozen_canvas). A blanket percentage in a DoD is not a measurement; the per-state longest-static-run table in §12, re-measured by THE EYE, is.',
  },
  {
    bug_class: 'teach_visual_must_match_narration',
    marker: 'INSTANCE 2026-08-20 STATE_6 s6_2',
    note: ' INSTANCE 2026-08-20 STATE_6 s6_2 ("Slide one line along itself: the angle does not change.") narrated over a canvas on which nothing legibly slid — twice: first a geometric no-op (0-3 px/s), then a same-colour collinear arrow (52-99 px/s). Both passed THE EYE. Closed by the lambda_span + anchor-point carrier (261-560 px/s, run 20260820-211735).',
  },
];

const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];
function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }

function emitSql(): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, fixed_at';
  const ins = ROWS.map((r) =>
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ` +
    `${sqlStr(r.row_type)}, ${r.fixed_at ? sqlStr(r.fixed_at) : 'NULL'})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status, fixed_at = EXCLUDED.fixed_at,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files, concepts_affected = EXCLUDED.concepts_affected\n` +
    `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${r.marker}%`)}\n` +
    `  AND engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n`).join('\n');
  const upd = UPDATES.map((u) => {
    const sets = [`root_cause = root_cause || ${sqlStr(u.note)}`];
    if (u.status) sets.push(`status = ${sqlStr(u.status)}`, `fixed_at = ${sqlStr(u.fixed_at!)}`, `fixed_in_files = ${sqlArr(u.fixed_in_files!)}`);
    return `UPDATE engine_bug_queue SET\n  ${sets.join(',\n  ')}\n` +
      `WHERE bug_class = ${sqlStr(u.bug_class)}\n  AND root_cause NOT LIKE ${sqlStr(`%${u.marker}%`)};\n`;
  }).join('\n');
  return `-- 2026-08-20 — lines_and_planes_in_space, CP-B ROUND 1 (pass-4/pass-5 audit fix round):\n` +
    `-- ${ROWS.filter(r => r.status === 'OPEN').length} new OPEN rows (engine/tooling, each a founder call), ` +
    `${ROWS.filter(r => r.status === 'FIXED').length} new rows filed already FIXED (authoring classes found and closed\n` +
    `-- inside the round), ${UPDATES.filter(u => u.status).length} existing row CLOSED by authoring, ` +
    `${UPDATES.filter(u => !u.status).length} marker-gated annotations.\n` +
    `-- THE EYE returned 39/40 on every capture of this round (the 1 is the known STATE_9:D5 false positive).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb_round1.ts from the SAME structures\n` +
    `-- the TS path applies. Idempotent, order-independent, never a downgrade.\n\n` + ins + '\n' + upd;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-20_seed_engine_bug_queue_lines_and_planes_cpb_round1_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} inserts + ${UPDATES.length} updates)`);

  for (const r of ROWS) {
    const { marker, ...row } = r;
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (ex?.root_cause?.includes(marker)) { console.log(`⏭  ${row.bug_class} — marker present`); continue; }
    if (ex && PROTECTED.includes(ex.status)) {
      console.log(`⏭  ${row.bug_class} — live status ${ex.status}; REFUSING to overwrite a protected row`); continue;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ filed ${row.bug_class} (${row.severity}/${row.status})`);
  }

  for (const u of UPDATES) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status').eq('bug_class', u.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${u.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ expected existing row ${u.bug_class} — refusing to create as a side effect.`); process.exit(1); }
    if ((ex.root_cause ?? '').includes(u.marker)) { console.log(`⏭  ${u.bug_class} — marker present`); continue; }
    const patch: Record<string, unknown> = { root_cause: (ex.root_cause ?? '') + u.note };
    if (u.status) { patch.status = u.status; patch.fixed_at = u.fixed_at; patch.fixed_in_files = u.fixed_in_files; }
    const { error } = await supabaseAdmin.from('engine_bug_queue').update(patch).eq('bug_class', u.bug_class);
    if (error) { console.error(`✗ update ${u.bug_class}: ${error.message}`); process.exit(1); }
    console.log(u.status ? `✓ ${u.bug_class} → FIXED` : `✓ annotated ${u.bug_class} (status unchanged: ${ex.status})`);
  }

  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}

main();
