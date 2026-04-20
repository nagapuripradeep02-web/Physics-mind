import { generateLesson } from "@/lib/teacherEngine";
import { classifyQuestion } from "@/lib/intentClassifier";
import { NextRequest, NextResponse } from "next/server";

/** Extract a human-readable simulation values string from a circuit/wire SimConfig. */
function extractSimValues(simConfig: Record<string, unknown> | null | undefined): string {
    if (!simConfig) return "";
    const parts: string[] = [];
    if (typeof simConfig.emf === "number")         parts.push(`battery EMF = ${simConfig.emf} V`);
    if (typeof simConfig.battery === "number")     parts.push(`battery = ${simConfig.battery} V`);
    if (typeof simConfig.voltage === "number")     parts.push(`voltage = ${simConfig.voltage} V`);
    if (typeof simConfig.r1 === "number")          parts.push(`R1 = ${simConfig.r1} Ω`);
    if (typeof simConfig.r2 === "number")          parts.push(`R2 = ${simConfig.r2} Ω`);
    if (typeof simConfig.r3 === "number")          parts.push(`R3 = ${simConfig.r3} Ω`);
    if (typeof simConfig.resistance === "number")  parts.push(`R = ${simConfig.resistance} Ω`);
    if (typeof simConfig.current === "number")     parts.push(`I = ${simConfig.current} A`);
    if (typeof simConfig.length === "number")      parts.push(`length = ${simConfig.length} m`);
    if (typeof simConfig.area === "number")        parts.push(`area = ${simConfig.area} m²`);
    if (typeof simConfig.capacitance === "number") parts.push(`C = ${simConfig.capacitance} F`);
    if (typeof simConfig.charge === "number")      parts.push(`Q = ${simConfig.charge} C`);
    return parts.join(", ");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, mode, classLevel, fingerprintKey, mvsContext, simConfig } = body as {
            question?: string;
            mode?: string;
            classLevel?: string;
            fingerprintKey?: string;  // passed from frontend after chat response
            mvsContext?: string;
            simConfig?: Record<string, unknown>;
        };

        if (!question || typeof question !== "string") {
            return NextResponse.json(
                { error: "Missing required field: question" },
                { status: 400 }
            );
        }

        const modeToUse = mode ?? "conceptual";
        const classLevelToUse = classLevel ?? "12";

        console.log('[generate-lesson] MODE:', modeToUse, '| fingerprintKey:', fingerprintKey?.slice(0, 60) ?? "none");

        // FIX D: When fingerprintKey exists, build fingerprint from it — don't re-classify raw text
        let fingerprint: Awaited<ReturnType<typeof classifyQuestion>> | null = null;

        if (fingerprintKey) {
            const [fp_concept_id, fp_intent, fp_class_level, fp_mode, fp_aspect] = fingerprintKey.split('|');
            fingerprint = {
                concept_id: fp_concept_id,
                intent: fp_intent,
                class_level: fp_class_level,
                mode: fp_mode,
                aspect: fp_aspect,
                confidence: 1.0,
                cache_key: fingerprintKey,
            } as any;
            console.log('[generate-lesson] Using fingerprintKey-derived fingerprint:', fp_concept_id);
        } else {
            fingerprint = await classifyQuestion(question, classLevelToUse, modeToUse).catch(() => null);
        }

        const simulationValues = extractSimValues(simConfig);
        const lesson = await generateLesson(
            question,
            modeToUse,
            classLevelToUse,
            fingerprint ?? undefined,
            mvsContext,
            simulationValues || undefined
        );

        return NextResponse.json({ lesson });
    } catch (err) {
        console.error("[/api/generate-lesson] error:", err);
        return NextResponse.json({ lesson: null }, { status: 500 });
    }
}
