/**
 * engine_bug_queue — FOUR rows from founder_proxy Checkpoint B CYCLE 1 on
 * `graph_transformations` (2026-08-07; verdict FIX — 1 P1 · 4 P2 · 7 P3; report:
 * docs/loop_runs/mathematics/graph_transformations/founder_proxy_report_checkpointB_cycle1.md).
 *
 * The headline row is a REGRESSION THE CYCLE-0 REMEDY INTRODUCED: raising
 * grid_color to make the vertical scale readable turned two gridlines into
 * strikethroughs across the concept's primary aha chip and its only numeric
 * instrument. Filed CRITICAL because a horizontal rule through a sentence is
 * the visual grammar for "cancelled".
 *
 * Insert-only with per-row existence checks (never upsert). E3/E4 are
 * deliberately NOT minted as new classes — the proxy judged them extensions
 * of the live OPEN sibling-ink row and of Rule 34c; this script appends
 * graph_transformations to that row's concepts_affected instead, without
 * touching its status.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_graph_transformations_checkpointB_cycle1.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy checkpointB cycle1 graph_transformations 2026-08-07';
const CONCEPT = 'graph_transformations';
const APPEND_TO = 'parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_primitives_curve_or_line_ink';

const ROWS = [
    {
        bug_class: 'raising_gridline_contrast_turns_every_overlay_text_that_sits_on_a_tick_row_into_a_strikethrough',
        title: 'A legibility fix to the plane made its gridlines strike through the aha chip and the instrument readout',
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        root_cause: 'grid_color was raised #1E293B->#72859F (measured 1.047:1 -> 1.401:1) to make the vertical scale readable. Two authored text elements happened to sit on tick rows and had been invisibly crossed all along: STATE_6 chip_inside (author y 124 -> rendered 178.7, y=3 gridline at 178.5) and STATE_5 bracket_label (data y -1.95 -> rendered 510.6, y=-2 gridline at 513.5). Raising the grid made both crossings legible as strikethroughs - on the concept PRIMARY AHA line and on its only numeric instrument.',
        prevention_rule: 'Any change to a cartesian_plane grid_color/axis colour REQUIRES re-deriving every authored label/annotation position into rendered pixels and asserting none lands within +/-4 px of a gridline row. Conversely, never author absolute-positioned canvas text at a y that maps to a tick row - a horizontal rule through text reads as cancellation.',
        probe_type: 'js_eval',
        probe_logic: 'For each state: build the plane transform, enumerate gridline rows via PM_planeTickValues, convert every label/annotation position to rendered y, assert min(|label_y - gridline_y|) > 4 px for every text element.',
    },
    {
        bug_class: 'axis_scale_labels_placed_inside_the_plotted_band_are_overwritten_by_the_curve_they_measure',
        title: 'Edge y-labels were placed at the plane x_range boundary, inside every curve domain, so the curve endpoint overwrites the row it labels',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'Edge labels were authored at data x = -6.5, exactly x_range.min, because a search for a clear position was run over x in [-6.5,-5.5] - entirely INSIDE the plotted band. Every function_plot defaults x_domain to the plane x_range, so all curves begin at that exact x. The transform curve endpoint overwrites the "1" row for ~3 s in STATE_2 (26 percent of the bbox at t=13000), twice in STATE_5, and on every ping_pong cycle of the STATE_8 explore sandbox. Drawing labels in Pass 3 (after curves) does NOT rescue them: a #64748B glyph at alphaMul 0.6 composited over a #38BDF8 stroke plus glow is unreadable regardless of draw order.',
        prevention_rule: 'Axis scale labels belong in the MARGIN, at a data x strictly less than x_range.min (PM_planeResolve applies no viewport clipping), never inside the plotted band. One uniform x for all states - a per-state x defeats Rule 32d home-pose continuity. Verify by measuring across the dense series, not by eyeballing the pinned frame: the pin is the one moment authors check and the one moment most likely to be clean.',
        probe_type: 'js_eval',
        probe_logic: 'For every dense frame of every state: rasterise each axis-label bbox and assert zero pixels of any curve stroke colour inside it. Assert all states share one label x.',
    },
    {
        bug_class: 'choreography_holds_shift_every_downstream_ms_so_a_pin_named_in_absolute_ms_lands_off_hold',
        title: 'An eye_capture_ms prescribed in a review report was applied literally without re-deriving where holds[] actually put the value',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'STATE_4 sweeps a: 1 -> -2 over start_ms 1500 + duration_ms 12000 with holds[{at_value:-1, hold_ms:2000}]. duration_ms is MOVING time, so the hold at a=-1 occupies 9500-11500 ms and every later value is displaced 2000 ms. The pin was moved 11900 -> 12000, which is 500 ms PAST the hold, and the archived baseline shows a=-1.125 - demonstrating neither half of the state own title ("Flipped, Then Twice as Tall").',
        prevention_rule: 'Never take an eye_capture_ms from a review report on trust. Re-derive the hold windows from the choreography (holds INSERT time; duration_ms is moving time only) and pick the pin from inside a hold or from the post-sweep rest. Confirm against the rendered slider caption in the resulting frame before accepting it.',
        probe_type: 'js_eval',
        probe_logic: 'For each state with holds[]: compute the hold windows, assert eye_capture_ms falls inside one of them or inside the post-sweep rest; then read the rendered slider caption at that pin and assert it equals the intended value.',
    },
    {
        bug_class: 'a_claim_corrected_on_one_rendered_surface_is_left_standing_on_the_sibling_surface_that_repeats_it',
        title: 'A rule chip was reworded but the narration repeating the same claim was not, so chip and script now contradict each other in the same state',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'The fix round corrected chip_outside to "acts on y, as written" but left s6_1 saying "both act on y, in the direction their sign says" - the direction-over-a-scale-factor language the original scar row was filed against - so the on-canvas chip and the spoken script now state the outside rule two contradictory ways in one state. Separately the replacement word "inverted" collides with STATE_4 own newly-authored "Flipped", and disagrees with s6_2 "the opposite way" for the identical idea.',
        prevention_rule: 'A physics/mathematics CLAIM usually lives on 3-5 surfaces (title, delta cue, chip, formula surface, narration). When a review names one surface, grep every rendered string in that state for the same claim and fix them together in one edit; and check the replacement vocabulary against the words the OTHER states have already attached to a different meaning.',
        probe_type: 'js_eval',
        probe_logic: 'Per state, extract every rendered string (title, delta cue, labels, annotations, formula equation, tts text_en) and assert no two describe the same relation with contradictory qualifiers; flag any word used with two different technical meanings across states of one concept.',
    },
];

async function main(): Promise<void> {
    let filed = 0, skipped = 0;
    for (const row of ROWS) {
        const { data: existing } = await supabaseAdmin
            .from('engine_bug_queue').select('bug_class').eq('bug_class', row.bug_class).maybeSingle();
        if (existing) { console.log(`already filed: ${row.bug_class} — skipping.`); skipped++; continue; }
        const { error } = await supabaseAdmin.from('engine_bug_queue').insert({
            ...row, concepts_affected: [CONCEPT], discovered_in_session: SESSION, status: 'OPEN',
        });
        if (error) throw new Error(`insert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ FILED (OPEN) ${row.bug_class}`); filed++;
    }

    const { data: rec, error: readErr } = await supabaseAdmin
        .from('engine_bug_queue').select('bug_class, concepts_affected, status').eq('bug_class', APPEND_TO).maybeSingle();
    if (readErr) throw new Error(`read ${APPEND_TO} failed: ${readErr.message}`);
    if (!rec) {
        console.log(`⚠ append target not found: ${APPEND_TO} — E3/E4 recorded in the report only.`);
    } else if ((rec.concepts_affected ?? []).includes(CONCEPT)) {
        console.log(`append: ${APPEND_TO} already lists ${CONCEPT}.`);
    } else {
        const { error: upErr } = await supabaseAdmin.from('engine_bug_queue')
            .update({ concepts_affected: [...(rec.concepts_affected ?? []), CONCEPT] }).eq('bug_class', APPEND_TO);
        if (upErr) throw new Error(`append failed: ${upErr.message}`);
        console.log(`✅ APPENDED ${CONCEPT} to ${APPEND_TO} (status untouched: ${rec.status})`);
    }
    console.log(`\ndone: ${filed} filed, ${skipped} already present, of ${ROWS.length}; +1 append.`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
