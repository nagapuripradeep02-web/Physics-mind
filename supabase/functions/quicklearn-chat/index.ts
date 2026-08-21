/**
 * quicklearn-chat — the public AI-tutor endpoint behind the student Quick Learn
 * page (viditra.co/learn/<concept>).
 *
 * This is the localhost prototype (src/scripts/quicklearn_chat_server.ts) made
 * safe to leave running on the open internet. The lesson itself stays scripted
 * in the page; this answers ONLY the free-form questions a student types, and
 * never drives the simulation (Rule 18).
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account. It is
 * not unguarded for that reason; it fails CLOSED on all four guards:
 *   1. Origin must be in QL_ALLOWED_ORIGINS.
 *   2. Per-IP burst limit  (QL_IP_PER_MIN, default 4/min).
 *   3. Per-IP daily limit  (QL_IP_PER_DAY, default 40/day).
 *   4. GLOBAL daily spend ceiling (QL_DAILY_USD_CAP, default $2/day) — the
 *      backstop that makes a public LLM endpoint safe to own. No key, or an
 *      unreadable ledger, means every request is refused.
 * All four are enforced against ai_usage_log itself, which is both the ledger
 * and the rate-limit source of truth, so there is no separate state to drift.
 *
 * Raw IPs are never stored — only a salted SHA-256 hash, for rate limiting.
 *
 *   supabase secrets set DEEPSEEK_API_KEY=...
 *   optional: QL_ALLOWED_ORIGINS, QL_DAILY_USD_CAP, QL_IP_PER_MIN,
 *             QL_IP_PER_DAY, QL_IP_SALT, QL_CHAT_MODEL, QL_USD_INR
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const DEEPSEEK_KEY = Deno.env.get('DEEPSEEK_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MODEL = Deno.env.get('QL_CHAT_MODEL') ?? 'deepseek-chat';
const DAILY_USD_CAP = Number(Deno.env.get('QL_DAILY_USD_CAP') ?? '2');
const IP_PER_MIN = Number(Deno.env.get('QL_IP_PER_MIN') ?? '4');
const IP_PER_DAY = Number(Deno.env.get('QL_IP_PER_DAY') ?? '40');
const USD_TO_INR = Number(Deno.env.get('QL_USD_INR') ?? '95.69');
const IP_SALT = Deno.env.get('QL_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
// The origin check stops the endpoint being embedded on someone else's page —
// a browser cannot forge Origin. It is NOT the security boundary against a
// scripted attacker (curl can send any Origin); the per-IP limits and the
// global daily spend ceiling are. localhost is included so `npm run serve:site`
// can preview the real public build before it ships.
const ALLOWED_ORIGINS = (Deno.env.get('QL_ALLOWED_ORIGINS') ??
    'https://viditra.co,https://www.viditra.co,http://localhost:8090,http://127.0.0.1:8090')
    .split(',').map((s) => s.trim()).filter(Boolean);

const TASK_TYPE = 'quicklearn_tutor_chat';

// Kept in sync by hand with src/scripts/quicklearn_chat_server.ts (different
// runtime, no shared import). Change one, change the other.
const PERSONA = [
    'You are Vidi, a friendly physics guide sitting next to a school student who is learning from a live physics simulation.',
    'Your one job: answer the student’s question about the physics they are seeing, in a warm and encouraging way.',
    'Rules you always follow:',
    '- Use plain, literal English a Class 11 student with textbook English understands. Physics words like "voltage", "resistance", "ohmic" are fine. No idioms, no metaphors, no personification of objects.',
    '- Keep it SHORT: 2 to 4 sentences. One idea per sentence.',
    '- Be positive and encouraging, but never fake. Praise the action, then answer.',
    '- Ground every answer in what the simulation on screen shows. The CONCEPT FACTS below are the truth; never contradict them.',
    '- When the student asks what they are looking at, describe ONLY the things listed under "WHAT THE STUDENT IS LOOKING AT". Never mention apparatus that is not in that list. Most of these simulations are NOT circuit diagrams, so do not describe batteries, resistors, cells, wires or meters unless they are listed as visible. If the student asks about something that is not on screen, say plainly that it is not shown, then explain where it actually is.',
    '- If the student asks for a quiz answer, do NOT give the answer. Encourage them to try, and give one small nudge toward the right idea.',
    '- If the question is off-topic (not physics, not this lesson), answer in one kind sentence and guide them back to the lesson.',
    '- Never use country-specific examples, brands, festivals, or currencies. Use universal ones: a phone charger, a ceiling fan, household wiring.',
    '- You are an AI guide. If asked, say so plainly.',
].join('\n');

const FRIENDLY_BUSY = 'I need a short breather — try me again in a minute. Meanwhile, keep going with the lesson!';
const FRIENDLY_DOWN = 'I could not reach my brain just now. The lesson still works — keep going, and try asking me again in a moment.';
const FRIENDLY_CAP = 'You have asked a lot of great questions today — that is the daily limit. Finish the lesson and the quiz; your questions are saved for your teacher.';
const FRIENDLY_QUIET = 'I am resting for today, but the whole lesson still works without me. Keep going!';

// DeepSeek V4-Flash list price (verified 2026-08-18). Peak = 01:00–04:00 and
// 06:00–10:00 UTC, when rates double.
const RATE_OFF = { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 };
const RATE_PEAK = { cacheHit: 0.014, cacheMiss: 0.44, output: 1.32 };

interface Usage {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
}

function computeCost(u: Usage, when: Date) {
    const h = when.getUTCHours();
    const peak = (h >= 1 && h < 4) || (h >= 6 && h < 10);
    const rate = peak ? RATE_PEAK : RATE_OFF;
    const prompt = u.prompt_tokens ?? 0;
    const output = u.completion_tokens ?? 0;
    const hit = u.prompt_cache_hit_tokens ?? 0;
    const miss = u.prompt_cache_miss_tokens ?? Math.max(0, prompt - hit);
    const usd = (hit * rate.cacheHit + miss * rate.cacheMiss + output * rate.output) / 1_000_000;
    return {
        peak, hit, miss, output, prompt,
        total: u.total_tokens ?? prompt + output,
        usd: Number(usd.toFixed(8)),
        rate,
    };
}

/**
 * The instrument values the student can see this instant, read from the
 * renderer itself by the page. Lets the model answer "why does the meter say
 * 1.20 A?" instead of quoting a slider range.
 */
function readingsLine(r: unknown): string {
    // Current shape: an array of pre-formatted display strings built by the
    // page from its readings spec ("speed |v| 3.0 ×10⁵ m/s", "force F = 0.163 fN").
    if (Array.isArray(r)) {
        const parts = r.filter((x): x is string => typeof x === 'string' && x.length > 0).slice(0, 10)
            .map((s) => s.slice(0, 80));
        return parts.length ? '- what the instruments show on screen right now: ' + parts.join(', ') : '';
    }
    // Legacy object shape (older built pages).
    if (!r || typeof r !== 'object') return '';
    const v = r as { voltage_V?: number; resistance_ohm?: number; current_A?: number };
    const parts: string[] = [];
    if (typeof v.voltage_V === 'number') parts.push('voltage ' + v.voltage_V + ' V');
    if (typeof v.resistance_ohm === 'number') parts.push('resistance ' + v.resistance_ohm + ' ohm');
    if (typeof v.current_A === 'number') parts.push('the current meter reads ' + v.current_A.toFixed(2) + ' A');
    if (parts.length === 0) return '';
    return '- what the instruments show on screen right now: ' + parts.join(', ');
}

async function sha256Hex(s: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function corsHeaders(origin: string): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
    };
}

function reply(origin: string, status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

interface LedgerRow {
    created_at: string;
    estimated_cost_usd: string | number | null;
    metadata: { ip_hash?: string } | null;
}

/** One read of today's ledger answers all three volume guards. */
async function readTodayLedger(): Promise<LedgerRow[] | null> {
    const today = new Date().toISOString().split('T')[0];
    const url = SUPABASE_URL + '/rest/v1/ai_usage_log?select=created_at,estimated_cost_usd,metadata' +
        '&task_type=eq.' + TASK_TYPE + '&question_date=eq.' + today + '&limit=5000';
    try {
        const res = await fetch(url, { headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY } });
        if (!res.ok) return null;
        return await res.json() as LedgerRow[];
    } catch {
        return null;
    }
}

async function writeUsage(row: Record<string, unknown>): Promise<void> {
    try {
        await fetch(SUPABASE_URL + '/rest/v1/ai_usage_log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SERVICE_KEY,
                Authorization: 'Bearer ' + SERVICE_KEY,
                Prefer: 'return=minimal',
            },
            body: JSON.stringify([row]),
        });
    } catch (e) {
        console.error('[quicklearn-chat] usage write failed', e);
    }
}

/**
 * Student's own verdict → simulation_feedback (a sacred table already shaped
 * for this: session_id / concept_id / student_rating / interaction_data).
 * Never throws — a failed write must not cost the student their thank-you.
 */
async function writeFeedback(body: Record<string, any>): Promise<void> {
    const row = {
        session_id: String(body.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon',
        concept_id: String(body.concept_id ?? 'unknown').slice(0, 120),
        student_rating: String(body.helped ?? 'unknown').slice(0, 40),
        interaction_data: {
            surface: 'quicklearn_public',
            helped: body.helped ?? null,
            would_use_again: body.would_use_again ?? null,
            comment: String(body.comment ?? '').slice(0, 2000),
            score_first_try: body.score_first_try ?? null,
            questions_total: body.questions_total ?? null,
            questions_asked: body.questions_asked ?? null,
            missions_completed: body.missions_completed ?? null,
            skills: body.skills ?? null,
            minutes_spent: body.minutes_spent ?? null,
        },
    };
    try {
        await fetch(SUPABASE_URL + '/rest/v1/simulation_feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SERVICE_KEY,
                Authorization: 'Bearer ' + SERVICE_KEY,
                Prefer: 'return=minimal',
            },
            body: JSON.stringify([row]),
        });
    } catch (e) {
        console.error('[quicklearn-chat] feedback write failed', e);
    }
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { error: 'method not allowed' });

    // Guard 1 — origin allowlist. A browser cannot forge Origin; this stops the
    // endpoint being embedded on someone else's page.
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return reply(origin, 403, { error: 'origin not allowed' });
    }
    let body: Record<string, any>;
    try {
        body = await req.json();
    } catch {
        return reply(origin, 400, { error: 'bad json' });
    }

    // Feedback needs no model call, so it is handled before the key check and
    // the spend guards — a student must always be able to tell us how it went,
    // even on a day the tutor is resting.
    if (body.type === 'feedback') {
        await writeFeedback(body);
        return reply(origin, 200, { ok: true });
    }

    if (!DEEPSEEK_KEY) return reply(origin, 200, { reply: FRIENDLY_QUIET, questions_left: 0 });

    const question = String(body.question ?? '').trim().slice(0, 1000);
    if (!question) return reply(origin, 400, { error: 'empty question' });

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
        req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await sha256Hex(IP_SALT + '|' + rawIp);

    // Guards 2–4 — all computed from one ledger read. An unreadable ledger
    // means we cannot prove we are under budget, so we refuse (fail closed).
    const ledger = await readTodayLedger();
    if (ledger === null) {
        console.error('[quicklearn-chat] ledger unreadable — refusing (fail closed)');
        return reply(origin, 200, { reply: FRIENDLY_DOWN, questions_left: 0 });
    }
    let spentToday = 0;
    let ipDay = 0;
    let ipMinute = 0;
    const nowMs = Date.now();
    for (const r of ledger) {
        spentToday += Number(r.estimated_cost_usd ?? 0);
        if (r.metadata?.ip_hash === ipHash) {
            ipDay++;
            if (nowMs - new Date(r.created_at).getTime() < 60_000) ipMinute++;
        }
    }
    if (spentToday >= DAILY_USD_CAP) {
        console.warn('[quicklearn-chat] daily spend cap hit: $' + spentToday.toFixed(4));
        return reply(origin, 200, { reply: FRIENDLY_QUIET, questions_left: 0 });
    }
    if (ipDay >= IP_PER_DAY) return reply(origin, 200, { reply: FRIENDLY_CAP, questions_left: 0 });
    if (ipMinute >= IP_PER_MIN) return reply(origin, 200, { reply: FRIENDLY_BUSY, questions_left: IP_PER_DAY - ipDay });

    // Stable prefix first (persona + concept facts) so DeepSeek's automatic
    // prompt cache hits — a cached prefix costs ~1/30th of a miss.
    const system = PERSONA + '\n\nCONCEPT FACTS (the truth for this lesson):\n' +
        String(body.tutor_context ?? '').slice(0, 6000);

    const situation = [
        'Where the student is right now:',
        '- lesson phase: ' + String(body.phase ?? 'unknown'),
        '- simulation state: ' + String(body.state ?? 'unknown'),
        body.mission_id ? '- current mission: ' + String(body.mission_id) : '',
        readingsLine(body.live_readings),
        'Their recent actions (oldest first): ' + JSON.stringify((body.recent_actions ?? []).slice(-10)),
    ].filter(Boolean).join('\n');

    const history = (body.recent_messages ?? []).slice(-6).map((m: { role?: string; text?: string }) => ({
        role: m.role === 'student' ? 'user' : 'assistant',
        content: String(m.text ?? '').slice(0, 500),
    }));

    const messages = [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: situation + '\n\nThe student asks: ' + question },
    ];

    const t0 = Date.now();
    let text = '';
    let usage: Usage = {};
    try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + DEEPSEEK_KEY },
            body: JSON.stringify({ model: MODEL, messages, max_tokens: 300, temperature: 0.7, stream: false }),
        });
        if (!res.ok) throw new Error('DeepSeek ' + res.status + ': ' + (await res.text()).slice(0, 200));
        const json = await res.json();
        text = json.choices?.[0]?.message?.content ?? '';
        usage = json.usage ?? {};
    } catch (e) {
        console.error('[quicklearn-chat] ' + (e instanceof Error ? e.message : String(e)));
        return reply(origin, 200, { reply: FRIENDLY_DOWN, questions_left: IP_PER_DAY - ipDay });
    }

    const latency = Date.now() - t0;
    const when = new Date();
    const cost = computeCost(usage, when);
    const inputChars = messages.reduce((n, m) => n + m.content.length, 0);

    await writeUsage({
        session_id: String(body.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon',
        task_type: TASK_TYPE,
        provider: 'deepseek',
        model: MODEL,
        input_chars: inputChars,
        output_chars: text.length,
        latency_ms: latency,
        estimated_cost_usd: cost.usd,
        fingerprint_key: body.concept_id ? String(body.concept_id) + '|quicklearn|student_question' : null,
        was_cache_hit: cost.hit > 0,
        question_date: when.toISOString().split('T')[0],
        actor: 'quicklearn_student',
        metadata: {
            surface: 'quicklearn_public',
            concept_id: body.concept_id ?? null,
            phase: body.phase ?? null,
            sim_state: body.state ?? null,
            mission_id: body.mission_id ?? null,
            question: question.slice(0, 500),
            question_chars: question.length,
            reply_chars: text.length,
            ip_hash: ipHash,
            tokens: {
                prompt: cost.prompt,
                completion: cost.output,
                total: cost.total,
                prompt_cache_hit: cost.hit,
                prompt_cache_miss: cost.miss,
            },
            pricing: {
                peak_window: cost.peak,
                usd_per_million: { cache_hit: cost.rate.cacheHit, cache_miss: cost.rate.cacheMiss, output: cost.rate.output },
            },
            cost_inr_estimate: Number((cost.usd * USD_TO_INR).toFixed(6)),
            usd_to_inr_rate: USD_TO_INR,
            spent_today_usd_before: Number(spentToday.toFixed(6)),
        },
    });

    return reply(origin, 200, {
        reply: text || FRIENDLY_DOWN,
        questions_left: Math.max(0, IP_PER_DAY - ipDay - 1),
    });
});
