/**
 * Unified provider dispatcher.
 * Selects the right provider handler based on a ModelConfig and calls it.
 * All routes should use these helpers instead of calling providers directly.
 *
 * Features:
 * - Fallback logic: Google → Anthropic, Anthropic → Google, DeepSeek → Anthropic
 * - Usage logging via Supabase for cost tracking and fallback events
 */

import type { ModelConfig } from "@/lib/modelRouter";
import { anthropicGenerate, anthropicStream } from "./providers/anthropicProvider";
import { googleGenerate, googleStream } from "./providers/googleProvider";
import { deepseekGenerate, deepseekStream } from "./providers/deepseekProvider";
import { logUsage } from "./usageLogger";

type Message = { role: string; content: any };

// Fallback configurations for each provider
const GOOGLE_FALLBACK_CONFIG: ModelConfig = {
    provider: "google",
    model: "gemini-2.5-flash",
    costPer1KInput: 0.00010,
    costPer1KOutput: 0.00030,
};

const ANTHROPIC_FALLBACK_CONFIG: ModelConfig = {
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    costPer1KInput: 0.00025,
    costPer1KOutput: 0.00125,
};

/**
 * Get the fallback config for a given provider.
 * Implements fallback chain: Google → Anthropic, Anthropic → Google, DeepSeek → Anthropic
 */
function getFallbackConfig(provider: string): ModelConfig {
    switch (provider) {
        case "google":
        case "deepseek":
            return ANTHROPIC_FALLBACK_CONFIG;
        case "anthropic":
        default:
            return GOOGLE_FALLBACK_CONFIG;
    }
}

/** Stream a chat completion via the correct provider with fallback support. */
export async function dispatchStream(
    config: ModelConfig,
    system: string,
    messages: Message[]
): Promise<Response> {
    try {
        switch (config.provider) {
            case "google":
                return await googleStream(config, system, messages);
            case "deepseek":
                return await deepseekStream(config, system, messages);
            case "anthropic":
            default:
                return await anthropicStream(config, system, messages);
        }
    } catch (err: any) {
        const fallback = getFallbackConfig(config.provider);
        console.error(
            `[dispatcher] ${config.provider}/${config.model} failed, falling back to ${fallback.provider}/${fallback.model}:`,
            err.message
        );

        // Log fallback event
        logUsage({
            taskType: `${config.provider}_fallback`,
            provider: fallback.provider,
            model: fallback.model,
            estimatedCostUsd: 0,
            inputChars: 0,
            outputChars: 0,
            latencyMs: 0,
            wasCacheHit: false,
            metadata: {
                fallback: true,
                original_provider: config.provider,
                original_model: config.model,
                fallback_reason: err.message,
            },
        });

        // Call fallback provider (no recursive retry)
        switch (fallback.provider) {
            case "google":
                return await googleStream(fallback, system, messages);
            case "anthropic":
            default:
                return await anthropicStream(fallback, system, messages);
        }
    }
}

/** Generate a single text completion via the correct provider with fallback support. */
export async function dispatchGenerate(
    config: ModelConfig,
    system: string,
    prompt: string,
    maxTokens = 800
): Promise<{ text: string; outputChars: number }> {
    try {
        switch (config.provider) {
            case "google":
                return await googleGenerate(config, system, prompt, maxTokens);
            case "deepseek":
                return await deepseekGenerate(config, system, prompt, maxTokens);
            case "anthropic":
            default:
                return await anthropicGenerate(config, system, prompt, maxTokens);
        }
    } catch (err: any) {
        const fallback = getFallbackConfig(config.provider);
        console.error(
            `[dispatcher] ${config.provider}/${config.model} failed, falling back to ${fallback.provider}/${fallback.model}:`,
            err.message
        );

        // Log fallback event
        logUsage({
            taskType: `${config.provider}_fallback`,
            provider: fallback.provider,
            model: fallback.model,
            estimatedCostUsd: 0,
            inputChars: 0,
            outputChars: 0,
            latencyMs: 0,
            wasCacheHit: false,
            metadata: {
                fallback: true,
                original_provider: config.provider,
                original_model: config.model,
                fallback_reason: err.message,
            },
        });

        // Call fallback provider (no recursive retry)
        switch (fallback.provider) {
            case "google":
                return await googleGenerate(fallback, system, prompt, maxTokens);
            case "anthropic":
            default:
                return await anthropicGenerate(fallback, system, prompt, maxTokens);
        }
    }
}
