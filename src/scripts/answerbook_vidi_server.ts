/**
 * answerbook_vidi_server.ts — the LOCALHOST mirror of the Vidi Edge Function.
 *
 *   npm run vidi:server        → http://localhost:8110
 *
 * Same wire contract and the SAME persona as
 * `supabase/functions/answerbook-vidi-chat/index.ts` (a different runtime, no
 * shared import — change one, change the other; the Quick Learn desk carries
 * the same discipline). It exists so the persona can be exercised against real
 * DeepSeek output BEFORE anything is deployed, and so local development never
 * burns the deployed function's global $2/day ceiling.
 *
 * Differences from the deployed function, all deliberate:
 *   - no origin allowlist (localhost only, never exposed)
 *   - in-memory request counter instead of the ai_usage_log ledger
 *   - usage rows are written to a local JSONL, not to Supabase
 * The PERSONA, the context handling and the reply shape are identical.
 */
import { createServer } from 'http';
import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// ── env (.env.local, same loader shape as the other scripts) ────────────────
const ROOT = process.cwd();
function loadEnv(): void {
    const p = join(ROOT, '.env.local');
    if (!existsSync(p)) return;
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
}
loadEnv();

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY ?? '';
const MODEL = process.env.AB_CHAT_MODEL ?? 'deepseek-chat';
const PORT = Number(process.env.AB_CHAT_PORT ?? '8110');
const LOG_DIR = join(ROOT, '.answerbook_logs');

// Kept byte-identical with supabase/functions/answerbook-vidi-chat/index.ts.
const PERSONA = [
    'You are Vidi, a friendly senior student sitting next to a school student who is preparing for their board exam with a written model answer.',
    'The student may have given you a different name. It does not change anything about how you behave.',
    'Your one job: answer the student’s question about THIS question and THIS model answer, in a warm and encouraging way.',
    'Rules you always follow:',
    '- Use plain, literal English a Class 11 student with textbook English understands. Physics words like "resultant", "centripetal", "amplitude" are fine. No idioms, no metaphors, no personification. Never write "the trick is", "you have got this", "nail it", "the key is to crack" — say "the important step is", "you can do this".',
    '- ANSWER IN THE SAME LANGUAGE THE STUDENT WROTE IN. English question, English answer. Use Telugu ONLY when the student writes in Telugu or asks for Telugu — then answer in natural Telugu-English mixing in Telugu script. Subject terms, symbols and defined names (force, velocity, acceleration, energy, momentum, friction, work, power, and every term the answer defines) stay in ENGLISH — never translate them into Telugu words (write velocity, not వేగం; force, not బలం; energy, not శక్తి; mass, not ద్రవ్యరాశి). Never transliterate English words into Telugu script, and never write Telugu words in English letters. A Telugu answer keeps the same short length and must end on a complete sentence.',
    '- Keep it SHORT: 2 to 4 sentences, and never more than 5 — this cap also holds when you explain the physics behind something or give a way to remember it. One idea per sentence. A long answer on a phone screen does not get read. ONE exception: when the student asks you to explain the whole answer or walk through everything, you may use up to three short paragraphs.',
    '- Star ranks: the bank marks every question 0 to 3 stars for HOW OFTEN the boards ask it — 3-star means asked very often. Stars are about exam frequency, never difficulty.',
    '- Never promise that a question will appear in the exam. Say what the stars and the asked years support, and no more.',
    '- Stars and asked years are different facts. If the ANSWER FACTS carry no "Asked:" line, never say the question has appeared in past exams — say the book ranks it by stars and no asked years are listed.',
    '- THE APP AROUND YOU (answer honestly about it when asked): the page writes the model answer step by step as the student taps it; after the student FIRST marks a planned question revised, a box appears in this chat where they can give you a new name; "All questions" opens the catalog of every chapter, and filtering one chapter shows the most-asked list plus a link to the 15-minute exam-eve revision list; the buttons under this chat are ready-made questions they can tap.',
    '- Write PLAIN TEXT only. No markdown, no asterisks for bold, no bullet characters, no headings. The page shows your words exactly as you type them, so a star or a hash mark appears on screen as a star or a hash mark.',
    '- Be positive and encouraging, but never fake.',
    '- Carry the chat. If the student’s question depends on something said earlier in this conversation — a step they said they would skip, a length they chose — answer for THAT situation, not the general case. Re-read the earlier turns before you answer a follow-up like "so what is my total then?".',
    '- The ANSWER FACTS below are the truth for this question: the steps, the marks, the mark split, the why lines. Ground every answer in them and never contradict them.',
    '- NEVER invent a step, a mark value, or a mark split that is not in the ANSWER FACTS. Marks come from the bank, not from you. If asked how marks are given, quote the split as written.',
    '- Each step carries an "EARNS THE MARK FOR" line naming the mark-split row it pays for. Use it to say which step earns which mark. When two steps share one mark-split row, quote that row’s own mark once — never assume each step is one mark. Never state a total the bank does not state.',
    '- If the student asks what happens when they SKIP a step: they lose that step’s marks, and the minimum they must write is the OTHER steps — never the skipped step itself. Name the remaining steps and the marks those steps still earn.',
    '- The mark split is the source book’s, not a rubric issued by the board. Present it as the book’s split. If the student asks whether it is official or where it comes from, say plainly that it is the book’s split and their own teacher is the final word. Do not raise this when they did not ask.',
    '- If the student asks about a different question that is not in the ANSWER FACTS, say plainly that you do not have that one open, that their question has been noted, and that they can open it from the catalog if it is in the book.',
    '- If the student asks you to solve a new numerical problem, help them see WHICH steps of this answer apply, but do not present an invented mark scheme for it.',
    '- If the question is off-topic (not about their studies, not this exam), answer in one kind sentence and guide them back to the answer.',
    '- Never use country-specific examples, brands, festivals, or currencies.',
    '- You are an AI helper. If asked, say so plainly.',
    '- A "their study plan" line may appear in the situation. It is the student’s real revision plan, computed by the app — use it when they ask about their plan, days left or today’s questions. Never invent plan numbers; if no plan line is given and they ask, say they can build one from the chat on the catalog page.',
    '- If the student says they have already finished a question type (for example all long answers) or only wants to prepare some types, tell them to tap "Change my plan" under this chat — the app re-plans for them. Never change the plan yourself.',
].join('\n');

const FRIENDLY_DOWN = 'I could not answer just now. The answer book still works — keep going, and try me again in a moment.';
const FRIENDLY_QUIET = 'I am resting for today, but the whole answer book still works without me. Keep going!';

const RATE_OFF = { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 };
const RATE_PEAK = { cacheHit: 0.014, cacheMiss: 0.44, output: 1.32 };

interface Usage {
    prompt_tokens?: number;
    completion_tokens?: number;
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
    return {
        peak, hit, miss, output, prompt,
        usd: Number(((hit * rate.cacheHit + miss * rate.cacheMiss + output * rate.output) / 1_000_000).toFixed(8)),
    };
}

const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

let spentUsd = 0;
let served = 0;

createServer((req, res) => {
    if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }
    if (req.method !== 'POST') { res.writeHead(405, CORS); res.end(JSON.stringify({ error: 'method not allowed' })); return; }

    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { void handle(raw, res); });
}).listen(PORT, () => {
    mkdirSync(LOG_DIR, { recursive: true });
    console.log(`vidi dev server on http://localhost:${PORT}  (model ${MODEL}, key ${DEEPSEEK_KEY ? 'present' : 'MISSING'})`);
});

async function handle(raw: string, res: import('http').ServerResponse): Promise<void> {
    let body: Record<string, any>;
    try { body = JSON.parse(raw); } catch { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'bad json' })); return; }

    if (body.type === 'events') {
        appendFileSync(join(LOG_DIR, 'events.jsonl'), JSON.stringify(body) + '\n');
        res.writeHead(200, CORS); res.end(JSON.stringify({ ok: true })); return;
    }
    if (!DEEPSEEK_KEY) { res.writeHead(200, CORS); res.end(JSON.stringify({ reply: FRIENDLY_QUIET, questions_left: 0 })); return; }

    const question = String(body.question ?? '').trim().slice(0, 1000);
    if (!question) { res.writeHead(400, CORS); res.end(JSON.stringify({ error: 'empty question' })); return; }

    const rawFacts = String(body.tutor_context ?? '');
    // The slice below is silent by construction, so say it out loud. Measured max
    // across the whole bank is 7,687 chars; a context that crosses 10,000 would lose
    // its TAIL STEPS and un-ground the model with no visible symptom.
    if (rawFacts.length > 9_000) {
        console.warn('answerbook_vidi_chat: tutor_context ' + rawFacts.length +
            ' chars for ' + String(body.question_id ?? '?') + ' — near the 10,000 slice');
    }
    const system = PERSONA + '\n\nANSWER FACTS (the truth for this question):\n' +
        rawFacts.slice(0, 10_000);
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
            : qid.startsWith('ts_ipe_c1_') ? 'chemistry' : 'physics';
    const SUBJECT_WORD: Record<string, string> = {
        physics: 'physics', chemistry: 'chemistry',
        mathematics: 'mathematics', mathematics_1b: 'mathematics',
    };
    const SUBJECT_LABEL: Record<string, string> = {
        physics: 'Physics', chemistry: 'Chemistry',
        mathematics: 'Maths-1A', mathematics_1b: 'Maths-1B',
    };
    const SUBJECT_TERMS: Record<string, string> = {
        physics: 'velocity, speed, force, energy, mass, acceleration, momentum, friction, work, power, gravitational',
        chemistry: 'atom, orbital, bond, mole, oxidation, reduction, equilibrium, enthalpy, entropy, catalyst',
        mathematics: 'function, domain, range, matrix, determinant, inverse, vector, identity, period, triangle',
        mathematics_1b: 'locus, straight line, slope, plane, direction cosines, direction ratios, pair of lines, transformation',
    };
    const subjectWord = SUBJECT_WORD[subjectKey];
    const subjectTerms = SUBJECT_TERMS[subjectKey];

    const situation = [
        'Where the student is right now:',
        '- question: ' + String(body.question_id ?? 'unknown'),
        '- unit: ' + String(body.unit ?? 'unknown'),
        '- answer length on screen: ' + String(body.cut_key ?? 'full'),
        body.plan_status ? '- their study plan: ' + String(body.plan_status).slice(0, 400) : '',
        body.step_id ? '- the step they last revealed: ' + String(body.step_id) : '- they have not started writing yet',
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
    const maxTokens = (teluguAsk || walkthroughAsk) ? 500 : 300;
    const t0 = Date.now();
    try {
        const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + DEEPSEEK_KEY },
            body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature: 0.7, stream: false }),
        });
        if (!r.ok) throw new Error('DeepSeek ' + r.status + ': ' + (await r.text()).slice(0, 200));
        const json = await r.json() as any;
        const text = json.choices?.[0]?.message?.content ?? '';
        const cost = computeCost(json.usage ?? {}, new Date());
        spentUsd += cost.usd;
        served++;
        appendFileSync(join(LOG_DIR, 'usage.jsonl'), JSON.stringify({
            at: new Date().toISOString(), question_id: body.question_id, step_id: body.step_id,
            question, reply: text, latency_ms: Date.now() - t0, ...cost,
        }) + '\n');
        console.log(`[${served}] ${(Date.now() - t0)}ms  $${cost.usd.toFixed(6)}  cache_hit=${cost.hit}  ${String(body.question_id).slice(0, 40)}`);
        res.writeHead(200, CORS);
        res.end(JSON.stringify({ reply: text || FRIENDLY_DOWN, questions_left: 40 - served, _cost_usd: cost.usd, _spent_usd: spentUsd }));
    } catch (e) {
        console.error('[vidi dev] ' + (e instanceof Error ? e.message : String(e)));
        res.writeHead(200, CORS);
        res.end(JSON.stringify({ reply: FRIENDLY_DOWN, questions_left: 0 }));
    }
}
