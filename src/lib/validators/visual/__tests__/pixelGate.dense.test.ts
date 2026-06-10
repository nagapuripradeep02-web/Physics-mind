/**
 * D5/D6/D7 dense adjacent-frame motion checks — synthesized-frame tests.
 *
 * Frames are generated with sharp: a dark canvas with a small bright square
 * whose position (or absence of movement) produces the exact diff profiles
 * each check looks for.
 */
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { runPixelGate } from '../pixelGate';
import type { CaptureResult, DenseTimeseries } from '../screenshotter';

const W = 200;
const H = 120;
const SQUARE = 30;

/** Dark canvas with a bright square at (x, y). */
async function frameWithSquare(x: number, y: number, size = SQUARE): Promise<string> {
    const square = await sharp({
        create: { width: size, height: size, channels: 4, background: { r: 255, g: 180, b: 60, alpha: 1 } },
    }).png().toBuffer();
    const png = await sharp({
        create: { width: W, height: H, channels: 4, background: { r: 10, g: 10, b: 26, alpha: 1 } },
    })
        .composite([{ input: square, left: x, top: y }])
        .png()
        .toBuffer();
    return png.toString('base64');
}

function mkCapture(series: DenseTimeseries[]): CaptureResult {
    return {
        state_captures: [],
        timings: [],
        param_relay: { timed_out: true },
        dense_timeseries: series,
        template_leak_dom_findings: [],
        warnings: [],
    };
}

function mkSeries(stateId: string, frames: string[]): DenseTimeseries {
    return {
        state_id: stateId,
        frames_b64: frames,
        capture_times_ms: frames.map((_, i) => i * 1000),
    };
}

async function movingFrames(count: number, stepPx: number): Promise<string[]> {
    const frames: string[] = [];
    for (let i = 0; i < count; i++) {
        frames.push(await frameWithSquare(10 + i * stepPx, 40));
    }
    return frames;
}

describe('pixelGate dense checks (D5/D6/D7)', () => {
    it('D5 fails when motion is declared but all frames are identical', async () => {
        const still = await frameWithSquare(50, 40);
        const capture = mkCapture([mkSeries('STATE_1', [still, still, still, still, still])]);
        const result = await runPixelGate({
            conceptId: 'test', capture, panelCount: 1,
            expectsMotion: { STATE_1: true },
        });
        const d5 = result.check_results.find(r => r.check_id === 'D5' && r.state_id === 'STATE_1');
        expect(d5).toBeDefined();
        expect(d5!.passed).toBe(false);
        expect(d5!.evidence).toContain('declares motion');
    });

    it('D5 passes when motion is declared and frames move', async () => {
        const frames = await movingFrames(6, 12);
        const capture = mkCapture([mkSeries('STATE_1', frames)]);
        const result = await runPixelGate({
            conceptId: 'test', capture, panelCount: 1,
            expectsMotion: { STATE_1: true },
        });
        const d5 = result.check_results.find(r => r.check_id === 'D5');
        expect(d5!.passed).toBe(true);
    });

    it('D5 skips (passes) when motion expectation is unknown', async () => {
        const still = await frameWithSquare(50, 40);
        const capture = mkCapture([mkSeries('STATE_1', [still, still, still])]);
        const result = await runPixelGate({
            conceptId: 'test', capture, panelCount: 1,
            expectsMotion: {},
        });
        const d5 = result.check_results.find(r => r.check_id === 'D5');
        expect(d5!.passed).toBe(true);
        expect(d5!.evidence).toContain('Skipped');
    });

    it('D6 fails on a mid-state teleport spike', async () => {
        // Steady small steps of a LARGE body, then one giant jump. The body is
        // 80px so the teleport pair changes >20% of pixels (the D6 spike floor
        // exists so trivial small-element jumps don't false-fail real sims).
        const big = 80;
        const frames = [
            await frameWithSquare(10, 10, big),
            await frameWithSquare(14, 10, big),
            await frameWithSquare(18, 10, big),
            await frameWithSquare(110, 35, big),   // teleport across the canvas
            await frameWithSquare(114, 35, big),
            await frameWithSquare(118, 35, big),
        ];
        const capture = mkCapture([mkSeries('STATE_2', frames)]);
        const result = await runPixelGate({ conceptId: 'test', capture, panelCount: 1 });
        const d6 = result.check_results.find(r => r.check_id === 'D6' && r.state_id === 'STATE_2');
        expect(d6!.passed).toBe(false);
        expect(d6!.evidence).toContain('teleport');
    });

    it('D6 passes on smooth uniform motion', async () => {
        const frames = await movingFrames(6, 10);
        const capture = mkCapture([mkSeries('STATE_2', frames)]);
        const result = await runPixelGate({ conceptId: 'test', capture, panelCount: 1 });
        const d6 = result.check_results.find(r => r.check_id === 'D6');
        expect(d6!.passed).toBe(true);
    });

    it('D7 fails when motion freezes for the trailing frames', async () => {
        const frozen = await frameWithSquare(70, 40);
        const frames = [
            ...(await movingFrames(4, 15)),
            frozen, frozen, frozen, frozen,   // 3+ frozen trailing pairs
        ];
        const capture = mkCapture([mkSeries('STATE_3', frames)]);
        const result = await runPixelGate({ conceptId: 'test', capture, panelCount: 1 });
        const d7 = result.check_results.find(r => r.check_id === 'D7' && r.state_id === 'STATE_3');
        expect(d7!.passed).toBe(false);
        expect(d7!.evidence).toContain('died mid-state');
    });

    it('D7 passes when motion continues to the end', async () => {
        const frames = await movingFrames(8, 10);
        const capture = mkCapture([mkSeries('STATE_3', frames)]);
        const result = await runPixelGate({ conceptId: 'test', capture, panelCount: 1 });
        const d7 = result.check_results.find(r => r.check_id === 'D7');
        expect(d7!.passed).toBe(true);
    });

    it('all three skip-pass when the series has <3 frames', async () => {
        const still = await frameWithSquare(50, 40);
        const capture = mkCapture([mkSeries('STATE_4', [still, still])]);
        const result = await runPixelGate({
            conceptId: 'test', capture, panelCount: 1,
            expectsMotion: { STATE_4: true },
        });
        for (const id of ['D5', 'D6', 'D7']) {
            const r = result.check_results.find(c => c.check_id === id && c.state_id === 'STATE_4');
            expect(r!.passed).toBe(true);
            expect(r!.evidence).toContain('Skipped');
        }
    });

    it('emits no dense checks when no dense_timeseries was captured', async () => {
        const capture = mkCapture([]);
        capture.dense_timeseries = undefined;
        const result = await runPixelGate({ conceptId: 'test', capture, panelCount: 1 });
        expect(result.check_results.filter(r => ['D5', 'D6', 'D7'].includes(r.check_id))).toHaveLength(0);
    });
});
