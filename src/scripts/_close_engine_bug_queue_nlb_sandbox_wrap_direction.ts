/**
 * engine_bug_queue — CLOSE the SEAM J sandbox-wrap direction row (field3d_surgeon,
 * 2026-08-07). Routed by founder_proxy Checkpoint B as BLOCKING on
 * `conservative_vs_nonconservative_forces` and corroborated by eye_walker.
 *
 * The diagnosis in the OPEN row is CONFIRMED, not refuted: pre-fix drive of
 * STATE_5 for 20 s of sim time measured s in [-5.998, -2.992], span 3.006 of a
 * 12 m track; post-fix the same drive measures s in [-5.865, +5.980], span
 * 11.846, visiting both halves — the row's own probe_logic, satisfied.
 *
 * The remedy taken is the SECOND of the two the prevention_rule allows (direct
 * the re-seeded launch INTO the track), because it is provably a no-op wherever
 * the seed already points inward or is zero — which is every other authored nlb
 * sandbox — while re-seeding at s0 would have moved the flat sandboxes' wrap
 * position by up to 0.6 m.
 *
 * UPDATE (never a duplicate INSERT): bug_class is the upsert key.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_nlb_sandbox_wrap_direction.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const BUG_CLASS =
    'nlb_sandbox_wrap_reseeds_v0_toward_the_bound_it_just_crossed_so_an_incline_sandbox_pins_at_one_end';

const ROOT_CAUSE_SUFFIX =
    ' [FIXED 2026-08-07, field3d_surgeon] Diagnosis CONFIRMED by a pre-fix drive of STATE_5'
    + ' (20.06 s of sim time): s in [-5.998, -2.992], span 3.006 of a 12 m track. Remedy: SEAM J now'
    + ' computes wDir, the direction the body re-enters MOVING INTO the track (+1 when it left by the'
    + ' high bound, -1 when it left by the low one), uses it for the position remap (s1 -= wDir*span,'
    + ' which is the two old branches unchanged) and passes it to a new nlbWrapSeedMirror(v0, dirIn)'
    + ' that returns -1 only when the authored seed points back out of the bound just entered.'
    + ' v AND omega are mirrored together (a reflection through the track axis), so a wheel launched'
    + ' with a deliberate v/omega mismatch keeps that mismatch. The same helper now signs the coupled'
    + ' TRAIN half of SEAM J, which had the identical asymmetry latent. Post-fix drive: s in'
    + ' [-5.865, +5.980], span 11.846, both halves visited — the row probe satisfied.'
    + ' NOT SUFFICIENT ALONE for the state to read true: the wrap is fixed, but the steady-state lap'
    + ' is now a one-way downhill traverse (W gravity +172.7 J at t=7686 ms) beneath a formula surface'
    + ' claiming "Round trip: W gravity = 0". Raising the mu default would NOT fix that and would make'
    + ' it worse (mu > tan theta pins the block on the slope and removes the return trip entirely) —'
    + ' the round-trip claim is an authoring question, filed separately.';

const PREVENTION_SUFFIX =
    ' CONFIRMED by construction: nlbSgn(0) === 0 never mirrors, so 12 of the 14 authored nlb sandboxes'
    + ' (v0 = 0 or absent, including the other incline sandbox block_on_incline STATE_5 at theta 20)'
    + ' are bit-for-bit unchanged, and kinetic_energy_definition STATE_6 (v0 = +4 on a flat track) only'
    + ' ever leaves by the high bound, so its seed already points inward. Attribution measured, not'
    + ' inferred: pre-fix and post-fix EYE runs of kinetic_energy_definition report IDENTICAL H2'
    + ' percentages on all 12 frames.';

async function main(): Promise<void> {
    const { data: row, error: readErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class, status, root_cause, prevention_rule, fixed_in_files, concepts_affected')
        .eq('bug_class', BUG_CLASS)
        .maybeSingle();
    if (readErr) throw new Error(`read failed: ${readErr.message}`);
    if (!row) throw new Error(`row not found — refusing to INSERT a duplicate for ${BUG_CLASS}`);
    if (row.status === 'FIXED') { console.log('already FIXED — nothing to do.'); return; }

    const { error } = await supabaseAdmin
        .from('engine_bug_queue')
        .update({
            status: 'FIXED',
            fixed_at: new Date().toISOString(),
            fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
            root_cause: (row.root_cause ?? '') + ROOT_CAUSE_SUFFIX,
            prevention_rule: (row.prevention_rule ?? '') + PREVENTION_SUFFIX,
        })
        .eq('bug_class', BUG_CLASS);
    if (error) throw new Error(`update failed: ${error.message}`);
    console.log(`✅ CLOSED (FIXED) ${BUG_CLASS}`);
}

main().catch((err) => { console.error('💥 close failed:', err instanceof Error ? err.stack : err); process.exit(1); });
