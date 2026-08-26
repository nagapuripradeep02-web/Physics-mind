/**
 * Quick Learn AI-usage accounting — exact token + cost capture into the
 * SACRED `ai_usage_log` table (CLAUDE.md §6: never delete; it is the cost-
 * tracking moat). Shared by quicklearn_chat_server.ts and the backfill /
 * report scripts.
 *
 * Why not `src/lib/usageLogger.ts`: that module imports supabaseAdmin, which
 * throws at import time without the Next env and drags @supabase/supabase-js
 * into a standalone tsx process. This writes the same row shape over plain
 * PostgREST instead — and adds two things the chat path needs:
 *
 *   1. EXACT token accounting. DeepSeek returns prompt_tokens /
 *      completion_tokens plus prompt_cache_hit_tokens — the cache-hit split
 *      matters because a cached prompt prefix is ~30x cheaper than a miss.
 *      ai_usage_log only has *_chars columns, so tokens + the full cost
 *      breakdown ride in `metadata` (jsonb) and cost lands in
 *      estimated_cost_usd.
 *   2. NEVER LOSE A ROW. Node's fetch to Supabase is intermittently flaky on
 *      Windows (recorded scar: "TypeError: fetch failed" mid-session while
 *      curl to the same endpoint works). So: 3 retries, then spool to
 *      .quicklearn_logs/pending_usage.jsonl, and flush that spool on the next
 *      successful write.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const LOG_DIR = join(process.cwd(), '.quicklearn_logs');
const PENDING = join(LOG_DIR, 'pending_usage.jsonl');

/**
 * USD→INR used for the rupee column. Spot rate ~95.69 on 2026-08-18; override
 * with QL_USD_INR when it drifts. Stored per row so an old row keeps the rate
 * it was actually costed at.
 */
export const USD_TO_INR = Number(process.env.QL_USD_INR || 95.69);

/** DeepSeek's usage object (OpenAI-compatible + its cache-split extension). */
export interface DeepSeekUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
}

export interface CostBreakdown {
    peak: boolean;
    cache_hit_tokens: number;
    cache_miss_tokens: number;
    output_tokens: number;
    total_tokens: number;
    usd: number;
    usd_per_million: { cache_hit: number; cache_miss: number; output: number };
}

// DeepSeek V4-Flash list price, verified 2026-08-18. Peak = 01:00–04:00 and
// 06:00–10:00 UTC (i.e. 06:30–09:30 and 11:30–15:30 IST), when rates double;
// Indian evening study hours fall entirely in the off-peak band.
const RATE_OFF = { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 };
const RATE_PEAK = { cacheHit: 0.014, cacheMiss: 0.44, output: 1.32 };

export function isPeakUtc(d: Date): boolean {
    const h = d.getUTCHours();
    return (h >= 1 && h < 4) || (h >= 6 && h < 10);
}

export function computeCost(usage: DeepSeekUsage, when: Date = new Date()): CostBreakdown {
    const prompt = usage.prompt_tokens ?? 0;
    const output = usage.completion_tokens ?? 0;
    // Older/other providers omit the cache split — then treat all input as a miss.
    const hit = usage.prompt_cache_hit_tokens ?? 0;
    const miss = usage.prompt_cache_miss_tokens ?? Math.max(0, prompt - hit);
    const peak = isPeakUtc(when);
    const rate = peak ? RATE_PEAK : RATE_OFF;
    const usd = (hit * rate.cacheHit + miss * rate.cacheMiss + output * rate.output) / 1_000_000;
    return {
        peak,
        cache_hit_tokens: hit,
        cache_miss_tokens: miss,
        output_tokens: output,
        total_tokens: usage.total_tokens ?? prompt + output,
        usd: Number(usd.toFixed(8)),
        usd_per_million: { cache_hit: rate.cacheHit, cache_miss: rate.cacheMiss, output: rate.output },
    };
}

export interface UsageRow {
    session_id: string | null;
    task_type: string;
    provider: string;
    model: string;
    input_chars: number;
    output_chars: number;
    latency_ms: number;
    estimated_cost_usd: number;
    fingerprint_key: string | null;
    was_cache_hit: boolean;
    question_date: string;
    actor: string;
    metadata: Record<string, unknown>;
}

export interface BuildRowInput {
    sessionId: string;
    model: string;
    usage: DeepSeekUsage;
    latencyMs: number;
    inputChars: number;
    outputChars: number;
    conceptId?: string;
    phase?: string;
    state?: string;
    missionId?: string | null;
    question?: string;
    replyChars?: number;
    actor?: string;
    when?: Date;
}

export function buildUsageRow(inp: BuildRowInput): UsageRow {
    const when = inp.when ?? new Date();
    const cost = computeCost(inp.usage, when);
    return {
        session_id: inp.sessionId,
        task_type: 'quicklearn_tutor_chat',
        provider: 'deepseek',
        model: inp.model,
        input_chars: inp.inputChars,
        output_chars: inp.outputChars,
        latency_ms: Math.round(inp.latencyMs),
        estimated_cost_usd: cost.usd,
        fingerprint_key: inp.conceptId ? inp.conceptId + '|quicklearn|student_question' : null,
        // "was_cache_hit" here means the prompt prefix hit DeepSeek's cache —
        // NOT that we served a cached answer (we never do).
        was_cache_hit: cost.cache_hit_tokens > 0,
        question_date: when.toISOString().split('T')[0],
        actor: inp.actor ?? process.env.QL_ACTOR ?? 'quicklearn_test',
        metadata: {
            surface: 'quicklearn',
            concept_id: inp.conceptId ?? null,
            phase: inp.phase ?? null,
            sim_state: inp.state ?? null,
            mission_id: inp.missionId ?? null,
            question_chars: (inp.question ?? '').length,
            reply_chars: inp.replyChars ?? inp.outputChars,
            tokens: {
                prompt: inp.usage.prompt_tokens ?? 0,
                completion: inp.usage.completion_tokens ?? 0,
                total: cost.total_tokens,
                prompt_cache_hit: cost.cache_hit_tokens,
                prompt_cache_miss: cost.cache_miss_tokens,
            },
            pricing: { peak_window: cost.peak, usd_per_million: cost.usd_per_million },
            cost_inr_estimate: Number((cost.usd * USD_TO_INR).toFixed(6)),
            usd_to_inr_rate: USD_TO_INR,
        },
    };
}

function spool(row: UsageRow, why: string): void {
    try {
        mkdirSync(LOG_DIR, { recursive: true });
        appendFileSync(PENDING, JSON.stringify(row) + '\n', 'utf-8');
        console.warn('[ql-usage] spooled to pending_usage.jsonl (' + why + ')');
    } catch (e) {
        console.error('[ql-usage] SPOOL FAILED — usage row lost:', e instanceof Error ? e.message : e);
    }
}

async function postRows(rows: UsageRow[]): Promise<void> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetch(url.replace(/\/$/, '') + '/rest/v1/ai_usage_log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: key,
            Authorization: 'Bearer ' + key,
            Prefer: 'return=minimal',
        },
        body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error('PostgREST ' + res.status + ': ' + (await res.text()).slice(0, 300));
}

/** Flush any spooled rows. Returns how many were uploaded. */
export async function flushPending(): Promise<number> {
    if (!existsSync(PENDING)) return 0;
    let rows: UsageRow[];
    try {
        rows = readFileSync(PENDING, 'utf-8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as UsageRow);
    } catch {
        return 0;
    }
    if (rows.length === 0) return 0;
    try {
        await postRows(rows);
        writeFileSync(PENDING, '', 'utf-8');
        console.log('[ql-usage] flushed ' + rows.length + ' spooled row(s) to ai_usage_log');
        return rows.length;
    } catch {
        return 0; // stay spooled; try again next time
    }
}

/**
 * Record one model call. Never throws — a logging failure must never break a
 * student's lesson. Retries 3x (Node/Supabase fetch is flaky on Windows), then
 * spools locally for the next flush.
 */
export async function recordUsage(inp: BuildRowInput): Promise<UsageRow> {
    const row = buildUsageRow(inp);
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await postRows([row]);
            void flushPending();
            return row;
        } catch (e) {
            if (attempt === 3) {
                spool(row, e instanceof Error ? e.message : String(e));
                return row;
            }
            await new Promise((r) => setTimeout(r, 400 * attempt));
        }
    }
    return row;
}
