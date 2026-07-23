/**
 * TEMPORARY verification script (deleted after use — not part of the fix).
 *
 * Negative control for the D5 ink-relative recalibration: proves the new dual-
 * lens D5 still correctly FAILS on genuinely dead motion, using two controls:
 *
 *   Control A (real-world): faraday_law_induction STATE_1's actual dense frames
 *   from today's pre-fix baseline run (.visual_runs/faraday_law_induction/
 *   20260723-175734) — a real field_3d capture that is naturally near-static
 *   (max measured 16px/pair, see diagnostic). We feed these REAL frames through
 *   runPixelGate with expectsMotion FORCED to true (simulating an author who
 *   incorrectly declared motion on a dead state) and assert D5 still fails.
 *
 *   Control B (synthetic): the same single real frame duplicated N times —
 *   byte-identical adjacent pairs, diffPx=0 for every pair by construction.
 *   Also fed through with expectsMotion=true; must fail.
 *
 * If either control PASSES, the new D5 has gone blind and the fix must be
 * reworked before shipping.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runPixelGate } from '@/lib/validators/visual/pixelGate';
import type { CaptureResult, DenseTimeseries } from '@/lib/validators/visual/screenshotter';

function loadDenseSeries(dir: string, statePrefix: string): DenseTimeseries {
    const files = readdirSync(dir)
        .filter(f => f.startsWith(`${statePrefix}__dense_t`) && f.endsWith('.png'))
        .sort();
    const frames_b64 = files.map(f => readFileSync(join(dir, f)).toString('base64'));
    const capture_times_ms = files.map(f => {
        const m = f.match(/dense_t(\d+)\.png$/);
        return m ? parseInt(m[1], 10) : 0;
    });
    return { state_id: statePrefix, frames_b64, capture_times_ms };
}

function emptyCapture(dense: DenseTimeseries[]): CaptureResult {
    return {
        state_captures: [],
        timings: [],
        param_relay: { timed_out: true },
        dense_timeseries: dense,
        template_leak_dom_findings: [],
        console_errors: [],
        warnings: [],
    };
}

async function main(): Promise<void> {
    let anyFailure = false;

    // ── Control A: real near-static field_3d frames, motion forced true ──────
    const REAL_DIR = 'C:\\Tutor\\physics-mind\\.visual_runs\\faraday_law_induction\\20260723-175734';
    const realSeries = loadDenseSeries(REAL_DIR, 'STATE_1');
    realSeries.state_id = 'CONTROL_A_REAL_STATIC';
    console.log(`Control A: loaded ${realSeries.frames_b64.length} REAL faraday_law_induction STATE_1 frames (naturally near-static).`);

    const resultA = await runPixelGate({
        conceptId: '__negative_control__',
        capture: emptyCapture([realSeries]),
        panelCount: 1,
        expectsMotion: { CONTROL_A_REAL_STATIC: true },
    });
    const d5A = resultA.check_results.find(r => r.check_id === 'D5' && r.state_id === 'CONTROL_A_REAL_STATIC');
    console.log(`\n=== Control A result ===`);
    console.log(`  D5 passed: ${d5A?.passed}`);
    console.log(`  evidence: ${d5A?.evidence}`);
    if (d5A?.passed !== false) {
        console.log('  ✗ FAIL — D5 should have FAILED (real near-static content, motion forced true) but did not. D5 has gone blind.');
        anyFailure = true;
    } else {
        console.log('  ✓ D5 correctly failed — real near-static content is still caught.');
    }

    // ── Control B: synthetic byte-identical frames (diffPx=0 by construction) ─
    const oneFrameB64 = realSeries.frames_b64[0];
    const synthSeries: DenseTimeseries = {
        state_id: 'CONTROL_B_SYNTHETIC_IDENTICAL',
        frames_b64: Array(10).fill(oneFrameB64),
        capture_times_ms: Array.from({ length: 10 }, (_, i) => i * 1000),
    };
    console.log(`\nControl B: ${synthSeries.frames_b64.length} byte-identical synthetic frames (diffPx=0 for every pair by construction).`);

    const resultB = await runPixelGate({
        conceptId: '__negative_control__',
        capture: emptyCapture([synthSeries]),
        panelCount: 1,
        expectsMotion: { CONTROL_B_SYNTHETIC_IDENTICAL: true },
    });
    const d5B = resultB.check_results.find(r => r.check_id === 'D5' && r.state_id === 'CONTROL_B_SYNTHETIC_IDENTICAL');
    console.log(`\n=== Control B result ===`);
    console.log(`  D5 passed: ${d5B?.passed}`);
    console.log(`  evidence: ${d5B?.evidence}`);
    if (d5B?.passed !== false) {
        console.log('  ✗ FAIL — D5 should have FAILED (byte-identical frames, motion forced true) but did not. D5 has gone blind.');
        anyFailure = true;
    } else {
        console.log('  ✓ D5 correctly failed — byte-identical (zero-motion) content is still caught.');
    }

    console.log(`\n${anyFailure ? '💥 NEGATIVE CONTROL FAILED — D5 has gone blind, do not ship.' : '✅ NEGATIVE CONTROL PASSED — D5 still catches genuinely dead motion.'}`);
    process.exit(anyFailure ? 1 : 0);
}

main().catch(err => { console.error('💥 crashed:', err instanceof Error ? err.stack : err); process.exit(2); });
