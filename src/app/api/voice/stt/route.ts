/**
 * POST /api/voice/stt — Sarvam speech-to-text proxy (key stays server-side).
 * Request:  multipart/form-data with an `audio` file (+ optional language_code).
 * Response: { transcript, language_code }  (Sarvam saaras:v3)
 * Returns 503 { error:"stt_unconfigured" } when SARVAM_API_KEY is absent.
 */

import { NextRequest, NextResponse } from "next/server";
import { sttFromAudio, sarvamConfigured, sttCostUsd, wavSeconds } from "@/lib/voiceProfessor/sarvamClient";
import { logUsage } from "@/lib/usageLogger";

const ACTORS = new Set(["founder_test", "student", "reviewer"]);
function asActor(v: unknown): "founder_test" | "student" | "reviewer" {
    return typeof v === "string" && ACTORS.has(v) ? (v as "founder_test" | "student" | "reviewer") : "founder_test";
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    try {
        if (!sarvamConfigured()) {
            return NextResponse.json({ error: "stt_unconfigured" }, { status: 503 });
        }
        const form = await req.formData();
        const file = form.get("audio");
        if (!(file instanceof Blob)) {
            return NextResponse.json({ error: "audio file is required" }, { status: 400 });
        }
        const langField = form.get("language_code");
        const languageCode = typeof langField === "string" ? langField : undefined;
        const actor = asActor(form.get("actor"));
        const sessionField = form.get("session_id");
        const sessionId = typeof sessionField === "string" ? sessionField : undefined;
        const audioSeconds = wavSeconds(file.size);

        const { transcript, languageCode: detected } = await sttFromAudio(file, languageCode);

        logUsage({
            sessionId,
            taskType: "voice_stt",
            provider: "sarvam",
            model: "saaras:v3",
            inputChars: 0,
            outputChars: transcript.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: sttCostUsd(audioSeconds),
            wasCacheHit: false,
            actor,
            metadata: { detected, audio_seconds: Math.round(audioSeconds * 100) / 100 },
        });

        return NextResponse.json({ transcript, language_code: detected });
    } catch (err) {
        console.error("[voice/stt] EXCEPTION:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "stt_failed" },
            { status: 502 }
        );
    }
}
