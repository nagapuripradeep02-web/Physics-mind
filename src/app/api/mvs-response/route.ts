import { type NextRequest, NextResponse } from "next/server";
import { logUsage } from "@/lib/usageLogger";
import { explainConceptual } from "@/lib/teacherEngine";
import type { QuestionFingerprint } from "@/lib/intentClassifier";

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const userId = req.headers.get("x-user-id") ?? req.headers.get("authorization") ?? "anonymous";

    try {
        const body = await req.json();
        const {
            userResponse,          // "YES" or "NO"
            originalQuestion,      // The student's text
            misconception,         // The misconception detection result
            fingerprint,           // The fingerprint object
            profile,
        } = body;

        if (!userResponse || !originalQuestion || !misconception) {
            return NextResponse.json({ error: "Missing MVS data" }, { status: 400 });
        }

        const classLevel = (profile?.class as string | undefined)?.replace("Class ", "") ?? "12";
        const fp = fingerprint as QuestionFingerprint | undefined;

        console.log(`[mvs-response] user said ${userResponse} to misconception ${misconception.misconception_id}`);

        let contextToGrok = originalQuestion;

        if (userResponse === "YES") {
            // Student confirmed the misconception
            // Prepend the context to force the AI to address it head on
            contextToGrok = `[SYSTEM NOTE: The student has confirmed they have the following misconception: "${misconception.correct_mental_model}". You must explicitly correct this right at the start of your explanation.]\n\nStudent question: ${originalQuestion}`;
        } else {
            // Student denied it, proceed normally but maybe log it
            contextToGrok = originalQuestion;
        }

        const result = await explainConceptual(contextToGrok, classLevel, fp);

        logUsage({
            sessionId: userId,
            taskType: "chat_response",
            provider: "google",
            model: "gemini-2.5-flash",
            inputChars: contextToGrok.length,
            outputChars: result.explanation.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: 0,
            wasCacheHit: false,
            fingerprintKey: fp?.cache_key,
            metadata: {
                tier: 3,
                section: "conceptual",
                ncertChunks: result.ncertSources.length,
                mvsTriggered: true,
                mvsConfirmed: userResponse === "YES",
                mvsId: misconception.misconception_id,
            },
        });

        return NextResponse.json({
            explanation: result.explanation,
            ncertSources: result.ncertSources,
            usage: {
                tokens: Math.round(result.explanation.length / 4),
                ncertChunks: result.ncertSources.length,
                cost: 0,
            },
            mvsConfirmed: userResponse === "YES"
        });

    } catch (err) {
        console.error("[mvs-response] error:", err);
        return NextResponse.json({ error: "MVS processing failed" }, { status: 500 });
    }
}
