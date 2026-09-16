/**
 * ep-solve — solves ONE photographed question for the Solutions tab.
 *
 * The design is docs/SOLUTION_GENERATOR_ARCHITECTURE.md on master; every
 * number behind it is in docs/MODEL_PROBES.md (Runs 1–13, ~3,000 calls).
 * The guard ladder is ep-photo-read's, unchanged: origin allowlist, service
 * key, the body cap, the lock, one ledger read for the three volume caps,
 * actor labels, telemetry. What is new is the pipeline:
 *
 *   S1 intake   Gemini 3.5 Flash-Lite, structured JSON: the question text and
 *               options transcribed, subject, whether it needs a drawn figure,
 *               legibility, how many questions are in the frame. Its text is
 *               the FINGERPRINT (sha256 of the normalised text + options).
 *   S2 cache    ep_solve_cache by fingerprint (the question AND the ask —
 *               "solve" and "explain" are two rows): the second student who
 *               sends the same page is served for the cost of the intake call.
 *   S3 route    text  → DeepSeek V4.1 Flash, thinking high (max for maths),
 *                       one call (measured ~99% on EAPCET text, ~$0.001);
 *               figure → Gemini 3.7 Flash AND DeepSeek high in parallel
 *                       (Gemini 144/148 on the hardest drawn set, DeepSeek 131).
 *   S4 trigger  on the text route a second opinion (Gemini) runs only when
 *               DeepSeek returns no clean option, hedges, hits its cap, or
 *               times out — a second model on every text question would cost
 *               five times more to catch about one question in a hundred.
 *   S5 arbiter  CODE decides the label: two solvers agree → "two_ways"
 *               (measured right 129 of 129 times when they agreed); one clean
 *               answer → "once"; disagreement or no clean answer → "unsure",
 *               no verdict, both workings. Never a confident wrong answer.
 *   S7 syllabus DeepSeek thinking-off judge on the shown working (Run 13:
 *               $0.0001, 0 of 506 flagged, a planted control proved it can).
 *               v1 flags; it does not regenerate.
 *   S9 persist  ep_solve_cache (never the image), one ai_usage_log row per
 *               request with every model call itemised, one ep_events row.
 *
 * v1 simplifications, deliberately: no exam-convention pass yet (S6 — the
 * field is present and empty), no bank lookup on the server (the page matches
 * the transcript against the public pool on the phone), the cache keys on the
 * exact fingerprint only. The wait rule IS implemented: on the figure route,
 * once Gemini has answered and DeepSeek is still thinking after
 * EP_SOLVE_PAIR_WAIT_MS, the reply goes out as "once" and DeepSeek finishes in
 * the background to upgrade the cache row.
 *
 * Request  {action:'solve', device_id, access_token?, ask:'solve'|'explain',
 *           image:<base64>, media_type, session_id?, internal?}
 *          {action:'report', device_id, fingerprint, option?, label?, note?}
 *          {action:'confirm', device_id, access_token?, fingerprint, image?, media_type?, session_id?}
 *              — a `once` row (one clean solver) is re-solved by the OTHER family
 *                and the arbiter relabels it two_ways | unsure (idempotent on any
 *                other label; a figure row needs the image again → needs_photo).
 *                Never consumes a read. The reviewer (ep-review) requires it,
 *                so a page is never compared against a single-model answer.
 * Reply    {locked:true} | {ok:false, reason} | {ok:true, source, label,
 *           option, answer, answer_tex, format:'tex'|'plain',
 *           working:[{step,text,tex,kind}], working_alt?, models:[…],
 *           conventions:[], similar:[], syllabus, question_text, options,
 *           subject, has_figure, route, fingerprint, reads_left, cost_usd, ms}
 *
 * THE FORMAT (founder, 2026-09-11): the working is written the way a top
 * student writes on the answer sheet — one line of mathematics per line in
 * LaTeX between $…$, words only where a student would write them, never an
 * instruction to the reader. Each line carries `tex` (typeset on the phone)
 * and `text` (the plain-text rendering: the cache, the syllabus judge and the
 * page's fallback). EP_SOLVE_FORMAT=plain restores the old plain-text rule.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account:
 *   npx supabase functions deploy ep-solve --no-verify-jwt --use-api --project-ref <ref>
 *
 *   needs EP_SOLVE_GOOGLE_KEY (a key whose project is on the PAID tier — the
 *         free tier caps each model at a handful of calls per day; falls back
 *         to GOOGLE_GENERATIVE_AI_API_KEY) and DEEPSEEK_API_KEY
 *   optional: EP_ALLOWED_ORIGINS, EP_SOLVE_INTAKE_MODEL, EP_SOLVE_TEXT_MODEL,
 *             EP_SOLVE_TEXT_EFFORT, EP_SOLVE_FIGURE_MODEL, EP_SOLVE_THINK_CAP,
 *             EP_SOLVE_MODEL_TIMEOUT_MS, EP_SOLVE_PAIR_WAIT_MS, EP_SOLVE_PER_DAY,
 *             EP_SOLVE_DAILY_USD_CAP, EP_SOLVE_SYLLABUS_CHECK (0 = off),
 *             EP_SOLVE_FORMAT (tex | plain),
 *             EP_IP_PER_MIN, EP_PHOTO_MAX_BYTES, EP_IP_SALT, EP_USD_INR,
 *             EP_PROBE_TOKEN (labels automated probes; never exempts them)
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const GOOGLE_KEY = Deno.env.get('EP_SOLVE_GOOGLE_KEY') ?? Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY') ?? '';
const DEEPSEEK_KEY = Deno.env.get('DEEPSEEK_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const INTAKE_MODEL = Deno.env.get('EP_SOLVE_INTAKE_MODEL') ?? 'gemini-3.5-flash-lite';
const TEXT_MODEL = Deno.env.get('EP_SOLVE_TEXT_MODEL') ?? 'deepseek-flash';
const TEXT_EFFORT = Deno.env.get('EP_SOLVE_TEXT_EFFORT') ?? 'high';
const FIGURE_MODEL = Deno.env.get('EP_SOLVE_FIGURE_MODEL') ?? 'gemini-3.7-flash';
const THINK_CAP = Number(Deno.env.get('EP_SOLVE_THINK_CAP') ?? '12000');
const MODEL_TIMEOUT_MS = Number(Deno.env.get('EP_SOLVE_MODEL_TIMEOUT_MS') ?? '45000');
const PAIR_WAIT_MS = Number(Deno.env.get('EP_SOLVE_PAIR_WAIT_MS') ?? '25000');
const DAILY_USD_CAP = Number(Deno.env.get('EP_SOLVE_DAILY_USD_CAP') ?? '2');
const PER_DAY = Number(Deno.env.get('EP_SOLVE_PER_DAY') ?? '20');
const IP_PER_MIN = Number(Deno.env.get('EP_IP_PER_MIN') ?? '4');
const MAX_BYTES = Number(Deno.env.get('EP_PHOTO_MAX_BYTES') ?? String(Math.round(1.5 * 1024 * 1024)));
const USD_TO_INR = Number(Deno.env.get('EP_USD_INR') ?? '95.69');
const IP_SALT = Deno.env.get('EP_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
const SYLLABUS_CHECK = (Deno.env.get('EP_SOLVE_SYLLABUS_CHECK') ?? '1') !== '0';
const FORMAT: 'tex' | 'plain' = Deno.env.get('EP_SOLVE_FORMAT') === 'plain' ? 'plain' : 'tex';
const ANSWER_ROOM = 4000;            // output tokens left for the working after the thinking cap

const ALLOWED_ORIGINS = (Deno.env.get('EP_ALLOWED_ORIGINS') ??
    'http://localhost:8120,http://127.0.0.1:8120')
    .split(',').map((s) => s.trim()).filter(Boolean);

// THE OPEN DOOR (founder, 2026-09-11): on these origins every device counts as
// entitled and the per-device and per-IP caps are off — only the daily spend
// cap stays. EP_OPEN_ORIGINS names the PREVIEW origin while only the founder
// tests; unset it the day a student arrives (no redeploy needed). Never the
// student site's origin.
const OPEN_ORIGINS = (Deno.env.get('EP_OPEN_ORIGINS') ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);

const TASK_TYPE = 'eapcet_solve';

const PROBE_TOKEN = Deno.env.get('EP_PROBE_TOKEN') ?? '';
const LOCAL_ORIGINS = new Set(['http://localhost:8120', 'http://127.0.0.1:8120']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX64_RE = /^[0-9a-f]{64}$/;
const MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// List prices, USD per million tokens (verified 2026-09-10/11). Gemini bills
// thinking as output. DeepSeek doubles in its peak windows (01–04 and 06–10
// UTC on weekdays) and discounts cached prompt tokens.
const GEMINI_RATE: Record<string, { input: number; output: number }> = {
    'gemini-3.5-flash-lite': { input: 0.30, output: 2.50 },
    'gemini-3.7-flash': { input: 0.75, output: 3.75 },
};
const DEEPSEEK_RATE = {
    off: { miss: 0.15, hit: 0.003, out: 0.60 },
    peak: { miss: 0.30, hit: 0.006, out: 1.20 },
};

// ── prompts (docs/SOLUTION_GENERATOR_ARCHITECTURE.md §7) ─────────────────────
// The ask is the student's own line — exactly what every score was measured on.
const ASKS: Record<string, string> = {
    solve: 'Please solve this question',
    explain: 'Please explain and solve this question',
};
const SYLLABUS_RULE = '- Use only methods in the NCERT Class 11-12 syllabus and the standard techniques EAPCET and JEE Main coaching teaches. Do not use university-level methods (Lagrangian mechanics, Laplace or Fourier transforms, residues, Jacobians, matrix exponentials, group theory, reagents outside NCERT).';
// The answer-sheet rule (founder, 2026-09-11): lines of mathematics, not
// sentences about mathematics. The models were measured on the bare ask and
// write LaTeX by themselves; this rule only shapes the lines.
const RULES_TEX = `Rules:
${SYLLABUS_RULE}
- Write the working exactly as a top student writes it on the answer sheet: one line of mathematics per line — the given values, the formula or principle, the substitution with the numbers, the result. A line that continues the previous one starts with = or \\Rightarrow. Use words only where a student would write them on paper ("Given:", "By energy conservation,", "Let t = sin x"). Never write instructions or commentary to the reader ("Write", "Use", "Cancel", "Now", "We", "You", "Note that"). Keep each line short; split long algebra across = lines.
- Put every expression, symbol and value with its unit in LaTeX between $ and $, one pair per expression, on one line. No $$, no \\[ \\], no \\begin{aligned}, no \\ce{} (write chemical formulae as H_2SO_4, \\rightarrow, \\rightleftharpoons). No headings, bullets, bold, numbering or tables.
- Finish with one line on its own: "Answer: option N" if the question has options, otherwise "Answer: $<value with unit>$".`;
// For "explain": a student's margin note before each block of lines is allowed.
const EXPLAIN_CLAUSE = `
- Before each block of lines you may add one short line of words saying what the block does, the way a student writes a margin note ("Substituting t = sin x", "Applying Kirchhoff's loop rule"). Never an instruction.`;
const RULES_PLAIN = `Rules:
${SYLLABUS_RULE}
- Write the working as numbered steps, one step per line, in plain English a Class 12 student can follow. Write math in plain text, not LaTeX: x², √x, 10⁻³, a/b, ×, π, θ.
- Finish with one line on its own: "Answer: option N" if the question has options, otherwise "Answer: <value with unit>".`;
function rulesFor(askKey: string): string {
    if (FORMAT === 'plain') return RULES_PLAIN;
    return askKey === 'explain' ? RULES_TEX + EXPLAIN_CLAUSE : RULES_TEX;
}

const INTAKE_PROMPT = `Read this photo of one exam question. Return JSON:
- question_text: the full question exactly as printed, math in plain text. Empty if the photo shows no question.
- options: the printed options in order, without their numbers or letters. Empty if the question has no options.
- subject: physics, chemistry, maths, or other.
- has_figure: true only if the question needs a drawn figure, graph, circuit or chemical structure that is not in the text.
- figure_kind: graph, circuit, structure, diagram, or none.
- legible: 0 to 1, how much of the question can be read. 0 if the photo is not an exam question at all.
- questions_in_frame: how many separate questions are visible.`;

const INTAKE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        question_text: { type: 'STRING' },
        options: { type: 'ARRAY', items: { type: 'STRING' } },
        subject: { type: 'STRING', enum: ['physics', 'chemistry', 'maths', 'other'] },
        has_figure: { type: 'BOOLEAN' },
        figure_kind: { type: 'STRING', enum: ['graph', 'circuit', 'structure', 'diagram', 'none'] },
        legible: { type: 'NUMBER' },
        questions_in_frame: { type: 'INTEGER' },
    },
    required: ['question_text', 'options', 'subject', 'has_figure', 'figure_kind', 'legible', 'questions_in_frame'],
};

// The Run 13 judge, verbatim from scripts/model_probes/syllabus_sweep.py.
const JUDGE_PROMPT = `You are checking whether a worked solution to an Indian Class 11-12 entrance-exam question (JEE Main / EAPCET / NEET level) stays within the syllabus a Class 12 student is taught.

ALLOWED: everything in the NCERT Class 11 and 12 syllabus for physics, chemistry and mathematics, plus the standard coaching techniques these exams expect: L'Hopital's rule, Leibniz rule for differentiating integrals, King's rule / symmetry properties of definite integrals, Feynman-style parameter differentiation, vector methods, dimensional analysis, standard approximations (binomial for small x), determinant/matrix properties up to 3x3, complex numbers as taught in Class 11, standard organic mechanisms and reagents of NCERT, the mole concept, and all shortcut formulas coaching institutes teach.

BEYOND SYLLABUS (flag these): Lagrangian or Hamiltonian mechanics, tensors, Laplace or Fourier transforms, contour integration or residues, matrix exponentials or eigen-decomposition beyond Class 12, multivariable calculus with Jacobians or partial-derivative chain rules, differential equations beyond first-order/simple second-order, group theory, advanced organic reagents or named reactions not in NCERT (e.g. Grubbs, Buchwald, Suzuki, Swern), molecular-orbital arguments beyond NCERT MOT, statistical mechanics, quantum mechanics beyond Bohr/de Broglie/photoelectric, and any university-level theorem invoked by name.

Read the solution below. Reply with JSON only:
{"techniques": ["short name of each method used"], "beyond": ["each beyond-syllabus technique actually USED to reach the answer, with 5-10 words why"], "verdict": "within" | "beyond"}
Mentioning a method in passing without using it is NOT beyond. Be strict about the list above and do not invent flags.

SOLUTION:
`;

// A text question whose transcript still points at a drawing the intake did
// not flag goes down the figure route (the chemistry safety net, §S4).
const FIGURE_WORDS = /\b(as shown|shown in|in the (figure|diagram|graph|circuit)|(figure|diagram|graph|circuit|structure) (given|shown|below|above)|following (figure|diagram|graph|circuit|structure))\b/i;

interface Intake {
    question_text?: string; options?: string[]; subject?: string; has_figure?: boolean;
    figure_kind?: string; legible?: number; questions_in_frame?: number;
}
interface Tokens { prompt: number; output: number; thoughts: number }
interface Call { stage: string; model: string; effort: string | null; ms: number; tokens: Tokens; cost_usd: number; cap_hit: boolean; error: string | null }
interface Solve extends Call {
    text: string; option: number | null; value: string | null; hedge: boolean;
}
/** One line of the working: `text` plain (the cache, the judge, the fallback), `tex` as written, `kind` line | cont | note. */
interface Step { step: number; text: string; tex: string; kind: 'line' | 'cont' | 'note' }

// ── transport helpers (ep-photo-read's) ──────────────────────────────────────
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
    metadata: { ip_hash?: string; device_id?: string; consumed?: boolean } | null;
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
        await rest('ai_usage_log', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify([row]) });
    } catch (e) {
        console.error('[ep-solve] usage write failed', e);
    }
}

/** One telemetry row into ep_events; never throws. */
async function writeEvent(deviceId: string, session: string, internal: boolean, t: string, props: Record<string, unknown>): Promise<void> {
    try {
        await rest('rpc/ep_log_events', {
            method: 'POST',
            body: JSON.stringify({ p_device: deviceId, p_session: session, p_visit: null, p_internal: internal, p_events: [{ t, at: Date.now(), ...props }] }),
        });
    } catch (e) {
        console.error('[ep-solve] event write failed', e);
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

// ── the entitlement (the same resolution as ep-state, ep-vidi-chat, ep-photo-read)
interface EntRow { unit_key: string; source: string; expires_at: string | null }

async function userOf(accessToken: string): Promise<string | null> {
    if (!accessToken || accessToken.length > 4096) return null;
    try {
        const res = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + accessToken } });
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

// ── numbers and options (ep-photo-read's rule: one percent) ──────────────────
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

function sameNumber(a: number, b: number): boolean {
    const tol = Math.max(Math.abs(a), Math.abs(b)) * 0.01;
    return Math.abs(a - b) <= tol + 1e-12;
}

/** The probes' option-text normaliser (ds_probe.norm). */
function normOpt(s: string): string {
    s = String(s ?? '').toLowerCase().replace(/[\s​]+/g, '');
    s = s.replace(/−/g, '-').replace(/×/g, 'x').replace(/·/g, '.');
    return s.replace(/[^0-9a-z\-./:+=√π∞°]/g, '');
}

// The probes' grading patterns (ds_probe.PATTERNS): the option stated LAST in
// the tail of the working wins, whatever pattern caught it.
const OPTION_PATTERNS = [
    /boxed\{\s*(?:\\text\{)?\s*\(\s*([1-4])\s*\)/gi,
    /boxed\{\s*([1-4])\s*\}/gi,
    /(?:option|choice|answer)\s*(?:is|:|=)?\s*(?:\*\*)?\s*\(\s*([1-4])\s*\)/gi,
    /(?:option|choice|answer)\s*(?:is|:|=)?\s*(?:\*\*)?\s*([1-4])\b(?![./])/gi,
    /\*\*\s*\(\s*([1-4])\s*\)/gi,
    /correct\s*(?:option|answer|choice)?\s*(?:is|:)?\s*(?:\*\*)?\s*\(?\s*([1-4])\s*\)?/gi,
];
const HEDGE = /depending on|either\s+\(?[1-4]|\bor\s+(?:option\s*)?\(?[1-4]\)?/i;

/** The option a working commits to, or null (no option, or a hedge — measured on both models, Run 10). */
function extractOption(text: string, options: string[]): { option: number | null; hedge: boolean } {
    const tail = text.slice(-600);
    const found: { at: number; option: number }[] = [];
    for (const p of OPTION_PATTERNS) {
        p.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = p.exec(tail)) !== null) found.push({ at: m.index + m[0].length, option: Number(m[1]) });
    }
    if (found.length) {
        found.sort((a, b) => a.at - b.at);
        const last = found[found.length - 1];
        const distinct = new Set(found.filter((f) => f.at > tail.length - 300).map((f) => f.option));
        if (distinct.size >= 2 && HEDGE.test(tail.slice(-300))) return { option: null, hedge: true };
        return { option: last.option, hedge: false };
    }
    // The option named by its text (2023-style papers print option ids, not numbers).
    const nt = normOpt(tail);
    const hits: number[] = [];
    options.forEach((o, i) => {
        const no = normOpt(o);
        if (no.length >= 2 && nt.includes(no)) hits.push(i + 1);
    });
    return { option: hits.length === 1 ? hits[0] : null, hedge: false };
}

/** The final value on the "Answer:" line (or in the last \boxed{}), as written. */
function extractValue(text: string): string | null {
    const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 6); i--) {
        const m = lines[i].match(/^\**\s*(?:final\s+)?answer\s*[:=]\s*\**\s*(.+?)\s*\**\s*$/i);
        if (m) return m[1].replace(/\$/g, '').replace(/\\boxed\{([^{}]*)\}/g, '$1').trim().slice(0, 80);
    }
    const boxed = [...text.matchAll(/\\boxed\{([^{}]{1,80})\}/g)];
    return boxed.length ? boxed[boxed.length - 1][1].trim() : null;
}

// ── the working, as the page prints it: plain text, numbered steps ───────────
const GREEK: Record<string, string> = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', nu: 'ν',
    pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', omega: 'ω', eta: 'η', kappa: 'κ', chi: 'χ', psi: 'ψ', zeta: 'ζ',
    Delta: 'Δ', Omega: 'Ω', Sigma: 'Σ', Phi: 'Φ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Gamma: 'Γ',
    times: '×', cdot: '·', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', sim: '~',
    to: '→', rightarrow: '→', Rightarrow: '⇒', leftrightarrow: '↔', infty: '∞', propto: '∝', degree: '°', circ: '°', angle: '∠',
    ldots: '…', cdots: '…', dots: '…', quad: ' ', qquad: ' ', hbar: 'ħ', partial: '∂', nabla: '∇', int: '∫', sum: 'Σ', therefore: '∴',
    implies: '⇒', rightleftharpoons: '⇌', longrightarrow: '→', xrightarrow: '→', because: '∵', equiv: '≡', div: '÷', neg: '¬',
};
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };

/** LaTeX and markdown a model still emits despite the plain-text rule → Unicode text. */
function deLatex(s: string): string {
    let t = String(s ?? '');
    const frac = (_m: string, a: string, b: string) => {
        const simple = (x: string) => /^[^\s+\-=±×·]+$/.test(x);      // one token: T_2/T_1, 200/400 — no brackets needed
        return (simple(a) ? a : '(' + a + ')') + '/' + (simple(b) ? b : '(' + b + ')');
    };
    const fracs = (x: string) => {
        for (let i = 0; i < 6; i++) x = x.replace(/\\(?:d|t)?frac\{([^{}]*)\}\{([^{}]*)\}/g, frac);
        x = x.replace(/\\(?:d|t)?frac\{([^{}]*)\}\s*([0-9A-Za-z])/g, frac);     // \frac{a}b
        x = x.replace(/\\(?:d|t)?frac\s*([0-9A-Za-z])\s*\{([^{}]*)\}/g, frac);   // \frac a{b}
        return x.replace(/\\(?:d|t)?frac\s*([0-9A-Za-z])\s*([0-9A-Za-z])/g, frac); // \frac12
    };
    t = fracs(t);
    for (let i = 0; i < 3; i++) t = t.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
    t = t.replace(/\\sqrt\s*([A-Za-z0-9]+)/g, '√$1');
    t = t.replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g, '($2)^(1/$1)');
    for (let i = 0; i < 3; i++) t = t.replace(/\\(?:text|mathrm|mathbf|mathit|textbf|boxed|vec|hat|bar|overline|underline|mbox)\{([^{}]*)\}/g, '$1');
    t = t.replace(/\\,|\\;|\\!|\\ /g, (m) => m === '\\!' ? '' : ' ');
    t = t.replace(/\\([A-Za-z]+)/g, (m, name) => GREEK[name] ?? m);      // before \left|\right, or \rightarrow loses its head
    t = t.replace(/\\(?:left|right|displaystyle|limits|nolimits|big|Big|bigg|Bigg)\b/g, '');
    t = t.replace(/\^\{([0-9+\-]{1,3})\}/g, (_m, d: string) => d.split('').map((c) => SUP[c] ?? c).join(''));
    t = t.replace(/\^([0-9])(?![0-9.])/g, (_m, d) => SUP[d]);
    t = t.replace(/\^\{([^{}]*)\}/g, '^($1)');
    t = t.replace(/_\{([0-9]{1,2})\}/g, (_m, d: string) => d.split('').map((c) => SUB[c] ?? c).join(''));
    t = t.replace(/_([0-9])(?![0-9])/g, (_m, d) => SUB[d]);
    t = t.replace(/_\{([^{}]*)\}/g, '_$1');
    t = fracs(t);                                                          // \frac{0.05}{10^{-4}}: the inner braces are gone now
    t = t.replace(/\\\[|\\\]|\\\(|\\\)|\$\$?/g, '');
    t = t.replace(/\\(?:text|mathrm|mathbf|mathit|textbf|boxed|vec|hat|bar|overline|underline|mbox|operatorname|mathcal|mathbb|mathsf|textit)\{/g, '{');   // nested wrappers the pass above skipped
    t = t.replace(/\*\*|__|^#+\s*/gm, '').replace(/\\\\/g, ' ').replace(/[{}]/g, '');
    t = t.replace(/(?<=[A-Za-z0-9)])\\([A-Za-z]+)/g, ' $1');            // 2\cos x → 2 cos x
    t = t.replace(/\\([A-Za-z]+)/g, '$1');                             // \sin → sin, \ln → ln, anything else → its name
    return t.replace(/[ \t]+/g, ' ').trim();
}

const MAX_LINES = 40;
const MAX_LINE_CHARS = 400;
const ANSWER_LINE = /^\**\s*(?:final\s+)?answer\s*[:=]/i;
const OPTION_SENTENCE = /^(therefore|hence|so|thus),?\s*(the\s+)?(correct\s+)?(answer|option)\s+is\s+\(?[1-4]\)?\.?$/i;
const CONT_START = /^(?:\$\s*)?(?:=|\\Rightarrow|\\implies|\\therefore|⇒|∴|\\to\b|→)/;
// A line that talks to the reader — the number the measurement gate reads.
const INSTRUCTION = /^(write|use|cancel|now|we|you|note that|let us|let's|first|next|then|finally|so we|substitute|apply|simplify|solve|differentiate|integrate|multiply|divide|add|subtract|rearrange|compare|consider|recall|observe|notice)\b/i;

/** A stray \\ce{…} (the rule forbids it; a model may still write one) → plain LaTeX. */
function deCe(s: string): string {
    return s.replace(/\\ce\{([^{}]*)\}/g, (_m, body: string) => {
        let t = body.trim();
        t = t.replace(/<=>/g, ' \\rightleftharpoons ').replace(/->/g, ' \\rightarrow ');
        t = t.replace(/([A-Za-z)\]])(\d+)/g, '$1_{$2}');
        t = t.replace(/\^(\d*[+-])/g, '^{$1}');
        return '\\mathrm{' + t.replace(/\s+/g, ' ') + '}';
    });
}

/** Display maths, aligned blocks and \( \) → one $…$ line per row. */
function normaliseMath(s: string): string {
    let t = s.replace(/\r/g, '');
    t = deCe(t);
    const block = (body: string) => {
        const inner = body.replace(/\\begin\{(?:aligned|align\*?|gather\*?|array)\}(?:\{[^}]*\})?/g, '').replace(/\\end\{(?:aligned|align\*?|gather\*?|array)\}/g, '')
            .replace(/&/g, '').replace(/\\\\/g, '\n');
        return '\n' + inner.split('\n').map((r) => r.trim()).filter(Boolean).map((r) => '$' + r + '$').join('\n') + '\n';
    };
    t = t.replace(/\$\$([\s\S]*?)\$\$/g, (_m, b) => block(b));
    t = t.replace(/\\\[([\s\S]*?)\\\]/g, (_m, b) => block(b));
    t = t.replace(/\\begin\{(?:aligned|align\*?|gather\*?)\}([\s\S]*?)\\end\{(?:aligned|align\*?|gather\*?)\}/g, (_m, b) => block(b));
    t = t.replace(/\\\(([\s\S]*?)\\\)/g, (_m, b) => '$' + String(b).trim() + '$');
    return t;
}

/** The plain-text twin of a LaTeX line (deLatex, the $ delimiters dropped). */
function plainOf(tex: string): string {
    return deLatex(tex.replace(/\$/g, '')).replace(/\s+/g, ' ').trim();
}

/** The working as lines of an answer sheet: {step, text, tex, kind}. The Answer line is dropped (it is `answer`). */
function toLines(text: string): Step[] {
    const raw = normaliseMath(String(text ?? '')).split('\n').map((l) => l.trim()).filter(Boolean);
    const out: Step[] = [];
    for (let l of raw) {
        if (ANSWER_LINE.test(l) || OPTION_SENTENCE.test(l)) continue;
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(l)) continue;                     // a rule
        if (/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(l)) continue;  // a table separator row
        l = l.replace(/\*\*|__/g, '').replace(/^#{1,6}\s*/, '').replace(/^[-*•]\s+/, '').trim();
        l = l.replace(/^(?:step\s*)?\(?\d{1,2}\)?\s*[.):]\s+/i, '').trim();
        if (/^\|.*\|$/.test(l)) l = l.slice(1, -1).replace(/\s*\|\s*/g, '  ').trim();   // a table row (an absolute value never spans the whole line)
        if (!l) continue;
        if (/^\$?\s*\\boxed\{.*\}\s*\$?$/.test(l)) continue;                   // a lone boxed answer
        const dollars = (l.match(/\$/g) ?? []).length;
        let tex = l;
        if (dollars % 2 === 1) { tex = ''; l = l.replace(/\$/g, ''); }
        else if (dollars === 0) tex = /\\[A-Za-z]+|[\^_{}]/.test(l) ? '$' + l + '$' : '';
        const plain = tex ? plainOf(tex) : deLatex(l);
        if (!plain) continue;
        const kind: Step['kind'] = CONT_START.test(l) ? 'cont' : (!tex && !/[=+\-×÷^√∫]|\d/.test(plain)) ? 'note' : 'line';
        out.push({ step: out.length + 1, text: plain.slice(0, MAX_LINE_CHARS), tex: tex.slice(0, MAX_LINE_CHARS), kind });
        if (out.length >= MAX_LINES) break;
    }
    return out;
}

/** What the ledger records about the shape of a working. */
function formatStats(lines: Step[]) {
    return {
        lines: lines.length,
        tex_lines: lines.filter((l) => !!l.tex).length,
        instr_lines: lines.filter((l) => INSTRUCTION.test(l.text)).length,
        note_lines: lines.filter((l) => l.kind === 'note').length,
        unbalanced: lines.filter((l) => !l.tex && l.kind === 'line').length,   // a maths line the page cannot typeset
    };
}

/** Lower-case letters and digits only, superscripts folded, the question number ("153.", "153)", "Q.153:") dropped. */
function stemOf(text: string): string {
    const t = String(text ?? '').toLowerCase().replace(/^\s*(?:q(?:uestion)?\s*\.?\s*)?\d{1,3}\s*[.):]\s*/, '');
    return t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d))).replace(/[^\p{L}\p{N}.]+/gu, ' ').replace(/\s\.|\.\s/g, ' ').trim();
}
/** The fingerprint's input: the stem and the options. */
function normalise(text: string, options: string[]): string {
    return stemOf(text) + '|' + options.map(stemOf).join('|');
}
/** Every number in the question and its options, sorted: two reads of ONE printed page share them; a twin with changed numbers does not. */
function numbersOf(text: string, options: string[]): string {
    const all = stemOf(text) + ' ' + options.map(stemOf).join(' ');
    return (all.match(/\d+(?:\.\d+)?/g) ?? []).map((n) => String(Number(n))).sort().join(',');
}

function deepseekTier(d = new Date()): 'off' | 'peak' {
    const h = d.getUTCHours(), w = d.getUTCDay();
    const peak = w >= 1 && w <= 5 && ((h >= 1 && h < 4) || (h >= 6 && h < 10));
    return peak ? 'peak' : 'off';
}

function sleep(ms: number): Promise<'timeout'> {
    return new Promise((r) => setTimeout(() => r('timeout'), Math.max(0, ms)));
}

// ── the models ───────────────────────────────────────────────────────────────
interface GeminiOut { text: string; tokens: Tokens; ms: number; cap_hit: boolean; error: string | null; usd: number }

async function gemini(model: string, parts: unknown[], generationConfig: Record<string, unknown>): Promise<GeminiOut> {
    const t0 = Date.now();
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), MODEL_TIMEOUT_MS);
    const rate = GEMINI_RATE[model] ?? GEMINI_RATE['gemini-3.7-flash'];
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
            body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig }),
        });
        if (!res.ok) throw new Error('Gemini ' + res.status + ': ' + (await res.text()).slice(0, 200));
        const json = await res.json();
        const u = json.usageMetadata ?? {};
        const tokens = { prompt: u.promptTokenCount ?? 0, output: u.candidatesTokenCount ?? 0, thoughts: u.thoughtsTokenCount ?? 0 };
        const cand = json.candidates?.[0];
        const text = (cand?.content?.parts ?? []).filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text ?? '').join('');
        const usd = (tokens.prompt * rate.input + (tokens.output + tokens.thoughts) * rate.output) / 1_000_000;
        return { text, tokens, ms: Date.now() - t0, cap_hit: cand?.finishReason === 'MAX_TOKENS', error: null, usd: Number(usd.toFixed(8)) };
    } catch (e) {
        return { text: '', tokens: { prompt: 0, output: 0, thoughts: 0 }, ms: Date.now() - t0, cap_hit: false, error: (e instanceof Error ? e.message : String(e)).slice(0, 200), usd: 0 };
    } finally {
        clearTimeout(timer);
    }
}

interface DeepseekOut extends GeminiOut { finish: string }

/** DeepSeek V4.1 Flash, OpenAI-compatible; the image as a data URL, thinking on (ds_probe.call). */
async function deepseek(content: string | unknown[], effort: string | null, maxTokens: number, extra: Record<string, unknown> = {}): Promise<DeepseekOut> {
    const t0 = Date.now();
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), MODEL_TIMEOUT_MS);
    const rate = DEEPSEEK_RATE[deepseekTier()];
    try {
        const body: Record<string, unknown> = { model: TEXT_MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content }], ...extra };
        if (effort) { body.thinking = { type: 'enabled' }; body.reasoning_effort = effort; }
        else body.thinking = { type: 'disabled' };
        const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + DEEPSEEK_KEY }, signal: ctl.signal,
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('DeepSeek ' + res.status + ': ' + (await res.text()).slice(0, 200));
        const json = await res.json();
        const u = json.usage ?? {};
        const hit = u.prompt_cache_hit_tokens ?? 0;
        const miss = u.prompt_cache_miss_tokens ?? Math.max(0, (u.prompt_tokens ?? 0) - hit);
        const out = u.completion_tokens ?? 0;
        const tokens = { prompt: hit + miss, output: out, thoughts: u.completion_tokens_details?.reasoning_tokens ?? 0 };
        const choice = json.choices?.[0] ?? {};
        const text = String(choice.message?.content ?? '');
        const usd = (hit * rate.hit + miss * rate.miss + out * rate.out) / 1_000_000;
        return { text, tokens, ms: Date.now() - t0, cap_hit: choice.finish_reason === 'length' || !text.trim(), error: null, usd: Number(usd.toFixed(8)), finish: String(choice.finish_reason ?? '') };
    } catch (e) {
        return { text: '', tokens: { prompt: 0, output: 0, thoughts: 0 }, ms: Date.now() - t0, cap_hit: false, error: (e instanceof Error ? e.message : String(e)).slice(0, 200), usd: 0, finish: 'error' };
    } finally {
        clearTimeout(timer);
    }
}

function asSolve(stage: string, model: string, effort: string | null, r: GeminiOut, options: string[]): Solve {
    const ex = r.text ? extractOption(r.text, options) : { option: null, hedge: false };
    return {
        stage, model, effort, ms: r.ms, tokens: r.tokens, cost_usd: r.usd, cap_hit: r.cap_hit, error: r.error,
        text: r.text, option: options.length ? ex.option : null, value: r.text ? extractValue(r.text) : null, hedge: ex.hedge,
    };
}

async function solveGemini(prompt: string, image: { mime: string; data: string }, options: string[]): Promise<Solve> {
    const r = await gemini(FIGURE_MODEL, [{ text: prompt }, { inline_data: { mime_type: image.mime, data: image.data } }], { maxOutputTokens: 16000 });
    return asSolve('solve', FIGURE_MODEL, null, r, options);
}

async function solveDeepseek(prompt: string, image: { mime: string; data: string }, effort: string, options: string[]): Promise<Solve> {
    const r = await deepseek([
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${image.mime};base64,${image.data}` } },
    ], effort, THINK_CAP + ANSWER_ROOM);
    return asSolve('solve', TEXT_MODEL, effort, r, options);
}

// The text-only twins (the confirm action re-solves a cached TEXT row from its
// transcript, no photo): the same prompt with the question and options appended.
async function solveGeminiText(prompt: string, options: string[]): Promise<Solve> {
    const r = await gemini(FIGURE_MODEL, [{ text: prompt }], { maxOutputTokens: 16000 });
    return asSolve('solve', FIGURE_MODEL, null, r, options);
}

async function solveDeepseekText(prompt: string, effort: string, options: string[]): Promise<Solve> {
    const r = await deepseek(prompt, effort, THINK_CAP + ANSWER_ROOM);
    return asSolve('solve', TEXT_MODEL, effort, r, options);
}

/** S7: the Run 13 judge on the working the student will see. */
async function judgeSyllabus(working: Step[]): Promise<{ verdict: string; call: Call }> {
    const text = working.map((s) => `${s.step}. ${s.text}`).join('\n');
    const r = await deepseek(JUDGE_PROMPT + text.slice(0, 12000), null, 1200, { response_format: { type: 'json_object' } });
    const call: Call = { stage: 'syllabus', model: TEXT_MODEL, effort: null, ms: r.ms, tokens: r.tokens, cost_usd: r.usd, cap_hit: r.cap_hit, error: r.error };
    if (r.error || !r.text) return { verdict: 'unchecked', call };
    try {
        const v = JSON.parse(r.text) as { verdict?: string; beyond?: unknown[] };
        return { verdict: v.verdict === 'beyond' && Array.isArray(v.beyond) && v.beyond.length ? 'beyond' : 'within', call };
    } catch {
        return { verdict: 'unchecked', call };
    }
}

// ── S5: the arbiter. Code decides the label; a model never does. ─────────────
interface Verdict { label: 'two_ways' | 'once' | 'unsure'; winner: Solve | null; alt: Solve | null; option: number | null; value: string | null }

function clean(r: Solve, hasOptions: boolean): boolean {
    return !r.error && !!r.text.trim() && (hasOptions ? r.option !== null : r.value !== null);
}

function agree(a: Solve, b: Solve, hasOptions: boolean): boolean {
    if (hasOptions) return a.option === b.option;
    const x = numberOf(a.value ?? ''), y = numberOf(b.value ?? '');
    if (x !== null && y !== null) return sameNumber(x, y);
    const p = normOpt(deLatex(a.value ?? '')), q = normOpt(deLatex(b.value ?? ''));
    return p === q && p.length > 0;
}

function arbiter(results: Solve[], hasOptions: boolean, primary: string): Verdict {
    const ok = results.filter((r) => clean(r, hasOptions));
    const first = (list: Solve[]) => list.find((r) => r.model === primary) ?? list[0] ?? null;
    if (ok.length >= 2) {
        const w = first(ok)!;
        const other = ok.find((r) => r !== w)!;
        if (agree(w, other, hasOptions)) return { label: 'two_ways', winner: w, alt: null, option: w.option, value: w.value };
        return { label: 'unsure', winner: w, alt: other, option: null, value: null };
    }
    if (ok.length === 1) return { label: 'once', winner: ok[0], alt: null, option: ok[0].option, value: ok[0].value };
    const spoke = results.filter((r) => !r.error && r.text.trim());
    const w = first(spoke);
    return { label: 'unsure', winner: w, alt: spoke.find((r) => r !== w) ?? null, option: null, value: null };
}

function modelSummary(r: Solve) {
    return { model: r.model, effort: r.effort, option: r.option, value: r.value, ms: r.ms, cap_hit: r.cap_hit, error: r.error ? true : false, hedge: r.hedge, cost_usd: r.cost_usd };
}

function callSummary(c: Call) {
    return { stage: c.stage, model: c.model, effort: c.effort, ms: c.ms, tokens: c.tokens, cost_usd: c.cost_usd, cap_hit: c.cap_hit, error: c.error };
}

interface CacheRow {
    fingerprint: string; subject: string; has_figure: boolean; route: string; question_text: string; options: string[]; ask: string;
    option: number | null; answer: string | null; answer_tex: string | null; working: Step[]; working_alt: { model: string; steps: Step[] } | null;
    label: string; source: string; models: unknown[]; conventions: unknown[]; similar_qs: unknown[]; syllabus: string | null; winner: string | null;
    hit_count: number; disputed: boolean;
}

async function cacheGet(fp: string): Promise<CacheRow | null | undefined> {
    try {
        const res = await rest(`ep_solve_cache?select=*&fingerprint=eq.${fp}`);
        if (!res.ok) return undefined;
        const rows = await res.json() as CacheRow[];
        return rows[0] ?? null;
    } catch { return undefined; }
}

/** The nearest cached transcript of the same subject (ep_solve_lookup: trigram similarity ≥ 0.85), or null. */
async function cacheLookup(subject: string, text: string, ask: string): Promise<{ fingerprint: string; sim: number } | null> {
    try {
        const res = await rest('rpc/ep_solve_lookup', { method: 'POST', body: JSON.stringify({ p_subject: subject, p_text: text.slice(0, 4000), p_ask: ask }) });
        if (!res.ok) return null;
        const rows = await res.json() as { fingerprint: string; sim: number }[];
        return rows[0] ?? null;
    } catch { return null; }
}

async function cachePut(row: Record<string, unknown>): Promise<void> {
    try {
        await rest('ep_solve_cache', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify([row]) });
    } catch (e) {
        console.error('[ep-solve] cache write failed', e);
    }
}

async function cachePatch(fp: string, patch: Record<string, unknown>): Promise<void> {
    try {
        await rest(`ep_solve_cache?fingerprint=eq.${fp}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) });
    } catch (e) {
        console.error('[ep-solve] cache patch failed', e);
    }
}

function answerText(v: Verdict, options: string[]): string | null {
    if (v.label === 'unsure') return null;
    if (v.option && options[v.option - 1]) return options[v.option - 1].slice(0, 120);
    return v.value ? deLatex(v.value).slice(0, 120) : null;
}
/** The final value as written (LaTeX, $-wrapped) for a question without options; null otherwise. */
function answerTex(v: Verdict, options: string[]): string | null {
    if (v.label === 'unsure' || v.option || !v.value) return null;
    const t = deCe(v.value).replace(/\$/g, '').replace(/\\boxed\{([^{}]*)\}/g, '$1').trim();
    return t ? ('$' + t + '$').slice(0, 160) : null;
}
/** A row written under the old plain-text rule has no `tex` on its lines: serve it as a miss. */
function currentFormat(row: CacheRow): boolean {
    if (FORMAT === 'plain') return true;
    return Array.isArray(row.working) && row.working.length > 0 && row.working.every((l) => typeof l.tex === 'string');
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { error: 'method not allowed' });

    // Guard 1 — origin allowlist.
    if (!ALLOWED_ORIGINS.includes(origin)) return reply(origin, 403, { error: 'origin not allowed' });
    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[ep-solve] no service key — refusing (fail closed)');
        return reply(origin, 503, { error: 'unconfigured' });
    }

    // Guard 2 — the body cap, BEFORE the body is read.
    const declared = Number(req.headers.get('content-length') ?? '0');
    if (declared > MAX_BYTES * 1.4 + 4096) return reply(origin, 413, { ok: false, reason: 'too_large' });

    let body: Record<string, any>;
    try {
        body = await req.json();
    } catch {
        return reply(origin, 400, { error: 'bad json' });
    }
    const deviceId = typeof body.device_id === 'string' && UUID_RE.test(body.device_id) ? body.device_id : null;
    if (!deviceId) return reply(origin, 400, { error: 'bad device' });
    const session = String(body.session_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon';
    const claimsTeam = body.internal === true;

    // ── "this answer looks wrong": the review queue ──────────────────────────
    if (body.action === 'report') {
        const fp = typeof body.fingerprint === 'string' && HEX64_RE.test(body.fingerprint) ? body.fingerprint : '';
        if (!fp) return reply(origin, 400, { error: 'bad fingerprint' });
        const row = await cacheGet(fp);
        if (!row) return reply(origin, 200, { ok: false, reason: 'unknown' });
        const optionShown = Number.isInteger(body.option) && body.option >= 1 && body.option <= 4 ? Number(body.option) : null;
        const label = typeof body.label === 'string' ? body.label.slice(0, 16) : null;
        const note = typeof body.note === 'string' ? body.note.slice(0, 300) : null;
        try {
            const res = await rest('ep_solve_reports', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify([{ fingerprint: fp, device_id: deviceId, option_shown: optionShown, label, note }]) });
            if (!res.ok) throw new Error('reports ' + res.status);
        } catch (e) {
            console.error('[ep-solve] report write failed', e);
            return reply(origin, 200, { ok: false, reason: 'down' });
        }
        await cachePatch(fp, { disputed: true, updated_at: new Date().toISOString() });
        await writeEvent(deviceId, session, claimsTeam, 'solve_report', { fingerprint: fp.slice(0, 12), option: optionShown, label });
        return reply(origin, 200, { ok: true });
    }

    if (body.action !== 'solve' && body.action !== 'confirm') return reply(origin, 400, { error: 'bad action' });
    // The image is required for a solve and optional for a confirm (a figure row
    // needs it again; a text row does not) — validated the same way when sent.
    const imageOptional = body.action !== 'solve';
    let mediaType = '', image = '', imageBytes = 0;
    if (!imageOptional || typeof body.image === 'string') {
        mediaType = typeof body.media_type === 'string' && MEDIA_TYPES.has(body.media_type) ? body.media_type : '';
        if (!mediaType) return reply(origin, 400, { error: 'bad media type' });
        image = typeof body.image === 'string' ? body.image.replace(/^data:[^,]*,/, '').replace(/\s/g, '') : '';
        if (!image || !/^[A-Za-z0-9+/=]+$/.test(image)) return reply(origin, 400, { error: 'bad image' });
        imageBytes = Math.floor(image.length * 3 / 4);
        if (imageBytes > MAX_BYTES) return reply(origin, 413, { ok: false, reason: 'too_large' });
        if (imageBytes < 256) return reply(origin, 400, { error: 'bad image' });
    }
    const askKey = body.ask === 'explain' ? 'explain' : 'solve';

    // THE LOCK. Before the key check and before the ledger: a locked device
    // never costs a model call.
    const token = typeof body.access_token === 'string' ? body.access_token : '';
    const open = OPEN_ORIGINS.includes(origin);
    const ent = open ? true : await entitled(deviceId, token);
    if (ent === null) {
        console.error('[ep-solve] entitlement read failed — refusing (fail closed)');
        return reply(origin, 200, { locked: true });
    }
    if (!ent) return reply(origin, 200, { locked: true });

    if (!GOOGLE_KEY || !DEEPSEEK_KEY) return reply(origin, 200, { ok: false, reason: 'quiet' });

    const isProbe = PROBE_TOKEN.length >= 16 && body.probe_token === PROBE_TOKEN;
    const isLocal = LOCAL_ORIGINS.has(origin);
    const internalP = (isProbe || isLocal || claimsTeam) ? Promise.resolve(false) : deviceIsInternal(deviceId);

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
        req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await sha256Hex(IP_SALT + '|' + rawIp);

    // Guards 3–5 from one ledger read. EVERY actor counts. A row that consumed
    // no read (unreadable photo, background upgrade) still counts for the IP
    // guard and the spend, never against the device's day.
    const ledger = await readTodayLedger();
    if (ledger === null) {
        console.error('[ep-solve] ledger unreadable — refusing (fail closed)');
        return reply(origin, 200, { ok: false, reason: 'down' });
    }
    let spentToday = 0;
    let deviceDay = 0;
    let ipMinute = 0;
    const nowMs = Date.now();
    for (const r of ledger) {
        spentToday += Number(r.estimated_cost_usd ?? 0);
        if (r.metadata?.device_id === deviceId && r.metadata?.consumed !== false) deviceDay++;
        if (r.metadata?.ip_hash === ipHash && nowMs - new Date(r.created_at).getTime() < 60_000) ipMinute++;
    }
    const left = (used: number) => open ? undefined : Math.max(0, PER_DAY - deviceDay - used);
    if (spentToday >= DAILY_USD_CAP) {
        console.warn('[ep-solve] daily spend cap hit: $' + spentToday.toFixed(4));
        return reply(origin, 200, { ok: false, reason: 'quiet' });
    }
    if (!open && deviceDay >= PER_DAY) return reply(origin, 200, { ok: false, reason: 'cap', reads_left: 0 });
    if (!open && ipMinute >= IP_PER_MIN) return reply(origin, 200, { ok: false, reason: 'busy', reads_left: left(0) });

    const t0 = Date.now();
    const calls: Call[] = [];
    const when = new Date();
    const deviceInternalP = internalP;

    async function ledgerRow(consumed: boolean, extra: Record<string, unknown>, fingerprintKey: string | null, cacheHit: boolean) {
        const deviceInternal = await deviceInternalP;
        const actor = isProbe ? 'eapcet_probe' : isLocal ? 'eapcet_local' : (deviceInternal || claimsTeam) ? 'eapcet_team' : 'eapcet_student';
        const actorReason = isProbe ? 'probe_token' : isLocal ? 'origin_localhost' : deviceInternal ? 'device_flag' : claimsTeam ? 'client_claim' : 'none';
        const usd = Number(calls.reduce((a, c) => a + c.cost_usd, 0).toFixed(8));
        const models = [...new Set(calls.map((c) => c.model))].join('+') || 'none';
        await writeUsage({
            session_id: session,
            task_type: TASK_TYPE,
            provider: models.includes('gemini') && models.includes('deepseek') ? 'google+deepseek' : models.includes('gemini') ? 'google' : 'deepseek',
            model: models,
            input_chars: imageBytes,
            output_chars: 0,
            latency_ms: Date.now() - t0,
            estimated_cost_usd: usd,
            fingerprint_key: fingerprintKey ? fingerprintKey + '|eapcet_finder|solve' : null,
            was_cache_hit: cacheHit,
            question_date: when.toISOString().split('T')[0],
            actor,
            metadata: {
                surface: 'eapcet_finder',
                actor_reason: actorReason,
                device_internal: deviceInternal,
                device_id: deviceId,
                ip_hash: ipHash,
                consumed,
                ask: askKey,
                image_bytes: imageBytes,
                media_type: mediaType,
                calls: calls.map(callSummary),
                cost_inr_estimate: Number((usd * USD_TO_INR).toFixed(6)),
                usd_to_inr_rate: USD_TO_INR,
                deepseek_tier: deepseekTier(),
                spent_today_usd_before: Number(spentToday.toFixed(6)),
                ...extra,
            },
        });
        return deviceInternal;
    }

    // ── confirm: a `once` row gets its second opinion from the OTHER family ──
    // The reviewer never solves, and never compares a page against a
    // single-model answer: it sends the student here first. The prior winner is
    // rebuilt as a Solve from the cache row, the other family solves the same
    // question (from the transcript for a text row, from the photo for a figure
    // row), and the same arbiter that labels a fresh solve relabels the row.
    if (body.action === 'confirm') {
        const fp = typeof body.fingerprint === 'string' && HEX64_RE.test(body.fingerprint) ? body.fingerprint : '';
        if (!fp) return reply(origin, 400, { error: 'bad fingerprint' });
        const row = await cacheGet(fp);
        if (row === undefined) return reply(origin, 200, { ok: false, reason: 'down' });
        if (!row) return reply(origin, 200, { ok: false, reason: 'unknown' });
        const cardFields = (r: CacheRow, label: string) => ({
            source: 'cache', label, option: r.option, answer: r.answer, answer_tex: r.answer_tex ?? null, format: FORMAT,
            working: r.working, working_alt: r.working_alt, winner: r.winner, models: r.models, conventions: r.conventions, similar: r.similar_qs,
            syllabus: r.syllabus, question_text: r.question_text, options: r.options, subject: r.subject, has_figure: r.has_figure, route: r.route, fingerprint: r.fingerprint,
        });
        if (row.label !== 'once') return reply(origin, 200, { ok: true, ...cardFields(row, row.label), confirmed: false, cost_usd: 0, ms: Date.now() - t0 });
        const options = Array.isArray(row.options) ? row.options.map((o) => String(o ?? '')) : [];
        const hasOptions = options.length > 0;
        const priorModel = row.winner || TEXT_MODEL;
        const prior: Solve = {
            stage: 'prior', model: priorModel, effort: null, ms: 0, tokens: { prompt: 0, output: 0, thoughts: 0 }, cost_usd: 0, cap_hit: false, error: null,
            text: (row.working ?? []).map((l) => l.tex || l.text).join('\n') + '\nAnswer: ' + (row.option ? 'option ' + row.option : (row.answer ?? '')),
            option: row.option, value: row.answer, hedge: false,
        };
        const prompt = ASKS.solve + (hasOptions ? '.' : ' and give the final value with its unit.') + '\n\n' + rulesFor('solve') +
            '\n\nQuestion:\n' + row.question_text + (hasOptions ? '\n\nOptions:\n' + options.map((o, i) => `(${i + 1}) ${o}`).join('\n') : '');
        const priorIsDeepseek = !priorModel.includes('gemini');
        let fresh: Solve;
        if (row.has_figure || row.route === 'figure') {
            if (!image) return reply(origin, 200, { ok: false, reason: 'needs_photo', fingerprint: fp });
            const img = { mime: mediaType, data: image };
            fresh = priorIsDeepseek ? await solveGemini(prompt, img, options) : await solveDeepseek(prompt, img, 'high', options);
        } else {
            fresh = priorIsDeepseek ? await solveGeminiText(prompt, options) : await solveDeepseekText(prompt, row.subject === 'maths' ? 'max' : TEXT_EFFORT, options);
        }
        calls.push(fresh);
        const v = arbiter([prior, fresh], hasOptions, priorModel);
        const models = [...(Array.isArray(row.models) ? row.models : []), modelSummary(fresh)];
        // The arbiter's label is the row's new label: two solvers agree → two_ways;
        // both clean and different → unsure; the fresh solver failed or gave no
        // clean answer → still once (nothing patched; the reviewer keeps waiting).
        let label = row.label;
        if (v.label === 'two_ways') {
            label = 'two_ways';
            const patch = { label: 'two_ways', models, updated_at: new Date().toISOString() };
            await cachePatch(fp, patch);
        } else if (v.label === 'unsure') {
            label = 'unsure';
            const patch = { label: 'unsure', option: null, answer: null, answer_tex: null, working_alt: { model: fresh.model, steps: toLines(fresh.text) }, models, updated_at: new Date().toISOString() };
            await cachePatch(fp, patch);
        }
        const after = { ...row, label, models, option: label === 'unsure' ? null : row.option, answer: label === 'unsure' ? null : row.answer, answer_tex: label === 'unsure' ? null : row.answer_tex, working_alt: label === 'unsure' ? { model: fresh.model, steps: toLines(fresh.text) } : row.working_alt };
        const internal = await ledgerRow(false, {
            outcome: 'confirm', source: 'model', route: row.route, label, option: after.option, fingerprint: fp, prior_model: priorModel, fresh_model: fresh.model,
            fresh_option: fresh.option, fresh_value: fresh.value, fresh_error: fresh.error ? true : false, open_door: open,
        }, fp, false);
        await writeEvent(deviceId, session, internal || claimsTeam || isLocal, 'solve_confirm', { label, route: row.route, subject: row.subject, ms: Date.now() - t0, prior_model: priorModel, fresh_model: fresh.model });
        return reply(origin, 200, { ok: true, ...cardFields(after, label), confirmed: label !== 'once', cost_usd: Number(calls.reduce((a, c) => a + c.cost_usd, 0).toFixed(6)), ms: Date.now() - t0 });
    }

    // ── S1 intake ────────────────────────────────────────────────────────────
    const intakeOut = await gemini(INTAKE_MODEL, [{ text: INTAKE_PROMPT }, { inline_data: { mime_type: mediaType, data: image } }],
        { temperature: 0, maxOutputTokens: 1500, responseMimeType: 'application/json', responseSchema: INTAKE_SCHEMA });
    calls.push({ stage: 'intake', model: INTAKE_MODEL, effort: null, ms: intakeOut.ms, tokens: intakeOut.tokens, cost_usd: intakeOut.usd, cap_hit: intakeOut.cap_hit, error: intakeOut.error });
    let intake: Intake = {};
    if (!intakeOut.error) {
        try { intake = JSON.parse(intakeOut.text) as Intake; } catch { intake = {}; }
    }
    if (intakeOut.error || !intakeOut.text) {
        console.error('[ep-solve] intake failed: ' + intakeOut.error);
        return reply(origin, 200, { ok: false, reason: 'down', reads_left: left(0) });
    }
    const questionText = String(intake.question_text ?? '').trim().slice(0, 4000);
    const options = (Array.isArray(intake.options) ? intake.options : []).map((o) => String(o ?? '').trim().slice(0, 300)).filter(Boolean).slice(0, 6);
    const subject = ['physics', 'chemistry', 'maths'].includes(String(intake.subject)) ? String(intake.subject) : 'other';
    const legible = Number.isFinite(intake.legible) ? Number(intake.legible) : 0;
    const inFrame = Number.isInteger(intake.questions_in_frame) ? Number(intake.questions_in_frame) : 1;
    const figureKind = String(intake.figure_kind ?? 'none');
    const hasFigure = intake.has_figure === true || (figureKind !== 'none' && figureKind !== '') || FIGURE_WORDS.test(questionText);
    const intakeMeta = { subject, has_figure: hasFigure, figure_kind: figureKind, legible, questions_in_frame: inFrame, options_n: options.length };

    if (!questionText || legible < 0.5) {
        const internal = await ledgerRow(false, { ...intakeMeta, outcome: 'unreadable' }, null, false);
        await writeEvent(deviceId, session, internal || claimsTeam || isLocal, 'solve', { outcome: 'unreadable', ms: Date.now() - t0, bytes: imageBytes });
        return reply(origin, 200, { ok: false, reason: 'unreadable', reads_left: left(0) });
    }
    if (inFrame > 1) {
        const internal = await ledgerRow(false, { ...intakeMeta, outcome: 'many_questions' }, null, false);
        await writeEvent(deviceId, session, internal || claimsTeam || isLocal, 'solve', { outcome: 'many_questions', ms: Date.now() - t0, bytes: imageBytes });
        return reply(origin, 200, { ok: false, reason: 'many_questions', reads_left: left(0) });
    }
    const fingerprint = await sha256Hex(normalise(questionText, options) + '|' + askKey);   // one row per ask
    const route = hasFigure ? 'figure' : 'text';

    // ── S2 cache: the exact fingerprint, else the nearest transcript of the
    // same subject (trigram similarity ≥ 0.85, in Postgres) whose NUMBERS all
    // match — two reads of one printed page differ by a character or two,
    // while a twin question with changed numbers must never hit.
    let cached = await cacheGet(fingerprint);
    let cacheFp = fingerprint;
    let cacheSim = cached ? 1 : 0;
    if (!cached) {
        const near = await cacheLookup(subject, questionText, askKey);
        if (near && near.fingerprint !== fingerprint) {
            const row = await cacheGet(near.fingerprint);
            if (row && numbersOf(row.question_text, row.options) === numbersOf(questionText, options)) { cached = row; cacheFp = row.fingerprint; cacheSim = near.sim; }
        }
    }
    if (cached && !currentFormat(cached)) { cached = null; cacheFp = fingerprint; cacheSim = 0; }
    if (cached && !cached.disputed) {
        await cachePatch(cacheFp, { hit_count: (cached.hit_count ?? 0) + 1, updated_at: new Date().toISOString() });
        const internal = await ledgerRow(true, { ...intakeMeta, outcome: 'cache', source: 'cache', route: cached.route, label: cached.label, option: cached.option, fingerprint: cacheFp, cache_sim: Number(cacheSim.toFixed(3)) }, cacheFp, true);
        await writeEvent(deviceId, session, internal || claimsTeam || isLocal, 'solve', { outcome: 'ok', source: 'cache', label: cached.label, route: cached.route, subject, ms: Date.now() - t0, reads_left: left(1), bytes: imageBytes });
        return reply(origin, 200, {
            ok: true, source: 'cache', label: cached.label, option: cached.option, answer: cached.answer, answer_tex: cached.answer_tex ?? null, format: FORMAT,
            working: cached.working, working_alt: cached.working_alt, winner: cached.winner, models: cached.models, conventions: cached.conventions, similar: cached.similar_qs,
            syllabus: cached.syllabus, question_text: cached.question_text, options: cached.options, subject: cached.subject, has_figure: cached.has_figure,
            route: cached.route, fingerprint: cacheFp, reads_left: left(1),
            cost_usd: Number(calls.reduce((a, c) => a + c.cost_usd, 0).toFixed(6)), ms: Date.now() - t0,
        });
    }

    // ── S3 route and solve, S4 triggers ──────────────────────────────────────
    const prompt = ASKS[askKey] + (options.length ? '.' : ' and give the final value with its unit.') + '\n\n' + rulesFor(askKey);
    const img = { mime: mediaType, data: image };
    const results: Solve[] = [];
    let late: Promise<Solve> | null = null;
    let primary = TEXT_MODEL;
    let secondReason: string | null = null;
    if (route === 'text') {
        const effort = subject === 'maths' ? 'max' : TEXT_EFFORT;
        const ds = await solveDeepseek(prompt, img, effort, options);
        results.push(ds);
        const hasOptions = options.length > 0;
        if (!clean(ds, hasOptions) || ds.hedge) {
            secondReason = ds.error ? 'error' : ds.cap_hit ? 'cap' : ds.hedge ? 'hedge' : 'no_option';
            results.push(await solveGemini(prompt, img, options));
        }
    } else {
        primary = FIGURE_MODEL;
        const tRoute = Date.now();
        const dsP = solveDeepseek(prompt, img, 'high', options);
        const gem = await solveGemini(prompt, img, options);
        results.push(gem);
        if (clean(gem, options.length > 0)) {
            const settled = await Promise.race([dsP, sleep(PAIR_WAIT_MS - (Date.now() - tRoute))]);
            if (settled === 'timeout') late = dsP;
            else results.push(settled);
        } else {
            results.push(await dsP);
        }
    }
    for (const r of results) calls.push(r);

    // ── S5 arbiter, S7 syllabus ──────────────────────────────────────────────
    const v = arbiter(results, options.length > 0, primary);
    const working = v.winner ? toLines(v.winner.text) : [];
    const workingAlt = v.label === 'unsure' && v.alt ? { model: v.alt.model, steps: toLines(v.alt.text) } : null;
    let syllabus = 'unchecked';
    if (SYLLABUS_CHECK && working.length) {
        const j = await judgeSyllabus(working);
        calls.push(j.call);
        syllabus = j.verdict;
    }
    const answer = answerText(v, options);
    const answerTexOut = answerTex(v, options);
    const models = results.map(modelSummary);
    const labelForCache = late ? 'once' : v.label;

    // ── S9 persist ───────────────────────────────────────────────────────────
    const row = {
        fingerprint, subject, has_figure: hasFigure, route, question_text: questionText, options, ask: askKey,
        option: v.option, answer, answer_tex: answerTexOut, working, working_alt: workingAlt, label: labelForCache, source: 'model',
        winner: v.winner ? v.winner.model : null, models, conventions: [], similar_qs: [], syllabus, hit_count: 0, disputed: false, updated_at: new Date().toISOString(),
    };
    if (working.length) await cachePut(row);
    const outcome = working.length ? 'ok' : 'no_working';
    const internal = await ledgerRow(true, {
        ...intakeMeta, outcome, source: 'model', route, label: labelForCache, option: v.option, fingerprint, second_reason: secondReason, open_door: open,
        format: { rule: FORMAT, ...formatStats(working) },
        late_pair: !!late, syllabus, models: models.map((m) => ({ model: m.model, effort: m.effort, option: m.option, ms: m.ms, cap_hit: m.cap_hit, error: m.error })),
    }, fingerprint, false);
    await writeEvent(deviceId, session, internal || claimsTeam || isLocal, 'solve', {
        outcome, source: 'model', label: labelForCache, route, subject, ms: Date.now() - t0, reads_left: left(1), bytes: imageBytes, second_reason: secondReason, late_pair: !!late,
    });

    // The wait rule: DeepSeek finishes after the reply and upgrades the row.
    if (late) {
        const done = late.then(async (ds) => {
            const all = [...results, ds];
            const v2 = arbiter(all, options.length > 0, primary);
            const alt2 = v2.label === 'unsure' && v2.alt ? { model: v2.alt.model, steps: toLines(v2.alt.text) } : null;
            if (v2.winner) {
                await cachePatch(fingerprint, {
                    label: v2.label, option: v2.option, answer: answerText(v2, options), answer_tex: answerTex(v2, options), working: toLines(v2.winner.text), working_alt: alt2,
                    winner: v2.winner.model, models: all.map(modelSummary), updated_at: new Date().toISOString(),
                });
            }
            calls.length = 0;
            calls.push(ds);
            await ledgerRow(false, { ...intakeMeta, outcome: 'pair_late', source: 'model', route, label: v2.label, option: v2.option, fingerprint }, fingerprint, false);
        }).catch((e) => console.error('[ep-solve] late pair failed', e));
        const rt = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
        if (rt?.waitUntil) rt.waitUntil(done);
    }

    if (!working.length) return reply(origin, 200, { ok: false, reason: 'down', reads_left: left(1) });
    return reply(origin, 200, {
        ok: true, source: 'model', label: labelForCache, option: v.option, answer, answer_tex: answerTexOut, format: FORMAT,
        working, working_alt: workingAlt, winner: v.winner ? v.winner.model : null, models, conventions: [], similar: [], syllabus,
        question_text: questionText, options, subject, has_figure: hasFigure, route, fingerprint,
        reads_left: left(1),
        cost_usd: Number(calls.reduce((a, c) => a + c.cost_usd, 0).toFixed(6)), ms: Date.now() - t0,
    });
});
