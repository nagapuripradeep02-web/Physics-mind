/**
 * Seed engine_bug_queue with the THREE founder-directed fixes from the
 * electric_potential_point_charge Rule-31 pass review (2026-07-07, "fix them
 * and ship it"). All surfaced by eye-walker on run 20260707-063951; none are
 * regressions from the Rule-31 JSON pass — all three match the June-approved
 * baseline and are being fixed now on founder direction.
 *
 * Rows are inserted OPEN, fixed in the same session, then flipped FIXED after
 * eye-walker verifies the fix run (the sibling electric_potential_meaning
 * followed the same OPEN -> fix -> verify -> FIXED arc on 2026-07-06).
 *
 * Idempotent: upsert onConflict 'bug_class'.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ppc_founder_fixes.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ppc_founder_fixes.ts --fixed
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-07_ppc_rule31_founder_review';

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

const CONCEPT = 'electric_potential_point_charge';
const JSON_FILE = ['src/data/concepts/electric_potential_point_charge.json'];
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];

const rows: Row[] = [
    {
        bug_class: 'ppc_declared_visible_element_not_rendered',
        title: 'STATE_1 (and S2/S3) declare field_lines_faint in visible_elements while potential.show_field:"off" suppresses them — the declared recall backdrop never renders',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause: 'visible_elements was authored as the design intent (hook recalls the full Ch.1 picture: dome + faint field lines + faint shells) but the potential block was authored with show_field:"off", so the renderer never draws the lines. The two fields were never cross-checked at author time.',
        prevention_rule: 'Cross-check each state\'s visible_elements array against its actual potential.show_field / show_equipotential toggles at author time: every declared element must have the config that renders it, or be removed from the declaration. Fix here: STATE_1 show_field -> "faint" (the hook recalls the known E picture); S2/S3 drop the stale field_lines_faint declaration (their clean-scene look is the approved design).',
        probe_type: 'manual',
        probe_logic: 'Open STATE_1 of electric_potential_point_charge: faint red radial field lines must render around the dome alongside the faint cyan shells. Open S2/S3: visible_elements must not list field_lines_faint (scene stays clean, matching the approved baseline).',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: JSON_FILE,
        row_type: 'incident',
    },
    {
        bug_class: 'ppc_sign_flip_recolor_imperceptible_source_stays_red',
        title: 'STATE_5/6 sign flip recolors shells #4FC3F7->#42A5F5 (visually identical blues) and never touches the SOURCE sphere — the red +Q dome stays red while the narration says the charge is now negative',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'pmApplyChargeSign only recolors isPmShell objects, and the negative colour it reads (pvl_colors.negative #42A5F5) is indistinguishable from the positive equipotential cyan #4FC3F7 on the dark background. The pm_source sphere (and the outward-built field lines + arrowheads, wrong physics for -Q) are never sign-adjusted, so the flip reads as a label-only change.',
        prevention_rule: 'Colour meshes by LIVE sign: a sign flip must recolor every sign-carrying mesh (source sphere colour+emissive via string .set(), shells to a PERCEPTIBLY distinct negative family), and field lines/arrowheads built for the positive source must hide while the sign is negative (outward arrows are wrong physics for -Q) and re-derive their state opacity/thinning on return to +.',
        probe_type: 'manual',
        probe_logic: 'Play STATE_5 to past sign_flip_at_ms (9.5s): the dome must visibly turn blue and the shells must shift to a clearly different blue family with V labels reading minus. In STATE_6 click the sign toggle: same recolor, faint field lines disappear while negative, reappear thinned/faint on toggling back to +.',
        status: 'OPEN',
        concepts_affected: [CONCEPT, 'equipotential_surfaces'],
        fixed_in_files: [...RENDERER, ...JSON_FILE],
        row_type: 'incident',
    },
    {
        bug_class: 'ppc_state1_hook_zero_motion_full_duration',
        title: 'STATE_1 hook renders a fully static pose for ~13 of its 14s (Rule 31 no-static-state) — same class as the sibling\'s pm_state1_hook_zero_motion_full_duration, but S1 here had no test charge to bob',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause: 'The formula sibling\'s STATE_1 was authored with only the dome + faint shells (no test charge), so after the ~1s shell fade-in nothing moves. The renderer already ships the potential.idle_bob knob (built for the meaning sibling\'s identical finding on 2026-07-06) but S1 declared no test charge for it to act on.',
        prevention_rule: 'Every guided state needs visible deterministic motion (Rule 31). For potential-family hook states: declare show_test_charge + test_charge_r + idle_bob:true so the amber +q hovers gently on the state clock — pure JSON, the engine knob already exists.',
        probe_type: 'manual',
        probe_logic: 'Capture STATE_1 dense frames: the amber +q test charge must occupy visibly different positions across t=0..14s (gentle Lissajous hover), while dome/shells stay parked.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: JSON_FILE,
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
