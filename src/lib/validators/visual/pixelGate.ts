/**
 * Pixel + OCR gate — deterministic complement to visionGate.ts (Engine E29).
 *
 * Runs in parallel with the Sonnet vision gate. Emits CheckResult[] for the
 * pixel/ocr methods declared in spec.ts:
 *   - D1p (pixel): pixelmatch first vs last animation frame
 *   - D5/D6/D7 (pixel): adjacent dense-frame motion analysis per state —
 *                  no-motion / mid-state teleport / stuck-tail. Run only when
 *                  the capture carried dense_timeseries (visual:eyes, --dense).
 *   - H1  (ocr):   tesseract OCR backstop for {var} template leaks rendered
 *                  into canvas/SVG (DOM-scan path lives in screenshotter.ts)
 *
 * No LLM calls. cost_usd = 0. Designed to fail closed (skipped checks emit
 * passed=true with explicit "skipped" evidence rather than hanging the gate).
 */
import { Buffer } from 'node:buffer';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import { createWorker, type Worker } from 'tesseract.js';
import type { CaptureResult, ConsoleErrorFinding, DenseTimeseries, TemplateLeakFinding } from './screenshotter';
import type { CheckResult, VisualCheckId } from './spec';
import { VISUAL_CHECKS } from './spec';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface RunPixelGateInput {
    conceptId: string;
    capture: CaptureResult;
    panelCount: number;
    /**
     * Per-state declared-motion map (deriveMotionExpectations). D5 enforces
     * only on `true`; `false`/`undefined` → skip. Optional — without it the
     * dense checks still run D6/D7 (teleport/stuck-tail need no declaration).
     */
    expectsMotion?: Record<string, boolean | undefined>;
    /**
     * Per-state hold intent (deriveHoldExpectations). When a state DECLARES
     * 'reveal_hold' (one-shot timed reveal then holds) or 'interactive' (user-
     * driven explorer, static without a drag the headless harness never makes),
     * a frozen tail / near-identical first-last is EXPECTED — D7 + D1p are
     * relaxed to pass-with-note rather than false-failing. `undefined` → strict.
     * Optional; only declared intent relaxes (never guesses).
     */
    holdExpectations?: Record<string, 'reveal_hold' | 'interactive' | undefined>;
}

export interface PixelGateResult {
    check_results: CheckResult[];
    cost_usd: number;
    duration_ms: number;
}

// ─── Tunables ─────────────────────────────────────────────────────────────────

const D1P_DIFF_THRESHOLD_RATIO = 0.30; // ≥30% pixels must differ — mirrors D1
const PIXELMATCH_OPTIONS = { threshold: 0.1, includeAA: false } as const;

// Dense adjacent-frame motion analysis (D5/D6/D7)
// Calibrated on magnetic_force_moving_charge (field_3d, 2026-06-10 first real
// run): a truly frozen canvas diffs ~0.00–0.05%/s; a small orbiting particle
// on a mostly-static 3D scene diffs 0.23–0.61%/s. 0.1% separates the two
// cleanly. (The original 0.5% guess false-failed every small-particle state.)
const DENSE_MOTION_EPSILON = 0.001;       // <0.1% adjacent diff = "frozen" pair
const DENSE_TELEPORT_ABS_RATIO = 0.20;    // spike floor: 20% of pixels
const DENSE_TELEPORT_MEDIAN_FACTOR = 8;   // spike: >8x the median pair diff
const DENSE_TELEPORT_MIN_MEDIAN = 0.001;  // median must be real motion, not noise
const DENSE_STUCK_TAIL_PAIRS = 3;         // MIN trailing frozen pairs = stuck tail
// D7 tail window scales with series length: max(3, 10% of pairs). With the
// 30s/31-frame unclamp (2026-06-10) a fixed 3-pair window would be 3s of a 30s
// state — too small to distinguish a real late freeze from capture-latency
// wobble. ≤30 pairs keeps the original window of 3 (backward compatible).
function denseTailPairs(pairCount: number): number {
    return Math.max(DENSE_STUCK_TAIL_PAIRS, Math.ceil(pairCount * 0.1));
}

// Tesseract template-leak literal characters to search for in OCR output.
// Conservative — false positives on legitimate `{` text are acceptable since
// physics simulations almost never render literal braces.
const OCR_LEAK_PATTERN = /\{[^}\s]{1,40}\}/g;

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runPixelGate(input: RunPixelGateInput): Promise<PixelGateResult> {
    const start = Date.now();
    const results: CheckResult[] = [];

    // D1p — animation pixel-change check (async: sharp decode is async)
    let d1p = await buildD1pResult(input.capture);

    // D5/D6/D7 — adjacent dense-frame motion analysis (only when dense capture ran)
    const denseMaxDiffByState = new Map<string, number>();
    for (const series of input.capture.dense_timeseries ?? []) {
        const dense = await runDenseChecks(
            series,
            input.expectsMotion?.[series.state_id],
            input.holdExpectations?.[series.state_id],
        );
        results.push(...dense.results);
        if (dense.maxDiff !== undefined) denseMaxDiffByState.set(series.state_id, dense.maxDiff);
    }

    // Cyclic-path correction (calibrated 2026-06-10 on magnetic_force_moving_charge):
    // D1p compares FIRST vs LAST frame, so a periodic orbit that returns to phase
    // false-fails as "static". When the dense series for the same state proves
    // motion (max adjacent diff ≥ epsilon), the dense evidence is strictly better
    // — D1p's purpose is catching static images, and this image demonstrably moves.
    const d1pStateId = input.capture.animation_timeseries?.state_id;
    if (!d1p.passed && d1pStateId !== undefined) {
        const denseMax = denseMaxDiffByState.get(d1pStateId);
        if (denseMax !== undefined && denseMax >= DENSE_MOTION_EPSILON) {
            d1p = mkResult('D1p', d1p.state_id, true,
                `OK — first/last frames similar (cyclic path returning to phase), but dense adjacent frames prove motion: max ${(denseMax * 100).toFixed(2)}%/s ≥ ${(DENSE_MOTION_EPSILON * 100).toFixed(1)}%.`);
        }
    }
    // Hold-intent relaxation: a state that DECLARES reveal-then-hold or interactive
    // is static by design once its reveal completes (or until a drag the headless
    // harness never makes) — D1's static-image check doesn't apply. Only declared
    // intent relaxes; unknown states stay strict.
    if (!d1p.passed && d1pStateId !== undefined) {
        const hold = input.holdExpectations?.[d1pStateId];
        if (hold === 'reveal_hold' || hold === 'interactive') {
            d1p = mkResult('D1p', d1p.state_id, true,
                `OK (relaxed) — first/last frames similar, but state declares ${hold} `
                + `(${hold === 'reveal_hold' ? 'one-shot reveal then holds' : 'user-driven explorer, static without a drag'}) — `
                + `D1's static-image check does not apply.`);
        }
    }
    results.unshift(d1p);

    // H1 — template substitution leak (DOM findings + OCR backstop)
    const h1Results = await runH1Checks(input.capture);
    results.push(...h1Results);

    // H3 — render console errors (collected by screenshotter's page listeners)
    results.push(...runConsoleChecks(input.capture));

    return {
        check_results: results,
        cost_usd: 0,
        duration_ms: Date.now() - start,
    };
}

// ─── D1p — animation pixel diff ───────────────────────────────────────────────

async function buildD1pResult(capture: CaptureResult): Promise<CheckResult> {
    const ats = capture.animation_timeseries;

    if (!ats || ats.frames_b64.length < 2) {
        return mkResult('D1p', 'TIMESERIES', true,
            'Skipped — animation_timeseries unavailable or has <2 frames.');
    }

    const firstB64 = ats.frames_b64[0];
    const lastB64 = ats.frames_b64[ats.frames_b64.length - 1];
    if (!firstB64 || !lastB64) {
        return mkResult('D1p', `TIMESERIES@${ats.state_id}`, true,
            'Skipped — first or last frame missing.');
    }

    return await runD1pDiff(firstB64, lastB64, ats.state_id, ats.capture_times_ms);
}

async function runD1pDiff(
    firstB64: string,
    lastB64: string,
    stateId: string,
    captureTimesMs: number[],
): Promise<CheckResult> {
    try {
        const [a, b] = await Promise.all([decodeRgba(firstB64), decodeRgba(lastB64)]);
        if (a.width !== b.width || a.height !== b.height) {
            return mkResult('D1p', `TIMESERIES@${stateId}`, true,
                `Skipped — frame dimensions differ (${a.width}x${a.height} vs ${b.width}x${b.height}).`);
        }
        const totalPx = a.width * a.height;
        // pixelmatch's `output` arg is `Uint8Array | Uint8ClampedArray | void`.
        // Pass undefined to skip the diff-image output buffer (we only need the count).
        const diffPx = pixelmatch(a.data, b.data, undefined, a.width, a.height, PIXELMATCH_OPTIONS);
        const ratio = diffPx / totalPx;
        const passed = ratio >= D1P_DIFF_THRESHOLD_RATIO;
        const t0 = captureTimesMs[0] ?? 0;
        const tN = captureTimesMs[captureTimesMs.length - 1] ?? 0;
        const evidence = passed
            ? `OK — ${(ratio * 100).toFixed(1)}% pixels differ between t=${t0}ms and t=${tN}ms (≥30% required).`
            : `Static-image regression: only ${(ratio * 100).toFixed(1)}% pixels differ between t=${t0}ms and t=${tN}ms (need ≥30%). Animation may be frozen or rendering a still frame.`;
        return mkResult('D1p', `TIMESERIES@${stateId}`, passed, evidence);
    } catch (err) {
        return mkResult('D1p', `TIMESERIES@${stateId}`, true,
            `Skipped — pixel decode failed: ${err instanceof Error ? err.message : String(err)}`);
    }
}

// ─── D5/D6/D7 — adjacent dense-frame motion analysis ──────────────────────────

/**
 * Compute adjacent-pair pixel-diff ratios for one state's dense series, then
 * evaluate the three motion checks against the diff profile:
 *   D5 no-motion:   expectsMotion=true but max(diffs) < epsilon
 *   D6 teleport:    one pair spikes way above the median (mid-state jump)
 *   D7 stuck tail:  trailing frozen pairs after earlier motion (animation died)
 */
async function runDenseChecks(
    series: DenseTimeseries,
    expectsMotion: boolean | undefined,
    holdExpectation: 'reveal_hold' | 'interactive' | undefined,
): Promise<{ results: CheckResult[]; maxDiff?: number }> {
    const stateId = series.state_id;
    if (series.frames_b64.length < 3) {
        return {
            results: (['D5', 'D6', 'D7'] as const).map(id =>
                mkResult(id, stateId, true, `Skipped — dense series has ${series.frames_b64.length} frames (<3).`)),
        };
    }

    let diffs: number[];
    try {
        diffs = await adjacentDiffRatios(series.frames_b64);
    } catch (err) {
        const why = `Skipped — dense frame decode failed: ${err instanceof Error ? err.message : String(err)}`;
        return { results: (['D5', 'D6', 'D7'] as const).map(id => mkResult(id, stateId, true, why)) };
    }

    const times = series.capture_times_ms;
    const pairLabel = (i: number): string => `t=${times[i] ?? '?'}ms→t=${times[i + 1] ?? '?'}ms`;
    const maxDiff = Math.max(...diffs);
    const med = median(diffs);
    const profile = diffs.map((d, i) => `${pairLabel(i)}: ${(d * 100).toFixed(2)}%`).join(' | ');
    const results: CheckResult[] = [];

    // D5 — declared motion must be visible
    if (expectsMotion === true) {
        const passed = maxDiff >= DENSE_MOTION_EPSILON;
        results.push(mkResult('D5', stateId, passed, passed
            ? `OK — motion visible: max adjacent diff ${(maxDiff * 100).toFixed(2)}% (≥${(DENSE_MOTION_EPSILON * 100).toFixed(1)}% required). Profile: ${profile}`
            : `State declares motion but pixels never move: max adjacent diff ${(maxDiff * 100).toFixed(2)}% (<${(DENSE_MOTION_EPSILON * 100).toFixed(1)}%) across ${diffs.length} pairs. The animation loop is not driving the declared trajectory. Profile: ${profile}`));
    } else {
        results.push(mkResult('D5', stateId, true,
            `Skipped — motion expectation ${expectsMotion === false ? 'declared static' : 'unknown'} for ${stateId}.`));
    }

    // D6 — no mid-state pixel teleport
    const teleportThreshold = Math.max(DENSE_TELEPORT_ABS_RATIO, DENSE_TELEPORT_MEDIAN_FACTOR * med);
    const spikeIdx = med > DENSE_TELEPORT_MIN_MEDIAN
        ? diffs.findIndex(d => d > teleportThreshold)
        : -1;
    results.push(mkResult('D6', stateId, spikeIdx === -1, spikeIdx === -1
        ? `OK — no adjacent pair exceeds max(20%, 8×median=${(DENSE_TELEPORT_MEDIAN_FACTOR * med * 100).toFixed(2)}%). Profile: ${profile}`
        : `Mid-state pixel teleport at ${pairLabel(spikeIdx)}: ${(diffs[spikeIdx] * 100).toFixed(1)}% of pixels changed in one ~1s step (median pair diff ${(med * 100).toFixed(2)}%). Something jumped/reset mid-state. Profile: ${profile}`));

    // D7 — no stuck tail after earlier motion (window scales with series length)
    const tailPairs = denseTailPairs(diffs.length);
    const tail = diffs.slice(-tailPairs);
    const earlier = diffs.slice(0, -tailPairs);
    const tailFrozen = tail.length >= tailPairs && tail.every(d => d < DENSE_MOTION_EPSILON);
    const earlierMoved = earlier.some(d => d >= DENSE_MOTION_EPSILON);
    const stuck = tailFrozen && earlierMoved;
    if (stuck && (holdExpectation === 'reveal_hold' || holdExpectation === 'interactive')) {
        // Declared reveal-then-hold / interactive: a frozen tail after the early
        // reveal motion is EXPECTED, not a dead render loop. Relax to pass.
        results.push(mkResult('D7', stateId, true,
            `OK (relaxed) — frozen tail is expected: ${stateId} declares ${holdExpectation} `
            + `(${holdExpectation === 'reveal_hold' ? 'one-shot reveal then holds still' : 'user-driven explorer, static without a drag'}). `
            + `Last ${tailPairs} pairs <${(DENSE_MOTION_EPSILON * 100).toFixed(1)}% after earlier motion (max ${(Math.max(...earlier) * 100).toFixed(2)}%). Profile: ${profile}`));
    } else {
        results.push(mkResult('D7', stateId, !stuck, !stuck
            ? `OK — no frozen tail (last ${tail.length} pairs not all <${(DENSE_MOTION_EPSILON * 100).toFixed(1)}% after earlier motion). Profile: ${profile}`
            : `Animation died mid-state: last ${tailPairs} adjacent pairs all <${(DENSE_MOTION_EPSILON * 100).toFixed(1)}% diff while earlier pairs showed motion (max ${(Math.max(...earlier) * 100).toFixed(2)}%). Likely a render-loop exception or trajectory time-clamp. Profile: ${profile}`));
    }

    return { results, maxDiff };
}

/** Decode the series once, then pixelmatch each adjacent pair. */
async function adjacentDiffRatios(framesB64: string[]): Promise<number[]> {
    const decoded = await Promise.all(framesB64.map(decodeRgba));
    const diffs: number[] = [];
    for (let i = 0; i < decoded.length - 1; i++) {
        const a = decoded[i];
        const b = decoded[i + 1];
        if (a.width !== b.width || a.height !== b.height) {
            // Dimension drift mid-series — treat as identical (skip-friendly).
            diffs.push(0);
            continue;
        }
        const diffPx = pixelmatch(a.data, b.data, undefined, a.width, a.height, PIXELMATCH_OPTIONS);
        diffs.push(diffPx / (a.width * a.height));
    }
    return diffs;
}

function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((x, y) => x - y);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// ─── H1 — template leak (DOM findings + OCR backstop) ─────────────────────────

async function runH1Checks(capture: CaptureResult): Promise<CheckResult[]> {
    const results: CheckResult[] = [];
    const findingsByState = groupFindingsByState(capture.template_leak_dom_findings);

    // Decide which states to OCR-scan: skip states where DOM scan already flagged a leak.
    const ocrTargets = capture.state_captures.filter(sc => !findingsByState.has(sc.state_id));

    // OCR backstop runs ONLY when the DOM scan was clean. Since OCR is the slow path
    // (~3-5s per state), this short-circuit is the main perf win.
    let ocrFindingsByState = new Map<string, string[]>();
    if (ocrTargets.length > 0) {
        ocrFindingsByState = await runOcrBackstop(ocrTargets);
    }

    // Emit one H1 result per state captured.
    for (const sc of capture.state_captures) {
        const domHits = findingsByState.get(sc.state_id) ?? [];
        const ocrHits = ocrFindingsByState.get(sc.state_id) ?? [];
        const allHits = [...domHits, ...ocrHits];
        if (allHits.length === 0) {
            results.push(mkResult('H1', sc.state_id, true,
                'OK — no {var} or {expr.toFixed(N)} placeholders found via DOM scan or OCR backstop.'));
        } else {
            const sample = allHits.slice(0, 5).map(quoteShort).join(', ');
            const source = domHits.length > 0 ? 'DOM scan' : 'OCR backstop';
            results.push(mkResult('H1', sc.state_id, false,
                `Template leak detected by ${source}: ${sample}${allHits.length > 5 ? ` (+${allHits.length - 5} more)` : ''}. The PCPL renderer rendered an unsubstituted placeholder — fix the value/expr binding upstream.`));
        }
    }

    return results;
}

// ─── H3 — render console errors ───────────────────────────────────────────────

/**
 * One H3 CheckResult per capture-context that emitted console.error output or
 * an uncaught exception ('(load)' + each affected state), plus a single passing
 * summary row when the whole capture was clean. Deterministic and $0 — a render
 * crash or dead-slider throw fails THE EYE even when the pixels look plausible.
 */
function runConsoleChecks(capture: CaptureResult): CheckResult[] {
    const errors = capture.console_errors ?? [];
    if (errors.length === 0) {
        return [mkResult('H3', 'ALL_STATES', true,
            'OK — zero console.error output and zero uncaught exceptions during capture.')];
    }
    const byState = new Map<string, ConsoleErrorFinding[]>();
    for (const e of errors) {
        const arr = byState.get(e.state_id) ?? [];
        arr.push(e);
        byState.set(e.state_id, arr);
    }
    const results: CheckResult[] = [];
    for (const [stateId, hits] of byState) {
        const sample = hits.slice(0, 3)
            .map(h => `[${h.kind}] ${h.text.length > 200 ? h.text.slice(0, 200) + '…' : h.text}`)
            .join(' | ');
        results.push(mkResult('H3', stateId, false,
            `${hits.length} console error(s) during capture: ${sample}${hits.length > 3 ? ` (+${hits.length - 3} more)` : ''}. A rendering exception fired even if pixels look plausible — fix the throw, not the symptom.`));
    }
    return results;
}

function groupFindingsByState(findings: TemplateLeakFinding[]): Map<string, string[]> {
    const out = new Map<string, string[]>();
    for (const f of findings) {
        const arr = out.get(f.state_id) ?? [];
        arr.push(f.sample_text);
        out.set(f.state_id, arr);
    }
    return out;
}

async function runOcrBackstop(
    stateCaptures: CaptureResult['state_captures'],
): Promise<Map<string, string[]>> {
    const findings = new Map<string, string[]>();
    let worker: Worker | null = null;
    try {
        worker = await createWorker('eng');
        for (const sc of stateCaptures) {
            const sourceB64 = sc.combined_png_b64 ?? sc.panel_a_png_b64;
            if (!sourceB64) continue;
            try {
                const upscaled = await upscaleForOcr(sourceB64);
                const { data } = await worker.recognize(upscaled);
                const text = data.text ?? '';
                const matches = text.match(OCR_LEAK_PATTERN);
                if (matches && matches.length > 0) findings.set(sc.state_id, matches);
            } catch (err) {
                // Non-fatal — this state just won't have OCR-backed H1 evidence.
                console.warn(`[pixelGate] OCR failed for ${sc.state_id}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
    } catch (err) {
        console.warn(`[pixelGate] tesseract worker init failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        if (worker) {
            try { await worker.terminate(); } catch { /* worker already dead */ }
        }
    }
    return findings;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface RgbaImage {
    data: Uint8Array;
    width: number;
    height: number;
}

async function decodeRgba(b64: string): Promise<RgbaImage> {
    const buf = Buffer.from(b64, 'base64');
    const { data, info } = await sharp(buf)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    return {
        data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        width: info.width,
        height: info.height,
    };
}

async function upscaleForOcr(b64: string): Promise<Buffer> {
    const buf = Buffer.from(b64, 'base64');
    return await sharp(buf).resize({ width: 2560, withoutEnlargement: false }).png().toBuffer();
}

function mkResult(
    id: VisualCheckId,
    stateId: string,
    passed: boolean,
    evidence: string,
): CheckResult {
    const spec = VISUAL_CHECKS[id];
    return {
        check_id: id,
        category: spec.category,
        state_id: stateId,
        passed,
        evidence,
        bug_class: spec.bugClass,
    };
}

function quoteShort(s: string): string {
    const max = 60;
    return s.length > max ? `"${s.slice(0, max)}…"` : `"${s}"`;
}
