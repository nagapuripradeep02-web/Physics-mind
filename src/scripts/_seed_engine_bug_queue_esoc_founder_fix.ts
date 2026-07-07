/**
 * Seed engine_bug_queue with the ONE founder-directed fix from the
 * electric_potential_system_of_charges Rule-31 pass review (2026-07-07).
 * Surfaced by eye-walker on THE EYE run 20260707-155443; NOT a regression from
 * the Rule-31 JSON pass — a June-build legend defect in the system_of_charges
 * scenario.
 *
 * Row inserted OPEN, fixed in the same session, then flipped FIXED after
 * eye-walker verifies the fix run (same arc as the ppc/dipole fixes earlier
 * this session).
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_esoc_founder_fix.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_esoc_founder_fix.ts --fixed
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-07_esoc_rule31_founder_review';

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
        bug_class: 'soc_generic_charge_legend_mislabels_scalar_v_as_e_field_direction',
        title: 'system_of_charges shows the generic point-charge legend "Red sphere = +q / Blue sphere = -q / Lines = E field direction" — wrong content on all 3 lines, and "E field direction" reinforces the exact scalar-V-is-not-a-vector misconception the whole concept confronts',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'The renderer legend builder prints the generic point-charge legend for any scenario whose name contains "charge" (scenario.indexOf("charge") >= 0). system_of_charges matches, so it prints the +q/-q pair legend + "Lines = E field direction" — but this concept has THREE in-scene-labelled charges (+q1/-q2/+2q3, not a +/- pair) and its connector lines are r-distance lines for k q/r, NOT field-direction lines. The sibling electric_potential_meaning suppresses this exact legend for the same "conflates scalar V with E field direction" reason (gated on config.potential_meaning), but system_of_charges has no potential_meaning block so it fell through to the generic branch. electric_potential_point_charge is unaffected (it HAS a potential_meaning block → suppressed); dipole_potential is unaffected (its scenario name does not contain "charge").',
        prevention_rule: 'A scenario\'s fixed/persistent legend must be re-audited whenever its core representation changes. system_of_charges is a silent visual (Rule 24) — the in-scene +q1/-q2/+2q3 labels, the per-charge k q/r tags, the running-sum panel, and the formula overlay carry everything; suppress the generic legend entirely (early-return legendEl.display="none"), alongside the existing cyclotron_period / electric_potential_meaning / moving_coil_galvanometer / pe_external_field suppressions.',
        probe_type: 'manual',
        probe_logic: 'Open any state of electric_potential_system_of_charges: NO top-left legend reading "Red sphere = +q / Blue sphere = -q / Lines = E field direction" should appear. The in-scene charge labels + per-charge tags + running-sum panel + formula overlay carry the reading.',
        status: 'OPEN',
        concepts_affected: ['electric_potential_system_of_charges'],
        fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
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
