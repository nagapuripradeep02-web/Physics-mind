/**
 * translate_concept_tts — batch-translate a concept's narration (text_en) into
 * Hindi (text_hi) + Telugu (text_te), code-mixed: ALL physics/technical terms and
 * ALL spoken-math stay in English; only the connective language becomes HI/TE.
 *
 * Uses the repo's anthropicGenerate (Claude Sonnet 4.6). Inserts the new fields
 * right after text_en in the raw JSON (format-preserving, keyed by sentence id),
 * so the diff is purely additive and existing formatting is untouched.
 *
 * OUTPUT IS DRAFT — needs a native-speaker check (1 Hindi, 1 Telugu) before any
 * student/production use. Idempotent: skips sentences that already have BOTH
 * text_hi + text_te unless --force.
 *
 * Run:
 *   npx tsx --env-file=.env.local src/scripts/translate_concept_tts.ts <conceptId> [--force] [--model=claude-sonnet-4-6]
 */
import '@/lib/loadEnvLocal';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { anthropicGenerate } from '@/lib/providers/anthropicProvider';
import { googleGenerate } from '@/lib/providers/googleProvider';
import { deepseekGenerate } from '@/lib/providers/deepseekProvider';
import type { ModelConfig } from '@/lib/modelRouter';

const ROOT = process.cwd();
const CONCEPTS_DIR = join(ROOT, 'src', 'data', 'concepts');
const CHUNK = 10;
const MAX_TOKENS = 8000;
type Provider = 'anthropic' | 'google' | 'deepseek';
const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: 'claude-sonnet-4-6',
  google: 'gemini-2.5-flash',
  deepseek: 'deepseek-chat',
};
const GENERATORS = { anthropic: anthropicGenerate, google: googleGenerate, deepseek: deepseekGenerate };

interface Sentence {
  id: string;
  text_en?: string;
  text_hi?: string;
  text_te?: string;
}
interface Translation {
  id: string;
  text_hi: string;
  text_te: string;
}

const SYSTEM = `You translate physics lesson narration (spoken by a teacher) from English into Hindi AND Telugu for Indian classrooms. The output is text-to-speech narration, so write natural, warm, spoken sentences.

HARD RULES — code-mixed (Hinglish / Telgish):
1. The CONNECTIVE language becomes Hindi (Devanagari script) or Telugu (Telugu script).
2. Keep EVERY physics / technical / scientific term in ENGLISH, inline, even inside the Hindi/Telugu sentence. Examples that MUST stay English: wire, current, charge, force, vector, magnetic field, electric field, flux, field lines, dipole, torque, solenoid, loop, right-hand rule, Newton's third law, ampere, Gauss's law, Lorentz force, parallel, antiparallel, attract, repel, symmetric, etc.
3. Keep EVERY mathematical expression EXACTLY as the English spells it out in words — do NOT convert to symbols and do NOT translate. e.g. "B-one equals mu-zero I-one over two pi d", "F equals q v cross B", "two times ten to the minus seven newtons per metre", "I-one", "I-two", "F over L". Letters like B-one, E-two stay as written.
4. Keep numbers, units, and quantity names as in English.
5. Do NOT add or drop information. One output sentence-group per input. Keep the teacherly tone.

Return STRICT JSON only — a JSON array, no markdown, no prose, no code fences:
[{"id":"<id>","text_hi":"<hindi>","text_te":"<telugu>"}, ...]

Examples (input -> output):
EN: "Those circles reach all the way across to wire 2. The strength there is B-one equals mu-zero I-one over two pi d."
HI: "ये circles पूरे रास्ते wire 2 तक पहुँचते हैं। वहाँ इसकी strength है B-one equals mu-zero I-one over two pi d।"
TE: "ఈ circles పూర్తిగా wire 2 వరకు చేరతాయి. అక్కడ దాని strength B-one equals mu-zero I-one over two pi d."

EN: "Watch the trap. Like charges repel. But like currents — same direction — attract. It is the opposite rule."
HI: "इस जाल से सावधान रहिए। Like charges repel करते हैं। लेकिन like currents — एक ही direction — attract करते हैं। यह उल्टा rule है।"
TE: "ఈ ట్రాప్ ని గమనించండి. Like charges repel అవుతాయి. కానీ like currents — ఒకే direction — attract అవుతాయి. ఇది వ్యతిరేక rule."`;

function parseArgs() {
  const args = process.argv.slice(2);
  const conceptId = args.find((a) => !a.startsWith('--'));
  const force = args.includes('--force');
  const provArg = args.find((a) => a.startsWith('--provider='));
  const provider = (provArg ? provArg.split('=')[1] : 'anthropic') as Provider;
  const modelArg = args.find((a) => a.startsWith('--model='));
  const model = modelArg ? modelArg.split('=')[1] : DEFAULT_MODELS[provider] ?? DEFAULT_MODELS.anthropic;
  // --from=<path>: insert translations authored by hand/agent (no LLM API call).
  // File shape: { "<sentenceId>": { "hi": "...", "te": "..." }, ... }
  const fromArg = args.find((a) => a.startsWith('--from='));
  const from = fromArg ? fromArg.split('=')[1] : null;
  return { conceptId, force, provider, model, from };
}

function loadSentences(conceptId: string): Sentence[] {
  const path = join(CONCEPTS_DIR, `${conceptId}.json`);
  if (!existsSync(path)) throw new Error(`Concept JSON not found: ${path}`);
  const json = JSON.parse(readFileSync(path, 'utf-8')) as {
    epic_l_path?: { states?: Record<string, { teacher_script?: { tts_sentences?: Sentence[] } }> };
  };
  const states = json.epic_l_path?.states ?? {};
  const num = (id: string) => { const m = /STATE_(\d+)/.exec(id); return m ? parseInt(m[1], 10) : 9999; };
  const out: Sentence[] = [];
  for (const sid of Object.keys(states).sort((a, b) => num(a) - num(b))) {
    for (const s of states[sid].teacher_script?.tts_sentences ?? []) {
      if (s.id && (s.text_en ?? '').trim()) out.push(s);
    }
  }
  return out;
}

function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }

function extractJsonArray(text: string): unknown {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) throw new Error('no JSON array in model output');
  return JSON.parse(text.slice(start, end + 1));
}

async function translateChunk(chunk: Sentence[], provider: Provider, model: string): Promise<Translation[]> {
  const items = chunk.map((s) => ({ id: s.id, text_en: s.text_en }));
  const prompt = `Translate these ${items.length} narration sentences. Return ONLY the JSON array.\n\n${JSON.stringify(items, null, 0)}`;
  const config: ModelConfig = { provider, model, costPer1KInput: 0, costPer1KOutput: 0 };
  const generate = GENERATORS[provider] ?? anthropicGenerate;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(800 * 2 ** attempt);
    try {
      const { text } = await generate(config, SYSTEM, prompt, MAX_TOKENS);
      const arr = extractJsonArray(text) as Translation[];
      if (!Array.isArray(arr)) throw new Error('output is not an array');
      return arr;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('translate chunk failed');
}

function reEsc(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/** Insert (or, with existing fields, replace) text_hi/text_te right after text_en for `id`. */
function insertTranslation(raw: string, id: string, en: string, hi: string, te: string): { raw: string; ok: boolean } {
  const lit = reEsc(JSON.stringify(en)); // exact file literal for ASCII-English text_en
  const idEsc = reEsc(id);
  const re = new RegExp(
    '("id"\\s*:\\s*"' + idEsc + '"\\s*,\\s*"text_en"\\s*:\\s*' + lit + ')' +
    '(\\s*,\\s*"text_hi"\\s*:\\s*"(?:[^"\\\\]|\\\\.)*"\\s*,\\s*"text_te"\\s*:\\s*"(?:[^"\\\\]|\\\\.)*")?',
  );
  if (!re.test(raw)) return { raw, ok: false };
  const add = ', "text_hi": ' + JSON.stringify(hi) + ', "text_te": ' + JSON.stringify(te);
  return { raw: raw.replace(re, (_m, p1: string) => p1 + add), ok: true };
}

async function main(): Promise<void> {
  const { conceptId, force, provider, model, from } = parseArgs();
  if (!conceptId) {
    console.error('Usage: translate_concept_tts.ts <conceptId> [--force] [--from=<file>] [--provider=anthropic|google|deepseek] [--model=]');
    process.exit(1);
  }

  const path = join(CONCEPTS_DIR, `${conceptId}.json`);
  const all = loadSentences(conceptId);
  const todo = force ? all : all.filter((s) => !((s.text_hi ?? '').trim() && (s.text_te ?? '').trim()));
  console.log(`🌐 ${conceptId}: ${all.length} sentences, ${todo.length} to translate (${from ? `from=${from}` : `provider=${provider} model=${model}`})`);
  if (todo.length === 0) { console.log('   nothing to do — already translated.'); return; }

  // by-id text_en lookup for insertion
  const enById = new Map(all.map((s) => [s.id, s.text_en ?? '']));

  const translations = new Map<string, Translation>();

  // --from: load hand/agent-authored translations (no API). Otherwise call the LLM.
  if (from) {
    const fromMap = JSON.parse(readFileSync(from, 'utf-8')) as Record<string, { hi?: string; te?: string }>;
    for (const [id, v] of Object.entries(fromMap)) {
      if (v && (v.hi ?? '').trim() && (v.te ?? '').trim()) translations.set(id, { id, text_hi: v.hi!, text_te: v.te! });
    }
    console.log(`   loaded ${translations.size} translations from file`);
  } else {
    const keyVar = provider === 'google' ? 'GOOGLE_GENERATIVE_AI_API_KEY' : provider === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'ANTHROPIC_API_KEY';
    if (!process.env[keyVar]) throw new Error(`${keyVar} not set (expected in .env.local)`);
    await translateViaLlm(todo, translations, provider, model);
  }

  insertAndWrite(path, todo, translations, enById, conceptId);
}

async function translateViaLlm(
  todo: Sentence[],
  translations: Map<string, Translation>,
  provider: Provider,
  model: string,
): Promise<void> {
  // Translate in rounds: each round chunks the still-missing sentences, accepts
  // ONLY items whose id was requested in that chunk AND carry both languages
  // (Gemini sometimes echoes extras/duplicates). Missing ids retry next round.
  for (let round = 0; round < 3; round++) {
    const remaining = todo.filter((s) => !translations.has(s.id));
    if (remaining.length === 0) break;
    if (round > 0) console.log(`   round ${round + 1}: retrying ${remaining.length} untranslated`);
    for (let i = 0; i < remaining.length; i += CHUNK) {
      const chunk = remaining.slice(i, i + CHUNK);
      const want = new Set(chunk.map((s) => s.id));
      let got = 0;
      try {
        const res = await translateChunk(chunk, provider, model);
        for (const t of res) {
          if (t && t.id && want.has(t.id) && !translations.has(t.id) && (t.text_hi ?? '').trim() && (t.text_te ?? '').trim()) {
            translations.set(t.id, t);
            got++;
          }
        }
      } catch (e) {
        console.warn(`   chunk failed: ${e instanceof Error ? e.message : e}`);
      }
      console.log(`   round ${round + 1} chunk: ${got}/${chunk.length} accepted`);
      await sleep(300);
    }
  }
}

function insertAndWrite(
  path: string,
  todo: Sentence[],
  translations: Map<string, Translation>,
  enById: Map<string, string>,
  conceptId: string,
): void {
  let raw = readFileSync(path, 'utf-8');
  let inserted = 0;
  const failed: string[] = [];
  for (const s of todo) {
    const t = translations.get(s.id);
    if (!t || !t.text_hi || !t.text_te) { failed.push(s.id + ' (no translation)'); continue; }
    const r = insertTranslation(raw, s.id, enById.get(s.id) ?? '', t.text_hi, t.text_te);
    if (!r.ok) { failed.push(s.id + ' (no match in file)'); continue; }
    raw = r.raw;
    inserted++;
  }

  // Validate the result still parses before writing.
  try { JSON.parse(raw); } catch (e) {
    throw new Error(`refusing to write — result is invalid JSON: ${e instanceof Error ? e.message : e}`);
  }
  writeFileSync(path, raw, 'utf-8');
  console.log(`✓ ${conceptId}: inserted ${inserted}/${todo.length}${failed.length ? `, FAILED: ${failed.join(', ')}` : ''}`);
  if (failed.length) process.exitCode = 2;
}

main().catch((err) => {
  console.error('💥 translate failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
