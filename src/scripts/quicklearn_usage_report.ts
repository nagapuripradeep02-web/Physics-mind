/**
 * quicklearn:usage — read the Quick Learn AI spend back out of `ai_usage_log`.
 *
 * Answers the founder's scaling questions in one command: how many student
 * questions have we served, how many tokens did they cost, what did we pay,
 * and what would that be per student and per 1,000 students.
 *
 * Usage:
 *   npm run quicklearn:usage              (all time)
 *   npm run quicklearn:usage -- --days=7  (last 7 days)
 *   npm run quicklearn:usage -- --sessions  (per-session breakdown too)
 */

import { flushPending, USD_TO_INR } from './lib/qlUsage';

interface Row {
    created_at: string;
    session_id: string | null;
    model: string;
    actor: string;
    latency_ms: number | null;
    estimated_cost_usd: string | number | null;
    metadata: {
        tokens?: { prompt?: number; completion?: number; total?: number; prompt_cache_hit?: number; prompt_cache_miss?: number };
        pricing?: { peak_window?: boolean };
        concept_id?: string | null;
        sim_state?: string | null;
    } | null;
}

async function fetchRows(days: number | null): Promise<Row[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (run via npm run quicklearn:usage).');
        process.exit(1);
    }
    const params = [
        'select=created_at,session_id,model,actor,latency_ms,estimated_cost_usd,metadata',
        'task_type=eq.quicklearn_tutor_chat',
        'order=created_at.desc',
        'limit=5000',
    ];
    if (days !== null) {
        const since = new Date(Date.now() - days * 86400_000).toISOString();
        params.push('created_at=gte.' + since);
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url.replace(/\/$/, '') + '/rest/v1/ai_usage_log?' + params.join('&'), {
                headers: { apikey: key, Authorization: 'Bearer ' + key },
            });
            if (!res.ok) throw new Error('PostgREST ' + res.status + ': ' + (await res.text()).slice(0, 200));
            return (await res.json()) as Row[];
        } catch (e) {
            if (attempt === 3) {
                console.error('Could not read ai_usage_log: ' + (e instanceof Error ? e.message : String(e)));
                process.exit(1);
            }
            await new Promise((r) => setTimeout(r, 500 * attempt));
        }
    }
    return [];
}

// Two money columns: USD as billed by the provider, INR at the recorded rate.
// Small amounts keep 6/4 decimals (a single question costs a fraction of a
// paisa); larger ones switch to thousands separators + 2 decimals so the scale
// projections stay readable.
const LABEL_W = 30;
const COL_W = 16;

function usdStr(usd: number): string {
    return usd >= 100
        ? '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '$' + usd.toFixed(6);
}

function inrStr(usd: number): string {
    const inr = usd * USD_TO_INR;
    return inr >= 100
        ? '₹' + inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '₹' + inr.toFixed(4);
}

/** One label + USD column + INR column, right-aligned. */
function moneyRow(label: string, usd: number): string {
    const l = label.length > LABEL_W ? label.slice(0, LABEL_W - 1) + '…' : label;
    return '  ' + l.padEnd(LABEL_W) + usdStr(usd).padStart(COL_W) + inrStr(usd).padStart(COL_W);
}

function moneyHeader(title: string): string {
    return title.padEnd(LABEL_W + 2) + 'USD'.padStart(COL_W) + 'INR'.padStart(COL_W);
}

async function main(): Promise<void> {
    const daysArg = process.argv.find((a) => a.startsWith('--days='));
    const days = daysArg ? Number(daysArg.split('=')[1]) : null;
    const showSessions = process.argv.includes('--sessions');

    const flushed = await flushPending();
    if (flushed > 0) console.log('(uploaded ' + flushed + ' spooled row(s) first)\n');

    const rows = await fetchRows(days);
    if (rows.length === 0) {
        console.log('No Quick Learn AI usage recorded' + (days ? ' in the last ' + days + ' days' : '') + ' yet.');
        return;
    }

    let usd = 0, prompt = 0, completion = 0, cacheHit = 0, latency = 0, peakCalls = 0;
    const sessions = new Map<string, { q: number; usd: number; tokens: number }>();
    const byActor = new Map<string, { q: number; usd: number }>();

    for (const r of rows) {
        const c = Number(r.estimated_cost_usd ?? 0);
        const t = r.metadata?.tokens ?? {};
        usd += c;
        prompt += t.prompt ?? 0;
        completion += t.completion ?? 0;
        cacheHit += t.prompt_cache_hit ?? 0;
        latency += r.latency_ms ?? 0;
        if (r.metadata?.pricing?.peak_window) peakCalls++;
        const sid = r.session_id ?? 'unknown';
        const s = sessions.get(sid) ?? { q: 0, usd: 0, tokens: 0 };
        s.q++; s.usd += c; s.tokens += t.total ?? 0;
        sessions.set(sid, s);
        const a = byActor.get(r.actor) ?? { q: 0, usd: 0 };
        a.q++; a.usd += c;
        byActor.set(r.actor, a);
    }

    const n = rows.length;
    const perQ = usd / n;
    const perSession = usd / sessions.size;

    const width = LABEL_W + 2 + COL_W * 2;
    console.log('QUICK LEARN — AI USAGE' + (days ? ' (last ' + days + ' days)' : ' (all time)'));
    console.log('='.repeat(width));
    console.log('Questions answered by the AI : ' + n);
    console.log('Study sessions               : ' + sessions.size);
    console.log('Models                       : ' + [...new Set(rows.map((r) => r.model))].join(', '));
    console.log('Date range                   : ' + rows[n - 1].created_at.slice(0, 16) + '  →  ' + rows[0].created_at.slice(0, 16));
    console.log('Exchange rate used           : 1 USD = ₹' + USD_TO_INR + '   (override with QL_USD_INR)');
    console.log('');
    console.log('TOKENS');
    console.log('  input (prompt)             : ' + prompt.toLocaleString() + '   of which cached: ' + cacheHit.toLocaleString() +
        ' (' + (prompt > 0 ? ((cacheHit / prompt) * 100).toFixed(1) : '0') + '%)');
    console.log('  output (completion)        : ' + completion.toLocaleString());
    console.log('  total                      : ' + (prompt + completion).toLocaleString());
    console.log('');
    console.log(moneyHeader('COST'));
    console.log('-'.repeat(width));
    console.log(moneyRow('total spent so far', usd));
    console.log(moneyRow('per question', perQ));
    console.log(moneyRow('per study session', perSession));
    console.log('');
    console.log(moneyHeader('SCALE PROJECTION (per month)'));
    console.log('-'.repeat(width));
    console.log(moneyRow('100 students', perSession * 100));
    console.log(moneyRow('1,000 students', perSession * 1000));
    console.log(moneyRow('10,000 students', perSession * 10000));
    console.log(moneyRow('100,000 students', perSession * 100000));
    console.log('');
    console.log('  calls billed at peak rate  : ' + peakCalls + ' of ' + n);
    console.log('  avg latency                : ' + Math.round(latency / n) + ' ms');
    console.log('  avg questions / session    : ' + (n / sessions.size).toFixed(1));
    console.log('');
    console.log(moneyHeader('BY ACTOR'));
    console.log('-'.repeat(width));
    for (const [actor, a] of [...byActor.entries()].sort((x, y) => y[1].q - x[1].q)) {
        console.log(moneyRow(actor + '  (' + a.q + ' questions)', a.usd));
    }

    if (showSessions) {
        console.log('');
        console.log(moneyHeader('BY SESSION'));
        console.log('-'.repeat(width));
        for (const [sid, s] of [...sessions.entries()].sort((x, y) => y[1].usd - x[1].usd)) {
            console.log(moneyRow(sid + '  (' + s.q + ' q, ' + s.tokens.toLocaleString() + ' tok)', s.usd));
        }
    }
}

void main();
