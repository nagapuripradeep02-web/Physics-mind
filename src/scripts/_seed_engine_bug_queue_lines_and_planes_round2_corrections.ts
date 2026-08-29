/**
 * engine_bug_queue — #9 `lines_and_planes_in_space` ROUND-2 CORRECTIONS, committed
 * to the record 2026-08-09. Fix-list item §2a of docs/MATHEMATICS_LINES_AND_PLANES_HANDOFF.md.
 *
 * WHAT THIS IS. Between the round-1 seed scripts and the xhigh review, five platform
 * fixes landed on master (PRs #90/#91/#93/#94/#95) and one authoring fix landed on the
 * branch (the Lpar.dir exact-direction fix). Their queue writes — four FIXED statuses,
 * a CRITICAL escalation, a FALSE_POSITIVE retraction, the fix records appended to
 * root_cause, and TWO ENTIRE ROWS (the deriveStateMeta reveal-pin row and the
 * parallel-direction row) — were applied to the live DB only. A correction that exists
 * only in a database is not in the record at all; this script IS the record.
 *
 * WHAT IT WRITES — full-truth captures of the corrected rows, upserted with a per-row
 * marker guard (a substring unique to each fix record) so every statement is
 * idempotent AND order-independent against the sibling migrations: replaying the whole
 * 2026-08-09 set from an empty queue converges to the live truth in ANY order, because
 * the round-1 files refuse protected rows and this file refuses rows already carrying
 * its markers. Never a downgrade: every status written here is FIXED.
 *
 * ONE FACTUAL CORRECTION riding along: the segment_readouts fix record cited PR #92,
 * which is the PR AUTO-CLOSED when its base branch was deleted (working rule 6 of the
 * handoff — the incident that cost one rebuild); the rebuilt, MERGED PR is #93
 * (verified via gh: #92 CLOSED, #93 MERGED, same commit 86eb919). The cite is expanded
 * via an idempotent REPLACE rather than silently rewritten.
 *
 * ALSO CLOSES the two bookkeeping scar rows this change fixes
 * (scar_seed_script_upsert_downgrades…, scar_migration_header_advertises…) with their
 * verification evidence in the fix note — including the executed replay attack and the
 * measured pre-fix negative control.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_round2_corrections.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface CapturedRow {
  bug_class: string; title: string; severity: string; owner_cluster: string;
  root_cause: string; prevention_rule: string; probe_type: string; probe_logic: string;
  status: string; concepts_affected: string[]; fixed_in_files: string[];
  discovered_in_session: string; row_type: string; fixed_at: string | null;
}

/** The PR-cite correction: #92 was auto-closed by the base-branch deletion; #93 is the merged rebuild (same commit). */
const PR_CITE_FROM = "[FIX 2026-08-09, PR #92, commit 86eb919]";
const PR_CITE_TO = "[FIX 2026-08-09, PR #92 auto-closed by the base-branch deletion, rebuilt and MERGED as PR #93, commit 86eb919]";

/**
 * Full-truth captures. marker = a substring unique to the correction this row
 * records; a row already carrying it is NEVER overwritten, so later truth wins.
 */
const CAPTURED: Array<{ marker: string; row: CapturedRow }> = [
  {
    marker: "[FIX 2026-08-09, PR #91, commit 9588bb8]",
    row: {
      bug_class: "vg_lines_planes_mode_never_hides_the_dot_cross_scaffolding_vectors_a_b",
      title: "Act I's a and b vectors render on EVERY lines_planes state, colliding with the taught content",
      severity: "CRITICAL",
      owner_cluster: "peter_parker:field3d_surgeon",
      root_cause: "In applyVectorGeometry3DState (field_3d_renderer.ts:14264) the visibility pass reads: if (elementType === \"vg_vector_a\" || elementType === \"vg_vector_b\") want = true — UNCONDITIONALLY. Every sibling on that same switch is gated (vg_vector_c by d.show_c, vg_cross_vector by d.show_cross_vector, vg_angle_arc by d.show_angle_arc, vg_parallelogram, vg_parallelepiped), and the lines_planes elements are skipped entirely one line above (elementType.indexOf(\"vg_lp_\") === 0 continue). So the two products-mode explorer vectors are the ONLY elements with no gate, and they render at their default magnitudes on all NINE states of a lines_planes concept that never mentions them. Confirmed in frames on every state. It is not passive clutter: on STATE_6 the bold labelled \"a\" sits exactly where d1 own label belongs and d1 is never legibly labelled, on the state whose formula NAMES d1; on STATE_5 \"a\" runs nearly parallel to d1 on screen, diluting the single coincidence illusion the state exists to create; on STATE_8 a and b cross through d1, d2, d1xd2 and (a2-a1) on the derivation state; on STATE_7 \"b\" label crowds \"n\". It also breaks Rule 32e (one glow focal) on every state by construction, since 3-5 co-equal full-brightness elements compete. Invisible to every deterministic gate: H1 does not check for EXTRANEOUS content, D5/D6/D7 only check motion, and H2 had no baseline. [FIX 2026-08-09, PR #91, commit 9588bb8] The dispatch located the apply pass correctly but that site is only HALF the defect: visibility for this pair is written TWICE — applyVectorGeometry3DState at state entry AND updateVectorGeometry3DFrame on EVERY frame, which re-asserts o.visible = true from scratch for the arrows and showLab = true for the tracking label sprites. An apply-only fix is undone one frame after state entry. All 6 write sites across both passes now route through ONE predicate, vgShowAB(d) => (d||{}).mode !== \"lines_planes\". The test is NEGATIVE rather than mode === \"products\" because every shipped Act I state omits mode entirely, so a positive gate would have blanked Act I vectors with no JSON change.",
      prevention_rule: "A shared scenario with MODES hides every element belonging to the other mode by default, and the visibility pass has NO ungated element — each entry is gated by a flag or by the mode. A gate list where one element is want = true is a list nobody re-read after the second mode was added. Corollary for gates: a visual gate that only asks \"is the declared content present\" cannot see content that should be ABSENT; a scenario with modes needs an EXTRANEOUS-ELEMENT assertion (the rendered element set equals the declared set, both directions). Second half, added by the fix: before gating any element visibility in field_3d, grep the scenario for EVERY writer of that element .visible — a per-frame updater that re-asserts visibility silently reverts an apply-pass gate, and both passes must read ONE shared predicate so they cannot drift.",
      probe_type: "js_eval",
      probe_logic: "check:vector-geometry-3d section 22 (27 assertions, 5 negative controls). Drives the SHIPPED applyVectorGeometry3DState and the SHIPPED updateVectorGeometry3DFrame SEPARATELY: mode \"lines_planes\" => the two arrows and both tracking label sprites absent from the visible set; mode \"products\" AND mode unauthored => all four present; the zero-length refusal still holds at ms 0 (the gate is ANDed on, not swapped in); the lp pool is still skipped rather than hidden; the authored mode string is read from the concept JSON, not invented. Negative controls execute the SHIPPED SOURCE with the gate textually removed — pre-fix call sites, an apply-only fix, an arrows-only fix, and the positive products gate — each guarded by an assertion that the textual replacement actually matched. Demonstrated failing before being trusted: pre-fix = 8 FAIL, apply-only = 3 FAIL.",
      status: "FIXED",
      concepts_affected: ["lines_and_planes_in_space"],
      fixed_in_files: ["src/lib/renderers/field_3d_renderer.ts","src/scripts/check_vector_geometry_3d.ts"],
      discovered_in_session: "session_2026-08-09_lines_and_planes_eye_walk",
      row_type: "incident",
      fixed_at: "2026-08-09T14:42:03.112+00:00",
    },
  },
  {
    marker: "rebuilt and MERGED as PR #93, commit 86eb919",
    row: {
      bug_class: "vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state",
      title: "A segment readout is computed every frame whether or not its segment has been revealed, so a number can print before its subject exists",
      severity: "CRITICAL",
      owner_cluster: "peter_parker:field3d_surgeon",
      root_cause: "In vgResolveLinesPlanes the readout values for segments are computed unconditionally on every frame, independent of the reveal fraction that governs whether the segment is DRAWN. A state that reveals its segment late therefore has a live number available for its panel before the thing the number measures is on screen. This is the same family as the FIXED field3d_vg_a_value_surface_can_disagree_with_the_geometry_it_names (whose third sub-defect was exactly readouts rendering before their subject) and the OPEN vg_state_1_hud_prints_magnitudes_before_either_vector_exists — the reveal-gate was applied to the value_readouts panel and not to the resolver that feeds it. Found during #9 authoring while designing STATE_2 dot-product introduction beat, and worked around there with a verified two-segment recipe rather than relying on reveal ordering. SHARPENED 2026-08-09 by the #9 eye walk, and RAISED TO CRITICAL — the original wording undersold both the scope and the consequence. It is not only SEGMENT readouts: the whole intersection block (field_3d_renderer.ts:13117-13138) publishes d_dot_n, lambda, intersection_point and no_meeting_point as soon as ctx.lines[isec.line] and ctx.planes[isec.plane] resolve, ignoring BOTH the named line own reveal_at_ms AND the intersection reveal_at_ms (which gates only the DRAWN marker). Measured on STATE_4: for the first 9.5 seconds the HUD reads n·d = 0.574, λ = 2.600 and a meeting point — all describing Lcut — while the only line on screen is Lpar, the PARALLEL line whose entire lesson is that n·d = 0 and that no meeting point exists. Both lines carry the same generic label \"d\", so a viewer has every reason to read the numbers as describing what they see. This lands on the state built to break misconception M2 (the normal confused for the plane), and it is the chapter signature failure shape: a text surface contradicting the picture beside it. [FIX 2026-08-09, PR #92 auto-closed by the base-branch deletion, rebuilt and MERGED as PR #93, commit 86eb919] SCOPE WAS 19 PUBLISH SITES ACROSS 7 CONSTRUCTS, not the one named in the dispatch. vgResolveLinesPlanes gated only what is DRAWN (vgRevealFrac scales geometry); every out.readouts.* site published the instant its referenced objects RESOLVED, i.e. at state entry. Not one construct was exempt: perpendicular (point_plane_distance, n_norm), comparison segments (point_plane_distance, n_dot_v), common_perpendicular (skew_distance, cross_norm, numerator_triple_product), intersection (d_dot_n, lambda, intersection_point, no_meeting_point), projection and angle_arcs (the angle tokens) and derived cross vectors (cross_norm). All 19 now gate through ONE predicate, vgArrived(frac), reusing F9 own VG_SUBJECT_SHOWN_MIN (0.999 — ARRIVED, not started: a half-drawn segment beside its full length is the same disagreement one notch smaller). KEY FINDING: a PANEL-SIDE fix would have been a TOTAL NO-OP, because vgReadoutSubjectShown returns true for all 13 lines_planes tokens — the panel is a pass-through and only the resolver can gate. That is now a negative control. Behavioural change to Δ4: no_meeting_point now waits for the intersection beat, on the principle that an absence claim is a claim rather than a default.",
      prevention_rule: "A derived readout is gated by the SAME reveal fraction as the geometry it measures, at the RESOLVER, not only at the panel that prints it. Gating the display surface while the resolver still publishes leaves the number one authoring mistake away from the screen. When a reveal-gate defect is fixed at a display site, apply it at the value SOURCE in the same pass. Gate per VALUE, not per block (a plane ||n|| waits for the plane; a segment length for the segment; n_dot_v needs segment AND plane). Resolved geometry — out.meet, ctx.derived addresses — is NOT a value surface and stays ungated: gating it would move a marker address rather than delay a number.",
      probe_type: "js_eval",
      probe_logic: "check_vector_geometry_3d.ts section 19b: 10 fixtures, one per readout-producing construct, every object revealed at 3000 ms; assert ZERO readout keys at t=0/1500/2999/3000 and ALL expected tokens at t=3001 — so no fixture can pass vacuously by resolving nothing. Measured end to end through the shipped frame driver and the #vg_readout DOM panel, not the resolver return value alone. Controls: the pre-fix resolver reconstructed by replacing exactly ONE function body (vgArrived) so it is a reconstruction rather than a second implementation, which THROWS if the substitution stops matching; a frac>0 \"started\" gate publishing at 88 percent drawn; and the panel-side fix that would have been a no-op. Demonstrated failing before trust: un-gating one shipped site made 11 assertions FAIL. Harness blind spot closed: the harness INJECTS VG_SUBJECT_SHOWN_MIN, so a scope mismatch would silently kill every lines/planes number in a browser while the gate stayed green — both declarations are now measured to share brace depth 1 in the emitted body.",
      status: "FIXED",
      concepts_affected: ["lines_and_planes_in_space"],
      fixed_in_files: ["src/lib/renderers/field_3d_renderer.ts","src/scripts/check_vector_geometry_3d.ts"],
      discovered_in_session: "session_2026-08-09_lines_and_planes_bringup",
      row_type: "incident",
      fixed_at: "2026-08-09T15:02:32.232+00:00",
    },
  },
  {
    marker: "[FIX 2026-08-09, PR #94, commit 8049ebf]",
    row: {
      bug_class: "vg_intersection_is_a_single_target_so_a_state_teaching_BOTH_cases_can_render_only_one",
      title: "Δ4 no_meeting_point cannot co-exist with an intersection marker, because d.intersection names one line",
      severity: "MAJOR",
      owner_cluster: "peter_parker:field3d_surgeon",
      root_cause: "ENGINE DELTA 4 exists so that the case with NO intersection carries a readout rather than teaching by omission (the recorded state_whose_payoff_is_absence_carries_its_lesson_only_in_on_canvas_prose shape). But d.intersection is a SINGLE OBJECT — var isec = d.intersection (field_3d_renderer.ts:13113) — naming one line and one plane for the whole state. STATE_4 teaches BOTH cases sequentially in one state: the parallel line Lpar (d·n = 0.000) glides past and never touches, then the cutting line Lcut (d·n = 0.574) punches through and the marker snaps on at lambda 2.600. Targeting Lcut makes meet.exists permanently true, so no_meeting_point is permanently false and the Δ4 row can NEVER render. Targeting Lpar renders the absence row but destroys the X marker the state second half requires. There is no authoring of the shipped surface that serves both, so the delta cannot do the job it was requested for on the only state that needs it. Δ4 was specified, reviewed and built against a ONE-LINE mental model of the state while the state design in the same document has two. FOUNDER DECISION 2026-08-09: the fix direction is DECIDED — change d.intersection to an intersections[] LIST keyed by line id, so each line publishes its OWN d_dot_n / lambda / intersection_point / no_meeting_point pair. The founder chose this over (a) splitting STATE_4 into two states and (b) accepting the angle-arc substitution the json_author authored. Reason: it is what Δ4 was specified to deliver, and it is the only option under which the state teaches what the skeleton designed — \"n·d = 0.000\" pinned live while the parallel line glides past, then the marker appearing for the cutting line. NOT YET SCHEDULED: the founder scoped the current round to the a/b leak and the readout-reveal gate, so this is the next engine dispatch after those two land. Note the dependency: gating readouts by reveal removes the CONTRADICTION but leaves STATE_4 with NO n·d row during the parallel window; only this list change restores the 0.000 the beat needs. [FIX 2026-08-09, PR #94, commit 8049ebf] F14 now resolves a LIST — d.intersections[], each entry keyed to its own line, each publishing its own d_dot_n / lambda / intersection_point / no_meeting_point on its own reveal beat. d.intersection is read as one more element of that list rather than as a legacy branch, so every concept authored against the singular resolves identically (every consumed surface JSON-identical to the reconstructed pre-fix build at 8 instants, under BOTH targetings) and a block authoring both keeps both. The first unnamed intersection keeps the historical address \"X\" — renaming it to \"X0\" would have silently orphaned every authored reference. Nothing else consumed the singular: d.intersection had exactly ONE reader, and out.meet has ZERO consumers anywhere in the renderer (both asserted off the shipped source, not by grep alone).",
      prevention_rule: "A readout delta requested to express an ABSENCE must be specified against the STATE that will consume it, including how many subjects that state has co-present. Where a state teaches a contrast between two objects, every per-state singleton in the config (intersection, perpendicular, projection) is checked for arity against that contrast BEFORE the delta is accepted — a singleton silently makes a two-object lesson unauthorable. Fix direction: accept a LIST (intersections[]) keyed by line id, so each line publishes its own d_dot_n / no_meeting_point pair. AND THE COLLISION IS A REFUSAL, NOT A WINNER. The four tokens are NAMES, not addresses, so two ARRIVED intersections both claim all four — and on the very state this exists for, both lines carry the label \"d\". Any precedence rule (first-authored / last-authored / the one that exists) prints an arithmetically CORRECT number the reader cannot attach to a line, which is the same defect one level up. So the family publishes only while exactly ONE intersection is arrived; an overlap publishes NOTHING, records the conflict on PM_vgLinesPlanes (riding the existing PM_vgPoolOverflow precedent rather than minting a new diagnostic idiom), and the gate REFUSES any authored state that reaches it. Refusal is per FAMILY, not per token: per-token would still let \"no meeting point\" and \"meeting point = (…)\" print side by side from different subjects. Geometry is never withheld — markers still draw, addressed by id. Disjoint reveal windows are the AUTHORING, not a lucky ordering.",
      probe_type: "js_eval",
      probe_logic: "check:vector-geometry-3d §23 (716 assertions / 85 negative controls overall). Drives the SHIPPED frame driver and the #vg_readout DOM: a block with Lpar (hide 9500) and Lcut (reveal 9500) must print n·d = 0.000 plus \"no meeting point\" at t=2000 and n·d = 0.574 / λ = 2.600 / a meeting point at t=15000. The negative control replaces the F14 REGION with the master single-target text and THROWS if either delimiter stops matching (verified live: stashing the renderer aborts the run rather than passing vacuously); inside a normal run it is watched to lose one half of the state under BOTH possible targetings, which is the whole option space of a singleton. Collision: two co-revealed intersections publish none of the four tokens and record one conflict naming both claimants, and the two candidate precedence rules are run on the IDENTICAL frame and shown to disagree (0.000 vs 0.574, both correct, for different lines). Gating is on OVERLAP, not arity — closing one window lets the other publish again. Authored-concept scan: 9 states × 97 instants, zero conflicts. Backward compat proved by JSON-identity of every consumed surface.",
      status: "FIXED",
      concepts_affected: ["lines_and_planes_in_space"],
      fixed_in_files: ["src/lib/renderers/field_3d_renderer.ts","src/scripts/check_vector_geometry_3d.ts"],
      discovered_in_session: "session_2026-08-09_lines_and_planes_bringup",
      row_type: "incident",
      fixed_at: "2026-08-09T15:49:16.24+00:00",
    },
  },
  {
    marker: "The F14 LIST key \"intersections\" was in NEITHER",
    row: {
      bug_class: "vg_derivestatemeta_reveal_pin_scans_the_singular_intersection_and_is_blind_to_the_intersections_list",
      title: "The frozen-frame reveal pin drops 5.5s the moment a state migrates intersection to intersections[]",
      severity: "MAJOR",
      owner_cluster: "peter_parker:field3d_surgeon",
      root_cause: "deriveStateMeta.ts scans vgTimedLists = [lines, planes, points, segments, angle_arcs, vectors] and vgTimedSingles = [perpendicular, common_perpendicular, intersection, projection]. The F14 LIST key \"intersections\" was in NEITHER, so an authored intersections[] was invisible to deriveMaxRevealTimeMs. Measured on lines_and_planes_in_space STATE_4 with the SAME object expressed both ways: 15900 ms singular, 10400 ms as a list. The intersection reveals at 15000 ms, so the frozen frame would have been pinned 4.6 s BEFORE its marker exists and an H2 baseline minted from a picture the state contradicts a frame later. THE DANGEROUS PART IS THAT NOTHING WOULD HAVE FAILED — no gate error, no warning; the run goes green against the wrong frame, and that frame becomes the reference every future run is compared to. Same shape as field3d_scenario_missing_maxreveal_block_frozen_pin_defaults_1500ms_predates_scripted_reveal, one authoring level down: the renderer gained a new timed AUTHORING KEY and the pin evaluator was not told.",
      prevention_rule: "Any NEW timed authoring key on the vg reveal chain is registered in deriveStateMeta vgTimedLists / vgTimedSingles in the SAME COMMIT as the renderer that reads it. A renderer-side key the pin evaluator cannot see is invisible until a baseline is already wrong — and a wrong baseline is worse than a missing one, because it passes.",
      probe_type: "js_eval",
      probe_logic: "For each authored lines_planes state, push every timed object reveal_at_ms out by 5000 ms ONE KEY AT A TIME and assert deriveMaxRevealTimeMs increases by 5000 for EVERY key, lists and singles alike. Negative control: with \"intersections\" absent from vgTimedLists the intersections[] perturbation moves the pin by 0.",
      status: "FIXED",
      concepts_affected: ["lines_and_planes_in_space"],
      fixed_in_files: ["src/lib/validators/visual/deriveStateMeta.ts"],
      discovered_in_session: "session_2026-08-09_lines_and_planes_bringup",
      row_type: "incident",
      fixed_at: "2026-08-09T15:49:15.945+00:00",
    },
  },
  {
    marker: "d-hat . n-hat = 2.756e-07, which is 276 TIMES",
    row: {
      bug_class: "vg_authored_parallel_direction_hand_normalized_and_rounded_misses_the_degeneracy_epsilon",
      title: "A line authored parallel to a plane missed the 1e-9 guard by 276x and printed a meeting point 4.8 million units away",
      severity: "CRITICAL",
      owner_cluster: "alex:json_author",
      root_cause: "lines_and_planes_in_space STATE_4 authored Lpar.dir PRE-NORMALIZED and ROUNDED TO SIX DECIMALS — [0.943858, -0.330350, 0] against the plane normal [0.35, 1, 0.25]. The rounding destroys the exact perpendicularity the state teaches: d-hat . n-hat = 2.756e-07, which is 276 TIMES the VG_MEET_EPS guard of 1e-9. vgLinePlaneMeet therefore reported exists:true for a line that is supposed to be parallel, and published lambda = -1.4 / 2.756e-07 = -5,080,022.246 with a meeting point at (-4794821.47, 1678187.03, 0.32) — on the HUD of the state whose entire lesson is that there IS NO meeting point, beside a correct n.d = 0.000. LATENT SINCE AUTHORING and invisible while d.intersection targeted Lcut only; exposed the instant the intersections[] migration let Lpar publish its own readouts. Caught by READING A FRAME: validate:mathematics passed, check:vector-geometry-3d passed ALL SECTIONS, and THE EYE headline read 38/39 with the only failure an unrelated known false positive. Fixed by authoring the EXACT unnormalized direction [1, -0.35, 0], whose dot with the normal is exactly 0 in IEEE754 (0.35 + -0.35 cancels bit for bit), giving d-hat . n-hat = 5.551e-17. Swept the whole concept: exactly one intended-parallel pair exists and it is now inside the epsilon.",
      prevention_rule: "A direction that must satisfy an EXACT geometric relation is authored in its exact, unnormalized, small-integer or short-decimal form, and the renderer normalizes it — NEVER hand-normalize and round, because the rounding destroys the very relation the state exists to teach. A degeneracy epsilon protects against FLOAT NOISE (~1e-16), not against AUTHORING PRECISION (~1e-7): the two differ by nine orders of magnitude, so an epsilon that is correct cannot rescue a coordinate that is merely close. Distinct from the FIXED row parallel_direction_cross_product_is_1e17_not_zero_so_an_exact_zero_guard_ships_a_plausible_wrong_distance — there the GUARD was wrong (exact-zero test); here the guard is right and the AUTHORED DATA is wrong. Also the third instance this session of one fix exposing the defect beneath it, after the a/b removal exposed the missing d1 label and the cross_mag label fix exposed the unequal screen lengths: after removing an occluding or suppressing surface, RE-WALK the frames rather than assuming the space it vacated is correct.",
      probe_type: "js_eval",
      probe_logic: "At authoring time, for every line/plane pair a state intends as parallel (declared, or detected by |d-hat . n-hat| < 1e-4), assert |d-hat . n-hat| <= VG_MEET_EPS so the degeneracy branch actually fires. Negative control: the 6-decimal hand-normalized direction must FAIL this check and must be shown to produce a finite WRONG lambda rather than NaN — a control that only proves NaN has not tested the case that ships.",
      status: "FIXED",
      concepts_affected: ["lines_and_planes_in_space"],
      fixed_in_files: ["src/data/concepts/mathematics/lines_and_planes_in_space.json"],
      discovered_in_session: "session_2026-08-09_lines_and_planes_bringup",
      row_type: "incident",
      fixed_at: "2026-08-09T16:18:26.989+00:00",
    },
  },
  {
    marker: "VERIFIED by executing the replay attack this row describes",
    row: {
      bug_class: "scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored",
      title: "Replaying a committed seed script reverts FIXED rows to OPEN and erases their fix records",
      severity: "CRITICAL",
      owner_cluster: "ambiguous",
      root_cause: "The seed scripts written earlier in this session upsert full rows with ON CONFLICT DO UPDATE SET status, root_cause, prevention_rule, probe_logic — with no predicate. Two bug_classes are authored OPEN in _seed_engine_bug_queue_lines_and_planes_phase0.ts whose fixes are ALREADY ancestors of the branch HEAD (vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state fixed by 86eb919, vg_intersection_is_a_single_target... fixed by 8049ebf). Re-running the script, or replaying its migration, flips both back to OPEN and overwrites the appended fix records. Worse, _seed_engine_bug_queue_lines_and_planes_eye_walk.ts stores the scene_group row as OPEN while eye_walk2.ts later retracted it to FALSE_POSITIVE — in the LIVE DB ONLY, with no committed migration — so a replay resurrects a row the same session proved does not exist and dispatches a surgeon at it. The scripts describe themselves as idempotent: they are idempotent against their OWN authoring, which is not the same as safe against the queue later truth. FIXED 2026-08-09, same session, fix-list item FIRST by design: the PROTECTED check and the ON CONFLICT … DO UPDATE … WHERE engine_bug_queue.status NOT IN (FIXED, FALSE_POSITIVE) predicate were copied from the xhigh script into all three earlier seed scripts (phase0 / eye_walk / eye_walk2), their migrations regenerated with the same predicate, and the round-2 corrections committed as their own migration (…_round2_corrections_migration.sql) so no queue truth lives only in the DB. VERIFIED by executing the replay attack this row describes: all four scripts re-run against the live queue — phase0 refused 6 protected rows, eye_walk refused 2 (including the FALSE_POSITIVE this row names), eye_walk2 refused 1 — and the status probe before/after shows zero rows moved out of FIXED or FALSE_POSITIVE. Negative control, measured pre-fix: the unguarded scripts/migrations demonstrably downgraded 4 rows (segment_readouts FIXED/CRITICAL to OPEN/MODERATE, intersection FIXED to OPEN, the a/b row FIXED to OPEN, and group_membership FALSE_POSITIVE resurrected to OPEN).",
      prevention_rule: "A scar-queue write NEVER DOWNGRADES. An upsert whose row was authored OPEN must carry a predicate refusing to overwrite a row already FIXED or FALSE_POSITIVE, in BOTH the script and the emitted SQL (ON CONFLICT ... DO UPDATE ... WHERE engine_bug_queue.status NOT IN (FIXED, FALSE_POSITIVE)). And any correction applied to the live DB is committed as its own migration in the SAME change — a correction that exists only in the database is not in the record at all.",
      probe_type: "js_eval",
      probe_logic: "Replay every committed migration against a copy of the queue and assert no row moves from FIXED or FALSE_POSITIVE to OPEN, and that no retraction note is lost. Negative control: the two 2026-08-09 migrations must FAIL this today.",
      status: "FIXED",
      concepts_affected: ["lines_and_planes_in_space"],
      fixed_in_files: ["src/scripts/_seed_engine_bug_queue_lines_and_planes_phase0.ts","src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk.ts","src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk2.ts","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_phase0_migration.sql","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_eye_walk_migration.sql","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_eye_walk2_migration.sql","src/scripts/_seed_engine_bug_queue_lines_and_planes_round2_corrections.ts","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_round2_corrections_migration.sql"],
      discovered_in_session: "session_2026-08-09_lines_and_planes_xhigh_review",
      row_type: "incident",
      fixed_at: "2026-08-09T20:32:44.000Z",
    },
  },
  {
    marker: "generated from the SAME data structure the TS path applies",
    row: {
      bug_class: "scar_migration_header_advertises_an_update_the_file_does_not_contain",
      title: "An archival migration states it applied a recurrence extension that lives only in the TypeScript path",
      severity: "MAJOR",
      owner_cluster: "ambiguous",
      root_cause: "emitSql() in _seed_engine_bug_queue_lines_and_planes_phase0.ts prints the header line \"Plus an UPDATE (not a new row) extending formula_surface_states_an_identity_in_a_unit_the_hud_never_renders\", but only ever concatenates the INSERT — the UPDATE exists solely in the TypeScript RECUR/RECUR_NOTE path. Anyone rebuilding or auditing the queue from supabase_migrations/ gets a file that STATES it applied the recurrence and did not: the third recorded recurrence of the n.d = 0.624 vs 0.574 unit-mismatch class is absent, and concepts_affected never gains lines_and_planes_in_space, so the next author querying that class sees two occurrences instead of three and reads a live class as closed history. FIXED 2026-08-09, same change as the upsert-guard row: every emitted migration now contains every write its own header claims, generated from the SAME data structure the TS path applies — phase0 emits the RECUR update (the negative control this row names), eye_walk emits its two note-append UPDATEs, and eye_walk2, which emitted NO SQL at all (one notch worse than a header that drifts: no file to even disagree), now writes …_eye_walk2_migration.sql carrying its retraction, escalation and withdrawn note. Parity verified by reading each regenerated file: INSERT row count equals the script rows array, UPDATE statements equal the script UPDATES/RECUR structures, including UPDATE-only targets.",
      prevention_rule: "An emitted migration contains every write its own header claims, or the header does not claim it. Generate the SQL from the SAME data structure that performs the writes — a hand-written comment describing a code path is a second source of truth and will drift on the first edit.",
      probe_type: "js_eval",
      probe_logic: "Diff the set of bug_classes written by each seed script against the set written by its emitted SQL and assert equality, including UPDATE-only targets. Negative control: phase0 differs by one today.",
      status: "FIXED",
      concepts_affected: ["lines_and_planes_in_space"],
      fixed_in_files: ["src/scripts/_seed_engine_bug_queue_lines_and_planes_phase0.ts","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_phase0_migration.sql","src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk.ts","src/scripts/_seed_engine_bug_queue_lines_and_planes_eye_walk2.ts","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_eye_walk_migration.sql","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_eye_walk2_migration.sql","src/scripts/_seed_engine_bug_queue_lines_and_planes_round2_corrections.ts","supabase_migrations/supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_round2_corrections_migration.sql"],
      discovered_in_session: "session_2026-08-09_lines_and_planes_xhigh_review",
      row_type: "incident",
      fixed_at: "2026-08-09T20:32:44.000Z",
    },
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }

function emitSql(): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, fixed_at';
  const stmts = CAPTURED.map(({ marker, row: r }) =>
    `-- ${r.bug_class} (${r.status})\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n` +
    `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(r.discovered_in_session)}, ` +
    `${sqlStr(r.row_type)}, ${r.fixed_at ? sqlStr(r.fixed_at) : 'NULL'})\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,\n` +
    `  probe_logic = EXCLUDED.probe_logic, status = EXCLUDED.status,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = EXCLUDED.fixed_at\n` +
    `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr('%' + marker + '%')};\n`);
  return `-- 2026-08-09 — lines_and_planes_in_space ROUND-2 CORRECTIONS: the queue truth the round-1\n` +
    `-- migrations do not contain. Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_lines_and_planes_round2_corrections.ts — idempotent,\n` +
    `-- order-independent (per-row marker guards), and NEVER a downgrade (every status here is FIXED).\n` +
    `-- See that script's header for what happened and why this file exists.\n\n` +
    `-- The PR-cite correction (idempotent: the search string disappears once applied).\n` +
    `UPDATE engine_bug_queue SET root_cause = REPLACE(root_cause, ${sqlStr(PR_CITE_FROM)}, ${sqlStr(PR_CITE_TO)})\n` +
    `WHERE bug_class = 'vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state';\n\n` +
    stmts.join('\n');
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-09_seed_engine_bug_queue_lines_and_planes_round2_corrections_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${CAPTURED.length} rows + 1 cite correction)`);

  // 1 — the PR-cite correction, applied idempotently (REPLACE semantics).
  const SEG = 'vg_lines_planes_segment_readouts_compute_regardless_of_reveal_state';
  const { data: seg, error: segErr } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class,root_cause').eq('bug_class', SEG).maybeSingle();
  if (segErr) { console.error(`✗ read ${SEG}: ${segErr.message}`); process.exit(1); }
  if (seg && seg.root_cause?.includes(PR_CITE_FROM)) {
    const { error } = await supabaseAdmin.from('engine_bug_queue')
      .update({ root_cause: seg.root_cause.replace(PR_CITE_FROM, PR_CITE_TO) }).eq('bug_class', SEG);
    if (error) { console.error(`✗ cite correction failed: ${error.message}`); process.exit(1); }
    console.log('✓ PR cite corrected: #92 (auto-closed) → merged rebuild #93');
  } else {
    console.log('· PR cite already corrected (or row absent)');
  }

  // 2 — the captures: upsert full truth unless the row already carries this marker.
  for (const { marker, row } of CAPTURED) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause').eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (ex?.root_cause?.includes(marker)) {
      console.log(`⏭  ${row.bug_class} — marker present; later truth stands`);
      continue;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
    console.log(`✓ ${row.bug_class} → ${row.status}`);
  }

  // 3 — verify: the live queue must now hold exactly the captured truth.
  const { data: after, error: vErr } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class,status,severity,root_cause')
    .in('bug_class', CAPTURED.map((c) => c.row.bug_class));
  if (vErr) { console.error(`✗ verify read: ${vErr.message}`); process.exit(1); }
  const byClass = new Map((after ?? []).map((r: { bug_class: string; status: string; severity: string; root_cause: string }) => [r.bug_class, r]));
  let ok = true;
  for (const { marker, row } of CAPTURED) {
    const l = byClass.get(row.bug_class);
    const good = !!l && l.status === row.status && l.severity === row.severity && l.root_cause.includes(marker);
    if (!good) { ok = false; console.error(`✗ VERIFY FAIL ${row.bug_class}: live=${l?.status}/${l?.severity} marker=${l?.root_cause?.includes(marker)}`); }
  }
  if (!ok) process.exit(1);
  console.log(`✓ verified: all ${CAPTURED.length} rows hold the captured truth (status, severity, marker)`);
}

main();
