/**
 * Provider handlers — each returns a uniform { stream, outputStream } pair
 * so the API routes never need to know which model is running underneath.
 *
 * Anthropic handler (claude-* models via @ai-sdk/anthropic + Vercel AI SDK)
 */

import { anthropic as anthropicProvider } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";
import type { ModelConfig } from "@/lib/modelRouter";

type Message = { role: string; content: any };

/** Stream a chat response using Anthropic. */
export async function anthropicStream(
    config: ModelConfig,
    system: string,
    messages: Message[]
) {
    try {
        const result = await streamText({
            model: anthropicProvider(config.model as any),
            system,
            messages: messages as any,
        });
        return result.toTextStreamResponse();
    } catch (err: any) {
        console.warn("[anthropicProvider] Runtime error:", err.message);
        throw err;
    }
}

/** Generate a single non-streaming text completion using Anthropic. */
export async function anthropicGenerate(
    config: ModelConfig,
    system: string,
    prompt: string,
    maxTokens = 800
): Promise<{ text: string; outputChars: number }> {
    try {
        const { text } = await generateText({
            model: anthropicProvider(config.model as any),
            system,
            prompt,
            maxOutputTokens: maxTokens,
        });
        return { text, outputChars: text.length };
    } catch (err: any) {
        console.warn("[anthropicProvider] Runtime error:", err.message);
        throw err;
    }
}
