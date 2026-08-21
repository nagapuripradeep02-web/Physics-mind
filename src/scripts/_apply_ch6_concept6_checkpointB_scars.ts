/**
 * Apply the Ch.6 concept #6 Checkpoint-B scar rows to engine_bug_queue.
 *
 * Sources:
 *   founder-proxy Checkpoint B on potential_energy_definition (4 rows)
 *   field3d-surgeon, routed FIX(engine) in the same cycle (1 row, status FIXED)
 *   + one UPSERT-EXTENSION of an existing OPEN row (the scale-ceiling class, 2nd instance)
 *
 * The surgeon authored its row as docs/loop_runs/ch6/scar_candidates_inclined_sandbox_wrap.sql
 * and deliberately did NOT write to the DB — it took the conservative branch on the one
 * class of action where a mistake is unrecoverable. Applied here instead, with its
 * SELECT-verified precondition re-checked at run time.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_apply_ch6_concept6_checkpointB_scars.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Row = {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: string;
    probe_logic: string;
    status: 'OPEN' | 'FIXED';
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string;
    row_type: 'incident' | 'directive' | 'probe_definition';
    fixed_at?: string;
};

const SB = 'ch6-checkpointB-founder_proxy-potential_energy_definition';
const SX = 'ch6-concept6-founder_proxy_checkpoint_b-field3d_surgeon-2026-08-10';
const PED = 'potential_energy_definition';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];

const rows: Row[] = [
    {
        bug_class: 'nlb_sandbox_wrap_reenters_at_the_opposite_bound_so_an_inclined_surface_manufactures_potential_energy',
        title: 'The newtons_laws_body sandbox wrap remaps a body bound-to-bound, which is energy-neutral only on a flat track -- on an incline it teleports the body through the full height of the ramp every lap and no arithmetic gate can see it',
        severity: 'CRITICAL', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: "SEAM J's sandbox wrap did s1 -= wDir*span on a bound crossing: the body leaves by one end of the track and is placed at the other. That is energy-neutral for exactly one reason -- on a flat track every point of the run is at the same height -- and the wrap was written and reviewed on flat sandboxes (13 of the 17 authored sandboxes are theta_deg 0). On an inclined track the same remap carries the body through the WHOLE height of the ramp in one frame. It is invisible to every numeric check because the wrap re-zeroes the work ledgers and re-captures the energy baseline in the SAME frame (nlbEnergyOnWrap -> nlbSpringPhysReset), so dU = -W_gravity still holds to the last decimal on BOTH sides of the discontinuity: the ledger re-anchor and the U reference re-anchor together. Only the PICTURE breaks. Measured on potential_energy_definition STATE_4 (theta 30, length 6, s0 -3.6, v0 8, mu 0): the block crosses s = -6 at t = 3.538 s and is placed at s = +5.9, the top of the ramp, so U leaps 1.96 -> 235.3 J (233 J, 42% of the 560 J bar) while the block is still descending, and it repeats every 1.109 s forever. EYE frames one second apart (run 20260810-005403): t3000 shows s = -1.595, v = -6.66 m/s, gravity -39.3 J; t4000 shows s = +1.992 (3.6 m HIGHER), v = -10.12 m/s (FASTER, still descending), gravity +76.7 J. A block on a frictionless ramp gaining both height and speed. The same wrap also defeated conservative_vs_nonconservative_forces STATE_5 (theta 25, mu 0.3 < tan 25 = 0.466, wraps from t = 4.28 s): its formula surface asserts a ROUND TRIP, but the remap ran it top-to-bottom repeatedly and it never made one.",
        prevention_rule: 'A wrap, remap or teleport that repositions a body is energy-neutral ONLY under the symmetry that makes the two positions equivalent. Bound-to-bound remapping assumes a translationally symmetric track and is therefore valid at theta_deg = 0 and nowhere else. Any such shortcut must be gated on the symmetry it depends on, read LIVE (a slider can tilt a track the author wrote flat -- 8 of the 17 sandboxes expose a theta slider, 3 of them authored at theta 0), and where the symmetry is absent the body must be re-anchored at a pose whose energy is authored, not derived from a bound. Corollary for reviewers: dU = -W_gravity agreeing across a discontinuity proves nothing when the ledger origin and the potential reference re-anchor in the same frame -- confirm the PICTURE (does the body gain height and speed at once?) before trusting the identity.',
        probe_type: 'js_eval',
        probe_logic: "For every field_3d state with newtons_laws_body.mode = 'sandbox' and a nonzero effective surface.theta_deg, drive past the first bound crossing and sample the engine each frame. Assert that on the frame where s jumps discontinuously, total mechanical energy m*g*(s*sin(theta)) + 0.5*m*v^2 is continuous to within the frame's own integration error for a frictionless track, and that the post-jump position equals the authored initial_position_m rather than the opposite track bound. Separately assert no frame pair exists where the body's height increases while its speed also increases and no force does positive work on it.",
        status: 'FIXED',
        concepts_affected: [PED, 'conservative_vs_nonconservative_forces', 'block_on_incline', 'gravitational_potential_energy'],
        fixed_in_files: RENDERER, discovered_in_session: SX, row_type: 'incident',
        fixed_at: new Date().toISOString(),
    },
    {
        bug_class: 'explore_slider_default_equals_its_maximum_so_the_narrated_instruction_runs_the_only_impossible_direction',
        title: 'The explore state opens with a slider pinned at its own maximum while the closing narration and the matching assessment question both command the direction it cannot move',
        severity: 'MAJOR', owner_cluster: 'alex:json_author',
        root_cause: "potential_energy_definition authored slider_controls.v0 = {min 0, max 8, step 0.5, default 8}. STATE_4 s4_4 narrates 'Relaunch faster - U at the same height never changes' and assessment q6_u_independent_of_speed examines 'once launched slowly, once launched fast'. The handle opens hard right against its stop, so a teacher following the narration drags and nothing happens. The claim is still demonstrable by going slower, so the concept is teachable - but only by inverting the instruction the sim gives out loud. Every gate passes: the slider exists, is wired, is live, and changes the physics; nothing compares a default against its own bound, or a narrated verb against the direction of available travel. NOTE the value is authored TWICE - physics_engine_config.variables.v0 and field_3d_config.slider_controls.v0 - and only the latter renders; the first fix pass edited the wrong one.",
        prevention_rule: 'A slider a state narrates must have travel in the narrated direction. Assert default is strictly inside (min, max) for any control the narration names with a directional verb (faster, slower, raise, lower, increase, reduce), or reword the narration to the direction that has travel. Check the assessment stems for the explore state against the same bound. Where a range is authored in more than one block, fix every copy and assert they agree.',
        probe_type: 'js_eval',
        probe_logic: 'For each state, collect controls_visible and the resolved slider_controls; for each tts_sentences text_en in that state, detect directional verbs and the control they name; assert the control default is not equal to the bound in the commanded direction. Repeat over assessment questions whose teaches_state is the explore state. Separately assert every duplicated range declaration for one control agrees.',
        status: 'FIXED', concepts_affected: [PED], fixed_in_files: [`src/data/concepts/${PED}.json`],
        discovered_in_session: SB, row_type: 'incident', fixed_at: new Date().toISOString(),
    },
    {
        bug_class: 'narration_glow_points_at_the_constant_force_arrow_while_the_sentence_quotes_the_two_quantities_that_change',
        title: 'A sentence quoting two live instrument numbers binds its glow to the one element in the state that never changes, so the brightest thing on screen at the aha beat is the invariant',
        severity: 'MODERATE', owner_cluster: 'alex:physics_author',
        root_cause: "potential_energy_definition STATE_1 s1_3 is the PRIMARY aha in one line -- 'Going up, gravity's work falls to negative 128 joules while U climbs equally' -- and bound glow to nlb_arrow_block_weight. mg is the only quantity in the state that is constant; both numbers the sentence quotes exist only in the energy panel. Frames confirm the emphasis fires (t0: block saturated, mg arrow thin amber; t1890: mg arrow thick bright yellow, block dimmed), and s1_4 -- the mirror-image claim about the same two bars -- correctly glowed energy_panel, so one state carried two focal targets for one claim. The panel is a DOM overlay and is NOT dimmed by applyGlowEmphasis, so this is misdirection rather than occlusion.",
        prevention_rule: 'A narration glow names the element the sentence is ABOUT, which for a sentence quoting instrument readings is the instrument. Rule 32a cause-first governs the ORDER of motion, not the target of emphasis, and it never justifies putting the single brightest focal on a quantity that is constant for the whole state. Where two sentences make the same claim about the same elements, they take the same focal.',
        probe_type: 'manual',
        probe_logic: 'For each tts_sentences entry, extract any numeral or quantity name it states and check the authored glow resolves to an element that displays that quantity. Flag any sentence quoting a live readout whose glow targets a constant-magnitude element (weight arrow, fixed angle arc, static label).',
        status: 'FIXED', concepts_affected: [PED], fixed_in_files: [`src/data/concepts/${PED}.json`],
        discovered_in_session: SB, row_type: 'incident', fixed_at: new Date().toISOString(),
    },
    {
        bug_class: 'frozen_pin_is_clean_only_because_it_precedes_a_sandbox_bound_crossing_that_no_gate_looks_past',
        title: 'A sandbox state whose baseline pin lands before its first track-bound crossing passes every visual check while the regime it spends most of its life in is never photographed',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'potential_energy_definition STATE_4 authors no eye_capture_ms, so the frozen pin defaults to 3000 ms; the first sandbox wrap is at t = 3.54 s. STATE_4__frozen.png shows a fully consistent pre-wrap screen, so THE EYE returned 20/20 with diagnostic_warnings empty on a state that became unphysical 540 ms later and stayed that way for the rest of its life. The dense series DID capture it (t04000 onward), but no check compares dense frames against a physical invariant - only the frozen pin is asserted. Same shape as the concept-1 lesson (found only by a 9 second drive; a frame count read it as cosmetic).',
        prevention_rule: 'A sandbox state must be gated on the regime it OCCUPIES, not the one its pin happens to land in. Where an integration reaches a discontinuity (track bound, wrap, clamp, stick) inside the state life, the pin must be placed after it, or a second pin authored past it. Compute the first discontinuity time at design time from the authored seeds and record it in the arithmetic table alongside the pin.',
        probe_type: 'js_eval',
        probe_logic: "For each mode:'sandbox' state, integrate the authored s0/v0/mu/theta against nlbBoundsM to find the first bound-crossing time T. Assert either eye_capture_ms > T, or that a second capture past T exists. Report any state where the pin precedes T.",
        status: 'OPEN', concepts_affected: [PED], fixed_in_files: [],
        discovered_in_session: SB, row_type: 'probe_definition',
    },
    {
        bug_class: 'eye_capture_ms_authored_in_two_config_buckets_and_the_losing_copy_is_the_one_an_author_edits',
        title: 'A capture instant authored in both field_3d_config and epic_l_path is resolved by last-bucket-wins, so an edit to the copy the author reaches for is silently ignored',
        severity: 'MODERATE', owner_cluster: 'alex:json_author',
        root_cause: 'visual_eyes.ts extractEyeCaptureMs iterates config buckets in order and OVERWRITES, so epic_l_path wins over field_3d_config. potential_energy_definition STATE_3 authored 3934 in both while STATE_1/STATE_2 authored theirs in field_3d_config only. They agreed, so nothing failed - but a later edit to the field_3d copy alone would have been discarded with no warning, and the per-state convention was internally inconsistent. Recorded because the reviewing agent reported the two buckets the wrong way round and the deletion was only aimed correctly by re-reading the file at source first.',
        prevention_rule: 'A field the harness resolves by bucket precedence is authored in exactly ONE bucket per concept, and the same bucket for every state of that concept. Before deleting a duplicate, read which copy actually wins rather than trusting a report - delete the winner and keep the conventional bucket, or the authored value stops being the read value.',
        probe_type: 'js_eval',
        probe_logic: 'For every concept, collect eye_capture_ms across all config buckets per state. Fail on any state declaring it in more than one bucket, and on any concept declaring it in different buckets across states.',
        status: 'FIXED', concepts_affected: [PED], fixed_in_files: [`src/data/concepts/${PED}.json`],
        discovered_in_session: SB, row_type: 'incident', fixed_at: new Date().toISOString(),
    },
];

const SCALE_CEILING = 'energy_bar_track_renders_no_scale_ceiling_so_two_states_draw_one_value_at_two_heights';
const SCALE_APPEND = " SECOND INSTANCE (potential_energy_definition, Checkpoint B 2026-08-10): authors 290 J guided / 560 J explore; measured 1.580 J/px in STATE_1 against 3.044 J/px in STATE_4, ratio 1.93 = 560/290 exactly, so the same 49.0 J opening draws at 16.9% of the track in STATE_1 and 8.75% in STATE_4. Here the author demonstrably has no alternative: bar_max_J = 2 x work_scale_J is the within-state equal-pixel invariant the concept's whole mirror claim rests on, and work_scale_J must be 280 to survive the teacher-drag friction exposure, so U's scale doubles as collateral. THIRD concept in the chapter to carry U_grav bars; filed twice, dispatched zero times.";

async function main(): Promise<void> {
    const before = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
    console.log(`engine_bug_queue BEFORE: ${before.count} rows\n`);

    // Precondition the surgeon verified by SELECT — re-check it rather than trust the note.
    const wrapRow = await supabaseAdmin.from('engine_bug_queue')
        .select('bug_class,status').eq('bug_class', rows[0].bug_class).maybeSingle();
    console.log(wrapRow.data
        ? `  ! wrap row already exists with status=${wrapRow.data.status} — re-apply would overwrite it`
        : '  ✓ wrap row absent (genuine INSERT, no fixed_at to discard)');

    let ins = 0, upd = 0, fail = 0;
    for (const r of rows) {
        const ex = await supabaseAdmin.from('engine_bug_queue').select('bug_class').eq('bug_class', r.bug_class).maybeSingle();
        const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(r, { onConflict: 'bug_class' });
        if (error) { fail++; console.error(`  ✗ ${r.bug_class}: ${error.message}`); continue; }
        if (ex.data) { upd++; console.log(`  ↻ UPDATED ${r.status.padEnd(5)} ${r.severity.padEnd(8)} ${r.bug_class}`); }
        else { ins++; console.log(`  + INSERT  ${r.status.padEnd(5)} ${r.severity.padEnd(8)} ${r.bug_class}`); }
    }

    // Upsert-extension of the existing OPEN scale-ceiling row — append, never replace.
    const sc = await supabaseAdmin.from('engine_bug_queue')
        .select('bug_class,root_cause,concepts_affected,status').eq('bug_class', SCALE_CEILING).maybeSingle();
    if (!sc.data) {
        console.log(`\n  ! ${SCALE_CEILING} not found — nothing to extend (expected it from concept #4)`);
    } else if ((sc.data.root_cause || '').includes('SECOND INSTANCE')) {
        console.log(`\n  = scale-ceiling row already carries the second instance — left alone`);
    } else {
        const concepts = Array.from(new Set([...(sc.data.concepts_affected || []), PED]));
        const { error } = await supabaseAdmin.from('engine_bug_queue')
            .update({ root_cause: (sc.data.root_cause || '') + SCALE_APPEND, concepts_affected: concepts })
            .eq('bug_class', SCALE_CEILING);
        console.log(error ? `\n  ✗ scale-ceiling extend: ${error.message}`
            : `\n  ↻ EXTENDED ${SCALE_CEILING} (status left ${sc.data.status}, concepts now ${concepts.length})`);
        if (error) fail++;
    }

    const after = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
    console.log(`\ninserted ${ins} · updated ${upd} · failed ${fail}`);
    console.log(`engine_bug_queue AFTER: ${after.count} rows (was ${before.count})`);
    if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error('💥 apply failed:', err); process.exit(1); });
