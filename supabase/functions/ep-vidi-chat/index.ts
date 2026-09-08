/**
 * ep-vidi-chat — Vidi behind the EAPCET Physics finder.
 *
 * A copy of answerbook-vidi-chat (the four fail-closed guards, the one ledger
 * read, the actor labels, the telemetry path) with three things changed for
 * this product:
 *
 *   1. CHAT IS PAID. The entitlement is checked on ep_entitlements (unioned
 *      across the account's devices) BEFORE the ledger read; a locked device
 *      gets {locked:true} and no model call. Because every chatter is an
 *      entitled device, the day cap is PER DEVICE (EP_DEVICE_PER_DAY, default
 *      40) instead of per IP — a per-IP day cap punishes a shared school
 *      network. The per-IP burst limit and the global spend ceiling stay.
 *   2. THE GROUNDING IS BUILT HERE, from ep_solutions by question_id — the
 *      question, the four options, the official key, the verified steps, the
 *      common mistakes, the grounded Answer Book cards — byte-stable per
 *      question so the prompt cache hits and the page can never feed the model
 *      a different answer. The page sends only the question id and where the
 *      student is (picked, probe, weakness, streak).
 *   3. THE PERSONA is this product's: never contradict the official key, never
 *      state a different answer, never solve a question that is not the one
 *      open, say "the worked solution above".
 *
 * Its own task_type ('eapcet_vidi_chat'), so the two products never share a
 * ledger, a budget, or an IP counter; every ledger row carries an actor
 * (eapcet_student | eapcet_team | eapcet_probe | eapcet_local) and
 * metadata.surface = 'eapcet_finder'.
 *
 * Telemetry: the page POSTs {type:'events'} batches; they land in ep_events one
 * row per event via ep_log_events, before the key check, so telemetry works on
 * a day the tutor is resting — and for a locked device, which is most of them.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account:
 *   npx supabase functions deploy ep-vidi-chat --no-verify-jwt --use-api --project-ref <ref>
 *
 *   uses the shared DEEPSEEK_API_KEY
 *   optional: EP_ALLOWED_ORIGINS, EP_DAILY_USD_CAP, EP_IP_PER_MIN,
 *             EP_DEVICE_PER_DAY, EP_IP_SALT, EP_CHAT_MODEL, EP_USD_INR,
 *             EP_PROBE_TOKEN (labels automated probes; never exempts them)
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const DEEPSEEK_KEY = Deno.env.get('DEEPSEEK_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MODEL = Deno.env.get('EP_CHAT_MODEL') ?? 'deepseek-chat';
const DAILY_USD_CAP = Number(Deno.env.get('EP_DAILY_USD_CAP') ?? '2');
const IP_PER_MIN = Number(Deno.env.get('EP_IP_PER_MIN') ?? '4');
const DEVICE_PER_DAY = Number(Deno.env.get('EP_DEVICE_PER_DAY') ?? '40');
const USD_TO_INR = Number(Deno.env.get('EP_USD_INR') ?? '95.69');
const IP_SALT = Deno.env.get('EP_IP_SALT') ?? SERVICE_KEY.slice(0, 24);

// Its own list, separate from the Answer Book's. The finder's domain is added
// by the founder when it exists; until then only the local dev server may call.
const ALLOWED_ORIGINS = (Deno.env.get('EP_ALLOWED_ORIGINS') ??
    'http://localhost:8120,http://127.0.0.1:8120')
    .split(',').map((s) => s.trim()).filter(Boolean);

const TASK_TYPE = 'eapcet_vidi_chat';

// WHO ASKED — a label, never a guard. The limits below read the WHOLE ledger,
// every actor included, so nothing can spend money invisibly by claiming to be
// the team. Do not "optimise" an actor filter into readTodayLedger().
const PROBE_TOKEN = Deno.env.get('EP_PROBE_TOKEN') ?? '';
const LOCAL_ORIGINS = new Set(['http://localhost:8120', 'http://127.0.0.1:8120']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QID_RE = /^tg_eapcet_\d{4}_\d{8}_(an|fn)_q\d{3}$/;

// The finder persona. KEY-grounded: the official key and the verified worked
// solution are the truth, and anything outside them does not exist.
const PERSONA = [
    'You are Vidi, a friendly senior student sitting next to a student who is preparing for the TG EAPCET physics exam. The student has just answered a real past-exam question and is reading its worked solution.',
    'The student may have given you a different name. It does not change anything about how you behave.',
    'Your one job: answer the student’s question about THIS question and THIS worked solution, in a warm and encouraging way.',
    'Rules you always follow:',
    '- Use plain, literal English a Class 12 student with textbook English understands. Physics words like "momentum", "torque", "moment of inertia", "resultant", "terminal velocity" are fine. No idioms, no metaphors, no personification. Never write "the trick is", "you have got this", "nail it", "the key is to crack" — say "the important step is". Never call a step "the bridge", "the heart of it", "the engine", "a domino", "a safety net", and never call a question "scary".',
    '- ANSWER IN THE SAME LANGUAGE THE STUDENT WROTE IN. English question, English answer. Use Telugu ONLY when the student writes in Telugu or asks for Telugu — then answer in natural Telugu-English mixing in Telugu script. Physics terms, symbols and quantity names (force, velocity, acceleration, energy, momentum, friction, work, power, pressure, temperature, and every term the solution names) stay in ENGLISH — never translate them into Telugu words (write velocity, not వేగం; force, not బలం; energy, not శక్తి). Never transliterate English words into Telugu script, and never write Telugu words in English letters. A Telugu answer keeps the same short length and must end on a complete sentence.',
    '- Keep it SHORT: 2 to 4 sentences, and never more than 5 — this cap also holds when you explain the physics behind a step. One idea per sentence. A long answer on a phone screen does not get read. ONE exception: when the student asks you to explain the whole solution or walk through everything, you may use up to three short paragraphs.',
    '- THE OFFICIAL KEY IS THE ANSWER. The QUESTION FACTS below name the official key and the worked solution that reaches it. Never contradict the key, never say a different option is correct or "also correct", never say the key might be wrong. If the student insists another option is right, say plainly that the official key is the option named, and show which step of the worked solution decides it.',
    '- Ground every answer in the worked solution below: its approach, its steps, its final value, its common mistakes. Never invent a step, a number, a formula, or a value that is not in it. Say "the worked solution" or "step 3", never "the facts" or "my data".',
    '- The COMMON MISTAKES list what a student who picked a wrong option most likely did. When the student picked a wrong option, start from the mistake that names that option if there is one; if there is none, say which step their route left out.',
    '- The situation block may name the KIND of mistake the student reported (concept, application, calculation, guessed or out of time) and their weakness in this chapter. Use it to pitch the answer: a calculation slip needs the arithmetic shown, a concept gap needs the idea in one sentence first, a guess needs the deciding step named.',
    '- The only question you can see is the one in the QUESTION FACTS. If the student asks about a DIFFERENT question — by number, by name, or by pasting one — say plainly that you can only see the question that is open, and that they can open the other one from its result screen. Then stop. Never sketch its steps, name its formula, guess its answer, or say which chapter holds it.',
    '- If the student pastes a NEW numerical problem for you to solve, do not solve it. Say which idea from this worked solution applies, in one or two sentences, and stop.',
    '- Write PLAIN TEXT only. No markdown, no asterisks for bold, no bullet characters, no headings. The page shows your words exactly as you type them.',
    '- Never write raw LaTeX or backslash commands. Write fractions, powers and units in plain Unicode (½, x², 10⁻³, m s⁻¹).',
    '- Be positive and encouraging, but never fake. Do NOT end every reply with encouragement — use it when the student sounds worried, and never twice in one reply. A student who asked why step 2 divides by 2 wants the reason, not a cheer.',
    '- NEVER name the machinery. The student cannot see the words "QUESTION FACTS", "situation", "grounding", or "the bank" — those are internal. Say "this question", "the worked solution", "the official key".',
    '- Carry the chat. If the student’s question depends on something said earlier in this conversation, answer for THAT, not the general case.',
    '- If the question is off-topic (not physics, not this exam), answer in one kind sentence and guide them back to the worked solution.',
    '- Never use country-specific examples, brands, festivals, or currencies.',
    '- You are an AI helper. If asked, say so plainly.',
].join('\n');

const FRIENDLY_BUSY = 'Give me a short moment and ask again. Meanwhile, keep reading the worked solution — it works without me.';
const FRIENDLY_DOWN = 'I could not answer just now. The worked solution is still there — keep going, and try me again in a moment.';
const FRIENDLY_CAP = 'You have asked a lot of good questions today — that is the daily limit. The worked solutions all still work.';
const FRIENDLY_QUIET = 'I am resting for today, but every worked solution still works without me. Keep going!';

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

async function rest(path: string, init?: RequestInit): Promise<Response> {
    return await fetch(SUPABASE_URL + '/rest/v1/' + path, {
        ...init,
        headers: {
            apikey: SERVICE_KEY,
            Authorization: 'Bearer ' + SERVICE_KEY,
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });
}

interface LedgerRow {
    created_at: string;
    estimated_cost_usd: string | number | null;
    metadata: { ip_hash?: string; device_id?: string } | null;
}

/** One read of today's ledger answers all three volume guards. */
async function readTodayLedger(): Promise<LedgerRow[] | null> {
    const today = new Date().toISOString().split('T')[0];
    try {
        const res = await rest('ai_usage_log?select=created_at,estimated_cost_usd,metadata' +
            '&task_type=eq.' + TASK_TYPE + '&question_date=eq.' + today + '&limit=5000');
        if (!res.ok) return null;
        return await res.json() as LedgerRow[];
    } catch {
        return null;
    }
}

async function writeUsage(row: Record<string, unknown>): Promise<void> {
    try {
        await rest('ai_usage_log', {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify([row]),
        });
    } catch (e) {
        console.error('[ep-vidi-chat] usage write failed', e);
    }
}

/** Telemetry batch → ep_events, one row per event. Never throws. */
async function writeEvents(body: Record<string, any>, origin: string): Promise<void> {
    const events = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
    if (!events.length) return;
    const deviceId = typeof body.device_id === 'string' && UUID_RE.test(body.device_id) ? body.device_id : null;
    const payload = {
        p_device: deviceId,
        p_session: String(body.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon',
        p_visit: typeof body.visit_id === 'string' ? body.visit_id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || null : null,
        p_internal: body.internal === true || LOCAL_ORIGINS.has(origin),
        p_events: events.map((e: Record<string, unknown>) => {
            const out: Record<string, unknown> = {};
            for (const k of Object.keys(e).slice(0, 12)) {
                const v = e[k];
                out[k] = typeof v === 'string' ? v.slice(0, 200) : v;
            }
            return out;
        }),
    };
    try {
        const res = await rest('rpc/ep_log_events', { method: 'POST', body: JSON.stringify(payload) });
        if (!res.ok) {
            console.error('[ep-vidi-chat] events rpc failed', res.status, (await res.text()).slice(0, 200));
        }
    } catch (e) {
        console.error('[ep-vidi-chat] events write failed', e);
    }
}

/** The ONE definition of "team", shared with the dashboard. Never throws — an
    unreadable answer means "student", the honest, expensive default. */
async function deviceIsInternal(device: string | null): Promise<boolean> {
    if (!device) return false;
    try {
        const res = await rest('rpc/ab_device_is_internal', { method: 'POST', body: JSON.stringify({ p_device: device }) });
        if (!res.ok) return false;
        return (await res.json()) === true;
    } catch {
        return false;
    }
}

// ── the entitlement (the same resolution as ep-state) ───────────────────────
interface EntRow { unit_key: string; source: string; expires_at: string | null }

async function userOf(accessToken: string): Promise<string | null> {
    if (!accessToken || accessToken.length > 4096) return null;
    try {
        const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
            headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + accessToken },
        });
        if (!res.ok) return null;
        const u = await res.json() as { id?: string };
        return typeof u.id === 'string' && UUID_RE.test(u.id) ? u.id : null;
    } catch { return null; }
}

async function devicesOfUser(userId: string, deviceId: string): Promise<string[]> {
    const res = await rest('rpc/ab_link_device', { method: 'POST', body: JSON.stringify({ p_user: userId, p_device: deviceId }) });
    if (!res.ok) return [deviceId];
    const out = await res.json() as { ok?: boolean; devices?: string[] };
    return out.ok && Array.isArray(out.devices) && out.devices.length ? out.devices : [deviceId];
}

/** true = entitled, false = locked, null = the read failed (fail closed). */
async function entitled(deviceId: string, accessToken: string): Promise<boolean | null> {
    const userId = accessToken ? await userOf(accessToken) : null;
    const deviceIds = userId ? await devicesOfUser(userId, deviceId) : [deviceId];
    const list = deviceIds.map((d) => `"${d}"`).join(',');
    const res = await rest(`ep_entitlements?select=unit_key,source,expires_at&unit_key=eq.all&device_id=in.(${list})`);
    if (!res.ok) return null;
    const rows = await res.json() as EntRow[];
    return rows.some((r) => !r.expires_at || Date.parse(r.expires_at) > Date.now());
}

// ── the grounding, built from ep_solutions ──────────────────────────────────
interface SolutionRow {
    qid: string;
    chapter_key: string;
    question: { asked_label?: string; question_en?: string; options_en?: string[]; answer?: number; chapter?: string };
    solution: {
        approach?: string;
        steps?: { text?: string; equation?: string; why_this_step?: string }[];
        final_answer?: { option?: number; value?: string };
        common_mistakes?: { option?: number | null; text?: string }[];
    };
    grounding: { question_id?: string; title?: string; text?: string }[];
    verified: boolean;
}

async function solutionOf(qid: string): Promise<SolutionRow | null | undefined> {
    const res = await rest(`ep_solutions?select=qid,chapter_key,question,solution,grounding,verified&qid=eq.${qid}&verified=is.true`);
    if (!res.ok) return undefined;            // the read failed
    const rows = await res.json() as SolutionRow[];
    return rows[0] ?? null;                   // null = no verified solution for this id
}

/** Byte-stable per question, so DeepSeek's prefix cache hits on every turn. */
function factsOf(row: SolutionRow): string {
    const q = row.question ?? {};
    const s = row.solution ?? {};
    const opts = Array.isArray(q.options_en) ? q.options_en : [];
    const lines: string[] = [];
    lines.push('QUESTION (' + (q.asked_label ?? row.qid) + (q.chapter ? ', chapter: ' + q.chapter : '') + '):');
    lines.push(String(q.question_en ?? ''));
    lines.push('');
    lines.push('OPTIONS:');
    opts.forEach((o, i) => lines.push(`${i + 1}. ${o}`));
    lines.push('');
    lines.push('OFFICIAL KEY: option ' + String(q.answer ?? s.final_answer?.option ?? '?') +
        (s.final_answer?.value ? ' — ' + s.final_answer.value : ''));
    lines.push('');
    lines.push('APPROACH: ' + String(s.approach ?? ''));
    lines.push('');
    lines.push('VERIFIED STEPS:');
    (s.steps ?? []).forEach((st, i) => {
        lines.push(`${i + 1}. ${st.text ?? ''}`);
        if (st.equation) lines.push(`   ${st.equation}`);
        if (st.why_this_step) lines.push(`   Why: ${st.why_this_step}`);
    });
    const mistakes = s.common_mistakes ?? [];
    if (mistakes.length) {
        lines.push('');
        lines.push('COMMON MISTAKES:');
        for (const m of mistakes) {
            lines.push(`- ${m.option ? 'leads to option ' + m.option + ': ' : ''}${m.text ?? ''}`);
        }
    }
    const cards = Array.isArray(row.grounding) ? row.grounding.filter((c) => c && c.text) : [];
    if (cards.length) {
        lines.push('');
        lines.push('GROUNDED CARDS (the concept, from the same chapter of the Answer Book):');
        for (const c of cards.slice(0, 2)) {
            lines.push(`- ${c.title ?? c.question_id ?? ''}: ${String(c.text).slice(0, 900)}`);
        }
    }
    return lines.join('\n');
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { error: 'method not allowed' });

    // Guard 1 — origin allowlist.
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return reply(origin, 403, { error: 'origin not allowed' });
    }
    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[ep-vidi-chat] no service key — refusing (fail closed)');
        return reply(origin, 503, { error: 'unconfigured' });
    }
    let body: Record<string, any>;
    try {
        body = await req.json();
    } catch {
        return reply(origin, 400, { error: 'bad json' });
    }

    // Telemetry needs no model call and no entitlement — handled first.
    if (body.type === 'events') {
        await writeEvents(body, origin);
        return reply(origin, 200, { ok: true });
    }

    const deviceId = typeof body.device_id === 'string' && UUID_RE.test(body.device_id) ? body.device_id : null;
    if (!deviceId) return reply(origin, 400, { error: 'bad device' });
    const qid = typeof body.question_id === 'string' ? body.question_id : '';
    if (!QID_RE.test(qid)) return reply(origin, 400, { error: 'bad question id' });

    // THE LOCK. Before the key check and before the ledger: a locked device
    // never costs a model call and never sees a solution byte in a reply.
    const token = typeof body.access_token === 'string' ? body.access_token : '';
    const ent = await entitled(deviceId, token);
    if (ent === null) {
        console.error('[ep-vidi-chat] entitlement read failed — refusing (fail closed)');
        return reply(origin, 200, { locked: true, reply: FRIENDLY_DOWN, questions_left: 0 });
    }
    if (!ent) return reply(origin, 200, { locked: true, questions_left: 0 });

    if (!DEEPSEEK_KEY) return reply(origin, 200, { reply: FRIENDLY_QUIET, questions_left: 0 });

    const question = String(body.question ?? '').trim().slice(0, 1000);
    if (!question) return reply(origin, 400, { error: 'empty question' });

    // WHO is asking. An unset EP_PROBE_TOKEN must SHUT the door, not open it.
    const isProbe = PROBE_TOKEN.length >= 16 && body.probe_token === PROBE_TOKEN;
    const isLocal = LOCAL_ORIGINS.has(origin);
    const claimsTeam = body.internal === true;
    const internalP = (isProbe || isLocal || claimsTeam)
        ? Promise.resolve(false)
        : deviceIsInternal(deviceId);

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
        req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await sha256Hex(IP_SALT + '|' + rawIp);

    // Guards 2–4 from one ledger read. An unreadable ledger means we cannot
    // prove we are under budget, so we refuse. EVERY actor counts.
    const ledger = await readTodayLedger();
    if (ledger === null) {
        console.error('[ep-vidi-chat] ledger unreadable — refusing (fail closed)');
        return reply(origin, 200, { reply: FRIENDLY_DOWN, questions_left: 0 });
    }
    let spentToday = 0;
    let deviceDay = 0;
    let ipMinute = 0;
    const nowMs = Date.now();
    for (const r of ledger) {
        spentToday += Number(r.estimated_cost_usd ?? 0);
        if (r.metadata?.device_id === deviceId) deviceDay++;
        if (r.metadata?.ip_hash === ipHash && nowMs - new Date(r.created_at).getTime() < 60_000) ipMinute++;
    }
    if (spentToday >= DAILY_USD_CAP) {
        console.warn('[ep-vidi-chat] daily spend cap hit: $' + spentToday.toFixed(4));
        return reply(origin, 200, { reply: FRIENDLY_QUIET, questions_left: 0 });
    }
    if (deviceDay >= DEVICE_PER_DAY) return reply(origin, 200, { reply: FRIENDLY_CAP, questions_left: 0 });
    if (ipMinute >= IP_PER_MIN) return reply(origin, 200, { reply: FRIENDLY_BUSY, questions_left: DEVICE_PER_DAY - deviceDay });

    // The grounding, from the row the release file wrote. Never from the page.
    const row = await solutionOf(qid);
    if (row === undefined) {
        console.error('[ep-vidi-chat] solution read failed — refusing (fail closed)');
        return reply(origin, 200, { reply: FRIENDLY_DOWN, questions_left: DEVICE_PER_DAY - deviceDay });
    }
    if (row === null) return reply(origin, 200, { reply: 'This question has no worked solution yet, so I cannot help with it. Pick another from your result screen.', questions_left: DEVICE_PER_DAY - deviceDay });

    const facts = factsOf(row);
    const system = PERSONA + '\n\nQUESTION FACTS (the truth for this question):\n' + facts.slice(0, 14_000);

    // Per-request steering sits NEXT TO the question, where the model obeys it.
    const teluguAsk = /[ఀ-౿]/.test(question) || /\b(telugu|telugulo|cheppu|cheppandi)\b/i.test(question);
    const walkthroughAsk = /\b(whole solution|whole answer|walk (me )?through|explain everything|step by step)\b/i.test(question);

    const picked = Number.isInteger(body.picked) && body.picked >= 1 && body.picked <= 4 ? Number(body.picked) : null;
    const key = Number(row.question?.answer ?? row.solution?.final_answer?.option ?? 0);
    const PROBE_WORD: Record<string, string> = {
        sure: 'answered correctly and was sure',
        guessed: 'answered correctly but says they guessed',
        concept: 'answered wrongly and says they did not know the concept',
        application: 'answered wrongly and says they knew the concept but could not see how to apply it',
        calculation: 'answered wrongly and says the calculation slipped',
        time: 'answered wrongly and says they guessed or ran out of time',
    };
    const probe = typeof body.probe === 'string' && PROBE_WORD[body.probe] ? body.probe : '';
    const weakness = typeof body.weakness === 'string' && /^(concept|application|calculation|time)$/.test(body.weakness) ? body.weakness : '';
    const streak = Number.isInteger(body.streak) ? Number(body.streak) : null;

    const situation = [
        'Where the student is right now:',
        picked ? `- they picked option ${picked}; the official key is option ${key}` + (picked === key ? ' (correct)' : ' (wrong)') : '- they have not picked an option in this sitting',
        probe ? `- they ${PROBE_WORD[probe]}` : '',
        weakness ? `- in this chapter their weakness is: ${weakness}` : '',
        streak !== null && streak > 0 ? `- on similar questions they are ${streak} correct-and-sure in a row (3 makes it "strong now")` : '',
        '- the only question you can see is the one in the QUESTION FACTS. A different question, or a new problem to solve, gets the two-sentence answer the rules give, and then you stop.',
        walkthroughAsk ? '- reply length: at most three paragraphs, and at most three sentences in each paragraph' : '- reply length: at most 5 sentences, one idea each',
        teluguAsk ? '- language: write the Telugu words in TELUGU SCRIPT, never Telugu in Latin letters. Only the physics terms stay in English — velocity, speed, force, energy, mass, acceleration, momentum, friction, work, power, pressure, temperature, wavelength, frequency, charge, current, resistance, nucleus.' : '',
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

    const maxTokens = teluguAsk ? 800 : (walkthroughAsk ? 500 : 300);
    const t0 = Date.now();
    let text = '';
    let usage: Usage = {};
    try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + DEEPSEEK_KEY },
            body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature: 0.7, stream: false }),
        });
        if (!res.ok) throw new Error('DeepSeek ' + res.status + ': ' + (await res.text()).slice(0, 200));
        const json = await res.json();
        text = json.choices?.[0]?.message?.content ?? '';
        usage = json.usage ?? {};
    } catch (e) {
        console.error('[ep-vidi-chat] ' + (e instanceof Error ? e.message : String(e)));
        return reply(origin, 200, { reply: FRIENDLY_DOWN, questions_left: DEVICE_PER_DAY - deviceDay });
    }

    const latency = Date.now() - t0;
    const when = new Date();
    const cost = computeCost(usage, when);
    const inputChars = messages.reduce((n, m) => n + m.content.length, 0);

    const deviceInternal = await internalP;
    const actor = isProbe ? 'eapcet_probe'
        : isLocal ? 'eapcet_local'
            : (deviceInternal || claimsTeam) ? 'eapcet_team'
                : 'eapcet_student';
    const actorReason = isProbe ? 'probe_token'
        : isLocal ? 'origin_localhost'
            : deviceInternal ? 'device_flag'
                : claimsTeam ? 'client_claim'
                    : 'none';

    await writeUsage({
        session_id: String(body.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon',
        task_type: TASK_TYPE,
        provider: 'deepseek',
        model: MODEL,
        input_chars: inputChars,
        output_chars: text.length,
        latency_ms: latency,
        estimated_cost_usd: cost.usd,
        fingerprint_key: qid + '|eapcet_finder|student_question',
        was_cache_hit: cost.hit > 0,
        question_date: when.toISOString().split('T')[0],
        actor,
        metadata: {
            surface: 'eapcet_finder',
            actor_reason: actorReason,
            device_internal: deviceInternal,
            device_id: deviceId,
            question_id: qid,
            chapter_key: row.chapter_key,
            picked,
            probe: probe || null,
            weakness: weakness || null,
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
        questions_left: Math.max(0, DEVICE_PER_DAY - deviceDay - 1),
    });
});
