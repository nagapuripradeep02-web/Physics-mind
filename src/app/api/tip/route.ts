import { selectModel, estimateCost } from "@/lib/modelRouter";
import { dispatchGenerate } from "@/lib/dispatcher";
import { logUsage } from "@/lib/usageLogger";

const SYSTEM = `You are a physics lab guide. Given a physics explanation, write a concise 2-3 line tip (max 45 words) telling a student exactly what to adjust and observe in a circuit simulation. Be specific: name controls to change (e.g. "increase resistance slider") and behaviors to watch. No intro phrases like "Look for" or "In this simulation".`;

export async function POST(req: Request) {
    const startTime = Date.now();
    try {
        const { content } = await req.json();
        const config = selectModel("simulation_tip");
        const { text, outputChars } = await dispatchGenerate(config, SYSTEM, content, 120);

        logUsage({
            taskType: "simulation_tip",
            provider: config.provider,
            model: config.model,
            estimatedCostUsd: estimateCost(config, content.length + SYSTEM.length, outputChars),
            inputChars: content.length,
            outputChars,
            latencyMs: Date.now() - startTime,
            wasCacheHit: false,
        });

        return Response.json({ tip: text });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

