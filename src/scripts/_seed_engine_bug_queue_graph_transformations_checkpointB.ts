/**
 * engine_bug_queue — SIX rows from founder_proxy Checkpoint B on
 * `graph_transformations` (retroactive gate, 2026-08-07; verdict FIX —
 * 1 P1 · 5 P2 · 9 P3; full report:
 * docs/loop_runs/mathematics/graph_transformations/founder_proxy_report_checkpointB.md).
 *
 * SQL authored by founder_proxy in its report (report-only agent — the
 * dispatching session files rows, per the standard contract). Translated
 * verbatim into the repo's standard seed-script shape; bug_class values were
 * collision-checked by the proxy against 40 live rows + the 7 unapplied
 * Checkpoint-A candidates, and this script re-checks per-row with
 * maybeSingle() so a re-run never duplicates or overwrites (the
 * scar-apply hazard from the ch6 record: a verbatim upsert once nearly
 * reopened a FIXED row — inserts here are insert-only, never upsert).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_graph_transformations_checkpointB.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy checkpoint B graph_transformations 2026-08-07';

interface Row {
    bug_class: string;
    title: string;
    severity: string;
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: string;
    probe_logic: string;
    concepts_affected: string[];
}

const ROWS: Row[] = [
    {
        bug_class: 'axis_declutter_sets_tick_labels_to_none_without_the_edge_labels_that_were_its_other_half',
        title: 'A declutter note prescribed "tick_labels: none PLUS edge labels"; only the none shipped, leaving a graph concept with no readable scale on the axis its every claim measures',
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        root_cause: 'graph_transformations authored y_tick_labels "none" on all 8 cartesian_plane primitives to clear the interior y-label column flagged at Checkpoint A. The skeleton section 11(f) prescribed "y_tick_labels: none + edge labels via labels". The edge labels were never authored. Compounding: grid_color #1E293B renders at RGB(20,24,37) against RGB(15,15,26) after the 0.6 peer-dim (parametric_renderer.ts @973) — a 1.07:1 contrast ratio, effectively invisible. Every core claim in the concept (k slides up by exactly k, |a| is the amplitude, a=-2 is twice as tall) is vertical and unmeasurable on screen.',
        prevention_rule: 'When a declutter removes an axis label channel, the REPLACEMENT is part of the same edit, never a follow-up: a plane may not ship with tick_labels "none" on an axis along which any state makes a quantitative claim unless replacement labels exist as primitives in that state. Separately, any gridline or reference-grid colour must clear a 1.5:1 contrast ratio against the scene background AFTER the focal peer-dim multiplier is applied — author the post-dim value, not the pre-dim hex.',
        probe_type: 'js_eval',
        probe_logic: 'For each cartesian_plane primitive, if x_tick_labels or y_tick_labels is "none", assert the same state authors at least two label primitives whose text parses as a number positioned along that axis. Separately, composite grid_color against the scene background at the state focal alphaMul and assert the WCAG contrast ratio exceeds 1.5:1.',
        concepts_affected: ['graph_transformations'],
    },
    {
        bug_class: 'readout_format_drops_the_point_name_that_every_later_narration_still_uses',
        title: 'State 1 labels its point "P = (x, y)"; every later state renders a bare coordinate pair while the narration keeps saying P-prime, so the named object exists only in audio',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: "graph_transformations S1 authors plot_point.readout.format \"P = ({x}, {y})\"; S2 through S8 author \"({x}, {y})\". Narration s2_3 (\"P-prime rises with it\") and s4_3 (\"P-prime, the peak's image, travels straight down\") name a symbol that appears on no canvas surface in any state. The concept establishes the object by name in S1 and drops the name in the states that map it, including S7 whose entire content is the mapping.",
        prevention_rule: 'Any symbol a tts_sentence speaks must appear on a canvas surface in the same state. When a tracked object is named on one state\'s readout, every subsequent state that renders the same object carries the corresponding name in its readout format — a bare coordinate pair is not a label. Check the readout.format strings as a group across all states, not one state at a time.',
        probe_type: 'js_eval',
        probe_logic: 'Extract every capitalised or primed identifier from each state\'s tts_sentences text_en; assert each appears as a substring of some label text, annotation text, formula_box equation or readout.format in that same state.',
        concepts_affected: ['graph_transformations'],
    },
    {
        bug_class: 'state_title_asserts_a_sequence_the_choreography_plays_in_the_opposite_order',
        title: "A rail-facing title names two effects in an order the state's own sweep and its own narration both reverse",
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'graph_transformations S4 is titled "Multiply by a: Taller, Then Flipped". Its choreography ramps a from 1 to -2, so the curve shrinks to flat at a=0, flips, then grows upside down — flipped THEN taller, never taller then flipped. The state\'s own narration s4_2 states the correct order. The title is the rail string a teacher scans and truncates on, so it is the highest-leverage wrong sentence in the state.',
        prevention_rule: "Every state title that names a sequence must be checked against the state's variable_choreography direction and against its own narration, not against the concept's general claim. Where a swept parameter passes through zero or changes sign, the title states the order the sweep actually produces.",
        probe_type: 'js_eval',
        probe_logic: 'For any state title containing "then" or a comma-separated pair of effects, assert the ordering matches the sign progression of its variable_choreography from/to values, and assert no tts_sentence in the same state states the reverse ordering.',
        concepts_affected: ['graph_transformations'],
    },
    {
        bug_class: 'rule_chip_generalises_shift_direction_language_over_a_scale_factor_that_has_no_direction',
        title: 'The primary-aha chip says inside numbers act "in the opposite direction", which is true of the shift and meaningless of the scale factor the same chip covers',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'graph_transformations S6 chips read "outside — acts on y, same direction" and "inside — acts on x, opposite direction", each covering one shift (k, h) and one scale factor (a, b). b = 2 does not move the curve in any direction; it divides the width by b. The wording arrived as a Rule-41 register fix at Checkpoint A (P2-9) replacing an idiom, and the replacement was checked for plain language but not for mathematical scope. The concept\'s own aha_moment.statement uses the correct looser word ("the opposite way").',
        prevention_rule: 'A chip or caption that generalises over a set of parameters must be true of EVERY member of that set, not of the most representative one. Shift vocabulary (direction, left, right, up, down) may not be applied to a multiplicative parameter; use operation vocabulary (divides, multiplies, inverted). Register fixes under Rule 41 are re-checked for scope against every parameter the string covers before they land.',
        probe_type: 'manual',
        probe_logic: 'For each on-canvas string asserting a rule over a named group of parameters, enumerate the group members from the state\'s choreography and confirm the assertion holds literally for each; reject direction words applied to any parameter that appears as a multiplier.',
        concepts_affected: ['graph_transformations'],
    },
    {
        bug_class: 'tts_sentence_glow_channel_unused_across_an_entire_subject_namespace',
        title: 'Every mathematics concept authors zero tts_sentences[].glow, so with narration on nothing on canvas tracks the sentence, on an engine where the channel is fully wired',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'graph_transformations authors 0 glow bindings across 23 sentences; derivative_as_secant_limit and unit_circle_to_sine_wave author 0 as well — the whole mathematics namespace. The channel is live for the parametric engine: build_review_site.ts @355 reads s.glow, @1176 calls sendGlow, @1092 posts SET_GLOW, and parametric_renderer.ts @944-950 resolves PM_glowOverride per primitive. Roughly twenty field_3d physics concepts author it, so the gap is a pattern-doc omission in the mathematics lane, not an engine limitation.',
        prevention_rule: 'Every tts_sentence in every concept carries a glow naming exactly one on-canvas primitive id present in that state, unless the state authors no narration. This is checked per subject namespace at the pattern-doc level, because a namespace that starts at zero stays at zero.',
        probe_type: 'js_eval',
        probe_logic: "For each state with non-empty tts_sentences, assert every sentence has a glow whose value matches an id in that state's scene_composition; report the per-concept and per-namespace bound fraction.",
        concepts_affected: ['graph_transformations', 'derivative_as_secant_limit', 'unit_circle_to_sine_wave'],
    },
    {
        bug_class: 'schema_requires_a_focal_primitive_so_an_explore_sandbox_cannot_reach_the_renderer_no_dim_path',
        title: 'interaction_complete states are forced to declare a focal, which dims the live numeric readout the teacher is reading while dragging',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'conceptJson.ts @91 declares focal_primitive_id: z.string().min(1) — required non-empty on every state. parametric_renderer.ts @969 already implements the correct sandbox behaviour ("No focal declared for this state → nobody dims, nobody glows") but @973 dims every non-focal primitive to alphaMul 0.6 whenever a focal IS declared. graph_transformations S8 declares transform_curve as focal, so the p_prime coordinate readout — the only numeric instrument in the sandbox — renders at 0.6 and reads as dull olive rather than amber.',
        prevention_rule: "A state with advance_mode interaction_complete is a sandbox: nothing dims. Allow focal_primitive_id to be omitted (or add an explicit no_focal flag) on explore states so the renderer's existing no-focal path is reachable, and default explore states to it.",
        probe_type: 'js_eval',
        probe_logic: 'On any state with advance_mode interaction_complete, assert getEmphasis returns alphaMul === 1 for every primitive in the scene.',
        concepts_affected: ['graph_transformations'],
    },
];

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
            discovered_in_session: SESSION,
            status: 'OPEN',
        });
        if (error) throw new Error(`insert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ FILED (OPEN) ${row.bug_class}`);
        filed++;
    }
    console.log(`\ndone: ${filed} filed, ${skipped} already present, of ${ROWS.length}.`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
