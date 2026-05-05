/**
 * Visual Validator integration helper (Engine E29, Day 6).
 *
 * Thin wrapper around captureSimStates + runVisionGate so callers
 * (aiSimulationGenerator.ts, smoke tests, the /api/validate-simulation route)
 * can opt in with one import.
 *
 * Modes:
 *   - 'observe': default. Always returns { valid: true, ... } so the caller never
 *     blocks on the validator. Failures are still recorded in engine_bug_queue
 *     + ai_usage_log so quality_auditor and the costs dashboard surface them.
 *     Use this until we have calibration confidence on prompt accuracy.
 *   - 'block': enforces the gate — caller must respect `valid` and trigger the
 *     existing 2-attempt Stage 3B retry on failure.
 *
 * Cost guard:
 *   - SKIP_VISUAL_VALIDATION=true in env shortcuts everything to a no-op
 *     `{ valid: true }` for dev / cost emergencies.
 *
 * Async fire-and-forget:
 *   - `runVisualValidationAsync` is the typical entry point. It returns
 *     immediately while the validator runs in the background. Use this from
 *     hot paths (sim generation) so user-facing latency doesn't grow.
 */

import { captureSimStates, type CaptureRequest } from './screenshotter';
import { runVisionGate, type VisionGateContext } from './visionGate';
import { runPixelGate } from './pixelGate';
import type { CheckResult, VisualValidationResult } from './spec';
import { formatCheckError } from './spec';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface RunValidationOptions {
    conceptId: string;
    panelAHtml: string;
    panelBHtml?: string;
    stateIds: string[];
    animateStateId?: string;
    panelCount: number;
    context: VisionGateContext;
    hasEpicC?: boolean;
    hasTimingMetadata?: boolean;
    sessionId?: string;
    /**
     * Mode: 'observe' (record-only, recommended for v1) or 'block' (enforce gate).
     * Defaults to 'observe' regardless of env.
     */
    mode?: 'observe' | 'block';
}

export interface RunValidationResult {
    valid: boolean;
    errors: string[];
    cost_usd: number;
    duration_ms: number;
    capture_warnings: string[];
    /** True when SKIP_VISUAL_VALIDATION=true short-circuited the run. */
    skipped: boolean;
}

const SKIP_FLAG = 'SKIP_VISUAL_VALIDATION';

function shouldSkip(): boolean {
    return process.env[SKIP_FLAG] === 'true';
}

// ─── Synchronous run (used by tests + the /api route) ────────────────────────

export async function runVisualValidation(opts: RunValidationOptions): Promise<RunValidationResult> {
    if (shouldSkip()) {
        return {
            valid: true,
            errors: [],
            cost_usd: 0,
            duration_ms: 0,
            capture_warnings: [],
            skipped: true,
        };
    }

    const start = Date.now();
    const captureReq: CaptureRequest = {
        conceptId:      opts.conceptId,
        panelAHtml:     opts.panelAHtml,
        panelBHtml:     opts.panelBHtml,
        stateIds:       opts.stateIds,
        animateStateId: opts.animateStateId,
    };

    const capture = await captureSimStates(captureReq);

    // Run vision (Sonnet) and pixel/ocr (deterministic) gates in parallel.
    // pixelGate is free + ~0.5-3s; vision is ~$0.04-0.30 + ~10-30s.
    const [visionResult, pixelResult] = await Promise.all([
        runVisionGate({
            conceptId:         opts.conceptId,
            capture,
            context:           opts.context,
            panelCount:        opts.panelCount,
            hasEpicC:          opts.hasEpicC,
            hasTimingMetadata: opts.hasTimingMetadata,
            sessionId:         opts.sessionId,
        }),
        runPixelGate({
            conceptId:  opts.conceptId,
            capture,
            panelCount: opts.panelCount,
        }),
    ]);

    const mergedChecks: CheckResult[] = [...visionResult.check_results, ...pixelResult.check_results];
    const pixelErrors = pixelResult.check_results.filter(r => !r.passed).map(formatCheckError);
    const result: VisualValidationResult = {
        valid: visionResult.valid && pixelResult.check_results.every(r => r.passed),
        errors: [...visionResult.errors, ...pixelErrors],
        check_results: mergedChecks,
        cost_usd: visionResult.cost_usd, // pixelResult.cost_usd is always 0
        duration_ms: Math.max(visionResult.duration_ms, pixelResult.duration_ms),
    };

    // Always record failures, regardless of mode — observe mode still wants the data
    await writeFailuresToBugQueue(opts.conceptId, result.check_results).catch(err => {
        console.error('[visual_validator/integrate] bug queue write failed:', err);
    });

    const mode = opts.mode ?? 'observe';
    const valid = mode === 'block' ? result.valid : true;

    return {
        valid,
        errors: result.errors,
        cost_usd: result.cost_usd,
        duration_ms: Date.now() - start,
        capture_warnings: capture.warnings,
        skipped: false,
    };
}

// ─── Fire-and-forget async (used from hot paths) ──────────────────────────────

/**
 * Kicks off validation in the background and returns immediately.
 * Logs results to console. Caller never waits.
 *
 * Use this from generateSimulation() to avoid adding 30-60s of latency to
 * student-facing requests. Failures still get written to engine_bug_queue
 * for offline review.
 */
export function runVisualValidationAsync(opts: RunValidationOptions): void {
    if (shouldSkip()) return;

    void runVisualValidation({ ...opts, mode: 'observe' })
        .then(result => {
            if (result.skipped) return;
            const summary = result.valid
                ? `[visual_validator] ${opts.conceptId} OK ($${result.cost_usd.toFixed(4)}, ${result.duration_ms}ms)`
                : `[visual_validator] ${opts.conceptId} ${result.errors.length} failures ($${result.cost_usd.toFixed(4)}, ${result.duration_ms}ms): ${result.errors.slice(0, 3).join(' | ')}`;
            console.log(summary);
            if (result.capture_warnings.length > 0) {
                console.warn('[visual_validator] capture warnings:', result.capture_warnings.slice(0, 3));
            }
        })
        .catch(err => {
            console.error('[visual_validator] async validation failed:', err instanceof Error ? err.message : err);
        });
}

// ─── engine_bug_queue write-back ──────────────────────────────────────────────

interface BugQueueRow {
    concepts_affected: string[] | null;
}

async function writeFailuresToBugQueue(conceptId: string, results: CheckResult[]): Promise<void> {
    const failures = results.filter(r => !r.passed);
    if (failures.length === 0) return;

    // De-dupe by bug_class — one update per row per validation pass
    const byBugClass = new Map<string, CheckResult>();
    for (const f of failures) {
        if (!byBugClass.has(f.bug_class)) byBugClass.set(f.bug_class, f);
    }

    for (const [bugClass, failure] of byBugClass.entries()) {
        try {
            const { data: existing } = await supabaseAdmin
                .from('engine_bug_queue')
                .select('concepts_affected')
                .eq('bug_class', bugClass)
                .single<BugQueueRow>();

            const current: string[] = existing?.concepts_affected ?? [];
            const next: string[] = current.includes(conceptId) ? current : [...current, conceptId];

            await supabaseAdmin
                .from('engine_bug_queue')
                .update({
                    concepts_affected: next,
                    state_id: failure.state_id,
                    vision_evidence: {
                        check_id: failure.check_id,
                        scope:    failure.state_id,
                        evidence: failure.evidence,
                    },
                    updated_at: new Date().toISOString(),
                })
                .eq('bug_class', bugClass);
        } catch (err) {
            console.error('[visual_validator/integrate] bug_queue write failed for', bugClass, err);
        }
    }
}
