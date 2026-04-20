/**
 * Two-layer Vision fallback.
 * When Flash Vision returns confidence < 0.85, Sonnet Vision cross-checks
 * the same image to confirm or correct the extraction before the pipeline continues.
 */

import { anthropic as anthropicProvider } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export interface SonnetVisionResult {
    confirmed: boolean;
    correctedExtraction?: Record<string, unknown>;
    combinedConfidence: number;
}

export async function runSonnetVisionFallback(
    imageBase64: string,
    imageMediaType: string,
    flashExtraction: object
): Promise<SonnetVisionResult> {
    const prompt = `Flash Vision extracted this from a student's physics image:
${JSON.stringify(flashExtraction, null, 2)}

Look at the image yourself. Do you agree with this extraction?
- Is the concept_id correct?
- Is the source_type (ncert/non_ncert) correct?
- Is the diagram description accurate?

Reply ONLY with this JSON:
{
  "agree": true or false,
  "concept_id": "your assessment",
  "source_type": "ncert or non_ncert",
  "corrections": "what you changed if anything, or null",
  "combined_confidence": 0.0-1.0
}`;

    try {
        const { text } = await generateText({
            model: anthropicProvider("claude-sonnet-4-6"),
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "image", image: `data:${imageMediaType};base64,${imageBase64}` },
                        { type: "text", text: prompt },
                    ],
                },
            ],
            maxOutputTokens: 300,
        });

        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const confirmed = parsed.agree === true;
        const combinedConfidence = typeof parsed.combined_confidence === 'number'
            ? parsed.combined_confidence
            : 0.5;

        if (!confirmed) {
            return {
                confirmed: false,
                correctedExtraction: {
                    concept_id: parsed.concept_id,
                    source_type: parsed.source_type,
                    corrections: parsed.corrections,
                },
                combinedConfidence,
            };
        }

        return { confirmed: true, combinedConfidence };
    } catch (err) {
        console.error("[sonnetVision] Fallback failed:", err);
        // On error, trust Flash — don't block the pipeline
        return { confirmed: true, combinedConfidence: 0.5 };
    }
}
