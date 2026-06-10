/**
 * Regression gate — H2 VISUAL_REGRESSION (Engine E29, 2026-06-10).
 *
 * Compares each state's current panel-A render against the founder-APPROVED
 * baseline at visual_baselines/<concept_id>/<state_id>.png (git-tracked).
 * Catches the "a renderer or JSON change silently altered an already-approved
 * diamond" class of bug that nothing else re-checks.
 *
 * Workflow:
 *   - `npm run visual:approve -- <concept_id>` copies the newest run's state
 *     PNGs into visual_baselines/ (downscaled to width 640) + baselines.json.
 *   - Every visual run (eyes / smoke / integrate) calls runRegressionGate.
 *   - Missing baseline folder / state / compare:false → skip-pass (so the
 *     auto-fire path and the other 60 un-baselined concepts are unaffected).
 *
 * Deterministic, zero AI cost. Same fail-open philosophy as pixelGate
 * (skipped checks emit passed=true with explicit "skipped" evidence).
 */
import { Buffer } from 'node:buffer';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import type { CaptureResult } from './screenshotter';
import type { CheckResult } from './spec';
import { VISUAL_CHECKS } from './spec';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface RunRegressionGateInput {
    conceptId: string;
    capture: CaptureResult;
    /** Override the baseline root (tests). Default: <cwd>/visual_baselines */
    baselineRoot?: string;
}

export interface RegressionGateResult {
    check_results: CheckResult[];
    cost_usd: number;
    duration_ms: number;
}

export interface BaselineManifest {
    approved_at: string;
    source_run: string;
    /** Diff-ratio tolerance (0–1). Default 0.02 = 2% of pixels. */
    tolerance: number;
    states: Record<string, {
        /** Live panel-A compare. False for animated states (phase flake). */
        compare: boolean;
        /**
         * Frozen-frame compare — the SET_TIME_FREEZE deterministic capture
         * (<STATE>__frozen.png). Runs even when `compare` is false: it exists
         * precisely so animated states still get regression protection.
         */
        compare_frozen?: boolean;
    }>;
}

// ─── Tunables ─────────────────────────────────────────────────────────────────

export const REGRESSION_DEFAULT_TOLERANCE = 0.02;
/** Both sides are normalized to this width before pixelmatch. */
export const BASELINE_NORMALIZED_WIDTH = 640;
const PIXELMATCH_OPTIONS = { threshold: 0.1, includeAA: false } as const;

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runRegressionGate(input: RunRegressionGateInput): Promise<RegressionGateResult> {
    const start = Date.now();
    const results: CheckResult[] = [];
    const baselineDir = join(input.baselineRoot ?? join(process.cwd(), 'visual_baselines'), input.conceptId);

    const manifest = readManifest(baselineDir);
    if (!manifest) {
        // No approved baselines for this concept — every state skips. One
        // summary row keeps the output honest without spamming per-state.
        results.push(mkH2('ALL_STATES', true,
            `Skipped — no approved baseline at ${baselineDir} (run npm run visual:approve -- ${input.conceptId} to create one).`));
        return { check_results: results, cost_usd: 0, duration_ms: Date.now() - start };
    }

    const tolerance = manifest.tolerance ?? REGRESSION_DEFAULT_TOLERANCE;

    for (const sc of input.capture.state_captures) {
        const stateMeta = manifest.states[sc.state_id];
        const baselinePath = join(baselineDir, `${sc.state_id}.png`);

        // ── Live panel-A compare ─────────────────────────────────────────
        if (!stateMeta || !existsSync(baselinePath)) {
            results.push(mkH2(sc.state_id, true, `Skipped — no approved baseline for ${sc.state_id}.`));
        } else if (stateMeta.compare === false) {
            results.push(mkH2(sc.state_id, true,
                `Skipped — ${sc.state_id} excluded from auto-compare (compare:false, typically an animated state). Baseline kept for human reference.`));
        } else {
            results.push(await compareAgainstBaseline(sc.state_id, sc.panel_a_png_b64, baselinePath, tolerance));
        }

        // ── Frozen-frame compare (runs even when live compare is false —
        //    that is its purpose: animated states get deterministic coverage
        //    via the SET_TIME_FREEZE capture) ──────────────────────────────
        if (stateMeta?.compare_frozen === true) {
            const frozenId = `${sc.state_id}__frozen`;
            const frozenBaselinePath = join(baselineDir, `${frozenId}.png`);
            if (!sc.frozen_png_b64) {
                results.push(mkH2(frozenId, true,
                    `Skipped — manifest expects a frozen compare but this capture has no frozen frame (run with frozenFrame enabled, e.g. npm run visual:eyes).`));
            } else if (!existsSync(frozenBaselinePath)) {
                results.push(mkH2(frozenId, true, `Skipped — no approved frozen baseline for ${sc.state_id}.`));
            } else {
                results.push(await compareAgainstBaseline(frozenId, sc.frozen_png_b64, frozenBaselinePath, tolerance));
            }
        }
    }

    return { check_results: results, cost_usd: 0, duration_ms: Date.now() - start };
}

/** Normalize both sides to width 640 and pixelmatch against the baseline file. */
async function compareAgainstBaseline(
    checkScope: string, currentB64: string, baselinePath: string, tolerance: number,
): Promise<CheckResult> {
    try {
        const current = await normalizeRgba(Buffer.from(currentB64, 'base64'));
        const baseline = await normalizeRgba(readFileSync(baselinePath));
        if (current.width !== baseline.width || current.height !== baseline.height) {
            return mkH2(checkScope, false,
                `Render dimensions drifted vs baseline after width-${BASELINE_NORMALIZED_WIDTH} normalization: current ${current.width}x${current.height} vs baseline ${baseline.width}x${baseline.height}. Canvas size or aspect ratio changed.`);
        }
        const totalPx = current.width * current.height;
        const diffPx = pixelmatch(current.data, baseline.data, undefined, current.width, current.height, PIXELMATCH_OPTIONS);
        const ratio = diffPx / totalPx;
        const passed = ratio <= tolerance;
        return mkH2(checkScope, passed, passed
            ? `OK — ${(ratio * 100).toFixed(2)}% pixels differ vs approved baseline (tolerance ${(tolerance * 100).toFixed(1)}%).`
            : `Visual regression: ${(ratio * 100).toFixed(2)}% of pixels differ vs the approved baseline (tolerance ${(tolerance * 100).toFixed(1)}%). A renderer or JSON change altered this approved state — review before shipping, or re-approve via npm run visual:approve if the change is intentional.`);
    } catch (err) {
        return mkH2(checkScope, true,
            `Skipped — baseline compare failed: ${err instanceof Error ? err.message : String(err)}`);
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readManifest(baselineDir: string): BaselineManifest | null {
    const manifestPath = join(baselineDir, 'baselines.json');
    if (!existsSync(manifestPath)) return null;
    try {
        return JSON.parse(readFileSync(manifestPath, 'utf-8')) as BaselineManifest;
    } catch {
        return null;
    }
}

interface RgbaImage {
    data: Uint8Array;
    width: number;
    height: number;
}

/** Normalize to BASELINE_NORMALIZED_WIDTH so capture-resolution drift doesn't false-fail. */
async function normalizeRgba(png: Buffer): Promise<RgbaImage> {
    const { data, info } = await sharp(png)
        .resize({ width: BASELINE_NORMALIZED_WIDTH, withoutEnlargement: false })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    return {
        data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        width: info.width,
        height: info.height,
    };
}

function mkH2(stateId: string, passed: boolean, evidence: string): CheckResult {
    const spec = VISUAL_CHECKS.H2;
    return {
        check_id: 'H2',
        category: spec.category,
        state_id: stateId,
        passed,
        evidence,
        bug_class: spec.bugClass,
    };
}
