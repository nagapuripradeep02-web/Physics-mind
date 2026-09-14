/**
 * answerbook-vidi-chat — the public Vidi endpoint behind the IPE Answer Book
 * (docs/ANSWER_BOOK_VIDI_DESIGN.md, Rung 2).
 *
 * Sibling of the Quick Learn function (physics-mind-quick-learn
 * supabase/functions/quicklearn-chat) — same four fail-closed guards, its OWN
 * task_type, so the two products never share a ledger, a budget, or an IP
 * counter. The bank stays the brain: the page sends the authored answer
 * (steps, marks, why lines) as ANSWER FACTS, and the model presents them —
 * it never invents a step, a mark value, or a mark split (Rule 17/18 shape).
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account. It
 * fails CLOSED on all four guards:
 *   1. Origin must be in AB_ALLOWED_ORIGINS.
 *   2. Per-IP burst limit  (AB_IP_PER_MIN, default 4/min).
 *   3. Per-IP daily limit  (AB_IP_PER_DAY, default 40/day).
 *   4. GLOBAL daily spend ceiling (AB_DAILY_USD_CAP, default $2/day). No key,
 *      or an unreadable ledger, means every request is refused.
 * All four are enforced against ai_usage_log itself — the ledger IS the
 * rate-limit source of truth, so there is no second state store to drift.
 *
 * Raw IPs are never stored — only a salted SHA-256 hash, for rate limiting.
 *
 * Telemetry: the page also POSTs {type:'events'} batches (opens, reading depth,
 * chip taps, paywall hits). They need no model call, cost nothing, and land in
 * ab_events ONE ROW PER EVENT via ab_log_events — handled before the key check,
 * so telemetry works even on a day the tutor is resting. Each batch carries the
 * device, the visit and the team flag, which is how the usage dashboard tells a
 * student apart from us. (Until 2026-09-02 this wrote one opaque blob per batch
 * into simulation_feedback; those 57 rows stay untouched — sacred table.)
 *
 *   supabase secrets set DEEPSEEK_API_KEY=...
 *   optional: AB_ALLOWED_ORIGINS, AB_DAILY_USD_CAP, AB_IP_PER_MIN,
 *             AB_PROBE_TOKEN (labels automated probes; never exempts them),
 *             AB_IP_PER_DAY, AB_IP_SALT, AB_CHAT_MODEL, AB_USD_INR
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const DEEPSEEK_KEY = Deno.env.get('DEEPSEEK_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MODEL = Deno.env.get('AB_CHAT_MODEL') ?? 'deepseek-chat';
const DAILY_USD_CAP = Number(Deno.env.get('AB_DAILY_USD_CAP') ?? '2');
const IP_PER_MIN = Number(Deno.env.get('AB_IP_PER_MIN') ?? '4');
const IP_PER_DAY = Number(Deno.env.get('AB_IP_PER_DAY') ?? '40');
const USD_TO_INR = Number(Deno.env.get('AB_USD_INR') ?? '95.69');
const IP_SALT = Deno.env.get('AB_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
// Origin stops the endpoint being embedded on someone else's page — a browser
// cannot forge Origin. It is NOT the boundary against a scripted attacker
// (curl sends any Origin); the per-IP limits and the global spend ceiling are.
// localhost:8100 is `npm run serve:answers`, so the founder can test the
// hosted build locally against the real function.
const ALLOWED_ORIGINS = (Deno.env.get('AB_ALLOWED_ORIGINS') ??
    'https://answers.viditra.co,https://viditra.co,https://www.viditra.co,http://localhost:8100,http://127.0.0.1:8100,http://localhost:8101,http://127.0.0.1:8101')
    .split(',').map((s) => s.trim()).filter(Boolean);

const TASK_TYPE = 'answerbook_vidi_chat';

// ── WHO ASKED (2026-09-02) ──────────────────────────────────────────────────
// Every ledger row carries an `actor`:
//   answerbook_student — a real ask, no team signal anywhere (the default)
//   answerbook_team    — the device, or its Google account, is marked team
//   answerbook_probe   — an automated script carrying AB_PROBE_TOKEN
//   answerbook_local   — served from localhost (someone testing a hosted build)
// metadata.actor_reason records WHICH signal decided it, because three of the
// four are client-supplied and therefore forgeable.
//
// THIS IS A LABEL, NEVER A GUARD. The four limits below still read the WHOLE
// ledger, every actor included, so nothing can spend money invisibly by
// claiming to be the team. Do not "optimise" an actor filter into
// readTodayLedger(): that would quietly raise our own rate limits and hand a
// spoofer a free budget.
const PROBE_TOKEN = Deno.env.get('AB_PROBE_TOKEN') ?? '';
// A deliberate subset of ALLOWED_ORIGINS, kept LITERAL so that widening the
// allowlist can never silently reclassify a real domain as "local".
const LOCAL_ORIGINS = new Set([
    'http://localhost:8100', 'http://127.0.0.1:8100',
    'http://localhost:8101', 'http://127.0.0.1:8101',
    'http://localhost:8102', 'http://127.0.0.1:8102',
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The Answer Book persona. The Quick Learn persona is sim-grounded ("what the
// student is looking at"); this one is MARK-SCHEME-grounded. The load-bearing
// rule is the same shape as Quick Learn's apparatus rule: the FACTS below are
// the truth, and anything outside them does not exist.
const PERSONA = [
    'You are Vidi, a friendly senior student sitting next to a school student who is preparing for their board exam with a written model answer.',
    'The student may have given you a different name. It does not change anything about how you behave.',
    'Your one job: answer the student’s question about THIS question and THIS model answer, in a warm and encouraging way.',
    'Rules you always follow:',
    '- Use plain, literal English a Class 11 student with textbook English understands. Subject words like "resultant", "determinant", "equilibrium", "meristem", "placentation" are fine. No idioms, no metaphors, no personification. Never write "the trick is", "you have got this", "nail it", "the key is to crack" — say "the important step is". No explanatory metaphors either: never call a step "the bridge", "the heart of it", "the engine", "a domino", "a safety net", and never call a question "scary".',
    '- ANSWER IN THE SAME LANGUAGE THE STUDENT WROTE IN. English question, English answer. Use Telugu ONLY when the student writes in Telugu or asks for Telugu — then answer in natural Telugu-English mixing in Telugu script. Subject terms, symbols and defined names (force, velocity, acceleration, energy, momentum, friction, work, power, and every term the answer defines) stay in ENGLISH — never translate them into Telugu words (write velocity, not వేగం; force, not బలం; energy, not శక్తి; mass, not ద్రవ్యరాశి). Never transliterate English words into Telugu script, and never write Telugu words in English letters. A Telugu answer keeps the same short length and must end on a complete sentence.',
    '- Keep it SHORT: 2 to 4 sentences, and never more than 5 — this cap also holds when you explain the physics behind something or give a way to remember it. One idea per sentence. A long answer on a phone screen does not get read. ONE exception: when the student asks you to explain the whole answer or walk through everything, you may use up to three short paragraphs.',
    '- Star ranks: the bank marks every question 0 to 3 stars for HOW OFTEN the boards ask it — 3-star means asked very often. Stars are about exam frequency, never difficulty.',
    '- Never promise that a question will appear in the exam. Say what the stars and the asked years support, and no more.',
    '- Stars and asked years are different facts. If the ANSWER FACTS carry no "Asked:" line, never say the question has appeared in past exams — say the book ranks it by stars and no asked years are listed.',
    '- THE APP AROUND YOU (answer honestly about it when asked): the page writes the model answer step by step as the student taps it; after the student FIRST marks a planned question revised, a box appears in this chat where they can give you a new name; "All questions" opens the catalog of every chapter, and filtering one chapter shows the most-asked list plus a link to the 15-minute exam-eve revision list; the buttons under this chat are ready-made questions they can tap.',
    '- Write PLAIN TEXT only. No markdown, no asterisks for bold, no bullet characters, no headings. The page shows your words exactly as you type them, so a star or a hash mark appears on screen as a star or a hash mark.',
    '- Be positive and encouraging, but never fake. Do NOT end every reply with encouragement — use it when the student sounds worried, not as a sign-off, and never twice in one reply. A student who asked how many marks a step is worth wants the number, not a cheer.',
        '- NEVER name the machinery. The student cannot see the words "ANSWER FACTS", a step id such as s4_find_r, "the bank", or "the facts I hold" — those are internal and mean nothing to them. Say "this answer" or "the book". If something is not listed, say the book does not list it.',
        '- Never write raw LaTeX or backslash commands. The page prints your words exactly, so \\begin{bmatrix} and \\frac reach the student as those literal characters. Write matrices and fractions in plain Unicode.',
    '- Carry the chat. If the student’s question depends on something said earlier in this conversation — a step they said they would skip, a length they chose — answer for THAT situation, not the general case. Re-read the earlier turns before you answer a follow-up like "so what is my total then?".',
    '- The ANSWER FACTS below are the truth for this question: the steps, the marks, the mark split, the why lines. Ground every answer in them and never contradict them.',
    '- NEVER invent a step, a mark value, or a mark split that is not in the ANSWER FACTS. Marks come from the bank, not from you. If asked how marks are given, quote the split as written.',
    '- Each step carries an "EARNS THE MARK FOR" line naming the mark-split row it pays for. Use it to say which step earns which mark. When two steps share one mark-split row, quote that row’s own mark once — never assume each step is one mark. Never state a total the bank does not state.',
    '- If the student asks what happens when they SKIP a step: they lose that step’s marks, and the minimum they must write is the OTHER steps — never the skipped step itself. Name the remaining steps and the marks those steps still earn.',
    '- The mark split is the source book’s, not a rubric issued by the board. Present it as the book’s split. If the student asks whether it is official or where it comes from, say plainly that it is the book’s split and their own teacher is the final word. Do not raise this when they did not ask.',
    '- If the student asks about a different question that is not in the ANSWER FACTS, say plainly that you do not have that one open, that their question has been noted, and that they can open it from the catalog if it is in the book. Then stop — a question you cannot see is one you know nothing about, so never sketch its steps, name its formulas, say which chapter holds it, or say what earns marks in it.',
    '- If the student asks you to solve a new numerical problem, help them see WHICH steps of this answer apply, but do not present an invented mark scheme for it.',
    '- If the question is off-topic (not a subject in this book, not this exam), answer in one kind sentence and guide them back to the answer.',
    '- Never use country-specific examples, brands, festivals, or currencies.',
    '- You are an AI helper. If asked, say so plainly.',
    '- A "their study plan" line may appear in the situation. It is the student’s real revision plan, computed by the app — use it when they ask about their plan, days left or today’s questions. Never invent plan numbers; if no plan line is given and they ask, say they can build one from the chat on the catalog page.',
    '- If the student says they have already finished a question type (for example all long answers) or only wants to prepare some types, tell them to tap "Change my plan" under this chat — the app re-plans for them. Never change the plan yourself. That button only re-plans by question type or starts over; it cannot add one named question to a revision list, so never tell a student it can.',
].join('\n');

const FRIENDLY_BUSY = 'Give me a short moment and ask again. Meanwhile, keep writing — the book works without me.';
const FRIENDLY_DOWN = 'I could not answer just now. The answer book still works — keep going, and try me again in a moment.';
const FRIENDLY_CAP = 'You have asked a lot of good questions today — that is the daily limit. Keep practising; the answers all still work.';
const FRIENDLY_QUIET = 'I am resting for today, but the whole answer book still works without me. Keep going!';

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
        console.error('[answerbook-vidi-chat] usage write failed', e);
    }
}

/**
 * Telemetry batch → ab_events, ONE ROW PER EVENT via ab_log_events (2026-09-02).
 * It used to be one blob per batch in simulation_feedback, which no query could
 * group, count or exclude; the 57 historical rows there stay untouched (sacred).
 * Never throws — a failed write must not break the page.
 */
async function writeEvents(body: Record<string, any>, origin: string): Promise<void> {
    const events = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
    if (!events.length) return;
    const deviceId = typeof body.device_id === 'string' && UUID_RE.test(body.device_id) ? body.device_id : null;
    const payload = {
        p_device: deviceId,
        p_session: String(body.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon',
        p_visit: typeof body.visit_id === 'string' ? body.visit_id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || null : null,
        // Only a literal true is a claim; a device already flagged server-side
        // stays flagged regardless of what the page sends. A localhost origin
        // is someone serving a build on their own machine — never a student.
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
        const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/ab_log_events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SERVICE_KEY,
                Authorization: 'Bearer ' + SERVICE_KEY,
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            console.error('[answerbook-vidi-chat] events rpc failed', res.status, (await res.text()).slice(0, 200));
        }
    } catch (e) {
        console.error('[answerbook-vidi-chat] events write failed', e);
    }
}

/**
 * The ONE definition of "team", shared with the dashboard: the device's own
 * flag OR a Google account listed in ab_accounts_internal. Never throws — an
 * unreadable answer means "student", which is the honest, expensive default.
 */
async function deviceIsInternal(device: string | null): Promise<boolean> {
    if (!device) return false;
    try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/ab_device_is_internal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SERVICE_KEY,
                Authorization: 'Bearer ' + SERVICE_KEY,
            },
            body: JSON.stringify({ p_device: device }),
        });
        if (!res.ok) return false;
        return (await res.json()) === true;
    } catch {
        return false;
    }
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { error: 'method not allowed' });

    // Guard 1 — origin allowlist.
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return reply(origin, 403, { error: 'origin not allowed' });
    }
    let body: Record<string, any>;
    try {
        body = await req.json();
    } catch {
        return reply(origin, 400, { error: 'bad json' });
    }

    // Telemetry needs no model call — handled before the key check and the
    // spend guards, so it works even on a day the tutor is resting.
    if (body.type === 'events') {
        await writeEvents(body, origin);
        return reply(origin, 200, { ok: true });
    }

    if (!DEEPSEEK_KEY) return reply(origin, 200, { reply: FRIENDLY_QUIET, questions_left: 0 });

    const question = String(body.question ?? '').trim().slice(0, 1000);
    if (!question) return reply(origin, 400, { error: 'empty question' });

    // WHO is asking. An unset AB_PROBE_TOKEN must SHUT the door, not open it —
    // without the length test, a body sending `probe_token: ""` would classify
    // every ask as an automated probe.
    const deviceId = typeof body.device_id === 'string' && UUID_RE.test(body.device_id) ? body.device_id : null;
    const isProbe = PROBE_TOKEN.length >= 16 && body.probe_token === PROBE_TOKEN;
    const isLocal = LOCAL_ORIGINS.has(origin);
    const claimsTeam = body.internal === true;
    // Started HERE, awaited just before the ledger write, so it overlaps the
    // ledger read AND the DeepSeek call — the lookup costs a student no time.
    // Skipped entirely when a cheaper signal has already decided the answer.
    const internalP = (isProbe || isLocal || claimsTeam)
        ? Promise.resolve(false)
        : deviceIsInternal(deviceId);

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
        req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await sha256Hex(IP_SALT + '|' + rawIp);

    // Guards 2–4 — all computed from one ledger read. An unreadable ledger
    // means we cannot prove we are under budget, so we refuse (fail closed).
    // EVERY actor counts here: a team ask costs the same dollar a student's
    // does, so team and probe rows are labelled differently but never exempt.
    const ledger = await readTodayLedger();
    if (ledger === null) {
        console.error('[answerbook-vidi-chat] ledger unreadable — refusing (fail closed)');
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
        console.warn('[answerbook-vidi-chat] daily spend cap hit: $' + spentToday.toFixed(4));
        return reply(origin, 200, { reply: FRIENDLY_QUIET, questions_left: 0 });
    }
    if (ipDay >= IP_PER_DAY) return reply(origin, 200, { reply: FRIENDLY_CAP, questions_left: 0 });
    if (ipMinute >= IP_PER_MIN) return reply(origin, 200, { reply: FRIENDLY_BUSY, questions_left: IP_PER_DAY - ipDay });

    // Stable prefix first (persona + answer facts) so DeepSeek's automatic
    // prompt cache hits — a cached prefix costs ~1/30th of a miss. The slice is
    // 14,000 (not Quick Learn's 6,000): the largest LAQ context measures ~10.4K
    // and a silent truncation of the tail steps would un-ground the model.
    const rawFacts = String(body.tutor_context ?? '');
    // The slice below is silent by construction, so say it out loud. The widest
    // context in the bank measures 10,421 chars (Physics-II, torque on a loop) — it
    // was 7,687 when this cap was first set at 10,000, and four cards had quietly
    // crossed it by 2026-08-30, losing their last step's supporting text on the live
    // site with no visible symptom. The cap is a ceiling, not a pad: raising it costs
    // nothing on the contexts already below it. Re-measure before adding a paper.
    if (rawFacts.length > 12_000) {
        console.warn('answerbook_vidi_chat: tutor_context ' + rawFacts.length +
            ' chars for ' + String(body.question_id ?? '?') + ' — near the 14,000 slice');
    }
    const system = PERSONA + '\n\nANSWER FACTS (the truth for this question):\n' +
        rawFacts.slice(0, 14_000);

    // Per-request steering sits NEXT TO the question, where the model actually
    // obeys it: the persona's own 5-sentence cap was ignored on 71% of "explain
    // the physics" asks and the Telugu term rule on ~half of Telugu asks (audit
    // 2026-08-24). These lines are per-request, so the cached prefix is untouched.
    const teluguAsk = /[ఀ-౿]/.test(question) || /\b(telugu|telugulo|cheppu|cheppandi)\b/i.test(question);
    // "full answer" is deliberately NOT a trigger: it is the phrasing of the
    // out-of-bank ask ("the full answer for the ideal gas equation"), and
    // granting three paragraphs to a REFUSAL took those over the cap 68% of the
    // time (measured 2026-08-24). The remaining phrases only fit the open card.
    const walkthroughAsk = /\b(whole answer|walk (me )?through|explain everything|step by step)\b/i.test(question);
    // The bank spans four papers and the question id names which. A Maths-1A student
    // asking in Telugu was handed the PHYSICS term whitelist (velocity, force, energy)
    // — the wrong instruction for every card they will ever open. Derived per request,
    // so the cached persona prefix is untouched: the 2026-08-24 audit measured that a
    // cached-prefix rule is weak and the same words next to the question are obeyed.
    // Physics resolves to exactly the string it carried before, so its measured
    // baseline is unmoved.
    const qid = String(body.question_id ?? '');
    const subjectKey = qid.startsWith('ts_ipe_m1a_') ? 'mathematics'
        : qid.startsWith('ts_ipe_m1b_') ? 'mathematics_1b'
            : qid.startsWith('ts_ipe_c1_') ? 'chemistry'
                : qid.startsWith('ts_ipe_p2_') ? 'physics_2'
                    : qid.startsWith('ts_ipe_c2_') ? 'chemistry_2'
                        : qid.startsWith('ts_ipe_m2a_') ? 'mathematics_2a'
                            : qid.startsWith('ts_ipe_m2b_') ? 'mathematics_2b'
                                // Botany and zoology — both years — fell through to PHYSICS until
                                // 2026-09-04: a Botany-II student asking in Telugu was handed the
                                // physics term list, and the situation line told the model nothing
                                // about the subject at all. Four papers, four rungs, no fall-through.
                                : qid.startsWith('ts_ipe_b1_') ? 'botany'
                                    : qid.startsWith('ts_ipe_b2_') ? 'botany_2'
                                        : qid.startsWith('ts_ipe_z1_') ? 'zoology'
                                            : qid.startsWith('ts_ipe_z2_') ? 'zoology_2' : 'physics';
    const SUBJECT_WORD: Record<string, string> = {
        physics: 'physics', chemistry: 'chemistry', chemistry_2: 'chemistry',
        mathematics: 'mathematics', mathematics_1b: 'mathematics', mathematics_2a: 'mathematics',
        mathematics_2b: 'mathematics',
        physics_2: 'physics',
        botany: 'botany', botany_2: 'botany', zoology: 'zoology', zoology_2: 'zoology',
    };
    const SUBJECT_LABEL: Record<string, string> = {
        physics: 'Physics', chemistry: 'Chemistry', chemistry_2: 'Chemistry-II',
        mathematics: 'Maths-1A', mathematics_1b: 'Maths-1B', mathematics_2a: 'Maths-2A',
        mathematics_2b: 'Maths-2B',
        physics_2: 'Physics II',
        // The settled catalog convention: the first-year paper keeps the bare name.
        botany: 'Botany', botany_2: 'Botany-II', zoology: 'Zoology', zoology_2: 'Zoology-II',
    };
    const SUBJECT_TERMS: Record<string, string> = {
        physics: 'velocity, speed, force, energy, mass, acceleration, momentum, friction, work, power, gravitational',
        chemistry: 'atom, orbital, bond, mole, oxidation, reduction, equilibrium, enthalpy, entropy, catalyst',
        chemistry_2: 'solid state, unit cell, molarity, colligative, electrode potential, cell, rate of reaction, order, adsorption, colloid, ore, halogen, transition metal, ligand, polymer, monomer, carbohydrate, protein, amine, alcohol, phenol, aldehyde, ketone',
        mathematics: 'function, domain, range, matrix, determinant, inverse, vector, identity, period, triangle',
        mathematics_1b: 'locus, straight line, slope, plane, direction cosines, direction ratios, pair of lines, transformation',
        mathematics_2b: 'circle, centre, radius, chord, tangent, normal, radical axis, parabola, focus, directrix, ellipse, hyperbola, eccentricity, latus rectum, integral, integration, reduction formula, definite integral, area, differential equation, order, degree, homogeneous, integrating factor',
        physics_2: 'wavelength, frequency, refraction, lens, interference, charge, potential, capacitance, current, resistance, magnetic field, induction, photon, nucleus, semiconductor, diode, transistor',
        mathematics_2a: 'complex number, modulus, argument, conjugate, cis, cube roots of unity, quadratic expression, discriminant, roots, permutation, combination, binomial coefficient, general term, partial fraction, mean deviation, variance, probability, conditional probability, random variable, binomial distribution, Poisson distribution',
        // Biology term lists follow each paper's own unit names (units.json), the way the
        // physics_2 and chemistry_2 lists follow theirs.
        botany: 'species, genus, taxonomy, algae, fungi, bryophyte, pteridophyte, gymnosperm, angiosperm, root, stem, leaf, inflorescence, flower, fruit, seed, pollination, fertilisation, cell, nucleus, chromosome, mitosis, meiosis, tissue, xylem, phloem, ecosystem',
        botany_2: 'diffusion, osmosis, transpiration, xylem, phloem, mineral, nitrogen fixation, enzyme, substrate, photosynthesis, chlorophyll, Calvin cycle, respiration, glycolysis, Krebs cycle, ATP, auxin, gibberellin, cytokinin, bacteria, virus, plasmid, gene, allele, dominant, recessive, chromosome, DNA, RNA, replication, transcription, translation, restriction enzyme, PCR, vector, Bt cotton, biofertiliser, antibiotic',
        zoology: 'phylum, class, species, symmetry, coelom, tissue, epithelium, connective tissue, cockroach, earthworm, frog, locomotion, reproduction, parasite, malaria, ecosystem, pollution, adaptation',
        zoology_2: 'digestion, enzyme, absorption, breathing, haemoglobin, blood, heart, cardiac cycle, kidney, nephron, urine, muscle, bone, joint, neuron, nerve, brain, hormone, gland, antibody, antigen, immunity, vaccine, testis, ovary, menstrual cycle, fertilisation, gene, allele, chromosome, mutation, evolution, natural selection, fossil, poultry, dairy',
    };
    const subjectWord = SUBJECT_WORD[subjectKey];
    const subjectTerms = SUBJECT_TERMS[subjectKey];

    // The ANSWER FACTS list steps as `N. [step_id] Label — NM`. The situation used to
    // hand the model the raw step_id, and the model echoed it: replies told students to
    // "skip the last step (s2_compute)". Round 2 (2026-08-30) measured a persona rule
    // forbidding that and the leak did NOT fall — 4 per 5,280 replies became 9 — so the
    // rule was withdrawn and the id is simply no longer offered here. A step is named
    // the way the student sees it: its number and its label.
    const stepHuman = (facts: string, id: string): string => {
        for (const line of facts.split('\n')) {
            const m = line.match(/^\s*(\d+)\.\s*\[([^\]]+)\]\s*([^—-]*)/);
            if (m && m[2].trim() === id) {
                const label = m[3].trim();
                return label ? 'step ' + m[1] + ', "' + label + '"' : 'step ' + m[1];
            }
        }
        return 'the step they are on';
    };

    const situation = [
        'Where the student is right now:',
        '- question: ' + String(body.question_id ?? 'unknown'),
        '- unit: ' + String(body.unit ?? 'unknown'),
        '- answer length on screen: ' + String(body.cut_key ?? 'full'),
        body.plan_status ? '- their study plan: ' + String(body.plan_status).slice(0, 400) : '',
        body.step_id ? '- the step they last revealed: ' + stepHuman(rawFacts, String(body.step_id)) + '. If they ask why THIS step is here, how to remember THIS step, or what it earns, answer about that step and not about the answer as a whole.' : '- they have not started writing yet',
        '- the only question you can see is the one named above. If the student asks you for a DIFFERENT question, say you do not have that one open, that you have noted it, and that they can open it from the catalog. Then STOP. Do not outline it, do not name its steps or formulas, do not say which chapter holds it, do not say what an examiner wants in it, and do not give study advice about it — you cannot see it, so anything you add is a guess. Two sentences is the whole reply, and then you stop: do not go on to talk about the question that IS open, do not summarise it, and do not offer anything about it. The student can see it in front of them and will ask if they want it.',
        walkthroughAsk ? '- reply length: at most three paragraphs, and at most three sentences in each paragraph' : '- reply length: at most 5 sentences, one idea each',
        subjectKey !== 'physics' ? '- subject: this is a ' + SUBJECT_LABEL[subjectKey] + ' question. Its own subject words are the plain words here — ' + subjectTerms + '. Use them.' : '',
        teluguAsk ? '- language: write the Telugu words in TELUGU SCRIPT, never Telugu in Latin letters. Only the ' + subjectWord + ' terms stay in English — ' + subjectTerms + '.' : '',
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

    // Telugu spends roughly 3x the tokens per sentence, and 300 truncated 34% of
    // Telugu replies mid-sentence (measured audit, 2026-08-24). A walkthrough is
    // allowed three paragraphs, which 300 also cut off. Ordinary asks stay at 300.
    //
    // 500 -> 800 for Telugu (2026-08-25). At 500 the chemistry corpus still lost 3
    // of 204 Telugu replies mid-word, each dropping whole mark-carrying properties
    // from an answer a student was revising from. The dead replies stopped at
    // 720-782 chars while survivors reach 905, so the cap binds on token density,
    // not on answer length -- two of the three were 4-mark questions, so scaling by
    // marks would have missed them. 800 leaves ~60% headroom over the longest
    // surviving reply. Walkthroughs keep 500: zero truncation in 1,836 non-Telugu
    // replies, so raising them would cost tokens on every call and buy nothing.
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
        console.error('[answerbook-vidi-chat] ' + (e instanceof Error ? e.message : String(e)));
        return reply(origin, 200, { reply: FRIENDLY_DOWN, questions_left: IP_PER_DAY - ipDay });
    }

    const latency = Date.now() - t0;
    const when = new Date();
    const cost = computeCost(usage, when);
    const inputChars = messages.reduce((n, m) => n + m.content.length, 0);

    // Resolved now: the lookup started before the ledger read and has been
    // running throughout the model call, so this await is already settled.
    // Precedence is cheapest-and-most-trustworthy first — a device flag is
    // server-side state, a client claim is not.
    const deviceInternal = await internalP;
    const actor = isProbe ? 'answerbook_probe'
        : isLocal ? 'answerbook_local'
            : (deviceInternal || claimsTeam) ? 'answerbook_team'
                : 'answerbook_student';
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
        fingerprint_key: body.question_id ? String(body.question_id) + '|answer_book|student_question' : null,
        was_cache_hit: cost.hit > 0,
        question_date: when.toISOString().split('T')[0],
        actor,
        metadata: {
            surface: 'answer_book',
            // WHICH signal decided the actor. Kept because three of the four
            // are forgeable: a wrong call can be re-derived and re-labelled
            // later, which a bare boolean would make impossible.
            actor_reason: actorReason,
            device_internal: deviceInternal,
            question_id: body.question_id ?? null,
            unit: body.unit ?? null,
            cut_key: body.cut_key ?? null,
            step_id: body.step_id ?? null,
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
