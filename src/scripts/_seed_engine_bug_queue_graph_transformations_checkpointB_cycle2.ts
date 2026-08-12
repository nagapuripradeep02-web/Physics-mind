/**
 * engine_bug_queue — founder_proxy Checkpoint B CYCLE 2 on `graph_transformations`
 * (2026-08-08; verdict APPROVE — 0 P1 · 3 P2 · 8 P3; report:
 * docs/loop_runs/mathematics/graph_transformations/founder_proxy_report_checkpointB_cycle2.md).
 *
 * THREE new rows + THREE amendments + SIX status closes.
 *
 * Discipline, unchanged from earlier rounds: inserts are insert-only with a
 * per-row existence check; amendments touch ONLY the named fields; and a close
 * (OPEN -> FIXED) is applied only to a row currently OPEN. A row already FIXED
 * is never rewritten by a script -- that is the ch6 hazard, and it is why the
 * ascii_minus row was left alone in an earlier round pending a founder ruling.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_graph_transformations_checkpointB_cycle2.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy_checkpointB_cycle2_2026-08-08';
const CONCEPT = 'graph_transformations';
const FIXED_IN = ['src/data/concepts/mathematics/graph_transformations.json'];

const NEW_ROWS = [
    {
        bug_class: 'a_uniformity_fix_applied_to_a_whole_set_overrides_the_one_member_the_finding_explicitly_excepted',
        title: 'A blanket "make it uniform across all states" fix silently reverses the exception the review named',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause: 'The cycle-1 finding said the missing "3" scale row was JUSTIFIED on STATE_6 (the chip had been moved onto that row) and unjustified only on STATE_7. The fix restored the row on both, and on STATE_6 it landed on the aha chip: label ink x161-167 y174-183 vs chip ink x143-465 y183-198, sharing row 183 and reading as a superscript on the word "inside".',
        prevention_rule: 'When a finding names an exception ("A is justified, B is not"), a uniformity remedy must re-verify the excepted member at the pixel level after applying, or restate why the exception no longer holds. Uniformity is the goal; the exception is the constraint.',
        probe_type: 'js_eval',
        probe_logic: 'For every state, assert no authored label ink bbox intersects any other authored label/annotation ink bbox in the same state; report the pair and the overlap row count.',
        concepts_affected: [CONCEPT],
        fixed_in_files: [] as string[],
    },
    {
        bug_class: 'plane_gridlines_draw_above_every_canvas_text_overlay_so_no_placement_can_avoid_them',
        title: 'Raising grid contrast makes gridlines cut every chip, label and moving readout; a placement solver structurally cannot fix it',
        severity: 'MAJOR',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'drawCartesianPlane runs Pass 0.25 and overlay text runs Pass 3, with no scrim behind the text. At the 73px gridline pitch an 87px readout box always intersects at least one vertical line, and a readout anchored to a moving point can never leave the grid. Measured across all 8 states of graph_transformations: chip_inside crossed at 4 columns, chip_outside at 3, bracket_label at 3, and the P-prime readout in every state.',
        prevention_rule: 'Canvas text drawn inside a plane viewport needs a compositing remedy (scrim/halo behind glyphs, or a text pass above the grid) — never a placement remedy. Do not route a gridline-over-text defect to the readout de-overlap solver.',
        probe_type: 'js_eval',
        probe_logic: 'For each text primitive resolved bbox, count pixels matching grid_color within the bbox; assert 0. Run against every state, not just the pinned frame.',
        concepts_affected: [CONCEPT],
        fixed_in_files: [] as string[],
    },
    {
        bug_class: 'a_verification_gate_outside_ci_can_die_at_load_and_report_green_by_absence',
        title: 'check:cartesian-plane threw at load for ~2h on master; 339 assertions never executed and CI stayed green because the gate was never a CI step',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:visual_validator',
        root_cause: 'PR #59 added PM_fmtNum, which PM_formatTickLabel calls. The gate harness extracts named functions from the renderer template body by an explicit list; PM_fmtNum was absent, so the whole gate died with "ReferenceError: PM_fmtNum is not defined". Nothing surfaced it: the gate had never been added to verify.yml, so its absence was indistinguishable from its success. Every gate-blindness row already in this queue is about a gate that RAN and looked at the wrong thing; none was about a gate that never started.',
        prevention_rule: 'Every gate that guards a shared engine file is a CI step or it does not exist. A gate must fail loudly on zero assertions executed (assert count > 0 as its own final assertion), so "did not run" can never be mistaken for "passed".',
        probe_type: 'js_eval',
        probe_logic: 'Assert every npm run check:* script named in package.json appears as a step in .github/workflows/verify.yml; and assert each gate prints a nonzero assertion count and exits nonzero when that count is 0.',
        concepts_affected: [] as string[],
        fixed_in_files: ['.github/workflows/verify.yml', 'src/scripts/check_cartesian_plane.ts'],
    },
];

// Field-level amendments to live rows. Never touches status except where stated.
const AMENDMENTS: Array<{ bug_class: string; fields: Record<string, unknown>; note: string }> = [
    {
        bug_class: 'raising_gridline_contrast_turns_every_overlay_text_that_sits_on_a_tick_row_into_a_strikethrough',
        fields: {
            title: 'Raising gridline contrast cuts every canvas text overlay that shares the plane viewport with the grid — not only text on a tick row',
        },
        note: 'retitled (scope was too narrow); stays OPEN, engine half now lives in plane_gridlines_draw_above_every_canvas_text_overlay…',
    },
    {
        bug_class: 'a_claim_corrected_on_one_rendered_surface_is_left_standing_on_the_sibling_surface_that_repeats_it',
        fields: {
            severity: 'CRITICAL',
            owner_cluster: 'peter_parker:renderer_primitives',
            root_cause: 'Originally filed against authored content. RECURRED TWICE at cycle 2, both ENGINE-side, which is why ownership moves: (a) PM_fmtNum was wired at the readout, tangent and tick-label paths but NOT at the slider caption (parametric_renderer.ts:5077), so one canvas renders U+2212 twice and an ASCII hyphen once (STATE_4__frozen.png: edge label "-2", readout "-2.00", slider caption "a: -2.0"); (b) the canonical example — check_cartesian_plane asserted the -0 guard with an ASCII-hyphen regex that could NEVER match a U+2212 string, so the guard protecting the original founder-reported bug passed VACUOUSLY the moment PR #59 changed the glyph. A guard whose own literal goes stale relative to the thing it guards is the same disease as a claim corrected on one surface and left on its sibling.',
        },
        note: 'severity MAJOR→CRITICAL, owner alex:json_author→peter_parker:renderer_primitives, root_cause extended; stays OPEN',
    },
    {
        bug_class: 'choreography_holds_shift_every_downstream_ms_so_a_pin_named_in_absolute_ms_lands_off_hold',
        fields: { row_type: 'probe_definition' },
        note: 'incident closed below; row_type flipped to probe_definition so the prevention_rule survives as a standing check',
    },
];

const CLOSE = [
    'axis_declutter_sets_tick_labels_to_none_without_the_edge_labels_that_were_its_other_half',
    'readout_format_drops_the_point_name_that_every_later_narration_still_uses',
    'state_title_asserts_a_sequence_the_choreography_plays_in_the_opposite_order',
    'rule_chip_generalises_shift_direction_language_over_a_scale_factor_that_has_no_direction',
    'axis_scale_labels_placed_inside_the_plotted_band_are_overwritten_by_the_curve_they_measure',
    'choreography_holds_shift_every_downstream_ms_so_a_pin_named_in_absolute_ms_lands_off_hold',
];

async function main(): Promise<void> {
    for (const row of NEW_ROWS) {
        const { data: ex } = await supabaseAdmin.from('engine_bug_queue')
            .select('bug_class').eq('bug_class', row.bug_class).maybeSingle();
        if (ex) { console.log(`already filed: ${row.bug_class}`); continue; }
        const { error } = await supabaseAdmin.from('engine_bug_queue')
            .insert({ ...row, discovered_in_session: SESSION, status: 'OPEN' });
        if (error) throw new Error(`insert ${row.bug_class}: ${error.message}`);
        console.log(`✅ FILED (OPEN) ${row.bug_class}`);
    }

    for (const a of AMENDMENTS) {
        const { data: rec } = await supabaseAdmin.from('engine_bug_queue')
            .select('bug_class, status').eq('bug_class', a.bug_class).maybeSingle();
        if (!rec) { console.log(`⚠ amend target missing: ${a.bug_class}`); continue; }
        const { error } = await supabaseAdmin.from('engine_bug_queue')
            .update(a.fields).eq('bug_class', a.bug_class);
        if (error) throw new Error(`amend ${a.bug_class}: ${error.message}`);
        console.log(`✅ AMENDED ${a.bug_class} — ${a.note}`);
    }

    for (const bc of CLOSE) {
        const { data: rec } = await supabaseAdmin.from('engine_bug_queue')
            .select('bug_class, status').eq('bug_class', bc).maybeSingle();
        if (!rec) { console.log(`⚠ close target missing: ${bc}`); continue; }
        if (rec.status !== 'OPEN') { console.log(`skip close (status=${rec.status}): ${bc}`); continue; }
        const { error } = await supabaseAdmin.from('engine_bug_queue')
            .update({ status: 'FIXED', fixed_in_files: FIXED_IN }).eq('bug_class', bc);
        if (error) throw new Error(`close ${bc}: ${error.message}`);
        console.log(`✅ CLOSED (FIXED) ${bc}`);
    }
    console.log('\ndone.');
}

main().catch((e) => { console.error('💥', e instanceof Error ? e.stack : e); process.exit(1); });
