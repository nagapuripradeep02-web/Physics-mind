/**
 * Seed engine_bug_queue with the latent engine gap json_author discovered while
 * splitting combination_of_cells STATE_7 (2026-07-20): the DOM slider-label
 * readouts contradict the scene during scripted one-shot morphs.
 *
 * Mitigated in-JSON for combination_of_cells (visible_controls: [] on the
 * regroup/cycle states, matching STATE_5's precedent) — the row stays OPEN as
 * an engine defect for the next renderer touch.
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_cc_slider_label_oneshot_gap.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_cc_slider_label_oneshot_gap.ts --fixed
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
        bug_class: 'pf_slider_label_ignores_oneshot_lerp_regroup_and_cycle_R',
        title: 'particle_field: the DOM slider-label readouts only track cycle_compare topology (updateReadouts line ~751) — a plain regroup one-shot shows the TARGET topology label while the scene is still mid-morph at the SOURCE value, and cycle_compare\'s phase-2 R sweep leaves the "Load R" label stuck at the entry value while the drawn resistor already reads the swept value',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'updateReadouts() special-cases the cell_topology slider label for cycle_compare states only; there is no equivalent override for the plain regroup one-shot, and no R-label override for cycle_compare\'s phase-2 R sweep. Any state that exposes the affected slider in visible_controls while running one of those one-shots shows a panel label that contradicts the ammeter/icons/physics (verified in dense frames during the STATE_7 split: "Cell topology: Series" at t=2000ms while the scene was still parallel at 3.00 A).',
        prevention_rule: 'Every DOM readout that names a state variable must derive from the SAME per-frame resolved physics the canvas draws from (ccCombo\'s result), never from the state\'s authored entry/target fields — a label is an instrument (Rule 33d) and must track the live value through every one-shot. Until fixed: states running regroup/cycle_compare morphs must not expose the morphing variable\'s slider in visible_controls (STATE_5 precedent).',
        probe_type: 'manual',
        probe_logic: 'Author a test state with visible_controls:["cell_topology"] + a regroup one-shot (start ≥2000ms): during the pre-morph window the panel label must read the CURRENT (source) topology, not the target. Same for visible_controls:["R"] + a cycle_compare phase-2 R sweep: the label must track the swept R continuously.',
        status: 'OPEN',
        concepts_affected: ['combination_of_cells'],
        fixed_in_files: [],
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
