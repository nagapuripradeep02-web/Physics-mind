/**
 * engine_bug_queue — `lines_and_planes_in_space` Checkpoint B VERIFICATION PASS, 2026-08-26.
 *
 * The round: founder_proxy was asked to verify three fixes (F-2, F-3, F-7). It closed two of them,
 * and found that the THIRD FIX HAD SHIPPED A P1 OF ITS OWN — F-7 unfroze the explore state's second
 * view by copying another knob's animate window, amplitude included, onto a knob whose amplitude was
 * a function of the geometry it drives. The view then animated the "skew pair" through an exact
 * intersection twice per loop, under its own caption saying the lines miss each other.
 *
 * FIVE rows. Two are filed already FIXED (both closed in this same round, so the CLASS is what
 * ratchets, not the incident); three are OPEN. The two OPEN harness rows are the ones with reach
 * beyond this concept: no automated gate in the pipeline has ever entered a partitioned explore
 * state's second scene_group, and the Rule-37 motion probe cannot fail. Between them they are why
 * F-7's original freeze AND the P1 its fix introduced both survived to cycle 3.
 *
 * Row texts are founder_proxy's own drafts, with the two amendments it issued after re-grading
 * (rows 1 and 5 → FIXED + fixed_in_files). Applying is a founder action; this file is the apply.
 *
 * Machinery (marker gate, protected-status refusal, derived column list, read-back verification) is
 * the hardened version from _seed_engine_bug_queue_vg_readout_subject_label.ts — deliberately reused
 * rather than re-typed, because a second copy of it is the same prose-linked-duplicate defect these
 * rows are about.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb_verification.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-26_founder_proxy_cpb_verification';
const FIXED_AT = '2026-08-26T18:30:00.000Z';
const CJ = 'src/data/concepts/mathematics/lines_and_planes_in_space.json';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  discovered_in_session: string;
  row_type: 'incident'; fixed_at: string | null;
  /** NOT a column — the idempotence marker, stripped before any write. */
  marker: string;
}
/** Exactly the columns, with `marker` gone: the ONE shape both paths read. */
type BugRow = Omit<Row, 'marker'>;

const ROWS: Row[] = [
  {
    bug_class: 'explore_animation_sweeps_geometry_through_the_degenerate_configuration_its_own_view_label_denies',
    title: 'The explore state\'s "skew pair" view animated the two lines through an exact intersection twice per 18 s loop — picker "skew pair", caption "the two lines that miss each other", readout "shortest distance = 0.047", and the lines visibly crossing at one point',
    severity: 'CRITICAL',
    owner_cluster: 'alex:json_author',
    root_cause:
      'F-7 unfroze STATE_9 view B by appending two line2_offset animate entries that mirrored lambda\'s window shape AND '
      + 'lambda\'s amplitude (±2.5). M2.offset.along is the UNIT common-perpendicular direction d1xd2/||d1xd2|| — verified, not '
      + 'assumed: its dot with unit(cross(d1,d2)) is 1.0 and its norm is 1.0 — so the knob translates M2 along the very axis the '
      + 'skew distance is measured on: D(t) = |1.800 + t|, zero at t = -1.800, which lies INSIDE the copied ±2.5 range. '
      + 'THE WINDOW SHAPE WAS TRANSFERABLE BETWEEN KNOBS; THE AMPLITUDE WAS NOT — it had to be derived from the geometry the knob '
      + 'drives. Crossings land at t≈1.26 s and t≈16.74 s of every loop, the first 1.3 s after the view opens, unattended, with no '
      + 'framing anywhere on canvas. At the crossing the green common_perp — the object carrying STATE_8\'s entire "the gap runs '
      + 'along d1 x d2" lesson — collapses to nothing, the HUD reads "shortest distance = 0.047", the picker reads "view: skew pair" '
      + 'and the subtitle reads "the two lines that miss each other". The concept\'s own q5 lists "intersecting — every non-parallel '
      + 'pair meets" as a DISTRACTOR; the idle loop demonstrated the distractor. SECOND HALF OF THE SAME TWO NUMBERS: the sweep '
      + 'started at -2.5, so the view OPENED at D = 0.700 rather than the D = 1.800 that STATE_8 teaches with byte-identical M1/M2 '
      + 'anchors and directions — a Rule 32d home-pose break across the S8->S9 cut. '
      + 'FIXED 2026-08-26 by bounding the sweep to 0.0 -> +2.5 -> 0.0 (windows [0,9000]/[9000,18000] and linear easing unchanged): '
      + 'D in [1.800, 4.300], never degenerate, opening on exactly STATE_8\'s taught value and closing the loop on the authored '
      + 'zero so the t=1000 === t=19000 loop argument survives verbatim. Verified LIVE against the served build, 85 samples across a '
      + 'full loop: min 1.800 at the wrap, max 4.262, clean V, no discontinuity. The SLIDER range stays -2.5..2.5 deliberately — a '
      + 'teacher dragging the pair into contact is a good teaching move; the defect was the IDLE LOOP doing it unbidden.',
    prevention_rule:
      'WHEN AN animate[] KNOB DRIVES AN OFFSET ALONG A DIRECTION THAT A value_readout MEASURES, SOLVE FOR THE KNOB VALUE THAT MAKES '
      + 'THE READOUT ZERO BEFORE CHOOSING from/to. If the degenerate value lies inside the sweep, bound the sweep away from it. '
      + 'Never copy another knob\'s AMPLITUDE — only its window shape: timing is a property of the narration, amplitude is a property '
      + 'of the geometry, and the two are not transferable together. '
      + 'AND THE HALF THAT GENERALISES BEYOND ANIMATION: A VIEW WHOSE PICKER LABEL OR CAPTION ASSERTS A CONFIGURATION (skew, '
      + 'parallel, perpendicular, non-contact) MUST HOLD THAT CONFIGURATION AT EVERY INSTANT OF ITS IDLE LOOP. A sim that contradicts '
      + 'its own label is worse than one that shows nothing, because the label is the only text a silent teacher has; and an explore '
      + 'state is the one place a teacher parks the picture and talks over it, so its worst instant is on screen longer than any '
      + 'guided frame. Check the extremes of every sweep against the claim the state makes, not just the midpoint.',
    probe_type: 'js_eval',
    probe_logic:
      'For each explore scene_group, drive the sim past narration end, sample every value_readout at 300 ms across a full '
      + 'animate_loop_ms, and FAIL if any readout whose name asserts a separation (skew_distance, point_plane_distance, gap, '
      + 'clearance) falls below 5% of its own loop maximum while the group\'s picker label or the state narration asserts '
      + 'non-contact. THE DISCRIMINATING QUANTITY IS THE READOUT\'S MINIMUM OVER THE WHOLE LOOP, not its value at any sampled '
      + 'instant — the defect is invisible at the midpoint and at both endpoints of this very sweep. '
      + 'CHEAP ANALYTIC FORM, which is what actually caught it: for every animate entry whose knob feeds an offset.along, dot that '
      + 'direction with the unit common perpendicular (or the plane normal, for a point-plane distance). Where |dot| is ~1 the knob '
      + 'moves the measured quantity one-for-one, so solve D(t) = 0 in closed form and assert the root lies OUTSIDE [from, to]. '
      + 'CONFIRMED ON THE FIX: min 1.800 at the loop wrap (t=36000 ms in a two-loop capture), max 4.262, 85/85 samples carrying a '
      + 'reading, wrap continuity 1.898 / 1.800 / 1.898 — and since D(t) = |1.800 + t| with t in [0, 2.5], the wrap IS the minimum '
      + 'by construction as well as by measurement. '
      + 'NEGATIVE CONTROL: the pre-fix sweep (-2.5 -> 2.5) must FAIL this probe, reading 0.047 at t=19312 ms with the lines visibly '
      + 'crossing — which it does; a probe that passes on both builds is measuring the wrong thing.',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [CJ],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: FIXED_AT,
    marker: 'THE WINDOW SHAPE WAS TRANSFERABLE BETWEEN KNOBS; THE AMPLITUDE WAS NOT',
  },
  {
    bug_class: 'every_visual_gate_captures_only_the_default_scene_group_so_a_partitioned_explore_states_other_view_is_ungated',
    title: 'THE EYE and founder_drive both capture a group-partitioned explore state in its authored default scene_group only, so the other view is invisible to every automated gate — it shipped frozen through three Checkpoint-B cycles, and the fix for that freeze then shipped a new P1 through the same blind spot',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'visual_eyes.ts captures STATE_9 at the authored scene_group ("A"), and founder_drive.ts\'s dragVisibleSliders selects '
      + 'input[type="range"]:visible while the non-default group\'s slider rows are display:none — so line2_offset and theta_deg '
      + 'appeared in ZERO of the drive\'s 11 recorded drags and the Rule-37 motion probe measured group A. NEITHER HARNESS OPERATES '
      + 'THE SCENE-GROUP <select> AT ALL. The default group therefore stands in for the whole state in every gate: THE EYE, '
      + 'eye_walker, quality_auditor and founder_drive all report on half the sandbox, and all four report it as if it were the '
      + 'whole. '
      + 'THE COST, MEASURED TWICE IN ONE CONCEPT: F-7 (the explore state\'s second view was a still picture for its entire captured '
      + 'life) survived to Checkpoint B cycle 3 because no gate had ever rendered that view in motion. Then the FIX for F-7 shipped '
      + 'a CRITICAL of its own — the skew pair animated through an exact intersection twice per loop — and every gate passed it '
      + 'again, for the same reason. A blind spot that hides a defect will equally hide the defect introduced by its repair, which '
      + 'is what makes this MAJOR rather than a coverage nicety. '
      + 'THIRD INDEPENDENT DEMONSTRATION, same round: the session verifying the fix had to drive the picker BY HAND in a bespoke '
      + 'probe script to see the defect at all, because nothing in the harness could reach it.',
    prevention_rule:
      'A HARNESS THAT CAPTURES AN EXPLORE STATE MUST ENUMERATE THE SCENE-GROUP PICKER AND REPEAT ITS MOTION, DRAG AND COLLISION '
      + 'PASSES ONCE PER GROUP. A gate that samples only the authored default is reporting on a fraction of the state and must not '
      + 'be read as covering it. '
      + 'THE GENERAL FORM: WHEN AUTHORING CAN PARTITION A STATE INTO ALTERNATIVE VIEWS, THE GATE\'S UNIT OF COVERAGE IS THE VIEW, '
      + 'NOT THE STATE. Any control that swaps which objects exist — a scene_group picker, a preset selector, a depth-ring cut — '
      + 'multiplies the surface a gate must walk, and a harness that predates the control will silently keep reporting the old unit. '
      + 'Corollary for the reader of a report: "9 states captured" is not "the concept captured" the moment any state has more than '
      + 'one view, and a skip is not evidence.',
    probe_type: 'js_eval',
    probe_logic:
      'Read field_3d_config.states.<explore>.vg.scene_groups[]. If it has more than one entry, assert the run directory contains a '
      + 'per-group frame set and a per-group drag record; FAIL when any declared group has no captured evidence. '
      + 'THE DISCRIMINATING QUANTITY IS THE SET OF DECLARED GROUPS MINUS THE SET OF GROUPS WITH EVIDENCE — not the frame count, '
      + 'which is already high and stays high while an entire view goes unvisited. '
      + 'This probe is a COVERAGE assertion over the harness output, deliberately not a rendering assertion: it fails on the run '
      + 'directory, before any pixel is judged, so it cannot be satisfied by a view that was captured but not exercised. '
      + 'NEGATIVE CONTROL: the 2026-08-26 run of lines_and_planes_in_space — .founder_runs/2026-08-26T15-54-35-354Z/manifest.json '
      + 'records 11 drags, none of them line2_offset or theta_deg, and .visual_runs/20260826-183041/ contains no group-B frame. '
      + 'Both must FAIL this probe; both passed every gate that existed at the time.',
    status: 'OPEN',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'NEITHER HARNESS OPERATES THE SCENE-GROUP <select> AT ALL',
  },
  {
    bug_class: 'founder_drive_rule37_motion_probe_runs_after_its_own_slider_drags_so_a_drag_seized_scene_is_scored_by_noise',
    title: 'The Rule-37 explore motion probe fires after the drive has dragged every explore slider, so on any concept whose only animated explore knob is also a slider the probe measures a legitimately drag-seized still scene — it reported bytesEqual:false ("alive") on a scene measured at 0 changed pixels over 4 seconds',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'founder_drive.ts drags every visible explore slider, THEN shoots motion_probe_a/b. field_3d_renderer.ts knob() permanently '
      + 'returns the live value ahead of vgAnimValue once a trusted drag sets the row\'s Dragged flag — which is the CORRECT '
      + 'contract, fleet-wide and deliberate: a teacher who sets a value wants it held. So the probe\'s two frames are taken from a '
      + 'scene THE HARNESS ITSELF JUST FROZE, and the byte-equality verdict is then decided by anti-alias jitter rather than by '
      + 'motion. THE PROBE CANNOT FAIL, WHICH MEANS IT PROVES NOTHING — and it is reported as a Rule-37 result, i.e. as evidence '
      + 'about exactly the property it can no longer see. '
      + 'MEASURED on lines_and_planes_in_space: group A moved 838 changed px per 3 s BEFORE the lambda drag and 0 px per 3 s and '
      + '0 px per 4 s AFTER it, while the same run\'s manifest recorded motionProbe.bytesEqual:false. A session read that manifest '
      + 'as proof the explore state was alive and reported it as such; it was not evidence either way. '
      + 'THE COMPOUNDING FAILURE: this concept\'s explore state genuinely WAS frozen in its other view (see '
      + 'every_visual_gate_captures_only_the_default_scene_group...), so the one probe designed to catch a frozen explore state was '
      + 'structurally incapable of catching it, on the very concept where it was frozen.',
    prevention_rule:
      'A MOTION PROBE MUST RUN ON A SCENE THE HARNESS HAS NOT ITSELF ALTERED — shoot it BEFORE the drag pass, or re-enter the state '
      + 'to clear the drag-seize flags first. '
      + 'AND: A PASS/FAIL ON BYTE EQUALITY IS ONLY MEANINGFUL WHEN THE MEASURED DELTA IS COMPARED AGAINST A SAME-STATE BASELINE. '
      + 'Report a changed-pixel COUNT, not a boolean: a count carries its own scale, so a reader can see that 0 px and 80000 px both '
      + 'produced "not equal" and know which one they are looking at. '
      + 'THE TRANSFERABLE HALF: WHEN A HARNESS BOTH PERTURBS A SYSTEM AND MEASURES IT, THE ORDER OF THOSE TWO ACTS IS PART OF THE '
      + 'CLAIM. State it in the assertion text, so a reader who trusts the output can see what it was measured against — a probe '
      + 'whose result is an artifact of its own earlier step is indistinguishable from a passing probe at the point of reading.',
    probe_type: 'js_eval',
    probe_logic:
      'In founder_drive, capture the Rule-37 probe pair BEFORE dragVisibleSliders and record a changed-pixel count (pixelmatch), '
      + 'not a byte comparison; FAIL when the pre-drag count is under 0.1% of canvas. '
      + 'THE DISCRIMINATING QUANTITY IS THE PRE-DRAG CHANGED-PIXEL COUNT. A post-drag count is uninterpretable by construction, '
      + 'because drag-seize is correct behaviour and a still scene is the RIGHT answer there. '
      + 'ASSERT ALSO, as the self-check that keeps this honest: the manifest records WHICH of the two orders was used, so a future '
      + 'reader never has to infer it from the code that produced the file. '
      + 'NEGATIVE CONTROL: the pre-fix order reproduces the artifact on demand — drag lambda on lines_and_planes_in_space STATE_9 '
      + 'group A, then measure: 0 changed px over 3 s and over 4 s, while byte comparison still yields "not equal". The control is '
      + 'the point: the OLD probe returns its healthy verdict on a provably frozen scene.',
    status: 'OPEN',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'THE PROBE CANNOT FAIL, WHICH MEANS IT PROVES NOTHING',
  },
  {
    bug_class: 'a_label_widened_after_placement_is_certified_by_absence_of_overlap_instead_of_against_the_margin_it_was_placed_with',
    title: 'A 3D sprite label was widened ~80% after its position had been solved for a specific margin, and the pixel check that cleared it asked only "does it overlap?" — the margin had in fact fallen from a recorded 16.1 px to 6-7 px, below the concept\'s own 12 px collision bar',
    severity: 'MODERATE',
    owner_cluster: 'alex:json_author',
    root_cause:
      'STATE_7\'s arc_plane_tag was positioned by the B3 repair for SCREEN-PERPENDICULAR clearance, and its own placement note '
      + 'recorded the result: 16.1 px at camera entry, 14.6 px at the mid pose, measured on the bare string "35.0°". F-2 then '
      + 'relabelled it to "θ = 35.0°" — 5 glyphs to 9 — to bind the formula surface\'s otherwise unbound θ. pmCreateAutoLabel draws '
      + 'into a CENTERED auto-width canvas, so roughly half the added width moves the ink\'s near edge toward the down-sloping '
      + 'shadow-line stroke. json_author explicitly REFUSED to certify the placement and asked for a pixel check. '
      + 'THE PIXEL CHECK THAT WAS RUN ANSWERED A DIFFERENT QUESTION THAN THE ONE ASKED: it confirmed no overlap and no clipping, '
      + 'and stopped. Per-column measurement of clear background between the label\'s topmost ink and the nearest stroke ink above '
      + 'it gives 7 px at t=14700/16100/frozen and 6 px at t=19600/23800 — a 56% erosion, below the 12 px bar the concept set for '
      + 'itself. Graded P3 rather than higher on the evidence (at 10x there is zero overlap, full contrast, and it reads instantly '
      + 'at 1x), and the binding is a real teaching gain worth keeping — but the number was never measured until a second reviewer '
      + 'asked for it specifically.',
    prevention_rule:
      'WHEN A LABEL\'S POSITION WAS SOLVED AGAINST A MEASURED MARGIN, ANY LATER CHANGE TO ITS TEXT INVALIDATES THAT MEASUREMENT. '
      + 'Re-measure the MARGIN — minimum clear background between label ink and the nearest stroke ink, at every camera pose the '
      + 'label is visible in — and compare it to the recorded figure. "No overlap" answers a different question than the one the '
      + 'placement note asked, and it will keep answering it right up until the moment the two touch. '
      + 'THE FAMILY THIS BELONGS TO: a value derived once, written down as a literal, with the dependency surviving only as prose — '
      + 'the same class as label_separation_is_a_function_of_the_authored_camera_and_no_gate_recomputes_it_when_the_camera_moves and '
      + 'readout_family_label_is_a_hardcoded_constant_so_renaming_an_authored_object_makes_the_panel_name_the_wrong_one. Here the '
      + 'derived value is a MARGIN and the thing that moved is the label\'s own width. '
      + 'AND FOR THE REVIEWER: WHEN AN AUTHOR REFUSES TO CERTIFY SOMETHING AND NAMES THE QUANTITY THEY COULD NOT MEASURE, THE CHECK '
      + 'THAT DISCHARGES IT MUST MEASURE THAT QUANTITY. Discharging a named doubt with an adjacent, easier measurement is how a '
      + 'refusal becomes a rubber stamp.',
    probe_type: 'js_eval',
    probe_logic:
      'For every points[] entry with size 0 and a non-null label, scan each column of the label\'s ink bbox in the rendered frame, '
      + 'find the nearest non-background run above it, and report the MINIMUM CLEAR GAP at every camera_steps pose; FAIL when it '
      + 'falls below the value recorded in the entry\'s own placement note. '
      + 'THE DISCRIMINATING QUANTITY IS THE GAP IN PIXELS, NOT THE PRESENCE OF OVERLAP — overlap is the gap having already reached '
      + 'zero, i.e. the last moment at which the defect can be detected rather than the first. '
      + 'THE PROBE MUST SAMPLE EVERY CAMERA POSE FROM THE LABEL\'S REVEAL TO THE STATE\'S END, because the margin is a function of '
      + 'the projection: on this concept the tightest pose is 2 px worse than entry and arrives 9 s later. '
      + 'NEGATIVE CONTROL: the pre-F-2 label ("35.0°", 5 glyphs) must measure ~16 px at entry and the post-F-2 label ("θ = 35.0°", '
      + '9 glyphs) ~7 px at the same pose, from the same rendered frames — the probe has to see the erosion the string change '
      + 'caused, or it is not measuring the margin at all.',
    status: 'OPEN',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'THE PIXEL CHECK THAT WAS RUN ANSWERED A DIFFERENT QUESTION THAN THE ONE ASKED',
  },
  {
    bug_class: 'a_claim_corrected_across_every_rendered_surface_survives_verbatim_in_the_unrendered_spec_field_that_defines_it',
    title: 'A false universal was corrected on all five rendered surfaces of a state and survived word-for-word in assessment.mastery_definition — the field a future author and reviewer read as the specification of what the state teaches',
    severity: 'MODERATE',
    owner_cluster: 'alex:json_author',
    root_cause:
      'F-3 scoped STATE_4\'s claim to "a line off the plane meets it once, or never" across the state title, the field_3d_config '
      + 'label, one_line_fix, s4_4 and s4_1. assessment.mastery_definition still read "classify a line-plane pair as meeting once or '
      + 'never from the sign of n·d". THE SWEEP WAS DRIVEN BY WHAT RENDERS, and mastery_definition renders nowhere — 0 hits in the '
      + 'built index.html and sim.html — so it was never enumerated. It reached no student, which is exactly why it is MODERATE and '
      + 'not higher; but it is the field a future author reads as the state\'s specification, and it now contradicted the shipped '
      + 'teaching. The concept knew better elsewhere: q4 had ALWAYS been correctly scoped ("A line has n · d = 0, and its own point '
      + 'is not on the plane"), with a distractor naming the contained case — so the same file simultaneously held the right '
      + 'formulation and the wrong one. '
      + 'FIXED 2026-08-26 in the same round it was found, together with the STATE_9 P1, so the concept shipped internally consistent.',
    prevention_rule:
      'A CORRECTION TO A TAUGHT CLAIM IS SWEPT OVER EVERY SURFACE THAT STATES IT, NOT ONLY THE SURFACES THAT RENDER: state title, '
      + 'on-canvas label, caption, narration, misconception_watch, aha_moment, coverage_map, assessment.mastery_definition and every '
      + 'question stem. Grep the corrected phrase across the whole concept file and ACCOUNT FOR EACH HIT before declaring the fix '
      + 'applied — "account for" including a deliberate decision to leave one, recorded. '
      + 'THE REASON THIS IS NOT PEDANTRY: an unrendered spec field is read by the next author as the statement of what the state is '
      + 'for. A rendered surface that drifts gets caught by eyes on the sim; a spec field that drifts gets caught by nobody, and '
      + 'then propagates into the next concept that copies its shape. The blast radius of a stale spec is later work, not this '
      + 'student. '
      + 'GENERAL FORM: WHEN THE SET OF SURFACES TO FIX IS DERIVED FROM "WHAT THE USER SEES", THE SURFACES THAT ONLY THE TEAM SEES '
      + 'ARE STRUCTURALLY EXCLUDED — and those are precisely the ones that specify the work.',
    probe_type: 'js_eval',
    probe_logic:
      'After any narration or title edit, grep the concept JSON for the PRE-EDIT phrase across ALL string values (not just rendered '
      + 'paths) and FAIL on any surviving occurrence outside a _design_note or _history field. '
      + 'THE DISCRIMINATING QUANTITY IS THE COUNT OF SURVIVING OCCURRENCES IN NON-RENDERED FIELDS — the rendered ones are already '
      + 'covered by eyes on the sim and by THE EYE, and a probe that only re-checks those adds nothing. '
      + 'IMPLEMENTATION NOTE that makes it runnable: walk the parsed JSON, not the file text, so the field PATH of each hit is '
      + 'reportable (a bare grep says the phrase survives but not where, and "where" is the entire finding here). '
      + 'NEGATIVE CONTROL: the pre-fix lines_and_planes_in_space JSON — the corrected phrase "meeting once or never" must be found '
      + 'in assessment.mastery_definition and NOT in any of the five rendered surfaces, which is the exact asymmetry that defines '
      + 'this class.',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [CJ],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: FIXED_AT,
    marker: 'THE SWEEP WAS DRIVEN BY WHAT RENDERS',
  },
];

const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];
/**
 * Columns a re-run may FILL on a protected row but never CHANGE. Provenance is
 * not judgement: a NULL here is an absence, never a curated decision, and the
 * one thing worse than a re-run rewriting a FIXED row's narrative is the
 * archival SQL and the live row disagreeing about where the row came from.
 */
const PROVENANCE: (keyof BugRow)[] = ['discovered_in_session'];

/** The row, with the non-column marker stripped. The ONLY place that happens. */
function rowOf(r: Row): BugRow { const { marker, ...row } = r; return row; }

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlVal(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (Array.isArray(v)) return sqlArr(v as string[]);
  return sqlStr(String(v));
}

// ── THE COLUMN LIST IS DERIVED FROM THE ROW OBJECT, NEVER RESTATED ─────────
//   This used to be a hand-written string constant sitting beside an object
//   literal, and it drifted the only way it could: the string named
//   discovered_in_session and synthesised a value the object did not carry, so
//   the emitted SQL and the executed upsert disagreed about one column and both
//   reported success. Deriving the list means there is no second list to drift
//   from — a field added to the row appears in the SQL automatically, and a
//   field the SQL wants that the row does not have is now unwritable.
const COLS = Object.keys(rowOf(ROWS[0])) as (keyof BugRow)[];
//   Columns a conflicting re-run must NOT overwrite: the conflict key, the
//   row's type, and its provenance (which records the round that FIRST found
//   the class, not the round that last touched it).
const IMMUTABLE_ON_CONFLICT: (keyof BugRow)[] = ['bug_class', 'probe_type', 'row_type', ...PROVENANCE];

function emitSql(): string {
  const ins = ROWS.map((r) => {
    const row = rowOf(r);
    const setList = COLS.filter((c) => IMMUTABLE_ON_CONFLICT.indexOf(c) < 0)
      .map((c) => `  ${c} = EXCLUDED.${c}`).join(',\n');
    return `INSERT INTO engine_bug_queue (${COLS.join(', ')}) VALUES\n` +
      `(${COLS.map((c) => sqlVal(row[c])).join(', ')})\n` +
      `ON CONFLICT (bug_class) DO UPDATE SET\n${setList}\n` +
      `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${r.marker}%`)}\n` +
      `  AND engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n\n` +
      `-- Provenance repair: a protected row is never overwritten, but a NULL\n` +
      `-- provenance column is FILLED (an absence, not a decision).\n` +
      `UPDATE engine_bug_queue SET discovered_in_session = ${sqlVal(row.discovered_in_session)}\n` +
      `WHERE bug_class = ${sqlStr(row.bug_class)} AND discovered_in_session IS NULL;\n`;
  }).join('\n');
  return `-- 2026-08-26 — lines_and_planes_in_space Checkpoint B VERIFICATION PASS.\n` +
    `-- ${ROWS.length} rows: 2 filed already FIXED (closed this round), 3 OPEN.\n` +
    `-- The two OPEN harness rows (E-1, E-2) are the reach beyond this concept.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vg_readout_subject_label.ts. The column\n` +
    `-- list below is DERIVED from the same object the TS path upserts (Object.keys), so the two\n` +
    `-- cannot name different columns; the TS path then VERIFIES the write by reading it back.\n` +
    `-- Idempotent, order-independent, never a downgrade.\n\n` + ins;
}

/**
 * Columns Postgres stores as timestamptz. They round-trip in a DIFFERENT STRING
 * FORM than they were sent in ('...T21:00:00.000Z' out, '...T21:00:00+00:00'
 * back) while denoting the SAME INSTANT, so they are compared as instants. This
 * is a semantic normalisation, deliberately narrow and deliberately named — not
 * a loosened comparison. Every other column is compared byte for byte.
 */
const INSTANT_COLS: (keyof BugRow)[] = ['fixed_at'];

function sameValue(col: keyof BugRow, sent: unknown, live: unknown): boolean {
  if (INSTANT_COLS.indexOf(col) >= 0) {
    if (sent == null || live == null) return (sent ?? null) === (live ?? null);
    const a = Date.parse(String(sent)), b = Date.parse(String(live));
    return Number.isFinite(a) && Number.isFinite(b) && a === b;
  }
  return JSON.stringify(sent ?? null) === JSON.stringify(live ?? null);
}

/** Read the row back and prove every column landed as sent. */
async function verifyWrite(row: BugRow): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue').select(COLS.join(',')).eq('bug_class', row.bug_class).maybeSingle();
  if (error) return [`read-back failed: ${error.message}`];
  if (!data) return ['read-back found no row'];
  const live = data as unknown as Record<string, unknown>;
  return COLS.filter((c) => !sameValue(c, row[c], live[c]))
    .map((c) => `${c}: sent ${JSON.stringify(row[c] ?? null)}, live ${JSON.stringify(live[c] ?? null)}`);
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-26_seed_engine_bug_queue_lines_and_planes_cpb_verification_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} insert, ${COLS.length} columns: ${COLS.join(', ')})`);

  let bad = 0;
  for (const r of ROWS) {
    const row = rowOf(r);
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status,discovered_in_session')
      .eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }

    const protectedRow = !!ex && PROTECTED.includes(ex.status);
    const markerPresent = !!ex?.root_cause?.includes(r.marker);
    if (markerPresent || protectedRow) {
      // NEVER overwrite a curated row — but FILL a provenance column that is
      // absent, which is what the pre-fix version of this script left behind.
      const missing = PROVENANCE.filter((c) => (ex as Record<string, unknown>)[c] == null);
      if (missing.length) {
        const patch: Record<string, unknown> = {};
        for (const c of missing) patch[c] = row[c];
        const { error } = await supabaseAdmin.from('engine_bug_queue')
          .update(patch).eq('bug_class', row.bug_class).is(missing[0], null);
        if (error) { console.error(`✗ provenance repair ${row.bug_class}: ${error.message}`); process.exit(1); }
        console.log(`↻  ${row.bug_class} — provenance filled (${missing.join(', ')}); no other column touched`);
      } else {
        console.log(`⏭  ${row.bug_class} — ${markerPresent ? 'marker present' : `live status ${ex!.status}; REFUSING to overwrite a protected row`}`);
      }
    } else {
      const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
      if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
      console.log(`✓ filed ${row.bug_class} (${row.severity}/${row.status})`);
    }

    // THE GATE THE FIRST VERSION LACKED: "it reported success" is not evidence.
    const drift = await verifyWrite(row);
    if (drift.length) { bad += drift.length; for (const d of drift) console.error(`✗ DRIFT ${row.bug_class} — ${d}`); }
    else console.log(`   ✓ read-back: all ${COLS.length} columns match the object that was sent`);
  }
  if (bad) { console.error(`\n${bad} column(s) diverged between the object sent and the row stored`); process.exit(1); }

  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}

main();
