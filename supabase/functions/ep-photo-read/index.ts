/**
 * ep-photo-read — reads a photo of a student's handwritten working for one
 * EAPCET question and returns a tick-list the student confirms.
 *
 * A copy of ep-vidi-chat's guard ladder (origin allowlist, service key, the
 * lock, one ledger read for the three volume caps, actor labels, telemetry)
 * with the model swapped for Gemini 2.5 Flash vision and three things of its
 * own:
 *
 *   1. THE BODY IS CAPPED before it is parsed: EP_PHOTO_MAX_BYTES (1.5 MB) on
 *      Content-Length, then again on the decoded image. The page downsizes a
 *      photo to 1600 px JPEG before it sends, so a real photo is 200–600 KB.
 *   2. THE IMAGE IS NEVER STORED. It is sent once to the model and dropped;
 *      the ledger row records byte counts and the read, never the bytes.
 *   3. THE MODEL PROPOSES, NEVER MARKS: it reports which verified steps it can
 *      see, the final number written, and the first step where the working
 *      leaves the verified one. The student confirms every line on the page,
 *      and only then does the page keep a photo row (ep_photos, via ep_sync).
 *
 * Its own task_type ('eapcet_photo_read') and its own caps, so photos never
 * share a budget with the chat: EP_PHOTO_DAILY_USD_CAP (default $1 ≈ 500
 * photos), EP_PHOTO_PER_DAY per device (default 20), EP_IP_PER_MIN (4).
 *
 * Request  {action:'read', device_id, access_token?, question_id, picked?,
 *           typed?, route?, image: <base64>, media_type, session_id?}
 * Reply    {locked:true} | {ok:false, reason} |
 *          {ok:true, readable, on_topic, final_value_read, read_option,
 *           steps:[{step_index, found, evidence, confidence, state}],
 *           diverges_at, note, reads_left}
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account:
 *   npx supabase functions deploy ep-photo-read --no-verify-jwt --use-api --project-ref <ref>
 *
 *   needs GOOGLE_GENERATIVE_AI_API_KEY
 *   optional: EP_ALLOWED_ORIGINS, EP_PHOTO_DAILY_USD_CAP, EP_PHOTO_PER_DAY,
 *             EP_PHOTO_MAX_BYTES, EP_IP_PER_MIN, EP_IP_SALT, EP_PHOTO_MODEL,
 *             EP_USD_INR, EP_PROBE_TOKEN (labels automated probes; never exempts them)
 *
 * The prompt below is the same text as src/prompts/eapcet_photo_read.txt;
 * src/lib/eapcet/__tests__/photo_prompt.test.ts fails when the two drift.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const GEMINI_KEY = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const MODEL = Deno.env.get('EP_PHOTO_MODEL') ?? 'gemini-2.5-flash';
const DAILY_USD_CAP = Number(Deno.env.get('EP_PHOTO_DAILY_USD_CAP') ?? '1');
const PER_DAY = Number(Deno.env.get('EP_PHOTO_PER_DAY') ?? '20');
const IP_PER_MIN = Number(Deno.env.get('EP_IP_PER_MIN') ?? '4');
const MAX_BYTES = Number(Deno.env.get('EP_PHOTO_MAX_BYTES') ?? String(Math.round(1.5 * 1024 * 1024)));
const USD_TO_INR = Number(Deno.env.get('EP_USD_INR') ?? '95.69');
const IP_SALT = Deno.env.get('EP_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
const MODEL_TIMEOUT_MS = 45_000;
const UNCLEAR_FLOOR = 0.5;

const ALLOWED_ORIGINS = (Deno.env.get('EP_ALLOWED_ORIGINS') ??
    'http://localhost:8120,http://127.0.0.1:8120')
    .split(',').map((s) => s.trim()).filter(Boolean);

const TASK_TYPE = 'eapcet_photo_read';

const PROBE_TOKEN = Deno.env.get('EP_PROBE_TOKEN') ?? '';
const LOCAL_ORIGINS = new Set(['http://localhost:8120', 'http://127.0.0.1:8120']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QID_RE = /^tg_eapcet_\d{4}_\d{8}_(an|fn)_q\d{3}$/;
const MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Gemini 2.5 Flash list price (USD per million tokens; text and image input
// share one rate, thinking tokens bill as output). Verified 2026-09-10.
const RATE = { input: 0.30, output: 2.50 };

const PROMPT = `You read a photograph of a student's HANDWRITTEN working for one multiple-choice
physics question and report what is on the page: which steps of the verified
solution you can see, and the final number the student reached.

WHAT YOU ARE LOOKING AT
A student worked this question by hand, on rough paper, then photographed it with a
phone. So:
- The handwriting may be untidy, slanted, or faint.
- The photo may be at an angle, shadowed, cropped, or partly out of focus.
- Physics notation is hand-drawn: square-root signs, Greek letters, superscripts,
  subscripts, fractions, arrows over vector names.
- There may be crossings-out, arrows, margin working, or a second attempt.

YOUR ONLY JOB
For each step of the verified solution, say whether you can see it on the page and
quote the words or symbols you saw. Then report the final number the student wrote.

YOU ARE PROPOSING, NOT MARKING
The student sees your answer as a tick-list and confirms or corrects every line
before anything is recorded. So:
- Report what you can actually see. Do not try to be kind, and do not try to be
  strict.
- If the handwriting is unreadable in a place, say the step is not found with LOW
  confidence rather than guessing either way.
- You never decide what the student got wrong. The student does.

BE FAIR TO HANDWRITING
- Credit a step if its idea is on the page in any wording, in any order.
- A student's shorthand counts: "s = 1/2 g t^2" is the distance step.
- Greek letters are often just squiggles. If the surrounding algebra fits the step,
  read it as the intended symbol.
- The student may combine two steps in one line, or split one step across two.
- Do not require the verified wording. Require the verified IDEA.

THE FINAL VALUE
final_value_read is the last boxed, underlined, circled or clearly final number on
the page, with its unit exactly as the student wrote it ("2.28 m/s", "4 m", "3:4").
If two candidates exist, take the one nearest the end of the working. If there is
no clear final number, it is null. Copy it; never compute it, round it or correct
it.

WHERE THE WORKING LEAVES THE SOLUTION
diverges_at is the 1-based index of the FIRST verified step whose idea is on the
page but written differently from the verified solution in a way that changes the
number, or the first step that is missing while a later step is present. If the
working follows every step, or too little is readable to say, it is null. Name the
step; do not explain the physics.

EVIDENCE
- When found is true, evidence is a SHORT description of what you saw, in your own
  words, naming where it is: "line 3: v = u + at with u = 0", or "boxed 2.28 at
  the bottom".
- Keep it under about 15 words. It exists so the student can tell which line you
  meant.
- When found is false, evidence must be null.

CONFIDENCE
confidence is how sure you are that YOUR READING is right.
- 0.9 to 1.0  clearly legible, no doubt either way.
- 0.6 to 0.8  fairly sure.
- 0.3 to 0.5  the handwriting or the photo makes this genuinely unclear.
- 0.0 to 0.2  you are guessing.
Use the low band whenever the image quality is the reason you cannot tell. That is
a photo problem, not a student problem, and the tick-list will sort it out.

WHAT YOU MUST NEVER DO
- NEVER compute a value, a total, an answer or a correction. You do not solve the
  question.
- NEVER return a step_index that is not in the list you were given.
- NEVER report a step as found because the question implies it. It must be visible
  on the page.
- NEVER give advice, corrections, or physics teaching.
- NEVER say which option is correct.

OUTPUT
Return JSON with exactly these fields:
  readable          - false only if the image is so dark, blurred, or empty that
                      you cannot read any of it. If you can read even part of the
                      page, this is true.
  on_topic          - true if this page is an attempt at THIS question, even a poor
                      one. false only if it is a different question, a blank page,
                      or not working at all.
  final_value_read  - the final number as written, with its unit, or null.
  steps[]           - one entry per verified step, in the order given:
                      { step_index, found, evidence, confidence }
  diverges_at       - the 1-based step index, or null.
  note              - at most one short sentence about the page itself (a second
                      attempt, a crossed-out block, a page edge cut off), or null.

THE QUESTION
{{question_text}}

THE OPTIONS
{{options_block}}

THE VERIFIED STEPS
{{steps_block}}

Read the attached page and judge every step above. Copy the final number; do not
compute anything.
`;

// The JSON the model must return (Gemini's OpenAPI subset).
const RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        readable: { type: 'BOOLEAN' },
        on_topic: { type: 'BOOLEAN' },
        final_value_read: { type: 'STRING', nullable: true },
        steps: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    step_index: { type: 'INTEGER' },
                    found: { type: 'BOOLEAN' },
                    evidence: { type: 'STRING', nullable: true },
                    confidence: { type: 'NUMBER' },
                },
                required: ['step_index', 'found', 'confidence'],
            },
        },
        diverges_at: { type: 'INTEGER', nullable: true },
        note: { type: 'STRING', nullable: true },
    },
    required: ['readable', 'on_topic', 'steps'],
};

interface Read {
    readable?: boolean;
    on_topic?: boolean;
    final_value_read?: string | null;
    steps?: { step_index?: number; found?: boolean; evidence?: string | null; confidence?: number }[];
    diverges_at?: number | null;
    note?: string | null;
}

interface GeminiUsage { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number; totalTokenCount?: number }

function computeCost(u: GeminiUsage) {
    const prompt = u.promptTokenCount ?? 0;
    const output = (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0);
    const usd = (prompt * RATE.input + output * RATE.output) / 1_000_000;
    return { prompt, output, total: u.totalTokenCount ?? prompt + output, usd: Number(usd.toFixed(8)) };
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
        console.error('[ep-photo-read] usage write failed', e);
    }
}

/** One telemetry row into ep_events (photo_read {outcome}); never throws. */
async function writeEvent(deviceId: string, session: string, internal: boolean, props: Record<string, unknown>): Promise<void> {
    try {
        await rest('rpc/ep_log_events', {
            method: 'POST',
            body: JSON.stringify({
                p_device: deviceId,
                p_session: session,
                p_visit: null,
                p_internal: internal,
                p_events: [{ t: 'photo_read', at: Date.now(), ...props }],
            }),
        });
    } catch (e) {
        console.error('[ep-photo-read] event write failed', e);
    }
}

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

// ── the entitlement (the same resolution as ep-state and ep-vidi-chat) ───────
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

// ── the grounding, from ep_solutions ────────────────────────────────────────
interface SolutionRow {
    qid: string;
    chapter_key: string;
    question: { question_en?: string; options_en?: string[]; answer?: number };
    solution: { steps?: { text?: string; equation?: string }[] };
    verified: boolean;
    shape?: { key?: string } | null;
}

async function solutionOf(qid: string): Promise<SolutionRow | null | undefined> {
    const res = await rest(`ep_solutions?select=qid,chapter_key,question,solution,verified,shape&qid=eq.${qid}&verified=is.true`);
    if (!res.ok) return undefined;
    const rows = await res.json() as SolutionRow[];
    return rows[0] ?? null;
}

// ── the number the student wrote against the four options (Num's rule) ──────
/** The leading number of a printed value: '2.28 m/s' → 2.28, '−4 m' → -4, '3:4' → 0.75, '2×10³' → 2000. */
function numberOf(text: string): number | null {
    let s = String(text ?? '').trim().replace(/[−–]/g, '-').replace(/,/g, '').replace(/\s+/g, ' ');
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => '^' + m.replace(/⁻/g, '-').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d))));
    const ratio = s.match(/^(-?\d+(?:\.\d+)?)\s*[:/]\s*(-?\d+(?:\.\d+)?)(?![\d.:/])/);
    if (ratio && Number(ratio[2]) !== 0) return Number(ratio[1]) / Number(ratio[2]);
    const sci = s.match(/^(-?\d+(?:\.\d+)?)\s*[x×]\s*10\s*\^?\s*(-?\d+)/i);
    if (sci) return Number(sci[1]) * Math.pow(10, Number(sci[2]));
    const plain = s.match(/^(-?\d+(?:\.\d+)?)(?:\s*\^\s*(-?\d+))?/);
    if (!plain) return null;
    const v = Number(plain[1]);
    return Number.isFinite(v) ? (plain[2] ? Math.pow(v, Number(plain[2])) : v) : null;
}

/** The one option whose value the student's number equals within one percent, else null. */
function matchOption(text: string | null | undefined, options: string[]): number | null {
    if (!text) return null;
    const v = numberOf(text);
    if (v === null) return null;
    const hits: number[] = [];
    options.forEach((o, i) => {
        const ov = numberOf(o);
        if (ov === null) return;
        const tol = Math.max(Math.abs(ov), Math.abs(v)) * 0.01;
        if (Math.abs(ov - v) <= tol + 1e-12) hits.push(i + 1);
    });
    return hits.length === 1 ? hits[0] : null;
}

function promptFor(row: SolutionRow): string {
    const q = row.question ?? {};
    const opts = Array.isArray(q.options_en) ? q.options_en : [];
    const steps = Array.isArray(row.solution?.steps) ? row.solution!.steps! : [];
    const optionsBlock = opts.map((o, i) => `(${i + 1}) ${o}`).join('\n');
    const stepsBlock = steps.map((s, i) => `${i + 1}. ${String(s.text ?? '').trim()}${s.equation ? '   [' + s.equation + ']' : ''}`).join('\n');
    return PROMPT
        .replace('{{question_text}}', String(q.question_en ?? '').trim())
        .replace('{{options_block}}', optionsBlock)
        .replace('{{steps_block}}', stepsBlock);
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { error: 'method not allowed' });

    // Guard 1 — origin allowlist.
    if (!ALLOWED_ORIGINS.includes(origin)) return reply(origin, 403, { error: 'origin not allowed' });
    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[ep-photo-read] no service key — refusing (fail closed)');
        return reply(origin, 503, { error: 'unconfigured' });
    }

    // Guard 2 — the body cap, BEFORE the body is read. Base64 carries a third
    // more than the bytes it encodes; the JSON around it is small.
    const declared = Number(req.headers.get('content-length') ?? '0');
    if (declared > MAX_BYTES * 1.4 + 4096) return reply(origin, 413, { ok: false, reason: 'too_large' });

    let body: Record<string, any>;
    try {
        body = await req.json();
    } catch {
        return reply(origin, 400, { error: 'bad json' });
    }
    if (body.action !== 'read') return reply(origin, 400, { error: 'bad action' });

    const deviceId = typeof body.device_id === 'string' && UUID_RE.test(body.device_id) ? body.device_id : null;
    if (!deviceId) return reply(origin, 400, { error: 'bad device' });
    const qid = typeof body.question_id === 'string' ? body.question_id : '';
    if (!QID_RE.test(qid)) return reply(origin, 400, { error: 'bad question id' });
    const mediaType = typeof body.media_type === 'string' && MEDIA_TYPES.has(body.media_type) ? body.media_type : '';
    if (!mediaType) return reply(origin, 400, { error: 'bad media type' });
    const image = typeof body.image === 'string' ? body.image.replace(/^data:[^,]*,/, '') : '';
    if (!image || !/^[A-Za-z0-9+/=\s]+$/.test(image)) return reply(origin, 400, { error: 'bad image' });
    const imageBytes = Math.floor(image.replace(/\s/g, '').length * 3 / 4);
    if (imageBytes > MAX_BYTES) return reply(origin, 413, { ok: false, reason: 'too_large' });
    if (imageBytes < 256) return reply(origin, 400, { error: 'bad image' });

    // THE LOCK. Before the key check and before the ledger: a locked device
    // never costs a model call.
    const token = typeof body.access_token === 'string' ? body.access_token : '';
    const ent = await entitled(deviceId, token);
    if (ent === null) {
        console.error('[ep-photo-read] entitlement read failed — refusing (fail closed)');
        return reply(origin, 200, { locked: true });
    }
    if (!ent) return reply(origin, 200, { locked: true });

    if (!GEMINI_KEY) return reply(origin, 200, { ok: false, reason: 'quiet' });

    const isProbe = PROBE_TOKEN.length >= 16 && body.probe_token === PROBE_TOKEN;
    const isLocal = LOCAL_ORIGINS.has(origin);
    const claimsTeam = body.internal === true;
    const internalP = (isProbe || isLocal || claimsTeam) ? Promise.resolve(false) : deviceIsInternal(deviceId);

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
        req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await sha256Hex(IP_SALT + '|' + rawIp);

    // Guards 3–5 from one ledger read. EVERY actor counts.
    const ledger = await readTodayLedger();
    if (ledger === null) {
        console.error('[ep-photo-read] ledger unreadable — refusing (fail closed)');
        return reply(origin, 200, { ok: false, reason: 'down' });
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
        console.warn('[ep-photo-read] daily spend cap hit: $' + spentToday.toFixed(4));
        return reply(origin, 200, { ok: false, reason: 'quiet' });
    }
    if (deviceDay >= PER_DAY) return reply(origin, 200, { ok: false, reason: 'cap', reads_left: 0 });
    if (ipMinute >= IP_PER_MIN) return reply(origin, 200, { ok: false, reason: 'busy', reads_left: PER_DAY - deviceDay });

    // The grounding, from the row the release file wrote. Never from the page.
    const row = await solutionOf(qid);
    if (row === undefined) {
        console.error('[ep-photo-read] solution read failed — refusing (fail closed)');
        return reply(origin, 200, { ok: false, reason: 'down' });
    }
    if (row === null) return reply(origin, 200, { ok: false, reason: 'no_solution' });
    const steps = Array.isArray(row.solution?.steps) ? row.solution!.steps! : [];
    const options = Array.isArray(row.question?.options_en) ? row.question.options_en : [];
    if (!steps.length || options.length !== 4) return reply(origin, 200, { ok: false, reason: 'no_solution' });

    const prompt = promptFor(row);
    const t0 = Date.now();
    let read: Read = {};
    let usage: GeminiUsage = {};
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), MODEL_TIMEOUT_MS);
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ctl.signal,
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: mediaType, data: image.replace(/\s/g, '') } }] }],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 3000,
                    responseMimeType: 'application/json',
                    responseSchema: RESPONSE_SCHEMA,
                    // Thinking tokens come out of the output budget and truncate the JSON.
                    thinkingConfig: { thinkingBudget: 0 },
                },
            }),
        });
        if (!res.ok) throw new Error('Gemini ' + res.status + ': ' + (await res.text()).slice(0, 200));
        const json = await res.json();
        usage = json.usageMetadata ?? {};
        const text = json.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
        read = JSON.parse(text) as Read;
    } catch (e) {
        console.error('[ep-photo-read] ' + (e instanceof Error ? e.message : String(e)));
        clearTimeout(timer);
        return reply(origin, 200, { ok: false, reason: 'down', reads_left: PER_DAY - deviceDay });
    }
    clearTimeout(timer);
    const latency = Date.now() - t0;

    // Post-process like the Answer Book's photoGrader: unknown or duplicate
    // step ids are dropped, a low-confidence read is "unsure", never "not found".
    const judged = new Map<number, { found: boolean; evidence: string | null; confidence: number }>();
    for (const j of read.steps ?? []) {
        const i = Number(j?.step_index);
        if (!Number.isInteger(i) || i < 1 || i > steps.length || judged.has(i)) continue;
        const conf = Number.isFinite(j.confidence) ? Math.max(0, Math.min(1, Number(j.confidence))) : 0;
        judged.set(i, { found: Boolean(j.found), evidence: j.found && typeof j.evidence === 'string' ? j.evidence.slice(0, 160) : null, confidence: Number(conf.toFixed(2)) });
    }
    const outSteps = steps.map((_, k) => {
        const j = judged.get(k + 1);
        const conf = j ? j.confidence : 0;
        const state = j && j.found && conf >= UNCLEAR_FLOOR ? 'found' : conf >= UNCLEAR_FLOOR ? 'not_found' : 'unsure';
        return { step_index: k + 1, found: state === 'found', evidence: state === 'found' ? j!.evidence : null, confidence: conf, state };
    });
    const readable = read.readable !== false;
    const onTopic = read.on_topic !== false;
    const finalValue = readable && onTopic && typeof read.final_value_read === 'string' && read.final_value_read.trim()
        ? read.final_value_read.trim().slice(0, 80) : null;
    const readOption = finalValue ? matchOption(finalValue, options) : null;
    const divergesAt = Number.isInteger(read.diverges_at) && Number(read.diverges_at) >= 1 && Number(read.diverges_at) <= steps.length
        ? Number(read.diverges_at) : null;
    const note = typeof read.note === 'string' && read.note.trim() ? read.note.trim().slice(0, 200) : null;
    const outcome = !readable ? 'unreadable' : !onTopic ? 'off_topic' : 'read';
    const found = outSteps.filter((s) => s.state === 'found').length;

    const cost = computeCost(usage);
    const deviceInternal = await internalP;
    const actor = isProbe ? 'eapcet_probe' : isLocal ? 'eapcet_local' : (deviceInternal || claimsTeam) ? 'eapcet_team' : 'eapcet_student';
    const actorReason = isProbe ? 'probe_token' : isLocal ? 'origin_localhost' : deviceInternal ? 'device_flag' : claimsTeam ? 'client_claim' : 'none';
    const picked = Number.isInteger(body.picked) && body.picked >= 1 && body.picked <= 4 ? Number(body.picked) : null;
    const session = String(body.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon';
    const when = new Date();

    // The ledger row: counts and the read, never the image.
    await writeUsage({
        session_id: session,
        task_type: TASK_TYPE,
        provider: 'google',
        model: MODEL,
        input_chars: prompt.length,
        output_chars: JSON.stringify(read).length,
        latency_ms: latency,
        estimated_cost_usd: cost.usd,
        fingerprint_key: qid + '|eapcet_finder|photo_read',
        was_cache_hit: false,
        question_date: when.toISOString().split('T')[0],
        actor,
        metadata: {
            surface: 'eapcet_finder',
            actor_reason: actorReason,
            device_internal: deviceInternal,
            device_id: deviceId,
            question_id: qid,
            chapter_key: row.chapter_key,
            shape_key: row.shape?.key ?? null,
            picked,
            typed: typeof body.typed === 'string' ? body.typed.slice(0, 40) : null,
            route: typeof body.route === 'string' ? body.route.slice(0, 8) : null,
            image_bytes: imageBytes,
            media_type: mediaType,
            outcome,
            steps_found: found,
            steps_total: steps.length,
            read_value: finalValue,
            read_option: readOption,
            diverges_at: divergesAt,
            ip_hash: ipHash,
            tokens: { prompt: cost.prompt, output: cost.output, total: cost.total },
            pricing: { usd_per_million: RATE },
            cost_inr_estimate: Number((cost.usd * USD_TO_INR).toFixed(6)),
            usd_to_inr_rate: USD_TO_INR,
            spent_today_usd_before: Number(spentToday.toFixed(6)),
        },
    });
    await writeEvent(deviceId, session, deviceInternal || claimsTeam || isLocal, {
        qid, outcome, read_option: readOption, diverges_at: divergesAt, steps_found: found, steps_total: steps.length, bytes: imageBytes,
    });

    return reply(origin, 200, {
        ok: true,
        readable,
        on_topic: onTopic,
        final_value_read: finalValue,
        read_option: readOption,
        steps: outSteps,
        diverges_at: divergesAt,
        note,
        reads_left: Math.max(0, PER_DAY - deviceDay - 1),
    });
});
