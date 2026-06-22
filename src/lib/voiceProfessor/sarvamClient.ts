/**
 * Sarvam voice API wrappers — SERVER-SIDE ONLY (the SARVAM_API_KEY never reaches
 * the browser). STT = saaras:v3 speech-to-text; TTS = bulbul:v3 text-to-speech.
 * Auth header: api-subscription-key. Endpoints verified against docs.sarvam.ai.
 */

const SARVAM_BASE = "https://api.sarvam.ai";
const STT_MODEL = "saaras:v3";
const TTS_MODEL = "bulbul:v3";
const DEFAULT_LANGUAGE = "en-IN";
// bulbul:v3 speaker (docs list shubh/priya/roopa). Override via SARVAM_SPEAKER;
// verified empirically against the account's available voices at build time.
const DEFAULT_SPEAKER = process.env.SARVAM_SPEAKER ?? "priya";
const MAX_TTS_CHARS = 2500;

export function sarvamConfigured(): boolean {
    return Boolean(process.env.SARVAM_API_KEY);
}

function apiKey(): string {
    const key = process.env.SARVAM_API_KEY;
    if (!key) throw new Error("sarvam_unconfigured");
    return key;
}

export interface SttResult {
    transcript: string;
    languageCode: string | null;
}

export async function sttFromAudio(file: Blob, languageCode?: string): Promise<SttResult> {
    const form = new FormData();
    // Client sends a WAV blob (Sarvam STT rejects webm/opus — only mp3/wav/pcm).
    form.append("file", file, "audio.wav");
    form.append("model", STT_MODEL);
    if (languageCode) form.append("language_code", languageCode);

    const res = await fetch(`${SARVAM_BASE}/speech-to-text`, {
        method: "POST",
        headers: { "api-subscription-key": apiKey() },
        body: form,
    });
    if (!res.ok) {
        throw new Error(`sarvam_stt_${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const data = (await res.json()) as { transcript?: string; language_code?: string };
    return { transcript: data.transcript ?? "", languageCode: data.language_code ?? null };
}

export interface TtsResult {
    audioBase64: string;
}

export async function ttsFromText(
    text: string,
    opts?: { languageCode?: string; speaker?: string },
): Promise<TtsResult> {
    const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
        method: "POST",
        headers: { "api-subscription-key": apiKey(), "content-type": "application/json" },
        body: JSON.stringify({
            text: text.slice(0, MAX_TTS_CHARS),
            target_language_code: opts?.languageCode ?? DEFAULT_LANGUAGE,
            speaker: opts?.speaker ?? DEFAULT_SPEAKER,
            model: TTS_MODEL,
        }),
    });
    if (!res.ok) {
        throw new Error(`sarvam_tts_${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const data = (await res.json()) as { audios?: string[] };
    const audioBase64 = data.audios?.[0] ?? "";
    if (!audioBase64) throw new Error("sarvam_tts_empty");
    return { audioBase64 };
}

// ── Cost estimation (Sarvam published rates, 2026) ──────────────────────────
// TTS bulbul:v3 = ₹30 / 10,000 chars; STT saaras = ₹30 / hour of audio.
// Logged in USD (consistent with ai_usage_log.estimated_cost_usd). The ₹→$ rate
// floats — override SARVAM_INR_PER_USD env to re-baseline without a code change.
const INR_PER_USD = Number(process.env.SARVAM_INR_PER_USD) || 85;
const TTS_INR_PER_CHAR = 30 / 10000;   // ₹0.003 / character
const STT_INR_PER_SECOND = 30 / 3600;  // ₹0.008333 / second of audio

/** Estimated USD cost of synthesizing `chars` characters with bulbul:v3. */
export function ttsCostUsd(chars: number): number {
    return (Math.max(0, chars) * TTS_INR_PER_CHAR) / INR_PER_USD;
}

/** Estimated USD cost of transcribing `seconds` of audio with saaras. */
export function sttCostUsd(seconds: number): number {
    return (Math.max(0, seconds) * STT_INR_PER_SECOND) / INR_PER_USD;
}

/** Audio seconds for a 16 kHz mono 16-bit PCM WAV, from its byte size
 *  (the client always encodes this format — see encodeWav). 32000 bytes/sec. */
export function wavSeconds(byteLength: number): number {
    return Math.max(0, byteLength - 44) / 32000;
}
