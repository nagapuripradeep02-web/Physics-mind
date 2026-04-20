/**
 * Drill-Down Generator (Engine 30)
 *
 * Lazy-generates a MICRO (2 states) or LOCAL (2–4 states) sub-simulation
 * targeted at a specific confusion cluster when the drill_down_cache misses
 * on the (concept_id, state_id, cluster_id, class_level, mode) key.
 *
 * Uses Sonnet 4.6. Cost ~$0.01–0.03 per fresh generation (smaller than
 * deep-dive). Cached forever with status='pending_review' until reviewed.
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { logUsage } from "@/lib/usageLogger";

const SONNET_MODEL = "claude-sonnet-4-6";
const PROMPT_PATH = path.join(process.cwd(), "src", "prompts", "drill_down_generator.txt");

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

export interface DrillDownGenerateInput {
    conceptId: string;
    conceptName: string;
    classLevel: string;
    mode: string;
    stateId: string;
    stateTitle: string;
    parentSceneComposition: unknown;
    realWorldAnchor: unknown;
    physicsEngineConfig: unknown;
    clusterId: string;
    clusterLabel: string;
    clusterDescription: string;
    clusterTriggerExamples: string[];
    sessionId?: string;
}

export interface DrillDownGenerateResult {
    protocol: "MICRO" | "LOCAL";
    subSim: { states: Record<string, unknown> };
    teacherScriptFlat: Array<{ id: string; text: string }>;
    rawText: string;
}

function extractJsonObject(text: string): unknown | null {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
        return null;
    }
}

export async function generateDrillDown(input: DrillDownGenerateInput): Promise<DrillDownGenerateResult> {
    const startTime = Date.now();

    const template = loadPromptTemplate();
    const prompt = template
        .replace(/\{CONCEPT_ID\}/g, input.conceptId)
        .replace(/\{CONCEPT_NAME\}/g, input.conceptName)
        .replace(/\{CLASS_LEVEL\}/g, input.classLevel)
        .replace(/\{MODE\}/g, input.mode)
        .replace(/\{STATE_ID\}/g, input.stateId)
        .replace(/\{STATE_TITLE\}/g, input.stateTitle)
        .replace("{PARENT_SCENE_COMPOSITION}", JSON.stringify(input.parentSceneComposition, null, 2))
        .replace("{REAL_WORLD_ANCHOR}", JSON.stringify(input.realWorldAnchor, null, 2))
        .replace("{PHYSICS_ENGINE_CONFIG}", JSON.stringify(input.physicsEngineConfig, null, 2))
        .replace(/\{CLUSTER_ID\}/g, input.clusterId)
        .replace(/\{CLUSTER_LABEL\}/g, input.clusterLabel)
        .replace("{CLUSTER_DESCRIPTION}", input.clusterDescription)
        .replace("{CLUSTER_TRIGGER_EXAMPLES}", input.clusterTriggerExamples.map(e => `- "${e}"`).join("\n"));

    const message = await anthropic.messages.create({
        model: SONNET_MODEL,
        max_tokens: 3000,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
    });

    const firstBlock = message.content[0];
    const rawText = firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

    const inputTokens = message.usage?.input_tokens ?? Math.ceil(prompt.length / 4);
    const outputTokens = message.usage?.output_tokens ?? Math.ceil(rawText.length / 4);
    const estimatedCost =
        (inputTokens / 1_000_000) * SONNET_INPUT_USD_PER_MTOK +
        (outputTokens / 1_000_000) * SONNET_OUTPUT_USD_PER_MTOK;

    logUsage({
        sessionId: input.sessionId,
        taskType: "drill_down_generation",
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
            clusterId: input.clusterId,
            classLevel: input.classLevel,
            mode: input.mode,
        },
    });

    const parsed = extractJsonObject(rawText);
    if (!parsed || typeof parsed !== "object") {
        throw new Error(
            `Drill-down generator did not return valid JSON. Raw head: ${rawText.slice(0, 200)}`
        );
    }

    const parsedObj = parsed as {
        protocol?: unknown;
        sub_sim?: { states?: unknown };
        teacher_script_flat?: unknown;
    };
    const protocolRaw = parsedObj.protocol;
    const protocol: "MICRO" | "LOCAL" =
        protocolRaw === "MICRO" || protocolRaw === "LOCAL" ? protocolRaw : "MICRO";

    const statesObj = parsedObj.sub_sim?.states;
    if (!statesObj || typeof statesObj !== "object" || Array.isArray(statesObj)) {
        throw new Error("Drill-down generator missing sub_sim.states object.");
    }
    if (!Array.isArray(parsedObj.teacher_script_flat)) {
        throw new Error("Drill-down generator missing teacher_script_flat array.");
    }

    return {
        protocol,
        subSim: { states: statesObj as Record<string, unknown> },
        teacherScriptFlat: parsedObj.teacher_script_flat as Array<{ id: string; text: string }>,
        rawText,
    };
}
