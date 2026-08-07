/**
 * engine_bug_queue — SIX new rows + ONE concepts_affected append, from
 * founder_proxy Checkpoint B on `derivative_as_secant_limit` (retroactive
 * gate, 2026-08-07; verdict FIX — 2 P1 · 9 P2 · 6 P3; full report:
 * docs/loop_runs/mathematics/derivative_as_secant_limit/founder_proxy_report_checkpointB.md).
 *
 * SQL authored by founder_proxy (report-only agent; the dispatching session
 * files rows). Translated into the standard seed-script shape: inserts are
 * insert-only with per-row existence checks (never upsert — the ch6
 * scar-apply hazard), and the ONE existing-row touch is a targeted
 * concepts_affected append that never changes status/fixed_at.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_derivative_checkpointB.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy checkpoint B derivative_as_secant_limit 2026-08-07';
const CONCEPT = 'derivative_as_secant_limit';

interface Row {
    bug_class: string;
    title: string;
    severity: string;
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: string;
    probe_logic: string;
}

const ROWS: Row[] = [
    {
        bug_class: 'derived_curve_state_draws_two_identical_markers_with_no_connector_label_or_number',
        title: "A state that maps one curve's slope onto a second curve draws both markers identically, unlinked and unnumbered, so the mapping it exists to teach is invisible",
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        root_cause: 'STATE_8 renders marker8 (u, u^2/2) and fprime_head (u, u) in the same colour and size, unlabelled, with no connector between them and no numeric readout anywhere in the state; the focal dims marker8, the half whose slope is the story. The delta cue asserts "Slopes drawn as heights" and no primitive draws that height link.',
        prevention_rule: 'A state whose claim is a CORRESPONDENCE between two drawn objects must draw the correspondence, not just both objects: an explicit connector between the paired points, a distinct label on each, and at least one live number for the derived quantity. Two markers of the same colour and size are one object to a reader. Check specifically on any state using locus_trace to build a derived function.',
        probe_type: 'js_eval',
        probe_logic: "For every state containing a locus_trace: assert (a) a vector/line primitive exists whose endpoints are the trace's (x_expr,y_expr) and the source primitive's position_expr at the same parameter; (b) each of the two paired markers resolves a distinct label or readout; (c) at least one readout/text_expr in the state renders the derived quantity as a number. Fail listing which of the three is missing.",
    },
    {
        bug_class: 'unicode_subscripts_cannot_express_a_two_level_limit_so_lim_h_to_0_renders_with_a_full_size_arrow',
        title: 'lim_{h->0} authored from Unicode subscript characters renders as three type sizes on one operator — subscript h, full-size arrow, subscript zero',
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        root_cause: 'There is no Unicode subscript arrow, so the entire "h->0" cannot be pushed to subscript level using codepoints alone. STATE_7 line3 "lim(sub h)->(sub 0) (x0 + h/2)" therefore renders the arrow at main level between two subscripts. Invisible at 1x; obvious at 4x.',
        prevention_rule: 'Formal limit, sum and integral notation must never be assembled from Unicode subscript codepoints across a relational operator — the operator will render at the wrong level. Author a stacked construction (operator box + a smaller sub-line placed beneath it) or route the layout to the engine. Any equation string containing a subscript codepoint adjacent to an arrow/relation is a red flag and must be read at 4x before sign-off.',
        probe_type: 'js_eval',
        probe_logic: 'Scan every formula_box.equation / label.text for a Unicode subscript codepoint (U+2080-U+209C) appearing on BOTH sides of a relational or arrow character (U+2192, U+2190, =, <, >) within one token; flag each occurrence for zoom review.',
    },
    {
        bug_class: 'delta_cue_asserts_the_states_end_condition_so_it_is_false_while_most_of_the_state_plays',
        title: "A delta cue naming the state's FINAL condition contradicts the picture for the first half of the state",
        severity: 'MAJOR',
        owner_cluster: 'alex:architect',
        root_cause: 'STATE_4\'s cue "h = 0: no chord" is drawn from t=0 while a chord is on screen and rotating until 13500 ms of a 24000 ms state. The cue is true for 44% of the state and false for 56%.',
        prevention_rule: 'A delta cue is a caption on every frame, not a title for the last frame: it must be true for the whole state, or it must itself be time-gated to the moment it becomes true. Where the state\'s one new thing is an ABSENCE, phrase the cue as the action ("Shrink h all the way") not the end condition ("h = 0: no chord"). Rule 25d makes this binding — a reordered rail can land a teacher anywhere in the state.',
        probe_type: 'js_eval',
        probe_logic: 'For every state with an annotation whose id is delta_cue and no appear_at_ms: parse any literal value assignment in the cue text (e.g. "h = 0") and assert the named variable holds that value for the whole state under variable_choreography; fail where it holds for less than the full duration.',
    },
    {
        bug_class: 'readout_offset_authored_from_one_sample_aims_the_text_into_the_curve_the_point_rides',
        title: 'An authored readout offset points up-and-right from a point on a rising curve — into the ink of the curve and every line through it',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: "Q.readout.offset {12,-30} on STATE_2/3/9 aims the text at the region a rising parabola and its chord occupy. Worst case is teacher-reachable, not incidental: dragging Q toward P from the left in the explore state parks the readout on P's own marker and destroys Q's x-coordinate.",
        prevention_rule: 'A readout offset on a point that MOVES must be chosen by reading frames across the point\'s full authored range and full drag range, never at one pin — the standing DO clause of the closed row parametric_canvas_drawn_readout_overprints_its_own_line. On a monotone curve, offset AWAY from the direction of ascent (left/below for a rising branch), and check the offset against every other point\'s marker and readout box, not just against the lines.',
        probe_type: 'js_eval',
        probe_logic: 'For each plot_point with an authored readout offset: sample the bound variable across its full choreography range AND its full drag min/max at 40 steps; at each step resolve the readout bbox and assert no intersection with (a) the sampled function_plot polyline, (b) any secant/tangent polyline, (c) any other plot_point marker disc or readout bbox. Report the worst-case parameter value and which ink strikes it.',
    },
    {
        bug_class: 'narration_names_an_internal_choreography_variable_that_no_primitive_labels',
        title: 'Narration says "the sweep value u" — an authoring-internal variable name that appears on no label, chip or axis',
        severity: 'MAJOR',
        owner_cluster: 'alex:mathematics_author',
        root_cause: 'STATE_8 s8_2 names the choreography variable u. The mathematics block\'s own checklist asserted "every geometric noun in narration maps to a drawn primitive — audited state by state; no violation found"; the audit covered nouns and missed symbols.',
        prevention_rule: 'The narration audit for "every named thing is on canvas" must cover SYMBOLS and VARIABLE NAMES, not only geometric nouns. A choreography variable is an implementation detail: either give it an on-canvas chip and a spoken name a student can use, or rewrite the sentence without it. Sibling class of narration_names_a_reference_line_the_scene_never_draws.',
        probe_type: 'js_eval',
        probe_logic: 'For each state, extract single-letter and short identifiers from tts_sentences[].text_en and assert each appears in some rendered string of the SAME state (label.text/text_expr, formula_box.equation, readout.format, annotation.text) or in engine_config.variables with a rendered chip. Report unmatched identifiers per state.',
    },
    {
        bug_class: 'the_same_equation_string_is_printed_on_both_a_plane_label_and_the_formula_box',
        title: 'One state prints an identical equation string on two surfaces — the in-plane curve label and the formula box',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause: 'STATE_1 carries curve_label "y = x^2/2" and formula_box "y = x^2/2" simultaneously on an otherwise near-empty frame (Rule 34b: one formula surface per state).',
        prevention_rule: 'Before authoring a formula_box, diff its equation string against every label/annotation text already in the same state. A curve identity label and a formula surface may coexist only when they carry DIFFERENT relations.',
        probe_type: 'js_eval',
        probe_logic: 'Per state, normalise whitespace and compare formula_box.equation against every label.text and annotation.text; fail on exact or whitespace-insensitive match.',
    },
];

const APPEND_TO = 'formula_surface_states_an_identity_in_a_unit_the_hud_never_renders';

async function main(): Promise<void> {
    let filed = 0;
    let skipped = 0;
    for (const row of ROWS) {
        const { data: existing } = await supabaseAdmin
            .from('engine_bug_queue')
            .select('bug_class')
            .eq('bug_class', row.bug_class)
            .maybeSingle();
        if (existing) {
            console.log(`already filed: ${row.bug_class} — skipping.`);
            skipped++;
            continue;
        }
        const { error } = await supabaseAdmin.from('engine_bug_queue').insert({
            ...row,
            concepts_affected: [CONCEPT],
            discovered_in_session: SESSION,
            status: 'OPEN',
        });
        if (error) throw new Error(`insert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ FILED (OPEN) ${row.bug_class}`);
        filed++;
    }

    // Targeted append to the EXISTING row's concepts_affected — never touches
    // status/fixed_at (the ch6 hazard: a verbatim upsert once nearly reopened
    // a FIXED row).
    const { data: rec, error: readErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class, concepts_affected, status')
        .eq('bug_class', APPEND_TO)
        .maybeSingle();
    if (readErr) throw new Error(`read ${APPEND_TO} failed: ${readErr.message}`);
    if (!rec) {
        console.log(`⚠ append target not found: ${APPEND_TO} — recurrence recorded in the report only.`);
    } else if ((rec.concepts_affected ?? []).includes(CONCEPT)) {
        console.log(`append: ${APPEND_TO} already lists ${CONCEPT} — nothing to do.`);
    } else {
        const { error: upErr } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({ concepts_affected: [...(rec.concepts_affected ?? []), CONCEPT] })
            .eq('bug_class', APPEND_TO);
        if (upErr) throw new Error(`append ${APPEND_TO} failed: ${upErr.message}`);
        console.log(`✅ APPENDED ${CONCEPT} to ${APPEND_TO} (status untouched: ${rec.status})`);
    }

    console.log(`\ndone: ${filed} filed, ${skipped} already present, of ${ROWS.length}; +1 append.`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
