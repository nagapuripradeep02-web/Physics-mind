/**
 * Seed engine_bug_queue with the THREE founder-directed fixes from the
 * electric_potential_dipole Rule-31 pass review (2026-07-07, "pls continue"
 * on the fix-and-ship plan). All surfaced by eye-walker on THE EYE run
 * 20260707-144135; none are regressions from the Rule-31 JSON pass — all
 * three are June-build defects in the dipole_potential scenario.
 *
 * Rows are inserted OPEN, fixed in the same session, then flipped FIXED after
 * eye-walker verifies the fix run (same OPEN -> fix -> verify -> FIXED arc as
 * electric_potential_meaning 2026-07-06 and electric_potential_point_charge
 * earlier this session).
 *
 * Idempotent: upsert onConflict 'bug_class'.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_epd_founder_fixes.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_epd_founder_fixes.ts --fixed
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-07_epd_rule31_founder_review';

type Owner =
    | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
    | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
    | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
    bug_class: string;
    title: string;
    severity: Severity;
    owner_cluster: Owner;
    root_cause: string;
    prevention_rule: string;
    probe_type: ProbeType;
    probe_logic: string;
    status: Status;
    concepts_affected: string[];
    fixed_in_files: string[];
    row_type: RowType;
}

const CONCEPT = 'electric_potential_dipole';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const BOTH = ['src/lib/renderers/field_3d_renderer.ts', 'src/data/concepts/electric_potential_dipole.json'];

const rows: Row[] = [
    {
        bug_class: 'dipole_lobe_negative_branch_dead',
        title: 'STATE_7 equipotential lobes: the 3 negative (blue) contour lobes never render — dpBuildLobes negative branch computes cosv = -cos(th) over th in [-88,88] where cos(th) > 0 always, so every iteration skips and the tube keeps its 2-point stub',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'dpBuildLobes mirrors the lobe geometry to the -q side via the sgn multiplier on x, but ALSO sign-flipped cosv for negative levels. Over the swept range th in [-88deg, 88deg], cos(th) is always positive, so -cos(th) is always negative and the "if (cosv <= 0.001) continue" guard fires on every iteration — pts never reaches length 2 and dpSetTube is never called for any negative level. Only the 3 red positive lobes ever shipped; the water-molecule hill/dip/zero-band map lost its minus half.',
        prevention_rule: 'When mirroring a signed-level contour sweep, mirror EITHER the geometry (sgn on x) OR the level sign in the radius formula — never both. r(theta) = sqrt(vp*p*|cos theta|/|c|) is mirror-symmetric: compute cosv = cos(th) for both branches and let sgn reflect the loop to the negative side. Visually verify BOTH signed branches render before shipping a contour builder.',
        probe_type: 'manual',
        probe_logic: 'Open STATE_7 of electric_potential_dipole: six contour lobes must render in the slice plane — 3 red on the +q side AND 3 blue on the -q side, mirror images of each other.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: RENDERER,
        row_type: 'incident',
    },
    {
        bug_class: 'dipole_potential_idle_auto_sweep_unimplemented',
        title: 'STATE_7 potential.idle_auto_sweep:true is a silent no-op — updateDipolePotentialFrame never reads the flag (only p.sweep/p.theta_sweep), so the explore state is fully static until a manual drag',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'The idle_auto_sweep flag was implemented for the system_of_charges scenario (a hands-free Lissajous around the seeded pose, stopping on user grab) but never ported to dipole_potential, even though the concept JSON authored the flag with clear intent. THE EYE cannot fire trusted drags, so D6 flatlined to 0.00% after ~2s and the explore state captured static.',
        prevention_rule: 'Before authoring a behaviour flag on a scenario, grep that scenario\'s own frame-update function for the flag — config vocabulary shared with a sibling scenario does not imply the implementation was ported. Idle motion must be a pure function of the state clock and yield to PM_*UserDragged.',
        probe_type: 'manual',
        probe_logic: 'Open STATE_7 and do not touch anything: the probe must drift on its own (theta sweeping across the equator with the live signed V readout flipping sign, r breathing gently). Grab the probe or a slider: the drift stops instantly and manual control holds.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: RENDERER,
        row_type: 'incident',
    },
    {
        bug_class: 'dp_hook_states_zero_physical_motion',
        title: 'STATE_1/STATE_2 render zero physical motion across their full 17-19s (only opacity fades on callouts) — the Rule 31 no-static-state class; the dipole scenario had no idle_bob knob for its statically posed probe',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'S1 (scalar superposition) and S2 (far-field collapse) pose the probe at a fixed (r, theta) and reveal labels on the clock; no 3D object ever moves. The potential-meaning scenario grew an idle_bob knob for exactly this class (pm_state1_hook_zero_motion_full_duration, 2026-07-06) but dipole_potential had no equivalent for its probe.',
        prevention_rule: 'Every guided state needs visible deterministic motion (Rule 31). For dipole-potential hook states: implement potential.idle_bob — a tiny (r, theta) breathing of the probe, pure fn of the state clock + the state\'s own probe_r/probe_theta constants, guarded off sweep/drag states — and author idle_bob:true on the static states. The live V readout ticks with the bob (V is a number AT a point).',
        probe_type: 'manual',
        probe_logic: 'Capture STATE_1/STATE_2 dense frames: the amber probe (with its r+/r- connector lines and theta arc) must occupy visibly different positions across t=0..17s, while charges and callouts behave as before; STATE_1\'s V readout ticks slightly with the motion once revealed.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: BOTH,
        row_type: 'incident',
    },
];

async function main(): Promise<void> {
    const flip = process.argv.includes('--fixed');
    if (flip) {
        for (const r of rows) {
            const upd = await supabaseAdmin
                .from('engine_bug_queue')
                .update({ status: 'FIXED' })
                .eq('bug_class', r.bug_class);
            if (upd.error) throw new Error(`flip failed for ${r.bug_class}: ${upd.error.message}`);
            console.log(`✅ FIXED ${r.bug_class}`);
        }
        return;
    }
    for (const r of rows) {
        const up = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert({ ...r, discovered_in_session: SESSION }, { onConflict: 'bug_class' });
        if (up.error) throw new Error(`upsert failed for ${r.bug_class}: ${up.error.message}`);
        console.log(`📌 OPEN ${r.bug_class}`);
    }
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
