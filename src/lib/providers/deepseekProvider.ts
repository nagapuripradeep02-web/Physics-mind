/**
 * DeepSeek provider handler via OpenAI-compatible REST API.
 * Falls back to Anthropic Claude Haiku if DEEPSEEK_API_KEY is not set.
 *
 * DeepSeek exposes an OpenAI-compatible endpoint at https://api.deepseek.com/v1
 */

import type { ModelConfig } from "@/lib/modelRouter";
import { anthropicGenerate, anthropicStream } from "./anthropicProvider";

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

const FALLBACK_CONFIG: ModelConfig = {
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    costPer1KInput: 0.00025,
    costPer1KOutput: 0.00125,
};

function hasDeepSeekKey(): boolean {
    return !!process.env.DEEPSEEK_API_KEY;
}

type DeepSeekMessage = { role: string; content: string };

/**
 * Non-streaming completion via DeepSeek (text generation only).
 * DeepSeek streaming requires SSE parsing; for simplicity we use non-stream here.
 * Falls back to Anthropic if key is missing.
 */
export async function deepseekGenerate(
    config: ModelConfig,
    system: string,
    prompt: string,
    maxTokens = 1000
): Promise<{ text: string; outputChars: number }> {
    if (!hasDeepSeekKey()) {
        console.warn("[deepseekProvider] No DEEPSEEK_API_KEY — falling back to Anthropic.");
        return anthropicGenerate(FALLBACK_CONFIG, system, prompt, maxTokens);
    }

    const messages: DeepSeekMessage[] = [
        { role: "system", content: system },
        { role: "user", content: prompt },
    ];

    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages,
            max_tokens: maxTokens,
            stream: false,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`DeepSeek API error ${res.status}: ${err}`);
    }

    const json = await res.json();
    const text: string = json.choices?.[0]?.message?.content ?? "";
    return { text, outputChars: text.length };
}

/**
 * For streaming use-cases DeepSeek falls back to Anthropic so that the
 * streaming response format is identical from the frontend's perspective.
 */
export async function deepseekStream(
    config: ModelConfig,
    system: string,
    messages: { role: string; content: any }[]
) {
    if (!hasDeepSeekKey()) {
        console.warn("[deepseekProvider] No DEEPSEEK_API_KEY — falling back to Anthropic.");
        return anthropicStream(FALLBACK_CONFIG, system, messages);
    }

    // Build SSE stream manually since DeepSeek's API is OpenAI-compatible
    const body = {
        model: config.model,
        messages: [
            { role: "system", content: system },
            ...messages.map((m) => ({
                role: m.role,
                content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
            })),
        ],
        stream: true,
    };

    const upstream = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(body),
    });

    if (!upstream.ok) {
        // Fallback on API error
        console.warn("[deepseekProvider] DeepSeek API error — falling back to Anthropic.");
        return anthropicStream(FALLBACK_CONFIG, system, messages);
    }

    // Pass through the DeepSeek SSE stream directly
    return new Response(upstream.body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
