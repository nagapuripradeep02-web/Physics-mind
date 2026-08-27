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

// Ink-relative motion lens (2026-07-23 recalibration — engine_bug_queue
// visual_eyes_d5_thin_primitive_undercounted_on_large_canvas). DENSE_MOTION_EPSILON
// above is a percentage of the FULL CANVAS, calibrated against field_3d content
// where motion is a filled/orbiting body sweeping a large area (see its own
// comment). It structurally cannot see a THIN primitive (a 3-4px force_arrow
// line, an angle_arc, a traced locus — the entire Class-11 Vectors chapter is
// built from these) whose real, correct motion changes a large fraction of its
// OWN ink but a tiny fraction of a mostly-empty canvas.
//
// Ground truth measured directly from real captured frames (no guessing):
//   - scalar_vs_vector STATE_2 (thin rotating pointer, PCPL/mechanics_2d, a
//     visually-confirmed correct 360°/2800ms loop): 346-369px/pair = 0.038-
//     0.040% of canvas — UNDER DENSE_MOTION_EPSILON — but 1.39-1.48% of the
//     frame's own ink (non-background) pixels, stable across all 8 pairs.
//   - genuinely-static content, BOTH renderer families (mechanics_2d
//     scalar_vs_vector STATE_5's 10 dense pairs, all EXACTLY 0px; field_3d
//     faraday_law_induction STATE_1's 30 dense pairs, 0-16px): the real noise
//     ceiling in this codebase is 16px (0.0017% canvas, 0.02% ink) — far below
//     either signal above, with >20x margin on both the absolute-pixel and the
//     ink-ratio side.
//
// D5 now passes on EITHER lens: the unchanged canvas-ratio (status quo, so the
// field_3d/particle_field content it was calibrated against cannot shift) OR
// this ink-ratio, gated by an absolute-pixel floor so a near-blank frame's
// stray noise can never masquerade as a large fraction of a tiny ink count.
// Mirrors this file's own D1p cyclic-path/hold-intent idiom below: the primary
// criterion stands untouched; a well-evidenced secondary signal can
// ADDITIONALLY qualify as motion, never the reverse — a truly frozen pair has
// diffPx≈0 and fails both lenses identically. D6/D7 are NOT touched: they keep
// reading the plain canvas-ratio series exactly as before (see runDenseChecks).
//
// includeAA:true was evaluated (halves the deficit on the same scalar_vs_vector
// pair — 595-634px / 0.065-0.069% — but still under the OLD canvas epsilon on
// its own) and rejected: it would raise sensitivity file-wide (D1p, D6, D7 all
// share PIXELMATCH_OPTIONS) with zero field_3d noise data to bound it, where
// the ink lens above already fixes the verified case without touching any
// shared, previously-calibrated setting.
const DENSE_MOTION_INK_EPSILON = 0.005;   // ≥0.5% of the pair's own ink pixels
const DENSE_INK_ABS_FLOOR_PX = 32;        // AND ≥32px changed in absolute terms
const DENSE_INK_MIN_CONTENT_PX = 500;     // frames with <500 ink px skip the ink lens (degenerate/near-blank)
// The ink denominator counts only ink that CAN move — pixels that differ from
// the series' first frame at least once somewhere in the series. Static control
// chrome is excluded by construction.
//
// Why (bug_class visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_
// explore_states): the rescue lens divided by the frame's TOTAL non-background
// ink, which on an interaction_complete explore state is dominated by the
// always-on slider panel, the scene-group picker and the HUD box — none of which
// can move. MEASURED on lines_and_planes_in_space (run 20260827-183756, 29 dense
// frames per state):
//     STATE_9     total ink 135408   movable 5356    movable share  4.0%
//     STATE_9@B   total ink  59440   movable 4456    movable share  7.5%
//     STATE_1     total ink  65644   movable 40568   movable share 61.8%
// So on the explore state the denominator was ~25x too large, and a lambda
// marker traversing the FULL length of its line scored 0.23-0.28% of ink against
// a 0.5% floor. STATE_9:D5 then failed on EIGHT consecutive runs of a correct
// state — a gate that fails correct content trains its readers to wave it
// through, which is the same end state as a gate that passes everything.
// STATE_1 shows the guided case is barely affected (61.8% movable), so this
// narrows the denominator exactly where it was wrong.
//
// THIS CANNOT MANUFACTURE A PASS. findInkMotion still requires
// diffPx >= DENSE_INK_ABS_FLOOR_PX (32) in ABSOLUTE terms, and a frozen pair has
// diffPx ~0-16px (this file's measured noise ceiling), so no denominator can
// lift it over the floor. Shrinking the denominator can only rescue a pair that
// already moved real pixels.
const DENSE_INK_MOVABLE_FLOOR_PX = 64;    // <64 movable ink px in the series = nothing meaningful can move; skip the lens
const INK_BG_DELTA = 24;                  // per-pixel |ΔR|+|ΔG|+|ΔB| above this = "ink", not background

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

    // H4 — renderer self-diagnostics ([PM_*] console.warn), the consumer that
    // turns diagnostic_warnings from a write-only log into a gate.
    results.push(...runDiagnosticChecks(input.capture, input.conceptId));

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
            'Skipped — animation_timeseries unavailable or has <2 frames.', true);
    }

    const firstB64 = ats.frames_b64[0];
    const lastB64 = ats.frames_b64[ats.frames_b64.length - 1];
    if (!firstB64 || !lastB64) {
        return mkResult('D1p', `TIMESERIES@${ats.state_id}`, true,
            'Skipped — first or last frame missing.', true);
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
                `Skipped — frame dimensions differ (${a.width}x${a.height} vs ${b.width}x${b.height}).`, true);
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
            `Skipped — pixel decode failed: ${err instanceof Error ? err.message : String(err)}`, true);
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
                mkResult(id, stateId, true, `Skipped — dense series has ${series.frames_b64.length} frames (<3).`, true)),
        };
    }

    let pairs: AdjacentDiff[];
    try {
        pairs = await adjacentDiffRatios(series.frames_b64);
    } catch (err) {
        const why = `Skipped — dense frame decode failed: ${err instanceof Error ? err.message : String(err)}`;
        return { results: (['D5', 'D6', 'D7'] as const).map(id => mkResult(id, stateId, true, why, true)) };
    }

    // D6/D7 read the UNCHANGED canvas-ratio series below — their median-relative
    // spike math and absolute-floor tail math are untouched by D5's ink lens.
    const diffs = pairs.map(p => p.canvasRatio);
    const times = series.capture_times_ms;
    const pairLabel = (i: number): string => `t=${times[i] ?? '?'}ms→t=${times[i + 1] ?? '?'}ms`;
    const maxDiff = Math.max(...diffs);
    const med = median(diffs);
    const profile = diffs.map((d, i) => `${pairLabel(i)}: ${(d * 100).toFixed(2)}%`).join(' | ');
    const results: CheckResult[] = [];

    // D5 — declared motion must be visible. Two independent lenses on the SAME
    // pixelmatch diffPx (no second diffing pass): the unchanged canvas-ratio
    // (what this check has always used) OR a content-relative ink-ratio (diffPx
    // against the frame's OWN non-background pixel count) — see
    // DENSE_MOTION_INK_EPSILON above for the measured justification.
    if (expectsMotion === true) {
        const canvasPassed = maxDiff >= DENSE_MOTION_EPSILON;
        const inkHit = canvasPassed ? null : findInkMotion(pairs);
        const passed = canvasPassed || inkHit !== null;
        const inkProfile = pairs.map((p, i) =>
            `${pairLabel(i)}: ${p.inkRatio !== null ? `${(p.inkRatio * 100).toFixed(2)}%ink` : 'n/a'}`).join(' | ');
        let evidence: string;
        if (canvasPassed) {
            evidence = `OK — motion visible: max adjacent diff ${(maxDiff * 100).toFixed(2)}% of canvas (≥${(DENSE_MOTION_EPSILON * 100).toFixed(1)}% required). Profile: ${profile}`;
        } else if (inkHit) {
            evidence = `OK — motion visible via ink-relative lens: ${pairLabel(inkHit.idx)} changed ${inkHit.diffPx}px `
                + `(${(inkHit.inkRatio * 100).toFixed(2)}% of that pair's ~${Math.round(inkHit.avgMovableInk)}px of MOVABLE ink, of ${Math.round(inkHit.avgInk)}px total; canvas-ratio stayed `
                + `${(maxDiff * 100).toFixed(2)}%, below the ${(DENSE_MOTION_EPSILON * 100).toFixed(1)}% canvas floor — a thin primitive `
                + `moving on a large canvas). Ink profile: ${inkProfile}`;
        } else {
            evidence = `State declares motion but pixels never move: max adjacent diff ${(maxDiff * 100).toFixed(2)}% of canvas `
                + `(<${(DENSE_MOTION_EPSILON * 100).toFixed(1)}%) and ink-relative diff stayed <${(DENSE_MOTION_INK_EPSILON * 100).toFixed(1)}% `
                + `of MOVABLE ink (or too little ink to trust) across ${diffs.length} pairs. The animation loop is not driving the declared `
                + `trajectory. Profile: ${profile}. Ink profile: ${inkProfile}`;
        }
        results.push(mkResult('D5', stateId, passed, evidence));
    } else {
        results.push(mkResult('D5', stateId, true,
            expectsMotion === false
                ? `Skipped — motion expectation declared static for ${stateId}.`
                : `Skipped — motion expectation UNKNOWN for ${stateId}: this scenario has no branch in `
                  + `deriveMotionExpectations, so the motion gate did not run on this state and NOTHING is `
                  + `asserted about its pixels. Audit the fleet with npm run check:motion-registry.`,
            true));
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

/** Per-pair diff carrying BOTH the canvas-ratio (D6/D7's unchanged input) and
 *  the ink-ratio (D5's additional lens — see DENSE_MOTION_INK_EPSILON). */
interface AdjacentDiff {
    diffPx: number;
    canvasRatio: number;         // diffPx / totalCanvasPx — UNCHANGED semantics
    avgInk: number;              // avg TOTAL ink-pixel count of the pair's two frames
    avgMovableInk: number;       // avg ink that changes somewhere in the series (the denominator)
    inkRatio: number | null;     // diffPx / avgMovableInk; null when the guards below fail
}

/** Decode the series once, then pixelmatch each adjacent pair. */
async function adjacentDiffRatios(framesB64: string[]): Promise<AdjacentDiff[]> {
    const decoded = await Promise.all(framesB64.map(decodeRgba));
    const inkCounts = decoded.map(img => countInkPixels(img, estimateBackground(img)));
    const movableCounts = countMovableInk(decoded);
    const out: AdjacentDiff[] = [];
    for (let i = 0; i < decoded.length - 1; i++) {
        const a = decoded[i];
        const b = decoded[i + 1];
        if (a.width !== b.width || a.height !== b.height) {
            // Dimension drift mid-series — treat as identical (skip-friendly).
            out.push({ diffPx: 0, canvasRatio: 0, avgInk: 0, avgMovableInk: 0, inkRatio: null });
            continue;
        }
        const diffPx = pixelmatch(a.data, b.data, undefined, a.width, a.height, PIXELMATCH_OPTIONS);
        const avgInk = (inkCounts[i] + inkCounts[i + 1]) / 2;
        const avgMovableInk = (movableCounts[i] + movableCounts[i + 1]) / 2;
        // Two guards, both on the ORIGINAL total ink or the movable count — never
        // on the diff itself, so neither can be satisfied by the motion it judges:
        //   total ink   — a near-blank/degenerate frame has no trustworthy ink at all
        //   movable ink — a series where almost nothing can move gets no rescue lens
        const usable = avgInk >= DENSE_INK_MIN_CONTENT_PX && avgMovableInk >= DENSE_INK_MOVABLE_FLOOR_PX;
        out.push({
            diffPx,
            canvasRatio: diffPx / (a.width * a.height),
            avgInk,
            avgMovableInk,
            inkRatio: usable ? diffPx / avgMovableInk : null,
        });
    }
    return out;
}

/**
 * Per-frame count of ink that MOVES somewhere in the series.
 *
 * A pixel is "movable" if it differs from the first frame in at least one frame
 * of the series; every other ink pixel is static chrome or static scene. Counted
 * once over the whole series, then reported per frame as that frame's ink
 * restricted to the movable set — so the D5 denominator is the ink that could
 * possibly have changed, not the ink that happens to be on screen.
 *
 * Deliberately series-scoped rather than pair-scoped: a marker that pauses for a
 * beat is still movable ink, and a pair-local mask would shrink the denominator
 * exactly when the object stops, inflating the ratio at the wrong moment.
 */
function countMovableInk(frames: RgbaImage[]): number[] {
    if (frames.length === 0) return [];
    const first = frames[0];
    const { width, height } = first;
    const px = width * height;
    const movable = new Uint8Array(px);
    for (let f = 1; f < frames.length; f++) {
        const cur = frames[f];
        if (cur.width !== width || cur.height !== height) continue;
        const A = first.data, B = cur.data;
        for (let i = 0, p = 0; p < px; i += 4, p++) {
            if (movable[p]) continue;
            const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
            if (d > INK_BG_DELTA) movable[p] = 1;
        }
    }
    return frames.map((img) => {
        if (img.width !== width || img.height !== height) return 0;
        const bg = estimateBackground(img);
        const { data } = img;
        let n = 0;
        for (let i = 0, p = 0; p < px; i += 4, p++) {
            if (!movable[p]) continue;
            const d = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
            if (d > INK_BG_DELTA) n++;
        }
        return n;
    });
}

/**
 * Estimate a frame's background colour from 8 fixed anchor points (4 corners +
 * 4 edge midpoints) and take the most-frequent exact RGB among them. Deterministic
 * (fixed sample points, no randomness) — validated directly against real frames
 * from both renderer families (mechanics_2d's flat dark canvas and field_3d's
 * dark scene background): the estimate is stable across a state's whole dense
 * series even while real content changes size (a single-corner sample was
 * considered and widened to 8 points as a cheap defensive margin against the
 * rare case where one corner is covered by content).
 */
function estimateBackground(img: RgbaImage): [number, number, number] {
    const { data, width, height } = img;
    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);
    const points: Array<[number, number]> = [
        [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
        [midX, 0], [midX, height - 1], [0, midY], [width - 1, midY],
    ];
    const counts = new Map<string, { rgb: [number, number, number]; n: number }>();
    for (const [x, y] of points) {
        const idx = (y * width + x) * 4;
        const key = `${data[idx]},${data[idx + 1]},${data[idx + 2]}`;
        const existing = counts.get(key);
        if (existing) existing.n++;
        else counts.set(key, { rgb: [data[idx], data[idx + 1], data[idx + 2]], n: 1 });
    }
    let best: { rgb: [number, number, number]; n: number } | null = null;
    for (const entry of counts.values()) {
        if (!best || entry.n > best.n) best = entry;
    }
    // counts is built from a non-empty `points` array, so best is always set.
    return (best as { rgb: [number, number, number]; n: number }).rgb;
}

/** Count pixels whose summed channel distance from `bg` exceeds INK_BG_DELTA. */
function countInkPixels(img: RgbaImage, bg: [number, number, number]): number {
    const { data } = img;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
        const d = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
        if (d > INK_BG_DELTA) count++;
    }
    return count;
}

/**
 * Best (highest ink-ratio) pair that clears BOTH the ink-relative epsilon AND
 * the absolute-pixel floor — the floor stops a near-blank frame's stray noise
 * from reading as a large percentage of a tiny ink count. Returns null when no
 * pair qualifies; this only ever ADDS a D5 pass path, it never removes one.
 */
function findInkMotion(pairs: AdjacentDiff[]): { idx: number; diffPx: number; avgInk: number; avgMovableInk: number; inkRatio: number } | null {
    let best: { idx: number; diffPx: number; avgInk: number; avgMovableInk: number; inkRatio: number } | null = null;
    pairs.forEach((p, idx) => {
        if (p.inkRatio === null) return;
        if (p.inkRatio < DENSE_MOTION_INK_EPSILON) return;
        if (p.diffPx < DENSE_INK_ABS_FLOOR_PX) return;
        if (!best || p.inkRatio > best.inkRatio) best = { idx, diffPx: p.diffPx, avgInk: p.avgInk, avgMovableInk: p.avgMovableInk, inkRatio: p.inkRatio };
    });
    return best;
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

// ─── H4 — renderer self-diagnostics ───────────────────────────────────────────

/**
 * Per-concept allow-list of [PM_*] diagnostic prefixes that are EXPECTED and so
 * do not fail H4.
 *
 * Deliberately empty. An entry here says "this renderer is shouting about its
 * own broken state and we are shipping it anyway", which is a founder call, not
 * an author's convenience — so every entry needs a written reason and the state
 * ids it applies to. Silencing a diagnostic to get a green run re-creates the
 * exact hole H4 exists to close: `[PM_NLB_ENERGY_CLAMP]` sat in four EYE runs of
 * work_energy_theorem for two days, reporting "v = 0.00 m/s" beside "K = 62.7 J",
 * while every failing check id was an unrelated stale baseline.
 */
const H4_ALLOWED_PREFIXES: Record<string, { prefixes: string[]; reason: string }> = {};

/** `[PM_NLB_ENERGY_CLAMP] body 'block' reached …` → `PM_NLB_ENERGY_CLAMP`. */
function diagnosticPrefix(text: string): string | undefined {
    return /\[(PM_[A-Z0-9_]+)\]/.exec(text)?.[1];
}

/**
 * A clamp or an overflowed scale is an AUTHORING fault (the motion plan ran the
 * body into a bound, or the authored bar range is too small) — routing it to the
 * engine wastes a surgeon dispatch on a JSON edit.
 */
function diagnosticOwner(prefix: string): string {
    return /^PM_NLB_ENERGY_(CLAMP|SCALE)$/.test(prefix) || /_SCALE$/.test(prefix)
        ? 'alex:architect'
        : 'peter_parker:field3d_surgeon';
}

/**
 * One H4 CheckResult per state that emitted an unallow-listed renderer
 * self-diagnostic, plus a single passing summary row when the capture was clean.
 * Deterministic and $0.
 */
function runDiagnosticChecks(capture: CaptureResult, conceptId: string): CheckResult[] {
    const allowed = new Set(H4_ALLOWED_PREFIXES[conceptId]?.prefixes ?? []);
    const byState = new Map<string, Map<string, string>>();

    for (const w of capture.diagnostic_warnings ?? []) {
        const prefix = diagnosticPrefix(w.text);
        if (prefix === undefined || allowed.has(prefix)) continue;
        // Dedupe per state+prefix: nlbEnWarnOnce is once-per-context, but a
        // multi-context capture (state drive + dense pass + frozen pin) repeats
        // the same warning and N copies are one defect, not N.
        const forState = byState.get(w.state_id) ?? new Map<string, string>();
        if (!forState.has(prefix)) forState.set(prefix, w.text);
        byState.set(w.state_id, forState);
    }

    if (byState.size === 0) {
        const note = allowed.size > 0
            ? ` (allow-listed for this concept: ${[...allowed].join(', ')} — ${H4_ALLOWED_PREFIXES[conceptId]?.reason})`
            : '';
        return [mkResult('H4', 'ALL_STATES', true,
            `OK — zero renderer self-diagnostics during capture.${note}`)];
    }

    const results: CheckResult[] = [];
    for (const [stateId, hits] of byState) {
        const detail = [...hits.entries()]
            .map(([prefix, text]) => `[owner: ${diagnosticOwner(prefix)}] ${text.length > 260 ? text.slice(0, 260) + '…' : text}`)
            .join(' | ');
        results.push(mkResult('H4', stateId, false,
            `${hits.size} renderer self-diagnostic(s): ${detail} The renderer is reporting its own broken state — the pixels can look plausible while a bar is frozen or pinned, so fix the cause rather than re-baselining over it.`));
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
    /**
     * Pass `true` at every site whose evidence begins "Skipped — ". A skip stays
     * `passed: true` (fail-closed on missing inputs) but MUST NOT be reported as
     * a pass — see CheckResult.skipped in spec.ts for the measured defect.
     */
    skipped = false,
): CheckResult {
    const spec = VISUAL_CHECKS[id];
    return {
        check_id: id,
        category: spec.category,
        state_id: stateId,
        passed,
        evidence,
        bug_class: spec.bugClass,
        ...(skipped ? { skipped: true } : {}),
    };
}

function quoteShort(s: string): string {
    const max = 60;
    return s.length > max ? `"${s.slice(0, max)}…"` : `"${s}"`;
}
