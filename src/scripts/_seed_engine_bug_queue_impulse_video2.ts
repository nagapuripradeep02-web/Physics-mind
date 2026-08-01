/**
 * engine_bug_queue rows from the SECOND founder video review of `impulse`
 * (2026-08-01). Both are design defects the founder identified by watching the
 * sim — neither is detectable by any value-reading probe or still-frame gate.
 *
 * Founder, near verbatim: "Remove the yellow thing. Don't put anything between
 * the wall and the ball during the collision — in ALL the states. For the first
 * few seconds just show how the ball goes and collides and comes back at NORMAL
 * speed. Don't slow it down. After that, slow down the ball at the contact."
 *
 * Both FIXED by engine commit 08142ec. Authored from the field3d-surgeon report.
 * Idempotent: upsert onConflict bug_class.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_impulse_video2.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'lom-f impulse founder video review #2 (2026-08-01)';

const rows: Record<string, unknown>[] = [
    {
        bug_class: 'field3d_drawn_element_at_the_contact_reads_as_a_third_object',
        title: 'A mesh rendered between two colliding bodies reads as an obstruction, not as the interaction',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'momentum_bench drew a compressible element between the two facing faces to make contact time visible. Fitted every frame it asserted a permanent link across a free flight; fitted only while engaged (the first fix) it became a third object that POPS INTO EXISTENCE at impact. Nothing arrives at a real collision, so any drawn body at the contact contradicts the lesson. The founder read it as something coming out or being present between the wall and the ball. The honest rendering of an interaction is the equal-and-opposite FORCE PAIR (a quantity) plus a nameplate on the apparatus, never a new solid.',
        prevention_rule:
            'Never render a solid between two interacting bodies to depict the interaction. Draw the force pair and label the apparatus. If a compliance or deformation must be shown, deform the BODIES themselves, never insert a third mesh. Corollary: making a wrongly-drawn object appear only at the right moment does not fix it — an object that appears at all is the defect when nothing physically arrives.',
        probe_type: 'js_eval',
        probe_logic:
            'Traverse the scene every frame across every state, engaged and not; count objects whose userData.id or userData.elementType contains the contact-element token. Must be 0 on every frame, including frames where a contact event is recorded and the force arrows are visible.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts', 'src/scripts/_scratch_mb_seams.ts'],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_slow_motion_from_the_first_contact_hides_what_real_speed_looks_like',
        title: 'A magnified contact with no un-magnified pass before it never shows the student a real bounce',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause:
            'slow_window applied its dt multiplier to every contact from the state first frame, so a 10x-20x collision was the ONLY collision a student ever saw. The magnifier is only legible against the thing it magnifies: a 70 ms contact really is a blink, and that blink IS the reason impulse is hard to teach, so never showing it removes the motivation for the slow motion. Compounding it, the honesty badge was driven separately from the multiplier, so once the two were split the badge could claim slow motion on a true-speed pass.',
        prevention_rule:
            'A playback magnifier shows reality FIRST: gate it on the re-arm cycle (slow_window.from_cycle, default 0 = unchanged) and drive the multiplier AND its badge from ONE shared predicate, so the badge can never disagree with the dt. The cycle index must be the engine own re-arm counter, cleared on RESET_TRAJECTORY and advanced only by a frame that advances time, so a pin cannot move it and a rewind leaves nothing stale. Any state-clock cushion derived from slow_factor (e.g. the deriveStateMeta reveal pin) must be conditioned on the gate too.',
        probe_type: 'js_eval',
        probe_logic:
            'With from_cycle: 1, sample eng.t_ms and eng.tphys_ms on the SAME frames across each engaged window: the ratio must be exactly 1 in cycle 0 and exactly 1/slow_factor in cycle 1, the recorded event duration_ms must equal the true t_c in BOTH, and the badge must be absent on every cycle-0 frame and present on every engaged cycle-1 frame. Then pin inside each cycle and rewind across the boundary and assert identical bodies.',
        status: 'FIXED',
        concepts_affected: ['impulse'],
        fixed_in_files: [
            'src/lib/renderers/field_3d_renderer.ts',
            'src/lib/validators/visual/deriveStateMeta.ts',
            'src/scripts/_scratch_mb_seams.ts',
        ],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main(): Promise<void> {
    console.log(`upserting ${rows.length} video-review-2 rows...`);
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
