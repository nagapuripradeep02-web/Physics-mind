/**
 * engine_bug_queue rows from the APPROVAL walk on `unit_circle_to_sine_wave`
 * (2026-08-05). The walk returned APPROVE-READY: YES and the baselines were
 * approved on it; these four are the cosmetic legibility findings it recorded
 * on the way, none of which teaches anything false.
 *
 * Two of them are encoded in an approved baseline frame (A in STATE_7__frozen,
 * B in STATE_6__frozen), so they are worth a row precisely BECAUSE they now sit
 * in the regression reference: whoever fixes them must re-baseline, and whoever
 * sees the diff needs to know it was deliberate.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_unit_circle_approval_walk.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'approval eye_walker, unit_circle_to_sine_wave, 2026-08-05';
const CONCEPT = 'unit_circle_to_sine_wave';

interface Row {
    bug_class: string;
    title: string;
    severity: 'MODERATE';
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
    row_type: 'incident';
}

const rows: Row[] = [
    {
        bug_class: 'angle_arc_label_collides_with_the_segment_that_shares_its_angular_band',
        title:
            "An arc's midpoint label lands on a live segment whose angle falls inside that arc's own span, and the frozen pin archives the overlap",
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            "drawAngleArc places its label at the arc's MID-ANGLE, at radius + 14 (parametric_renderer.ts:2695-2703). When a state draws two arcs sharing one vertex, the wider arc's mid-angle can fall inside the narrower one's span — exactly where the other construction's radius and height segment live. On unit_circle_to_sine_wave STATE_7 the mirror arc spans 0 to (180 - theta), so its mid-angle is (180 - theta)/2, which for theta in roughly 55-70 degrees lands within a few pixels of the point's own vertical height segment; the label 'pi - theta' is crossed by that segment. It is legible, but the state's frozen pin sits at theta = 62 degrees, squarely inside that band, so the overlap is archived into the approved baseline. Widening the arc radius (54 -> 78) moved the label but did not leave the band, because the band follows the radius.",
        prevention_rule:
            "When two arcs share a vertex, choose each label's placement against the OTHER construction's live geometry across the state's whole authored angle range, not at a single sample — and check specifically the value the frozen pin lands on, since that frame becomes the regression baseline. Where the renderer offers no label-offset field, the options are: give the arcs disjoint angular spans (set from_deg so each arc starts where the other ends), drop one label and carry the symbol on the formula surface, or move the pin.",
        probe_type: 'js_eval',
        probe_logic:
            "For each state containing more than one angle_arc sharing a centre, sweep the state's authored angle range and assert each arc's computed label position (centre + (radius+14) at mid-angle) stays at least 12 px from every other primitive's rendered stroke. Report the angle sub-ranges where it does not, and FAIL if the state's eye_capture_ms pin falls inside one.",
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'angle_arc_label_lands_on_the_reference_line_when_the_arc_is_degenerate_or_full',
        title:
            'At a sweep of ~0 or ~360 degrees the arc label sits exactly on the reference axis it measures from',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            "drawAngleArc computes its label at mid-angle = (from_deg + to_deg) / 2. For a degenerate sweep (to_deg ~ from_deg ~ 0) and for a full sweep (to_deg ~ 360) that mid-angle is ~0 or ~180 degrees — i.e. ON the horizontal reference line the arc is measured from — so the label renders on top of that line. Direct sibling of the already-filed drawVector midpoint scar: both place text at a geometric mean without asking what is already drawn there. Observed on unit_circle_to_sine_wave at every state's t=0 frame and, more persistently, on STATE_6, whose arc is deliberately clamped at min(theta, 360) and therefore renders a full ring with its label parked on the reference line for 15 of 19 seconds — including the frozen frame now in the approved baseline.",
        prevention_rule:
            "drawAngleArc should offset the label off the reference axis when the swept angle is within a few degrees of 0 or 360 — e.g. nudge the label angle toward the interior of the sweep, or fall back to a fixed perpendicular offset. Bundle with the drawVector perpendicular-offset fix, since it is the same class and the same file; both need a fleet re-baseline.",
        probe_type: 'js_eval',
        probe_logic:
            'For every angle_arc, evaluate the swept angle across the state; where it is within 5 degrees of 0 or 360, assert the computed label position is at least 10 px from every surface/reference primitive in the state.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'axis_tick_labels_reveal_before_the_axis_they_annotate',
        title:
            'Re-authoring ticks to a gated primitive left their labels ungated, so the numbers float over an axis that has not drawn',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            "An axis mark is TWO primitives — the tick and its label — and a fix applied to one silently leaves the other behind. On unit_circle_to_sine_wave the ticks were re-authored from `vector` (where appear_at_ms is inert) to `animated_path` (where it gates), which correctly removed four orphan dashes from STATE_4's opening. The five mark labels and the axis caption were not given the same treatment, so at t=0 the numbers 0, pi/2, pi, 3pi/2, 2pi and 'angle theta (radians)' sit in empty canvas under an axis that draws over the following 800 ms. The half-fix reads as more deliberate than the original defect, which is what makes it easy to miss.",
        prevention_rule:
            'A composite element (tick + label, curve + curve-end label, body + its halo) reveals as ONE unit: when any member gains or changes an appear_at_ms, every member takes the same value in the same edit. After changing a reveal time, re-list every primitive that names or annotates the changed one and confirm each moved with it.',
        probe_type: 'js_eval',
        probe_logic:
            "Group scene_composition primitives by shared position axis and by id stem (tick_X / mark_X); assert every member of a group carries the same appear_at_ms. Independently: assert no label whose text names an axis value renders in a frame where that axis primitive is not yet visible.",
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'ping_pong_endpoint_is_the_degenerate_case_of_the_identity_being_taught',
        title:
            'A coupled-pair choreography reaches an endpoint where the two compared elements coincide, so the state momentarily shows one object while claiming two',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        subject: 'subject_neutral',
        root_cause:
            "Sibling of the already-filed state_opens_on_the_degenerate_value_of_the_identity_it_teaches, at the other end of the sweep. That row fixed the OPENING value; a ping_pong also dwells at its `to` endpoint on every reversal. On unit_circle_to_sine_wave STATE_7 the pair is theta and its mirror at 180 - theta, which coincide exactly at theta = 90 degrees — the authored `to` bound. So the state whose delta cue reads 'Two angles, one height' shows a single point at each turning point, roughly 0.5 s, twice in 21 s. It is not archived in any baseline frame and teaches nothing false, but it is the one moment the caption and the picture disagree.",
        prevention_rule:
            'For a choreography driving two elements the state compares, both bounds must lie strictly inside the interval where the pair is distinct — check the `to` endpoint as well as `from`, and check every mode that dwells at an endpoint (ping_pong reverses there, once reaching it means dwelling there). Where the degenerate value is pedagogically wanted, give it its own beat with its own caption rather than letting a sweep pass through it under a caption that claims otherwise.',
        probe_type: 'js_eval',
        probe_logic:
            "For each state whose design declares a compared pair, evaluate both elements' positions at the choreography's `from` and `to` values and assert they are at distinct screen positions with a separation above a visible threshold. FAIL naming the endpoint at which they coincide.",
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: [],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main(): Promise<void> {
    console.log(`\nengine_bug_queue — seeding ${rows.length} approval-walk row(s) for ${CONCEPT}\n`);
    for (const row of rows) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(row, { onConflict: 'bug_class' });
        if (error) throw new Error(`upsert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ ${row.severity} ${row.bug_class}`);
    }
    console.log(`\nDone. ${rows.length} rows upserted.`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
