/**
 * engine_bug_queue — the rows from founder_proxy Checkpoint B cycles 2 and 3 on
 * `definite_integral_as_accumulated_area` (2026-08-09).
 *
 * Seven rows, all now FIXED, plus one CORRECTION to an existing row.
 *
 * Cycle 2 returned FIX(engine) with THREE blocking defects that a *passing*
 * quality_auditor build still contained — every one of them found by driving the
 * sim, none visible to any deterministic gate. Cycle 3 approved the fixes and
 * found FOUR more, all ride-along. All seven landed on master via PR #76.
 *
 * The correction matters more than any single new row: the CRITICAL row
 * `state_reveal_scheduled_past_the_player_derived_timeline_freeze` still says the
 * remedy is to bring the choreography inside the timeline and "never to push the
 * pin later". The engine did NEITHER — it raised the timeline FLOOR. A prevention
 * rule that contradicts the shipped fix actively misleads the next author, which
 * is the one thing the scar list must never do.
 *
 * Filed from the concept desk because engine desks carry no DB credentials —
 * the standing convention for every _seed_engine_bug_queue_*.ts script.
 *
 * Idempotent: upsert onConflict 'bug_class' for the seven; a scoped .update()
 * for the correction, so the existing row's title and root_cause survive.
 *
 * Run: npx tsx --env-file=.env.local \
 *      src/scripts/_seed_engine_bug_queue_definite_integral_checkpoint_b_cycles_2_3.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION =
    'founder_proxy Checkpoint B cycles 2 and 3 on definite_integral_as_accumulated_area, 2026-08-09 — cycle 2 FIX(engine) with three blocking defects found by live drive against a build quality_auditor had PASSed; cycle 3 APPROVE (rubric 17/20) with four ride-alongs. All fixes landed on master via PR #76 from desk fix/pcpl-slider-leak-guided-state.';

const CONCEPT = 'definite_integral_as_accumulated_area';
const PCPL_FLEET = [
    CONCEPT, 'derivative_as_secant_limit', 'unit_circle_to_sine_wave', 'graph_transformations',
];

interface Row {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: 'peter_parker:renderer_primitives' | 'alex:json_author';
    subject: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: 'js_eval' | 'manual';
    probe_logic: string;
    status: 'FIXED' | 'OPEN';
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string;
    row_type: 'incident' | 'directive';
}

const rows: Row[] = [
    // ── Cycle 2, blocking #1 ────────────────────────────────────────────────
    {
        bug_class: 'pcpl_riemann_bars_drawing_cap_preserves_extent_but_not_coverage_so_the_area_visibly_evaporates_as_n_grows',
        title:
            'The 400-bar drawing cap spanned the full domain but still drew each bar at its true sub-pixel width, so the area under the curve visibly emptied to nothing as n grew — confirming the exact misconception the state exists to destroy',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "An earlier fix made the cap's selected indices an even spread across [0,n) so the drawn EXTENT was correct at every n. But each selected bar was still drawn at its true width h=(to-from)/n. On STATE_4 at n=10000, h=0.0002 -> 0.044 canvas px; 400 sub-pixel bars render as nothing. Measured over the state's own dense frames, the inked fraction of the region under the curve fell 0.992 (n=274) -> 0.707 (n=1540) -> 0.008 (n=4870). The renderer's own comment stated the contract the code did not deliver: 'above the cap the picture stops changing while the number keeps moving.' It did not stop changing; it EMPTIED. STATE_4's misconception_watch belief is 'Adding up rectangles is only ever an approximation, so the exact area is a fiction' — an evaporating area is the strongest possible confirmation of it, so the state argued against itself.",
        prevention_rule:
            'A drawing cap must bound COST while preserving both EXTENT and COVERAGE. When the cap engages, build a fresh equal partition of barsDrawnCount bars each spanning (to-from)/barsDrawnCount, resampled at its own edges — never decimate a partition and keep the original widths. The published sum must stay on the true n and is unaffected. General form: a decimation that keeps position and drops area is not a decimation, it is a deletion. Corollary: when a renderer comment states a contract ("the picture stops changing above the cap"), that sentence is a testable assertion — write the test, because a comment that is false is worse than no comment.',
        probe_type: 'js_eval',
        probe_logic:
            "check_cartesian_plane.ts section 'F3-DRAW'. For any riemann_bars authoring max_bars_drawn, sample the inked pixel fraction of the region under the curve at n=cap and at n=100*cap and assert the ratio stays within [0.9, 1.1]; pre-fix ratio 100.0 FAILS, shipped ratio 1.0000 PASSES. Also asserts every drawn partition tiles the domain exactly and that the published sum is bit-identical capped vs uncapped vs the closed form (|delta| <= 3.55e-15 at n=4/401/2304/4870/10000). Verified live: inked fraction 0.008 -> 0.999 at n=4870, flat 0.998-1.000 from n=100 to n=10000, with no discontinuity at the cap boundary. Blast radius proven across all 118 remote branch tips: riemann_bars exists in exactly ONE file in the repository.",
        status: 'FIXED',
        concepts_affected: [CONCEPT],
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/scripts/check_cartesian_plane.ts'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },

    // ── Cycle 2, blocking #2 ────────────────────────────────────────────────
    {
        bug_class: 'pcpl_appear_at_ms_zero_with_animate_in_renders_zero_alpha_while_the_clock_is_parked_so_a_rail_opened_state_is_blank',
        title:
            'The clock sits at 0 until Play is pressed, so every primitive due at state start rendered invisible — an explore sandbox opened as an empty grid under a caption telling the teacher to drag something that was not drawn',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "Rail entry sent an explicit SET_TIME_FREEZE {at_ms: 0} pin, so PM_simTimeMs was 0 and pinned for every state until Play was pressed — the states were ACTIVELY pinned, not merely unstarted, which is why the first diagnosis ('the clock never starts') was incomplete. Against a clock parked at 0, a primitive with appear_at_ms:0 + animate_in_ms:1200 has exactly 0 fade progress and therefore zero alpha, sustained for as long as the state sits open. STATE_8 (interaction_complete) showed axes, five live chips and one orphaned plot_point under the delta cue 'Drag the upper bound'; STATE_4's magnifier inset — the state's whole subject — was absent; STATE_1 was entirely blank. Because the chips kept updating correctly, nothing signalled that the picture was missing: it read as a deliberate numbers-only state. Rule 37 removed the auto-freeze at timeline END so the sandbox keeps running, but nothing exempted it at ENTRY, so interaction_complete was not alive on entry at all.",
        prevention_rule:
            "Rule 37's sandbox is only continuous if it is running BEFORE the teacher touches Play: do not send an entry freeze pin to an interaction_complete / continuous_motion state. Separately and more generally, a reveal window opening at t<=0 is the state's OWN OPENING PICTURE, not a mid-state reveal — an animate_in is a TRANSITION, not a visibility gate, and a not-yet-started transition is not a hidden element, so it must resolve to its completed appearance. Corollary for reviewers: THE EYE pins the clock via SET_TIME_FREEZE and can never see this class — a state's ENTRY appearance must be DRIVEN, never captured.",
        probe_type: 'js_eval',
        probe_logic:
            "check_cartesian_plane.ts section 'RULE-37-GAP-B' plus a live drive. SET_STATE each state from the rail WITHOUT pressing Play and assert every primitive with appear_at_ms <= 0 renders at non-zero alpha; additionally assert PM_simTimeMs advances on any interaction_complete state. Verified live: opening primitives at full alpha 5/8/11/16/9/8/11/14 across the eight states, STATE_8 entering with frozen=false and the clock advancing. The regression risk — that the general fix makes LATER reveals appear early — is covered by asserting STATE_2's Sn_chip (appear_at_ms 18000) still gates hidden at 17900 and fades 0.000 -> 0.250 -> 0.500 -> 1.000 across 18000-18400.",
        status: 'FIXED',
        concepts_affected: PCPL_FLEET,
        fixed_in_files: ['src/lib/renderers/parametric_renderer.ts', 'src/scripts/build_review_site.ts', 'src/scripts/check_cartesian_plane.ts'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },

    // ── Cycle 2, blocking #3 ────────────────────────────────────────────────
    {
        bug_class: 'player_reveal_timeline_shrinks_with_the_teacher_speed_control_so_authored_reveals_are_unreachable_above_default_rate',
        title:
            "timelineTotal was a function of the Speed slider while every appear_at_ms is a constant, so one notch above default silently deleted payoff reveals — including a misconception state's own correction, leaving the WRONG number as the held final frame",
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "computeTimeline() derived timelineTotal from estSentenceMs = (chars/5.5)/(WPM*rate)*60000, and onTimelineEnd pinned SET_TIME_FREEZE there. rate is a SHIPPED, ENABLED teacher slider (0.7-1.1, default 0.9, enabled whenever no audio clip exists). Authored appear_at_ms values are absolute constants budgeted against the state's authored duration, so the timeline moved under content that never did. Measured live: at rate 1.0 STATE_2's Sn=1.7500 — the DoD payoff, the aha_moment's own visual_confirmation and assessment q1's answer — never rendered, and STATE_7 held beta=1.89/A=2.2663 under narration saying 'By x equals 2, that curve ends at 2.6667'; at 1.05 STATE_5 lost BOTH the integral and below-axis chips and held 'total area = 2.0000', the dim WRONG number its own misconception_watch exists to refute, as its final frame with no correction; at 1.1 STATE_1's region stopped filling at x=1.62. Four of seven guided states, silently, one notch above default.",
        prevention_rule:
            "The reveal timeline must never fall below the state's authored reveal requirements: timelineTotal = max(narrationEnd, (state.duration||0)*1000). The authored duration already exists on every state and every reveal was budgeted against it; narration simply finishes early and the picture runs to its authored end, which is exactly Rule 31's 'motion may outrun narration, never the reverse'. Do NOT fix this by trimming narration — that tunes one concept to sit inside a line that MOVES with a teacher control, needs cuts below the Rule 31 word floor to survive rate 1.1, and leaves every other concept exposed to an identical structure. A pacing control may change how fast the picture plays; it must never change WHETHER the picture completes.",
        probe_type: 'js_eval',
        probe_logic:
            "New suite check_review_site_timeline.ts (npm run check:review-site-timeline), which extracts computeTimeline's real body from build_review_site.ts by brace-matching. Asserts timelineTotal === duration*1000 at all six rates 0.7-1.1, that narration longer than the authored duration is never truncated, that the no-sentences 12s fallback survives, and that duration:0 lengthens nothing. Negative controls reproduce STATE_1's fill stopping short at rate 1.1 and STATE_2's payoff vanishing at rate 1.0, then show the shipped code does not; reverting flips 8 assertions. Verified live by sweeping 9 rates x 8 states: 0 shortfalls of 72, and real-time playback at rate 1.1 lands all four previously-broken frames.",
        status: 'FIXED',
        concepts_affected: PCPL_FLEET,
        fixed_in_files: ['src/scripts/build_review_site.ts', 'src/scripts/check_review_site_timeline.ts'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },

    // ── Cycle 3 ride-alongs ─────────────────────────────────────────────────
    {
        bug_class: 'pcpl_animate_in_ms_is_silently_dead_config_on_an_appear_at_ms_zero_primitive',
        title:
            'A primitive due at state start declares a fade duration that can never run, because the opening-picture early return fires before the ramp',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "The fix for the blank-on-entry class added 'if (appearAt <= 0) return {visible:true, alpha:1}' so a rail-opened state paints its own opening picture against a clock parked at t=0. Correct behaviour — but it returns BEFORE the (elapsed-appearAt)/animMs ramp, so animate_in_ms on any appear_at_ms<=0 primitive is accepted by the schema and never consumed. Measured: 10 primitives in this concept alone declare 400-1200 ms fades that do not run (STATE_4 x6, STATE_8 x3, STATE_6 x1), verified by sampling alpha = 1.000 at t = 0, 100, 200, 300, 400 on STATE_6's bars_left.",
        prevention_rule:
            'A field the schema accepts and the renderer cannot reach must be rejected at validation or documented as inert at the schema site — never silently ignored. Warn (or fail) when animate_in_ms is authored alongside appear_at_ms<=0: an author reading the JSON currently sees a fade the product will never show, and will reasonably tune a number that does nothing.',
        probe_type: 'js_eval',
        probe_logic:
            'For every primitive, assert NOT (appear_at_ms <= 0 AND animate_in_ms > 0); or equivalently assert PM_animationGate returns alpha<1 at t=0 for any primitive declaring animate_in_ms.',
        status: 'OPEN',
        concepts_affected: PCPL_FLEET,
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_renderer_output_variable_shares_its_name_with_a_teacher_control_in_another_state',
        title:
            'bars_drawn_var writes a scope variable named "n" while another state exposes a teacher slider also named "n" — one shared namespace, two different authorities',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "riemann_bars.bars_drawn_var publishes the drawn-rectangle count into the same expression scope that PM_sliderValues writes teacher control values into. STATE_3 and STATE_6 publish it as 'n'; STATE_8 exposes a teacher slider also called 'n'. No defect today: the guided-state overlay gate refuses inherited live-control values, and no single state both publishes and controls the same name — verified by dragging n to 200 in the explore state and visiting all seven guided states, every one of which opened on its authored default. The hazard is that provenance is carried by naming discipline alone.",
        prevention_rule:
            'A renderer OUTPUT variable and a teacher CONTROL variable must not be able to collide in one scope: namespace renderer outputs (e.g. an out_ prefix), or reject at validation any concept where a bars_drawn_var name equals a slider label or plot_point drag.bind_variable anywhere in the same concept. STATE_4 already models the safe spelling (n_drawn).',
        probe_type: 'js_eval',
        probe_logic:
            'For each concept, collect every bars_drawn_var (and any future renderer-written scope name) and every slider label / plot_point drag.bind_variable across ALL states; assert the two sets are disjoint.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'review_player_scrub_total_label_not_refreshed_on_rail_entry_so_a_state_reads_zero_seconds',
        title:
            'Opening a guided state from the rail shows "0.0 / 0.0s" for a 24-second state; only pressing Play makes the duration appear',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "goToState() calls computeTimeline(), which sets scrubEl.max, but the scrubtime LABEL is refreshed only from the playback tick / updateScrubLabel path. Measured: rail-open STATE_5 reads '0.0 / 0.0s'; the explore state, which skips the entry pin and free-runs, correctly reads '1.8 / 12.0s'. Pre-existing and byte-identical at concept HEAD — but the timeline-floor fix makes per-state totals diverge further from narration length, so the wrong number is now wrong by more.",
        prevention_rule:
            'Any label derived from a computed timeline is refreshed in the SAME function that computes it. computeTimeline() should end by writing the label rather than leaving it to whichever caller happens to tick next — a teacher planning a lesson reads the state duration BEFORE pressing Play, which is exactly the moment the label is stale.',
        probe_type: 'js_eval',
        probe_logic:
            'SET_STATE each state via a rail click without pressing Play; assert #scrubtime parses to a total equal to scrubEl.max/1000 within 0.1 s.',
        status: 'OPEN',
        concepts_affected: PCPL_FLEET,
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'explore_state_truncates_the_function_at_the_integration_bound_so_dragging_erases_the_curve',
        title:
            'The sandbox draws the curve only on the integration interval, so dragging the upper bound shortens the function itself rather than the shaded region',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            "Every state authors curve.x_domain = {min:0, max_expr:'b'}. In the guided states b is fixed, so the curve reads as a full graph. In the explore state b IS the dragged control, so a teacher's drag visibly shortens the cyan curve — the reading becomes 'the function stops here' rather than 'we stop accumulating here'. STATE_7 demonstrates the correct convention within the same concept: b stays 2 while beta sweeps, so the curve holds full extent and only the shading moves.",
        prevention_rule:
            'Draw the function across the full plane and bound only the REGION and the rectangles by the integration limit. The interval of integration is a property of the integral, not of the function; a control that erases the graph teaches the wrong object. Where a concept has both a fixed-bound state and a dragged-bound state, the two must use the same drawing convention.',
        probe_type: 'manual',
        probe_logic:
            'In the explore state, drag the bound control across its full range and confirm the function_plot extent does not change; only region_fill and riemann_bars extents track the bound.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main() {
    let failed = 0;

    for (const row of rows) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(row, { onConflict: 'bug_class' });
        if (error) {
            console.error(`FAIL ${row.bug_class}:`, error.message);
            failed++;
        } else {
            console.log(`OK   ${row.bug_class} [${row.status}] (${row.severity})`);
        }
    }

    // ── The correction. Scoped .update(), NOT an upsert: the existing row's
    //    title and root_cause are correct and must survive. Only the owner,
    //    the status, the fixed_in_files and the now-contradictory prevention
    //    rule change.
    const CORRECTED_RULE =
        "The player-derived timeline must never fall below the state's authored reveal requirements: timelineTotal = max(narrationEnd, (state.duration||0)*1000). CORRECTED 2026-08-09 — this row previously said the remedy was to bring the choreography INSIDE the timeline and 'never to push the pin later'. The shipped fix did NEITHER: it raised the timeline FLOOR, in build_review_site.ts's computeTimeline(). That is the better fix because it closes the class fleet-wide under Rule 31 ('motion may outrun narration, never the reverse') instead of re-tuning one concept's JSON to sit inside a line that MOVES with the teacher's Speed slider. Authoring-side, the surviving rule is narrower but still real: eye_capture_ms must satisfy BOTH bounds — at or after the choreography end INCLUDING holds (PM_choreoBuildSegments pushes hold segments BETWEEN ramps, so holds EXTEND a sweep and are not contained by duration_ms), and at least 500 ms inside the timeline.";

    const { error: updErr, data: updData } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            owner_cluster: 'peter_parker:renderer_primitives',
            status: 'FIXED',
            prevention_rule: CORRECTED_RULE,
            fixed_in_files: ['src/scripts/build_review_site.ts', 'src/scripts/check_review_site_timeline.ts'],
        })
        .eq('bug_class', 'state_reveal_scheduled_past_the_player_derived_timeline_freeze')
        .select('bug_class');

    if (updErr) {
        console.error('FAIL correction:', updErr.message);
        failed++;
    } else {
        console.log(`OK   CORRECTED state_reveal_scheduled_past_the_player_derived_timeline_freeze -> owner peter_parker:renderer_primitives, status FIXED (${updData?.length ?? 0} row)`);
    }

    process.exitCode = failed > 0 ? 1 : 0;
    console.log(`\n${rows.length} row(s) upserted + 1 correction; ${failed} failure(s).`);
}

void main();
