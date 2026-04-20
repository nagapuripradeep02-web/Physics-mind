import { selectModel, estimateCost } from "@/lib/modelRouter";
import { dispatchGenerate } from "@/lib/dispatcher";
import { logUsage } from "@/lib/usageLogger";

export async function POST(req: Request) {
    const startTime = Date.now();
    try {
        const { conceptName, conceptClass, conceptSubject } = await req.json();

        const prompt = `You are a physics tutor. Give a student-friendly refresher for the concept "${conceptName}" from Class ${conceptClass} ${conceptSubject}.

Format your response in exactly 4 short lines:
Line 1: One-line intuitive analogy (real-world comparison)
Line 2: The core definition in simple words
Line 3: The key formula or rule (use plain text notation)
Line 4: One quick memory tip or common mistake to avoid

Keep each line under 20 words. No headers. Just 4 plain lines.`;

        const config = selectModel("concept_tag");
        const { text, outputChars } = await dispatchGenerate(config, "", prompt, 200);

        logUsage({
            taskType: "concept_tag",
            provider: config.provider,
            model: config.model,
            estimatedCostUsd: estimateCost(config, prompt.length, outputChars),
            inputChars: prompt.length,
            outputChars,
            latencyMs: Date.now() - startTime,
            wasCacheHit: false,
        });

        return Response.json({ explanation: text });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return Response.json({ error: message }, { status: 500 });
    }
}

