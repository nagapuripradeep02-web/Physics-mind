/**
 * generate_tts_audio — pre-generate STORED Sarvam TTS narration clips for a
 * concept's teacher_script, in English + Telugu (Hindi only via --allow-hindi;
 * Rule 30f: Hindi is text-only until a Hindi market exists), and emit a manifest
 * the review-site builder embeds. This is the "store it once, no live API at
 * teach-time" path (CLAUDE.md §3 / Rule 28 voice seed).
 *
 * For each tts_sentence × language it calls Sarvam Bulbul, decodes the base64
 * MP3 and writes:
 *   review-site/<conceptId>/audio/<sentenceId>_<lang>.mp3
 *   review-site/<conceptId>/audio_manifest.json   { meta, clips:{ "<id>_<lang>": {...} } }
 *
 * Idempotent: an existing .mp3 is NOT re-fetched (unless --force) but is still
 * measured from disk so the manifest is rebuilt deterministically.
 *
 * Technical terms / spoken-math stay in English inside HI/TE sentences
 * (code-mixed — Bulbul handles this out of the box).
 *
 * Run:
 *   npx tsx --env-file=.env.local src/scripts/generate_tts_audio.ts parallel_currents_force
 *   npx tsx --env-file=.env.local src/scripts/generate_tts_audio.ts parallel_currents_force --force
 *   ... --langs=en,te   --model=bulbul:v3 --speaker=anushka
 *   ... --langs=en,hi,te --allow-hindi   (Hindi voicing is opt-in — billed + unwanted per Rule 30f)
 */
import '@/lib/loadEnvLocal';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// ── Config ───────────────────────────────────────────────────────────────────
const ROOT = process.cwd();
const CONCEPTS_DIR = join(ROOT, 'src', 'data', 'concepts');
const OUT_DIR = join(ROOT, 'review-site');
const SARVAM_URL = 'https://api.sarvam.ai/text-to-speech';

// Default to bulbul:v3 + female "priya" (supports en/hi/te). v3 is purpose-built
// for code-mixing / Romanized text / abbreviations — the inline-English path our
// trilingual narration uses (Rule 30). Override via --model / --speaker flags.
const DEFAULT_MODEL = 'bulbul:v3';
const DEFAULT_SPEAKER = 'priya';
const SAMPLE_RATE = 22050;
const PACE = 1.0;

const LANGS: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };

type Lang = 'en' | 'hi' | 'te';
interface TtsSentence {
  id: string;
  text_en?: string;
  text_hi?: string;
  text_te?: string;
}
interface ClipEntry {
  id: string;
  lang: Lang;
  file: string;
  duration_ms: number;
  chars: number;
  available: boolean;
  /** sha1 of the exact sentence text the clip was voiced from. A clip whose
   *  hash no longer matches the concept JSON is STALE (the sentence was
   *  rewritten under the same id — the Ch.4 Socratic→straightforward retrofit
   *  bug) and must be re-fetched, never reused. */
  text_hash?: string;
}

function textHash(text: string): string {
  return createHash('sha1').update(text, 'utf8').digest('hex');
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const conceptId = args.find((a) => !a.startsWith('--'));
  const force = args.includes('--force');
  const allowHindi = args.includes('--allow-hindi');
  const langsArg = args.find((a) => a.startsWith('--langs='));
  const modelArg = args.find((a) => a.startsWith('--model='));
  const speakerArg = args.find((a) => a.startsWith('--speaker='));
  // Default is en,te — Hindi audio is opt-in only (Rule 30f: Hindi stays
  // text-only until a Hindi market exists; every hi clip bills Sarvam credits).
  const langs = (langsArg ? langsArg.split('=')[1].split(',') : ['en', 'te'])
    .map((l) => l.trim())
    .filter((l): l is Lang => l === 'en' || l === 'hi' || l === 'te');
  if (langs.includes('hi') && !allowHindi) {
    console.error(
      '✗ --langs includes "hi" but --allow-hindi was not passed.\n' +
      '  Hindi audio is opt-in (Rule 30f: text-only until a Hindi market exists).\n' +
      '  Re-run with --allow-hindi if you really intend to voice Hindi clips.',
    );
    process.exit(1);
  }
  return {
    conceptId,
    force,
    langs,
    model: modelArg ? modelArg.split('=')[1] : DEFAULT_MODEL,
    speaker: speakerArg ? speakerArg.split('=')[1] : DEFAULT_SPEAKER,
  };
}

// ── Concept loading ──────────────────────────────────────────────────────────
function loadSentences(conceptId: string): TtsSentence[] {
  const path = join(CONCEPTS_DIR, `${conceptId}.json`);
  if (!existsSync(path)) throw new Error(`Concept JSON not found: ${path}`);
  const json = JSON.parse(readFileSync(path, 'utf-8')) as {
    epic_l_path?: { states?: Record<string, { teacher_script?: { tts_sentences?: TtsSentence[] } }> };
  };
  const states = json.epic_l_path?.states ?? {};
  const stateNum = (id: string) => {
    const m = /STATE_(\d+)/.exec(id);
    return m ? parseInt(m[1], 10) : 9999;
  };
  const out: TtsSentence[] = [];
  for (const sid of Object.keys(states).sort((a, b) => stateNum(a) - stateNum(b))) {
    for (const s of states[sid].teacher_script?.tts_sentences ?? []) {
      if (s.id) out.push(s);
    }
  }
  return out;
}

function textFor(s: TtsSentence, lang: Lang): string {
  const v = lang === 'en' ? s.text_en : lang === 'hi' ? s.text_hi : s.text_te;
  return (v ?? '').trim();
}

// ── WAV duration (exact, from the header) ────────────────────────────────────
// Sarvam returns WAV regardless of the requested format, so we read the exact
// duration from the WAV header (reliable) BEFORE transcoding to mp3.
function wavDurationMs(buf: Buffer): number {
  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    return 0;
  }
  let off = 12;
  let byteRate = 0;
  let dataSize = 0;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') byteRate = buf.readUInt32LE(off + 8 + 8); // byteRate = bytes 8-11 of fmt data
    else if (id === 'data') dataSize = size;
    off += 8 + size + (size % 2); // chunks are word-aligned
  }
  if (!byteRate || !dataSize) return 0;
  return Math.round((dataSize / byteRate) * 1000);
}

// ── WAV → MP3 via ffmpeg using TEMP FILES (no stdin/stdout pipes) ─────────────
// Piping buffers through ffmpeg's stdin/stdout fails on Windows under load
// ("spawnSync ffmpeg EOF") after hundreds of spawns. File in/out avoids both
// pipes entirely; retry a few times with a short backoff for transient spawns.
let tmpCounter = 0;
function wavToMp3(wav: Buffer): Buffer {
  const base = join(tmpdir(), `pmtts_${process.pid}_${tmpCounter++}`);
  const wavPath = `${base}.wav`;
  const mp3Path = `${base}.mp3`;
  let lastErr = '';
  try {
    writeFileSync(wavPath, wav);
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = spawnSync(
        'ffmpeg',
        ['-hide_banner', '-loglevel', 'error', '-y', '-i', wavPath,
         '-codec:a', 'libmp3lame', '-q:a', '5', mp3Path],
        { maxBuffer: 16 * 1024 * 1024 },
      );
      if (res.status === 0 && existsSync(mp3Path)) {
        const out = readFileSync(mp3Path);
        if (out.length > 0) return out;
      }
      lastErr = res.stderr?.toString().slice(0, 200) || (res.error ? String(res.error) : 'no output');
    }
  } finally {
    try { unlinkSync(wavPath); } catch { /* ignore */ }
    try { unlinkSync(mp3Path); } catch { /* ignore */ }
  }
  throw new Error(`ffmpeg wav→mp3 failed: ${lastErr}`);
}

// ── Sarvam call (with retry on 429/5xx) ──────────────────────────────────────
async function sarvamTts(
  text: string,
  langCode: string,
  apiKey: string,
  model: string,
  speaker: string,
): Promise<Buffer> {
  const body = JSON.stringify({
    text,
    target_language_code: langCode,
    model,
    speaker,
    pace: PACE,
    speech_sample_rate: SAMPLE_RATE,
    audio_format: 'wav', // Sarvam returns WAV regardless; we transcode to mp3 locally
  });
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt > 0) await sleep(800 * 2 ** attempt);
    let res: Response;
    try {
      res = await fetch(SARVAM_URL, {
        method: 'POST',
        headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(30000), // a stalled request must not freeze the whole batch
      });
    } catch (e) {
      lastErr = e;
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      lastErr = new Error(`Sarvam ${res.status}: ${await safeText(res)}`);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Sarvam ${res.status}: ${await safeText(res)}`);
    }
    const data = (await res.json()) as { audios?: string[] };
    const b64 = data.audios?.[0];
    if (!b64) throw new Error('Sarvam returned no audio');
    return Buffer.from(b64, 'base64');
  }
  throw lastErr instanceof Error ? lastErr : new Error('Sarvam request failed');
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return '<no body>';
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const { conceptId, force, langs, model, speaker } = parseArgs();
  if (!conceptId) {
    console.error('Usage: generate_tts_audio.ts <conceptId> [--force] [--langs=en,te] [--allow-hindi] [--model=] [--speaker=]');
    process.exit(1);
  }
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error('SARVAM_API_KEY not set (expected in .env.local)');

  const sentences = loadSentences(conceptId);
  const audioDir = join(OUT_DIR, conceptId, 'audio');
  mkdirSync(audioDir, { recursive: true });

  console.log(`🔊 ${conceptId}: ${sentences.length} sentences × ${langs.join('/')} = ${sentences.length * langs.length} clips`);
  console.log(`   model=${model} speaker=${speaker} rate=${SAMPLE_RATE} format=mp3\n`);

  // Prior manifest entries (for idempotent skips: an existing mp3 is only reused
  // when its recorded text_hash still matches the CURRENT sentence text — a bare
  // existsSync check is not enough, because the retrofit workflow rewrites
  // sentence text under the same id and the old voice would silently survive).
  const prior: Record<string, ClipEntry> = {};
  const manifestPathExisting = join(OUT_DIR, conceptId, 'audio_manifest.json');
  if (existsSync(manifestPathExisting)) {
    try {
      const prev = JSON.parse(readFileSync(manifestPathExisting, 'utf-8')) as { clips?: Record<string, ClipEntry> };
      for (const [k, c] of Object.entries(prev.clips ?? {})) prior[k] = c;
    } catch { /* ignore */ }
  }

  const clips: Record<string, ClipEntry> = {};
  let written = 0;
  let skippedExisting = 0;
  let skippedMissing = 0;
  let failedClips = 0;
  let staleRefreshed = 0;

  const total = sentences.length * langs.length;
  let done = 0;
  const manifestPath = join(OUT_DIR, conceptId, 'audio_manifest.json');
  // Write the manifest from whatever clips are done SO FAR. Called after every
  // clip so (a) a run that is interrupted or killed still leaves a usable
  // partial manifest, and (b) a re-run (idempotent — existing mp3s are skipped)
  // resumes and finishes cleanly instead of starting from nothing.
  const flushManifest = (): void => {
    const manifest = {
      meta: {
        concept_id: conceptId,
        model,
        speaker,
        sample_rate: SAMPLE_RATE,
        pace: PACE,
        langs,
        sentence_count: sentences.length,
      },
      clips,
    };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  };

  for (const s of sentences) {
    for (const lang of langs) {
      done++;
      const key = `${s.id}_${lang}`;
      const rel = `audio/${key}.mp3`;
      const abs = join(audioDir, `${key}.mp3`);
      const text = textFor(s, lang);
      const tag = `[${done}/${total}] ${key}`;

      if (!text) {
        console.warn(`   ${tag} ⚠ no text_${lang} — skipping`);
        clips[key] = { id: s.id, lang, file: rel, duration_ms: 0, chars: 0, available: false };
        skippedMissing++;
        flushManifest();
        continue;
      }

      // A clip on disk is reusable only if it was voiced from THIS text.
      // Prior manifests without text_hash fall back to char-length equality.
      const hash = textHash(text);
      const p = prior[key];
      const priorMatchesText =
        p != null && (p.text_hash != null ? p.text_hash === hash : p.chars === text.length);

      let duration_ms: number;
      if (existsSync(abs) && !force && priorMatchesText) {
        duration_ms = p?.duration_ms ?? 0;
        skippedExisting++;
        console.log(`   ${tag} ⏭ already on disk`);
      } else {
        if (existsSync(abs) && !force && !priorMatchesText) {
          console.log(`   ${tag} ♻ text changed since clip was voiced — re-fetching`);
          staleRefreshed++;
        }
        try {
          const wav = await sarvamTts(text, LANGS[lang], apiKey, model, speaker); // Sarvam returns WAV
          duration_ms = wavDurationMs(wav);                                       // exact, from WAV header
          writeFileSync(abs, wavToMp3(wav));                                      // transcode to mp3
          written++;
          console.log(`   ${tag} ✓ ${Math.round(duration_ms)}ms`);
        } catch (e) {
          // One bad clip must not abort the whole concept — mark unavailable + continue.
          console.warn(`   ${tag} ⚠ generation FAILED — ${e instanceof Error ? e.message : e}`);
          clips[key] = { id: s.id, lang, file: rel, duration_ms: 0, chars: text.length, available: false };
          failedClips++;
          flushManifest();
          continue;
        }
        await sleep(450); // be polite to the API (rate-limit friendly)
      }
      if (duration_ms === 0) console.warn(`   ${tag} ⚠ could not measure duration`);
      clips[key] = { id: s.id, lang, file: rel, duration_ms, chars: text.length, available: true, text_hash: hash };
      flushManifest(); // incremental: manifest stays current after every clip
    }
  }

  flushManifest(); // final write (the manifest was also kept current after every clip above)

  // Prune orphan mp3s: clips voiced for sentence ids that no longer exist in the
  // concept JSON (states removed/renumbered by a retrofit). Leaving them on disk
  // is harmless to the manifest but misleading to humans inspecting the folder.
  const liveKeys = new Set(sentences.flatMap((s) => (['en', 'hi', 'te'] as const).map((l) => `${s.id}_${l}.mp3`)));
  let pruned = 0;
  for (const f of readdirSync(audioDir)) {
    if (f.endsWith('.mp3') && !liveKeys.has(f)) {
      try { unlinkSync(join(audioDir, f)); pruned++; console.log(`   🗑 pruned orphan ${f}`); } catch { /* ignore */ }
    }
  }

  console.log(`\n✓ ${Object.keys(clips).length} clips in manifest — ${written} written (${staleRefreshed} were stale), ${skippedExisting} skipped (existing), ${skippedMissing} skipped (no text)${failedClips ? `, ${failedClips} FAILED` : ''}${pruned ? `, ${pruned} orphans pruned` : ''}`);
  console.log(`  manifest: ${manifestPath}`);
}

main().catch((err) => {
  console.error('💥 generate_tts_audio failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
