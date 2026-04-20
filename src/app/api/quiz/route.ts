import { selectModel, estimateCost } from "@/lib/modelRouter";
import { dispatchGenerate } from "@/lib/dispatcher";
import { logUsage } from "@/lib/usageLogger";

export async function POST(req: Request) {
    const startTime = Date.now();
    try {
        const { messages, previousQuestion } = await req.json();

        const context = (messages as { role: string; content: string }[])
            .slice(-12)
            .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
            .join("\n");

        const avoidClause = previousQuestion
            ? `\n\nDo NOT repeat or rephrase this question: "${previousQuestion}"`
            : "";

        const system = `You are a physics assessment expert. Generate one MCQ that tests genuine conceptual understanding based on the tutoring conversation provided.

Return ONLY a valid JSON object in this exact format, no markdown, no extra text:
{
  "question": "A clear, specific question about the concept discussed",
  "options": {
    "A": "option text",
    "B": "option text",
    "C": "option text",
    "D": "option text"
  },
  "correct": "B",
  "explanation": "2-sentence explanation of why this answer is correct and what it reveals about the concept.",
  "misconception": "1-sentence description of the specific misconception a student makes when choosing the wrong option."
}

Rules:
- Base the question strictly on what was discussed in the conversation.
- Make wrong options plausible — they should reflect common student misconceptions.
- The correct answer should not always be the same letter.${avoidClause}`;

        const prompt = `Tutoring conversation:\n\n${context}`;
        const config = selectModel("diagnostic_quiz");
        const { text, outputChars } = await dispatchGenerate(config, system, prompt, 500);

        logUsage({
            taskType: "diagnostic_quiz",
            provider: config.provider,
            model: config.model,
            estimatedCostUsd: estimateCost(config, system.length + prompt.length, outputChars),
            inputChars: system.length + prompt.length,
            outputChars,
            latencyMs: Date.now() - startTime,
            wasCacheHit: false,
        });

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Model returned invalid JSON");

        return Response.json(JSON.parse(jsonMatch[0]));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Quiz API error:", message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

