/**
 * Deep-Dive Generator (Engine 29)
 *
 * Lazy-generates a 4–6 sub-state elaboration of a parent epic_l state when a
 * student clicks "Explain step-by-step" and no cached entry exists for the
 * (concept_id, state_id, class_level, mode) key.
 *
 * Uses Sonnet 4.6 for quality. Cost ~$0.03–0.05 per fresh generation.
 * Cached forever with status='pending_review' until human review.
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { logUsage } from "@/lib/usageLogger";

const SONNET_MODEL = "claude-sonnet-4-6";
const PROMPT_PATH = path.join(process.cwd(), "src", "prompts", "deep_dive_generator.txt");

// Sonnet 4.6 pricing (per 1M tokens)
const SONNET_INPUT_USD_PER_MTOK = 3.0;
const SONNET_OUTPUT_USD_PER_MTOK = 15.0;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let cachedPrompt: string | null = null;
function loadPromptTemplate(): string {
    if (cachedPrompt === null) {
        cachedPrompt = fs.readFileSync(PROMPT_PATH, "utf-8");
    }
    return cachedPrompt;
}

export interface DeepDiveGenerateInput {
    conceptId: string;
    conceptName: string;
    classLevel: string;
    mode: string;
    stateId: string;
    stateTitle: string;
    parentSceneComposition: unknown;
    parentTeacherScript: unknown;
    siblingStatesSummary: string;
    realWorldAnchor: unknown;
    physicsEngineConfig: unknown;
    sessionId?: string;
}

export interface DeepDiveGenerateResult {
    subStates: Record<string, unknown>;
    teacherScriptFlat: Array<{ id: string; text: string }>;
    rawText: string;
}

function extractJsonObject(text: string): unknown | null {
    const firstBrace = text.indexOf("{");
    if (firstBrace === -1) return null;
    // Progressively trim trailing characters from the last `}` inward until
    // JSON.parse succeeds. Handles truncation (Sonnet hitting max_tokens
    // mid-string), stray commentary appended after the object, and stray
    // closing braces inside string values that shift lastIndexOf.
    let cursor = text.length;
    for (let attempt = 0; attempt < 6; attempt++) {
        const lastBrace = text.lastIndexOf("}", cursor - 1);
        if (lastBrace <= firstBrace) return null;
        const snippet = text.slice(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(snippet);
        } catch {
            cursor = lastBrace; // step one `}` back and retry
        }
    }
    return null;
}

export async function generateDeepDive(input: DeepDiveGenerateInput): Promise<DeepDiveGenerateResult> {
    const startTime = Date.now();

    const template = loadPromptTemplate();
    const prompt = template
        .replace(/\{CONCEPT_ID\}/g, input.conceptId)
        .replace(/\{CONCEPT_NAME\}/g, input.conceptName)
        .replace(/\{CLASS_LEVEL\}/g, input.classLevel)
        .replace(/\{MODE\}/g, input.mode)
        .replace(/\{PARENT_STATE_ID\}/g, input.stateId)
        .replace(/\{STATE_TITLE\}/g, input.stateTitle)
        .replace("{PARENT_SCENE_COMPOSITION}", JSON.stringify(input.parentSceneComposition, null, 2))
        .replace("{PARENT_TEACHER_SCRIPT}", JSON.stringify(input.parentTeacherScript, null, 2))
        .replace("{SIBLING_STATES_SUMMARY}", input.siblingStatesSummary)
        .replace("{REAL_WORLD_ANCHOR}", JSON.stringify(input.realWorldAnchor, null, 2))
        .replace("{PHYSICS_ENGINE_CONFIG}", JSON.stringify(input.physicsEngineConfig, null, 2));

    const message = await anthropic.messages.create({
        model: SONNET_MODEL,
        max_tokens: 8000,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
    });

    const firstBlock = message.content[0];
    const rawText = firstBlock && firstBlock.type === "text" ? firstBlock.text : "";
    const stopReason = message.stop_reason ?? "unknown";
    console.log("[deepDiveGenerator] stop_reason:", stopReason, "| output_chars:", rawText.length);

    const inputTokens = message.usage?.input_tokens ?? Math.ceil(prompt.length / 4);
    const outputTokens = message.usage?.output_tokens ?? Math.ceil(rawText.length / 4);
    const estimatedCost =
        (inputTokens / 1_000_000) * SONNET_INPUT_USD_PER_MTOK +
        (outputTokens / 1_000_000) * SONNET_OUTPUT_USD_PER_MTOK;

    logUsage({
        sessionId: input.sessionId,
        taskType: "deep_dive_generation",
        provider: "anthropic",
        model: SONNET_MODEL,
        inputChars: prompt.length,
        outputChars: rawText.length,
        latencyMs: Date.now() - startTime,
        estimatedCostUsd: estimatedCost,
        wasCacheHit: false,
        metadata: {
            conceptId: input.conceptId,
            stateId: input.stateId,
            classLevel: input.classLevel,
            mode: input.mode,
        },
    });

    const parsed = extractJsonObject(rawText);
    if (!parsed || typeof parsed !== "object") {
        // Dump full raw output to disk for post-mortem inspection.
        try {
            const dumpPath = path.join(process.cwd(), `deep-dive-raw-${Date.now()}.txt`);
            fs.writeFileSync(dumpPath, rawText, "utf-8");
            console.warn("[deepDiveGenerator] JSON parse failed. Raw output written to:", dumpPath, "| stop_reason:", stopReason);
        } catch {
            console.warn("[deepDiveGenerator] JSON parse failed (could not write dump). stop_reason:", stopReason, "| head:", rawText.slice(0, 500));
        }
        throw new Error(
            `Deep-dive generator did not return valid JSON. stop_reason: ${stopReason}. Raw head: ${rawText.slice(0, 200)}`
        );
    }

    const parsedObj = parsed as { sub_states?: unknown; teacher_script_flat?: unknown };
    if (
        !parsedObj.sub_states ||
        typeof parsedObj.sub_states !== "object" ||
        Array.isArray(parsedObj.sub_states)
    ) {
        throw new Error("Deep-dive generator missing sub_states object.");
    }
    if (!Array.isArray(parsedObj.teacher_script_flat)) {
        throw new Error("Deep-dive generator missing teacher_script_flat array.");
    }

    return {
        subStates: parsedObj.sub_states as Record<string, unknown>,
        teacherScriptFlat: parsedObj.teacher_script_flat as Array<{ id: string; text: string }>,
        rawText,
    };
}
