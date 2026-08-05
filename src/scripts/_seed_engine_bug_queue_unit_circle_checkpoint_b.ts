/**
 * engine_bug_queue rows from founder_proxy CHECKPOINT B (the build gate) on
 * `unit_circle_to_sine_wave` — the first mathematics concept (2026-08-05).
 *
 * Fourth and last seed script on this concept. Checkpoint B returned FIX, not
 * APPROVE, on four grounds; these are the four that earn a permanent row.
 *
 * Row 4 is the one worth reading twice. The concept violated the AUTHORING-SIDE
 * DO clause of an OPEN scar filed against that same concept, in three
 * primitives, in the same session that filed it. A scar row is only worth what
 * it prevents, and a DO clause that is read at design time and never re-checked
 * against the finished artifact prevents nothing.
 *
 * subject='subject_neutral' throughout — every one binds physics and chemistry
 * concepts identically; none is about mathematics CONTENT.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_unit_circle_checkpoint_b.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy checkpoint B, unit_circle_to_sine_wave, 2026-08-05';
const CONCEPT = 'unit_circle_to_sine_wave';

interface Row {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: 'alex:json_author' | 'peter_parker:renderer_primitives';
    subject: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: 'js_eval';
    probe_logic: string;
    status: 'OPEN';
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string;
    row_type: 'incident' | 'directive';
}

const rows: Row[] = [
    {
        bug_class: 'pcpl_vector_label_at_segment_midpoint_is_bisected_by_a_vertical_segment',
        title:
            "drawVector prints spec.label at the exact midpoint 4 px up, so a vertical segment's own stroke splits the glyph and it reads as an arrowhead",
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "parametric_renderer.ts:2308-2313 places a vector's label at ((fx+tx)/2, (fy+ty)/2 - 4) with textAlign(CENTER, BOTTOM). A fixed 4 px vertical offset clears a HORIZONTAL segment cleanly, which is why the defect has never surfaced: nearly every labelled vector in the shipped fleet is horizontal or diagonal. On a VERTICAL segment the stroke runs straight through the glyph's centre. On unit_circle_to_sine_wave the height segment is vertical by construction — it IS the height — so the symbol y is bisected in every state that draws it (S3, S4, S5, S7, S8) and the split lowercase bowl reads at 100 percent zoom as a downward chevron, i.e. as a stray arrowhead, on the very segment whose misconception beat is about SIGN. The symbol is asserted on two formula surfaces (sin θ = y (r=1), y = sin θ) and one HUD row while being legibly defined on canvas nowhere. Object-anchored labels have to ride the owning primitive's own label field on this renderer (drawLabel has no position_expr), so there is no authoring workaround.",
        prevention_rule:
            "A primitive label is offset PERPENDICULAR to the primitive it names, never along a fixed screen axis: compute the unit normal from (tx-fx, ty-fy) and place the text ~8 px along it, or for a near-vertical segment switch to textAlign(LEFT, CENTER) at x + 6. Authoring corollary that outlives the engine fix: any symbol a formula surface asserts must have a legible on-canvas definition at 100 percent zoom in EVERY orientation its geometry can take — check the vertical case explicitly, because a fixed vertical offset is exactly what it breaks. Expect a fleet-wide re-baseline; labelled vectors appear on most parametric concepts.",
        probe_type: 'js_eval',
        probe_logic:
            'For every vector carrying a label, compute the segment direction; where it is within 15 degrees of vertical, assert the rendered label bounding box does not intersect the stroke rectangle. Author-side: FAIL any symbol that appears on a formula_box but whose only on-canvas definition is a vector label on a near-vertical segment.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'narration_names_a_reference_line_the_scene_never_draws',
        title:
            'A derivation state narrates a reflection across "the vertical line" while the scene contains only a horizontal reference',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            "unit_circle_to_sine_wave STATE_7 is a derivation_first_principles state whose entire argument is a reflection: \"take the angle you get by reflecting it across the vertical line\". Its scene_composition carries h_reference (horizontal, (40,230)->(260,230)) and NO vertical primitive of any kind. The mirror axis is the single object the derivation turns on, and the student is asked to imagine it while everything else in the state is drawn. A teacher has to add it with the pen tool. This is Rule 24 (the sim is the silent visual; it must read sound-off) and Rule 25 (explanation co-located with its visual) failing together, and it is invisible to every gate because no rule says \"the nouns in the narration must exist on canvas\".",
        prevention_rule:
            'Every geometric reference a narration sentence names — axis, line, plane, direction, diameter, perpendicular — is a DRAWN primitive in that state, not an implied one. On a derivation state the construction lines are content, not scaffolding. Before handoff, extract the reference noun phrases from each state\'s tts_sentences and match each to a primitive id in that same state; an unmatched phrase is either a missing primitive or a sentence that must be reworded.',
        probe_type: 'js_eval',
        probe_logic:
            "For each state, extract reference-object noun phrases from tts_sentences.text_en (vertical line, horizontal line, axis, diameter, perpendicular, centre line) and assert each maps to a primitive in that state's scene_composition. FAIL naming the unmatched phrase.",
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/data/concepts/mathematics/unit_circle_to_sine_wave.json'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'state_opens_on_the_degenerate_value_of_the_identity_it_teaches',
        title:
            'A ping_pong choreography with start_ms > 0 holds at `from`, so the state opens on the case where its own identity is vacuously true',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            "PM_choreoValue returns `from` for every t < start_ms (parametric_renderer.ts:1160). That pre-start hold is normally a feature — it is what lets a state stage its reveal order without a second choreography entry. But the held value IS the opening frame, and nothing forces an author to choose it. unit_circle_to_sine_wave STATE_7 authors {mode:'ping_pong', from:0, to:90, start_ms:4000}, so the advanced symmetry state — whose claim is that two DISTINCT angles share one height — opens for four seconds at theta = 0, where both heights read 0.00, the mirror radius lies flat along the diameter on top of the original, and the two points coincide. The identity is true there, vacuously, and shows nothing. The design had already chosen a better opening value for exactly this reason: the slider default is 45 degrees, picked in the mathematics block §1c because sin 45 = cos 45 = root2/2 is EXACT. The choreography ignored it.",
        prevention_rule:
            "When a state holds before its motion begins, the held value is the opening frame and must be chosen as deliberately as the frozen pin. Never let a hold land on the degenerate instance of the relation the state teaches — zero, coincident, collinear, or equal-by-vacuity. Set the choreography `from` to the design's named default (usually the slider default, which was chosen for being exact or representative), and check the t=0 frame against the state's own claim before handoff.",
        probe_type: 'js_eval',
        probe_logic:
            "For each state, evaluate every choreographed variable at t=0 and render the frame; assert the state's taught relation is non-degenerate there — for an equality claim, assert both compared quantities are non-zero and the compared elements are at distinct screen positions. Independently assert the t=0 value equals the authored slider default wherever the state exposes that variable.",
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/data/concepts/mathematics/unit_circle_to_sine_wave.json'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'authoring_side_do_clause_of_an_open_scar_is_not_re_checked_against_the_finished_json',
        title:
            'A concept violated the AUTHORING-SIDE DO clause of an OPEN scar filed against that same concept, in three primitives, in the same session that filed it',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            "pcpl_vector_and_angle_arc_ignore_appear_at_ms_so_authored_reveal_chains_no_op says in terms: \"AUTHORING SIDE until fixed: do not author appear_at_ms / animate_in_ms on a vector or an angle_arc and do not design a reveal chain that depends on one.\" The JSON authors exactly that on tick_5pi_2 (STATE_6) and on mirror_radius and mirror_height_seg (STATE_7) — and the row was filed against this very concept, in this very session, from these very primitives. The sequence that produces it is ordinary and will recur: the scar list is consulted BEFORE authoring, the artifact is then written, and nothing re-runs the OPEN rows against the finished file. Visible cost here: a stray tick hanging in empty canvas from t=0 with no axis under it, and a declared reveal-build beat that never fires. A field authored on a primitive type that silently ignores it is indistinguishable from correct authoring at every gate the repo currently runs.",
        prevention_rule:
            "An OPEN scar's AUTHORING SIDE clause is a build constraint, not background reading. Before handoff, re-run every OPEN row tagged on this concept as a grep against the FINISHED JSON — not against the design intent, and not against the skeleton. The pre-authoring sweep and the post-authoring sweep are two different checks and only the second one can catch this class. Generalises beyond timing fields: any DO clause phrased as \"do not author X\" is mechanically checkable against the artifact and should be checked there.",
        probe_type: 'js_eval',
        probe_logic:
            "For every scene_composition primitive carrying appear_at_ms / animate_in_ms / disappear_at_ms, resolve its type to the renderer draw function and assert that function opens with a PM_animationGate call; FAIL naming each inert type/field pair. More generally: for each OPEN engine_bug_queue row whose concepts_affected includes this concept, run its probe_logic against the finished JSON as a handoff gate, not only before authoring begins.",
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'directive',
    },
];

async function main(): Promise<void> {
    console.log(`\nengine_bug_queue — seeding ${rows.length} checkpoint-B row(s) for ${CONCEPT}\n`);
    for (const row of rows) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(row, { onConflict: 'bug_class' });
        if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ ${row.severity.padEnd(8)} ${row.row_type.padEnd(9)} ${row.bug_class}`);
    }
    console.log(`\nDone. ${rows.length} rows upserted.`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});

/**
 * ONE ESCALATION THIS SCRIPT DELIBERATELY DOES NOT MAKE.
 *
 * founder_proxy recommends raising `pcpl_slider_label_stale_under_choreography`
 * from MODERATE to MAJOR and appending this concept's evidence. The recurrence
 * (concepts_affected) was already recorded by _build_gate.ts. Changing another
 * session's SEVERITY is an owner/founder action, not a concept desk's — the row
 * belongs to peter_parker:renderer_primitives and its severity is that owner's
 * scheduling signal. Flagged in the handoff instead.
 *
 * The supporting evidence, recorded here so the owner does not have to re-derive
 * it: the row's own prescribed alternative remedy — hiding the slider row during
 * the choreographed window via the `visible_controls` precedent — DOES NOT EXIST
 * on this renderer. `visible_controls` appears only in particle_field_renderer.ts
 * and field_3d_renderer.ts; grep over parametric_renderer.ts returns zero hits,
 * and drawCanvasSlider has no PM_animationGate call, so a PCPL slider cannot be
 * time-gated at all. The engine fix is therefore the ONLY path, and it is ~3
 * lines at the `var val = PM_sliderValues[spec.variable]` seed (:3097-3104):
 * prefer PM_choreoValues while !PM_userTouched[var]. It repairs scalar_vs_vector
 * and resultant_direction at the same time.
 */
