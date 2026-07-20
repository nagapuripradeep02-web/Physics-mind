/**
 * Seed engine_bug_queue with the earths_magnetism quality-auditor FAIL findings
 * (routed [owner: peter_parker:renderer_primitives]) and their fixes, landed in
 * the SAME session (F1-F4 in src/lib/renderers/field_3d_renderer.ts +
 * src/lib/validators/visual/deriveStateMeta.ts). Rows are inserted FIXED per
 * this cluster's spec protocol ("update the queue BEFORE writing the regen
 * directive"). A5/A6 (advisory) are not separate bug_class rows — they are
 * folded into the F1/F3 fix commentary since they were fixed as part of the
 * same edits.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_earths_magnetism_declination_review.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-20_earths_magnetism_declination_camera_fix';

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

const rows: Row[] = [
    {
        bug_class: 'em_state2_declination_camera_edge_on',
        title: 'earths_magnetism STATE_2: declination D projects to ~0.94deg on screen at the authored oblique camera_position — the compass needle and true-N reference render collinear, teaching the misconception the state exists to destroy',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'At camera_position [3.6,2.4,7.2] the horizontal (XZ) plane — the plane the declination angle actually lives in — is viewed ~17deg edge-on, so any small horizontal-plane angle projects to a fraction of a degree on screen regardless of the true value.',
        prevention_rule: 'When the taught angle lives in a plane the state\'s inherited camera views edge-on, an ANIMATED camera reframe (never a static swap, which would either kill a sibling state\'s own framing need or teleport the apparatus per Rule 32d) must ease to a pose that views that plane closer to face-on, sequenced BEFORE the angle-reveal animation plays (Rule 32a cause-first).',
        probe_type: 'manual',
        probe_logic: 'THE EYE frozen frame for STATE_2 post-swing: measure the on-screen angle between the true-N reference line and the compass needle direction; must exceed ~8-10deg for a D=15deg authored declination (vs the pre-fix ~0.94deg).',
        status: 'FIXED',
        concepts_affected: ['earths_magnetism'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts'],
        row_type: 'incident',
    },
    {
        bug_class: 'em_state6_sandbox_dead_declination_and_b_controls',
        title: 'earths_magnetism STATE_6 (explore/sandbox, Rule 31 "expose ALL controls"): the declination D slider had no geometry to drive (STATE_6 visible_elements omits the compass/arc/true-N cluster) and the total-field B slider never changed any rendered length (H/V/needle used the fixed EM_NEEDLE_LEN constant)',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'Rule 31\'s explore-state invariant ("all controls live") was satisfied for the DOM slider rows but not for the 3D geometry those sliders are supposed to drive: (1) the D-arc/compass/true-N primitives were never added to the sandbox state\'s visible set; (2) Hw/Vw (world-space arrow + triangle lengths) were hardcoded to EM_NEEDLE_LEN, a constant, so B had no visual effect (also a Rule 29 violation — a live slider with no corresponding length change).',
        prevention_rule: 'A final explore/sandbox state must make EVERY exposed live slider visibly drive geometry, not just a readout number. When a control\'s geometry belongs to a cluster hidden by another state\'s scoped visible_elements list, the renderer unions that cluster into the sandbox state\'s visible set explicitly (gated on the state\'s own sandbox/explore marker, never bleeding into guided states) rather than leaving the control decorative.',
        probe_type: 'manual',
        probe_logic: 'On STATE_6: drag the D slider and confirm the compass needle + yellow D arc actually rotate; drag the B slider and confirm the dip-needle/H/V/triangle lengths visibly scale (bounded, never blowing out of frame).',
        status: 'FIXED',
        concepts_affected: ['earths_magnetism'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
        row_type: 'incident',
    },
    {
        bug_class: 'em_states45_duplicate_formula_surfaces',
        title: 'earths_magnetism STATE_4/5/6: static in-scene 3D sprites ("tan I = V/H", "B = sqrt(H^2+V^2)") rendered simultaneously with each state\'s own #formula_overlay — STATE_5 showed THREE formulas at once, two of them carried over from STATE_4 and one (the sprite pair) actively wrong for what STATE_5 teaches (tan I = 2 tan lambda)',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'em_tan_lbl/em_bmag_lbl were tagged elementType "em_triangle" so the generic per-state visibility loop turned them on whenever the triangle was visible (S4/S5/S6), independent of the state\'s own dedicated formula_overlay text — a static duplicate that becomes an outright contradiction once the state teaches a different relation.',
        prevention_rule: 'Rule 34b (one formula surface per state) applies to EVERY overlay layer, not just the DOM formula_overlay — an in-scene 3D sprite that repeats/contradicts the state\'s dedicated formula surface must be suppressed, and any per-frame staged-reveal code that would re-enable it must be removed in the same change, not just its state-entry visibility.',
        probe_type: 'manual',
        probe_logic: 'On S4/S5/S6, count visible formula-bearing text elements in the 3D scene + DOM overlay combined: exactly one per state, and it must match what that state\'s narration/formula_overlay actually teaches.',
        status: 'FIXED',
        concepts_affected: ['earths_magnetism'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
        row_type: 'incident',
    },
    {
        bug_class: 'field3d_readout_hud_top12_vs_fsbtn_top10',
        title: 'earths_magnetism #em_readout anchored top:12px;right:12px, the same corner as build_review_site.ts\'s #fsTopControls Full-screen button (top:10px;right:10px) — direct overlap in every readout-bearing state (S3-S6)',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'The readout HUD was positioned without accounting for the shared review-chrome Full-screen button that build_review_site.ts overlays on every sim iframe at the same top-right corner (Rule 34d: overlays never collide).',
        prevention_rule: 'Any fixed top-right HUD/readout panel in a field_3d scenario must clear top:52px+ to sit below the review chrome\'s Full-screen button. This is the readout-HUD half of the already-OPEN fleet-wide row field3d_sliders_panel_top12_vs_fsbtn_top10 (which additionally covers *_sliders control panels, not yet swept fleet-wide).',
        probe_type: 'manual',
        probe_logic: 'On any em readout-bearing state (S3-S6) with the review chrome visible: #em_readout bounding box does not intersect #fsTopControls bounding box.',
        status: 'FIXED',
        concepts_affected: ['earths_magnetism'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
        row_type: 'incident',
    },
];

async function main(): Promise<void> {
    for (const r of rows) {
        const up = await supabaseAdmin
            .from('engine_bug_queue')
            .upsert({ ...r, discovered_in_session: SESSION, fixed_at: new Date().toISOString() }, { onConflict: 'bug_class' });
        if (up.error) throw new Error(`upsert failed for ${r.bug_class}: ${up.error.message}`);
        console.log(`✅ FIXED ${r.bug_class}`);
    }
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
