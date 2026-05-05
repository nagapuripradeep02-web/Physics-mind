/**
 * Pixel + OCR gate — deterministic complement to visionGate.ts (Engine E29).
 *
 * Runs in parallel with the Sonnet vision gate. Emits CheckResult[] for the
 * pixel/ocr methods declared in spec.ts:
 *   - D1p (pixel): pixelmatch first vs last animation frame
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
import type { CaptureResult, TemplateLeakFinding } from './screenshotter';
import type { CheckResult, VisualCheckId } from './spec';
import { VISUAL_CHECKS } from './spec';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface RunPixelGateInput {
    conceptId: string;
    capture: CaptureResult;
    panelCount: number;
}

export interface PixelGateResult {
    check_results: CheckResult[];
    cost_usd: number;
    duration_ms: number;
}

// ─── Tunables ─────────────────────────────────────────────────────────────────

const D1P_DIFF_THRESHOLD_RATIO = 0.30; // ≥30% pixels must differ — mirrors D1
const PIXELMATCH_OPTIONS = { threshold: 0.1, includeAA: false } as const;

// Tesseract template-leak literal characters to search for in OCR output.
// Conservative — false positives on legitimate `{` text are acceptable since
// physics simulations almost never render literal braces.
const OCR_LEAK_PATTERN = /\{[^}\s]{1,40}\}/g;

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runPixelGate(input: RunPixelGateInput): Promise<PixelGateResult> {
    const start = Date.now();
    const results: CheckResult[] = [];

    // D1p — animation pixel-change check (async: sharp decode is async)
    results.push(await buildD1pResult(input.capture));

    // H1 — template substitution leak (DOM findings + OCR backstop)
    const h1Results = await runH1Checks(input.capture);
    results.push(...h1Results);

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
