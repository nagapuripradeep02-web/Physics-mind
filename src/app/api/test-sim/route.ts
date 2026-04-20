// TEMPORARY TEST ENDPOINT — delete after Task 2b review
// No auth required so we can test the pipeline directly
import { generateSimulationBrief, generatePhysicsConfig } from "@/lib/aiSimulationGenerator";
import type { StudentContext } from "@/lib/aiSimulationGenerator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { question, concept, classLevel = "12", mode = "conceptual" } = await req.json();
    if (!question && !concept) return NextResponse.json({ error: "need question or concept" }, { status: 400 });

    const ctx: StudentContext = {
        question: question || concept,
        concept: concept || question,
        classLevel,
        mode,
    };

    console.log("\n\n[TEST] ▶️ Testing pipeline for:", ctx.concept);
    const brief = await generateSimulationBrief(ctx);
    const config = await generatePhysicsConfig(brief);

    return NextResponse.json({ brief, config });
}
