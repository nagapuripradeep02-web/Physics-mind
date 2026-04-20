/**
 * Google Gemini provider handler via @ai-sdk/google.
 * Falls back to Anthropic Claude Haiku if GOOGLE_AI_API_KEY is not set,
 * so the app works even with only the Anthropic key.
 */

import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import type { ModelConfig } from "@/lib/modelRouter";
import { anthropicGenerate, anthropicStream } from "./anthropicProvider";

const FALLBACK_CONFIG: ModelConfig = {
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    costPer1KInput: 0.00025,
    costPer1KOutput: 0.00125,
};

function hasGoogleKey(): boolean {
    return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

type Message = { role: string; content: any };

/** Stream a chat response using Google Gemini (or Anthropic fallback). */
export async function googleStream(
    config: ModelConfig,
    system: string,
    messages: Message[]
) {
    if (!hasGoogleKey()) {
        console.warn("[googleProvider] No GOOGLE_GENERATIVE_AI_API_KEY — falling back to Anthropic.");
        return anthropicStream(FALLBACK_CONFIG, system, messages);
    }

    try {
        const result = await streamText({
            model: google(config.model as any),
            system,
            messages: messages as any,
        });
        return result.toTextStreamResponse();
    } catch (err: any) {
        console.warn("[googleProvider] Runtime error — falling back to Anthropic:", err.message);
        throw err;
    }
}

/** Generate a single non-streaming text completion using Gemini (or fallback). */
export async function googleGenerate(
    config: ModelConfig,
    system: string,
    prompt: string,
    maxTokens = 800
): Promise<{ text: string; outputChars: number }> {
    if (!hasGoogleKey()) {
        console.warn("[googleProvider] No GOOGLE_GENERATIVE_AI_API_KEY — falling back to Anthropic.");
        return anthropicGenerate(FALLBACK_CONFIG, system, prompt, maxTokens);
    }

    try {
        const { text } = await generateText({
            model: google(config.model as any),
            system,
            prompt,
            maxOutputTokens: maxTokens,
        });
        return { text, outputChars: text.length };
    } catch (err: any) {
        console.warn("[googleProvider] Runtime error — falling back to Anthropic:", err.message);
        throw err;
    }
}
