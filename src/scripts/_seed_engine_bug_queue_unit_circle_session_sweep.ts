/**
 * engine_bug_queue — end-of-session sweep for `unit_circle_to_sine_wave`.
 *
 * Nine defects HIT during the build that never got a row of their own, gathered
 * on a deliberate re-read of the session rather than at the moment each was
 * worked around. That gap is the point: a defect you route around while building
 * is invisible the moment the workaround looks like ordinary authoring.
 *
 * Checked against the live table first (721 rows) so none of these duplicates an
 * existing class. Two candidates were DROPPED for that reason: the
 * backtick-in-a-renderer-comment hazard (already carried twice, by
 * renderer_backtick_in_comment_terminates_template_literal and
 * backtick_in_renderer_comment_terminates_emitted_template_literal — the gate
 * caught it, working as designed) and the runtime-panel blindness of
 * check-layout-overlap (check_layout_overlap_models_authored_rects_only_...,
 * MAJOR/OPEN, a different half of that script than the one fixed here).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_unit_circle_session_sweep.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'unit_circle_to_sine_wave build sweep, 2026-08-05/06';
const C = 'unit_circle_to_sine_wave';
const RENDERER = 'src/lib/renderers/parametric_renderer.ts';

type Owner =
    | 'alex:architect' | 'alex:json_author'
    | 'peter_parker:renderer_primitives' | 'ambiguous';

interface Row {
    bug_class: string; title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: Owner; subject: string;
    root_cause: string; prevention_rule: string;
    probe_type: 'js_eval'; probe_logic: string;
    status: 'OPEN' | 'FIXED';
    concepts_affected: string[]; fixed_in_files: string[];
    discovered_in_session: string; row_type: 'incident';
}

const rows: Row[] = [
    {
        bug_class: 'pcpl_drawlabel_has_no_position_expr_so_object_anchored_text_cannot_track',
        title: 'drawLabel reads only a literal position, so a label naming a moving object cannot follow it and the symbol must ride the owning primitive instead',
        severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'subject_neutral',
        root_cause:
            "drawLabel (parametric_renderer.ts:1676-1684) opens `if (!spec || !(spec._solverPosition || spec.position)) return;` and reads `var pos = spec._solverPosition || spec.position;`. There is NO position_expr branch and no anchor resolution — unlike drawBody, whose position_expr was added so a body could ride a variable. The asymmetry is the trap: a body's position is expression-driven, so an author reasonably assumes a label's is too, and the skeleton for this concept typed THREE symbols as object-anchored `label` primitives (the angle on the arc, the height symbol beside its segment, the arc-length symbol riding the rim). None of the three can track as a label. The only object-anchored text this renderer supports is a primitive's OWN label field — angle_arc.label (drawn at the arc mid-angle, :2695-2703) and vector.label (drawn at the segment midpoint, :2308-2313) — and locus_trace has no label field at all, so a symbol naming a traced curve cannot be object-anchored by any means.",
        prevention_rule:
            "AUTHORING: object-anchored text rides the OWNING primitive's own label field, never a `label` primitive; a `label` primitive is for text at a FIXED position only. A symbol that must name a locus_trace has no anchored option — put it on the formula surface or a curve-end label at a computed fixed point, and check that point against the trace's full extent. ENGINE: give drawLabel the same position_expr branch drawBody has (:1268-1272) — same PM_liveExprVars scope, same non-finite fallback to the authored position — so a symbol and the geometry it names can never disagree about where they are.",
        probe_type: 'js_eval',
        probe_logic:
            "Static: assert no `label` primitive carries position_expr (it would be silently ignored today). Design-side: for every symbol a formula surface or HUD names, assert its on-canvas definition is either a fixed-position label whose coordinates were checked against the annotated object's full range, or the annotated primitive's own label field.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: [],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'pcpl_angle_arc_sweep_beyond_one_full_turn_has_no_defined_rendering',
        title: 'drawAngleArc hands a >2π span straight to p5 arc(), which has no defined behaviour there, so a concept that counts past 360° cannot draw its own angle',
        severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'subject_neutral',
        root_cause:
            "drawAngleArc maps a math angle to canvas by `startRad = -toDeg*PI/180`, `endRad = -fromDeg*PI/180` and calls `arc(cx, cy, r*2, r*2, startRad, endRad)` with no normalisation and no clamp. For a sweep beyond one full turn — a periodicity lesson counting theta past 360° is the obvious case, and is exactly what this concept's STATE_6 does (theta runs to 515.66°) — the span exceeds 2π and p5 does not define the result. The concept had to author `angle_value_expr: \"min(theta, 360)\"` to saturate the arc at one turn while the HUD counted on, which is truthful but is a workaround for a renderer that cannot express the thing being taught. Related and already filed from the same state: at a sweep of ~0 or ~360 the arc's own mid-angle label lands on the reference axis.",
        prevention_rule:
            "DESIGN: treat 'the angle arc shows more than one full turn' as NEEDS-SCENARIO, not [LIVE]; saturate deliberately and say so on canvas, or drop the arc for that state. ENGINE: normalise the sweep in drawAngleArc — draw min(|span|, 360) and, when the true span exceeds a turn, render the winding count as an explicit second ring or a turn counter rather than leaving p5 to guess.",
        probe_type: 'js_eval',
        probe_logic:
            "For every angle_arc, evaluate angle_value_expr across its state's authored variable range and assert |to_deg - from_deg| <= 360 at every sample; FAIL naming the state and the range where it exceeds one turn.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: [],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'pm_applychoreography_silently_keeps_only_the_last_entry_per_variable',
        title: 'Two variable_choreography entries for one variable do not compose — the later one wins and the earlier is dead config that reads as authored intent',
        severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'subject_neutral',
        root_cause:
            "PM_applyChoreography (parametric_renderer.ts:3530) iterates the array and writes PM_choreoValues[spec.variable] on each entry, so for two entries naming the same variable the LAST one silently overwrites the first — there is no composition, no sequencing, and no warning. The design for this concept authored exactly that: a hold entry followed by a ping-pong entry on theta, intended to read as 'hold, then sweep'. The hold would have been dead config. It happens to be unnecessary — PM_choreoValue already returns `from` for every t < start_ms (:1160), so a single entry with a later start_ms produces the hold for free — but nothing tells an author that, and the two-entry form looks like it works because the observable result is close to what was wanted.",
        prevention_rule:
            "ONE choreography entry per variable per state. A pre-motion hold is expressed by start_ms on that single entry, not by a second entry. ENGINE: either compose multiple entries by time window, or reject/warn on a duplicate variable at config load — silently dropping authored config is the worst of the three options.",
        probe_type: 'js_eval',
        probe_logic:
            "Static: for each state, assert the variable names in variable_choreography are unique; FAIL naming any variable declared twice and which entry would win.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: [],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'pcpl_solver_cannot_register_expression_driven_vector_primitives_as_obstacles',
        title: 'The label de-overlap solver still cannot see expression-driven VECTOR primitives — the sibling case its 2026-07-24 force_arrow fix missed',
        severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'subject_neutral',
        root_cause:
            "pcpl_solver_blind_label_hand_placement_collisions was closed FIXED on 2026-07-24 for anchor_to/*_expr-driven FORCE_ARROWS. The identical blindness remains for `vector` primitives carrying from_expr/to_expr: assembling this concept emits 18-19 'Could not register vector <id> as obstacle (unresolved geometry); labels may overlap it.' warnings and reports primitives_resolved=0. Every apparatus element here is expression-driven by construction — the radius, both height segments, the horizontal segment, the carrier — so the solver has ZERO obstacle knowledge of the moving geometry and every label is effectively hand-placed and checked by nothing. That is not hypothetical on this concept: three separate label collisions were found by eye during the build (a symbol bisected by its own segment, an arc label crossing a segment, two midpoint labels fusing as their angle closed), none of which any automated check reported.",
        prevention_rule:
            "Extend the solver's obstacle registration to evaluate from_expr/to_expr via PM_safeEvalPoint against PM_liveExprVars, exactly as drawVector does — the same one-line-shaped fix the force_arrow case already got, applied to the sibling primitive type. Until then, treat every label on an expression-driven concept as unchecked and verify placements by eye across the full variable range, not at one sample. General lesson: when a fix names a primitive TYPE, enumerate the other types that share the code path before closing the row.",
        probe_type: 'js_eval',
        probe_logic:
            "Assert the assembly step reports zero 'Could not register ... as obstacle' warnings for a concept, or FAIL listing the unresolved primitive ids. Independently: assert primitives_resolved > 0 whenever the state contains any labelled primitive.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: [],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count',
        title: 'The schema requires >=6 assessment questions while a skeleton specified 4, so the author must invent items or drop the block — and dropping it forces the aha state to be declared non-assessed',
        severity: 'MODERATE', owner_cluster: 'alex:architect', subject: 'subject_neutral',
        root_cause:
            "conceptJson.ts's assessmentSchema requires questions.min(6) whenever `assessment` is present, and Gate 19d then forces every state with no question into coverage_map.non_assessed_states. The architect skeleton for this concept specified exactly FOUR items with their distractors. Four leaves two states uncovered, and the only two that could be declared non-assessed without lying were already spoken for — so the honest options were to invent two items (scope the skeleton did not authorise) or to declare the PRIMARY AHA state 'teaches no testable claim', which is false and which the auditor sanity-checks. The mismatch is silent at design time: nothing in the skeleton template mentions the floor, so the design and the schema disagree only at the moment json_author writes the file.",
        prevention_rule:
            "The skeleton's assessment section states an item count that satisfies the schema floor, and names the state each item covers, so the design and the validator cannot disagree. Where fewer items genuinely suffice, the skeleton says so explicitly and omits the assessment block rather than under-filling it. Generally: a design document that specifies a count for a gated field must be checked against that gate's bound at design time, not discovered at authoring time.",
        probe_type: 'js_eval',
        probe_logic:
            "Cross-check: parse the item count a skeleton's Definition-of-Done declares and assert it satisfies assessmentSchema's minimum, and that the states it names plus the declared non_assessed_states cover every state exactly once.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: [],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'renderer_pair_panel_b_is_required_by_schema_but_has_no_valid_value_for_a_panel_a_only_concept',
        title: 'panel_b is a required string with no "none" convention, so a single-panel concept must either name a renderer that never paints or invent a sentinel',
        severity: 'MODERATE', owner_cluster: 'alex:json_author', subject: 'subject_neutral',
        root_cause:
            "rendererPairSchema declares `panel_b: z.string()` — required, with no nullable and no documented sentinel. build_review_site.ts assembles panel A only, so a concept with no second panel has nothing true to write. The fleet's existing answer is to name `graph_interactive`, which is precisely the open defect where 48 shipped physics concepts declare a panel the review builder has no branch for and never renders. This concept wrote the string \"none\" to avoid becoming the 49th, but that is an invented convention nothing validates or reads, so the next author will pick something different.",
        prevention_rule:
            "Make the absence expressible: panel_b becomes optional, or gains a documented sentinel that the review/pilot builders both recognise. Until then author \"none\" and never `graph_interactive` unless a panel-B branch genuinely renders it — a field that cannot express the truth will be filled with something false.",
        probe_type: 'js_eval',
        probe_logic:
            "Assert every concept's renderer_pair.panel_b either names a renderer the review builder has a branch for, or equals the agreed absent-sentinel. FAIL listing concepts naming an unrendered panel.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: [],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'pcpl_has_no_outline_only_shape_primitive',
        title: 'A circle drawn as a curve rather than a disc needs an undocumented opacity-0 + border_color idiom, discovered by reading the renderer',
        severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'subject_neutral',
        root_cause:
            "drawBody always fills: `fill(rgb, effectiveOpacity*255)` and strokes only when border_color is present (parametric_renderer.ts:1504-1512). There is no outline/stroke-only shape option. A unit circle is a CURVE, not a disc, so the only way to draw it is opacity:0 plus a border_color — which works because opacity multiplies the fill alone while stroke takes border_color at full alpha, but which no shipped concept uses and no doc records. It was verified by code read, not precedent. The failure mode if it ever changes is silent: the rim becomes a filled disc covering everything inside it, which is most of the apparatus.",
        prevention_rule:
            "Add a first-class `filled: false` (or stroke_only) on body shapes so 'this is a curve' is authored rather than encoded as a zero-alpha fill. Until then the opacity-0 + border_color idiom is the supported spelling and belongs in the pattern library, with the note that any change to drawBody's fill/opacity coupling silently converts every such outline into a solid.",
        probe_type: 'js_eval',
        probe_logic:
            "Assert every body authored with opacity 0 also carries a border_color (otherwise it is invisible and probably a mistake), and flag them as outline-idiom users so a drawBody fill/opacity change can be regression-checked against exactly that set.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: [],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'check_layout_overlap_measures_the_uninterpolated_template_not_the_rendered_string',
        title: 'The overlap checker sized text boxes from raw {expr} source characters, reporting boxes up to 5x too wide and collisions that do not exist',
        severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'subject_neutral',
        root_cause:
            "check-layout-overlap.mjs measured `p.text_expr ?? p.text` by character count. A HUD row authored as the dual-unit template is 45 source characters and renders as 19, so the computed box was up to 5x too wide. Measured on this concept: one HUD row was reported at x=-19..319 — a 338px box running off the left edge of a 760px canvas — against its real 154px. Ten collisions reported, ALL TEN false. A checker that manufactures false positives is worse than one that reports nothing, because it trains authors to ignore its output, and the four real collisions on this concept were all found by eye instead.",
        prevention_rule:
            "Measure what renders, not what is authored: collapse every {expr} group to the width its VALUE renders at before sizing a box (a .toFixed(n) to n+3 characters, a bare identifier to a short number), erring slightly wide because that is the safe direction for an overlap check. Any tool that sizes authored text must interpolate first.",
        probe_type: 'js_eval',
        probe_logic:
            "Regression-guard the checker itself: assert a label whose text_expr contains a {expr} group is sized within 25 percent of the same label with the group replaced by a representative rendered value, and that a template-free concept's collision count is unchanged by the interpolation step.",
        status: 'FIXED', concepts_affected: [C],
        fixed_in_files: ['src/scripts/check-layout-overlap.mjs'],
        discovered_in_session: SESSION, row_type: 'incident',
    },
    {
        bug_class: 'subject_namespace_concepts_are_invisible_to_flat_scanning_tools',
        title: 'Tools that resolve concept ids against the flat dir cannot see a subject subfolder, so a whole subject silently loses that tool',
        severity: 'MAJOR', owner_cluster: 'ambiguous', subject: 'subject_neutral',
        root_cause:
            "Concepts live in src/data/concepts/<id>.json for physics and src/data/concepts/<subject>/<id>.json for chemistry and mathematics. Every tool that resolves an id or scans the directory must enumerate the namespaces, and each one that forgets loses an entire subject with no error that names the cause. It has now happened at least three times: validate:concepts' non-recursive scan left chemistry with NO CI coverage for five sessions and four concepts (fixed only when validate:chemistry was added); check-layout-overlap.mjs tried the flat dir then chemistry and died on ENOENT for any mathematics id; and the same shape is why subject concepts need a dedicated cache seeder at all. The failure is quiet in the worst way — a tool that cannot open a file looks like a tool that found nothing wrong.",
        prevention_rule:
            "No tool hand-maintains its own namespace list. Resolve through the shared resolveConceptJsonPath (which throws loudly on ambiguity) or import one exported SUBJECT_DIRS constant, so adding the next subject is one edit rather than a scavenger hunt. When a new subject namespace is created, grep for every existing reader of src/data/concepts and fix them all in that commit — the subject is not first-class until every tool can see it.",
        probe_type: 'js_eval',
        probe_logic:
            "Static: grep for readers of src/data/concepts and assert each resolves through the shared resolver or the shared namespace constant; FAIL naming any that hardcodes a directory list. Dynamic: for each subject, run every id-taking script against one concept from that namespace and assert none exits on ENOENT.",
        status: 'OPEN', concepts_affected: [C], fixed_in_files: ['src/scripts/check-layout-overlap.mjs'],
        discovered_in_session: SESSION, row_type: 'incident',
    },
];

async function main(): Promise<void> {
    console.log(`\nengine_bug_queue — session sweep: ${rows.length} row(s)\n`);
    for (const row of rows) {
        const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
        if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
        console.log(`  ${row.status.padEnd(5)} ${row.severity.padEnd(8)} ${row.bug_class}`);
    }
    console.log(`\nDone. ${rows.length} rows upserted.`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
