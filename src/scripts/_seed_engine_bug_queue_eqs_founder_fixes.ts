/**
 * Seed engine_bug_queue with the founder-directed fixes from the
 * equipotential_surfaces Rule-31 pass review (2026-07-07). Surfaced by
 * eye-walker on THE EYE run 20260707-224130. Neither is a regression from the
 * Rule-31 JSON pass.
 *
 * Rows inserted OPEN, fixed in the same session, then flipped FIXED after
 * eye-walker verifies the fix run.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_eqs_founder_fixes.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_eqs_founder_fixes.ts --fixed
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-07_eqs_rule31_founder_review';

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

const CONCEPT = 'equipotential_surfaces';
const JSON_FILE = ['src/data/concepts/equipotential_surfaces.json'];

const rows: Row[] = [
    {
        bug_class: 'eqs_outer_shell_v_label_offscreen',
        title: 'The outermost equipotential shell\'s V label falls outside the captured frame in 5 of 7 states — the camera is not pulled back far enough to fit the largest configured shell radius, so the concept teaches "V = 12, 8, 6, 4" but only 3 labels are visible',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'The per-state camera_position distances (~5 units) were tuned for a 3-shell view, but the shells_override tables reach r = 3.0 (S2/S3/S4/S6) and r = 4.0 (S5). The outer shell\'s V-value label sprite (offset above the shell) lands above the top frame edge, so the V=4 (and S5\'s V=3) label never renders. Same class as electric_potential_meaning\'s pm_equipotential_outer_shell_clipped_by_camera_framing, fixed there last session by pulling the camera back to dist ~7.9.',
        prevention_rule: 'For any state showing equipotential shells, set the camera distance to fit the LARGEST configured shell radius plus its label offset: dist ~= 2.6 * r_max + margin (r_max=3 -> ~7.9, r_max=4 -> ~10.5). Verify every configured v_label lands inside the frozen frame before approve.',
        probe_type: 'manual',
        probe_logic: 'Open S2 (shells V=12/8/6/4) and S5 (V=12/9/6/3): every V-value label, including the outermost, must be fully inside the frame.',
        status: 'OPEN',
        concepts_affected: [CONCEPT],
        fixed_in_files: JSON_FILE,
        row_type: 'incident',
    },
    {
        bug_class: 'eqs_state6_narration_claims_unrendered_field_reversal',
        title: 'STATE_6 narration + annotation claim "the field lines reverse, now pointing inward" while potential.show_field is "off" for the whole state — zero field lines render, so the claim has no visual backing (Rule 24 sound-off)',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'S6 teaches "only sign + direction flip, geometry unchanged" with show_field:"off" (the shells + labels + sign recolor carry it). But s6_3 + the sign_flip_reveal annotation promise visible field lines reversing inward — which never render. TTS is off by default (Rule 24), so the visual alone must carry every narrated claim. The engine also cannot show reversed lines here: the outward-built field lines are HIDDEN when the sign is negative (the ppc_sign_flip fix), so the honest fix is to reword the claim to what IS shown.',
        prevention_rule: 'Never let teacher_script/annotation assert a visual event the state\'s field_3d_config does not render. Reword S6 to the shown truth: V labels go negative, the shells + source recolor to the negative family, the geometry stays concentric spheres; state the field-direction concept without implying visible lines reverse.',
        probe_type: 'manual',
        probe_logic: 'Play S6 past sign_flip_at_ms (9s): the narration/labels must not reference field lines reversing, since none are drawn; the flip must read fully from the sign recolor + minus labels + unchanged geometry.',
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
            const upd = await supabaseAdmin.from('engine_bug_queue').update({ status: 'FIXED' }).eq('bug_class', r.bug_class);
            if (upd.error) throw new Error(`flip failed for ${r.bug_class}: ${upd.error.message}`);
            console.log(`✅ FIXED ${r.bug_class}`);
        }
        return;
    }
    for (const r of rows) {
        const up = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: SESSION }, { onConflict: 'bug_class' });
        if (up.error) throw new Error(`upsert failed for ${r.bug_class}: ${up.error.message}`);
        console.log(`📌 OPEN ${r.bug_class}`);
    }
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
