/**
 * engine_bug_queue — founder_proxy Checkpoint B CYCLE 1 on
 * `derivative_as_secant_limit` (2026-08-07; FIX — 1 P1 · 4 P2 · 4 P3; report:
 * docs/loop_runs/mathematics/derivative_as_secant_limit/founder_proxy_report_checkpointB_cycle1.md).
 *
 * TWO targeted updates to EXISTING rows + TWO new rows.
 *
 * The updates are deliberate and narrow. The proxy asked for upserts on two
 * live classes because the recurrence belongs on the row that predicted it —
 * but a blanket ON CONFLICT DO UPDATE is the ch6 scar-apply hazard (it can
 * silently reopen a FIXED row and discard fixed_at). So this script updates
 * ONLY the fields the proxy changed, and NEVER writes status on a row whose
 * current status is FIXED — it reports and skips instead, leaving the founder
 * to rule.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_derivative_checkpointB_cycle1.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy checkpointB cycle1 derivative_as_secant_limit 2026-08-07';
const CONCEPT = 'derivative_as_secant_limit';

const NEW_ROWS = [
    {
        bug_class: 'readout_collision_flip_is_wired_at_one_call_site_of_three_so_an_authored_offset_means_different_things_per_primitive',
        title: 'PM_readoutResolveOffset runs only for plot_point; secant and tangent readouts never escape the axis band',
        severity: 'MODERATE',
        owner_cluster: 'peter_parker:renderer_primitives',
        root_cause: 'parametric_renderer.ts:3519 routes plot_point readouts through PM_readoutResolveOffset (danger-zone test, then a both-component mirror). The secant (:4137) and tangent (:4193) readouts receive only PM_clampOffsetToCanvas. Consequence 1: STATE_5 authored {55,55} lands squarely on the x-axis tick-label row (bbox rows 302-316 vs band 291-314) and collects the "2" tick glyph inside the word and the "x" axis label under the "=", with no flip. Consequence 2: the same authored number behaves differently depending on which primitive carries it, and the flip is invisible to the author - STATE_2 P is authored {-104,20} and renders {+104,-20}, so a design note can describe a placement that does not exist.',
        prevention_rule: 'Every primitive that draws its own readout resolves its offset through the SAME collision-aware resolver, and the resolved offset is exposed on __pmDebug so an author can read what rendered instead of asserting it. A placement mechanism an author cannot observe is a placement mechanism an author cannot verify.',
        probe_type: 'js_eval',
        probe_logic: 'For each secant_line/tangent_line readout with an authored offset, assert the resolved bbox does not overlap any PM_readoutDangerZones rect; assert __pmDebug exposes the resolved offset for every readout-bearing primitive.',
    },
    {
        bug_class: 'a_label_positioned_by_a_data_offset_straddles_its_anchor_because_drawlabel_is_centre_aligned',
        title: 'An offset authored as "up-right of the dot" renders as "centred on a point up-right of the dot", so the text sits ON the anchor',
        severity: 'MODERATE',
        owner_cluster: 'alex:json_author',
        root_cause: 'drawLabel renders textAlign(CENTER,CENTER) at the resolved position, so a position_expr of {u+0.18, u+0.15} places the label CENTRE 23 screen px from a dot while a ~90px-wide string still spans ~45px either side of that centre - the dot, the curve and the tangent all land inside the text. STATE_8 "height = slope" is struck by the curve at the frozen pin and by four elements at once at u=0. Compare drawPlotPoint readout, which is textAlign(LEFT,CENTER) - the same authored number means two different things on the two primitives.',
        prevention_rule: 'Before authoring a label offset, know the primitive text alignment: a CENTRE-aligned label needs an offset larger than half its own measured text width to clear its anchor, not merely a visible displacement. Where the required clearance exceeds what the geometry allows, use a leader line or move the text out of the plot region entirely.',
        probe_type: 'js_eval',
        probe_logic: 'For each label with a position_expr anchored near a drawn primitive, assert |offset_px.x| > measuredTextWidth/2 + markerRadius, sampled across the state full choreography range.',
    },
];

// Narrow field-level updates the proxy asked for on live rows.
const UPDATES = [
    {
        bug_class: 'readout_offset_authored_from_one_sample_aims_the_text_into_the_curve_the_point_rides',
        fields: {
            severity: 'CRITICAL',
            title: 'A readout offset chosen to escape one collision creates a new one at a different pose — recurred inside its own fix round',
            root_cause: 'The cycle-0 fix pushed STATE_9 Q readout +130px right to clear P marker. That offset is unconditional, so wherever the two anchors share a row (xq ~ -x0, the symmetric pose where chord slope is exactly 0) Q box (px 302-420, row 279) lands inside P box (px 344-458, row 274) and both numbers are destroyed. The old offset {12,-30} flipped to {-12,+30} and never collided. Compounding cause: PM_readoutResolveOffset (parametric_renderer.ts:3408) negates BOTH components when a plot_point box hits an axis band, so the authored offset is often not what renders (STATE_2 P: authored {-104,20}, rendered {+104,-20}) - every design note in the fix round reasoned about the authored number.',
            prevention_rule: 'A readout offset is not verified until it has been RENDERED and read at zoom at the extremes AND at the degenerate poses: both branches of the curve, the pose where the two anchors share a row, and the pose where they coincide. Arithmetic in a _design_note is not verification, because the renderer may mirror the offset you authored. Before authoring any offset on a cartesian_plane point, dump the resolved offset the renderer actually used; if that is not observable, the placement is unverifiable and the fix belongs in the engine.',
            probe_logic: 'For each plot_point/secant/tangent readout in a state, compute the resolved bbox at N sampled control values across the full authored + drag range and assert no pair of bboxes overlaps, and that no bbox overlaps a PM_readoutDangerZones rect.',
        },
        addConcept: CONCEPT,
    },
    {
        bug_class: 'ascii_minus_in_oncanvas_math_from_tofixed',
        fields: {
            severity: 'MAJOR',
            owner_cluster: 'peter_parker:renderer_primitives',
            title: 'ASCII minus recurs a THIRD time — this occurrence is on an engine readout path no authoring rule can reach',
            root_cause: 'PM_plotPointResolve (parametric_renderer.ts:3422-3440) interpolates x.toFixed(decimals) into readout.format; the secant (:4110-4137) and tangent (:4173-4193) readouts do the same. readout.format is a template with no transform slot, so an author CANNOT apply the replace to U+2212 that the existing prevention rule prescribes for text_expr. Visible on guided core STATE_6 for the negative half of a 24s sweep: ASCII "P = (-0.97, 0.47)" beside Unicode "slope at P = -0.97".',
            prevention_rule: 'The Unicode-minus rule has an ENGINE half, not only an authoring half: every renderer path that converts a number to on-canvas text routes through one shared formatter that emits U+2212. Auditing text_expr strings can never close this class, because the readout paths have no authoring hook at all. Owner moves to renderer_primitives for the formatter; the authoring clause stays for text_expr.',
            probe_logic: 'Render every state of every cartesian_plane concept at control values spanning the negative range; assert no on-canvas text node contains U+002D immediately preceding a digit.',
        },
        addConcept: CONCEPT,
    },
];

async function main(): Promise<void> {
    let filed = 0, skipped = 0;
    for (const row of NEW_ROWS) {
        const { data: existing } = await supabaseAdmin
            .from('engine_bug_queue').select('bug_class').eq('bug_class', row.bug_class).maybeSingle();
        if (existing) { console.log(`already filed: ${row.bug_class} — skipping.`); skipped++; continue; }
        const { error } = await supabaseAdmin.from('engine_bug_queue').insert({
            ...row, concepts_affected: [CONCEPT], discovered_in_session: SESSION, status: 'OPEN',
        });
        if (error) throw new Error(`insert ${row.bug_class} failed: ${error.message}`);
        console.log(`✅ FILED (OPEN) ${row.bug_class}`); filed++;
    }

    for (const u of UPDATES) {
        const { data: rec, error: rErr } = await supabaseAdmin
            .from('engine_bug_queue').select('bug_class, status, concepts_affected')
            .eq('bug_class', u.bug_class).maybeSingle();
        if (rErr) throw new Error(`read ${u.bug_class} failed: ${rErr.message}`);
        if (!rec) { console.log(`⚠ update target missing: ${u.bug_class} — recorded in the report only.`); continue; }

        const affected = rec.concepts_affected ?? [];
        const nextAffected = affected.includes(u.addConcept) ? affected : [...affected, u.addConcept];

        if (rec.status === 'FIXED') {
            // NEVER reopen a FIXED row from a seed script (ch6 hazard). Report and let the founder rule.
            console.log(`⚠ ${u.bug_class} is FIXED — recurrence NOT auto-reopened. Founder ruling required.`);
            const { error } = await supabaseAdmin.from('engine_bug_queue')
                .update({ concepts_affected: nextAffected }).eq('bug_class', u.bug_class);
            if (error) throw new Error(`append failed: ${error.message}`);
            console.log(`   (appended ${u.addConcept} to concepts_affected; status left FIXED)`);
            continue;
        }

        const { error } = await supabaseAdmin.from('engine_bug_queue')
            .update({ ...u.fields, concepts_affected: nextAffected }).eq('bug_class', u.bug_class);
        if (error) throw new Error(`update ${u.bug_class} failed: ${error.message}`);
        console.log(`✅ UPDATED ${u.bug_class} (status was ${rec.status}, left as-is)`);
    }
    console.log(`\ndone: ${filed} filed, ${skipped} present, of ${NEW_ROWS.length}; ${UPDATES.length} updates processed.`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
