/**
 * quicklearn:usage:backfill — push chat turns that exist only in the local
 * JSONL logs up into `ai_usage_log`.
 *
 * Needed once because the chat server logged locally before it wrote to
 * Supabase; also the recovery path if the sacred-table write was down for a
 * stretch (rows keep landing in .quicklearn_logs/*.jsonl regardless).
 *
 * Idempotent: reads back the (session_id, created_at) pairs already stored and
 * skips anything within 2s of an existing row for that session.
 *
 * Usage:  npm run quicklearn:usage:backfill [-- --dry]
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { buildUsageRow, LOG_DIR, type DeepSeekUsage, type UsageRow } from './lib/qlUsage';

interface TurnLine {
    ts?: string;
    type?: string;
    concept_id?: string;
    phase?: string;
    state?: string;
    mission_id?: string | null;
    question?: string;
    reply?: string;
    usage?: DeepSeekUsage | null;
    model?: string;
    latency_ms?: number;
}

async function existingStamps(): Promise<Map<string, number[]>> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const res = await fetch(
        url.replace(/\/$/, '') + '/rest/v1/ai_usage_log?select=session_id,created_at&task_type=eq.quicklearn_tutor_chat&limit=5000',
        { headers: { apikey: key, Authorization: 'Bearer ' + key } },
    );
    if (!res.ok) throw new Error('PostgREST ' + res.status + ': ' + (await res.text()).slice(0, 200));
    const rows = (await res.json()) as { session_id: string | null; created_at: string }[];
    const map = new Map<string, number[]>();
    for (const r of rows) {
        const k = r.session_id ?? 'unknown';
        const arr = map.get(k) ?? [];
        arr.push(new Date(r.created_at).getTime());
        map.set(k, arr);
    }
    return map;
}

async function postRows(rows: UsageRow[]): Promise<void> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const res = await fetch(url.replace(/\/$/, '') + '/rest/v1/ai_usage_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: 'Bearer ' + key, Prefer: 'return=minimal' },
        body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error('PostgREST ' + res.status + ': ' + (await res.text()).slice(0, 300));
}

async function main(): Promise<void> {
    const dry = process.argv.includes('--dry');
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase env (run via the npm script so .env.local loads).');
        process.exit(1);
    }

    let files: string[];
    try {
        files = readdirSync(LOG_DIR).filter((f) => f.endsWith('.jsonl') && f !== 'pending_usage.jsonl');
    } catch {
        console.log('No local logs at ' + LOG_DIR + ' — nothing to backfill.');
        return;
    }

    const stamps = await existingStamps();
    const toInsert: UsageRow[] = [];
    let seen = 0, skipped = 0;

    for (const f of files) {
        const sessionId = f.replace(/\.jsonl$/, '');
        const lines = readFileSync(join(LOG_DIR, f), 'utf-8').split('\n').filter(Boolean);
        for (const line of lines) {
            let t: TurnLine;
            try { t = JSON.parse(line) as TurnLine; } catch { continue; }
            if (t.type !== 'chat_turn' || !t.usage) continue;
            seen++;
            const when = t.ts ? new Date(t.ts) : new Date();
            const near = (stamps.get(sessionId) ?? []).some((ms) => Math.abs(ms - when.getTime()) < 2000);
            if (near) { skipped++; continue; }
            toInsert.push(buildUsageRow({
                sessionId,
                model: t.model ?? 'deepseek-chat',
                usage: t.usage,
                latencyMs: t.latency_ms ?? 0,
                // The raw prompt is not kept in the local log; question+reply
                // chars are the honest available proxy for the *_chars columns
                // (token counts in metadata are exact either way).
                inputChars: (t.question ?? '').length,
                outputChars: (t.reply ?? '').length,
                conceptId: t.concept_id,
                phase: t.phase,
                state: t.state,
                missionId: t.mission_id ?? null,
                question: t.question,
                replyChars: (t.reply ?? '').length,
                actor: process.env.QL_ACTOR ?? 'quicklearn_test',
                when,
            }));
        }
    }

    console.log('chat turns in local logs : ' + seen);
    console.log('already in ai_usage_log  : ' + skipped);
    console.log('to insert                : ' + toInsert.length);
    if (toInsert.length === 0 || dry) {
        if (dry) console.log('(dry run — nothing written)');
        return;
    }
    await postRows(toInsert);
    const usd = toInsert.reduce((n, r) => n + r.estimated_cost_usd, 0);
    console.log('inserted ' + toInsert.length + ' row(s), $' + usd.toFixed(6) + ' total');
}

void main();
