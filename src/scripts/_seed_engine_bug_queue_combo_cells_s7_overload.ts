/**
 * Seed engine_bug_queue with the founder's second-round review finding on
 * combination_of_cells (2026-07-20): STATE_7 is cognitively overloaded —
 * "a lot is going on, I did not even understand the state."
 *
 * Diagnosis: the authored 3-phase cycle_compare packs FOUR grid reveals and
 * THREE circuit morphs (regroup→series @1.0s, R sweep @2.5s, regroup→parallel
 * @4.2s) into ~5 seconds, with ~35 words of narration covering all of it,
 * while ammeter/voltmeter/ladder all change simultaneously. Rule 31 (ONE idea
 * + ONE complete motion per state) is violated in spirit: 4 ideas, 3 motions.
 *
 * Fix: split into two states (heavy-load comparison / light-load crossing),
 * each with one comparison and generous pacing. Content-class fix →
 * alex:json_author (no renderer change: ccCyclePhys phases are optional).
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_combo_cells_s7_overload.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_combo_cells_s7_overload.ts --fixed
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-20_combo_cells_founder_review_round2';

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
        bug_class: 'combo_cells_s7_cycle_compare_four_ideas_in_five_seconds',
        title: 'combination_of_cells STATE_7: the PRIMARY-aha state packs 4 grid reveals + 3 circuit morphs (regroup, load sweep, regroup back) into ~5s while ammeter/voltmeter/ladder all change — the founder watching it "did not understand the state at all"',
        severity: 'MAJOR',
        owner_cluster: 'alex:json_author',
        root_cause: 'The architect designed the 2×2 load-crossing comparison as ONE 3-phase cycle_compare state; the authored timings (phase1 @1000ms, phase2 @2500ms, phase3 @4200ms, grid reveals at 300/1800/3400/5000ms) give each comparison ~1.2s of screen time. A 2-variable crossing (topology × load) inherently carries four facts; compressing them into one auto-cycling state exceeds any viewer\'s tracking capacity — Rule 31 (ONE idea + ONE complete motion) and Rule 32b (only the taught variable moves) both violated in spirit even though each individual gate passed mechanically.',
        prevention_rule: 'A cross-comparison over TWO variables (here topology × load) is never one state: split so each state changes ONE variable and lands ONE verdict, with the full comparison grid assembling ACROSS states (earlier rows persist as recall, only the current state\'s row animates in). An auto-cycling multi-phase one-shot (3+ phases) in a guided state is a red flag per se — phases are for at most cause→effect pairs, not slideshows.',
        probe_type: 'manual',
        probe_logic: 'Play the states that teach the load-crossing: each state must change exactly ONE variable (topology OR load), land exactly ONE comparison verdict, and give the viewer ≥4s of settled reading time per revealed grid row before the state ends. A first-time viewer must be able to narrate back "which grouping won and why" after each state.',
        status: 'OPEN',
        concepts_affected: ['combination_of_cells'],
        fixed_in_files: ['src/data/concepts/combination_of_cells.json'],
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
