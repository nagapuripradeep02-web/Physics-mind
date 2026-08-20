/**
 * sarvamStt.ts — Sarvam speech-to-text for the Answer Book recall check.
 * SERVER-SIDE ONLY: SARVAM_API_KEY never reaches the browser.
 *
 * Ported from `feat/voice-professor-generalize:src/lib/voiceProfessor/sarvamClient.ts`
 * (endpoint, auth header and multipart field names verified there), with the
 * retry/backoff/timeout discipline from `src/scripts/generate_tts_audio.ts` L258-303
 * grafted on — the voice-branch original has neither.
 *
 * The client sends WAV. Sarvam STT rejects webm/opus (MediaRecorder's default), which
 * is why the browser records raw PCM and encodes a RIFF header by hand.
 *
 * `language_code` is deliberately OMITTED so Sarvam auto-detects: students revise in
 * code-mixed English + Telugu ("first statement raastha, tarvata diagram"). All
 * feedback we render is English (Rule 30i governs shipped output, not what we accept).
 */

const SARVAM_BASE = 'https://api.sarvam.ai';
const STT_MODEL = 'saaras:v3';
const MAX_ATTEMPTS = 4;
const TIMEOUT_MS = 30000;
/** Sarvam STT list price ≈ ₹30 per hour of audio. */
const INR_PER_AUDIO_HOUR = 30;
const INR_PER_USD = Number(process.env.SARVAM_INR_PER_USD) || 88;

export interface SttResult {
    transcript: string;
    languageCode: string | null;
    audioSeconds: number;
    costUsd: number;
}

export function sarvamConfigured(): boolean {
    return Boolean(process.env.SARVAM_API_KEY);
}

/** 16 kHz mono 16-bit WAV → seconds. 44-byte header, 2 bytes/sample. */
export function wavSeconds(byteLength: number): number {
    return Math.max(0, (byteLength - 44) / 32000);
}

export function sttCostUsd(seconds: number): number {
    return (seconds / 3600) * (INR_PER_AUDIO_HOUR / INR_PER_USD);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sttFromAudio(file: Blob): Promise<SttResult> {
    const key = process.env.SARVAM_API_KEY;
    if (!key) throw new Error('stt_unconfigured');

    const seconds = wavSeconds(file.size);
    let lastErr: unknown = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (attempt > 0) await sleep(800 * 2 ** attempt);

        const form = new FormData();
        form.append('file', file, 'audio.wav');
        form.append('model', STT_MODEL);

        let res: Response;
        try {
            res = await fetch(`${SARVAM_BASE}/speech-to-text`, {
                method: 'POST',
                // No content-type — FormData sets the multipart boundary itself.
                headers: { 'api-subscription-key': key },
                body: form,
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
        } catch (e) {
            lastErr = e; // network error or timeout — retry
            continue;
        }

        if (res.status === 429 || res.status >= 500) {
            lastErr = new Error(`sarvam_stt_${res.status}`);
            continue; // transient — retry
        }
        if (!res.ok) {
            // 4xx: fail fast, it will not get better.
            throw new Error(`sarvam_stt_${res.status}: ${(await res.text()).slice(0, 200)}`);
        }

        const data = (await res.json()) as { transcript?: string; language_code?: string };
        return {
            transcript: data.transcript ?? '',
            languageCode: data.language_code ?? null,
            audioSeconds: seconds,
            costUsd: sttCostUsd(seconds),
        };
    }

    throw lastErr instanceof Error ? lastErr : new Error('sarvam_stt_failed');
}
