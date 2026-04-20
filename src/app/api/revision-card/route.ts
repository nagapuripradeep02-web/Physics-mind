/**
 * POST /api/revision-card
 * Generates a 5-minute revision summary card from the last N chat messages.
 * Returns: { card: string }
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: "No messages provided" }, { status: 400 });
        }

        // Build a compact transcript of the conversation
        const transcript = messages
            .slice(-8) // Last 8 messages max
            .map((m: { role: string; content: string }) =>
                `${m.role === "user" ? "Student" : "Teacher"}: ${(m.content ?? "").slice(0, 300)}`
            )
            .join("\n");

        const prompt = `You are a physics teacher creating a quick revision card for a student.

Based on this conversation:
${transcript}

Write a concise 5-minute revision card that covers:
1. The key concept discussed (1 sentence)
2. The core formula or idea (in plain text, e.g. V = IR)
3. 2-3 bullet points of what to remember
4. 1 common mistake to avoid
5. A one-line memory trick if applicable

Format it as plain text with clear sections. Keep it short — max 150 words total. No markdown headers.`;

        const result = await generateText({
            model: google('gemini-2.5-flash'),
            prompt,
            temperature: 0.1,
        });

        return Response.json({ card: result.text.trim() });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[revision-card] Error:", message);
        return Response.json({ error: message }, { status: 500 });
    }
}
