/**
 * The sync merge rule (P2) — tested against the SHIPPED notebook.js.
 *
 * Sync's whole safety story rests on one property: merging stage ticks is
 * commutative, associative and idempotent, because a tick is a date and the
 * EARLIEST date wins (matching setStage's first-tick-wins). If that holds, two
 * devices converge whatever order they sync in, and a retried request can never
 * lose or move a tick — which is why the endpoint needs no locking, no
 * versioning and no conflict UI.
 *
 * The same rule is implemented twice on purpose — here in the browser and as
 * LEAST() in ab_sync (supabase_migrations/..._answerbook_student_sync.sql).
 * They must agree; the properties below are what "agree" means.
 *
 * Extract-and-evaluate, like vidiSeam.test.ts: testing a reimplementation would
 * pass forever while the shipped one rotted.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Stage = { u: string; p?: string; r: string };
type Row = { q: string; u?: string; r?: string };

/** Rebuild the Vidi storage closure around the real mergeStages source. */
function loadMerge(): (rows: Row[], seed?: Record<string, Stage>) => Record<string, Stage> {
    const js = readFileSync(join(process.cwd(), 'answer-book', 'notebook.js'), 'utf8');
    const start = js.indexOf('      mergeStages: function (rows) {');
    expect(start, 'mergeStages not found in notebook.js').toBeGreaterThan(-1);
    const end = js.indexOf('\n      },', start);
    expect(end, 'mergeStages end not found').toBeGreaterThan(start);
    // `mergeStages: function (rows) {...}` -> a callable bound to a fresh store.
    const body = js.slice(start + '      mergeStages: '.length, end + '\n      }'.length);
    const factory = new Function(`
        return function (rows, seed) {
            var stages = seed || {};
            var lsSet = function () {};
            var merge = ${body};
            merge(rows);
            return stages;
        };
    `) as () => (rows: Row[], seed?: Record<string, Stage>) => Record<string, Stage>;
    return factory();
}

const merge = loadMerge();

describe('mergeStages — earliest tick wins', () => {
    it('adopts a remote tick the device has never seen', () => {
        const out = merge([{ q: 'q1', u: '2026-09-02', r: '' }]);
        expect(out.q1.u).toBe('2026-09-02');
        expect(out.q1.r).toBe('');
    });

    it('keeps the EARLIER date when both devices ticked', () => {
        const seed = { q1: { u: '2026-09-05', r: '' } as Stage };
        expect(merge([{ q: 'q1', u: '2026-09-02' }], seed).q1.u).toBe('2026-09-02');
    });

    it('never moves a tick later — a late remote loses', () => {
        const seed = { q1: { u: '2026-09-02', r: '' } as Stage };
        expect(merge([{ q: 'q1', u: '2026-09-09' }], seed).q1.u).toBe('2026-09-02');
    });

    it('an empty remote value never erases a real local tick', () => {
        const seed = { q1: { u: '2026-09-02', r: '2026-09-03' } as Stage };
        const out = merge([{ q: 'q1', u: '', r: '' }], seed);
        expect(out.q1.u).toBe('2026-09-02');
        expect(out.q1.r).toBe('2026-09-03');
    });

    it('is IDEMPOTENT — replaying a response changes nothing', () => {
        const rows = [{ q: 'q1', u: '2026-09-02', r: '2026-09-04' }];
        const once = merge(rows);
        const twice = merge(rows, JSON.parse(JSON.stringify(once)));
        expect(twice).toEqual(once);
    });

    it('is COMMUTATIVE — sync order cannot change the outcome', () => {
        const a = [{ q: 'q1', u: '2026-09-05', r: '' }];
        const b = [{ q: 'q1', u: '2026-09-02', r: '2026-09-06' }];
        const ab = merge(b, merge(a));
        const ba = merge(a, merge(b));
        expect(ab).toEqual(ba);
        expect(ab.q1.u).toBe('2026-09-02');   // the earliest either device saw
    });

    it('reports whether anything actually moved, so a no-op never repaints', () => {
        // The return value gates VidiPanel.onSynced(); a merge that always
        // claimed "changed" would repaint the catalog on every poll.
        const js = readFileSync(join(process.cwd(), 'answer-book', 'notebook.js'), 'utf8');
        expect(js).toContain('if (changed) lsSet(\'pm_stage_v1\'');
        expect(js).toContain('if (changed) VidiPanel.onSynced();');
    });

    it('survives the junk a broken response can carry', () => {
        expect(() => merge([] as Row[])).not.toThrow();
        expect(() => merge(null as unknown as Row[])).not.toThrow();
        expect(() => merge([{} as Row, { q: '' } as Row])).not.toThrow();
    });
});

describe('the server implements the SAME rule', () => {
    const sql = readFileSync(
        join(process.cwd(), 'supabase_migrations', 'supabase_2026_08_23_answerbook_student_sync.sql'), 'utf8');

    it('merges progress with LEAST(), never with an overwrite', () => {
        expect(sql).toContain('least(ab_progress.u_date, excluded.u_date)');
        expect(sql).toContain('least(ab_progress.r_date, excluded.r_date)');
    });

    it('refuses a STALE plan rather than merging it', () => {
        // The plan is one blob, so it is last-write-wins by CLIENT timestamp —
        // and the guard has to be a WHERE on the upsert, or an old device
        // silently overwrites a newer plan.
        expect(sql).toContain('where excluded.plan_saved_at > ab_plans.plan_saved_at');
    });

    it('keeps the tables deny-by-default', () => {
        for (const t of ['ab_devices', 'ab_progress', 'ab_plans']) {
            expect(sql).toContain(`alter table ${t}`.replace(/\s+/g, ' '));
        }
        expect(sql).toContain('enable row level security');
        expect(sql).not.toMatch(/create policy/i);   // service role only, no anon path
    });
});
