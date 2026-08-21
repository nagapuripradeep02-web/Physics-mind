/**
 * quicklearn:chat — the Quick Learn AI-tutor chat backend (localhost prototype).
 *
 * A standalone Node http server (port 8082) behind the Quick Learn page's chat
 * panel. The guided lesson is fully scripted client-side; THIS server exists
 * only for the free-form questions a student types ("ask Vidi") and for the
 * interaction log. Rule 18 holds: the model answers doubts in prose — it never
 * drives the sim, never generates physics config, never touches a serving path.
 *
 * Endpoints:
 *   POST /api/chat  { session_id, concept_id, phase, state, mission_id,
 *                     question, recent_actions[], recent_messages[],
 *                     tutor_context }             → { reply, questions_left }
 *   POST /api/log   { session_id, type, payload }  → { ok } (fire-and-forget)
 *
 * Model: DeepSeek (OpenAI-compatible, api.deepseek.com) — chosen 2026-08-18 as
 * the cheapest capable model (off-peak $0.22/M in · $0.66/M out; peak hours are
 * IST morning/midday, so Indian evening study time is off-peak; prefix caching
 * drops repeated system-prompt input to ~$0.007/M). Model id via QL_CHAT_MODEL
 * (default "deepseek-chat"). Key: DEEPSEEK_API_KEY from .env.local.
 *
 * Every turn (and every /api/log event) appends one JSON line to
 * .quicklearn_logs/<session_id>.jsonl — the "everything is recorded" loop.
 * Local files for the prototype; a Supabase table is the later step.
 *
 * Usage:  npm run quicklearn:chat        (npx tsx --env-file=.env.local …)
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { recordUsage, flushPending, computeCost, type DeepSeekUsage } from './lib/qlUsage';

const PORT = Number(process.env.QL_CHAT_PORT || 8082);
const MODEL = process.env.QL_CHAT_MODEL || 'deepseek-chat';
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';
const MAX_QUESTIONS_PER_SESSION = 25;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_PER_WINDOW = 3;
const LOG_DIR = join(process.cwd(), '.quicklearn_logs');

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

interface LiveReadings {
    voltage_V?: number;
    resistance_ohm?: number;
    current_A?: number;
}

/**
 * The instrument values the student can see on screen this instant, read from
 * the renderer itself by the page. Sent verbatim so the model can answer "why
 * does the meter say 1.20 A?" instead of quoting a slider range.
 */
function readingsLine(r: unknown): string {
    // Current shape: an array of pre-formatted display strings built by the
    // page from its readings spec ("speed |v| 3.0 ×10⁵ m/s", "force F = 0.163 fN").
    if (Array.isArray(r)) {
        const parts = r.filter((x): x is string => typeof x === 'string' && x.length > 0).slice(0, 10)
            .map((s) => s.slice(0, 80));
        return parts.length ? '- what the instruments show on screen right now: ' + parts.join(', ') : '';
    }
    // Legacy object shape (older built pages still in the wild locally).
    if (!r || typeof r !== 'object') return '';
    const v = r as LiveReadings;
    const parts: string[] = [];
    if (typeof v.voltage_V === 'number') parts.push('voltage ' + v.voltage_V + ' V');
    if (typeof v.resistance_ohm === 'number') parts.push('resistance ' + v.resistance_ohm + ' ohm');
    if (typeof v.current_A === 'number') parts.push('the current meter reads ' + v.current_A.toFixed(2) + ' A');
    if (parts.length === 0) return '';
    return '- what the instruments show on screen right now: ' + parts.join(', ');
}

interface ChatBody {
    session_id?: string;
    concept_id?: string;
    phase?: string;
    state?: string;
    mission_id?: string;
    question?: string;
    recent_actions?: unknown[];
    recent_messages?: { role: string; text: string }[];
    live_readings?: LiveReadings | null;
    tutor_context?: string;
}

interface SessionState {
    questions: number;
    stamps: number[];
}

const sessions = new Map<string, SessionState>();

function sanitizeSessionId(raw: string): string {
    return (raw || 'anon').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon';
}

function logLine(sessionId: string, entry: object): void {
    try {
        mkdirSync(LOG_DIR, { recursive: true });
        appendFileSync(join(LOG_DIR, sessionId + '.jsonl'), JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n', 'utf-8');
    } catch (e) {
        console.warn('[quicklearn:chat] log write failed:', e instanceof Error ? e.message : e);
    }
}

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (c) => {
            data += c;
            if (data.length > 200_000) { reject(new Error('body too large')); req.destroy(); }
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

function send(res: ServerResponse, origin: string, status: number, body: object): void {
    const allow = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ? origin : 'http://localhost:8081';
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allow,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(JSON.stringify(body));
}

const FRIENDLY_BUSY = 'I need a short breather — try me again in a minute. Meanwhile, keep going with the lesson!';
const FRIENDLY_DOWN = 'I could not reach my brain just now. The lesson still works — keep going, and try asking me again in a moment.';
const FRIENDLY_CAP = 'You have asked a lot of great questions this session — that is the daily limit. Finish the lesson and the quiz; your questions are saved for your teacher.';

async function callDeepSeek(
    system: string,
    messages: { role: string; content: string }[],
): Promise<{ text: string; usage: DeepSeekUsage; inputChars: number }> {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error('DEEPSEEK_API_KEY not set (run via npm run quicklearn:chat with .env.local present)');
    const payload = [{ role: 'system', content: system }, ...messages];
    const res = await fetch(DEEPSEEK_BASE + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({
            model: MODEL,
            messages: payload,
            max_tokens: 300,
            temperature: 0.7,
            stream: false,
        }),
    });
    if (!res.ok) throw new Error('DeepSeek API ' + res.status + ': ' + (await res.text()).slice(0, 300));
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[]; usage?: DeepSeekUsage };
    return {
        text: json.choices?.[0]?.message?.content ?? '',
        usage: json.usage ?? {},
        inputChars: payload.reduce((n, m) => n + m.content.length, 0),
    };
}

async function handleChat(body: ChatBody, res: ServerResponse, origin: string): Promise<void> {
    const sid = sanitizeSessionId(body.session_id || '');
    const question = String(body.question || '').trim().slice(0, 1000);
    if (!question) { send(res, origin, 400, { error: 'empty question' }); return; }

    let s = sessions.get(sid);
    if (!s) { s = { questions: 0, stamps: [] }; sessions.set(sid, s); }

    if (s.questions >= MAX_QUESTIONS_PER_SESSION) {
        logLine(sid, { type: 'chat_capped', question });
        send(res, origin, 429, { reply: FRIENDLY_CAP, questions_left: 0 });
        return;
    }
    const now = Date.now();
    s.stamps = s.stamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (s.stamps.length >= RATE_MAX_PER_WINDOW) {
        logLine(sid, { type: 'chat_rate_limited', question });
        send(res, origin, 429, { reply: FRIENDLY_BUSY, questions_left: MAX_QUESTIONS_PER_SESSION - s.questions });
        return;
    }
    s.stamps.push(now);
    s.questions++;

    // Stable prefix (persona + concept facts) first — DeepSeek's automatic
    // prefix caching bills the repeated part at the cache-hit rate.
    const system = PERSONA + '\n\nCONCEPT FACTS (the truth for this lesson):\n' + String(body.tutor_context || '').slice(0, 6000);

    const situation = [
        'Where the student is right now:',
        '- lesson phase: ' + String(body.phase || 'unknown'),
        '- simulation state: ' + String(body.state || 'unknown'),
        body.mission_id ? '- current mission: ' + String(body.mission_id) : '',
        readingsLine(body.live_readings),
        'Their recent actions (oldest first): ' + JSON.stringify((body.recent_actions || []).slice(-10)),
    ].filter(Boolean).join('\n');

    const history = (body.recent_messages || []).slice(-6).map((m) => ({
        role: m.role === 'student' ? 'user' : 'assistant',
        content: String(m.text || '').slice(0, 500),
    }));

    const messages = [...history, { role: 'user', content: situation + '\n\nThe student asks: ' + question }];

    try {
        const t0 = Date.now();
        const out = await callDeepSeek(system, messages);
        const latency = Date.now() - t0;
        const cost = computeCost(out.usage);
        logLine(sid, {
            type: 'chat_turn', concept_id: body.concept_id, phase: body.phase, state: body.state,
            mission_id: body.mission_id, question, reply: out.text, usage: out.usage, cost_usd: cost.usd,
            model: MODEL, latency_ms: latency, recent_actions: (body.recent_actions || []).slice(-10),
        });
        // Sacred-table accounting (ai_usage_log). Awaited so a spool/retry is
        // resolved before we answer, but it can never throw.
        await recordUsage({
            sessionId: sid, model: MODEL, usage: out.usage, latencyMs: latency,
            inputChars: out.inputChars, outputChars: out.text.length,
            conceptId: body.concept_id, phase: body.phase, state: body.state,
            missionId: body.mission_id ?? null, question, replyChars: out.text.length,
        });
        console.log('[quicklearn:chat] q#' + s.questions + ' tokens=' + cost.total_tokens +
            ' (cache_hit=' + cost.cache_hit_tokens + ') cost=$' + cost.usd.toFixed(6) +
            (cost.peak ? ' PEAK' : ' off-peak') + ' ' + latency + 'ms');
        send(res, origin, 200, { reply: out.text || FRIENDLY_DOWN, questions_left: MAX_QUESTIONS_PER_SESSION - s.questions });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[quicklearn:chat] ' + msg);
        logLine(sid, { type: 'chat_error', question, error: msg });
        send(res, origin, 200, { reply: FRIENDLY_DOWN, questions_left: MAX_QUESTIONS_PER_SESSION - s.questions });
    }
}

const server = createServer(async (req, res) => {
    const origin = String(req.headers.origin || '');
    if (req.method === 'OPTIONS') { send(res, origin, 204, {}); return; }
    if (req.method !== 'POST') { send(res, origin, 404, { error: 'not found' }); return; }
    let body: ChatBody & { type?: string; payload?: unknown };
    try {
        body = JSON.parse(await readBody(req));
    } catch {
        send(res, origin, 400, { error: 'bad json' });
        return;
    }
    if (req.url === '/api/chat') { await handleChat(body, res, origin); return; }
    if (req.url === '/api/log') {
        logLine(sanitizeSessionId(body.session_id || ''), { type: String(body.type || 'event'), payload: body.payload ?? null });
        send(res, origin, 200, { ok: true });
        return;
    }
    // Local parity with the Edge Function's body.type==='feedback' branch. The
    // prototype only writes locally — the deployed function is what puts real
    // student feedback into simulation_feedback.
    if (req.url === '/api/feedback') {
        logLine(sanitizeSessionId(body.session_id || ''), { type: 'feedback', payload: body });
        console.log('[quicklearn:chat] feedback: helped=' + String((body as Record<string, unknown>).helped) +
            ' again=' + String((body as Record<string, unknown>).would_use_again));
        send(res, origin, 200, { ok: true });
        return;
    }
    send(res, origin, 404, { error: 'not found' });
});

server.listen(PORT, () => {
    console.log('[quicklearn:chat] listening on http://localhost:' + PORT + '  model=' + MODEL + '  key=' + (process.env.DEEPSEEK_API_KEY ? 'present' : 'MISSING'));
    console.log('[quicklearn:chat] logs → ' + LOG_DIR);
    console.log('[quicklearn:chat] usage → ai_usage_log (provider=deepseek, task_type=quicklearn_tutor_chat, actor=' + (process.env.QL_ACTOR || 'quicklearn_test') + ')');
    // Any rows spooled while Supabase was unreachable go up on boot.
    void flushPending();
});
