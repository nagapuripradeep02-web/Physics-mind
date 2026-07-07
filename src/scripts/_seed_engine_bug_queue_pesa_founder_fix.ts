/**
 * Seed engine_bug_queue with the one finding from the
 * potential_energy_system_of_charges Rule-31 pass review (2026-07-07).
 * Surfaced by eye-walker on THE EYE run 20260707-233105. Not a regression from
 * the Rule-31 pass — a pre-existing on-canvas overlay clarity issue.
 *
 * Row inserted OPEN, fixed in the same session, flipped FIXED after re-verify.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pesa_founder_fix.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pesa_founder_fix.ts --fixed
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-07_pesa_rule31_founder_review';

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
        bug_class: 'pesa_state4_overlay_charge_count_mismatch',
        title: 'STATE_4 formula_overlay renders "4 charges → 6 pairs" next to a visibly 3-charge / 3-bond scene — the 4-charge case is the narration\'s rule-generalization beat, but on-canvas (sound-off) it reads as a charge-count mismatch',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'S4 teaches the N(N-1)/2 rule and the narration deliberately uses "four charges make six pairs" as the generalization (and the Rule-16a natural-guess "four pairs, one per charge"). That 4-charge example belongs in the NARRATION. But it was ALSO placed in the rendered formula_overlay ("U = -4.3 + 9.2 - 10.3 = -5.4 · 4 charges -> 6 pairs"), so a teacher reading the sim sound-off sees "4 charges -> 6 pairs" beside a scene that shows exactly 3 charges and 3 bonds — a Rule 24 clarity conflict.',
        prevention_rule: 'On-canvas overlays/captions must match the charge/pair count actually rendered in that state (N(N-1)/2 for the N shown). Generalization examples (e.g. "4 charges -> 6 pairs") live in the narration; the rendered overlay grounds the concrete scene + names the rule. quality_auditor: cross-check any "N charges -> M pairs" overlay text against the state\'s rendered charge count.',
        probe_type: 'manual',
        probe_logic: 'Open S4: the overlay must state the pair count for the 3 charges shown (3 charges -> 3 pairs) and name the rule N(N-1)/2; it must NOT show "4 charges -> 6 pairs" next to a 3-charge scene.',
        status: 'OPEN',
        concepts_affected: ['potential_energy_system_of_charges'],
        fixed_in_files: ['src/data/concepts/potential_energy_system_of_charges.json'],
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
