/**
 * engine_bug_queue rows from the FOUNDER screen-recording review of `impulse`
 * (2026-08-01, lom-f tray). Five defects the founder caught by WATCHING the sim
 * that no automated gate flagged: at the moment that recording was made THE EYE
 * was 35/35 green, the validator 147 PASS / 0 FAIL, tsc clean, and the 77-check
 * momentum_bench harness fully passing.
 *
 * That is the point of the set. Every one of these is invisible to a
 * value-reading probe and to a still-frame gate, and three are engine defects in
 * the momentum_bench scenario that would recur on conservation_of_momentum and
 * every later momentum concept unless fenced by a probe.
 *
 * Logged OPEN first, per the founder-recording protocol (record, then fix, then
 * flip to FIXED with fixed_in_files). Idempotent: upsert onConflict bug_class.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_impulse_review.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'lom-f impulse founder screen-recording review (2026-08-01)';

const rows: Record<string, unknown>[] = [
    {
        bug_class: 'field3d_mb_contact_element_drawn_across_the_whole_approach_gap',
        title: 'The contact spring is drawn as a bar spanning ball-to-wall during the entire free approach, so an unexplained yellow rod grows and shrinks in every state',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'momentum_bench fits its contact element between the two contacting bodies on EVERY frame, not only while the contact is ENGAGED. The contact has natural_length_m 0.4, but the ball starts 2.62 m from the wall, so for the whole run-up the element is stretched to several times its natural length and reads as a solid yellow rod glued between ball and wall, lengthening and shortening as the ball travels. A teacher cannot tell what the object is: it is not the ball, not the wall, not a force arrow, and nothing on canvas names it. The founder first question on seeing the sim was literally what is that yellow colour. It also silently contradicts the physics being taught: during free flight there is NO contact and NO force, which is the entire claim of the surrounding states, yet the visual shows a permanent connection between the two bodies.',
        prevention_rule:
            'A contact or spring element is a rendering of a FORCE, so it may only be visible while that force is non-zero. Gate: for any momentum_bench state, assert the contact element is hidden (or drawn at natural length attached to the fixed body) whenever the contact is not engaged, and that its drawn length never exceeds natural_length_m. Generally: never draw a connector between two bodies that are not interacting, because a visible link asserts a physical relationship the physics does not have.',
        probe_type: 'js_eval',
        probe_logic:
            'Drive the state headlessly; on every frame read the contact element mesh visibility and world-space extent together with eng.contacts[i].engaged. Assert (!engaged) implies (mesh.visible === false || drawnLength <= natural_length_m + epsilon). Fails on any frame where a free-flight gap is bridged by a visible element.',
        status: 'OPEN',
        concepts_affected: ['impulse'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_mb_wall_body_label_duplicates_the_contact_label',
        title: 'The wall carries a generic body label AND a specific contact label, so two names sit on one object (wall and rigid wall)',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause:
            'momentum_bench renders a sprite for a body label and a separate sprite for the contact label. Authoring set the wall body label to wall while the contact label was the more specific rigid wall or padded wall, so both render a few pixels apart on the same object. It is pure duplication (the contact label is a strictly more informative reading of the same fact) and it doubles the text a teacher must parse on an already crowded apparatus. It was fixed on STATE_5 during a visual pass but left in place on the other six states carrying a wall, which is exactly how it survived to the founder review.',
        prevention_rule:
            'One object, one name. When a contact label already names the object a body IS (a wall, a bumper, a pad), that body own label must be blank. Gate: for every momentum_bench state, assert no two visible label sprites resolve to the same body. Corollary for authoring: a per-state fix applied during a visual pass MUST be swept across every state sharing the same apparatus, or the defect reappears on the states nobody screenshotted.',
        probe_type: 'js_eval',
        probe_logic:
            'For each momentum_bench state collect all visible label sprites with their anchor body id; assert no body id owns more than one non-blank label. Also assert no two label sprites overlap in screen space by more than 40 percent of the smaller box.',
        status: 'OPEN',
        concepts_affected: ['impulse'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_mb_contact_label_rides_the_moving_element_instead_of_the_fixed_body',
        title: 'The rigid wall and padded wall labels track the contact element moving midpoint, so the wall name slides back and forth with the ball',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'The contact label is anchored to the contact element, and that element spans from the moving body to the fixed body (see the sibling scar on the element itself). Its midpoint therefore travels with the ball, dragging the label to and fro across the apparatus on every cycle. The label names the WALL, a fixed object, so a teacher sees a static object name in permanent motion; on the two-lane state the two travelling labels sweep through each other and through the ball labels. Rule 32b is explicit that in a guided state only the taught variable may move, and a name sliding around is motion that teaches nothing while competing with the motion that does.',
        prevention_rule:
            'Anchor a label to the thing it NAMES, never to whatever geometry is convenient. A contact label describes the fixed party of the contact (the wall or bumper), so it pins to that body face with a constant offset. Gate: assert every label sprite anchored to a body with fixed:true holds a constant screen position across all frames of a state.',
        probe_type: 'js_eval',
        probe_logic:
            'Sample each label sprite world position every frame across a full repeat cycle. For any label whose text matches a contact label, assert position variance is below one ball radius. Fails when the label follows a moving body.',
        status: 'OPEN',
        concepts_affected: ['impulse'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_mb_trusted_drag_seize_never_releases_so_the_sandbox_dies_after_one_touch',
        title: 'The first slider touch in the explore state permanently stops the re-arm cycle: the ball flies off, stops, and never launches again',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'mbRunRepeat early-outs on window.PM_mbSeized so a teacher drag is not yanked out from under them, which is the correct intent, but PM_mbSeized is SET by the first trusted drag and is never CLEARED. There is no release on pointerup, no idle timeout, no reset on state entry. The seize is therefore permanent: after one slider touch the repeat cycle stops forever, the ball completes its last flight, runs to the end of the track, is clamped to v = 0 by mbClampToTrack, and sits dead for the rest of the session. The explore state exists solely for live manipulation, so this kills the one state whose entire job is being manipulated, and it fails precisely WHEN the teacher engages, which is the worst possible moment. Compounding it, the HUD then reads v = 0.00 m/s beside stale true F_peak and true dt values from the last real impact.',
        prevention_rule:
            'A seize is a LEASE, not a latch. Whatever suspends an idle animation for a live drag must define exactly when it resumes (pointerup, an idle timeout, or state re-entry) and that release must be tested. Gate: after simulating a slider drag and release in an interaction_complete state, assert the body is still moving N seconds later and that at least one further re-arm occurred. Never ship a flag that is set by user input and cleared by nothing.',
        probe_type: 'js_eval',
        probe_logic:
            'Enter the interaction_complete state, dispatch a trusted-like drag on a slider row, release, then run the clock for 3x repeat_every_ms. Assert eng.bound_hits did not increase, at least one mbSeedKinematics re-arm fired, and abs(body.v) > 0 at the end. Also assert window.PM_mbSeized === false after release.',
        status: 'OPEN',
        concepts_affected: ['impulse'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_mb_explore_state_depart_leg_unbounded_so_a_dragged_speed_clamps_the_body',
        title: 'The explore state lets a teacher raise the speed past what the track can absorb, so the ball is stopped dead at the track end with F = 0 on screen',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause:
            'mbClampToTrack pins a body at plus or minus length_m and zeroes its velocity when it reaches the visible track end, counting bound_hits; the engine own comment says a state whose teaching depends on Sigma-p must never hit one. The guided states STATE_4, STATE_6 and STATE_7 were retimed so every launch clears the track, but the explore state was NOT, and it is the one state where the teacher, not the author, chooses the speed. Raising v1 toward the top of its range sends the ball past the track end, where it stops instantly with v = 0.00 m/s and F = 0.0 N displayed together: a free body decelerated by nothing, in a Laws of Motion concept. The guided-state fix was computed against AUTHORED launch values and so by construction did not cover a state whose values are chosen at runtime.',
        prevention_rule:
            'Any state that exposes a control must be sized against the WHOLE range of that control, never against an authored default. Gate: for an interaction_complete state, sweep every exposed slider to both extremes and assert bound_hits stays 0 throughout. If the track cannot absorb the full slider range, narrow the range or recycle the body off-frame; never clamp it in view.',
        probe_type: 'js_eval',
        probe_logic:
            'For each interaction_complete momentum_bench state, for each key in controls_visible, set the parameter to its min and then its max via mbSetParam, run 3x repeat_every_ms, and assert eng.bound_hits === 0 and that no frame reports abs(v) === 0 while the body is off the contact.',
        status: 'OPEN',
        concepts_affected: ['impulse'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main(): Promise<void> {
    console.log(`upserting ${rows.length} impulse founder-review rows...`);
    let ok = 0;
    for (const r of rows) {
        const { error } = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert(r, { onConflict: 'bug_class' });
        if (error) console.error(`  FAIL ${String(r.bug_class)}: ${error.message}`);
        else { ok += 1; console.log(`  ok  ${String(r.bug_class)}`); }
    }
    console.log(`${ok}/${rows.length} upserted`);
    if (ok !== rows.length) process.exit(1);
}

main().catch((err) => {
    console.error('seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
