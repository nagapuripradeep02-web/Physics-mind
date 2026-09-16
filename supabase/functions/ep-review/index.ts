/**
 * ep-review — checks a photo of a student's HANDWRITTEN working for one
 * question and names the FIRST line that goes wrong, or says CORRECT, or says
 * UNSURE with one concrete ask. The reviewer never solves.
 *
 * The design is docs/SOLUTION_REVIEWER_ARCHITECTURE.md on master plus the
 * cost router of 2026-09-16. The guard ladder is ep-solve's, unchanged:
 * origin allowlist, service key, the body cap, the lock, one ledger read for
 * the three volume caps, actor labels, telemetry. What is new is the pipeline:
 *
 *   S1 read     a pluggable reader (Gemini 3.7 Flash by default; an
 *               OpenAI-compatible vision endpoint or DeepSeek by env) turns the
 *               page into numbered lines exactly as written — the reader
 *               TRANSCRIBES, NEVER CORRECTS, and marks what it cannot read.
 *   S2 checks   code, $0: every line's arithmetic, whether a continuation or a
 *               same-left-side line follows from the one above (sampled
 *               numerically, deterministic), and the final value against the
 *               key under the exam's own conventions (g = 9.8 or 10, summed
 *               relative errors, unit prefixes, printed rounding).
 *   S3 judges   Judge B (DeepSeek, the transcript) always; Judge A (Gemini, the
 *               photo + the numbered transcript) only when a predicate fires —
 *               low legibility, a diagram, B unsure/hedged/unquoted/unsupported,
 *               B against the machine facts, or B disputing the transcript.
 *   S4 arbiter  CODE decides. A failing fact blocks CORRECT (two errors that
 *               cancel are two errors). ERROR needs a judge that quoted the
 *               student's own line AND either a second judge on the same line
 *               and class or a failing fact within one line. Anything else is
 *               UNSURE with an ask: retake the photo, or type the value at one
 *               line (a clarification, not a new attempt).
 *   S5 persist  ep_reviews (the transcript and the verdict, never the image),
 *               one ai_usage_log row per request with every call itemised, one
 *               ep_events row.
 *
 * The reference is never solved here: an ep_solve_cache row labelled two_ways
 * (a `once` row must be confirmed first — ep-solve's confirm action), an
 * ep_solutions row by question id, or an inline reference the harness sends
 * under the probe token.
 *
 * Request  {action:'review', device_id, access_token?, image:<base64>, media_type,
 *           fingerprint? | question_id? | reference?,          -- exactly one
 *           typed_final?, typed_value_at_line?:{n, value}, session_id?, internal?,
 *           probe_token?, probe_overrides?:{reader?, judge_a?, judge_b?, s2?}}
 *                                       -- overrides honoured ONLY with a valid probe_token (ablations)
 *          reference = {question_text, options?, key_option?, key_value?, steps:[{text, tex?}]}  -- probe_token only
 *          {action:'dispute', device_id, review_id, note?}
 * Reply    {locked:true}
 *        | {ok:false, reason:'too_large'|'quiet'|'down'|'cap'|'busy'|'unreadable'|'no_reference'|'confirm_first', reads_left?}
 *        | {ok:true, verdict:'CORRECT'|'ERROR'|'UNSURE', first_error_line, error_class, what_should_be,
 *           concept_tag, evidence_line:{n,text,tex}|null, transcript:[{n,text,tex,kind,legible}],
 *           final_value_read, final_matches_key, judges_ran:['B','A'?], escalated, escalation_reason,
 *           ask:'retake'|'type_value_at_line'|null, ask_line, method:string|null, attempt_no, review_id,
 *           reads_left, cost_usd, ms}
 *
 * typed_value_at_line keeps the SAME attempt_no (a clarification, not a new
 * attempt) and substitutes the value into that line's calc and the final check.
 * Invariants (src/lib/eapcet/__tests__/review_prompt.test.ts): the image is
 * never stored; a read is consumed only on ok:true; the reviewer never solves;
 * ERROR never returns without evidence_line being a transcript line.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account:
 *   npx supabase functions deploy ep-review --no-verify-jwt --use-api --project-ref <ref>
 *
 *   needs EP_SOLVE_GOOGLE_KEY (falls back to GOOGLE_GENERATIVE_AI_API_KEY) and DEEPSEEK_API_KEY
 *   optional: EP_REVIEW_READER (gemini | openai | deepseek), EP_REVIEW_READER_MODEL,
 *             EP_REVIEW_READER_BASE + EP_REVIEW_READER_KEY (+ EP_REVIEW_READER_RATE_IN/OUT) for reader=openai,
 *             EP_REVIEW_JUDGE_A (escalate | always | never), EP_REVIEW_JUDGE_A_MODEL,
 *             EP_REVIEW_JUDGE_B_MODEL, EP_REVIEW_JUDGE_B_EFFORT, EP_REVIEW_THINK_CAP,
 *             EP_REVIEW_MODEL_TIMEOUT_MS, EP_REVIEW_READER_MAX_TOKENS, EP_REVIEW_PER_DAY,
 *             EP_REVIEW_DAILY_USD_CAP, EP_ALLOWED_ORIGINS, EP_OPEN_ORIGINS, EP_IP_PER_MIN,
 *             EP_PHOTO_MAX_BYTES, EP_IP_SALT, EP_USD_INR,
 *             EP_PROBE_TOKEN (labels automated probes and unlocks the inline reference; never exempts caps)
 *
 * The two prompts below are the same text as src/prompts/eapcet_review_transcribe.txt
 * and src/prompts/eapcet_review_judge.txt; review_prompt.test.ts fails when they drift.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// ── B. environment + rates ───────────────────────────────────────────────────
const GOOGLE_KEY = Deno.env.get('EP_SOLVE_GOOGLE_KEY') ?? Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY') ?? '';
const DEEPSEEK_KEY = Deno.env.get('DEEPSEEK_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const READER_ENV = Deno.env.get('EP_REVIEW_READER') ?? 'gemini';
const READER: 'gemini' | 'openai' | 'deepseek' = READER_ENV === 'openai' || READER_ENV === 'deepseek' ? READER_ENV : 'gemini';
const READER_MODEL_ENV = Deno.env.get('EP_REVIEW_READER_MODEL') ?? '';
const READER_BASE = Deno.env.get('EP_REVIEW_READER_BASE') ?? '';
const READER_KEY = Deno.env.get('EP_REVIEW_READER_KEY') ?? '';
const READER_RATE = { input: Number(Deno.env.get('EP_REVIEW_READER_RATE_IN') ?? '0'), output: Number(Deno.env.get('EP_REVIEW_READER_RATE_OUT') ?? '0') };
const JUDGE_A_ENV = Deno.env.get('EP_REVIEW_JUDGE_A') ?? 'escalate';
const JUDGE_A_MODE: 'escalate' | 'always' | 'never' = JUDGE_A_ENV === 'always' || JUDGE_A_ENV === 'never' ? JUDGE_A_ENV : 'escalate';
const JUDGE_A_MODEL = Deno.env.get('EP_REVIEW_JUDGE_A_MODEL') ?? 'gemini-3.7-flash';
const JUDGE_B_MODEL = Deno.env.get('EP_REVIEW_JUDGE_B_MODEL') ?? 'deepseek-flash';
const JUDGE_B_EFFORT = Deno.env.get('EP_REVIEW_JUDGE_B_EFFORT') ?? 'high';
const THINK_CAP = Number(Deno.env.get('EP_REVIEW_THINK_CAP') ?? '8000');
const MODEL_TIMEOUT_MS = Number(Deno.env.get('EP_REVIEW_MODEL_TIMEOUT_MS') ?? '60000');
const READER_MAX_TOKENS = Number(Deno.env.get('EP_REVIEW_READER_MAX_TOKENS') ?? '6000');
const PER_DAY = Number(Deno.env.get('EP_REVIEW_PER_DAY') ?? '20');
const DAILY_USD_CAP = Number(Deno.env.get('EP_REVIEW_DAILY_USD_CAP') ?? '2');
const IP_PER_MIN = Number(Deno.env.get('EP_IP_PER_MIN') ?? '4');
const MAX_BYTES = Number(Deno.env.get('EP_PHOTO_MAX_BYTES') ?? String(Math.round(1.5 * 1024 * 1024)));
const USD_TO_INR = Number(Deno.env.get('EP_USD_INR') ?? '95.69');
const IP_SALT = Deno.env.get('EP_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
const JUDGE_A_MAX_TOKENS = 2500;

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

const TASK_TYPE = 'eapcet_review';

const PROBE_TOKEN = Deno.env.get('EP_PROBE_TOKEN') ?? '';
const LOCAL_ORIGINS = new Set(['http://localhost:8120', 'http://127.0.0.1:8120']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX64_RE = /^[0-9a-f]{64}$/;
const QID_RE = /^tg_eapcet_\d{4}_\d{8}_(an|fn)_q\d{3}$/;
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

// ── C. prompts (src/prompts/eapcet_review_*.txt, byte-identical) ────────────
const READ_PROMPT = `You read a photograph of a student's HANDWRITTEN working for one exam question
and TRANSCRIBE it, line by line, exactly as written. You are a copyist, not a
marker and not a solver.

WHAT YOU ARE LOOKING AT
A student worked this question by hand, on rough paper, then photographed it with a
phone. So:
- The handwriting may be untidy, slanted, or faint.
- The photo may be at an angle, shadowed, cropped, or partly out of focus.
- Physics notation is hand-drawn: square-root signs, Greek letters, superscripts,
  subscripts, fractions, arrows over vector names.
- There may be crossings-out, arrows, margin working, or a second attempt.

TRANSCRIBE WHAT IS WRITTEN. NEVER CORRECT IT.
If the page says 2 × 3 = 5, write "2 × 3 = 5". The mistake IS the information;
a corrected transcript hides exactly what the student needs to see. Copy every
number, sign, unit and symbol as the student wrote it, even when it is wrong,
even when you can see what was meant. Crossed-out working is transcribed with
the words "(crossed out)" at the end of the line.

BE FAIR TO HANDWRITING
- A student's shorthand counts: "s = 1/2 g t^2" is written as it is, not expanded.
- Greek letters are often just squiggles. If the surrounding algebra fits, read
  it as the intended symbol.
- The student may combine two steps in one line, or split one step across two.
  One line on the page is one line in the transcript.
- Do not tidy the order. Lines are transcribed top to bottom, left column before
  right column, the way the page reads.

MARK, NEVER GUESS
When a span cannot be read, write [?] in its place and give the line a legible
score of 0.4 or less. Never fill an unreadable span with the value that would
make the line correct, and never fill it with the value that would make it wrong.
A whole line you cannot read is one line: text "[?]", legible 0.1.

WHAT YOU MUST NEVER DO
- NEVER compute a value, a total, an answer or a correction. You do not solve the
  question and you do not check the working.
- NEVER add a line that is not on the page, and never drop one that is.
- NEVER say whether the working is right, and never say which option is correct.
- NEVER give advice, corrections, or physics teaching.

EACH LINE
  n        - the line number, 1 for the first line on the page.
  tex      - the line in LaTeX, as written (mathematics between $ and $).
  text     - the same line in plain text (x^2, sqrt(2), 10^-3, ×, π, θ).
  calc     - the line as a plain arithmetic expression a computer can evaluate,
             or null. Write every multiplication with an explicit * (2*a*s, not
             2as), powers with ^ (v^2), roots as sqrt(...), functions as
             sin(...) cos(...) tan(...) log(...) ln(...) exp(...) abs(...),
             degrees as deg(30), pi for π. Keep the = signs, so that
             "v^2 = u^2 + 2*a*s" stays one expression with two sides. A line
             that continues the previous one starts with "= ". Copy the numbers
             exactly, including wrong ones. calc is null for a statement, a
             diagram, or a line with an unreadable span.
  kind     - equation (a line of mathematics), statement (words: "Given:",
             "Let u = 0"), diagram (a drawing, a free-body sketch, a graph), or
             final (the boxed, underlined or circled final answer line).
  legible  - how sure you are that YOUR READING of this line is right:
             0.9 to 1.0  clearly legible, no doubt either way.
             0.6 to 0.8  fairly sure.
             0.3 to 0.5  the handwriting or the photo makes this genuinely unclear.
             0.0 to 0.2  you are guessing.
             Use the low band whenever the image quality is the reason you cannot
             tell. That is a photo problem, not a student problem.

THE FINAL VALUE
final_value_read is the last boxed, underlined, circled or clearly final number on
the page, with its unit exactly as the student wrote it ("2.28 m/s", "4 m", "3:4").
If two candidates exist, take the one nearest the end of the working. If there is
no clear final number, it is null. Copy it; never compute it, round it or correct
it.

OUTPUT
Return JSON with exactly these fields:
  readable          - false only if the image is so dark, blurred, or empty that
                      you cannot read any of it. If you can read even part of the
                      page, this is true.
  lines[]           - one entry per line on the page, top to bottom:
                      { n, tex, text, calc, kind, legible }
  final_value_read  - the final number as written, with its unit, or null.
  note              - at most one short sentence about the page itself (a second
                      attempt, a crossed-out block, a page edge cut off), or null.

THE QUESTION (for context only; you are not asked to solve it)
{{question_text}}

THE OPTIONS
{{options_block}}

Transcribe the attached page. Copy what is written; do not compute anything.
`;

const JUDGE_PROMPT = `You are checking a student's HANDWRITTEN working for one exam question. The page
was transcribed line by line, exactly as written. You judge the working from the
transcript below and name the FIRST line where it goes wrong, if it does.

THE QUESTION
{{question_block}}

THE REFERENCE (a comparison aid, one way of solving it)
{{reference_block}}

THE STUDENT'S TYPED FINAL ANSWER
{{typed_final}}

THE TRANSCRIPT (use these line numbers)
{{transcript_block}}

MACHINE FACTS (checked by code)
{{facts_block}}

CONVENTIONS
{{conventions_block}}

{{page_block}}

THE STANDARD
- A different valid method is CORRECT. The student does not have to follow the
  reference; they have to reach a right answer by sound steps.
- The reference is a comparison aid, never the standard. It shows one way; the
  physics is the standard.
- The exam's own conventions are the standard where they apply (the CONVENTIONS
  block). A student who follows the exam's convention is CORRECT even where the
  reference differs.

HOW TO JUDGE
1. Read the transcript top to bottom. At each line ask: does this line follow
   from the lines above and the question? Is the physics right? Is the algebra
   right? Is the arithmetic right?
2. The FIRST line that is wrong is the error. Later lines that are wrong only
   because of it are not further errors.
3. Name ONE line. "Line 3, or possibly 5" is not an answer; that is UNSURE.
4. Quote the student's own line, exactly as it appears in the transcript, in
   evidence_quote. If you cannot quote it, you cannot dispute it.
5. Say UNSURE rather than guess. If the transcript is too unclear at the line
   that matters, or you cannot tell whether a step is wrong, the verdict is
   UNSURE, not ERROR.
6. The machine facts above are checked by code; do not contradict an arithmetic
   fact, but a fact is not a verdict. A line the code flags may be a copying slip
   on a sound method; a line the code passes may still be wrong physics.
7. A final answer that matches the key does not make the working CORRECT when a
   step is wrong; two errors can cancel. A final answer that differs from the key
   is not by itself an error on any line; find the line.

ERROR CLASSES (one per verdict)
  concept       - the idea used on this line does not apply here (wrong law, wrong
                  formula for the situation, wrong physical assumption).
  method        - a step is missing, or the steps are in the wrong order, or the
                  approach cannot reach the answer.
  calculation   - the numbers or the algebra on this line: arithmetic, a sign lost
                  in rearranging, a power, a root.
  reading       - a value was copied wrongly from the question, OR the transcript
                  itself misread the page (say which in what_should_be).
  convention    - a sign convention, a unit, or an exam convention on this line.
  presentation  - the line does not say what the student means (a missing equals
                  sign, a unit dropped, a symbol reused), and the working is
                  otherwise sound.

WHAT YOU MUST NEVER DO
- Never reveal the rest of the reference; what_should_be is one line about the
  disputed step only. Write it in plain words a Class 12 student understands.
- Never solve the question yourself and compare answers; judge the lines.
- Never mark a line wrong because it is written differently from the reference.
- Never name a line you did not quote.

OUTPUT
Return JSON with exactly these fields:
  verdict           - CORRECT, ERROR, or UNSURE.
  first_error_line  - the line number (from the transcript) of the first wrong
                      line; null unless the verdict is ERROR.
  error_class       - concept, method, calculation, reading, convention or
                      presentation; null unless the verdict is ERROR.
  what_should_be    - one line about the disputed step only, or null.
  concept_tag       - a short tag for the physics idea involved ("energy
                      conservation", "relative error"), or null.
  evidence_quote    - the student's line, copied from the transcript, or null.
  method            - the student's method in one plain sentence, filled only on
                      CORRECT; null otherwise.
  confidence        - 0 to 1, how sure you are of the verdict.

Judge the transcript above. Reply with JSON only.
`;

// Judge A sees the photograph; Judge B sees only the transcript.
const PAGE_BLOCK_A = 'THE PHOTOGRAPH is attached. Use the transcript\'s line numbers. If the transcript misread a line, say so with error_class reading and quote what you see on the page.';

// ── D. the JSON the models must return (Gemini's OpenAPI subset) ─────────────
const READ_SCHEMA = {
    type: 'OBJECT',
    properties: {
        readable: { type: 'BOOLEAN' },
        lines: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    n: { type: 'INTEGER' },
                    tex: { type: 'STRING' },
                    text: { type: 'STRING' },
                    calc: { type: 'STRING', nullable: true },
                    kind: { type: 'STRING', enum: ['equation', 'statement', 'diagram', 'final'] },
                    legible: { type: 'NUMBER' },
                },
                required: ['n', 'tex', 'text', 'kind', 'legible'],
            },
        },
        final_value_read: { type: 'STRING', nullable: true },
        note: { type: 'STRING', nullable: true },
    },
    required: ['readable', 'lines'],
};

const JUDGE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        verdict: { type: 'STRING', enum: ['CORRECT', 'ERROR', 'UNSURE'] },
        first_error_line: { type: 'INTEGER', nullable: true },
        error_class: { type: 'STRING', nullable: true },
        what_should_be: { type: 'STRING', nullable: true },
        concept_tag: { type: 'STRING', nullable: true },
        evidence_quote: { type: 'STRING', nullable: true },
        method: { type: 'STRING', nullable: true },
        confidence: { type: 'NUMBER' },
    },
    required: ['verdict', 'confidence'],
};

interface Tokens { prompt: number; output: number; thoughts: number }
interface Call { stage: string; model: string; effort: string | null; ms: number; tokens: Tokens; cost_usd: number; cap_hit: boolean; error: string | null }
interface ModelOut { text: string; tokens: Tokens; ms: number; cap_hit: boolean; error: string | null; usd: number; finish: string; status: number }

// ── E. transport helpers (ep-solve's) ────────────────────────────────────────
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
        console.error('[ep-review] usage write failed', e);
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
        console.error('[ep-review] event write failed', e);
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

// ── the entitlement (the same resolution as ep-state, ep-vidi-chat, ep-solve)
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

function deepseekTier(d = new Date()): 'off' | 'peak' {
    const h = d.getUTCHours(), w = d.getUTCDay();
    const peak = w >= 1 && w <= 5 && ((h >= 1 && h < 4) || (h >= 6 && h < 10));
    return peak ? 'peak' : 'off';
}

// ---- PURE (tested) ----
// Everything between the markers is plain TypeScript with nothing from the
// runtime: no network, no secrets, no constant defined outside the block.
// review_pure.test.ts slices this text, transpiles it and runs it in Node.

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

interface TLine { n: number; text: string; tex: string; calc: string | null; kind: string; legible: number }
interface Fact { line: number; fact: string; detail: string | null }
interface Ref { question_text?: string; options?: string[]; key_option?: number | null; key_value?: string | null; steps?: unknown[] }
interface Judge { verdict: 'CORRECT' | 'ERROR' | 'UNSURE'; first_error_line: number | null; error_class: string | null; what_should_be: string | null; concept_tag: string | null; evidence_quote: string | null; method: string | null; confidence: number }
interface Validated { status: 'ok' | 'discarded' | 'hedged' | 'failed'; judge: Judge | null; reason: string | null; quote_line: number | null; name?: string }
interface FinalCheck { final: string | null; finalMatch: boolean; option: number | null; fact: Fact | null; detail: string | null; note: string | null }
interface EvidenceLine { n: number; text: string; tex: string }
interface Verdict { verdict: 'CORRECT' | 'ERROR' | 'UNSURE'; first_error_line: number | null; error_class: string | null; what_should_be: string | null; concept_tag: string | null; evidence_line: EvidenceLine | null; ask: 'retake' | 'type_value_at_line' | null; ask_line: number | null; method: string | null; reason: string | null }

const FAILING_FACTS = new Set(['arith_mismatch', 'does_not_follow', 'final_mismatch', 'final_conflict']);
const ERROR_CLASSES = new Set(['concept', 'method', 'calculation', 'reading', 'convention', 'presentation']);
const MAX_TOKENS = 200;
const MAX_DEPTH = 40;
const SAMPLE_POINTS = 8;
const MIN_VALID_POINTS = 3;
const LOW_LEGIBLE = 0.6;
const PCT_NOTE = 'EAPCET adds relative errors: the error in a product or quotient is the SUM of the relative errors of the factors, never the square root of the sum of squares. A student who summed is CORRECT even if the reference did not.';
const HEDGE_RE = /\b(or|possibly|maybe|either)\b.*\bline\b|line\s*\d+\s*(or|\/)\s*\d+/i;

// ── the evaluator: a recursive-descent parser over a tiny grammar ──────────
//   expr := term (('+'|'-') term)*   term := unary (('*'|'/') unary)*
//   unary := ('+'|'-') unary | power  power := atom ('^' unary)?   (right-assoc)
//   atom := NUMBER | IDENT | IDENT '(' expr ')' | '(' expr ')'
// Implicit * between NUMBER→IDENT, NUMBER→'(', ')'→'('/IDENT/NUMBER, IDENT→'(' or
// IDENT→IDENT/NUMBER when the IDENT is not a function. Free variables are sampled.
const FUNCS: Record<string, (x: number) => number> = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sqrt: Math.sqrt, log: Math.log10, ln: Math.log, exp: Math.exp, abs: Math.abs, deg: (x) => x * Math.PI / 180,
};
const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };
const GREEK_NAMES: Record<string, string> = {
    'θ': 'theta', 'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'epsilon', 'λ': 'lambda', 'μ': 'mu', 'µ': 'mu',
    'ω': 'omega', 'ρ': 'rho', 'σ': 'sigma', 'τ': 'tau', 'φ': 'phi', 'η': 'eta', 'Δ': 'Delta', 'Ω': 'Omega',
};

interface Tok { t: 'num' | 'id' | 'op' | 'lp' | 'rp'; v: string }
type Ast = { k: 'num'; v: number } | { k: 'var'; name: string } | { k: 'fn'; name: string; arg: Ast } | { k: 'bin'; op: string; l: Ast; r: Ast } | { k: 'neg'; e: Ast };

/** The unicode a transcript carries → the grammar's ASCII. */
function unicodePass(s: string): string {
    let t = String(s ?? '');
    t = t.replace(/[×·⋅]/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-');
    t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => '^(' + m.replace(/⁻/g, '-').replace(/⁺/g, '+').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d))) + ')');
    t = t.replace(/√\s*\(/g, 'sqrt(').replace(/√\s*([A-Za-z0-9_.]+)/g, 'sqrt($1)');
    t = t.replace(/π/g, ' pi ');
    t = t.replace(/[θαβγδελμµωρστφηΔΩ]/g, (g) => ' ' + (GREEK_NAMES[g] ?? g) + ' ');
    return t;
}

function implicitMul(a: Tok, b: Tok): boolean {
    if (a.t === 'num' && (b.t === 'id' || b.t === 'lp')) return true;
    if (a.t === 'rp' && (b.t === 'lp' || b.t === 'id' || b.t === 'num')) return true;
    if (a.t === 'id' && FUNCS[a.v] === undefined && (b.t === 'lp' || b.t === 'id' || b.t === 'num')) return true;
    return false;
}

function tokenize(expr: string): Tok[] | null {
    const s = unicodePass(expr);
    const raw: Tok[] = [];
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (/\s/.test(c)) { i++; continue; }
        if (/[0-9.]/.test(c)) {
            const m = s.slice(i).match(/^(\d+(?:\.\d*)?|\.\d+)/);
            if (!m) return null;
            raw.push({ t: 'num', v: m[1] });
            i += m[1].length;
            continue;
        }
        if (/[A-Za-z_]/.test(c)) {
            const m = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
            if (!m) return null;
            raw.push({ t: 'id', v: m[0] });
            i += m[0].length;
            continue;
        }
        if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^') { raw.push({ t: 'op', v: c }); i++; continue; }
        if (c === '(' || c === '[' || c === '{') { raw.push({ t: 'lp', v: '(' }); i++; continue; }
        if (c === ')' || c === ']' || c === '}') { raw.push({ t: 'rp', v: ')' }); i++; continue; }
        return null;
    }
    if (raw.length === 0 || raw.length > MAX_TOKENS) return null;
    const out: Tok[] = [];
    for (const tok of raw) {
        const last = out[out.length - 1];
        if (last && implicitMul(last, tok)) out.push({ t: 'op', v: '*' });
        out.push(tok);
    }
    return out.length > MAX_TOKENS ? null : out;
}

function parse(tokens: Tok[]): Ast | null {
    let pos = 0;
    let depth = 0;
    const peek = (): Tok | undefined => tokens[pos];
    const take = (): Tok | undefined => tokens[pos++];
    const isOp = (v: string): boolean => { const t = peek(); return !!t && t.t === 'op' && t.v === v; };
    function expr(): Ast {
        if (++depth > MAX_DEPTH) throw new Error('depth');
        let l = term();
        while (isOp('+') || isOp('-')) { const op = take()!.v; const r = term(); l = { k: 'bin', op, l, r }; }
        depth--;
        return l;
    }
    function term(): Ast {
        let l = unary();
        while (isOp('*') || isOp('/')) { const op = take()!.v; const r = unary(); l = { k: 'bin', op, l, r }; }
        return l;
    }
    function unary(): Ast {
        if (isOp('+')) { take(); return unary(); }
        if (isOp('-')) { take(); return { k: 'neg', e: unary() }; }
        return power();
    }
    function power(): Ast {
        const a = atom();
        if (isOp('^')) { take(); return { k: 'bin', op: '^', l: a, r: unary() }; }
        return a;
    }
    function atom(): Ast {
        const t = take();
        if (!t) throw new Error('eof');
        if (t.t === 'num') { const v = Number(t.v); if (!Number.isFinite(v)) throw new Error('num'); return { k: 'num', v }; }
        if (t.t === 'id') {
            if (FUNCS[t.v] !== undefined) {
                const p = peek();
                if (!p || p.t !== 'lp') throw new Error('fn');
                take();
                const arg = expr();
                const q = take();
                if (!q || q.t !== 'rp') throw new Error('rp');
                return { k: 'fn', name: t.v, arg };
            }
            return { k: 'var', name: t.v };
        }
        if (t.t === 'lp') {
            const e = expr();
            const q = take();
            if (!q || q.t !== 'rp') throw new Error('rp');
            return e;
        }
        throw new Error('unexpected');
    }
    try {
        const a = expr();
        return pos === tokens.length ? a : null;
    } catch {
        return null;
    }
}

function collectVars(a: Ast, into: Set<string>): void {
    if (a.k === 'var') { if (CONSTS[a.name] === undefined) into.add(a.name); return; }
    if (a.k === 'fn') { collectVars(a.arg, into); return; }
    if (a.k === 'neg') { collectVars(a.e, into); return; }
    if (a.k === 'bin') { collectVars(a.l, into); collectVars(a.r, into); }
}

function evalAst(a: Ast, vars: Record<string, number>): number {
    switch (a.k) {
        case 'num': return a.v;
        case 'var': {
            const v = vars[a.name] !== undefined ? vars[a.name] : CONSTS[a.name];
            if (v === undefined) throw new Error('var ' + a.name);
            return v;
        }
        case 'fn': return FUNCS[a.name](evalAst(a.arg, vars));
        case 'neg': return -evalAst(a.e, vars);
        case 'bin': {
            const l = evalAst(a.l, vars), r = evalAst(a.r, vars);
            if (a.op === '+') return l + r;
            if (a.op === '-') return l - r;
            if (a.op === '*') return l * r;
            if (a.op === '/') return l / r;
            return Math.pow(l, r);
        }
    }
}

interface Compiled { ast: Ast; vars: string[] }

function compile(expr: string): Compiled | null {
    const toks = tokenize(expr);
    if (!toks) return null;
    const ast = parse(toks);
    if (!ast) return null;
    const vars = new Set<string>();
    collectVars(ast, vars);
    return { ast, vars: [...vars].sort() };
}

function evalSafe(ast: Ast, vars: Record<string, number>): number | null {
    try {
        const v = evalAst(ast, vars);
        return Number.isFinite(v) ? v : null;
    } catch {
        return null;
    }
}

/** A finite number, or null when the expression does not parse, names an unknown variable, or is not finite. */
function evaluate(expr: string, vars: Record<string, number> = {}): number | null {
    const c = compile(expr);
    return c ? evalSafe(c.ast, vars) : null;
}

// ── deterministic sampling ───────────────────────────────────────────────────
function hash32(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}

function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Two expressions compared: closed forms by value, forms with the SAME free
 * variables at up to 8 deterministic points in [0.5, 3]; a different set of
 * free variables (a substitution) is not comparable and yields nothing.
 */
function compareExprs(a: string, b: string, seedKey: string): 'equal' | 'differ' | 'unchecked' {
    const ca = compile(a), cb = compile(b);
    if (!ca || !cb) return 'unchecked';
    if (ca.vars.length === 0 && cb.vars.length === 0) {
        const x = evalSafe(ca.ast, {}), y = evalSafe(cb.ast, {});
        if (x === null || y === null) return 'unchecked';
        return sameNumber(x, y) ? 'equal' : 'differ';
    }
    if (ca.vars.join(',') !== cb.vars.join(',')) return 'unchecked';
    const rnd = mulberry32(hash32(seedKey));
    let valid = 0, bad = 0;
    for (let i = 0; i < SAMPLE_POINTS; i++) {
        const vars: Record<string, number> = {};
        for (const v of ca.vars) vars[v] = 0.5 + rnd() * 2.5;
        const x = evalSafe(ca.ast, vars), y = evalSafe(cb.ast, vars);
        if (x === null || y === null) continue;
        valid++;
        if (!sameNumber(x, y)) bad++;
    }
    if (valid < MIN_VALID_POINTS) return 'unchecked';
    return bad === 0 ? 'equal' : 'differ';
}

function isClosed(expr: string): boolean {
    const c = compile(expr);
    return !!c && c.vars.length === 0;
}

function fmt(n: number | null): string {
    if (n === null) return '?';
    return Number.isInteger(n) ? String(n) : String(Number(n.toPrecision(6)));
}

/** The sides of a line's calc, split on '='; null when it is not a plain chain of equalities. */
function sidesOf(calc: string): { cont: boolean; sides: string[] } | null {
    const s = String(calc ?? '').replace(/≈/g, '=').trim();
    if (!s || /[<>→⇒≤≥≠∝]|=>|->/.test(s)) return null;
    const cont = s.startsWith('=');
    const sides = s.split('=').map((x) => x.trim());
    if (cont) sides.shift();
    if (!sides.length || sides.some((x) => !x)) return null;
    return { cont, sides };
}

/** true when every side of the calc parses — the post-processor drops the rest. */
function calcOk(calc: string): boolean {
    const sp = sidesOf(calc);
    return !!sp && sp.sides.every((x) => compile(x) !== null);
}

function normLhs(s: string): string {
    return unicodePass(s).toLowerCase().replace(/\s+/g, '').replace(/\^\((-?\d+)\)/g, '^$1');
}

/** A typed value for one line: that line's calc becomes "<lhs> = value" (or "= value"), fully legible. */
function applyTyped(transcript: TLine[], typedAt: { n: number; value: string } | null | undefined): TLine[] {
    if (!typedAt || !Number.isInteger(typedAt.n)) return transcript;
    const num = numberOf(String(typedAt.value ?? ''));
    if (num === null) return transcript;
    return transcript.map((l) => {
        if (l.n !== typedAt.n) return l;
        const src = String(l.calc ?? l.text ?? '');
        const eq = src.indexOf('=');
        const lhs = eq > 0 ? src.slice(0, eq).trim() : '';
        const calc = lhs && !/\[\?\]/.test(lhs) && compile(lhs) ? lhs + ' = ' + String(num) : '= ' + String(num);
        return { ...l, calc, legible: 1 };
    });
}

/**
 * S2: the step facts. A fact is never a verdict.
 *   arith_mismatch   two adjacent closed sides of one line differ by more than 1%
 *   does_not_follow  ONLY in exactly comparable forms: a continuation ("= …") against
 *                    the last side of the line above; the same left side as the line
 *                    above, right sides compared; two adjacent symbolic sides of one
 *                    line with the same free variables. A rearrangement with a new
 *                    left side, or a substitution, never yields a negative fact.
 *   arith_ok / follows  the positive twins
 *   unchecked_low_legibility  a failing fact on a line read below 0.6 — not failing
 */
function stepFacts(transcript: TLine[], typedAt: { n: number; value: string } | null = null): Fact[] {
    const lines = applyTyped(transcript, typedAt);
    const facts: Fact[] = [];
    let prev: { line: TLine; sides: string[] } | null = null;
    for (const line of lines) {
        if (line.kind === 'diagram' || !line.calc || !line.calc.trim()) { prev = null; continue; }
        const sp = sidesOf(line.calc);
        if (!sp) { prev = null; continue; }
        let neg: Fact | null = null;
        let pos: Fact | null = null;
        let negCross = false;
        for (let i = 0; i + 1 < sp.sides.length; i++) {
            const a = sp.sides[i], b = sp.sides[i + 1];
            const r = compareExprs(a, b, a + '|' + b);
            if (r === 'unchecked') continue;
            const closed = isClosed(a) && isClosed(b);
            if (r === 'differ') {
                if (!neg) neg = closed
                    ? { line: line.n, fact: 'arith_mismatch', detail: a + ' = ' + fmt(evaluate(a)) + ' but the line says ' + b + ' = ' + fmt(evaluate(b)) }
                    : { line: line.n, fact: 'does_not_follow', detail: '"' + a + '" and "' + b + '" are not equal as expressions' };
            } else if (!pos) {
                pos = { line: line.n, fact: closed ? 'arith_ok' : 'follows', detail: a + ' = ' + b };
            }
        }
        if (prev) {
            let a: string | null = null, b: string | null = null, how = '';
            if (sp.cont) { a = prev.sides[prev.sides.length - 1]; b = sp.sides[0]; how = 'continues'; }
            else if (sp.sides.length >= 2 && prev.sides.length >= 2 && normLhs(sp.sides[0]) === normLhs(prev.sides[0])) { a = prev.sides[prev.sides.length - 1]; b = sp.sides[sp.sides.length - 1]; how = 'restates'; }
            if (a !== null && b !== null) {
                const r = compareExprs(a, b, String(prev.line.calc) + '|' + String(line.calc));
                if (r === 'differ' && !neg) {
                    neg = { line: line.n, fact: 'does_not_follow', detail: 'line ' + prev.line.n + ' ends "' + a + '" (' + fmt(evaluate(a)) + '); line ' + line.n + ' ' + how + ' with "' + b + '" (' + fmt(evaluate(b)) + ')' };
                    negCross = true;
                } else if (r === 'equal' && !pos) {
                    pos = { line: line.n, fact: 'follows', detail: 'from line ' + prev.line.n };
                }
            }
        }
        if (neg) {
            const low = line.legible < LOW_LEGIBLE || (negCross && prev !== null && prev.line.legible < LOW_LEGIBLE);
            facts.push(low
                ? { line: line.n, fact: 'unchecked_low_legibility', detail: neg.fact + ' suspected but the line is hard to read (legible ' + line.legible + '): ' + (neg.detail ?? '') }
                : neg);
        } else if (pos) {
            facts.push(pos);
        }
        prev = { line, sides: sp.sides };
    }
    return facts;
}

// ── the exam's conventions ───────────────────────────────────────────────────
function conventionsOf(question: string, options: string[]): string[] {
    const q = String(question ?? '');
    const opts = Array.isArray(options) ? options.map((o) => String(o ?? '')) : [];
    const tags: string[] = [];
    if (/\b(percentage|percent|relative|fractional|maximum|max\.?)\s+(possible\s+)?error\b|%\s*error\b|\berror\s+(in|of)\s+the\s+(measurement|determination)\b/i.test(q)) tags.push('pct_error');
    if (/\bg\s*=\s*(9\.8|9\.81|10)\b/.test(q) || /\b(take|taking|use|using|assume|assuming)\s+g\s*(as|to be)?\s*(9\.8|9\.81|10)\b/i.test(q)) tags.push('g_fixed');
    const ratioOpts = opts.filter((o) => /^\s*\d+(?:\.\d+)?\s*:\s*\d+(?:\.\d+)?\s*$/.test(o)).length;
    if ((opts.length >= 2 && ratioOpts >= Math.ceil(opts.length / 2)) || /\bratio\b/i.test(q)) tags.push('ratio_answer');
    return tags;
}

const UNIT_PREFIX: Record<string, number> = { k: 1e3, M: 1e6, G: 1e9, m: 1e-3, c: 1e-2, u: 1e-6, 'μ': 1e-6, 'µ': 1e-6, n: 1e-9, p: 1e-12 };
const BASE_UNITS = ['m', 's', 'g', 'A', 'V', 'Ω', 'ohm', 'J', 'W', 'N', 'Pa', 'Hz', 'F', 'H', 'T', 'C', 'eV', 'mol', 'L'];

/** What follows the leading number of a printed value: '250 cm' → 'cm', '3:4' → ''. */
function unitOf(text: string): string {
    const s = String(text ?? '').trim().replace(/[−–]/g, '-').replace(/,/g, '');
    const m = s.match(/^-?\d+(?:\.\d+)?(?:\s*[:/]\s*-?\d+(?:\.\d+)?)?(?:\s*[x×]\s*10\s*\^?\s*\(?-?\d+\)?)?(?:\s*\^\s*-?\d+)?[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*\s*(.*)$/);
    return m ? m[1].trim().replace(/[.\s]+$/, '') : '';
}

function unitFactor(unit: string): { base: string; factor: number } | null {
    const u = String(unit ?? '').replace(/\s+/g, '');
    if (!u) return null;
    if (BASE_UNITS.includes(u)) return { base: u, factor: 1 };
    const p = u[0], rest = u.slice(1);
    if (UNIT_PREFIX[p] !== undefined && BASE_UNITS.includes(rest)) return { base: rest, factor: UNIT_PREFIX[p] };
    return null;
}

function decimalsOf(text: string): number {
    const m = String(text ?? '').trim().replace(/[−–]/g, '-').match(/^-?\d+(?:\.(\d+))?/);
    return m && m[1] ? m[1].length : 0;
}

function sameValue(a: string, b: string): boolean {
    const x = numberOf(a), y = numberOf(b);
    if (x !== null && y !== null) return sameNumber(x, y);
    const p = normOpt(a), q = normOpt(b);
    return p.length > 0 && p === q;
}

/**
 * The final value against the key: option match, value match, unit prefixes,
 * the g = 9.8 twin of a g = 10 key (unless the question fixed g), rounding to
 * the printed decimals; on a percentage-error page any printed option matches
 * and the difference is a convention note for the judges, not a failing fact.
 */
function finalCheck(finalRead: string | null, typedFinal: string | null, ref: Ref, tags: string[], finalLine = 0): FinalCheck {
    const options = Array.isArray(ref.options) ? ref.options.map((o) => String(o ?? '')) : [];
    const keyOpt = Number.isInteger(ref.key_option) && Number(ref.key_option) >= 1 && Number(ref.key_option) <= options.length ? Number(ref.key_option) : null;
    const keyText = ref.key_value !== null && ref.key_value !== undefined && String(ref.key_value).trim() ? String(ref.key_value).trim() : (keyOpt ? options[keyOpt - 1] : null);
    const pct = tags.includes('pct_error');
    const fr = finalRead && String(finalRead).trim() ? String(finalRead).trim() : null;
    const tf = typedFinal && String(typedFinal).trim() ? String(typedFinal).trim() : null;
    const final = fr ?? tf;
    const out: FinalCheck = { final, finalMatch: false, option: null, fact: null, detail: null, note: pct ? PCT_NOTE : null };
    if (fr && tf && !sameValue(fr, tf)) {
        return { ...out, detail: 'final_conflict', fact: { line: finalLine, fact: 'final_conflict', detail: 'the page reads "' + fr + '" but the typed answer is "' + tf + '"' } };
    }
    if (!final) return { ...out, detail: 'no_final' };
    const v = numberOf(final);
    let option: number | null = null;
    if (options.length) {
        if (v !== null) {
            const hits = options.map((o, i) => ({ ov: numberOf(o), i: i + 1 })).filter((h) => h.ov !== null && sameNumber(h.ov, v));
            if (hits.length === 1) option = hits[0].i;
        }
        if (option === null) {
            const nf = normOpt(final);
            const hits = options.map((o, i) => ({ no: normOpt(o), i: i + 1 })).filter((h) => h.no.length >= 2 && h.no === nf);
            if (hits.length === 1) option = hits[0].i;
        }
    }
    out.option = option;
    const match = (detail: string): FinalCheck => ({ ...out, finalMatch: true, detail });
    if (keyOpt !== null && option === keyOpt) return match('option');
    const k = keyText !== null ? numberOf(keyText) : null;
    if (k !== null && v !== null) {
        const uf = unitFactor(unitOf(final)), kf = unitFactor(unitOf(keyText!));
        const scaled = !!uf && !!kf && uf.base === kf.base;
        const vv = scaled ? v * uf!.factor : v, kk = scaled ? k * kf!.factor : k;
        if (sameNumber(vv, kk)) return match(scaled && uf!.factor !== kf!.factor ? 'unit_prefix' : 'value');
        // rounding to the key's printed decimals is checked before the g twin so
        // the more specific explanation labels the match (both are matches)
        const dv = decimalsOf(final), dk = decimalsOf(keyText!);
        if ((!scaled || uf!.factor === kf!.factor) && dv >= 1 && dv < dk && Math.abs(Number(k.toFixed(dv)) - v) < 1e-9) return match('rounded');
        if (!tags.includes('g_fixed')) {
            for (const p of [-2, -1, -0.5, 0.5, 1, 2]) if (sameNumber(vv * Math.pow(0.98, p), kk)) return match('g_rescaled');
        }
    } else if (k === null && keyText !== null && v === null) {
        const nf = normOpt(final);
        if (nf.length > 0 && nf === normOpt(keyText)) return match('text');
    }
    if (pct && option !== null) {
        return { ...out, finalMatch: true, detail: 'convention', fact: { line: finalLine, fact: 'final_differs_convention', detail: '"' + final + '" is printed option ' + option + ', the reference key is ' + (keyOpt !== null ? 'option ' + keyOpt : '"' + keyText + '"') + ' — the exam sums relative errors' } };
    }
    return { ...out, detail: 'mismatch', fact: { line: finalLine, fact: 'final_mismatch', detail: '"' + final + '" against the key "' + (keyText ?? '?') + '"' } };
}

// ── judge validation ─────────────────────────────────────────────────────────
function normQuote(s: string): string {
    return String(s ?? '').toLowerCase().replace(/[−–]/g, '-').replace(/[^0-9a-z+\-=/^().:]/g, '');
}

/** The transcript line (within one of the named line) that carries the quote, or null. */
function quoteLine(quote: string | null, transcript: TLine[], n: number): number | null {
    const q = normQuote(quote ?? '');
    if (q.length < 3) return null;
    for (const d of [0, -1, 1]) {
        const line = transcript.find((l) => l.n === n + d);
        if (!line) continue;
        for (const cand of [line.text, line.tex]) {
            const ln = normQuote(cand ?? '');
            if (!ln) continue;
            if (q.length >= 12 ? (ln.includes(q) || (ln.length >= 6 && q.includes(ln))) : q === ln) return line.n;
        }
    }
    return null;
}

function parseJudgeJson(raw: unknown): Record<string, unknown> | null {
    if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
    let s = String(raw ?? '').trim();
    s = s.replace(/^```[a-zA-Z]*\s*/, '').replace(/```\s*$/, '');
    const a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a < 0 || b <= a) return null;
    try {
        const o = JSON.parse(s.slice(a, b + 1));
        return o && typeof o === 'object' && !Array.isArray(o) ? o as Record<string, unknown> : null;
    } catch {
        return null;
    }
}

/**
 * A judge's raw output → ok | discarded | hedged | failed. An ERROR must name a
 * transcript line and quote it (within one line); a hedge is confidence below
 * 0.5 or two lines named. `method` survives only on CORRECT.
 */
function validateJudge(raw: unknown, transcript: TLine[]): Validated {
    const o = parseJudgeJson(raw);
    if (!o) return { status: 'failed', judge: null, reason: 'no_json', quote_line: null };
    const verdictRaw = String(o.verdict ?? '').trim().toUpperCase();
    const verdict: Judge['verdict'] = verdictRaw === 'CORRECT' || verdictRaw === 'ERROR' ? verdictRaw : 'UNSURE';
    const str = (v: unknown, max: number): string | null => typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
    const lineRaw = o.first_error_line;
    const lineN = Number.isInteger(lineRaw) ? Number(lineRaw) : (typeof lineRaw === 'string' && /^\d{1,3}$/.test(lineRaw.trim()) ? Number(lineRaw.trim()) : null);
    const clsRaw = typeof o.error_class === 'string' ? o.error_class.trim().toLowerCase() : '';
    const cls = ERROR_CLASSES.has(clsRaw) ? clsRaw : null;
    const confRaw = Number(o.confidence);
    const confidence = Number.isFinite(confRaw) ? Math.max(0, Math.min(1, confRaw > 1 ? confRaw / 100 : confRaw)) : 0.5;
    const judge: Judge = {
        verdict,
        first_error_line: verdict === 'ERROR' ? lineN : null,
        error_class: verdict === 'ERROR' ? cls : null,
        what_should_be: str(o.what_should_be, 300),
        concept_tag: str(o.concept_tag, 80),
        evidence_quote: str(o.evidence_quote, 300),
        method: verdict === 'CORRECT' ? str(o.method, 300) : null,
        confidence: Number(confidence.toFixed(2)),
    };
    let quote_line: number | null = null;
    let reason: string | null = null;
    if (verdict === 'ERROR') {
        if (lineN === null || !transcript.some((l) => l.n === lineN)) return { status: 'discarded', judge, reason: 'line_out_of_range', quote_line: null };
        quote_line = quoteLine(judge.evidence_quote, transcript, lineN);
        if (quote_line === null) return { status: 'discarded', judge, reason: 'no_quote_match', quote_line: null };
        if (!judge.error_class) { judge.error_class = 'method'; reason = 'class_defaulted'; }
    }
    const hedgeText = [judge.what_should_be, judge.concept_tag, judge.method, typeof o.note === 'string' ? o.note : ''].filter(Boolean).join(' ');
    if (confidence < 0.5) return { status: 'hedged', judge, reason: 'low_confidence', quote_line };
    if (HEDGE_RE.test(hedgeText)) return { status: 'hedged', judge, reason: 'hedge_words', quote_line };
    return { status: 'ok', judge, reason, quote_line };
}

// ── the escalation predicate (escalate mode): the first matching reason ─────
function escalationReason(b: Validated | null, facts: Fact[], transcript: TLine[], meanLegible: number): string | null {
    if (meanLegible < 0.7) return 'low_legibility';
    if (transcript.some((l) => l.kind === 'diagram')) return 'diagram';
    if (!b || b.status === 'failed' || b.status === 'hedged' || !b.judge || b.judge.verdict === 'UNSURE') return 'judge_b_unsure';
    const j = b.judge;
    if (j.verdict === 'ERROR' && b.status === 'discarded') return 'judge_b_no_quote';
    const failing = facts.filter((f) => FAILING_FACTS.has(f.fact));
    if (j.verdict === 'ERROR' && j.first_error_line !== null && !failing.some((f) => Math.abs(f.line - j.first_error_line!) <= 1)) return 'judge_b_unsupported';
    if (j.verdict === 'CORRECT' && failing.length > 0) return 'judge_b_vs_machine';
    if (j.error_class === 'reading') return 'transcript_disputed';
    return null;
}

// ── S4: the arbiter. Code decides the verdict; a model never does. ──────────
function arbitrate(facts: Fact[], judges: Validated[], finalMatch: boolean, transcript: TLine[], meanLegible: number): Verdict {
    const failing = facts.filter((f) => FAILING_FACTS.has(f.fact));
    const valid = judges.filter((j) => j.status === 'ok' && j.judge !== null);
    const lineOf = (n: number | null): TLine | null => n === null ? null : (transcript.find((l) => l.n === n) ?? null);
    const lastEq = [...transcript].reverse().find((l) => l.kind === 'equation' || l.kind === 'final') ?? transcript[transcript.length - 1] ?? null;
    const base: Verdict = { verdict: 'UNSURE', first_error_line: null, error_class: null, what_should_be: null, concept_tag: null, evidence_line: null, ask: null, ask_line: null, method: null, reason: null };
    const unsure = (reason: string, askLine: number | null, note: string | null = null): Verdict => {
        const disputed = lineOf(askLine);
        const ask: Verdict['ask'] = (meanLegible < 0.7 || (disputed !== null && disputed.legible < 0.5)) ? 'retake' : 'type_value_at_line';
        return { ...base, verdict: 'UNSURE', ask, ask_line: askLine, reason, what_should_be: note };
    };
    const errorAt = (n: number, from: Validated, reason: string): Verdict => {
        const line = lineOf(n);
        if (!line) return unsure('line_missing', lastEq ? lastEq.n : null);
        const j = from.judge!;
        return { ...base, verdict: 'ERROR', first_error_line: n, error_class: j.error_class ?? 'method', what_should_be: j.what_should_be, concept_tag: j.concept_tag, evidence_line: { n: line.n, text: line.text, tex: line.tex }, reason };
    };

    const reading = valid.find((j) => j.judge!.verdict === 'ERROR' && j.judge!.error_class === 'reading');
    if (reading) {
        const v = unsure('transcript_disputed', reading.judge!.first_error_line, reading.judge!.what_should_be);
        return { ...v, ask: 'retake' };
    }
    const correct = valid.find((j) => j.judge!.verdict === 'CORRECT');
    if (finalMatch && failing.length === 0 && correct) {
        return { ...base, verdict: 'CORRECT', method: correct.judge!.method, concept_tag: correct.judge!.concept_tag, reason: 'agreed' };
    }
    const errs = valid.filter((j) => j.judge!.verdict === 'ERROR' && j.judge!.first_error_line !== null);
    if (errs.length === 2) {
        const [x, y] = errs;
        const lx = x.judge!.first_error_line!, ly = y.judge!.first_error_line!;
        if (Math.abs(lx - ly) <= 1 && x.judge!.error_class === y.judge!.error_class) {
            const n = Math.min(lx, ly);
            const namers = errs.filter((j) => j.judge!.first_error_line === n).sort((p, q) => q.judge!.confidence - p.judge!.confidence);
            return errorAt(n, namers[0] ?? x, 'judges_agree');
        }
    }
    for (const j of errs) {
        const n = j.judge!.first_error_line!;
        if (failing.some((f) => Math.abs(f.line - n) <= 1)) return errorAt(n, j, 'judge_and_fact');
    }
    const askLine = errs.length ? errs[0].judge!.first_error_line : (failing.length ? failing[0].line : (lastEq ? lastEq.n : null));
    const reason = errs.length ? 'judge_unsupported' : failing.length ? 'fact_without_judge' : correct ? (finalMatch ? 'no_agreement' : 'final_mismatch') : 'no_verdict';
    return unsure(reason, askLine);
}
// ---- END PURE ----

// ── G. the models ────────────────────────────────────────────────────────────
async function gemini(model: string, parts: unknown[], generationConfig: Record<string, unknown>): Promise<ModelOut> {
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
        return { text, tokens, ms: Date.now() - t0, cap_hit: cand?.finishReason === 'MAX_TOKENS', error: null, usd: Number(usd.toFixed(8)), finish: String(cand?.finishReason ?? ''), status: 200 };
    } catch (e) {
        return { text: '', tokens: { prompt: 0, output: 0, thoughts: 0 }, ms: Date.now() - t0, cap_hit: false, error: (e instanceof Error ? e.message : String(e)).slice(0, 200), usd: 0, finish: 'error', status: 0 };
    } finally {
        clearTimeout(timer);
    }
}

interface ChatOpts {
    maxTokens: number;
    effort: string | null;          // DeepSeek: thinking on at this effort; null = thinking off
    deepseekFields: boolean;        // send DeepSeek's thinking fields (never to a plain OpenAI-compatible endpoint)
    jsonMode: boolean;              // response_format json_object; retried once without on a 400 that names it
    rate: { input: number; output: number } | null;   // null = DeepSeek's tiered rate
}

/** An OpenAI-compatible chat call (DeepSeek = this against api.deepseek.com). Images ride as image_url data URLs. */
async function openaiChat(base: string, key: string, model: string, content: string | unknown[], opts: ChatOpts): Promise<ModelOut> {
    const t0 = Date.now();
    const tier = DEEPSEEK_RATE[deepseekTier()];
    const fail = (error: string, status: number): ModelOut => ({ text: '', tokens: { prompt: 0, output: 0, thoughts: 0 }, ms: Date.now() - t0, cap_hit: false, error: error.slice(0, 200), usd: 0, finish: 'error', status });
    const once = async (jsonMode: boolean): Promise<{ retry: boolean; out: ModelOut }> => {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), MODEL_TIMEOUT_MS);
        try {
            const body: Record<string, unknown> = { model, max_tokens: opts.maxTokens, messages: [{ role: 'user', content }] };
            if (opts.deepseekFields) {
                if (opts.effort) { body.thinking = { type: 'enabled' }; body.reasoning_effort = opts.effort; }
                else body.thinking = { type: 'disabled' };
            }
            if (jsonMode) body.response_format = { type: 'json_object' };
            const res = await fetch(base.replace(/\/+$/, '') + '/chat/completions', {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, signal: ctl.signal,
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const txt = (await res.text()).slice(0, 300);
                const retry = jsonMode && res.status === 400 && /response_format|json_object|json mode/i.test(txt);
                return { retry, out: fail('HTTP ' + res.status + ': ' + txt, res.status) };
            }
            const json = await res.json();
            const u = json.usage ?? {};
            const hit = u.prompt_cache_hit_tokens ?? 0;
            const miss = u.prompt_cache_miss_tokens ?? Math.max(0, (u.prompt_tokens ?? 0) - hit);
            const out = u.completion_tokens ?? 0;
            const tokens = { prompt: hit + miss, output: out, thoughts: u.completion_tokens_details?.reasoning_tokens ?? 0 };
            const choice = json.choices?.[0] ?? {};
            const text = String(choice.message?.content ?? '');
            const usd = opts.rate
                ? ((hit + miss) * opts.rate.input + out * opts.rate.output) / 1_000_000
                : (hit * tier.hit + miss * tier.miss + out * tier.out) / 1_000_000;
            return { retry: false, out: { text, tokens, ms: Date.now() - t0, cap_hit: choice.finish_reason === 'length' || !text.trim(), error: null, usd: Number(usd.toFixed(8)), finish: String(choice.finish_reason ?? ''), status: res.status } };
        } catch (e) {
            return { retry: false, out: fail(e instanceof Error ? e.message : String(e), 0) };
        } finally {
            clearTimeout(timer);
        }
    };
    let r = await once(opts.jsonMode);
    if (r.retry) r = await once(false);
    return r.out;
}

function callSummary(c: Call) {
    return { stage: c.stage, model: c.model, effort: c.effort, ms: c.ms, tokens: c.tokens, cost_usd: c.cost_usd, cap_hit: c.cap_hit, error: c.error };
}

function providerOf(model: string): string {
    return model.includes('gemini') ? 'google' : model.includes('deepseek') ? 'deepseek' : 'openai';
}

// ── H. S1: the pluggable reader ──────────────────────────────────────────────
interface ReaderCfg { reader: 'gemini' | 'openai' | 'deepseek'; model: string }
interface ReadRaw { readable?: boolean; lines?: { n?: number; tex?: string; text?: string; calc?: string | null; kind?: string; legible?: number }[]; final_value_read?: string | null; note?: string | null }
interface ReadOut { lines: TLine[]; meanLegible: number; finalRead: string | null; note: string | null }
type ReadResult = { ok: true; read: ReadOut } | { ok: false; reason: 'unreadable' | 'down'; note: string };

const MAX_LINES = 60;
const MAX_LINE_CHARS = 400;
const KINDS = new Set(['equation', 'statement', 'diagram', 'final']);

function postProcess(raw: ReadRaw): { readable: boolean; read: ReadOut } {
    const lines: TLine[] = [];
    for (const l of (Array.isArray(raw.lines) ? raw.lines : []).slice(0, MAX_LINES)) {
        if (!l || typeof l !== 'object') continue;
        const text = String(l.text ?? l.tex ?? '').trim().slice(0, MAX_LINE_CHARS);
        if (!text) continue;
        const tex = (String(l.tex ?? '').trim() || text).slice(0, MAX_LINE_CHARS);
        const calcRaw = typeof l.calc === 'string' ? l.calc.trim().slice(0, MAX_LINE_CHARS) : '';
        const calc = calcRaw && calcOk(calcRaw) ? calcRaw : null;
        const kind = typeof l.kind === 'string' && KINDS.has(l.kind) ? l.kind : 'equation';
        const legRaw = Number(l.legible);
        const legible = Number.isFinite(legRaw) ? Number(Math.max(0, Math.min(1, legRaw)).toFixed(2)) : 0.5;
        lines.push({ n: lines.length + 1, text, tex, calc, kind, legible });
    }
    const scored = lines.filter((l) => l.kind !== 'diagram');
    const meanLegible = scored.length ? Number((scored.reduce((a, l) => a + l.legible, 0) / scored.length).toFixed(3)) : 0;
    const finalRead = typeof raw.final_value_read === 'string' && raw.final_value_read.trim() ? raw.final_value_read.trim().slice(0, 80) : null;
    const note = typeof raw.note === 'string' && raw.note.trim() ? raw.note.trim().slice(0, 200) : null;
    return { readable: raw.readable !== false, read: { lines, meanLegible, finalRead, note } };
}

async function readPage(cfg: ReaderCfg, img: { mime: string; data: string }, prompt: string, calls: Call[]): Promise<ReadResult> {
    const call = async (maxTokens: number): Promise<ModelOut> => {
        if (cfg.reader === 'gemini') {
            return await gemini(cfg.model, [{ text: prompt }, { inline_data: { mime_type: img.mime, data: img.data } }],
                { temperature: 0, maxOutputTokens: maxTokens, responseMimeType: 'application/json', responseSchema: READ_SCHEMA });
        }
        const content = [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:${img.mime};base64,${img.data}` } }];
        if (cfg.reader === 'deepseek') {
            return await openaiChat('https://api.deepseek.com', DEEPSEEK_KEY, cfg.model, content, { maxTokens, effort: null, deepseekFields: true, jsonMode: true, rate: null });
        }
        return await openaiChat(READER_BASE, READER_KEY, cfg.model, content, { maxTokens, effort: null, deepseekFields: false, jsonMode: true, rate: READER_RATE });
    };
    let lastNote = '';
    for (const maxTokens of [READER_MAX_TOKENS, READER_MAX_TOKENS * 2]) {
        const r = await call(maxTokens);
        calls.push({ stage: 'read', model: cfg.model, effort: null, ms: r.ms, tokens: r.tokens, cost_usd: r.usd, cap_hit: r.cap_hit, error: r.error });
        if (r.error) { lastNote = r.error; if (r.status >= 400 && r.status < 500 && r.status !== 429) break; continue; }
        let raw: ReadRaw | null = null;
        try { raw = parseJudgeJson(r.text) as ReadRaw | null; } catch { raw = null; }
        if (!raw) { lastNote = r.cap_hit ? 'cap_hit' : 'no_json'; continue; }
        const { readable, read } = postProcess(raw);
        if (!readable || !read.lines.length || read.meanLegible < 0.35) {
            return { ok: false, reason: 'unreadable', note: !readable ? 'reader_unreadable' : !read.lines.length ? 'no_lines' : 'legible_' + read.meanLegible };
        }
        return { ok: true, read };
    }
    return { ok: false, reason: 'down', note: lastNote || 'reader_failed' };
}

// ── I. the judges ────────────────────────────────────────────────────────────
interface Reference { kind: 'fingerprint' | 'question_id' | 'inline'; key: string; question_text: string; options: string[]; key_option: number | null; key_value: string | null; steps: { text: string; tex: string | null }[] }
interface JudgeRun extends Validated { name: 'A' | 'B'; model: string; ms: number; cost_usd: number }

function fill(template: string, values: Record<string, string>): string {
    let out = template;
    for (const [k, v] of Object.entries(values)) out = out.split('{{' + k + '}}').join(v);
    return out;
}

function optionsBlockOf(options: string[]): string {
    return options.length ? options.map((o, i) => `(${i + 1}) ${o}`).join('\n') : '(no options; a value with its unit is expected)';
}

function judgePromptFor(ref: Reference, transcript: TLine[], facts: Fact[], tags: string[], convNote: string | null, typedFinal: string | null, forA: boolean): string {
    const key = ref.key_option !== null && ref.options[ref.key_option - 1] !== undefined
        ? `Key: option ${ref.key_option} — ${ref.options[ref.key_option - 1]}` + (ref.key_value ? ` (${ref.key_value})` : '')
        : ref.key_value ? `Key value: ${ref.key_value}` : 'Key: (not stated)';
    const steps = ref.steps.length ? ref.steps.map((s, i) => `${i + 1}. ${s.text}`).join('\n') : '(no worked steps; the key only)';
    const conv: string[] = [];
    if (tags.includes('pct_error')) conv.push('- pct_error: ' + (convNote ?? PCT_NOTE));
    if (tags.includes('g_fixed')) conv.push('- g_fixed: the question fixes the value of g; a different g is a reading error on that line.');
    else conv.push('- g: a student may take g = 9.8 or g = 10 m/s^2; both are accepted and the final value scales accordingly.');
    if (tags.includes('ratio_answer')) conv.push('- ratio_answer: the answer is a ratio; 3:4, 3/4 and 0.75 are the same answer.');
    return fill(JUDGE_PROMPT, {
        question_block: ref.question_text + '\n' + optionsBlockOf(ref.options),
        reference_block: key + '\n' + steps,
        typed_final: typedFinal ?? '(none typed)',
        transcript_block: transcript.map((l) => `${l.n}. [${l.kind}, legible ${l.legible}] ${l.text}` + (l.calc && l.calc !== l.text ? `   (calc: ${l.calc})` : '')).join('\n'),
        facts_block: facts.length ? facts.map((f) => `line ${f.line}: ${f.fact}` + (f.detail ? ' — ' + f.detail : '')).join('\n') : '(none)',
        conventions_block: conv.join('\n'),
        page_block: forA ? PAGE_BLOCK_A : '',
    });
}

async function judgeB(prompt: string, transcript: TLine[], calls: Call[]): Promise<JudgeRun> {
    const r = await openaiChat('https://api.deepseek.com', DEEPSEEK_KEY, JUDGE_B_MODEL, prompt, { maxTokens: THINK_CAP + 1500, effort: JUDGE_B_EFFORT, deepseekFields: true, jsonMode: true, rate: null });
    calls.push({ stage: 'judge_b', model: JUDGE_B_MODEL, effort: JUDGE_B_EFFORT, ms: r.ms, tokens: r.tokens, cost_usd: r.usd, cap_hit: r.cap_hit, error: r.error });
    const v: Validated = r.error || !r.text.trim()
        ? { status: 'failed', judge: null, reason: r.error ? 'error: ' + r.error : 'empty', quote_line: null }
        : validateJudge(r.text, transcript);
    return { ...v, name: 'B', model: JUDGE_B_MODEL, ms: r.ms, cost_usd: r.usd };
}

async function judgeA(prompt: string, img: { mime: string; data: string }, transcript: TLine[], calls: Call[]): Promise<JudgeRun> {
    let ms = 0, usd = 0;
    let v: Validated = { status: 'failed', judge: null, reason: 'not_run', quote_line: null };
    for (const maxTokens of [JUDGE_A_MAX_TOKENS, JUDGE_A_MAX_TOKENS * 2]) {
        const r = await gemini(JUDGE_A_MODEL, [{ text: prompt }, { inline_data: { mime_type: img.mime, data: img.data } }],
            { temperature: 0, maxOutputTokens: maxTokens, responseMimeType: 'application/json', responseSchema: JUDGE_SCHEMA });
        calls.push({ stage: 'judge_a', model: JUDGE_A_MODEL, effort: null, ms: r.ms, tokens: r.tokens, cost_usd: r.usd, cap_hit: r.cap_hit, error: r.error });
        ms += r.ms; usd += r.usd;
        if (r.error) { v = { status: 'failed', judge: null, reason: 'error: ' + r.error, quote_line: null }; break; }
        v = r.text.trim() ? validateJudge(r.text, transcript) : { status: 'failed', judge: null, reason: r.cap_hit ? 'cap_hit' : 'empty', quote_line: null };
        if (v.status !== 'failed' || !r.cap_hit) break;
    }
    return { ...v, name: 'A', model: JUDGE_A_MODEL, ms, cost_usd: Number(usd.toFixed(8)) };
}

function judgeSummary(j: JudgeRun | null) {
    if (!j) return null;
    return { name: j.name, status: j.status, reason: j.reason, quote_line: j.quote_line, judge: j.judge, model: j.model, ms: j.ms, cost_usd: j.cost_usd };
}

// ── J. the reference (never solved here) ─────────────────────────────────────
interface CacheRow {
    fingerprint: string; question_text: string; options: string[]; option: number | null; answer: string | null;
    working: { step?: number; text?: string; tex?: string }[]; label: string; disputed: boolean;
}

async function cacheGet(fp: string): Promise<CacheRow | null | undefined> {
    try {
        const res = await rest(`ep_solve_cache?select=fingerprint,question_text,options,option,answer,working,label,disputed&fingerprint=eq.${fp}`);
        if (!res.ok) return undefined;
        const rows = await res.json() as CacheRow[];
        return rows[0] ?? null;
    } catch { return undefined; }
}

interface SolutionRow {
    qid: string;
    chapter_key: string;
    question: { question_en?: string; options_en?: string[]; answer?: number };
    solution: { steps?: { text?: string; equation?: string }[]; final_answer?: { option?: number; value?: string } };
    verified: boolean;
}

async function solutionOf(qid: string): Promise<SolutionRow | null | undefined> {
    try {
        const res = await rest(`ep_solutions?select=qid,chapter_key,question,solution,verified&qid=eq.${qid}&verified=is.true`);
        if (!res.ok) return undefined;
        const rows = await res.json() as SolutionRow[];
        return rows[0] ?? null;
    } catch { return undefined; }
}

const REF_TEXT_MAX = 4000, REF_OPTIONS_MAX = 6, REF_OPTION_CHARS = 300, REF_STEPS_MAX = 40, REF_STEP_CHARS = 400;

/** The harness's inline reference, bounded; null when it is not the documented shape. */
function inlineReference(raw: unknown): Omit<Reference, 'kind' | 'key'> | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    const question_text = typeof r.question_text === 'string' ? r.question_text.trim().slice(0, REF_TEXT_MAX) : '';
    if (!question_text) return null;
    const options = (Array.isArray(r.options) ? r.options : []).map((o) => String(o ?? '').trim().slice(0, REF_OPTION_CHARS)).filter(Boolean).slice(0, REF_OPTIONS_MAX);
    const key_option = Number.isInteger(r.key_option) && Number(r.key_option) >= 1 && Number(r.key_option) <= options.length ? Number(r.key_option) : null;
    const key_value = typeof r.key_value === 'string' && r.key_value.trim() ? r.key_value.trim().slice(0, 120) : (typeof r.key_value === 'number' ? String(r.key_value) : null);
    const steps = (Array.isArray(r.steps) ? r.steps : []).slice(0, REF_STEPS_MAX).map((s) => {
        if (typeof s === 'string') return { text: s.trim().slice(0, REF_STEP_CHARS), tex: null };
        const o = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
        const text = String(o.text ?? '').trim().slice(0, REF_STEP_CHARS);
        const tex = typeof o.tex === 'string' && o.tex.trim() ? o.tex.trim().slice(0, REF_STEP_CHARS) : null;
        return { text: text || (tex ?? ''), tex };
    }).filter((s) => s.text);
    if (key_option === null && key_value === null) return null;
    return { question_text, options, key_option, key_value, steps };
}

// ── K. persistence ───────────────────────────────────────────────────────────
/** The next attempt number for this device on this reference, and the previous row to mark. */
async function attemptOf(deviceId: string, refKey: string, clarification: boolean): Promise<{ attempt: number; prevId: number | null }> {
    try {
        const res = await rest(`ep_reviews?select=id,attempt_no&device_id=eq.${deviceId}&ref_key=eq.${encodeURIComponent(refKey)}&order=created_at.desc&limit=1`);
        if (!res.ok) return { attempt: 1, prevId: null };
        const rows = await res.json() as { id: number; attempt_no: number }[];
        const prev = rows[0];
        if (!prev) return { attempt: 1, prevId: null };
        const last = Number.isInteger(prev.attempt_no) ? prev.attempt_no : 1;
        return { attempt: clarification ? last : last + 1, prevId: prev.id };
    } catch {
        return { attempt: 1, prevId: null };
    }
}

async function patchReview(id: number, patch: Record<string, unknown>): Promise<void> {
    try {
        await rest(`ep_reviews?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) });
    } catch (e) {
        console.error('[ep-review] review patch failed', e);
    }
}

async function insertReview(row: Record<string, unknown>): Promise<number | null> {
    try {
        const res = await rest('ep_reviews?select=id', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify([row]) });
        if (!res.ok) throw new Error('reviews ' + res.status + ': ' + (await res.text()).slice(0, 200));
        const rows = await res.json() as { id?: number }[];
        return Number.isInteger(rows[0]?.id) ? Number(rows[0]!.id) : null;
    } catch (e) {
        console.error('[ep-review] review insert failed', e);
        return null;
    }
}

// ── L. the function ──────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { error: 'method not allowed' });

    // Guard 1 — origin allowlist.
    if (!ALLOWED_ORIGINS.includes(origin)) return reply(origin, 403, { error: 'origin not allowed' });
    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[ep-review] no service key — refusing (fail closed)');
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

    // ── "this review is wrong": the dispute queue (before the lock, like ep-solve's report)
    if (body.action === 'dispute') {
        const idRaw = body.review_id;
        const reviewId = Number.isInteger(idRaw) && Number(idRaw) > 0 ? Number(idRaw) : (typeof idRaw === 'string' && /^\d{1,12}$/.test(idRaw) ? Number(idRaw) : 0);
        if (!reviewId) return reply(origin, 400, { error: 'bad review id' });
        const note = typeof body.note === 'string' ? body.note.slice(0, 300) : null;
        try {
            const res = await rest(`ep_reviews?id=eq.${reviewId}&device_id=eq.${deviceId}&select=id`, {
                method: 'PATCH', headers: { Prefer: 'return=representation' },
                body: JSON.stringify({ disputed: true, dispute_note: note, disputed_at: new Date().toISOString(), student_next: 'disputed' }),
            });
            if (!res.ok) throw new Error('reviews ' + res.status);
            const rows = await res.json();
            if (!Array.isArray(rows) || !rows.length) return reply(origin, 200, { ok: false, reason: 'unknown' });
        } catch (e) {
            console.error('[ep-review] dispute write failed', e);
            return reply(origin, 200, { ok: false, reason: 'down' });
        }
        await writeEvent(deviceId, session, claimsTeam, 'review_dispute', { review_id: reviewId, has_note: !!note });
        return reply(origin, 200, { ok: true });
    }

    if (body.action !== 'review') return reply(origin, 400, { error: 'bad action' });
    const mediaType = typeof body.media_type === 'string' && MEDIA_TYPES.has(body.media_type) ? body.media_type : '';
    if (!mediaType) return reply(origin, 400, { error: 'bad media type' });
    const image = typeof body.image === 'string' ? body.image.replace(/^data:[^,]*,/, '').replace(/\s/g, '') : '';
    if (!image || !/^[A-Za-z0-9+/=]+$/.test(image)) return reply(origin, 400, { error: 'bad image' });
    const imageBytes = Math.floor(image.length * 3 / 4);
    if (imageBytes > MAX_BYTES) return reply(origin, 413, { ok: false, reason: 'too_large' });
    if (imageBytes < 256) return reply(origin, 400, { error: 'bad image' });

    // THE LOCK. Before the key check and before the ledger: a locked device
    // never costs a model call.
    const token = typeof body.access_token === 'string' ? body.access_token : '';
    const open = OPEN_ORIGINS.includes(origin);
    const ent = open ? true : await entitled(deviceId, token);
    if (ent === null) {
        console.error('[ep-review] entitlement read failed — refusing (fail closed)');
        return reply(origin, 200, { locked: true });
    }
    if (!ent) return reply(origin, 200, { locked: true });

    if (!DEEPSEEK_KEY || !GOOGLE_KEY) return reply(origin, 200, { ok: false, reason: 'quiet' });

    const isProbe = PROBE_TOKEN.length >= 16 && body.probe_token === PROBE_TOKEN;
    const isLocal = LOCAL_ORIGINS.has(origin);
    const internalP = (isProbe || isLocal || claimsTeam) ? Promise.resolve(false) : deviceIsInternal(deviceId);

    // Ablation overrides — honoured ONLY under the probe token (the harness).
    const ov = (isProbe && body.probe_overrides && typeof body.probe_overrides === 'object' ? body.probe_overrides : {}) as Record<string, unknown>;
    const reader: ReaderCfg['reader'] = ov.reader === 'gemini' || ov.reader === 'openai' || ov.reader === 'deepseek' ? ov.reader : READER;
    const readerModel = reader === READER && READER_MODEL_ENV ? READER_MODEL_ENV : (reader === 'gemini' ? 'gemini-3.7-flash' : reader === 'deepseek' ? JUDGE_B_MODEL : READER_MODEL_ENV);
    const judgeAMode: 'escalate' | 'always' | 'never' = ov.judge_a === 'escalate' || ov.judge_a === 'always' || ov.judge_a === 'never' ? ov.judge_a : JUDGE_A_MODE;
    const judgeBMode: 'always' | 'never' = ov.judge_b === 'never' ? 'never' : 'always';
    const s2On = ov.s2 !== false;
    if (reader === 'openai' && (!READER_BASE || !READER_KEY || !readerModel)) return reply(origin, 200, { ok: false, reason: 'quiet' });

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
        req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await sha256Hex(IP_SALT + '|' + rawIp);

    // Guards 3–5 from one ledger read. EVERY actor counts. A row that consumed
    // no read (unreadable photo, reader down) still counts for the IP guard and
    // the spend, never against the device's day.
    const ledger = await readTodayLedger();
    if (ledger === null) {
        console.error('[ep-review] ledger unreadable — refusing (fail closed)');
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
        console.warn('[ep-review] daily spend cap hit: $' + spentToday.toFixed(4));
        return reply(origin, 200, { ok: false, reason: 'quiet' });
    }
    if (!open && deviceDay >= PER_DAY) return reply(origin, 200, { ok: false, reason: 'cap', reads_left: 0 });
    if (!open && ipMinute >= IP_PER_MIN) return reply(origin, 200, { ok: false, reason: 'busy', reads_left: left(0) });

    // The student's typed final and a typed value for one unreadable line.
    const typedFinal = typeof body.typed_final === 'string' && body.typed_final.trim() ? body.typed_final.trim().slice(0, 80) : null;
    const tv = body.typed_value_at_line;
    const typedAt: { n: number; value: string } | null = tv && typeof tv === 'object' && Number.isInteger(tv.n) && Number(tv.n) >= 1 && typeof tv.value === 'string' && tv.value.trim()
        ? { n: Number(tv.n), value: tv.value.trim().slice(0, 80) } : null;

    // ── the reference: exactly one of fingerprint | question_id | reference ──
    const fp = typeof body.fingerprint === 'string' && HEX64_RE.test(body.fingerprint) ? body.fingerprint : '';
    const qid = typeof body.question_id === 'string' && QID_RE.test(body.question_id) ? body.question_id : '';
    const hasInline = body.reference !== undefined && body.reference !== null;
    const named = (fp ? 1 : 0) + (qid ? 1 : 0) + (hasInline ? 1 : 0);
    if (named !== 1) return reply(origin, 400, { error: 'exactly one of fingerprint, question_id, reference' });
    let ref: Reference;
    if (fp) {
        const row = await cacheGet(fp);
        if (row === undefined) return reply(origin, 200, { ok: false, reason: 'down', reads_left: left(0) });
        if (!row || row.disputed || row.label === 'unsure') return reply(origin, 200, { ok: false, reason: 'no_reference', reads_left: left(0) });
        if (row.label === 'once') return reply(origin, 200, { ok: false, reason: 'confirm_first', reads_left: left(0) });
        const options = (Array.isArray(row.options) ? row.options : []).map((o) => String(o ?? '')).slice(0, REF_OPTIONS_MAX);
        const steps = (Array.isArray(row.working) ? row.working : []).slice(0, REF_STEPS_MAX)
            .map((s) => ({ text: String(s.text ?? '').slice(0, REF_STEP_CHARS), tex: typeof s.tex === 'string' && s.tex ? s.tex.slice(0, REF_STEP_CHARS) : null })).filter((s) => s.text);
        ref = { kind: 'fingerprint', key: fp, question_text: String(row.question_text ?? '').slice(0, REF_TEXT_MAX), options, key_option: Number.isInteger(row.option) ? row.option : null, key_value: row.answer ?? null, steps };
    } else if (qid) {
        const row = await solutionOf(qid);
        if (row === undefined) return reply(origin, 200, { ok: false, reason: 'down', reads_left: left(0) });
        if (!row) return reply(origin, 200, { ok: false, reason: 'no_reference', reads_left: left(0) });
        const q = row.question ?? {};
        const options = (Array.isArray(q.options_en) ? q.options_en : []).map((o) => String(o ?? '')).slice(0, REF_OPTIONS_MAX);
        const steps = (Array.isArray(row.solution?.steps) ? row.solution.steps! : []).slice(0, REF_STEPS_MAX)
            .map((s) => ({ text: (String(s.text ?? '').trim() + (s.equation ? '   ' + s.equation : '')).slice(0, REF_STEP_CHARS), tex: null })).filter((s) => s.text);
        const keyOption = Number.isInteger(q.answer) && Number(q.answer) >= 1 && Number(q.answer) <= options.length ? Number(q.answer) : null;
        const keyValue = typeof row.solution?.final_answer?.value === 'string' && row.solution.final_answer.value.trim() ? row.solution.final_answer.value.trim().slice(0, 120) : null;
        if (!steps.length || (keyOption === null && keyValue === null)) return reply(origin, 200, { ok: false, reason: 'no_reference', reads_left: left(0) });
        ref = { kind: 'question_id', key: qid, question_text: String(q.question_en ?? '').trim().slice(0, REF_TEXT_MAX), options, key_option: keyOption, key_value: keyValue, steps };
    } else {
        if (!isProbe) return reply(origin, 400, { error: 'reference needs probe token' });
        const inline = inlineReference(body.reference);
        if (!inline) return reply(origin, 400, { error: 'bad reference' });
        const key = 'inline:' + (await sha256Hex(inline.question_text + '|' + inline.options.join('|') + '|' + String(inline.key_option) + '|' + String(inline.key_value))).slice(0, 16);
        ref = { kind: 'inline', key, ...inline };
    }
    const refKey = ref.key;
    const refKind = ref.kind;

    const t0 = Date.now();
    const calls: Call[] = [];
    const when = new Date();
    const deviceInternalP = internalP;
    const baseMeta = { ref_kind: refKind, ref_key: refKey, reader, reader_model: readerModel, judge_a_mode: judgeAMode, judge_b_mode: judgeBMode, s2: s2On, typed_final: !!typedFinal, typed_value_at_line: typedAt ? typedAt.n : null, open_door: open };

    async function ledgerRow(consumed: boolean, extra: Record<string, unknown>) {
        const deviceInternal = await deviceInternalP;
        const actor = isProbe ? 'eapcet_probe' : isLocal ? 'eapcet_local' : (deviceInternal || claimsTeam) ? 'eapcet_team' : 'eapcet_student';
        const actorReason = isProbe ? 'probe_token' : isLocal ? 'origin_localhost' : deviceInternal ? 'device_flag' : claimsTeam ? 'client_claim' : 'none';
        const usd = Number(calls.reduce((a, c) => a + c.cost_usd, 0).toFixed(8));
        const models = [...new Set(calls.map((c) => c.model))].join('+') || 'none';
        const providers = [...new Set(calls.map((c) => providerOf(c.model)))].join('+') || 'none';
        await writeUsage({
            session_id: session,
            task_type: TASK_TYPE,
            provider: providers,
            model: models,
            input_chars: imageBytes,
            output_chars: 0,
            latency_ms: Date.now() - t0,
            estimated_cost_usd: usd,
            fingerprint_key: refKey + '|eapcet_finder|review',
            was_cache_hit: false,
            question_date: when.toISOString().split('T')[0],
            actor,
            metadata: {
                surface: 'eapcet_finder',
                actor_reason: actorReason,
                device_internal: deviceInternal,
                device_id: deviceId,
                ip_hash: ipHash,
                consumed,
                image_bytes: imageBytes,
                media_type: mediaType,
                calls: calls.map(callSummary),
                cost_inr_estimate: Number((usd * USD_TO_INR).toFixed(6)),
                usd_to_inr_rate: USD_TO_INR,
                deepseek_tier: deepseekTier(),
                spent_today_usd_before: Number(spentToday.toFixed(6)),
                ...baseMeta,
                ...extra,
            },
        });
        return deviceInternal;
    }

    // ── S1 read: the page as written ─────────────────────────────────────────
    const img = { mime: mediaType, data: image };
    const readerPrompt = fill(READ_PROMPT, { question_text: ref.question_text, options_block: optionsBlockOf(ref.options) });
    const rd = await readPage({ reader, model: readerModel }, img, readerPrompt, calls);
    if (!rd.ok) {
        console.error('[ep-review] read ' + rd.reason + ': ' + rd.note);
        const internal = await ledgerRow(false, { outcome: rd.reason, reader_note: rd.note });
        await writeEvent(deviceId, session, internal || claimsTeam || isLocal, 'review', { outcome: rd.reason, ms: Date.now() - t0, bytes: imageBytes, ref_kind: refKind });
        return reply(origin, 200, { ok: false, reason: rd.reason, reads_left: left(0) });
    }
    const transcript = rd.read.lines;
    const meanLegible = rd.read.meanLegible;
    const lastLine = [...transcript].reverse().find((l) => l.kind === 'equation' || l.kind === 'final') ?? transcript[transcript.length - 1];
    const finalLine = lastLine ? lastLine.n : 0;
    let finalRead = rd.read.finalRead;
    if (typedAt) {
        const at = transcript.find((l) => l.n === typedAt.n);
        if (at && (at.kind === 'final' || at.n === finalLine)) finalRead = typedAt.value;
    }

    // ── S2 checks ($0) ───────────────────────────────────────────────────────
    const tags = conventionsOf(ref.question_text, ref.options);
    const fc = finalCheck(finalRead, typedFinal, { options: ref.options, key_option: ref.key_option, key_value: ref.key_value }, tags, finalLine);
    const facts: Fact[] = s2On ? stepFacts(transcript, typedAt).concat(fc.fact ? [fc.fact] : []) : [];
    const failingN = facts.filter((f) => FAILING_FACTS.has(f.fact)).length;

    // ── S3 judges ────────────────────────────────────────────────────────────
    const promptB = judgePromptFor(ref, transcript, facts, tags, fc.note, typedFinal, false);
    const promptA = judgePromptFor(ref, transcript, facts, tags, fc.note, typedFinal, true);
    let jb: JudgeRun | null = null;
    let ja: JudgeRun | null = null;
    let escalation: string | null = null;
    if (judgeAMode === 'always') {
        const [b, a] = await Promise.all([judgeBMode === 'never' ? Promise.resolve(null) : judgeB(promptB, transcript, calls), judgeA(promptA, img, transcript, calls)]);
        jb = b; ja = a; escalation = 'always';
    } else {
        if (judgeBMode !== 'never') jb = await judgeB(promptB, transcript, calls);
        if (judgeAMode === 'escalate') {
            escalation = escalationReason(jb, facts, transcript, meanLegible);
            if (escalation) ja = await judgeA(promptA, img, transcript, calls);
        }
    }
    const judges: Validated[] = [jb, ja].filter((j): j is JudgeRun => j !== null);
    const judgesRan = judges.map((j) => j.name as string);
    const escalated = ja !== null;

    // ── S4 arbiter ───────────────────────────────────────────────────────────
    const v = arbitrate(facts, judges, fc.finalMatch, transcript, meanLegible);
    const ms = Date.now() - t0;
    const costUsd = Number(calls.reduce((a, c) => a + c.cost_usd, 0).toFixed(6));

    // ── S5 persist: the transcript and the verdict, never the image ──────────
    const deviceInternal = await deviceInternalP;
    const actor = isProbe ? 'eapcet_probe' : isLocal ? 'eapcet_local' : (deviceInternal || claimsTeam) ? 'eapcet_team' : 'eapcet_student';
    const { attempt, prevId } = await attemptOf(deviceId, refKey, typedAt !== null);
    if (prevId !== null) {
        // fire-and-forget: the previous verdict learns what the student did next
        const mark = patchReview(prevId, { student_next: typedAt ? 'clarified' : 'retried' });
        const rt = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
        if (rt?.waitUntil) rt.waitUntil(mark);
    }
    const reviewRow = {
        device_id: deviceId,
        session_id: session,
        actor,
        ref_kind: refKind,
        ref_key: refKey,
        attempt_no: attempt,
        typed_final: typedFinal,
        reader,
        reader_model: readerModel,
        transcript,
        legible: meanLegible,
        final_value_read: finalRead,
        final_matches_key: fc.finalMatch,
        s2: { facts, final_check: { final: fc.final, match: fc.finalMatch, option: fc.option, detail: fc.detail }, typed_value_at_line: typedAt, enabled: s2On },
        conventions: tags,
        judge_a: judgeSummary(ja),
        judge_b: judgeSummary(jb),
        judge_a_ran: escalated,
        escalation_reason: escalation,
        verdict: v.verdict,
        first_error_line: v.first_error_line,
        error_class: v.error_class,
        concept_tag: v.concept_tag,
        what_should_be: v.what_should_be,
        evidence_quote: v.evidence_line ? v.evidence_line.text : null,
        ask: v.ask,
        models: calls.map(callSummary),
        cost_usd: costUsd,
        ms,
        disputed: false,
        student_next: null,
    };
    const reviewId = await insertReview(reviewRow);

    const internal = await ledgerRow(true, {
        outcome: 'ok', attempt_no: attempt, verdict: v.verdict, first_error_line: v.first_error_line, error_class: v.error_class, arbiter_reason: v.reason,
        escalated, escalation_reason: escalation, judges_ran: judgesRan, legible: meanLegible, lines_n: transcript.length,
        facts_n: facts.length, failing_n: failingN, final_match: fc.finalMatch, final_detail: fc.detail, conventions: tags, review_id: reviewId,
        judge_b_status: jb ? jb.status : null, judge_a_status: ja ? ja.status : null,
    });
    await writeEvent(deviceId, session, internal || claimsTeam || isLocal, 'review', {
        outcome: 'ok', verdict: v.verdict, error_class: v.error_class, line: v.first_error_line, ask: v.ask, attempt_no: attempt, escalated, escalation_reason: escalation,
        judges_ran: judgesRan, legible: meanLegible, ms, reads_left: left(1), bytes: imageBytes, ref_kind: refKind, review_id: reviewId,
    });

    return reply(origin, 200, {
        ok: true,
        verdict: v.verdict,
        first_error_line: v.first_error_line,
        error_class: v.error_class,
        what_should_be: v.what_should_be,
        concept_tag: v.concept_tag,
        evidence_line: v.evidence_line,
        transcript: transcript.map((l) => ({ n: l.n, text: l.text, tex: l.tex, kind: l.kind, legible: l.legible })),
        final_value_read: finalRead,
        final_matches_key: fc.finalMatch,
        judges_ran: judgesRan,
        escalated,
        escalation_reason: escalation,
        ask: v.ask,
        ask_line: v.ask_line,
        method: v.method,
        attempt_no: attempt,
        review_id: reviewId,
        reads_left: left(1),
        cost_usd: costUsd,
        ms,
    });
});
