/**
 * engine_bug_queue — TWO new rows from the `definite_integral_as_accumulated_area`
 * EYE re-walk (2026-08-08, run 20260808-142823), verified independently by the
 * dispatching session against the concept JSON and the plane geometry.
 *
 * The instance is minor and was deliberately NOT fixed (a 1.9px near-miss in the
 * explore sandbox, reachable only with two controls at extremes). The CLASS is
 * what matters, and the second row matters more than the first: THE EYE cannot
 * see this family of defect at all, on any concept, because its capture only
 * sweeps variables named in `variable_choreography`.
 *
 * Run: npx tsx --env-file=.env.local \
 *      src/scripts/_seed_engine_bug_queue_explore_state_multi_slider_blind_spot.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Row = Parameters<typeof insertOne>[0];

const ROWS = [
    {
        bug_class: 'position_expr_offset_constant_ignores_a_second_live_variable_and_drifts_into_the_tick_lane',
        title: "A tracking label's constant offset is tuned against ONE live variable, so a second live control slides it into the axis tick-label lane",
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            "definite_integral_as_accumulated_area STATE_8 authors curve_label.position_expr.y as 'b*b - c + 0.15'. The +0.15 lifts the label just above the curve, and that reads correctly across the whole authored sweep of b — which is the ONLY variable STATE_8 choreographs. But c is also live (a teacher slider, 0..1) and translates the entire curve downward, carrying the label with it. Measured at b=0.6, c=1.0: label y = -0.49 data-units -> canvas bbox x[290.6,333.5] y[378.9,395.1], against the x-tick '0.5' label at x[282,298] y[364,377]. The x-ranges already overlap and only ~1.9 canvas-px of vertical clearance remains. At c=0 — every frame THE EYE captures — the same label sits at y=+0.51, nowhere near the tick.",
        prevention_rule:
            "When a label's position_expr references more than one live variable, sweep the FULL CARTESIAN PRODUCT of those variables' endpoints against the tick-label probe, not just the choreographed one. A constant offset is only validated over the region actually swept; every additional live control multiplies the region. Corollary for authoring: an offset intended as 'clear of the curve' must be expressed relative to whatever can move the curve, or floored away from the axis band.",
        probe_type: 'js_eval',
        probe_logic:
            "For each state, collect every variable that is live (variable_choreography entries UNION drag/slider bindings). For each label/annotation carrying position_expr, evaluate its position over the cartesian product of those variables' endpoint values and assert zero overlap — and a >=15px clearance — against every rendered tick-label rect on its plane. See src/scripts/_probe_plane_tick_label_collision.mjs, which implements the geometry but sweeps only the choreographed variable.",
        concepts_affected: ['definite_integral_as_accumulated_area'],
        discovered_in_session:
            'eye_walker re-walk after the definite_integral fix round, 2026-08-08 (run 20260808-142823)',
        status: 'OPEN',
    },
    {
        bug_class: 'visual_eyes_never_sweeps_live_controls_that_carry_no_variable_choreography',
        title: "THE EYE's capture drives only choreographed variables, so any defect reachable solely via a second live slider is invisible to it fleet-wide",
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause:
            "visual_eyes drives a state by replaying its variable_choreography. A variable that is live but NOT choreographed — the normal shape of an explore state, where Rule 31 requires ALL controls be exposed — therefore sits at its default in every captured frame: contact-sheet, dense, keyframes and frozen alike. On definite_integral_as_accumulated_area STATE_8, b is choreographed and c is not, so every one of the ~100 dumped frames renders at c=0 and the c=1.0 collision cannot appear in any of them. The reviewing agent could only reach it by mirroring the renderer geometry in a probe and reconstructing the frame; it explicitly could not show a captured pixel. This is structural, not concept-specific: it applies to every explore state with more than one live control, i.e. essentially every concept in the fleet.",
        prevention_rule:
            "THE EYE's explore-state capture must sample at least one frame per non-choreographed live control pushed to each extreme (and ideally the pairwise product for two controls), so that collisions reachable only via a second control become visible to automated capture. Until that lands, an explore state's clean EYE result is evidence about ONE slice of its control space only, and any review that calls an explore state clean should say which controls were actually exercised. Note the general form, which this repo has now hit twice in one day: when a measurement is introduced to prevent a defect, check that the thing it measures is the thing that can fail.",
        probe_type: 'manual',
        probe_logic:
            "For any state whose advance_mode is interaction_complete, enumerate its live controls; assert the run manifest contains at least one captured frame per control at each authored extreme. Fail the run — or emit an explicit coverage warning naming the unexercised controls — when it does not.",
        concepts_affected: ['definite_integral_as_accumulated_area'],
        discovered_in_session:
            'eye_walker re-walk after the definite_integral fix round, 2026-08-08 (run 20260808-142823)',
        status: 'OPEN',
    },
] as const;

async function insertOne(row: Record<string, unknown>): Promise<void> {
    const bugClass = row.bug_class as string;
    const { data: existing } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class,status')
        .eq('bug_class', bugClass)
        .maybeSingle();
    if (existing) {
        console.log(`⏭  already filed (${existing.status}): ${bugClass}`);
        return;
    }
    const { error } = await supabaseAdmin.from('engine_bug_queue').insert(row);
    if (error) throw new Error(`insert failed for ${bugClass}: ${error.message}`);
    console.log(`✅ FILED (OPEN) ${bugClass}`);
}

async function main(): Promise<void> {
    for (const row of ROWS) await insertOne({ ...row });
}

main().catch((e) => {
    console.error('💥', e instanceof Error ? e.stack : e);
    process.exit(1);
});
