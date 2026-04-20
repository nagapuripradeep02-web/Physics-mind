/**
 * AI usage logger — records every model call to ai_usage_log.
 * Uses supabaseAdmin (service role) so RLS never blocks it.
 * NEVER throws — logging must never break the main flow.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface UsageLogEntry {
    sessionId?: string;
    taskType: string;
    provider: string;
    model: string;
    inputChars: number;
    outputChars: number;
    latencyMs: number;
    estimatedCostUsd: number;
    fingerprintKey?: string;
    wasCacheHit: boolean;
    metadata?: Record<string, unknown>;
}

export async function logUsage(entry: UsageLogEntry): Promise<void> {
    try {
        await supabaseAdmin
            .from('ai_usage_log')
            .insert({
                session_id: entry.sessionId ?? null,
                task_type: entry.taskType,
                provider: entry.provider,
                model: entry.model,
                input_chars: entry.inputChars,
                output_chars: entry.outputChars,
                latency_ms: entry.latencyMs,
                estimated_cost_usd: entry.estimatedCostUsd,
                fingerprint_key: entry.fingerprintKey ?? null,
                was_cache_hit: entry.wasCacheHit,
                question_date: new Date().toISOString().split('T')[0],
                metadata: entry.metadata ?? {},
            });
    } catch (err) {
        // Never let logging failures affect the user
        console.error('[USAGE LOG] failed:', err);
    }
}
