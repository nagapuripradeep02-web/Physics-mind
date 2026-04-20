/**
 * Confusion Classifier (Engine 30 — drill-down routing)
 *
 * Takes a student's typed confusion phrase and classifies it into one of the
 * pre-registered clusters in `confusion_cluster_registry`. Uses Haiku for
 * speed + cost. Downstream, the cluster_id keys `drill_down_cache` so the
 * right MICRO/LOCAL sub-sim can be served in <100ms.
 *
 * Returns { clusterId: null, ... } when the phrase doesn't semantically match
 * any registered cluster (below confidence threshold).
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logUsage } from "@/lib/usageLogger";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const CONFIDENCE_THRESHOLD = 0.5;
const PROMPT_PATH = path.join(process.cwd(), "src", "prompts", "confusion_classifier.txt");

// Haiku pricing (per 1M tokens): input $0.80, output $4.00.
const HAIKU_INPUT_USD_PER_MTOK = 0.8;
const HAIKU_OUTPUT_USD_PER_MTOK = 4.0;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let cachedPrompt: string | null = null;
function loadPromptTemplate(): string {
    if (cachedPrompt === null) {
        cachedPrompt = fs.readFileSync(PROMPT_PATH, "utf-8");
    }
    return cachedPrompt;
}

export interface ClassifyConfusionInput {
    confusionText: string;
    conceptId: string;
    stateId?: string;
    sessionId?: string;
}

export interface ClassifyConfusionResult {
    clusterId: string | null;
    confidence: number;
    reasoning: string;
}

interface ClusterRow {
    cluster_id: string;
    label: string;
    description: string | null;
    trigger_examples: string[] | null;
}

/**
 * Load candidate clusters for this (concept_id, state_id). If stateId is
 * provided we prefer same-state clusters but also include state-agnostic ones.
 */
async function loadCandidateClusters(conceptId: string, stateId?: string): Promise<ClusterRow[]> {
    let query = supabaseAdmin
        .from("confusion_cluster_registry")
        .select("cluster_id, label, description, trigger_examples")
        .eq("concept_id", conceptId)
        .eq("status", "active");

    if (stateId) {
        query = query.eq("state_id", stateId);
    }

    const { data, error } = await query;
    if (error) {
        console.error("[confusion_classifier] cluster fetch failed:", error);
        return [];
    }
    return (data ?? []) as ClusterRow[];
}

/**
 * Pull a JSON object out of Haiku's response — Haiku occasionally wraps JSON
 * in prose or markdown fences. Returns null if nothing parsable is found.
 */
function extractJsonObject(text: string): unknown | null {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    const snippet = text.slice(firstBrace, lastBrace + 1);
    try {
        return JSON.parse(snippet);
    } catch {
        return null;
    }
}

function buildClusterOptionsBlock(clusters: ClusterRow[]): string {
    if (clusters.length === 0) return "(no clusters registered for this concept/state)";
    return clusters
        .map((c, i) => {
            const examples = (c.trigger_examples ?? []).map(e => `"${e}"`).join(", ");
            return `${i + 1}. cluster_id: ${c.cluster_id}\n   label: ${c.label}\n   description: ${c.description ?? ""}\n   example phrases: ${examples || "(none)"}`;
        })
        .join("\n\n");
}

/**
 * Fire-and-forget: tag the most recent student_confusion_log row for this
 * session with the detected cluster_id. Used for later analytics and to
 * grow the 159-row dataset into cluster-labelled training data.
 */
async function tagMostRecentConfusionLog(sessionId: string, clusterId: string): Promise<void> {
    try {
        const { data: latest } = await supabaseAdmin
            .from("student_confusion_log")
            .select("id")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (latest?.id) {
            await supabaseAdmin
                .from("student_confusion_log")
                .update({ cluster_id: clusterId })
                .eq("id", latest.id);
        }
    } catch (err) {
        console.error("[confusion_classifier] tag log failed (non-fatal):", err);
    }
}

export async function classifyConfusion(
    input: ClassifyConfusionInput
): Promise<ClassifyConfusionResult> {
    const startTime = Date.now();
    const { confusionText, conceptId, stateId, sessionId } = input;

    const clusters = await loadCandidateClusters(conceptId, stateId);
    if (clusters.length === 0) {
        return {
            clusterId: null,
            confidence: 0,
            reasoning: "No active clusters registered for this concept/state.",
        };
    }

    const template = loadPromptTemplate();
    const prompt = template
        .replace("{CONCEPT_ID}", conceptId)
        .replace("{STATE_ID}", stateId ?? "(any)")
        .replace("{CLUSTER_OPTIONS}", buildClusterOptionsBlock(clusters))
        .replace("{CONFUSION_TEXT}", confusionText);

    let rawText = "";
    try {
        const message = await anthropic.messages.create({
            model: HAIKU_MODEL,
            max_tokens: 220,
            temperature: 0.1,
            messages: [{ role: "user", content: prompt }],
        });
        const firstBlock = message.content[0];
        if (firstBlock && firstBlock.type === "text") {
            rawText = firstBlock.text;
        }

        const inputTokens = message.usage?.input_tokens ?? Math.ceil(prompt.length / 4);
        const outputTokens = message.usage?.output_tokens ?? Math.ceil(rawText.length / 4);
        const estimatedCost =
            (inputTokens / 1_000_000) * HAIKU_INPUT_USD_PER_MTOK +
            (outputTokens / 1_000_000) * HAIKU_OUTPUT_USD_PER_MTOK;

        logUsage({
            sessionId,
            taskType: "classify_confusion",
            provider: "anthropic",
            model: HAIKU_MODEL,
            inputChars: prompt.length,
            outputChars: rawText.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: estimatedCost,
            wasCacheHit: false,
            metadata: { conceptId, stateId: stateId ?? null, candidateCount: clusters.length },
        });
    } catch (err) {
        console.error("[confusion_classifier] Haiku call failed:", err);
        return {
            clusterId: null,
            confidence: 0,
            reasoning: "Classifier unavailable.",
        };
    }

    const parsed = extractJsonObject(rawText);
    if (!parsed || typeof parsed !== "object") {
        return {
            clusterId: null,
            confidence: 0,
            reasoning: `Classifier response was not valid JSON. Raw: ${rawText.slice(0, 120)}`,
        };
    }

    const parsedObj = parsed as { cluster_id?: unknown; confidence?: unknown; reasoning?: unknown };
    const rawId = typeof parsedObj.cluster_id === "string" ? parsedObj.cluster_id : null;
    const confidence = typeof parsedObj.confidence === "number" ? parsedObj.confidence : 0;
    const reasoning =
        typeof parsedObj.reasoning === "string" ? parsedObj.reasoning : "No reasoning provided.";

    // Null out NONE or unknown/below-threshold cluster IDs
    const validClusterIds = new Set(clusters.map(c => c.cluster_id));
    const matchedId =
        rawId && rawId !== "NONE" && validClusterIds.has(rawId) && confidence >= CONFIDENCE_THRESHOLD
            ? rawId
            : null;

    if (matchedId && sessionId) {
        void tagMostRecentConfusionLog(sessionId, matchedId);
    }

    return {
        clusterId: matchedId,
        confidence,
        reasoning,
    };
}
