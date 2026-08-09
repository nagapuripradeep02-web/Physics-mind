/**
 * engine_bug_queue — the cartesian_plane axis mislabels every tick.
 *
 * Found 2026-08-07 by the FOUNDER walking the derivative review link, reported
 * as "the x-axis prints -0", then root-caused here to something considerably
 * worse: the tick VALUES are enumerated from rangeMin itself and stepped by
 * `tick`, with no snap to a multiple of the step. The labels are then rounded
 * for display, so the printed number is not the coordinate the gridline sits on.
 *
 * Reproduced against both shipped mathematics concepts:
 *
 *   derivative_as_secant_limit   x_range [-2.4, 2.6], tick 1
 *     tick marks really at : -2.40  -1.40  -0.40   0.60   1.60   2.60
 *     labels printed       : -2     -1     -0      1      2      3
 *     (matches the rendered frame exactly, "-0" included)
 *
 *   graph_transformations        x_range [-6.5, 6.5], tick 1
 *     tick marks really at : -6.5 -5.5 ... -0.5  0.5 ... 5.5 6.5
 *     labels printed       : -7   -6   ... -1    1   ... 6   7
 *     (matches the rendered frame exactly, including the MISSING zero: there is
 *      no tick at x=0 at all, so the axis shows a gap where the origin should be)
 *
 * So on a mathematics product whose entire job is reading coordinates off a
 * graph, every gridline is labelled with a number it is not at — off by up to
 * one full step. The "-0" the founder spotted is the least of it; it is just
 * the one label whose wrongness is visible without measuring.
 *
 * The negative-zero half also has a damning detail: PM_formatTickLabel's `pi`
 * branch ALREADY carries the guard (`if (Math.abs(value) < 1e-9) return '0';`
 * @2038). The numeric branch @2053 returns value.toFixed(decimals) with no
 * clamp. The fix exists in the same function, one branch over.
 *
 * NOT fixed here. This is Rule 40 PLATFORM (parametric_renderer.ts) and it
 * changes the axis of every cartesian_plane concept, so it lands on master as
 * its own piece of work with a re-baseline, not inside a concept desk.
 *
 * NOTE for whoever fixes it: `check:cartesian-plane` §3 tests PM_planeTickValues
 * and passes today, so the gate currently encodes the buggy enumeration as
 * correct. The gate has to change with the code, and the negative control must
 * pin the snapped values.
 *
 * Idempotent: upsert on bug_class. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_cartesian_plane_tick_labels.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder review of derivative_as_secant_limit, 2026-08-07';

const rows = [
    {
        bug_class: 'cartesian_plane_tick_values_enumerate_from_range_min_so_every_axis_label_misreports_its_own_gridline',
        title:
            'The cartesian_plane axis labels every tick with a rounded number the gridline is not at — off by up to one full step, and the origin can be missing entirely',
        severity: 'CRITICAL',
        owner_cluster: 'peter_parker:renderer_primitives',
        subject: 'subject_neutral',
        root_cause:
            'PM_planeTickValues enumerates `for (var t = rangeMin; t <= rangeMax + EPS; t += tick)` — it starts at the authored range minimum and never snaps to a multiple of the step. PM_formatTickLabel then rounds for display (value.toFixed(decimals)), so the printed label is not the coordinate of the mark it sits under. Measured: x_range [-2.4, 2.6] tick 1 puts marks at -2.40/-1.40/-0.40/0.60/1.60/2.60 and prints -2/-1/-0/1/2/3; x_range [-6.5, 6.5] tick 1 puts marks on the half-integers and prints the integers, with NO tick at x=0 so the axis shows a gap where the origin belongs. Both reproduce exactly against the rendered frames of the two shipped mathematics concepts. Separately, PM_formatTickLabel\'s numeric branch lacks the near-zero clamp that its own `pi` branch already has, which is what surfaces the visible "-0".',
        prevention_rule:
            'Tick values are SNAPPED to multiples of the step before they are drawn or labelled: start at Math.ceil(rangeMin / tick) * tick and step by tick, so every mark sits on a round coordinate and its label is exact rather than rounded. Clamp |value| < 1e-9 to 0 before formatting in EVERY branch of the tick formatter, not just the pi branch. A tick label is a CLAIM about where the gridline is: never render a rounded label under an unsnapped mark. When this is fixed, check:cartesian-plane must be updated in the same commit — it currently passes over the unsnapped enumeration and therefore encodes the defect as correct — and the whole cartesian_plane fleet needs a re-baseline, since every axis moves.',
        probe_type: 'js_eval',
        probe_logic:
            'For every cartesian_plane spec: enumerate the tick values the renderer will draw, and assert each one is an exact multiple of the tick step within 1e-9 (v / tick is within 1e-9 of an integer). Independently assert the rendered label equals the tick value exactly at the authored decimals — i.e. Number(label) === Number(value.toFixed(decimals)) — so no label can round away from its own mark. Assert no rendered label matches /^-0(\\.0+)?$/. Assert a tick exists at 0 whenever the range spans zero.',
        status: 'OPEN',
        concepts_affected: ['derivative_as_secant_limit', 'graph_transformations'],
        fixed_in_files: [] as string[],
        discovered_in_session: SESSION,
        row_type: 'incident',
    },
];

async function main() {
    const { data, error } = await supabaseAdmin
        .from('engine_bug_queue')
        .upsert(rows, { onConflict: 'bug_class' })
        .select('id, bug_class, severity, status');
    if (error) {
        console.error('FAILED:', error.message);
        process.exit(1);
    }
    console.log(`upserted ${data?.length ?? 0} row(s):`);
    for (const r of data ?? []) console.log(`  [${r.severity}/${r.status}] ${r.bug_class}`);
}

main();
