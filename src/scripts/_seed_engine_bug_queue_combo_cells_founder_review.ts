/**
 * Seed engine_bug_queue with the founder-directed visual-quality findings from
 * the combination_of_cells post-ship review (2026-07-19). The founder's verdict:
 * the cell bank — the SUBJECT of the concept — is illegible: cells too small to
 * read as cells, labels + voltmeter piled into one pocket, series vs parallel
 * indistinguishable, dock/flip/regroup motion imperceptible at that scale,
 * while the loop interior sits empty.
 *
 * Rows inserted OPEN, fixed in the same session (renderer_primitives redesign
 * of the ccMode cell-bank stage), then flipped FIXED after eye-walker verifies
 * the fix run (same arc as the esoc/ppc founder-fix scripts).
 *
 * Run:  npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_combo_cells_founder_review.ts
 * Flip: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_combo_cells_founder_review.ts --fixed
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-19_combo_cells_founder_review';

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
        bug_class: 'combo_cells_bank_illegible_scale_no_standard_symbol',
        title: 'combination_of_cells: the cell bank — the taught object — renders as a ~28px smudge on the left wire; the standard long-line/short-line cell symbol is unreadable, +/− polarity is not marked, and a viewer cannot count how many cells are present',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'drawCellIconC draws plates at 28px total height (line(0,-14,0,14) + 6px-weight short plate) and ccShapeOffsets spaces series cells only 38px apart, sized to fit the internal_resistance single-cell pocket the scenario was extended from. The concept whose entire subject is "how cells combine" inherited a geometry designed for a concept where the cell was a supporting actor.',
        prevention_rule: 'When a scenario_type is EXTENDED for a new concept, the taught object of the new concept must be re-scaled as the visual PROTAGONIST — the element the atomic claim is about gets the largest, clearest rendering on canvas (Rule 32/34 legibility). A cell symbol must always be the standard textbook symbol: long thin line = + terminal, short thick line = − terminal, with explicit +/− glyphs at first introduction.',
        probe_type: 'manual',
        probe_logic: 'Open STATE_2/STATE_3: each cell must be individually countable at arm\'s length, drawn with the standard two-plate symbol ≥44px across with visible +/− polarity marks; a teacher must be able to point at "cell 1" and "cell 2" as distinct objects.',
        status: 'OPEN',
        concepts_affected: ['combination_of_cells'],
        fixed_in_files: ['src/lib/renderers/particle_field_renderer.ts'],
        row_type: 'incident',
    },
    {
        bug_class: 'combo_cells_zone_crowding_labels_voltmeter_pileup',
        title: 'combination_of_cells: per-cell ε chips, r zigzag labels, I·r drop labels and the VOLTMETER box all pile into one ~100px pocket around the left wire — in STATE_2 the two ε = 1.5 V labels overlap each other; the founder could not tell where cells were being added',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'drawCellComboScenario places the voltmeter at leftX+82 (inside the parallel bank\'s ±32px icon spread + label width), drawCellIconC prints every ε chip at the same y+18 slot below each icon, and drawEmfCell\'s rr labels (r, I·r) occupy the same pocket — every overlay in the cells zone claims overlapping space with no slot reservation (Rule 34d: overlays never collide).',
        prevention_rule: 'Every overlay in a scenario zone gets a RESERVED slot that no other overlay may claim (Rule 34d); a per-cell repeated label (ε chips) must be positioned per-cell with collision-checked offsets, and instruments (voltmeter) must sit outside the apparatus footprint with leads drawn to their measurement points (Rule 33d: readable at a glance).',
        probe_type: 'manual',
        probe_logic: 'Open every state: zero overlapping text labels in the cell-bank zone; the voltmeter box does not intersect any cell symbol or cell label; each cell\'s ε chip is unambiguously attached to its own cell.',
        status: 'OPEN',
        concepts_affected: ['combination_of_cells'],
        fixed_in_files: ['src/lib/renderers/particle_field_renderer.ts'],
        row_type: 'incident',
    },
    {
        bug_class: 'combo_cells_parallel_topology_visually_identical_to_series',
        title: 'combination_of_cells: the parallel bank does not read as parallel — STATE_5 (parallel) and STATE_2 (series) look near-identical at a glance; the two faint bus-bar lines 32px apart do not read as a two-branch ladder, defeating the concept\'s core visual contrast',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'ccShapeOffsets renders parallel as a 32px horizontal spread of the same tiny icons plus two low-alpha (#546E7A @ 0.55) bus-bar lines 16px above/below — at that scale the geometry difference between "cells in one line" and "cells on separate rungs" is sub-perceptual. The textbook parallel-cells figure is a LADDER: two junction nodes with each cell on its own visibly separate rung.',
        prevention_rule: 'When the taught contrast IS a topology change, the two topologies must be geometrically unmistakable from across a classroom: series = cells in ONE line along the wire path; parallel = an explicit ladder with junction dots and one cell per rung, drawn large enough that the branch structure is the dominant feature of the bank (Rule 32: the delta between states must be THE visible change).',
        probe_type: 'manual',
        probe_logic: 'Place STATE_3 (series) and STATE_5 (parallel) frozen frames side by side: a viewer who has never seen the sim must correctly name which is series and which is parallel from the bank geometry alone.',
        status: 'OPEN',
        concepts_affected: ['combination_of_cells'],
        fixed_in_files: ['src/lib/renderers/particle_field_renderer.ts'],
        row_type: 'incident',
    },
    {
        bug_class: 'combo_cells_bank_motion_imperceptible_at_scale',
        title: 'combination_of_cells: the dock_cell / flip_cell / regroup one-shots — the cause-motion of S2/S4/S5 — are imperceptible because they move a ~28px icon ~38-70px; the founder watching the sim could not see "where the cells are adding"',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'The one-shot mechanics are correct (ccIconOffsets lerps dock/shape morphs on the state clock) but the travel distances and icon sizes inherited from the internal_resistance pocket are below the legibility floor — a 70px dock of a 28px icon in a 640px-wide frame is ~4% of canvas travel on ~2% of canvas area. Rule 32a requires the CAUSE to move VISIBLY first; this cause-motion is technically present but perceptually absent.',
        prevention_rule: 'A one-shot that IS a state\'s declared cause-motion must move an element ≥40px in size over a travel path ≥25% of the canvas dimension it moves along, or be otherwise unmistakable (e.g. full off-stage entry). Motion that exists in code but not in perception fails Rule 32a.',
        probe_type: 'manual',
        probe_logic: 'Play STATE_2 from t=0: the second cell\'s arrival must be an unmissable event (enters from off-stage/clearly outside the bank, travels a long visible path, lands with a settle). Same bar for S4\'s flip (mirrored plates clearly visible) and S5\'s regroup (line → ladder morph readable).',
        status: 'OPEN',
        concepts_affected: ['combination_of_cells'],
        fixed_in_files: ['src/lib/renderers/particle_field_renderer.ts'],
        row_type: 'incident',
    },
    {
        bug_class: 'combo_cells_interior_dead_space_content_squeezed_to_border',
        title: 'combination_of_cells: the circuit loop\'s interior (~50% of canvas) is empty in every state while all teaching content (cells, labels, meters, chips) is squeezed onto the thin border wires — the canvas fails "the screen shows the machine" (Rule 34) in the inverse direction: the machine is there but microscopic',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'The scenario inherits internal_resistance\'s loop geometry where the single cell + voltmeter fit the left edge. combination_of_cells adds N cells, per-cell labels, branch chips and a comparison grid but keeps everything in the same edge pockets, leaving the loop interior as dead space instead of using it as the bank\'s stage.',
        prevention_rule: 'Canvas real estate follows teaching weight: the taught object may claim the largest contiguous empty region (a loop interior is legitimate stage space for the bank ladder, voltmeter, and per-cell labels — circuit-diagram geometry is notation, not physical layout). Empty interior + illegible protagonist = a layout defect, not a style choice.',
        probe_type: 'manual',
        probe_logic: 'Open STATE_3/STATE_5/STATE_6: the cell bank + its labels + the voltmeter visibly occupy the left interior region of the loop; no state shows >40% of the canvas as contiguous dead space while any teaching label overlaps another.',
        status: 'OPEN',
        concepts_affected: ['combination_of_cells'],
        fixed_in_files: ['src/lib/renderers/particle_field_renderer.ts'],
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
