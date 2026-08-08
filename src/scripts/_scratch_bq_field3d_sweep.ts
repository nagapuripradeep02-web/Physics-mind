/**
 * _scratch_bq_field3d_sweep.ts — the live engine_bug_queue consultation that
 * founder_proxy Checkpoint A (vector_products_in_space, 2026-08-08) ruled REQUIRED
 * and assigned to the dispatching session rather than to alex:architect.
 *
 * Why it exists: the architect could not run this from a read-only desk with no
 * .env.local, and substituted docs/patterns/mathematics.md §4 (hazards 1-12).
 * Checkpoint A measured that mirror as carrying near-zero field_3d coverage — of
 * the 12 hazards, only #11 touches field_3d, and only to say min_ring is inert.
 * vector_products_in_space is the FIRST mathematics concept on field_3d, so the
 * physics field_3d scar corpus (camera, ArrowHelper, sprite labels, glow) is
 * exactly what it needs and exactly what the mirror does not carry.
 *
 * Run from the office (needs .env.local):  npx tsx src/scripts/_scratch_bq_field3d_sweep.ts
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// The three concepts Checkpoint A named: the concept itself, plus the two physics
// field_3d scenarios whose scars are most likely to transfer (the clone target and
// the nearest vector-product neighbour).
const NAMED_CONCEPTS = [
    'vector_products_in_space',
    'rhr_force_direction',
    'torque_on_loop_uniform_field',
];

async function main() {
    const { data, error } = await sb
        .from('engine_bug_queue')
        .select('bug_class,title,severity,owner_cluster,status,concepts_affected,row_type');

    if (error) {
        console.error('QUERY FAILED:', error.message);
        process.exit(1);
    }

    const all = data ?? [];
    const open = all.filter((r) => r.status === 'OPEN');
    console.log(`engine_bug_queue: ${all.length} rows total, ${open.length} OPEN\n`);

    const blob = (r: Record<string, unknown>) => JSON.stringify(r).toLowerCase();

    const f3 = open.filter((r) => /field3d|field_3d/.test(blob(r)));
    console.log(`── OPEN + field_3d (${f3.length}) ───────────────────────────`);
    for (const r of f3) {
        console.log(`  [${r.severity}] ${r.bug_class}`);
        console.log(`      ${String(r.title ?? '').slice(0, 105)}`);
    }

    const arch = open.filter((r) => r.owner_cluster === 'alex:architect');
    console.log(`\n── OPEN + owner alex:architect (${arch.length}) ─────────────`);
    for (const r of arch) console.log(`  [${r.severity}] ${r.bug_class}`);

    const directives = open.filter((r) => r.row_type === 'directive');
    console.log(`\n── OPEN + row_type directive (${directives.length}) ─────────`);
    for (const r of directives) console.log(`  [${r.severity}] ${r.bug_class}`);

    const hits = open.filter((r) =>
        (r.concepts_affected ?? []).some((c: string) => NAMED_CONCEPTS.includes(c)),
    );
    console.log(`\n── OPEN touching the 3 named concepts (${hits.length}) ──────`);
    for (const r of hits) {
        console.log(`  [${r.severity}] ${r.bug_class} :: ${(r.concepts_affected ?? []).join(', ')}`);
    }

    // The failure classes Checkpoint A's Finding 1 is an instance of.
    const cam = open.filter((r) => /camera|foreshort|project|sprite|arrow|glow/.test(blob(r)));
    console.log(`\n── OPEN mentioning camera/projection/sprite/arrow/glow (${cam.length}) ──`);
    for (const r of cam) console.log(`  [${r.severity}] ${r.bug_class}`);

    // Checkpoint A withheld two candidate rows because bug_class is the upsert key
    // and it could not check for an existing class. Resolve both here.
    console.log(`\n── upsert-key checks for the 2 withheld rows ─────────────`);
    for (const needle of ['frozen_pin', 'eye_capture_ms', 'assessment', 'min(6)', 'quiz']) {
        const m = all.filter((r) => blob(r).includes(needle.toLowerCase()));
        console.log(`  "${needle}" → ${m.length} row(s)${m.length ? ': ' + m.map((r) => `${r.bug_class} [${r.status}]`).join(', ') : ''}`);
    }
}

main();
