/**
 * Model Router — maps task types to optimal providers/models.
 * Add new task types here; providers are in /lib/providers/*.ts
 */

export type TaskType =
    | "simple_chat"
    | "concept_explanation"
    | "mcq_generation"
    | "concept_tag"
    | "complex_problem"
    | "image_analysis"
    | "animation_generation"
    | "simulation_tip"
    | "diagnostic_quiz";

export type Provider = "anthropic" | "google" | "deepseek";

export interface ModelConfig {
    provider: Provider;
    model: string;
    /** Estimated cost per 1K input tokens in USD */
    costPer1KInput: number;
    /** Estimated cost per 1K output tokens in USD */
    costPer1KOutput: number;
}

const MODEL_REGISTRY: Record<TaskType, ModelConfig> = {
    simple_chat: {
        provider: "google",
        model: "gemini-2.5-flash",
        costPer1KInput: 0.00010,
        costPer1KOutput: 0.00030,
    },
    concept_explanation: {
        provider: "google",
        model: "gemini-2.5-flash",
        costPer1KInput: 0.00010,
        costPer1KOutput: 0.00030,
    },
    mcq_generation: {
        provider: "google",
        model: "gemini-2.5-flash",
        costPer1KInput: 0.00010,
        costPer1KOutput: 0.00030,
    },
    diagnostic_quiz: {
        provider: "google",
        model: "gemini-2.5-flash",
        costPer1KInput: 0.00010,
        costPer1KOutput: 0.00030,
    },
    concept_tag: {
        provider: "google",
        model: "gemini-2.5-flash",
        costPer1KInput: 0.00010,
        costPer1KOutput: 0.00030,
    },
    simulation_tip: {
        provider: "google",
        model: "gemini-2.5-flash",
        costPer1KInput: 0.00010,
        costPer1KOutput: 0.00030,
    },
    complex_problem: {
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        costPer1KInput: 0.00300,
        costPer1KOutput: 0.01500,
    },
    image_analysis: {
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        costPer1KInput: 0.00300,
        costPer1KOutput: 0.01500,
    },
    animation_generation: {
        provider: "deepseek",
        model: "deepseek-chat",
        costPer1KInput: 0.00014,
        costPer1KOutput: 0.00028,
    },
};

export function selectModel(taskType: TaskType): ModelConfig {
    return MODEL_REGISTRY[taskType] ?? MODEL_REGISTRY.concept_explanation;
}

/**
 * Detects the appropriate task type based on request context.
 */
export function detectTaskType(opts: {
    hasImages?: boolean;
    isComplex?: boolean;
    taskHint?: TaskType;
}): TaskType {
    if (opts.taskHint) return opts.taskHint;
    if (opts.hasImages) return "image_analysis";
    if (opts.isComplex) return "complex_problem";
    return "concept_explanation";
}

/**
 * Rough token estimation (chars / 4 is a common heuristic).
 */
export function estimateCost(
    config: ModelConfig,
    inputChars: number,
    outputChars: number
): number {
    const inputTokens = inputChars / 4;
    const outputTokens = outputChars / 4;
    return (
        (inputTokens / 1000) * config.costPer1KInput +
        (outputTokens / 1000) * config.costPer1KOutput
    );
}
