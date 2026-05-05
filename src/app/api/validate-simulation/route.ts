/**
 * POST /api/validate-simulation — Visual Validator E29 entry point.
 *
 * Body shape: ValidateSimulationRequest (Zod-validated below).
 * Response shape: VisualValidationResult + warnings from the screenshotter.
 *
 * Flow:
 *   1. Validate request shape.
 *   2. Cost cap check — query ai_usage_log for today's spend on this concept_id;
 *      reject with 429 if it has already exceeded $5.
 *   3. captureSimStates (Playwright) → CaptureResult.
 *   4. runVisionGate → VisualValidationResult.
 *   5. Append concept_id + state_id + vision_evidence to engine_bug_queue rows
 *      for every failed bug_class (closes the orphan from session 36).
 *   6. Soft alert if today's total visual-validator cost > $50.
 *
 * Runtime constraints:
 *   - Must run on Node.js (Playwright + sharp aren't Edge-compatible).
 *   - maxDuration set to 90s to cover Playwright cold start + ~26 vision calls.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { captureSimStates } from '@/lib/validators/visual/screenshotter';
import { runVisionGate, type VisionGateContext } from '@/lib/validators/visual/visionGate';
import type { CheckResult } from '@/lib/validators/visual/spec';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const maxDuration = 90;

// Cost caps locked in spec (Day 1, Decision 5)
const PER_CONCEPT_DAILY_CAP_USD = 5.00;
const DAILY_SOFT_ALERT_USD = 50.00;

// ─── Request schema ───────────────────────────────────────────────────────────

const visionContextSchema = z.object({
    physics_engine_config: z.unknown().optional(),
    teacher_script:        z.unknown().optional(),
    motion_paths:          z.unknown().optional(),
    focal_primitive_ids:   z.unknown().optional(),
    real_world_anchor:     z.unknown().optional(),
    panel_a_physics:       z.unknown().optional(),
    panel_b_traces:        z.unknown().optional(),
    panel_b_config:        z.unknown().optional(),
    live_dot:              z.unknown().optional(),
}).default({});

const requestSchema = z.object({
    conceptId:         z.string().min(1),
    panelAHtml:        z.string().min(1),
    panelBHtml:        z.string().optional(),
    stateIds:          z.array(z.string().min(1)).min(1),
    animateStateId:    z.string().optional(),
    panelCount:        z.number().int().min(1).max(2),
    hasEpicC:          z.boolean().optional(),
    hasTimingMetadata: z.boolean().optional(),
    context:           visionContextSchema,
    sessionId:         z.string().optional(),
});

export type ValidateSimulationRequest = z.infer<typeof requestSchema>;

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
    let body: ValidateSimulationRequest;
    try {
        const json = await req.json();
        body = requestSchema.parse(json);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'invalid JSON';
        return NextResponse.json({ error: 'Invalid request body', details: message }, { status: 400 });
    }

    // Cost cap — query today's spend for this concept across all visual validator calls
    const todayConceptCost = await getTodayConceptCostUsd(body.conceptId);
    if (todayConceptCost >= PER_CONCEPT_DAILY_CAP_USD) {
        return NextResponse.json({
            error: 'Per-concept daily cost cap exceeded',
            conceptId: body.conceptId,
            todayCostUsd: Number(todayConceptCost.toFixed(4)),
            capUsd: PER_CONCEPT_DAILY_CAP_USD,
        }, { status: 429 });
    }

    try {
        const capture = await captureSimStates({
            conceptId:        body.conceptId,
            panelAHtml:       body.panelAHtml,
            panelBHtml:       body.panelBHtml,
            stateIds:         body.stateIds,
            animateStateId:   body.animateStateId,
        });

        const result = await runVisionGate({
            conceptId:         body.conceptId,
            capture,
            context:           body.context as VisionGateContext,
            panelCount:        body.panelCount,
            hasEpicC:          body.hasEpicC,
            hasTimingMetadata: body.hasTimingMetadata,
            sessionId:         body.sessionId,
        });

        await writeFailuresToBugQueue(body.conceptId, result.check_results);

        // Soft alert (does not block — surfaces in /admin/costs dashboard)
        const todayTotalCost = await getTodayTotalVisualValidatorCostUsd();
        if (todayTotalCost > DAILY_SOFT_ALERT_USD) {
            console.warn(
                `[visual_validator] Daily soft alert: total cost today is $${todayTotalCost.toFixed(2)} (threshold $${DAILY_SOFT_ALERT_USD}).`,
            );
        }

        return NextResponse.json({
            ...result,
            capture_warnings: capture.warnings,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error';
        return NextResponse.json({
            error: 'Validation failed',
            details: message,
        }, { status: 500 });
    }
}

// ─── Cost cap queries ─────────────────────────────────────────────────────────

function todayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

async function getTodayConceptCostUsd(conceptId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
        .from('ai_usage_log')
        .select('estimated_cost_usd')
        .eq('question_date', todayDateString())
        .like('task_type', 'visual_validator_%')
        .eq('metadata->>concept_id', conceptId);
    if (error) {
        console.error('[visual_validator] cost cap query failed:', error);
        return 0;
    }
    return (data ?? []).reduce(
        (sum, row) => sum + (Number(row.estimated_cost_usd) || 0),
        0,
    );
}

async function getTodayTotalVisualValidatorCostUsd(): Promise<number> {
    const { data, error } = await supabaseAdmin
        .from('ai_usage_log')
        .select('estimated_cost_usd')
        .eq('question_date', todayDateString())
        .like('task_type', 'visual_validator_%');
    if (error) {
        console.error('[visual_validator] daily cost query failed:', error);
        return 0;
    }
    return (data ?? []).reduce(
        (sum, row) => sum + (Number(row.estimated_cost_usd) || 0),
        0,
    );
}

// ─── engine_bug_queue write-back ──────────────────────────────────────────────

interface BugQueueRow {
    concepts_affected: string[] | null;
}

async function writeFailuresToBugQueue(conceptId: string, results: CheckResult[]): Promise<void> {
    const failures = results.filter(r => !r.passed);
    if (failures.length === 0) return;

    // De-dupe by bug_class so we update each row once per validation pass
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
            const next: string[] = current.includes(conceptId)
                ? current
                : [...current, conceptId];

            await supabaseAdmin
                .from('engine_bug_queue')
                .update({
                    concepts_affected: next,
                    state_id:          failure.state_id,
                    vision_evidence: {
                        check_id: failure.check_id,
                        scope:    failure.state_id,
                        evidence: failure.evidence,
                    },
                    updated_at: new Date().toISOString(),
                })
                .eq('bug_class', bugClass);
        } catch (err) {
            console.error('[visual_validator] bug_queue write failed for', bugClass, err);
        }
    }
}
