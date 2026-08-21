/**
 * Ch.6 concept #7 Checkpoint-B CYCLE-0 scar rows — the four founder-proxy authored and
 * the dispatching session failed to file at the time. It dispatched the fix and skipped
 * the filing; the omission surfaced only when the cycle-2 amend found no row to amend.
 * Exactly the failure mode this chapter already has on record (PROGRESS.md, concept #2).
 *
 * Row 1 is filed FIXED — closed by the content route in cycle 1, no engine spend.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_apply_ch6_c7_checkpointB_cycle0_scars.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const S = 'ch6-concept-7-founder-proxy-B-cycle0';
const GPE = 'gravitational_potential_energy';
const PED = 'potential_energy_definition';
const JSONF = [`src/data/concepts/${GPE}.json`];
const NOW = new Date().toISOString();

type Row = {
    bug_class: string; title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE'; owner_cluster: string;
    root_cause: string; prevention_rule: string; probe_type: string; probe_logic: string;
    status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
    discovered_in_session: string; row_type: 'incident' | 'directive' | 'probe_definition';
    fixed_at?: string;
};

const rows: Row[] = [
    {
        bug_class: 'state_claiming_two_values_are_equal_never_renders_both_numerals_in_one_frame',
        title: 'A state whose whole idea is an equality shows one of the two numbers, because the second reading overwrites the first',
        severity: 'CRITICAL', owner_cluster: 'alex:json_author',
        root_cause: "A single checkpoint with capture_mode 'every' re-stamps in place and carries only a pass number (field_3d_renderer.ts L2074-2076), so a round-trip state that exists to prove U(depart) = U(return) never has both numerals on screen. Every gate passed: the numbers are individually correct, motion is present, and no gate asks whether the state's CLAIM is visible. CLOSED in cycle 1 by the content route — a second checkpoint at the same s_m with capture_mode 'first' latches the departure reading alongside the 'every' one, and nlbRenderStamps appends each as its own line. No engine change was needed.",
        prevention_rule: "A state whose delta cue asserts an equality or an invariance must render BOTH compared numerals in the same frame at its eye_capture_ms. Two latched stamps, not one re-stamped one.",
        probe_type: 'js_eval',
        probe_logic: "At the state eye_capture_ms, collect all rendered stamp lines on #nlb_formula; if the state's delta_cue matches /same|equal|unchanged|identical/i, assert at least 2 distinct stamp clauses are simultaneously present.",
        status: 'FIXED', concepts_affected: [GPE], fixed_in_files: JSONF,
        discovered_in_session: S, row_type: 'incident', fixed_at: NOW,
    },
    {
        bug_class: 'nlb_readouts_enum_has_no_height_token_so_a_u_equals_mgh_concept_cannot_render_its_middle_factor',
        title: 'newtons_laws_body readouts enum omits h, so the live-numbers panel cannot show height on a gravitational-PE concept',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'field_3d_renderer.ts L1812-1813 enumerates readouts as N/f/a/v/T/F_net/F_applied/T1/T2/P/P_avg/contact/Romega/omega/KE_trans/KE_rot. There is no h token, so height is only expressible by baking it into a checkpoint or predicted_stop LABEL. gravitational_potential_energy renders h in 5 of 6 states for exactly that reason, and its explore drags theta with no h shown to explain why U moves.',
        prevention_rule: "Any quantity that appears as a factor in a concept's taught formula must be expressible as a live readout token in the scenario's readouts enum.",
        probe_type: 'js_eval',
        probe_logic: 'Set the explore state, drag nlb_theta_slider via a trusted event, and assert the nlb_readout panel exposes h tracking s*sin(theta) - h_ref for the authored s.',
        status: 'OPEN', concepts_affected: [GPE, PED], fixed_in_files: [],
        discovered_in_session: S, row_type: 'incident',
    },
    {
        bug_class: 'nlb_weight_arrow_and_its_label_overdraw_the_incline_angle_label_and_the_displacement_label',
        title: 'On the incline rig the mg label is drawn fully inside the displacement label bbox, and the weight arrow shaft crosses the incline-angle label',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'The weight arrow and its label have no collision lane against the displacement-arrow label or the incline-angle arc label. Measured on gravitational_potential_energy: mg bbox (717,385)-(751,405) fully contained in the d-label bbox (695,385)-(756,415) on STATE_1 and STATE_3 (34x20 px overlap); arrow shaft column x=719 inside the theta-label band x=711..754 on STATE_1/STATE_3 and x=733..734 on STATE_5. The overlay checker is structurally blind to it because check-layout-overlap reads scene_composition, which field_3d never draws. Earlier reports understated this as a ~2 px near-miss; it is full bounding-box containment, and it sits over a load-bearing numeral (S4 contrasts 1.41 against S1 2.40).',
        prevention_rule: 'Weight arrow, its label, the displacement label and the incline-angle label occupy disjoint screen boxes in every state of an incline_slide rig.',
        probe_type: 'js_eval',
        probe_logic: 'At each state eye_capture_ms, compute screen bboxes for the mg label, the displacement label and the incline-angle label; assert pairwise intersection area is zero.',
        status: 'OPEN', concepts_affected: [GPE, PED, 'conservative_vs_nonconservative_forces'], fixed_in_files: [],
        discovered_in_session: S, row_type: 'incident',
    },
    {
        bug_class: 'sibling_concept_shares_a_frozen_composition_and_only_a_cross_sim_read_can_see_it',
        title: "Two concepts' frozen frames read as one picture; no per-concept gate can detect it",
        severity: 'MODERATE', owner_cluster: 'alex:architect',
        root_cause: 'gravitational_potential_energy STATE_5 and potential_energy_definition STATE_3 share slab, body, mg arrow, dashed reference line, twin bar stack and stamp-block geometry; every difference between them is a readout, not a picture. Adjudicated ACCEPTABLE for this pair — the states are a concept and its declared prerequisite at the one state whose job is to quote it, the differentiation that matters is rendered (a mg*deltah line plus a rendered height pair the sibling has no equivalent of), and a scan of all eight Ch.6 concepts found the composition in one state of six here and nowhere else outside the sibling. The similarity is downstream of a coordinated cross-concept ruling that moved the sibling reference, which resolved three findings and pushed the two states together. Recorded so the THIRD occurrence is caught.',
        prevention_rule: 'At Checkpoint A, any new concept whose state authors an incline surface plus an energy_layer bar plus a gravity work accumulator must be diffed against the two concepts already using that composition, and must name its rendered differentiator. TWO occurrences is adjudicated acceptable; THREE is a chapter-level finding at Checkpoint C. Standing check for conservation_of_mechanical_energy and mechanical_energy_loss_with_friction.',
        probe_type: 'manual',
        probe_logic: 'Scan chapter concepts for states with surface.theta_deg non-zero AND energy_layer.bars non-empty AND work_accumulators containing gravity; if the count exceeds two concepts, escalate to a chapter-level composition finding at Checkpoint C.',
        status: 'OPEN',
        concepts_affected: [GPE, PED, 'conservation_of_mechanical_energy', 'mechanical_energy_loss_with_friction'],
        fixed_in_files: [], discovered_in_session: S, row_type: 'probe_definition',
    },
];

async function main(): Promise<void> {
    let ins = 0, upd = 0, fail = 0;
    for (const r of rows) {
        const ex = await supabaseAdmin.from('engine_bug_queue').select('bug_class').eq('bug_class', r.bug_class).maybeSingle();
        const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(r, { onConflict: 'bug_class' });
        if (error) { fail++; console.error(`  x ${r.bug_class}: ${error.message}`); continue; }
        if (ex.data) { upd++; console.log(`  ~ UPDATED ${r.status.padEnd(5)} ${r.severity.padEnd(8)} ${r.bug_class}`); }
        else { ins++; console.log(`  + INSERT  ${r.status.padEnd(5)} ${r.severity.padEnd(8)} ${r.bug_class}`); }
    }
    const after = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
    console.log(`\ninserted ${ins} - updated ${upd} - failed ${fail} - engine_bug_queue: ${after.count} rows`);
    if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error('apply failed:', e); process.exit(1); });
