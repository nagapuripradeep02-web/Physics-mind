/**
 * Flip the three ENGINE rows from the founder screen-recording review of `impulse`
 * to FIXED, per the founder-recording protocol (log OPEN first, fix, then flip
 * with fixed_in_files). Fixed by commit 311b5ea on feat/lom-f-momentum:
 * contact element drawn only while engaged, contact label anchored to the fixed
 * body, and PM_mbSeized converted from a permanent latch to a released lease.
 *
 * The two CONTENT rows stay OPEN deliberately:
 *   - field3d_mb_wall_body_label_duplicates_the_contact_label  -> fixed in 3d82ed7,
 *     flipped here too (it IS done; content owner, but the fix has landed).
 *   - field3d_mb_explore_state_depart_leg_unbounded...          -> stays OPEN: the
 *     seize fix masks the symptom (the bench re-arms, so the ball no longer parks
 *     for the session) but the explore-state sizing is untouched and a fixed
 *     period provably cannot serve its slider range. Event-driven re-arm pending.
 *
 * Idempotent: upsert onConflict bug_class.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_impulse_review_fixed.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ENGINE_FILES = [
    'src/lib/renderers/field_3d_renderer.ts',
    'src/scripts/_scratch_mb_seams.ts',
];

const updates: { bug_class: string; fixed_in_files: string[]; extra?: Record<string, unknown> }[] = [
    {
        // Re-owned: the root cause was ENGINE, not authoring. A fixed re-arm period
        // provably cannot serve its own slider range (the corners conflict 8.25x), so
        // no authored number could have fixed it. Fixed by 8fc6be4 — the period is now
        // bounded at both ends by physics: skipped while a contact is engaged, and
        // pre-empted by departure from the visible track.
        bug_class: 'field3d_mb_explore_state_depart_leg_unbounded_so_a_dragged_speed_clamps_the_body',
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts', 'src/scripts/_scratch_mb_seams.ts'],
        extra: {
            owner_cluster: 'peter_parker:field3d_surgeon',
            prevention_rule:
                'A control range is sized by the ENGINE, not by the author. Any re-arming momentum_bench state re-arms on the EARLIER of its authored period and the departure of a body from the visible track, and never while a contact is engaged; an author sizes repeat_every_ms for PACE only. Gate: the D1a/D1b/D1c sweep in _scratch_mb_seams.ts covers every corner of (m1, k) x (v1 min, max) and asserts bound_hits_all === 0 and rearm_in_contact === 0. Note bound_hits alone is NOT a sufficient probe: mbSeedKinematics zeroes it on every re-arm, so a once-per-cycle clamp erases its own evidence — that is why the cumulative bound_hits_all counter exists.',
            probe_logic:
                'Author one state per corner of (m1, k) x (v1 min, max) with the target apparatus (do NOT drive it via mbSetParam — the write path has its own deferral semantics). Run each for several cycles and assert eng.bound_hits_all === 0, eng.rearm_in_contact === 0, and that at least one re-arm fired (the bench is still cycling).',
            root_cause:
                'FOUND ON STATE_8, BUT STATE_5 WAS ALSO AFFECTED. mbRunRepeat re-armed on a fixed repeat_every_ms while the explore state let the teacher set m1 (0.5-10 kg) and k (50-5000 N/m), which are the quantities that set the cycle length: contact duration goes as pi*sqrt(m/k)*slow_factor and therefore spans 0.31 s to 14.05 s, a 45x range. The corners demand repeat <= 1801 ms (else the ball overshoots the 7.02 m of departure room and mbClampToTrack pins it at v = 0, a free body stopped by nothing) and repeat >= 14853 ms (else the re-arm fires mid-contact, resetting the ball mid-squish). The feasible window is EMPTY, so this was never a tuning miss. Measured pre-fix across the 8 slider corners: 5 clamped, 2 re-armed mid-squish. The guided two-lane STATE_5 was clamping as well on its authored 4900 ms period — 68 of 700 frames parked dead at the far end every cycle — which nobody had suspected, because bound_hits is zeroed on each re-arm and so hid its own evidence.',
        },
    },
    {
        bug_class: 'field3d_mb_contact_element_drawn_across_the_whole_approach_gap',
        fixed_in_files: ENGINE_FILES,
    },
    {
        bug_class: 'field3d_mb_contact_label_rides_the_moving_element_instead_of_the_fixed_body',
        fixed_in_files: ENGINE_FILES,
    },
    {
        bug_class: 'field3d_mb_trusted_drag_seize_never_releases_so_the_sandbox_dies_after_one_touch',
        fixed_in_files: ENGINE_FILES,
    },
    {
        bug_class: 'field3d_mb_wall_body_label_duplicates_the_contact_label',
        fixed_in_files: ['src/data/concepts/impulse.json'],
    },
];

async function main(): Promise<void> {
    console.log(`flipping ${updates.length} rows to FIXED...`);
    let ok = 0;
    for (const u of updates) {
        const { error, data } = await supabaseAdmin
            .from('engine_bug_queue')
            .update({ status: 'FIXED', fixed_in_files: u.fixed_in_files, ...(u.extra || {}) })
            .eq('bug_class', u.bug_class)
            .select('bug_class');
        if (error) console.error(`  FAIL ${u.bug_class}: ${error.message}`);
        else if (!data || data.length === 0) console.error(`  MISS ${u.bug_class}: no row matched`);
        else { ok += 1; console.log(`  FIXED ${u.bug_class}`); }
    }
    console.log(`${ok}/${updates.length} flipped`);
    if (ok !== updates.length) process.exit(1);
}

main().catch((err) => {
    console.error('flip failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
