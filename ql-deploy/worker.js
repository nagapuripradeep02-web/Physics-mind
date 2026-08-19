/**
 * physicsmind-quicklearn — Cloudflare Worker serving the Quick Learn student
 * page (static assets) + the Vidi chat backend, a faithful port of
 * src/scripts/quicklearn_chat_server.ts (DeepSeek deepseek-chat, same persona,
 * same prompt assembly, same friendly errors, same 25/session + 3/min limits)
 * with the deploy-only safety envelope the founder approved 2026-08-19:
 *
 *   - ACCESS CODE (secret QL_ACCESS_CODE): /api/chat requires body.code.
 *     Wrong/missing -> 401 with a friendly JSON reply (the page bubbles any
 *     JSON reply; the injected fetch wrapper clears a stored bad code on 401
 *     so the next Ask re-prompts). /api/log and /api/feedback stay 200 even
 *     without a code (the page's boot probe hits /api/log BEFORE any code is
 *     entered and hides the chat unless it gets r.ok) — they just skip
 *     logging unless the code is valid.
 *   - GLOBAL DAILY CAP (300 chat turns/UTC-day) + per-session 25 + 3/min,
 *     all in KV (eventual consistency is fine at this scale).
 *   - KILL SWITCH: KV key "kill" present -> friendly 503 for /api/chat.
 *       on:  npx wrangler kv key put kill 1 --binding TUTOR_KV -c ql-deploy/wrangler.toml --remote
 *       off: npx wrangler kv key delete kill --binding TUTOR_KV -c ql-deploy/wrangler.toml --remote
 *   - LOGS -> KV ("log:<date>:<session>:<ts>", 30-day TTL) replacing the
 *     local .quicklearn_logs JSONL.
 *   - USAGE -> ai_usage_log (sacred cost table) via Supabase REST,
 *     fire-and-forget (ctx.waitUntil), same row shape as qlUsage.buildUsageRow
 *     with actor "quicklearn_student".
 *
 * Secrets: DEEPSEEK_API_KEY, QL_ACCESS_CODE, SUPABASE_URL, SUPABASE_SERVICE_KEY.
 * Bindings: ASSETS (static site), TUTOR_KV.
 */

const MODEL = 'deepseek-chat';
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';
const MAX_QUESTIONS_PER_SESSION = 25;
const RATE_MAX_PER_MINUTE = 3;
const GLOBAL_DAILY_CAP = 300;
const LOG_TTL_S = 30 * 24 * 3600;
const USD_TO_INR = 95.69;

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
const FRIENDLY_CAP = 'You have asked a lot of great questions this session — that is the daily limit. Finish the lesson and the quiz; your questions are saved for your teacher.';
const FRIENDLY_CODE = 'That access code is not right. Ask your teacher for the code, then try asking me again.';
const FRIENDLY_KILLED = 'I am taking a break right now, on your teacher’s request. The lesson still works — keep going!';
const FRIENDLY_GLOBAL = 'A lot of students are asking me questions today and I have reached my daily limit. The lesson still works — keep going!';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function sanitizeSessionId(raw) {
  return String(raw || 'anon').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'anon';
}

function utcDate() {
  return new Date().toISOString().split('T')[0];
}

function isPeakUtc(d) {
  const h = d.getUTCHours();
  return (h >= 1 && h < 4) || (h >= 6 && h < 10);
}

function computeCost(usage, when) {
  const prompt = usage.prompt_tokens || 0;
  const output = usage.completion_tokens || 0;
  const hit = usage.prompt_cache_hit_tokens || 0;
  const miss = usage.prompt_cache_miss_tokens != null ? usage.prompt_cache_miss_tokens : Math.max(0, prompt - hit);
  const peak = isPeakUtc(when);
  const rate = peak ? { cacheHit: 0.014, cacheMiss: 0.44, output: 1.32 } : { cacheHit: 0.007, cacheMiss: 0.22, output: 0.66 };
  const usd = (hit * rate.cacheHit + miss * rate.cacheMiss + output * rate.output) / 1_000_000;
  return {
    peak,
    cache_hit_tokens: hit,
    cache_miss_tokens: miss,
    output_tokens: output,
    total_tokens: usage.total_tokens != null ? usage.total_tokens : prompt + output,
    usd: Number(usd.toFixed(8)),
    usd_per_million: { cache_hit: rate.cacheHit, cache_miss: rate.cacheMiss, output: rate.output },
  };
}

async function kvCount(env, key, ttlS) {
  const cur = Number((await env.TUTOR_KV.get(key)) || '0');
  await env.TUTOR_KV.put(key, String(cur + 1), { expirationTtl: ttlS });
  return cur + 1;
}

async function kvLog(env, sid, entry) {
  const key = 'log:' + utcDate() + ':' + sid + ':' + Date.now();
  await env.TUTOR_KV.put(key, JSON.stringify({ ts: new Date().toISOString(), ...entry }), { expirationTtl: LOG_TTL_S });
}

function readingsLine(r) {
  if (Array.isArray(r)) {
    const parts = r.filter((x) => typeof x === 'string' && x.length > 0).slice(0, 10).map((s) => s.slice(0, 80));
    return parts.length ? '- what the instruments show on screen right now: ' + parts.join(', ') : '';
  }
  return '';
}

async function callDeepSeek(env, system, messages) {
  const payload = [{ role: 'system', content: system }, ...messages];
  const res = await fetch(DEEPSEEK_BASE + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.DEEPSEEK_API_KEY },
    body: JSON.stringify({ model: MODEL, messages: payload, max_tokens: 300, temperature: 0.7, stream: false }),
  });
  if (!res.ok) throw new Error('DeepSeek API ' + res.status + ': ' + (await res.text()).slice(0, 300));
  const out = await res.json();
  return {
    text: (out.choices && out.choices[0] && out.choices[0].message && out.choices[0].message.content) || '',
    usage: out.usage || {},
    inputChars: payload.reduce((n, m) => n + m.content.length, 0),
  };
}

/** Same row shape as qlUsage.buildUsageRow (actor: quicklearn_student). */
function buildUsageRow(inp) {
  const when = new Date();
  const cost = computeCost(inp.usage, when);
  return {
    session_id: inp.sessionId,
    task_type: 'quicklearn_tutor_chat',
    provider: 'deepseek',
    model: MODEL,
    input_chars: inp.inputChars,
    output_chars: inp.outputChars,
    latency_ms: Math.round(inp.latencyMs),
    estimated_cost_usd: cost.usd,
    fingerprint_key: inp.conceptId ? inp.conceptId + '|quicklearn|student_question' : null,
    was_cache_hit: cost.cache_hit_tokens > 0,
    question_date: when.toISOString().split('T')[0],
    actor: 'quicklearn_student',
    metadata: {
      surface: 'quicklearn_deployed',
      concept_id: inp.conceptId || null,
      phase: inp.phase || null,
      sim_state: inp.state || null,
      mission_id: inp.missionId || null,
      question_chars: (inp.question || '').length,
      reply_chars: inp.replyChars,
      tokens: {
        prompt: inp.usage.prompt_tokens || 0,
        completion: inp.usage.completion_tokens || 0,
        total: cost.total_tokens,
        prompt_cache_hit: cost.cache_hit_tokens,
        prompt_cache_miss: cost.cache_miss_tokens,
      },
      pricing: { peak_window: cost.peak, usd_per_million: cost.usd_per_million },
      cost_inr_estimate: Number((cost.usd * USD_TO_INR).toFixed(6)),
      usd_to_inr_rate: USD_TO_INR,
    },
  };
}

async function recordUsage(env, row) {
  try {
    await fetch(env.SUPABASE_URL + '/rest/v1/ai_usage_log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    // fire-and-forget: cost accounting must never break a student's answer
  }
}

function codeOk(env, body) {
  const code = String((body && body.code) || '').trim();
  return code.length > 0 && code === env.QL_ACCESS_CODE;
}

// ── /api/tts — Sarvam bulbul:v3 "priya" (the product's Indian female voice,
// Rule 30) so EVERY student hears the SAME voice regardless of what their
// browser ships (desktop Chrome has no Indian-English voice at all).
// KV-cached by text hash: each unique line is billed to Sarvam exactly once,
// then served from cache forever. Browser TTS remains the client-side
// fallback when this endpoint fails.
const TTS_MAX_CHARS = 800;
const TTS_NEW_DAILY_CAP = 1500;   // NEW syntheses/day (cache hits are free + uncapped)
const TTS_RATE_PER_MINUTE = 12;   // per-session request guard (bubbles come in bursts)

async function sha256Hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function handleTts(body, env, ctx) {
  if (!codeOk(env, body)) return json(401, { error: 'bad code' });
  if (await env.TUTOR_KV.get('kill')) return json(503, { error: 'paused' });
  const text = String(body.text || '').trim().slice(0, TTS_MAX_CHARS);
  if (!text) return json(400, { error: 'empty text' });

  const sid = sanitizeSessionId(body.session_id);
  const minute = Math.floor(Date.now() / 60000);
  const rateN = await kvCount(env, 'tr:' + sid + ':' + minute, 120);
  if (rateN > TTS_RATE_PER_MINUTE) return json(429, { error: 'rate' });

  // Prefix v2: the codec is part of the key, so a stale v1 WAV entry can
  // never be served under the mp3 mime (old entries just stop being hit).
  const hash = await sha256Hex('v2|en-IN|priya|mp3|' + text);
  const cached = await env.TUTOR_KV.get('tts:' + hash);
  if (cached) return json(200, { audio_b64: cached, format: 'mp3', cached: true });

  const newN = await kvCount(env, 'tts_new:' + utcDate(), 2 * 24 * 3600);
  if (newN > TTS_NEW_DAILY_CAP) return json(429, { error: 'daily tts cap' });

  const res = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: { 'api-subscription-key': env.SARVAM_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      target_language_code: 'en-IN',
      model: 'bulbul:v3',
      speaker: 'priya',
      pace: 1.0,
      speech_sample_rate: 22050,
      // output_audio_codec is the param Sarvam REST actually honours — probed
      // 2026-08-19: audio_format was silently ignored (the old 'wav' here was
      // a no-op); output_audio_codec:'mp3' returns real mpeg frames at ~1/3
      // the bytes, which was most of the student's download wait on mobile.
      output_audio_codec: 'mp3',
    }),
  });
  if (!res.ok) return json(502, { error: 'tts upstream ' + res.status });
  const out = await res.json();
  const b64 = out && out.audios && out.audios[0];
  if (!b64) return json(502, { error: 'tts empty' });
  // Never cache a mislabelled clip: base64 mp3 never starts with 'UklGR'
  // (RIFF) — if Sarvam regresses the codec param, fail loud, not poison KV.
  if (b64.slice(0, 5) === 'UklGR') return json(502, { error: 'tts codec regressed to wav' });
  // Permanent cache — the whole point: one Sarvam bill per unique line, ever.
  ctx.waitUntil(env.TUTOR_KV.put('tts:' + hash, b64));
  return json(200, { audio_b64: b64, format: 'mp3', cached: false });
}

async function handleChat(body, env, ctx) {
  const sid = sanitizeSessionId(body.session_id);
  const question = String(body.question || '').trim().slice(0, 1000);
  if (!question) return json(400, { error: 'empty question' });

  if (!codeOk(env, body)) {
    return json(401, { reply: FRIENDLY_CODE, questions_left: 0 });
  }
  if (await env.TUTOR_KV.get('kill')) {
    return json(503, { reply: FRIENDLY_KILLED, questions_left: 0 });
  }

  const day = utcDate();
  const globalN = await kvCount(env, 'd:' + day, 2 * 24 * 3600);
  if (globalN > GLOBAL_DAILY_CAP) {
    ctx.waitUntil(kvLog(env, sid, { type: 'chat_global_capped', question }));
    return json(429, { reply: FRIENDLY_GLOBAL, questions_left: 0 });
  }
  const sessionN = await kvCount(env, 'q:' + sid + ':' + day, 2 * 24 * 3600);
  if (sessionN > MAX_QUESTIONS_PER_SESSION) {
    ctx.waitUntil(kvLog(env, sid, { type: 'chat_capped', question }));
    return json(429, { reply: FRIENDLY_CAP, questions_left: 0 });
  }
  const minute = Math.floor(Date.now() / 60000);
  const rateN = await kvCount(env, 'r:' + sid + ':' + minute, 120);
  if (rateN > RATE_MAX_PER_MINUTE) {
    ctx.waitUntil(kvLog(env, sid, { type: 'chat_rate_limited', question }));
    return json(429, { reply: FRIENDLY_BUSY, questions_left: MAX_QUESTIONS_PER_SESSION - sessionN });
  }

  // Stable prefix first — DeepSeek's automatic prefix caching bills the
  // repeated persona+facts part at the cache-hit rate.
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
    const out = await callDeepSeek(env, system, messages);
    const latency = Date.now() - t0;
    ctx.waitUntil(kvLog(env, sid, {
      type: 'chat_turn', concept_id: body.concept_id, phase: body.phase, state: body.state,
      mission_id: body.mission_id, question, reply: out.text, usage: out.usage,
      model: MODEL, latency_ms: latency, recent_actions: (body.recent_actions || []).slice(-10),
    }));
    ctx.waitUntil(recordUsage(env, buildUsageRow({
      sessionId: sid, usage: out.usage, latencyMs: latency,
      inputChars: out.inputChars, outputChars: out.text.length,
      conceptId: body.concept_id, phase: body.phase, state: body.state,
      missionId: body.mission_id || null, question, replyChars: out.text.length,
    })));
    return json(200, { reply: out.text || FRIENDLY_DOWN, questions_left: MAX_QUESTIONS_PER_SESSION - sessionN });
  } catch (e) {
    ctx.waitUntil(kvLog(env, sid, { type: 'chat_error', question, error: String(e && e.message || e).slice(0, 300) }));
    return json(200, { reply: FRIENDLY_DOWN, questions_left: MAX_QUESTIONS_PER_SESSION - sessionN });
  }
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
      if (req.method !== 'POST') return json(404, { error: 'not found' });
      let body;
      try { body = await req.json(); } catch { return json(400, { error: 'bad json' }); }
      if (url.pathname === '/api/chat') return handleChat(body, env, ctx);
      if (url.pathname === '/api/tts') return handleTts(body, env, ctx);
      if (url.pathname === '/api/log' || url.pathname === '/api/feedback') {
        // ALWAYS 200: the page's boot probe hits /api/log before any code is
        // entered and hides the chat unless it gets an ok. Log only with a
        // valid code so anonymous internet noise never fills the KV.
        if (codeOk(env, body)) {
          const sid = sanitizeSessionId(body.session_id);
          const type = url.pathname === '/api/feedback' ? 'feedback' : String(body.type || 'event');
          ctx.waitUntil(kvLog(env, sid, { type, payload: body.payload != null ? body.payload : body }));
        }
        return json(200, { ok: true });
      }
      return json(404, { error: 'not found' });
    }
    return env.ASSETS.fetch(req);
  },
};
