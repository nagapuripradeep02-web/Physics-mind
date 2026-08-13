/**
 * H4 — renderer self-diagnostics.
 *
 * The channel these assert on was WRITE-ONLY for two days: screenshotter
 * collected every [PM_*] console.warn into `diagnostic_warnings` and no check
 * read it, so `work_energy_theorem` shipped four EYE runs reporting
 * "v = 0.00 m/s" beside "K = 62.7 J" while every failing check id was an
 * unrelated stale baseline. These tests exist so the consumer cannot be
 * removed again without a red suite.
 */
import { describe, it, expect } from 'vitest';
import { runPixelGate } from '../pixelGate';
import type { CaptureResult, ConsoleErrorFinding } from '../screenshotter';

function mkCapture(diagnostics: ConsoleErrorFinding[]): CaptureResult {
    return {
        state_captures: [],
        timings: [],
        param_relay: { timed_out: true },
        dense_timeseries: [],
        template_leak_dom_findings: [],
        console_errors: [],
        diagnostic_warnings: diagnostics,
        warnings: [],
    };
}

function warn(stateId: string, text: string): ConsoleErrorFinding {
    return { state_id: stateId, kind: 'consolewarn', text };
}

const CLAMP = "[PM_NLB_ENERGY_CLAMP] body 'block' reached a track bound while the energy layer was active — bars HELD at their last pre-clamp values.";
const SCALE = "[PM_NLB_ENERGY_SCALE] work ledger 'gravity' reached 220.82 J, over the authored work_scale_J of 220 J.";

async function h4(diagnostics: ConsoleErrorFinding[], conceptId = 'test') {
    const result = await runPixelGate({ conceptId, capture: mkCapture(diagnostics), panelCount: 1 });
    return result.check_results.filter(r => r.check_id === 'H4');
}

describe('pixelGate H4 — renderer self-diagnostics', () => {
    it('passes with a single summary row when no diagnostics fired', async () => {
        const rows = await h4([]);
        expect(rows).toHaveLength(1);
        expect(rows[0].passed).toBe(true);
        expect(rows[0].state_id).toBe('ALL_STATES');
    });

    it('fails the state that emitted an energy clamp', async () => {
        const rows = await h4([warn('STATE_4', CLAMP)]);
        const s4 = rows.find(r => r.state_id === 'STATE_4');
        expect(s4).toBeDefined();
        expect(s4!.passed).toBe(false);
        expect(s4!.evidence).toContain('PM_NLB_ENERGY_CLAMP');
    });

    it('routes clamp and scale diagnostics to the author, not the engine', async () => {
        const rows = await h4([warn('STATE_4', CLAMP), warn('STATE_5', SCALE)]);
        for (const id of ['STATE_4', 'STATE_5']) {
            const row = rows.find(r => r.state_id === id);
            expect(row!.passed).toBe(false);
            // A clamp is the authored motion plan running the body into a bound and
            // an overflowed scale is an authored bar range — both are JSON edits, so
            // routing them to a surgeon would burn a dispatch on the wrong desk.
            expect(row!.evidence).toContain('[owner: alex:architect]');
        }
    });

    it('reports one failure per state, not one per repeated warning', async () => {
        // nlbEnWarnOnce is once-per-CONTEXT, and a capture drives several contexts
        // (state pass, dense pass, frozen pin) — the real run that motivated this
        // emitted the identical STATE_5 scale warning eight times. Eight copies of
        // one defect must read as one defect.
        const rows = await h4([
            warn('STATE_5', SCALE), warn('STATE_5', SCALE), warn('STATE_5', SCALE),
            warn('STATE_5', SCALE), warn('STATE_5', SCALE), warn('STATE_5', SCALE),
            warn('STATE_5', SCALE), warn('STATE_5', SCALE),
        ]);
        const failures = rows.filter(r => !r.passed);
        expect(failures).toHaveLength(1);
        expect(failures[0].evidence).toContain('1 renderer self-diagnostic(s)');
    });

    it('counts two distinct prefixes in one state as two findings', async () => {
        const rows = await h4([warn('STATE_4', CLAMP), warn('STATE_4', SCALE)]);
        const s4 = rows.find(r => r.state_id === 'STATE_4');
        expect(s4!.passed).toBe(false);
        expect(s4!.evidence).toContain('2 renderer self-diagnostic(s)');
    });

    it('ignores console.warn output that carries no [PM_*] prefix', async () => {
        const rows = await h4([warn('STATE_1', 'THREE.WebGLRenderer: context lost')]);
        expect(rows).toHaveLength(1);
        expect(rows[0].passed).toBe(true);
    });
});
