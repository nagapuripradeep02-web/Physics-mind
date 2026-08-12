/**
 * engine_bug_queue — field3d_surgeon engine round, "vg projection angle-token
 * deferral" (branch fix/field3d-vg-projection-token-deferral, off master
 * 63ae197, 2026-08-09). ONE bug_class (Amendment 4).
 *
 * The defect: vgResolveLinesPlanes published BOTH angle_line_normal_deg and
 * angle_line_plane_deg the instant the PROJECTION arrived, while the angle-arc
 * pass below already gated each token on its OWN arc's arrival. On
 * lines_and_planes_in_space STATE_7 (shadow reveal 2000 / grow 1500 -> arrives
 * ~3350 ms; arc_normal arrives ~10080 ms; arc_plane ~14350 ms) the answers sat
 * on the HUD ~6.7 s and ~11 s before the beats that derive them — pixel-
 * confirmed at t=11000 ("angle to plane = 35.0°" with arc_plane still 2 s from
 * its reveal).
 *
 * The fix (src/lib/renderers/field_3d_renderer.ts):
 *   - The projection's two angles are HELD (projAngles) rather than published,
 *     and settled AFTER the arc pass, per TOKEN.
 *   - An arc records OWNERSHIP of the token it names at the point it RESOLVES
 *     (the out.arcs push), independent of arrival — so an arc that cannot be
 *     drawn (the in-plane arm of a line perpendicular to the plane) owns
 *     nothing and the projection keeps its documented 90/0 claim rather than
 *     the number vanishing. Ownership is group-scoped for free, because the
 *     arc pass skips out-of-group arcs before the push.
 *   - A state authoring only a projection (no arc naming that token) is
 *     bit-for-bit unchanged — proved in the gate against the reconstructed
 *     pre-fix resolver at every sampled ms.
 *
 * The gate (src/scripts/check_vector_geometry_3d.ts §19c, 45 assertions incl.
 * 2 negative controls): the staged fixture (shadow 2000/1500 + arcs 9000/1200
 * and 13000/1500) asserts both tokens ABSENT at t=4000/8000/10000/11000/14000,
 * angle_line_normal_deg alone at 10500, both at 15000; a back-compat fixture
 * with the arcs removed asserts both present at 4000 and pre/post-fix identity
 * at 9 sampled ms; a one-arc fixture and its mirror assert the deferral is per
 * TOKEN; a scene-group pair and a perpendicular-line fixture assert an arc that
 * cannot publish here owns nothing. The negative control rebuilds the pre-fix
 * resolver by guarded textual substitution of the SHIPPED source (it THROWS if
 * the substitution stops matching) and is demonstrated to fail the first
 * fixture. Two planted defects were run against the finished gate: an
 * all-or-nothing deferral fails 8 assertions; the full pre-fix build trips
 * §19b's 19-publish-site tripwire AND the §19c guard.
 *
 * Verify chain (this desk):
 *   npm run check:renderer-syntax   -> field_3d / particle_field / parametric OK
 *   npx tsc --noEmit                -> 0 errors
 *   npm run check:vector-geometry-3d-> ALL SECTIONS PASSED, 757 PASS / 0 FAIL
 *                                      (712 baseline + 45 new; zero regressions)
 *   npm run validate:concepts       -> 153 PASS / 0 FAIL, warning profile unchanged
 *
 * Blast radius: ZERO shipped concept on master authors scenario_type
 * "vector_geometry_3d" (swept src/data/concepts/**). The only state in the
 * fleet that authors a projection together with readout-bearing arcs is
 * lines_and_planes_in_space STATE_7, which is unmerged (branch
 * feat/mathematics-lines-and-planes).
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'field3d_surgeon engine round — vg projection angle-token deferral, 2026-08-09 (fix/field3d-vg-projection-token-deferral)';
const FIXED_IN = ['src/lib/renderers/field_3d_renderer.ts', 'src/scripts/check_vector_geometry_3d.ts'];
const AFFECTED_CONCEPTS = ['lines_and_planes_in_space'];
const BUG_CLASS = 'vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn';

const PREVENTION_RULE =
    'A readout is gated by the reveal of the thing IT NAMES, not by the reveal of the construct that happens to compute it. '
    + 'Where one construct yields several tokens with different teaching beats, each token carries its own gate. '
    + 'IMPLEMENTED as OWNERSHIP, recorded where the naming construct RESOLVES: in vgResolveLinesPlanes the projection HOLDS its two '
    + 'angle values (projAngles) and settles them after the angle-arc pass, publishing only the tokens no resolved in-group arc named '
    + '(arcOwned). Per TOKEN, never per construct — a state authoring only a projection keeps its claim unchanged. Ownership is recorded '
    + 'at the arc PUSH and not from the authored list, because an arc that cannot be drawn (the in-plane arm of a line perpendicular to '
    + 'the plane) must own nothing, or deferral DELETES the number instead of delaying it. Any FUTURE second publisher of an existing '
    + 'token joins this hierarchy rather than writing out.readouts directly.';

const PROBE_LOGIC =
    'check:vector-geometry-3d §19c. Staged fixture (projection reveal 2000/grow 1500 + arc_normal 9000/1200 + arc_plane 13000/1500, both '
    + 'declaring readout tokens), driven through the SHIPPED frame driver and read off the #vg_readout DOM panel: assert neither token '
    + 'renders at t=4000/8000/10000/11000/14000; angle_line_normal_deg ALONE at 10500 (55.0°); both at 15000 (55.0°/35.0°, summing to 90). '
    + 'Back-compat fixture (same block, arcs removed): both tokens render at t=4000 and the resolver is byte-identical to the pre-fix build '
    + 'at 9 sampled ms. Per-token fixtures (one arc, then its mirror; an out-of-group arc; a line perpendicular to the plane whose in-plane '
    + 'arc cannot resolve) assert the unclaimed token still publishes on the projection’s own beat. Negative control: rebuild the pre-fix '
    + 'resolver by guarded substitution of the shipped source (THROWS if the text stops matching) and demonstrate it publishes both angles at '
    + 't=4000 and t=11000. Source tripwires: arcOwned written at exactly 1 site, read at exactly 2, projAngles assigned once, neither symbol '
    + 'present anywhere outside vgResolveLinesPlanes.';

async function main(): Promise<void> {
    const { data: existing, error: readErr } = await supabaseAdmin
        .from('engine_bug_queue')
        .select('bug_class,status,owner_cluster,severity')
        .eq('bug_class', BUG_CLASS)
        .maybeSingle();
    if (readErr) throw new Error(`read ${BUG_CLASS} failed: ${readErr.message}`);
    if (!existing) {
        throw new Error(
            `${BUG_CLASS} is not in engine_bug_queue. This script CLOSES an existing row (upsert key = bug_class); `
            + 'a missing row means the dispatch’s premise changed — file it deliberately rather than inserting blind here.');
    }
    console.log(`found: ${BUG_CLASS} (status ${existing.status}, severity ${existing.severity}, owner ${existing.owner_cluster})`);
    const { error } = await supabaseAdmin.from('engine_bug_queue').update({
        status: 'FIXED',
        fixed_at: new Date().toISOString(),
        fixed_in_files: FIXED_IN,
        concepts_affected: AFFECTED_CONCEPTS,
        prevention_rule: PREVENTION_RULE,
        probe_logic: PROBE_LOGIC,
        probe_type: 'js_eval',
        discovered_in_session: SESSION,
    }).eq('bug_class', BUG_CLASS);
    if (error) throw new Error(`update ${BUG_CLASS} failed: ${error.message}`);
    console.log(`CLOSED (FIXED) ${BUG_CLASS}`);
    console.log(`  fixed_in_files: ${FIXED_IN.join(', ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
