/**
 * POST /api/voice/tts — Sarvam text-to-speech proxy (key stays server-side).
 * Request:  { text, language_code?, speaker? }
 * Response: { audio_base64 }  (base64 WAV from Sarvam bulbul:v3)
 * Returns 503 { error:"tts_unconfigured" } when SARVAM_API_KEY is absent so the
 * client can fall back to browser Web Speech.
 */

import { NextRequest, NextResponse } from "next/server";
import { ttsFromText, sarvamConfigured, ttsCostUsd } from "@/lib/voiceProfessor/sarvamClient";
import { logUsage } from "@/lib/usageLogger";

const ACTORS = new Set(["founder_test", "student", "reviewer"]);
function asActor(v: unknown): "founder_test" | "student" | "reviewer" {
    return typeof v === "string" && ACTORS.has(v) ? (v as "founder_test" | "student" | "reviewer") : "founder_test";
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    try {
        if (!sarvamConfigured()) {
            return NextResponse.json({ error: "tts_unconfigured" }, { status: 503 });
        }
        const body = await req.json();
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!text) {
            return NextResponse.json({ error: "text is required" }, { status: 400 });
        }
        const languageCode = typeof body.language_code === "string" ? body.language_code : undefined;
        const speaker = typeof body.speaker === "string" ? body.speaker : undefined;
        const actor = asActor(body.actor);
        const sessionId = typeof body.session_id === "string" ? body.session_id : undefined;

        const { audioBase64 } = await ttsFromText(text, { languageCode, speaker });

        logUsage({
            sessionId,
            taskType: "voice_tts",
            provider: "sarvam",
            model: "bulbul:v3",
            inputChars: text.length,
            outputChars: audioBase64.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: ttsCostUsd(text.length),
            wasCacheHit: false,
            actor,
            metadata: { chars: text.length },
        });

        return NextResponse.json({ audio_base64: audioBase64 });
    } catch (err) {
        console.error("[voice/tts] EXCEPTION:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "tts_failed" },
            { status: 502 }
        );
    }
}
