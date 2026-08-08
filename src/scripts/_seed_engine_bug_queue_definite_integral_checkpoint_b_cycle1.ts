/**
 * engine_bug_queue — the scar rows from `definite_integral_as_accumulated_area`,
 * founder_proxy Checkpoint B cycle 1 (2026-08-08), plus two the concurrent
 * quality_auditor / eye_walker passes and the dispatching session raised.
 *
 * Every row here was found on a concept that had already passed THE EYE 50/50
 * and a full quality_auditor sweep. Three of them are only findable by DRIVING
 * the sim (Playwright, real clicks and drags); one indicts the visual gate
 * itself. That is the point of the collection — these are the classes the
 * machine gates structurally cannot see, written as prevention rules so the
 * next concept inherits them instead of rediscovering them.
 *
 * Idempotent: bug_class is the upsert key, and an already-filed class is skipped
 * rather than duplicated.
 *
 * Run: npx tsx --env-file=.env.local \
 *      src/scripts/_seed_engine_bug_queue_definite_integral_checkpoint_b_cycle1.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT = 'definite_integral_as_accumulated_area';
const SESSION = 'founder_proxy Checkpoint B cycle 1 + quality_auditor/eye_walker, 2026-08-08';

const ROWS = [
    {
        bug_class: 'state_reveal_scheduled_past_the_player_derived_timeline_freeze',
        title: "A late reveal and a choreography end were budgeted against the authored duration, but the player freezes on a shorter narration-derived timeline — so the payoff is unreachable in the product while the approved baseline shows it",
        severity: 'CRITICAL',
        owner_cluster: 'alex:json_author',
        root_cause:
            "The review player derives a state's timeline from narration length and pins the clock there (Rules 26/37); the authored state.duration is NOT used. STATE_2 scheduled Sn_chip at appear_at_ms 18000 against a 17983 ms timeline — missed by 17 ms — so the teacher's final held frame shows n=4 and h=0.5000 and never the payoff Sn=1.7500, which STATE_3's narration, aha_moment.visual_confirmation and assessment q1 all depend on. STATE_7 needs 20000 ms for its beta sweep and freezes at 19117 ms, leaving the subtitle 'By x equals 2, that curve ends at 2.6667' over a chip reading A(beta)=2.2930. THE EYE pins via SET_TIME_FREEZE at eye_capture_ms, which BYPASSES the freeze, so both frames were captured, diffed and baseline-approved: the gate certified frames the product cannot reach.",
        prevention_rule:
            "Every appear_at_ms, every variable_choreography start_ms+duration_ms+holds, and every locus_trace end_ms must be <= the PLAYER-DERIVED timeline for that state minus a stated margin — never <= the authored duration. eye_capture_ms must ALSO be <= that timeline: pinning past it certifies a frame no teacher can reach. Note the corollary, which falsifies the obvious fix: when a pin lands mid-ramp, the remedy is to bring the choreography INSIDE the timeline, never to push the pin later.",
        probe_type: 'js_eval',
        probe_logic:
            "Load the review page, SET_STATE each state, press Play, poll window.PM_simTimeMs until it stops advancing for 3 s; record T_freeze. Assert T_freeze >= max(appear_at_ms, choreography end incl. holds, locus_trace.end_ms, eye_capture_ms) + 500 for every primitive in the state.",
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_live_control_value_survives_a_state_change_while_its_touched_flag_does_not',
        title: "A teacher drag in the explore state leaks into a guided state that shares the same live control, so the guided state opens on the teacher's value while its narration reads hard-coded numbers no longer on screen",
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            "PM_userTouched is reset on state change but PM_sliderValues is not, and the live-control overlay in PM_resolveStateVars still applies the persisted value for any variable the ENTERED state declares as a live control (a slider OR a plot_point.drag.bind_variable). The value survives with its provenance discarded. Reproduced by following the sim's own printed instruction: drag the bound marker to b=0.279 on STATE_8, click STATE_5 in the rail (Rule 25d advertises exactly this) -> STATE_5 opens at b=0.2792 with touched={}, canvas reading total 0.2719 / integral -0.2719 under narration reading 0.6667 / -0.6667. At that b with c->1 the curve never crosses zero, so there is NOTHING above the axis and the above/below contrast the state exists for is gone. Correctly scoped: it does not fire for variables the target state does not declare.",
        prevention_rule:
            "Entering a GUIDED state restores its authored defaults for every variable; only an interaction_complete (explore) state may inherit teacher-set live-control values. Reset PM_sliderValues alongside PM_userTouched, or gate the live-control overlay on the flag that is being cleared. Renaming the variable in the concept JSON would also 'fix' it and would break Rule 31's shared-control identity — this is an engine fix, not a content workaround.",
        probe_type: 'js_eval',
        probe_logic:
            "Drive the explore state, drag every plot_point and slider off its default, SET_STATE to each guided state that declares the same variable, and assert PM_liveExprVars()[v] equals that state's authored default.",
        row_type: 'incident',
    },
    {
        bug_class: 'plane_rezoom_shipped_without_tick_expressions_so_the_magnification_is_unannounced',
        title: "cartesian_plane gained min_expr/max_expr so a plane can re-zoom, but tick pitch and decimals stayed authored constants — a 1587x zoom prints the same two labels at every scale, so the picture shows a constant-size subject with no evidence any zoom occurred",
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            "PM_planeResolveBound resolves range bounds against the live scope, but x_tick / y_tick / tick_decimals are read verbatim from the spec. With x_tick 0.25 over a window 0.00066 wide exactly one tick falls inside, and tick_decimals 2 could not separate the window's ends even if more did. Measured on STATE_4: scaleX 349140 px/unit against the main plane's 220, yet the inset at n=115 and n=10000 is the same picture. The renderer's own D3 comment states the design intent — 'lets the inset's own axis numbers shrink instead' — that the shipped code cannot deliver. The sound-off reading becomes 'the sliver is the same size at 100 rectangles and at 10000', the exact belief the state's misconception_watch exists to destroy.",
        prevention_rule:
            "A plane that authors min_expr/max_expr must also be able to derive its tick pitch and decimals from the RESOLVED range, or the concept must publish the magnification factor / window width as an explicit on-canvas readout. A magnifier that holds its subject at constant size must publish its magnification — on a whiteboard the teacher draws the bubble and writes x1000 beside it. A re-zoomable plane printing an invariant axis is not evidence of a zoom.",
        probe_type: 'js_eval',
        probe_logic:
            "For every plane authoring min_expr/max_expr, sample the driving variable across its authored range and assert the set of rendered tick-label strings is NOT identical at the extremes.",
        row_type: 'incident',
    },
    {
        bug_class: 'zoom_link_pixel_geometry_frozen_at_the_numeric_fallback_after_the_window_became_expression_driven',
        title: "The lines telling a viewer which region an inset magnifies still point at the corners of the plane's old numeric fallback window, indicating a source region 625x larger than the one actually magnified",
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            "zoomlink_1 (565,171) and zoomlink_2 (620,109) are fixed canvas pixels; converted through the main plane transform they are data (1.75,3.0) and (2.0,4.0) — exactly the x_range/y_range numeric fallback that min_expr/max_expr replaced. The indicated source region is 0.25 wide; the real one is 0.04 at n=100 and 0.0004 at n=10000, i.e. 625x too wide at the state's end. Both links also terminate at the SAME inset corner. Fixed-pixel vectors cannot track an expression-driven window, and nothing re-derived them when the window changed.",
        prevention_rule:
            "When a plane range moves from numeric to expression-driven, every fixed-pixel annotation that references that window — zoom links, brackets, callout leaders, magnifier frames — must be re-derived from the same expressions or deleted. A magnifier link is a geometric CLAIM and must be checkable against the resolved range, not authored once against the window that happened to exist at design time.",
        probe_type: 'manual',
        probe_logic:
            "Convert each zoom-link endpoint through the source plane's transform and compare the implied source rectangle against the inset's resolved xRange/yRange at three values of the driving variable; flag any ratio outside 0.8-1.25.",
        row_type: 'incident',
    },
    {
        bug_class: 'focal_glow_and_semantic_colour_point_at_the_container_instead_of_the_quantity_being_taught',
        title: "Every narration sentence glows the rectangle while the formula and readout describe the gap above it, and the gap's readout colour is painted on the rectangle — so the object the lesson points at is not the object the lesson is about",
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            "STATE_4 sets focal_primitive_id and all four tts glow bindings to sliver_inset, the riemann_bars RECTANGLE, drawn in the same #F472B6 as the gap chip. The taught quantity is the UNDRAWN wedge between the curve and the bar top. The glowed rectangle's area is 8/n - 16/n^2 + 8/n^3 while the state's formula surface asserts the gap is 4/n - 4/(3n^2), so the narration 'its exact size is four over n, minus four over three n squared' attaches the gap's formula to an object that is not the gap.",
        prevention_rule:
            "The focal primitive and every glow binding must name the primitive that RENDERS the quantity the sentence states. If the taught quantity has no primitive, DRAW one before binding a sentence to its neighbour — never reuse a readout's semantic colour on an element that is not that readout's subject.",
        probe_type: 'manual',
        probe_logic:
            "For each state, resolve every tts glow target to its primitive and check the quantity that primitive renders against the quantity the sentence names and the formula surface asserts.",
        row_type: 'incident',
    },
    {
        bug_class: 'physics_config_constraint_block_describes_a_transform_a_later_engine_change_made_dynamic',
        title: "The authored constraints block still states the inset's fixed pixel-per-unit transform after that transform became a function of the choreographed variable, so the artifact a later author trusts is false by two orders of magnitude",
        severity: 'MODERATE',
        owner_cluster: 'alex:physics_author',
        root_cause:
            "The constraint records 920 px/x-unit and 145 px/y-unit for plane_inset, correct for the pre-redesign numeric window. Measured live at n=6072: scaleX 349140, scaleY 44022, and both are now functions of n. Nothing re-ran the constraints block over the design change, so the block a later author reads as ground truth is wrong by ~380x.",
        prevention_rule:
            "Any engine or design change that alters a quantity asserted in physics_engine_config.constraints must re-run that block. A constraint stating a number must also state whether that number is FIXED or DERIVED — a derived quantity written as a constant is indistinguishable from a stale one.",
        probe_type: 'manual',
        probe_logic:
            "Read each numeric claim in physics_engine_config.constraints and confirm it against a live PM_planeRegistry / PM_liveExprVars dump at two values of every choreographed variable.",
        row_type: 'incident',
    },
    {
        bug_class: 'pcpl_expr_bound_precedence_inconsistent_between_plane_range_and_function_domain',
        title: "Two opposite precedence rules for the same {field, field_expr} pattern in one renderer: plane ranges prefer the expression, function_plot's x_domain prefers the numeric",
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            "PM_planeResolveBound (added 2026-08-08) checks *_expr first and falls back to the numeric bound only on NaN. function_plot's x_domain resolution does the opposite: a numeric min/max wins and *_expr is reached only when the numeric is absent. Both read a syntactically identical spec shape in the same file. It cost the dispatching session an iteration: authoring both on curve_inset.x_domain the way plane_inset.x_range does silently killed the expression and sampled the curve entirely off-window, with no error anywhere.",
        prevention_rule:
            "One precedence rule per file for a given spec shape, asserted in the gate. Prefer expr-wins with numeric-as-fallback, because authoring both then remains meaningful — under numeric-wins the expression is silently dead config, which is the failure mode that actually occurred. No concept authors both on x_domain today, so either direction is a safe no-op if asserted now.",
        probe_type: 'js_eval',
        probe_logic:
            "Author a spec carrying BOTH a numeric bound and a *_expr for every {field, field_expr} pair in the renderer, and assert every resolver in the file resolves them the same way.",
        row_type: 'directive',
    },
    {
        bug_class: 'uniformity_fix_moved_every_overlay_across_a_documented_chrome_clearance_threshold',
        title: "A one-state overlay collision was fixed by moving that overlay in ALL states, which pushed every one of them past Rule 34d's review-chrome clearance line",
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            "STATE_4's formula box overlapped its curve-end label. Moving only that state's box would have left a 24 px jump in and out of the state (Rule 32d), so all 8 boxes were moved from y=62 to y=38 for uniformity. But drawFormulaBox uses textAlign(LEFT, TOP), so position.y is the box's TOP edge, and Rule 34d requires on-canvas overlays to clear the review-chrome cluster at top:52px+. The fix traded one visible inter-state jump for a documented-rule breach on every state, and also moved the concept 26 px off a layout convention three sibling concepts share.",
        prevention_rule:
            "Before moving an overlay to resolve a collision, check the destination against the DOCUMENTED reserved zones (Rule 34d chrome clearance, corner reservations) and against the position the rest of the fleet uses — not only against the primitive it was colliding with. When a single state is the outlier, prefer moving that state's own conflicting element over relocating a shared convention across every state.",
        probe_type: 'js_eval',
        probe_logic:
            "For every on-canvas overlay, assert its top edge >= 52 px (accounting for the primitive's anchor mode), and warn when a primitive's position differs from the modal position for that primitive type across the concept fleet.",
        row_type: 'directive',
    },
] as const;

async function main(): Promise<void> {
    let filed = 0;
    let skipped = 0;
    for (const row of ROWS) {
        const { data: existing } = await supabaseAdmin
            .from('engine_bug_queue')
            .select('bug_class,status')
            .eq('bug_class', row.bug_class)
            .maybeSingle();
        if (existing) {
            console.log(`⏭  already filed (${existing.status}): ${row.bug_class}`);
            skipped += 1;
            continue;
        }
        const { error } = await supabaseAdmin.from('engine_bug_queue').insert({
            ...row,
            status: 'OPEN',
            concepts_affected: [CONCEPT],
            fixed_in_files: [],
            discovered_in_session: SESSION,
        });
        if (error) throw new Error(`insert failed for ${row.bug_class}: ${error.message}`);
        console.log(`✅ FILED (OPEN) [${row.severity}] ${row.bug_class}`);
        filed += 1;
    }
    console.log(`\n${filed} filed, ${skipped} already present.`);

    // The D5 gate is blind to state-level `once` choreography — an already-OPEN
    // class that does not yet list this concept. Annotate rather than mint.
    const D5 = 'pcpl_state_level_once_choreography_skips_the_d5_motion_gate';
    const { data: d5 } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class,concepts_affected')
        .eq('bug_class', D5)
        .maybeSingle();
    if (!d5) {
        console.log(`\nℹ  ${D5} not present — nothing to annotate.`);
        return;
    }
    const affected: string[] = d5.concepts_affected ?? [];
    if (affected.includes(CONCEPT)) {
        console.log(`\nℹ  ${D5} already lists ${CONCEPT}.`);
        return;
    }
    const { error } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({ concepts_affected: [...affected, CONCEPT] })
        .eq('bug_class', D5);
    if (error) throw new Error(`annotate failed: ${error.message}`);
    console.log(`\n✅ ANNOTATED ${D5} += ${CONCEPT} (now ${affected.length + 1} concepts)`);
}

main().catch((e) => {
    console.error('💥', e instanceof Error ? e.stack : e);
    process.exit(1);
});
